// clientes.js

// ---------------------------------------------
// ELEMENTOS DEL DOM
// ---------------------------------------------
const buscarInput = document.getElementById("c-buscar");
const filtroLocalidad = document.getElementById("c-filtro-localidad");
const btnNuevoCliente = document.getElementById("c-btn-nuevo");

const modal = document.getElementById("c-modal");
const modalClose = document.querySelector(".c-close");
const form = document.getElementById("c-form");

const campoId = document.getElementById("c-id");
const campoNombre = document.getElementById("c-nombre");
const campoEdad = document.getElementById("c-edad");
const campoGenero = document.getElementById("c-genero");
const campoTelefono = document.getElementById("c-telefono");
const campoEmail = document.getElementById("c-email");
const campoLocalidad = document.getElementById("c-localidad");
const campoDescripcion = document.getElementById("c-descripcion");

const tablaBody = document.getElementById("c-tabla-body");

let editando = false;
let clienteEditandoId = null;

// --------------------------------------------------
// LISTADO TEMPORAL PARA SIMULAR LA TABLA
// --------------------------------------------------
let clientes = [
  {
    id: 1,
    nombre: "Ana Pérez",
    edad: 34,
    genero: "Femenino",
    telefono: "11-4567-8901",
    email: "ana@mail.com",
    localidad: "CABA",
    descripcion: "Cliente frecuente",
  },
  {
    id: 2,
    nombre: "Carlos Gómez",
    edad: 42,
    genero: "Masculino",
    telefono: "11-2233-4455",
    email: "carlos@mail.com",
    localidad: "Zona Norte",
    descripcion: "Compra mensual",
  },
];

// --------------------------------------------------
// ABRIR MODAL (NUEVO)
// --------------------------------------------------
btnNuevoCliente.addEventListener("click", () => {
  editando = false;
  clienteEditandoId = null;

  form.reset();
  campoId.value = "AUTO";

  document.querySelector(".c-subtitle").textContent = "Nuevo cliente";
  modal.style.display = "flex";
});

// --------------------------------------------------
// CERRAR MODAL
// --------------------------------------------------
modalClose.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// --------------------------------------------------
// GUARDAR CLIENTE
// --------------------------------------------------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const datos = {
    id: editando ? clienteEditandoId : Date.now(),
    nombre: campoNombre.value.trim(),
    edad: parseInt(campoEdad.value) || null,
    genero: campoGenero.value,
    telefono: campoTelefono.value.trim(),
    email: campoEmail.value.trim(),
    localidad: campoLocalidad.value.trim(),
    descripcion: campoDescripcion.value.trim(),
  };

  if (!editando) {
    clientes.push(datos);
  } else {
    const i = clientes.findIndex((c) => c.id === clienteEditandoId);
    clientes[i] = datos;
  }

  modal.style.display = "none";
  renderTabla();
});

// --------------------------------------------------
// FILTROS
// --------------------------------------------------
buscarInput.addEventListener("input", renderTabla);
filtroLocalidad.addEventListener("change", renderTabla);

// --------------------------------------------------
// RENDERIZAR TABLA
// --------------------------------------------------
function renderTabla() {
  const texto = buscarInput.value.toLowerCase();
  const filtroLoc = filtroLocalidad.value;

  const filtrados = clientes.filter((c) => {
    const coincideNombre = c.nombre.toLowerCase().includes(texto);
    const coincideLoc = filtroLoc === "" || c.localidad === filtroLoc;
    return coincideNombre && coincideLoc;
  });

  tablaBody.innerHTML = "";

  filtrados.forEach((c) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
            <td>${c.id}</td>
            <td>${c.nombre}</td>
            <td>${c.edad ?? "-"}</td>
            <td>${c.genero || "-"}</td>
            <td>${c.telefono}</td>
            <td>${c.email}</td>
            <td>${c.localidad}</td>
            <td>${c.descripcion}</td>
            <td>
                <div class="acciones-clientes">
                    <button class="c-btn-edit" data-id="${c.id}">Editar</button>
                    <button class="c-btn-delete" data-id="${
                      c.id
                    }">Eliminar</button>
                </div>
            </td>
        `;

    tablaBody.appendChild(tr);
  });

  activarBotonesAcciones();
}

// --------------------------------------------------
// EDITAR Y ELIMINAR
// --------------------------------------------------
function activarBotonesAcciones() {
  document.querySelectorAll(".c-btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => editarCliente(btn.dataset.id));
  });

  document.querySelectorAll(".c-btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => eliminarCliente(btn.dataset.id));
  });
}

function editarCliente(id) {
  const cliente = clientes.find((c) => c.id == id);

  editando = true;
  clienteEditandoId = cliente.id;

  document.querySelector(".c-subtitle").textContent = "Editar cliente";

  campoId.value = cliente.id;
  campoNombre.value = cliente.nombre;
  campoEdad.value = cliente.edad;
  campoGenero.value = cliente.genero;
  campoTelefono.value = cliente.telefono;
  campoEmail.value = cliente.email;
  campoLocalidad.value = cliente.localidad;
  campoDescripcion.value = cliente.descripcion;

  modal.style.display = "flex";
}

function eliminarCliente(id) {
  clientes = clientes.filter((c) => c.id != id);
  renderTabla();
}

// --------------------------------------------------
// INICIALIZAR
// --------------------------------------------------
renderTabla();
