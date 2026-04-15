import { ComercioAPI, CajasAPI } from "./api.js";

// =================================================
// SESIÓN / COMERCIO
// =================================================

// Obtiene datos de sesión almacenados
const session = JSON.parse(localStorage.getItem("session"));

// UID de Firebase asociado a la sesión
const firebaseUID = session?.uid;

// ID del comercio actual
let comercioId = session?.comercio_id || null;

/**
 * Carga el comercio asociado al usuario autenticado.
 */
async function cargarComercio() {
  if (!firebaseUID) return;

  const data = await ComercioAPI.getByUid(firebaseUID);
  comercioId = data.id;
}


// =================================================
// REFERENCIAS DEL DOM
// =================================================

const fechaHoySpan = document.getElementById("fechaHoy");
const estadoCajaSpan = document.getElementById("estadoCaja");

const bloqueApertura = document.getElementById("bloqueApertura");
const bloqueResumen = document.getElementById("bloqueResumen");

const saldoInicialInput = document.getElementById("saldoInicial");

const btnAbrirCaja = document.getElementById("btnAbrirCaja");
const btnCerrarCaja = document.getElementById("btnCerrarCaja");


// =================================================
// ESTADO GLOBAL
// =================================================

// Mantiene el estado actual de la caja del día
let cajaActual = null;


// =================================================
// UTILIDADES
// =================================================

/**
 * Muestra la fecha actual formateada.
 */
function formatearFechaHoy() {
  const hoy = new Date();
  fechaHoySpan.textContent = hoy.toLocaleDateString("es-AR");
}


// =================================================
// OBTENER CAJA DEL DÍA
// =================================================

/**
 * Consulta la caja del día para el comercio actual
 * y actualiza la interfaz según el estado.
 */
async function obtenerCaja() {
  cajaActual = await CajasAPI.getHoy(comercioId);

  // Verificamos si la caja devuelta es de un día anterior y sigue abierta
  if (cajaActual && cajaActual.estado === "abierta") {
    const hoy = new Date();
    // La DB devuelve la fecha (generalmente un string ISO o timestamp sin timezone)
    // Creamos localmente la fecha de la caja teniendo cuidado de usar horas locales para evitar el desfasaje del UTC
    // Un simple slice para parsearla como local ayuda a evitar que "2023-01-02T00:00:00.000Z" se vea como día - 1
    const [year, month, day] = cajaActual.fecha.split("T")[0].split("-");
    const fechaCajaDate = new Date(year, month - 1, day);

    // Comparamos anio, mes, y día puramente
    const esDiaAnterior = 
      fechaCajaDate.getDate() !== hoy.getDate() ||
      fechaCajaDate.getMonth() !== hoy.getMonth() ||
      fechaCajaDate.getFullYear() !== hoy.getFullYear();

    if (esDiaAnterior) {
      alert("¡Atención! Tienes una caja abierta de días anteriores. Debes cerrarla antes de continuar operando el día de hoy.");
      
      // Forzamos a mostrar la caja abierta para que la pueda cerrar
      estadoCajaSpan.textContent = `Abierta (${fechaCajaDate.toLocaleDateString("es-AR")})`;
      bloqueApertura.style.display = "none";
      bloqueResumen.style.display = "block";
      
      await calcularResumen();
      return; // Detenemos la ejecución normal para obligarlo a quedarse en este estado visual
    }
  }

  if (!cajaActual) {
    estadoCajaSpan.textContent = "Sin abrir";
    bloqueApertura.style.display = "flex";
    bloqueResumen.style.display = "none";

  } else if (cajaActual.estado === "abierta") {
    estadoCajaSpan.textContent = "Abierta";
    bloqueApertura.style.display = "none";
    bloqueResumen.style.display = "block";

    await calcularResumen();

  } else if (cajaActual.estado === "cerrada") {
    estadoCajaSpan.textContent = "Cerrada";
    bloqueApertura.style.display = "none";
    bloqueResumen.style.display = "none";
  }
}


// =================================================
// CÁLCULO DE RESUMEN DE MOVIMIENTOS
// =================================================

async function calcularResumen() {
  const movimientos = await CajasAPI.getMovimientos(comercioId);

  const tbody = document.getElementById("tablaMovimientosBody");
  tbody.innerHTML = "";

  let saldo = Number(cajaActual?.saldo_inicial) || 0;

  let totalEfectivo = 0;
  let totalDigital = 0;
  let totalCuentaCorriente = 0;
  let totalEgresos = 0;
  let totalDevoluciones = 0;

  movimientos.forEach((m) => {

    if (m.tipo === "VENTA" && m.metodo_pago === "Cuenta Corriente") {
      // No sumamos al saldo físico
    } else if (m.tipo === "DEVOLUCION" && m.metodo_pago === "Cuenta Corriente") {
      // No restamos del saldo físico
    } else {
      saldo += m.ingreso - m.egreso;
    }

    if (m.tipo === "VENTA") {

      if (m.metodo_pago === "Efectivo") {
        totalEfectivo += m.ingreso;

      } else if (
        m.metodo_pago === "Debito" ||
        m.metodo_pago === "QR" ||
        m.metodo_pago === "Transferencia"
      ) {
        totalDigital += m.ingreso;

      } else if (m.metodo_pago === "Cuenta Corriente") {
        totalCuentaCorriente += m.ingreso;
      }
    }

    if (m.tipo === "DEVOLUCION") {
      totalDevoluciones += m.egreso;
    } else if (m.tipo === "GASTO") {
      totalEgresos += m.egreso;
    }

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${m.tipo}</td>
      <td>${m.descripcion}</td>
      <td>${m.ingreso > 0 ? "$" + m.ingreso.toFixed(2) : "-"}</td>
      <td>${m.egreso > 0 ? "$" + m.egreso.toFixed(2) : "-"}</td>
      <td>$${saldo.toFixed(2)}</td>
    `;

    tbody.appendChild(tr);
  });

  document.getElementById("totalEfectivo").textContent = totalEfectivo.toFixed(2);
  document.getElementById("totalDigital").textContent = totalDigital.toFixed(2);
  document.getElementById("totalCuentaCorriente").textContent = totalCuentaCorriente.toFixed(2);
  document.getElementById("totalEgresos").textContent = (totalEgresos + totalDevoluciones).toFixed(2);
  // Guardamos los valores particionados en el DOM invisible o como variable global temporal si hiciera falta.
  // Pero lo ideal es que al cerrar la caja, usemos re-calcular o sumemos todo.
  window.tempDevoluciones = totalDevoluciones;
  window.tempGastos = totalEgresos;
  document.getElementById("resultadoFinal").textContent = saldo.toFixed(2);
}


// =================================================
// EVENTO: ABRIR CAJA
// =================================================

btnAbrirCaja?.addEventListener("click", async () => {

  const saldo = Number(saldoInicialInput.value) || 0;

  try {
    const data = await CajasAPI.abrir({
      comercio_id: comercioId,
      saldo_inicial: saldo,
    });
  } catch (error) {
    alert(error.message || "Error al abrir caja");
    return;
  }

  await obtenerCaja();

  setTimeout(() => {
    window.location.href = "ventas.html";
  }, 1000);
});


// =================================================
// EVENTO: CERRAR CAJA
// =================================================

btnCerrarCaja?.addEventListener("click", async () => {

  const totalEfectivo = Number(
    document.getElementById("totalEfectivo").textContent
  );

  const totalDigital = Number(
    document.getElementById("totalDigital").textContent
  );

  const totalCuentaCorriente = Number(
    document.getElementById("totalCuentaCorriente").textContent
  );

  const totalEgresos = Number(
    document.getElementById("totalEgresos").textContent
  );

  const resultado = Number(
    document.getElementById("resultadoFinal").textContent
  );

  const totalVentasLimpias = totalEfectivo + totalDigital;

  try {
    await CajasAPI.cerrar(cajaActual.id, {
      total_ventas: totalVentasLimpias,
      total_gastos: window.tempGastos || 0,
      total_devoluciones: window.tempDevoluciones || 0,
      total_resultado: resultado,
      total_cuenta_corriente: totalCuentaCorriente
    });
  } catch (err) {
    alert("Error al cerrar la caja");
    return;
  }

  await obtenerCaja();
});


// =================================================
// INICIALIZACIÓN
// =================================================

document.addEventListener("DOMContentLoaded", async () => {

  formatearFechaHoy();

  await cargarComercio();

  if (comercioId) {
    await obtenerCaja();
  }
});

// =================================================
// HISTORIAL DE CAJAS
// =================================================

const btnHistorialCajas = document.getElementById("btnHistorialCajas");
const modalHistorialCajas = document.getElementById("modalHistorialCajas");
const cerrarModalHistorial = document.getElementById("cerrarModalHistorial");
const btnDescargarExcelHistorial = document.getElementById("btnDescargarExcelHistorial");
const historialCajasBody = document.getElementById("historialCajasBody");
let datosHistorialExcel = [];

btnHistorialCajas?.addEventListener("click", async () => {
  modalHistorialCajas.style.display = "flex";
  historialCajasBody.innerHTML = "<tr><td colspan='8' style='text-align: center'>Cargando...</td></tr>";
  
  try {
    const historial = await CajasAPI.getHistorial(comercioId);
    historialCajasBody.innerHTML = "";
    datosHistorialExcel = [];

    if (!historial || historial.length === 0) {
      historialCajasBody.innerHTML = "<tr><td colspan='8' style='text-align: center'>No hay historial de cajas</td></tr>";
      return;
    }

    historial.forEach((c) => {
      // Ajuste para evitar desfasaje de fecha UTC
      const fechaLocalArray = c.fecha ? c.fecha.split("T")[0].split("-") : null;
      let dateAperturaStr = fechaLocalArray ? `${fechaLocalArray[2]}/${fechaLocalArray[1]}/${fechaLocalArray[0]}` : "";
      
      const fechaCierre = c.hora_cierre 
        ? new Date(c.hora_cierre).toLocaleDateString("es-AR") 
        : `Sin Cerrar (${dateAperturaStr})`;
      
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${fechaCierre}</td>
        <td>${c.estado.toUpperCase()}</td>
        <td>$${Number(c.saldo_inicial).toFixed(2)}</td>
        <td>$${Number(c.total_ventas || 0).toFixed(2)}</td>
        <td>$${Number(c.total_cuenta_corriente || 0).toFixed(2)}</td>
        <td>$${Number(c.total_gastos || 0).toFixed(2)}</td>
        <td>$${Number(c.total_devoluciones || 0).toFixed(2)}</td>
        <td>$${Number(c.total_resultado || 0).toFixed(2)}</td>
      `;
      historialCajasBody.appendChild(tr);

      datosHistorialExcel.push({
        "Fecha": fechaCierre,
        "Estado": c.estado.toUpperCase(),
        "Saldo Inicial": Number(c.saldo_inicial),
        "Ventas": Number(c.total_ventas || 0),
        "Cuenta Corri.": Number(c.total_cuenta_corriente || 0),
        "Gastos": Number(c.total_gastos || 0),
        "Devoluciones": Number(c.total_devoluciones || 0),
        "Resultado Final": Number(c.total_resultado || 0)
      });
    });

  } catch (err) {
    console.error(err);
    historialCajasBody.innerHTML = "<tr><td colspan='8' style='text-align: center; color: red;'>Error al cargar historial</td></tr>";
  }
});

cerrarModalHistorial?.addEventListener("click", () => {
  modalHistorialCajas.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalHistorialCajas) modalHistorialCajas.style.display = "none";
});

btnDescargarExcelHistorial?.addEventListener("click", () => {
  if (datosHistorialExcel.length === 0) {
    alert("No hay datos para exportar");
    return;
  }
  const ws = XLSX.utils.json_to_sheet(datosHistorialExcel);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Historial_Cajas");
  XLSX.writeFile(wb, `Historial_Cajas_${new Date().toLocaleDateString("es-AR").replace(/\//g,'-')}.xlsx`);
});
