const serverless = require('serverless-http');
// Import the app from backend/src/app.js
// From /netlify/functions/server.js, go up 2 levels to root, then into /backend/src/app.js
const app = require(require('path').resolve(__dirname, '../../backend/src/app'));

module.exports.handler = serverless(app);
