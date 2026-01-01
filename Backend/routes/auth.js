const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// MIDDLEWARE: Verify JWT token and attach user to request
// This runs before protected routes to check if user is logged in
const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header: "Bearer <token>"
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No token provided');
    }

    // Verify token and extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID (token contains user._id)
    const user = await User.findById(decoded._id);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Attach user to request object so routes can use it
    req.user = user;
    req.token = token;
    next(); // Continue to the route handler
    
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

// ROUTE 1: Register a new user
// POST /api/auth/register
// Body: { name, email, password }
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Please provide name, email, and password' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email already registered' 
      });
    }

    // Create new user (password auto-hashes via pre-save hook)
    const user = new User({ name, email, password });
    await user.save();

    // Generate JWT token for immediate login
    const token = await user.generateAuthToken();

    // Send back user info and token
    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(), // Excludes password
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ 
      error: error.message || 'Registration failed' 
    });
  }
});

// ROUTE 2: Login existing user
// POST /api/auth/login
// Body: { email, password }
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Please provide email and password' 
      });
    }

    // Find user and verify password (using our static method)
    const user = await User.findByCredentials(email, password);

    // Generate new JWT token
    const token = await user.generateAuthToken();

    // Send back user info and token
    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ 
      error: 'Invalid email or password' 
    });
  }
});

// ROUTE 3: Get current user profile
// GET /api/auth/me
// Requires: Authorization header with Bearer token
router.get('/me', auth, async (req, res) => {
  // The auth middleware already verified the token
  // and attached the user to req.user
  res.json({
    user: req.user.toJSON()
  });
});

module.exports = router;
