import React, { useState } from 'react';

export default function NoteForm({ onAddNote, isSubmitting }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Form validations
    if (!title.trim() || !subject.trim() || !content.trim()) {
      setError('Please fill in all fields (Title, Subject, and Content).');
      return;
    }

    // Call onSubmit callback
    onAddNote({
      title: title.trim(),
      subject: subject.trim(),
      content: content.trim()
    });

    // Reset Form
    setTitle('');
    setSubject('');
    setContent('');
  };

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Create Study Note</h2>
      
      {error && (
        <div className="form-error-alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="input-group">
        <label htmlFor="note-title-input">Title</label>
        <input
          id="note-title-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Photosynthesis Overview"
          disabled={isSubmitting}
        />
      </div>

      <div className="input-group">
        <label htmlFor="note-subject-input">Subject / Course</label>
        <input
          id="note-subject-input"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g., Biology, Chemistry, Calculus"
          disabled={isSubmitting}
        />
      </div>

      <div className="input-group">
        <label htmlFor="note-content-input">Content</label>
        <textarea
          id="note-content-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write or paste your study notes here..."
          rows="6"
          disabled={isSubmitting}
        ></textarea>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-submit">
        {isSubmitting ? (
          <>
            <span className="spinner-mini"></span>
            <span>Saving Note...</span>
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Note</span>
          </>
        )}
      </button>
    </form>
  );
}
