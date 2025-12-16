let graficoVG = null;
let graficoTopProductos = null;
let graficoCategorias = null;

// Ventas vs gastos + ticket promedio
async function cargarVentasGastosTiempo() {
  try {
    const session = JSON.parse(localStorage.getItem("session"));
    const comercioId = session.comercio_id;

    const desde = document.getElementById("rDesde").value;
    const hasta = document.getElementById("rHasta").value;

    let url = `http://localhost:4000/api/reportes/ventas-gastos-tiempo?comercio_id=${comercioId}&agrupacion=dia`;
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
        { label: "Ventas", data: ventas, tension: 0.3, yAxisID: "y" },
        { label: "Gastos", data: gastos, tension: 0.3, yAxisID: "y" },
        { label: "Ticket promedio", data: ticket, tension: 0.3, yAxisID: "y1" }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { display: true } },
      scales: {
        y: { type: "linear", position: "left", title: { display: true, text: "Importes" } },
        y1: { type: "linear", position: "right", grid: { drawOnChartArea: false }, title: { display: true, text: "Ticket promedio" } }
      }
    }
  });
}

// Top 10 productos
async function cargarTopProductos() {
  try {
    const session = JSON.parse(localStorage.getItem("session"));
    const comercioId = session.comercio_id;

    const desde = document.getElementById("rDesde").value;
    const hasta = document.getElementById("rHasta").value;

    let url = `http://localhost:4000/api/reportes/top-productos?comercio_id=${comercioId}&limit=10`;
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
      { label: "Cantidad vendida", data: cantidades, xAxisID: "x" },
      { label: "Importe vendido", data: importes, xAxisID: "x1" }
    ]
  },
  options: {
    indexAxis: 'y', // hace el gráfico horizontal
    responsive: true,
    interaction: { mode: "index", intersect: false },
    plugins: { legend: { display: true } },
    scales: {
      x: { // ahora el eje de valores
        type: "linear",
        position: "bottom",
        title: { display: true, text: "Cantidad" }
      },
      x1: { // segundo eje de valores
        type: "linear",
        position: "top",
        grid: { drawOnChartArea: false },
        title: { display: true, text: "Importe" }
      },
      y: { // eje de categorías
        title: { display: true, text: "Producto" }
      }
    }
  }
});
}

//Categroias vendidas

async function cargarCategoriasVendidas() {
  try {
    const session = JSON.parse(localStorage.getItem("session"));
    const comercioId = session.comercio_id;

    const desde = document.getElementById("rDesde").value;
    const hasta = document.getElementById("rHasta").value;

    let url = `http://localhost:4000/api/reportes/categorias-vendidas?comercio_id=${comercioId}`;

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
  const labels = data.map(d => d.categoria);
  const importes = data.map(d => d.importe_total);
  const porcentajes = data.map(d => d.porcentaje);

  const ctx = document.getElementById("graficoCategorias").getContext("2d");

  if (graficoCategorias) {
    graficoCategorias.destroy();
  }

  graficoCategorias = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          label: "Importe vendido",
          data: importes,
          backgroundColor: [
            "#FF6384", "#36A2EB", "#FFCE56", "#8AFF33", "#FF8333",
            "#A633FF", "#33FFF3", "#FF33A6", "#33FF57", "#FF3333"
          ]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true, position: 'right' },
        tooltip: {
          callbacks: {
            label: function(context) {
              const i = context.dataIndex;
              return `${context.label}: $${importes[i]} (${porcentajes[i]}%)`;
            }
          }
        }
      }
    }
  });
}


// Inicialización
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
  });
});
