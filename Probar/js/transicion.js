/************************************************************
 * ✅ LOGIN / REGISTRO - NovaElectro
 * - Guarda usuarios en localStorage: "usuarios"
 * - Guarda sesión actual en localStorage: "usuarioActivo"
 * - Crea/asegura cuenta ADMIN automáticamente
 * - Limpia inputs al iniciar sesión (sin borrar datos)
 ************************************************************/

/* ===========================
   1) REFERENCIAS DEL DOM
   =========================== */
const container = document.getElementById("container");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

/* ===========================
   2) TRANSICIÓN (LOGIN / REGISTER)
   =========================== */
if (registerBtn && container) {
  registerBtn.addEventListener("click", () => container.classList.add("active"));
}
if (loginBtn && container) {
  loginBtn.addEventListener("click", () => container.classList.remove("active"));
}

/* ===========================
   3) TOAST (MENSAJES)
   =========================== */
function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => toast.classList.remove("show"), 3000);
}

/* ===========================
   4) HELPERS LOCALSTORAGE
   =========================== */
function obtenerUsuarios() {
  return JSON.parse(localStorage.getItem("usuarios")) || [];
}

function guardarUsuarios(usuarios) {
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

/* ==========================================================
   5) ✅ ASEGURAR ADMIN (CORRECCIÓN IMPORTANTE)
   - Antes: solo lo creaba si no existía.
   - Ahora: si ya existe, lo "corrige" para que sea admin.
   - Así nunca te quedas sin poder entrar como admin.
   ========================================================== */
(function asegurarAdmin() {
  const usuarios = obtenerUsuarios();

  // ✅ Datos del admin (usa estos para iniciar sesión)
  const adminEmail = "yosoyadmin@gmail.com";
  const adminPass = "12345677"; // 8+ caracteres (porque tu input minlength=8)

  const idx = usuarios.findIndex(
    (u) => (u.email || "").toLowerCase() === adminEmail
  );

  if (idx === -1) {
    // ✅ Si NO existe, lo creamos
    usuarios.push({
      fullName: "Admin",
      email: adminEmail,
      password: adminPass,
      role: "admin",
      status: "active",
    });
  } else {
    // ✅ Si YA existe, lo corregimos para que sea admin
    usuarios[idx].role = "admin";
    usuarios[idx].status = "active";

    // ✅ En pruebas conviene forzar la contraseña para evitar bloqueos
    usuarios[idx].password = adminPass;

    // (Opcional) asegurar nombre
    usuarios[idx].fullName = usuarios[idx].fullName || "Admin";
  }

  guardarUsuarios(usuarios);
})();

/* ===========================
   6) REGISTRO
   - Crea usuarios normales: role="user"
   =========================== */
if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const fullName = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validación HTML
    if (!registerForm.checkValidity()) {
      showToast("Completa correctamente los campos del registro.", "error");
      return;
    }

    // Confirmación de contraseña
    if (password !== confirmPassword) {
      showToast("Las contraseñas no coinciden.", "error");
      return;
    }

    const usuarios = obtenerUsuarios();

    // Evitar correos duplicados
    const correoExistente = usuarios.some(
      (usuario) => (usuario.email || "").toLowerCase() === email
    );

    if (correoExistente) {
      showToast("Ese correo ya está registrado.", "error");
      return;
    }

    // Crear usuario normal
    const nuevoUsuario = {
      fullName,
      email,
      password,
      role: "user",
      status: "active",
    };

    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);

    showToast("Registro exitoso.", "success");

    // Limpieza visual
    registerForm.reset();
    container?.classList.remove("active"); // vuelve al login
    loginForm?.reset(); // opcional: limpia login
  });
}

/* ===========================
   7) LOGIN
   - Inicia sesión y redirige según rol
   - Limpia inputs al entrar (sin borrar datos)
   =========================== */
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const loginEmail = document.getElementById("loginEmail").value.trim().toLowerCase();
    const loginPassword = document.getElementById("loginPassword").value;

    // Validación HTML
    if (!loginForm.checkValidity()) {
      showToast("Completa correctamente los campos de inicio de sesión.", "error");
      return;
    }

    const usuarios = obtenerUsuarios();

    // Buscar usuario por email+password
    const usuarioEncontrado = usuarios.find(
      (usuario) =>
        (usuario.email || "").toLowerCase() === loginEmail &&
        usuario.password === loginPassword
    );

    if (!usuarioEncontrado) {
      showToast("Correo o contraseña incorrectos.", "error");
      return;
    }

    // Bloquear si está suspendido
    if (usuarioEncontrado.status === "suspended") {
      showToast("Tu cuenta está suspendida. Contacta al administrador.", "error");
      return;
    }

    // Guardar sesión
    localStorage.setItem("usuarioActivo", JSON.stringify(usuarioEncontrado));

    // ✅ Limpieza al iniciar sesión (NO borra usuarios)
    localStorage.removeItem("pedidoSeleccionado"); // opcional
    loginForm.reset();
    registerForm?.reset();
    container?.classList.remove("active");

    showToast("Inicio de sesión exitoso.", "success");

    // Redirección según rol
    setTimeout(() => {
  window.location.href = (usuarioEncontrado.role === "admin")
    ? "administrador.html"
    : "menu_principal.html";
}, 800);
  });
}