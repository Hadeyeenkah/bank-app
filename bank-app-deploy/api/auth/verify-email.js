const withCors = require('../_lib/cors');
const db = require('../_lib/db');

module.exports = withCors(async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Method not allowed' }));
    return;
  }

  const token = req.query?.token || (req.url && new URL(req.url, 'http://localhost').searchParams.get('token'));
  if (!token) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Token is required' }));
    return;
  }

  await db.connect();
  // In a real app: verify token and activate account
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Email verified (dev)' }));
});
