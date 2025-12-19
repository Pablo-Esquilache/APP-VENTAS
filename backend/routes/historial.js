import express from "express";
import db from "../db.js";

const router = express.Router();

// GET historial de compras por cliente (solo admin)
router.get("/clientes/:id/historial", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { comercio_id } = req.query;

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "No autorizado" });
  }

  const [rows] = await pool.query(
    `
    SELECT
  DATE(v.fecha) AS fecha,
  p.nombre AS producto,
  v.cantidad,
  v.total
FROM ventas v
JOIN productos p ON p.id = v.producto_id
WHERE v.cliente_id = ?
  AND v.comercio_id = ?
ORDER BY v.fecha DESC

    `,
    [id, comercio_id]
  );

  res.json(rows);
});


export default router;