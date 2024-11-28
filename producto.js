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
            let totalSelectedFlavors = 0;

            // Define selectedFlavors fuera del bucle forEach
            let selectedFlavors = {};

            if (maxGustos > 0) {
                // Obtener gustos desde Firestore
                const flavorsSnapshot = await getDocs(collection(db, "gustos"));
                let availableFlavors = [];
                flavorsSnapshot.forEach((doc) => {
                    availableFlavors.push(doc.data().nombre);
                });

                availableFlavors.forEach(flavor => {
                    selectedFlavors[flavor] = 0;

                    const flavorControl = document.createElement('div');
                    flavorControl.className = 'flavor-control';

                    const flavorName = document.createElement('span');
                    flavorName.className = 'flavor-name';
                    flavorName.innerText = flavor;

                    const controlButtons = document.createElement('div');
                    controlButtons.className = 'control-buttons';

                    const minusButton = document.createElement('button');
                    minusButton.className = 'control-button';
                    minusButton.innerText = '-';
                    minusButton.disabled = true; // Inicialmente deshabilitado

                    minusButton.addEventListener('click', function() {
                        if (selectedFlavors[flavor] > 0) {
                            selectedFlavors[flavor]--;
                            totalSelectedFlavors--;
                            updateQuantityDisplay(quantityDisplay, selectedFlavors[flavor]);
                            plusButton.disabled = false; // Habilita el botón de más si estaba deshabilitado
                            if (selectedFlavors[flavor] === 0) {
                                minusButton.disabled = true; // Deshabilita el botón de menos si la cantidad es 0
                            }
                            if (totalSelectedFlavors < maxGustos) {
                                disableAllPlusButtons(false); // Habilita todos los botones de más
                            }
                        }
                    });

                    const plusButton = document.createElement('button');
                    plusButton.className = 'control-button';
                    plusButton.innerText = '+';

                    plusButton.addEventListener('click', function() {
                        if (totalSelectedFlavors < maxGustos) {
                            selectedFlavors[flavor]++;
                            totalSelectedFlavors++;
                            updateQuantityDisplay(quantityDisplay, selectedFlavors[flavor]);
                            minusButton.disabled = false; // Habilita el botón de menos
                            if (totalSelectedFlavors >= maxGustos) {
                                disableAllPlusButtons(true); // Deshabilita todos los botones de más
                            }
                        }
                    });

                    const quantityDisplay = document.createElement('span');
                    quantityDisplay.className = 'quantity-display';
                    quantityDisplay.innerText = selectedFlavors[flavor];

                    controlButtons.appendChild(minusButton);
                    controlButtons.appendChild(quantityDisplay);
                    controlButtons.appendChild(plusButton);

                    flavorControl.appendChild(flavorName);
                    flavorControl.appendChild(controlButtons);

                    flavorsList.appendChild(flavorControl);
                });

                function disableAllPlusButtons(disable) {
                    const allPlusButtons = document.querySelectorAll('.control-buttons .control-button:nth-child(3)');
                    allPlusButtons.forEach(button => {
                        button.disabled = disable;
                    });
                }
            } else {
                // Ocultar la sección de selección de gustos si maxGustos es 0
                document.getElementById("flavors-selection").style.display = 'none';
            }

            document.getElementById("add-to-cart").addEventListener("click", function() {
                if (maxGustos > 0 && totalSelectedFlavors === 0) {
                    alert("Por favor, selecciona al menos un gusto.");
                    return;
                }
            
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

function updateQuantityDisplay(displayElement, quantity) {
    displayElement.innerText = quantity;
}