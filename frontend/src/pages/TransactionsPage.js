import { Link } from 'react-router-dom';
import { useBankContext } from '../context/BankContext';
import AuroraBankLogo from '../components/AuroraBankLogo';
import '../App.css';

function TransactionsPage() {
  const { currentUser } = useBankContext();

  const allTransactions = [
    ...(currentUser?.transactions || []),
    ...(currentUser?.pendingTransactions || []).map(t => ({ ...t, isPending: true })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

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
        <h1 className="mb-2 text-3xl font-semibold text-white">Transaction History</h1>
        <p className="mb-8 text-slate-300">View all your account activity</p>

        <div className="mb-6 flex gap-4">
          <select className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300/50">
            <option>All Transactions</option>
            <option>Income</option>
            <option>Shopping</option>
            <option>Dining</option>
            <option>Bills</option>
            <option>Transfer</option>
          </select>
          <select className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300/50">
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>This Year</option>
            <option>All Time</option>
          </select>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
          <div className="space-y-4">
            {allTransactions.length === 0 ? (
              <p className="py-8 text-center text-slate-400">No transactions yet</p>
            ) : (
              allTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${transaction.isPending ? 'bg-yellow-500/20' : 'bg-white/5'}`}>
                      <span className="text-xl">
                        {transaction.isPending ? '⏱' : transaction.amount < 0 ? '↓' : '↑'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{transaction.description}</span>
                        {transaction.isPending && (
                          <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
                            Pending Approval
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {transaction.date} • {transaction.category}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ${transaction.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {transaction.amount < 0 ? '-' : '+'}$
                    {Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <p className="text-xs text-slate-400">Total Income</p>
            <p className="mt-2 text-2xl font-semibold text-green-400">
              $
              {currentUser?.transactions
                .filter(t => t.amount > 0)
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <p className="text-xs text-slate-400">Total Expenses</p>
            <p className="mt-2 text-2xl font-semibold text-red-400">
              $
              {Math.abs(
                currentUser?.transactions
                  .filter(t => t.amount < 0)
                  .reduce((sum, t) => sum + t.amount, 0) || 0
              ).toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <p className="text-xs text-slate-400">Net Change</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-400">
              $
              {(currentUser?.transactions.reduce((sum, t) => sum + t.amount, 0) || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TransactionsPage;
