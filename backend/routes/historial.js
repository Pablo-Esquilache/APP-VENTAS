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
      DATE(v.fecha) as fecha,
      p.nombre as producto,
      vd.cantidad,
      vd.total
    FROM ventas_detalle vd
    JOIN ventas v ON v.id = vd.venta_id
    JOIN productos p ON p.id = vd.producto_id
    WHERE v.cliente_id = ?
      AND v.comercio_id = ?
    ORDER BY v.fecha DESC
    `,
    [id, comercio_id]
  );

  res.json(rows);
});
