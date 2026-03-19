import fs from "fs";

const ruta = "./frontend/js/clientes.js";
let contenido = fs.readFileSync(ruta, "utf-8");

// Detectamos dónde se partió y reconstruimos
const indexQuiebre = contenido.indexOf("  <div class=\"resumen-item\">\r\n    <span>Total contado</span>");

if (indexQuiebre !== -1) {
    const parteSuperior = contenido.substring(0, indexQuiebre);
    
    const restoCorrecto = `  <div class="resumen-item">
    <span>Total contado</span>
    <strong>$\${totalContado.toFixed(2)}</strong>
  </div>
  <div class="resumen-item">
    <span>Saldo cuenta corriente</span>
    <strong>$\${saldo.toFixed(2)}</strong>
  </div>
  <div class="resumen-item">
    <span>Total general ventas</span>
    <strong>$\${totalGeneral.toFixed(2)}</strong>
  </div>
\`;

      document
        .querySelectorAll(".btn-ver-detalle")
        .forEach((b) =>
          b.addEventListener("click", () =>
            verDetalleVenta(b.dataset.id)
          )
        );
    }

    modalHistorial.style.display = "flex";
  } catch (error) {
    console.error(error);
    tablaHistorialBody.innerHTML =
      "<tr><td colspan='5'>Error inesperado</td></tr>";
  }
}

async function verDetalleVenta(ventaId) {
  try {
    const data = await VentasAPI.getDetalle(ventaId);
    
    // Obtenemos info del historial para mostrar en cabecera
    const infoVenta = historialActual.find((v) => v.id == ventaId);

    if (infoVenta) {
      document.getElementById("ticketIdDetalle").textContent = infoVenta.id;
      document.getElementById("ticketFechaDetalle").textContent = formatearFecha(infoVenta.fecha);
      document.getElementById("ticketMetodoDetalle").textContent = infoVenta.metodo_pago;
    }

    tablaDetalleBody.innerHTML = "";
    let total = 0;

    if (!data.length) {
      tablaDetalleBody.innerHTML =
        "<tr><td colspan='4'>Sin detalle disponible</td></tr>";
    } else {
      data.forEach((item) => {
        total += Number(item.subtotal);

        tablaDetalleBody.innerHTML += \`
          <tr>
            <td>\${item.producto_nombre || "-"}</td>
            <td>\${item.cantidad}</td>
            <td>$\${Number(item.precio_unitario).toFixed(2)}</td>
            <td>$\${Number(item.subtotal).toFixed(2)}</td>
          </tr>
        \`;
      });
    }

    detalleActual = data;
    ventaActualDetalle = ventaId;

    detalleTotal.textContent = total.toFixed(2);

    modalDetalle.style.display = "flex";
  } catch (error) {
    console.error(error);
    alert("Error inesperado al cargar el detalle");
  }
}

document
  .getElementById("btnDescargarHistorial")
  .addEventListener("click", () => {
    if (!historialActual.length) {
      alert("No hay datos para exportar");
      return;
    }

    const dataExcel = historialActual.map((v) => ({
      Fecha: formatearFecha(v.fecha),
      "ID Venta": v.id,
      "Método de Pago": v.metodo_pago,
      Total: Number(v.total),
    }));

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historial");

    XLSX.writeFile(wb, \`historial_cliente_\${clienteActualHistorial}.xlsx\`);
  });

document.getElementById("btnDescargarDetalle").addEventListener("click", () => {
  if (!detalleActual.length) {
    alert("No hay detalle para exportar");
    return;
  }

  const dataExcel = detalleActual.map((item) => ({
    Producto: item.producto_nombre,
    Cantidad: item.cantidad,
    "Precio Unitario": Number(item.precio_unitario),
    Subtotal: Number(item.subtotal),
  }));

  const ws = XLSX.utils.json_to_sheet(dataExcel);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Detalle");

  XLSX.writeFile(wb, \`detalle_venta_\${ventaActualDetalle}.xlsx\`);
});

btnCerrarHistorial.addEventListener("click", () => {
  modalHistorial.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalHistorial) modalHistorial.style.display = "none";
});

btnCerrarDetalle.addEventListener("click", () => {
  modalDetalle.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalDetalle) modalDetalle.style.display = "none";
});

document
  .getElementById("btnCuentaCorriente")
  .addEventListener("click", async () => {
    clienteActualCC = clienteActualHistorial;

    await cargarCuentaCorriente(clienteActualCC);

    modalCC.style.display = "flex";
  });

async function cargarCuentaCorriente(clienteId) {
  const dataSaldo = await ClientesAPI.getSaldo(clienteId, comercioId);
  const saldo = dataSaldo.saldo;

  ccSaldo.textContent = \`Saldo: $\${saldo.toFixed(2)}\`;
  ccSaldo.style.color = saldo > 0 ? "red" : "lime";

  const movimientos = await ClientesAPI.getCuentaCorriente(
    clienteId,
    comercioId,
  );

  tablaCC.innerHTML = "";

  movimientos.forEach((m) => {
    tablaCC.innerHTML += \`
      <tr>
        <td>\${formatearFecha(m.created_at)}</td>
        <td>\${m.tipo}</td>
        <td>\${m.tipo === "venta" ? "+" : "-"}$\${Number(m.monto).toFixed(2)}</td>
      </tr>
    \`;
  });
}

ccRegistrarPago.addEventListener("click", async () => {
  const monto = Number(ccMontoPago.value);

  if (!monto || monto <= 0) {
    alert("Monto inválido");
    return;
  }

  try {
    await ClientesAPI.registrarPago(clienteActualCC, {
      comercio_id: comercioId,
      monto,
    });
  } catch (error) {
    alert(error.message || "Error al registrar pago");
    return;
  }

  ccMontoPago.value = "";

  await cargarCuentaCorriente(clienteActualCC);
  await verHistorial(clienteActualCC);
  await cargarClientes();
});

btnCerrarCC.addEventListener("click", () => {
  modalCC.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modalCC) {
    modalCC.style.display = "none";
  }
});

function formatearFecha(fechaISO) {
  if (!fechaISO) return "—";

  const fecha = new Date(fechaISO);

  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const año = fecha.getFullYear();

  return \`\${dia}/\${mes}/\${año}\`;
}

// ===========================================================
// INIT
// ===========================================================
document.addEventListener("DOMContentLoaded", async () => {
  await cargarComercio();

  if (comercioId) {
    await cargarClientes();
  } else {
    console.error("No se pudo obtener comercioId");
  }
});

function escapeQuote(str) {
  if (!str) return "";
  return str.replace(/'/g, "\\\\'");
}
`;

    fs.writeFileSync(ruta, parteSuperior + restoCorrecto);
    console.log("Archivo clientes.js reparado exitosamente");
} else {
    console.log("No se pudo reparar el archivo, revisar string de corte.");
}
