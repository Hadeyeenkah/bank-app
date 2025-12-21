// src/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false // prevents password from being returned
    },

    phone: {
      type: String,
      default: null
    },

    avatarUrl: {
      type: String,
      default: null
    },

    dateOfBirth: {
      type: Date,
      default: null
    },

    balance: {
      type: Number,
      default: 0
    },

    // Email verification
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String,
      default: null
    },
    verificationExpires: {
      type: Date,
      default: null
    },

    // Two-factor authentication (TOTP)
    mfaEnabled: {
      type: Boolean,
      default: false
    },
    mfaSecret: {
      type: String,
      default: null,
      select: false
    },

    // Role-based access control
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },

    // For refresh token login systems
    refreshToken: {
      type: String,
      default: null
    },

    // Example field for transaction history or multiple accounts
    accounts: [
      {
        accountType: { type: String, default: 'checking' },
        accountNumber: { type: String },
        balance: { type: Number, default: 0 }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
