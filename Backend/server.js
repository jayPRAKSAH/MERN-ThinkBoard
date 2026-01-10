const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
require('dotenv').config();

const app = express();

// Connect to MongoDB Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({ message: "ThinkBoard Backend is running!" });
});

app.get("/api/home", (req, res) => {
    res.send("Hello World from ThinkBoard API!");
});

// Auth routes - register, login, me
app.use('/api/auth', authRoutes);

// Note routes - CRUD operations (all protected)
app.use('/api/notes', noteRoutes);

app.listen(7000, () => {
    console.log("🚀 Server is running on port 7000");
    console.log("📡 API endpoints ready:");
    console.log("   GET    http://localhost:7000/api/notes (Protected)");
    console.log("   POST   http://localhost:7000/api/notes (Protected)");
    console.log("   DELETE http://localhost:7000/api/notes/:id (Protected)");
    console.log("   PUT    http://localhost:7000/api/notes/:id (Protected)");
    console.log("🔐 Auth endpoints:");
    console.log("   POST   http://localhost:7000/api/auth/register");
    console.log("   POST   http://localhost:7000/api/auth/login");
    console.log("   GET    http://localhost:7000/api/auth/me (Protected)");
    console.log("=========================================");
});