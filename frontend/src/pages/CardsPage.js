import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBankContext } from '../context/BankContext';
import '../App.css';

function CardsPage() {
  const { currentUser } = useBankContext();
  const [cardLocked, setCardLocked] = useState(false);

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

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="mb-2 text-3xl font-semibold text-white">Card Controls</h1>
        <p className="mb-8 text-slate-300">Manage your debit cards and security settings</p>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {/* Card Display */}
          <div className="card primary">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-cyan-100">Debit Card</span>
              <div className={`rounded-full px-3 py-1 text-xs ${cardLocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                {cardLocked ? '🔒 Locked' : '✓ Active'}
              </div>
            </div>
            <div className="mb-8">
              <div className="mb-4 text-sm text-cyan-100">•••• •••• •••• {currentUser?.accountNumber.slice(-4)}</div>
              <div className="flex justify-between text-sm">
                <div>
                  <div className="text-xs text-cyan-200">Card Holder</div>
                  <div className="text-white">{currentUser?.name}</div>
                </div>
                <div>
                  <div className="text-xs text-cyan-200">Expires</div>
                  <div className="text-white">12/27</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setCardLocked(!cardLocked)}
              className={`w-full rounded-xl py-3 text-sm font-semibold transition ${cardLocked ? 'bg-green-500 text-white hover:bg-green-400' : 'bg-red-500 text-white hover:bg-red-400'}`}
            >
              {cardLocked ? 'Unlock Card' : 'Lock Card'}
            </button>
          </div>

          {/* Card Controls */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">International Transactions</div>
                    <div className="text-xs text-slate-400">Allow purchases outside the US</div>
                  </div>
                  <button className="rounded-full bg-cyan-400 px-4 py-1 text-xs font-semibold text-slate-900">
                    On
                  </button>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div>
                    <div className="text-sm font-semibold text-white">Online Purchases</div>
                    <div className="text-xs text-slate-400">E-commerce transactions</div>
                  </div>
                  <button className="rounded-full bg-cyan-400 px-4 py-1 text-xs font-semibold text-slate-900">
                    On
                  </button>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div>
                    <div className="text-sm font-semibold text-white">Contactless Payments</div>
                    <div className="text-xs text-slate-400">Tap to pay with your card</div>
                  </div>
                  <button className="rounded-full bg-cyan-400 px-4 py-1 text-xs font-semibold text-slate-900">
                    On
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Spending Limits</h3>
              <div className="space-y-3">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-300">Daily ATM Limit</span>
                    <span className="text-white">$500 / $1,000</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-full w-1/2 rounded-full bg-cyan-400" />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-300">Daily Purchase Limit</span>
                    <span className="text-white">$1,200 / $5,000</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-full w-1/4 rounded-full bg-cyan-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <button className="rounded-xl border border-white/5 bg-white/5 p-4 text-left transition hover:bg-white/10">
            <div className="mb-2 text-2xl">🔄</div>
            <div className="text-sm font-semibold text-white">Replace Card</div>
            <div className="text-xs text-slate-400">Lost or damaged card</div>
          </button>
          <button className="rounded-xl border border-white/5 bg-white/5 p-4 text-left transition hover:bg-white/10">
            <div className="mb-2 text-2xl">📍</div>
            <div className="text-sm font-semibold text-white">Set Travel Notice</div>
            <div className="text-xs text-slate-400">Avoid declined transactions</div>
          </button>
          <button className="rounded-xl border border-white/5 bg-white/5 p-4 text-left transition hover:bg-white/10">
            <div className="mb-2 text-2xl">💳</div>
            <div className="text-sm font-semibold text-white">View PIN</div>
            <div className="text-xs text-slate-400">Reveal your card PIN</div>
          </button>
        </div>
      </main>
    </div>
  );
}

export default CardsPage;
