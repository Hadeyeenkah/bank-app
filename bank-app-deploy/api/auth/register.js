const { connectDB } = require('../_lib/db');
const handleCors = require('../_lib/cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function registerHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const User = require('../_models/User');
    
    const { email, password, firstName, lastName, phone, dateOfBirth } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'All required fields must be provided' 
      });
    }

    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(409).json({ 
        status: 'error', 
        message: 'User already exists' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      balance: 0,
      accounts: [
        { accountType: 'checking', balance: 0 },
        { accountType: 'savings', balance: 0 }
      ]
    });

    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountNumber: user.accountNumber,
        balance: user.balance
      }
    });

  } catch (error) {
    console.error('Register error:', error && error.message);
    // If DB is unavailable in development, return a fake created user so frontend can be tested
    if (process.env.NODE_ENV !== 'production') {
      const user = { _id: `u-${Date.now()}`, email: req.body?.email || 'dev@example.com', firstName: req.body?.firstName || '', lastName: req.body?.lastName || '', role: 'user' };
      const verificationLink = `${process.env.RESET_BASE || 'http://localhost:3000'}/verify-email?token=dev-${Date.now()}`;
      return res.status(201).json({ status: 'success', token: `dev-token-${user._id}`, user, verificationLink });
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

module.exports = handleCors(registerHandler);
