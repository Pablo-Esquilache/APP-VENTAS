import express from "express";
import db from "../db.js"; // tu conexión a la base de datos

const router = express.Router();

/* ==========================
   GET - EXPORTAR TABLA A EXCEL
   ========================== */
import XLSX from "xlsx";

router.get("/", async (req, res) => {
  const { tabla } = req.query;

  if (!tabla) return res.status(400).json({ error: "tabla requerida" });

  let query;
  switch (tabla) {
    case "ventas":
      query = "SELECT * FROM ventas";
      break;
    case "clientes":
      query = "SELECT * FROM clientes";
      break;
    case "productos":
      query = "SELECT * FROM productos";
      break;
    case "gastos":
      query = "SELECT * FROM gastos";
      break;
    default:
      return res.status(400).json({ error: "Tabla no válida" });
  }

  try {
    const { rows } = await db.query(query);

    // Generar libro y hoja de Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, tabla);

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", `attachment; filename=${tabla}.xlsx`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buf);
  } catch (error) {
    console.error("Error generando Excel:", error);
    res.status(500).json({ error: "Error al generar Excel" });
  }
});

export default router;
