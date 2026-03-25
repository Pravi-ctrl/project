const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup MongoDB Connection String
// Uses Atlas or Remote URI if deployed, otherwise falls back to local Desktop instance
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/retech';

// Middleware
app.use(cors());
app.use(express.json());

// --- Mongoose Models ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    id: { type: Number, default: Date.now },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    condition: { type: String, required: true },
    location: { type: String, required: true },
    seller: { type: String, required: true },
    description: { type: String, default: "A great pre-owned item." },
    imagePath: { type: String, default: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&q=80&w=800" },
    postedAt: { type: String, default: "Just now" }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);

// --- Connect to MongoDB ---
mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB Desktop successfully!');
        
        // Seed database if empty
        const count = await Product.countDocuments();
        if (count === 0) {
            console.log('Seeding initial mock data to MongoDB...');
            const seedData = [
                { id: 1, title: "Apple iPhone 13 Pro - 256GB", price: 650, category: "phones", condition: "Like New", location: "New York, NY", seller: "Alex M." },
                { id: 2, title: "MacBook Air M1 2020", price: 750, category: "laptops", condition: "Good", location: "San Francisco, CA", seller: "Sarah J." }
            ];
            await Product.insertMany(seedData);
        }
    })
    .catch((err) => {
        console.error('❌ Failed to connect to MongoDB. Is MongoDB installed and running?', err.message);
    });


// --- API ROUTES ---

// 1. GET all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 }); // Newest first
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch from MongoDB." });
    }
});

// 2. POST a new product (Sell)
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        newProduct.id = Date.now();
        newProduct.postedAt = "Just now";
        
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(500).json({ error: "Failed to save to MongoDB." });
    }
});

// 2.5 DELETE a product (For User Profile)
app.delete('/api/products/:id', async (req, res) => {
    try {
        const deletedItem = await Product.findOneAndDelete({ id: Number(req.params.id) });
        if (!deletedItem) {
            return res.status(404).json({ error: "Product not found." });
        }
        res.status(200).json({ success: true, message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete item." });
    }
});

// 3. Register User
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: "Missing credentials" });
        
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ error: "Username already exists" });
        
        const newUser = new User({ username, password });
        await newUser.save();
        
        res.status(201).json({ id: newUser._id, username: newUser.username });
    } catch (err) {
        res.status(500).json({ error: "Failed to register via MongoDB" });
    }
});

// 4. Login User
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        
        res.status(200).json({ id: user._id, username: user.username });
    } catch (err) {
        res.status(500).json({ error: "Failed to login via MongoDB" });
    }
});

// Serve frontend static files
app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`🚀 Node Server running at http://localhost:${PORT}`);
});
