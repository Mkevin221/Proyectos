// ../Probar/js/admin.js
document.addEventListener("DOMContentLoaded", () => {
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
  if (!usuarioActivo || usuarioActivo.role !== "admin") {
    window.location.href = "index.html";
    return;
  }

  const users = JSON.parse(localStorage.getItem("usuarios") || "[]");
  const products = JSON.parse(localStorage.getItem("productos") || "[]");

  document.getElementById("usersCount").textContent = `Total: ${users.length}`;
  document.getElementById("productsCount").textContent = `Total: ${products.length}`;
  document.getElementById("activeSessionInfo").textContent = `Sesión admin: ${usuarioActivo.email}`;

  document.getElementById("adminLogoutBtn").addEventListener("click", () => {
    localStorage.removeItem("usuarioActivo");
    window.location.href = "index.html";
  });
});