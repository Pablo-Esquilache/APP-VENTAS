// routes/auth.js
import express from "express";
import pool from "../db.js";
import { v4 as uuidv4 } from "uuid"; // npm install uuid si no lo tenés

const router = express.Router();

router.post("/login", async (req, res) => {
  const { firebase_uid } = req.body;

  if (!firebase_uid) {
    return res.status(400).json({ error: "firebase_uid requerido" });
  }

  try {
    const result = await pool.query(
      `SELECT id, role, comercio_id, active_session 
       FROM usuarios 
       WHERE firebase_uid = $1`,
      [firebase_uid]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: "Usuario no autorizado" });
    }

    const user = result.rows[0];

    // Revisar si ya tiene sesión activa
    if (user.active_session) {
      return res.status(403).json({ error: "Usuario ya tiene sesión activa en otro dispositivo" });
    }

    // Generar token de sesión único
    const sessionToken = uuidv4();

    // Guardar token en la base y actualizar last_login
    await pool.query(
      `UPDATE usuarios SET active_session = $1, last_login = NOW() WHERE id = $2`,
      [sessionToken, user.id]
    );

    // Devolver datos y token
    res.json({
      uid: firebase_uid,
      role: user.role,
      comercio_id: user.comercio_id,
      session_token: sessionToken
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/logout", async (req, res) => {
  const { firebase_uid } = req.body;
  if (!firebase_uid) return res.status(400).json({ error: "firebase_uid requerido" });

  try {
    await pool.query(
      `UPDATE usuarios SET active_session = NULL WHERE firebase_uid = $1`,
      [firebase_uid]
    );
    res.json({ message: "Sesión cerrada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


export default router;
