import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";

const router = express.Router();

// GET all users by comercioId
router.get("/:comercioId", async (req, res) => {
  const { comercioId } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, usuario, role, comercio_id, created_at, last_login FROM usuarios WHERE comercio_id = $1 ORDER BY id ASC",
      [comercioId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// POST create new user
router.post("/", async (req, res) => {
  const { usuario, password, role = "user", comercio_id } = req.body;
  if (!usuario || !password || !comercio_id) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    // Check if user exists
    const existing = await pool.query("SELECT id FROM usuarios WHERE usuario = $1", [usuario]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO usuarios (usuario, password, role, comercio_id) VALUES ($1, $2, $3, $4) RETURNING id, usuario, role, comercio_id",
      [usuario, hashedPassword, role, comercio_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// PUT update user (password, role, etc)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { usuario, password, role } = req.body;

  try {
    const updates = [];
    const values = [];
    let queryIndex = 1;

    if (usuario) {
      updates.push(`usuario = $${queryIndex++}`);
      values.push(usuario);
    }
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${queryIndex++}`);
      values.push(hashedPassword);
      // Force logout on password change
      updates.push(`active_session = NULL`);
    }

    if (role) {
      updates.push(`role = $${queryIndex++}`);
      values.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No hay campos para actualizar" });
    }

    values.push(id);
    const query = `UPDATE usuarios SET ${updates.join(", ")} WHERE id = $${queryIndex} RETURNING id, usuario, role`;
    
    const result = await pool.query(query, values);
    if (result.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// DELETE user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM usuarios WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

export default router;
