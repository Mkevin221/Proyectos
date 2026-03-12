// ==========================
// ESTADO GLOBAL
// ==========================
let users = [];
let products = [];

let editingUserId = null;
let editingProductId = null;
let productImageBase64 = "";

// ==========================
// USUARIOS BASE
// ==========================
const defaultUsers = [
  {
    id: 1,
    nombre: "José Flórez",
    email: "jose@electroshop.com",
    password: "123456",
    telefono: "",
    ciudad: "",
    avatar: "",
    role: "Administrador",
    status: "Activo",
    date: "2026-03-01"
  },
  {
    id: 2,
    nombre: "Laura Gómez",
    email: "laura@gmail.com",
    password: "123456",
    telefono: "",
    ciudad: "",
    avatar: "",
    role: "Cliente",
    status: "Activo",
    date: "2026-03-05"
  },
  {
    id: 3,
    nombre: "Carlos Ruiz",
    email: "carlos@electroshop.com",
    password: "123456",
    telefono: "",
    ciudad: "",
    avatar: "",
    role: "Vendedor",
    status: "Inactivo",
    date: "2026-03-08"
  }
];

// ==========================
// STORAGE USUARIOS
// ==========================
function initUsersStorage() {
  const existingUsers = JSON.parse(localStorage.getItem("users")) || [];
  if (!existingUsers.length) {
    localStorage.setItem("users", JSON.stringify(defaultUsers));
  }
}

function loadData() {
  initUsersStorage();
  users = JSON.parse(localStorage.getItem("users")) || [];
  products = typeof getProducts === "function" ? getProducts() : [];
}

function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}

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

function getRoleClass(role) {
  if (role === "Administrador") return "admin";
  if (role === "Cliente") return "client";
  return "seller";
}

function getStockStatus(stock) {
  if (stock === 0) {
    return { label: "Agotado", className: "stock-out" };
  }

  if (stock <= 5) {
    return { label: "Stock bajo", className: "stock-low" };
  }

  return { label: "Disponible", className: "stock-ok" };
}

function showToast(message) {
  const toast = document.getElementById("customToast");
  const toastMessage = document.getElementById("toastMessage");

  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("show");
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("show");
}

function resetUserForm() {
  const form = document.getElementById("userForm");
  if (!form) return;

  form.reset();
  editingUserId = null;

  const title = document.querySelector("#userModal .modal-header h3");
  if (title) title.textContent = "Registrar nuevo usuario";

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = "Guardar usuario";
}

function resetProductForm() {
  const form = document.getElementById("productForm");
  if (!form) return;

  form.reset();
  editingProductId = null;
  productImageBase64 = "";

  const title = document.querySelector("#productModal .modal-header h3");
  if (title) title.textContent = "Registrar producto en inventario";

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = "Guardar producto";
}

function updateCurrentUserIfNeeded(updatedUser) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return;

  if (
    currentUser.id === updatedUser.id ||
    String(currentUser.email || "").toLowerCase() === String(updatedUser.email || "").toLowerCase()
  ) {
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
  }
}

// ==========================
// RENDER USUARIOS
// ==========================
function renderUsers(filteredUsers = users) {
  const tableBody = document.getElementById("usersTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  if (!filteredUsers.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7">No se encontraron usuarios.</td>
      </tr>
    `;
    return;
  }

  filteredUsers.forEach((user) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>#${user.id}</td>
      <td>${user.nombre || user.name || ""}</td>
      <td>${user.email}</td>
      <td><span class="badge ${getRoleClass(user.role)}">${user.role}</span></td>
      <td><span class="badge ${user.status === "Activo" ? "active" : "inactive"}">${user.status}</span></td>
      <td>${user.date || ""}</td>
      <td>
        <div class="table-actions">
          <button class="action-btn" onclick="editUser(${user.id})" title="Editar">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="action-btn" onclick="deleteUser(${user.id})" title="Eliminar">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

// ==========================
// RENDER PRODUCTOS
// ==========================
function renderProducts(filteredProducts = products) {
  const tableBody = document.getElementById("productsTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  if (!filteredProducts.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8">No se encontraron productos.</td>
      </tr>
    `;
    return;
  }

  filteredProducts.forEach((product) => {
    const stockStatus = getStockStatus(product.stock);

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>#${product.id}</td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${formatCurrency(product.price)}</td>
      <td>${product.stock}</td>
      <td>${product.location || ""}</td>
      <td><span class="badge ${stockStatus.className}">${stockStatus.label}</span></td>
      <td>
        <div class="table-actions">
          <button class="action-btn" onclick="editProduct(${product.id})" title="Editar">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="action-btn" onclick="deleteProduct(${product.id})" title="Eliminar">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

// ==========================
// RESUMEN
// ==========================
function updateSummary() {
  const totalUsers = document.getElementById("totalUsers");
  const totalAdmins = document.getElementById("totalAdmins");
  const totalProducts = document.getElementById("totalProducts");
  const lowStockCount = document.getElementById("lowStockCount");

  if (!totalUsers || !totalAdmins || !totalProducts || !lowStockCount) return;

  totalUsers.textContent = users.length;
  totalAdmins.textContent = users.filter(user => user.role === "Administrador").length;
  totalProducts.textContent = products.length;
  lowStockCount.textContent = products.filter(product => product.stock > 0 && product.stock <= 5).length;
}

// ==========================
// ELIMINAR USUARIO
// ==========================
function deleteUser(id) {
  const confirmDelete = confirm("¿Deseas eliminar este usuario?");
  if (!confirmDelete) return;

  users = users.filter(user => user.id !== id);
  saveUsers();
  renderUsers();
  updateSummary();
  showToast("Usuario eliminado correctamente.");
}

// ==========================
// ELIMINAR PRODUCTO
// ==========================
function deleteProduct(id) {
  const confirmDelete = confirm("¿Deseas eliminar este producto del inventario?");
  if (!confirmDelete) return;

  if (typeof deleteInventoryProduct === "function") {
    deleteInventoryProduct(id);
  } else {
    products = products.filter(product => product.id !== id);
  }

  loadData();
  renderProducts();
  updateSummary();
  showToast("Producto eliminado correctamente.");
}

// ==========================
// EDITAR USUARIO
// ==========================
function editUser(id) {
  const user = users.find(user => user.id === id);
  if (!user) return;

  editingUserId = id;

  const title = document.querySelector("#userModal .modal-header h3");
  if (title) title.textContent = "Editar usuario";

  const submitBtn = document.querySelector('#userForm button[type="submit"]');
  if (submitBtn) submitBtn.textContent = "Actualizar usuario";

  document.getElementById("userFullName").value = user.nombre || user.name || "";
  document.getElementById("userEmail").value = user.email || "";
  document.getElementById("userRole").value = user.role || "";
  document.getElementById("userStatus").value = user.status || "";

  const passwordInput = document.getElementById("userPassword");
  if (passwordInput) {
    passwordInput.value = user.password || "";
  }

  openModal("userModal");
}

// ==========================
// EDITAR PRODUCTO
// ==========================
function editProduct(id) {
  const product = products.find(product => product.id === id);
  if (!product) return;

  editingProductId = id;
  productImageBase64 = product.image || "";

  const title = document.querySelector("#productModal .modal-header h3");
  if (title) title.textContent = "Editar producto";

  const submitBtn = document.querySelector('#productForm button[type="submit"]');
  if (submitBtn) submitBtn.textContent = "Actualizar producto";

  document.getElementById("productName").value = product.name || "";
  document.getElementById("productCategory").value = product.category || "";
  document.getElementById("productPrice").value = product.price || "";
  document.getElementById("productStock").value = product.stock || "";
  document.getElementById("productLocation").value = product.location || "";

  const imageUrlInput = document.getElementById("productImageUrl");
  if (imageUrlInput) {
    imageUrlInput.value = product.image && !product.image.startsWith("data:") ? product.image : "";
  }

  const imageFileInput = document.getElementById("productImageFile");
  if (imageFileInput) {
    imageFileInput.value = "";
  }

  openModal("productModal");
}

// ==========================
// BUSCAR USUARIOS
// ==========================
function initUserSearch() {
  const input = document.getElementById("userSearch");
  if (!input) return;

  input.addEventListener("input", function () {
    const value = input.value.toLowerCase().trim();

    const filtered = users.filter(user =>
      String(user.nombre || user.name || "").toLowerCase().includes(value) ||
      String(user.email || "").toLowerCase().includes(value) ||
      String(user.role || "").toLowerCase().includes(value)
    );

    renderUsers(filtered);
  });
}

// ==========================
// FILTRAR PRODUCTOS
// ==========================
function initProductFilters() {
  const searchInput = document.getElementById("productSearch");
  const stockFilter = document.getElementById("stockFilter");

  if (!searchInput || !stockFilter) return;

  function applyFilters() {
    const searchValue = searchInput.value.toLowerCase().trim();
    const filterValue = stockFilter.value;

    let filtered = products.filter(product =>
      String(product.name || "").toLowerCase().includes(searchValue) ||
      String(product.category || "").toLowerCase().includes(searchValue)
    );

    if (filterValue === "low") {
      filtered = filtered.filter(product => product.stock > 0 && product.stock <= 5);
    } else if (filterValue === "available") {
      filtered = filtered.filter(product => product.stock > 5);
    } else if (filterValue === "out") {
      filtered = filtered.filter(product => product.stock === 0);
    }

    renderProducts(filtered);
  }

  searchInput.addEventListener("input", applyFilters);
  stockFilter.addEventListener("change", applyFilters);
}

// ==========================
// FORMULARIO DE USUARIO
// ==========================
function initUserForm() {
  const form = document.getElementById("userForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nombre = document.getElementById("userFullName").value.trim();
    const email = document.getElementById("userEmail").value.trim().toLowerCase();
    const role = document.getElementById("userRole").value;
    const status = document.getElementById("userStatus").value;
    const passwordInput = document.getElementById("userPassword");
    const password = passwordInput ? passwordInput.value.trim() : "";

    const exists = users.some(user =>
      String(user.email || "").toLowerCase() === email &&
      user.id !== editingUserId
    );

    if (exists) {
      showToast("Ese correo ya está registrado.");
      return;
    }

    if (editingUserId) {
      users = users.map(user => {
        if (user.id === editingUserId) {
          const updatedUser = {
            ...user,
            nombre,
            email,
            role,
            status,
            password: password || user.password || "123456"
          };

          updateCurrentUserIfNeeded(updatedUser);
          return updatedUser;
        }
        return user;
      });

      saveUsers();
      loadData();
      renderUsers();
      updateSummary();
      resetUserForm();
      closeModal("userModal");
      showToast("Usuario actualizado correctamente.");
      return;
    }

    const newUser = {
      id: users.length ? Math.max(...users.map(user => user.id || 0)) + 1 : 1,
      nombre,
      email,
      password: password || "123456",
      telefono: "",
      ciudad: "",
      avatar: "",
      role,
      status,
      date: new Date().toISOString().split("T")[0]
    };

    users.unshift(newUser);
    saveUsers();

    renderUsers();
    updateSummary();
    resetUserForm();
    closeModal("userModal");
    showToast("Usuario registrado correctamente.");
  });
}

// ==========================
// CARGA DE IMAGEN PRODUCTO
// ==========================
function initProductImageInput() {
  const fileInput = document.getElementById("productImageFile");
  if (!fileInput) return;

  fileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      productImageBase64 = event.target.result;
      showToast("Imagen del producto cargada correctamente.");
    };
    reader.readAsDataURL(file);
  });
}

// ==========================
// FORMULARIO DE PRODUCTO
// ==========================
function initProductForm() {
  const form = document.getElementById("productForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("productName").value.trim();
    const category = document.getElementById("productCategory").value.trim().toLowerCase();
    const price = Number(document.getElementById("productPrice").value);
    const stock = Number(document.getElementById("productStock").value);
    const location = document.getElementById("productLocation").value.trim();

    const imageUrlInput = document.getElementById("productImageUrl");
    const imageUrl = imageUrlInput ? imageUrlInput.value.trim() : "";

    const finalImage = productImageBase64 || imageUrl || "img/productos/default.jpg";

    if (editingProductId) {
      if (typeof updateInventoryProduct === "function") {
        updateInventoryProduct(editingProductId, {
          name,
          category,
          price,
          stock,
          location,
          image: finalImage,
          description: `Producto disponible en la categoría ${category}.`
        });
      }

      loadData();
      renderProducts();
      updateSummary();
      resetProductForm();
      closeModal("productModal");
      showToast("Producto actualizado correctamente.");
      return;
    }

    if (typeof addProductToInventory === "function") {
      addProductToInventory({
        name,
        category,
        price,
        stock,
        location,
        description: `Producto disponible en la categoría ${category}.`,
        image: finalImage,
        soldCount: 0
      });
    } else {
      const newProduct = {
        id: products.length ? Math.max(...products.map(product => product.id || 0)) + 1 : 1,
        name,
        category,
        price,
        stock,
        location,
        image: finalImage
      };
      products.unshift(newProduct);
    }

    loadData();
    renderProducts();
    updateSummary();
    resetProductForm();
    closeModal("productModal");
    showToast("Producto agregado al inventario correctamente.");
  });
}

// ==========================
// MODALES
// ==========================
function initModals() {
  const openUserModal = document.getElementById("openUserModal");
  const openProductModal = document.getElementById("openProductModal");
  const closeButtons = document.querySelectorAll("[data-close]");

  if (openUserModal) {
    openUserModal.addEventListener("click", () => {
      resetUserForm();
      openModal("userModal");
    });
  }

  if (openProductModal) {
    openProductModal.addEventListener("click", () => {
      resetProductForm();
      openModal("productModal");
    });
  }

  closeButtons.forEach(button => {
    button.addEventListener("click", function () {
      const modalId = this.getAttribute("data-close");
      if (modalId === "userModal") resetUserForm();
      if (modalId === "productModal") resetProductForm();
      closeModal(modalId);
    });
  });

  window.addEventListener("click", function (e) {
    const userModal = document.getElementById("userModal");
    const productModal = document.getElementById("productModal");

    if (e.target === userModal) {
      resetUserForm();
      closeModal("userModal");
    }

    if (e.target === productModal) {
      resetProductForm();
      closeModal("productModal");
    }
  });
}

// ==========================
// BOTONES RÁPIDOS
// ==========================
function initQuickActions() {
  const exportUsersBtn = document.getElementById("exportUsersBtn");
  const reviewStockBtn = document.getElementById("reviewStockBtn");
  const checkAlertsBtn = document.getElementById("checkAlertsBtn");
  const closeToast = document.getElementById("closeToast");

  if (exportUsersBtn) {
    exportUsersBtn.addEventListener("click", function () {
      showToast(`Se encontraron ${users.length} usuarios listos para exportar.`);
    });
  }

  if (reviewStockBtn) {
    reviewStockBtn.addEventListener("click", function () {
      const lowStock = products.filter(product => product.stock > 0 && product.stock <= 5).length;
      showToast(`Hay ${lowStock} productos con stock bajo.`);
    });
  }

  if (checkAlertsBtn) {
    checkAlertsBtn.addEventListener("click", function () {
      const outStock = products.filter(product => product.stock === 0).length;
      showToast(`Hay ${outStock} productos agotados.`);
    });
  }

  if (closeToast) {
    closeToast.addEventListener("click", function () {
      document.getElementById("customToast").classList.remove("show");
    });
  }
}

// ==========================
// INICIALIZAR TODO
// ==========================
document.addEventListener("DOMContentLoaded", function () {
  loadData();
  renderUsers();
  renderProducts();
  updateSummary();
  initUserSearch();
  initProductFilters();
  initUserForm();
  initProductForm();
  initProductImageInput();
  initModals();
  initQuickActions();
});