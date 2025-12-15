document.addEventListener("DOMContentLoaded", () => {
  const session = JSON.parse(localStorage.getItem("session"));
  const role = session?.role;

  if (role !== "admin") {
    alert("No tenés permisos para acceder a esta página.");
    window.location.href = "ventas.html"; // redirigir a ventas u otra página permitida
  }
});
