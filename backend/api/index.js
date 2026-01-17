// api/index.js - Vercel serverless entry point
// Using absolute paths for reliable module resolution
// Build: 2026-01-17 08:21 UTC - Force cache invalidation
const path = require("path");
const app = require(path.join(__dirname, "..", "src", "app"));

// Export for Vercel serverless
module.exports = app;
