import { getDoc, doc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { db } from "./firebaseConfig.js";

document.addEventListener("DOMContentLoaded", async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        console.error("No se proporcionó un ID de producto.");
        return;
    }

    try {
        const productDoc = await getDoc(doc(db, "productos", productId));
        if (productDoc.exists()) {
            const productData = productDoc.data();
            document.getElementById("product-name").innerText = productData.nombre;
            document.getElementById("product-image").src = productData.imagen;
            document.getElementById("product-description").innerText = productData.descripcion;
            document.getElementById("product-price-efectivo").innerText = `Precio (Efectivo): $${productData.precioEfectivo}`;
            document.getElementById("product-price-transferencia").innerText = `Precio (Transferencia): $${productData.precioTransferencia}`;
            document.getElementById("product-max-gustos").innerText = `Máximo de gustos: ${productData.maxGustos}`;

            const maxGustos = productData.maxGustos;
            const flavorsList = document.getElementById("flavors-list");
            const selectedFlavorsCount = document.getElementById("selected-flavors-count");

            let selectedFlavors = []; // Inicializar aquí para asegurar que siempre exista

            if (maxGustos > 0) {
                // Obtener gustos desde Firestore
                const flavorsSnapshot = await getDocs(collection(db, "gustos"));
                let availableFlavors = [];
                flavorsSnapshot.forEach((doc) => {
                    availableFlavors.push(doc.data().nombre);
                });

                availableFlavors.forEach(flavor => {
                    const flavorCheckbox = document.createElement('input');
                    flavorCheckbox.type = 'checkbox';
                    flavorCheckbox.id = flavor;
                    flavorCheckbox.name = flavor;
                    flavorCheckbox.value = flavor;

                    flavorCheckbox.addEventListener('change', function() {
                        if (this.checked) {
                            if (selectedFlavors.length < maxGustos) {
                                selectedFlavors.push(this.value);
                            } else {
                                this.checked = false;
                                alert(`Solo puedes seleccionar hasta ${maxGustos} gustos.`);
                            }
                        } else {
                            selectedFlavors = selectedFlavors.filter(f => f !== this.value);
                        }
                        selectedFlavorsCount.innerText = `Gustos seleccionados: ${selectedFlavors.length}`;
                    });

                    const label = document.createElement('label');
                    label.htmlFor = flavor;
                    label.appendChild(document.createTextNode(flavor));

                    flavorsList.appendChild(flavorCheckbox);
                    flavorsList.appendChild(label);
                    flavorsList.appendChild(document.createElement('br'));
                });
            } else {
                // Ocultar la sección de selección de gustos si maxGustos es 0
                document.getElementById("flavors-selection").style.display = 'none';
            }

            document.getElementById("add-to-cart").addEventListener("click", function() {
                const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
                carrito.push({
                    id: productId,
                    nombre: productData.nombre,
                    precio: productData.precioEfectivo, // Puedes cambiar según el método de pago seleccionado
                    gustos: selectedFlavors // Utiliza la lista de gustos seleccionados
                });
                localStorage.setItem("carrito", JSON.stringify(carrito));
                console.log("Producto agregado al carrito:", carrito); // Log para verificar
                window.location.href = "index.html"; // Redirige al menú principal
            });

        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.log("Error getting product details: ", error);
    }
});