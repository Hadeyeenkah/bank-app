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

	// For dev on localhost (different ports), lax usually works; switch to none if needed for strict browsers.
	const cookieOptions = {
		httpOnly: true,
		secure: isProd, // Only secure in production
		sameSite: isProd ? 'lax' : 'lax',
		path: '/',
	};

	console.log('🍪 Setting auth cookies with options:', { ...cookieOptions, nodeEnv: process.env.NODE_ENV });

	res.cookie('accessToken', accessToken, {
		...cookieOptions,
		maxAge: 15 * 60 * 1000, // 15 minutes
	});

	res.cookie('refreshToken', refreshToken, {
		...cookieOptions,
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	});
};
