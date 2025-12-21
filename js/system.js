const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:4000/api"
    : "https://app-ventas-gvdk.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = document.getElementById("refresh-db-btn");
  if (!refreshBtn) return;

  refreshBtn.addEventListener("click", async () => {
    refreshBtn.disabled = true;
    const textoOriginal = refreshBtn.textContent;
    refreshBtn.textContent = "⟳ Actualizando...";

    try {
      const res = await fetch(`${API_BASE}/system/refresh-db`);
      if (!res.ok) throw new Error();

      await res.json();
      alert("Conexión con la base actualizada");
    } catch (error) {
      alert("No se pudo reconectar con la base de datos");
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.textContent = textoOriginal;
    }
  });
});
