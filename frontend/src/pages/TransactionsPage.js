import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBankContext } from '../context/BankContext';
import AuroraBankLogo from '../components/AuroraBankLogo';
import '../App.css';

function TransactionsPage() {
  const { currentUser } = useBankContext();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('30');
  const [searchQuery, setSearchQuery] = useState('');
  const [accountFilter, setAccountFilter] = useState('all');

  // Merge regular and pending transactions with unique keys
  const allTransactions = useMemo(() => {
    const regular = (currentUser?.transactions || []).map((t, idx) => ({
      ...t,
      uniqueKey: `tx-${t.id}-${idx}`,
      isPending: t.status === 'pending',
    }));
    
    const pending = (currentUser?.pendingTransactions || [])
      .filter(pt => !regular.some(r => r.id === pt.id))
      .map((t, idx) => ({
        ...t,
        uniqueKey: `pending-${t.id}-${idx}`,
        isPending: true,
      }));
    
    return [...regular, ...pending].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [currentUser?.transactions, currentUser?.pendingTransactions]);

  // Apply filters
  const filteredTransactions = useMemo(() => {
    let filtered = [...allTransactions];

    // Date filter
    if (dateFilter !== 'all') {
      const daysAgo = parseInt(dateFilter);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      filtered = filtered.filter(t => new Date(t.date) >= cutoffDate);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => 
        t.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Account filter
    if (accountFilter !== 'all') {
      filtered = filtered.filter(t => 
        t.accountType?.toLowerCase() === accountFilter.toLowerCase()
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.description?.toLowerCase().includes(query) ||
        t.category?.toLowerCase().includes(query) ||
        t.note?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allTransactions, categoryFilter, dateFilter, searchQuery, accountFilter]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.amount > 0 && !t.isPending)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = Math.abs(
      filteredTransactions
        .filter(t => t.amount < 0 && !t.isPending)
        .reduce((sum, t) => sum + t.amount, 0)
    );
    
    const net = income - expenses;
    
    return { income, expenses, net };
  }, [filteredTransactions]);

  // Export to CSV
  const handleExport = () => {
    const headers = ['Date', 'Description', 'Category', 'Account', 'Amount', 'Status'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.description,
      t.category || 'Other',
      t.accountType || 'N/A',
      t.amount.toFixed(2),
      t.isPending ? 'Pending' : 'Completed',
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 text-cyan-400">
            <AuroraBankLogo />
            <span className="text-lg font-semibold tracking-tight text-slate-50">Aurora Bank</span>
          </div>
          <Link to="/dashboard" className="text-sm text-cyan-200 hover:text-white">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-semibold text-white">Transaction History</h1>
            <p className="text-slate-300">
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-400/20"
          >
            <span>📊</span>
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Description, category..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-slate-400 outline-none focus:border-cyan-300/50"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300/50"
            >
              <option value="all">All Categories</option>
              <option value="income">Income</option>
              <option value="shopping">Shopping</option>
              <option value="dining">Dining</option>
              <option value="bills">Bills</option>
              <option value="transfer">Transfer</option>
              <option value="deposit">Deposit</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Account</label>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300/50"
            >
              <option value="all">All Accounts</option>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Date Range</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300/50"
            >
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="180">Last 6 Months</option>
              <option value="365">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <p className="text-xs text-slate-400">Total Income</p>
            <p className="mt-2 text-2xl font-semibold text-green-400">
              ${stats.income.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <p className="text-xs text-slate-400">Total Expenses</p>
            <p className="mt-2 text-2xl font-semibold text-red-400">
              ${stats.expenses.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <p className="text-xs text-slate-400">Net Change</p>
            <p className={`mt-2 text-2xl font-semibold ${stats.net >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
              ${stats.net.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Transactions List */}
        <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
                  <span className="text-3xl">📭</span>
                </div>
                <p className="text-lg font-semibold text-white">No transactions found</p>
                <p className="mt-1 text-sm text-slate-400">
                  {searchQuery || categoryFilter !== 'all' || dateFilter !== '30'
                    ? 'Try adjusting your filters'
                    : 'Your transactions will appear here'}
                </p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.uniqueKey}
                  className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl ${
                        transaction.isPending
                          ? 'bg-yellow-500/20'
                          : transaction.amount < 0
                          ? 'bg-red-500/10'
                          : 'bg-green-500/10'
                      }`}
                    >
                      <span className="text-xl">
                        {transaction.isPending
                          ? '⏱'
                          : transaction.amount < 0
                          ? '↓'
                          : '↑'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {transaction.description || 'Transaction'}
                        </span>
                        {transaction.isPending && (
                          <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{transaction.date}</span>
                        <span>•</span>
                        <span className="capitalize">{transaction.category || 'Other'}</span>
                        {transaction.accountType && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{transaction.accountType}</span>
                          </>
                        )}
                      </div>
                      {transaction.note && (
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {transaction.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    className={`flex-shrink-0 text-right text-lg font-semibold ${
                      transaction.amount < 0 ? 'text-red-400' : 'text-green-400'
                    }`}
                  >
                    {transaction.amount < 0 ? '-' : '+'}$
                    {Math.abs(transaction.amount).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default TransactionsPage;
