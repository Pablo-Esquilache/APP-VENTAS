/**
 * Interfaz para Conexión al E-commerce
 * Crea e inyecta dinámicamente el botón de "Conexión Nube" y el Modal de configuración.
 */

document.addEventListener("DOMContentLoaded", () => {
  const navbarMenu = document.querySelector(".app-navbar-menu");
  
  if (!navbarMenu) return; // Si no hay navbar, salir.

  // 1. Inyectar botón en la barra
  const liBtn = document.createElement("li");
  liBtn.innerHTML = `<button id="btn-cloud-sync">☁ Conectar E-commerce</button>`;
  navbarMenu.insertBefore(liBtn, navbarMenu.querySelector(".app-navbar-refresh"));

  // 2. Inyectar HTML del Modal al final del body
  const modalHTML = `
    <div id="modalCloudSync" class="app-modal">
      <div class="app-modal-content" style="max-width: 400px;">
        <div class="app-modal-header">
          <h2 class="app-subtitle">Conexión con E-Commerce</h2>
          <button type="button" class="app-close" id="cerrarModalCloudSync">Cerrar</button>
        </div>
        
        <div style="margin-top: 10px;">
          <p style="font-size: 14px; text-align: left; margin-bottom: 15px; color: #aaa;">
            Configura el Token y la URL para sincronizar stock y precios en tiempo real.
          </p>

          <form id="formCloudSync" style="display: flex; flex-direction: column; gap: 10px;">
            <div class="app-form-group">
              <label>URL de E-commerce</label>
              <input type="text" id="apiUrlSync" class="app-input" placeholder="http://127.0.0.1:3000/api/sync" autocomplete="off" />
            </div>

            <div class="app-form-group">
              <label>Token de Conexión</label>
              <input type="text" id="apiTokenSync" class="app-input" placeholder="Ej: ext_1234abcd" autocomplete="off" />
            </div>

            <div class="app-form-group" style="display: flex; justify-content: space-between; align-items: center; background: #222; padding: 10px; border-radius: 6px; margin-top: 5px;">
              <label style="margin: 0;">Sincronización Automática</label>
              <label class="switch-ui" style="position: relative; display: inline-block; width: 40px; height: 20px;">
                <input type="checkbox" id="syncEnabledSwitch" style="opacity: 0; width: 0; height: 0;">
                <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; border-radius: 20px; transition: .4s;">
                  <span style="position: absolute; content: ''; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: white; border-radius: 50%; transition: .4s;"></span>
                </span>
              </label>
            </div>

            <button type="submit" class="app-btn-primary" style="margin-top: 10px;" id="btnGuardarSync">
              Guardar Configuración
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Estilo para el switch -->
    <style>
      #syncEnabledSwitch:checked + span { background-color: #3fd18c; }
      #syncEnabledSwitch:checked + span span { transform: translateX(20px); }
    </style>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // 3. Manejadores de Eventos
  const modal = document.getElementById("modalCloudSync");
  const btnAbrir = document.getElementById("btn-cloud-sync");
  const btnCerrar = document.getElementById("cerrarModalCloudSync");
  const form = document.getElementById("formCloudSync");
  const txtUrl = document.getElementById("apiUrlSync");
  const txtToken = document.getElementById("apiTokenSync");
  const chkEnabled = document.getElementById("syncEnabledSwitch");
  const btnGuardar = document.getElementById("btnGuardarSync");

  const toggleModal = (show) => {
    modal.style.display = show ? "flex" : "none";
  };

  btnAbrir.addEventListener("click", toggleModal.bind(null, true));
  btnCerrar.addEventListener("click", toggleModal.bind(null, false));

  // Cargar info de la BD
  const cargarConfig = async () => {
    try {
      const res = await fetch("/api/config-sync", {
        headers: {
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("token")||'"{}"')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        txtUrl.value = data.api_url || "http://127.0.0.1:3000/api/sync";
        txtToken.value = data.api_token || "";
        chkEnabled.checked = data.sync_enabled || false;
        
        if (data.sync_enabled) {
          btnAbrir.textContent = "☁ Nube: Conectada";
          btnAbrir.style.color = "#3fd18c";
        } else {
          btnAbrir.textContent = "☁ Nube: Desconectada";
          btnAbrir.style.color = "#ff6b6b";
        }
      }
    } catch (e) {
      console.warn("No se pudo cargar config sync", e);
    }
  };

  // Guardar config en BD
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = txtUrl.value.trim();
    const token = txtToken.value.trim();
    const isEnabled = chkEnabled.checked;
    const oldText = btnGuardar.textContent;

    btnGuardar.textContent = "Guardando...";
    btnGuardar.disabled = true;

    try {
      const res = await fetch("/api/config-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("token")||'"{}"')}`
        },
        body: JSON.stringify({ api_url: url, api_token: token, sync_enabled: isEnabled })
      });

      if (res.ok) {
        alert("Configuración de E-Commerce guardada.");
        toggleModal(false);
        cargarConfig();
      } else {
        alert("Error al guardar la configuración");
      }
    } catch (error) {
      console.error(error);
      alert("Error de red");
    } finally {
      btnGuardar.textContent = oldText;
      btnGuardar.disabled = false;
    }
  });

  // Init
  cargarConfig();
});
