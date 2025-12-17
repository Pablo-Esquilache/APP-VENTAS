let graficoVG = null;
let graficoTopProductos = null;
let graficoCategorias = null;
let graficoEdadEtarioGenero = null;
let graficoMetodosPago = null;
let graficoGastosDescripcionTipo = null;


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
  const labels = data.map((d) => new Date(d.periodo).toLocaleDateString());
  const ventas = data.map((d) => Number(d.total_ventas));
  const gastos = data.map((d) => Number(d.total_gastos));
  const ticket = data.map((d) =>
    d.ticket_promedio ? Number(d.ticket_promedio) : null
  );

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
        { label: "Ticket promedio", data: ticket, tension: 0.3, yAxisID: "y1" },
      ],
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { display: true } },
      scales: {
        y: {
          type: "linear",
          position: "left",
          title: { display: true, text: "Importes" },
        },
        y1: {
          type: "linear",
          position: "right",
          grid: { drawOnChartArea: false },
          title: { display: true, text: "Ticket promedio" },
        },
      },
    },
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
  const labels = data.map((d) => d.producto);
  const cantidades = data.map((d) => Number(d.cantidad_vendida));
  const importes = data.map((d) => Number(d.total_vendido));

  const ctx = document.getElementById("graficoTopProductos").getContext("2d");
  if (graficoTopProductos) graficoTopProductos.destroy();

  graficoTopProductos = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Cantidad vendida", data: cantidades, xAxisID: "x" },
        { label: "Importe vendido", data: importes, xAxisID: "x1" },
      ],
    },
    options: {
      indexAxis: "y", // hace el gráfico horizontal
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { display: true } },
      scales: {
        x: {
          // ahora el eje de valores
          type: "linear",
          position: "bottom",
          title: { display: true, text: "Cantidad" },
        },
        x1: {
          // segundo eje de valores
          type: "linear",
          position: "top",
          grid: { drawOnChartArea: false },
          title: { display: true, text: "Importe" },
        },
        y: {
          // eje de categorías
          title: { display: true, text: "Producto" },
        },
      },
    },
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
  const labels = data.map((d) => d.categoria);
  const importes = data.map((d) => d.importe_total);
  const porcentajes = data.map((d) => d.porcentaje);

  const canvas = document.getElementById("graficoCategorias");

  // Fijamos tamaño exacto (igual que los otros)
  canvas.width = 1024;
  canvas.height = 512;

  const ctx = canvas.getContext("2d");

  if (graficoCategorias) graficoCategorias.destroy();

  graficoCategorias = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          label: "Importe vendido",
          data: importes,
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#8AFF33",
            "#FF8333",
            "#A633FF",
            "#33FFF3",
            "#FF33A6",
            "#33FF57",
            "#FF3333",
          ],
        },
      ],
    },
    options: {
      responsive: false, // desactivamos redimensionamiento automático
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
      },
    },
  });
}

async function cargarEdadEtarioGenero() {
  const session = JSON.parse(localStorage.getItem("session"));
  const comercioId = session.comercio_id;

  const desde = document.getElementById("rDesde").value;
  const hasta = document.getElementById("rHasta").value;

  let url = `http://localhost:4000/api/reportes/edad-etario-genero?comercio_id=${comercioId}`;
  if (desde) url += `&desde=${desde}`;
  if (hasta) url += `&hasta=${hasta}`;

  const res = await fetch(url);
  const data = await res.json();
  renderEdadEtarioGenero(data);
}

function renderEdadEtarioGenero(data) {
  // Ordenar grupos etarios por importe total
  const importePorGrupo = {};
  data.forEach((d) => {
    importePorGrupo[d.grupo_etario] =
      (importePorGrupo[d.grupo_etario] || 0) + Number(d.importe_total);
  });

  const grupos = Object.keys(importePorGrupo).sort(
    (a, b) => importePorGrupo[b] - importePorGrupo[a]
  );

  const generos = ["Masculino", "Femenino", "Otro"];

  const datasets = generos.map((g) => ({
    label: g,
    data: grupos.map((gr) => {
      const r = data.find((d) => d.grupo_etario === gr && d.genero === g);
      return r ? Number(r.edad_promedio) : null;
    }),
  }));

  const ctx = document
    .getElementById("graficoEdadEtarioGenero")
    .getContext("2d");

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
      },
      scales: {
        y: {
          title: { display: true, text: "Edad promedio" },
        },
      },
    },
  });
}
// METODOS DE PAGO
async function cargarMetodosPago() {
  const session = JSON.parse(localStorage.getItem("session"));
  const comercioId = session.comercio_id;

  const desde = document.getElementById("rDesde").value;
  const hasta = document.getElementById("rHasta").value;

  let url = `http://localhost:4000/api/reportes/metodos-pago?comercio_id=${comercioId}`;
  if (desde) url += `&desde=${desde}`;
  if (hasta) url += `&hasta=${hasta}`;

  const res = await fetch(url);
  const data = await res.json();
  renderMetodosPago(data);
}

function renderMetodosPago(data) {
  // Ordenar por importe descendente
  data.sort((a, b) => Number(b.importe_total) - Number(a.importe_total));

  const labels = data.map(d => d.metodo_pago);
  const importes = data.map(d => Number(d.importe_total));
  const porcentajes = data.map(d => d.porcentaje);
  const cantidades = data.map(d => d.cantidad_ventas);

  const canvas = document.getElementById("graficoMetodosPago");

  // Tamaño fijo del gráfico
  canvas.width = 1024;
  canvas.height = 512;

  const ctx = canvas.getContext("2d");

  if (graficoMetodosPago) graficoMetodosPago.destroy();

  const colores = [
    "#FF3333",
    "#33FF57",
    "#FF33A6",
    "#33FFF3",
    "#A633FF",
    "#FF8333",
    "#8AFF33",
    "#FFCE56",
    "#36A2EB",
    "#FF6384",
  ];

  graficoMetodosPago = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data: importes,
          backgroundColor: labels.map((_, i) => colores[i % colores.length]),
        },
      ],
    },
    options: {
      responsive: false, // clave para respetar width/height
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
      },
    },
  });
}


//GASTOS
async function cargarGastosDescripcionTipo() {
  const session = JSON.parse(localStorage.getItem("session"));
  const comercioId = session.comercio_id;

  const desde = document.getElementById("rDesde").value;
  const hasta = document.getElementById("rHasta").value;

  let url = `http://localhost:4000/api/reportes/gastos-descripcion-tipo?comercio_id=${comercioId}`;
  if (desde) url += `&desde=${desde}`;
  if (hasta) url += `&hasta=${hasta}`;

  const res = await fetch(url);
  const data = await res.json();
  renderGastosDescripcionTipo(data);
}

function renderGastosDescripcionTipo(data) {
  // Agrupar descripciones únicas
  const descripciones = [
    ...new Set(data.map(d => d.descripcion))
  ];

  // Totales por tipo
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
        {
          label: "Gastos fijos",
          data: fijos,
          backgroundColor: "#F44336"
        },
        {
          label: "Gastos variables",
          data: variables,
          backgroundColor: "#FF9800"
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: true },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: $${context.parsed.y}`;
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          title: { display: true, text: "Descripción del gasto" }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: { display: true, text: "Importe total" }
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

  document
    .getElementById("btnGenerarReportes")
    .addEventListener("click", () => {
      cargarVentasGastosTiempo();
      cargarTopProductos();
      cargarCategoriasVendidas();
      cargarEdadEtarioGenero();
      cargarMetodosPago();
      cargarGastosDescripcionTipo();
    });
});
