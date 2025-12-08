import express from "express";
import db from "../db.js";

const router = express.Router();

/* ==========================
   GET - TODOS LOS PRODUCTOS
   ========================== */
router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM productos ORDER BY nombre ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error cargando productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

/* ==========================
   GET - LISTA DE CATEGORÍAS
   ========================== */
router.get("/categorias/lista", async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT DISTINCT categoria 
      FROM productos 
      WHERE categoria IS NOT NULL AND categoria <> ''
      ORDER BY categoria ASC
    `);

    const categorias = rows.map(r => r.categoria);
    res.json(categorias);

  } catch (error) {
    console.error("Error cargando categorías:", error);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});

/* ==========================
   GET - PRODUCTO POR ID
   ========================== */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      "SELECT * FROM productos WHERE id = $1",
      [id]
    );

    res.json(rows[0] || null);
  } catch (error) {
    console.error("Error obteniendo producto:", error);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

/* ==========================
   POST - CREAR PRODUCTO
   ========================== */
router.post("/", async (req, res) => {
  try {
    const { nombre, categoria, precio, stock } = req.body;

    const query = `
      INSERT INTO productos (nombre, categoria, precio, stock)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const { rows } = await db.query(query, [
      nombre,
      categoria || null,
      precio,
      stock ?? 0
    ]);

    res.status(201).json(rows[0]);

  } catch (error) {
    console.error("Error creando producto:", error);
    res.status(500).json({ error: "Error al crear el producto" });
  }
});

/* ==========================
   PUT - ACTUALIZAR PRODUCTO
   ========================== */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria, precio, stock } = req.body;

    const query = `
      UPDATE productos
      SET nombre = $1,
          categoria = $2,
          precio = $3,
          stock = $4
      WHERE id = $5
      RETURNING *
    `;

    const { rows } = await db.query(query, [
      nombre,
      categoria || null,
      precio,
      stock,
      id
    ]);

    res.json(rows[0] || null);

  } catch (error) {
    console.error("Error actualizando producto:", error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});

/* ==========================
   DELETE - ELIMINAR PRODUCTO
   ========================== */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM productos WHERE id = $1", [id]);

    res.status(204).end();
  } catch (error) {
    console.error("Error eliminando producto:", error);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

export default router;
