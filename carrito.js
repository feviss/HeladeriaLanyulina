document.addEventListener("DOMContentLoaded", function() {
    const cartItemsElement = document.getElementById("cart-items");
    const totalPriceElement = document.getElementById("total-price");

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let total = 0;

    carrito.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <h3>${item.nombre}</h3>
            <p>Precio: $${item.precio}</p>
            <p>Gustos: ${item.gustos.join(', ')}</p>
        `;
        cartItemsElement.appendChild(itemElement);
        total += item.precio;
    });

    totalPriceElement.innerText = `Total: $${total.toFixed(2)}`;

    document.getElementById("checkout").addEventListener("click", function() {
        alert("Compra finalizada!");
        localStorage.removeItem("carrito");
        window.location.href = "index.html";
    });
});