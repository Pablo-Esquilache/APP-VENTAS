document.addEventListener("DOMContentLoaded", () => {
  const session = JSON.parse(localStorage.getItem("session"));
  const role = session?.role;

  if (role) {
    document.body.classList.add(`role-${role}`);
  }
});