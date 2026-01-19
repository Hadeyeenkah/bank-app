const withCors = require('../../../_lib/cors');

module.exports = withCors(async (req, res) => {
  const userId = req.query?.userId || (req.url && new URL(req.url, 'http://localhost').searchParams.get('userId'));

  if (req.method === 'POST') {
    const body = req.body || {};
    // In a real app you'd persist message; we echo
    const msg = { id: `msg-${Date.now()}`, message: body.message, createdAt: new Date().toISOString() };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Sent (dev)', msg }));
    return;
  }

  if (req.method === 'GET') {
    // Return existing messages for user
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ messages: [{ id: 'msg-1', message: 'Welcome!', createdAt: new Date().toISOString() }] }));
    return;
  }

  res.statusCode = 405;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Method not allowed' }));
});
