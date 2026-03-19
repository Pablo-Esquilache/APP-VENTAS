import db from "../db.js";

// ==========================
// GET - CLIENTES POR COMERCIO
// ==========================
export const getClientes = async (req, res) => {
  const { comercio_id } = req.query;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  try {
    const { rows } = await db.query(
      `
      SELECT c.*,
      COALESCE(SUM(
        CASE
          WHEN m.tipo = 'venta' THEN m.monto
          WHEN m.tipo = 'pago' THEN -m.monto
        END
      ),0) AS saldo
      FROM clientes c
      LEFT JOIN cuenta_corriente_movimientos m
        ON c.id = m.cliente_id
        AND c.comercio_id = m.comercio_id
      WHERE c.comercio_id = $1
      GROUP BY c.id
      ORDER BY c.id DESC
      `,
      [comercio_id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo clientes:", error);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
};

// ==========================
// POST - CREAR CLIENTE
// ==========================
export const createCliente = async (req, res) => {
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

  try {
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
  } catch (error) {
    console.error("Error creando cliente:", error);
    res.status(500).json({ error: "Error al crear cliente" });
  }
};

// ==========================
// PUT - EDITAR CLIENTE
// ==========================
export const updateCliente = async (req, res) => {
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

  try {
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

    if (!rows[0]) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error actualizando cliente:", error);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
};

// ==========================
// LOCALIDADES
// ==========================
export const getLocalidades = async (req, res) => {
  const { comercio_id } = req.query;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  try {
    const { rows } = await db.query(
      `
        SELECT DISTINCT localidad
        FROM clientes
        WHERE comercio_id = $1
          AND localidad IS NOT NULL
          AND localidad <> ''
        ORDER BY localidad
      `,
      [comercio_id],
    );

    res.json(rows.map((r) => r.localidad));
  } catch (error) {
    console.error("Error obteniendo localidades:", error);
    res.status(500).json({ error: "Error al obtener localidades" });
  }
};

export const getSaldoCliente = async (req, res) => {
  const { id } = req.params;
  const { comercio_id } = req.query;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  try {
    const { rows } = await db.query(
      `
      SELECT COALESCE(SUM(
        CASE
          WHEN tipo = 'venta' THEN monto
          WHEN tipo = 'pago' THEN -monto
        END
      ),0) AS saldo
      FROM cuenta_corriente_movimientos
      WHERE cliente_id = $1
        AND comercio_id = $2
      `,
      [id, comercio_id]
    );

    res.json({ saldo: Number(rows[0]?.saldo || 0) });
  } catch (error) {
    console.error("Error obteniendo saldo del cliente:", error);
    res.status(500).json({ error: "Error al obtener saldo del cliente" });
  }
};

export const getCuentaCorriente = async (req, res) => {
  const { id } = req.params;
  const { comercio_id } = req.query;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  try {
    const { rows } = await db.query(
      `
      SELECT *
      FROM cuenta_corriente_movimientos
      WHERE cliente_id = $1
        AND comercio_id = $2
      ORDER BY created_at DESC
      `,
      [id, comercio_id],
    );

    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo cuenta corriente:", error);
    res.status(500).json({ error: "Error al obtener cuenta corriente" });
  }
};

export const registrarPagoCliente = async (req, res) => {
  const { id } = req.params;
  const { comercio_id, monto } = req.body;

  if (!monto || monto <= 0)
    return res.status(400).json({ error: "Monto inválido" });

  if (!comercio_id)
    return res.status(400).json({ error: "comercio_id requerido" });

  try {
    const { rows } = await db.query(
      `
      INSERT INTO cuenta_corriente_movimientos
      (cliente_id, comercio_id, tipo, monto)
      VALUES ($1,$2,'pago',$3)
      RETURNING *
      `,
      [id, comercio_id, monto],
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error registrando pago:", error);
    res.status(500).json({ error: "Error al registrar pago" });
  }
};
