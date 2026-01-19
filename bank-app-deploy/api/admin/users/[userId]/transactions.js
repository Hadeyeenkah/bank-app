const withCors = require('../../../_lib/cors');

module.exports = withCors(async (req, res) => {
  const userId = req.query?.userId || (req.url && new URL(req.url, 'http://localhost').searchParams.get('userId'));

  if (req.method === 'POST') {
    const body = req.body || {};
    // Echo created transaction
    const tx = { id: `tx-${Date.now()}`, ...body };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ transaction: tx }));
    return;
  }

  if (req.method === 'GET') {
    // Return simple list
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ transactions: [] }));
    return;
  }

  res.statusCode = 405;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Method not allowed' }));
});
