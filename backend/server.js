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

// CORS with credentials for frontend
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
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

