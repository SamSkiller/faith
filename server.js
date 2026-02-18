
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/faithshop';

// --- Schemas ---

const productSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  category: String,
  description: String,
  image: String,
  rating: { type: Number, default: 5 },
  reviewsCount: { type: Number, default: 0 },
  stock: Number,
  soldCount: { type: Number, default: 0 },
  isHot: Boolean,
  isNew: Boolean,
  reviews: [{
    userName: String,
    rating: Number,
    comment: String,
    date: String
  }]
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'customer' },
  faithPoints: { type: Number, default: 100 },
  wishlist: [String],
  joinedAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  items: Array,
  total: Number,
  status: { type: String, default: 'Processing' },
  phoneNumber: String,
  date: { type: String, default: () => new Date().toLocaleString() }
});

const Product = mongoose.model('Product', productSchema);
const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);

// --- Routes ---

app.get('/api/health', (req, res) => res.json({ status: 'online', database: mongoose.connection.readyState === 1 }));

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Database access failed' });
  }
});

app.post('/api/auth/sync', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      if (password && user.password !== password) return res.status(401).json({ message: 'Invalid Key' });
      return res.json(user);
    }
    user = new User({ email, password: password || 'faith_temp_key', name });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Auth sync failed' });
  }
});

app.get('/api/orders', async (req, res) => {
  const orders = await Order.find().sort({ date: -1 });
  res.json(orders);
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    for (const item of order.items) {
      await Product.findOneAndUpdate(
        { $or: [{ id: item.id }, { _id: item.id }] }, 
        { $inc: { stock: -item.quantity, soldCount: item.quantity } }
      );
    }
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Order processing failed' });
  }
});

// --- Initialization & Seeding ---

const seedDatabase = async () => {
  const count = await Product.countDocuments();
  if (count === 0) {
    console.log('Seeding initial luxury collection...');
    // Initial products from constants.ts (shortened for brevity here)
    const initialProducts = [
      { id: '1', name: 'Silk Aurora Gown', price: 34500, category: 'Women', stock: 12, isHot: true, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800' },
      { id: '2', name: 'Midnight Velvet Blazer', price: 28900, category: 'Men', stock: 7, isHot: true, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800' }
      // Add more as needed
    ];
    await Product.insertMany(initialProducts);
    console.log('Sanctuary collection seeded successfully.');
  }
};

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Faith Database Connected.');
    await seedDatabase();
    app.listen(PORT, () => console.log(`Sanctuary Server active on port ${PORT}`));
  })
  .catch(err => console.error('Database Connection Refused. Check MONGODB_URI.'));
