// Vercel Serverless entrypoint: reuse the existing Express app
const app = require('../backend/src/app');

// Add root route for Vercel API info
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Aurora Bank Backend API is running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      transactions: '/api/transactions/*',
      transfers: '/api/transfers/*',
      bills: '/api/bills/*',
      notifications: '/api/notifications/*',
      admin: '/api/admin/*',
      chat: '/api/chat/*'
    }
  });
});

// Export Express app for Vercel (@vercel/node)
module.exports = app;
