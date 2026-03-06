document.addEventListener("DOMContentLoaded", () => {
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
  if (!usuarioActivo) {
    window.location.href = "index.html";
    return;
  }

  const ordersList = document.getElementById("ordersList");
  const filters = document.querySelectorAll(".filter");

  const moneyCOP = (n) =>
    Number(n || 0).toLocaleString("es-CO", { style: "currency", currency: "COP" });

  const fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "2-digit" });
  };

  const allOrders = JSON.parse(localStorage.getItem("pedidos") || "[]");
  const email = (usuarioActivo.email || "").toLowerCase();

  const myOrders = allOrders
    .filter((o) => (o.userEmail || "").toLowerCase() === email)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const render = (list) => {
    if (!list.length) {
      ordersList.innerHTML = `<p class="muted">No tienes pedidos en esta categoría.</p>`;
      return;
    }

    ordersList.innerHTML = list
      .map((p) => {
        const estadoTxt = p.estado === "entregado" ? "Entregado" : "En camino";
        return `
          <div class="order-row">
            <div class="order-meta">
              <h3>Pedido ${p.id}</h3>
              <p>${fmtDate(p.fecha)} • Total: ${moneyCOP(p.total)}</p>
            </div>
            <span class="badge ${p.estado}">${estadoTxt}</span>
          </div>
        `;
      })
      .join("");
  };

  render(myOrders);

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const f = btn.dataset.filter;
      if (f === "todos") return render(myOrders);
      render(myOrders.filter((p) => p.estado === f));
    });
  });

  // Si vienes desde "Ver pedido", intentamos resaltar el seleccionado (simple)
  const selected = JSON.parse(localStorage.getItem("pedidoSeleccionado") || "null");
  if (selected && selected.id) {
    // No hacemos scroll complejo; solo lo dejamos disponible.
    // Puedes mejorarlo luego resaltando visualmente si quieres.
  }
});