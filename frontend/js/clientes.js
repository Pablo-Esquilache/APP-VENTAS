import { ComercioAPI, ClientesAPI, HistorialAPI, VentasAPI } from "./api.js";

// ===========================================================
// SESIÓN / COMERCIO
// ===========================================================
const session = JSON.parse(localStorage.getItem("session"));
const firebaseUID = session?.uid;
let comercioId = session?.comercio_id || null;

// ===========================================================
// DOM
// ===========================================================
const buscarCliente = document.getElementById("c-buscar");
const filtroLocalidad = document.getElementById("c-filtro-localidad");
const btnNuevoCliente = document.getElementById("c-btn-nuevo");
const btnLimpiarFiltros = document.getElementById("c-btn-limpiar");

const modalCliente = document.getElementById("app-modal");
const btnCerrarModal = document.querySelector(".app-close");
const tituloModal = document.querySelector(".app-subtitle");

const campoId = document.getElementById("idCliente");
const campoNombre = document.getElementById("nombre");
const campoFechaNacimiento = document.getElementById("fechaNacimiento");
const campoGenero = document.getElementById("genero");
const campoTelefono = document.getElementById("telefono");
const campoEmail = document.getElementById("email");
const campoLocalidad = document.getElementById("localidad");
const campoNuevaLocalidad = document.getElementById("nuevaLocalidad");
const campoComentarios = document.getElementById("comentarios");
const btnNuevaLocalidad = document.getElementById("btnNuevaLocalidad");

const tablaClientesBody = document.getElementById("tablaClientes");

const modalDetalle = document.getElementById("app-modal-detalle");
const tablaDetalleBody = document.getElementById("tablaDetalleBody");
const detalleTotal = document.getElementById("detalleTotal");
const btnCerrarDetalle = document.querySelector(".app-close-detalle");

// ---- Modal Historial
const modalHistorial = document.getElementById("app-modal-historial");
const tablaHistorialBody = document.getElementById("tablaHistorialBody");
const btnCerrarHistorial = document.querySelector(".app-close-historial");
let historialActual = [];
let clienteActualHistorial = null;

const modalCC = document.getElementById("app-modal-cc");
const tablaCC = document.getElementById("tablaCuentaCorriente");
const ccSaldo = document.getElementById("ccSaldo");
const ccRegistrarPago = document.getElementById("ccRegistrarPago");
const ccMontoPago = document.getElementById("ccMontoPago");
const btnCerrarCC = document.querySelector(".app-close-cc");

let clienteActualCC = null;

// ===========================================================
// ESTADO
// ===========================================================
let modoEdicion = false;
let clienteEditandoId = null;
let clientes = [];
let localidades = [];
let detalleActual = [];
let ventaActualDetalle = null;

// ===========================================================
// HELPERS
// ===========================================================
function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;

  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();

  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad;
}

// ===========================================================
// CARGAR COMERCIO
// ===========================================================
async function cargarComercio() {
  if (!firebaseUID) return;

  const data = await ComercioAPI.getByUid(firebaseUID);
  comercioId = data.id;
}

// ===========================================================
// CARGAR CLIENTES
// ===========================================================
async function cargarClientes() {
  if (!comercioId) return;

  clientes = await ClientesAPI.getAll(comercioId);

  renderTablaClientes();
  await cargarLocalidades();
}

// ===========================================================
// CARGAR LOCALIDADES
// ===========================================================
async function cargarLocalidades() {
  if (!comercioId) return;

  localidades = await ClientesAPI.getLocalidades(comercioId);

  filtroLocalidad.innerHTML = `<option value="">Todas las localidades</option>`;
  campoLocalidad.innerHTML = `<option value="">Seleccionar localidad</option>`;

  localidades.forEach((loc) => {
    filtroLocalidad.innerHTML += `<option value="${loc}">${loc}</option>`;
    campoLocalidad.innerHTML += `<option value="${loc}">${loc}</option>`;
  });
}

// ===========================================================
// MODAL CLIENTE
// ===========================================================
btnNuevoCliente.addEventListener("click", () => {
  modoEdicion = false;
  clienteEditandoId = null;
  tituloModal.textContent = "Nuevo cliente";
  limpiarFormulario();
  mostrarInputNuevaLocalidad(false);

  document.getElementById("fila-id-cliente").style.display = "none";
  modalCliente.style.display = "flex";
});

btnCerrarModal.addEventListener("click", () => {
  modalCliente.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalCliente) modalCliente.style.display = "none";
});

// ===========================================================
// FORM
// ===========================================================
function limpiarFormulario() {
  campoId.value = "";
  campoNombre.value = "";
  campoFechaNacimiento.value = "";
  campoGenero.value = "";
  campoTelefono.value = "";
  campoEmail.value = "";
  campoLocalidad.value = "";
  campoNuevaLocalidad.value = "";
  campoComentarios.value = "";
}

function mostrarInputNuevaLocalidad(mostrar) {
  if (mostrar) {
    campoNuevaLocalidad.style.display = "block";
    campoLocalidad.style.display = "none";
  } else {
    campoNuevaLocalidad.style.display = "none";
    campoLocalidad.style.display = "inline-block";
    campoNuevaLocalidad.value = "";
  }
}

btnNuevaLocalidad.addEventListener("click", () =>
  mostrarInputNuevaLocalidad(true),
);

// ===========================================================
// GUARDAR CLIENTE
// ===========================================================
document.getElementById("formCliente").addEventListener("submit", async (e) => {
  e.preventDefault();

  const localidadFinal =
    campoNuevaLocalidad.value.trim() || campoLocalidad.value;

  const data = {
    nombre: campoNombre.value.trim(),
    fecha_nacimiento: campoFechaNacimiento.value || null,
    genero: campoGenero.value || "",
    telefono: campoTelefono.value.trim() || "",
    email: campoEmail.value.trim() || "",
    localidad: localidadFinal || "",
    comentarios: campoComentarios.value.trim() || "",
    comercio_id: comercioId,
  };

  try {
    if (!modoEdicion) {
      await ClientesAPI.create(data);
    } else {
      await ClientesAPI.update(clienteEditandoId, data);
    }
  } catch (err) {
    alert(err.message || "Error al guardar el cliente.");
  }

  modalCliente.style.display = "none";
  await cargarClientes();
});

// ===========================================================
// FILTROS
// ===========================================================
buscarCliente.addEventListener("input", renderTablaClientes);
filtroLocalidad.addEventListener("change", renderTablaClientes);

btnLimpiarFiltros.addEventListener("click", () => {
  buscarCliente.value = "";
  filtroLocalidad.value = "";
  renderTablaClientes();
});

// ===========================================================
// TABLA
// ===========================================================
function renderTablaClientes() {
  const texto = buscarCliente.value.toLowerCase();
  const localidadSeleccionada = filtroLocalidad.value;

  const filtrados = clientes.filter((c) => {
    const okNombre = c.nombre.toLowerCase().includes(texto);
    const okLocalidad =
      !localidadSeleccionada || c.localidad === localidadSeleccionada;
    return okNombre && okLocalidad;
  });

  tablaClientesBody.innerHTML = "";

  filtrados.forEach((c) => {
    tablaClientesBody.innerHTML += `
      <tr>
        <td class="cliente-nombre-cell">
          <button class="btn-nombre-cliente" onclick="verHistorialCliente(${c.id}, '${escapeQuote(c.nombre)}')">
            ${c.nombre}
          </button>
        </td>
        <td>${calcularEdad(c.fecha_nacimiento) ?? "-"}</td>
        <td>${c.genero || "-"}</td>
        <td>${c.telefono || "-"}</td>
        <td>${c.email || "-"}</td>
        <td>${c.localidad || "-"}</td>
        <td>${c.comentarios || "-"}</td>
        <td>
          <div class="acciones-clientes">
            <button class="btn-editar" data-id="${c.id}">Editar</button>
            <button class="app-btn-historial only-admin" data-id="${c.id}">
              Historial
            </button>
            ${Math.abs(Number(c.saldo || 0)) > 0.01 ? '<span class="cc-dot"></span>' : ""}
          </div>
        </td>
      </tr>
    `;
  });

  document
    .querySelectorAll(".btn-editar")
    .forEach((b) =>
      b.addEventListener("click", () => editarCliente(b.dataset.id)),
    );

  document
    .querySelectorAll(".app-btn-historial")
    .forEach((b) =>
      b.addEventListener("click", () => verHistorial(b.dataset.id)),
    );
}

// ===========================================================
// EDITAR CLIENTE
// ===========================================================
function editarCliente(id) {
  const c = clientes.find((x) => x.id == id);
  if (!c) return;

  modoEdicion = true;
  clienteEditandoId = id;

  tituloModal.textContent = "Editar cliente";
  document.getElementById("fila-id-cliente").style.display = "block";

  campoId.value = c.id;
  campoNombre.value = c.nombre;
  if (c.fecha_nacimiento) {
    const d = new Date(c.fecha_nacimiento);
    campoFechaNacimiento.value = new Date(d - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  } else {
    campoFechaNacimiento.value = "";
  }
  campoGenero.value = c.genero ?? "";
  campoTelefono.value = c.telefono ?? "";
  campoEmail.value = c.email ?? "";

  if (localidades.includes(c.localidad)) {
    mostrarInputNuevaLocalidad(false);
    campoLocalidad.value = c.localidad;
  } else {
    mostrarInputNuevaLocalidad(true);
    campoNuevaLocalidad.value = c.localidad;
  }

  campoComentarios.value = c.comentarios ?? "";
  modalCliente.style.display = "flex";
}

// ===========================================================
// HISTORIAL CLIENTE
// ===========================================================

async function verHistorial(clienteId) {
  const role = session?.role;

  if (role !== "admin") {
    alert("No tenés permisos para ver el historial");
    return;
  }

  tablaHistorialBody.innerHTML =
    "<tr><td colspan='5'>Cargando...</td></tr>";

  try {
    // 1️⃣ Traer historial de ventas
    const data = await HistorialAPI.getVentasPorCliente(
      clienteId,
      comercioId,
    );

    historialActual = data;
    clienteActualHistorial = clienteId;

    // 2️⃣ Traer saldo real de cuenta corriente
    const dataSaldo = await ClientesAPI.getSaldo(clienteId, comercioId);
    const saldo = Number(dataSaldo.saldo);

    // 3️⃣ Render
    tablaHistorialBody.innerHTML = "";

    if (!data.length) {
      tablaHistorialBody.innerHTML =
        "<tr><td colspan='5'>Sin compras registradas</td></tr>";
    } else {
      let totalGeneral = 0;
      let totalContado = 0;

      data.forEach((v) => {
        const totalVenta = Number(v.total);

        totalGeneral += totalVenta;

        if (v.metodo_pago !== "Cuenta Corriente") {
          totalContado += totalVenta;
        }

        tablaHistorialBody.innerHTML += `
          <tr>
            <td>${formatearFecha(v.fecha)}</td>
            <td>${v.metodo_pago}</td>
            <td>$${totalVenta.toFixed(2)}</td>
            <td>
              <button class="btn-ver-detalle" data-id="${v.id}">
                Ver detalle
              </button>
            </td>
          </tr>
        `;
      });

      document.getElementById("resumenHistorial").innerHTML = `
  <div class="resumen-item">
    <span>Total contado</span>
    <strong>$${totalContado.toFixed(2)}</strong>
  </div>
  <div class="resumen-item">
    <span>Saldo cuenta corriente</span>
    <strong>$${saldo.toFixed(2)}</strong>
  </div>
  <div class="resumen-item">
    <span>Total general ventas</span>
    <strong>$${totalGeneral.toFixed(2)}</strong>
  </div>
`;

      document
        .querySelectorAll(".btn-ver-detalle")
        .forEach((b) =>
          b.addEventListener("click", () =>
            verDetalleVenta(b.dataset.id)
          )
        );
    }

    modalHistorial.style.display = "flex";
  } catch (error) {
    console.error(error);
    tablaHistorialBody.innerHTML =
      "<tr><td colspan='5'>Error inesperado</td></tr>";
  }
}

async function verDetalleVenta(ventaId) {
  try {
    const data = await VentasAPI.getDetalle(ventaId);
    
    // Obtenemos info del historial para mostrar en cabecera
    const infoVenta = historialActual.find((v) => v.id == ventaId);

    if (infoVenta) {
      document.getElementById("ticketIdDetalle").textContent = infoVenta.id;
      document.getElementById("ticketFechaDetalle").textContent = formatearFecha(infoVenta.fecha);
      document.getElementById("ticketMetodoDetalle").textContent = infoVenta.metodo_pago;
    }

    tablaDetalleBody.innerHTML = "";
    let total = 0;

    if (!data.length) {
      tablaDetalleBody.innerHTML =
        "<tr><td colspan='4'>Sin detalle disponible</td></tr>";
    } else {
      data.forEach((item) => {
        total += Number(item.subtotal);

        tablaDetalleBody.innerHTML += `
          <tr>
            <td>${item.producto_nombre || "-"}</td>
            <td>${item.cantidad}</td>
            <td>$${Number(item.precio_unitario).toFixed(2)}</td>
            <td>$${Number(item.subtotal).toFixed(2)}</td>
          </tr>
        `;
      });
    }

    detalleActual = data;
    ventaActualDetalle = ventaId;

    detalleTotal.textContent = total.toFixed(2);

    modalDetalle.style.display = "flex";
  } catch (error) {
    console.error(error);
    alert("Error inesperado al cargar el detalle");
  }
}

document
  .getElementById("btnDescargarHistorial")
  .addEventListener("click", () => {
    if (!historialActual.length) {
      alert("No hay datos para exportar");
      return;
    }

    const dataExcel = historialActual.map((v) => ({
      Fecha: formatearFecha(v.fecha),
      "ID Venta": v.id,
      "Método de Pago": v.metodo_pago,
      Total: Number(v.total),
    }));

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historial");

    XLSX.writeFile(wb, `historial_cliente_${clienteActualHistorial}.xlsx`);
  });

document.getElementById("btnDescargarDetalle").addEventListener("click", () => {
  if (!detalleActual.length) {
    alert("No hay detalle para exportar");
    return;
  }

  const dataExcel = detalleActual.map((item) => ({
    Producto: item.producto_nombre,
    Cantidad: item.cantidad,
    "Precio Unitario": Number(item.precio_unitario),
    Subtotal: Number(item.subtotal),
  }));

  const ws = XLSX.utils.json_to_sheet(dataExcel);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Detalle");

  XLSX.writeFile(wb, `detalle_venta_${ventaActualDetalle}.xlsx`);
});

btnCerrarHistorial.addEventListener("click", () => {
  modalHistorial.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalHistorial) modalHistorial.style.display = "none";
});

btnCerrarDetalle.addEventListener("click", () => {
  modalDetalle.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalDetalle) modalDetalle.style.display = "none";
});

document
  .getElementById("btnCuentaCorriente")
  .addEventListener("click", async () => {
    clienteActualCC = clienteActualHistorial;

    await cargarCuentaCorriente(clienteActualCC);

    modalCC.style.display = "flex";
  });

async function cargarCuentaCorriente(clienteId) {
  const dataSaldo = await ClientesAPI.getSaldo(clienteId, comercioId);
  const saldo = dataSaldo.saldo;

  ccSaldo.textContent = `Saldo: $${saldo.toFixed(2)}`;
  ccSaldo.style.color = saldo > 0 ? "red" : "lime";

  const movimientos = await ClientesAPI.getCuentaCorriente(
    clienteId,
    comercioId,
  );

  tablaCC.innerHTML = "";

  movimientos.forEach((m) => {
    tablaCC.innerHTML += `
      <tr>
        <td>${formatearFecha(m.created_at)}</td>
        <td>${m.tipo}</td>
        <td>${m.tipo === "venta" ? "+" : "-"}$${Number(m.monto).toFixed(2)}</td>
      </tr>
    `;
  });
}

ccRegistrarPago.addEventListener("click", async () => {
  const monto = Number(ccMontoPago.value);

  if (!monto || monto <= 0) {
    alert("Monto inválido");
    return;
  }

  try {
    await ClientesAPI.registrarPago(clienteActualCC, {
      comercio_id: comercioId,
      monto,
    });
  } catch (error) {
    alert(error.message || "Error al registrar pago");
    return;
  }

  ccMontoPago.value = "";

  await cargarCuentaCorriente(clienteActualCC);
  await verHistorial(clienteActualCC);
  await cargarClientes();
});

btnCerrarCC.addEventListener("click", () => {
  modalCC.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalCC) {
    modalCC.style.display = "none";
  }
});

function formatearFecha(fechaISO) {
  if (!fechaISO) return "—";

  const fecha = new Date(fechaISO);

  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const año = fecha.getFullYear();

  return `${dia}/${mes}/${año}`;
}

// ===========================================================
// INIT
// ===========================================================
document.addEventListener("DOMContentLoaded", async () => {
  await cargarComercio();

  if (comercioId) {
    await cargarClientes();
  } else {
    console.error("No se pudo obtener comercioId");
  }
});

function escapeQuote(str) {
  if (!str) return "";
  return str.replace(/'/g, "\\'");
}
