import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBankContext } from '../context/BankContext';
import AuroraBankLogo from '../components/AuroraBankLogo';
import '../App.css';

function BillsPage() {
  const { currentUser, payBill } = useBankContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    payee: '',
    amount: '',
    fromAccount: 'checking',
    category: 'Utilities',
    accountNumber: '',
  });
  const [message, setMessage] = useState('');

  const billCategories = ['Utilities', 'Internet', 'Phone', 'Rent', 'Insurance', 'Credit Card', 'Other'];

  const handleSubmit = (e) => {
    e.preventDefault();
    payBill(currentUser.id, {
      ...formData,
      amount: parseFloat(formData.amount),
    });
    setMessage('Bill payment initiated successfully!');
    setTimeout(() => navigate('/dashboard'), 2000);
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

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-2 text-3xl font-semibold text-white">Pay Bills</h1>
        <p className="mb-8 text-slate-300">Make one-time or recurring bill payments</p>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-slate-200">Payee Name</label>
                <input
                  type="text"
                  value={formData.payee}
                  onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                  placeholder="Electric Company"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-cyan-300/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-200">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
                >
                  {billCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-200">Account Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="Account or reference number"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-cyan-300/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-200">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-8 text-white placeholder-slate-400 outline-none focus:border-cyan-300/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-200">Pay From</label>
                <select
                  value={formData.fromAccount}
                  onChange={(e) => setFormData({ ...formData, fromAccount: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
                >
                  <option value="checking">Checking - ${currentUser?.checking.toFixed(2)}</option>
                  <option value="savings">Savings - ${currentUser?.savings.toFixed(2)}</option>
                </select>
              </div>

              {message && (
                <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-green-400">
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-cyan-400 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
              >
                Pay Bill
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
              <h3 className="mb-3 text-sm font-semibold text-white">Recent Payees</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="cursor-pointer rounded-lg p-2 hover:bg-white/5">Electric Co.</div>
                <div className="cursor-pointer rounded-lg p-2 hover:bg-white/5">Internet Provider</div>
                <div className="cursor-pointer rounded-lg p-2 hover:bg-white/5">Phone Company</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default BillsPage;
