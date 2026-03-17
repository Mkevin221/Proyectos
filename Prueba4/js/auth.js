const STORAGE_USERS = "moneytrack_users";
const STORAGE_SESSION = "moneytrack_session";

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_USERS)) || [];
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

function saveSession(user) {
  localStorage.setItem(STORAGE_SESSION, JSON.stringify(user));
}

function getSession() {
  return JSON.parse(localStorage.getItem(STORAGE_SESSION));
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function showMessage(container, message, type = "error") {
  if (!container) return;
  container.textContent = message;
  container.className = `auth-message ${type}`;
}

function clearMessage(container) {
  if (!container) return;
  container.textContent = "";
  container.className = "auth-message";
}

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  const nombre = document.getElementById("nombre");
  const correo = document.getElementById("correo");
  const password = document.getElementById("password");
  const confirmar = document.getElementById("confirmar");
  const mensaje = document.getElementById("authMessage");

  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    clearMessage(mensaje);

    const nombreValue = nombre.value.trim();
    const correoValue = normalizeEmail(correo.value);
    const passwordValue = password.value;
    const confirmarValue = confirmar.value;

    if (!nombreValue || !correoValue || !passwordValue || !confirmarValue) {
      showMessage(mensaje, "Completa todos los campos.");
      return;
    }

    if (passwordValue.length < 6) {
      showMessage(mensaje, "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (passwordValue !== confirmarValue) {
      showMessage(mensaje, "Las contraseñas no coinciden.");
      return;
    }

    const users = getUsers();
    const existe = users.some(user => user.email === correoValue);

    if (existe) {
      showMessage(mensaje, "Ese correo ya está registrado.");
      return;
    }

    const newUser = {
      id: Date.now(),
      name: nombreValue,
      email: correoValue,
      password: passwordValue
    };

    users.push(newUser);
    saveUsers(users);
    localStorage.removeItem(STORAGE_SESSION);

    showMessage(mensaje, "Cuenta creada correctamente. Redirigiendo al login...", "success");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 900);
  });
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  const correo = document.getElementById("correo");
  const password = document.getElementById("password");
  const mensaje = document.getElementById("authMessage");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    clearMessage(mensaje);

    const correoValue = normalizeEmail(correo.value);
    const passwordValue = password.value;

    if (!correoValue || !passwordValue) {
      showMessage(mensaje, "Completa correo y contraseña.");
      return;
    }

    const users = getUsers();
    const user = users.find(
      item => item.email === correoValue && item.password === passwordValue
    );

    if (!user) {
      showMessage(mensaje, "Correo o contraseña incorrectos.");
      return;
    }

    saveSession({
      id: user.id,
      name: user.name,
      email: user.email
    });

    showMessage(mensaje, "Inicio de sesión correcto. Redirigiendo...", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 700);
  });
}