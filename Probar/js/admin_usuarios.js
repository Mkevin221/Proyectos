// ../Probar/js/admin_usuarios.js
document.addEventListener("DOMContentLoaded", () => {
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
  if (!usuarioActivo || usuarioActivo.role !== "admin") {
    window.location.href = "index.html";
    return;
  }

  const usersTable = document.getElementById("usersTable");
  const usersEmpty = document.getElementById("usersEmpty");
  const searchUser = document.getElementById("searchUser");
  const filterStatus = document.getElementById("filterStatus");
  const logoutBtn = document.getElementById("adminLogoutBtn");

  const loadUsers = () => JSON.parse(localStorage.getItem("usuarios") || "[]");
  const saveUsers = (u) => localStorage.setItem("usuarios", JSON.stringify(u));

  const normalize = (s) => (s || "").toLowerCase();

  const ensureStatus = (u) => {
    if (!u.status) u.status = "active";
    if (!u.role) u.role = "user";
    return u;
  };

  const isSessionActive = (u) => {
    const active = JSON.parse(localStorage.getItem("usuarioActivo"));
    return active && normalize(active.email) === normalize(u.email);
  };

  const render = () => {
    const users = loadUsers().map(ensureStatus);

    const q = normalize(searchUser.value);
    const f = filterStatus.value;

    const filtered = users.filter((u) => {
      const matchQuery =
        normalize(u.fullName).includes(q) || normalize(u.email).includes(q);
      const matchStatus = f === "all" ? true : u.status === f;
      return matchQuery && matchStatus;
    });

    if (!filtered.length) {
      usersTable.innerHTML = "";
      usersEmpty.style.display = "block";
      return;
    }
    usersEmpty.style.display = "none";

    usersTable.innerHTML = filtered
      .map((u) => {
        const sessionBadge = isSessionActive(u) ? " • En sesión" : "";
        return `
          <div class="row">
            <div>
              <strong>${u.fullName || "Sin nombre"}</strong>
              <small>${u.email}${sessionBadge} • Rol: ${u.role}</small>
            </div>
            <div class="actions">
              <span class="badge ${u.status}">${u.status === "active" ? "Activo" : "Suspendido"}</span>
              <button class="btn-outline" data-action="toggle" data-email="${u.email}">
                ${u.status === "active" ? "Suspender" : "Activar"}
              </button>
              <button class="btn-outline" data-action="edit" data-email="${u.email}">Editar</button>
              <button class="btn-danger" data-action="delete" data-email="${u.email}">Eliminar</button>
            </div>
          </div>
        `;
      })
      .join("");
  };

  usersTable.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.dataset.action;
    const email = btn.dataset.email;
    if (!action || !email) return;

    const users = loadUsers().map(ensureStatus);
    const idx = users.findIndex((u) => normalize(u.email) === normalize(email));
    if (idx === -1) return;

    // Evitar que el admin se elimine o suspenda a sí mismo
    if (normalize(usuarioActivo.email) === normalize(email) && action !== "edit") {
      alert("No puedes modificar tu propia cuenta desde aquí.");
      return;
    }

    if (action === "toggle") {
      users[idx].status = users[idx].status === "active" ? "suspended" : "active";

      // Si suspendes a alguien que está en sesión, ciérrale sesión
      const active = JSON.parse(localStorage.getItem("usuarioActivo"));
      if (active && normalize(active.email) === normalize(email) && users[idx].status === "suspended") {
        localStorage.removeItem("usuarioActivo");
      }

      saveUsers(users);
      render();
    }

    if (action === "delete") {
      if (!confirm(`¿Eliminar a ${users[idx].email}?`)) return;
      users.splice(idx, 1);
      saveUsers(users);
      render();
    }

    if (action === "edit") {
      const newName = prompt("Nuevo nombre:", users[idx].fullName || "");
      if (newName === null) return;

      const newEmail = prompt("Nuevo correo:", users[idx].email || "");
      if (newEmail === null) return;

      users[idx].fullName = newName.trim() || users[idx].fullName;
      users[idx].email = newEmail.trim().toLowerCase() || users[idx].email;

      saveUsers(users);
      render();
    }
  });

  searchUser.addEventListener("input", render);
  filterStatus.addEventListener("change", render);

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("usuarioActivo");
    window.location.href = "index.html";
  });

  render();
});