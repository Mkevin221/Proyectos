document.addEventListener("DOMContentLoaded", () => {
  renderIndexFeaturedProducts();
  renderHeroFeaturedProduct();
  updateHeroStats();
});

// ==========================
// RENDER PRODUCTOS DESTACADOS
// ==========================
function renderIndexFeaturedProducts() {
  const container = document.getElementById("featuredProductsGrid");
  if (!container) return;

  const featuredProducts = getFeaturedProducts(4);

  if (!featuredProducts.length) {
    container.innerHTML = `
      <p style="grid-column: 1 / -1; text-align:center;">
        No hay productos destacados disponibles en este momento.
      </p>
    `;
    return;
  }

  container.innerHTML = featuredProducts.map(product => {
    return `
      <article class="product-card">
        <div class="product-image">
          ${product.image ? `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.parentElement.textContent='${product.name}'">` : product.name}
        </div>
        <div class="product-info">
          <div class="product-top">
            <h3>${product.name}</h3>
            <span class="product-badge">Top ventas</span>
          </div>
          <p>${product.description || "Producto destacado del inventario."}</p>
          <div class="price">${formatCurrency(product.price)}</div>
          <div class="product-actions">
            <button class="btn btn-primary" onclick="buyFeaturedProduct(${product.id})">Comprar</button>
            <a href="productos.html?categoria=${encodeURIComponent(product.category)}" class="btn btn-light">Más info</a>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

// ==========================
// HERO PRODUCTO DESTACADO
// ==========================
function renderHeroFeaturedProduct() {
  const heroBox = document.getElementById("heroFeaturedProduct");
  if (!heroBox) return;

  const featured = getFeaturedProducts(1);

  if (!featured.length) return;

  const product = featured[0];

  heroBox.innerHTML = `
    <h3>${product.name}</h3>
    <p>${product.description || "Producto destacado disponible en inventario."}</p>
    <div class="price">${formatCurrency(product.price)}</div>
  `;
}

// ==========================
// ACTUALIZAR CONTADORES DEL HERO
// ==========================
function updateHeroStats() {
  const productsCountEl = document.getElementById("heroProductsCount");
  const categoriesCountEl = document.getElementById("heroCategoriesCount");

  const products = getActiveProducts();
  const categories = [...new Set(products.map(product => String(product.category).toLowerCase()))];

  if (productsCountEl) {
    productsCountEl.textContent = `+${products.length}`;
  }

  if (categoriesCountEl) {
    categoriesCountEl.textContent = `${categories.length}+`;
  }
}

// ==========================
// COMPRAR PRODUCTO DESTACADO
// ==========================
function buyFeaturedProduct(productId) {
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