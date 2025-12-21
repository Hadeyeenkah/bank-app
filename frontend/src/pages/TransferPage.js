import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBankContext } from '../context/BankContext';
import '../App.css';

function TransferPage() {
  const { currentUser, transferMoney } = useBankContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    fromAccount: 'checking',
    note: '',
  });
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = transferMoney(
      currentUser.id,
      formData.recipient,
      parseFloat(formData.amount),
      formData.fromAccount
    );
    
    if (result.success) {
      setMessage('Transfer initiated successfully!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-cyan-400/20 ring-1 ring-cyan-400/40" />
            <span className="text-lg font-semibold tracking-tight">Aurora Bank</span>
          </div>
          <Link to="/dashboard" className="text-sm text-cyan-200 hover:text-white">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-2 text-3xl font-semibold text-white">Transfer Money</h1>
        <p className="mb-8 text-slate-300">Send money instantly to other Aurora Bank customers</p>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6 md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-slate-200">Recipient Email</label>
                <input
                  type="email"
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  placeholder="recipient@example.com"
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
                <label className="text-sm text-slate-200">From Account</label>
                <select
                  value={formData.fromAccount}
                  onChange={(e) => setFormData({ ...formData, fromAccount: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
                >
                  <option value="checking">Checking - ${currentUser?.checking.toFixed(2)}</option>
                  <option value="savings">Savings - ${currentUser?.savings.toFixed(2)}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-200">Note (Optional)</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="What's this for?"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-cyan-300/50"
                  rows="3"
                />
              </div>

              {message && (
                <div className={`rounded-xl p-4 ${message.includes('success') ? 'border border-green-500/20 bg-green-500/10 text-green-400' : 'border border-red-500/20 bg-red-500/10 text-red-400'}`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-cyan-400 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
              >
                Send Money
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
              <h3 className="mb-3 text-sm font-semibold text-white">Available Balance</h3>
              <p className="text-2xl font-semibold text-cyan-200">${currentUser?.balance.toFixed(2)}</p>
            </div>
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
              <p className="text-sm text-slate-300">
                💡 Transfers over $1,000 require admin approval and may take 1-2 business days.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TransferPage;
