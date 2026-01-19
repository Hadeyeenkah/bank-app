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

  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Token and newPassword are required' }));
    return;
  }

  await db.connect();
  const ok = await auth.verifyResetToken(token);
  if (!ok) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Invalid or expired token' }));
    return;
  }

  // In a real app: find user by token, set new password
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Password has been reset (dev)' }));
});
