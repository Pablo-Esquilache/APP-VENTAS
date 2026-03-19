import { ReportesAPI, ExportarAPI } from "./api.js";

// ============================
// reportes.js completo con etiquetas y paleta de colores
// ============================

const { jsPDF } = window.jspdf;

let graficoVG = null;
let graficoTopProductos = null;
let graficoCategorias = null;
let graficoEdadEtarioGenero = null;
let graficoMetodosPago = null;
let graficoGastosDescripcionTipo = null;
let graficoVentasLocalidad = null;
let graficoTopClientes = null;

// Paleta de colores unificada
const paletaColores = [
  "#3fd18c", // verde principal
  "#36A2EB", // azul
  "#FFCE56", // amarillo
  "#FF6384", // rosa
  "#FF8333", // naranja
  "#A633FF", // morado
  "#8AFF33", // verde claro
  "#33FFF3", // celeste
  "#FF33A6", // fucsia
  "#FF3333", // rojo
];

//FORMATEADOR DE PRECIO
const formatoPesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
});

//
function setDescripcion(selector, texto) {
  const el = document.querySelector(selector);
  if (el) el.textContent = texto;
}

// ============================
// Ventas vs gastos + ticket promedio
// ============================
async function cargarVentasGastosTiempo() {
  try {
    const session = JSON.parse(localStorage.getItem("session"));
    const comercioId = session.comercio_id;

    const desde = document.getElementById("rDesde").value;
    const hasta = document.getElementById("rHasta").value;

    const data = await ReportesAPI.getVentasGastosTiempo(
      comercioId,
      desde,
      hasta,
    );
    renderGraficoVentasGastos(data);
  } catch (error) {
    console.error(error);
    alert("No se pudieron cargar los reportes");
  }
}

function renderGraficoVentasGastos(data) {
  const labels = data.map((d) => new Date(d.periodo).toLocaleDateString());
  const ventas = data.map((d) => Number(d.total_ventas));
  const gastos = data.map((d) => Number(d.total_gastos));
  const ticket = data.map((d) =>
    d.ticket_promedio ? Number(d.ticket_promedio) : null
  );

  const canvas = document.getElementById("graficoVentasGastos");
  const ctx = canvas.getContext("2d");

  const maxVentas = Math.max(...ventas);
  const maxGastos = Math.max(...gastos);
  const maxTicket = Math.max(...ticket.filter((v) => v !== null));

  setDescripcion(
    ".app-ventas-gastos",
    `Este gráfico muestra la evolución de las ventas, los gastos y el ticket promedio en el período seleccionado. 
   El mayor nivel de ventas fue de ${formatoPesos.format(
     maxVentas
   )}, el gasto máximo alcanzó ${formatoPesos.format(maxGastos)} 
   y el ticket promedio más alto fue de ${formatoPesos.format(maxTicket)}.`
  );

  if (graficoVG) graficoVG.destroy();

  graficoVG = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Ventas",
          data: ventas,
          tension: 0.3,
          backgroundColor: paletaColores[0],
          borderColor: paletaColores[0],
          fill: false,
        },
        {
          label: "Gastos",
          data: gastos,
          tension: 0.3,
          backgroundColor: paletaColores[1],
          borderColor: paletaColores[1],
          fill: false,
        },
        {
          label: "Ticket promedio",
          data: ticket,
          tension: 0.3,
          backgroundColor: paletaColores[2],
          borderColor: paletaColores[2],
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: true },

        tooltip: {
          callbacks: {
            label: (context) =>
              `${context.dataset.label}: ${formatoPesos.format(
                context.parsed.y
              )}`,
          },
        },

        datalabels: {
          display: true,
          color: "#fff",
          anchor: "end",
          align: "top",
          formatter: (value) =>
            value !== null ? formatoPesos.format(value) : "",
        },
      },
      scales: {
        y: {
          ticks: {
            callback: (value) => formatoPesos.format(value),
          },
          title: {
            display: true,
            text: "Importes / Ticket promedio",
          },
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}

// ============================
// Top 10 productos
// ============================
async function cargarTopProductos() {
  try {
    const session = JSON.parse(localStorage.getItem("session"));
    const comercioId = session.comercio_id;

    const desde = document.getElementById("rDesde").value;
    const hasta = document.getElementById("rHasta").value;

    const data = await ReportesAPI.getTopProductos(
      comercioId,
      desde,
      hasta,
    );
    renderTopProductos(data);
  } catch (error) {
    console.error(error);
    alert("No se pudo cargar el top de productos");
  }
}

function renderTopProductos(data) {
  const labels = data.map((d) => d.producto);
  const cantidades = data.map((d) => Number(d.cantidad_vendida));
  const importes = data.map((d) => Number(d.total_vendido));

  const ctx = document.getElementById("graficoTopProductos").getContext("2d");
  if (graficoTopProductos) graficoTopProductos.destroy();

  const topProducto = data[0];

  setDescripcion(
    ".app-top-productos",
    `Este gráfico presenta los 10 productos más vendidos, ordenados por cantidad. 
   El producto con mayor salida es ${topProducto.producto}, con ${
      topProducto.cantidad_vendida
    } unidades vendidas 
   y un importe total de ${formatoPesos.format(topProducto.total_vendido)}.`
  );

  graficoTopProductos = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Cantidad vendida",
          data: cantidades,
          xAxisID: "x",
          backgroundColor: paletaColores[0],
        },
        {
          label: "Importe vendido",
          data: importes,
          xAxisID: "x1",
          backgroundColor: paletaColores[1],
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: true },

        tooltip: {
          callbacks: {
            label: (context) => {
              if (context.dataset.label === "Importe vendido") {
                return `${context.dataset.label}: ${formatoPesos.format(
                  context.parsed.x
                )}`;
              }
              return `${context.dataset.label}: ${context.parsed.x}`;
            },
          },
        },

        datalabels: {
          display: true,
          color: "#fff",
          anchor: "end",
          align: "right",
          formatter: (value, context) => {
            return context.dataset.label === "Importe vendido"
              ? formatoPesos.format(value)
              : value;
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          title: { display: true, text: "Cantidad" },
        },
        x1: {
          type: "linear",
          position: "top",
          grid: { drawOnChartArea: false },
          title: { display: true, text: "Importe" },
          ticks: {
            callback: (value) => formatoPesos.format(value),
          },
        },
        y: {
          title: { display: true, text: "Producto" },
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}

// ============================
// Categorías vendidas
// ============================
async function cargarCategoriasVendidas() {
  try {
    const session = JSON.parse(localStorage.getItem("session"));
    const comercioId = session.comercio_id;

    const desde = document.getElementById("rDesde").value;
    const hasta = document.getElementById("rHasta").value;

    const data = await ReportesAPI.getCategoriasVendidas(
      comercioId,
      desde,
      hasta,
    );
    renderCategoriasVendidas(data);
  } catch (error) {
    console.error(error);
    alert("No se pudo cargar el reporte de categorías");
  }
}

function renderCategoriasVendidas(data) {
  const labels = data.map((d) => d.categoria);
  const importes = data.map((d) => d.importe_total);
  const porcentajes = data.map((d) => d.porcentaje);

  const canvas = document.getElementById("graficoCategorias");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  const topCategoria = data.reduce((a, b) =>
    a.importe_total > b.importe_total ? a : b
  );

  setDescripcion(
    ".app-categorias",
    `Este gráfico muestra la distribución de las ventas por categoría de producto. 
   En el período analizado, la categoría con mayor facturación fue ${
     topCategoria.categoria
   }, 
   con un importe total de ${formatoPesos.format(topCategoria.importe_total)}.`
  );

  if (graficoCategorias) graficoCategorias.destroy();

  graficoCategorias = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          label: "Importe vendido",
          data: importes,
          backgroundColor: labels.map(
            (_, i) => paletaColores[i % paletaColores.length]
          ),
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: true, position: "right" },
        tooltip: {
          callbacks: {
            label: function (context) {
              const i = context.dataIndex;
              return `${context.label}: $${importes[i]} (${porcentajes[i]}%)`;
            },
          },
        },
        datalabels: {
          display: true,
          color: "#fff",
          formatter: (value) => `$${value}`,
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}

// ============================
// Edad promedio por grupo y género
// ============================
async function cargarEdadEtarioGenero() {
  const session = JSON.parse(localStorage.getItem("session"));
  const comercioId = session.comercio_id;

  const desde = document.getElementById("rDesde").value;
  const hasta = document.getElementById("rHasta").value;

  const data = await ReportesAPI.getEdadEtarioGenero(
    comercioId,
    desde,
    hasta,
  );
  renderEdadEtarioGenero(data);
}

function renderEdadEtarioGenero(data) {
  const importePorGrupo = {};
  data.forEach((d) => {
    importePorGrupo[d.grupo_etario] =
      (importePorGrupo[d.grupo_etario] || 0) + Number(d.importe_total);
  });

  const grupos = Object.keys(importePorGrupo).sort(
    (a, b) => importePorGrupo[b] - importePorGrupo[a]
  );
  const generos = ["Masculino", "Femenino", "Otro"];

  const datasets = generos.map((g, idx) => ({
    label: g,
    data: grupos.map((gr) => {
      const r = data.find((d) => d.grupo_etario === gr && d.genero === g);
      return r ? Number(r.edad_promedio) : null;
    }),
    backgroundColor: paletaColores[idx],
  }));

  const ctx = document
    .getElementById("graficoEdadEtarioGenero")
    .getContext("2d");
  if (graficoEdadEtarioGenero) graficoEdadEtarioGenero.destroy();

  const grupoTop = Object.entries(importePorGrupo).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  const registrosGrupo = data.filter((d) => d.grupo_etario === grupoTop);
  const totalCompras = registrosGrupo.reduce(
    (a, b) => a + Number(b.cantidad_compras),
    0
  );
  const totalImporte = registrosGrupo.reduce(
    (a, b) => a + Number(b.importe_total),
    0
  );

  setDescripcion(
    ".app-etario-genero",
    `Este gráfico muestra la distribución de los clientes por grupo etario y género. 
   El grupo con mayor participación es ${grupoTop}, con ${totalCompras} compras realizadas 
   y un importe total de ${formatoPesos.format(totalImporte)}.`
  );

  graficoEdadEtarioGenero = new Chart(ctx, {
    type: "bar",
    data: { labels: grupos, datasets },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        tooltip: {
          callbacks: {
            afterLabel: function (context) {
              const r = data.find(
                (d) =>
                  d.grupo_etario === context.label &&
                  d.genero === context.dataset.label
              );
              return r
                ? `Importe: $${r.importe_total} | Compras: ${r.cantidad_compras}`
                : "";
            },
          },
        },
        datalabels: {
          display: true,
          color: "#fff",
          anchor: "end",
          align: "top",
          formatter: (value) => value,
        },
      },
      scales: { y: { title: { display: true, text: "Edad promedio" } } },
    },
    plugins: [ChartDataLabels],
  });
}

// ============================
// Métodos de pago
// ============================
async function cargarMetodosPago() {
  const session = JSON.parse(localStorage.getItem("session"));
  const comercioId = session.comercio_id;

  const desde = document.getElementById("rDesde").value;
  const hasta = document.getElementById("rHasta").value;

  const data = await ReportesAPI.getMetodosPago(comercioId, desde, hasta);
  renderMetodosPago(data);
}

function renderMetodosPago(data) {
  data.sort((a, b) => Number(b.importe_total) - Number(a.importe_total));

  const labels = data.map((d) => d.metodo_pago);
  const importes = data.map((d) => Number(d.importe_total));
  const porcentajes = data.map((d) => d.porcentaje);
  const cantidades = data.map((d) => d.cantidad_ventas);

  const canvas = document.getElementById("graficoMetodosPago");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  const topMetodo = data[0];

  setDescripcion(
    ".app-metodos-pago",
    `Este gráfico refleja cómo se distribuyen las ventas según el método de pago utilizado. 
   El método más utilizado fue ${topMetodo.metodo_pago}, con ${
      topMetodo.cantidad_ventas
    } ventas 
   y un importe total de ${formatoPesos.format(topMetodo.importe_total)}.`
  );

  if (graficoMetodosPago) graficoMetodosPago.destroy();

  graficoMetodosPago = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data: importes,
          backgroundColor: labels.map(
            (_, i) => paletaColores[i % paletaColores.length]
          ),
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: { position: "right" },
        tooltip: {
          callbacks: {
            label: function (context) {
              const i = context.dataIndex;
              return `${context.label}: $${importes[i]} (${porcentajes[i]}%) | Ventas: ${cantidades[i]}`;
            },
          },
        },
        datalabels: {
          display: true,
          color: "#fff",
          formatter: (value) => `$${value}`,
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}

// ============================
// Gastos por descripción y tipo
// ============================
async function cargarGastosDescripcionTipo() {
  const session = JSON.parse(localStorage.getItem("session"));
  const comercioId = session.comercio_id;

  const desde = document.getElementById("rDesde").value;
  const hasta = document.getElementById("rHasta").value;

  const data = await ReportesAPI.getGastosDescripcionTipo(
    comercioId,
    desde,
    hasta,
  );

  renderGastosDescripcionTipo(data);
}

function renderGastosDescripcionTipo(data) {
  const descripciones = [...new Set(data.map((d) => d.descripcion))];

  const fijos = descripciones.map((desc) => {
    const r = data.find((d) => d.descripcion === desc && d.tipo === "fijo");
    return r ? Number(r.importe) : 0;
  });

  const variables = descripciones.map((desc) => {
    const r = data.find((d) => d.descripcion === desc && d.tipo === "variable");
    return r ? Number(r.importe) : 0;
  });

  const ctx = document
    .getElementById("graficoGastosDescripcionTipo")
    .getContext("2d");

  if (graficoGastosDescripcionTipo) graficoGastosDescripcionTipo.destroy();

  if (!data || data.length === 0) {
    setDescripcion(".app-gastos", "No hay datos de gastos en este período.");
    return;
  }

  const gastoTop = data.reduce((a, b) =>
    Number(a.importe) > Number(b.importe) ? a : b
  );

  setDescripcion(
    ".app-gastos",
    `Este gráfico muestra la distribución de los gastos según su descripción y tipo. 
   El gasto más alto corresponde a "${gastoTop.descripcion}", de tipo ${
      gastoTop.tipo
    }, 
   con un importe total de ${formatoPesos.format(gastoTop.importe)}.`
  );

  graficoGastosDescripcionTipo = new Chart(ctx, {
    type: "bar",
    data: {
      labels: descripciones,
      datasets: [
        {
          label: "Gastos fijos",
          data: fijos,
          backgroundColor: paletaColores[0],
        },
        {
          label: "Gastos variables",
          data: variables,
          backgroundColor: paletaColores[1],
        },
      ],
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: true },

        tooltip: {
          callbacks: {
            label: (context) =>
              `${context.dataset.label}: ${formatoPesos.format(
                context.parsed.y
              )}`,
          },
        },

        datalabels: {
          display: true,
          color: "#fff",
          anchor: "end",
          align: "top",
          formatter: (value) => formatoPesos.format(value),
        },
      },
      scales: {
        x: {
          stacked: true,
          title: { display: true, text: "Descripción del gasto" },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: { display: true, text: "Importe total" },
          ticks: {
            callback: (value) => formatoPesos.format(value),
          },
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}

//VENTAS POR LOCALIDAD
async function cargarVentasPorLocalidad() {
  try {
    const session = JSON.parse(localStorage.getItem("session"));
    const comercioId = session.comercio_id;

    const desde = document.getElementById("rDesde").value;
    const hasta = document.getElementById("rHasta").value;

    const data = await ReportesAPI.getVentasPorLocalidad(
      comercioId,
      desde,
      hasta,
    );
    renderVentasPorLocalidad(data);
  } catch (error) {
    console.error(error);
    alert("No se pudo cargar el gráfico de ventas por localidad");
  }
}

function renderVentasPorLocalidad(data) {
  const labels = data.map((d) => d.localidad);
  const valores = data.map((d) => Number(d.cantidad_ventas));

  const ctx = document
    .getElementById("graficoVentasLocalidad")
    .getContext("2d");

  if (graficoVentasLocalidad) graficoVentasLocalidad.destroy();

  const topLocalidad = data[0];

  setDescripcion(
    ".app-localidad",
    `Este gráfico presenta la cantidad de ventas realizadas por localidad del cliente. 
   La localidad con mayor volumen de ventas es ${topLocalidad.localidad}, 
   con un total de ${topLocalidad.cantidad_ventas} ventas.`
  );

  graficoVentasLocalidad = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Cantidad de ventas",
          data: valores,
          backgroundColor: labels.map(
            (_, i) => paletaColores[i % paletaColores.length]
          ),
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `Ventas: ${context.parsed.y}`,
          },
        },
        datalabels: {
          display: true,
          color: "#fff",
          anchor: "end",
          align: "top",
          formatter: (value) => value,
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Localidad" },
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: "Cantidad de ventas" },
          ticks: { precision: 0 },
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}

//TOP 10 CLIENTES+FRECUENDIA+TICKET RPOMEDIO
async function cargarTopClientesFrecuenciaTicket() {
  const session = JSON.parse(localStorage.getItem("session"));
  const comercioId = session.comercio_id;

  const desde = document.getElementById("rDesde").value;
  const hasta = document.getElementById("rHasta").value;

  const data = await ReportesAPI.getTopClientesFrecuenciaTicket(
    comercioId,
    desde,
    hasta,
  );

  renderTopClientesFrecuenciaTicket(data);
}

function renderTopClientesFrecuenciaTicket(data) {
  const labels = data.map((d) => d.cliente);
  const cantidades = data.map((d) => Number(d.cantidad_compras));
  const tickets = data.map((d) => Number(d.ticket_promedio));

  const ctx = document.getElementById("graficoTopClientes").getContext("2d");

  if (graficoTopClientes) graficoTopClientes.destroy();

  const topCliente = data[0];

  setDescripcion(
    ".app-top-clientes",
    `Este gráfico muestra los clientes con mayor frecuencia de compra y su ticket promedio. 
   El cliente más habitual es ${topCliente.cliente}, con ${
      topCliente.cantidad_compras
    } compras realizadas 
   y un ticket promedio de ${formatoPesos.format(topCliente.ticket_promedio)}.`
  );

  graficoTopClientes = new Chart(ctx, {
    data: {
      labels,
      datasets: [
        {
          type: "bar",
          label: "Cantidad de compras",
          data: cantidades,
          backgroundColor: paletaColores[0],
          xAxisID: "x",
        },
        {
          type: "line",
          label: "Ticket promedio",
          data: tickets,
          borderColor: paletaColores[1],
          backgroundColor: paletaColores[1],
          xAxisID: "x1", // 👈 eje independiente
          tension: 0.3,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              return context.dataset.label === "Ticket promedio"
                ? `${context.dataset.label}: ${formatoPesos.format(
                    context.parsed.x
                  )}`
                : `${context.dataset.label}: ${context.parsed.x}`;
            },
          },
        },
        datalabels: {
          color: "#fff",
          anchor: "end",
          align: "right",
          formatter: (value, ctx) =>
            ctx.dataset.label === "Ticket promedio"
              ? formatoPesos.format(value)
              : value,
        },
      },
      scales: {
        x: {
          position: "bottom",
          title: {
            display: true,
            text: "Cantidad de compras",
          },
          ticks: {
            precision: 0,
          },
        },
        x1: {
          position: "top",
          grid: {
            drawOnChartArea: false,
          },
          title: {
            display: true,
            text: "Ticket promedio",
          },
          ticks: {
            callback: (v) => formatoPesos.format(v),
          },
        },
        y: {
          ticks: {
            autoSkip: false,
          },
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}

// ============================
// Descargar PDF
// ============================
async function descargarPDF() {
  const contenedor = document.getElementById("reportePDF");

  const canvas = await html2canvas(contenedor, {
    scale: 2,
    backgroundColor: "#1f1f1f",
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = 210;
  const pdfHeight = 297;

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position -= pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save("reporte.pdf");
}

//DESCARGAR TABLAS

document
  .getElementById("btnDescargarTabla")
  .addEventListener("click", async () => {
    const tabla = document.getElementById("selectTablaDescargar").value;

    try {
      // Usaremos fetch directo aca por la lógica de blob particular
      const API_BASE = "http://localhost:4000/api";
      const res = await fetch(`${API_BASE}/exportar-tabla?tabla=${tabla}`);
      if (!res.ok) throw new Error("Error al descargar tabla");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tabla}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("No se pudo descargar la tabla");
    }
  });

// ============================
// Inicialización
// ============================
document.addEventListener("DOMContentLoaded", () => {

  document
    .getElementById("btnGenerarReportes")
    .addEventListener("click", () => {
      cargarVentasGastosTiempo();
      cargarTopProductos();
      cargarCategoriasVendidas();
      cargarEdadEtarioGenero();
      cargarMetodosPago();
      cargarGastosDescripcionTipo();
      cargarVentasPorLocalidad();
      cargarTopClientesFrecuenciaTicket();

      document.getElementById("btnDescargarPDF").disabled = false;
    });

  document
    .getElementById("btnDescargarPDF")
    .addEventListener("click", descargarPDF);
});
