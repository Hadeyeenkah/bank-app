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

// Dynamic CORS handling: read allowed origins from env or fallbacks
const rawOrigins = process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || '';
const allowedOrigins = rawOrigins.split(',').map(s => s.trim()).filter(Boolean);
// sensible defaults to avoid accidentally blocking common dev hosts
if (allowedOrigins.length === 0) {
  allowedOrigins.push('https://aurorabank-beryl.vercel.app', 'http://localhost:3000', 'http://localhost:5173');
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Trust proxy (needed on Vercel and other proxy environments)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS: allow frontend and local dev origins (configured per request)
app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS not allowed'), false);
  },
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

// Also expose non-/api root for compatibility with older clients
app.get("/auth", (req, res) => {
  res.json({
    status: "success",
    message: "Aurora Bank Backend API (auth root)",
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

// Also mount routes without /api prefix to support deployed frontend requests
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

// Lazy DB connection middleware for serverless environments
// Avoid connecting during module load to prevent cold-start timeouts.
app.use(async (req, res, next) => {
  // Allow quick responses for health and root without DB
  if (req.path === '/api/health' || req.path === '/api' || req.path === '/auth') return next();

  try {
    if (!isDBConnected()) {
      const connected = await connectDB();
      const isDevelopment = process.env.NODE_ENV !== 'production';
      const shouldSeedDemo = isDevelopment && process.env.DEMO_SEED === 'true';
      if (connected && shouldSeedDemo) {
        console.warn('⚠️  DEMO MODE: Seeding demo users (development only)');
        await seedDemoUsers();
      }
      if (connected) console.log('🗄️  Database connected (lazy middleware)');
    }
    return next();
  } catch (e) {
    console.warn('⚠️  DB connect (lazy) failed:', e.message || e);
    return next();
  }
});

module.exports = app;
