import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, Users, LogOut, Zap } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const roleColor: Record<string, string> = {
    ADMIN:    '#00c896',   // Jade green
    ANALYST:  '#f59e0b',   // Amber gold
    VIEWER:   '#34d399',   // Mint green
  };

  const navItems = [
    { to: '/',        label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
    { to: '/records', label: 'Records',   icon: <Receipt size={18} /> },
    ...(user?.role === 'ADMIN' ? [{ to: '/users', label: 'Users', icon: <Users size={18} /> }] : []),
  ];

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={18} color="white" fill="white" />
        </div>
        <span className="sidebar-logo-text">FinanceOS</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role" style={{ color: roleColor[user?.role] || '#b3c5ff' }}>
              {user?.role || 'VIEWER'}
            </div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );
}
