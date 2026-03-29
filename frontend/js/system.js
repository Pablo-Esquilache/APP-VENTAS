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

// ==========================================
// ATAJOS DE TECLADO GLOBALES
// ==========================================
document.addEventListener("keydown", (e) => {
  // F10: Abrir "Nueva Venta"
  if (e.key === "F10") {
    e.preventDefault();
    const btnNuevaVenta = document.getElementById("btnNuevaVenta");
    if (btnNuevaVenta) {
      btnNuevaVenta.click();
    } else {
      window.location.href = "ventas.html?openModal=true";
    }
  }

  // ESC: Cerrar Modales
  if (e.key === "Escape") {
    const modales = document.querySelectorAll(".app-modal");
    modales.forEach((m) => {
      if (m.style.display === "flex") {
        m.style.display = "none";
      }
    });
  }

  // ENTER: Guardar / Confirmar en Modales
  if (e.key === "Enter") {
    const activeId = document.activeElement ? document.activeElement.id : "";
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";

    // Evitar interferir con inputs de búsqueda o lector de código que ya tienen su propio "Enter"
    if (
      activeTag === "textarea" ||
      activeId.toLowerCase().includes("buscar") || 
      activeId.toLowerCase().includes("barcode")
    ) {
      return;
    }

    const modales = document.querySelectorAll(".app-modal");
    let modalActivo = null;
    modales.forEach((m) => {
      if (m.style.display === "flex") {
        modalActivo = m;
      }
    });

    if (modalActivo) {
      // Prevenimos el submit por defecto para evitar doble guardado
      e.preventDefault();
      
      const btnGuardar = modalActivo.querySelector('button[type="submit"], .app-btn-guardar, .app-btn-primary');
      if (btnGuardar) {
        btnGuardar.click();
      }
    }
  }
});
