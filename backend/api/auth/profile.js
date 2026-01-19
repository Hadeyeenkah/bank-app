function setCorsHeaders(res, origin) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = async function handler(req, res) {
  const allowedOrigin = process.env.FRONTEND_URL || 'https://your-frontend.vercel.app';
  
  setCorsHeaders(res, allowedOrigin);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get token from cookie or authorization header
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // TODO: Verify token and get user data
    // Example: const user = await verifyToken(token);

    // Mock user data
    const user = {
      id: 1,
      email: 'user@example.com',
      name: 'User Name'
    };

    return res.status(200).json({ user });

  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
