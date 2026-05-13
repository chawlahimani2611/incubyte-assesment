const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Connect to MongoDB using the URI from environment variables.
 * Uses different URIs for test vs development/production.
 *
 * @returns {Promise<mongoose.Connection>} The Mongoose connection instance
 */
const connectToDatabase = async () => {
  const mongoURI = process.env.MONGODB_URI || "mongodb+srv://chawlahimani2611:Zxcvbnm098%40%40@salary-management.jd4eifl.mongodb.net/salary-management?retryWrites=true&w=majority";

  try {
    await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB gracefully.
 *
 * @returns {Promise<void>}
 */
const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error.message);
  }
};

module.exports = { connectToDatabase, disconnectDatabase };
