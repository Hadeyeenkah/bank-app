const { connectDB } = require('../_lib/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../_models/User');

module.exports = async function handler(req, res) {
  // CORS: reflect request origin to support credentials
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role || 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accountNumber: user.accountNumber,
        balance: user.balance,
        accounts: user.accounts,
      },
    });
  } catch (error) {
    console.error('Login error:', error && error.message);
    // Development fallback for local testing
    if (process.env.NODE_ENV !== 'production') {
      const { email, password } = req.body || {};
      const demoAdmin = { _id: 'u-admin', email: 'admin@aurorabank.com', firstName: 'Admin', lastName: 'Aurora', role: 'admin' };
      const demoUser = { _id: 'u-1', email: 'jamie@example.com', firstName: 'Jamie', lastName: 'Doe', role: 'user' };
      if ((email === demoAdmin.email && password === 'admin') || (email === demoUser.email && password === 'password')) {
        const user = email === demoAdmin.email ? demoAdmin : demoUser;
        const token = `dev-token-${user._id}`;
        return res.status(200).json({ success: true, token, user });
      }
      return res.status(401).json({ error: 'Invalid credentials (dev)' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};
