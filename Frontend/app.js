

// app.js Initialize homepage
async function initHome() {
  if (!State.user || !State.user.id) {
    console.error("User not initialized");
    return;
}
    State.products = await API.getProducts(); // backend will handle
    const wishlist = await getWishlist(State.user.id);
    State.wishlist = wishlist;
    renderProductGrid(State.products);
}

// Initialize product page
async function initProductPage() {
    const id = new URLSearchParams(window.location.search).get("id");

    const product = await API.getProduct(id); // backend will handle
    renderProductDetail(product);
}

// Initialize cart page
async function initCart() {
    State.cart = await API.getCart(); // backend will handle
    renderCart(State.cart);
}

// Navigate to product page
function goToProduct(id) {
    window.location.href = `product.html?id=${id}`;
}

// Add to cart action
async function addToCart(id) {
    console.log("Adding product:", id);

    await API.addToCart(id, 1);

    alert("Added to cart");
}



window.changeQty = async function(id, newQty) {
  if (newQty <= 0) {
    removeItem(id);
    return;
  }

  await fetch(`https://cartzen-production.up.railway.app/api/cart/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity: newQty })
  });

  loadCart();
};

window.removeItem = async function(id) {
  await fetch(`https://cartzen-production.up.railway.app/api/cart/${id}`, {
    method: "DELETE"
  });

  loadCart();
};

window.loadCart = async function() {
  const res = await fetch("https://cartzen-production.up.railway.app/api/cart");
  const data = await res.json();

  renderCart(data);
};

window.onload = function() {
  if (typeof initHome === "function") {
    initHome(); // homepage
  }

  if (typeof loadCart === "function") {
    loadCart(); // cart page
  }
};

async function loadWishlist() {
  const userId = "741ee28b-b7ee-45c4-a202-e233c05264d9";

  const data = await getWishlist(userId);
  console.log("Wishlist:", data);

  renderWishlist(data);
}

// run only on wishlist page
if (window.location.pathname.includes("wishlist.html")) {
  loadWishlist();
}

async function toggleWishlist(productId) {
  const userId = State.user.id;

  // check if already in wishlist
  const wishlist = await getWishlist(userId);
  State.wishlist = wishlist;

  const exists = wishlist.some(item => item.product_id === productId);

  if (exists) {
    await removeFromWishlist(productId, userId);
    alert("Removed from wishlist 💔");
  } else {
    await addToWishlist(productId);
    alert("Added to wishlist ❤️");
  }
  State.wishlist = await getWishlist(userId);
  renderProductGrid(State.products);
}


async function payNow() {
  // Step 1: create order from backend
  const res = await fetch("https://cartzen-production.up.railway.app/api/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ amount: 1 }) // ₹1 for demo
  });

  const order = await res.json();

  // Step 2: open Razorpay checkout
  const options = {
    key: "rzp_live_SfqRGtlGHjtITY", // ⚠️ only KEY_ID here
    amount: order.amount,
    currency: "INR",
    order_id: order.id,
    name: "CartZen",
    description: "Demo Payment",

    handler: function (response) {
      console.log("Payment Success:", response);
      alert("Payment Successful!");
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
}