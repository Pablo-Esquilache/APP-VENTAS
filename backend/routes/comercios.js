import express from "express";
import pool from "../db.js";

const router = express.Router();

// Obtener comercio por Firebase UID
router.get("/uid/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    const result = await pool.query(
      "SELECT id, nombre FROM comercios WHERE firebase_uid = $1",
      [uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Comercio no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al buscar comercio:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
