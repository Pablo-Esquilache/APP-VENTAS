import pool from "../db.js";

// Obtener turnos
export const getTurnos = async (req, res) => {
  const { comercio_id, fecha } = req.query;

  if (!comercio_id) return res.status(400).json({ error: "comercio_id requerido" });

  try {
    let query = `
      SELECT t.*, c.nombre as cliente_nombre, c.telefono as cliente_telefono 
      FROM turnos t
      JOIN clientes c ON t.cliente_id = c.id
      WHERE t.comercio_id = $1
    `;
    const params = [comercio_id];

    if (fecha) {
      query += ` AND t.fecha = $2`;
      params.push(fecha);
    }

    query += ` ORDER BY t.fecha ASC, t.hora ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener turnos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Crear turno
export const createTurno = async (req, res) => {
  const { comercio_id, cliente_id, fecha, hora, servicio_motivo } = req.body;

  if (!comercio_id) return res.status(400).json({ error: "comercio_id requerido" });

  try {
    const result = await pool.query(
      `INSERT INTO turnos (comercio_id, cliente_id, fecha, hora, servicio_motivo, estado)
       VALUES ($1, $2, $3, $4, $5, 'reservado') RETURNING *`,
      [comercio_id, cliente_id, fecha, hora, servicio_motivo]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear turno:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Actualizar turno general
export const updateTurno = async (req, res) => {
  const { id } = req.params;
  const { comercio_id, cliente_id, fecha, hora, servicio_motivo, estado } = req.body;
  // If comercio_id is in query for PUT requests
  const cid = comercio_id || req.query.comercio_id;

  if (!cid) return res.status(400).json({ error: "comercio_id requerido" });

  try {
    const result = await pool.query(
      `UPDATE turnos 
       SET cliente_id = COALESCE($1, cliente_id), 
           fecha = COALESCE($2, fecha), 
           hora = COALESCE($3, hora), 
           servicio_motivo = COALESCE($4, servicio_motivo), 
           estado = COALESCE($5, estado) 
       WHERE id = $6 AND comercio_id = $7 RETURNING *`,
      [cliente_id, fecha, hora, servicio_motivo, estado, id, cid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Turno no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar turno:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar turno
export const deleteTurno = async (req, res) => {
  const { id } = req.params;
  const cid = req.query.comercio_id || req.body.comercio_id;

  if (!cid) return res.status(400).json({ error: "comercio_id requerido" });

  try {
    const result = await pool.query(
      "DELETE FROM turnos WHERE id = $1 AND comercio_id = $2 RETURNING *",
      [id, cid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Turno no encontrado" });
    }

    res.json({ message: "Turno eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar turno:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
