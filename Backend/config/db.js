const mongoose = require('mongoose');

/**
 * WHAT THIS DOES:
 * Connects our Node.js app to MongoDB database
 * 
 * WHY ASYNC:
 * Database connection takes time (network request)
 * We use async/await to wait for connection
 * 
 * ERROR HANDLING:
 * try/catch - if connection fails, we see the error
 */

const connectDB = async () => {
    try {
        // Connect to MongoDB using connection string from .env
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database Name: ${conn.connection.name}`);
        
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // Exit process with failure
        process.exit(1);
    }
};

/**
 * MONGOOSE CONNECTION EVENTS:
 * Listen for connection status changes
 */

// When MongoDB gets disconnected
mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
});

// When MongoDB reconnects
mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
});

// Export so we can use in server.js
module.exports = connectDB;
