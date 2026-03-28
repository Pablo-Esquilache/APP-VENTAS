import pool from '../db.js';

export const initSyncWorker = () => {
  console.log("☁ Inicializando Worker de Sincronización Omnicanal...");
  
  // Ejecutar el ciclo de sync cada 3 minutos (180,000 ms)
  setInterval(runSyncCycle, 180000);
  
  // Opcional: Ejecutar un primer escaneo a los 10 segundos
  setTimeout(runSyncCycle, 10000);
};

const runSyncCycle = async () => {
  let config;
  try {
    const res = await pool.query("SELECT api_token, sync_enabled, api_url FROM configuracion_sync WHERE comercio_id = 1");
    if (res.rows.length === 0) return;
    config = res.rows[0];
  } catch (err) {
    console.error("☁ Error leyendo config de sync:", err);
    return;
  }

  if (!config.sync_enabled || !config.api_token) {
    return;
  }

  const ECOMMERCE_API_URL = config.api_url || "http://127.0.0.1:3000/api/sync";

  console.log("☁ [SYNC WORKER] Iniciando ciclo de Polling...");

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${config.api_token}`
  };

  try {
    // ==========================================================
    // PASO A: Ventas Locales -> Nube
    // ==========================================================
    const ventasLocales = await pool.query(`
      SELECT v.id as venta_id, vd.producto_id, SUM(vd.cantidad) as cantidad 
      FROM ventas v 
      JOIN ventas_detalle vd ON v.id = vd.venta_id 
      WHERE v.sincronizada_web = false
      GROUP BY v.id, vd.producto_id
    `);

    if (ventasLocales.rows.length > 0) {
      const updatesMap = {};
      const ventasAfectadas = new Set();
      
      ventasLocales.rows.forEach(row => {
        ventasAfectadas.add(row.venta_id);
        if(!updatesMap[row.producto_id]) updatesMap[row.producto_id] = 0;
        updatesMap[row.producto_id] += Number(row.cantidad);
      });

      const updatesArray = Object.keys(updatesMap).map(id => ({
        id_producto: parseInt(id),
        cantidad_vendida: updatesMap[id]
      }));

      const uploadRes = await fetch(`${ECOMMERCE_API_URL}/update-stock`, {
        method: "POST",
        headers,
        body: JSON.stringify({ updates: updatesArray })
      });

      if (uploadRes.ok) {
        const ventasIds = Array.from(ventasAfectadas);
        await pool.query(`UPDATE ventas SET sincronizada_web = true WHERE id = ANY($1::int[])`, [ventasIds]);
        console.log(`☁ [SYNC WORKER] Enviadas ${ventasIds.length} ventas locales al E-commerce.`);
      } else {
        console.error("☁ [SYNC WORKER] Fallo al enviar ventas a la Nube:", await uploadRes.text());
      }
    }

    const confirmPedidosIds = [];
    const confirmProductosIds = [];

    // ==========================================================
    // PASO B: Ventas Nube -> Local (Descuento de Stock)
    // ==========================================================
    console.log(`☁ [SYNC WORKER] Buscando Ventas de la Nube en ${ECOMMERCE_API_URL}/pending-sales`);
    const webSalesRes = await fetch(`${ECOMMERCE_API_URL}/pending-sales`, { headers });
    if (webSalesRes.ok) {
      const pendingSalesText = await webSalesRes.text();
      if (pendingSalesText) {
        const data = JSON.parse(pendingSalesText);
        console.log("☁ [SYNC WORKER] Ventas descargadas de Nube:", JSON.stringify(data));

        const incomingSales = data.ventas_pendientes || data.ventas || data.updates || (Array.isArray(data) ? data : []); 
        
        for (const element of incomingSales) {
          if (element.id_pedido_web) confirmPedidosIds.push(element.id_pedido_web);
          else if (element.id) confirmPedidosIds.push(element.id); 
          
          let listProductos = element.detalles || element.updates || [element];
          for (const item of listProductos) {
            if (!item.id_producto || !item.cantidad_vendida) continue;
            
            await pool.query(`
              UPDATE productos 
              SET stock = stock - $1 
              WHERE id = $2
            `, [item.cantidad_vendida, item.id_producto]);
          }
        }
        if (incomingSales.length > 0) console.log(`☁ [SYNC WORKER] Stock local descontado de ${incomingSales.length} ventas web.`);
      }
    } else {
      console.log(`☁ [SYNC WORKER] /pending-sales devolvió STATUS ${webSalesRes.status}`);
    }

    // ==========================================================
    // PASO C: Ediciones Directas Nube -> Local 
    // ==========================================================
    console.log(`☁ [SYNC WORKER] Buscando Ediciones Nube en ${ECOMMERCE_API_URL}/pending-product-updates`);
    const webUpdatesRes = await fetch(`${ECOMMERCE_API_URL}/pending-product-updates`, { headers });
    
    if (webUpdatesRes.ok) {
      const dataText = await webUpdatesRes.text();
      if (dataText) {
        const dataUpdates = JSON.parse(dataText);
        console.log("☁ [SYNC WORKER] JSON de /pending-product-updates recibido:", JSON.stringify(dataUpdates));
        
        let modifications = [];
        if (Array.isArray(dataUpdates)) {
            modifications = dataUpdates;
        } else if (Array.isArray(dataUpdates.productos_modificados)) {
            modifications = dataUpdates.productos_modificados;
        } else if (Array.isArray(dataUpdates.updates)) {
            modifications = dataUpdates.updates;
        } else if (dataUpdates.message || dataUpdates.error) {
            console.log("☁ [SYNC WORKER] La Nube solo devolvió un mensaje:", dataUpdates.message || dataUpdates.error);
        } else {
            console.log("☁ [SYNC WORKER] Estructura JSON no reconocida. No se encontraron Arrays.");
        }

        let applied = 0;
        for (const pd of modifications) {
          if (!pd.id) continue;
          confirmProductosIds.push(pd.id);
          
          await pool.query(`
            UPDATE productos 
            SET stock = COALESCE($1, stock),
                precio = COALESCE($2, precio)
            WHERE id = $3
          `, [pd.stock, pd.precio, pd.id]);
          applied++;
        }
        
        if (applied > 0) {
            console.log(`☁ [SYNC WORKER] Éxito: ${applied} productos locales alterados desde la Nube.`);
        }
      } else {
          console.log("☁ [SYNC WORKER] Respuesta de /pending-product-updates vacía.");
      }
    } else {
      console.log(`☁ [SYNC WORKER] /pending-product-updates devolvió STATUS ${webUpdatesRes.status}`);
    }

    // ==========================================================
    // PASO D: Confirmación (Marcado en Web como Sincronizado)
    // ==========================================================
    if (confirmPedidosIds.length > 0 || confirmProductosIds.length > 0) {
      console.log(`☁ [SYNC WORKER] Confirmando a Nube recepción de: Pedidos [${confirmPedidosIds}], Productos [${confirmProductosIds}]`);
      const confirmRes = await fetch(`${ECOMMERCE_API_URL}/mark-synced`, {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          pedidos_ids: confirmPedidosIds, 
          productos_ids: confirmProductosIds 
        })
      });
      if (confirmRes.ok) {
        console.log("☁ [SYNC WORKER] Nube avisada: Confirmación de bajada procesada.");
      } else {
        console.log(`☁ [SYNC WORKER] Error al confirmar a Nube STATUS: ${confirmRes.status}`);
      }
    }

    // Actualizar fecha_ultima_sincronizacion
    await pool.query("UPDATE configuracion_sync SET ultima_sincronizacion = NOW() WHERE comercio_id = 1");

  } catch (error) {
    console.error("☁ [SYNC WORKER] Error general catastrófico:", error);
  }
};
