const jwt = require('jsonwebtoken');

exports.generateTokens = (userId) => {
	const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE || '15m',
	});

	const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
		expiresIn: '7d',
	});

	return { accessToken, refreshToken };
};

exports.setAuthCookies = (res, { accessToken, refreshToken }) => {
	const isProd = process.env.NODE_ENV === 'production';

	// For cross-origin (different domains), need sameSite: 'none' and secure: true
	const cookieOptions = {
		httpOnly: true,
		secure: isProd, // true in production (HTTPS required)
		sameSite: isProd ? 'none' : 'lax', // 'none' for cross-origin cookies in production
		path: '/',
	};

	res.cookie('accessToken', accessToken, {
		...cookieOptions,
		maxAge: 15 * 60 * 1000, // 15 minutes
	});

	res.cookie('refreshToken', refreshToken, {
		...cookieOptions,
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	});
};
