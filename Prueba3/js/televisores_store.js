document.addEventListener("DOMContentLoaded", () => {
  renderTelevisores();
  renderFeaturedTelevisores();
  initTelevisoresFilters();
});

// ==========================
// OBTENER SOLO TELEVISORES
// ==========================
function getTelevisoresProducts() {
  return getProductsByCategory("televisores").filter(product => product.stock > 0);
}

// ==========================
// CREAR TAGS DE FILTRO
// ==========================
function getTelevisorTags(product) {
  const text = `${product.name} ${product.description || ""}`.toLowerCase();
  const tags = [];

  if (text.includes("hisense")) tags.push("hisense");
  if (text.includes("samsung")) tags.push("samsung");
  if (text.includes("lg")) tags.push("lg");
  if (text.includes("4k")) tags.push("4k");
  if (text.includes("smart")) tags.push("smarttv");

  return tags;
}

// ==========================
// RENDER DE TELEVISORES
// ==========================
function renderTelevisores(filter = "todos") {
  const container = document.getElementById("televisoresGrid");
  if (!container) return;

  const televisores = getTelevisoresProducts();

  if (!televisores.length) {
    container.innerHTML = `
      <p style="grid-column: 1 / -1; text-align:center;">
        No hay televisores disponibles en el inventario en este momento.
      </p>
    `;
    return;
  }

  let filteredProducts = televisores;

  if (filter !== "todos") {
    filteredProducts = televisores.filter(product => {
      const tags = getTelevisorTags(product);
      return tags.includes(filter);
    });
  }

  if (!filteredProducts.length) {
    container.innerHTML = `
      <p style="grid-column: 1 / -1; text-align:center;">
        No se encontraron televisores con ese filtro.
      </p>
    `;
    return;
  }

  container.innerHTML = filteredProducts.map(product => {
    const tags = getTelevisorTags(product);
    const badgeText = tags.includes("4k")
      ? "4K"
      : tags.includes("smarttv")
      ? "Smart TV"
      : "Disponible";

    return `
      <div class="product-card-shop show">
        <div class="product-image-shop">
          ${product.image ? `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.parentElement.textContent='${product.name}'">` : product.name}
        </div>
        <div class="product-content-shop">
          <span class="product-label">${badgeText}</span>
          <h3>${product.name}</h3>
          <p>${product.description || "Televisor disponible en ElectroShop."}</p>
          <div class="product-bottom">
            <strong class="price">${formatCurrency(product.price)}</strong>
            <button class="btn btn-primary" onclick="addTelevisorToCart(${product.id})">Agregar</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ==========================
// RENDER DE DESTACADOS
// ==========================
function renderFeaturedTelevisores() {
  const container = document.getElementById("televisoresFeaturedGrid");
  if (!container) return;

  const featured = getFeaturedProductsByCategory("televisores", 3);

  if (!featured.length) {
    container.innerHTML = `
      <p style="grid-column: 1 / -1; text-align:center;">
        No hay televisores destacados disponibles por ahora.
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
          <p>${product.description || "Televisor destacado del inventario."}</p>
          <span class="price">${formatCurrency(product.price)}</span>
        </div>
      </article>
    `;
  }).join("");
}

// ==========================
// FILTROS DE TELEVISORES
// ==========================
function initTelevisoresFilters() {
  const filterButtons = document.querySelectorAll(".filter-chip");
  if (!filterButtons.length) return;

  filterButtons.forEach(button => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      filterButtons.forEach(btn => btn.classList.remove("active-chip"));
      button.classList.add("active-chip");

      const filterValue = button.getAttribute("data-filter");
      renderTelevisores(filterValue);
    });
  });
}

// ==========================
// AGREGAR AL CARRITO
// ==========================
function addTelevisorToCart(productId) {
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