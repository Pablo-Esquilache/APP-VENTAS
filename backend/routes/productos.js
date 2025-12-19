import express from "express";
import db from "../db.js";

const router = express.Router();

/* ==========================
   GET - PRODUCTOS POR COMERCIO
   ========================== */
router.get("/", async (req, res) => {
  const { comercio_id } = req.query;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM productos
      WHERE comercio_id = $1
      ORDER BY nombre ASC
      `,
      [comercio_id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error cargando productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

/* ==========================
   GET - LISTA DE CATEGORÍAS POR COMERCIO
   ========================== */
router.get("/categorias/lista", async (req, res) => {
  const { comercio_id } = req.query;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  try {
    const { rows } = await db.query(
      `
      SELECT DISTINCT categoria
      FROM productos
      WHERE comercio_id = $1
        AND categoria IS NOT NULL
        AND categoria <> ''
      ORDER BY categoria ASC
      `,
      [comercio_id]
    );

    const categorias = rows.map(r => r.categoria);
    res.json(categorias);

  } catch (error) {
    console.error("Error cargando categorías:", error);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});

/* ==========================
   GET - PRODUCTO POR ID (SEGURO)
   ========================== */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { comercio_id } = req.query;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM productos
      WHERE id = $1 AND comercio_id = $2
      `,
      [id, comercio_id]
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
  const { nombre, categoria, precio, stock, comercio_id } = req.body;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  try {
    const query = `
      INSERT INTO productos
      (nombre, categoria, precio, stock, comercio_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const { rows } = await db.query(query, [
      nombre,
      categoria || null,
      precio,
      stock ?? 0,
      comercio_id
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
  const { id } = req.params;
  const { nombre, categoria, precio, stock, comercio_id } = req.body;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  try {
    const query = `
      UPDATE productos
      SET nombre = $1,
          categoria = $2,
          precio = $3,
          stock = $4
      WHERE id = $5 AND comercio_id = $6
      RETURNING *
    `;

    const { rows } = await db.query(query, [
      nombre,
      categoria || null,
      precio,
      stock,
      id,
      comercio_id
    ]);

    if (!rows[0]) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error("Error actualizando producto:", error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});

/* ==========================
   DELETE - ELIMINAR PRODUCTO
   ========================== */
// router.delete("/:id", async (req, res) => {
//   const { id } = req.params;
//   const { comercio_id } = req.query;

//   if (!comercio_id) {
//     return res.status(400).json({ error: "comercio_id requerido" });
//   }

//   try {
//     await db.query(
//       `
//       DELETE FROM productos
//       WHERE id = $1 AND comercio_id = $2
//       `,
//       [id, comercio_id]
//     );

//     res.status(204).end();
//   } catch (error) {
//     console.error("Error eliminando producto:", error);
//     res.status(500).json({ error: "Error al eliminar el producto" });
//   }
// });

export default router;
