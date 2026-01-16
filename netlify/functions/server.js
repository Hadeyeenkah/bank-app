const serverless = require('serverless-http');
const path = require('path');
// import the app from backend/src/app.js
const app = require(path.join(__dirname, '../../backend/src/app'));

module.exports.handler = serverless(app);
