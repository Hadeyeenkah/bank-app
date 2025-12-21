import { Link } from 'react-router-dom';
import { useBankContext } from '../context/BankContext';
import '../App.css';

function DepositPage() {
  const { currentUser } = useBankContext();

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
        <h1 className="mb-2 text-3xl font-semibold text-white">Deposit Check</h1>
        <p className="mb-8 text-slate-300">Mobile check deposit - snap a photo and deposit instantly</p>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center">
          <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-cyan-400/20">
            <span className="text-6xl">📷</span>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-white">Mobile Deposit</h3>
          <p className="mb-6 text-slate-300">
            Take photos of the front and back of your check to deposit instantly
          </p>
          <button className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300">
            Start Deposit
          </button>
          
          <div className="mt-8 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-left">
            <p className="text-sm text-slate-300">
              💡 <strong>Tips for best results:</strong><br />
              • Ensure check is on a dark surface<br />
              • Make sure all corners are visible<br />
              • Check must be endorsed on the back<br />
              • Deposits over $1,000 may require admin approval
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DepositPage;
