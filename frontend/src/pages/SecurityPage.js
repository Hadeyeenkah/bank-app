import { Link } from 'react-router-dom';
import './Page.css';

function SecurityPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Security Center</p>
            <h1 className="text-3xl font-semibold text-white">Protect your account</h1>
            <p className="text-slate-300 mt-2">Manage authentication, alerts, and trusted devices.</p>
          </div>
          <Link to="/dashboard" className="text-cyan-300 hover:text-cyan-100 text-sm">← Back to dashboard</Link>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">Two-Factor Authentication</h2>
            <p className="text-sm text-slate-300 mt-2">Add an extra layer of protection with OTP or authenticator apps.</p>
            <button className="mt-4 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-300">Manage 2FA</button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">Login alerts</h2>
            <p className="text-sm text-slate-300 mt-2">Receive notifications for new device logins.</p>
            <button className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:border-cyan-300">Configure alerts</button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">Trusted devices</h2>
            <p className="text-sm text-slate-300 mt-2">Review and remove devices that have access.</p>
            <button className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:border-cyan-300">View devices</button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">Password</h2>
            <p className="text-sm text-slate-300 mt-2">Update your password regularly to keep your account secure.</p>
            <button className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:border-cyan-300">Change password</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecurityPage;
