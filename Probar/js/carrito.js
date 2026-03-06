function money(n){
  return "$" + Number(n || 0).toLocaleString("es-CO");
}

function calcTotals(cart){
  const subtotal = cart.reduce((acc, it) => acc + (it.price * it.qty), 0);
  const shipping = subtotal > 0 ? 12000 : 0; // ejemplo
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}

function renderCart(){
  const list = document.getElementById("cartList");
  const cart = getCart();

  if(!list) return;

  if(cart.length === 0){
    list.innerHTML = `
      <div class="cart-empty">
        <strong>Tu carrito está vacío.</strong>
        <div style="margin-top:8px">Vuelve al catálogo y agrega productos 🛒</div>
      </div>
    `;
  }else{
    list.innerHTML = cart.map(item => {
      const img = item.img
        ? `<img src="${item.img}" alt="${item.title}">`
        : `<div style="font-size:38px; opacity:.6;">🧺</div>`;

      return `
        <article class="cart-item" data-id="${item.id}">
          <div class="cart-thumb">${img}</div>

          <div class="cart-info">
            <div class="cart-top">
              <div>
                <h4 class="cart-title">${item.title}</h4>
                <div class="cart-desc">${item.desc || ""}</div>
              </div>
              <div class="cart-price">${money(item.price)}</div>
            </div>

            <div class="cart-actions">
              <div class="cart-qty">
                <button class="qty-minus" type="button">−</button>
                <input class="qty-input" type="number" min="1" value="${item.qty}">
                <button class="qty-plus" type="button">+</button>
              </div>

              <button class="cart-remove" type="button">🗑 Quitar</button>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  const {subtotal, shipping, total} = calcTotals(cart);
  document.getElementById("sumSubtotal").textContent = money(subtotal);
  document.getElementById("sumShipping").textContent = money(shipping);
  document.getElementById("sumTotal").textContent = money(total);

  updateCartBadge();
}

// Eventos
document.addEventListener("DOMContentLoaded", () => {
  renderCart();

  document.getElementById("clearCartBtn")?.addEventListener("click", () => {
    setCart([]);
    renderCart();
  });

  document.getElementById("checkoutBtn")?.addEventListener("click", () => {
    const cart = getCart();
    if(cart.length === 0){
      alert("Tu carrito está vacío.");
      return;
    }
    alert("Aquí iría tu flujo de pago ✅");
  });

  document.addEventListener("click", (e) => {
    const card = e.target.closest(".cart-item");
    if(!card) return;

    const id = card.dataset.id;
    let cart = getCart();
    const idx = cart.findIndex(x => String(x.id) === String(id));
    if(idx < 0) return;

    if(e.target.closest(".cart-remove")){
      cart.splice(idx, 1);
      setCart(cart);
      renderCart();
      return;
    }

    if(e.target.closest(".qty-minus")){
      cart[idx].qty = Math.max(1, (cart[idx].qty || 1) - 1);
      setCart(cart);
      renderCart();
      return;
    }

    if(e.target.closest(".qty-plus")){
      cart[idx].qty = (cart[idx].qty || 1) + 1;
      setCart(cart);
      renderCart();
      return;
    }
  });

  document.addEventListener("input", (e) => {
    const input = e.target.closest(".qty-input");
    if(!input) return;
    const card = e.target.closest(".cart-item");
    if(!card) return;

    const id = card.dataset.id;
    let cart = getCart();
    const idx = cart.findIndex(x => String(x.id) === String(id));
    if(idx < 0) return;

    const v = Math.max(1, Number(input.value || 1));
    cart[idx].qty = v;
    setCart(cart);
    // No re-render completo por cada tecla, solo totales + badge:
    const {subtotal, shipping, total} = calcTotals(cart);
    document.getElementById("sumSubtotal").textContent = money(subtotal);
    document.getElementById("sumShipping").textContent = money(shipping);
    document.getElementById("sumTotal").textContent = money(total);
    updateCartBadge();
  });
});