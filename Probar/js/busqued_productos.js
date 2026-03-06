const productos = [
      {
        id: 1,
        nombre: "Televisor Samsung 50 pulgadas",
        descripcion: "4K UHD Smart TV",
        precio: 1400000,
        imagen: "https://via.placeholder.com/300x220?text=Samsung+50",
        categoria: "televisores",
        marca: "Samsung"
      },
      {
        id: 2,
        nombre: "Televisor LG 65 pulgadas",
        descripcion: "UHD Smart TV",
        precio: 2300000,
        imagen: "https://via.placeholder.com/300x220?text=LG+65",
        categoria: "televisores",
        marca: "LG"
      },
      {
        id: 3,
        nombre: "Hisense 58 pulgadas",
        descripcion: "4K QLED Smart TV",
        precio: 1500000,
        imagen: "https://via.placeholder.com/300x220?text=Hisense+58",
        categoria: "televisores",
        marca: "Hisense"
      },
      {
        id: 4,
        nombre: "Nevera Haceb 300 litros",
        descripcion: "No Frost",
        precio: 1600000,
        imagen: "https://via.placeholder.com/300x220?text=Nevera+Haceb",
        categoria: "neveras",
        marca: "Haceb"
      },
      {
        id: 5,
        nombre: "Lavadora Mabe 18 kg",
        descripcion: "Carga superior",
        precio: 1850000,
        imagen: "https://via.placeholder.com/300x220?text=Lavadora+Mabe",
        categoria: "lavadoras",
        marca: "Mabe"
      },
      {
        id: 6,
        nombre: "Microondas Oster 31 litros",
        descripcion: "Digital",
        precio: 480000,
        imagen: "https://via.placeholder.com/300x220?text=Microondas+Oster",
        categoria: "microondas",
        marca: "Oster"
      }
    ];

    const params = new URLSearchParams(window.location.search);
    const busqueda = (params.get("buscar") || "").toLowerCase().trim();

    const productsGrid = document.getElementById("productsGrid");
    const searchText = document.getElementById("searchText");
    const noResults = document.getElementById("noResults");
    const searchInput = document.getElementById("searchInput");

    searchInput.value = busqueda;

    if (busqueda) {
      searchText.textContent = `Resultados para: "${busqueda}"`;
    }

    function formatearPrecio(valor) {
      return valor.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0
      });
    }

    function renderProductos(lista) {
      productsGrid.innerHTML = "";

      if (lista.length === 0) {
        noResults.style.display = "block";
        return;
      }

      noResults.style.display = "none";

      lista.forEach(producto => {
        const card = document.createElement("article");
        card.className = "product-card";

        card.innerHTML = `
          <div class="product-image">
            <img src="${producto.imagen}" alt="${producto.nombre}">
          </div>
          <div class="product-info">
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion}</p>
            <div class="product-footer">
              <span class="price">${formatearPrecio(producto.precio)}</span>
              <button class="add-btn">Agregar</button>
            </div>
          </div>
        `;

        productsGrid.appendChild(card);
      });
    }

    const filtrados = productos.filter(producto =>
      producto.nombre.toLowerCase().includes(busqueda) ||
      producto.descripcion.toLowerCase().includes(busqueda) ||
      producto.categoria.toLowerCase().includes(busqueda) ||
      producto.marca.toLowerCase().includes(busqueda)
    );

    renderProductos(busqueda ? filtrados : productos);