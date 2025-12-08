// gastos.js

// ------------------------------------------------------
// ELEMENTOS DEL DOM
// ------------------------------------------------------
const buscarInput = document.getElementById("buscarGasto");
const filtroTipo = document.getElementById("filtroTipo");
const filtroDesde = document.getElementById("filtroDesde");
const filtroHasta = document.getElementById("filtroHasta");

const btnNuevoGasto = document.getElementById("btnNuevoGasto");

const modal = document.getElementById("modalGasto");
const modalClose = document.querySelector(".g-close");

const tituloModal = document.getElementById("tituloModalGasto");

const campoFecha = document.getElementById("fechaGasto");
const campoDescripcion = document.getElementById("descripcionGasto");
const campoTipo = document.getElementById("tipoGasto");
const campoImporte = document.getElementById("importeGasto");

const tablaBody = document.getElementById("tablaGastosBody");

let editando = false;
let gastoEditandoId = null;


// ------------------------------------------------------
// DATOS SIMULADOS
// ------------------------------------------------------
let gastos = [
    {
        id: 1,
        fecha: "2025-01-02",
        descripcion: "Pago del alquiler",
        tipo: "fijo",
        importe: 120000
    },
    {
        id: 2,
        fecha: "2025-01-05",
        descripcion: "Compra de insumos",
        tipo: "variable",
        importe: 18000
    }
];


// ------------------------------------------------------
// ABRIR MODAL NUEVO
// ------------------------------------------------------
btnNuevoGasto.addEventListener("click", () => {
    editando = false;
    gastoEditandoId = null;

    tituloModal.textContent = "Registrar gasto";
    campoFecha.value = "";
    campoDescripcion.value = "";
    campoTipo.value = "";
    campoImporte.value = "";

    modal.style.display = "flex";
});


// ------------------------------------------------------
// CERRAR MODAL
// ------------------------------------------------------
modalClose.addEventListener("click", () => modal.style.display = "none");

window.addEventListener("click", e => {
    if (e.target === modal) modal.style.display = "none";
});


// ------------------------------------------------------
// GUARDAR
// ------------------------------------------------------
document.querySelector(".g-form-gasto").addEventListener("submit", e => {
    e.preventDefault();

    const gasto = {
        id: editando ? gastoEditandoId : Date.now(),
        fecha: campoFecha.value,
        descripcion: campoDescripcion.value.trim(),
        tipo: campoTipo.value,
        importe: Number(campoImporte.value)
    };

    if (!editando) {
        gastos.push(gasto);
    } else {
        const i = gastos.findIndex(g => g.id === gastoEditandoId);
        gastos[i] = gasto;
    }

    modal.style.display = "none";
    renderTabla();
});


// ------------------------------------------------------
// FILTROS
// ------------------------------------------------------
buscarInput.addEventListener("input", renderTabla);
filtroTipo.addEventListener("change", renderTabla);
filtroDesde.addEventListener("change", renderTabla);
filtroHasta.addEventListener("change", renderTabla);


// ------------------------------------------------------
// RENDER TABLA
// ------------------------------------------------------
function renderTabla() {
    const texto = buscarInput.value.toLowerCase();
    const tipo = filtroTipo.value;
    const desde = filtroDesde.value;
    const hasta = filtroHasta.value;

    const filtrados = gastos.filter(g => {
        const coincideDesc = g.descripcion.toLowerCase().includes(texto);
        const coincideTipo = tipo === "" || g.tipo === tipo;

        const coincideDesde = !desde || g.fecha >= desde;
        const coincideHasta = !hasta || g.fecha <= hasta;

        return coincideDesc && coincideTipo && coincideDesde && coincideHasta;
    });

    tablaBody.innerHTML = "";

    filtrados.forEach(g => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${g.id}</td>
            <td>${g.fecha}</td>
            <td>${g.descripcion}</td>
            <td>${g.tipo}</td>
            <td>$ ${g.importe.toLocaleString()}</td>
            <td>
                <div class="acciones-gastos">
                    <button class="g-btn-edit" data-id="${g.id}">Editar</button>
                    <button class="g-btn-delete" data-id="${g.id}">Eliminar</button>
                </div>
            </td>
        `;

        tablaBody.appendChild(tr);
    });

    activarBotonesAcciones();
}


// ------------------------------------------------------
// EDITAR / ELIMINAR
// ------------------------------------------------------
function activarBotonesAcciones() {
    document.querySelectorAll(".g-btn-edit").forEach(btn => {
        btn.addEventListener("click", () => editarGasto(btn.dataset.id));
    });

    document.querySelectorAll(".g-btn-delete").forEach(btn => {
        btn.addEventListener("click", () => eliminarGasto(btn.dataset.id));
    });
}

function editarGasto(id) {
    const gasto = gastos.find(g => g.id == id);

    editando = true;
    gastoEditandoId = gasto.id;

    tituloModal.textContent = "Editar gasto";

    campoFecha.value = gasto.fecha;
    campoDescripcion.value = gasto.descripcion;
    campoTipo.value = gasto.tipo;
    campoImporte.value = gasto.importe;

    modal.style.display = "flex";
}

function eliminarGasto(id) {
    gastos = gastos.filter(g => g.id != id);
    renderTabla();
}


// ------------------------------------------------------
// INICIO
// ------------------------------------------------------
renderTabla();
