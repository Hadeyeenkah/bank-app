const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
dotenv.config();

const { connectDB, isDBConnected } = require("./src/config/database");
const authRoutes = require("./src/routes/authRoutes");
const transactionRoutes = require("./src/routes/transactionRoutes");
const billRoutes = require("./src/routes/billRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const transferRoutes = require("./src/routes/transferRoutes");
const { seedDemoUsers } = require("./src/utils/seedDemoUsers");

const app = express();

// Trust proxy for production environments (Render, Heroku, etc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security headers
app.use(helmet());

// CORS Configuration
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

const envOrigins = (process.env.CLIENT_ORIGIN || process.env.CLIENT_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultDevOrigins, ...envOrigins]));

const isLocalOrigin = (origin = '') => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl, same-origin)
    if (!origin) return callback(null, true);

    if (isLocalOrigin(origin) || allowedOrigins.includes(origin)) {
      console.log('✅ CORS allowed origin:', origin);
      return callback(null, true);
    }

    console.log('❌ CORS blocked origin:', origin);
    return callback(new Error(`CORS policy: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200,
};

console.log('🔒 CORS allowed origins:', allowedOrigins);

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Parsers - increase limit for image uploads (base64 encoded)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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

// Health check endpoint (moved to /api/health to avoid conflict with frontend)
app.get("/api/health", (req, res) => {
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
app.use("/api/transfers", transferRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

// ============================================
// Serve frontend build in production
// ============================================
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const frontendBuildPath = path.join(__dirname, '../frontend/build');
  
  // Serve static files from React build
  app.use(express.static(frontendBuildPath));
  
  // Serve index.html for all non-API routes (React Router)
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        status: "error",
        message: "API route not found"
      });
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  // 404 handler for development
  app.use((req, res) => {
    res.status(404).json({
      status: "error",
      message: "Route not found"
    });
  });
}

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

let PORT = Number(process.env.PORT) || 5000;
const MAX_PORT_FALLBACK_TRIES = Number(process.env.PORT_FALLBACK_MAX_TRIES || 10);

// Start server after initial DB connection attempt
async function start() {
  const connected = await connectDB();

  // Seed demo users into MongoDB when requested (useful for hosted DBs)
  if (connected && process.env.DEMO_SEED === 'true') {
    await seedDemoUsers();
  }

  let tries = 0;

  const onListening = () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    if (connected || isDBConnected()) {
      console.log('🗄️  Database: connected');
    } else {
      console.log('🗄️  Database: NOT connected (server running without DB)');
    }
  };

  const listenWithFallback = () => {
    const server = app.listen(PORT, onListening);
    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        tries += 1;
        if (tries > MAX_PORT_FALLBACK_TRIES) {
          console.error(`❌ Failed to bind after ${MAX_PORT_FALLBACK_TRIES} attempts. Last attempted port: ${PORT}`);
          console.error('👉 Close the existing process or set a different PORT env var.');
          process.exit(1);
        }
        const nextPort = PORT + 1;
        console.warn(`⚠️  Port ${PORT} in use. Retrying on ${nextPort}...`);
        PORT = nextPort;
        // Try again on the next port
        setTimeout(listenWithFallback, 200);
      } else {
        console.error('❌ Server listen error:', err);
        process.exit(1);
      }
    });
  };

  listenWithFallback();
}

start();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});