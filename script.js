import { getDocs, collection } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { db } from "./firebaseConfig.js";

document.addEventListener("DOMContentLoaded", async function() {
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

        const productsByCategory = {};

        querySnapshot.forEach((doc) => {
            const productData = doc.data();
            const category = productData.tipo || "Otros";

            if (!productsByCategory[category]) {
                productsByCategory[category] = [];
            }
            productsByCategory[category].push({ id: doc.id, ...productData });
        });

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
