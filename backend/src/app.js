const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();

const { connectDB, isDBConnected } = require(path.join(__dirname, "config", "database"));
const authRoutes = require(path.join(__dirname, "routes", "authRoutes"));
const transactionRoutes = require(path.join(__dirname, "routes", "transactionRoutes"));
const billRoutes = require(path.join(__dirname, "routes", "billRoutes"));
const notificationRoutes = require(path.join(__dirname, "routes", "notificationRoutes"));
const adminRoutes = require(path.join(__dirname, "routes", "adminRoutes"));
const transferRoutes = require(path.join(__dirname, "routes", "transferRoutes"));
const chatRoutes = require(path.join(__dirname, "routes", "chatRoutes"));
const { seedDemoUsers } = require(path.join(__dirname, "utils", "seedDemoUsers"));

const app = express();

// Custom CORS headers for Vercel frontend and to handle preflight
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://aurorabank-beryl.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Trust proxy for production environments (Render, Heroku, Netlify, etc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security headers
app.use(helmet());

// CORS: allow frontend and local dev origins (configured per request)
app.use(cors({
  origin: [
    'https://aurorabank-beryl.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/api/') && req.cookies?.accessToken,
});
app.use(limiter);

// Health
app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "SecureBank API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root API route for Vercel
app.get("/api", (req, res) => {
  res.json({
    status: "success",
    message: "Aurora Bank Backend API",
    docs: "https://github.com/your-org/your-repo#readme"
  });
});

// Routes
app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/transfers", transferRoutes);
app.use("/bills", billRoutes);
app.use("/notifications", notificationRoutes);
app.use("/admin", adminRoutes);
app.use("/chat", chatRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ status: 'error', message: 'CORS policy violation', details: err.message });
  }
  res.status(err.status || 500).json({ status: 'error', message: err.message || 'Internal server error' });
});

// Connect DB for serverless / function invocations
// SECURITY: Only seed demo users in development mode
(async () => {
  try {
    const connected = await connectDB();
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const shouldSeedDemo = isDevelopment && process.env.DEMO_SEED === 'true';
    
    if (connected && shouldSeedDemo) {
      console.warn('⚠️  DEMO MODE: Seeding demo users (development only)');
      await seedDemoUsers();
    }
    if (connected) console.log('🗄️  Database connected (app.js)');
  } catch (e) {
    console.warn('⚠️  DB connect from app.js failed:', e.message || e);
  }
})();

module.exports = app;
