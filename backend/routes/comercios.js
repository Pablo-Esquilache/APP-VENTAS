import express from "express";
import pool from "../db.js";

const router = express.Router();

// ------------------------------
// Obtener comercio a partir del Firebase UID del usuario
// ------------------------------
router.get("/uid/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    // Antes buscábamos firebase_uid en la tabla comercios, lo correcto es buscar en usuarios
    const result = await pool.query(
      `SELECT c.id, c.nombre
       FROM usuarios u
       JOIN comercios c ON u.comercio_id = c.id
       WHERE u.firebase_uid = $1`,
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
