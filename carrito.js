document.addEventListener("DOMContentLoaded", function() {
    const cartItemsElement = document.getElementById("cart-items");
    const totalPriceElement = document.getElementById("total-price");
    const checkoutTotalPriceElement = document.getElementById("checkout-total-price");
    const checkoutTotalItemsElement = document.getElementById("checkout-total-items");

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let total = 0;
    let totalItems = 0;

    carrito.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        
        // Verificar si gustos es un objeto y convertirlo a un array de strings
        const gustosArray = Object.entries(item.gustos)
            .filter(([key, value]) => value > 0) // Filtrar solo los gustos seleccionados
            .map(([key, value]) => `${key} (${value})`);

        itemElement.innerHTML = `
            <h3>${item.nombre}</h3>
            <p>Precio: $${item.precio}</p>
            <p>Gustos: ${gustosArray.join(', ')}</p>
        `;
        cartItemsElement.appendChild(itemElement);
        total += item.precio;
        totalItems++;
    });

    totalPriceElement.innerText = `Total: $${total.toFixed(2)}`;
    checkoutTotalPriceElement.innerText = `Total: $${total.toFixed(2)}`;
    checkoutTotalItemsElement.innerText = `Items: ${totalItems}`;

    document.getElementById("continue-shopping").addEventListener("click", function() {
        window.location.href = "index.html"; // Redirige al menú principal para seguir comprando
    });

    document.getElementById("clear-cart").addEventListener("click", function() {
        localStorage.removeItem("carrito");
        alert("El carrito ha sido vaciado.");
        window.location.href = "index.html"; // Redirige al menú principal después de vaciar el carrito
    });

    document.getElementById("checkout").addEventListener("click", function() {
        alert("Continuando con el pedido...");
        // Aquí puedes agregar lógica adicional para procesar el pedido
    });
});