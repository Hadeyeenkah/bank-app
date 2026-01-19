const withCors = require('../_lib/cors');
const db = require('../_lib/db');

module.exports = withCors(async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Method not allowed' }));
    return;
  }

  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'currentPassword and newPassword are required' }));
    return;
  }

  await db.connect();
  // In a real app: verify current password and update
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Password changed (dev)' }));
});
