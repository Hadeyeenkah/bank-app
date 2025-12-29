// src/controllers/billController.js
const Bill = require('../models/Bill');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Pay a bill - creates both bill record and transaction
exports.payBill = async (req, res) => {
  try {
    const { payee, amount, category, accountNumber, fromAccount, note, dueDate } = req.body;

    // Validate required fields
    if (!payee || !amount || amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Payee name and valid amount are required',
      });
    }

    // Get user to check balance
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const accountBalance = fromAccount === 'savings' ? user.accounts?.find(a => a.accountType === 'savings')?.balance : user.accounts?.find(a => a.accountType === 'checking')?.balance;
    
    if (!accountBalance || accountBalance < amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient funds for this bill payment',
      });
    }

    // Generate unique reference
    const reference = `BILL-${req.userId}-${Date.now()}`;

    // Create transaction record
    const transaction = await Transaction.create({
      userId: req.userId,
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
      userId: req.userId,
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
    if (fromAccount === 'savings') {
      user.accounts = user.accounts.map(acc =>
        acc.accountType === 'savings'
          ? { ...acc, balance: acc.balance - amount }
          : acc
      );
    } else {
      user.accounts = user.accounts.map(acc =>
        acc.accountType === 'checking'
          ? { ...acc, balance: acc.balance - amount }
          : acc
      );
    }

    // Update overall balance
    user.balance = (user.balance || 0) - amount;
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
    res.status(500).json({
      status: 'error',
      message: 'Server error processing bill payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get all bill payments for current user
exports.getBillPayments = async (req, res) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;

    const query = { userId: req.userId };
    if (status) {
      query.status = status;
    }

    const bills = await Bill.find(query)
      .populate('transactionId')
      .sort({ paymentDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Bill.countDocuments(query);

    res.json({
      status: 'success',
      bills,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    console.error('❌ Get bills error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Server error fetching bill payments',
    });
  }
};

// Get single bill payment by ID
exports.getBillPaymentById = async (req, res) => {
  try {
    const bill = await Bill.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).populate('transactionId');

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
    });
  }
};
