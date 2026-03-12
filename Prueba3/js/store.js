// ==========================
// CLAVES DE LOCALSTORAGE
// ==========================
const PRODUCTS_KEY = "electroshop_products";
const CART_KEY = "electroshop_cart";
const ORDERS_KEY = "orders";

// ==========================
// PRODUCTOS INICIALES
// SOLO SE CARGAN SI NO EXISTEN
// ==========================
const defaultProducts = [
  {
    id: 1,
    name: "Laptop Lenovo IdeaPad",
    category: "computadores",
    price: 2850000,
    stock: 12,
    location: "Bodega A - Estante 1",
    description: "Portátil ideal para trabajo, estudio y productividad.",
    image: "img/productos/laptop-lenovo.jpg",
    soldCount: 15,
    isActive: true
  },
  {
    id: 2,
    name: "Mouse Inalámbrico Logitech",
    category: "accesorios",
    price: 95000,
    stock: 4,
    location: "Bodega B - Gaveta 2",
    description: "Mouse inalámbrico cómodo y preciso.",
    image: "img/productos/mouse-logitech.jpg",
    soldCount: 28,
    isActive: true
  },
  {
    id: 3,
    name: "Teclado Mecánico Redragon",
    category: "perifericos",
    price: 220000,
    stock: 8,
    location: "Bodega B - Estante 4",
    description: "Teclado mecánico con excelente respuesta y durabilidad.",
    image: "img/productos/teclado-redragon.jpg",
    soldCount: 19,
    isActive: true
  },
  {
    id: 4,
    name: "Monitor Samsung 24 pulgadas",
    category: "monitores",
    price: 780000,
    stock: 6,
    location: "Bodega C - Zona 1",
    description: "Monitor de alta definición para oficina y gaming casual.",
    image: "img/productos/monitor-samsung.jpg",
    soldCount: 9,
    isActive: true
  }
];

// ==========================
// HELPERS
// ==========================
function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(value);
}

function normalizeText(text) {
  return String(text || "").trim().toLowerCase();
}

// ==========================
// INICIALIZAR PRODUCTOS
// ==========================
function initStore() {
  const existingProducts = localStorage.getItem(PRODUCTS_KEY);
  if (!existingProducts) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
  }

  const existingCart = localStorage.getItem(CART_KEY);
  if (!existingCart) {
    localStorage.setItem(CART_KEY, JSON.stringify([]));
  }

  const existingOrders = localStorage.getItem(ORDERS_KEY);
  if (!existingOrders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
  }
}

// ==========================
// PRODUCTOS
// ==========================
function getProducts() {
  initStore();
  return JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
}

function saveProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function getActiveProducts() {
  return getProducts().filter(product => product.isActive !== false);
}

function getProductById(productId) {
  return getProducts().find(product => product.id === Number(productId));
}

function getProductsByCategory(category) {
  const normalizedCategory = normalizeText(category);
  return getActiveProducts().filter(
    product => normalizeText(product.category) === normalizedCategory
  );
}

function getFeaturedProducts(limit = 4) {
  return getActiveProducts()
    .filter(product => product.stock > 0)
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, limit);
}

function getFeaturedProductsByCategory(category, limit = 4) {
  return getProductsByCategory(category)
    .filter(product => product.stock > 0)
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, limit);
}

function addProductToInventory(productData) {
  const products = getProducts();

  const newProduct = {
    id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
    name: productData.name || "Producto sin nombre",
    category: normalizeText(productData.category || "general"),
    price: Number(productData.price || 0),
    stock: Number(productData.stock || 0),
    location: productData.location || "",
    description: productData.description || "Producto disponible en ElectroShop.",
    image: productData.image || "img/productos/default.jpg",
    soldCount: Number(productData.soldCount || 0),
    isActive: true
  };

  products.unshift(newProduct);
  saveProducts(products);
  return newProduct;
}

function updateInventoryProduct(productId, updatedData) {
  const products = getProducts();

  const updatedProducts = products.map(product => {
    if (product.id === Number(productId)) {
      return {
        ...product,
        ...updatedData,
        category: updatedData.category !== undefined ? normalizeText(updatedData.category) : product.category,
        price: updatedData.price !== undefined ? Number(updatedData.price) : product.price,
        stock: updatedData.stock !== undefined ? Number(updatedData.stock) : product.stock,
        soldCount: updatedData.soldCount !== undefined ? Number(updatedData.soldCount) : product.soldCount
      };
    }
    return product;
  });

  saveProducts(updatedProducts);
}

function deleteInventoryProduct(productId) {
  const products = getProducts().filter(product => product.id !== Number(productId));
  saveProducts(products);
}

// ==========================
// CARRITO
// ==========================
function getCart() {
  initStore();
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(productId, quantity = 1) {
  const product = getProductById(productId);
  if (!product) {
    return { success: false, message: "Producto no encontrado." };
  }

  if (product.stock <= 0) {
    return { success: false, message: "Este producto está agotado." };
  }

  const cart = getCart();
  const existingItem = cart.find(item => item.productId === Number(productId));
  const currentQuantity = existingItem ? existingItem.quantity : 0;
  const newQuantity = currentQuantity + Number(quantity);

  if (newQuantity > product.stock) {
    return { success: false, message: "No hay suficiente stock disponible." };
  }

  if (existingItem) {
    existingItem.quantity = newQuantity;
  } else {
    cart.push({
      productId: Number(productId),
      quantity: Number(quantity)
    });
  }

  saveCart(cart);
  return { success: true, message: "Producto agregado al carrito." };
}

function removeFromCart(productId) {
  const cart = getCart().filter(item => item.productId !== Number(productId));
  saveCart(cart);
}

function updateCartItem(productId, quantity) {
  const product = getProductById(productId);
  if (!product) return;

  const cart = getCart();
  const item = cart.find(item => item.productId === Number(productId));
  if (!item) return;

  const safeQuantity = Number(quantity);

  if (safeQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  if (safeQuantity > product.stock) {
    return;
  }

  item.quantity = safeQuantity;
  saveCart(cart);
}

function clearCart() {
  localStorage.setItem(CART_KEY, JSON.stringify([]));
}

function getCartDetailed() {
  const cart = getCart();
  const products = getProducts();

  return cart.map(item => {
    const product = products.find(product => product.id === item.productId);
    if (!product) return null;

    return {
      productId: item.productId,
      quantity: item.quantity,
      product
    };
  }).filter(Boolean);
}

function getCartTotal() {
  return getCartDetailed().reduce((acc, item) => {
    return acc + (item.product.price * item.quantity);
  }, 0);
}

// ==========================
// PEDIDOS / COMPRA
// ==========================
function getOrders() {
  initStore();
  return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function checkoutCart() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    return { success: false, message: "Debes iniciar sesión para comprar." };
  }

  const cart = getCart();
  const products = getProducts();
  const orders = getOrders();

  if (!cart.length) {
    return { success: false, message: "El carrito está vacío." };
  }

  for (const item of cart) {
    const product = products.find(product => product.id === item.productId);
    if (!product) {
      return { success: false, message: "Uno de los productos ya no existe." };
    }

    if (item.quantity > product.stock) {
      return {
        success: false,
        message: `No hay stock suficiente para ${product.name}.`
      };
    }
  }

  const total = cart.reduce((sum, item) => {
    const product = products.find(product => product.id === item.productId);
    return sum + (product.price * item.quantity);
  }, 0);

  const orderId = orders.length ? Math.max(...orders.map(order => order.id)) + 1 : 1;

  const orderProducts = cart.map(item => {
    const product = products.find(product => product.id === item.productId);
    return {
      productId: product.id,
      product: product.name,
      category: product.category,
      quantity: item.quantity,
      unitPrice: product.price,
      subtotal: product.price * item.quantity
    };
  });

  cart.forEach(item => {
    const product = products.find(product => product.id === item.productId);
    product.stock -= item.quantity;
    product.soldCount += item.quantity;
  });

  const mainProductName = orderProducts.map(item => item.product).join(", ");

  const newOrder = {
    id: orderId,
    userId: currentUser.id || currentUser.email,
    userEmail: currentUser.email,
    userName: currentUser.nombre || "Usuario",
    product: mainProductName,
    items: orderProducts,
    date: new Date().toLocaleDateString("es-CO"),
    total: total,
    paymentMethod: "Pago contra entrega",
    deliveryStatus: "Pendiente",
    status: "processing"
  };

  orders.unshift(newOrder);

  saveProducts(products);
  saveOrders(orders);
  clearCart();

  return { success: true, message: "Compra realizada correctamente." };
}