import {
  VentasAPI,
  ComercioAPI,
  ClientesAPI,
  ProductosAPI,
  DevolucionesAPI,
} from "./api.js";

// ==============================
// SESIÓN / COMERCIO
// ==============================
const session = JSON.parse(localStorage.getItem("session"));
const firebaseUID = session?.uid;
let comercioId = session?.comercio_id || null;

async function cargarComercio() {
  if (!firebaseUID) return;
  const data = await ComercioAPI.getByUid(firebaseUID);
  comercioId = data.id;
}

// ==============================
// REFERENCIAS DOM
// ==============================
const btnNuevaVenta = document.getElementById("btnNuevaVenta");
const modalVenta = document.getElementById("modalVenta");
const btnCerrarModal = document.querySelector("#modalVenta .app-close");

const btnVerVentas = document.getElementById("btnVerVentas");
const modalVerVentas = document.getElementById("modalVerVentas");
const btnCerrarVer = document.querySelector("#modalVerVentas .app-close-ver");

const tablaVentasBody = document.getElementById("tablaVentasBody");
const tablaVerVentasBody = document.getElementById("tablaVerVentasBody");

const fechaVenta = document.getElementById("fechaVenta");
const clienteVenta = document.getElementById("clienteVenta");
const productoVenta = document.getElementById("productoVenta");
const cantidadVenta = document.getElementById("cantidadVenta");
const btnAgregarProducto = document.getElementById("btnAgregarProducto");

const carritoBody = document.getElementById("carritoBody");
const subtotalVenta = document.getElementById("subtotalVenta");
const descuentoVenta = document.getElementById("descuentoVenta");
const metodoPagoVenta = document.getElementById("metodoPagoVenta");
const totalFinalVenta = document.getElementById("totalFinalVenta");

const formVenta = document.querySelector(".app-form-venta");

const btnDevolucion = document.getElementById("btnDevolucion");
const modalDevolucion = document.getElementById("modalDevolucion");
const cerrarModalDevolucion = document.getElementById("cerrarModalDevolucion");

const modalProductosDevolucion = document.getElementById(
  "modalProductosDevolucion",
);
const cerrarModalProductosDevolucion = document.getElementById(
  "cerrarModalProductosDevolucion",
);

const clienteDevolucion = document.getElementById("clienteDevolucion");
const btnBuscarVentasCliente = document.getElementById(
  "btnBuscarVentasCliente",
);
const tablaVentasClienteBody = document.getElementById(
  "tablaVentasClienteBody",
);

const tablaDetalleVentaBody = document.getElementById("tablaDetalleVentaBody");
const carritoDevolucionBody = document.getElementById("carritoDevolucionBody");
const totalDevolucionSpan = document.getElementById("totalDevolucion");
const btnConfirmarDevolucion = document.getElementById(
  "btnConfirmarDevolucion",
);

// Filtros principal
const buscarVenta = document.getElementById("buscarVenta");
const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");

// Filtros modal
const buscarVentaModal = document.getElementById("buscarVentaModal");
const filtroDesdeModal = document.getElementById("filtroDesdeModal");
const filtroHastaModal = document.getElementById("filtroHastaModal");
const btnLimpiarFiltrosModal = document.getElementById(
  "btnLimpiarFiltrosModal",
);

const btnBuscarProducto = document.getElementById("btnBuscarProducto");
const modalProductos = document.getElementById("modalProductos");
const cerrarModalProductos = document.getElementById("cerrarModalProductos");
const buscarProductoModal = document.getElementById("buscarProductoModal");
const tablaProductosModalBody = document.getElementById(
  "tablaProductosModalBody",
);

const btnVerDevoluciones = document.getElementById("btnVerDevoluciones");
const modalVerDevoluciones = document.getElementById("modalVerDevoluciones");
const cerrarModalVerDevoluciones = document.getElementById(
  "cerrarModalVerDevoluciones",
);
const tablaDevolucionesBody = document.getElementById("tablaDevolucionesBody");

const modalTicketDevolucion = document.getElementById("modalTicketDevolucion");
const cerrarModalTicketDevolucion = document.getElementById(
  "cerrarModalTicketDevolucion",
);

// ==============================
// ESTADO
// ==============================
let carrito = [];
let productosCache = [];
let ventasCachePrincipal = [];
let ventasCacheModal = [];
let ventaEnEdicionId = null;
let carritoDevolucion = [];
let ventaSeleccionadaDevolucion = null;

// ==============================
// MODAL NUEVA VENTA
// ==============================
if (btnNuevaVenta) {
  btnNuevaVenta?.addEventListener("click", async () => {
    limpiarFormulario();

    // 🔹 Fecha automática hoy
    const hoy = new Date().toLocaleDateString("sv-SE");
    fechaVenta.value = hoy;
    fechaVenta.readOnly = true; // no editable

    await cargarClientes();
    await cargarProductos();
    modalVenta.style.display = "flex";
  });
}

if (btnCerrarModal) {
  btnCerrarModal.addEventListener("click", () => {
    modalVenta.style.display = "none";
  });
}

window.addEventListener("click", (e) => {
  if (e.target === modalVenta) modalVenta.style.display = "none";
});

// ==============================
// LIMPIAR FORM
// ==============================
function limpiarFormulario() {
  carrito = [];
  carritoBody.innerHTML = "";
  subtotalVenta.textContent = "0.00";
  totalFinalVenta.textContent = "0.00";
  descuentoVenta.value = "0";
  cantidadVenta.value = 1;
  productoVenta.value = "";

  ventaEnEdicionId = null;
}

// ==============================
// CLIENTES
// ==============================
async function cargarClientes() {
  const clientes = await ClientesAPI.getAll(comercioId);

  clienteVenta.innerHTML = `<option value="">Seleccionar cliente</option>`;
  clientes.forEach((c) => {
    clienteVenta.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
  });
}

// ==============================
// PRODUCTOS
// ==============================
async function cargarProductos() {
  const productos = await ProductosAPI.getAll(comercioId);
  productosCache = productos;

  productoVenta.innerHTML = `<option value="">Seleccionar producto</option>`;
  productos.forEach((p) => {
    if (p.stock > 0) {
      productoVenta.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
    }
  });
}

// ==============================
// AGREGAR AL CARRITO
// ==============================
if (btnAgregarProducto) {
  btnAgregarProducto.addEventListener("click", () => {
    const productoId = productoVenta.value;
    const cantidad = Number(cantidadVenta.value);

    if (!productoId || cantidad <= 0) return;

    const producto = productosCache.find((p) => p.id == productoId);
    if (!producto) return;

    const stockDisponible = Number(producto.stock);

    // 🔎 Ver cuánto ya está en carrito
    const cantidadEnCarrito = carrito
      .filter((i) => i.producto_id == productoId)
      .reduce((acc, i) => acc + i.cantidad, 0);

    const nuevaCantidadTotal = cantidadEnCarrito + cantidad;

    if (nuevaCantidadTotal > stockDisponible) {
      alert(`Stock insuficiente. Disponible: ${stockDisponible}`);
      return;
    }

    const precio = Number(producto.precio);

    carrito.push({
      producto_id: producto.id,
      nombre: producto.nombre,
      cantidad,
      precio_unitario: precio,
      subtotal: precio * cantidad,
    });

    productoVenta.value = "";
    cantidadVenta.value = 1;

    renderCarrito();
  });
}

// ==============================
function renderCarrito() {
  carritoBody.innerHTML = "";

  carrito.forEach((item, index) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${item.nombre}</td>
      <td>
        <input type="number" min="1" class="app-input cantidad-carrito" data-index="${index}" value="${item.cantidad}" style="width: 70px; padding: 4px;">
      </td>
      <td>$${item.precio_unitario.toFixed(2)}</td>
      <td>$${item.subtotal.toFixed(2)}</td>
      <td>
        <button data-index="${index}" class="btn-eliminar-item">🗑</button>
      </td>
    `;
    carritoBody.appendChild(fila);
  });

  // Eventos para eliminar productos
  document.querySelectorAll(".btn-eliminar-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      carrito.splice(btn.dataset.index, 1);
      renderCarrito();
    });
  });

  // Eventos para cambiar la cantidad directamente
  document.querySelectorAll(".cantidad-carrito").forEach((input) => {
    input.addEventListener("change", (e) => {
      let nuevaCant = parseInt(e.target.value);
      if (isNaN(nuevaCant) || nuevaCant < 1) {
        nuevaCant = 1;
        e.target.value = 1;
      }
      
      const index = e.target.dataset.index;
      const item = carrito[index];
      
      // Chequeo de stock básico
      const producto = productosCache.find((p) => p.id == item.producto_id);
      if (producto) {
        const stockDisponible = Number(producto.stock);
        const cantidadOtros = carrito
          .filter((i, idx) => i.producto_id == item.producto_id && idx != index)
          .reduce((acc, i) => acc + i.cantidad, 0);
          
        const nuevaCantidadTotal = cantidadOtros + nuevaCant;
        
        if (!ventaEnEdicionId && nuevaCantidadTotal > stockDisponible) {
          alert(`Stock insuficiente. Disponible en total: ${stockDisponible}`);
          nuevaCant = Math.max(1, stockDisponible - cantidadOtros);
          e.target.value = nuevaCant;
        }
      }

      item.cantidad = nuevaCant;
      item.subtotal = item.precio_unitario * nuevaCant;
      renderCarrito(); // Re-render para actualizar subtotales
    });
  });

  calcularTotales();
}

// ==============================
function calcularTotales() {
  const subtotal = carrito.reduce((acc, i) => acc + i.subtotal, 0);
  const descuentoPorc = Number(descuentoVenta.value) || 0;
  const total = subtotal - (subtotal * descuentoPorc) / 100;

  subtotalVenta.textContent = subtotal.toFixed(2);
  totalFinalVenta.textContent = total.toFixed(2);
}

if (descuentoVenta) {
  descuentoVenta.addEventListener("change", calcularTotales);
}

// ==============================
// GUARDAR VENTA
// ==============================
if (formVenta) {
  formVenta?.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (carrito.length === 0) {
      alert("Debe agregar al menos un producto.");
      return;
    }

    const payload = {
      fecha: fechaVenta.value,
      cliente_id: clienteVenta.value,
      metodo_pago: metodoPagoVenta.value,
      descuento_porcentaje: Number(descuentoVenta.value),
      comercio_id: comercioId,
      items: carrito.map((i) => ({
        producto_id: i.producto_id,
        cantidad: i.cantidad,
        precio_unitario: i.precio_unitario,
      })),
    };

    try {
      if (ventaEnEdicionId) {
        await VentasAPI.update(ventaEnEdicionId, payload);
      } else {
        await VentasAPI.create(payload);
      }
    } catch (err) {
      alert(err.message || "Error guardando venta");
      return;
    }

    // 🔹 Reset estado
    ventaEnEdicionId = null;
    clienteVenta.disabled = false;

    modalVenta.style.display = "none";
    limpiarFormulario();
    await cargarVentas();
  });
}

// ==============================
// CARGAR VENTAS
// ==============================
async function cargarVentas() {
  const ventas = await VentasAPI.getAll(comercioId);

  const hoy = new Date();

const ventasHoy = ventas.filter((v) => {
  if (!v.fecha) return false;

  const fecha = new Date(v.fecha);

  return (
    fecha.getFullYear() === hoy.getFullYear() &&
    fecha.getMonth() === hoy.getMonth() &&
    fecha.getDate() === hoy.getDate()
  );
});

  ventasCachePrincipal = ventasHoy;
  ventasCacheModal = ventas;

  renderVentasPrincipal(ventasHoy);
}
// ==============================
function renderVentasPrincipal(lista) {
  tablaVentasBody.innerHTML = "";

  lista.forEach((v) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${formatearFecha(v.fecha)}</td>
      <td>${v.cliente_nombre || "—"}</td>
      <td>$${Number(v.total_bruto).toFixed(2)}</td>
      <td>$${Number(v.descuento_monto).toFixed(2)}</td>
      <td>$${Number(v.total).toFixed(2)}</td>
      <td>${v.metodo_pago || "—"}</td>
      <td>
  <button class="btn-ver-ticket" data-id="${v.id}">Ver</button>
  <button class="btn-editar" data-id="${v.id}">Editar</button>
  <button class="btn-eliminar" data-id="${v.id}">🗑</button>
</td>
    `;
    tablaVentasBody.appendChild(fila);
  });

  activarBotonesEliminar();
  activarBotonesVerTicket();
  activarBotonesEditar();
}

// ==============================
// FILTROS PRINCIPAL
// ==============================
function filtrarPrincipal() {
  let lista = [...ventasCachePrincipal];

  if (buscarVenta?.value) {
    const texto = buscarVenta.value.toLowerCase();
    lista = lista.filter((v) =>
      JSON.stringify(v).toLowerCase().includes(texto),
    );
  }

  renderVentasPrincipal(lista);
}

buscarVenta?.addEventListener("input", filtrarPrincipal);

btnLimpiarFiltros?.addEventListener("click", () => {
  buscarVenta.value = "";
  renderVentasPrincipal(ventasCachePrincipal);
});

// ==============================
// MODAL VER TODAS
// ==============================
if (btnVerVentas) {
  btnVerVentas.addEventListener("click", () => {
    renderVentasModal(ventasCacheModal);
    modalVerVentas.style.display = "flex";
  });
}

if (btnCerrarVer) {
  btnCerrarVer.addEventListener("click", () => {
    modalVerVentas.style.display = "none";
  });
}

function renderVentasModal(lista) {
  tablaVerVentasBody.innerHTML = "";

  lista.forEach((v) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${formatearFecha(v.fecha)}</td>
      <td>${v.cliente_nombre || "—"}</td>
      <td>$${Number(v.total).toFixed(2)}</td>
      <td>${v.metodo_pago || "—"}</td>
      <td>
        <button class="btn-ver-ticket" data-id="${v.id}">Ver</button>
      </td>
    `;
    tablaVerVentasBody.appendChild(fila);
  });

  activarBotonesVerTicket();
}

// ==============================
// FILTROS MODAL
// ==============================
function filtrarModal() {
  let lista = [...ventasCacheModal];

  if (buscarVentaModal?.value) {
    const texto = buscarVentaModal.value.toLowerCase();
    lista = lista.filter((v) =>
      JSON.stringify(v).toLowerCase().includes(texto),
    );
  }

  if (filtroDesdeModal?.value) {
    lista = lista.filter((v) => {
      const d = new Date(v.fecha);
      const local = new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      return local >= filtroDesdeModal.value;
    });
  }

  if (filtroHastaModal?.value) {
    lista = lista.filter((v) => {
      const d = new Date(v.fecha);
      const local = new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      return local <= filtroHastaModal.value;
    });
  }

  renderVentasModal(lista);
}

buscarVentaModal?.addEventListener("input", filtrarModal);
filtroDesdeModal?.addEventListener("change", filtrarModal);
filtroHastaModal?.addEventListener("change", filtrarModal);

btnLimpiarFiltrosModal?.addEventListener("click", () => {
  buscarVentaModal.value = "";
  filtroDesdeModal.value = "";
  filtroHastaModal.value = "";
  renderVentasModal(ventasCacheModal);
});

// ==============================
function activarBotonesEliminar() {
  document.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("¿Eliminar esta venta?")) return;

      try {
        await VentasAPI.delete(btn.dataset.id, comercioId);
        cargarVentas();
      } catch (err) {
        alert("Error eliminando venta");
      }
    });
  });
}

function activarBotonesEditar() {
  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const ventaId = btn.dataset.id;

      const venta = ventasCachePrincipal.find((v) => v.id == ventaId);
      if (!venta) return;

      // 🔹 Limpiar estado previo
      limpiarFormulario();
      ventaEnEdicionId = venta.id;

      // 🔹 Cargar selects
      await cargarClientes();
      await cargarProductos();

      // 🔹 Precargar datos básicos
      const d = new Date(venta.fecha);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = new Date(d - tzOffset).toISOString().slice(0, 10);
      fechaVenta.value = localISOTime;
      fechaVenta.readOnly = true;

      clienteVenta.value = venta.cliente_id;
      clienteVenta.disabled = true;

      metodoPagoVenta.value = venta.metodo_pago;
      descuentoVenta.value = String(parseInt(venta.descuento_porcentaje || 0));

      // 🔹 Traer detalle
      const detalles = await VentasAPI.getDetalle(ventaId);

      carrito = detalles.map((d) => ({
        producto_id: d.producto_id,
        nombre: d.producto_nombre,
        cantidad: d.cantidad,
        precio_unitario: Number(d.precio_unitario),
        subtotal: Number(d.precio_unitario) * Number(d.cantidad),
      }));

      renderCarrito();

      modalVenta.style.display = "flex";
    });
  });
}

// ==============================
function activarBotonesVerTicket() {
  document.querySelectorAll(".btn-ver-ticket").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        const ventaId = btn.dataset.id;

        const venta =
          ventasCacheModal.find((v) => v.id == ventaId) ||
          ventasCachePrincipal.find((v) => v.id == ventaId);

        if (!venta) return;

        const detalles = await VentasAPI.getDetalle(ventaId);

        // Rellenar datos generales
        document.getElementById("ticketId").textContent = venta.id;
        document.getElementById("ticketFecha").textContent = formatearFecha(
          venta.fecha,
        );
        document.getElementById("ticketCliente").textContent =
          venta.cliente_nombre || "-";
        document.getElementById("ticketMetodo").textContent = venta.metodo_pago;
        document.getElementById("ticketTotal").textContent = Number(
          venta.total,
        ).toFixed(2);

        // Rellenar detalle
        const tbody = document.getElementById("ticketDetalleBody");
        tbody.innerHTML = "";

        detalles.forEach((d) => {
          const fila = document.createElement("tr");
          fila.innerHTML = `
            <td>${d.producto_nombre}</td>
            <td>${d.cantidad}</td>
            <td>$${Number(d.subtotal).toFixed(2)}</td>
          `;
          tbody.appendChild(fila);
        });

        // Mostrar modal
        document.getElementById("modalTicket").style.display = "flex";
      } catch (error) {
        console.error("Error obteniendo ticket:", error);
      }
    });
  });
}

const modalTicket = document.getElementById("modalTicket");
const cerrarModalTicket = document.getElementById("cerrarModalTicket");

if (cerrarModalTicket) {
  cerrarModalTicket.addEventListener("click", () => {
    modalTicket.style.display = "none";
  });
}

window.addEventListener("click", (e) => {
  if (e.target === modalTicket) {
    modalTicket.style.display = "none";
  }
});

btnBuscarProducto?.addEventListener("click", () => {
  renderProductosModal(productosCache);
  modalProductos.style.display = "flex";
});

cerrarModalProductos?.addEventListener("click", () => {
  modalProductos.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalProductos) {
    modalProductos.style.display = "none";
  }
});

function renderProductosModal(lista) {
  tablaProductosModalBody.innerHTML = "";

  lista.forEach((p) => {
    if (p.stock > 0) {
      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td>${p.nombre}</td>
        <td>${p.stock}</td>
      `;

      fila.style.cursor = "pointer";

      fila.addEventListener("click", () => {
        productoVenta.value = p.id;
        modalProductos.style.display = "none";
      });

      tablaProductosModalBody.appendChild(fila);
    }
  });
}

buscarProductoModal?.addEventListener("input", () => {
  const texto = buscarProductoModal.value.toLowerCase();

  const filtrados = productosCache.filter((p) =>
    p.nombre.toLowerCase().includes(texto),
  );

  renderProductosModal(filtrados);
});

btnDevolucion?.addEventListener("click", async () => {
  // 🔹 Reset completo
  carritoDevolucion = [];
  ventaSeleccionadaDevolucion = null;

  carritoDevolucionBody.innerHTML = "";
  tablaDetalleVentaBody.innerHTML = "";
  tablaVentasClienteBody.innerHTML = "";
  actualizarTotalDevolucion();

  await cargarClientesDevolucion();

  clienteDevolucion.value = "";

  modalDevolucion.style.display = "flex";
});

cerrarModalDevolucion?.addEventListener("click", () => {
  modalDevolucion.style.display = "none";
});

cerrarModalProductosDevolucion?.addEventListener("click", () => {
  modalProductosDevolucion.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalDevolucion) {
    modalDevolucion.style.display = "none";
  }
  if (e.target === modalProductosDevolucion) {
    modalProductosDevolucion.style.display = "none";
  }
});

async function cargarClientesDevolucion() {
  const clientes = await ClientesAPI.getAll(comercioId);

  clienteDevolucion.innerHTML = `<option value="">Seleccionar cliente</option>`;

  clientes.forEach((c) => {
    clienteDevolucion.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
  });
}

btnBuscarVentasCliente?.addEventListener("click", async () => {
  const clienteId = clienteDevolucion.value;
  if (!clienteId) return;

  const ventas = await VentasAPI.getAll(comercioId);

  const ventasCliente = ventas.filter((v) => v.cliente_id == clienteId);

  renderVentasCliente(ventasCliente);
});

function renderVentasCliente(lista) {
  tablaVentasClienteBody.innerHTML = "";

  if (!lista.length) {
    tablaVentasClienteBody.innerHTML = `<tr><td colspan="4">No hay ventas para este cliente</td></tr>`;
    return;
  }

  lista.forEach((v) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${formatearFecha(v.fecha)}</td>
      <td>$${Number(v.total).toFixed(2)}</td>
      <td>
        <button class="btn-primario btn-seleccionar-venta"
          data-id="${v.id}"
          data-cliente="${v.cliente_id}">
          Seleccionar
        </button>
      </td>
    `;

    tablaVentasClienteBody.appendChild(fila);
  });

  activarSeleccionVenta();
}

function activarSeleccionVenta() {
  document.querySelectorAll(".btn-seleccionar-venta").forEach((btn) => {
    btn.addEventListener("click", async () => {
      ventaSeleccionadaDevolucion = {
        venta_id: btn.dataset.id,
        cliente_id: btn.dataset.cliente,
      };

      await cargarDetalleVentaParaDevolucion(btn.dataset.id);

      modalProductosDevolucion.style.display = "flex";
    });
  });
}

async function cargarDetalleVentaParaDevolucion(ventaId) {
  const detalles = await VentasAPI.getDetalle(ventaId);

  tablaDetalleVentaBody.innerHTML = "";
  carritoDevolucion = [];
  actualizarTotalDevolucion();

  detalles.forEach((d) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${d.producto_nombre}</td>
      <td>${d.cantidad}</td>
      <td>$${Number(d.precio_unitario).toFixed(2)}</td>
      <td>
        <input type="number"
          min="1"
          max="${d.cantidad}"
          value="1"
          style="width:90px; text-align:center"
          class="app-input"
          id="dev-${d.producto_id}">
      </td>
      <td>
        <button class="btn-primario btn-agregar-dev"
          data-id="${d.producto_id}"
          data-nombre="${d.producto_nombre}"
          data-precio="${d.precio_unitario}"
          data-max="${d.cantidad}">
          Agregar
        </button>
      </td>
    `;

    tablaDetalleVentaBody.appendChild(fila);
  });

  activarAgregarProductoDevolucion();
}

function actualizarTotalDevolucion() {
  const total = carritoDevolucion.reduce((acc, item) => acc + item.subtotal, 0);

  totalDevolucionSpan.textContent = total.toFixed(2);
}

function activarAgregarProductoDevolucion() {
  document.querySelectorAll(".btn-agregar-dev").forEach((btn) => {
    btn.addEventListener("click", () => {
      const productoId = btn.dataset.id;
      const nombre = btn.dataset.nombre;
      const precio = Number(btn.dataset.precio);
      const max = Number(btn.dataset.max);

      const inputCantidad = document.getElementById(`dev-${productoId}`);

      const cantidad = Number(inputCantidad.value);

      if (!cantidad || cantidad <= 0) return;

      if (cantidad > max) {
        alert("Cantidad mayor a la vendida");
        return;
      }

      const subtotal = precio * cantidad;

      carritoDevolucion.push({
        producto_id: productoId,
        nombre,
        cantidad,
        precio_unitario: precio,
        subtotal,
      });

      renderCarritoDevolucion();
    });
  });
}

function renderCarritoDevolucion() {
  carritoDevolucionBody.innerHTML = "";

  carritoDevolucion.forEach((item, index) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${item.nombre}</td>
      <td>${item.cantidad}</td>
      <td>$${item.subtotal.toFixed(2)}</td>
      <td>
        <button class="btn-eliminar-item"
          data-index="${index}">
          🗑
        </button>
      </td>
    `;

    carritoDevolucionBody.appendChild(fila);
  });

  document.querySelectorAll(".btn-eliminar-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      carritoDevolucion.splice(btn.dataset.index, 1);
      renderCarritoDevolucion();
    });
  });

  actualizarTotalDevolucion();
}

btnConfirmarDevolucion?.addEventListener("click", async () => {
  if (carritoDevolucion.length === 0) {
    alert("Debe agregar al menos un producto.");
    return;
  }

  const total = carritoDevolucion.reduce((acc, item) => acc + item.subtotal, 0);

  const payload = {
    venta_id: ventaSeleccionadaDevolucion.venta_id,
    cliente_id: ventaSeleccionadaDevolucion.cliente_id,
    comercio_id: comercioId,
    total,
    items: carritoDevolucion,
  };

  try {
    const res = await DevolucionesAPI.create(payload);
    alert("Devolución registrada correctamente");
  } catch (err) {
    alert("Error al guardar devolución");
    return;
  }

  // 🔄 limpiar estado
  carritoDevolucion = [];
  ventaSeleccionadaDevolucion = null;

  carritoDevolucionBody.innerHTML = "";
  tablaDetalleVentaBody.innerHTML = "";
  totalDevolucionSpan.textContent = "0.00";

  modalProductosDevolucion.style.display = "none";
  modalDevolucion.style.display = "none";

  await cargarVentas();
});

btnVerDevoluciones?.addEventListener("click", async () => {
  await cargarDevoluciones();
  modalVerDevoluciones.style.display = "flex";
});

cerrarModalVerDevoluciones?.addEventListener("click", () => {
  modalVerDevoluciones.style.display = "none";
});

async function cargarDevoluciones() {
  const devoluciones = await DevolucionesAPI.getAll(comercioId);

  tablaDevolucionesBody.innerHTML = "";

  devoluciones.forEach((d) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${formatearFecha(d.fecha)}</td>
      <td>${d.cliente_nombre || "—"}</td>
      <td>$${Number(d.total).toFixed(2)}</td>
      <td>
        <button class="btn-ver-ticket btn-ver-devolucion" data-id="${d.id}">
  Ver
</button>
      </td>
    `;

    tablaDevolucionesBody.appendChild(fila);
  });

  activarBotonesVerDevolucion();
}

function activarBotonesVerDevolucion() {
  document.querySelectorAll(".btn-ver-devolucion").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const devolucionId = btn.dataset.id;

      const devoluciones = await DevolucionesAPI.getAll(comercioId);
      const devolucion = devoluciones.find((d) => d.id == devolucionId);

      const detalles = await DevolucionesAPI.getDetalle(devolucionId);

      document.getElementById("ticketDevId").textContent = devolucion.id;
      document.getElementById("ticketDevFecha").textContent = formatearFecha(
        devolucion.fecha,
      );
      document.getElementById("ticketDevCliente").textContent =
        devolucion.cliente_nombre || "-";
      document.getElementById("ticketDevTotal").textContent = Number(
        devolucion.total,
      ).toFixed(2);

      const tbody = document.getElementById("ticketDevDetalleBody");
      tbody.innerHTML = "";

      detalles.forEach((d) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${d.producto_nombre}</td>
            <td>${d.cantidad}</td>
            <td>$${Number(d.subtotal).toFixed(2)}</td>
          `;
        tbody.appendChild(fila);
      });

      modalTicketDevolucion.style.display = "flex";
    });
  });
}

cerrarModalTicketDevolucion?.addEventListener("click", () => {
  modalTicketDevolucion.style.display = "none";
});

// ==============================
function formatearFecha(fechaISO) {
  if (!fechaISO) return "—";

  const fecha = new Date(fechaISO);

  return fecha.toLocaleDateString("es-AR");
}

// ==============================
document.addEventListener("DOMContentLoaded", async () => {
  await cargarComercio();
  if (comercioId) {
    await cargarVentas();
    await cargarProductos();
  }
});
