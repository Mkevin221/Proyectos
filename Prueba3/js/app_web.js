document.addEventListener("DOMContentLoaded", () => {
  initActiveNav();
  initRevealOnScroll();
  initSmoothAnchorScroll();
  initContactForm();
  initLoginForm();
  initRegisterForm();
  initRememberMe();
  initAutoFadeMessages();
  initUserMenu();
});

/* =========================
   UTILIDADES
========================= */
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

/* =========================
   NAV ACTIVA AUTOMATICA
========================= */
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

/* =========================
   SCROLL SUAVE PARA ANCLAS
========================= */
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

/* =========================
   REVEAL ON SCROLL
========================= */
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

/* =========================
   FORMULARIO CONTACTO
========================= */
function initContactForm() {
  const form = document.querySelector(".form-card form, .contact-form-panel form, .contact-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nameInput =
      form.querySelector('input[name="nombre"]') ||
      form.querySelector('input[placeholder*="Nombre"]') ||
      form.querySelector('input[type="text"]');

    const emailInput = form.querySelector('input[type="email"]');
    const phoneInput =
      form.querySelector('input[name="telefono"]') ||
      form.querySelector('input[placeholder*="Teléfono"]') ||
      form.querySelectorAll('input[type="text"]')[1];

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
      showMessage("Ingresa un teléfono o WhatsApp válido.", "error");
      phoneInput?.focus();
      return;
    }

    if (!message || message.length < 10) {
      showMessage("Cuéntanos un poco más sobre el producto que te interesa.", "error");
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

/* =========================
   LOGIN
========================= */
function initLoginForm() {
  const loginForm =
    document.querySelector('form[action*="login"]') ||
    document.querySelector(".auth-form.login-form");

  if (!loginForm) return;

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const emailInput = loginForm.querySelector('input[type="email"]');
    const passwordInput = loginForm.querySelector('input[type="password"]');
    const rememberInput = loginForm.querySelector('input[type="checkbox"][name="remember"], .remember-me input');
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    if (!email || !isValidEmail(email)) {
      showMessage("Ingresa un correo válido para iniciar sesión.", "error");
      emailInput?.focus();
      return;
    }

    if (!password || password.length < 6) {
      showMessage("La contraseña debe tener al menos 6 caracteres.", "error");
      passwordInput?.focus();
      return;
    }

    if (rememberInput?.checked) {
      localStorage.setItem("electroshopRememberEmail", email);
    } else {
      localStorage.removeItem("electroshopRememberEmail");
    }

    setButtonLoading(submitBtn, true, "Ingresando...");

    setTimeout(() => {
      setButtonLoading(submitBtn, false);
      showMessage("Inicio de sesión válido. Conecta este formulario a tu backend.", "success");
      // loginForm.submit();
    }, 1000);
  });
}

/* =========================
   REGISTRO
========================= */
function initRegisterForm() {
  const registerForm =
    document.querySelector('form[action*="registro"]') ||
    document.querySelector(".auth-form.register-form");

  if (!registerForm) return;

  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const nameInput =
      registerForm.querySelector('input[name="nombre"]') ||
      registerForm.querySelector("#nombre");

    const emailInput =
      registerForm.querySelector('input[type="email"]') ||
      registerForm.querySelector('input[name="email"]');

    const passwordInput =
      registerForm.querySelector('input[name="password"]') ||
      registerForm.querySelector("#password");

    const confirmPasswordInput =
      registerForm.querySelector('input[name="confirm_password"]') ||
      registerForm.querySelector("#confirm_password");

    const submitBtn = registerForm.querySelector('button[type="submit"]');

    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";
    const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : "";

    if (!name || name.length < 3) {
      showMessage("Ingresa tu nombre completo correctamente.", "error");
      nameInput?.focus();
      return;
    }

    if (!email || !isValidEmail(email)) {
      showMessage("Ingresa un correo electrónico válido.", "error");
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

    setButtonLoading(submitBtn, true, "Registrando...");

    setTimeout(() => {
      setButtonLoading(submitBtn, false);
      showMessage("Registro validado correctamente. Ahora conecta este formulario a registro.php.", "success");
      // registerForm.submit();
    }, 1200);
  });
}

/* =========================
   RECORDAR EMAIL EN LOGIN
========================= */
function initRememberMe() {
  const loginForm = document.querySelector('form[action*="login"], .auth-form.login-form');
  if (!loginForm) return;

  const emailInput = loginForm.querySelector('input[type="email"]');
  const rememberInput = loginForm.querySelector('input[type="checkbox"][name="remember"], .remember-me input');

  if (!emailInput || !rememberInput) return;

  const savedEmail = localStorage.getItem("electroshopRememberEmail");
  if (savedEmail) {
    emailInput.value = savedEmail;
    rememberInput.checked = true;
  }
}

/* =========================
   MENSAJES FLASH AUTO-OCULTAR
========================= */
function initAutoFadeMessages() {
  const flashMessages = document.querySelectorAll(".flash-message");
  if (!flashMessages.length) return;

  flashMessages.forEach(msg => {
    setTimeout(() => {
      msg.style.opacity = "0";
      msg.style.transform = "translateY(-10px)";
      setTimeout(() => msg.remove(), 300);
    }, 3000);
  });
}

/* =========================
   MENU USUARIO
========================= */
function initUserMenu() {
  const toggle = document.getElementById("userMenuToggle");
  const dropdown = document.getElementById("userDropdown");

  if (!toggle || !dropdown) return;

  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  document.addEventListener("click", function (e) {
    if (!dropdown.contains(e.target) && !toggle.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
}