const withCors = require('../_lib/cors');

module.exports = withCors(async (req, res) => {
  // Return a simple conversations list for admin
  const conversations = [
    { id: 'conv-1', subject: 'Account inquiry', lastMessage: 'User asked about pending transfer', updatedAt: new Date().toISOString() },
    { id: 'conv-2', subject: 'Card dispute', lastMessage: 'Charge disputed', updatedAt: new Date().toISOString() },
  ];
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ conversations }));
});
