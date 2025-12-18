import express from "express";
import db from "../db.js";

const router = express.Router();

/* ==========================
   GET - REFRESH / PING DB
   ========================== */
router.get("/refresh-db", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ ok: true, message: "Conexión a la base activa" });
  } catch (error) {
    console.error("Error refrescando DB:", error);
    res.status(500).json({ ok: false, error: "Error de conexión a la base" });
  }
});

export default router;
