document.addEventListener("DOMContentLoaded", function() {
    const cartItemsElement = document.getElementById("cart-items");
    const totalPriceElement = document.getElementById("total-price");
    const checkoutTotalEfectivoElement = document.getElementById("checkout-total-efectivo");
    const checkoutTotalTransferenciaElement = document.getElementById("checkout-total-transferencia");
    
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let totalEfectivo = 0;
    let totalTransferencia = 0;
    let totalItems = 0;
    
    carrito.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        
        const gustosArray = Object.entries(item.gustos)
            .filter(([key, value]) => value > 0)
            .map(([key, value]) => `<li class="gusto-item">${key} (${value})</li>`); // Usar <li> para la lista
        
        itemElement.innerHTML = `
            <h3>${item.nombre}</h3>
            <p>Precio Efectivo: $${item.precioEfectivo}</p>
            <p>Precio Transferencia: $${item.precioTransferencia}</p>
            <ul class="gustos-list">${gustosArray.join('')}</ul>  </ul>
        `;
        cartItemsElement.appendChild(itemElement);
    
        // Asegúrate de que los precios sean números
        const precioEfectivo = Number(item.precioEfectivo);
        const precioTransferencia = Number(item.precioTransferencia);
        if (!isNaN(precioEfectivo) && !isNaN(precioTransferencia)) {
            totalEfectivo += precioEfectivo * (item.cantidad || 1);
            totalTransferencia += precioTransferencia * (item.cantidad || 1);
            totalItems++;
        }
    });
    
    totalPriceElement.innerText = `Total Efectivo: $${totalEfectivo.toFixed(2)} | Total Transferencia: $${totalTransferencia.toFixed(2)}`;
    checkoutTotalEfectivoElement.innerText = `Total Efectivo: $${totalEfectivo.toFixed(2)}`;
    checkoutTotalTransferenciaElement.innerText = `Total Transferencia: $${totalTransferencia.toFixed(2)}`;
    
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