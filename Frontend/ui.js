// ui.js Reusable Product Card
function ProductCard(product) {
    const isWishlisted = State.wishlist?.some(
        item => item.product_id === product.id
    );

    return `
    <div class="card" onclick="goToProduct('${product.id}')">

        <!-- Wishlist Icon -->
        <div class="wishlist" onclick="event.stopPropagation(); toggleWishlist('${product.id}')">
            ${isWishlisted ? '❤️' : '♡'}
        </div>

        <img src="${product.image_url}" />
        <h3>${product.title}</h3>
        <p class="price">₹${product.price}</p>
        <p class="seller">${product.seller || "Unknown Seller"}</p>

        <button onclick="event.stopPropagation(); addToCart('${product.id}')">
            Add to Cart
        </button>
    </div>
    `;
}

// Render product grid
function renderProductGrid(products) {
    const container = document.getElementById("products");
    if (!container) return;

    container.innerHTML = products.map(ProductCard).join("");
}

// ui.js Render product detail page
function renderProductDetail(product) {
    document.getElementById("productDetail").innerHTML = `
        <div class="product-layout">

            <!-- Image -->
            <img src="${product.image_url}" />

            <!-- Details -->
            <div>
                <h2>${product.title}</h2>
                <p class="price">₹${product.price}</p>
                <p class="seller">${product.seller}</p>
                <p>${product.description}</p>

                <button onclick="addToCart('${product.id}')">Add to Cart</button>
                <button class="secondary">Wishlist</button>
            </div>
        </div>
    `;
}

// Render cart items
function renderCart(cart) {
    const container = document.getElementById("cartItems");
    let total = 0;

    if (!container) return;

    container.innerHTML = "";

    cart.forEach(item => {
        total += item.price * item.quantity;

        container.innerHTML += `
<div class="cart-item">

  <img src="${item.image}" class="cart-img" />

  <div class="cart-info">
    <h3>${item.title}</h3>
    <p>₹${item.price}</p>

    <div class="qty-controls">
      <button onclick="changeQty('${item.id}', ${item.quantity - 1})">-</button>
      <span>${item.quantity}</span>
      <button onclick="changeQty('${item.id}', ${item.quantity + 1})">+</button>
    </div>

    <button class="remove-btn" onclick="removeItem('${item.id}')">
      Remove
    </button>
  </div>

  <div class="cart-item-total">
    ₹${item.price * item.quantity}
  </div>

</div>
`;
    });

    // Total section
    const totalContainer = document.getElementById("total");

    if (totalContainer) {
        totalContainer.innerHTML = `
            <div class="cart-summary">
                <h2>Total: ₹${total}</h2>
                <button class="checkout-btn" onclick="payNow()">Checkout</button>
            </div>
        `;
    }
}

function renderWishlist(items) {
  const container = document.getElementById("wishlistItems");

  container.innerHTML = items.map(item => {
    const product = item.products;

    return `
      <div class="card">
        <img src="${product.image_url}" />
        <h3>${product.title}</h3>
        <p>₹${product.price}</p>
      </div>
    `;
  }).join("");
}