const mongoose = require('mongoose');

let isConnected = false;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Attempt to connect to MongoDB with retries.
 * Returns true if connected, false otherwise.
 */
exports.connectDB = async () => {
  if (isConnected) return true;

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/securebank';
  const maxRetries = Number(process.env.DB_CONNECT_MAX_RETRIES || 5);
  const retryDelayMs = Number(process.env.DB_CONNECT_RETRY_MS || 2000);

  // Helper: mask credentials for logging and extract host/db
  const maskUriForLog = (raw) => {
    try {
      // Basic masking for mongodb URIs
      return raw
        .replace(/:\/\/[\w.-]+:[^@]+@/i, '://****:****@')
        .replace(/\?[^#]+$/, ''); // drop query params
    } catch (_) {
      return 'mongodb://****:****@<host>/<db>';
    }
  };

  console.log('🗄️  MongoDB URI (sanitized):', maskUriForLog(uri));

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(uri, {
        autoIndex: true,
        serverSelectionTimeoutMS: 10000,
      });
      isConnected = true;
      console.log(`✅ MongoDB connected (attempt ${attempt}/${maxRetries})`);
      return true;
    } catch (err) {
      const canRetry = attempt < maxRetries;
      console.error(`⚠️  MongoDB connection failed (attempt ${attempt}/${maxRetries}):`, err.message);
      if (canRetry) {
        console.log(`⏳ Retrying in ${retryDelayMs}ms...`);
        await sleep(retryDelayMs);
      }
    }
  }

  console.warn('🚫 Unable to connect to MongoDB after retries.');
  console.warn('👉 Server will continue without database. Install MongoDB or set MONGODB_URI.');
  return false;
};

exports.isDBConnected = () => isConnected;