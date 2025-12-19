// ============================
// reportes.js completo con etiquetas y paleta de colores
// ============================

const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:4000/api"
    : "https://app-ventas-gvdk.onrender.com/api";


let graficoVG = null;
let graficoTopProductos = null;
let graficoCategorias = null;
let graficoEdadEtarioGenero = null;
let graficoMetodosPago = null;
let graficoGastosDescripcionTipo = null;

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

// ============================
// Ventas vs gastos + ticket promedio
// ============================
async function cargarVentasGastosTiempo() {
  try {
    const session = JSON.parse(localStorage.getItem("session"));
    const comercioId = session.comercio_id;

    const desde = document.getElementById("rDesde").value;
    const hasta = document.getElementById("rHasta").value;

    let url = `${API_BASE}/reportes/ventas-gastos-tiempo?comercio_id=${comercioId}&agrupacion=dia`;
    if (desde) url += `&desde=${desde}`;
    if (hasta) url += `&hasta=${hasta}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al obtener datos");
    const data = await res.json();
    renderGraficoVentasGastos(data);
  } catch (error) {
    console.error(error);
    alert("No se pudieron cargar los reportes");
  }
}

function renderGraficoVentasGastos(data) {
  const labels = data.map(d => new Date(d.periodo).toLocaleDateString());
  const ventas = data.map(d => Number(d.total_ventas));
  const gastos = data.map(d => Number(d.total_gastos));
  const ticket = data.map(d => d.ticket_promedio ? Number(d.ticket_promedio) : null);

  const canvas = document.getElementById("graficoVentasGastos");
  const ctx = canvas.getContext("2d");

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
              `${context.dataset.label}: ${formatoPesos.format(context.parsed.y)}`
          }
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

    let url = `${API_BASE}/reportes/top-productos?comercio_id=${comercioId}&limit=10`;
    if (desde) url += `&desde=${desde}`;
    if (hasta) url += `&hasta=${hasta}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al obtener top productos");
    const data = await res.json();
    renderTopProductos(data);
  } catch (error) {
    console.error(error);
    alert("No se pudo cargar el top de productos");
  }
}

function renderTopProductos(data) {
  const labels = data.map(d => d.producto);
  const cantidades = data.map(d => Number(d.cantidad_vendida));
  const importes = data.map(d => Number(d.total_vendido));

  const ctx = document.getElementById("graficoTopProductos").getContext("2d");
  if (graficoTopProductos) graficoTopProductos.destroy();

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
                return `${context.dataset.label}: ${formatoPesos.format(context.parsed.x)}`;
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

    let url = `${API_BASE}/reportes/categorias-vendidas?comercio_id=${comercioId}`;
    if (desde) url += `&desde=${desde}`;
    if (hasta) url += `&hasta=${hasta}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al obtener categorías vendidas");

    const data = await res.json();
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

  if (graficoCategorias) graficoCategorias.destroy();

  graficoCategorias = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        { label: "Importe vendido", data: importes, backgroundColor: labels.map((_, i) => paletaColores[i % paletaColores.length]) },
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

  let url = `${API_BASE}/reportes/edad-etario-genero?comercio_id=${comercioId}`;
  if (desde) url += `&desde=${desde}`;
  if (hasta) url += `&hasta=${hasta}`;

  const res = await fetch(url);
  const data = await res.json();
  renderEdadEtarioGenero(data);
}

function renderEdadEtarioGenero(data) {
  const importePorGrupo = {};
  data.forEach((d) => {
    importePorGrupo[d.grupo_etario] = (importePorGrupo[d.grupo_etario] || 0) + Number(d.importe_total);
  });

  const grupos = Object.keys(importePorGrupo).sort((a, b) => importePorGrupo[b] - importePorGrupo[a]);
  const generos = ["Masculino", "Femenino", "Otro"];

  const datasets = generos.map((g, idx) => ({
    label: g,
    data: grupos.map((gr) => {
      const r = data.find((d) => d.grupo_etario === gr && d.genero === g);
      return r ? Number(r.edad_promedio) : null;
    }),
    backgroundColor: paletaColores[idx],
  }));

  const ctx = document.getElementById("graficoEdadEtarioGenero").getContext("2d");
  if (graficoEdadEtarioGenero) graficoEdadEtarioGenero.destroy();

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
              const r = data.find((d) => d.grupo_etario === context.label && d.genero === context.dataset.label);
              return r ? `Importe: $${r.importe_total} | Compras: ${r.cantidad_compras}` : "";
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

  let url = `${API_BASE}/reportes/metodos-pago?comercio_id=${comercioId}`;
  if (desde) url += `&desde=${desde}`;
  if (hasta) url += `&hasta=${hasta}`;

  const res = await fetch(url);
  const data = await res.json();
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

  if (graficoMetodosPago) graficoMetodosPago.destroy();

  graficoMetodosPago = new Chart(ctx, {
    type: "pie",
    data: { labels, datasets: [{ data: importes, backgroundColor: labels.map((_, i) => paletaColores[i % paletaColores.length]) }] },
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

  let url = `${API_BASE}/reportes/gastos-descripcion-tipo?comercio_id=${comercioId}`;
  if (desde) url += `&desde=${desde}`;
  if (hasta) url += `&hasta=${hasta}`;

  const res = await fetch(url);
  const data = await res.json();
  renderGastosDescripcionTipo(data);
}

function renderGastosDescripcionTipo(data) {
  const descripciones = [...new Set(data.map(d => d.descripcion))];

  const fijos = descripciones.map(desc => {
    const r = data.find(d => d.descripcion === desc && d.tipo === "fijo");
    return r ? Number(r.importe) : 0;
  });

  const variables = descripciones.map(desc => {
    const r = data.find(d => d.descripcion === desc && d.tipo === "variable");
    return r ? Number(r.importe) : 0;
  });

  const ctx = document
    .getElementById("graficoGastosDescripcionTipo")
    .getContext("2d");

  if (graficoGastosDescripcionTipo) graficoGastosDescripcionTipo.destroy();

  graficoGastosDescripcionTipo = new Chart(ctx, {
    type: "bar",
    data: {
      labels: descripciones,
      datasets: [
        { label: "Gastos fijos", data: fijos, backgroundColor: paletaColores[0] },
        { label: "Gastos variables", data: variables, backgroundColor: paletaColores[1] },
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
              `${context.dataset.label}: ${formatoPesos.format(context.parsed.y)}`,
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

// ============================
// Descargar PDF
// ============================
async function descargarPDF() {
  const { jsPDF } = window.jspdf;
  const contenedor = document.getElementById("reportePDF");

  const canvas = await html2canvas(contenedor, { scale: 2, backgroundColor: "#1f1f1f", useCORS: true });

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

document.getElementById("btnDescargarTabla").addEventListener("click", async () => {
  const tabla = document.getElementById("selectTablaDescargar").value;

  try {
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
  const session = JSON.parse(localStorage.getItem("session"));
  const role = session?.role;

  if (role !== "admin") {
    alert("No tenés permisos para acceder a esta página.");
    window.location.href = "ventas.html";
    return;
  }

  document.getElementById("btnGenerarReportes").addEventListener("click", () => {
    cargarVentasGastosTiempo();
    cargarTopProductos();
    cargarCategoriasVendidas();
    cargarEdadEtarioGenero();
    cargarMetodosPago();
    cargarGastosDescripcionTipo();

    document.getElementById("btnDescargarPDF").disabled = false;
  });

  document.getElementById("btnDescargarPDF").addEventListener("click", descargarPDF);
});
