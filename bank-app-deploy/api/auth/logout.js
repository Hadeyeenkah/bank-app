const handleCors = require('../_lib/cors');
const { requireAuth } = require('../_lib/auth');

async function logoutHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
}

module.exports = handleCors(requireAuth(logoutHandler));
