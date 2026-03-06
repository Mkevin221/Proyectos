// ../Probar/js/perfil_user.js
document.addEventListener("DOMContentLoaded", () => {
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

  // Proteger acceso
  if (!usuarioActivo) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("backHomeBtn")?.addEventListener("click", () => {
  window.location.href = "menu_principal.html";
});

  // Inputs
  const nameInput = document.getElementById("nombre");
  const emailInput = document.getElementById("correo");
  const telInput = document.getElementById("telefono");
  const docInput = document.getElementById("documento");

  // Vista previa
  const avatar = document.getElementById("profileAvatar");
  const profileUserName = document.getElementById("profileUserName");
  const profileUserEmail = document.getElementById("profileUserEmail");

  // Botones
  const editBtn = document.getElementById("editProfileBtn");
  const saveBtn = document.getElementById("saveBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // Último pedido
  const lastOrderInfo = document.getElementById("lastOrderInfo");
  const viewLastOrderBtn = document.getElementById("viewLastOrderBtn");

  // Animación (si usas .reveal en el HTML)
  document.querySelectorAll(".reveal").forEach((el, i) => {
    setTimeout(() => el.classList.add("show"), 120 * i);
  });

  // Datos iniciales (si no existen, quedan vacíos)
  let initial = {
    fullName: usuarioActivo.fullName || "Usuario",
    email: usuarioActivo.email || "usuario@email.com",
    phone: usuarioActivo.phone || "",
    document: usuarioActivo.document || "",
  };

  // Pintar en UI
  const paint = (d) => {
    const name = (d.fullName || "Usuario").trim();
    const email = (d.email || "usuario@email.com").trim();

    profileUserName.textContent = name;
    profileUserEmail.textContent = email;
    avatar.textContent = (name.charAt(0) || "U").toUpperCase();

    nameInput.value = name;
    emailInput.value = email;

    if (telInput) telInput.value = d.phone || "";
    if (docInput) docInput.value = d.document || "";
  };

  paint(initial);

  // Preview en vivo
  const updatePreview = () => {
    const name = (nameInput.value || "Usuario").trim();
    const email = (emailInput.value || "usuario@email.com").trim();

    profileUserName.textContent = name || "Usuario";
    profileUserEmail.textContent = email || "usuario@email.com";
    avatar.textContent = (name || "U").charAt(0).toUpperCase();
  };

  nameInput.addEventListener("input", updatePreview);
  emailInput.addEventListener("input", updatePreview);

  // Editar
  editBtn?.addEventListener("click", () => {
    nameInput.focus();
    nameInput.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  // Guardar (actualiza usuarioActivo + usuarios)
  saveBtn.addEventListener("click", () => {
    const oldEmail = (usuarioActivo.email || "").toLowerCase();

    const updated = {
      ...usuarioActivo, // conserva password
      fullName: nameInput.value.trim() || "Usuario",
      email: emailInput.value.trim().toLowerCase() || "usuario@email.com",
      phone: telInput ? telInput.value.trim() : "",
      document: docInput ? docInput.value.trim() : "",
    };

    // Actualiza usuarioActivo
    localStorage.setItem("usuarioActivo", JSON.stringify(updated));

    // Actualiza también en "usuarios" para que persista al volver a iniciar sesión
    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const idx = usuarios.findIndex((u) => (u.email || "").toLowerCase() === oldEmail);
    if (idx !== -1) {
      usuarios[idx] = { ...usuarios[idx], ...updated };
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }

    // Actualiza el objeto en memoria
    usuarioActivo.fullName = updated.fullName;
    usuarioActivo.email = updated.email;
    usuarioActivo.phone = updated.phone;
    usuarioActivo.document = updated.document;

    // actualizar snapshot para cancelar
    initial = {
      fullName: updated.fullName,
      email: updated.email,
      phone: updated.phone,
      document: updated.document,
    };

    const prev = saveBtn.textContent;
    saveBtn.textContent = "Guardado ✓";
    saveBtn.disabled = true;

    setTimeout(() => {
      saveBtn.textContent = prev;
      saveBtn.disabled = false;
    }, 1200);

    // Refresca datos de pedidos (por si cambió el email)
    hydrateOrdersAndUI();
  });

  // Cancelar (vuelve al estado inicial)
  cancelBtn.addEventListener("click", () => {
    paint(initial);
  });

  // Cerrar sesión real
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("usuarioActivo");
    window.location.href = "index.html";
  });

  // -------------------------
  // PEDIDOS (integración real)
  // -------------------------

  const moneyCOP = (n) =>
    Number(n || 0).toLocaleString("es-CO", { style: "currency", currency: "COP" });

  const fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "2-digit" });
  };

  const getOrders = () => JSON.parse(localStorage.getItem("pedidos") || "[]");
  const setOrders = (orders) => localStorage.setItem("pedidos", JSON.stringify(orders));

  const ensureDemoOrders = () => {
    // Crea demo solo si NO hay pedidos en storage para este usuario
    const email = (usuarioActivo.email || "").toLowerCase();
    const orders = getOrders();
    const mine = orders.filter((o) => (o.userEmail || "").toLowerCase() === email);

    if (mine.length > 0) return; // ya tiene pedidos

    const today = new Date();
    const iso1 = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString();
    const iso2 = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 18).toISOString();

    const demo = [
      {
        id: "NE-1024",
        fecha: iso1,
        estado: "en_camino", // en_camino | entregado
        total: 1899000,
        userEmail: email,
        items: [{ nombre: "Televisor 50''", qty: 1 }],
      },
      {
        id: "NE-1007",
        fecha: iso2,
        estado: "entregado",
        total: 759000,
        userEmail: email,
        items: [{ nombre: "Microondas", qty: 1 }],
      },
    ];

    setOrders([...orders, ...demo]);
  };

  const getMyOrdersSorted = () => {
    const email = (usuarioActivo.email || "").toLowerCase();
    const orders = getOrders()
      .filter((o) => (o.userEmail || "").toLowerCase() === email)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    return orders;
  };

  const updateSummaryFromOrders = (orders) => {
    // Actualiza números del resumen si existen
    const statNums = document.querySelectorAll(".stat .stat-num");
    if (statNums.length < 2) return;

    const total = orders.length;
    const enCamino = orders.filter((o) => o.estado === "en_camino").length;

    statNums[0].textContent = String(total);
    statNums[1].textContent = String(enCamino);
  };

  const renderLastOrder = (orders) => {
    if (!lastOrderInfo) return;

    if (!orders.length) {
      lastOrderInfo.textContent = "Aún no tienes pedidos. ¡Explora el catálogo y realiza tu primera compra!";
      if (viewLastOrderBtn) viewLastOrderBtn.disabled = true;
      return;
    }

    const last = orders[0];
    const estadoTxt = last.estado === "entregado" ? "Entregado" : "En camino";

    lastOrderInfo.textContent =
      `Pedido ${last.id} • ${estadoTxt} • ${fmtDate(last.fecha)} • Total: ${moneyCOP(last.total)}`;

    if (viewLastOrderBtn) {
      viewLastOrderBtn.disabled = false;

      // Guardamos el último pedido seleccionado para la página pedidos.html
      viewLastOrderBtn.onclick = () => {
        localStorage.setItem("pedidoSeleccionado", JSON.stringify(last));
        window.location.href = "pedidos.html";
      };
    }
  };

  const hydrateOrdersAndUI = () => {
    ensureDemoOrders();
    const orders = getMyOrdersSorted();
    updateSummaryFromOrders(orders);
    renderLastOrder(orders);
  };

  hydrateOrdersAndUI();
});