import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useBankContext } from './context/BankContext';
import AuroraBankLogo from './components/AuroraBankLogo';
import './App.css';

function Dashboard() {
  const { currentUser, logout, updateProfile } = useBankContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Deposit received', detail: 'Salary deposit of $5,200', time: '2m ago' },
    { id: 2, title: 'Card purchase', detail: 'Spent $152.43 at Grocery Store', time: '30m ago' },
    { id: 3, title: 'Login', detail: 'New sign-in from Chrome on Linux', time: '1h ago' },
  ]);
  const [formData, setFormData] = useState({
    firstName: currentUser?.name.split(' ')[0] || '',
    lastName: currentUser?.name.split(' ').slice(1).join(' ') || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    avatarUrl: currentUser?.avatarUrl || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Keep form data in sync with latest user profile
  useEffect(() => {
    if (!currentUser) return;
    setFormData({
      firstName: currentUser.name.split(' ')[0] || '',
      lastName: currentUser.name.split(' ').slice(1).join(' ') || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      avatarUrl: currentUser.avatarUrl || '',
    });
  }, [currentUser]);

  // Real-time notifications: try SSE stream, fall back to gentle client-side ticks
  useEffect(() => {
    const notificationsUrl = process.env.REACT_APP_NOTIFICATIONS_URL || 'http://localhost:5000/api/notifications/stream';
    let source;
    let interval;

    const pushLocal = (payload) => {
      setNotifications((prev) => {
        const nextId = (prev[0]?.id || 0) + 1;
        const updated = [{ id: nextId, ...payload }, ...prev];
        return updated.slice(0, 10);
      });
    };

    const startFallback = () => {
      if (interval) return;
      interval = setInterval(() => {
        const samples = [
          { title: 'Payment processed', detail: 'Bill payment of $120 succeeded', time: 'just now' },
          { title: 'Card authorization', detail: 'Pending card auth $32.10 at Coffee Shop', time: 'just now' },
          { title: 'Transfer completed', detail: 'You sent $250 to Alex Smith', time: 'just now' },
        ];
        const sample = samples[Math.floor(Math.random() * samples.length)];
        pushLocal(sample);
      }, 12000);
    };

    try {
      source = new EventSource(notificationsUrl, { withCredentials: true });
      source.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          pushLocal({
            title: data.title || 'Account update',
            detail: data.detail || data.message || 'New activity on your account',
            time: data.time || 'just now',
          });
        } catch {
          pushLocal({ title: 'Notification', detail: event.data, time: 'just now' });
        }
      };
      source.onerror = () => {
        source?.close();
        startFallback();
      };
    } catch {
      startFallback();
    }

    return () => {
      source?.close();
      if (interval) clearInterval(interval);
    };
  }, []);

  // Handle flash notification coming from navigation state (e.g., transfer success)
  useEffect(() => {
    const flash = location.state?.notification;
    if (!flash) return;
    setNotifications((prev) => {
      const nextId = (prev[0]?.id || 0) + 1;
      return [{ id: nextId, ...flash }, ...prev].slice(0, 10);
    });
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate]);

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <p>Please log in to access your dashboard</p>
          <Link to="/login" className="mt-4 inline-block text-cyan-400 hover:text-cyan-300">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const user = currentUser;

  const recentTransactions = currentUser.transactions.slice(0, 5);

  const quickActions = [
    { title: 'Transfer Money', icon: '→', link: '/transfer' },
    { title: 'Pay Bills', icon: '💳', link: '/bills' },
    { title: 'Deposit Check', icon: '📄', link: '/deposit' },
    { title: 'Card Controls', icon: '🔒', link: '/cards' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    setShowProfileMenu(false);
    navigate(path);
  };

  const handleSaveProfile = async () => {
    setSaveError('');
    setSavingProfile(true);
    const result = await updateProfile(formData);
    setSavingProfile(false);
    if (!result.success) {
      setSaveError(result.message || 'Update failed');
      return;
    }
    if (result.user) {
      setFormData({
        firstName: result.user.firstName || '',
        lastName: result.user.lastName || '',
        email: result.user.email || '',
        phone: result.user.phone || '',
        avatarUrl: result.user.avatarUrl || '',
      });
    }
    setEditMode(false);
    setShowSettingsModal(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, avatarUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur relative z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-cyan-400">
              <AuroraBankLogo />
              <span className="text-lg font-semibold tracking-tight text-slate-50">Aurora Bank</span>
            </div>
            
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="rounded-full border border-white/10 p-2 hover:border-cyan-200/50 transition"
              >
                <span className="text-lg">🔔</span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-white/10 bg-slate-900 shadow-2xl z-50">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    <button
                      className="text-xs text-cyan-300 hover:text-cyan-200"
                      onClick={() => setNotifications([])}
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                    {notifications.length === 0 && (
                      <div className="p-4 text-sm text-slate-400">No new notifications</div>
                    )}
                    {notifications.map((n) => (
                      <div key={n.id} className="p-4 hover:bg-white/5 transition">
                        <div className="text-sm font-semibold text-white">{n.title}</div>
                        <div className="text-xs text-slate-400 mt-1">{n.detail}</div>
                        <div className="text-[11px] text-slate-500 mt-1">{n.time}</div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 px-4 py-3 text-right">
                    <button
                      onClick={() => handleNavigate('/notifications')}
                      className="text-sm text-cyan-300 hover:text-cyan-200"
                    >
                      View all
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 transition hover:opacity-80"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Profile avatar"
                    className="h-10 w-10 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden md:block">
                  <div className="text-sm font-semibold text-white">{user.name}</div>
                  <div className="text-xs text-slate-400">{user.accountNumber}</div>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-slate-900 shadow-2xl z-50">
                  <div className="border-b border-white/10 p-4">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt="Profile avatar"
                          className="h-12 w-12 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-white">{user.name}</div>
                        <div className="text-xs text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setShowSettingsModal(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/5 text-slate-200 transition text-sm flex items-center gap-2"
                    >
                      <span>⚙️</span> Profile Settings
                    </button>
                    <button
                      onClick={() => handleNavigate('/security')}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/5 text-slate-200 transition text-sm flex items-center gap-2"
                    >
                      <span>🔐</span> Security
                    </button>
                    <button
                      onClick={() => handleNavigate('/notifications')}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/5 text-slate-200 transition text-sm flex items-center gap-2"
                    >
                      <span>🔔</span> Notifications
                    </button>
                    <button
                      onClick={() => handleNavigate('/transactions')}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/5 text-slate-200 transition text-sm flex items-center gap-2"
                    >
                      <span>💸</span> Transactions
                    </button>
                    <div className="border-t border-white/10 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-red-500/10 text-red-400 transition text-sm flex items-center gap-2"
                    >
                      <span>🚪</span> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="mt-2 text-slate-300">Here's what's happening with your accounts today.</p>
        </div>

        {/* Account Balance Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="card primary md:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Total Balance</p>
                <p className="mt-3 text-4xl font-semibold text-white">${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
              <span className="rounded-full bg-white/10 px-4 py-2 text-xs text-cyan-50">Premium Account</span>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-300">Checking</p>
                <p className="mt-2 text-2xl font-semibold text-white">${user.checking.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-slate-300">Savings</p>
                <p className="mt-2 text-2xl font-semibold text-white">${user.savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          <div className="card secondary">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Quick Transfer</p>
            <form className="mt-4 space-y-4">
              <input
                type="text"
                placeholder="Recipient"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none focus:border-cyan-300/50"
              />
              <input
                type="number"
                placeholder="Amount"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none focus:border-cyan-300/50"
              />
              <button type="submit" className="w-full rounded-xl bg-cyan-400 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300">
                Send Money
              </button>
            </form>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.link}
                className="group rounded-2xl border border-white/5 bg-white/5 p-6 text-left transition hover:-translate-y-1 hover:border-cyan-200/50"
              >
                <div className="mb-3 text-3xl">{action.icon}</div>
                <div className="text-sm font-semibold text-white">{action.title}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
            <Link to="/transactions" className="text-sm text-cyan-200 hover:text-cyan-100">View all</Link>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                      <span className="text-lg">{transaction.amount < 0 ? '↓' : '↑'}</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{transaction.description}</div>
                      <div className="text-xs text-slate-400">
                        {transaction.date} • {transaction.category}
                        {transaction.status === 'pending' && ' • Pending approval'}
                        {transaction.status === 'rejected' && ' • Rejected'}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ${transaction.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Spending Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Spending This Month</h3>
            <div className="space-y-4">
              {[
                { category: 'Groceries', amount: 842.50, percent: 28 },
                { category: 'Dining', amount: 520.00, percent: 17 },
                { category: 'Transport', amount: 380.00, percent: 13 },
                { category: 'Shopping', amount: 650.00, percent: 22 },
                { category: 'Other', amount: 607.50, percent: 20 },
              ].map((item) => (
                <div key={item.category}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-200">{item.category}</span>
                    <span className="text-white">${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-cyan-400" style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Financial Insights</h3>
            <div className="space-y-4">
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xl">✓</span>
                  <span className="text-sm font-semibold text-green-400">On Track</span>
                </div>
                <p className="text-sm text-slate-300">You're spending 15% less than last month. Great job!</p>
              </div>
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  <span className="text-sm font-semibold text-blue-400">Tip</span>
                </div>
                <p className="text-sm text-slate-300">Set up automatic transfers to savings to reach your $50K goal faster.</p>
              </div>
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  <span className="text-sm font-semibold text-cyan-400">Forecast</span>
                </div>
                <p className="text-sm text-slate-300">At this rate, you'll save $3,200 by the end of the quarter.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 border-b border-white/10 bg-slate-900 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Profile Settings</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white transition text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center gap-4">
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt="Avatar"
                    className="h-24 w-24 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-4xl">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <label className="px-4 py-2 rounded-lg bg-cyan-400/20 text-cyan-300 hover:bg-cyan-400/30 transition text-sm font-medium cursor-pointer">
                  Change Picture
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {editMode ? (
                  // Edit Form
                  <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-300 block mb-2">First Name</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-white outline-none focus:border-cyan-400 transition"
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-300 block mb-2">Last Name</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-white outline-none focus:border-cyan-400 transition"
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-300 block mb-2">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-white outline-none focus:border-cyan-400 transition"
                        placeholder="Email"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300 block mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-white outline-none focus:border-cyan-400 transition"
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSaveProfile}
                        className="flex-1 px-4 py-2 bg-cyan-400 text-slate-900 rounded-lg font-semibold hover:bg-cyan-300 transition disabled:opacity-50"
                        disabled={savingProfile}
                      >
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="flex-1 px-4 py-2 bg-white/10 text-slate-200 rounded-lg font-semibold hover:bg-white/20 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-3">
                    {saveError && (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                        {saveError}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                        <p className="text-xs text-slate-400 mb-1">First Name</p>
                        <p className="text-white font-medium">{user.name.split(' ')[0]}</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                        <p className="text-xs text-slate-400 mb-1">Last Name</p>
                        <p className="text-white font-medium">{user.name.split(' ').slice(1).join(' ')}</p>
                      </div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                      <p className="text-xs text-slate-400 mb-1">Email Address</p>
                      <p className="text-white font-medium">{user.email}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                      <p className="text-xs text-slate-400 mb-1">Phone Number</p>
                      <p className="text-white font-medium">{user.phone || 'Not provided'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <p className="text-xs text-slate-400 mb-1">Account Number</p>
                    <p className="text-white font-mono font-medium text-lg">{user.accountNumber}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <p className="text-xs text-slate-400 mb-1">Total Balance</p>
                    <p className="text-white font-semibold text-lg">${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <p className="text-xs text-slate-400 mb-1">Checking</p>
                    <p className="text-white font-semibold text-lg">${user.checking.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <p className="text-xs text-slate-400 mb-1">Savings</p>
                    <p className="text-white font-semibold text-lg">${user.savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Security</h3>
                <button className="w-full px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition text-left flex items-center justify-between">
                  <span>Change Password</span>
                  <span>→</span>
                </button>
                <button className="w-full px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition text-left flex items-center justify-between">
                  <span>Two-Factor Authentication</span>
                  <span className="text-cyan-400">Enabled</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
