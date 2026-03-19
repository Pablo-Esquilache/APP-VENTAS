import pool from "../db.js";

/**
 * GET - Obtener caja del día actual
 */
export const getCajaHoy = async (req, res) => {
  const { comercioId } = req.params;

  try {
    // Modificado para traer la caja de hoy, o una caja anterior que siga abierta
    const { rows } = await pool.query(
      `SELECT * FROM cajas 
       WHERE comercio_id = $1 
       AND (estado = 'abierta' OR fecha = CURRENT_DATE)
       ORDER BY fecha DESC LIMIT 1`,
      [comercioId],
    );

    res.json(rows[0] || null);
  } catch (err) {
    console.error("Error obteniendo caja:", err);
    res.status(500).json({ error: "Error obteniendo caja" });
  }
};

/**
 * POST - Abrir caja
 */
export const abrirCaja = async (req, res) => {
  const { comercio_id, saldo_inicial } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO cajas (comercio_id, fecha, saldo_inicial)
       VALUES ($1, CURRENT_DATE, $2)
       RETURNING *`,
      [comercio_id, saldo_inicial],
    );

    res.json(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "La caja ya está abierta hoy" });
    }
    console.error("Error abriendo caja:", err);
    res.status(500).json({ error: "Error abriendo caja" });
  }
};

/**
 * PUT - Cerrar caja
 */
export const cerrarCaja = async (req, res) => {
  const { id } = req.params;
  const { total_ventas, total_gastos, total_devoluciones, total_resultado } =
    req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE cajas
       SET estado = 'cerrada',
           hora_cierre = NOW(),
           total_ventas = $1,
           total_gastos = $2,
           total_devoluciones = $3,
           total_resultado = $4
       WHERE id = $5
       RETURNING *`,
      [total_ventas, total_gastos, total_devoluciones, total_resultado, id],
    );

    res.json(rows[0]);
  } catch (err) {
    console.error("Error cerrando caja:", err);
    res.status(500).json({ error: "Error cerrando caja" });
  }
};

/**
 * GET - Movimientos del día para caja
 */
export const getMovimientosDia = async (req, res) => {
  const { comercioId } = req.params;

  try {
    const ventas = await pool.query(
      `SELECT id, fecha, total, metodo_pago
   FROM ventas
   WHERE comercio_id = $1
   AND DATE(fecha) = CURRENT_DATE`,
      [comercioId],
    );

    const gastos = await pool.query(
      `SELECT id, fecha, importe, descripcion
   FROM gastos
   WHERE comercio_id = $1
   AND DATE(fecha) = CURRENT_DATE`,
      [comercioId],
    );

    const devoluciones = await pool.query(
      `SELECT id, fecha, total
       FROM devoluciones
       WHERE comercio_id = $1
       AND DATE(fecha) = CURRENT_DATE`,
      [comercioId],
    );

    let movimientos = [];

    ventas.rows.forEach((v) => {
      movimientos.push({
        hora: v.fecha,
        tipo: "VENTA",
        //descripcion: `Venta #${v.id} - ${v.metodo_pago}`,
        descripcion: `Venta - ${v.metodo_pago}`,
        metodo_pago: v.metodo_pago,
        ingreso: Number(v.total),
        egreso: 0,
      });
    });
    gastos.rows.forEach((g) => {
      movimientos.push({
        hora: g.fecha,
        tipo: "GASTO",
        descripcion: g.descripcion || `Gasto #${g.id}`,
        ingreso: 0,
        egreso: Number(g.importe),
      });
    });

    devoluciones.rows.forEach((d) => {
      movimientos.push({
        hora: d.fecha,
        tipo: "DEVOLUCION",
        //descripcion: `Devolución #${d.id}`,
        descripcion: `Devolución`,
        ingreso: 0,
        egreso: Number(d.total),
      });
    });

    movimientos.sort((a, b) => new Date(b.hora) - new Date(a.hora));

    res.json(movimientos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo movimientos" });
  }
};
