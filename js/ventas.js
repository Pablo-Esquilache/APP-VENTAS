// ventas.js

// ------------------------------
// API BASE
// ------------------------------
const API_URL = "http://localhost:4000/api";

// ------------------------------
// SESIÓN / COMERCIO
// ------------------------------
const session = JSON.parse(localStorage.getItem("session"));
const firebaseUID = session?.firebase_uid;
let comercioId = null;

async function cargarComercio() {
  if (!firebaseUID) return;

  const res = await fetch(`${API_URL}/comercios/uid/${firebaseUID}`);
  const data = await res.json();
  comercioId = data.id;
}

// ------------------------------
// REFERENCIAS DEL DOM
// ------------------------------
const btnNuevaVenta = document.getElementById("btnNuevaVenta");
const modalVenta = document.getElementById("modalVenta");
const btnCerrarModal = document.querySelector(".v-close");

const fechaVenta = document.getElementById("fechaVenta");
const clienteVenta = document.getElementById("clienteVenta");
const productoVenta = document.getElementById("productoVenta");
const cantidadVenta = document.getElementById("cantidadVenta");
const descuentoVenta = document.getElementById("descuentoVenta");
const metodoPagoVenta = document.getElementById("metodoPagoVenta");
const totalVenta = document.getElementById("totalVenta");

// tabla principal
const tablaVentasBody = document.getElementById("tablaVentasBody");
const formVenta = document.querySelector(".v-form-venta");

// modal ver
const btnVerVentas = document.getElementById("btnVerVentas");
const modalVerVentas = document.getElementById("modalVerVentas");
const btnCerrarVer = document.querySelector(".v-close-ver");
const tablaVerVentasBody = document.getElementById("tablaVerVentasBody");

// FILTROS PRINCIPALES
const buscarVenta = document.getElementById("buscarVenta");
const filtroDesde = document.getElementById("filtroDesde");
const filtroHasta = document.getElementById("filtroHasta");

// ------------------------------
// ESTADO
// ------------------------------
let precioActual = 0;
let isEditing = false;
let editingId = null;
let ventasCache = [];

// ------------------------------
// ABRIR MODAL NUEVA
// ------------------------------
btnNuevaVenta.addEventListener("click", () => {
  isEditing = false;
  editingId = null;
  document.getElementById("tituloModalVenta").textContent = "Registrar venta";
  cambiarTextoBotonGuardar("Guardar venta");
  limpiarFormulario();

  cargarClientes();
  cargarProductos();

  modalVenta.style.display = "flex";
});

// ------------------------------
// CERRAR MODAL
// ------------------------------
btnCerrarModal.addEventListener("click", () => {
  modalVenta.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalVenta) modalVenta.style.display = "none";
});

// ------------------------------
// LIMPIAR FORM
// ------------------------------
function limpiarFormulario() {
  fechaVenta.value = "";
  clienteVenta.value = "";
  productoVenta.value = "";
  cantidadVenta.value = 1;
  descuentoVenta.value = 0;
  metodoPagoVenta.value = "";
  totalVenta.value = "";
  precioActual = 0;
}

// ------------------------------
function cambiarTextoBotonGuardar(txt) {
  const btn = formVenta.querySelector('button[type="submit"]');
  if (btn) btn.textContent = txt;
}

// ------------------------------
// CALCULAR TOTAL
// ------------------------------
cantidadVenta.addEventListener("input", calcularTotal);
descuentoVenta.addEventListener("change", calcularTotal);
productoVenta.addEventListener("change", calcularTotal);

async function calcularTotal() {
  const productoId = productoVenta.value;
  const cantidad = Number(cantidadVenta.value) || 1;
  const descuento = Number(descuentoVenta.value) || 0;

  if (!productoId) {
    totalVenta.value = "";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/productos/${productoId}`);
    const data = await res.json();

    precioActual = Number(data.precio);
    const subtotal = precioActual * cantidad;
    const descuentoAplicado = subtotal * (descuento / 100);
    const total = subtotal - descuentoAplicado;

    totalVenta.value = total.toFixed(2);
  } catch (error) {
    console.error("Error obteniendo precio:", error);
  }
}

// ------------------------------
// CARGAR CLIENTES
// ------------------------------
async function cargarClientes() {
  try {
    const res = await fetch(`${API_URL}/clientes?comercio_id=${comercioId}`);
    const clientes = await res.json();

    clienteVenta.innerHTML = `<option value="">Seleccionar cliente</option>`;
    clientes.forEach((c) => {
      clienteVenta.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
    });
  } catch (error) {
    console.error("Error cargando clientes:", error);
  }
}

// ------------------------------
// CARGAR PRODUCTOS
// ------------------------------
async function cargarProductos() {
  try {
    const res = await fetch(`${API_URL}/productos?comercio_id=${comercioId}`);
    const productos = await res.json();

    productoVenta.innerHTML = `<option value="">Seleccionar producto</option>`;
    productos.forEach((p) => {
      productoVenta.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
    });
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

// ------------------------------
// CARGAR TABLA PRINCIPAL
// ------------------------------
async function cargarVentas() {
  try {
    const res = await fetch(`${API_URL}/ventas?comercio_id=${comercioId}`);
    let ventas = await res.json();

    ventas = ventas.sort((a, b) => b.id - a.id);
    ventasCache = ventas;

    renderVentasPrincipal(ventas);
  } catch (error) {
    console.error("Error al cargar ventas:", error);
  }
}

function renderVentasPrincipal(lista) {
  tablaVentasBody.innerHTML = "";

  lista.forEach((v) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${v.id}</td>
      <td>${formatearFecha(v.fecha)}</td>
      <td>${v.cliente_nombre || "—"}</td>
      <td>${v.producto_nombre || "—"}</td>
      <td>$${Number(v.precio).toFixed(2)}</td>
      <td>${v.cantidad}</td>
      <td>${parseInt(v.descuento)}%</td>
      <td>${v.metodo_pago || "—"}</td>
      <td>$${Number(v.total).toFixed(2)}</td>
      <td>
        <div class="acciones-venta">
          <button class="btn-editar" data-id="${v.id}">Editar</button>
          <button class="btn-eliminar" data-id="${v.id}">Eliminar</button>
        </div>
      </td>
    `;

    tablaVentasBody.appendChild(fila);
  });

  activarBotonesAccion();
}

// ------------------------------
// ACCIONES EDITAR/ELIMINAR
// ------------------------------
function activarBotonesAccion() {
  document.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!confirm("¿Eliminar esta venta?")) return;

      await fetch(`${API_URL}/ventas/${id}`, { method: "DELETE" });
      cargarVentas();
    });
  });

  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", () => abrirModalEdicion(btn.dataset.id));
  });
}

// ------------------------------
// ABRIR EDICIÓN
// ------------------------------
async function abrirModalEdicion(id) {
  const res = await fetch(`${API_URL}/ventas/${id}`);
  const venta = await res.json();

  isEditing = true;
  editingId = id;

  document.getElementById("tituloModalVenta").textContent = "Editar venta";
  cambiarTextoBotonGuardar("Guardar cambios");

  await cargarClientes();
  await cargarProductos();

  fechaVenta.value = venta.fecha?.split("T")[0] || "";
  clienteVenta.value = venta.cliente_id || "";
  productoVenta.value = venta.producto_id || "";
  cantidadVenta.value = venta.cantidad || 1;
  descuentoVenta.value = venta.descuento || 0;
  metodoPagoVenta.value = venta.metodo_pago || "";

  await calcularTotal();

  modalVenta.style.display = "flex";
}

// ------------------------------
// GUARDAR (POST/PUT)
// ------------------------------
formVenta.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    fecha: fechaVenta.value,
    cliente_id: clienteVenta.value,
    producto_id: productoVenta.value,
    cantidad: Number(cantidadVenta.value),
    precio: precioActual,
    descuento: Number(descuentoVenta.value),
    metodo_pago: metodoPagoVenta.value,
    comercio_id: comercioId,
  };

  if (isEditing) {
    await fetch(`${API_URL}/ventas/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } else {
    await fetch(`${API_URL}/ventas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  modalVenta.style.display = "none";
  limpiarFormulario();
  cargarVentas();
});

// ------------------------------
// FILTRO PRINCIPAL
// ------------------------------
function filtrarPrincipal() {
  let lista = [...ventasCache];

  const txt = buscarVenta.value.toLowerCase();
  const desde = filtroDesde.value;
  const hasta = filtroHasta.value;

  if (txt)
    lista = lista.filter((v) => JSON.stringify(v).toLowerCase().includes(txt));
  if (desde) lista = lista.filter((v) => v.fecha >= desde);
  if (hasta) lista = lista.filter((v) => v.fecha <= hasta);

  renderVentasPrincipal(lista);
}

buscarVenta.addEventListener("input", filtrarPrincipal);
filtroDesde.addEventListener("change", filtrarPrincipal);
filtroHasta.addEventListener("change", filtrarPrincipal);

// ------------------------------
// MODAL VER TODAS
// ------------------------------
btnVerVentas.addEventListener("click", async () => {
  const res = await fetch(`${API_URL}/ventas?comercio_id=${comercioId}`);
  const ventas = await res.json();
  renderVentasModal(ventas);
  modalVerVentas.style.display = "flex";
});

btnCerrarVer.addEventListener("click", () => {
  modalVerVentas.style.display = "none";
});

function renderVentasModal(lista) {
  tablaVerVentasBody.innerHTML = "";

  lista.forEach((v) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${v.id}</td>
      <td>${formatearFecha(v.fecha)}</td>
      <td>${v.cliente_nombre || "—"}</td>
      <td>${v.producto_nombre || "—"}</td>
      <td>$${Number(v.total).toFixed(2)}</td>
      <td>${v.metodo_pago || "—"}</td>
    `;
    tablaVerVentasBody.appendChild(fila);
  });
}

// ------------------------------
function formatearFecha(fechaISO) {
  return new Date(fechaISO).toLocaleDateString("es-AR");
}

// ------------------------------
// LIMPIAR FILTROS
// ------------------------------
const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");

btnLimpiarFiltros.addEventListener("click", () => {
  buscarVenta.value = "";
  filtroDesde.value = "";
  filtroHasta.value = "";

  renderVentasPrincipal(ventasCache);
});

// ------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  await cargarComercio();
  await cargarVentas();
});
