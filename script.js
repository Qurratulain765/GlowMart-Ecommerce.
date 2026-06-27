window.currentCategory = "all";


document.addEventListener("DOMContentLoaded", function () {


    updateCartCount();


    const search = document.getElementById("search-input");
    if (search) {
        search.addEventListener("keyup", function () {
            runFilters();
        });
    }

    if (document.getElementById("cart-wrapper")) {
        showCart();
    }

    if (document.getElementById("checkout-summary-items")) {
        showCheckoutSummary();
    }

});



function showProductDetail(name, price, desc, image) {

    let oldModal = document.getElementById('productDetailModal');
    if (oldModal) oldModal.remove();

    let modalHTML = `
    <div class="modal fade" id="productDetailModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content rounded-4 border-0 shadow" style="background-color: #fcfaf7;">
                <div class="modal-header border-0 pb-0">
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body pt-0 text-center">
                    <img src="${image}" class="img-fluid rounded-3 mb-3 shadow-sm" style="max-height: 250px; width: 100%; object-fit: cover;">
                    <h4 class="fw-bold text-dark mb-1">${name}</h4>
                    <h5 class="fw-bold mb-3" style="color: #e28f83;">$${price.toFixed(2)}</h5>
                    <p class="text-muted small px-3 mb-4">${desc}</p>
                    <button class="btn btn-rose-pink rounded-pill px-5 py-2 fw-medium" data-bs-dismiss="modal" 
                        onclick="handleAddToCart(Date.now(), '${name}', ${price}, '${image}')">
                        Add To Cart
                    </button>
                </div>
            </div>
        </div>
    </div>`;

    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  
    let myModal = new bootstrap.Modal(document.getElementById('productDetailModal'));
    myModal.show();
}




function filterItems(type) {
    window.currentCategory = type;
    runFilters();
}

function runFilters() {
    const searchInput = document.getElementById("search-input");
    const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const cards = document.querySelectorAll(".product-item");

    cards.forEach(function (card) {
        let title = card.querySelector(".card-title").textContent.toLowerCase();
        let category = card.getAttribute("data-category") || card.dataset.category || "";
        category = category.toLowerCase();

        let matchesSearch = title.includes(searchValue) || category.includes(searchValue);
        let matchesCategory = (window.currentCategory === "all") || (category === window.currentCategory.toLowerCase());

        if (matchesSearch && matchesCategory) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}




function handleAddToCart(id, name, price, image) {
    let cart = JSON.parse(localStorage.getItem("user_cart")) || [];
    let found = false;

    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id == id) {
            cart[i].quantity++;
            found = true;
            break;
        }
    }

    if (!found) {
        cart.push({
            id: id,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }

    localStorage.setItem("user_cart", JSON.stringify(cart));
    updateCartCount();
    alert(name + " added to cart.");
}

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("user_cart")) || [];
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
        total += cart[i].quantity;
    }
    let count = document.getElementById("nav-cart-count");
    if (count) {
        count.innerHTML = total;
    }
}

function showCart() {
    let wrapper = document.getElementById("cart-wrapper");
    let subtotal = document.getElementById("subtotal-price");
    let total = document.getElementById("final-total");

    if (!wrapper) return;

    let cart = JSON.parse(localStorage.getItem("user_cart")) || [];
    wrapper.innerHTML = "";

    if (cart.length == 0) {
        wrapper.innerHTML = `<p class="text-center text-muted my-4">Your cart is currently empty.</p>`;
        if (subtotal) subtotal.innerHTML = "$0.00";
        if (total) total.innerHTML = "$0.00";
        return;
    }

    let bill = 0;
    for (let i = 0; i < cart.length; i++) {
        let item = cart[i];
        let itemTotal = item.price * item.quantity;
        bill += itemTotal;

        wrapper.innerHTML += `
        <div class="row align-items-center border-bottom py-3">
            <div class="col-md-2 text-center">
                <img src="${item.image}" class="img-fluid rounded" style="width:80px;height:80px;object-fit:cover;">
            </div>
            <div class="col-md-3">
                <h6 class="mb-1">${item.name}</h6>
                <small>$${item.price.toFixed(2)}</small>
            </div>
            <div class="col-md-2">
                <input type="number" min="1" value="${item.quantity}" class="form-control" onchange="updateQuantity(${item.id}, this.value)">
            </div>
            <div class="col-md-2">
                <strong>$${itemTotal.toFixed(2)}</strong>
            </div>
            <div class="col-md-3 text-end">
                <button class="btn btn-danger btn-sm" onclick="removeCartItem(${i})">Remove</button>
            </div>
        </div>`;
    }

    if (subtotal) subtotal.innerHTML = "$" + bill.toFixed(2);
    if (total) total.innerHTML = "$" + bill.toFixed(2);
}

function updateQuantity(id, value) {
    let cart = JSON.parse(localStorage.getItem("user_cart")) || [];
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id == id) {
            let qty = parseInt(value);
            if (qty < 1 || isNaN(qty)) qty = 1;
            cart[i].quantity = qty;
            break;
        }
    }
    localStorage.setItem("user_cart", JSON.stringify(cart));
    updateCartCount();
    showCart();
}

function removeCartItem(index) {
    let cart = JSON.parse(localStorage.getItem("user_cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("user_cart", JSON.stringify(cart));
    updateCartCount();
    showCart();
}




function showCheckoutSummary() {
    let summaryBox = document.getElementById("checkout-summary-items");
    let subtotalBox = document.getElementById("checkout-subtotal");
    let totalBox = document.getElementById("checkout-total");

    if (!summaryBox) return; 

    let cart = JSON.parse(localStorage.getItem("user_cart")) || [];
    summaryBox.innerHTML = "";

    if (cart.length === 0) {
        summaryBox.innerHTML = `<p class="text-muted text-center py-2">No items in order.</p>`;
        if (subtotalBox) subtotalBox.innerHTML = "$0.00";
        if (totalBox) totalBox.innerHTML = "$0.00";
        return;
    }

    let bill = 0;
    cart.forEach(function (item) {
        let itemTotal = item.price * item.quantity;
        bill += itemTotal;

        summaryBox.innerHTML += `
            <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                <div>
                    <h6 class="mb-0 small fw-bold">${item.name} <span class="text-muted">x${item.quantity}</span></h6>
                </div>
                <span class="small text-dark fw-semibold">$${itemTotal.toFixed(2)}</span>
            </div>`;
    });

    if (subtotalBox) subtotalBox.innerHTML = "$" + bill.toFixed(2);
    if (totalBox) totalBox.innerHTML = "$" + bill.toFixed(2);
}

function handleCheckout(event) {
    event.preventDefault();

    let name = document.getElementById("bill-name").value.trim();
    let email = document.getElementById("bill-email").value.trim();
    let address = document.getElementById("bill-address").value.trim();
    let city = document.getElementById("bill-city").value.trim();
    let phone = document.getElementById("bill-phone").value.trim();

    if (!name || !email || !address || !city || !phone) {
        alert("Please fill out all the fields before placing the order.");
        return;
    }

    let cart = JSON.parse(localStorage.getItem("user_cart")) || [];
    if (cart.length === 0) {
        alert("Your cart is empty! Add some products first.");
        return;
    }

    alert("Thank you, " + name + "! Your order has been successfully placed via Cash on Delivery.");
    localStorage.removeItem("user_cart");
    window.location.href = "index.html";
}
