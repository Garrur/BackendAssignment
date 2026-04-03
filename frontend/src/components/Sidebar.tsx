import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, Users, LogOut } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    textDecoration: 'none',
    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
    borderRight: isActive ? '3px solid var(--accent-color)' : '3px solid transparent',
    transition: 'all 0.2s ease',
    fontWeight: isActive ? 500 : 400,
  });

  return (
    <div className="sidebar">
      <div style={{ padding: '24px 20px', fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent-color)', borderBottom: '1px solid var(--card-border)' }}>
        FinanceApp
      </div>
      
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '20px' }}>
        <NavLink to="/" style={navLinkStyle} end>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink to="/records" style={navLinkStyle}>
          <Receipt size={20} />
          Records
        </NavLink>
        {user?.role === 'ADMIN' && (
          <NavLink to="/users" style={navLinkStyle}>
            <Users size={20} />
            Users
          </NavLink>
        )}
      </nav>

      <div style={{ padding: '20px', borderTop: '1px solid var(--card-border)' }}>
        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '12px', 
            background: 'transparent', border: 'none', color: 'var(--text-secondary)', 
            cursor: 'pointer', padding: '10px', width: '100%', fontSize: '1rem' 
          }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}
