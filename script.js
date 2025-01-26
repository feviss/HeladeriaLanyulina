import { getDocs, collection } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { db } from "./firebaseConfig.js";

document.addEventListener("DOMContentLoaded", async function() {
try {
    const loadingElement = document.getElementById("loading");
    const contentElement = document.getElementById("content");
    loadingElement.classList.remove("hidden");
    contentElement.classList.add("hidden");

    const categoriesContainer = document.getElementById("categories-container");
    const querySnapshot = await getDocs(collection(db, "productos"));

    const productsByCategory = {};

    querySnapshot.forEach((doc) => {
        const productData = doc.data();
        const category = productData.depto || "Otros"; // Usa "Otros" si no hay depto

        if (!productsByCategory[category]) {
            productsByCategory[category] = {
                ordenDepartamento: productData.ordenDepartamento || 999,
                products: []
            };
        }
        productsByCategory[category].products.push({ id: doc.id, ...productData });
    });

    const sortedCategories = Object.entries(productsByCategory).sort((a, b) => a[1].ordenDepartamento - b[1].ordenDepartamento);

    for (const [category, data] of sortedCategories) {
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
                <p>Precio Efectivo: $${product.precioEfectivo.toFixed(2)}</p>
                <p>Precio Transferencia: $${product.precioTransferencia.toFixed(2)}</p>
            `;
            productElement.addEventListener('click', function() {
                openModal(product);
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
const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const totalEfectivoElement = document.getElementById("bottom-total-efectivo");
const totalTransferenciaElement = document.getElementById("bottom-total-transferencia");

function updateBottomBar() {
    const totalEfectivo = carrito.reduce((acc, item) => acc + (Number(item.precioEfectivo) * (item.cantidad || 1)), 0);
    const totalTransferencia = carrito.reduce((acc, item) => acc + (Number(item.precioTransferencia) * (item.cantidad || 1)), 0);
    
    totalEfectivoElement.innerText = `Total Efectivo: $${totalEfectivo.toFixed(2)}`;
    totalTransferenciaElement.innerText = `Total Transferencia: $${totalTransferencia.toFixed(2)}`;

    viewCartButton.disabled = totalEfectivo === 0 && totalTransferencia === 0;
}

updateBottomBar();

viewCartButton.addEventListener("click", function() {
    if (!viewCartButton.disabled) {
        window.location.href = "carrito.html";
    }
});

function openModal(product) {
    const modal = document.getElementById("product-modal");
    document.getElementById("modal-product-name").innerText = product.nombre;
    document.getElementById("modal-product-image").src = product.imagen;
    document.getElementById("modal-product-description").innerText = product.descripcion;
    
    const modalContent = document.querySelector(".modal-content");
    const existingPriceInfo = document.getElementById("modal-price-info");
    if (existingPriceInfo) {
        existingPriceInfo.remove();
    }
    
    const priceInfo = document.createElement('div');
    priceInfo.id = "modal-price-info";
    priceInfo.innerHTML = `
        <p>Precio Efectivo: $${product.precioEfectivo.toFixed(2)}</p>
        <p>Precio Transferencia: $${product.precioTransferencia.toFixed(2)}</p>
        ${product.maxGustos > 0 ? `<p>Gustos Máximos: ${product.maxGustos}</p>` : ''}
    `;
    modalContent.insertBefore(priceInfo, document.getElementById("modal-product-description"));
    
    const flavorsList = document.getElementById("flavors-list");
    flavorsList.innerHTML = '';
    
    let selectedFlavors = {};
    let selectedOpcionales = {};
    let totalSelectedOpcionales = 0; // Contador de opcionales seleccionados
    
    if (product.maxGustos > 0) {
        getDocs(collection(db, "gustos")).then(flavorsSnapshot => {
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
                minusButton.disabled = true;
    
                const plusButton = document.createElement('button');
                plusButton.className = 'control-button';
                plusButton.innerText = '+';
    
                const quantityDisplay = document.createElement('span');
                quantityDisplay.className = 'quantity-display';
                quantityDisplay.innerText = '0';
    
                minusButton.addEventListener('click', function() {
                    if (selectedFlavors[flavor] > 0) {
                        selectedFlavors[flavor]--;
                        quantityDisplay.innerText = selectedFlavors[flavor];
                        plusButton.disabled = false;
                        if (selectedFlavors[flavor] === 0) {
                            minusButton.disabled = true;
                        }
                        updatePlusButtons();
                    }
                });
    
                plusButton.addEventListener('click', function() {
                    const totalSelected = Object.values(selectedFlavors).reduce((a, b) => a + b, 0);
                    if (totalSelected < product.maxGustos) {
                        selectedFlavors[flavor]++;
                        quantityDisplay.innerText = selectedFlavors[flavor];
                        minusButton.disabled = false;
                        updatePlusButtons();
                    }
                });
    
                controlButtons.appendChild(minusButton);
                controlButtons.appendChild(quantityDisplay);
                controlButtons.appendChild(plusButton);
    
                flavorControl.appendChild(flavorName);
                flavorControl.appendChild(controlButtons);
    
                flavorsList.appendChild(flavorControl);
            });
    
            // Opcionales (después de los gustos)
            const opcionalesHeader = document.createElement('h3');
            opcionalesHeader.innerText = 'Opcionales';
    
            const opcionalesList = document.createElement('div');
            opcionalesList.className = 'opcionales-list';
    
            getDocs(collection(db, "opcionales")).then(opcionalesSnapshot => {
                const opcionalesByDepto = {}; // Agrupar opcionales por departamento
                
                opcionalesSnapshot.forEach((doc) => {
                    const opcionalData = doc.data();
                    const depto = opcionalData.depto || "Otros"; // Departamento por defecto si no existe
                
                    if (!opcionalesByDepto[depto]) {
                        opcionalesByDepto[depto] = [];
                    }
                    opcionalesByDepto[depto].push(opcionalData);
                });
                
                // Iterar por cada departamento
                for (const depto in opcionalesByDepto) {
                    const opcionales = opcionalesByDepto[depto];
                
                    // Crear el encabezado del departamento
                    const deptoHeader = document.createElement('h4');
                    deptoHeader.innerText = depto;
                    flavorsList.appendChild(deptoHeader);
                
                    // Crear la lista de opcionales para el departamento
                    const opcionalesList = document.createElement('div');
                    opcionalesList.className = 'opcionales-list';
                
                    opcionales.forEach(opcionalData => {
                        const opcionalElement = document.createElement('div');
                        opcionalElement.className = 'flavor-control';
                        
                        const nombreSpan = document.createElement('span');
                        nombreSpan.className = 'flavor-name';
                        nombreSpan.innerText = opcionalData.nombre;
                        
                        let precioTexto = '$0';
                        if (opcionalData.precioEfectivo !== 0 || opcionalData.precioTransferencia !== 0) {
                            if (opcionalData.precioEfectivo === opcionalData.precioTransferencia) {
                                precioTexto = `$${opcionalData.precioEfectivo}`;
                            } else {
                                precioTexto = `Ef: $${opcionalData.precioEfectivo}<br>Tr: $${opcionalData.precioTransferencia}`;
                            }
                        }
                        const precioSpan = document.createElement('span');
                        precioSpan.className = 'flavor-name';
                        precioSpan.innerHTML = precioTexto;
                        precioSpan.style.marginLeft = '10px';
                        
                        // Botones de control para opcionales
                        const controlButtons = document.createElement('div');
                        controlButtons.className = 'control-buttons';
                        
                        const minusButton = document.createElement('button');
                        minusButton.className = 'control-button';
                        minusButton.innerText = '-';
                        minusButton.disabled = true;
                        
                        const plusButton = document.createElement('button');
                        plusButton.className = 'control-button';
                        plusButton.innerText = '+';
                        
                        const quantityDisplay = document.createElement('span');
                        quantityDisplay.className = 'quantity-display';
                        quantityDisplay.innerText = '0';
                        
                        minusButton.addEventListener('click', function() {
                            if (selectedOpcionales[opcionalData.nombre] > 0) {
                                selectedOpcionales[opcionalData.nombre]--;
                                quantityDisplay.innerText = selectedOpcionales[opcionalData.nombre];
                                minusButton.disabled = selectedOpcionales[opcionalData.nombre] === 0;
                                plusButton.disabled = false; // Habilitar el botón "+"
                            }
                        });
                        
                        plusButton.addEventListener('click', function() {
                            if (selectedOpcionales[opcionalData.nombre] < 1) { // Máximo 1 opcional
                                selectedOpcionales[opcionalData.nombre]++;
                                quantityDisplay.innerText = selectedOpcionales[opcionalData.nombre];
                                minusButton.disabled = false;
                                plusButton.disabled = true; // Deshabilitar el botón "+"
                            }
                        });
                        
                        controlButtons.appendChild(minusButton);
                        controlButtons.appendChild(quantityDisplay);
                        controlButtons.appendChild(plusButton);
                        
                        opcionalElement.appendChild(nombreSpan);
                        opcionalElement.appendChild(precioSpan);
                        opcionalElement.appendChild(controlButtons); // Agregar botones de control
                        opcionalesList.appendChild(opcionalElement);
                        
                        // Inicializar contador de opcionales
                        selectedOpcionales[opcionalData.nombre] = 0;
                        });
                
                    flavorsList.appendChild(opcionalesList);
                }
            });
        });
    } else {
        document.getElementById("flavors-selection").style.display = 'none';
    }
    
    const addToCartButton = document.getElementById("add-to-cart-modal");
    addToCartButton.onclick = function() {
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        carrito.push({
            id: product.id,
            nombre: product.nombre,
            precioEfectivo: product.precioEfectivo,
            precioTransferencia: product.precioTransferencia,
            cantidad: 1,
            gustos: selectedFlavors,
            opcionales: selectedOpcionales // Agregar opcionales al carrito
        });
        localStorage.setItem("carrito", JSON.stringify(carrito));
        modal.style.display = "none";
        location.reload();
    };
    
    modal.style.display = "block";
    
    const closeButton = document.querySelector(".close-button");
    closeButton.onclick = function() {
        modal.style.display = "none";
    };
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
    
    function updatePlusButtons() {
        const totalSelected = Object.values(selectedFlavors).reduce((a, b) => a + b, 0);
        const allPlusButtons = document.querySelectorAll('.control-button:nth-child(3)');
        allPlusButtons.forEach(button => {
            button.disabled = totalSelected >= product.maxGustos;
            button.style.backgroundColor = button.disabled ? '#ccc' : '#d565d3';
        });
    }
    }
});