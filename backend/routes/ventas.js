import express from "express";
import db from "../db.js";

const router = express.Router();

// ------------------------------
// GET ventas por comercio
// ------------------------------
router.get("/", async (req, res) => {
  const { comercio_id } = req.query;
  if (!comercio_id)
    return res.status(400).json({ error: "comercio_id requerido" });

  const { rows } = await db.query(
    `
    SELECT v.*, c.nombre AS cliente_nombre, p.nombre AS producto_nombre
    FROM ventas v
    LEFT JOIN clientes c ON v.cliente_id = c.id
    LEFT JOIN productos p ON v.producto_id = p.id
    WHERE v.comercio_id = $1
    ORDER BY v.fecha DESC, v.id DESC
    LIMIT 50
  `,
    [comercio_id]
  );

  res.json(rows);
});

// ------------------------------
// POST crear venta
// ------------------------------
router.post("/", async (req, res) => {
  const {
    fecha,
    cliente_id,
    producto_id,
    cantidad,
    precio,
    descuento = 0,
    metodo_pago,
    comercio_id,
  } = req.body;
  if (!comercio_id)
    return res.status(400).json({ error: "comercio_id requerido" });

  try {
    // 1️⃣ Verificar stock
    const { rows: productoRows } = await db.query(
      "SELECT stock FROM productos WHERE id = $1 AND comercio_id = $2",
      [producto_id, comercio_id]
    );
    if (!productoRows[0])
      return res.status(404).json({ error: "Producto no encontrado" });

    const stockActual = Number(productoRows[0].stock);
    if (cantidad > stockActual) {
      return res
        .status(400)
        .json({ error: "Cantidad supera el stock disponible" });
    }

    // 2️⃣ Insertar venta
    const subtotal = Number(cantidad) * Number(precio);
    const total = subtotal - (subtotal * descuento) / 100;

    const q = `
      INSERT INTO ventas
      (fecha, cliente_id, producto_id, cantidad, precio, descuento, metodo_pago, total, comercio_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `;
    const { rows } = await db.query(q, [
      fecha,
      cliente_id,
      producto_id,
      cantidad,
      precio,
      descuento,
      metodo_pago,
      total,
      comercio_id,
    ]);

    // 3️⃣ Actualizar stock del producto
    await db.query(
      "UPDATE productos SET stock = stock - $1 WHERE id = $2 AND comercio_id = $3",
      [cantidad, producto_id, comercio_id]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ------------------------------
// GET por id
// ------------------------------
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query("SELECT * FROM ventas WHERE id = $1", [id]);
  res.json(rows[0] || null);
});

// ------------------------------
// DELETE
// ------------------------------
router.delete("/:id", async (req, res) => {
  await db.query("DELETE FROM ventas WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

// ------------------------------
// PUT actualizar venta
// ------------------------------
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    fecha,
    cliente_id,
    producto_id,
    cantidad,
    precio,
    descuento = 0,
    metodo_pago,
    comercio_id,
  } = req.body;

  try {
    // 1️⃣ Obtener venta original
    const { rows: ventaOriginalRows } = await db.query(
      "SELECT cantidad, producto_id FROM ventas WHERE id = $1 AND comercio_id = $2",
      [id, comercio_id]
    );
    if (!ventaOriginalRows[0])
      return res.status(404).json({ error: "Venta no encontrada" });
    const ventaOriginal = ventaOriginalRows[0];

    // 2️⃣ Ajustar stock: devolver cantidad original
    await db.query(
      "UPDATE productos SET stock = stock + $1 WHERE id = $2 AND comercio_id = $3",
      [ventaOriginal.cantidad, ventaOriginal.producto_id, comercio_id]
    );

    // 3️⃣ Verificar stock disponible del producto editado
    const { rows: productoRows } = await db.query(
      "SELECT stock FROM productos WHERE id = $1 AND comercio_id = $2",
      [producto_id, comercio_id]
    );
    if (!productoRows[0])
      return res.status(404).json({ error: "Producto no encontrado" });

    const stockDisponible = Number(productoRows[0].stock);
    if (cantidad > stockDisponible) {
      return res
        .status(400)
        .json({ error: "Cantidad supera el stock disponible" });
    }

    // 4️⃣ Actualizar venta
    const subtotal = Number(cantidad) * Number(precio);
    const total = subtotal - (subtotal * descuento) / 100;

    const q = `
      UPDATE ventas
      SET fecha=$1, cliente_id=$2, producto_id=$3,
          cantidad=$4, precio=$5, descuento=$6,
          metodo_pago=$7, total=$8
      WHERE id=$9 AND comercio_id=$10
      RETURNING *
    `;
    const { rows } = await db.query(q, [
      fecha,
      cliente_id,
      producto_id,
      cantidad,
      precio,
      descuento,
      metodo_pago,
      total,
      id,
      comercio_id,
    ]);

    // 5️⃣ Restar nueva cantidad al stock
    await db.query(
      "UPDATE productos SET stock = stock - $1 WHERE id = $2 AND comercio_id = $3",
      [cantidad, producto_id, comercio_id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
