import { apiFetch, TurnosAPI, ClientesAPI } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const token = JSON.parse(localStorage.getItem("token") || '"{}"');
  const session = JSON.parse(localStorage.getItem("session") || "{}");
  const cid = session.comercio_id || 1;

  if (!token || typeof token !== "string") {
    window.location.href = "index.html";
    return;
  }

  // Elementos UI
  const turneroLayout = document.querySelector(".turnero-layout");
  const panelHoyDate = document.getElementById("fechaHoyText");
  const listaTurnosHoy = document.getElementById("listaTurnosHoy");
  const grillaTurnosBody = document.getElementById("grillaTurnosBody");
  const inputFechaGrilla = document.getElementById("inputFechaGrilla");
  const btnHoy = document.getElementById("btnHoy");
  const btnAyer = document.getElementById("btnAyer");
  const btnManana = document.getElementById("btnManana");

  // Modal Turno
  const modalNuevoTurno = document.getElementById("modalNuevoTurno");
  const cerrarModalNuevoTurno = document.getElementById("cerrarModalNuevoTurno");
  const formTurno = document.getElementById("formTurno");
  const turnoFechaInput = document.getElementById("turnoFechaInput");
  const turnoHoraInput = document.getElementById("turnoHoraInput");
  const buscadorClienteTurno = document.getElementById("buscadorClienteTurno");
  const dropdownClientes = document.getElementById("dropdownClientes");
  const clienteIdSeleccionado = document.getElementById("clienteIdSeleccionado");
  const clienteSeleccionadoTexto = document.getElementById("clienteSeleccionadoTexto");
  const turnoMotivoInput = document.getElementById("turnoMotivoInput");

  // Modal Cliente Rápido
  const btnNuevoClienteRapido = document.getElementById("btnNuevoClienteRapido");
  const modalClienteTurnero = document.getElementById("modalClienteTurnero");
  const cerrarModalClienteTurnero = document.getElementById("cerrarModalClienteTurnero");
  const formClienteTurnero = document.getElementById("formClienteTurnero");

  // Estado Global
  let turnosConfig = null;
  let currentDateGrilla = new Date();
  
  const getHoyString = () => new Date().toISOString().split("T")[0];

  // 1. CARGA DE CONFIGURACION
  async function init() {
    try {
      const res = await apiFetch(`/ajustes/turnos_config/${cid}`);
      turnosConfig = res || {
        modulo_habilitado: true,
        hora_inicio_laboral: "08:00:00",
        hora_fin_laboral: "20:00:00",
        intervalo_minutos: 30,
        permitir_solapamiento: false
      };

      if (!turnosConfig.modulo_habilitado) {
        turneroLayout.innerHTML = "<h2 style='color: #94a3b8; text-align:center; width:100%; margin-top:50px;'>El Módulo de Turnero está desactivado. Actívalo en los Ajustes.</h2>";
        return;
      }

      inputFechaGrilla.value = getHoyString();
      panelHoyDate.textContent = new Date().toLocaleDateString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      
      await refreshData();

    } catch (e) {
      console.error(e);
      alert("Error al cargar configuración de turnos.");
    }
  }

  async function refreshData() {
    await cargarTurnosHoy();
    await renderGrilla(inputFechaGrilla.value);
  }

  // 2. PANEL IZQUIERDO: TURNOS DE HOY
  async function cargarTurnosHoy() {
    listaTurnosHoy.innerHTML = "<p style='text-align:center;'>Cargando turnos de hoy...</p>";
    try {
      const hoyStr = getHoyString();
      const res = await TurnosAPI.getAll(hoyStr, cid);
      listaTurnosHoy.innerHTML = "";

      if (res.length === 0) {
        listaTurnosHoy.innerHTML = "<p style='text-align:center; color: #64748b;'>No hay turnos registrados para hoy.</p>";
        return;
      }

      res.forEach(turno => {
        const div = document.createElement("div");
        div.className = `turno-hoy-card ${turno.estado}`;
        
        let colorEstado = "#ccc";
        if(turno.estado === "completado") colorEstado = "#28a745";
        if(turno.estado === "reservado") colorEstado = "#ffc107";
        if(turno.estado === "cancelado") colorEstado = "#dc3545";

        const horaCorta = turno.hora.substring(0, 5); // "HH:MM:SS" -> "HH:MM"

        div.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="turno-hoy-hora">${horaCorta}</span>
            <span style="font-size:0.8em; font-weight:bold; color:${colorEstado}; text-transform:uppercase;">${turno.estado}</span>
          </div>
          <div class="turno-hoy-cliente">👤 ${turno.cliente_nombre}</div>
          <div style="font-size:0.9em; color: #64748b;">📞 ${turno.cliente_telefono || 'Sin teléfono'}</div>
          <div style="font-size:0.9em; color: #64748b; margin-top:5px;">📌 ${turno.servicio_motivo || 'Sin detalle'}</div>
          
          ${turno.estado === 'reservado' ? `
            <div class="turno-hoy-actions">
              <button class="app-btn-primary btn-accion-estado" data-id="${turno.id}" data-estado="completado">Asistió ✅</button>
              <button class="btn-eliminar btn-accion-estado" data-id="${turno.id}" data-estado="cancelado" style="flex:1; margin-left:10px;">Cancelar ❌</button>
            </div>
          ` : ''}
        `;
        listaTurnosHoy.appendChild(div);
      });
    } catch(e) {
      listaTurnosHoy.innerHTML = "<p>Error al cargar turnos del día.</p>";
    }
  }

  // Actions Hoy
  listaTurnosHoy.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-accion-estado")) {
      const id = e.target.getAttribute("data-id");
      const nuevoEstado = e.target.getAttribute("data-estado");
      if(!confirm(`¿Estás seguro de marcar el turno como ${nuevoEstado.toUpperCase()}?`)) return;

      try {
        await TurnosAPI.update(id, { estado: nuevoEstado, comercio_id: cid });
        await refreshData();
      } catch (error) {
        console.error(error);
        alert("Error al actualizar turno");
      }
    }
  });

  // 3. PANEL DERECHO: GRILLA
  function sumarMinutosTime(timeStr, minutos) {
    const [h, m] = timeStr.split(":");
    const d = new Date();
    d.setHours(parseInt(h));
    d.setMinutes(parseInt(m) + minutos);
    const rh = d.getHours().toString().padStart(2, "0");
    const rm = d.getMinutes().toString().padStart(2, "0");
    return `${rh}:${rm}`;
  }

  async function renderGrilla(fechaStr) {
    grillaTurnosBody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>Cargando...</td></tr>";
    try {
      const turnosDelDia = await TurnosAPI.getAll(fechaStr, cid);

      // Generar franjas maestras
      let tInicio = turnosConfig.hora_inicio_laboral.substring(0, 5);
      const tFin = turnosConfig.hora_fin_laboral.substring(0, 5);
      const inter = turnosConfig.intervalo_minutos;

      const franjas = [];
      let actual = tInicio;
      while(actual <= tFin) { // simple string compare works perfectly for "HH:MM"
        franjas.push(actual);
        actual = sumarMinutosTime(actual, inter);
      }

      grillaTurnosBody.innerHTML = "";

      franjas.forEach(horaFranja => {
        // Find if this hour has turnos
        const turnosAqui = turnosDelDia.filter(t => t.hora.substring(0,5) === horaFranja);

        const tr = document.createElement("tr");
        
        let colsHTML = `<td><strong>${horaFranja}</strong></td>`;
        
        if (turnosAqui.length > 0) {
           // We show the first one, or count if multiple and overlap allowed
           let badgeHTML = "";
           turnosAqui.forEach(t => {
             badgeHTML += `
               <div style="margin-bottom:5px; display:flex; align-items:center; gap:10px;">
                 <span class="badge-${t.estado}">${t.estado.toUpperCase()}</span> 
                 <span style="flex:1;">${t.cliente_nombre} - ${t.servicio_motivo || ''}</span>
                 ${t.estado === 'reservado' ? `<button class="btn-eliminar btn-cancelar-grilla" data-id="${t.id}" style="padding: 4px 8px; font-size: 0.8em; margin: 0;">Cancelar</button>` : ''}
                 ${t.estado === 'cancelado' ? `<button class="app-btn-secondary btn-limpiar-grilla" data-id="${t.id}" style="padding: 4px 8px; font-size: 0.8em; margin: 0;">Limpiar</button>` : ''}
               </div>
             `;
           });
           
           colsHTML += `<td>${badgeHTML}</td>`;
           
           if(turnosConfig.permitir_solapamiento) {
             colsHTML += `<td><button class="app-btn-secondary btn-agendar-grilla" data-hora="${horaFranja}">+ Turno Extra</button></td>`;
           } else {
             colsHTML += `<td><span style="color: #64748b;">Ocupado</span></td>`;
           }
        } else {
           colsHTML += `<td><span class="badge-libre">LIBRE</span></td>`;
           colsHTML += `<td><button class="app-btn-primary btn-agendar-grilla" data-hora="${horaFranja}">+ Agendar</button></td>`;
        }

        tr.innerHTML = colsHTML;
        grillaTurnosBody.appendChild(tr);
      });

    } catch(e) {
      grillaTurnosBody.innerHTML = "<tr><td colspan='3'>Error al cargar grilla</td></tr>";
    }
  }

  // Grilla Headers
  inputFechaGrilla.addEventListener("change", (e) => {
    if(!e.target.value) e.target.value = getHoyString();
    renderGrilla(e.target.value);
  });

  btnHoy.addEventListener("click", () => {
    inputFechaGrilla.value = getHoyString();
    renderGrilla(getHoyString());
  });

  btnAyer.addEventListener("click", () => {
    const d = new Date(inputFechaGrilla.value + "T00:00:00");
    d.setDate(d.getDate() - 1);
    inputFechaGrilla.value = d.toISOString().split("T")[0];
    renderGrilla(inputFechaGrilla.value);
  });

  btnManana.addEventListener("click", () => {
    const d = new Date(inputFechaGrilla.value + "T00:00:00");
    d.setDate(d.getDate() + 1);
    inputFechaGrilla.value = d.toISOString().split("T")[0];
    renderGrilla(inputFechaGrilla.value);
  });


  // 4. MODAL NUEVO TURNO
  grillaTurnosBody.addEventListener("click", async (e) => {
    if(e.target.classList.contains("btn-agendar-grilla")) {
      const hora = e.target.getAttribute("data-hora");
      abrirModalNuevoTurno(inputFechaGrilla.value, hora);
    }
    
    if(e.target.classList.contains("btn-cancelar-grilla")) {
      const id = e.target.getAttribute("data-id");
      if(!confirm("¿Estás seguro de cancelar este turno agendado?")) return;
      try {
        await TurnosAPI.update(id, { estado: "cancelado", comercio_id: cid });
        await refreshData();
      } catch (err) {
        console.error(err);
        alert("Error al cancelar el turno.");
      }
    }

    if(e.target.classList.contains("btn-limpiar-grilla")) {
      const id = e.target.getAttribute("data-id");
      if(!confirm("¿Deseas eliminar permanentemente este turno cancelado de la grilla para liberar el espacio?")) return;
      try {
        await TurnosAPI.delete(id, cid);
        await refreshData();
      } catch (err) {
        console.error(err);
        alert("Error al limpiar el turno.");
      }
    }
  });

  function abrirModalNuevoTurno(fecha, hora) {
    formTurno.reset();
    clienteIdSeleccionado.value = "";
    clienteSeleccionadoTexto.textContent = "Ningún cliente seleccionado";
    dropdownClientes.style.display = "none";
    
    turnoFechaInput.value = fecha;
    turnoHoraInput.value = hora;
    
    modalNuevoTurno.style.display = "flex";
  }

  cerrarModalNuevoTurno.addEventListener("click", () => modalNuevoTurno.style.display = "none");

  // Buscador Clientes en Turno
  let debounceTimer;
  buscadorClienteTurno.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value.toLowerCase().trim();
    if (query.length < 2) {
      dropdownClientes.style.display = "none";
      return;
    }
    
    debounceTimer = setTimeout(async () => {
      try {
        const clientes = await ClientesAPI.getAll(cid);
        const filtrados = clientes.filter(c => 
          c.nombre.toLowerCase().includes(query) || 
          (c.telefono && c.telefono.includes(query))
        );

        dropdownClientes.innerHTML = "";
        if(filtrados.length === 0) {
          dropdownClientes.innerHTML = `<div class="dropdown-item" style="color: #64748b;">No se encontraron resultados. Usa "+ Crear"</div>`;
        } else {
          filtrados.forEach(c => {
            const div = document.createElement("div");
            div.className = "dropdown-item";
            div.textContent = `${c.nombre} (${c.telefono || 'Sin tel.'})`;
            div.onclick = () => {
              clienteIdSeleccionado.value = c.id;
              clienteSeleccionadoTexto.textContent = `Cliente: ${c.nombre}`;
              buscadorClienteTurno.value = "";
              dropdownClientes.style.display = "none";
            };
            dropdownClientes.appendChild(div);
          });
        }
        dropdownClientes.style.display = "block";
      } catch (err) {}
    }, 300);
  });

  // Guardar Turno
  formTurno.addEventListener("submit", async (e) => {
    e.preventDefault();
    if(!clienteIdSeleccionado.value) {
      alert("Debe seleccionar o crear un cliente de la lista.");
      return;
    }

    const payload = {
      comercio_id: cid,
      cliente_id: clienteIdSeleccionado.value,
      fecha: turnoFechaInput.value,
      hora: turnoHoraInput.value,
      servicio_motivo: turnoMotivoInput.value
    };

    try {
      await TurnosAPI.create(payload);
      modalNuevoTurno.style.display = "none";
      refreshData();
    } catch(e) {
      console.error(e);
      alert("Error al guardar turno");
    }
  });


  // 5. MODAL CLIENTE RAPIDO (idéntico)
  const selectLocalidad = document.getElementById("clienteLocalidadTurnero");
  const btnNuevaLocalidad = document.getElementById("btnNuevaLocalidadTurnero");
  const inputNuevaLocalidad = document.getElementById("nuevaLocalidadTurnero");

  btnNuevaLocalidad.addEventListener("click", () => {
    if (inputNuevaLocalidad.style.display === "none") {
      inputNuevaLocalidad.style.display = "block";
      inputNuevaLocalidad.focus();
    } else {
      inputNuevaLocalidad.style.display = "none";
      inputNuevaLocalidad.value = "";
    }
  });

  btnNuevoClienteRapido.addEventListener("click", async () => {
    formClienteTurnero.reset();
    inputNuevaLocalidad.style.display = "none";
    inputNuevaLocalidad.value = "";

    try {
      const arr = await ClientesAPI.getLocalidades(cid);
      selectLocalidad.innerHTML = '<option value="">Seleccionar localidad</option>';
      arr.forEach((loc) => {
        const option = document.createElement("option");
        option.value = loc;
        option.textContent = loc;
        selectLocalidad.appendChild(option);
      });
    } catch (e) {
      console.error(e);
    }

    modalClienteTurnero.style.display = "flex";
  });

  cerrarModalClienteTurnero.addEventListener("click", () => modalClienteTurnero.style.display = "none");

  formClienteTurnero.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const payload = {
      nombre: document.getElementById("clienteNombreTurnero").value,
      telefono: document.getElementById("clienteTelefonoTurnero").value,
      email: document.getElementById("clienteEmailTurnero").value,
      fecha_nacimiento: document.getElementById("clienteNacimientoTurnero").value || null,
      genero: document.getElementById("clienteGeneroTurnero").value || null,
      localidad: inputNuevaLocalidad.style.display === "none" ? selectLocalidad.value : inputNuevaLocalidad.value,
      comentarios: document.getElementById("clienteComentariosTurnero").value,
      comercio_id: cid
    };

    try {
      const res = await ClientesAPI.create(payload);
      // Se creó. Lo autoseleccionamos
      clienteIdSeleccionado.value = res.id;
      clienteSeleccionadoTexto.textContent = `Cliente Creado: ${res.nombre}`;
      modalClienteTurnero.style.display = "none";
    } catch(err) {
      console.error(err);
      alert("Error al crear cliente rápido.");
    }
  });


  // Inicializar
  init();
});
