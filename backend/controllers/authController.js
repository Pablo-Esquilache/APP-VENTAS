import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const SECRET = "clave_super_secreta_local"; // después la podés mover a .env

// ================= LOGIN =================
export const login = async (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM usuarios WHERE usuario = $1`,
      [usuario]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = result.rows[0];

    // Comparar contraseña
    const passwordValida = await bcrypt.compare(password, user.password);
    if (!passwordValida) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Revisar sesión activa
    if (user.active_session) {
      return res.status(403).json({
        error: "Usuario ya tiene sesión activa en otro dispositivo",
      });
    }

    // Crear token
    const sessionToken = uuidv4();
    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET,
      { expiresIn: "8h" }
    );

    // Guardar sesión
    await pool.query(
      `UPDATE usuarios 
       SET active_session = $1, last_login = NOW() 
       WHERE id = $2`,
      [sessionToken, user.id]
    );

    res.json({
      uid: user.id,
      token,
      role: user.role,
      comercio_id: user.comercio_id,
      session_token: sessionToken,
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error interno" });
  }
};

// ================= LOGOUT =================
export const logout = async (req, res) => {
  const { session_token } = req.body;

  if (!session_token)
    return res.status(400).json({ error: "Token requerido" });

  try {
    await pool.query(
      `UPDATE usuarios SET active_session = NULL WHERE active_session = $1`,
      [session_token]
    );

    res.json({ message: "Sesión cerrada" });
  } catch (err) {
    console.error("Error en logout:", err);
    res.status(500).json({ error: "Error interno" });
  }
};
