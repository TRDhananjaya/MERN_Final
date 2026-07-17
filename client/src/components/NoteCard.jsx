import React, { useState } from 'react';

export default function NoteCard({ note, onDelete, onSummarize, onUpdate, onGenerateQuiz, isSummarizing, isGeneratingQuiz }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: note.title, subject: note.subject, content: note.content });

  // Format Date beautifully
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get dynamic colors based on subject
  const getSubjectColorClass = (subj) => {
    const s = subj?.toLowerCase() || '';
    if (s.includes('math') || s.includes('calc')) return 'subject-math';
    if (s.includes('sci') || s.includes('phys') || s.includes('chem') || s.includes('bio')) return 'subject-science';
    if (s.includes('hist') || s.includes('social') || s.includes('lit')) return 'subject-humanities';
    if (s.includes('code') || s.includes('dev') || s.includes('comp') || s.includes('tech')) return 'subject-tech';
    return 'subject-default';
  };

  const handleSaveEdit = () => {
    onUpdate(note._id || note.id, editData);
    setIsEditing(false);
  };

  return (
    <div className="note-card">
      <div className="note-header">
        <span className={`subject-badge ${getSubjectColorClass(note.subject)}`}>
          {note.subject || 'General'}
        </span>
        <span className="note-date">{formatDate(note.createdAt || note.date)}</span>
      </div>
      
      {isEditing ? (
        <div className="note-edit-form">
          <input 
            className="form-input" 
            value={editData.title} 
            onChange={(e) => setEditData({...editData, title: e.target.value})} 
            placeholder="Title" 
          />
          <input 
            className="form-input" 
            value={editData.subject} 
            onChange={(e) => setEditData({...editData, subject: e.target.value})} 
            placeholder="Subject" 
          />
          <textarea 
            className="form-textarea" 
            value={editData.content} 
            onChange={(e) => setEditData({...editData, content: e.target.value})} 
            placeholder="Content" 
            rows="4"
          />
          <div className="note-actions" style={{marginTop: '10px', justifyContent: 'flex-start', gap: '8px'}}>
            <button className="btn btn-primary" onClick={handleSaveEdit}>Save</button>
            <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="note-title">{note.title}</h3>
          <p className="note-content">{note.content}</p>

          {/* AI Summary Section */}
          {note.summary && (
            <div className="note-summary-box">
              <div className="summary-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>AI Key Takeaways</span>
              </div>
              <p className="summary-text" style={{whiteSpace: 'pre-wrap'}}>{note.summary}</p>
            </div>
          )}

          {/* AI Quiz Section */}
          {note.quiz && (
            <div className="note-summary-box" style={{background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)'}}>
              <div className="summary-header" style={{color: '#60a5fa'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span>AI Quiz</span>
              </div>
              <p className="summary-text" style={{whiteSpace: 'pre-wrap'}}>{note.quiz}</p>
            </div>
          )}

          <div className="note-actions">
            {onSummarize && !note.summary && (
              <button 
                onClick={() => onSummarize(note._id || note.id)} 
                disabled={isSummarizing}
                className="btn-summarize"
                title="Summarize with AI"
              >
                {isSummarizing ? (
                  <span className="spinner-mini"></span>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                    <span>AI Summary</span>
                  </>
                )}
              </button>
            )}

            {onGenerateQuiz && !note.quiz && (
              <button 
                onClick={() => onGenerateQuiz(note._id || note.id)} 
                disabled={isGeneratingQuiz}
                className="btn-summarize"
                style={{background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa'}}
                title="Generate AI Quiz"
              >
                {isGeneratingQuiz ? (
                  <span className="spinner-mini" style={{borderTopColor: '#60a5fa'}}></span>
                ) : (
                  <>
                    <span>Generate Quiz</span>
                  </>
                )}
              </button>
            )}

            <button 
              onClick={() => setIsEditing(true)} 
              className="btn-delete"
              style={{color: '#a1a1aa', background: 'transparent'}}
              title="Edit Note"
            >
              <span>Edit</span>
            </button>
            
            <button 
              onClick={() => onDelete(note._id || note.id)} 
              className="btn-delete"
              aria-label="Delete note"
              title="Delete Note"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
