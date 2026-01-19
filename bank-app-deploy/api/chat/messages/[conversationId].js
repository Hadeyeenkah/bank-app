const withCors = require('../../_lib/cors');

module.exports = withCors(async (req, res) => {
  const convId = req.query?.conversationId || (req.url && new URL(req.url, 'http://localhost').searchParams.get('conversationId')) || req.url.split('/').pop();

  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ messages: [{ id: 'm1', conversationId: convId, text: 'Hello from dev chat', createdAt: new Date().toISOString() }] }));
    return;
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const msg = { id: `m-${Date.now()}`, conversationId: convId, text: body.message || body.text, createdAt: new Date().toISOString() };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Sent (dev)', msg }));
    return;
  }

  res.statusCode = 405;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Method not allowed' }));
});
