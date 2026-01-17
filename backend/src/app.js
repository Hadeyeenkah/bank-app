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

// Trust proxy for production environments (Render, Heroku, Netlify, etc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security headers
app.use(helmet());

// CORS Configuration (match server.js)
const defaultDevOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const productionOrigins = [
  'https://aurorabank.onrender.com',
  // Vercel deployments (frontend and backend can be on same domain or different)
  'https://aurorabank-6c8448dyx-auroras-projects-c3211c64.vercel.app',
  'https://*.vercel.app', // Match all Vercel preview/production deployments
];

const envOrigins = (process.env.CLIENT_ORIGIN || process.env.CLIENT_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultDevOrigins, ...productionOrigins, ...envOrigins]));

const isLocalOrigin = (origin = '') => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
const isRenderOrigin = (origin = '') => /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin);
const isNetlifyOrigin = (origin = '') => /^https:\/\/[a-z0-9-]+\.netlify\.app$/i.test(origin);
const isFirebaseOrigin = (origin = '') => /^https:\/\/[a-z0-9-]+\.(web\.app|firebaseapp\.com)$/i.test(origin);
const isVercelOrigin = (origin = '') => /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (isLocalOrigin(origin) || isRenderOrigin(origin) || isNetlifyOrigin(origin) || isFirebaseOrigin(origin) || isVercelOrigin(origin) || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);

// Serve frontend build in production when running as a standalone server
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const frontendBuildPath = path.join(__dirname, '../../frontend/build');
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ status: 'error', message: 'API route not found' });
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.status(404).json({ status: 'error', message: 'Route not found' });
  });
}

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
