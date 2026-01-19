const withCors = require('../_lib/cors');
const db = require('../_lib/db');
const auth = require('../_lib/auth');

module.exports = withCors(async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Method not allowed' }));
    return;
  }

  const { token, secret } = req.body || {};
  if (!token || !secret) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'token and secret are required' }));
    return;
  }

  await db.connect();
  const ok = await auth.verify2faToken(secret, token);
  res.setHeader('Content-Type', 'application/json');
  if (!ok) {
    res.statusCode = 400;
    res.end(JSON.stringify({ message: 'Invalid 2FA token' }));
    return;
  }

  res.end(JSON.stringify({ message: '2FA verified (dev)' }));
});
