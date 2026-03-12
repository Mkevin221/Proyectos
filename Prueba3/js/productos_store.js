document.addEventListener("DOMContentLoaded", () => {
  renderCatalogProducts();
  renderCatalogFeaturedProducts();
  updateCatalogTexts();
  setActiveCategoryChip();
});

// ==========================
// OBTENER CATEGORÍA DESDE URL
// ==========================
function getCurrentCategory() {
  const params = new URLSearchParams(window.location.search);
  return params.get("categoria");
}

// ==========================
// RENDER CATÁLOGO
// ==========================
function renderCatalogProducts() {
  const container = document.getElementById("catalogProductsGrid");
  if (!container) return;

  const category = getCurrentCategory();

  let products = [];
  if (category) {
    products = getProductsByCategory(category).filter(product => product.stock > 0);
  } else {
    products = getActiveProducts().filter(product => product.stock > 0);
  }

  if (!products.length) {
    container.innerHTML = `
      <p style="grid-column: 1 / -1; text-align: center;">
        No hay productos disponibles en esta categoría en este momento.
      </p>
    `;
    return;
  }

  container.innerHTML = products.map(product => {
    return `
      <article class="product-card-shop show">
        <div class="product-image-shop">
          ${product.image ? `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.parentElement.textContent='${product.name}'">` : product.name}
        </div>
        <div class="product-content-shop">
          <span class="product-label">${capitalize(product.category)}</span>
          <h3>${product.name}</h3>
          <p>${product.description || "Producto disponible en ElectroShop."}</p>
          <div class="product-bottom">
            <strong class="price">${formatCurrency(product.price)}</strong>
            <button class="btn btn-primary" onclick="addCatalogProductToCart(${product.id})">Agregar</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

// ==========================
// RENDER DESTACADOS
// ==========================
function renderCatalogFeaturedProducts() {
  const container = document.getElementById("featuredProductsCatalogGrid");
  if (!container) return;

  const category = getCurrentCategory();

  let featuredProducts = [];
  if (category) {
    featuredProducts = getFeaturedProductsByCategory(category, 3);
  } else {
    featuredProducts = getFeaturedProducts(3);
  }

  if (!featuredProducts.length) {
    container.innerHTML = `
      <p style="grid-column: 1 / -1; text-align: center;">
        No hay productos destacados disponibles en este momento.
      </p>
    `;
    return;
  }

  container.innerHTML = featuredProducts.map(product => {
    return `
      <article class="featured-card">
        <div class="featured-image">
          ${product.image ? `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.parentElement.textContent='${product.name}'">` : product.name}
        </div>
        <div class="featured-info">
          <h3>${product.name}</h3>
          <p>${product.description || "Producto destacado del catálogo."}</p>
          <span class="price">${formatCurrency(product.price)}</span>
        </div>
      </article>
    `;
  }).join("");
}

// ==========================
// ACTUALIZAR TEXTOS SEGÚN CATEGORÍA
// ==========================
function updateCatalogTexts() {
  const category = getCurrentCategory();

  const title = document.getElementById("catalogTitle");
  const description = document.getElementById("catalogDescription");
  const productsTitle = document.getElementById("productsSectionTitle");
  const featuredTitle = document.getElementById("featuredSectionTitle");
  const featuredText = document.getElementById("featuredSectionText");

  if (!category) return;

  const categoryName = capitalize(category);

  if (title) title.textContent = `${categoryName} disponibles`;
  if (description) description.textContent = `Explora nuestro inventario actualizado de ${categoryName.toLowerCase()} disponibles para compra.`;
  if (productsTitle) productsTitle.textContent = `${categoryName} en inventario`;
  if (featuredTitle) featuredTitle.textContent = `${categoryName} destacados`;
  if (featuredText) featuredText.textContent = `Aquí se muestran los ${categoryName.toLowerCase()} más vendidos según las compras registradas.`;
}

// ==========================
// ACTIVAR CHIP CORRECTO
// ==========================
function setActiveCategoryChip() {
  const category = getCurrentCategory();
  const chips = document.querySelectorAll(".filter-chip");

  chips.forEach(chip => chip.classList.remove("active-chip"));

  if (!category) {
    const allChip = document.querySelector('.filter-chip[data-category="all"]');
    if (allChip) allChip.classList.add("active-chip");
    return;
  }

  const activeChip = document.querySelector(`.filter-chip[data-category="${category}"]`);
  if (activeChip) {
    activeChip.classList.add("active-chip");
  }
}

// ==========================
// AGREGAR AL CARRITO
// ==========================
function addCatalogProductToCart(productId) {
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

// ==========================
// CAPITALIZAR TEXTO
// ==========================
function capitalize(text) {
  const value = String(text || "");
  return value.charAt(0).toUpperCase() + value.slice(1);
}