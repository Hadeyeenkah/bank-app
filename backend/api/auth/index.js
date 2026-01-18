const express = require('express');
const router = express.Router();

// Profile route
router.get('/profile', (req, res) => {
  res.json({
    user: {
      id: 1,
      email: 'user@example.com',
      name: 'User Name'
    }
  });
});

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  // For demo, always succeed
  res.json({
    user: {
      id: 1,
      email,
      name: 'User Name'
    },
    token: 'demo-token-123'
  });
});

module.exports = router;
