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

const app = express();

// Security headers
app.use(helmet());

// CORS with credentials for frontend. Supports comma-separated origins for prod/local.
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

console.log('🔒 CORS allowed origins:', allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow same-origin/non-browser
      const allowed = allowedOrigins.includes(origin);
      if (!allowed) {
        console.log('❌ CORS blocked origin:', origin);
      }
      return allowed ? callback(null, true) : callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Parsers
app.use(express.json());
app.use(cookieParser());

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use(limiter);

// Health check
app.get("/", (req, res) => {
  res.send("SecureBank API running...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

const PORT = process.env.PORT || 5000;

// Start server immediately, connect to DB in background
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  connectDB(); // Non-blocking
});

