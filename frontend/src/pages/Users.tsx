import { useEffect, useState } from 'react';
import { api } from '../api';
import { ShieldCheck } from 'lucide-react';

export default function Users() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data.users);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const changeRole = async (id: string, role: string) => {
    try { await api.patch(`/users/${id}`, { role }); fetchUsers(); }
    catch (err: any) { alert(err.response?.data?.error?.message || 'Failed to change role'); }
  };

  const deactivate = async (id: string) => {
    if (!confirm('Deactivate this user?')) return;
    try { await api.delete(`/users/${id}`); fetchUsers(); }
    catch (err: any) { alert(err.response?.data?.error?.message || 'Failed to deactivate user'); }
  };

  const roleColor: Record<string, string> = {
    ADMIN:   '#00c896',   // Jade green
    ANALYST: '#f59e0b',   // Amber gold
    VIEWER:  '#34d399',   // Mint green
  };

  if (loading) return (
    <div className="loading-screen">
      <div style={{ width: 20, height: 20, border: '2px solid rgba(0,200,150,0.15)', borderTop: '2px solid #00c896', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      Loading users...
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} registered accounts</p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.2)',
          borderRadius: 8, padding: '8px 14px',
          fontFamily: 'Space Grotesk, monospace', fontSize: '0.8rem',
          color: 'var(--primary)', fontWeight: 600,
        }}>
          <ShieldCheck size={15} />
          Admin access only
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 28 }}>User</th>
              <th>Email</th>
              <th>Status</th>
              <th>Role</th>
              <th style={{ textAlign: 'right', paddingRight: 28 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => {
              const initials = u.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
              return (
                <tr key={u.id}>
                  <td style={{ paddingLeft: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        background: `linear-gradient(135deg, ${roleColor[u.role] || '#b3c5ff'}33, ${roleColor[u.role] || '#b3c5ff'}11)`,
                        border: `1px solid ${roleColor[u.role] || '#b3c5ff'}44`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Space Grotesk, monospace', fontSize: '0.75rem',
                        fontWeight: 700, color: roleColor[u.role] || '#b3c5ff',
                      }}>
                        {initials}
                      </div>
                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'Space Grotesk, monospace', fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>
                    {u.email}
                  </td>
                  <td>
                    <span className={`status-badge ${u.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-input form-select"
                      style={{
                        width: 130, padding: '6px 36px 6px 12px', fontSize: '0.82rem',
                        fontFamily: 'Space Grotesk, monospace', fontWeight: 600,
                        color: roleColor[u.role] || '#b3c5ff',
                      }}
                      value={u.role}
                      onChange={e => changeRole(u.id, e.target.value)}
                    >
                      <option value="VIEWER">Viewer</option>
                      <option value="ANALYST">Analyst</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: 28 }}>
                    <button
                      className="btn btn-danger"
                      onClick={() => deactivate(u.id)}
                      disabled={u.status !== 'ACTIVE'}
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
