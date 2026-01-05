// src/routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, requireRole } = require('../middleware/authMiddleware');

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', loginValidation, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', protect, authController.logout);
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);
router.post('/change-password', protect, authController.changePassword);

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// User lookup (for transfers)
router.get('/lookup', protect, authController.lookupUser);

// 2FA routes
router.post('/enable-2fa', protect, authController.enable2FA);
router.post('/confirm-2fa', protect, authController.confirm2FA);
router.post('/verify-2fa', authController.verify2FA);

// Example: protect an admin-only endpoint (placeholder)
router.get('/admin-only', protect, requireRole('admin'), (req, res) => {
  res.json({ message: 'Admin access granted' });
});

module.exports = router;