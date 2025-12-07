import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA6T2S8ngU2KYbs0B9_Kz0C1j94ku5Q32Y",
  authDomain: "app-ventas-e3564.firebaseapp.com",
  projectId: "app-ventas-e3564",
  storageBucket: "app-ventas-e3564.firebasestorage.app",
  messagingSenderId: "358809687504",
  appId: "1:358809687504:web:6da4dab8bccb1ae86a15d5",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Solo si existe el botón (evita errores)
const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        window.location.href = "../index.html";
      })
      .catch((error) => {
        console.error("Error al cerrar sesión:", error);
      });
  });
}
