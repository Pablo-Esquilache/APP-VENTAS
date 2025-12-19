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


async function cargarComercio() {
  if (!firebaseUID) return;

  const res = await fetch(`${API_BASE}/comercios/uid/${firebaseUID}`);
  const data = await res.json();
  comercioId = data.id;
}

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
const nuevaCategoriaProducto = document.getElementById(
  "nuevaCategoriaProducto"
);
const btnNuevaCategoria = document.getElementById("btnNuevaCategoria");
const stockProducto = document.getElementById("stockProducto");
const precioProducto = document.getElementById("precioProducto");

const tablaProductosBody = document.getElementById("tablaProductosBody");

// ------------------------------
// ESTADO
// ------------------------------
let modoEdicion = false;
let productoEditandoId = null;
let productos = [];

// ------------------------------
// API
// ------------------------------
const API_URL = `${API_BASE}/productos`;

// ------------------------------
// CARGAR PRODUCTOS (POR COMERCIO)
// ------------------------------
async function cargarProductos() {
  if (!comercioId) return;

  try {
    const res = await fetch(`${API_URL}?comercio_id=${comercioId}`);
    const data = await res.json();

    productos = data.map((p) => ({
      ...p,
      precio: parseFloat(p.precio),
      stock: parseInt(p.stock),
    }));

    renderTablaProductos();
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

// ------------------------------
// CARGAR CATEGORÍAS (POR COMERCIO)
// ------------------------------
async function cargarCategorias() {
  if (!comercioId) return;

  try {
    const res = await fetch(
      `${API_URL}/categorias/lista?comercio_id=${comercioId}`
    );
    const categorias = await res.json();

    categoriaProducto.innerHTML = `<option value="">Seleccionar categoría</option>`;
    filtroCategoria.innerHTML = `<option value="">Todas las categorías</option>`;

    categorias.forEach((cat) => {
      categoriaProducto.innerHTML += `<option value="${cat}">${cat}</option>`;
      filtroCategoria.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
  } catch (error) {
    console.error("Error cargando categorías:", error);
  }
}

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
// NUEVA CATEGORÍA
// ------------------------------
btnNuevaCategoria.addEventListener("click", () => {
  nuevaCategoriaProducto.style.display = "block";
  nuevaCategoriaProducto.focus();
});

// ------------------------------
// CERRAR MODAL
// ------------------------------
btnCerrarModal.addEventListener("click", () => {
  modalProducto.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalProducto) modalProducto.style.display = "none";
});

// ------------------------------
// LIMPIAR FORM
// ------------------------------
function limpiarFormulario() {
  nombreProducto.value = "";
  categoriaProducto.value = "";
  nuevaCategoriaProducto.value = "";
  stockProducto.value = "";
  precioProducto.value = "";
  nuevaCategoriaProducto.style.display = "none";
}

// ------------------------------
// GUARDAR PRODUCTO
// ------------------------------
document
  .querySelector(".p-form-producto")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const categoriaFinal =
      nuevaCategoriaProducto.value.trim() || categoriaProducto.value;

    const data = {
      nombre: nombreProducto.value.trim(),
      categoria: categoriaFinal,
      stock: parseInt(stockProducto.value),
      precio: parseFloat(precioProducto.value),
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
        await fetch(`${API_URL}/${productoEditandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
    } catch (error) {
      console.error("Error guardando producto:", error);
    }

    modalProducto.style.display = "none";
    limpiarFormulario();
    await cargarProductos();
    await cargarCategorias();
  });

// ------------------------------
// FILTROS
// ------------------------------
buscarProducto.addEventListener("input", renderTablaProductos);
filtroCategoria.addEventListener("change", renderTablaProductos);

// ------------------------------
// RENDER TABLA
// ------------------------------
function renderTablaProductos() {
  const texto = buscarProducto.value.toLowerCase();
  const categoria = filtroCategoria.value;

  const filtrados = productos.filter((p) => {
    const okNombre = p.nombre.toLowerCase().includes(texto);
    const okCat = !categoria || p.categoria === categoria;
    return okNombre && okCat;
  });

  tablaProductosBody.innerHTML = "";

  filtrados.forEach((p) => {
    tablaProductosBody.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.nombre}</td>
        <td>${p.categoria || "-"}</td>
        <td>${p.stock}</td>
        <td>$${p.precio.toFixed(2)}</td>
        <td>
        <div class="acciones-productos">
          <button class="p-btn-edit" data-id="${p.id}">Editar</button>
          <button class="p-btn-delete" data-id="${p.id}">Eliminar</button>
        </td>
        </div>
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
    .querySelectorAll(".p-btn-edit")
    .forEach((b) =>
      b.addEventListener("click", () => editarProducto(b.dataset.id))
    );

  document
    .querySelectorAll(".p-btn-delete")
    .forEach((b) =>
      b.addEventListener("click", () => eliminarProducto(b.dataset.id))
    );
}

// ------------------------------
// EDITAR
// ------------------------------
function editarProducto(id) {
  const p = productos.find((x) => x.id == id);

  modoEdicion = true;
  productoEditandoId = id;

  tituloModal.textContent = "Editar producto";
  nombreProducto.value = p.nombre;
  categoriaProducto.value = p.categoria || "";
  stockProducto.value = p.stock;
  precioProducto.value = p.precio;

  modalProducto.style.display = "flex";
}

// ------------------------------
// ELIMINAR
// ------------------------------
async function eliminarProducto(id) {
  if (!confirm("¿Eliminar producto?")) return;

  await fetch(`${API_URL}/${id}?comercio_id=${comercioId}`, {
    method: "DELETE",
  });

  await cargarProductos();
  await cargarCategorias();
}

// ------------------------------
// LIMPIAR FILTROS
// ------------------------------
document
  .getElementById("btnLimpiarFiltrosProd")
  .addEventListener("click", () => {
    buscarProducto.value = "";
    filtroCategoria.value = "";
    renderTablaProductos();
  });

// ------------------------------
// INIT
// ------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  await cargarComercio();
  console.log("comercioId:", comercioId); // debe mostrar un número
  if (comercioId) {
    await cargarProductos();
    await cargarCategorias();
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

