// ===============================
//        FIREBASE IMPORTS
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// ===============================
//        API BASE URL
// ===============================
const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:4000/api"
    : "https://app-ventas-gvdk.onrender.com/api";

// ===============================
//     FIREBASE CONFIG
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyA6T2S8ngU2KYbs0B9_Kz0C1j94ku5Q32Y",
  authDomain: "app-ventas-e3564.firebaseapp.com",
  projectId: "app-ventas-e3564",
  storageBucket: "app-ventas-e3564.firebasestorage.app",
  messagingSenderId: "358809687504",
  appId: "1:358809687504:web:6da4dab8bccb1ae86a15d5",
};

// ===============================
//     INIT FIREBASE
// ===============================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ===============================
//            LOGOUT
// ===============================
const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      // 1️⃣ Cerrar sesión en Firebase
      await signOut(auth);

      // 2️⃣ Notificar backend
      const session = JSON.parse(localStorage.getItem("session"));
      if (session?.uid) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firebase_uid: session.uid }),
        });
      }

      // 3️⃣ Limpiar sesión local
      localStorage.removeItem("session");

      // 4️⃣ Volver al login
      window.location.href = "../index.html";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Error al cerrar sesión");
    }
  });
}
