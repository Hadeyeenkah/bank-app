const mongoose = require('mongoose');

let isConnected = false;

exports.connectDB = async () => {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/securebank';
  try {
    await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('⚠️  MongoDB connection failed:', err.message);
    console.log('Server will continue without database. Install MongoDB or update MONGODB_URI.');
  }
};