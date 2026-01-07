const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();

// Connect to MongoDB Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/api/notes", (req, res) => {
    res.status(200).json({ message: "Fetched all notes" });
});

app.post("/api/notes", (req, res) => {
    const note = req.body;
    console.log(`✅ Note created: "${note.title}" - Content: "${note.content}" - Author: ${note.author}`);
    res.status(201).json({ 
        message: "Note created successfully", 
        note: note 
    });
});

app.delete("/api/notes/:id", (req, res) => {
    const noteId = req.params.id;
    console.log(`🗑️ Note with ID ${noteId} deleted at ${new Date().toLocaleTimeString()}`);
    res.status(200).json({ 
        message: `Note with id ${noteId} has been deleted successfully` 
    });
});

app.get("/api/home", (req, res) => {
    res.send("Hello World from ThinkBoard API!");
});

app.get("/", (req, res) => {
    res.json({ message: "ThinkBoard Backend is running!" });
});

// Auth routes - register, login, me
app.use('/api/auth', authRoutes);

app.listen(7000, () => {
    console.log("🚀 Server is running on port 7000");
    console.log("📡 API endpoints ready:");
    console.log("   GET    http://localhost:7000/api/notes");
    console.log("   POST   http://localhost:7000/api/notes");
    console.log("   DELETE http://localhost:7000/api/notes/:id");
    console.log("🔐 Auth endpoints:");
    console.log("   POST   http://localhost:7000/api/auth/register");
    console.log("   POST   http://localhost:7000/api/auth/login");
    console.log("   GET    http://localhost:7000/api/auth/me");
    console.log("🌐 Home endpoint:");
    console.log("   GET    http://localhost:7000/api/home");        
    console.log("=========================================");   
    
});