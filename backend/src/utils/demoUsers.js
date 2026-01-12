// Lightweight demo users for environments without MongoDB.
// Enabled via env var DEMO_MODE=true. Intended for non-persistent demos only.

const demoUsers = [
  {
    id: 'demo:admin@aurorabank.com',
    email: 'admin@aurorabank.com',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isVerified: true,
    routingNumber: '026009593',
    accountNumber: 'CHK-DEMO-ADMIN',
    balance: 5000,
    accounts: [
      { accountType: 'checking', accountNumber: 'CHK-DEMO-ADMIN', balance: 3000 },
      { accountType: 'savings', accountNumber: 'SAV-DEMO-ADMIN', balance: 2000 },
    ],
  },
  {
    id: 'demo:lornamartins@gmail.com',
    email: 'lornamartins@gmail.com',
    password: 'password123',
    firstName: 'Lorna',
    lastName: 'Martins',
    role: 'user',
    isVerified: true,
    routingNumber: '026009593',
    accountNumber: 'CHK-DEMO-LORNA',
    balance: 3200,
    accounts: [
      { accountType: 'checking', accountNumber: 'CHK-DEMO-LORNA', balance: 1800 },
      { accountType: 'savings', accountNumber: 'SAV-DEMO-LORNA', balance: 1400 },
    ],
  },
];

function findByEmail(email) {
  const e = String(email || '').toLowerCase();
  return demoUsers.find((u) => u.email.toLowerCase() === e) || null;
}

function findById(id) {
  return demoUsers.find((u) => u.id === id) || null;
}

function verifyCredentials(email, password) {
  const user = findByEmail(email);
  if (!user) return null;
  return user.password === password ? user : null;
}

module.exports = { demoUsers, findByEmail, findById, verifyCredentials };
