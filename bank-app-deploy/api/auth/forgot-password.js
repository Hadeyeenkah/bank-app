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

  const { email } = req.body || {};
  if (!email) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Email is required' }));
    return;
  }

  await db.connect();
  const token = auth.generateResetToken();
  const resetBase = process.env.RESET_BASE || 'http://localhost:3000';
  const link = `${resetBase}/reset-password?token=${token}`;
  await auth.sendResetEmail(email, link);

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Password reset link sent (dev)', resetLink: link }));
});
