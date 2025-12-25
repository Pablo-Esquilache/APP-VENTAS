import express from "express";
import db from "../db.js";

const router = express.Router();

// ==========================
// GET - CLIENTES POR COMERCIO
// ==========================
router.get("/", async (req, res) => {
  const { comercio_id } = req.query;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  const { rows } = await db.query(
    `
      SELECT *
      FROM clientes
      WHERE comercio_id = $1
      ORDER BY id DESC
    `,
    [comercio_id]
  );

  res.json(rows);
});

// ==========================
// POST - CREAR CLIENTE
// ==========================
router.post("/", async (req, res) => {
  const {
    nombre,
    fecha_nacimiento,
    genero,
    telefono,
    email,
    localidad,
    comentarios,
    comercio_id,
  } = req.body;

  if (!nombre || !comercio_id) {
    return res.status(400).json({ error: "Datos obligatorios faltantes" });
  }

  const q = `
    INSERT INTO clientes
      (nombre, fecha_nacimiento, genero, telefono, email, localidad, comentarios, comercio_id)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *
  `;

  const { rows } = await db.query(q, [
    nombre,
    fecha_nacimiento || null,
    genero || "",
    telefono || "",
    email || "",
    localidad || "",
    comentarios || "",
    comercio_id,
  ]);

  res.status(201).json(rows[0]);
});

// ==========================
// PUT - EDITAR CLIENTE
// ==========================
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    fecha_nacimiento,
    genero,
    telefono,
    email,
    localidad,
    comentarios,
    comercio_id,
  } = req.body;

  if (!id || !comercio_id) {
    return res.status(400).json({ error: "Datos obligatorios faltantes" });
  }

  const q = `
    UPDATE clientes SET
      nombre = $1,
      fecha_nacimiento = $2,
      genero = $3,
      telefono = $4,
      email = $5,
      localidad = $6,
      comentarios = $7
    WHERE id = $8
      AND comercio_id = $9
    RETURNING *
  `;

  const { rows } = await db.query(q, [
    nombre,
    fecha_nacimiento || null,
    genero || "",
    telefono || "",
    email || "",
    localidad || "",
    comentarios || "",
    id,
    comercio_id,
  ]);

  res.json(rows[0] || null);
});

// ==========================
// LOCALIDADES
// ==========================
router.get("/localidades/lista", async (req, res) => {
  const { comercio_id } = req.query;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  const { rows } = await db.query(
    `
      SELECT DISTINCT localidad
      FROM clientes
      WHERE comercio_id = $1
        AND localidad IS NOT NULL
        AND localidad <> ''
      ORDER BY localidad
    `,
    [comercio_id]
  );

  res.json(rows.map((r) => r.localidad));
});

export default router;
