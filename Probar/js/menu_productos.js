document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("productsContainer");
  if (!container) return;

  const productos = JSON.parse(localStorage.getItem("productos") || "[]");
  const publicados = productos.filter(p => p.published === true);

  if (publicados.length === 0) {
    container.innerHTML = `<p style="color:#64748b;">Aún no hay productos publicados.</p>`;
    return;
  }

  const money = (n) =>
    Number(n || 0).toLocaleString("es-CO", { style: "currency", currency: "COP" });

  // ✅ RENDER con data-id en la tarjeta (IMPORTANTE para abrir drawer)
  container.innerHTML = publicados.map(p => `
    <article class="product" data-id="${p.id}">
      <div class="product-top">
        ${p.imageUrl
          ? `<img src="${p.imageUrl}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;">`
          : `<div style="font-size:74px;">${p.icon ? p.icon : "📦"}</div>`}
      </div>

      <div class="product-body">
        <h3>${p.name || "Producto"}</h3>
        <p>${p.desc || ""}</p>

        <div class="product-footer">
          <span class="price">${money(p.price)}</span>
          <button class="buy" type="button" data-id="${p.id}">Agregar</button>
        </div>
      </div>
    </article>
  `).join("");

  // ===== Drawer refs =====
  const drawer = document.getElementById("productDrawer");
  const overlay = document.getElementById("drawerOverlay");
  const closeBtn = document.getElementById("drawerClose");

  const drawerMedia = document.getElementById("drawerMedia");
  const drawerTitle = document.getElementById("drawerTitle");
  const drawerMeta = document.getElementById("drawerMeta");
  const drawerPrice = document.getElementById("drawerPrice");
  const drawerDesc = document.getElementById("drawerDesc");
  const drawerStock = document.getElementById("drawerStock");
  const drawerBadge = document.getElementById("drawerBadge");

  const qtyMinus = document.getElementById("qtyMinus");
  const qtyPlus = document.getElementById("qtyPlus");
  const qtyInput = document.getElementById("qtyInput");
  const drawerAddBtn = document.getElementById("drawerAddBtn");

  let currentProduct = null;

  function openDrawer(product) {
    if (!drawer || !overlay) return;

    currentProduct = product;

    drawerMedia.innerHTML = product.imageUrl
      ? `<img src="${product.imageUrl}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;display:block;">`
      : `<div style="font-size:72px;opacity:.7;">${product.icon || "📦"}</div>`;

    drawerTitle.textContent = product.name || "Producto";
    drawerMeta.textContent = `${product.model ? "Modelo: " + product.model : "Sin modelo"} • ${product.category || "Sin categoría"}`;
    drawerPrice.textContent = money(product.price);
    drawerDesc.textContent = product.desc || "Sin descripción.";

    const stock = Number(product.stock ?? 0);
    drawerStock.textContent = `Stock: ${stock}`;

    if (stock <= 0) {
      drawerBadge.textContent = "Sin stock";
      drawerBadge.classList.add("out");
      drawerAddBtn.disabled = true;
      drawerAddBtn.style.opacity = "0.6";
    } else {
      drawerBadge.textContent = "Disponible";
      drawerBadge.classList.remove("out");
      drawerAddBtn.disabled = false;
      drawerAddBtn.style.opacity = "1";
    }

    qtyInput.value = 1;

    overlay.classList.add("open");
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    if (!drawer || !overlay) return;

    overlay.classList.remove("open");
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    currentProduct = null;
  }

  closeBtn?.addEventListener("click", closeDrawer);
  overlay?.addEventListener("click", closeDrawer);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  qtyMinus?.addEventListener("click", () => {
    qtyInput.value = Math.max(1, Number(qtyInput.value || 1) - 1);
  });
  qtyPlus?.addEventListener("click", () => {
    qtyInput.value = Math.max(1, Number(qtyInput.value || 1) + 1);
  });
  qtyInput?.addEventListener("input", () => {
    qtyInput.value = Math.max(1, Number(qtyInput.value || 1));
  });

  // ✅ 1) Click en Agregar (NO abre drawer) + carrito + animación
container.addEventListener("click", (e) => {
  const btn = e.target.closest(".buy");
  if (!btn) return;

  const card = btn.closest(".product");
  const id = btn.dataset.id;

  // ojo: p.id puede ser número y el dataset es string
  const prod = publicados.find(p => String(p.id) === String(id));
  if (!prod) return;

  // construir objeto para carrito
  const productForCart = {
    id: prod.id,
    title: prod.name || "Producto",
    desc: prod.desc || "",
    price: Number(prod.price || 0),
    img: prod.imageUrl || ""
  };

  addToCart(productForCart);

  // animación: si hay imagen, que vuele la imagen; si no, que vuele el bloque superior
  const imgEl = card?.querySelector(".product-top img");
  flyToCart(imgEl || card?.querySelector(".product-top") || card);
});

  // ✅ 2) Click en tarjeta abre drawer (excepto si fue el botón Agregar)
  container.addEventListener("click", (e) => {
    if (e.target.closest(".buy")) return;

    const card = e.target.closest(".product");
    if (!card) return;

    const id = card.dataset.id;
    const prod = publicados.find(p => p.id === id);
    if (!prod) return;

    openDrawer(prod);
  });

  // ✅ Agregar desde el drawer
 drawerAddBtn?.addEventListener("click", () => {
  if (!currentProduct) return;

  const qty = Math.max(1, Number(qtyInput.value || 1));

  const productForCart = {
    id: currentProduct.id,
    title: currentProduct.name || "Producto",
    desc: currentProduct.desc || "",
    price: Number(currentProduct.price || 0),
    img: currentProduct.imageUrl || ""
  };

  // agrega qty veces (simple y seguro)
  for (let i = 0; i < qty; i++) addToCart(productForCart);

  // animación: volar desde el drawer al carrito
  const fromEl =
    drawerMedia?.querySelector("img") ||
    drawerMedia ||
    drawer;

  flyToCart(fromEl);

  closeDrawer();
});
});