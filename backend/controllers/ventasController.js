import db from "../db.js";

/* =====================================================
   GET ventas (tickets) por comercio
===================================================== */
export const getVentas = async (req, res) => {
  const { comercio_id } = req.query;

  if (!comercio_id)
    return res.status(400).json({ error: "comercio_id requerido" });

  try {
    const { rows } = await db.query(
      `
      SELECT v.*, c.nombre AS cliente_nombre
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE v.comercio_id = $1
      ORDER BY v.fecha DESC, v.id DESC
      LIMIT 50
      `,
      [comercio_id],
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =====================================================
   🔹 GET venta individual (NUEVO - NECESARIO PARA EDITAR)
===================================================== */
export const getVentaById = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM ventas
      WHERE id = $1
      `,
      [id],
    );

    if (!rows.length)
      return res.status(404).json({ error: "Venta no encontrada" });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =====================================================
   GET detalle de una venta
===================================================== */
export const getVentaDetalle = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await db.query(
      `
      SELECT vd.*, p.nombre AS producto_nombre
      FROM ventas_detalle vd
      LEFT JOIN productos p ON vd.producto_id = p.id
      WHERE vd.venta_id = $1
      `,
      [id],
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* =====================================================
   POST crear venta
===================================================== */
export const createVenta = async (req, res) => {
  const {
    cliente_id,
    metodo_pago,
    descuento_porcentaje = 0,
    comercio_id,
    items,
  } = req.body;

  const descuento = Number(descuento_porcentaje) || 0;

  if (!comercio_id)
    return res.status(400).json({ error: "comercio_id requerido" });

  if (!items || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: "Debe enviar items" });

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Verificar stock
    for (const item of items) {
      const { rows } = await client.query(
        `SELECT stock FROM productos 
         WHERE id = $1 AND comercio_id = $2`,
        [item.producto_id, comercio_id],
      );

      if (!rows[0]) throw new Error("Producto no encontrado");
      if (item.cantidad > Number(rows[0].stock))
        throw new Error("Stock insuficiente");
    }

    // 2️⃣ Calcular totales
    let total_bruto = 0;
    for (const item of items) {
      total_bruto += Number(item.precio_unitario) * Number(item.cantidad);
    }

    const descuento_monto = total_bruto * (descuento / 100);

    const total = total_bruto - descuento_monto;

    // 3️⃣ Insertar venta
    const ventaResult = await client.query(
      `
  INSERT INTO ventas
(fecha, cliente_id, metodo_pago, total_bruto,
 descuento_monto, descuento_porcentaje, total, comercio_id)
VALUES (NOW(), $1,$2,$3,$4,$5,$6,$7)
RETURNING *
  `,
      [
        cliente_id,
        metodo_pago,
        total_bruto,
        descuento_monto,
        descuento,
        total,
        comercio_id,
      ],
    );

    const venta = ventaResult.rows[0];

    // 4️⃣ Insertar detalles + descontar stock
    for (const item of items) {
      const subtotal = Number(item.precio_unitario) * Number(item.cantidad);

      await client.query(
        `
        INSERT INTO ventas_detalle
        (venta_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES ($1,$2,$3,$4,$5)
        `,
        [
          venta.id,
          item.producto_id,
          item.cantidad,
          item.precio_unitario,
          subtotal,
        ],
      );

      await client.query(
        `
        UPDATE productos
        SET stock = stock - $1
        WHERE id = $2 AND comercio_id = $3
        `,
        [item.cantidad, item.producto_id, comercio_id],
      );
    }

    // 🔹 Si es cuenta corriente, registrar deuda
    if (metodo_pago === "Cuenta Corriente" && cliente_id) {
      await client.query(
        `
    INSERT INTO cuenta_corriente_movimientos
    (cliente_id, comercio_id, tipo, monto, venta_id)
    VALUES ($1,$2,'venta',$3,$4)
    `,
        [cliente_id, comercio_id, total, venta.id],
      );
    }

    await client.query("COMMIT");
    res.status(201).json(venta);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};

/* =====================================================
   PUT actualizar venta
===================================================== */
export const updateVenta = async (req, res) => {
  const { id } = req.params;
  const {
    fecha,
    cliente_id,
    metodo_pago,
    descuento_porcentaje = 0,
    comercio_id,
    items,
  } = req.body;

  const descuento = Number(descuento_porcentaje) || 0;

  if (!comercio_id)
    return res.status(400).json({ error: "comercio_id requerido" });

  if (!items || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: "Debe enviar items" });

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 🔹 Validar existencia de venta
    const { rows: ventaExistente } = await client.query(
      `SELECT id FROM ventas WHERE id = $1 AND comercio_id = $2`,
      [id, comercio_id],
    );

    if (!ventaExistente.length) throw new Error("Venta no encontrada");

    // 1️⃣ Obtener detalles anteriores
    const { rows: detallesAnteriores } = await client.query(
      `SELECT producto_id, cantidad
       FROM ventas_detalle
       WHERE venta_id = $1`,
      [id],
    );

    // 2️⃣ Restaurar stock anterior
    for (const item of detallesAnteriores) {
      await client.query(
        `
        UPDATE productos
        SET stock = stock + $1
        WHERE id = $2 AND comercio_id = $3
        `,
        [item.cantidad, item.producto_id, comercio_id],
      );
    }

    // 3️⃣ Eliminar detalles anteriores
    await client.query(`DELETE FROM ventas_detalle WHERE venta_id = $1`, [id]);

    // 4️⃣ Verificar stock nuevo
    for (const item of items) {
      const { rows } = await client.query(
        `SELECT stock FROM productos
         WHERE id = $1 AND comercio_id = $2`,
        [item.producto_id, comercio_id],
      );

      if (!rows[0]) throw new Error("Producto no encontrado");
      if (item.cantidad > Number(rows[0].stock))
        throw new Error("Stock insuficiente");
    }

    // 5️⃣ Calcular totales nuevos
    let total_bruto = 0;
    for (const item of items) {
      total_bruto += Number(item.precio_unitario) * Number(item.cantidad);
    }

    const descuento_monto = total_bruto * (descuento / 100);

    const total = total_bruto - descuento_monto;

    // 6️⃣ Actualizar cabecera
    await client.query(
      `
      UPDATE ventas
      SET fecha = $1,
          cliente_id = $2,
          metodo_pago = $3,
          total_bruto = $4,
          descuento_monto = $5,
          descuento_porcentaje = $6,
          total = $7
      WHERE id = $8 AND comercio_id = $9
      `,
      [
        fecha,
        cliente_id,
        metodo_pago,
        total_bruto,
        descuento_monto,
        descuento,
        total,
        id,
        comercio_id,
      ],
    );

    // 7️⃣ Insertar nuevos detalles y descontar stock
    for (const item of items) {
      const subtotal = Number(item.precio_unitario) * Number(item.cantidad);

      await client.query(
        `
        INSERT INTO ventas_detalle
        (venta_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES ($1,$2,$3,$4,$5)
        `,
        [id, item.producto_id, item.cantidad, item.precio_unitario, subtotal],
      );

      await client.query(
        `
        UPDATE productos
        SET stock = stock - $1
        WHERE id = $2 AND comercio_id = $3
        `,
        [item.cantidad, item.producto_id, comercio_id],
      );
    }

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};

/* =====================================================
   DELETE venta
===================================================== */
export const deleteVenta = async (req, res) => {
  const { id } = req.params;
  const { comercio_id } = req.query;

  if (!comercio_id)
    return res.status(400).json({ error: "comercio_id requerido" });

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Obtener datos de la venta
    const { rows: ventaRows } = await client.query(
      `SELECT cliente_id, metodo_pago, total
       FROM ventas
       WHERE id = $1 AND comercio_id = $2`,
      [id, comercio_id],
    );

    if (!ventaRows.length) throw new Error("Venta no encontrada");

    const venta = ventaRows[0];

    // 2️⃣ Restaurar stock
    const { rows: detalles } = await client.query(
      `SELECT producto_id, cantidad
       FROM ventas_detalle
       WHERE venta_id = $1`,
      [id],
    );

    for (const item of detalles) {
      await client.query(
        `
        UPDATE productos
        SET stock = stock + $1
        WHERE id = $2 AND comercio_id = $3
        `,
        [item.cantidad, item.producto_id, comercio_id],
      );
    }

    // 3️⃣ Eliminar devoluciones asociadas
    const { rows: devoluciones } = await client.query(
      `SELECT id FROM devoluciones WHERE venta_id = $1`,
      [id]
    );

    for (const dev of devoluciones) {
      await client.query(`DELETE FROM devoluciones_detalle WHERE devolucion_id = $1`, [dev.id]);
    }
    await client.query(`DELETE FROM devoluciones WHERE venta_id = $1`, [id]);

    // 4️⃣ Eliminar movimientos de cuenta corriente si era cuenta corriente
    if (venta.metodo_pago === "Cuenta Corriente") {
      await client.query(
        `
        DELETE FROM cuenta_corriente_movimientos
        WHERE venta_id = $1
        `,
        [id],
      );
    }

    // 4️⃣ Eliminar detalles
    await client.query(`DELETE FROM ventas_detalle WHERE venta_id = $1`, [id]);

    // 5️⃣ Eliminar venta
    await client.query(
      `DELETE FROM ventas WHERE id = $1 AND comercio_id = $2`,
      [id, comercio_id],
    );

    await client.query("COMMIT");
    res.status(204).end();
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};
