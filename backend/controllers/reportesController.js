import db from "../db.js";

/* =====================================================
   Ventas vs gastos + ticket promedio
===================================================== */
export const getVentasGastosTiempo = async (req, res) => {
  const { comercio_id, agrupacion = "dia", desde, hasta } = req.query;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  let groupBy;
  switch (agrupacion) {
    case "mes":
      groupBy = "DATE_TRUNC('month', fecha)";
      break;
    case "semana":
      groupBy = "DATE_TRUNC('week', fecha)";
      break;
    default:
      groupBy = "DATE(fecha)";
  }

  let filtroFecha = "";
  const params = [comercio_id];

  if (desde && hasta) {
    filtroFecha = "AND fecha BETWEEN $2 AND $3";
    params.push(desde, hasta);
  }

  const q = `
    SELECT
      periodo,
      COALESCE(SUM(total_ventas), 0) AS total_ventas,
      COALESCE(SUM(total_gastos), 0) AS total_gastos,
      AVG(ticket_promedio) AS ticket_promedio
    FROM (
      SELECT
        ${groupBy} AS periodo,
        SUM(total) AS total_ventas,
        0 AS total_gastos,
        AVG(total) AS ticket_promedio
      FROM ventas
      WHERE comercio_id = $1
      ${filtroFecha}
      GROUP BY periodo

      UNION ALL

      SELECT
        ${groupBy} AS periodo,
        0 AS total_ventas,
        SUM(importe) AS total_gastos,
        NULL AS ticket_promedio
      FROM gastos
      WHERE comercio_id = $1
      ${filtroFecha}
      GROUP BY periodo
    ) t
    GROUP BY periodo
    ORDER BY periodo;
  `;

  try {
    const { rows } = await db.query(q, params);
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo reporte ventas/gastos:", error);
    res.status(500).json({ error: "Error en reporte" });
  }
};

/* =====================================================
   Top 10 productos vendidos
===================================================== */
export const getTopProductos = async (req, res) => {
  const { comercio_id, desde, hasta, limit = 10 } = req.query;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  let filtroFecha = "";
  const params = [comercio_id];

  if (desde && hasta) {
    filtroFecha = "AND v.fecha BETWEEN $2 AND $3";
    params.push(desde, hasta);
  }

  const q = `
    SELECT
      p.nombre AS producto,
      SUM(vd.cantidad) AS cantidad_vendida,
      SUM(vd.subtotal) AS total_vendido
    FROM ventas v
    JOIN ventas_detalle vd ON vd.venta_id = v.id
    JOIN productos p ON p.id = vd.producto_id
    WHERE v.comercio_id = $1
      ${filtroFecha}
    GROUP BY p.nombre
    ORDER BY total_vendido DESC
    LIMIT ${Number(limit)};
  `;

  try {
    const { rows } = await db.query(q, params);
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo top productos:", error);
    res.status(500).json({ error: "Error en reporte" });
  }
};

/* =====================================================
   Categorías vendidas
===================================================== */
export const getCategoriasVendidas = async (req, res) => {
  const { comercio_id, desde, hasta } = req.query;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  let filtroFecha = "";
  const params = [comercio_id];

  if (desde && hasta) {
    filtroFecha = "AND v.fecha BETWEEN $2 AND $3";
    params.push(desde, hasta);
  }

  const q = `
    SELECT
      p.categoria,
      SUM(vd.cantidad) AS cantidad_total,
      SUM(vd.subtotal) AS importe_total
    FROM ventas v
    JOIN ventas_detalle vd ON vd.venta_id = v.id
    JOIN productos p ON p.id = vd.producto_id
    WHERE v.comercio_id = $1
      ${filtroFecha}
    GROUP BY p.categoria
    ORDER BY importe_total DESC;
  `;

  try {
    const { rows } = await db.query(q, params);

    const totalImporte = rows.reduce(
      (acc, r) => acc + Number(r.importe_total),
      0
    );

    const dataConPorcentaje = rows.map((r) => ({
      categoria: r.categoria,
      importe_total: Number(r.importe_total),
      porcentaje: totalImporte
        ? ((Number(r.importe_total) / totalImporte) * 100).toFixed(2)
        : 0,
    }));

    res.json(dataConPorcentaje);
  } catch (error) {
    console.error("Error obteniendo categorías vendidas:", error);
    res.status(500).json({ error: "Error en reporte" });
  }
};

/* =====================================================
   Edad promedio por grupo etario y género
===================================================== */
export const getEdadEtarioGenero = async (req, res) => {
  const { comercio_id, desde, hasta } = req.query;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  let filtroFecha = "";
  const params = [comercio_id];

  if (desde && hasta) {
    filtroFecha = "AND v.fecha BETWEEN $2 AND $3";
    params.push(desde, hasta);
  }

  const q = `
    WITH edades AS (
      SELECT
        v.id,
        v.total,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, c.fecha_nacimiento))::int AS edad,
        CASE
          WHEN UPPER(c.genero) IN ('M', 'MASCULINO') THEN 'Masculino'
          WHEN UPPER(c.genero) IN ('F', 'FEMENINO') THEN 'Femenino'
          ELSE 'Otro'
        END AS genero
      FROM ventas v
      JOIN clientes c ON c.id = v.cliente_id
      WHERE v.comercio_id = $1
        AND c.fecha_nacimiento IS NOT NULL
        ${filtroFecha}
    )
    SELECT
      CASE
        WHEN edad BETWEEN 0 AND 12 THEN 'Niños (0–12)'
        WHEN edad BETWEEN 13 AND 24 THEN 'Jóvenes (13–24)'
        WHEN edad BETWEEN 25 AND 59 THEN 'Adultos (25–59)'
        ELSE 'Adultos mayores (60+)'
      END AS grupo_etario,
      genero,
      AVG(edad)::numeric(10,2) AS edad_promedio,
      SUM(total) AS importe_total,
      COUNT(id) AS cantidad_compras
    FROM edades
    GROUP BY grupo_etario, genero
    ORDER BY importe_total DESC;
  `;

  try {
    const { rows } = await db.query(q, params);
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo edades/géneros:", error);
    res.status(500).json({ error: "Error en reporte" });
  }
};

/* =====================================================
   Métodos de pago
===================================================== */
export const getMetodosPago = async (req, res) => {
  const { comercio_id, desde, hasta } = req.query;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  let filtroFecha = "";
  const params = [comercio_id];

  if (desde && hasta) {
    filtroFecha = "AND fecha BETWEEN $2 AND $3";
    params.push(desde, hasta);
  }

  const q = `
    SELECT
      metodo_pago,
      SUM(total) AS importe_total,
      COUNT(id) AS cantidad_ventas
    FROM ventas
    WHERE comercio_id = $1
      ${filtroFecha}
    GROUP BY metodo_pago
    ORDER BY importe_total DESC;
  `;

  try {
    const { rows } = await db.query(q, params);

    const totalImporte = rows.reduce(
      (acc, r) => acc + Number(r.importe_total),
      0
    );

    const data = rows.map((r) => ({
      metodo_pago: r.metodo_pago,
      importe_total: Number(r.importe_total),
      cantidad_ventas: Number(r.cantidad_ventas),
      porcentaje: totalImporte
        ? ((Number(r.importe_total) / totalImporte) * 100).toFixed(2)
        : 0,
    }));

    res.json(data);
  } catch (error) {
    console.error("Error obteniendo métodos pago:", error);
    res.status(500).json({ error: "Error en reporte" });
  }
};

/* =====================================================
   Gastos por descripción y tipo
===================================================== */
export const getGastosDescripcionTipo = async (req, res) => {
  const { comercio_id, desde, hasta } = req.query;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  let filtroFecha = "";
  const params = [comercio_id];

  if (desde && hasta) {
    filtroFecha = "AND g.fecha BETWEEN $2 AND $3";
    params.push(desde, hasta);
  }

  const q = `
    SELECT
      g.descripcion,
      g.tipo,
      SUM(g.importe) AS importe
    FROM gastos g
    WHERE g.comercio_id = $1
      ${filtroFecha}
    GROUP BY g.descripcion, g.tipo
    ORDER BY importe DESC;
  `;

  try {
    const { rows } = await db.query(q, params);
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo gastos:", error);
    res.status(500).json({ error: "Error en reporte" });
  }
};

/* =====================================================
   Ventas por localidad
===================================================== */
export const getVentasPorLocalidad = async (req, res) => {
  const { comercio_id, desde, hasta } = req.query;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  let filtroFecha = "";
  const params = [comercio_id];

  if (desde && hasta) {
    filtroFecha = "AND v.fecha BETWEEN $2 AND $3";
    params.push(desde, hasta);
  }

  const q = `
    SELECT
      c.localidad,
      COUNT(v.id) AS cantidad_ventas
    FROM ventas v
    JOIN clientes c ON c.id = v.cliente_id
    WHERE v.comercio_id = $1
      AND c.localidad IS NOT NULL
      AND c.localidad <> ''
      ${filtroFecha}
    GROUP BY c.localidad
    ORDER BY cantidad_ventas DESC;
  `;

  try {
    const { rows } = await db.query(q, params);
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo ventas localidad:", error);
    res.status(500).json({ error: "Error en reporte" });
  }
};

/* =====================================================
   Top 10 clientes por frecuencia + ticket promedio
===================================================== */
export const getTopClientes = async (req, res) => {
  const { comercio_id, desde, hasta, limit = 10 } = req.query;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  let filtroFecha = "";
  const params = [comercio_id];

  if (desde && hasta) {
    filtroFecha = "AND v.fecha BETWEEN $2 AND $3";
    params.push(desde, hasta);
  }

  const q = `
    SELECT
      c.nombre AS cliente,
      COUNT(v.id) AS cantidad_compras,
      AVG(v.total) AS ticket_promedio
    FROM ventas v
    JOIN clientes c ON c.id = v.cliente_id
    WHERE v.comercio_id = $1
      ${filtroFecha}
    GROUP BY c.nombre
    ORDER BY cantidad_compras DESC
    LIMIT ${Number(limit)};
  `;

  try {
    const { rows } = await db.query(q, params);
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo top clientes:", error);
    res.status(500).json({ error: "Error en reporte" });
  }
};
