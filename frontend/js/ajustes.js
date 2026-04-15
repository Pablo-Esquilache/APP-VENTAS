document.addEventListener("DOMContentLoaded", () => {
  const token = JSON.parse(localStorage.getItem("token") || '"{}"');
  const session = JSON.parse(localStorage.getItem("session") || "{}");

  if (session.role !== "admin") {
    alert("Acceso denegado. Redirigiendo...");
    window.location.href = "ventas.html";
    return;
  }

  const cid = session.comercio_id || 1;

  // ===== ECOMMERCE SYNC =====
  const txtUrl = document.getElementById("apiUrlSync");
  const txtToken = document.getElementById("apiTokenSync");
  const chkEnabled = document.getElementById("syncEnabledSwitch");
  const formSync = document.getElementById("formCloudSync");
  const btnGuardarSync = document.getElementById("btnGuardarSync");

  async function cargarConfigSync() {
    try {
      const res = await fetch("/api/config-sync", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        txtUrl.value = data.api_url || "http://127.0.0.1:3000/api/sync";
        txtToken.value = data.api_token || "";
        chkEnabled.checked = data.sync_enabled || false;
      }
    } catch (e) {
      console.warn("No se pudo cargar config sync", e);
    }
  }

  formSync.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = txtUrl.value.trim();
    const tkn = txtToken.value.trim();
    const isEnabled = chkEnabled.checked;
    const oldText = btnGuardarSync.textContent;

    btnGuardarSync.textContent = "Guardando...";
    btnGuardarSync.disabled = true;

    try {
      const res = await fetch("/api/config-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ api_url: url, api_token: tkn, sync_enabled: isEnabled })
      });

      if (res.ok) {
        alert("Configuración de E-Commerce guardada.");
      } else {
        alert("Error al guardar la configuración");
      }
    } catch (error) {
      console.error(error);
      alert("Error de red");
    } finally {
      btnGuardarSync.textContent = oldText;
      btnGuardarSync.disabled = false;
    }
  });

  // ===== METODOS DE PAGO =====
  const listaMetodos = document.getElementById("listaMetodos");
  const inputNuevoMetodo = document.getElementById("nuevoMetodoInput");
  const btnNuevoMetodo = document.getElementById("btnNuevoMetodo");

  async function cargarMetodos() {
    listaMetodos.innerHTML = "<p>Cargando...</p>";
    try {
      const res = await fetch(`/api/ajustes/metodos_pago/${cid}`);
      const data = await res.json();
      listaMetodos.innerHTML = "";
      data.forEach(m => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span>${m.nombre}</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label class="switch-ui small">
              <input type="checkbox" ${m.activo ? "checked" : ""} data-id="${m.id}" class="toggle-metodo">
              <span class="slider"><span class="slider-dot"></span></span>
            </label>
            <button class="btn-eliminar-metodo" data-id="${m.id}" style="background:transparent; border:none; color:#ff4d4f; cursor:pointer;" title="Eliminar">🗑</button>
          </div>
        `;
        listaMetodos.appendChild(li);
      });
    } catch (e) { console.error(e); }
  }

  btnNuevoMetodo.addEventListener("click", async () => {
    const nombre = inputNuevoMetodo.value.trim();
    if (!nombre) return;
    try {
      const res = await fetch("/api/ajustes/metodos_pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comercio_id: cid, nombre })
      });
      if (res.ok) {
        inputNuevoMetodo.value = "";
        cargarMetodos();
      }
    } catch (e) { console.error(e); }
  });

  listaMetodos.addEventListener("change", async (e) => {
    if (e.target.classList.contains("toggle-metodo")) {
      const id = e.target.getAttribute("data-id");
      const activo = e.target.checked;
      try {
        await fetch(`/api/ajustes/metodos_pago/${id}/toggle`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activo })
        });
      } catch (e) { console.error(e); e.target.checked = !activo; }
    }
  });


  // ===== DESCUENTOS =====
  const listaDescuentos = document.getElementById("listaDescuentos");
  const inputNuevoDescuento = document.getElementById("nuevoDescuentoInput");
  const btnNuevoDescuento = document.getElementById("btnNuevoDescuento");

  async function cargarDescuentos() {
    listaDescuentos.innerHTML = "<p>Cargando...</p>";
    try {
      const res = await fetch(`/api/ajustes/descuentos/${cid}`);
      const data = await res.json();
      listaDescuentos.innerHTML = "";
      data.forEach(d => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span>${d.porcentaje}%</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label class="switch-ui small">
              <input type="checkbox" ${d.activo ? "checked" : ""} data-id="${d.id}" class="toggle-descuento">
              <span class="slider"><span class="slider-dot"></span></span>
            </label>
            <button class="btn-eliminar-descuento" data-id="${d.id}" style="background:transparent; border:none; color:#ff4d4f; cursor:pointer;" title="Eliminar">🗑</button>
          </div>
        `;
        listaDescuentos.appendChild(li);
      });
    } catch (e) { console.error(e); }
  }

  btnNuevoDescuento.addEventListener("click", async () => {
    const porc = parseFloat(inputNuevoDescuento.value);
    if (isNaN(porc)) return;
    try {
      const res = await fetch("/api/ajustes/descuentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comercio_id: cid, porcentaje: porc })
      });
      if (res.ok) {
        inputNuevoDescuento.value = "";
        cargarDescuentos();
      }
    } catch (e) { console.error(e); }
  });

  listaDescuentos.addEventListener("change", async (e) => {
    if (e.target.classList.contains("toggle-descuento")) {
      const id = e.target.getAttribute("data-id");
      const activo = e.target.checked;
      try {
        await fetch(`/api/ajustes/descuentos/${id}/toggle`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activo })
        });
      } catch (e) { console.error(e); e.target.checked = !activo; }
    }
  });

  // --- LOGICA DE ELIMINACION COMBINADA ---
  listaMetodos.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-eliminar-metodo")) {
      if(!confirm("¿Eliminar este método de pago?")) return;
      const id = e.target.getAttribute("data-id");
      try {
        await fetch(`/api/ajustes/metodos_pago/${id}`, { method: "DELETE" });
        cargarMetodos();
      } catch (err) { console.error(err); }
    }
  });

  listaDescuentos.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-eliminar-descuento")) {
      if(!confirm("¿Eliminar este descuento?")) return;
      const id = e.target.getAttribute("data-id");
      try {
        await fetch(`/api/ajustes/descuentos/${id}`, { method: "DELETE" });
        cargarDescuentos();
      } catch (err) { console.error(err); }
    }
  });

  // ===== CATEGORIAS DE GASTOS =====
  const listaCategoriasGasto = document.getElementById("listaCategoriasGasto");
  const nuevaCategoriaGastoInput = document.getElementById("nuevaCategoriaGastoInput");
  const btnNuevaCategoriaGasto = document.getElementById("btnNuevaCategoriaGasto");

  async function cargarCategoriasGasto() {
    listaCategoriasGasto.innerHTML = "<p>Cargando...</p>";
    try {
      const res = await fetch(`/api/ajustes/gastos_categorias/${cid}`);
      const data = await res.json();
      listaCategoriasGasto.innerHTML = "";
      data.forEach(c => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span>${c.nombre}</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label class="switch-ui small">
              <input type="checkbox" ${c.activo ? "checked" : ""} data-id="${c.id}" class="toggle-categoria-gasto">
              <span class="slider"><span class="slider-dot"></span></span>
            </label>
            <button class="btn-eliminar-categoria-gasto" data-id="${c.id}" style="background:transparent; border:none; color:#ff4d4f; cursor:pointer;" title="Eliminar">🗑</button>
          </div>
        `;
        listaCategoriasGasto.appendChild(li);
      });
    } catch (e) { console.error(e); }
  }

  btnNuevaCategoriaGasto.addEventListener("click", async () => {
    const nombre = nuevaCategoriaGastoInput.value.trim();
    if (!nombre) return;
    try {
      const res = await fetch("/api/ajustes/gastos_categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comercio_id: cid, nombre })
      });
      if (res.ok) {
        nuevaCategoriaGastoInput.value = "";
        cargarCategoriasGasto();
      }
    } catch (e) { console.error(e); }
  });

  listaCategoriasGasto.addEventListener("change", async (e) => {
    if (e.target.classList.contains("toggle-categoria-gasto")) {
      const id = e.target.getAttribute("data-id");
      const activo = e.target.checked;
      try {
        await fetch(`/api/ajustes/gastos_categorias/${id}/toggle`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activo })
        });
      } catch (e) { console.error(e); e.target.checked = !activo; }
    }
  });

  listaCategoriasGasto.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-eliminar-categoria-gasto")) {
      if(!confirm("¿Eliminar esta categoría de gasto?")) return;
      const id = e.target.getAttribute("data-id");
      try {
        await fetch(`/api/ajustes/gastos_categorias/${id}`, { method: "DELETE" });
        cargarCategoriasGasto();
      } catch (err) { console.error(err); }
    }
  });

  // ===== ALERTAS DE STOCK =====
  const inputUmbralStock = document.getElementById("inputUmbralStock");
  const btnGuardarUmbral = document.getElementById("btnGuardarUmbral");

  async function cargarUmbralStock() {
    try {
      // Necesitamos fetchear data del comercio para el umbral
      const res = await fetch(`/api/comercios/uid/${session.uid}`);
      if(res.ok) {
        const data = await res.json();
        inputUmbralStock.value = data.umbral_stock || 3;
      }
    } catch (e) { console.error("Error al cargar umbral de stock", e); }
  }

  btnGuardarUmbral.addEventListener("click", async () => {
    const val = parseInt(inputUmbralStock.value);
    if(isNaN(val)) return;
    try {
      const res = await fetch(`/api/ajustes/umbral_stock/${cid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ umbral_stock: val })
      });
      if(res.ok) {
        alert("Umbral actualizado");
      }
    } catch (e) { console.error(e); }
  });

  // ===== MANEJO DE USUARIOS =====
  const tablaUsuariosBody = document.getElementById("tablaUsuariosBody");
  const btnNuevoUsuario = document.getElementById("btnNuevoUsuario");
  const modalUsuario = document.getElementById("modalUsuario");
  const cerrarModalUsuario = document.getElementById("cerrarModalUsuario");
  const formUsuario = document.getElementById("formUsuario");
  let usuariosCache = [];

  async function cargarUsuarios() {
    try {
      const res = await fetch(`/api/usuarios/${cid}`);
      const data = await res.json();
      usuariosCache = data;
      tablaUsuariosBody.innerHTML = "";
      data.forEach(u => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${u.id}</td>
          <td>${u.usuario}</td>
          <td><span class="user-role-badge" style="background:${u.role==='admin'?'#3fd18c':'#666'}; padding:2px 6px; border-radius:4px; font-size:0.8em;">${u.role}</span></td>
          <td>
            <button class="btn-editar-usuario app-btn-secondary" data-id="${u.id}" style="padding:4px 8px; font-size:0.85em;">Editar</button>
            <button class="btn-eliminar-usuario" data-id="${u.id}" style="background:transparent; border:none; color:#ff4d4f; cursor:pointer;" title="Eliminar">🗑</button>
          </td>
        `;
        tablaUsuariosBody.appendChild(fila);
      });
    } catch (e) { console.error("Error al cargar usuarios", e); }
  }

  btnNuevoUsuario.addEventListener("click", () => {
    formUsuario.reset();
    document.getElementById("usuarioIdMode").value = "";
    document.getElementById("tituloModalUsuario").innerText = "Crear Usuario";
    modalUsuario.style.display = "flex";
  });

  cerrarModalUsuario.addEventListener("click", () => {
    modalUsuario.style.display = "none";
  });

  formUsuario.addEventListener("submit", async (e) => {
    e.preventDefault();
    const modeId = document.getElementById("usuarioIdMode").value;
    const usuario = document.getElementById("usernameInput").value.trim();
    const password = document.getElementById("passwordInput").value;
    const role = document.getElementById("roleInput").value;

    try {
      if (modeId) {
        // Edit
        const body = { role, usuario };
        if (password) body.password = password;
        const res = await fetch(`/api/usuarios/${modeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        if(res.ok) {
          modalUsuario.style.display = "none";
          cargarUsuarios();
        } else {
          const err = await res.json();
          alert(err.error);
        }
      } else {
        // Create
        if (!password) { alert("La contraseña es requerida para un nuevo usuario"); return; }
        const res = await fetch(`/api/usuarios`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuario, password, role, comercio_id: cid })
        });
        if(res.ok) {
          modalUsuario.style.display = "none";
          cargarUsuarios();
        } else {
          const err = await res.json();
          alert(err.error);
        }
      }
    } catch (error) { console.error(error); }
  });

  tablaUsuariosBody.addEventListener("click", async (e) => {
    const btn = e.target;
    if (btn.classList.contains("btn-eliminar-usuario")) {
      if(!confirm("¿Deseas eliminar este usuario de forma permanente?")) return;
      const id = btn.getAttribute("data-id");
      try {
        await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
        cargarUsuarios();
      } catch (err) { console.error(err); }
    } else if (btn.classList.contains("btn-editar-usuario")) {
      const id = btn.getAttribute("data-id");
      const user = usuariosCache.find(x => x.id == id);
      if(user) {
        formUsuario.reset();
        document.getElementById("usuarioIdMode").value = user.id;
        document.getElementById("usernameInput").value = user.usuario;
        document.getElementById("roleInput").value = user.role;
        document.getElementById("tituloModalUsuario").innerText = "Editar Usuario";
        modalUsuario.style.display = "flex";
      }
    }
  });


  // Init
  cargarConfigSync();
  cargarMetodos();
  cargarDescuentos();
  cargarCategoriasGasto();
  cargarUmbralStock();
  cargarUsuarios();
});
