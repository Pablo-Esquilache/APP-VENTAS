import db from "../db.js";

/* ==========================
   GET - PRODUCTOS POR COMERCIO
   ========================== */
export const getProductos = async (req, res) => {
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
};

/* ==========================
   GET - LISTA DE CATEGORÍAS POR COMERCIO
   ========================== */
export const getCategorias = async (req, res) => {
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

    const categorias = rows.map((r) => r.categoria);
    res.json(categorias);
  } catch (error) {
    console.error("Error cargando categorías:", error);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
};

/* ==========================
   GET - PRODUCTO POR ID (SEGURO)
   ========================== */
export const getProductoById = async (req, res) => {
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
};

/* ==========================
   POST - CREAR PRODUCTO
   ========================== */
export const createProducto = async (req, res) => {
  const { nombre, categoria, precio, stock, comercio_id, codigo_barras } = req.body;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  try {
    const query = `
      INSERT INTO productos
      (nombre, categoria, precio, stock, comercio_id, codigo_barras)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const { rows } = await db.query(query, [
      nombre,
      categoria || null,
      precio,
      stock ?? 0,
      comercio_id,
      codigo_barras || null,
    ]);

    const finalProduct = rows[0];

    // ==========================================
    // HOOK Sincronización Web en Tiempo Real
    // ==========================================
    try {
      db.query("SELECT api_token, sync_enabled, api_url FROM configuracion_sync WHERE comercio_id = $1", [comercio_id])
        .then(resConfig => {
          const config = resConfig.rows[0];
          console.log(`[HOOK CREATE] Estado Sync: ${config?.sync_enabled}, Token presente: ${!!config?.api_token}`);
          if (config && config.sync_enabled && config.api_token) {
            const targetUrl = (config.api_url || "http://127.0.0.1:3000/api/sync") + "/upsert-product";
            console.log(`[HOOK CREATE] Disparando a la nube: ${targetUrl}`);
            fetch(targetUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${config.api_token}`
              },
              body: JSON.stringify({ 
                id: finalProduct.id,
                nombre: finalProduct.nombre || "Producto Sync",
                descripcion: "", 
                precio: finalProduct.precio,
                precio_oferta: 0,
                stock: finalProduct.stock,
                url_imagen: "",
                categoria: finalProduct.categoria || ""
              })
            }).then(resp => console.log(`[HOOK CREATE] Respuesta Nube: ${resp.status}`))
              .catch(err => console.error("[HOOK CREATE] Error de red hacia la Nube:", err.message));
          } else {
            console.log("[HOOK CREATE] Ignorado (Configuración inactiva o sin token).");
          }
        })
        .catch(err => console.error("[HOOK CREATE] Error bd:", err));
    } catch (e) {
      console.error("[HOOK CREATE] Catch externo", e);
    }

    res.status(201).json(finalProduct);
  } catch (error) {
    console.error("Error creando producto:", error);
    res.status(500).json({ error: "Error al crear el producto" });
  }
};

/* ==========================
   PUT - ACTUALIZAR PRODUCTO
   ========================== */
export const updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, precio, stock, comercio_id, codigo_barras } = req.body;

  if (!comercio_id) {
    return res.status(400).json({ error: "comercio_id requerido" });
  }

  try {
    const query = `
      UPDATE productos
      SET nombre = $1,
          categoria = $2,
          precio = $3,
          stock = stock + COALESCE($4::integer, 0),
          codigo_barras = $7
      WHERE id = $5 AND comercio_id = $6
      RETURNING *
    `;

    const { rows } = await db.query(query, [
      nombre,
      categoria || null,
      precio,
      stock,
      id,
      comercio_id,
      codigo_barras || null,
    ]);

    if (!rows[0]) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const finalProduct = rows[0];

    // ==========================================
    // HOOK Sincronización Web en Tiempo Real
    // ==========================================
    try {
      db.query("SELECT api_token, sync_enabled, api_url FROM configuracion_sync WHERE comercio_id = $1", [comercio_id])
        .then(resConfig => {
          const config = resConfig.rows[0];
          console.log(`[HOOK UPDATE] Estado Sync: ${config?.sync_enabled}, Token: ${!!config?.api_token}`);
          
          if (config && config.sync_enabled && config.api_token) {
            const targetUrl = (config.api_url || "http://127.0.0.1:3000/api/sync") + "/upsert-product";
            console.log(`[HOOK UPDATE] Disparando a la nube: ${targetUrl} con ID ${finalProduct.id}`);
            
            fetch(targetUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${config.api_token}`
              },
              body: JSON.stringify({ 
                id: finalProduct.id,
                nombre: finalProduct.nombre || "Producto Sync",
                descripcion: "", 
                precio: finalProduct.precio,
                precio_oferta: 0,
                stock: finalProduct.stock,
                url_imagen: "",
                categoria: finalProduct.categoria || ""
              })
            }).then(async resp => {
                 console.log(`[HOOK UPDATE] Respuesta Nube STATUS: ${resp.status}`);
                 if(!resp.ok) console.log(`[HOOK UPDATE] Falló body:`, await resp.text());
              })
              .catch(err => console.error("[HOOK UPDATE] Error de red hacia la Nube:", err.message));
          } else {
             console.log("[HOOK UPDATE] Ignorado (Configuración inactiva o sin token).");
          }
        })
        .catch(err => console.error("[HOOK UPDATE] Error query bd:", err));
    } catch (e) {
      console.error("[HOOK UPDATE] Catch externo", e);
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error actualizando producto:", error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
};

/* ==========================
   POST - IMPORTAR DESDE EXCEL
   ========================== */
export const importarProductos = async (req, res) => {
  const { comercio_id, productos } = req.body;

  if (!comercio_id)
    return res.status(400).json({ error: "comercio_id requerido" });

  if (!productos || !Array.isArray(productos))
    return res.status(400).json({ error: "Productos inválidos" });

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    let insertados = 0;

    for (const p of productos) {
      if (!p.nombre) continue;

      // 🔎 Verificar si ya existe por nombre
      const existe = await client.query(
        `
        SELECT id
        FROM productos
        WHERE nombre = $1 AND comercio_id = $2
        `,
        [p.nombre, comercio_id]
      );

      if (existe.rows.length) continue;

      await client.query(
        `
        INSERT INTO productos
        (nombre, categoria, precio, stock, comercio_id)
        VALUES ($1,$2,$3,$4,$5)
        `,
        [p.nombre, p.categoria || null, p.precio || 0, p.stock || 0, comercio_id]
      );

      insertados++;
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      insertados,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Error importando productos" });
  } finally {
    client.release();
  }
};
