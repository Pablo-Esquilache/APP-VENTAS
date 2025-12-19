// ===========================================================
// SESIÓN / COMERCIO
// ===========================================================
const session = JSON.parse(localStorage.getItem("session"));
const firebaseUID = session?.uid;
// const role = session?.role;
let comercioId = session?.comercio_id || null;

const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:4000/api"
    : "https://app-ventas-gvdk.onrender.com/api";

const API_URL = `${API_BASE}/clientes`;

// ===========================================================
// DOM
// ===========================================================
const buscarCliente = document.getElementById("c-buscar");
const filtroLocalidad = document.getElementById("c-filtro-localidad");
const btnNuevoCliente = document.getElementById("c-btn-nuevo");
const btnLimpiarFiltros = document.getElementById("c-btn-limpiar");

const modalCliente = document.getElementById("c-modal");
const btnCerrarModal = document.querySelector(".c-close");
const tituloModal = document.querySelector(".c-subtitle");

const campoId = document.getElementById("idCliente");
const campoNombre = document.getElementById("nombre");
const campoEdad = document.getElementById("edad");
const campoGenero = document.getElementById("genero");
const campoTelefono = document.getElementById("telefono");
const campoEmail = document.getElementById("email");
const campoLocalidad = document.getElementById("localidad");
const campoNuevaLocalidad = document.getElementById("nuevaLocalidad");
const campoComentarios = document.getElementById("comentarios");
const btnNuevaLocalidad = document.getElementById("btnNuevaLocalidad");

const tablaClientesBody = document.getElementById("tablaClientes");

// ---- Modal Historial
const modalHistorial = document.getElementById("c-modal-historial");
const tablaHistorialBody = document.getElementById("tablaHistorialBody");
const btnCerrarHistorial = document.querySelector(".c-close-historial");

// ===========================================================
// ESTADO
// ===========================================================
let modoEdicion = false;
let clienteEditandoId = null;
let clientes = [];
let localidades = [];

// ===========================================================
// CARGAR COMERCIO
// ===========================================================
async function cargarComercio() {
  if (!firebaseUID) return;

  const res = await fetch(`${API_BASE}/comercios/uid/${firebaseUID}`);
  const data = await res.json();
  comercioId = data.id;
}

// ===========================================================
// CARGAR CLIENTES
// ===========================================================
async function cargarClientes() {
  if (!comercioId) return;

  const res = await fetch(`${API_URL}?comercio_id=${comercioId}`);
  clientes = await res.json();

  renderTablaClientes();
  await cargarLocalidades();
}

// ===========================================================
// CARGAR LOCALIDADES
// ===========================================================
async function cargarLocalidades() {
  if (!comercioId) return;

  const res = await fetch(
    `${API_URL}/localidades/lista?comercio_id=${comercioId}`
  );
  localidades = await res.json();

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
  campoEdad.value = "";
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
  mostrarInputNuevaLocalidad(true)
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
    edad: campoEdad.value ? parseInt(campoEdad.value) : null,
    genero: campoGenero.value || "",
    telefono: campoTelefono.value.trim() || "",
    email: campoEmail.value.trim() || "",
    localidad: localidadFinal || "",
    comentarios: campoComentarios.value.trim() || "",
    comercio_id: comercioId,
  };

  if (!modoEdicion) {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } else {
    await fetch(`${API_URL}/${clienteEditandoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
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
        <td>${c.id}</td>
        <td>${c.nombre}</td>
        <td>${c.edad ?? "-"}</td>
        <td>${c.genero || "-"}</td>
        <td>${c.telefono || "-"}</td>
        <td>${c.email || "-"}</td>
        <td>${c.localidad || "-"}</td>
        <td>${c.comentarios || "-"}</td>
        <td>
          <div class="acciones-clientes">
  <button class="c-btn-edit" data-id="${c.id}">Editar</button>
  <button class="c-btn-historial only-admin" data-id="${c.id}">
    Historial
  </button>
</div>
        </td>
      </tr>
    `;
  });

  document
    .querySelectorAll(".c-btn-edit")
    .forEach((b) =>
      b.addEventListener("click", () => editarCliente(b.dataset.id))
    );

  document
    .querySelectorAll(".c-btn-historial")
    .forEach((b) =>
      b.addEventListener("click", () => verHistorial(b.dataset.id))
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
  campoEdad.value = c.edad ?? "";
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

function formatearFecha(fechaISO) {
  return new Date(fechaISO).toLocaleDateString("es-AR");
}

async function verHistorial(clienteId) {
  tablaHistorialBody.innerHTML =
    "<tr><td colspan='4'>Cargando...</td></tr>";

  const res = await fetch(
    `${API_BASE}/clientes/${clienteId}/historial?comercio_id=${comercioId}`
  );

  const data = await res.json();
  tablaHistorialBody.innerHTML = "";

  if (!data.length) {
    tablaHistorialBody.innerHTML =
      "<tr><td colspan='4'>Sin compras registradas</td></tr>";
  } else {
    let totalGeneral = 0;

    data.forEach((v) => {
      totalGeneral += Number(v.total) || 0;

      tablaHistorialBody.innerHTML += `
        <tr>
          <td>${formatearFecha(v.fecha)}</td>
          <td>${v.producto}</td>
          <td>${v.cantidad}</td>
          <td>$${v.total}</td>
        </tr>
      `;
    });

    // Fila de total general
    tablaHistorialBody.innerHTML += `
      <tr class="fila-total-historial">
        <td colspan="3"><strong>Total</strong></td>
        <td><strong>$${totalGeneral.toFixed(2)}</strong></td>
      </tr>
    `;
  }

  modalHistorial.style.display = "flex";
}

btnCerrarHistorial.addEventListener("click", () => {
  modalHistorial.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalHistorial) modalHistorial.style.display = "none";
});

// ===========================================================
// INIT
// ===========================================================
document.addEventListener("DOMContentLoaded", async () => {
  await cargarComercio();
  console.log("comercioId:", comercioId);
  if (comercioId) {
    await cargarVentas();
  } else {
    console.error("No se pudo obtener comercioId");
  }

  // ------------------------------
  // BLOQUEO DE TABS POR ROL
  // ------------------------------
  const role = session?.role;
  const tabReportes = document.getElementById("tab-reportes");

  if (role !== "admin" && tabReportes) {
    tabReportes.style.display = "none";
  }
});



