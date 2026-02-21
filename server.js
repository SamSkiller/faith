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
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: String,
  description: String,
  image: String,
  rating: { type: Number, default: 5 },
  reviewsCount: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
  isHot: Boolean,
  isNew: Boolean,
  reviews: [{
    userName: String,
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "customer" },
  faithPoints: { type: Number, default: 100 },
  wishlist: [String],
  joinedAt: { type: Date, default: Date.now },
}, { timestamps: true });

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

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name });
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
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ user, token });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

/* =========================
   SEED INITIAL PRODUCTS
========================= */
const seedDatabase = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log("🌱 Seeding initial collection...");
      await Product.insertMany([
        {
          name: "Silk Aurora Gown",
          price: 34500,
          category: "Women",
          stock: 12,
          isHot: true,
          image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800",
        },
        {
          name: "Midnight Velvet Blazer",
          price: 28900,
          category: "Men",
          stock: 7,
          isHot: true,
          image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800",
        },
      ]);
      console.log("✅ Collection seeded");
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
