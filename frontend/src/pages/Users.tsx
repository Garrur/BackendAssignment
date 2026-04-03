import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (id: string, newRole: string) => {
    try {
      await api.patch(`/users/${id}`, { role: newRole });
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to change role. Are you an Admin?');
    }
  };

  const deactivateUser = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate and kick this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to deactivate user');
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>Manage Users</h1>

      <div className="glass-card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--card-border)' }}>
              <th style={{ padding: '12px 0', fontWeight: 500 }}>Name</th>
              <th style={{ padding: '12px 0', fontWeight: 500 }}>Email</th>
              <th style={{ padding: '12px 0', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '12px 0', fontWeight: 500 }}>Role Control</th>
              <th style={{ padding: '12px 0', fontWeight: 500, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '16px 0', fontWeight: 500 }}>{u.name}</td>
                <td style={{ padding: '16px 0', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td style={{ padding: '16px 0' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                    background: u.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: u.status === 'ACTIVE' ? 'var(--success-color)' : 'var(--danger-color)'
                  }}>
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: '16px 0' }}>
                  <select 
                    className="glass-input" 
                    style={{ width: '120px', padding: '6px 10px' }}
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                  >
                    <option value="VIEWER">Viewer</option>
                    <option value="ANALYST">Analyst</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td style={{ padding: '16px 0', textAlign: 'right' }}>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => deactivateUser(u.id)} 
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    disabled={u.status !== 'ACTIVE'}
                  >
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
