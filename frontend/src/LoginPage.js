import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBankContext } from './context/BankContext';
import AuroraBankLogo from './components/AuroraBankLogo';
import './App.css';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useBankContext();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="absolute inset-0 -z-10 gradient-veil" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3 text-cyan-400">
          <AuroraBankLogo />
          <span className="text-lg font-semibold tracking-tight text-slate-50">Aurora Bank</span>
        </div>
        <Link to="/" className="rounded-full border border-cyan-300/50 px-4 py-2 text-sm text-cyan-50 hover:border-cyan-200 hover:text-white">
          ← Back to home
        </Link>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col items-center px-6 py-10 md:flex-row md:justify-between md:py-16">
        <div className="max-w-xl space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Secure Sign In</p>
          <h1 className="text-4xl font-semibold leading-tight text-white">Welcome back</h1>
          <p className="text-slate-200">
            Access your accounts with multi-factor authentication and enterprise-grade encryption.
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• Biometric login on supported devices</li>
            <li>• Instant card freeze and unfreeze</li>
            <li>• 24/7 fraud monitoring</li>
          </ul>
        </div>

        <div className="mt-10 w-full max-w-md md:mt-0">
          <div className="login-card">
            <h2 className="text-xl font-semibold text-white">Sign in</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-200" htmlFor="login-email">Email</label>
                <input 
                  id="login-email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="form-input" 
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-200">
                  <label htmlFor="login-password">Password</label>
                  <button type="button" className="text-cyan-200 hover:text-cyan-100">Forgot?</button>
                </div>
                <input 
                  id="login-password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="form-input" 
                  required
                />
              </div>
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <input id="remember" type="checkbox" className="h-4 w-4 rounded border-slate-600 bg-slate-800" />
                <label htmlFor="remember">Keep me signed in</label>
              </div>
              <button type="submit" className="w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/30 transition hover:translate-y-0.5">
                Continue
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-300">
              New to Aurora?{' '}
              <Link to="/signup" className="font-semibold text-cyan-200 hover:text-cyan-100">Create account</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
