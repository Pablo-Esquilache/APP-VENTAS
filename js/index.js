// Importar funciones necesarias desde la modular v9
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Configuración de Firebase (la tuya)
const firebaseConfig = {
  apiKey: "AIzaSyA6T2S8ngU2KYbs0B9_Kz0C1j94ku5Q32Y",
  authDomain: "app-ventas-e3564.firebaseapp.com",
  projectId: "app-ventas-e3564",
  storageBucket: "app-ventas-e3564.firebasestorage.app",
  messagingSenderId: "358809687504",
  appId: "1:358809687504:web:6da4dab8bccb1ae86a15d5",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ===============================
//             LOGIN
// ===============================
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("login-usuario").value.trim();
  const password = document.getElementById("login-password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "pages/ventas.html";
    })
    .catch(() => {
      alert("Usuario o contraseña incorrectos");
    });
});

// ===============================
//            REGISTRO
// ===============================
document.getElementById("registro-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Usuario creado con éxito");
      cerrarModal();
    })
    .catch((error) => {
      alert("Error al crear usuario: " + error.message);
    });
});

// ===============================
//       MODAL ABRIR/CERRAR
// ===============================
const modal = document.getElementById("modal-registro");
document.getElementById("abrir-modal").onclick = () =>
  (modal.style.display = "flex");
document.getElementById("cerrar-modal").onclick = () => cerrarModal();

function cerrarModal() {
  modal.style.display = "none";
}
