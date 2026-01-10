import React, { useState, useEffect, useContext, useCallback } from 'react';
import './App.css';
import axios from 'axios';
import { AuthContext } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const { user, loading, logout, isAuthenticated } = useContext(AuthContext);
  const [showRegister, setShowRegister] = useState(false);
  const [notes, setNotes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', color: '#FFE5B4' });
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [notesLoaded, setNotesLoaded] = useState(false);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const fetchNotes = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.get('http://localhost:7000/api/notes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(response.data);
      setNotesLoaded(true);
      
      // Only show welcome message on first load
      if (!notesLoaded && user) {
        showNotification(`✅ Welcome back, ${user.name}! Loaded ${response.data.length} notes.`, 'success');
      }
    } catch (error) {
      console.error('Fetch notes error:', error);
      console.error('Error response:', error.response?.data);
      
      // If user not found (401), force logout
      if (error.response?.status === 401) {
        console.log('❌ Auth failed, logging out...');
        setTimeout(() => {
          logout();
        }, 500);
      }
    }
  }, [showNotification, notesLoaded, user, logout]);

  useEffect(() => {
    if (isAuthenticated && user && !notesLoaded) {
      fetchNotes();
    }
  }, [isAuthenticated, user, notesLoaded, fetchNotes]);

  // Reset notesLoaded when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setNotesLoaded(false);
      setNotes([]);
    }
  }, [isAuthenticated]);

  const addNote = async () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      try {
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        
        const response = await axios.post(
          'http://localhost:7000/api/notes',
          { title: newNote.title, content: newNote.content, color: newNote.color },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotes([response.data.note, ...notes]);
        showNotification(`📝 Note "${response.data.note.title || 'Untitled'}" created successfully!`, 'success');
        setNewNote({ title: '', content: '', color: '#FFE5B4' });
        setShowAddForm(false);
      } catch (error) {
        console.error('Add note error:', error);
        console.error('Error details:', error.response?.data);
        
        // If user not found or auth error, force logout and fresh login
        if (error.response?.status === 401) {
          showNotification('🔒 Session invalid. Please login again.', 'error');
          setTimeout(() => {
            logout();
          }, 1500);
        } else {
          const errorMsg = error.response?.data?.error || '❌ Failed to create note';
          showNotification(errorMsg, 'error');
        }
      }
    }
  };

  const deleteNote = async (id) => {
    const noteToDelete = notes.find(note => note._id === id);
    try {
      await axios.delete(`http://localhost:7000/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotes(notes.filter(note => note._id !== id));
      showNotification(`🗑️ Note "${noteToDelete?.title || 'Untitled'}" deleted successfully!`, 'success');
    } catch (error) {
      console.error('Delete note error:', error);
      showNotification(error.response?.data?.error || '❌ Failed to delete note', 'error');
    }
  };

  const clearAllNotes = async () => {
    if (window.confirm(`Are you sure you want to delete all ${notes.length} notes? This cannot be undone!`)) {
      try {
        await Promise.all(
          notes.map(note => 
            axios.delete(`http://localhost:7000/api/notes/${note._id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
          )
        );
        setNotes([]);
        showNotification('🗑️ All notes cleared successfully!', 'success');
      } catch (error) {
        console.error('Clear all notes error:', error);
        showNotification('❌ Failed to clear all notes', 'error');
      }
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return showRegister ? (
      <Register onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <Login onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  return (
    <div className="App">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <header className="App-header">
        <div className="header-content">
          <h1>📝 ThinkBoard</h1>
          <p className="tagline">Organize Your Thoughts & Ideas</p>
        </div>
        <div className="user-info">
          <span className="welcome-text">👋 {user?.name}</span>
          <button className="logout-btn" onClick={logout}>Logout</button>
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
          <div style={{ display: 'flex', gap: '10px' }}>
            {notes.length > 0 && (
              <button 
                className="logout-btn" 
                onClick={clearAllNotes}
                style={{ background: '#ff4757' }}
              >
                🗑️ Clear All
              </button>
            )}
            <button className="add-note-btn" onClick={() => setShowAddForm(!showAddForm)}>
              ➕ Add Note
            </button>
          </div>
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
              <div key={note._id} className="note-card" style={{ background: note.color }}>
                <div className="note-header">
                  <h3>{note.title || 'Untitled'}</h3>
                  <button className="delete-btn" onClick={() => deleteNote(note._id)}>×</button>
                </div>
                <p className="note-content">{note.content}</p>
                <div className="note-footer">
                  <span className="note-date">📅 {new Date(note.createdAt).toLocaleDateString()}</span>
                  <span className="note-id">ID: {note._id.slice(-6)}</span>
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
