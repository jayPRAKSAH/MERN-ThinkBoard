import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch notes from backend
    axios.get('http://localhost:7000/api/notes')
      .then(response => {
        setNotes(response.data);
      })
      .catch(error => {
        console.error('Error fetching notes:', error);
      });

    // Fetch home message
    axios.get('http://localhost:7000/api/home')
      .then(response => {
        setMessage(response.data);
      })
      .catch(error => {
        console.error('Error fetching message:', error);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🧠 ThinkBoard</h1>
        <p className="tagline">Organize Your Thoughts & Ideas</p>
      </header>

      <main className="container">
        <section className="welcome-section">
          <h2>Welcome to ThinkBoard</h2>
          <p className="message">{message || 'Loading...'}</p>
        </section>

        <section className="notes-section">
          <h2>Your Notes</h2>
          <div className="notes-display">
            <p>{notes || 'Loading notes...'}</p>
          </div>
        </section>

        <section className="features">
          <h2>Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>📝 Create Notes</h3>
              <p>Capture your thoughts instantly</p>
            </div>
            <div className="feature-card">
              <h3>🔍 Search & Filter</h3>
              <p>Find what you need quickly</p>
            </div>
            <div className="feature-card">
              <h3>🎨 Organize</h3>
              <p>Keep everything structured</p>
            </div>
            <div className="feature-card">
              <h3>💾 Save & Sync</h3>
              <p>Access from anywhere</p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>© 2025 ThinkBoard - MERN Stack Application</p>
      </footer>
    </div>
  );
}

export default App;
