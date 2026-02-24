import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

/* =========================
   CONFIG
========================= */
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

/* =========================
   MIDDLEWARE
========================= */
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
}));
app.use(express.json());

// Serve static files from the build folder
app.use(express.static(path.join(__dirname, "dist")));

/* =========================
   DATABASE
========================= */
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Faith Database Connected");
    seedDatabase(); // Fixed: Now correctly inside the .then block
  })
  .catch((err) => {
    console.error("❌ Database Connection Failed:", err.message);
    process.exit(1);
  });

/* =========================
   SCHEMAS
========================= */
// Add address to user
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "customer" },
  faithPoints: { type: Number, default: 0 },
  wishlist: [String],
  profilePic: { type: String, default: "" },
  address: { type: String, default: "" },
  joinedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Add userId to reviews (to enforce 1 review per user)
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: String,
  description: String,
  image: String,
  rating: { type: Number, default: 5 },
  reviewsCount: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  isHot: Boolean,
  reviews: [{
    userId: String, // NEW: Track who commented
    userName: String,
    rating: Number,
    comment: String, // Changed from 'reflection'
    date: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

// Add delivery data to orders
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String,
  items: [{
    productId: mongoose.Schema.Types.ObjectId,
    name: String,
    quantity: Number,
    price: Number,
  }],
  total: Number,
  status: { type: String, default: "Processing" },
  phoneNumber: String,
  deliveryMethod: String, // NEW
  deliveryDays: Number,   // NEW: e.g. 1, 3, 5
  date: { type: Date, default: Date.now },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
const User = mongoose.model("User", userSchema);
const Order = mongoose.model("Order", orderSchema);

/* =========================
   AUTH MIDDLEWARE
========================= */
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid Token" });
  }
};

/* =========================
   API ROUTES
========================= */
app.get("/api/health", (req, res) => {
  res.json({ status: "online", database: mongoose.connection.readyState === 1 });
});

// --- PRODUCTS ---
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ADD THIS: Create a new product (Admin Only)
app.post("/api/products", authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access required" });
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: "Failed to create product", error: err.message });
  }
});

// ADD THIS: Delete a product (Admin Only)
app.delete("/api/products/:id", authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access required" });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

// --- AUTH ---
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      email, 
      password: hashedPassword, 
      name,
      role: email === "faith@faith" ? "admin" : "customer" // Auto-admin for your email
    });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ user, token });
  } catch {
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found in Sanctuary" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect security key" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ user, token });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/auth/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// --- USERS ---
// ADD THIS: Get all users (Admin Only)
app.get("/api/users", authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access required" });
    const users = await User.find().select("-password");
    res.json(users);
  } catch {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Update a user role (Admin Only)
app.put("/api/users/:id", authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access required" });
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
});

//  Delete a user (Admin Only)
app.delete("/api/users/:id", authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access required" });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

app.put("/api/users/profile-photo", authenticate, async (req, res) => {
  try {
    const { profilePic } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { profilePic }, { new: true });
    res.json(user);
  } catch {
    res.status(500).json({ message: "Failed to update photo" });
  }
});

// --- ORDERS ---
app.post("/api/orders", authenticate, async (req, res) => {
  try {
    const order = new Order({ ...req.body, userId: req.user.id });
    await order.save();
    res.status(201).json(order);
  } catch {
    res.status(500).json({ message: "Order failed" });
  }
});

// ADD THIS: Get ALL orders (Admin Only)
app.get("/api/orders", authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin access required" });
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

app.get("/api/orders/my", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

app.put("/api/orders/:id", authenticate, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(order);
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
});

app.post("/api/products/:id/reviews", authenticate, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    
    // Check if user already reviewed
    const existingReview = product.reviews.find(r => r.userId === req.user.id);
    
    if (existingReview) {
      // Edit existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
    } else {
      // Add new review
      product.reviews.push({ userId: req.user.id, userName: req.user.name, rating, comment });
    }
    
    // Recalculate average rating
    const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
    product.rating = totalRating / product.reviews.length;
    product.reviewsCount = product.reviews.length;
    
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to post comment" });
  }
});


/* =========================
   SEED INITIAL PRODUCTS
========================= */
const seedDatabase = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log("🌱 Sanctuary Empty. Seeding 9 luxury entities...");
      await Product.insertMany([
        {
          name: 'Silk Aurora Gown',
          price: 34500,
          category: 'Women',
          description: 'A fluid silk masterpiece that captures the light of a Nairobi sunrise.',
          image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800',
          rating: 4.9,
          reviewsCount: 240,
          isHot: true,
          stock: 12,
          reviews: []
        },
        {
          name: 'Midnight Velvet Blazer',
          price: 28900,
          category: 'Men',
          description: 'Double-breasted excellence crafted from premium obsidian velvet.',
          image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800',
          rating: 4.8,
          reviewsCount: 156,
          isHot: true,
          stock: 7,
          reviews: []
        },
        {
          name: 'Cyber-Gold Link Bracelet',
          price: 15400,
          category: 'Accessories',
          description: '18k gold interlocking links designed for the modern architect of life.',
          image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800',
          rating: 5.0,
          reviewsCount: 89,
          stock: 45,
          reviews: []
        },
        {
          name: 'Aero-Linen Dress',
          price: 22000,
          category: 'Women',
          description: 'Breathable structured linen that defies the tropical heat.',
          image: 'https://images.unsplash.com/photo-1572804013307-f9a8a97ee04b?q=80&w=800',
          rating: 4.7,
          reviewsCount: 312,
          stock: 20,
          reviews: []
        },
        {
          name: 'Titanium Leather Duffel',
          price: 48000,
          category: 'Accessories',
          description: 'Indestructible full-grain leather for the global traveler.',
          image: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=800',
          rating: 4.9,
          reviewsCount: 67,
          isHot: true,
          stock: 4,
          reviews: []
        },
        {
          name: 'Prism-Tech Sneaker',
          price: 19500,
          category: 'Men',
          description: 'Reflective structural design with reactive cushioning technology.',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
          rating: 4.6,
          reviewsCount: 42,
          stock: 15,
          reviews: []
        },
        {
          name: 'Nebula Silk Scarf',
          price: 8500,
          category: 'Accessories',
          description: 'Hand-dyed ethereal patterns on pure Mulberry silk.',
          image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=800',
          rating: 4.9,
          reviewsCount: 110,
          stock: 30,
          reviews: []
        },
        {
          name: 'Elysian Quartz Watch',
          price: 62000,
          category: 'Accessories',
          description: 'Precision engineering meets divine aesthetic in this limited quartz timepiece.',
          image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800',
          rating: 5.0,
          reviewsCount: 12,
          isHot: true,
          stock: 3,
          reviews: []
        },
        {
          name: 'Solaris Summer Hat',
          price: 7500,
          category: 'Hot Deals',
          description: 'Hand-woven wide-brim hat with UV-shielding fibers.',
          image: 'https://images.unsplash.com/photo-1521316730702-829ad88e7ff7?q=80&w=800',
          rating: 4.5,
          reviewsCount: 95,
          stock: 50,
          reviews: []
        }
      ]);
      console.log("✅ Collection seeded successfully");
    }
  } catch (err) {
    console.error("❌ Seeding error:", err);
  }
};

/* =========================
   FRONTEND ROUTING (SPA)
========================= */
// Fixed: This must be below all /api routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`🚀 Sanctuary Server running on port ${PORT}`);
});
