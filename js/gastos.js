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

const API_URL = "http://localhost:4000/api/gastos";
let gastos = [];

function formatFecha(fechaString) {
  const fecha = new Date(fechaString);
  const dia = fecha.getDate().toString().padStart(2, "0");
  const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}


// ------------------------------
// CARGAR GASTOS
// ------------------------------
async function cargarGastos() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    gastos = data.sort((a, b) => b.id - a.id); // ID descendente
    renderTablaGastos();
  } catch (error) {
    console.error("Error cargando gastos:", error);
  }
}

// ------------------------------
// RENDERIZAR TABLA
// ------------------------------
function renderTablaGastos() {
  const texto = buscarGasto.value.toLowerCase();
  const tipo = filtroTipo.value;
  const desde = filtroDesde.value;
  const hasta = filtroHasta.value;

  const filtrados = gastos.filter(g => {
    const coincideTexto = g.descripcion.toLowerCase().includes(texto) || String(g.id).includes(texto);
    const coincideTipo = tipo === "" || g.tipo === tipo;
    const coincideFecha = (!desde || g.fecha >= desde) && (!hasta || g.fecha <= hasta);
    return coincideTexto && coincideTipo && coincideFecha;
  });

  tablaGastosBody.innerHTML = "";

  filtrados.forEach(g => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${g.id}</td>
      <td>${formatFecha(g.fecha)}</td>
      <td>${g.descripcion}</td>
      <td>${g.tipo}</td>
      <td>$${parseFloat(g.importe).toFixed(2)}</td>
      <td>
        <div class="acciones-gastos">
          <button class="g-btn-action g-btn-edit" data-id="${g.id}">Editar</button>
          <button class="g-btn-action g-btn-delete" data-id="${g.id}">Eliminar</button>
        </div>
      </td>
    `;
    tablaGastosBody.appendChild(tr);
  });

  agregarEventosAcciones();
}

// ------------------------------
// BOTONES EDITAR / ELIMINAR
// ------------------------------
function agregarEventosAcciones() {
  document.querySelectorAll(".g-btn-edit").forEach(btn =>
    btn.addEventListener("click", () => editarGasto(btn.dataset.id))
  );

  document.querySelectorAll(".g-btn-delete").forEach(btn =>
    btn.addEventListener("click", () => eliminarGasto(btn.dataset.id))
  );
}

// ------------------------------
// ABRIR MODAL
// ------------------------------
btnNuevoGasto.addEventListener("click", () => {
  modoEdicion = false;
  gastoEditandoId = null;
  tituloModal.textContent = "Registrar gasto";
  limpiarFormulario();
  modalGasto.style.display = "flex";
});

// ------------------------------
// CERRAR MODAL
// ------------------------------
btnCerrarModal.addEventListener("click", () => modalGasto.style.display = "none");
window.addEventListener("click", e => { if(e.target === modalGasto) modalGasto.style.display = "none"; });

// ------------------------------
// LIMPIAR FORMULARIO
// ------------------------------
function limpiarFormulario() {
  fechaGasto.value = "";
  descripcionGasto.value = "";
  tipoGasto.value = "";
  importeGasto.value = "";
}

// ------------------------------
// GUARDAR GASTO
// ------------------------------
document.querySelector(".g-form-gasto").addEventListener("submit", async e => {
  e.preventDefault();

  const data = {
    fecha: fechaGasto.value,
    descripcion: descripcionGasto.value.trim(),
    tipo: tipoGasto.value,
    importe: parseFloat(importeGasto.value),
  };

  try {
    if (!modoEdicion) {
      await fetch(API_URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
      });
    } else {
      await fetch(`${API_URL}/${gastoEditandoId}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
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
function editarGasto(id) {
  const g = gastos.find(x => x.id == id);
  modoEdicion = true;
  gastoEditandoId = id;

  tituloModal.textContent = "Editar gasto";
  fechaGasto.value = g.fecha;
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
    await fetch(`${API_URL}/${id}`, {method: "DELETE"});
  } catch (error) {
    console.error("Error eliminando gasto:", error);
  }

  await cargarGastos();
}

// ------------------------------
// FILTROS / BUSQUEDA
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
// INICIALIZAR
// ------------------------------
cargarGastos();
