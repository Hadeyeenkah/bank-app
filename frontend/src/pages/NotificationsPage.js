import { Link } from 'react-router-dom';
import './Page.css';

const sampleNotifications = [
  { id: 1, title: 'Deposit received', detail: 'Salary deposit of $5,200', time: 'Today, 09:15' },
  { id: 2, title: 'Transfer completed', detail: 'You sent $250 to Alex Smith', time: 'Today, 08:02' },
  { id: 3, title: 'Card purchase', detail: 'Spent $152.43 at Grocery Store', time: 'Yesterday, 18:41' },
];

function NotificationsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Notifications</p>
            <h1 className="text-3xl font-semibold text-white">Your latest alerts</h1>
            <p className="text-slate-300 mt-2">Real-time updates about your account activity.</p>
          </div>
          <Link to="/dashboard" className="text-cyan-300 hover:text-cyan-100 text-sm">← Back to dashboard</Link>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/5">
          {sampleNotifications.map((n) => (
            <div key={n.id} className="p-4 hover:bg-white/5 transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{n.title}</div>
                  <div className="text-xs text-slate-400 mt-1">{n.detail}</div>
                </div>
                <div className="text-[11px] text-slate-500">{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
