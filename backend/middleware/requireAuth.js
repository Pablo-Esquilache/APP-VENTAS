import admin from "../firebaseAdmin.js";
import db from "../db.js";

export default async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token requerido" });
    }

    const token = authHeader.split(" ")[1];

    // 1️⃣ Verificar token Firebase
    const decoded = await admin.auth().verifyIdToken(token);

    // 2️⃣ Buscar usuario en tu DB
    const { rows } = await db.query(
      "SELECT role, comercio_id FROM usuarios WHERE firebase_uid = $1",
      [decoded.uid]
    );

    if (!rows[0]) {
      return res.status(403).json({ error: "Usuario no registrado" });
    }

    // 3️⃣ Inyectar usuario en request
    req.user = {
      uid: decoded.uid,
      role: rows[0].role,
      comercio_id: rows[0].comercio_id,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Token inválido" });
  }
}
