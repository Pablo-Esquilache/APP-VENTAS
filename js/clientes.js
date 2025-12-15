// ===========================================================
// SESIÓN / COMERCIO
// ===========================================================
const session = JSON.parse(localStorage.getItem("session"));
const firebaseUID = session?.uid; // antes era session?.firebase_uid
let comercioId = session?.comercio_id || null;

const API_BASE = "http://localhost:4000/api";
const API_URL = `${API_BASE}/clientes`;

async function cargarComercio() {
  if (!firebaseUID) return;

  const res = await fetch(`${API_BASE}/comercios/uid/${firebaseUID}`);
  const data = await res.json();
  comercioId = data.id;
}

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

// ===========================================================
// ESTADO
// ===========================================================
let modoEdicion = false;
let clienteEditandoId = null;
let clientes = [];
let localidades = [];

// ===========================================================
// CARGAR CLIENTES (POR COMERCIO)
// ===========================================================
async function cargarClientes() {
  if (!comercioId) return;

  const res = await fetch(`${API_URL}?comercio_id=${comercioId}`);
  clientes = await res.json();

  renderTablaClientes();
  await cargarLocalidades();
}

// ===========================================================
// CARGAR LOCALIDADES (POR COMERCIO)
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
// MODAL
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

        </td>
        </div>
      </tr>
    `;
  });

  document
    .querySelectorAll(".c-btn-edit")
    .forEach((b) =>
      b.addEventListener("click", () => editarCliente(b.dataset.id))
    );

  // document
  //   .querySelectorAll(".c-btn-delete")
  //   .forEach((b) =>
  //     b.addEventListener("click", () => eliminarCliente(b.dataset.id))
  //   );
}

// ===========================================================
// EDITAR / ELIMINAR
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

// async function eliminarCliente(id) {
//   if (!confirm("¿Eliminar cliente?")) return;

//   await fetch(`${API_URL}/${id}?comercio_id=${comercioId}`, {
//     method: "DELETE",
//   });

//   await cargarClientes();
// }

// ===========================================================
// INIT
// ===========================================================
document.addEventListener("DOMContentLoaded", async () => {
  await cargarComercio();
  console.log("comercioId:", comercioId); // debe mostrar un número
  if (comercioId) {
    await cargarClientes();
  } else {
    console.error("No se pudo obtener comercioId");
  }

  // ------------------------------
  // BLOQUEO DE TABS POR ROL
  // ------------------------------
  const session = JSON.parse(localStorage.getItem("session"));
  const role = session?.role;
  const tabReportes = document.getElementById("tab-reportes"); // id del li de reportes

  if (role !== "admin" && tabReportes) {
    tabReportes.style.display = "none"; // usuarios no ven reportes
  }
});

