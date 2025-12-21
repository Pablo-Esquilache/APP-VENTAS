// ------------------------------
// SESIÓN / COMERCIO
// ------------------------------
const session = JSON.parse(localStorage.getItem("session"));
const firebaseUID = session?.uid; // antes era session?.firebase_uid
let comercioId = session?.comercio_id || null;

const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:4000/api"
    : "https://app-ventas-gvdk.onrender.com/api";

const API_URL = `${API_BASE}/gastos`;

async function cargarComercio() {
  if (!firebaseUID) return;

  const res = await fetch(`${API_BASE}/comercios/uid/${firebaseUID}`);
  const data = await res.json();
  comercioId = data.id;
}

// ------------------------------
// ELEMENTOS DEL DOM
// ------------------------------
const buscarGasto = document.getElementById("buscarGasto");
const filtroTipo = document.getElementById("filtroTipo");
const filtroDesde = document.getElementById("filtroDesde");
const filtroHasta = document.getElementById("filtroHasta");
const btnNuevoGasto = document.getElementById("btnNuevoGasto");
const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltrosGasto");

const modalGasto = document.getElementById("modalGasto");
const btnCerrarModal = document.querySelector(".g-close");
const tituloModal = document.getElementById("tituloModalGasto");

const fechaGasto = document.getElementById("fechaGasto");
const descripcionGasto = document.getElementById("descripcionGasto");
const tipoGasto = document.getElementById("tipoGasto");
const importeGasto = document.getElementById("importeGasto");

const tablaGastosBody = document.getElementById("tablaGastosBody");

// ------------------------------
// ESTADO
// ------------------------------
let modoEdicion = false;
let gastoEditandoId = null;
let gastos = [];

// ------------------------------
// UTILIDADES
// ------------------------------
function formatFecha(fechaISO) {
  if (!fechaISO) return "—";
  const [y, m, d] = fechaISO.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

// ------------------------------
// CARGAR GASTOS (POR COMERCIO)
// ------------------------------
async function cargarGastos() {
  if (!comercioId) return;

  try {
    const res = await fetch(`${API_URL}?comercio_id=${comercioId}`);
    const data = await res.json();

    gastos = data.sort((a, b) => b.id - a.id);
    renderTablaGastos();
  } catch (error) {
    console.error("Error cargando gastos:", error);
  }
}

// ------------------------------
// RENDER TABLA
// ------------------------------
function renderTablaGastos() {
  const texto = buscarGasto.value.toLowerCase();
  const tipo = filtroTipo.value;
  const desde = filtroDesde.value;
  const hasta = filtroHasta.value;

  const filtrados = gastos.filter((g) => {
    const okTexto =
      g.descripcion.toLowerCase().includes(texto) ||
      String(g.id).includes(texto);

    const okTipo = !tipo || g.tipo === tipo;

    const okFecha =
      (!desde || g.fecha >= desde) && (!hasta || g.fecha <= hasta);

    return okTexto && okTipo && okFecha;
  });

  tablaGastosBody.innerHTML = "";

  filtrados.forEach((g) => {
    tablaGastosBody.innerHTML += `
      <tr>
        <td>${g.id}</td>
        <td>${formatFecha(g.fecha)}</td>
        <td>${g.descripcion}</td>
        <td>${g.tipo}</td>
        <td>$${parseFloat(g.importe).toFixed(2)}</td>
        <td>
          <div class="acciones-gastos">
            <button class="g-btn-action g-btn-edit" data-id="${
              g.id
            }">Editar</button>
            <button class="g-btn-action g-btn-delete" data-id="${
              g.id
            }">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
  });

  agregarEventosAcciones();
}

// ------------------------------
// ACCIONES
// ------------------------------
function agregarEventosAcciones() {
  document
    .querySelectorAll(".g-btn-edit")
    .forEach((b) =>
      b.addEventListener("click", () => editarGasto(b.dataset.id))
    );

  document
    .querySelectorAll(".g-btn-delete")
    .forEach((b) =>
      b.addEventListener("click", () => eliminarGasto(b.dataset.id))
    );
}

// ------------------------------
// ABRIR / CERRAR MODAL
// ------------------------------
btnNuevoGasto.addEventListener("click", () => {
  modoEdicion = false;
  gastoEditandoId = null;
  tituloModal.textContent = "Registrar gasto";
  limpiarFormulario();
  modalGasto.style.display = "flex";
});

btnCerrarModal.addEventListener("click", () => {
  modalGasto.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalGasto) modalGasto.style.display = "none";
});

// ------------------------------
// LIMPIAR FORM
// ------------------------------
function limpiarFormulario() {
  fechaGasto.value = "";
  descripcionGasto.value = "";
  tipoGasto.value = "";
  importeGasto.value = "";
}

// ------------------------------
// GUARDAR (CREAR / EDITAR)
// ------------------------------
document
  .querySelector(".g-form-gasto")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      fecha: fechaGasto.value,
      descripcion: descripcionGasto.value.trim(),
      tipo: tipoGasto.value,
      importe: parseFloat(importeGasto.value),
      comercio_id: comercioId,
    };

    try {
      if (!modoEdicion) {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        await fetch(`${API_URL}/${gastoEditandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
    } catch (error) {
      console.error("Error guardando gasto:", error);
    }

    modalGasto.style.display = "none";
    limpiarFormulario();
    await cargarGastos();
  });

// ------------------------------
// EDITAR
// ------------------------------
function formatFechaInput(fechaString) {
  const fecha = new Date(fechaString);
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function editarGasto(id) {
  const g = gastos.find((x) => x.id == id);
  if (!g) return;

  modoEdicion = true;
  gastoEditandoId = id;

  tituloModal.textContent = "Editar gasto";

  // asignamos la fecha correctamente para el input date
  fechaGasto.value = formatFechaInput(g.fecha);

  descripcionGasto.value = g.descripcion;
  tipoGasto.value = g.tipo;
  importeGasto.value = g.importe;

  modalGasto.style.display = "flex";
}

// ------------------------------
// ELIMINAR
// ------------------------------
async function eliminarGasto(id) {
  if (!confirm("¿Eliminar gasto?")) return;

  try {
    await fetch(`${API_URL}/${id}?comercio_id=${comercioId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error eliminando gasto:", error);
  }

  await cargarGastos();
}

// ------------------------------
// FILTROS
// ------------------------------
buscarGasto.addEventListener("input", renderTablaGastos);
filtroTipo.addEventListener("change", renderTablaGastos);
filtroDesde.addEventListener("change", renderTablaGastos);
filtroHasta.addEventListener("change", renderTablaGastos);

btnLimpiarFiltros.addEventListener("click", () => {
  buscarGasto.value = "";
  filtroTipo.value = "";
  filtroDesde.value = "";
  filtroHasta.value = "";
  renderTablaGastos();
});

// ------------------------------
// INIT
// ------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  await cargarComercio();
  console.log("comercioId:", comercioId); // debe mostrar un número
  if (comercioId) {
    await cargarGastos();
  } else {
    console.error("No se pudo obtener comercioId");
  }
});
