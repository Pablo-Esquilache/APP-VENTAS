import { SystemAPI } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = document.getElementById("refresh-db-btn");
  if (!refreshBtn) return;

  refreshBtn.addEventListener("click", async () => {
    refreshBtn.disabled = true;
    const textoOriginal = refreshBtn.textContent;
    refreshBtn.textContent = "⟳ Actualizando...";

    try {
      await SystemAPI.refreshDb();
      alert("Conexión con la base actualizada");
    } catch (error) {
      alert("No se pudo reconectar con la base de datos");
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.textContent = textoOriginal;
    }
  });
});
