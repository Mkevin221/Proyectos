document.addEventListener("DOMContentLoaded", () => {
  if (typeof initActiveNav === "function") initActiveNav();
  if (typeof initRevealOnScroll === "function") initRevealOnScroll();
  if (typeof initSmoothAnchorScroll === "function") initSmoothAnchorScroll();
  if (typeof initContactForm === "function") initContactForm();
  if (typeof initUserMenu === "function") initUserMenu();
  if (typeof initProductFilters === "function") initProductFilters();
  if (typeof initLoginForm === "function") initLoginForm();
  if (typeof initRegisterForm === "function") initRegisterForm();
  if (typeof initRememberMe === "function") initRememberMe();
});

// ==========================
// MENÚ DE USUARIO DESPLEGABLE
// ==========================
function initUserMenu() {
  // Botón que abre/cierra el menú
  const toggle = document.getElementById("userMenuToggle");

  // Contenedor desplegable del menú
  const dropdown = document.getElementById("userDropdown");

  // Si no existe alguno de los dos elementos, se detiene la función
  if (!toggle || !dropdown) return;

  // Evento para abrir o cerrar el dropdown al hacer clic en el botón
  toggle.addEventListener("click", function (e) {
    e.preventDefault();      // Evita comportamiento por defecto
    e.stopPropagation();     // Evita que el clic se propague al documento
    dropdown.classList.toggle("show"); // Agrega o quita la clase show
  });

  // Evita que al hacer clic dentro del dropdown se cierre inmediatamente
  dropdown.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  // Cierra el menú si se hace clic fuera del botón o del dropdown
  document.addEventListener("click", function (e) {
    if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
}



// ==========================
// MENSAJES Y BOTONES
// ==========================
function showMessage(message, type = "success") {
  const oldToast = document.querySelector(".custom-toast");
  if (oldToast) oldToast.remove();

  const toast = document.createElement("div");
  toast.className = `custom-toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 50);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function setButtonLoading(button, isLoading, loadingText = "Procesando...") {
  if (!button) return;

  if (isLoading) {
    button.dataset.originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = loadingText;
    button.style.opacity = "0.8";
    button.style.cursor = "not-allowed";
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || "Enviar";
    button.style.opacity = "1";
    button.style.cursor = "pointer";
  }
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

function isStrongEnoughPassword(password) {
  return password.trim().length >= 6;
}

// ==========================
// NAV ACTIVA
// ==========================
function initActiveNav() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach(link => {
    const linkPath = link.getAttribute("href");
    if (linkPath === currentPath) {
      link.classList.add("active");
    }
  });
}

// ==========================
// DESPLAZAMIENTO SUAVE
// ==========================
function initSmoothAnchorScroll() {
  const anchors = document.querySelectorAll('a[href^="#"]');

  anchors.forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });
}

// ==========================
// ANIMACIÓN AL HACER SCROLL
// ==========================
function initRevealOnScroll() {
  const elements = document.querySelectorAll(`
    .hero-text,
    .hero-image,
    .category-card,
    .product-card,
    .benefit-card,
    .contact-card,
    .form-card,
    .category-product-card,
    .featured-card,
    .product-card-shop,
    .mini-benefit-card,
    .quick-contact-card,
    .contact-info-panel,
    .contact-form-panel,
    .location-card,
    .faq-card,
    .benefit-box,
    .brand-card,
    .step-card,
    .profile-user-card,
    .profile-box,
    .profile-menu,
    .auth-card,
    .auth-side-panel
  `);

  if (!elements.length) return;

  elements.forEach(el => {
    el.classList.add("reveal-item");
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
      }
    });
  }, {
    threshold: 0.12
  });

  elements.forEach(el => observer.observe(el));
}

// ==========================
// FORMULARIO DE CONTACTO
// ==========================
function initContactForm() {
  const form = document.querySelector(".form-card form, .contact-form-panel form, .contact-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nameInput = form.querySelector('input[name="nombre"]');
    const emailInput = form.querySelector('input[type="email"]');
    const phoneInput = form.querySelector('input[name="telefono"]');
    const messageInput = form.querySelector("textarea");
    const submitBtn = form.querySelector('button[type="submit"]');

    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const message = messageInput ? messageInput.value.trim() : "";

    if (!name || name.length < 3) {
      showMessage("Ingresa un nombre válido.", "error");
      nameInput?.focus();
      return;
    }

    if (!email || !isValidEmail(email)) {
      showMessage("Ingresa un correo electrónico válido.", "error");
      emailInput?.focus();
      return;
    }

    if (!phone || phone.length < 7) {
      showMessage("Ingresa un teléfono válido.", "error");
      phoneInput?.focus();
      return;
    }

    if (!message || message.length < 10) {
      showMessage("Escribe un mensaje válido.", "error");
      messageInput?.focus();
      return;
    }

    setButtonLoading(submitBtn, true, "Enviando...");

    setTimeout(() => {
      setButtonLoading(submitBtn, false);
      showMessage("Tu solicitud fue enviada correctamente.", "success");
      form.reset();
    }, 1200);
  });
}

// ==========================
// FILTRAR PRODUCTOS
// ==========================
function initProductFilters() {
  const filterButtons = document.querySelectorAll(".filter-chip");
  const products = document.querySelectorAll(".product-card-shop");

  if (!filterButtons.length || !products.length) return;

  filterButtons.forEach(button => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      filterButtons.forEach(btn => btn.classList.remove("active-chip"));
      button.classList.add("active-chip");

      const filterValue = button.getAttribute("data-filter");

      products.forEach(product => {
        if (filterValue === "todos" || product.classList.contains(filterValue)) {
          product.classList.add("show");
        } else {
          product.classList.remove("show");
        }
      });
    });
  });
}

// ==========================
// LOGIN
// ==========================
function initLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const rememberInput = document.getElementById("remember");
  const submitBtn = form.querySelector('button[type="submit"]');

  // Precargar correo recordado
  const rememberedEmail = localStorage.getItem("rememberedEmail");
  if (rememberedEmail && emailInput) {
    emailInput.value = rememberedEmail;
    if (rememberInput) rememberInput.checked = true;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    if (!email || !isValidEmail(email)) {
      showMessage("Ingresa un correo válido.", "error");
      emailInput?.focus();
      return;
    }

    if (!password) {
      showMessage("Ingresa tu contraseña.", "error");
      passwordInput?.focus();
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const foundUser = users.find(user =>
      String(user.email || "").toLowerCase() === email &&
      String(user.password || "") === password
    );

    if (!foundUser) {
      showMessage("Correo o contraseña incorrectos.", "error");
      return;
    }

    setButtonLoading(submitBtn, true, "Ingresando...");

    if (rememberInput && rememberInput.checked) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    localStorage.setItem("currentUser", JSON.stringify(foundUser));

    setTimeout(() => {
      setButtonLoading(submitBtn, false);
      showMessage("Inicio de sesión exitoso.", "success");
      window.location.href = "index.html";
    }, 700);
  });
}

// ==========================
// REGISTRO
// ==========================
function initRegisterForm() {
  const form = document.getElementById("register-form");
  if (!form) return;

  const nombreInput = document.getElementById("nombre");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm_password");
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nombre = nombreInput ? nombreInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";
    const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value.trim() : "";

    if (!nombre || nombre.length < 3) {
      showMessage("Ingresa un nombre válido.", "error");
      nombreInput?.focus();
      return;
    }

    if (!email || !isValidEmail(email)) {
      showMessage("Ingresa un correo válido.", "error");
      emailInput?.focus();
      return;
    }

    if (!isStrongEnoughPassword(password)) {
      showMessage("La contraseña debe tener al menos 6 caracteres.", "error");
      passwordInput?.focus();
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Las contraseñas no coinciden.", "error");
      confirmPasswordInput?.focus();
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.some(user =>
      String(user.email || "").toLowerCase() === email
    );

    if (exists) {
      showMessage("Ese correo ya está registrado.", "error");
      emailInput?.focus();
      return;
    }

    setButtonLoading(submitBtn, true, "Registrando...");

    const newUser = {
      id: users.length ? Math.max(...users.map(user => user.id || 0)) + 1 : 1,
      nombre: nombre,
      email: email,
      password: password,
      telefono: "",
      ciudad: "",
      avatar: "",
      role: "Cliente",
      status: "Activo",
      date: new Date().toISOString().split("T")[0]
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(newUser));

    setTimeout(() => {
      setButtonLoading(submitBtn, false);
      showMessage("Registro exitoso.", "success");
      window.location.href = "login.html";
    }, 700);
  });
}

// ==========================
// RECORDAR CORREO
// ==========================
function initRememberMe() {
  const emailInput = document.getElementById("email");
  const rememberInput = document.getElementById("remember");

  if (!emailInput || !rememberInput) return;

  const rememberedEmail = localStorage.getItem("rememberedEmail");
  if (rememberedEmail) {
    emailInput.value = rememberedEmail;
    rememberInput.checked = true;
  }
}