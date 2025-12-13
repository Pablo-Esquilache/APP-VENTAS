import express from "express";
import db from "../db.js";

const router = express.Router();

// GET - todos los gastos
router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM gastos ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    console.error("Error cargando gastos:", error);
    res.status(500).json({ error: "Error al obtener gastos" });
  }
});

// POST - crear gasto
router.post("/", async (req, res) => {
  try {
    const { fecha, descripcion, tipo, importe } = req.body;
    const { rows } = await db.query(
      `INSERT INTO gastos (fecha, descripcion, tipo, importe)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [fecha, descripcion, tipo, importe]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creando gasto:", error);
    res.status(500).json({ error: "Error al crear gasto" });
  }
});

// PUT - actualizar gasto
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, descripcion, tipo, importe } = req.body;
    const { rows } = await db.query(
      `UPDATE gastos SET fecha=$1, descripcion=$2, tipo=$3, importe=$4
       WHERE id=$5 RETURNING *`,
      [fecha, descripcion, tipo, importe, id]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error("Error actualizando gasto:", error);
    res.status(500).json({ error: "Error al actualizar gasto" });
  }
});

// DELETE - eliminar gasto
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM gastos WHERE id=$1", [id]);
    res.status(204).end();
  } catch (error) {
    console.error("Error eliminando gasto:", error);
    res.status(500).json({ error: "Error al eliminar gasto" });
  }
});

export default router;
