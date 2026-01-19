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

  await db.connect();
  const secret = auth.generate2faSecret();
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: '2FA init (dev)', ...secret }));
});
