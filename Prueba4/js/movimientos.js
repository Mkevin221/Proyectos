const STORAGE_KEY = 'agendaGastosHTML_pro_v1';

const DEFAULT_TEMPLATES = {
  comida: {
    icon: '🍔',
    type: 'gasto',
    suggestedName: 'Comida',
    accountSuggestion: 'Billetera',
    description: 'Restaurante, mercado o snacks',
    monthlyBudget: 0
  },
  transporte: {
    icon: '🚕',
    type: 'gasto',
    suggestedName: 'Transporte',
    accountSuggestion: 'Billetera',
    description: 'Taxi, gasolina, metro o peajes',
    monthlyBudget: 0
  },
  hogar: {
    icon: '🏠',
    type: 'gasto',
    suggestedName: 'Hogar',
    accountSuggestion: 'Cuenta principal',
    description: 'Arriendo, servicios o compras del hogar',
    monthlyBudget: 0
  },
  salud: {
    icon: '💊',
    type: 'gasto',
    suggestedName: 'Salud',
    accountSuggestion: 'Cuenta principal',
    description: 'Consultas, medicinas o exámenes',
    monthlyBudget: 0
  },
  ocio: {
    icon: '🎮',
    type: 'gasto',
    suggestedName: 'Ocio',
    accountSuggestion: 'Tarjeta',
    description: 'Cine, salidas, streaming o gustos',
    monthlyBudget: 0
  },
  estudio: {
    icon: '📘',
    type: 'gasto',
    suggestedName: 'Estudio',
    accountSuggestion: 'Cuenta principal',
    description: 'Cursos, libros o materiales',
    monthlyBudget: 0
  },
  salario: {
    icon: '💼',
    type: 'ingreso',
    suggestedName: 'Salario',
    accountSuggestion: 'Cuenta principal',
    description: 'Pago fijo o nómina',
    monthlyBudget: 0
  },
  ventas: {
    icon: '🛒',
    type: 'ingreso',
    suggestedName: 'Ventas',
    accountSuggestion: 'Cuenta principal',
    description: 'Ingreso por negocio o ventas',
    monthlyBudget: 0
  },
  ahorro: {
    icon: '🏦',
    type: 'ahorro',
    suggestedName: 'Ahorro',
    accountSuggestion: 'Ahorros',
    description: 'Dinero reservado',
    monthlyBudget: 0
  },
  otros: {
    icon: '✨',
    type: 'gasto',
    suggestedName: 'Otros',
    accountSuggestion: 'Cuenta principal',
    description: 'Movimiento personalizado',
    monthlyBudget: 0
  }
};

const SECTION_TITLES = {
  resumen: 'Tablero financiero',
  cuentas: 'Gestión de cuentas',
  movimientos: 'Registro de movimientos',
  categorias: 'Categorías inteligentes',
  analisis: 'Panel de análisis'
};

const SECTION_DESCRIPTIONS = {
  resumen: 'Revisa tu dinero en tiempo real.',
  cuentas: 'Consulta y administra todas tus cuentas.',
  movimientos: 'Filtra y revisa tus movimientos registrados.',
  categorias: 'Estas son las categorías base que alimentan el auto relleno.',
  analisis: 'Visualiza tus datos con gráficas y tendencias.'
};

const defaultAccounts = () => ([
  {
    id: crypto.randomUUID(),
    name: 'Cuenta principal',
    type: 'Cuenta',
    initialBalance: 0
  },
  {
    id: crypto.randomUUID(),
    name: 'Billetera',
    type: 'Efectivo',
    initialBalance: 0
  },
  {
    id: crypto.randomUUID(),
    name: 'Tarjeta',
    type: 'Tarjeta',
    initialBalance: 0
  },
  {
    id: crypto.randomUUID(),
    name: 'Ahorros',
    type: 'Ahorro',
    initialBalance: 0
  }
]);

let state = loadState();
let pieChart = null;
let barChart = null;
let pieChartOnly = null;
let barChartOnly = null;
let currentSection = 'resumen';

let editingAccountId = null;
let editingMovementId = null;
let editingCategoryKey = null;

const authView = document.getElementById('authView');
const appView = document.getElementById('appView');

const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginWrap = document.getElementById('loginWrap');
const registerWrap = document.getElementById('registerWrap');

const welcomeText = document.getElementById('welcomeText');
const sectionTitle = document.getElementById('sectionTitle');
const sidebarUserName = document.getElementById('sidebarUserName');
const sidebarMenu = document.getElementById('sidebarMenu');

const movementModal = document.getElementById('movementModal');
const accountModal = document.getElementById('accountModal');
const categoryModal = document.getElementById('categoryModal');

const movementForm = document.getElementById('movementForm');
const accountForm = document.getElementById('accountForm');
const categoryForm = document.getElementById('categoryForm');

const movementModalTitle = movementModal?.querySelector('.panel-head h3');
const accountModalTitle = accountModal?.querySelector('.panel-head h3');
const categoryModalTitle = categoryModal?.querySelector('.panel-head h3');

const movementSubmitBtn = movementForm?.querySelector('button[type="submit"]');
const accountSubmitBtn = accountForm?.querySelector('button[type="submit"]');
const categorySubmitBtn = categoryForm?.querySelector('button[type="submit"]');

const movementTypeSelect = document.getElementById('movementType');
const destinationAccountWrap = document.getElementById('destinationAccountWrap');
const movementDestinationAccount = document.getElementById('movementDestinationAccount');

const toast = document.getElementById('toast');

const confirmModal = document.getElementById('confirmModal');
const confirmBackdrop = document.getElementById('confirmBackdrop');
const confirmTitle = document.getElementById('confirmTitle');
const confirmMessage = document.getElementById('confirmMessage');
const confirmCancelBtn = document.getElementById('confirmCancelBtn');
const confirmAcceptBtn = document.getElementById('confirmAcceptBtn');

let confirmResolver = null;

function ensureButtonsAreSafe() {
  [
    'logoutBtn',
    'openAccountModal',
    'openMovementModal',
    'openCategoryModal',
    'openAccountModalSecondary',
    'openMovementModalSecondary',
    'openCategoryModalSecondary',
    'exportCsvBtn'
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.type = 'button';
  });

  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.type = 'button';
  });
}

function showToast(message, isError = false) {
  if (!toast) return;
  toast.textContent = message;
  toast.style.background = isError ? 'rgba(120, 25, 40, 0.95)' : 'rgba(18, 24, 45, 0.95)';
  toast.style.color = '#fff';
  toast.style.position = 'fixed';
  toast.style.right = '20px';
  toast.style.bottom = '20px';
  toast.style.padding = '12px 16px';
  toast.style.borderRadius = '14px';
  toast.style.zIndex = '9999';
  toast.style.boxShadow = '0 16px 40px rgba(0,0,0,.35)';
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  toast.style.transition = 'all .25s ease';

  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 2200);
}

function openConfirmModal({
  title = 'Confirmar acción',
  message = '¿Seguro que deseas continuar?',
  acceptText = 'Aceptar'
} = {}) {
  return new Promise((resolve) => {
    confirmResolver = resolve;

    if (confirmTitle) confirmTitle.textContent = title;
    if (confirmMessage) confirmMessage.textContent = message;
    if (confirmAcceptBtn) confirmAcceptBtn.textContent = acceptText;
    confirmModal?.classList.remove('hidden');
  });
}

function closeConfirmModal(result = false) {
  confirmModal?.classList.add('hidden');

  if (confirmResolver) {
    confirmResolver(result);
    confirmResolver = null;
  }
}

confirmCancelBtn?.addEventListener('click', () => closeConfirmModal(false));
confirmAcceptBtn?.addEventListener('click', () => closeConfirmModal(true));
confirmBackdrop?.addEventListener('click', () => closeConfirmModal(false));

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.users)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error leyendo almacenamiento:', error);
  }

  return {
    users: [],
    currentUserId: null
  };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('Error guardando almacenamiento:', error);
    alert('No se pudo guardar la información en este navegador.');
    return false;
  }
}

function formatMoney(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function getCurrentUser() {
  return state.users.find((u) => u.id === state.currentUserId) || null;
}

function setTab(mode) {
  const isLogin = mode === 'login';
  loginTab?.classList.toggle('active', isLogin);
  registerTab?.classList.toggle('active', !isLogin);
  loginWrap?.classList.toggle('hidden', !isLogin);
  registerWrap?.classList.toggle('hidden', isLogin);
}

function showSection(section) {
  currentSection = section;

  document.querySelectorAll('.menu-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.section === section);
  });

  document.querySelectorAll('.content-section').forEach((panel) => {
    panel.classList.add('hidden');
  });

  const target = document.getElementById(`section-${section}`);
  if (target) target.classList.remove('hidden');

  if (sectionTitle) {
    sectionTitle.textContent = SECTION_TITLES[section] || 'Tablero financiero';
  }

  if (welcomeText) {
    welcomeText.textContent = SECTION_DESCRIPTIONS[section] || 'Revisa tu dinero en tiempo real.';
  }
}

function openModal(modal) {
  modal?.classList.add('show');
}

function closeModal(modal) {
  modal?.classList.remove('show');
}

function resetAccountFormMode() {
  editingAccountId = null;
  if (accountModalTitle) accountModalTitle.textContent = 'Nueva cuenta';
  if (accountSubmitBtn) accountSubmitBtn.textContent = 'Crear cuenta';
  accountForm?.reset();
}

function resetMovementFormMode() {
  editingMovementId = null;
  if (movementModalTitle) movementModalTitle.textContent = 'Nuevo movimiento';
  if (movementSubmitBtn) movementSubmitBtn.textContent = 'Guardar movimiento';
  movementForm?.reset();
  toggleTransferFields(false);
}

function resetCategoryFormMode() {
  editingCategoryKey = null;
  if (categoryModalTitle) categoryModalTitle.textContent = 'Nueva categoría';
  if (categorySubmitBtn) categorySubmitBtn.textContent = 'Guardar categoría';
  categoryForm?.reset();
}

function toggleTransferFields(show) {
  if (!destinationAccountWrap) return;
  destinationAccountWrap.classList.toggle('hidden', !show);
  if (movementDestinationAccount) {
    movementDestinationAccount.required = show;
  }
}

function sanitizeKey(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '_');
}

function openMovementModalHandler() {
  const user = getCurrentUser();
  if (!user) return;

  if (!user.accounts.length) {
    alert('Primero crea una cuenta.');
    return;
  }

  resetMovementFormMode();
  prepareMovementForm();
  openModal(movementModal);
}

function openAccountModalHandler() {
  resetAccountFormMode();
  openModal(accountModal);
}

function openCategoryModalHandler() {
  const user = getCurrentUser();
  if (!user) return;

  resetCategoryFormMode();
  fillCategoryAccountSuggestions(user);
  openModal(categoryModal);
}

loginTab?.addEventListener('click', () => setTab('login'));
registerTab?.addEventListener('click', () => setTab('register'));

sidebarMenu?.addEventListener('click', (e) => {
  const btn = e.target.closest('.menu-btn');
  if (!btn) return;
  showSection(btn.dataset.section);
});

document.getElementById('registerForm')?.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim().toLowerCase();
  const password = document.getElementById('registerPassword').value.trim();

  if (!name || !email || !password) {
    alert('Completa todos los campos del registro.');
    return;
  }

  if (state.users.some((u) => u.email === email)) {
    alert('Ese correo ya existe.');
    return;
  }

  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    password,
    categories: JSON.parse(JSON.stringify(DEFAULT_TEMPLATES)),
    accounts: defaultAccounts(),
    movements: []
  };

  state.users.push(user);
  state.currentUserId = user.id;
  saveState();
  render();
  showToast('Usuario creado correctamente.');
});

document.getElementById('loginForm')?.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value.trim();

  const user = state.users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    alert('Correo o contraseña incorrectos.');
    return;
  }

  state.currentUserId = user.id;
  saveState();
  render();
  showToast(`Bienvenido, ${user.name}.`);
});

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  state.currentUserId = null;
  saveState();
  render();
});

document.getElementById('openMovementModal')?.addEventListener('click', openMovementModalHandler);
document.getElementById('openMovementModalSecondary')?.addEventListener('click', openMovementModalHandler);

document.getElementById('openAccountModal')?.addEventListener('click', openAccountModalHandler);
document.getElementById('openAccountModalSecondary')?.addEventListener('click', openAccountModalHandler);

document.getElementById('openCategoryModal')?.addEventListener('click', openCategoryModalHandler);
document.getElementById('openCategoryModalSecondary')?.addEventListener('click', openCategoryModalHandler);

document.getElementById('exportCsvBtn')?.addEventListener('click', exportMovementsCsv);

document.querySelectorAll('[data-close]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const modal = document.getElementById(btn.dataset.close);
    closeModal(modal);

    if (btn.dataset.close === 'accountModal') resetAccountFormMode();
    if (btn.dataset.close === 'movementModal') resetMovementFormMode();
    if (btn.dataset.close === 'categoryModal') resetCategoryFormMode();
  });
});

window.addEventListener('click', (e) => {
  if (e.target === movementModal) {
    closeModal(movementModal);
    resetMovementFormMode();
  }
  if (e.target === accountModal) {
    closeModal(accountModal);
    resetAccountFormMode();
  }
  if (e.target === categoryModal) {
    closeModal(categoryModal);
    resetCategoryFormMode();
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (confirmModal && !confirmModal.classList.contains('hidden')) {
      closeConfirmModal(false);
      return;
    }

    closeModal(movementModal);
    closeModal(accountModal);
    closeModal(categoryModal);
    resetMovementFormMode();
    resetAccountFormMode();
    resetCategoryFormMode();
  }
});

movementTypeSelect?.addEventListener('change', () => {
  toggleTransferFields(movementTypeSelect.value === 'transferencia');
});

function prepareMovementForm() {
  const user = getCurrentUser();
  if (!user) return;

  const templateSelect = document.getElementById('movementCategoryTemplate');
  const accountSelect = document.getElementById('movementAccount');

  templateSelect.innerHTML = '';
  accountSelect.innerHTML = '';
  if (movementDestinationAccount) movementDestinationAccount.innerHTML = '';

  Object.keys(user.categories).forEach((key) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${user.categories[key].suggestedName} (${key})`;
    templateSelect.appendChild(opt);
  });

  user.accounts.forEach((acc) => {
    const originOpt = document.createElement('option');
    originOpt.value = acc.id;
    originOpt.textContent = `${acc.name} · ${acc.type}`;
    accountSelect.appendChild(originOpt);

    if (movementDestinationAccount) {
      const destOpt = document.createElement('option');
      destOpt.value = acc.id;
      destOpt.textContent = `${acc.name} · ${acc.type}`;
      movementDestinationAccount.appendChild(destOpt);
    }
  });

  document.getElementById('movementDate').value = new Date().toISOString().slice(0, 10);

  if (!editingMovementId) {
    templateSelect.selectedIndex = 0;
    applyTemplate();
  }
}

function applyTemplate() {
  const user = getCurrentUser();
  if (!user || editingMovementId) return;

  const key = document.getElementById('movementCategoryTemplate').value;
  const tpl = user.categories[key];
  if (!tpl) return;

  document.getElementById('movementType').value = tpl.type;
  document.getElementById('movementName').value = tpl.suggestedName;
  document.getElementById('movementCategoryName').value = tpl.suggestedName;
  document.getElementById('movementDescription').value = tpl.description;
  document.getElementById('movementIcon').value = tpl.icon;

  const account = user.accounts.find(
    (a) => a.name.toLowerCase() === String(tpl.accountSuggestion).toLowerCase()
  );

  if (account) {
    document.getElementById('movementAccount').value = account.id;
  }

  toggleTransferFields(tpl.type === 'transferencia');
}

function fillCategoryAccountSuggestions(user) {
  const select = document.getElementById('categoryAccountSuggestion');
  if (!select) return;

  select.innerHTML = '';
  user.accounts.forEach((acc) => {
    const opt = document.createElement('option');
    opt.value = acc.name;
    opt.textContent = `${acc.name} · ${acc.type}`;
    select.appendChild(opt);
  });
}

document.getElementById('movementCategoryTemplate')?.addEventListener('change', applyTemplate);

document.getElementById('movementForm')?.addEventListener('submit', (e) => {
  e.preventDefault();

  const user = getCurrentUser();
  if (!user) return;

  const templateKey = document.getElementById('movementCategoryTemplate').value;
  const amountValue = Number(document.getElementById('movementAmount').value);
  const type = document.getElementById('movementType').value;
  const accountId = document.getElementById('movementAccount').value;
  const destinationAccountId = movementDestinationAccount?.value || '';

  if (!amountValue || amountValue <= 0) {
    alert('El monto debe ser mayor a cero.');
    return;
  }

  if (type === 'transferencia') {
    if (!destinationAccountId) {
      alert('Selecciona una cuenta destino.');
      return;
    }
    if (accountId === destinationAccountId) {
      alert('La cuenta origen y destino no pueden ser la misma.');
      return;
    }
  }

  const payload = {
    templateKey,
    type,
    name: document.getElementById('movementName').value.trim(),
    categoryName: document.getElementById('movementCategoryName').value.trim(),
    amount: amountValue,
    accountId,
    destinationAccountId,
    description: document.getElementById('movementDescription').value.trim(),
    date: document.getElementById('movementDate').value,
    icon: document.getElementById('movementIcon').value.trim() || '✨'
  };

  if (editingMovementId) {
    const movement = user.movements.find((m) => m.id === editingMovementId);
    if (!movement) return;
    Object.assign(movement, payload);
    showToast('Movimiento actualizado.');
  } else {
    user.movements.unshift({
      id: crypto.randomUUID(),
      ...payload
    });
    showToast('Movimiento creado.');
  }

  if (user.categories[templateKey]) {
    user.categories[templateKey] = {
      ...user.categories[templateKey],
      type: payload.type === 'transferencia' ? user.categories[templateKey].type : payload.type,
      suggestedName: payload.categoryName,
      description: payload.description,
      icon: payload.icon,
      accountSuggestion:
        (user.accounts.find((a) => a.id === payload.accountId) || {}).name ||
        user.categories[templateKey].accountSuggestion
    };
  }

  saveState();
  resetMovementFormMode();
  closeModal(movementModal);
  renderDashboard();
});

document.getElementById('accountForm')?.addEventListener('submit', (e) => {
  e.preventDefault();

  const user = getCurrentUser();
  if (!user) return;

  const name = document.getElementById('accountName').value.trim();
  const balance = Number(document.getElementById('accountInitialBalance').value);
  const type = document.getElementById('accountType').value;

  if (!name) {
    alert('Escribe un nombre para la cuenta.');
    return;
  }

  if (editingAccountId) {
    const account = user.accounts.find((a) => a.id === editingAccountId);
    if (!account) return;

    const oldName = account.name;
    account.name = name;
    account.type = type;
    account.initialBalance = Number.isFinite(balance) ? balance : 0;

    Object.values(user.categories).forEach((category) => {
      if (category.accountSuggestion === oldName) {
        category.accountSuggestion = name;
      }
    });

    showToast('Cuenta actualizada.');
  } else {
    user.accounts.push({
      id: crypto.randomUUID(),
      name,
      type,
      initialBalance: Number.isFinite(balance) ? balance : 0
    });
    showToast('Cuenta creada.');
  }

  saveState();
  resetAccountFormMode();
  closeModal(accountModal);
  renderDashboard();
});

document.getElementById('categoryForm')?.addEventListener('submit', (e) => {
  e.preventDefault();

  const user = getCurrentUser();
  if (!user) return;

  const rawKey = document.getElementById('categoryKey').value;
  const key = sanitizeKey(rawKey);
  const name = document.getElementById('categoryName').value.trim();
  const type = document.getElementById('categoryType').value;
  const icon = document.getElementById('categoryIcon').value.trim() || '✨';
  const accountSuggestion = document.getElementById('categoryAccountSuggestion').value;
  const monthlyBudget = Number(document.getElementById('categoryBudget').value) || 0;
  const description = document.getElementById('categoryDescription').value.trim();

  if (!key || !name) {
    alert('Completa la clave y el nombre de la categoría.');
    return;
  }

  if (editingCategoryKey && editingCategoryKey !== key && user.categories[key]) {
    alert('Ya existe una categoría con esa clave.');
    return;
  }

  if (!editingCategoryKey && user.categories[key]) {
    alert('Ya existe una categoría con esa clave.');
    return;
  }

  const payload = {
    icon,
    type,
    suggestedName: name,
    accountSuggestion,
    description,
    monthlyBudget
  };

  if (editingCategoryKey) {
    if (editingCategoryKey !== key) {
      user.categories[key] = payload;
      delete user.categories[editingCategoryKey];

      user.movements.forEach((m) => {
        if (m.templateKey === editingCategoryKey) {
          m.templateKey = key;
        }
      });
    } else {
      user.categories[key] = payload;
    }
    showToast('Categoría actualizada.');
  } else {
    user.categories[key] = payload;
    showToast('Categoría creada.');
  }

  saveState();
  resetCategoryFormMode();
  closeModal(categoryModal);
  renderDashboard();
});

function getFiltersFromInputs(searchId, periodId, typeId, fromId, toId) {
  return {
    q: document.getElementById(searchId)?.value.trim().toLowerCase() || '',
    period: document.getElementById(periodId)?.value || 'month',
    type: document.getElementById(typeId)?.value || 'all',
    from: document.getElementById(fromId)?.value || '',
    to: document.getElementById(toId)?.value || ''
  };
}

function getFilteredMovements(user, filters) {
  const { q, period, type, from, to } = filters;
  const now = new Date();

  return user.movements.filter((m) => {
    const d = new Date(`${m.date}T00:00:00`);
    const textOk =
      !q ||
      [m.name, m.categoryName, m.description]
        .join(' ')
        .toLowerCase()
        .includes(q);

    const typeOk = type === 'all' || m.type === type;

    let periodOk = true;

    if (from) {
      const fromDate = new Date(`${from}T00:00:00`);
      if (d < fromDate) periodOk = false;
    }

    if (to) {
      const toDate = new Date(`${to}T23:59:59`);
      if (d > toDate) periodOk = false;
    }

    if (!from && !to) {
      if (period === 'week') {
        const start = new Date(now);
        start.setDate(now.getDate() - 7);
        periodOk = d >= start && d <= now;
      } else if (period === 'month') {
        periodOk =
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear();
      } else if (period === 'year') {
        periodOk = d.getFullYear() === now.getFullYear();
      }
    }

    return textOk && typeOk && periodOk;
  });
}

function computeAccountBalance(user, accountId) {
  const acc = user.accounts.find((a) => a.id === accountId);
  if (!acc) return 0;

  let total = Number(acc.initialBalance || 0);

  user.movements
    .filter((m) => m.accountId === accountId || m.destinationAccountId === accountId)
    .forEach((m) => {
      if (m.type === 'ingreso' && m.accountId === accountId) {
        total += Number(m.amount);
      } else if (m.type === 'gasto' && m.accountId === accountId) {
        total -= Number(m.amount);
      } else if (m.type === 'ahorro' && m.accountId === accountId) {
        total -= Number(m.amount);
      } else if (m.type === 'transferencia') {
        if (m.accountId === accountId) total -= Number(m.amount);
        if (m.destinationAccountId === accountId) total += Number(m.amount);
      }
    });

  return total;
}

function buildAccountCard(acc, balance) {
  return `
    <div class="account">
      <h4>${acc.name}</h4>
      <small>${acc.type}</small>
      <strong>${formatMoney(balance)}</strong>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn btn-soft" type="button" onclick="editAccount('${acc.id}')">Editar</button>
        <button class="btn btn-danger" type="button" onclick="deleteAccount('${acc.id}')">Eliminar</button>
      </div>
    </div>
  `;
}

function renderAccounts(user) {
  const grids = [
    document.getElementById('accountsGrid'),
    document.getElementById('accountsGridOnly')
  ];

  grids.forEach((grid) => {
    if (!grid) return;

    grid.innerHTML = '';

    if (!user.accounts.length) {
      grid.innerHTML = '<div class="empty">No tienes cuentas creadas.</div>';
      return;
    }

    user.accounts.forEach((acc) => {
      const balance = computeAccountBalance(user, acc.id);
      grid.insertAdjacentHTML('beforeend', buildAccountCard(acc, balance));
    });
  });
}

window.editAccount = function editAccount(id) {
  const user = getCurrentUser();
  if (!user) return;

  const account = user.accounts.find((a) => a.id === id);
  if (!account) return;

  editingAccountId = id;

  if (accountModalTitle) accountModalTitle.textContent = 'Editar cuenta';
  if (accountSubmitBtn) accountSubmitBtn.textContent = 'Actualizar cuenta';

  document.getElementById('accountName').value = account.name;
  document.getElementById('accountType').value = account.type;
  document.getElementById('accountInitialBalance').value = account.initialBalance;

  openModal(accountModal);
};

window.deleteAccount = async function deleteAccount(id) {
  const user = getCurrentUser();
  if (!user) return;

  const account = user.accounts.find((a) => a.id === id);
  if (!account) return;

  if (user.movements.some((m) => m.accountId === id || m.destinationAccountId === id)) {
    alert('No puedes eliminar una cuenta con movimientos asociados.');
    return;
  }

  const confirmed = await openConfirmModal({
    title: 'Eliminar cuenta',
    message: `¿Seguro que deseas eliminar la cuenta "${account.name}"?`,
    acceptText: 'Eliminar'
  });

  if (!confirmed) return;

  user.accounts = user.accounts.filter((a) => a.id !== id);
  saveState();
  renderDashboard();
  showToast('Cuenta eliminada.');
};

function getMovementVisuals(m) {
  if (m.type === 'ingreso') return { cls: 'income', sign: '+' };
  if (m.type === 'transferencia') return { cls: 'saving', sign: '↔' };
  return { cls: m.type === 'ahorro' ? 'saving' : 'expense', sign: '-' };
}

function buildMovementItem(user, m) {
  const acc = user.accounts.find((a) => a.id === m.accountId);
  const dest = user.accounts.find((a) => a.id === m.destinationAccountId);
  const { cls, sign } = getMovementVisuals(m);

  const extraTransferText = m.type === 'transferencia'
    ? ` · ${(acc && acc.name) || 'Sin origen'} → ${(dest && dest.name) || 'Sin destino'}`
    : ` · ${(acc && acc.name) || 'Sin cuenta'}`;

  return `
    <div class="movement">
      <div class="icon">${m.icon || '✨'}</div>
      <div>
        <h4>${m.name}</h4>
        <p>${m.categoryName}${extraTransferText} · ${m.date}</p>
        <p>${m.description || 'Sin descripción'}</p>
      </div>
      <div>
        <div class="amount ${cls}">${sign} ${formatMoney(m.amount)}</div>
        <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;">
          <button
            class="btn btn-soft"
            type="button"
            style="padding:8px 12px;font-size:12px;"
            onclick="editMovement('${m.id}')"
          >
            Editar
          </button>
          <button
            class="btn btn-danger"
            type="button"
            style="padding:8px 12px;font-size:12px;"
            onclick="deleteMovement('${m.id}')"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderMovements(user) {
  const summaryFilters = getFiltersFromInputs(
    'searchMovement',
    'periodFilter',
    'typeFilter',
    'fromDate',
    'toDate'
  );

  const fullFilters = getFiltersFromInputs(
    'searchMovementOnly',
    'periodFilterOnly',
    'typeFilterOnly',
    'fromDateOnly',
    'toDateOnly'
  );

  const summaryList = document.getElementById('movementList');
  const fullList = document.getElementById('movementListOnly');

  const summaryMovements = getFilteredMovements(user, summaryFilters);
  const fullMovements = getFilteredMovements(user, fullFilters);

  if (summaryList) {
    summaryList.innerHTML = summaryMovements.length
      ? summaryMovements.map((m) => buildMovementItem(user, m)).join('')
      : '<div class="empty">No hay movimientos para este filtro.</div>';
  }

  if (fullList) {
    fullList.innerHTML = fullMovements.length
      ? fullMovements.map((m) => buildMovementItem(user, m)).join('')
      : '<div class="empty">No hay movimientos para este filtro.</div>';
  }

  return { summaryMovements, fullMovements };
}

window.editMovement = function editMovement(id) {
  const user = getCurrentUser();
  if (!user) return;

  const movement = user.movements.find((m) => m.id === id);
  if (!movement) return;

  editingMovementId = id;
  prepareMovementForm();

  if (movementModalTitle) movementModalTitle.textContent = 'Editar movimiento';
  if (movementSubmitBtn) movementSubmitBtn.textContent = 'Actualizar movimiento';

  document.getElementById('movementCategoryTemplate').value = movement.templateKey || 'otros';
  document.getElementById('movementType').value = movement.type;
  document.getElementById('movementName').value = movement.name;
  document.getElementById('movementCategoryName').value = movement.categoryName;
  document.getElementById('movementAmount').value = movement.amount;
  document.getElementById('movementAccount').value = movement.accountId;
  document.getElementById('movementDescription').value = movement.description || '';
  document.getElementById('movementDate').value = movement.date;
  document.getElementById('movementIcon').value = movement.icon || '';

  if (movementDestinationAccount && movement.destinationAccountId) {
    movementDestinationAccount.value = movement.destinationAccountId;
  }

  toggleTransferFields(movement.type === 'transferencia');
  openModal(movementModal);
};

window.deleteMovement = async function deleteMovement(id) {
  const user = getCurrentUser();
  if (!user) return;

  const movement = user.movements.find((m) => m.id === id);
  if (!movement) return;

  const confirmed = await openConfirmModal({
    title: 'Eliminar movimiento',
    message: `¿Seguro que deseas eliminar el movimiento "${movement.name}"?`,
    acceptText: 'Eliminar'
  });

  if (!confirmed) return;

  user.movements = user.movements.filter((m) => m.id !== id);
  saveState();
  renderDashboard();
  showToast('Movimiento eliminado.');
};

function getCategoryMonthSpent(user, key) {
  const now = new Date();
  return user.movements
    .filter((m) => {
      const d = new Date(`${m.date}T00:00:00`);
      return (
        m.templateKey === key &&
        m.type === 'gasto' &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, m) => sum + Number(m.amount), 0);
}

function renderCategories(user) {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;

  grid.innerHTML = '';

  const entries = Object.entries(user.categories || {});
  if (!entries.length) {
    grid.innerHTML = '<div class="empty">No hay categorías configuradas.</div>';
    return;
  }

  entries.forEach(([key, value]) => {
    const spent = getCategoryMonthSpent(user, key);
    const budget = Number(value.monthlyBudget || 0);
    const usage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

    grid.insertAdjacentHTML(
      'beforeend',
      `
      <div class="account">
        <h4>${value.icon || '✨'} ${value.suggestedName}</h4>
        <small>Clave: ${key}</small>
        <small>Tipo: ${value.type}</small>
        <small>Cuenta sugerida: ${value.accountSuggestion}</small>
        <small>${value.description || 'Sin descripción'}</small>
        <small>Presupuesto: ${budget > 0 ? formatMoney(budget) : 'No definido'}</small>
        <small>Gastado este mes: ${formatMoney(spent)}</small>
        <div style="height:8px;background:rgba(255,255,255,.08);border-radius:999px;overflow:hidden;margin:10px 0 14px;">
          <div style="width:${usage}%;height:100%;background:linear-gradient(90deg,var(--primary),var(--primary-2));"></div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-soft" type="button" onclick="editCategory('${key}')">Editar</button>
          <button class="btn btn-danger" type="button" onclick="deleteCategory('${key}')">Eliminar</button>
        </div>
      </div>
      `
    );
  });
}

window.editCategory = function editCategory(key) {
  const user = getCurrentUser();
  if (!user) return;

  const category = user.categories[key];
  if (!category) return;

  editingCategoryKey = key;
  fillCategoryAccountSuggestions(user);

  if (categoryModalTitle) categoryModalTitle.textContent = 'Editar categoría';
  if (categorySubmitBtn) categorySubmitBtn.textContent = 'Actualizar categoría';

  document.getElementById('categoryKey').value = key;
  document.getElementById('categoryName').value = category.suggestedName;
  document.getElementById('categoryType').value = category.type;
  document.getElementById('categoryIcon').value = category.icon || '';
  document.getElementById('categoryAccountSuggestion').value = category.accountSuggestion || '';
  document.getElementById('categoryBudget').value = category.monthlyBudget || 0;
  document.getElementById('categoryDescription').value = category.description || '';

  openModal(categoryModal);
};

window.deleteCategory = async function deleteCategory(key) {
  const user = getCurrentUser();
  if (!user) return;

  const category = user.categories[key];
  if (!category) return;

  const inUse = user.movements.some((m) => m.templateKey === key);
  if (inUse) {
    alert('No puedes eliminar una categoría que ya tiene movimientos asociados.');
    return;
  }

  const confirmed = await openConfirmModal({
    title: 'Eliminar categoría',
    message: `¿Seguro que deseas eliminar la categoría "${category.suggestedName}"?`,
    acceptText: 'Eliminar'
  });

  if (!confirmed) return;

  delete user.categories[key];
  saveState();
  renderDashboard();
  showToast('Categoría eliminada.');
};

function calculateSummary(user, filtered) {
  let income = 0;
  let expenses = 0;
  let savings = 0;
  let transfers = 0;

  filtered.forEach((m) => {
    if (m.type === 'ingreso') income += Number(m.amount);
    else if (m.type === 'ahorro') savings += Number(m.amount);
    else if (m.type === 'gasto') expenses += Number(m.amount);
    else if (m.type === 'transferencia') transfers += Number(m.amount);
  });

  let totalBalance = 0;
  user.accounts.forEach((acc) => {
    totalBalance += computeAccountBalance(user, acc.id);
  });

  return { income, expenses, savings, transfers, totalBalance };
}

function getLastMonthExpenses(user) {
  const now = new Date();
  const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  return user.movements
    .filter((m) => {
      const d = new Date(`${m.date}T00:00:00`);
      return m.type === 'gasto' && d.getMonth() === lastMonth && d.getFullYear() === year;
    })
    .reduce((sum, m) => sum + Number(m.amount), 0);
}

function getCurrentMonthExpenses(user) {
  const now = new Date();
  return user.movements
    .filter((m) => {
      const d = new Date(`${m.date}T00:00:00`);
      return m.type === 'gasto' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, m) => sum + Number(m.amount), 0);
}

function getTotalMonthlyBudget(user) {
  return Object.values(user.categories || {})
    .reduce((sum, c) => sum + Number(c.monthlyBudget || 0), 0);
}

function chartTextColor() {
  return '#dce6f8';
}

function chartGridColor() {
  return 'rgba(255,255,255,.08)';
}

function renderChartPair(filtered, pieCanvasId, barCanvasId, target, period) {
  const pieCanvas = document.getElementById(pieCanvasId);
  const barCanvas = document.getElementById(barCanvasId);

  if (!pieCanvas || !barCanvas) return;

  const categoryTotals = {};
  filtered
    .filter((m) => m.type !== 'transferencia')
    .forEach((m) => {
      categoryTotals[m.categoryName] =
        (categoryTotals[m.categoryName] || 0) + Number(m.amount);
    });

  const pieEntries = Object.entries(categoryTotals);
  const colors = [
    '#7c5cff',
    '#5eead4',
    '#ff6b81',
    '#fbbf24',
    '#60a5fa',
    '#34d399',
    '#fb7185',
    '#818cf8'
  ];

  if (target.pie) target.pie.destroy();
  target.pie = new Chart(pieCanvas, {
    type: 'doughnut',
    data: {
      labels: pieEntries.length ? pieEntries.map((i) => i[0]) : ['Sin datos'],
      datasets: [
        {
          data: pieEntries.length ? pieEntries.map((i) => i[1]) : [1],
          backgroundColor: pieEntries.length
            ? pieEntries.map((_, i) => colors[i % colors.length])
            : ['rgba(255,255,255,.15)'],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: chartTextColor()
          }
        }
      }
    }
  });

  const grouped = {};
  filtered.forEach((m) => {
    const d = new Date(`${m.date}T00:00:00`);
    let key = '';

    if (period === 'week') {
      key = d.toLocaleDateString('es-CO', { weekday: 'short' });
    } else if (period === 'year') {
      key = d.toLocaleDateString('es-CO', { month: 'short' });
    } else {
      key = d.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit'
      });
    }

    if (!grouped[key]) {
      grouped[key] = { ingreso: 0, gasto: 0, ahorro: 0, transferencia: 0 };
    }

    grouped[key][m.type] += Number(m.amount);
  });

  const labels = Object.keys(grouped);
  const safeLabels = labels.length ? labels : ['Sin datos'];

  if (target.bar) target.bar.destroy();
  target.bar = new Chart(barCanvas, {
    type: 'bar',
    data: {
      labels: safeLabels,
      datasets: [
        {
          label: 'Ingresos',
          data: labels.length ? labels.map((l) => grouped[l]?.ingreso || 0) : [0],
          backgroundColor: '#34d399',
          borderRadius: 8
        },
        {
          label: 'Gastos',
          data: labels.length ? labels.map((l) => grouped[l]?.gasto || 0) : [0],
          backgroundColor: '#ff6b81',
          borderRadius: 8
        },
        {
          label: 'Ahorro',
          data: labels.length ? labels.map((l) => grouped[l]?.ahorro || 0) : [0],
          backgroundColor: '#fbbf24',
          borderRadius: 8
        },
        {
          label: 'Transferencias',
          data: labels.length ? labels.map((l) => grouped[l]?.transferencia || 0) : [0],
          backgroundColor: '#60a5fa',
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: chartTextColor()
          }
        }
      },
      scales: {
        x: {
          ticks: { color: chartTextColor() },
          grid: { color: 'transparent' }
        },
        y: {
          beginAtZero: true,
          ticks: { color: chartTextColor() },
          grid: { color: chartGridColor() }
        }
      }
    }
  });
}

function renderAnalysisMetrics(user, summary) {
  const lastMonthExpenses = getLastMonthExpenses(user);
  const currentMonthExpenses = getCurrentMonthExpenses(user);
  const budget = getTotalMonthlyBudget(user);
  const usage = budget > 0 ? (currentMonthExpenses / budget) * 100 : 0;
  const variation = lastMonthExpenses > 0
    ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
    : 0;

  const elLast = document.getElementById('lastMonthExpenses');
  const elVar = document.getElementById('monthlyVariation');
  const elBudget = document.getElementById('budgetUsage');
  const elTransfers = document.getElementById('totalTransfers');

  if (elLast) elLast.textContent = formatMoney(lastMonthExpenses);
  if (elVar) elVar.textContent = `${variation.toFixed(1)}%`;
  if (elBudget) elBudget.textContent = `${usage.toFixed(1)}%`;
  if (elTransfers) elTransfers.textContent = formatMoney(summary.transfers);
}

function exportMovementsCsv() {
  const user = getCurrentUser();
  if (!user || !user.movements.length) {
    alert('No hay movimientos para exportar.');
    return;
  }

  const rows = [
    ['Fecha', 'Tipo', 'Nombre', 'Categoría', 'Monto', 'Cuenta origen', 'Cuenta destino', 'Descripción']
  ];

  user.movements.forEach((m) => {
    const origin = user.accounts.find((a) => a.id === m.accountId)?.name || '';
    const dest = user.accounts.find((a) => a.id === m.destinationAccountId)?.name || '';
    rows.push([
      m.date,
      m.type,
      m.name,
      m.categoryName,
      m.amount,
      origin,
      dest,
      m.description || ''
    ]);
  });

  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'movimientos_nexocash.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('CSV exportado.');
}

function renderDashboard() {
  const user = getCurrentUser();
  if (!user) return;

  if (sidebarUserName) {
    sidebarUserName.textContent = user.name;
  }

  renderAccounts(user);
  renderCategories(user);

  const summaryFilters = getFiltersFromInputs(
    'searchMovement',
    'periodFilter',
    'typeFilter',
    'fromDate',
    'toDate'
  );

  const fullFilters = getFiltersFromInputs(
    'searchMovementOnly',
    'periodFilterOnly',
    'typeFilterOnly',
    'fromDateOnly',
    'toDateOnly'
  );

  const summaryList = document.getElementById('movementList');
  const fullList = document.getElementById('movementListOnly');

  const summaryMovements = getFilteredMovements(user, summaryFilters);
  const fullMovements = getFilteredMovements(user, fullFilters);

  if (summaryList) {
    summaryList.innerHTML = summaryMovements.length
      ? summaryMovements.map((m) => buildMovementItem(user, m)).join('')
      : '<div class="empty">No hay movimientos para este filtro.</div>';
  }

  if (fullList) {
    fullList.innerHTML = fullMovements.length
      ? fullMovements.map((m) => buildMovementItem(user, m)).join('')
      : '<div class="empty">No hay movimientos para este filtro.</div>';
  }

  const summary = calculateSummary(user, summaryMovements);

  const totalBalance = document.getElementById('totalBalance');
  const totalIncome = document.getElementById('totalIncome');
  const totalExpenses = document.getElementById('totalExpenses');
  const totalSavings = document.getElementById('totalSavings');

  if (totalBalance) totalBalance.textContent = formatMoney(summary.totalBalance);
  if (totalIncome) totalIncome.textContent = formatMoney(summary.income);
  if (totalExpenses) totalExpenses.textContent = formatMoney(summary.expenses);
  if (totalSavings) totalSavings.textContent = formatMoney(summary.savings);

  renderAnalysisMetrics(user, summary);

  const summaryPeriod = document.getElementById('periodFilter')?.value || 'month';
  const fullPeriod = document.getElementById('periodFilterOnly')?.value || 'month';

  renderChartPair(summaryMovements, 'pieChart', 'barChart', {
    get pie() { return pieChart; },
    set pie(v) { pieChart = v; },
    get bar() { return barChart; },
    set bar(v) { barChart = v; }
  }, summaryPeriod);

  renderChartPair(fullMovements, 'pieChartOnly', 'barChartOnly', {
    get pie() { return pieChartOnly; },
    set pie(v) { pieChartOnly = v; },
    get bar() { return barChartOnly; },
    set bar(v) { barChartOnly = v; }
  }, fullPeriod);

  showSection(currentSection);
}

function render() {
  const logged = !!getCurrentUser();

  authView?.classList.toggle('hidden', logged);
  appView?.classList.toggle('hidden', !logged);

  if (logged) {
    renderDashboard();
  } else {
    setTab('login');
  }
}

[
  'searchMovement',
  'periodFilter',
  'typeFilter',
  'fromDate',
  'toDate',
  'searchMovementOnly',
  'periodFilterOnly',
  'typeFilterOnly',
  'fromDateOnly',
  'toDateOnly'
].forEach((id) => {
  document.getElementById(id)?.addEventListener('input', renderDashboard);
  document.getElementById(id)?.addEventListener('change', renderDashboard);
});

ensureButtonsAreSafe();
render();