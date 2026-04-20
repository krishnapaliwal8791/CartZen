require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

// Supabase setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const USER_ID = "741ee28b-b7ee-45c4-a202-e233c05264d9";
// TEST route
app.get("/", (req, res) => {
  res.send("API running");
});

// 🔥 GET ALL PRODUCTS
app.get("/api/products", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        title,
        price,
        image_url,
        description,
        sellers ( store_name )
      `);

    if (error) throw error;

    // Transform data for frontend
    const formatted = data.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      image_url: p.image_url,
      description: p.description,
      seller: p.sellers?.store_name || "Unknown Seller"
    }));

    res.json(formatted);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/api/cart", async (req, res) => {
  try {
    const { productId, qty } = req.body;

    // Check if product already in cart
    const { data: existing } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", USER_ID)
      .eq("product_id", productId)
      .single();

    if (existing) {
      // Update quantity
      const { error } = await supabase
        .from("cart")
        .update({
          quantity: existing.quantity + qty
        })
        .eq("id", existing.id);

      if (error) throw error;

    } else {
      // Insert new item
      const { error } = await supabase
        .from("cart")
        .insert([
          {
            user_id: USER_ID,
            product_id: productId,
            quantity: qty
          }
        ]);

      if (error) throw error;
    }

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cart update failed" });
  }
});

app.get("/api/cart", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("cart")
      .select(`
        id,
        quantity,
        products (
          title,
          price,
          image_url
        )
      `)
      .eq("user_id", USER_ID);

    if (error) throw error;

    const formatted = data.map(item => ({
      id: item.id,
      title: item.products.title,
      price: item.products.price,
      image: item.products.image_url,
      quantity: item.quantity
    }));

    res.json(formatted);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});


app.put("/api/cart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const { error } = await supabase
      .from("cart")
      .update({ quantity })
      .eq("id", id);

    if (error) throw error;

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

app.delete("/api/cart/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("cart")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});


app.post("/api/wishlist", async (req, res) => {
    console.log("BODY:", req.body);

    const { user_id, product_id } = req.body;

    const { data, error } = await supabase
        .from("wishlist")
        .insert([{ user_id, product_id }])
        .select(); // 👈 ADD THIS (important)

    if (error) {
        console.error("SUPABASE ERROR FULL:", JSON.stringify(error, null, 2));
        return res.status(500).json(error);
    }

    console.log("INSERT SUCCESS:", data);
    res.json(data);
});

app.get("/api/wishlist", async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "user_id required" });
  }

  const { data, error } = await supabase
    .from("wishlist")
    .select(`
      id,
      product_id,
      products (
        id,
        title,
        price,
        image_url
      )
    `)
    .eq("user_id", user_id);

  if (error) {
    console.error("Wishlist fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch wishlist" });
  }

  res.json(data);
});

app.delete("/api/wishlist", async (req, res) => {
  const { user_id, product_id } = req.body;

  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("user_id", user_id)
    .eq("product_id", product_id);

  if (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ error: "Delete failed" });
  }

  res.json({ success: true });
});

const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post("/api/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100, // ₹ → paise
      currency: "INR",
      receipt: "order_" + Date.now(),
    });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Order failed" });
  }
});


const crypto = require("crypto");

app.post("/api/verify-payment", (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Step 1: create body string
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    // Step 2: generate expected signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // Step 3: compare
    if (expectedSignature === razorpay_signature) {
      return res.json({ success: true });
    } else {
      return res.status(400).json({ success: false });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification error" });
  }
});


// START SERVER
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

