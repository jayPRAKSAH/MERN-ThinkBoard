const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// MIDDLEWARE: Verify JWT token and attach user to request
// Copy of auth middleware from auth.js
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided. Please login.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found. Please login again.' });
    }

    req.user = user;
    req.token = token;
    next();
    
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

// ROUTE 1: Get all notes for logged-in user
// GET /api/notes
// Protected route - requires authentication
router.get('/', auth, async (req, res) => {
  try {
    // Find all notes where user field matches logged-in user's ID
    const notes = await Note.find({ user: req.user._id })
      .sort({ createdAt: -1 }); // Sort by newest first
    
    console.log(`📖 User ${req.user.name} fetched ${notes.length} notes`);
    
    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// ROUTE 2: Create a new note
// POST /api/notes
// Protected route - requires authentication
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, color } = req.body;

    // Validate input
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Note content is required' });
    }

    // Create new note with user's ID
    const note = new Note({
      title: title || '',
      content,
      color: color || '#FFE5B4',
      user: req.user._id // Link note to current user
    });

    await note.save();

    console.log(`✅ Note created: "${note.title || 'Untitled'}" by ${req.user.name}`);

    res.status(201).json({
      message: 'Note created successfully',
      note
    });

  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// ROUTE 3: Delete a note by ID
// DELETE /api/notes/:id
// Protected route - requires authentication
router.delete('/:id', auth, async (req, res) => {
  try {
    const noteId = req.params.id;

    // Find note by ID AND make sure it belongs to current user
    const note = await Note.findOne({
      _id: noteId,
      user: req.user._id // Security: only allow deleting own notes
    });

    if (!note) {
      return res.status(404).json({ 
        error: 'Note not found or you do not have permission to delete it' 
      });
    }

    await Note.deleteOne({ _id: noteId });

    console.log(`🗑️ Note deleted: "${note.title || 'Untitled'}" (ID: ${noteId}) by ${req.user.name}`);

    res.json({
      message: 'Note deleted successfully',
      note
    });

  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// ROUTE 4: Update a note by ID (Bonus feature)
// PUT /api/notes/:id
// Protected route - requires authentication
router.put('/:id', auth, async (req, res) => {
  try {
    const noteId = req.params.id;
    const { title, content, color } = req.body;

    // Find note by ID AND make sure it belongs to current user
    const note = await Note.findOne({
      _id: noteId,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({ 
        error: 'Note not found or you do not have permission to update it' 
      });
    }

    // Update fields if provided
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (color !== undefined) note.color = color;

    await note.save();

    console.log(`✏️ Note updated: "${note.title || 'Untitled'}" by ${req.user.name}`);

    res.json({
      message: 'Note updated successfully',
      note
    });

  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

module.exports = router;
