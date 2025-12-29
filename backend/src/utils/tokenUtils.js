const jwt = require('jsonwebtoken');

exports.generateTokens = (userId) => {
	// Use env secrets, with safe dev defaults for local testing
	const accessSecret = process.env.JWT_SECRET || 'dev-access-secret-change-me';
	const refreshSecret = process.env.JWT_REFRESH_SECRET || accessSecret;

	const accessToken = jwt.sign({ userId }, accessSecret, {
		expiresIn: process.env.JWT_EXPIRE || '15m',
	});

	const refreshToken = jwt.sign({ userId }, refreshSecret, {
		expiresIn: '7d',
	});

	return { accessToken, refreshToken };
};

exports.setAuthCookies = (res, { accessToken, refreshToken }) => {
	const isProd = process.env.NODE_ENV === 'production';

	// In development (localhost), use sameSite: 'lax' and secure: false
	// In production, use sameSite: 'none' and secure: true for cross-origin requests
	const cookieOptions = {
		httpOnly: true,
		secure: isProd, // Only secure in production
		sameSite: isProd ? 'none' : 'lax', // 'lax' for dev (localhost), 'none' for prod
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
