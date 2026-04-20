//api.js Handles all backend communication
const API = {

    // Fetch all products
    async getProducts() {
        // backend will handle
        return fetch("https://cartzen-production.up.railway.app/api/products").then(res => res.json());
    },

    // Fetch single product
    async getProduct(id) {
        // backend will handle
        return fetch(`https://cartzen-production.up.railway.app/api/products/${id}`).then(res => res.json());
    },

    // Add product to cart
    async addToCart(productId, qty = 1) {
    const res = await fetch("https://cartzen-production.up.railway.app/api/cart", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            productId: productId,
            qty: qty
        })
    });

    const data = await res.json();
    console.log("Add to cart response:", data);
},

    // Get cart items
    async getCart() {
        // backend will handle
        return fetch("https://cartzen-production.up.railway.app/api/cart").then(res => res.json());
    },

    // Add new product (SELLER)
async addProduct(product) {
    return fetch("https://cartzen-production.up.railway.app/api/products", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
    }).then(res => res.json());
}
};

async function addToWishlist(productId) {
    await fetch("https://cartzen-production.up.railway.app/api/wishlist", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            product_id: "26762e35-5b83-4ccf-b704-af4fe50c8033",
            user_id: "741ee28b-b7ee-45c4-a202-e233c05264d9" // temporary
        })
    });

    alert("Added to wishlist ❤️");
}

async function getWishlist(userId) {
  const res = await fetch(`https://cartzen-production.up.railway.app/api/wishlist?user_id=${userId}`);
  return res.json();
}

async function removeFromWishlist(productId, userId) {
  return fetch("https://cartzen-production.up.railway.app/api/wishlist", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      product_id: productId,
      user_id: userId
    })
  });
}