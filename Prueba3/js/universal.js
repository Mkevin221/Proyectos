document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // ===== Helpers =====
  function $(id) {
    return document.getElementById(id);
  }

  function showMessage(message, type = "success") {
    const oldToast = document.querySelector(".custom-toast");
    if (oldToast) oldToast.remove();

    const toast = document.createElement("div");
    toast.className = `custom-toast ${type}`;
    toast.innerHTML = `
      <div class="toast-message">${message}</div>
      <button class="close-btn" type="button">&times;</button>
    `;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 50);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);

    const closeBtn = toast.querySelector(".close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
      });
    }
  }

  function setAvatar(el, user) {
    if (!el || !user) return;

    el.style.backgroundImage = "";
    el.classList.remove("has-image");
    el.textContent = "";

    if (user.avatar && user.avatar.trim() !== "") {
      el.style.backgroundImage = `url("${user.avatar}")`;
      el.classList.add("has-image");
    } else {
      el.textContent = user.nombre ? user.nombre.charAt(0).toUpperCase() : "U";
    }
  }

  function updateUserEverywhere(updatedUser) {
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    let users = JSON.parse(localStorage.getItem("users")) || [];
    users = users.map(u => {
      if (u.email === updatedUser.email || u.id === updatedUser.id) {
        return { ...u, ...updatedUser };
      }
      return u;
    });
    localStorage.setItem("users", JSON.stringify(users));
  }

  // ===== Redirección si no hay usuario =====
  const protectedPage = document.body.dataset.private === "true"
    || window.location.pathname.includes("perfil")
    || window.location.pathname.includes("pedidos")
    || window.location.pathname.includes("configuracion");

  if (!currentUser && protectedPage) {
    window.location.href = "login.html";
    return;
  }

  // ===== Header =====
  const userName = $("userName");
  const userAvatar = $("userAvatar");
  const logoutBtn = $("logoutBtn");

  if (currentUser) {
    if (userName) userName.textContent = currentUser.nombre || "Usuario";
    setAvatar(userAvatar, currentUser);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("currentUser");
      window.location.href = "login.html";
    });
  }

  // ===== Perfil / Sidebar =====
  const profileName = $("profileName");
  const profileAvatar = $("profileAvatar");
  const profileFullName = $("profileFullName");
  const profileEmail = $("profileEmail");
  const profilePhone = $("profilePhone");
  const profileCity = $("profileCity");

  if (currentUser) {
    if (profileName) profileName.textContent = currentUser.nombre || "";
    if (profileFullName) profileFullName.textContent = currentUser.nombre || "";
    if (profileEmail) profileEmail.textContent = currentUser.email || "";
    if (profilePhone) profilePhone.textContent = currentUser.telefono || "No disponible";
    if (profileCity) profileCity.textContent = currentUser.ciudad || "No disponible";

    setAvatar(profileAvatar, currentUser);
  }

  // ===== Configuración: cargar datos =====
  const nombre = $("nombre");
  const correo = $("correo");
  const telefono = $("telefono");
  const ciudad = $("ciudad");

  if (currentUser) {
    if (nombre) nombre.value = currentUser.nombre || "";
    if (correo) correo.value = currentUser.email || "";
    if (telefono) telefono.value = currentUser.telefono || "";
    if (ciudad) ciudad.value = currentUser.ciudad || "";
  }

  // ===== Guardar datos de cuenta =====
  const accountForm = $("accountForm");
  if (accountForm && currentUser) {
    accountForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const updatedUser = {
        ...currentUser,
        nombre: nombre ? nombre.value.trim() : currentUser.nombre,
        email: correo ? correo.value.trim() : currentUser.email,
        telefono: telefono ? telefono.value.trim() : currentUser.telefono,
        ciudad: ciudad ? ciudad.value.trim() : currentUser.ciudad
      };

      updateUserEverywhere(updatedUser);

      if (userName) userName.textContent = updatedUser.nombre || "Usuario";
      if (profileName) profileName.textContent = updatedUser.nombre || "";
      if (profileFullName) profileFullName.textContent = updatedUser.nombre || "";
      if (profileEmail) profileEmail.textContent = updatedUser.email || "";
      if (profilePhone) profilePhone.textContent = updatedUser.telefono || "No disponible";
      if (profileCity) profileCity.textContent = updatedUser.ciudad || "No disponible";

      setAvatar(userAvatar, updatedUser);
      setAvatar(profileAvatar, updatedUser);

      showMessage("Datos actualizados correctamente.", "success");
    });
  }

  // ===== Guardar avatar =====
  const avatarForm = $("avatarForm");
  const avatarInput = $("avatar");

  if (avatarForm && avatarInput && currentUser) {
    avatarForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const file = avatarInput.files[0];
      if (!file) {
        showMessage("Selecciona una imagen.", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (event) {
        const updatedUser = {
          ...JSON.parse(localStorage.getItem("currentUser")),
          avatar: event.target.result
        };

        updateUserEverywhere(updatedUser);
        setAvatar(userAvatar, updatedUser);
        setAvatar(profileAvatar, updatedUser);

        showMessage("Foto de perfil actualizada correctamente.", "success");
      };
      reader.readAsDataURL(file);
    });
  }

  // ===== Cambiar contraseña =====
  const passwordForm = $("passwordForm");
  if (passwordForm && currentUser) {
    passwordForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const actual = $("actual")?.value.trim() || "";
      const nueva = $("nueva")?.value.trim() || "";
      const confirmar = $("confirmar")?.value.trim() || "";

      const freshUser = JSON.parse(localStorage.getItem("currentUser"));

      if (actual !== freshUser.password) {
        showMessage("La contraseña actual no es correcta.", "error");
        return;
      }

      if (nueva.length < 6) {
        showMessage("La nueva contraseña debe tener al menos 6 caracteres.", "error");
        return;
      }

      if (nueva !== confirmar) {
        showMessage("Las contraseñas no coinciden.", "error");
        return;
      }

      const updatedUser = { ...freshUser, password: nueva };
      updateUserEverywhere(updatedUser);

      passwordForm.reset();
      showMessage("Contraseña actualizada correctamente.", "success");
    });
  }

  // ===== Pedidos =====
  const ordersList = document.querySelector(".orders-list");
  if (ordersList && currentUser) {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    ordersList.innerHTML = "";

    if (orders.length === 0) {
      ordersList.innerHTML = `<p>No tienes pedidos registrados.</p>`;
    } else {
      orders.forEach(order => {
        const article = document.createElement("article");
        article.className = "order-card";

        article.innerHTML = `
          <div class="order-top">
            <div>
              <span class="order-number">Pedido #${order.id}</span>
              <h3>${order.product}</h3>
            </div>
            <span class="order-status ${String(order.status || "").toLowerCase().replace(/\s+/g, "-")}">${order.status}</span>
          </div>

          <div class="order-details">
            <div class="order-detail-item">
              <span>Fecha</span>
              <strong>${order.date}</strong>
            </div>
            <div class="order-detail-item">
              <span>Total</span>
              <strong>$${order.total}</strong>
            </div>
            <div class="order-detail-item">
              <span>Método</span>
              <strong>${order.paymentMethod}</strong>
            </div>
            <div class="order-detail-item">
              <span>Entrega</span>
              <strong>${order.deliveryStatus}</strong>
            </div>
          </div>

          <div class="order-actions">
            <a href="#" class="btn btn-light">Ver detalle</a>
          </div>
        `;

        ordersList.appendChild(article);
      });
    }
  }
});