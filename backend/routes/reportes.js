import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/ventas-gastos-tiempo", async (req, res) => {
  const { comercio_id, agrupacion = "dia", desde, hasta } = req.query;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  let groupBy;
  switch (agrupacion) {
    case "mes":
      groupBy = "DATE_TRUNC('month', fecha)";
      break;
    case "semana":
      groupBy = "DATE_TRUNC('week', fecha)";
      break;
    default:
      groupBy = "DATE(fecha)";
  }

  let filtroFecha = "";
  const params = [comercio_id];

  if (desde && hasta) {
    filtroFecha = "AND fecha BETWEEN $2 AND $3";
    params.push(desde, hasta);
  }

  const q = `
    SELECT
      periodo,
      COALESCE(SUM(total_ventas), 0) AS total_ventas,
      COALESCE(SUM(total_gastos), 0) AS total_gastos
    FROM (
      SELECT
        ${groupBy} AS periodo,
        SUM(total) AS total_ventas,
        0 AS total_gastos
      FROM ventas
      WHERE comercio_id = $1
      ${filtroFecha}
      GROUP BY periodo

      UNION ALL

      SELECT
        ${groupBy} AS periodo,
        0 AS total_ventas,
        SUM(importe) AS total_gastos
      FROM gastos
      WHERE comercio_id = $1
      ${filtroFecha}
      GROUP BY periodo
    ) t
    GROUP BY periodo
    ORDER BY periodo;
  `;

  const { rows } = await db.query(q, params);
  res.json(rows);
});

export default router;
