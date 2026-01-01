const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * USER SCHEMA
 * Defines the structure of a User document in MongoDB
 */

const UserSchema = new mongoose.Schema({
    // User's full name
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,  // Removes extra spaces
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    
    // User's email (used for login)
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,  // No two users can have same email
        lowercase: true,  // Convert to lowercase
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    
    // User's password (will be hashed)
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false  // Don't return password in queries by default
    },
    
    // Timestamps: createdAt, updatedAt
}, {
    timestamps: true  // Automatically adds createdAt and updatedAt fields
});

/**
 * PRE-SAVE MIDDLEWARE
 * Runs BEFORE saving user to database
 * Hashes the password if it was modified
 */
UserSchema.pre('save', async function(next) {
    // 'this' refers to the user document being saved
    
    // Only hash password if it was modified (or is new)
    if (!this.isModified('password')) {
        return next();  // Skip hashing
    }
    
    try {
        // Generate salt (random string for extra security)
        // 10 = number of rounds (higher = more secure but slower)
        const salt = await bcrypt.genSalt(10);
        
        // Hash the password with the salt
        this.password = await bcrypt.hash(this.password, salt);
        
        console.log(`🔐 Password hashed for user: ${this.email}`);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * INSTANCE METHOD: comparePassword
 * Checks if provided password matches hashed password in database
 * 
 * Usage: const isMatch = await user.comparePassword('password123');
 */
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // bcrypt.compare returns true if passwords match, false otherwise
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

/**
 * INSTANCE METHOD: generateAuthToken
 * Creates a JWT token for authenticated user
 * 
 * Usage: const token = user.generateAuthToken();
 */
UserSchema.methods.generateAuthToken = function() {
    // Create token with user ID as payload
    const token = jwt.sign(
        { 
            id: this._id,           // User ID
            email: this.email       // User email (optional)
        },
        process.env.JWT_SECRET,     // Secret key from .env
        { 
            expiresIn: '7d'         // Token expires in 7 days
        }
    );
    
    return token;
};

/**
 * INSTANCE METHOD: toJSON
 * Removes password from JSON response
 * Runs automatically when user object is sent as JSON
 */
UserSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;  // Remove password field
    return user;
};

/**
 * STATIC METHOD: findByCredentials
 * Finds user by email and verifies password
 * 
 * Usage: const user = await User.findByCredentials(email, password);
 */
UserSchema.statics.findByCredentials = async function(email, password) {
    // Find user by email (include password field)
    const user = await this.findOne({ email }).select('+password');
    
    if (!user) {
        throw new Error('Invalid email or password');
    }
    
    // Check if password matches
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }
    
    return user;
};

// Create and export the User model
const User = mongoose.model('User', UserSchema);

module.exports = User;
