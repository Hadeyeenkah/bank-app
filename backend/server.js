// Vercel entrypoint: export the Express app without calling listen()
// Vercel handles the server lifecycle for serverless functions
const app = require("./src/app");

module.exports = app;