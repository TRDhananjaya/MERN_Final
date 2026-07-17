import React, { useState, useEffect } from 'react';
import API from './api';
import NoteForm from './components/NoteForm';
import NoteCard from './components/NoteCard';

// Beautiful sample notes for fallback & demo
const MOCK_INITIAL_NOTES = [
  {
    id: "mock-1",
    _id: "mock-1",
    title: "Mitochondrial Function & Cellular Respiration",
    subject: "Cell Biology",
    content: "The mitochondrion is the powerhouse of the cell. It generates most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy. Respiration consists of glycolysis, the Krebs cycle, and the electron transport chain. Oxygen acts as the final electron acceptor in the ETC, producing water.",
    summary: "Mitochondria produce ATP (cellular energy currency) through three main stages: Glycolysis, Krebs Cycle, and Electron Transport Chain (ETC). Oxygen is essential as the terminal electron acceptor in ETC.",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
  },
  {
    id: "mock-2",
    _id: "mock-2",
    title: "Newtonian Mechanics & Kepler's Laws",
    subject: "Physics",
    content: "Newton's laws of motion describe the relationship between a body and the forces acting upon it. 1. Law of Inertia. 2. F = ma. 3. Action and Reaction. Kepler's laws describe planetary motion: orbits are ellipses, equal areas in equal times, and harmonic law relates period and semi-major axis.",
    summary: "Covers Newton's 3 Laws of Motion (Inertia, Force/Acceleration, Action-Reaction) and Kepler's 3 Laws of Planetary Motion governing orbital shapes, speeds, and periods.",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
  }
];

export default function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSummarizingMap, setIsSummarizingMap] = useState({});
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [apiError, setApiError] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Sync theme with body class
  useEffect(() => {
    document.body.className = theme === 'light' ? 'light-theme' : '';
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch Notes on mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const response = await API.get('/notes');
      setNotes(response.data || []);
      setIsUsingMock(false);
    } catch (err) {
      console.warn("Backend API `/api/notes` unavailable, falling back to local storage.", err);
      // Try local storage
      const local = localStorage.getItem('studymate_notes');
      if (local) {
        try {
          setNotes(JSON.parse(local));
        } catch (e) {
          setNotes(MOCK_INITIAL_NOTES);
        }
      } else {
        setNotes(MOCK_INITIAL_NOTES);
        localStorage.setItem('studymate_notes', JSON.stringify(MOCK_INITIAL_NOTES));
      }
      setIsUsingMock(true);
      setApiError("Backend API disconnected. Using local database fallback.");
    } finally {
      setLoading(false);
    }
  };

  // Add Note Handler
  const handleAddNote = async (noteData) => {
    setIsSubmitting(true);
    try {
      if (isUsingMock) {
        // Create mock note
        const newNote = {
          id: 'mock-' + Date.now(),
          _id: 'mock-' + Date.now(),
          ...noteData,
          createdAt: new Date().toISOString()
        };
        const updated = [newNote, ...notes];
        setNotes(updated);
        localStorage.setItem('studymate_notes', JSON.stringify(updated));
      } else {
        const response = await API.post('/notes', noteData);
        if (response.data) {
          setNotes(prev => [response.data, ...prev]);
        }
      }
    } catch (err) {
      console.error("Failed to add note", err);
      alert("Error adding note to server. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Note Handler
  const handleDeleteNote = (id) => {
    setDeleteTargetId(id);
  };

  const confirmDeleteNote = async (id) => {
    try {
      if (isUsingMock) {
        const updated = notes.filter(n => (n._id || n.id) !== id);
        setNotes(updated);
        localStorage.setItem('studymate_notes', JSON.stringify(updated));
      } else {
        await API.delete(`/notes/${id}`);
        setNotes(prev => prev.filter(n => (n._id || n.id) !== id));
      }
    } catch (err) {
      console.error("Failed to delete note", err);
      alert("Error deleting note from server. Try again.");
    } finally {
      setDeleteTargetId(null);
    }
  };

  // Update Note Handler
  const handleUpdateNote = async (id, updatedData) => {
    try {
      if (isUsingMock) {
        const updated = notes.map(n => (n._id || n.id) === id ? { ...n, ...updatedData } : n);
        setNotes(updated);
        localStorage.setItem('studymate_notes', JSON.stringify(updated));
      } else {
        const response = await API.put(`/notes/${id}`, updatedData);
        if (response.data) {
          setNotes(prev => prev.map(n => (n._id || n.id) === id ? response.data : n));
        }
      }
    } catch (err) {
      console.error("Failed to update note", err);
      alert("Error updating note on server. Try again.");
    }
  };

  // AI Summarization Handler (Proactive Hook for Part 3 & 4!)
  const handleSummarizeNote = async (id) => {
    setIsSummarizingMap(prev => ({ ...prev, [id]: true }));
    try {
      if (isUsingMock) {
        // Simulate AI request
        await new Promise(resolve => setTimeout(resolve, 1500));
        const noteToUpdate = notes.find(n => (n._id || n.id) === id);
        if (noteToUpdate) {
          const summaryText = `[AI Summary] Detailed breakdown of "${noteToUpdate.title}": Focuses on key study terminology, core definitions, and structured logic for the subject "${noteToUpdate.subject}". Ideal for flashcard preparation.`;
          const updated = notes.map(n => 
            (n._id || n.id) === id ? { ...n, summary: summaryText } : n
          );
          setNotes(updated);
          localStorage.setItem('studymate_notes', JSON.stringify(updated));
        }
      } else {
        const response = await API.post(`/notes/${id}/summarize`);
        if (response.data) {
          setNotes(prev => prev.map(n => 
            (n._id || n.id) === id ? { ...n, summary: response.data.summary } : n
          ));
        }
      }
    } catch (err) {
      console.error("AI Summarization failed", err);
      alert("Error calling AI service. Check API logs.");
    } finally {
      setIsSummarizingMap(prev => ({ ...prev, [id]: false }));
    }
  };

  // AI Quiz Handler (Bonus)
  const handleGenerateQuiz = async (id) => {
    setIsSummarizingMap(prev => ({ ...prev, ['quiz-'+id]: true }));
    try {
      if (isUsingMock) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const noteToUpdate = notes.find(n => (n._id || n.id) === id);
        if (noteToUpdate) {
          const quizText = `1. What is the subject of this note?\nA) ${noteToUpdate.subject}\nB) Unknown\n[Answer: A]`;
          const updated = notes.map(n => 
            (n._id || n.id) === id ? { ...n, quiz: quizText } : n
          );
          setNotes(updated);
          localStorage.setItem('studymate_notes', JSON.stringify(updated));
        }
      } else {
        const response = await API.post(`/notes/${id}/quiz`);
        if (response.data) {
          setNotes(prev => prev.map(n => 
            (n._id || n.id) === id ? { ...n, quiz: response.data.quiz } : n
          ));
        }
      }
    } catch (err) {
      console.error("AI Quiz generation failed", err);
      alert("Error calling AI service for Quiz. Check API logs.");
    } finally {
      setIsSummarizingMap(prev => ({ ...prev, ['quiz-'+id]: false }));
    }
  };

  // Client-side search filtering
  const filteredNotes = notes.filter(note => {
    const titleMatch = note.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const subjectMatch = note.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || subjectMatch;
  });

  return (
    <div className="app-container">
      {/* Background Glow Blobs */}
      <div className="glow-blob blob-1"></div>
      <div className="glow-blob blob-2"></div>

      {/* Dashboard Header */}
      <header className="app-header">
        <div className="app-logo">
          <svg className="logo-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h1>StudyMate</h1>
        </div>
        <div className="header-actions">
          <a href="../landing/index.html" className="btn-back-home">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Landing Page</span>
          </a>
          <button 
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} 
            className="theme-toggle-btn"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Connection Fallback Notice */}
      {apiError && (
        <div className="connection-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>{apiError}</span>
          <button onClick={fetchNotes} className="btn-retry">Retry API</button>
        </div>
      )}

      {/* Dashboard Main Layout */}
      <main className="dashboard-grid">
        {/* Left Side: Create Form */}
        <section className="form-sidebar">
          <NoteForm onAddNote={handleAddNote} isSubmitting={isSubmitting} />
        </section>

        {/* Right Side: List and Search */}
        <section className="notes-section">
          <div className="search-bar-container">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes by Title or Subject..."
              className="search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="btn-clear-search">Clear</button>
            )}
          </div>

          {/* Notes display */}
          {loading ? (
            <div className="loader-container">
              <div className="loading-spinner"></div>
              <p>Fetching your study notes...</p>
            </div>
          ) : filteredNotes.length > 0 ? (
            <div className="notes-list-grid">
              {filteredNotes.map(note => (
                <NoteCard 
                  key={note._id || note.id} 
                  note={note} 
                  onDelete={handleDeleteNote}
                  onSummarize={handleSummarizeNote}
                  onUpdate={handleUpdateNote}
                  onGenerateQuiz={handleGenerateQuiz}
                  isSummarizing={isSummarizingMap[note._id || note.id]}
                  isGeneratingQuiz={isSummarizingMap['quiz-'+(note._id || note.id)]}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state-card">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h3>No notes yet — add your first one!</h3>
              <p>Type a note title, course subject, and core learnings in the left panel to build your AI knowledge base.</p>
            </div>
          )}
        </section>
      </main>

      {/* Custom Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Study Note?</h3>
            <p>Are you sure you want to permanently delete this study note? This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setDeleteTargetId(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={() => confirmDeleteNote(deleteTargetId)} className="btn btn-danger">Delete Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
