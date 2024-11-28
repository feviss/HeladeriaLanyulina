import { getDocs, collection } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { db } from "./firebaseConfig.js";

document.addEventListener("DOMContentLoaded", async function() {
    try {
        const loadingElement = document.getElementById("loading");
        const contentElement = document.getElementById("content");
        loadingElement.classList.remove("hidden");
        contentElement.classList.add("hidden");

        const productListElement = document.getElementById("product-list");
        const querySnapshot = await getDocs(collection(db, "productos"));

        querySnapshot.forEach((doc) => {
            const productData = doc.data();
            const productElement = document.createElement('div');
            productElement.className = 'menu';
            productElement.setAttribute('data-id', doc.id);
            productElement.innerHTML = `
                <h3 class="items">${productData.nombre}</h3>
                <img class="img" src="${productData.imagen}" alt="${productData.nombre}">
            `;
            productElement.addEventListener('click', function() {
                window.location.href = `producto.html?id=${doc.id}`;
            });
            productListElement.appendChild(productElement);
        });

        // Ocultar el spinner y mostrar el contenido al terminar la carga
        loadingElement.classList.add("hidden");
        contentElement.classList.remove("hidden");

    } catch (error) {
        console.log("Error getting documents: ", error);
    }

    document.getElementById("view-cart").addEventListener("click", function() {
        window.location.href = "carrito.html";
    });

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const totalPriceElement = document.getElementById("bottom-total-price");
    const totalItemsElement = document.getElementById("bottom-total-items");

    function updateBottomBar() {
        const total = carrito.reduce((acc, item) => acc + (item.precio * (item.cantidad || 1)), 0);
        const totalItems = carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0);
        totalPriceElement.innerText = `Total: $${total.toFixed(2)}`;
        totalItemsElement.innerText = `Items: ${totalItems}`;
    }

    updateBottomBar();
});