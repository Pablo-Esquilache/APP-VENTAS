// ===============================
//        FIREBASE IMPORTS
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

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
//       CONFIG API URL
// ===============================
const API_URL =
  location.hostname === "localhost"
    ? "http://localhost:4000/api"
    : "https://app-ventas-gvdk.onrender.com/api";

// ===============================
//            LOGIN
// ===============================
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-usuario").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    // 1️⃣ Login Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2️⃣ Consultar backend (roles + comercio)
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebase_uid: user.uid })
    });

    if (!res.ok) throw new Error("No autorizado");

    const data = await res.json();

    // 3️⃣ Guardar sesión unificada
    localStorage.setItem("session", JSON.stringify({
      uid: user.uid,
      role: data.role,
      comercio_id: data.comercio_id
    }));

    // 4️⃣ Redirección por rol
    window.location.href = "pages/ventas.html";

  } catch (err) {
    alert("Usuario sin permisos o credenciales inválidas");
    console.error(err);
  }
});
