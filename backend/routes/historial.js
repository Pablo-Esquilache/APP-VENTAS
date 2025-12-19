import express from "express";
import db from "../db.js";

const router = express.Router();

// GET historial de compras por cliente
router.get("/clientes/:id/historial", async (req, res) => {
  const { id } = req.params;
  const { comercio_id } = req.query;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  try {
    const { rows } = await db.query(
      `
      SELECT
        DATE(v.fecha) AS fecha,
        p.nombre AS producto,
        v.cantidad,
        v.total
      FROM ventas v
      JOIN productos p ON p.id = v.producto_id
      WHERE v.cliente_id = $1
        AND v.comercio_id = $2
      ORDER BY v.fecha DESC
      `,
      [id, comercio_id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error historial cliente:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

export default router;
