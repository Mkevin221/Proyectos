const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

const saludoUsuario = document.getElementById("saludoUsuario");
const userName = document.getElementById("userName");
const userInitial = document.getElementById("userInitial");
const userDropdown = document.getElementById("userDropdown");
const userMenu = document.querySelector(".user-menu");

// Proteger acceso al menú principal
if (!usuarioActivo) {
  window.location.href = "index.html";
} else {
  const fullName = usuarioActivo.fullName || "Usuario";

  if (saludoUsuario) {
    saludoUsuario.textContent = `Hola, ${fullName}`;
  }

  if (userName) {
    userName.textContent = fullName;
  }

  if (userInitial) {
    userInitial.textContent = fullName.trim().charAt(0).toUpperCase();
  }
}

// Mostrar/ocultar menú de usuario
function toggleUserMenu() {
  if (userDropdown) {
    userDropdown.classList.toggle("show");
  }
}

// Cerrar sesión
function cerrarSesion() {
  localStorage.removeItem("usuarioActivo");
  window.location.href = "index.html";
}

// Cerrar dropdown al hacer click afuera
window.addEventListener("click", function (e) {
  if (userMenu && userDropdown && !userMenu.contains(e.target)) {
    userDropdown.classList.remove("show");
  }
});