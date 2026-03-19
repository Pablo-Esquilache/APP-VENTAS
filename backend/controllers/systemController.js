import db from "../db.js";

/* ==========================
   GET - REFRESH / PING DB
   ========================== */
export const pingDb = async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ ok: true, message: "Conexión a la base activa" });
  } catch (error) {
    console.error("Error refrescando DB:", error);
    res.status(500).json({ ok: false, error: "Error de conexión a la base" });
  }
};
