let graficoVG = null;

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
  const labels = data.map(d =>
    new Date(d.periodo).toLocaleDateString()
  );

  const ventas = data.map(d => Number(d.total_ventas));
  const gastos = data.map(d => Number(d.total_gastos));

  const canvas = document.getElementById("graficoVentasGastos");
  const ctx = canvas.getContext("2d");

  if (graficoVG) {
    graficoVG.destroy();
  }

  graficoVG = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Ventas",
          data: ventas,
          tension: 0.3
        },
        {
          label: "Gastos",
          data: gastos,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      }
    }
  });
}

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
    .addEventListener("click", cargarVentasGastosTiempo);
});
