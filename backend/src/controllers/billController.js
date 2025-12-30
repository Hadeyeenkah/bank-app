// src/controllers/billController.js
const Bill = require('../models/Bill');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Pay a bill - creates both bill record and transaction
exports.payBill = async (req, res) => {
  try {
    console.log('📝 Bill payment request:', req.body);
    const { payee, amount, category, accountNumber, fromAccount, note, dueDate } = req.body;
    const userId = req.userId;

    console.log('👤 User ID:', userId);

    // Validate user ID
    if (!userId) {
      console.log('❌ User not authenticated');
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
    }

    // Validate required fields
    if (!payee || !amount || amount <= 0) {
      console.log('❌ Invalid payee or amount');
      return res.status(400).json({
        status: 'error',
        message: 'Payee name and valid amount are required',
      });
    }

    console.log('✅ Validation passed, fetching user...');

    console.log('✅ Validation passed, fetching user...');

    // Get user to check balance
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    console.log('✅ User found:', user.email);
    console.log('💰 User balance:', user.balance);
    console.log('📊 User accounts:', user.accounts);

    // Initialize accounts array if it doesn't exist
    if (!user.accounts || user.accounts.length === 0) {
      user.accounts = [
        { accountType: 'checking', balance: user.balance || 0 },
        { accountType: 'savings', balance: 0 }
      ];
    }

    const accountBalance = fromAccount === 'savings' 
      ? user.accounts?.find(a => a.accountType === 'savings')?.balance || 0
      : user.accounts?.find(a => a.accountType === 'checking')?.balance || 0;
    
    if (accountBalance < amount) {
      return res.status(400).json({
        status: 'error',
        message: `Insufficient funds in ${fromAccount}. Available: $${accountBalance.toFixed(2)}`,
      });
    }

    // Generate unique reference
    const reference = `BILL-${userId}-${Date.now()}`;

    // Create transaction record
    const transaction = await Transaction.create({
      userId: userId,
      amount: -amount,
      description: `Bill Payment: ${payee}`,
      category: category || 'Bills',
      accountType: fromAccount || 'checking',
      status: 'completed',
      transferType: 'bill_payment',
      reference,
      note: note || `Payment to ${payee}`,
      date: new Date(),
      recipientMeta: {
        payee,
        accountNumber: accountNumber || '',
      },
    });

    // Create bill payment record
    const bill = await Bill.create({
      userId: userId,
      payee,
      amount,
      category: category || 'Other',
      accountNumber: accountNumber || '',
      fromAccount: fromAccount || 'checking',
      status: 'completed',
      transactionId: transaction._id,
      note: note || '',
      dueDate: dueDate ? new Date(dueDate) : null,
      reference,
    });

    // Update user account balance
    const accountIndex = user.accounts.findIndex(a => a.accountType === fromAccount);
    if (accountIndex !== -1) {
      user.accounts[accountIndex].balance -= amount;
    }

    // Update overall balance
    user.balance = (user.balance || 0) - amount;
    
    // Mark accounts as modified for Mongoose to save properly
    user.markModified('accounts');
    await user.save();

    res.status(201).json({
      status: 'success',
      message: 'Bill payment completed successfully',
      bill: {
        id: bill._id,
        payee: bill.payee,
        amount: bill.amount,
        category: bill.category,
        status: bill.status,
        paymentDate: bill.paymentDate,
        reference: bill.reference,
        transactionId: transaction._id,
      },
      transaction: {
        id: transaction._id,
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        status: transaction.status,
        date: transaction.date,
      },
    });
  } catch (error) {
    console.error('❌ Bill payment error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Server error processing bill payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// Get all bill payments for current user
exports.getBillPayments = async (req, res) => {
  try {
    const userId = req.userId;

    // Validate user ID
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
    }

    const { status, limit = 50, skip = 0 } = req.query;

    const query = { userId: userId };
    if (status) {
      query.status = status;
    }

    // Check if database is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not ready, returning empty bill list');
      return res.json({
        status: 'success',
        bills: [],
        pagination: {
          total: 0,
          limit: parseInt(limit),
          skip: parseInt(skip),
        },
      });
    }

    // Add better error handling for empty collections
    let bills = [];
    let total = 0;
    
    try {
      bills = await Bill.find(query)
        .populate('transactionId')
        .sort({ paymentDate: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .lean();
      
      total = await Bill.countDocuments(query);
    } catch (dbError) {
      console.log('Database query error (non-fatal):', dbError.message);
      // Return empty result instead of failing
    }

    res.json({
      status: 'success',
      bills: bills || [],
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    console.error('❌ Get bills error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Server error fetching bill payments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// Get single bill payment by ID
exports.getBillPaymentById = async (req, res) => {
  try {
    const userId = req.userId;

    // Validate user ID
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
    }

    const bill = await Bill.findOne({
      _id: req.params.id,
      userId: userId,
    }).populate('transactionId').lean();

    if (!bill) {
      return res.status(404).json({
        status: 'error',
        message: 'Bill payment not found',
      });
    }

    res.json({
      status: 'success',
      bill,
    });
  } catch (error) {
    console.error('❌ Get bill error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Server error fetching bill',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
