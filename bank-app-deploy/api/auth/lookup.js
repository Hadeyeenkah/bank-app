const withCors = require('../_lib/cors');

module.exports = withCors(async (req, res) => {
  // support query params: email, accountNumber
  const url = (req.url && new URL(req.url, 'http://localhost'));
  const email = url.searchParams.get('email');
  const accountNumber = url.searchParams.get('accountNumber');

  if (email === 'jamie@example.com') {
    return res.end(JSON.stringify({ user: { firstName: 'Jamie', lastName: 'Doe', email: 'jamie@example.com', accountNumber: '****4892', routingNumber: '026009593' } }));
  }

  if (accountNumber) {
    return res.end(JSON.stringify({ user: null }));
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Not found' }));
});
