const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/api/notes", (req, res) => {
    res.send("You got 20 notes");
});

app.get("/api/home", (req, res) => {
    res.send("Hello World from ThinkBoard API!");
});

app.get("/", (req, res) => {
    res.json({ message: "ThinkBoard Backend is running!" });
});

app.listen(7000, () => {
    console.log("Server is running on port 7000");
});