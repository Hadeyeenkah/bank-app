import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBankContext } from '../context/BankContext';
import '../App.css';

function AdminPage() {
  const { users, pendingApprovals, approveTransaction, rejectTransaction, updateUserBalance } = useBankContext();
  const [activeTab, setActiveTab] = useState('users');
  const [editingUser, setEditingUser] = useState(null);
  const [editValues, setEditValues] = useState({});

  const handleApprove = (transactionId) => {
    approveTransaction(transactionId);
  };

  const handleReject = (transactionId) => {
    rejectTransaction(transactionId);
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditValues({
      checking: user.checking,
      savings: user.savings,
    });
  };

  const handleSave = (userId) => {
    updateUserBalance(userId, 'checking', parseFloat(editValues.checking));
    updateUserBalance(userId, 'savings', parseFloat(editValues.savings));
    setEditingUser(null);
  };

  const totalSystemBalance = users.reduce((sum, user) => sum + user.balance, 0);
  const totalTransactions = users.reduce((sum, user) => sum + user.transactions.length, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-red-400/20 ring-1 ring-red-400/40" />
            <span className="text-lg font-semibold tracking-tight">Admin Panel</span>
          </div>
          <Link to="/" className="text-sm text-cyan-200 hover:text-white">
            Logout
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="mb-2 text-3xl font-semibold text-white">Admin Dashboard</h1>
        <p className="mb-8 text-slate-300">Manage users, approve transactions, and monitor system activity</p>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <div className="card secondary">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Total Users</p>
            <p className="mt-2 text-3xl font-semibold text-white">{users.length}</p>
          </div>
          <div className="card secondary">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">System Balance</p>
            <p className="mt-2 text-3xl font-semibold text-white">${totalSystemBalance.toFixed(2)}</p>
          </div>
          <div className="card secondary">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Pending Approvals</p>
            <p className="mt-2 text-3xl font-semibold text-yellow-400">{pendingApprovals.length}</p>
          </div>
          <div className="card secondary">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Total Transactions</p>
            <p className="mt-2 text-3xl font-semibold text-white">{totalTransactions}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-white/5">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-sm font-semibold transition ${activeTab === 'users' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`pb-3 text-sm font-semibold transition ${activeTab === 'approvals' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
          >
            Pending Approvals {pendingApprovals.length > 0 && `(${pendingApprovals.length})`}
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-3 text-sm font-semibold transition ${activeTab === 'activity' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
          >
            Recent Activity
          </button>
        </div>

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">All Users</h2>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="rounded-xl border border-white/5 bg-white/5 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500" />
                        <div>
                          <h3 className="font-semibold text-white">{user.name}</h3>
                          <p className="text-sm text-slate-400">{user.email}</p>
                          <p className="text-xs text-slate-500">Account: {user.accountNumber}</p>
                        </div>
                      </div>

                      {editingUser === user.id ? (
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <label className="mb-1 block text-xs text-slate-400">Checking</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editValues.checking}
                              onChange={(e) => setEditValues({ ...editValues, checking: e.target.value })}
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-slate-400">Savings</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editValues.savings}
                              onChange={(e) => setEditValues({ ...editValues, savings: e.target.value })}
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50"
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <button
                              onClick={() => handleSave(user.id)}
                              className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-300"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                            <p className="text-xs text-slate-400">Total Balance</p>
                            <p className="text-xl font-semibold text-white">${user.balance.toFixed(2)}</p>
                          </div>
                          <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                            <p className="text-xs text-slate-400">Checking</p>
                            <p className="text-xl font-semibold text-white">${user.checking.toFixed(2)}</p>
                          </div>
                          <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                            <p className="text-xs text-slate-400">Savings</p>
                            <p className="text-xl font-semibold text-white">${user.savings.toFixed(2)}</p>
                          </div>
                        </div>
                      )}

                      <div className="mt-4">
                        <p className="text-xs text-slate-400">
                          {user.transactions.length} transactions • {user.pendingTransactions.length} pending
                        </p>
                      </div>
                    </div>

                    {editingUser !== user.id && (
                      <button
                        onClick={() => handleEdit(user)}
                        className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">Pending Transaction Approvals</h2>
            {pendingApprovals.length === 0 ? (
              <p className="py-8 text-center text-slate-400">No pending approvals</p>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-500/20">
                        <span className="text-2xl">⏱</span>
                      </div>
                      <div>
                        <div className="font-semibold text-white">{transaction.description}</div>
                        <div className="text-sm text-slate-300">
                          {transaction.userName} • {transaction.date} • {transaction.category}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          From: {transaction.accountType}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-semibold ${transaction.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {transaction.amount < 0 ? '-' : '+'}$
                        {Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(transaction.id)}
                          className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-400"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(transaction.id)}
                          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Activity Tab */}
        {activeTab === 'activity' && (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">Recent System Activity</h2>
            <div className="space-y-4">
              {users.flatMap(user => 
                user.transactions.slice(0, 3).map(t => ({
                  ...t,
                  userName: user.name,
                  userEmail: user.email,
                }))
              ).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20).map((transaction, idx) => (
                <div
                  key={`${transaction.id}-${idx}`}
                  className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                      <span className="text-lg">{transaction.amount < 0 ? '↓' : '↑'}</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{transaction.description}</div>
                      <div className="text-xs text-slate-400">
                        {transaction.userName} ({transaction.userEmail}) • {transaction.date}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ${transaction.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {transaction.amount < 0 ? '-' : '+'}$
                    {Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminPage;
