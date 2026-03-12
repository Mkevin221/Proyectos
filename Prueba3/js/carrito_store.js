document.addEventListener("DOMContentLoaded", () => {
  renderCartPage();
  initCheckoutButton();
});

// ==========================
// RENDER PRINCIPAL DEL CARRITO
// ==========================
function renderCartPage() {
  const itemsContainer = document.getElementById("cartItemsList");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkoutBtn");

  if (!itemsContainer || !subtotalEl || !totalEl || !checkoutBtn) return;

  const cartItems = getCartDetailed();

  if (!cartItems.length) {
    itemsContainer.innerHTML = `
      <div class="cart-item modern" style="grid-template-columns: 1fr;">
        <div class="item-details">
          <h3>Tu carrito está vacío</h3>
          <p>Agrega productos desde el catálogo para continuar con tu compra.</p>
          <div style="margin-top: 14px;">
            <a href="productos.html" class="btn btn-primary">Ir a productos</a>
          </div>
        </div>
      </div>
    `;

    subtotalEl.textContent = formatCurrency(0);
    totalEl.textContent = formatCurrency(0);
    checkoutBtn.disabled = true;
    checkoutBtn.style.opacity = "0.6";
    checkoutBtn.style.cursor = "not-allowed";
    return;
  }

  checkoutBtn.disabled = false;
  checkoutBtn.style.opacity = "1";
  checkoutBtn.style.cursor = "pointer";

  let subtotal = 0;

  itemsContainer.innerHTML = cartItems.map(item => {
    const product = item.product;
    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    return `
      <div class="cart-item modern">
        <div class="item-product">
          <img src="${product.image || 'img/productos/default.jpg'}"
               alt="${product.name}"
               onerror="this.src='img/productos/default.jpg'">
          <div class="item-details">
            <h3>${product.name}</h3>
            <p>${product.description || product.category || "Producto ElectroShop"}</p>
            <small style="color:#64748b;">Stock disponible: ${product.stock}</small>
          </div>
        </div>

        <div class="item-price">
          <span>${formatCurrency(product.price)}</span>
        </div>

        <div class="item-qty">
          <button class="qty-btn" onclick="changeCartQty(${product.id}, -1)">−</button>
          <input type="number" value="${item.quantity}" min="1" readonly>
          <button class="qty-btn" onclick="changeCartQty(${product.id}, 1)">+</button>
        </div>

        <div class="item-total">
          <span class="total-product">${formatCurrency(itemTotal)}</span>
        </div>

        <div class="item-remove">
          <button onclick="removeCartItem(${product.id})">🗑️</button>
        </div>
      </div>
    `;
  }).join("");

  subtotalEl.textContent = formatCurrency(subtotal);
  totalEl.textContent = formatCurrency(subtotal);
}

// ==========================
// CAMBIAR CANTIDAD
// ==========================
function changeCartQty(productId, diff) {
  const cart = getCart();
  const item = cart.find(i => i.productId === Number(productId));
  const product = getProductById(productId);

  if (!item || !product) return;

  const newQty = item.quantity + diff;

  if (newQty < 1) {
    removeCartItem(productId);
    return;
  }

  if (newQty > product.stock) {
    if (typeof showMessage === "function") {
      showMessage("No hay suficiente stock disponible.", "error");
    } else {
      alert("No hay suficiente stock disponible.");
    }
    return;
  }

  updateCartItem(productId, newQty);
  renderCartPage();
}

// ==========================
// ELIMINAR ITEM
// ==========================
function removeCartItem(productId) {
  removeFromCart(productId);
  renderCartPage();

  if (typeof showMessage === "function") {
    showMessage("Producto eliminado del carrito.", "success");
  }
}

// ==========================
// BOTÓN DE CHECKOUT
// ==========================
function initCheckoutButton() {
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", () => {
    const result = checkoutCart();

    if (typeof showMessage === "function") {
      showMessage(result.message, result.success ? "success" : "error");
    } else {
      alert(result.message);
    }

    if (result.success) {
      renderCartPage();

      setTimeout(() => {
        window.location.href = "pedidos.html";
      }, 900);
    }
  });
}