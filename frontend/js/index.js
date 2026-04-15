import { AuthAPI } from "./api.js";

// =================================================
// RUTINA DE AUTO-LOGIN
// =================================================
// Si ya hay una sesión guardada, saltear el login e ir a caja
document.addEventListener("DOMContentLoaded", () => {
  const sessionUser = localStorage.getItem("session");
  if (sessionUser) {
    window.location.href = "pages/caja.html";
  }
});

// =================================================
// REFERENCIAS DEL DOM
// =================================================

const form = document.getElementById("login-form");
const loader = document.getElementById("loader");
const submitBtn = form.querySelector("button");


// =================================================
// EVENTO PRINCIPAL
// Maneja el envío del formulario de login
// =================================================

form.addEventListener("submit", async (e) => {
  // Evita el envío tradicional del formulario
  e.preventDefault();

  // =================================================
  // OBTENER VALORES DEL FORMULARIO
  // =================================================

  // Obtiene y normaliza los valores ingresados por el usuario
  const usuario = document.getElementById("login-usuario").value.trim();
  const password = document.getElementById("login-password").value;

  // =================================================
  // ESTADO DE CARGA
  // =================================================

  // Activa loader y deshabilita el botón para evitar múltiples envíos
  loader.classList.remove("hidden");
  submitBtn.disabled = true;

  try {
    // =================================================
    // PETICIÓN DE AUTENTICACIÓN
    // =================================================

    const data = await AuthAPI.login({
      usuario,
      password,
    });

    // =================================================
    // GUARDAR SESIÓN
    // =================================================

    // Guarda datos de sesión en localStorage para uso en la aplicación
    localStorage.setItem(
      "session",
      JSON.stringify({
        uid: data.uid,
        token: data.token,
        role: data.role,
        comercio_id: data.comercio_id,
        session_token: data.session_token,
      })
    );

    // =================================================
    // REDIRECCIÓN
    // =================================================

    // Redirige al usuario a la pantalla principal
    window.location.href = "pages/caja.html";

  } catch (error) {
    // =================================================
    // MANEJO DE ERRORES
    // =================================================

    // Restablece estado visual del formulario
    loader.classList.add("hidden");
    submitBtn.disabled = false;

    // Notifica al usuario sobre credenciales inválidas
    alert("Credenciales inválidas");
  }
});
