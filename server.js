const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;
const SECRET_KEY = "secret123";

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let users = [
    { id: 1, username: "admin", password: bcrypt.hashSync("admin123", 10), role: "admin" },
    { id: 2, username: "alice", password: bcrypt.hashSync("user123", 10), role: "user" }
];

const items = ["Apple", "Banana", "Orange"];

// HOME
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/items", (req, res) => {
    res.json(items);
});

app.post("/items", (req, res) => {
    const { item } = req.body;
    if (!item || typeof item !== "string" || item.trim() === "") {
        return res.status(400).json({ error: "Item is required" });
    }
    items.push(item.trim());
    res.status(201).json(items);
});

// REGISTER
app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;

    const existing = users.find(u => u.username === username);
    if (existing) {
        return res.status(400).json({ error: "User exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    users.push({
        id: users.length + 1,
        username,
        password: hashed,
        role: "user"
    });

    res.json({ message: "Registered successfully" });
});

// LOGIN
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(user, SECRET_KEY);

    res.json({ token, user });
});

// AUTH middleware
function authenticate(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) return res.status(401).json({ error: "No token" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
}

// PROFILE
app.get("/api/profile", authenticate, (req, res) => {
    res.json(req.user);
});

// ADMIN ONLY
app.get("/api/admin", authenticate, (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Not allowed" });
    }

    res.json({ message: "Welcome Admin!" });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});