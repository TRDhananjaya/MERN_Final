import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import Note from "./models/Note.js";

dotenv.config();
const apiKey = process.env.GEMINI_API_KEY;

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully");
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:", error);
    });

// Routes
app.get("/", (req, res) => {
    res.send("Backend is running");
});

app.get("/api/test", (req, res) => {
    res.json({ message: "Frontend connected successfully!" });
});

// GET all notes
app.get("/api/notes", async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST new note with validation
app.post("/api/notes", async (req, res) => {
    try {
        const { title, subject, content } = req.body;
        
        // Input Validation
        if (!title || !title.trim() || !content || !content.trim()) {
            return res.status(400).json({ error: "Title and Content are required fields." });
        }

        const newNote = new Note({
            title: title.trim(),
            subject: subject ? subject.trim() : "General",
            content: content.trim()
        });

        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (error) {
        console.error("Error creating note:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// DELETE note by ID
app.delete("/api/notes/:id", async (req, res) => {
    try {
        const deletedNote = await Note.findByIdAndDelete(req.params.id);
        if (!deletedNote) {
            return res.status(404).json({ error: "Note not found." });
        }
        res.json({ message: "Note deleted successfully." });
    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});