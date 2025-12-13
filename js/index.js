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
//            LOGIN
// ===============================
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("login-usuario").value.trim();
  const password = document.getElementById("login-password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // 🔹 Sesión centralizada (preparada para multi-comercio)
      const session = {
        firebase_uid: user.uid
      };

      localStorage.setItem("session", JSON.stringify(session));

      console.log("Firebase UID:", user.uid);

      window.location.href = "pages/ventas.html";
    })
    .catch(() => {
      alert("Usuario o contraseña incorrectos");
    });
});
