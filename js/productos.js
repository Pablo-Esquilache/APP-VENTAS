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

// Estado
let modoEdicion = false;
let productoEditandoId = null;

// API
const API_URL = "http://localhost:4000/api/productos";

let productos = [];

// ------------------------------
// CARGAR PRODUCTOS
// ------------------------------
async function cargarProductos() {
  try {
    const res = await fetch(API_URL);
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
// CARGAR CATEGORÍAS
// ------------------------------
async function cargarCategorias() {
  try {
    const res = await fetch(`${API_URL}/categorias/lista`);
    const categorias = await res.json();

    // RESET selects
    categoriaProducto.innerHTML = `<option value="">Seleccionar categoría</option>`;
    filtroCategoria.innerHTML = `<option value="">Todas las categorías</option>`;

    categorias.forEach((cat) => {
      const op1 = document.createElement("option");
      op1.value = cat;
      op1.textContent = cat;
      categoriaProducto.appendChild(op1);

      const op2 = document.createElement("option");
      op2.value = cat;
      op2.textContent = cat;
      filtroCategoria.appendChild(op2);
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
// CERRAR MODAL
// ------------------------------
btnCerrarModal.addEventListener("click", () => {
  modalProducto.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalProducto) modalProducto.style.display = "none";
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
// GUARDAR PRODUCTO
// ------------------------------
document
  .querySelector(".p-form-producto")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      nombre: nombreProducto.value.trim(),
      categoria: categoriaProducto.value,
      stock: parseInt(stockProducto.value),
      precio: parseFloat(precioProducto.value),
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

    await cargarProductos();
    await cargarCategorias();
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

  const filtrados = productos.filter((prod) => {
    const coincideNombre = prod.nombre.toLowerCase().includes(texto);
    const coincideCat = categoria === "" || prod.categoria === categoria;
    return coincideNombre && coincideCat;
  });

  tablaProductosBody.innerHTML = "";

  filtrados.forEach((prod) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
            <td>${prod.id}</td>
            <td>${prod.nombre}</td>
            <td>${prod.categoria || "-"}</td>
            <td>${prod.stock}</td>
            <td>$${prod.precio.toFixed(2)}</td>
            <td>
                <div class="acciones-productos">
                    <button class="p-btn-action p-btn-edit" data-id="${
                      prod.id
                    }">Editar</button>
                    <button class="p-btn-action p-btn-delete" data-id="${
                      prod.id
                    }">Eliminar</button>
                </div>
            </td>
        `;

    tablaProductosBody.appendChild(tr);
  });

  agregarEventosAcciones();
}

// ------------------------------
// BOTONES EDITAR / ELIMINAR
// ------------------------------
function agregarEventosAcciones() {
  document
    .querySelectorAll(".p-btn-edit")
    .forEach((btn) =>
      btn.addEventListener("click", () => editarProducto(btn.dataset.id))
    );

  document
    .querySelectorAll(".p-btn-delete")
    .forEach((btn) =>
      btn.addEventListener("click", () => eliminarProducto(btn.dataset.id))
    );
}

// ------------------------------
// EDITAR
// ------------------------------
function editarProducto(id) {
  const prod = productos.find((p) => p.id == id);

  modoEdicion = true;
  productoEditandoId = id;

  tituloModal.textContent = "Editar producto";

  nombreProducto.value = prod.nombre;
  categoriaProducto.value = prod.categoria || "";
  stockProducto.value = prod.stock;
  precioProducto.value = prod.precio;

  modalProducto.style.display = "flex";
}

// ------------------------------
// ELIMINAR
// ------------------------------
async function eliminarProducto(id) {
  if (!confirm("¿Eliminar producto?")) return;

  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  } catch (error) {
    console.error("Error eliminando producto:", error);
  }

  await cargarProductos();
  await cargarCategorias();
}
const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltrosProd");
btnLimpiarFiltros.addEventListener("click", () => {
  buscarProducto.value = "";
  filtroCategoria.value = "";

  cargarProductos(); // recarga la tabla principal sin filtros
});

// ------------------------------
// INICIALIZAR APP
// ------------------------------
cargarProductos();
cargarCategorias();
