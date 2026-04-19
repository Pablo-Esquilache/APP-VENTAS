import express from "express";
import pool from "../db.js";

const router = express.Router();

// --- MÉTODOS DE PAGO ---

// Obtener métodos de pago
router.get("/metodos_pago/:comercioId", async (req, res) => {
  const { comercioId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM metodos_pago WHERE comercio_id = $1 ORDER BY id ASC",
      [comercioId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener métodos de pago:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// Agregar método de pago
router.post("/metodos_pago", async (req, res) => {
  const { comercio_id, nombre } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO metodos_pago (comercio_id, nombre) VALUES ($1, $2) RETURNING *",
      [comercio_id, nombre]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al agregar método de pago:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// Toggle activo método de pago
router.put("/metodos_pago/:id/toggle", async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;
  try {
    const result = await pool.query(
      "UPDATE metodos_pago SET activo = $1 WHERE id = $2 RETURNING *",
      [activo, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "No encontrado" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar método de pago:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// Eliminar método de pago
router.delete("/metodos_pago/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM metodos_pago WHERE id = $1", [id]);
    res.json({ message: "Eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar método de pago:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// --- DESCUENTOS ---

// Obtener descuentos
router.get("/descuentos/:comercioId", async (req, res) => {
  const { comercioId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM descuentos_config WHERE comercio_id = $1 ORDER BY porcentaje ASC",
      [comercioId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener descuentos:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// Agregar descuento
router.post("/descuentos", async (req, res) => {
  const { comercio_id, porcentaje } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO descuentos_config (comercio_id, porcentaje) VALUES ($1, $2) RETURNING *",
      [comercio_id, porcentaje]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al agregar descuento:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// Toggle activo descuento
router.put("/descuentos/:id/toggle", async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;
  try {
    const result = await pool.query(
      "UPDATE descuentos_config SET activo = $1 WHERE id = $2 RETURNING *",
      [activo, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "No encontrado" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar descuento:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// Eliminar descuento
router.delete("/descuentos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM descuentos_config WHERE id = $1", [id]);
    res.json({ message: "Eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar descuento:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// --- CATEGORIAS DE GASTOS ---

router.get("/gastos_categorias/:comercioId", async (req, res) => {
  const { comercioId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM gastos_categorias WHERE comercio_id = $1 ORDER BY id ASC",
      [comercioId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener categorías de gastos:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

router.post("/gastos_categorias", async (req, res) => {
  const { comercio_id, nombre } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO gastos_categorias (comercio_id, nombre) VALUES ($1, $2) RETURNING *",
      [comercio_id, nombre]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al agregar categoría de gastos:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

router.put("/gastos_categorias/:id/toggle", async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;
  try {
    const result = await pool.query(
      "UPDATE gastos_categorias SET activo = $1 WHERE id = $2 RETURNING *",
      [activo, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "No encontrado" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar categoría de gastos:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

router.delete("/gastos_categorias/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM gastos_categorias WHERE id = $1", [id]);
    res.json({ message: "Eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar categoría de gastos:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// --- UMBRAL STOCK ---

router.put("/umbral_stock/:comercioId", async (req, res) => {
  const { comercioId } = req.params;
  const { umbral_stock } = req.body;
  try {
    await pool.query("UPDATE comercios SET umbral_stock = $1 WHERE id = $2", [umbral_stock, comercioId]);
    res.json({ message: "Umbral actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar umbral de stock:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// --- TURNOS CONFIG ---

router.get("/turnos_config/:comercioId", async (req, res) => {
  const { comercioId } = req.params;
  try {
    let result = await pool.query("SELECT * FROM turnos_config WHERE comercio_id = $1", [comercioId]);
    
    if (result.rows.length === 0) {
      result = await pool.query(
        "INSERT INTO turnos_config (comercio_id) VALUES ($1) RETURNING *",
        [comercioId]
      );
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener configuracion de turnos:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

router.put("/turnos_config/:comercioId", async (req, res) => {
  const { comercioId } = req.params;
  const { modulo_habilitado, hora_inicio_laboral, hora_fin_laboral, intervalo_minutos, permitir_solapamiento } = req.body;
  try {
    const result = await pool.query(
      `UPDATE turnos_config 
       SET modulo_habilitado = COALESCE($1, modulo_habilitado), 
           hora_inicio_laboral = COALESCE($2, hora_inicio_laboral), 
           hora_fin_laboral = COALESCE($3, hora_fin_laboral), 
           intervalo_minutos = COALESCE($4, intervalo_minutos), 
           permitir_solapamiento = COALESCE($5, permitir_solapamiento)
       WHERE comercio_id = $6 RETURNING *`,
      [modulo_habilitado, hora_inicio_laboral, hora_fin_laboral, intervalo_minutos, permitir_solapamiento, comercioId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar configuracion de turnos:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

export default router;
