import express from "express";
import db from "../db.js";

const router = express.Router();

/* ==========================
   GET - GASTOS POR COMERCIO
   ========================== */
router.get("/", async (req, res) => {
  const { comercio_id } = req.query;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM gastos
      WHERE comercio_id = $1
      ORDER BY fecha DESC, id DESC
      `,
      [comercio_id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error cargando gastos:", error);
    res.status(500).json({ error: "Error al obtener gastos" });
  }
});

/* ==========================
   POST - CREAR GASTO
   ========================== */
router.post("/", async (req, res) => {
  const { fecha, descripcion, tipo, importe, comercio_id } = req.body;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  try {
    const { rows } = await db.query(
      `
      INSERT INTO gastos (fecha, descripcion, tipo, importe, comercio_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [fecha, descripcion, tipo, importe, comercio_id]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creando gasto:", error);
    res.status(500).json({ error: "Error al crear gasto" });
  }
});

/* ==========================
   PUT - EDITAR GASTO
   ========================== */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { fecha, descripcion, tipo, importe, comercio_id } = req.body;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  try {
    const { rows } = await db.query(
      `
      UPDATE gastos
      SET fecha = $1,
          descripcion = $2,
          tipo = $3,
          importe = $4
      WHERE id = $5 AND comercio_id = $6
      RETURNING *
      `,
      [fecha, descripcion, tipo, importe, id, comercio_id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: "Gasto no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error actualizando gasto:", error);
    res.status(500).json({ error: "Error al actualizar gasto" });
  }
});

/* ==========================
   DELETE - ELIMINAR GASTO
   ========================== */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { comercio_id } = req.query;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  try {
    await db.query(
      `
      DELETE FROM gastos
      WHERE id = $1 AND comercio_id = $2
      `,
      [id, comercio_id]
    );

    res.status(204).end();
  } catch (error) {
    console.error("Error eliminando gasto:", error);
    res.status(500).json({ error: "Error al eliminar gasto" });
  }
});

export default router;
