// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');
const LoginAttempt = require('../models/LoginAttempt');
const { generateTokens, setAuthCookies } = require('../utils/tokenUtils');
const { sendVerificationEmail } = require('../utils/email');

// Note: Removed in-memory demo users to enforce MongoDB-backed auth.

// Register new user (strong auth: hashed password, unique email, email verification)
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, phone, dateOfBirth } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() }).catch(() => null);
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Local in-memory fallback removed for login flow; registration remains MongoDB-first.

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const role = email.toLowerCase() === 'admin@aurorabank.com' ? 'admin' : 'user';

    let user = null;
    try {
      user = await User.create({
        email: email.toLowerCase(),
        password: passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        dateOfBirth: dateOfBirth || null,
        balance: 0,
        isVerified: false,
        verificationToken,
        verificationExpires,
        role,
        accounts: [
          { accountType: 'checking', accountNumber: `CHK${Date.now()}`, balance: 1000 },
          { accountType: 'savings', accountNumber: `SAV${Date.now()}`, balance: 0 },
        ],
      });
    } catch (dbError) {
      console.log('❌ Database unavailable during registration:', dbError.message);
      return res.status(500).json({ message: 'Database unavailable. Please try again later.' });
    }

    const origin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
    const apiBase = process.env.API_BASE || 'http://localhost:5000';
    const link = `${apiBase}/api/auth/verify-email?token=${verificationToken}`;
    
    // Try to send email, but don't fail if unavailable
    try {
      await sendVerificationEmail(user.email, link);
    } catch (emailErr) {
      console.log('⚠️  Email service unavailable:', emailErr.message);
    }

    // Issue auth cookies immediately so the user can land in the app post-signup
    const { accessToken, refreshToken } = generateTokens(user._id || user.id);
    setAuthCookies(res, { accessToken, refreshToken });

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      verificationLink: process.env.NODE_ENV === 'production' ? undefined : link,
      user: {
        id: user._id || user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('❌ Register error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error during registration', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// Verify email via token
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Token required' });
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid token' });
    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return res.status(400).json({ message: 'Token expired' });
    }
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationExpires = null;
    await user.save();
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user (enforce email verification; handle MFA if enabled)
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    
    // Check if database is connected
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password').catch(() => null);

    if (!user) {
      try {
        await LoginAttempt.create({
          email: email.toLowerCase(),
          success: false,
          failureReason: 'user_not_found',
          ip: req.ip,
          userAgent: req.headers['user-agent'] || null,
        });
      } catch (_) {}
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      try {
        await LoginAttempt.create({
          email: email.toLowerCase(),
          userId: user._id || null,
          success: false,
          failureReason: 'password_mismatch',
          ip: req.ip,
          userAgent: req.headers['user-agent'] || null,
        });
      } catch (_) {}
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.mfaEnabled) {
      // Issue short-lived MFA challenge token
      const jwtSecret = process.env.JWT_SECRET || 'dev-access-secret-change-me';
      const challengeToken = jwt.sign(
        { userId: user._id || user.id, type: 'mfa' },
        jwtSecret,
        { expiresIn: '5m' }
      );
      try {
        await LoginAttempt.create({
          email: email.toLowerCase(),
          userId: user._id || null,
          success: true,
          failureReason: null,
          ip: req.ip,
          userAgent: req.headers['user-agent'] || null,
        });
      } catch (_) {}
      return res.json({ mfaRequired: true, challengeToken });
    }

    const { accessToken, refreshToken } = generateTokens(user._id || user.id);
    setAuthCookies(res, { accessToken, refreshToken });

    try {
      await LoginAttempt.create({
        email: email.toLowerCase(),
        userId: user._id || null,
        success: true,
        failureReason: null,
        ip: req.ip,
        userAgent: req.headers['user-agent'] || null,
      });
    } catch (_) {}

    res.json({
      message: 'Login successful',
      user: {
        id: user._id || user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error during login', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// Refresh access token from refresh cookie
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const { accessToken } = require('../utils/tokenUtils').generateTokens(decoded.userId);

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });
    res.json({ message: 'Token refreshed' });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// Logout: clear cookies
exports.logout = async (_req, res) => {
  try {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

// Get profile of authenticated user
exports.getProfile = async (req, res) => {
  try {
    // Check MongoDB connection state
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB not connected. State:', mongoose.connection.readyState);
      return res.status(503).json({ 
        message: 'Database connection unavailable',
        details: 'MongoDB is not connected. Please try again later.'
      });
    }

    // Validate req.userId exists
    if (!req.userId) {
      console.error('❌ No userId in request. Auth middleware may have failed.');
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('🔍 Fetching profile for user:', req.userId);
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      console.error('❌ User not found in database:', req.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ Profile fetched successfully for:', user.email);
    res.json({ user });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, avatarUrl, email } = req.body;

    // Only persist fields that were explicitly sent, so an email-only update
    // does not accidentally wipe the stored avatar or names.
    const updateData = {};
    ['firstName', 'lastName', 'phone', 'avatarUrl'].forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Handle email change with uniqueness check
    if (email) {
      const normalizedEmail = email.toLowerCase();
      const current = await User.findById(req.userId).select('email');
      if (!current) return res.status(404).json({ message: 'User not found' });
      if (current.email !== normalizedEmail) {
        const exists = await User.findOne({ email: normalizedEmail });
        if (exists) return res.status(400).json({ message: 'Email already in use' });
        updateData.email = normalizedEmail;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password securely
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Enable 2FA: generate secret and QR
exports.enable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+mfaSecret');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const secret = speakeasy.generateSecret({ name: 'Aurora Bank' });
    user.mfaSecret = secret.base32;
    user.mfaEnabled = false;
    await user.save();

    const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ base32: secret.base32, otpauthUrl: secret.otpauth_url, qrDataUrl });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Confirm 2FA setup
exports.confirm2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.userId).select('+mfaSecret');
    if (!user || !user.mfaSecret) return res.status(400).json({ message: '2FA not initiated' });

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 1,
    });
    if (!verified) return res.status(400).json({ message: 'Invalid 2FA token' });

    user.mfaEnabled = true;
    await user.save();
    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    console.error('Confirm 2FA error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify 2FA during login
exports.verify2FA = async (req, res) => {
  try {
    const { challengeToken, token } = req.body;
    if (!challengeToken || !token) return res.status(400).json({ message: 'Missing parameters' });
    const decoded = jwt.verify(challengeToken, process.env.JWT_SECRET);
    if (decoded.type !== 'mfa') return res.status(400).json({ message: 'Invalid challenge' });

    const user = await User.findById(decoded.userId).select('+mfaSecret');
    if (!user || !user.mfaEnabled || !user.mfaSecret) return res.status(400).json({ message: '2FA not enabled' });

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 1,
    });
    if (!verified) return res.status(401).json({ message: 'Invalid 2FA token' });

    const { accessToken, refreshToken } = generateTokens(user.id);
    setAuthCookies(res, { accessToken, refreshToken });
    res.json({ message: 'MFA verification successful' });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(401).json({ message: 'Invalid or expired challenge' });
  }
};