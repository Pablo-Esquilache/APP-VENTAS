// routes/clientes.js
import express from "express";
import db from "../db.js";
const router = express.Router();

router.get("/", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM clientes ORDER BY id");
  res.json(rows);
});

router.get("/:id", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM clientes WHERE id=$1", [req.params.id]);
  res.json(rows[0] || null);
});

router.post("/", async (req, res) => {
  const { nombre, edad, genero, telefono, email, localidad } = req.body;
  const q = `INSERT INTO clientes (nombre, edad, genero, telefono, email, localidad)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
  const { rows } = await db.query(q, [nombre, edad || null, genero || null, telefono || null, email || null, localidad || null]);
  res.status(201).json(rows[0]);
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, edad, genero, telefono, email, localidad } = req.body;
  const q = `UPDATE clientes SET nombre=$1, edad=$2, genero=$3, telefono=$4, email=$5, localidad=$6 WHERE id=$7 RETURNING *`;
  const { rows } = await db.query(q, [nombre, age || null, genero || null, telefono || null, email || null, localidad || null, id]);
  res.json(rows[0] || null);
});

router.delete("/:id", async (req, res) => {
  await db.query("DELETE FROM clientes WHERE id=$1", [req.params.id]);
  res.status(204).end();
});

export default router;
