document.addEventListener("DOMContentLoaded", () => {
  renderNeveras();
  renderFeaturedNeveras();
  initNeverasFilters();
});

// ==========================
// OBTENER SOLO NEVERAS
// ==========================
function getNeverasProducts() {
  return getProductsByCategory("neveras").filter(product => product.stock > 0);
}

// ==========================
// CREAR TAGS DE FILTRO
// ==========================
function getNeveraTags(product) {
  const text = `${product.name} ${product.description || ""}`.toLowerCase();
  const tags = [];

  if (text.includes("no frost")) tags.push("no-frost");
  if (text.includes("dos puertas")) tags.push("dos-puertas");
  if (text.includes("compacta") || text.includes("compacto")) tags.push("compactas");
  if (text.includes("familiar") || text.includes("familia")) tags.push("familiares");

  return tags;
}

// ==========================
// RENDER DE NEVERAS
// ==========================
function renderNeveras(filter = "todos") {
  const container = document.getElementById("neverasGrid");
  if (!container) return;

  const neveras = getNeverasProducts();

  if (!neveras.length) {
    container.innerHTML = `
      <p style="grid-column: 1 / -1; text-align:center;">
        No hay neveras disponibles en el inventario en este momento.
      </p>
    `;
    return;
  }

  let filteredProducts = neveras;

  if (filter !== "todos") {
    filteredProducts = neveras.filter(product => {
      const tags = getNeveraTags(product);
      return tags.includes(filter);
    });
  }

  if (!filteredProducts.length) {
    container.innerHTML = `
      <p style="grid-column: 1 / -1; text-align:center;">
        No se encontraron neveras con ese filtro.
      </p>
    `;
    return;
  }

  container.innerHTML = filteredProducts.map(product => {
    const tags = getNeveraTags(product);

    let badgeText = "Disponible";
    if (tags.includes("no-frost")) badgeText = "No Frost";
    else if (tags.includes("dos-puertas")) badgeText = "Dos puertas";
    else if (tags.includes("compactas")) badgeText = "Compacta";
    else if (tags.includes("familiares")) badgeText = "Familiar";

    return `
      <article class="product-card-shop show">
        <div class="product-image-shop">
          ${product.image ? `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.parentElement.textContent='${product.name}'">` : product.name}
        </div>
        <div class="product-content-shop">
          <span class="product-label">${badgeText}</span>
          <h3>${product.name}</h3>
          <p>${product.description || "Nevera disponible en ElectroShop."}</p>
          <div class="product-bottom">
            <strong class="price">${formatCurrency(product.price)}</strong>
            <button class="btn btn-primary" onclick="addNeveraToCart(${product.id})">Agregar</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

// ==========================
// RENDER DESTACADAS
// ==========================
function renderFeaturedNeveras() {
  const container = document.getElementById("neverasFeaturedGrid");
  if (!container) return;

  const featured = getFeaturedProductsByCategory("neveras", 3);

  if (!featured.length) {
    container.innerHTML = `
      <p style="grid-column: 1 / -1; text-align:center;">
        No hay neveras destacadas disponibles por ahora.
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
          <p>${product.description || "Nevera destacada del inventario."}</p>
          <span class="price">${formatCurrency(product.price)}</span>
        </div>
      </article>
    `;
  }).join("");
}

// ==========================
// FILTROS DE NEVERAS
// ==========================
function initNeverasFilters() {
  const filterButtons = document.querySelectorAll(".filter-chip");
  if (!filterButtons.length) return;

  filterButtons.forEach(button => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      filterButtons.forEach(btn => btn.classList.remove("active-chip"));
      button.classList.add("active-chip");

      const filterValue = button.getAttribute("data-filter");
      renderNeveras(filterValue);
    });
  });
}

// ==========================
// AGREGAR AL CARRITO
// ==========================
function addNeveraToCart(productId) {
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