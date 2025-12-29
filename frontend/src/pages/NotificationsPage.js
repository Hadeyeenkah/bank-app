import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBankContext } from '../context/BankContext';
import './Page.css';

function NotificationsPage() {
  const { currentUser } = useBankContext();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, transactions, security, account
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    transactions: true,
    security: true,
    account: true,
    marketing: false,
  });

  // Initialize with some historical notifications
  useEffect(() => {
    const initialNotifications = [
      {
        id: Date.now() - 1000000,
        type: 'transaction',
        title: 'Salary Deposit',
        detail: `Deposit of $5,200.00 received`,
        time: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        icon: '💰',
      },
      {
        id: Date.now() - 2000000,
        type: 'security',
        title: 'New Login Detected',
        detail: 'Login from Chrome on Linux, Delaware, US',
        time: new Date(Date.now() - 7200000).toISOString(),
        read: false,
        icon: '🔐',
      },
      {
        id: Date.now() - 3000000,
        type: 'transaction',
        title: 'Card Purchase',
        detail: 'Spent $152.43 at Grocery Store',
        time: new Date(Date.now() - 86400000).toISOString(),
        read: true,
        icon: '💳',
      },
      {
        id: Date.now() - 4000000,
        type: 'transaction',
        title: 'Transfer Completed',
        detail: 'You sent $250.00 to Alex Smith',
        time: new Date(Date.now() - 172800000).toISOString(),
        read: true,
        icon: '↗️',
      },
      {
        id: Date.now() - 5000000,
        type: 'account',
        title: 'Monthly Statement Available',
        detail: 'Your December statement is now available',
        time: new Date(Date.now() - 259200000).toISOString(),
        read: true,
        icon: '📄',
      },
      {
        id: Date.now() - 6000000,
        type: 'security',
        title: 'Password Changed',
        detail: 'Your password was successfully updated',
        time: new Date(Date.now() - 345600000).toISOString(),
        read: true,
        icon: '🔑',
      },
    ];
    setNotifications(initialNotifications);
  }, []);

  // Real-time notification generator simulating account activity
  useEffect(() => {
    const notificationTemplates = {
      transaction: [
        { title: 'Payment Processed', detail: 'Bill payment of $120.00 succeeded', icon: '✅' },
        { title: 'Card Authorization', detail: 'Pending card auth $32.10 at Coffee Shop', icon: '☕' },
        { title: 'Transfer Initiated', detail: 'Transfer of $500.00 to Savings account', icon: '💸' },
        { title: 'Direct Deposit', detail: 'Deposit of $3,200.00 received', icon: '💰' },
        { title: 'ATM Withdrawal', detail: 'Withdrew $200.00 at Main Street ATM', icon: '🏧' },
        { title: 'Online Purchase', detail: 'Spent $89.99 at Amazon.com', icon: '📦' },
      ],
      security: [
        { title: 'Login Alert', detail: 'New sign-in from Safari on iPhone', icon: '🔐' },
        { title: 'Security Check', detail: 'Account security scan completed - all clear', icon: '🛡️' },
        { title: '2FA Enabled', detail: 'Two-factor authentication is now active', icon: '🔒' },
        { title: 'Unusual Activity', detail: 'Login attempt from unknown location blocked', icon: '⚠️' },
      ],
      account: [
        { title: 'Interest Earned', detail: 'Earned $12.45 in savings interest this month', icon: '📈' },
        { title: 'Account Update', detail: 'Your profile information was updated', icon: '👤' },
        { title: 'Reward Points', detail: 'You earned 150 reward points', icon: '⭐' },
        { title: 'Service Message', detail: 'Scheduled maintenance on Jan 15, 2am-4am', icon: '🔧' },
      ],
    };

    const interval = setInterval(() => {
      // Only generate notifications based on preferences
      const enabledTypes = Object.entries(preferences)
        .filter(([key, value]) => value && key !== 'marketing')
        .map(([key]) => key === 'transactions' ? 'transaction' : key);

      if (enabledTypes.length === 0) return;

      const randomType = enabledTypes[Math.floor(Math.random() * enabledTypes.length)];
      const templates = notificationTemplates[randomType];
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

      const newNotification = {
        id: Date.now(),
        type: randomType,
        title: randomTemplate.title,
        detail: randomTemplate.detail,
        time: new Date().toISOString(),
        read: false,
        icon: randomTemplate.icon,
      };

      setNotifications((prev) => [newNotification, ...prev].slice(0, 50)); // Keep last 50
    }, 15000); // New notification every 15 seconds

    return () => clearInterval(interval);
  }, [preferences]);

  // Format relative time
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'transactions') return n.type === 'transaction';
    if (filter === 'security') return n.type === 'security';
    if (filter === 'account') return n.type === 'account';
    return true;
  });

  // Mark as read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Clear all notifications
  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  };

  // Save preferences
  const savePreferences = () => {
    setShowSettings(false);
    // In a real app, this would save to backend
    alert('Notification preferences saved successfully!');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="absolute inset-0 -z-10 gradient-veil" />
      
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Notifications</p>
            <h1 className="text-3xl font-semibold text-white">Your latest alerts</h1>
            <p className="text-slate-300 mt-2">
              Real-time updates about your account activity.
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs font-semibold text-cyan-400">
                  {unreadCount} unread
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="text-slate-400 hover:text-cyan-300 transition"
              title="Notification settings"
            >
              ⚙️
            </button>
            <Link to="/dashboard" className="text-cyan-300 hover:text-cyan-100 text-sm">
              ← Back to dashboard
            </Link>
          </div>
        </header>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'transactions', label: 'Transactions', count: notifications.filter(n => n.type === 'transaction').length },
              { key: 'security', label: 'Security', count: notifications.filter(n => n.type === 'security').length },
              { key: 'account', label: 'Account', count: notifications.filter(n => n.type === 'account').length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === tab.key
                    ? 'bg-cyan-400 text-slate-900'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition"
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-sm text-red-400 hover:text-red-300 transition"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live updates enabled
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <div className="text-5xl mb-4">🔔</div>
            <p className="text-lg text-slate-300">No notifications to show</p>
            <p className="text-sm text-slate-400 mt-2">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "When you have account activity, you'll see it here."}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/5">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-white/5 transition group ${
                  !notification.read ? 'bg-cyan-500/5 border-l-4 border-l-cyan-500' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl mt-1">{notification.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-white">{notification.title}</div>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          notification.type === 'transaction' ? 'bg-blue-500/20 text-blue-400' :
                          notification.type === 'security' ? 'bg-red-500/20 text-red-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {notification.type}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{notification.detail}</div>
                      <div className="text-[11px] text-slate-500 mt-2">
                        {formatTime(notification.time)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 transition"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-xs text-red-400 hover:text-red-300 transition"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {notifications.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Total Notifications</p>
              <p className="text-2xl font-semibold text-white mt-1">{notifications.length}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Unread</p>
              <p className="text-2xl font-semibold text-cyan-400 mt-1">{unreadCount}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Today</p>
              <p className="text-2xl font-semibold text-white mt-1">
                {notifications.filter(n => {
                  const diffHours = (new Date() - new Date(n.time)) / 3600000;
                  return diffHours < 24;
                }).length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Notification Preferences</h2>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white text-2xl">
                ×
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-300">Choose which notifications you want to receive:</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                  <div>
                    <p className="text-sm font-semibold text-white">Transaction Alerts</p>
                    <p className="text-xs text-slate-400 mt-1">Deposits, withdrawals, and purchases</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.transactions}
                    onChange={(e) => setPreferences({ ...preferences, transactions: e.target.checked })}
                    className="h-5 w-5 rounded border-white/10"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                  <div>
                    <p className="text-sm font-semibold text-white">Security Alerts</p>
                    <p className="text-xs text-slate-400 mt-1">Login attempts and security changes</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.security}
                    onChange={(e) => setPreferences({ ...preferences, security: e.target.checked })}
                    className="h-5 w-5 rounded border-white/10"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                  <div>
                    <p className="text-sm font-semibold text-white">Account Updates</p>
                    <p className="text-xs text-slate-400 mt-1">Statements, rewards, and service updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.account}
                    onChange={(e) => setPreferences({ ...preferences, account: e.target.checked })}
                    className="h-5 w-5 rounded border-white/10"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                  <div>
                    <p className="text-sm font-semibold text-white">Marketing & Offers</p>
                    <p className="text-xs text-slate-400 mt-1">Promotions and special offers</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="h-5 w-5 rounded border-white/10"
                  />
                </div>
              </div>

              <button
                onClick={savePreferences}
                className="w-full rounded-lg bg-cyan-400 px-4 py-3 font-semibold text-slate-900 hover:bg-cyan-300 transition"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
