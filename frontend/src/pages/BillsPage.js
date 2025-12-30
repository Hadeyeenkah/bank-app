
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useBankContext } from '../context/BankContext';
import AuroraBankLogo from '../components/AuroraBankLogo';
import '../App.css';

function BillsPage() {
  const { currentUser, payBill } = useBankContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    payee: '',
    amount: '',
    fromAccount: 'checking',
    category: 'Utilities',
    accountNumber: '',
    note: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentPayees, setRecentPayees] = useState([
    { id: 1, name: 'Electric Company', category: 'Utilities' },
    { id: 2, name: 'Internet Provider', category: 'Internet' },
    { id: 3, name: 'Phone Company', category: 'Phone' },
  ]);
  const [billHistory, setBillHistory] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const billCategories = ['Utilities', 'Internet', 'Phone', 'Rent', 'Insurance', 'Credit Card', 'Other'];
  const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:5001/api';

  // Fetch bill payment history
  useEffect(() => {
    const fetchBillHistory = async () => {
      // Only fetch if user is authenticated
      if (!currentUser) {
        return;
      }
      
      try {
        const res = await fetch(`${apiBase}/bills?limit=10`, {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setBillHistory(data.bills || []);
        } else if (res.status === 500) {
          console.log('Server error fetching bills - may be initial setup');
          setBillHistory([]);
        }
      } catch (err) {
        console.log('Failed to fetch bill history:', err);
        setBillHistory([]);
      }
    };
    fetchBillHistory();
  }, [apiBase, currentUser]);

  // Handle flash message from successful transfer
  useEffect(() => {
    if (location.state?.message) {
      setMessageType(location.state.type || 'success');
      setMessage(location.state.message);
      setTimeout(() => {
        setMessage('');
        navigate(location.pathname, { replace: true, state: {} });
      }, 4000);
    }
  }, [location.state, navigate, location.pathname]);

  const validateForm = () => {
    if (!formData.payee.trim()) {
      setMessageType('error');
      setMessage('Payee name is required');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setMessageType('error');
      setMessage('Enter a valid amount greater than $0.00');
      return false;
    }
    if (!formData.accountNumber.trim()) {
      setMessageType('error');
      setMessage('Account number is required');
      return false;
    }

    const balance = formData.fromAccount === 'checking' ? currentUser?.checking : currentUser?.savings;
    if (balance && balance < parseFloat(formData.amount)) {
      setMessageType('error');
      setMessage(`Insufficient funds. Available: $${balance.toFixed(2)}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setMessage('');
    setMessageType('');

    const result = await payBill(currentUser.id, {
      payee: formData.payee,
      amount: formData.amount,
      category: formData.category,
      accountNumber: formData.accountNumber,
      fromAccount: formData.fromAccount,
      note: formData.note,
    });

    setLoading(false);

    if (result.success) {
      setMessageType('success');
      setMessage('✓ Bill payment completed successfully!');
      
      // Create receipt
      setReceipt({
        id: result.bill.id,
        payee: result.bill.payee,
        amount: result.bill.amount,
        category: result.bill.category,
        account: formData.fromAccount,
        reference: result.bill.reference,
        date: new Date(),
        status: result.bill.status,
      });
      
      setShowReceiptModal(true);

      // Add to recent payees if not already there
      if (!recentPayees.some(p => p.name === formData.payee)) {
        setRecentPayees([
          { id: Date.now(), name: formData.payee, category: formData.category },
          ...recentPayees.slice(0, 2),
        ]);
      }

      // Reset form
      setTimeout(() => {
        setFormData({
          payee: '',
          amount: '',
          fromAccount: 'checking',
          category: 'Utilities',
          accountNumber: '',
          note: '',
        });
      }, 1000);
    } else {
      setMessageType('error');
      setMessage(result.message || 'Failed to process bill payment');
    }
  };

  const handleQuickPayee = (payee) => {
    setFormData({ ...formData, payee: payee.name, category: payee.category });
  };

  const handleReceiptClose = () => {
    setShowReceiptModal(false);
    setReceipt(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="absolute inset-0 -z-10 gradient-veil" />
      
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 text-cyan-400">
            <AuroraBankLogo />
            <span className="text-lg font-semibold tracking-tight text-slate-50">Aurora Bank, FSB</span>
          </div>
          <Link to="/dashboard" className="text-sm text-cyan-200 hover:text-white transition">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Bill Payments</p>
          <h1 className="text-3xl font-semibold text-white mt-2">Pay Bills</h1>
          <p className="text-slate-300 mt-2">Manage your bill payments safely and securely</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200">Payee Name</label>
                <input
                  type="text"
                  value={formData.payee}
                  onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                  placeholder="Electric Company, Rent Landlord, etc."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-cyan-300/50 transition"
                  required
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-200">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50 transition"
                  >
                    {billCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-200">Account to Pay From</label>
                  <select
                    value={formData.fromAccount}
                    onChange={(e) => setFormData({ ...formData, fromAccount: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300/50 transition"
                  >
                    <option value="checking">Checking - ${currentUser?.checking?.toFixed(2)}</option>
                    <option value="savings">Savings - ${currentUser?.savings?.toFixed(2)}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200">Account/Reference Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="Customer/Account number at payee"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-cyan-300/50 transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-8 text-white placeholder-slate-400 outline-none focus:border-cyan-300/50 transition"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200">Note (Optional)</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Add a note for your records..."
                  rows="2"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-cyan-300/50 transition resize-none"
                />
              </div>

              {message && (
                <div className={`rounded-xl border p-4 ${
                  messageType === 'success'
                    ? 'border-green-500/20 bg-green-500/10 text-green-400'
                    : 'border-red-500/20 bg-red-500/10 text-red-400'
                }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-cyan-400 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Pay Bill'}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 text-sm font-semibold text-white">Account Balance</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Checking</p>
                  <p className="text-2xl font-semibold text-cyan-400">${currentUser?.checking?.toFixed(2)}</p>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <p className="text-xs text-slate-400 mb-1">Savings</p>
                  <p className="text-2xl font-semibold text-cyan-400">${currentUser?.savings?.toFixed(2)}</p>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <p className="text-xs text-slate-400 mb-1">Total Balance</p>
                  <p className="text-2xl font-semibold text-white">${currentUser?.balance?.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 text-sm font-semibold text-white">Recent Payees</h3>
              <div className="space-y-2">
                {recentPayees.map((payee) => (
                  <button
                    key={payee.id}
                    onClick={() => handleQuickPayee(payee)}
                    className="block w-full text-left rounded-lg p-3 hover:bg-white/10 transition text-sm"
                  >
                    <div className="font-medium text-white">{payee.name}</div>
                    <div className="text-xs text-slate-400">{payee.category}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bill Payment History */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Recent Payments</h2>
          {billHistory.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
              <p className="text-slate-400">No bill payments yet</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/5">
              {billHistory.map((bill) => (
                <div key={bill._id} className="p-4 hover:bg-white/5 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{bill.payee}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {bill.category} • {new Date(bill.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">{bill.reference}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-red-400">-${bill.amount.toFixed(2)}</div>
                      <div className={`text-xs mt-1 ${bill.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {bill.status === 'completed' ? '✓ Completed' : 'Pending'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Receipt Modal */}
      {showReceiptModal && receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-8">
            <div className="mb-6 text-center">
              <div className="text-5xl mb-3">✓</div>
              <h2 className="text-2xl font-semibold text-green-400">Payment Confirmed</h2>
              <p className="text-slate-300 mt-2">Your bill payment has been processed successfully</p>
            </div>

            <div className="space-y-4 border-y border-white/10 py-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Payee:</span>
                <span className="font-semibold text-white">{receipt.payee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-semibold text-white">${receipt.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="text-white">{receipt.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">From:</span>
                <span className="capitalize text-white">{receipt.account}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="text-white">{receipt.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reference:</span>
                <span className="font-mono text-xs text-cyan-400">{receipt.reference}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handlePrint}
                className="flex-1 rounded-lg border border-cyan-400/50 px-4 py-3 text-sm font-semibold text-cyan-400 hover:bg-cyan-400/10 transition"
              >
                🖨️ Print Receipt
              </button>
              <button
                onClick={handleReceiptClose}
                className="flex-1 rounded-lg bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-cyan-300 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillsPage;
