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

	res.cookie('accessToken', accessToken, {
		httpOnly: true,
		secure: isProd,
		sameSite: 'lax',
		maxAge: 15 * 60 * 1000,
		path: '/',
	});

	res.cookie('refreshToken', refreshToken, {
		httpOnly: true,
		secure: isProd,
		sameSite: 'lax',
		maxAge: 7 * 24 * 60 * 60 * 1000,
		path: '/',
	});
};
