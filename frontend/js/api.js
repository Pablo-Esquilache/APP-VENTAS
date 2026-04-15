// api.js - Servicio Centralizado para Llamadas a la API

const isLocalhost =
  location.hostname === "localhost" || location.hostname === "127.0.0.1";
export const API_BASE_URL = isLocalhost
  ? "http://localhost:4000/api"
  : "https://app-ventas-gvdk.onrender.com/api";

/**
 * Función base para realizar peticiones fetch
 * @param {string} endpoint - La ruta después de /api (ej: "/ventas")
 * @param {object} options - Opciones de fetch (method, body, headers, etc)
 * @returns {Promise<any>} Promesa con la respuesta en JSON
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const session = JSON.parse(localStorage.getItem("session"));

  const defaultHeaders = {
    "Content-Type": "application/json",
    "x-user-role": session?.role || "",
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (config.body && typeof config.body !== "string") {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    // Si la respuesta es NO-CONTENT (204) no intentar parsear JSON
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || data.message || `Error HTTP: ${response.status}`,
      );
    }

    return data;
  } catch (error) {
    console.error(`Error en apiFetch a ${endpoint}:`, error);
    throw error;
  }
}

// ==========================================
// SERVICIOS ESPECÍFICOS POR MÓDULO
// ==========================================

export const ComercioAPI = {
  getByUid: (uid) => apiFetch(`/comercios/uid/${uid}`),
};

export const VentasAPI = {
  getAll: (comercioId) => apiFetch(`/ventas?comercio_id=${comercioId}`),
  getDetalle: (ventaId) => apiFetch(`/ventas/${ventaId}/detalle`),
  create: (data) => apiFetch("/ventas", { method: "POST", body: data }),
  update: (id, data) =>
    apiFetch(`/ventas/${id}`, { method: "PUT", body: data }),
  delete: (id, comercioId) =>
    apiFetch(`/ventas/${id}?comercio_id=${comercioId}`, { method: "DELETE" }),
};

export const ClientesAPI = {
  getAll: (comercioId) => apiFetch(`/clientes?comercio_id=${comercioId}`),
  create: (data) => apiFetch("/clientes", { method: "POST", body: data }),
  update: (id, data) =>
    apiFetch(`/clientes/${id}`, { method: "PUT", body: data }),
  getLocalidades: (comercioId) =>
    apiFetch(`/clientes/localidades/lista?comercio_id=${comercioId}`),
  getSaldo: (id, comercioId) =>
    apiFetch(`/clientes/${id}/saldo?comercio_id=${comercioId}`),
  getCuentaCorriente: (id, comercioId) =>
    apiFetch(`/clientes/${id}/cuenta-corriente?comercio_id=${comercioId}`),
  registrarPago: (id, data) =>
    apiFetch(`/clientes/${id}/pago`, { method: "POST", body: data }),
};

export const ProductosAPI = {
  getAll: (comercioId) => apiFetch(`/productos?comercio_id=${comercioId}`),
  getCategorias: (comercioId) =>
    apiFetch(`/productos/categorias/lista?comercio_id=${comercioId}`),
  create: (data) => apiFetch("/productos", { method: "POST", body: data }),
  update: (id, data) =>
    apiFetch(`/productos/${id}`, { method: "PUT", body: data }),
  importar: (data) =>
    apiFetch("/productos/importar", { method: "POST", body: data }),
};

export const DevolucionesAPI = {
  getAll: (comercioId) =>
    apiFetch(`/devoluciones?comercio_id=${comercioId}`),
  create: (data) => apiFetch("/devoluciones", { method: "POST", body: data }),
  getDetalle: (devolucionId) =>
    apiFetch(`/devoluciones/${devolucionId}/detalle`),
};

export const HistorialAPI = {
  getVentasPorCliente: (clienteId, comercioId) =>
    apiFetch(`/clientes/${clienteId}/historial?comercio_id=${comercioId}`),
};

export const AuthAPI = {
  login: (data) => apiFetch("/auth/login", { method: "POST", body: data }),
  logout: (data) => apiFetch("/auth/logout", { method: "POST", body: data }),
};

export const ReportesAPI = {
  getVentasGastosTiempo: (comercioId, desde, hasta) => {
    let url = `/reportes/ventas-gastos-tiempo?comercio_id=${comercioId}&agrupacion=dia`;
    if (desde) url += `&desde=${desde}`;
    if (hasta) url += `&hasta=${hasta}`;
    return apiFetch(url);
  },
  getTopProductos: (comercioId, desde, hasta) => {
    let url = `/reportes/top-productos?comercio_id=${comercioId}&limit=10`;
    if (desde) url += `&desde=${desde}`;
    if (hasta) url += `&hasta=${hasta}`;
    return apiFetch(url);
  },
  getCategoriasVendidas: (comercioId, desde, hasta) => {
    let url = `/reportes/categorias-vendidas?comercio_id=${comercioId}`;
    if (desde) url += `&desde=${desde}`;
    if (hasta) url += `&hasta=${hasta}`;
    return apiFetch(url);
  },
  getEdadEtarioGenero: (comercioId, desde, hasta) => {
    let url = `/reportes/edad-etario-genero?comercio_id=${comercioId}`;
    if (desde) url += `&desde=${desde}`;
    if (hasta) url += `&hasta=${hasta}`;
    return apiFetch(url);
  },
  getMetodosPago: (comercioId, desde, hasta) => {
    let url = `/reportes/metodos-pago?comercio_id=${comercioId}`;
    if (desde) url += `&desde=${desde}`;
    if (hasta) url += `&hasta=${hasta}`;
    return apiFetch(url);
  },
  getGastosDescripcionTipo: (comercioId, desde, hasta) => {
    let url = `/reportes/gastos-descripcion-tipo?comercio_id=${comercioId}`;
    if (desde) url += `&desde=${desde}`;
    if (hasta) url += `&hasta=${hasta}`;
    return apiFetch(url);
  },
  getVentasPorLocalidad: (comercioId, desde, hasta) => {
    let url = `/reportes/ventas-por-localidad?comercio_id=${comercioId}`;
    if (desde) url += `&desde=${desde}`;
    if (hasta) url += `&hasta=${hasta}`;
    return apiFetch(url);
  },
  getTopClientesFrecuenciaTicket: (comercioId, desde, hasta) => {
    let url = `/reportes/top-clientes-frecuencia-ticket?comercio_id=${comercioId}&limit=10`;
    if (desde) url += `&desde=${desde}`;
    if (hasta) url += `&hasta=${hasta}`;
    return apiFetch(url);
  },
};

export const ExportarAPI = {
  getTablaExcel: (tabla) => apiFetch(`/exportar-tabla?tabla=${tabla}`),
};

export const GastosAPI = {
  getAll: (comercioId) => apiFetch(`/gastos?comercio_id=${comercioId}`),
  create: (data) => apiFetch("/gastos", { method: "POST", body: data }),
  update: (id, data) =>
    apiFetch(`/gastos/${id}`, { method: "PUT", body: data }),
  delete: (id, comercioId) =>
    apiFetch(`/gastos/${id}?comercio_id=${comercioId}`, { method: "DELETE" }),
};

export const CajasAPI = {
  getHoy: (comercioId) => apiFetch(`/cajas/hoy/${comercioId}`),
  getMovimientos: (comercioId) => apiFetch(`/cajas/movimientos/${comercioId}`),
  getHistorial: (comercioId) => apiFetch(`/cajas/historial/${comercioId}`),
  abrir: (data) => apiFetch("/cajas/abrir", { method: "POST", body: data }),
  cerrar: (id, data) =>
    apiFetch(`/cajas/cerrar/${id}`, { method: "PUT", body: data }),
};

export const SystemAPI = {
  refreshDb: () => apiFetch("/system/refresh-db"),
};