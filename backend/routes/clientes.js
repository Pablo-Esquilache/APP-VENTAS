import express from "express";
import db from "../db.js";

const router = express.Router();

// ===========================================================
// GET - OBTENER TODOS LOS CLIENTES
// ===========================================================
router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM clientes ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo clientes:", error);
    res.status(500).json({ error: "Error obteniendo clientes" });
  }
});

// ===========================================================
// GET - OBTENER CLIENTE POR ID
// ===========================================================
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query("SELECT * FROM clientes WHERE id = $1", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Error obteniendo cliente:", error);
    res.status(500).json({ error: "Error obteniendo cliente" });
  }
});

// ===========================================================
// POST - CREAR CLIENTE
// ===========================================================
router.post("/", async (req, res) => {
  const { nombre, edad, genero, telefono, email, localidad, comentarios } = req.body;
  if (!nombre || nombre.trim() === "") return res.status(400).json({ error: "El nombre es obligatorio" });

  try {
    const query = `
      INSERT INTO clientes (nombre, edad, genero, telefono, email, localidad, comentarios)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
    `;
    const values = [nombre.trim(), edad || null, genero || "", telefono || "", email || "", localidad || "", comentarios || ""];
    const { rows } = await db.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creando cliente:", error);
    res.status(500).json({ error: "Error creando cliente" });
  }
});

// ===========================================================
// PUT - ACTUALIZAR CLIENTE
// ===========================================================
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, edad, genero, telefono, email, localidad, comentarios } = req.body;
  if (!nombre || nombre.trim() === "") return res.status(400).json({ error: "El nombre es obligatorio" });

  try {
    const query = `
      UPDATE clientes SET
        nombre=$1, edad=$2, genero=$3, telefono=$4, email=$5, localidad=$6, comentarios=$7
      WHERE id=$8 RETURNING *
    `;
    const values = [nombre.trim(), edad || null, genero || "", telefono || "", email || "", localidad || "", comentarios || "", id];
    const { rows } = await db.query(query, values);

    if (rows.length === 0) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Error actualizando cliente:", error);
    res.status(500).json({ error: "Error actualizando cliente" });
  }
});

// ===========================================================
// DELETE - ELIMINAR CLIENTE
// ===========================================================
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query("DELETE FROM clientes WHERE id=$1", [id]);
    if (rowCount === 0) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando cliente:", error);
    res.status(500).json({ error: "Error eliminando cliente" });
  }
});

// GET - LISTA DE LOCALIDADES
router.get("/localidades/lista", async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT DISTINCT localidad 
      FROM clientes
      WHERE localidad IS NOT NULL AND localidad <> ''
      ORDER BY localidad ASC
    `);

    const localidades = rows.map(r => r.localidad);
    res.json(localidades);
  } catch (error) {
    console.error("Error cargando localidades:", error);
    res.status(500).json({ error: "Error obteniendo localidades" });
  }
});


export default router;
