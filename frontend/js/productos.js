import { ComercioAPI, ProductosAPI } from "./api.js";

// ------------------------------
// SESIÓN / COMERCIO
// ------------------------------
const session = JSON.parse(localStorage.getItem("session"));
const firebaseUID = session?.uid; // antes era session?.firebase_uid
let comercioId = session?.comercio_id || null;
let umbralStock = 3; // Default

async function cargarComercio() {
  if (!firebaseUID) return;

  const data = await ComercioAPI.getByUid(firebaseUID);
  comercioId = data.id;
  umbralStock = data.umbral_stock !== undefined ? data.umbral_stock : 3;
}

// ------------------------------
// ELEMENTOS DEL DOM
// ------------------------------
const buscarProducto = document.getElementById("buscarProducto");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroBajoStock = document.getElementById("filtroBajoStock");
const btnNuevoProducto = document.getElementById("btnNuevoProducto");

const modalProducto = document.getElementById("modalProducto");
const btnCerrarModal = document.querySelector(".app-close");

const tituloModal = document.getElementById("tituloModalProducto");

const nombreProducto = document.getElementById("nombreProducto");
const categoriaProducto = document.getElementById("categoriaProducto");
const nuevaCategoriaProducto = document.getElementById(
  "nuevaCategoriaProducto"
);
const btnNuevaCategoria = document.getElementById("btnNuevaCategoria");
const codigoBarrasProducto = document.getElementById("codigoBarrasProducto");
const stockProducto = document.getElementById("stockProducto");
const precioProducto = document.getElementById("precioProducto");

const tablaProductosBody = document.getElementById("tablaProductosBody");

const btnImportarExcel = document.getElementById("btnImportarExcel");
const modalImportarExcel = document.getElementById("modalImportarExcel");
const cerrarModalExcel = document.getElementById("cerrarModalExcel");
const inputExcelProductos = document.getElementById("inputExcelProductos");
const btnProcesarExcel = document.getElementById("btnProcesarExcel");

// ------------------------------
// ESTADO
// ------------------------------
let modoEdicion = false;
let productoEditandoId = null;
let productos = [];

// ------------------------------
// CARGAR PRODUCTOS (POR COMERCIO)
// ------------------------------
async function cargarProductos() {
  if (!comercioId) return;

  try {
    const data = await ProductosAPI.getAll(comercioId);

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
    const categorias = await ProductosAPI.getCategorias(comercioId);

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
  codigoBarrasProducto.value = "";
  stockProducto.value = "";
  document.getElementById("stockIngresarProducto").value = "";
  precioProducto.value = "";
  nuevaCategoriaProducto.style.display = "none";

  document.getElementById("stockProducto").readOnly = false;
  document.getElementById("grupoStockIngresar").style.display = "none";
  document.getElementById("labelStockProducto").textContent = "Stock inicial";
}

// ------------------------------
// GUARDAR PRODUCTO
// ------------------------------
document
  .querySelector(".app-form-venta")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const categoriaFinal =
      nuevaCategoriaProducto.value.trim() || categoriaProducto.value;

    const data = {
      nombre: nombreProducto.value.trim(),
      categoria: categoriaFinal,
      codigo_barras: codigoBarrasProducto.value.trim() || null,
      stock: modoEdicion 
        ? (parseInt(document.getElementById("stockIngresarProducto").value) || 0) 
        : parseInt(stockProducto.value),
      precio: parseFloat(precioProducto.value),
      comercio_id: comercioId,
    };

    try {
      if (!modoEdicion) {
        await ProductosAPI.create(data);
      } else {
        await ProductosAPI.update(productoEditandoId, data);
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
if (filtroBajoStock) filtroBajoStock.addEventListener("change", renderTablaProductos);

// ------------------------------
// RENDER TABLA
// ------------------------------
function renderTablaProductos() {
  const texto = buscarProducto.value.toLowerCase();
  const categoria = filtroCategoria.value;
  const bajoStock = filtroBajoStock?.checked || false;

  const filtrados = productos.filter((p) => {
    const okNombre = p.nombre.toLowerCase().includes(texto);
    const okCat = !categoria || p.categoria === categoria;
    const okBajoStock = !bajoStock || p.stock <= umbralStock;
    return okNombre && okCat && okBajoStock;
  });

  // VERIFICAR STOCK BAJO (<= umbralStock)
  const tieneStockBajo = productos.some(p => p.stock <= umbralStock);
  const alertaStockBajo = document.getElementById("alertaStockBajo");
  if (alertaStockBajo) {
    alertaStockBajo.style.display = tieneStockBajo ? "inline-flex" : "none";
    alertaStockBajo.title = `Hay productos con stock de ${umbralStock} o menos`;
  }

  tablaProductosBody.innerHTML = "";

  filtrados.forEach((p) => {
    const colorStock = p.stock <= umbralStock ? 'color: #ff4d4f; font-weight: bold;' : '';
    
    tablaProductosBody.innerHTML += `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.categoria || "-"}</td>
        <td>${p.codigo_barras || "-"}</td>
        <td style="${colorStock}">${p.stock}</td>
        <td>$${p.precio.toFixed(2)}</td>
        <td>
        <div class="acciones-productos">
          <button class="btn-editar" data-id="${p.id}">Editar</button>
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
    .querySelectorAll(".btn-editar")
    .forEach((b) =>
      b.addEventListener("click", () => editarProducto(b.dataset.id))
    );

  // document
  //   .querySelectorAll(".btn-eliminar")
  //   .forEach((b) =>
  //     b.addEventListener("click", () => eliminarProducto(b.dataset.id))
  //   );
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
  codigoBarrasProducto.value = p.codigo_barras || "";
  stockProducto.value = p.stock;
  precioProducto.value = p.precio;

  // Lógica stock a ingresar
  document.getElementById("stockProducto").readOnly = true;
  document.getElementById("labelStockProducto").textContent = "Stock actual";
  document.getElementById("grupoStockIngresar").style.display = "block";
  document.getElementById("stockIngresarProducto").value = "";

  modalProducto.style.display = "flex";
}

// ------------------------------
// LIMPIAR FILTROS
// ------------------------------
  document
  .getElementById("btnLimpiarFiltrosProd")
  .addEventListener("click", () => {
    buscarProducto.value = "";
    filtroCategoria.value = "";
    if (filtroBajoStock) filtroBajoStock.checked = false;
    renderTablaProductos();
  });

  btnImportarExcel?.addEventListener("click", () => {
  inputExcelProductos.value = "";
  modalImportarExcel.style.display = "flex";
});

cerrarModalExcel?.addEventListener("click", () => {
  modalImportarExcel.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalImportarExcel) {
    modalImportarExcel.style.display = "none";
  }
});

btnProcesarExcel?.addEventListener("click", async () => {

  const file = inputExcelProductos.files[0];
  if (!file) {
    alert("Seleccioná un archivo Excel.");
    return;
  }

  const reader = new FileReader();

  reader.onload = async function (e) {

    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const json = XLSX.utils.sheet_to_json(worksheet);

    if (!json.length) {
      alert("El archivo está vacío.");
      return;
    }

    const productosExcel = json.map(row => ({
      nombre: row.nombre?.toString().trim(),
      categoria: row.categoria?.toString().trim() || null,
      precio: Number(row.precio),
      stock: Number(row.stock),
    }));

    try {
      await ProductosAPI.importar({
        comercio_id: comercioId,
        productos: productosExcel,
      });
      alert("Productos importados correctamente");
    } catch (err) {
      alert(err.message || "Error importando productos");
      return;
    }

    modalImportarExcel.style.display = "none";
    await cargarProductos();
    await cargarCategorias();
  };

  reader.readAsArrayBuffer(file);
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
});
