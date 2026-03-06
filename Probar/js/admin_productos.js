// ../Probar/js/admin_productos.js
document.addEventListener("DOMContentLoaded", () => {
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
  if (!usuarioActivo || usuarioActivo.role !== "admin") {
    window.location.href = "index.html";
    return;
  }

  const $ = (id) => document.getElementById(id);

  // Inputs
  const pName = $("pName");
  const pModel = $("pModel");         // ✅ NUEVO
  const pDesc = $("pDesc");
  const pPrice = $("pPrice");
  const pCategory = $("pCategory");
  const pStock = $("pStock");
  const pPublished = $("pPublished");

  // Imagen
  const pickImageBtn = $("pickImageBtn"); // ✅ NUEVO
  const pImageFile = $("pImageFile");     // ✅ NUEVO
  const pImageUrl = $("pImageUrl");       // ✅ NUEVO
  const pPreview = $("pPreview");         // ✅ NUEVO
  let tempImage = "";                     // ✅ Guarda base64 o url

  // UI
  const createBtn = $("createProductBtn");
  const clearBtn = $("clearProductBtn");
  const productsTable = $("productsTable");
  const productsEmpty = $("productsEmpty");
  const logoutBtn = $("adminLogoutBtn");

  // Storage helpers
  const load = () => JSON.parse(localStorage.getItem("productos") || "[]");
  const save = (arr) => localStorage.setItem("productos", JSON.stringify(arr));
  const uuid = () => "P-" + Math.random().toString(16).slice(2) + Date.now().toString(16);

  // File -> Base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // ✅ Botón que abre selector
  pickImageBtn?.addEventListener("click", () => {
    pImageFile?.click();
  });

  // ✅ Cuando selecciona imagen (archivo)
  pImageFile?.addEventListener("change", async () => {
    const file = pImageFile.files?.[0];
    if (!file) return;

    tempImage = await fileToBase64(file);

    if (pPreview) {
      pPreview.src = tempImage;
      pPreview.style.display = "block";
    }

    // si eligió archivo, limpiamos URL para evitar confusión
    if (pImageUrl) pImageUrl.value = "";
  });

  // ✅ Si pega URL, usarla
  pImageUrl?.addEventListener("input", () => {
    const url = pImageUrl.value.trim();
    if (!url) return;

    tempImage = url;

    if (pPreview) {
      pPreview.src = url;
      pPreview.style.display = "block";
    }

    // si usa URL, limpiamos el archivo seleccionado
    if (pImageFile) pImageFile.value = "";
  });

  const resetForm = () => {
    pName.value = "";
    pModel.value = "";
    pDesc.value = "";
    pPrice.value = "";
    pCategory.value = "";
    pStock.value = "";
    pPublished.checked = true;

    tempImage = "";
    if (pImageFile) pImageFile.value = "";
    if (pImageUrl) pImageUrl.value = "";
    if (pPreview) {
      pPreview.src = "";
      pPreview.style.display = "none";
    }

    createBtn.dataset.editing = "";
  };

  const render = () => {
    const products = load();

    if (!products.length) {
      productsTable.innerHTML = "";
      productsEmpty.style.display = "block";
      return;
    }
    productsEmpty.style.display = "none";

    productsTable.innerHTML = products
      .map((p) => `
        <div class="row">
          <div>
            <strong>${p.name}</strong>
            <small>
              ${p.category || "Sin categoría"} • ${p.published ? "Publicado" : "Oculto"} • Stock: ${p.stock ?? 0}
              ${p.model ? " • Modelo: " + p.model : ""}
            </small>
          </div>
          <div class="actions">
            <button class="btn-outline" data-action="toggle" data-id="${p.id}">
              ${p.published ? "Ocultar" : "Publicar"}
            </button>
            <button class="btn-outline" data-action="edit" data-id="${p.id}">Editar</button>
            <button class="btn-danger" data-action="delete" data-id="${p.id}">Eliminar</button>
          </div>
        </div>
      `)
      .join("");
  };

  // ✅ Guardar / Editar
  createBtn.addEventListener("click", () => {
    const products = load();

    const data = {
      name: pName.value.trim(),
      model: pModel.value.trim(),        // ✅ NUEVO
      desc: pDesc.value.trim(),
      price: Number(pPrice.value || 0),
      category: pCategory.value.trim(),
      stock: Number(pStock.value || 0),
      published: !!pPublished.checked,
      imageUrl: tempImage               // ✅ NUEVO (base64 o url)
    };

    if (!data.name) return alert("Nombre es obligatorio.");
    if (!data.price || data.price <= 0) return alert("Precio debe ser mayor a 0.");

    const editingId = createBtn.dataset.editing;

    if (editingId) {
      const idx = products.findIndex((x) => x.id === editingId);
      if (idx !== -1) {
        products[idx] = { ...products[idx], ...data };
        save(products);
        resetForm();
        render();
        return;
      }
    }

    products.push({ id: uuid(), ...data });
    save(products);
    resetForm();
    render();
  });

  clearBtn.addEventListener("click", resetForm);

  // ✅ Acciones en tabla
  productsTable.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (!action || !id) return;

    const products = load();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return;

    if (action === "toggle") {
      products[idx].published = !products[idx].published;
      save(products);
      render();
    }

    if (action === "delete") {
      if (!confirm(`¿Eliminar producto "${products[idx].name}"?`)) return;
      products.splice(idx, 1);
      save(products);
      render();
    }

    if (action === "edit") {
      const p = products[idx];

      pName.value = p.name || "";
      pModel.value = p.model || "";
      pDesc.value = p.desc || "";
      pPrice.value = p.price ?? "";
      pCategory.value = p.category || "";
      pStock.value = p.stock ?? "";
      pPublished.checked = !!p.published;

      tempImage = p.imageUrl || "";

      if (pPreview && tempImage) {
        pPreview.src = tempImage;
        pPreview.style.display = "block";
      } else if (pPreview) {
        pPreview.src = "";
        pPreview.style.display = "none";
      }

      // si es url, lo ponemos en input url
      if (pImageUrl) {
        pImageUrl.value = (tempImage.startsWith("data:") ? "" : tempImage);
      }
      if (pImageFile) pImageFile.value = "";

      createBtn.dataset.editing = p.id;
      pName.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("usuarioActivo");
    window.location.href = "index.html";
  });

  render();
});