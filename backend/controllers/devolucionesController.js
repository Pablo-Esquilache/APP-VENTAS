import db from "../db.js";

/* =====================================================
   POST registrar devolución (POSTGRESQL)
===================================================== */
export const registrarDevolucion = async (req, res) => {
  const { venta_id, cliente_id, comercio_id, items } = req.body;

  if (!venta_id || !cliente_id || !comercio_id)
    return res.status(400).json({ error: "Datos incompletos" });

  if (!items || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: "Debe enviar productos a devolver" });

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Validar venta
    const ventaRes = await client.query(
      `
      SELECT id
      FROM ventas
      WHERE id = $1 AND comercio_id = $2
      FOR UPDATE
      `,
      [venta_id, comercio_id],
    );

    if (!ventaRes.rows.length) throw new Error("Venta no encontrada");

    let totalDevolucion = 0;

    // 2️⃣ Validar productos
    for (const item of items) {
      const detalleRes = await client.query(
        `
        SELECT cantidad, precio_unitario
        FROM ventas_detalle
        WHERE venta_id = $1 AND producto_id = $2
        FOR UPDATE
        `,
        [venta_id, item.producto_id],
      );

      if (!detalleRes.rows.length)
        throw new Error("Producto no pertenece a la venta");

      const cantidadVendida = Number(detalleRes.rows[0].cantidad);

      if (item.cantidad > cantidadVendida)
        throw new Error("Cantidad mayor a la vendida");

      const precio = Number(detalleRes.rows[0].precio_unitario);
      totalDevolucion += precio * Number(item.cantidad);
    }

    // 3️⃣ Insert cabecera
    const devolucionInsert = await client.query(
      `
      INSERT INTO devoluciones
      (venta_id, cliente_id, total, comercio_id, fecha)
      VALUES ($1,$2,$3,$4,NOW())
      RETURNING *
      `,
      [venta_id, cliente_id, totalDevolucion, comercio_id],
    );

    const devolucion = devolucionInsert.rows[0];

    // 4️⃣ Insert detalle + sumar stock
    for (const item of items) {
      const detalleRes = await client.query(
        `
        SELECT precio_unitario
        FROM ventas_detalle
        WHERE venta_id = $1 AND producto_id = $2
        `,
        [venta_id, item.producto_id],
      );

      const precio = Number(detalleRes.rows[0].precio_unitario);
      const subtotal = precio * Number(item.cantidad);

      await client.query(
        `
        INSERT INTO devoluciones_detalle
        (devolucion_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES ($1,$2,$3,$4,$5)
        `,
        [devolucion.id, item.producto_id, item.cantidad, precio, subtotal],
      );

      await client.query(
        `
        UPDATE productos
        SET stock = stock + $1
        WHERE id = $2 AND comercio_id = $3
        `,
        [item.cantidad, item.producto_id, comercio_id],
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      devolucion_id: devolucion.id,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};

/* =====================================================
   GET devoluciones por comercio
===================================================== */
export const getDevoluciones = async (req, res) => {
  const { comercio_id } = req.query;

  if (!comercio_id)
    return res.status(400).json({ error: "comercio_id requerido" });

  try {
    const { rows } = await db.query(
      `
      SELECT d.*, c.nombre AS cliente_nombre
      FROM devoluciones d
      LEFT JOIN clientes c ON d.cliente_id = c.id
      WHERE d.comercio_id = $1
      ORDER BY d.fecha DESC
      `,
      [comercio_id],
    );

    res.json(rows);
  } catch (err) {
    console.error("Error obteniendo devoluciones:", err);
    res.status(500).json({ error: "Error interno" });
  }
};

/* =====================================================
   GET detalle devolución
===================================================== */
export const getDetalleDevolucion = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await db.query(
      `
      SELECT dd.*, p.nombre AS producto_nombre
      FROM devoluciones_detalle dd
      LEFT JOIN productos p ON dd.producto_id = p.id
      WHERE dd.devolucion_id = $1
      `,
      [id],
    );

    res.json(rows);
  } catch (err) {
    console.error("Error obteniendo detalle de devolución:", err);
    res.status(500).json({ error: "Error interno" });
  }
};
