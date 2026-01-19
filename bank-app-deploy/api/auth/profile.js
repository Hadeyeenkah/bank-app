const { connectDB } = require('../_lib/db');
const handleCors = require('../_lib/cors');
const { requireAuth } = require('../_lib/auth');

async function profileHandler(req, res) {
  try {
    await connectDB();
    const User = require('../_models/User');
    
    if (req.method === 'GET') {
      const user = await User.findById(req.userId);
      
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      res.status(200).json({
        status: 'success',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          role: user.role,
          accountNumber: user.accountNumber,
          routingNumber: user.routingNumber,
          balance: user.balance,
          accounts: user.accounts,
          isVerified: user.isVerified
        }
      });

    } else if (req.method === 'PUT') {
      const updates = req.body;
      const user = await User.findByIdAndUpdate(
        req.userId,
        { $set: updates },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        status: 'success',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone
        }
      });

    } else {
      res.status(405).json({ status: 'error', message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}

module.exports = handleCors(requireAuth(profileHandler));
