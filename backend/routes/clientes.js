import express from "express";
import db from "../db.js";

const router = express.Router();

// ==========================
// GET - CLIENTES POR COMERCIO
// ==========================
router.get("/", async (req, res) => {
  const { comercio_id } = req.query;
  if (!comercio_id) return res.status(400).json({ error: "comercio_id requerido" });

  const { rows } = await db.query(
    `SELECT * FROM clientes WHERE comercio_id = $1 ORDER BY id DESC`,
    [comercio_id]
  );

  res.json(rows);
});

// ==========================
// POST
// ==========================
router.post("/", async (req, res) => {
  const { nombre, edad, genero, telefono, email, localidad, comentarios, comercio_id } = req.body;

  const q = `
    INSERT INTO clientes
    (nombre, edad, genero, telefono, email, localidad, comentarios, comercio_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *
  `;

  const { rows } = await db.query(q, [
    nombre, edad, genero, telefono, email, localidad, comentarios, comercio_id
  ]);

  res.status(201).json(rows[0]);
});

// ==========================
// PUT
// ==========================
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, edad, genero, telefono, email, localidad, comentarios, comercio_id } = req.body;

  const q = `
    UPDATE clientes SET
      nombre=$1, edad=$2, genero=$3, telefono=$4,
      email=$5, localidad=$6, comentarios=$7
    WHERE id=$8 AND comercio_id=$9
    RETURNING *
  `;

  const { rows } = await db.query(q, [
    nombre, edad, genero, telefono, email, localidad, comentarios, id, comercio_id
  ]);

  res.json(rows[0] || null);
});

// ==========================
// DELETE
// ==========================
// router.delete("/:id", async (req, res) => {
//   const { id } = req.params;
//   const { comercio_id } = req.query;

//   try {
//     await db.query(
//       `DELETE FROM clientes WHERE id = $1 AND comercio_id = $2`,
//       [id, comercio_id]
//     );

//     res.status(204).end();
//   } catch (error) {
//     if (error.code === "23503") {
//       return res.status(409).json({
//         error: "No se puede eliminar el cliente porque tiene ventas asociadas"
//       });
//     }

//     res.status(500).json({ error: "Error interno" });
//   }
// });

// ==========================
// LOCALIDADES
// ==========================
router.get("/localidades/lista", async (req, res) => {
  const { comercio_id } = req.query;

  const { rows } = await db.query(
    `SELECT DISTINCT localidad FROM clientes WHERE comercio_id=$1`,
    [comercio_id]
  );

  res.json(rows.map(r => r.localidad));
});

export default router;
