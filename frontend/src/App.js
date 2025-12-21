import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { BankProvider } from './context/BankContext';
import { useBankContext } from './context/BankContext';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import Dashboard from './Dashboard';
import TransferPage from './pages/TransferPage';
import BillsPage from './pages/BillsPage';
import TransactionsPage from './pages/TransactionsPage';
import AdminPage from './pages/AdminPage';
import DepositPage from './pages/DepositPage';
import CardsPage from './pages/CardsPage';
import SecurityPage from './pages/SecurityPage';
import NotificationsPage from './pages/NotificationsPage';
import AuroraBankLogo from './components/AuroraBankLogo';
import './App.css';

const stats = [
  { label: 'Customers', value: '2.3M+' },
  { label: 'Countries', value: '38' },
  { label: 'Daily Transactions', value: '4.1M' },
  { label: 'Uptime', value: '99.99%' },
];

const products = [
  {
    title: 'Everyday Checking',
    desc: 'No hidden fees, free ATM network, and instant card controls.',
    cta: 'Open Account',
  },
  {
    title: 'High-Yield Savings',
    desc: 'Earn up to 4.15% APY with FDIC coverage and automatic round-ups.',
    cta: 'Start Saving',
  },
  {
    title: 'Global Debit',
    desc: 'Zero foreign transaction fees with real-time FX alerts.',
    cta: 'Get the Card',
  },
];

const features = [
  {
    title: 'Real-time insights',
    desc: 'Smart notifications, spend analytics, and projected cash flow.',
  },
  {
    title: 'Security first',
    desc: 'Biometric sign-in, card freezes, and 24/7 fraud monitoring.',
  },
  {
    title: 'Human help, fast',
    desc: 'Talk to a specialist in under two minutes—anytime.',
  },
];

function App() {
  return (
    <BankProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/transfer" element={<RequireAuth><TransferPage /></RequireAuth>} />
        <Route path="/bills" element={<RequireAuth><BillsPage /></RequireAuth>} />
        <Route path="/transactions" element={<RequireAuth><TransactionsPage /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth><AdminPage /></RequireAuth>} />
        <Route path="/deposit" element={<RequireAuth><DepositPage /></RequireAuth>} />
        <Route path="/cards" element={<RequireAuth><CardsPage /></RequireAuth>} />
        <Route path="/security" element={<RequireAuth><SecurityPage /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
      </Routes>
    </BankProvider>
  );
}

function RequireAuth({ children }) {
  const { isAuthenticated } = useBankContext();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 gradient-veil" />
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="text-cyan-400">
              <AuroraBankLogo />
            </div>
            <span className="text-lg font-semibold tracking-tight">Aurora Bank</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
            <a className="hover:text-white" href="#products">Products</a>
            <a className="hover:text-white" href="#features">Features</a>
            <a className="hover:text-white" href="#support">Support</a>
            <Link to="/login" className="rounded-full border border-cyan-300/50 px-4 py-2 text-cyan-50 hover:border-cyan-200 hover:text-white">
              Sign In
            </Link>
          </nav>
        </div>

        <section className="mx-auto max-w-6xl px-6 pb-16 pt-8 md:pb-24 md:pt-12">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-50">
                Modern banking, human service
              </p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                Banking that moves
                <span className="text-cyan-300"> faster </span>
                than your life.
              </h1>
              <p className="text-lg text-slate-200 md:text-xl">
                Build savings, spend globally, and move money in real time with Aurora Bank’s secure cloud-native platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup" className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/30 transition hover:translate-y-0.5">
                  Get Started
                </Link>
                <Link to="/login" className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300 hover:text-cyan-100">
                  Sign In
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/5 bg-white/5 p-4 shadow-sm">
                    <div className="text-2xl font-semibold text-white">{item.value}</div>
                    <div className="text-sm text-slate-300">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="card-grid">
                <div className="card primary">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Balance</p>
                      <p className="mt-2 text-3xl font-semibold text-white">$48,920.15</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-cyan-50">Premium</span>
                  </div>
                  <div className="mt-6 space-y-2 text-sm text-slate-200">
                    <div className="flex justify-between">
                      <span>Checking</span>
                      <span>$18,400.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Savings</span>
                      <span>$30,520.15</span>
                    </div>
                  </div>
                  <button className="mt-6 w-full rounded-xl bg-white text-slate-900 py-3 text-sm font-semibold hover:bg-slate-100">
                    Transfer Now
                  </button>
                </div>
                <div className="card secondary">
                  <p className="text-sm text-slate-200">Spending This Week</p>
                  <p className="mt-3 text-2xl font-semibold text-white">$1,240</p>
                  <div className="mt-6 space-y-3">
                    {[['Groceries', 60], ['Transport', 35], ['Dining', 50]].map(([label, width]) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs text-slate-300">
                          <span>{label}</span>
                          <span>{width}%</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-cyan-300" style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </header>

      <main className="space-y-20 bg-slate-950 pb-20">
        <section id="products" className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Products</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Banking built to flex</h2>
            </div>
            <a className="text-sm text-cyan-200 hover:text-cyan-100" href="#">See all</a>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {products.map((product) => (
              <div key={product.title} className="group rounded-2xl border border-white/5 bg-white/5 p-6 shadow-sm transition hover:-translate-y-1 hover:border-cyan-200/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-300/20 text-cyan-100">→</div>
                <h3 className="mt-4 text-xl font-semibold text-white">{product.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{product.desc}</p>
                <button className="mt-4 text-sm font-semibold text-cyan-200 transition group-hover:text-cyan-100">
                  {product.cta}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 rounded-3xl border border-white/5 bg-gradient-to-r from-slate-900 to-slate-800 p-10 shadow-lg">
            <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Why Aurora</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Built for speed and safety</h2>
                <p className="mt-3 max-w-2xl text-slate-200">
                  Our platform is cloud-native with layered security, so you get instant transfers without sacrificing protection.
                </p>
              </div>
              <button className="rounded-full border border-cyan-200/40 px-5 py-2 text-sm font-semibold text-cyan-100 hover:border-cyan-200">Security Whitepaper</button>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-2xl border border-white/5 bg-white/5 p-6">
                  <div className="text-sm uppercase tracking-[0.2em] text-cyan-200">{feature.title}</div>
                  <p className="mt-3 text-sm text-slate-200">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="support" className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-8 rounded-3xl border border-white/5 bg-slate-900 p-10">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">24/7 Support</p>
              <h2 className="text-3xl font-semibold text-white">Humans on standby</h2>
              <p className="text-slate-200">
                Reach us by chat, phone, or email anytime. Average first response under two minutes.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-slate-200">
                <span className="rounded-full bg-white/5 px-3 py-2">US +1 (800) 555-1042</span>
                <span className="rounded-full bg-white/5 px-3 py-2">support@aurorabank.com</span>
                <span className="rounded-full bg-white/5 px-3 py-2">In-app chat</span>
              </div>
            </div>
            <div className="rounded-2xl border border-cyan-200/30 bg-cyan-300/5 p-6">
              <p className="text-sm text-cyan-100">Customer stories</p>
              <p className="mt-3 text-xl font-semibold text-white">“Aurora moved our payroll across 4 countries in seconds.”</p>
              <p className="mt-3 text-sm text-slate-300">— Lena Ortiz, CFO at Northwind Studio</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-slate-950 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-cyan-400/20 ring-1 ring-cyan-400/40" />
              <span className="text-lg font-semibold tracking-tight text-white">Aurora Bank</span>
            </div>
            <p className="mt-2 text-sm text-slate-400">FDIC insured up to $250,000 per depositor.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-300">
            <a className="hover:text-white" href="#products">Products</a>
            <a className="hover:text-white" href="#features">Security</a>
            <a className="hover:text-white" href="#support">Support</a>
            <a className="hover:text-white" href="#">Legal</a>
            <a className="hover:text-white" href="#">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;