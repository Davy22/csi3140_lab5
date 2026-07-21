const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));

// Requirement: Hardcoded data source (at least 4 objects with 4+ fields)
let books = [
    { id: 1, date: "May 12, 2026", title: "And Then There Were None", author: "Agatha Christie", genre: "Classic Whodunit", time: "6:00 PM - 7:30 PM", room: "CRX 440-442" },
    { id: 2, date: "May 19, 2026", title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", genre: "Nordic Noir", time: "6:00 PM - 7:30 PM", room: "CRX 440-442" },
    { id: 3, date: "May 26, 2026", title: "In the Woods", author: "Tana French", genre: "Psychological Thriller", time: "6:00 PM - 7:30 PM", room: "CRX 440-442" },
    { id: 4, date: "June 2, 2026", title: "The Big Sleep", author: "Raymond Chandler", genre: "Hard-Boiled Noir", time: "5:30 PM - 7:00 PM", room: "CRX 440-442" }
];

app.get("/api/status", function (req, res) {
    res.json({ message: "Lab 4 API is running" });
});

// Endpoint 1: GET all resources
app.get("/api/books", (req, res) => {
    res.status(200).json(books);
});

// Endpoint 2: GET a specific resource by ID
app.get("/api/books/:id", (req, res) => {
    const bookId = parseInt(req.params.id);
    const book = books.find(b => b.id === bookId);
    
    if (!book) {
        // Requirement: 404 Not Found handling
        return res.status(404).json({ error: "Book not found." });
    }
    res.status(200).json(book);
});

// Endpoint 3: POST to create a new resource
app.post("/api/books", (req, res) => {
    const { date, title, author, genre, time, room } = req.body;
    
    // Requirement: Server-side validation & 400 Bad Request
    if (!title || !author || !genre) {
        return res.status(400).json({ error: "Title, author, and genre are required." });
    }

    const newBook = {
        id: books.length > 0 ? books[books.length - 1].id + 1 : 1,
        date: date || "TBD",
        title,
        author,
        genre,
        time: time || "TBD",
        room: room || "TBD"
    };
    
    books.push(newBook);
    res.status(201).json(newBook);
});

// Endpoint 4: DELETE a resource
app.delete("/api/books/:id", (req, res) => {
    const bookId = parseInt(req.params.id);
    const bookIndex = books.findIndex(b => b.id === bookId);

    if (bookIndex === -1) {
        return res.status(404).json({ error: "Book not found to delete." });
    }

    books.splice(bookIndex, 1);
    res.status(200).json({ message: "Book deleted successfully." });
});

app.listen(port, function () {
    console.log(`Server running on http://localhost:${port}`);
});