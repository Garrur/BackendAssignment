import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Zap } from 'lucide-react';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'Admin',   email: 'admin@finance.dev',   color: '#b3c5ff' },
    { role: 'Analyst', email: 'analyst@finance.dev', color: '#d0bcff' },
    { role: 'Viewer',  email: 'viewer@finance.dev',  color: '#4cd6ff' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-canvas)',
      backgroundImage: 'radial-gradient(ellipse at 60% 20%, rgba(0,200,150,0.1) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(245,158,11,0.07) 0%, transparent 50%)',
    }}>
      {/* Login card */}
      <div style={{
        width: '420px',
        background: 'rgba(27,31,44,0.7)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(0,200,150,0.2)',
        borderRadius: '20px',
        padding: '44px',
        boxShadow: '0 32px 64px rgba(0,0,0,0.5), 0 0 40px rgba(0,200,150,0.08)',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #00c896 0%, #00a87c 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0,200,150,0.4)',
          }}>
            <Zap size={22} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              FinanceOS
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '-2px' }}>
              Secure access portal
            </div>
          </div>
        </div>

        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Sign in
        </h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', marginBottom: '28px' }}>
          Enter your credentials to access the dashboard
        </p>

        {error && <div className="error-banner" style={{ marginBottom: '20px' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: '8px', padding: '14px', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo accounts */}
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(66,70,86,0.4)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Demo Accounts — Password: <span style={{ fontFamily: 'Space Grotesk, monospace', color: 'var(--on-surface-variant)' }}>Password123!</span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {demoAccounts.map(acc => (
              <button
                key={acc.role}
                type="button"
                onClick={() => { setEmail(acc.email); setPassword('Password123!'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: 'var(--surface-high)', border: '1px solid rgba(66,70,86,0.4)',
                  borderRadius: '8px', padding: '9px 14px', cursor: 'pointer',
                  transition: 'all 0.15s', textAlign: 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(66,70,86,0.8)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(66,70,86,0.4)')}
              >
                <span style={{
                  fontFamily: 'Space Grotesk, monospace', fontSize: '0.7rem', fontWeight: 700,
                  color: acc.color, background: `${acc.color}18`, borderRadius: '4px',
                  padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  {acc.role}
                </span>
                <span style={{ fontFamily: 'Space Grotesk, monospace', fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>
                  {acc.email}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
