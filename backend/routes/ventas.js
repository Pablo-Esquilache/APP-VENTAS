// routes/ventas.js
import express from "express";
import db from "../db.js";
const router = express.Router();

// GET últimas 10 ventas (con JOINs para nombre producto/cliente)
router.get("/", async (req, res) => {
  const { rows } = await db.query(`
    SELECT v.*, c.nombre AS cliente_nombre, p.nombre AS producto_nombre
    FROM ventas v
    LEFT JOIN clientes c ON v.cliente_id = c.id
    LEFT JOIN productos p ON v.producto_id = p.id
    ORDER BY v.fecha DESC, v.id DESC
    LIMIT 50
  `);
  res.json(rows);
});

// POST crear venta (calcula total si no viene)
router.post("/", async (req, res) => {
  const {
    fecha,
    cliente_id,
    producto_id,
    cantidad,
    precio,
    descuento = 0,
    metodo_pago,
  } = req.body;
  const subtotal = Number(cantidad) * Number(precio);
  const total = subtotal - (subtotal * (Number(descuento) || 0)) / 100;

  const q = `INSERT INTO ventas (fecha, cliente_id, producto_id, cantidad, precio, descuento, metodo_pago, total)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;
  const { rows } = await db.query(q, [
    fecha,
    cliente_id,
    producto_id,
    cantidad,
    precio,
    descuento,
    metodo_pago,
    total,
  ]);
  res.status(201).json(rows[0]);
});

// GET por id
router.get("/:id", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM ventas WHERE id=$1", [
    req.params.id,
  ]);
  res.json(rows[0] || null);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await db.query("DELETE FROM ventas WHERE id=$1", [req.params.id]);
  res.status(204).end();
});

export default router;
