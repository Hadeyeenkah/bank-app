// Helper function to set CORS headers
function setCorsHeaders(res, origin) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  const allowedOrigin = process.env.FRONTEND_URL || 'https://your-frontend.vercel.app';
  
  setCorsHeaders(res, allowedOrigin);

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // TODO: Add your authentication logic here
    // Example: validate credentials, check database, etc.
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Example validation (replace with your actual logic)
    // const user = await validateUser(email, password);
    
    // For now, mock response
    const user = {
      id: 1,
      email: email,
      name: 'User Name'
    };

    // Set session cookie if needed
    res.setHeader('Set-Cookie', `token=your-jwt-token; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=86400`);

    return res.status(200).json({ 
      success: true, 
      user: user,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
