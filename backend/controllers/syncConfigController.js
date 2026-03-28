import pool from "../db.js";

// Obtener la configuración actual de Sincronización
export const getConfig = async (req, res) => {
  try {
    const comercioId = req.user?.comercio_id || 1; 
    
    const result = await pool.query(
      "SELECT api_token, sync_enabled, api_url FROM configuracion_sync WHERE comercio_id = $1",
      [comercioId]
    );

    if (result.rows.length === 0) {
      await pool.query("INSERT INTO configuracion_sync (comercio_id, sync_enabled) VALUES ($1, false)", [comercioId]);
      return res.json({ api_token: "", sync_enabled: false, api_url: "http://127.0.0.1:3000/api/sync" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener config_sync:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Guardar o Actualizar configuración de Sincronización
export const setConfig = async (req, res) => {
  try {
    const comercioId = req.user?.comercio_id || 1;
    const { api_token, sync_enabled, api_url } = req.body;

    await pool.query(
      `UPDATE configuracion_sync 
       SET api_token = $1, sync_enabled = $2, api_url = $3
       WHERE comercio_id = $4`,
      [api_token || null, !!sync_enabled, api_url || 'http://127.0.0.1:3000/api/sync', comercioId]
    );

    res.json({ message: "Configuración guardada exitosamente" });
  } catch (error) {
    console.error("Error guardando config_sync:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
