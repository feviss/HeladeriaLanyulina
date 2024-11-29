import { getDocs, collection } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { db } from "./firebaseConfig.js";

document.addEventListener("DOMContentLoaded", async function() {
<<<<<<< HEAD
try {
    const loadingElement = document.getElementById("loading");
    const contentElement = document.getElementById("content");
    loadingElement.classList.remove("hidden");
    contentElement.classList.add("hidden");

    const categoriesContainer = document.getElementById("categories-container");
    const querySnapshot = await getDocs(collection(db, "productos"));
=======
    try {
        const loadingElement = document.getElementById("loading");
        const contentElement = document.getElementById("content");
        const categoriesContainer = document.getElementById("categories-container");

        if (!loadingElement || !contentElement || !categoriesContainer) {
            console.error("Elementos del DOM no encontrados.");
            return;
        }

        loadingElement.classList.remove("hidden");
        contentElement.classList.add("hidden");

        const querySnapshot = await getDocs(collection(db, "productos"));
>>>>>>> 7d3d56d2297f1a2425d1e00b7f83f687cc6f39de

    const productsByCategory = {};

<<<<<<< HEAD
    querySnapshot.forEach((doc) => {
        const productData = doc.data();
        const category = productData.depto || "Otros"; // Usa "Otros" si no hay depto
=======
        querySnapshot.forEach((doc) => {
            const productData = doc.data();
            const category = productData.tipo || "Otros";
>>>>>>> 7d3d56d2297f1a2425d1e00b7f83f687cc6f39de

        if (!productsByCategory[category]) {
            productsByCategory[category] = {
                ordenDepartamento: productData.ordenDepartamento || 999, // Asigna un valor alto por defecto si no está definido
                products: []
            };
        }
        productsByCategory[category].products.push({ id: doc.id, ...productData });
    });

    // Ordenar las categorías por 'ordenDepartamento'
    const sortedCategories = Object.entries(productsByCategory).sort((a, b) => a[1].ordenDepartamento - b[1].ordenDepartamento);

    for (const [category, data] of sortedCategories) {
        // Ordenar los productos dentro de cada categoría por el campo 'orden'
        data.products.sort((a, b) => a.orden - b.orden);

        const categoryElement = document.createElement('div');
        categoryElement.className = 'category';

        const categoryTitle = document.createElement('h2');
        categoryTitle.innerText = category;
        categoryElement.appendChild(categoryTitle);

        const productListElement = document.createElement('div');
        productListElement.className = 'product-list';

        data.products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'menu';
            productElement.setAttribute('data-id', product.id);
            productElement.innerHTML = `
                <h3 class="items">${product.nombre}</h3>
                <img class="img" src="${product.imagen}" alt="${product.nombre}">
            `;
            productElement.addEventListener('click', function() {
                window.location.href = `producto.html?id=${product.id}`;
            });
            productListElement.appendChild(productElement);
        });

<<<<<<< HEAD
        categoryElement.appendChild(productListElement);
        categoriesContainer.appendChild(categoryElement);
    }

    // Ocultar el spinner y mostrar el contenido al terminar la carga
    loadingElement.classList.add("hidden");
    contentElement.classList.remove("hidden");

} catch (error) {
    console.log("Error getting documents: ", error);
}

const viewCartButton = document.getElementById("view-cart");
const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const totalEfectivoElement = document.getElementById("bottom-total-efectivo");
const totalTransferenciaElement = document.getElementById("bottom-total-transferencia");

function updateBottomBar() {
    const totalEfectivo = carrito.reduce((acc, item) => acc + (Number(item.precioEfectivo) * (item.cantidad || 1)), 0);
    const totalTransferencia = carrito.reduce((acc, item) => acc + (Number(item.precioTransferencia) * (item.cantidad || 1)), 0);
    
    totalEfectivoElement.innerText = `Total Efectivo: $${totalEfectivo.toFixed(2)}`;
    totalTransferenciaElement.innerText = `Total Transferencia: $${totalTransferencia.toFixed(2)}`;

    // Deshabilitar el botón si ambos totales son 0
    viewCartButton.disabled = totalEfectivo === 0 && totalTransferencia === 0;
}

updateBottomBar();

viewCartButton.addEventListener("click", function() {
    if (!viewCartButton.disabled) {
        window.location.href = "carrito.html";
    }
});
});
=======
        for (const [category, products] of Object.entries(productsByCategory)) {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category';

            const categoryTitle = document.createElement('h2');
            categoryTitle.innerText = category;
            categoryElement.appendChild(categoryTitle);

            const productListElement = document.createElement('div');
            productListElement.className = 'product-list';

            products.forEach(product => {
                const productElement = document.createElement('div');
                productElement.className = 'menu';
                productElement.setAttribute('data-id', product.id);
                productElement.innerHTML = `
                    <h3 class="items">${product.nombre}</h3>
                    <img class="img" src="${product.imagen}" alt="${product.nombre}">
                `;
                productElement.addEventListener('click', function() {
                    window.location.href = `producto.html?id=${product.id}`;
                });
                productListElement.appendChild(productElement);
            });

            categoryElement.appendChild(productListElement);
            categoriesContainer.appendChild(categoryElement);
        }

        loadingElement.classList.add("hidden");
        contentElement.classList.remove("hidden");

    } catch (error) {
        console.log("Error getting documents: ", error);
    }

    const viewCartButton = document.getElementById("view-cart");
    const totalPriceElement = document.getElementById("bottom-total-price");
    const totalItemsElement = document.getElementById("bottom-total-items");

    if (!viewCartButton || !totalPriceElement || !totalItemsElement) {
        console.error("Elementos del DOM no encontrados.");
        return;
    }

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    function updateBottomBar() {
        const total = carrito.reduce((acc, item) => acc + (item.precio * (item.cantidad || 1)), 0);
        const totalItems = carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0);
        totalPriceElement.innerText = `Total: $${total.toFixed(2)}`;
        totalItemsElement.innerText = `Items: ${totalItems}`;

        viewCartButton.disabled = total === 0;
    }

    updateBottomBar();

    viewCartButton.addEventListener("click", function() {
        if (!viewCartButton.disabled) {
            window.location.href = "carrito.html";
        }
    });
});
>>>>>>> 7d3d56d2297f1a2425d1e00b7f83f687cc6f39de
