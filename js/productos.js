// products.js// productos.js

// ------------------------------
// ELEMENTOS DEL DOM
// ------------------------------
const buscarProducto = document.getElementById("buscarProducto");
const filtroCategoria = document.getElementById("filtroCategoria");
const btnNuevoProducto = document.getElementById("btnNuevoProducto");

const modalProducto = document.getElementById("modalProducto");
const btnCerrarModal = document.querySelector(".p-close");

const tituloModal = document.getElementById("tituloModalProducto");

const nombreProducto = document.getElementById("nombreProducto");
const categoriaProducto = document.getElementById("categoriaProducto");
const stockProducto = document.getElementById("stockProducto");
const precioProducto = document.getElementById("precioProducto");

const tablaProductosBody = document.getElementById("tablaProductosBody");

let modoEdicion = false;
let productoEditandoId = null;

// API BASE (por ahora simulado)
const API_URL = "http://localhost:3000/api"; // no se usa todavía


// --------------------------------------
// LISTA LOCAL TEMPORAL PARA SIMULAR
// --------------------------------------
let productos = [
    { id: 1, nombre: "El Principito", categoria: "Ficción", stock: 12, precio: 2500 },
    { id: 2, nombre: "Introducción a SQL", categoria: "Académicos", stock: 5, precio: 8900 },
    { id: 3, nombre: "Cuentos para dormir", categoria: "Infantil", stock: 20, precio: 3500 },
];


// ------------------------------
// ABRIR MODAL
// ------------------------------
btnNuevoProducto.addEventListener("click", () => {
    modoEdicion = false;
    productoEditandoId = null;

    tituloModal.textContent = "Nuevo producto";
    limpiarFormulario();
    modalProducto.style.display = "flex";
});


// ------------------------------
// CERRAR MODAL
// ------------------------------
btnCerrarModal.addEventListener("click", () => {
    modalProducto.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modalProducto) {
        modalProducto.style.display = "none";
    }
});


// ------------------------------
// LIMPIAR FORMULARIO
// ------------------------------
function limpiarFormulario() {
    nombreProducto.value = "";
    categoriaProducto.value = "";
    stockProducto.value = "";
    precioProducto.value = "";
}


// ------------------------------
// EVENTO GUARDAR PRODUCTO
// ------------------------------
document.querySelector(".p-form-producto").addEventListener("submit", (e) => {
    e.preventDefault();

    const nuevoProducto = {
        id: modoEdicion ? productoEditandoId : Date.now(),
        nombre: nombreProducto.value.trim(),
        categoria: categoriaProducto.value,
        stock: parseInt(stockProducto.value),
        precio: parseFloat(precioProducto.value)
    };

    if (!modoEdicion) {
        productos.push(nuevoProducto);
    } else {
        const index = productos.findIndex(p => p.id === productoEditandoId);
        productos[index] = nuevoProducto;
    }

    modalProducto.style.display = "none";
    renderTablaProductos();
});


// ------------------------------
// BUSCAR / FILTRAR
// ------------------------------
buscarProducto.addEventListener("input", renderTablaProductos);
filtroCategoria.addEventListener("change", renderTablaProductos);


// ------------------------------
// RENDERIZAR TABLA
// ------------------------------
function renderTablaProductos() {
    const texto = buscarProducto.value.toLowerCase();
    const categoria = filtroCategoria.value;

    const filtrados = productos.filter(prod => {
        const coincideNombre = prod.nombre.toLowerCase().includes(texto);
        const coincideCat = categoria === "" || prod.categoria === categoria;
        return coincideNombre && coincideCat;
    });

    tablaProductosBody.innerHTML = "";

    filtrados.forEach(prod => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${prod.id}</td>
            <td>${prod.nombre}</td>
            <td>${prod.categoria}</td>
            <td>${prod.stock}</td>
            <td>$${prod.precio.toFixed(2)}</td>
            <td>
                <button class="p-btn-action p-btn-edit" data-id="${prod.id}">Editar</button>
                <button class="p-btn-action p-btn-delete" data-id="${prod.id}">Eliminar</button>
            </td>
        `;

        tablaProductosBody.appendChild(tr);
    });

    agregarEventosAcciones();
}


// ------------------------------
// ACCIONES EDITAR / ELIMINAR
// ------------------------------
function agregarEventosAcciones() {
    const botonesEditar = document.querySelectorAll(".p-btn-edit");
    const botonesEliminar = document.querySelectorAll(".p-btn-delete");

    botonesEditar.forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.dataset.id);
            editarProducto(id);
        });
    });

    botonesEliminar.forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.dataset.id);
            eliminarProducto(id);
        });
    });
}


// ------------------------------
// EDITAR PRODUCTO
// ------------------------------
function editarProducto(id) {
    const prod = productos.find(p => p.id === id);

    modoEdicion = true;
    productoEditandoId = id;

    tituloModal.textContent = "Editar producto";

    nombreProducto.value = prod.nombre;
    categoriaProducto.value = prod.categoria;
    stockProducto.value = prod.stock;
    precioProducto.value = prod.precio;

    modalProducto.style.display = "flex";
}


// ------------------------------
// ELIMINAR PRODUCTO
// ------------------------------
function eliminarProducto(id) {
    productos = productos.filter(p => p.id !== id);
    renderTablaProductos();
}


// ------------------------------
// INICIALIZAR
// ------------------------------
renderTablaProductos();
