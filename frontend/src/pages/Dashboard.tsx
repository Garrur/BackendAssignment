import { useEffect, useState } from 'react';
import { api } from '../api';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [sumRes, recRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/recent')
        ]);
        setSummary(sumRes.data.data);
        setRecent(recRes.data.data);
      } catch (err) {
        console.error('Dashboard fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const StatCard = ({ title, value, icon, type }: any) => (
    <div className="glass-card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: type === 'income' ? 'rgba(16, 185, 129, 0.1)' : type === 'expense' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
        color: type === 'income' ? 'var(--success-color)' : type === 'expense' ? 'var(--danger-color)' : 'var(--accent-color)'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>${Number(value).toLocaleString()}</div>
      </div>
    </div>
  );

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '1.8rem' }}>Overview</h1>
      
      <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
        <StatCard title="Total Income" value={summary.totalIncome} type="income" icon={<TrendingUp />} />
        <StatCard title="Total Expenses" value={summary.totalExpense} type="expense" icon={<TrendingDown />} />
        <StatCard title="Net Balance" value={summary.netBalance} type="balance" icon={<DollarSign />} />
      </div>

      <div className="glass-card">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Recent Activity</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--card-border)' }}>
              <th style={{ padding: '12px 0', fontWeight: 500 }}>Category</th>
              <th style={{ padding: '12px 0', fontWeight: 500 }}>Description</th>
              <th style={{ padding: '12px 0', fontWeight: 500 }}>Date</th>
              <th style={{ padding: '12px 0', fontWeight: 500, textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((record: any) => (
              <tr key={record.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '16px 0' }}>{record.category}</td>
                <td style={{ padding: '16px 0', color: 'var(--text-secondary)' }}>{record.description}</td>
                <td style={{ padding: '16px 0', color: 'var(--text-secondary)' }}>{new Date(record.date).toLocaleDateString()}</td>
                <td style={{ 
                  padding: '16px 0', 
                  textAlign: 'right',
                  color: record.type === 'INCOME' ? 'var(--success-color)' : 'var(--danger-color)',
                  fontWeight: 500
                }}>
                  {record.type === 'INCOME' ? '+' : '-'}${Number(record.amount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
