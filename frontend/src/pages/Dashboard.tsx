import { useEffect, useState } from 'react';
import { api } from '../api';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netBalance: 0 });
  const [recent, setRecent]   = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [sumRes, recRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/recent'),
        ]);
        setSummary(sumRes.data.data);
        setRecent(recRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="loading-screen">
      <div style={{
        width: 20, height: 20, border: '2px solid rgba(0,200,150,0.15)',
        borderTop: '2px solid #00c896', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      Loading dashboard...
    </div>
  );

  const fmt = (n: number) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const stats = [
    { label: 'Total Income',    value: fmt(summary.totalIncome),    type: 'income',  icon: <TrendingUp size={22} /> },
    { label: 'Total Expenses',  value: fmt(summary.totalExpenses),  type: 'expense', icon: <TrendingDown size={22} /> },
    { label: 'Net Balance',     value: fmt(summary.netBalance),     type: 'balance', icon: <Wallet size={22} /> },
  ];

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Good {getGreeting()}, {user.name?.split(' ')[0] || 'Admin'}
          </h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
        {stats.map(s => (
          <div key={s.label} className={`stat-card ${s.type}`}>
            <div className={`stat-icon ${s.type}`}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.type}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1rem', fontWeight: 700 }}>Recent Activity</h2>
          <span style={{ fontFamily: 'Space Grotesk, monospace', fontSize: '0.75rem', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Last {recent.length} records
          </span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r: any) => (
              <tr key={r.id}>
                <td><span className="category-pill">{r.category}</span></td>
                <td style={{ color: 'var(--on-surface-variant)' }}>{r.description}</td>
                <td style={{ color: 'var(--on-surface-variant)', fontFamily: 'Space Grotesk, monospace', fontSize: '0.82rem' }}>
                  {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td style={{ textAlign: 'right' }} className={r.type === 'INCOME' ? 'amount-income' : 'amount-expense'}>
                  {r.type === 'INCOME' ? '+' : '-'}{fmt(r.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
