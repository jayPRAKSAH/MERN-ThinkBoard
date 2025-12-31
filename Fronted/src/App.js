import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [notes, setNotes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', color: '#FFE5B4' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // For now, using dummy data since backend doesn't have notes API yet
    const dummyNotes = [
      { id: 1, title: 'Welcome to ThinkBoard', content: 'Start organizing your thoughts!', color: '#FFE5B4', date: new Date().toLocaleDateString() },
      { id: 2, title: 'Project Ideas', content: 'Build a MERN stack app', color: '#B4E7FF', date: new Date().toLocaleDateString() },
      { id: 3, title: 'To Do', content: 'Complete the frontend design', color: '#FFB4E5', date: new Date().toLocaleDateString() }
    ];
    setNotes(dummyNotes);
  }, []);

  const addNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      const note = {
        id: Date.now(),
        ...newNote,
        date: new Date().toLocaleDateString()
      };
      setNotes([...notes, note]);
      setNewNote({ title: '', content: '', color: '#FFE5B4' });
      setShowAddForm(false);
    }
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>🧠 ThinkBoard</h1>
          <p className="tagline">Organize Your Thoughts & Ideas</p>
        </div>
      </header>

      <main className="container">
        <div className="toolbar">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="add-note-btn" onClick={() => setShowAddForm(!showAddForm)}>
            ➕ Add Note
          </button>
        </div>

        {showAddForm && (
          <div className="add-note-form">
            <input
              type="text"
              placeholder="Note Title"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="note-title-input"
            />
            <textarea
              placeholder="Write your thoughts here..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className="note-content-input"
              rows="4"
            />
            <div className="form-actions">
              <div className="color-picker">
                <span>Color: </span>
                <button className="color-btn" style={{ background: '#FFE5B4' }} onClick={() => setNewNote({ ...newNote, color: '#FFE5B4' })}></button>
                <button className="color-btn" style={{ background: '#B4E7FF' }} onClick={() => setNewNote({ ...newNote, color: '#B4E7FF' })}></button>
                <button className="color-btn" style={{ background: '#FFB4E5' }} onClick={() => setNewNote({ ...newNote, color: '#FFB4E5' })}></button>
                <button className="color-btn" style={{ background: '#B4FFB4' }} onClick={() => setNewNote({ ...newNote, color: '#B4FFB4' })}></button>
                <button className="color-btn" style={{ background: '#FFD4B4' }} onClick={() => setNewNote({ ...newNote, color: '#FFD4B4' })}></button>
              </div>
              <div className="action-btns">
                <button className="cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button className="save-btn" onClick={addNote}>Save Note</button>
              </div>
            </div>
          </div>
        )}

        <div className="notes-grid">
          {filteredNotes.length === 0 ? (
            <div className="empty-state">
              <h2>📝 No notes yet</h2>
              <p>Click "Add Note" to create your first thought!</p>
            </div>
          ) : (
            filteredNotes.map(note => (
              <div key={note.id} className="note-card" style={{ background: note.color }}>
                <div className="note-header">
                  <h3>{note.title || 'Untitled'}</h3>
                  <button className="delete-btn" onClick={() => deleteNote(note.id)}>×</button>
                </div>
                <p className="note-content">{note.content}</p>
                <div className="note-footer">
                  <span className="note-date">{note.date}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <footer>
        <p>© 2025 ThinkBoard - MERN Stack Application | {notes.length} Notes</p>
      </footer>
    </div>
  );
}

export default App;
