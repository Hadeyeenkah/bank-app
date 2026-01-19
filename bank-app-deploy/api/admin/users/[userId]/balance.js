const withCors = require('../../../_lib/cors');

module.exports = withCors(async (req, res) => {
  const userId = req.query?.userId || (req.url && new URL(req.url, 'http://localhost').searchParams.get('userId'));
  if (req.method === 'PATCH') {
    const body = req.body || {};
    // In a real app, you'd update DB; here we echo success
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Balance updated (dev)', userId, updated: body }));
    return;
  }

  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ balance: 1000.0, userId }));
    return;
  }

  res.statusCode = 405;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Method not allowed' }));
});
