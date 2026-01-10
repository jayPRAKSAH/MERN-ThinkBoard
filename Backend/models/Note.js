const mongoose = require('mongoose');

// Define Note Schema - structure of each note in database
const noteSchema = new mongoose.Schema({
  // Note title
  title: {
    type: String,
    required: false,
    trim: true
  },
  
  // Note content/body
  content: {
    type: String,
    required: true,
    trim: true
  },
  
  // Note color for UI
  color: {
    type: String,
    default: '#FFE5B4'
  },
  
  // Reference to the User who created this note
  // This connects each note to a specific user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // References the User model
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create and export the Note model
const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
