// ventas.js

// ------------------------------
// REFERENCIAS DEL DOM
// ------------------------------
const btnNuevaVenta = document.getElementById("btnNuevaVenta");
const modalVenta = document.getElementById("modalVenta");
const btnCerrarModal = document.querySelector(".v-close");

const fechaVenta = document.getElementById("fechaVenta");
const clienteVenta = document.getElementById("clienteVenta");
const productoVenta = document.getElementById("productoVenta");
const cantidadVenta = document.getElementById("cantidadVenta");
const descuentoVenta = document.getElementById("descuentoVenta");
const metodoPagoVenta = document.getElementById("metodoPagoVenta");
const totalVenta = document.getElementById("totalVenta");

const tablaVentasBody = document.getElementById("tablaVentasBody");

// ------------------------------
// API BASE
// ------------------------------
const API_URL = "http://localhost:4000/api";

// ------------------------------
// ABRIR MODAL
// ------------------------------
btnNuevaVenta.addEventListener("click", () => {
  limpiarFormulario();
  modalVenta.style.display = "flex";

  cargarClientes();
  cargarProductos();
});

// ------------------------------
// CERRAR MODAL
// ------------------------------
btnCerrarModal.addEventListener("click", () => {
  modalVenta.style.display = "none";
});

// Cerrar tocando afuera
window.addEventListener("click", (e) => {
  if (e.target === modalVenta) {
    modalVenta.style.display = "none";
  }
});

// ------------------------------
// LIMPIAR FORMULARIO
// ------------------------------
function limpiarFormulario() {
  fechaVenta.value = "";
  clienteVenta.value = "";
  productoVenta.value = "";
  cantidadVenta.value = 1;
  descuentoVenta.value = 0;
  metodoPagoVenta.value = "";
  totalVenta.value = "";
}

// ------------------------------
// CALCULAR TOTAL AUTOMÁTICO
// ------------------------------
let precioActual = 0;

cantidadVenta.addEventListener("input", calcularTotal);
descuentoVenta.addEventListener("change", calcularTotal);
productoVenta.addEventListener("change", calcularTotal);

async function calcularTotal() {
  const productoId = productoVenta.value;
  const cantidad = Number(cantidadVenta.value) || 1;
  const descuento = Number(descuentoVenta.value) || 0;

  if (!productoId) {
    totalVenta.value = "";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/productos/${productoId}`);
    const data = await res.json();

    precioActual = Number(data.precio);

    const subtotal = precioActual * cantidad;

    // ✔ Descuento PORCENTUAL corregido
    const descuentoAplicado = subtotal * (descuento / 100);

    const total = subtotal - descuentoAplicado;

    totalVenta.value = total.toFixed(2);
  } catch (error) {
    console.error("Error obteniendo precio:", error);
  }
}

// ------------------------------
// CARGAR CLIENTES
// ------------------------------
async function cargarClientes() {
  try {
    const res = await fetch(`${API_URL}/clientes`);
    const clientes = await res.json();

    clienteVenta.innerHTML = `<option value="">Seleccionar cliente</option>`;

    clientes.forEach((c) => {
      clienteVenta.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
    });
  } catch (error) {
    console.error("Error cargando clientes:", error);
  }
}

// ------------------------------
// CARGAR PRODUCTOS
// ------------------------------
async function cargarProductos() {
  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();

    productoVenta.innerHTML = `<option value="">Seleccionar producto</option>`;

    productos.forEach((p) => {
      productoVenta.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
    });
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

// ------------------------------
// CARGAR VENTAS EN TABLA
// ------------------------------
async function cargarVentas() {
  try {
    const res = await fetch(`${API_URL}/ventas`);
    let ventas = await res.json();

    // ✔ ORDEN DESCENDENTE (Últimas primero)
    ventas = ventas.sort((a, b) => b.id - a.id);

    tablaVentasBody.innerHTML = "";

    ventas.forEach((v) => {
      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td>${v.id}</td>
        <td>${formatearFecha(v.fecha)}</td>
        <td>${v.cliente_nombre || "—"}</td>
        <td>${v.producto_nombre || "—"}</td>
        <td>$${Number(v.precio).toFixed(2)}</td>
        <td>${v.cantidad}</td>
        <td>${parseInt(v.descuento)}%</td>
        <td>${v.metodo_pago || "—"}</td>
        <td>$${Number(v.total).toFixed(2)}</td>
        <td>
          <button class="btn-eliminar" data-id="${v.id}">Eliminar</button>
        </td>
      `;

      tablaVentasBody.appendChild(fila);
    });

    // ✔ ACTIVAR BOTONES DE ELIMINAR
    activarBotonesEliminar();
  } catch (error) {
    console.error("Error al cargar ventas:", error);
  }
}

// ------------------------------
// ACTIVAR BOTONES DE ELIMINAR
// ------------------------------
function activarBotonesEliminar() {
  const botones = document.querySelectorAll(".btn-eliminar");

  botones.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      if (!confirm("¿Eliminar esta venta?")) return;

      try {
        const res = await fetch(`${API_URL}/ventas/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("No se pudo eliminar");

        cargarVentas();
      } catch (error) {
        console.error("Error eliminando venta:", error);
        alert("Error al eliminar la venta");
      }
    });
  });
}

// ------------------------------
// FORMATEAR FECHA
// ------------------------------
function formatearFecha(fechaISO) {
  if (!fechaISO) return "—";
  const f = new Date(fechaISO);
  return f.toLocaleDateString("es-AR");
}

// ------------------------------
// GUARDAR VENTA
// ------------------------------
document
  .querySelector(".v-form-venta")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!precioActual) {
      alert("Seleccioná un producto válido.");
      return;
    }

    const venta = {
      fecha: fechaVenta.value,
      cliente_id: clienteVenta.value,
      producto_id: productoVenta.value,
      cantidad: Number(cantidadVenta.value),
      precio: precioActual,
      descuento: Number(descuentoVenta.value),
      metodo_pago: metodoPagoVenta.value,
    };

    try {
      const res = await fetch(`${API_URL}/ventas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(venta),
      });

      if (!res.ok) throw new Error("Error al guardar venta");

      modalVenta.style.display = "none";

      cargarVentas();

      alert("✔ Venta registrada correctamente");
    } catch (error) {
      console.error(error);
      alert("Error guardando venta");
    }
  });

document.addEventListener("DOMContentLoaded", cargarVentas);
