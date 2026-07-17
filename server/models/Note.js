import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        default: "General",
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    summary: {
        type: String,
        default: "",
        trim: true
    },
    quiz: {
        type: String,
        default: "",
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Note = mongoose.model("Note", noteSchema);

export default Note;
