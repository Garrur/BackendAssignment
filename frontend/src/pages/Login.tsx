import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ textAlign: 'center', margin: 0 }}>Finance Portal</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: 0 }}>Log in to your account</p>
        
        {error && <div style={{ color: 'var(--danger-color)', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
            <input 
              type="email" 
              className="glass-input" 
              style={{ paddingLeft: '40px' }}
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
            <input 
              type="password" 
              className="glass-input" 
              style={{ paddingLeft: '40px' }}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', padding: '12px' }}>
            Sign In
          </button>
        </form>
        
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Demo Accounts:<br/>
          admin@finance.dev | Password123!<br/>
          analyst@finance.dev | Password123!<br/>
          viewer@finance.dev | Password123!
        </div>
      </div>
    </div>
  );
}
