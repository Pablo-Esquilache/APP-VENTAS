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
  logoutBtn.addEventListener("click", async () => {
    try {
      // 1️⃣ Cerrar sesión en Firebase
      await signOut(auth);

      // 2️⃣ Limpiar sesión en backend
      const session = JSON.parse(localStorage.getItem("session"));
      if (session?.uid) {
        await fetch("http://localhost:4000/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firebase_uid: session.uid }),
        });
      }

      // 3️⃣ Limpiar localStorage
      localStorage.removeItem("session");

      // 4️⃣ Redirigir al login
      window.location.href = "../index.html";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = document.getElementById("refresh-db-btn");
  if (!refreshBtn) return;

  refreshBtn.addEventListener("click", async () => {
    refreshBtn.disabled = true;
    const textoOriginal = refreshBtn.textContent;
    refreshBtn.textContent = "⟳ Actualizando...";

    try {
      const res = await fetch("http://localhost:4000/api/system/refresh-db");
      if (!res.ok) throw new Error();

      await res.json();
      alert("Conexión con la base actualizada");

    } catch (error) {
      alert("No se pudo reconectar con la base de datos");
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.textContent = textoOriginal;
    }
  });
});

