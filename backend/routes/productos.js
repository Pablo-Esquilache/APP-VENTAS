// routes/productos.js
import express from "express";
import db from "../db.js";
const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM productos ORDER BY id");
  res.json(rows);
});

// GET product by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query("SELECT * FROM productos WHERE id=$1", [id]);
  res.json(rows[0] || null);
});

// CREATE
router.post("/", async (req, res) => {
  const { nombre, categoria, precio, stock } = req.body;
  const q = `INSERT INTO productos (nombre, categoria, precio, stock)
             VALUES ($1,$2,$3,$4) RETURNING *`;
  const { rows } = await db.query(q, [nombre, categoria || null, precio, stock || 0]);
  res.status(201).json(rows[0]);
});

// UPDATE
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, precio, stock } = req.body;
  const q = `UPDATE productos SET nombre=$1, categoria=$2, precio=$3, stock=$4 WHERE id=$5 RETURNING *`;
  const { rows } = await db.query(q, [nombre, categoria, precio, stock, id]);
  res.json(rows[0] || null);
});

// DELETE
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await db.query("DELETE FROM productos WHERE id=$1", [id]);
  res.status(204).end();
});

export default router;
