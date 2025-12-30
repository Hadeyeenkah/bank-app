const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Get all users
router.get('/users', protect, requireRole('admin'), async (req, res) => {
  try {
    console.log('Admin: Fetching all users...');
    const users = await User.find().select('-password');
    console.log(`Admin: Found ${users.length} users`);
    
    // Fetch transactions for each user
    const usersWithTransactions = await Promise.all(
      users.map(async (user) => {
        const transactions = await Transaction.find({ userId: user._id }).sort({ date: -1 });
        
        const checking = user.accounts?.find(a => a.accountType === 'checking')?.balance || 0;
        const savings = user.accounts?.find(a => a.accountType === 'savings')?.balance || 0;
        
        return {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          accountNumber: '****' + String(Math.floor(1000 + Math.random() * 9000)),
          balance: checking + savings,
          checking,
          savings,
          transactions: transactions.map(t => ({
            id: t._id,
            date: t.date ? new Date(t.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            description: t.description,
            amount: t.amount,
            category: t.category,
            status: t.status,
            accountType: t.accountType,
          })),
          pendingTransactions: transactions.filter(t => t.status === 'pending').map(t => ({
            id: t._id,
            date: t.date ? new Date(t.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            description: t.description,
            amount: t.amount,
            category: t.category,
            status: t.status,
            accountType: t.accountType,
          })),
          role: user.role,
        };
      })
    );

    console.log('Admin: Sending users data...');
    res.json({ users: usersWithTransactions });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user balance
router.patch('/users/:userId/balance', protect, requireRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { checking, savings } = req.body;

    if (typeof checking !== 'number' || typeof savings !== 'number') {
      return res.status(400).json({ message: 'Checking and savings amounts are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update account balances
    user.accounts = [
      { accountType: 'checking', accountNumber: user.accounts?.find(a => a.accountType === 'checking')?.accountNumber || `CHK${Date.now()}`, balance: checking },
      { accountType: 'savings', accountNumber: user.accounts?.find(a => a.accountType === 'savings')?.accountNumber || `SAV${Date.now()}`, balance: savings },
    ];
    user.balance = checking + savings;

    await user.save();

    res.json({ 
      message: 'User balance updated successfully',
      user: {
        id: user._id,
        checking,
        savings,
        balance: user.balance,
      }
    });
  } catch (error) {
    console.error('Update balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all pending approvals
router.get('/pending-approvals', protect, requireRole('admin'), async (req, res) => {
  try {
    console.log('Admin: Fetching pending approvals...');
    const pendingTransactions = await Transaction.find({ status: 'pending' })
      .populate('userId', 'firstName lastName email')
      .sort({ date: -1 });

    console.log(`Admin: Found ${pendingTransactions.length} pending transactions`);

    const pendingApprovals = pendingTransactions.map(transaction => ({
      id: transaction._id,
      date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      userName: transaction.userId ? `${transaction.userId.firstName} ${transaction.userId.lastName}` : 'Unknown User',
      userEmail: transaction.userId?.email || 'N/A',
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category,
      status: transaction.status,
      accountType: transaction.accountType,
    }));

    res.json({ pendingApprovals });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add transaction for a user (with backdating support)
router.post('/users/:userId/transactions', protect, requireRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { description, amount, category, accountType, date, note } = req.body;

    if (!description || amount === undefined) {
      return res.status(400).json({ message: 'Description and amount are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create transaction with custom date (backdating)
    const transaction = await Transaction.create({
      userId: userId,
      description,
      amount: parseFloat(amount),
      category: category || 'Other',
      accountType: accountType || 'checking',
      status: 'completed',
      date: date ? new Date(date) : new Date(),
      note: note || '',
      transferType: 'admin_adjustment',
      reference: `ADMIN-${userId}-${Date.now()}`,
    });

    // Update user balance
    const accountIndex = user.accounts.findIndex(a => a.accountType === accountType);
    if (accountIndex !== -1) {
      user.accounts[accountIndex].balance += parseFloat(amount);
    } else {
      user.accounts.push({
        accountType: accountType || 'checking',
        accountNumber: `${accountType.toUpperCase()}-${Date.now()}`,
        balance: parseFloat(amount),
      });
    }

    user.balance = (user.balance || 0) + parseFloat(amount);
    user.markModified('accounts');
    await user.save();

    res.status(201).json({
      message: 'Transaction added successfully',
      transaction: {
        id: transaction._id,
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        accountType: transaction.accountType,
        date: transaction.date,
        status: transaction.status,
      },
    });
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ message: 'Server error adding transaction' });
  }
});

// Delete transaction
router.delete('/users/:userId/transactions/:transactionId', protect, requireRole('admin'), async (req, res) => {
  try {
    const { userId, transactionId } = req.params;

    const transaction = await Transaction.findOne({ _id: transactionId, userId: userId });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Reverse the balance change
    const accountIndex = user.accounts.findIndex(a => a.accountType === transaction.accountType);
    if (accountIndex !== -1) {
      user.accounts[accountIndex].balance -= transaction.amount;
    }

    user.balance = (user.balance || 0) - transaction.amount;
    user.markModified('accounts');
    await user.save();

    // Delete the transaction
    await Transaction.findByIdAndDelete(transactionId);

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error deleting transaction' });
  }
});

module.exports = router;
