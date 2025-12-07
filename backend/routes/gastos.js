// routes/gastos.js
import express from "express";
import db from "../db.js";
const router = express.Router();

router.get("/", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM gastos ORDER BY fecha DESC");
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { fecha, descripcion, tipo, importe } = req.body;
  const q = `INSERT INTO gastos (fecha, descripcion, tipo, importe) VALUES ($1,$2,$3,$4) RETURNING *`;
  const { rows } = await db.query(q, [fecha, descripcion, tipo, importe]);
  res.status(201).json(rows[0]);
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { fecha, descripcion, tipo, importe } = req.body;
  const q = `UPDATE gastos SET fecha=$1, descripcion=$2, tipo=$3, importe=$4 WHERE id=$5 RETURNING *`;
  const { rows } = await db.query(q, [fecha, descripcion, tipo, importe, id]);
  res.json(rows[0] || null);
});

router.delete("/:id", async (req, res) => {
  await db.query("DELETE FROM gastos WHERE id=$1", [req.params.id]);
  res.status(204).end();
});

export default router;
