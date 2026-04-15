import { AuthAPI, CajasAPI } from "./api.js";/**
 * Cierra la sesión actual del usuario.
 * - Notifica al backend si existe un session_token activo.
 * - Elimina la sesión almacenada localmente.
 * - Redirige al usuario al login.
 */
async function cerrarSesion() {
  try {
    // Recupera la sesión almacenada en el navegador
    const sessionStorageValue = localStorage.getItem("session");
    const session = sessionStorageValue
      ? JSON.parse(sessionStorageValue)
      : null;

    if (session?.comercio_id) {
      try {
        const cajaActual = await CajasAPI.getHoy(session.comercio_id);
        if (cajaActual && cajaActual.estado === "abierta") {
          const confirmarCierre = confirm("Aún tienes una caja abierta. ¿Estás seguro de que deseas cerrar sesión sin antes cerrarla?");
          if (!confirmarCierre) {
            return; // El usuario cancela el logout para ir a cerrar la caja
          }
        }
      } catch (err) {
        console.warn("No se pudo verificar el estado de la caja al cerrar sesión:", err);
      }
    }

    // Si existe un session_token, se informa al backend para invalidarlo
    if (session?.session_token) {
      await AuthAPI.logout({ session_token: session.session_token });
    }

    // Elimina la sesión local independientemente del resultado del backend
    localStorage.removeItem("session");

    // Redirige al usuario a la pantalla de inicio
    window.location.href = "../index.html";
  } catch (error) {
    // Registra el error sin interrumpir el flujo de la aplicación
    console.error("Error al cerrar sesión:", error);
  }
}

// Asocia el evento de cierre de sesión si el botón existe en el DOM
const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", cerrarSesion);
}

// ==========================================
// Botón de Copia de Seguridad Manual
// ==========================================
const backupBtn = document.getElementById("backup-btn");

if (backupBtn) {
  backupBtn.addEventListener("click", async () => {
    try {
      // Bloquear botón durante el proceso
      backupBtn.disabled = true;
      const originalText = backupBtn.textContent;
      backupBtn.textContent = "Guardando...";

      // Llamar al endpoint del backend (se ocupa de pg_dump y de guardarlo en /backups)
      const response = await fetch("/api/backup/manual", { method: "POST" });
      const data = await response.json();

      if (data.ok) {
        if (typeof Swal !== "undefined") {
            Swal.fire({
                icon: "success",
                title: "Copia Resguardada",
                text: "La copia de seguridad se ha guardado exitosamente.",
                timer: 3000,
                showConfirmButton: false
            });
        } else {
            alert("Copia de seguridad guardada exitosamente.");
        }
      } else {
        throw new Error(data.error || "Error desconocido del servidor");
      }
    } catch (err) {
      console.error(err);
      if (typeof Swal !== "undefined") {
          Swal.fire({
              icon: "error",
              title: "Error al generar backup",
              text: "Hubo un problema. Revisa la consola o asegúrate de que PostgreSQL está activo.",
          });
      } else {
          alert("Error al generar copia de seguridad.");
      }
    } finally {
      // Restaurar el botón
      backupBtn.disabled = false;
      backupBtn.textContent = "Backup";
    }
  });
}