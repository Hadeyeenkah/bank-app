const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
dotenv.config();

const { connectDB } = require("./src/config/database");
const authRoutes = require("./src/routes/authRoutes");
const transactionRoutes = require("./src/routes/transactionRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

const app = express();

// Security headers
app.use(helmet());

// CORS Configuration
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

console.log('🔒 CORS allowed origins:', allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl, same-origin)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        console.log('✅ CORS allowed origin:', origin);
        callback(null, true);
      } else {
        console.log('❌ CORS blocked origin:', origin);
        callback(new Error(`CORS policy: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400, // 24 hours
  })
);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting - more permissive for authenticated API calls
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for real-time features
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for authenticated API requests
    return req.path.startsWith('/api/') && req.cookies?.accessToken;
  },
});
app.use(limiter);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "SecureBank API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found"
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  
  // CORS errors
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      status: "error",
      message: "CORS policy violation",
      details: err.message
    });
  }
  
  // General errors
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error"
  });
});

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  connectDB(); // Connect to database
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});