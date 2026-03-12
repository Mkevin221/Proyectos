document.addEventListener("DOMContentLoaded", () => {
  renderSoportes();
  renderFeaturedSoportes();
  initSoportesFilters();
});

// ==========================
// OBTENER SOLO SOPORTES
// ==========================
function getSoportesProducts() {
  return getProductsByCategory("soportes").filter(product => product.stock > 0);
}

// ==========================
// CREAR TAGS DE FILTRO
// ==========================
function getSoporteTags(product) {
  const text = `${product.name} ${product.description || ""}`.toLowerCase();
  const tags = [];

  if (text.includes("fijo")) tags.push("tv-fijo");
  if (text.includes("inclinable")) tags.push("tv-inclinable");
  if (text.includes("brazo")) tags.push("tv-brazo");
  if (text.includes("monitor")) tags.push("monitor");
  if (text.includes("ordenador") || text.includes("computador")) tags.push("ordenador");

  return tags;
}

// ==========================
// RENDER DE SOPORTES
// ==========================
function renderSoportes(filter = "todos") {
  const container = document.getElementById("soportesGrid");
  if (!container) return;

  const soportes = getSoportesProducts();

  if (!soportes.length) {
    container.innerHTML = `
      <p style="grid-column: 1 / -1; text-align:center;">
        No hay soportes disponibles en el inventario en este momento.
      </p>
    `;
    return;
  }

  let filteredProducts = soportes;

  if (filter !== "todos") {
    filteredProducts = soportes.filter(product => {
      const tags = getSoporteTags(product);
      return tags.includes(filter);
    });
  }

  if (!filteredProducts.length) {
    container.innerHTML = `
      <p style="grid-column: 1 / -1; text-align:center;">
        No se encontraron soportes con ese filtro.
      </p>
    `;
    return;
  }

  container.innerHTML = filteredProducts.map(product => {
    const tags = getSoporteTags(product);

    let badgeText = "Disponible";
    if (tags.includes("tv-fijo")) badgeText = "TV fijo";
    else if (tags.includes("tv-inclinable")) badgeText = "TV inclinable";
    else if (tags.includes("tv-brazo")) badgeText = "TV brazo";
    else if (tags.includes("monitor")) badgeText = "Monitor";
    else if (tags.includes("ordenador")) badgeText = "Ordenador";

    return `
      <article class="product-card-shop show">
        <div class="product-image-shop">
          ${product.image ? `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.parentElement.textContent='${product.name}'">` : product.name}
        </div>
        <div class="product-content-shop">
          <span class="product-label">${badgeText}</span>
          <h3>${product.name}</h3>
          <p>${product.description || "Soporte disponible en ElectroShop."}</p>
          <div class="product-bottom">
            <strong class="price">${formatCurrency(product.price)}</strong>
            <button class="btn btn-primary" onclick="addSoporteToCart(${product.id})">Agregar</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

// ==========================
// RENDER DESTACADOS
// ==========================
function renderFeaturedSoportes() {
  const container = document.getElementById("soportesFeaturedGrid");
  if (!container) return;

  const featured = getFeaturedProductsByCategory("soportes", 3);

  if (!featured.length) {
    container.innerHTML = `
      <p style="grid-column: 1 / -1; text-align:center;">
        No hay soportes destacados disponibles por ahora.
      </p>
    `;
    return;
  }

  container.innerHTML = featured.map(product => {
    return `
      <article class="featured-card">
        <div class="featured-image">
          ${product.image ? `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.parentElement.textContent='${product.name}'">` : product.name}
        </div>
        <div class="featured-info">
          <h3>${product.name}</h3>
          <p>${product.description || "Soporte destacado del inventario."}</p>
          <span class="price">${formatCurrency(product.price)}</span>
        </div>
      </article>
    `;
  }).join("");
}

// ==========================
// FILTROS DE SOPORTES
// ==========================
function initSoportesFilters() {
  const filterButtons = document.querySelectorAll(".filter-chip");
  if (!filterButtons.length) return;

  filterButtons.forEach(button => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      filterButtons.forEach(btn => btn.classList.remove("active-chip"));
      button.classList.add("active-chip");

      const filterValue = button.getAttribute("data-filter");
      renderSoportes(filterValue);
    });
  });
}

// ==========================
// AGREGAR AL CARRITO
// ==========================
function addSoporteToCart(productId) {
  const result = addToCart(productId, 1);

  if (typeof showMessage === "function") {
    showMessage(result.message, result.success ? "success" : "error");
  } else {
    alert(result.message);
  }

  if (result.success) {
    window.location.href = "carrito.html";
  }
}