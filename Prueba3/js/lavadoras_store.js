document.addEventListener("DOMContentLoaded", () => {
  renderLavadoras();
  renderFeaturedLavadoras();
  initLavadorasFilters();
});

// ==========================
// OBTENER SOLO LAVADORAS
// ==========================
function getLavadorasProducts() {
  return getProductsByCategory("lavadoras").filter(product => product.stock > 0);
}

// ==========================
// CREAR TAGS DE FILTRO
// ==========================
function getLavadoraTags(product) {
  const text = `${product.name} ${product.description || ""}`.toLowerCase();
  const tags = [];

  if (text.includes("carga superior")) tags.push("carga-superior");
  if (text.includes("carga frontal")) tags.push("carga-frontal");
  if (text.includes("automática") || text.includes("automatica")) tags.push("automaticas");
  if (text.includes("semi automática") || text.includes("semi automatica")) tags.push("semi-automaticas");
  if (
    text.includes("gran capacidad") ||
    text.includes("20 kg") ||
    text.includes("18 kg") ||
    text.includes("17 kg") ||
    text.includes("19 kg")
  ) {
    tags.push("gran-capacidad");
  }

  return tags;
}

// ==========================
// RENDER DE LAVADORAS
// ==========================
function renderLavadoras(filter = "todos") {
  const container = document.getElementById("lavadorasGrid");
  if (!container) return;

  const lavadoras = getLavadorasProducts();

  if (!lavadoras.length) {
    container.innerHTML = `
      <p style="grid-column: 1 / -1; text-align:center;">
        No hay lavadoras disponibles en el inventario en este momento.
      </p>
    `;
    return;
  }

  let filteredProducts = lavadoras;

  if (filter !== "todos") {
    filteredProducts = lavadoras.filter(product => {
      const tags = getLavadoraTags(product);
      return tags.includes(filter);
    });
  }

  if (!filteredProducts.length) {
    container.innerHTML = `
      <p style="grid-column: 1 / -1; text-align:center;">
        No se encontraron lavadoras con ese filtro.
      </p>
    `;
    return;
  }

  container.innerHTML = filteredProducts.map(product => {
    const tags = getLavadoraTags(product);

    let badgeText = "Disponible";
    if (tags.includes("carga-superior")) badgeText = "Carga superior";
    else if (tags.includes("carga-frontal")) badgeText = "Carga frontal";
    else if (tags.includes("automaticas")) badgeText = "Automática";
    else if (tags.includes("semi-automaticas")) badgeText = "Semi automática";
    else if (tags.includes("gran-capacidad")) badgeText = "Gran capacidad";

    return `
      <article class="product-card-shop show">
        <div class="product-image-shop">
          ${product.image ? `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.parentElement.textContent='${product.name}'">` : product.name}
        </div>
        <div class="product-content-shop">
          <span class="product-label">${badgeText}</span>
          <h3>${product.name}</h3>
          <p>${product.description || "Lavadora disponible en ElectroShop."}</p>
          <div class="product-bottom">
            <strong class="price">${formatCurrency(product.price)}</strong>
            <button class="btn btn-primary" onclick="addLavadoraToCart(${product.id})">Agregar</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

// ==========================
// RENDER DESTACADAS
// ==========================
function renderFeaturedLavadoras() {
  const container = document.getElementById("lavadorasFeaturedGrid");
  if (!container) return;

  const featured = getFeaturedProductsByCategory("lavadoras", 3);

  if (!featured.length) {
    container.innerHTML = `
      <p style="grid-column: 1 / -1; text-align:center;">
        No hay lavadoras destacadas disponibles por ahora.
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
          <p>${product.description || "Lavadora destacada del inventario."}</p>
          <span class="price">${formatCurrency(product.price)}</span>
        </div>
      </article>
    `;
  }).join("");
}

// ==========================
// FILTROS DE LAVADORAS
// ==========================
function initLavadorasFilters() {
  const filterButtons = document.querySelectorAll(".filter-chip");
  if (!filterButtons.length) return;

  filterButtons.forEach(button => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      filterButtons.forEach(btn => btn.classList.remove("active-chip"));
      button.classList.add("active-chip");

      const filterValue = button.getAttribute("data-filter");
      renderLavadoras(filterValue);
    });
  });
}

// ==========================
// AGREGAR AL CARRITO
// ==========================
function addLavadoraToCart(productId) {
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