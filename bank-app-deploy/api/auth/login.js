const { connectDB } = require('../_lib/db');
const handleCors = require('../_lib/cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function loginHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const User = require('../_models/User');
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Email and password are required' 
      });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid credentials' 
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid credentials' 
      });
    }

    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accountNumber: user.accountNumber,
        balance: user.balance,
        accounts: user.accounts
      }
    });

  } catch (error) {
    console.error('Login error:', error && error.message);
    // In development, fall back to a simple dev login so the frontend can be tested without DB
    if (process.env.NODE_ENV !== 'production') {
      const { email, password } = req.body || {};
      const demoAdmin = { _id: 'u-admin', email: 'admin@aurorabank.com', firstName: 'Admin', lastName: 'Aurora', role: 'admin' };
      const demoUser = { _id: 'u-1', email: 'jamie@example.com', firstName: 'Jamie', lastName: 'Doe', role: 'user' };
      if ((email === demoAdmin.email && password === 'admin') || (email === demoUser.email && password === 'password')) {
        const user = email === demoAdmin.email ? demoAdmin : demoUser;
        const token = `dev-token-${user._id}`;
        return res.status(200).json({ status: 'success', token, user });
      }
      return res.status(401).json({ status: 'error', message: 'Invalid credentials (dev)' });
    }
    res.status(500).json({ status: 'error', message: 'Internal server error', details: error.message });
  }
}

module.exports = handleCors(loginHandler);
