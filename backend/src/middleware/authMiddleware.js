const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
	try {
		let token = null;

		// Prefer httpOnly cookie
		if (req.cookies && req.cookies.accessToken) {
			token = req.cookies.accessToken;
		}

		// Fallback to Authorization header
		if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
			token = req.headers.authorization.split(' ')[1];
		}

		if (!token) {
			return res.status(401).json({ message: 'Not authorized' });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.userId = decoded.userId;
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid or expired token' });
	}
};

exports.requireRole = (role) => (req, res, next) => {
	try {
		// role should be checked after protect set req.userId
		if (!req.userId) return res.status(401).json({ message: 'Not authorized' });
		const User = require('../models/User');
		User.findById(req.userId).select('role').then((user) => {
			if (!user) return res.status(404).json({ message: 'User not found' });
			if (user.role !== role) return res.status(403).json({ message: 'Forbidden: insufficient role' });
			next();
		}).catch(() => res.status(500).json({ message: 'Server error' }));
	} catch (err) {
		return res.status(500).json({ message: 'Server error' });
	}
};
