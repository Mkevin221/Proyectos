// ====== CART CORE (localStorage + badge + fly) ======
const CART_KEY = "nova_cart_v1";

function getCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function setCart(items){
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartBadge();
}
function cartCount(){
  return getCart().reduce((acc, it) => acc + (it.qty || 1), 0);
}

function updateCartBadge(){
  const badge = document.getElementById("cartBadge");
  const btn = document.getElementById("cartBtn");
  if(!badge) return;

  const count = cartCount();
  if(count <= 0){
    badge.classList.remove("show","dot");
    badge.textContent = "";
    return;
  }

  badge.classList.add("show");

  if(btn){
    btn.classList.add("pop");
    setTimeout(()=>btn.classList.remove("pop"), 350);
  }

  // puntico si 1, número si >1
  if(count === 1){
    badge.classList.add("dot");
    badge.textContent = "";
  }else{
    badge.classList.remove("dot");
    badge.textContent = count > 99 ? "99+" : String(count);
  }
}

function addToCart(product){
  // product: {id, title, price, img, desc}
  const cart = getCart();
  const idx = cart.findIndex(x => String(x.id) === String(product.id));
  if(idx >= 0){
    cart[idx].qty = (cart[idx].qty || 1) + 1;
  }else{
    cart.push({ ...product, qty: 1 });
  }
  setCart(cart);
}

// Animación: clona imagen/card y la “vuela” al carrito
function flyToCart(fromEl){
  const cartBtn = document.getElementById("cartBtn");
  if(!fromEl || !cartBtn) return;

  const r1 = fromEl.getBoundingClientRect();
  const r2 = cartBtn.getBoundingClientRect();

  const flyer = fromEl.cloneNode(true);
  flyer.classList.add("fly-img");
  flyer.style.width = r1.width + "px";
  flyer.style.height = r1.height + "px";
  flyer.style.left = r1.left + "px";
  flyer.style.top = r1.top + "px";
  flyer.style.transform = "translate(0,0) scale(1)";
  document.body.appendChild(flyer);

  const dx = (r2.left + r2.width/2) - (r1.left + r1.width/2);
  const dy = (r2.top + r2.height/2) - (r1.top + r1.height/2);

  requestAnimationFrame(() => {
    flyer.style.transform = `translate(${dx}px, ${dy}px) scale(0.2)`;
    flyer.style.opacity = "0.2";
  });

  setTimeout(() => flyer.remove(), 700);
}

// Llamar una vez al cargar cualquier página
document.addEventListener("DOMContentLoaded", updateCartBadge);