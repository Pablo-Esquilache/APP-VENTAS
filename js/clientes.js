// ===========================================================
// DOM
// ===========================================================
const buscarCliente = document.getElementById("c-buscar");
const filtroLocalidad = document.getElementById("c-filtro-localidad");
const btnNuevoCliente = document.getElementById("c-btn-nuevo");

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
const campoComentarios = document.getElementById("comentarios");

const tablaClientesBody = document.getElementById("tablaClientes");

// ===========================================================
// ESTADO
// ===========================================================
let modoEdicion = false;
let clienteEditandoId = null;

// API
const API_URL = "http://localhost:4000/api/clientes";

let clientes = [];
let localidades = [];

// ===========================================================
// CARGAR CLIENTES
// ===========================================================
async function cargarClientes() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    clientes = Array.isArray(data) ? data : [];
    renderTablaClientes();
    await cargarLocalidades(); // actualizar select dinámicamente
  } catch (error) {
    console.error("Error cargando clientes:", error);
    clientes = [];
    renderTablaClientes();
  }
}

// ===========================================================
// CARGAR LOCALIDADES DESDE DB
// ===========================================================
async function cargarLocalidades() {
  try {
    const res = await fetch(`${API_URL}/localidades/lista`);
    const data = await res.json();
    localidades = Array.isArray(data) ? data : [];

    // Limpiar select y agregar opción por defecto
    filtroLocalidad.innerHTML = `<option value="">Todas las localidades</option>`;

    localidades.forEach((loc) => {
      const op = document.createElement("option");
      op.value = loc;
      op.textContent = loc;
      filtroLocalidad.appendChild(op);
    });
  } catch (error) {
    console.error("Error cargando localidades:", error);
    localidades = [];
  }
}

// ===========================================================
// ABRIR/CERRAR MODAL
// ===========================================================
btnNuevoCliente.addEventListener("click", () => {
  modoEdicion = false;
  clienteEditandoId = null;

  tituloModal.textContent = "Nuevo cliente";
  limpiarFormulario();
  modalCliente.style.display = "block";
});

btnCerrarModal.addEventListener("click", () => {
  modalCliente.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalCliente) modalCliente.style.display = "none";
});

// ===========================================================
// LIMPIAR FORMULARIO
// ===========================================================
function limpiarFormulario() {
  campoId.value = "";
  campoNombre.value = "";
  campoEdad.value = "";
  campoGenero.value = "";
  campoTelefono.value = "";
  campoEmail.value = "";
  campoLocalidad.value = "";
  campoComentarios.value = "";
}

// ===========================================================
// GUARDAR CLIENTE (POST / PUT)
// ===========================================================
document.getElementById("formCliente").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nombre: campoNombre.value.trim(),
    edad: campoEdad.value ? parseInt(campoEdad.value) : null,
    genero: campoGenero.value || "",
    telefono: campoTelefono.value.trim() || "",
    email: campoEmail.value.trim() || "",
    localidad: campoLocalidad.value.trim() || "",
    comentarios: campoComentarios.value.trim() || "",
  };

  try {
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
  } catch (error) {
    console.error("Error guardando cliente:", error);
  }

  modalCliente.style.display = "none";

  await cargarClientes();
});

// ===========================================================
// BUSCAR / FILTRAR
// ===========================================================
buscarCliente.addEventListener("input", renderTablaClientes);
filtroLocalidad.addEventListener("change", renderTablaClientes);

// ===========================================================
// RENDER TABLA
// ===========================================================
function renderTablaClientes() {
  const texto = buscarCliente.value.toLowerCase();
  const localidadSeleccionada = filtroLocalidad.value;

  const filtrados = clientes.filter((cli) => {
    const coincideNombre = cli.nombre.toLowerCase().includes(texto);
    const coincideLoc =
      localidadSeleccionada === "" || cli.localidad === localidadSeleccionada;
    return coincideNombre && coincideLoc;
  });

  tablaClientesBody.innerHTML = "";

  filtrados.forEach((c) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
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
          <button class="c-btn-delete" data-id="${c.id}">Eliminar</button>
        </div>
      </td>
    `;

    tablaClientesBody.appendChild(tr);
  });

  agregarEventosAcciones();
}

// ===========================================================
// BOTONES EDITAR / ELIMINAR
// ===========================================================
function agregarEventosAcciones() {
  document
    .querySelectorAll(".c-btn-edit")
    .forEach((btn) =>
      btn.addEventListener("click", () => editarCliente(btn.dataset.id))
    );

  document
    .querySelectorAll(".c-btn-delete")
    .forEach((btn) =>
      btn.addEventListener("click", () => eliminarCliente(btn.dataset.id))
    );
}

// ===========================================================
// EDITAR CLIENTE
// ===========================================================
function editarCliente(id) {
  const c = clientes.find((cli) => cli.id == id);
  if (!c) return;

  modoEdicion = true;
  clienteEditandoId = id;

  tituloModal.textContent = "Editar cliente";

  campoId.value = c.id;
  campoNombre.value = c.nombre;
  campoEdad.value = c.edad ?? "";
  campoGenero.value = c.genero ?? "";
  campoTelefono.value = c.telefono ?? "";
  campoEmail.value = c.email ?? "";
  campoLocalidad.value = c.localidad ?? "";
  campoComentarios.value = c.comentarios ?? "";

  modalCliente.style.display = "block";
}

// ===========================================================
// ELIMINAR CLIENTE
// ===========================================================
async function eliminarCliente(id) {
  if (!confirm("¿Eliminar cliente?")) return;

  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  } catch (error) {
    console.error("Error eliminando cliente:", error);
  }

  await cargarClientes();
}

const btnLimpiarFiltros = document.getElementById("c-btn-limpiar");

btnLimpiarFiltros.addEventListener("click", () => {
  buscarCliente.value = "";
  filtroLocalidad.value = "";
  renderTablaClientes();
});


// ===========================================================
// INICIALIZAR
// ===========================================================
cargarClientes();
