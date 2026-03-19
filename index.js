const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// middleware to parse JSON
app.use(express.json());

// serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// sample data for hands-on activity
let items = ["Apple", "Banana", "Orange"];

// home route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// GET route from the PDF
app.get("/about", (req, res) => {
    res.send("About Us");
});

// POST route example from the PDF
app.post("/submit", (req, res) => {
    const data = req.body;
    res.send(`Received: ${JSON.stringify(data)}`);
});

// hands-on activity routes
app.get("/items", (req, res) => {
    res.json(items);
});

app.post("/items", (req, res) => {
    const newItem = req.body.item;
    if (newItem && newItem.trim() !== "") {
        items.push(newItem.trim());
    }
    res.json(items);
});

// error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});