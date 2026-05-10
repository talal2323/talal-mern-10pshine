const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // 1. Choose the URL based on the environment
    const dbURI = process.env.NODE_ENV === 'test' 
      ? process.env.MONGO_URI_TEST 
      : process.env.MONGO_URI;

    // 2. Connect to MongoDB
    const conn = await mongoose.connect(dbURI);
    
    // 3. Log which database we are actually using
    const dbType = process.env.NODE_ENV === 'test' ? 'TEST' : 'DEV';
    console.log(`MongoDB Connected [${dbType}]: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;