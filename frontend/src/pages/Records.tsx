import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Records() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/records');
      setRecords(res.data.data.records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/records/${id}`);
      fetchRecords();
    } catch (err) {
      alert('Failed to delete record. Ensure you are an Admin.');
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      amount: '',
      type: 'EXPENSE',
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setShowModal(true);
  };

  const openEditModal = (record: any) => {
    setIsEditing(true);
    setEditId(record.id);
    setFormData({
      amount: String(record.amount),
      type: record.type,
      category: record.category,
      date: new Date(record.date).toISOString().split('T')[0],
      description: record.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        amount: Number(formData.amount),
        type: formData.type,
        category: formData.category,
        date: new Date(formData.date).toISOString(),
        description: formData.description
      };

      if (isEditing && editId) {
        await api.patch(`/records/${editId}`, payload);
      } else {
        await api.post('/records', payload);
      }
      
      setShowModal(false);
      fetchRecords(); // Refresh the table
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to save record');
    }
  };

  if (loading) return <div>Loading records...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem' }}>All Records</h1>
        {user?.role !== 'VIEWER' && (
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add Record
          </button>
        )}
      </div>

      <div className="glass-card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--card-border)' }}>
              <th style={{ padding: '12px 0', fontWeight: 500 }}>Category</th>
              <th style={{ padding: '12px 0', fontWeight: 500 }}>Description</th>
              <th style={{ padding: '12px 0', fontWeight: 500 }}>Date</th>
              <th style={{ padding: '12px 0', fontWeight: 500, textAlign: 'right' }}>Amount</th>
              {user?.role !== 'VIEWER' && <th style={{ padding: '12px 0', fontWeight: 500, textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {records.map((record: any) => (
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
                {user?.role !== 'VIEWER' && (
                  <td style={{ padding: '16px 0', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-primary" onClick={() => openEditModal(record)} style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--card-border)' }}>
                        Edit
                      </button>
                      {user?.role === 'ADMIN' && (
                        <button className="btn btn-danger" onClick={() => deleteRecord(record.id)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div className="glass-card" style={{ width: '400px', padding: '30px' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '1.4rem' }}>{isEditing ? 'Edit Record' : 'Create New Record'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Type</label>
                  <select 
                    className="glass-input" 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Amount ($)</label>
                  <input 
                    type="number" className="glass-input" required min="0.01" step="0.01"
                    value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Category</label>
                <input 
                  type="text" className="glass-input" required placeholder="e.g. Utilities, Salary"
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Date</label>
                <input 
                  type="date" className="glass-input" required
                  value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Description</label>
                <input 
                  type="text" className="glass-input" placeholder="Brief note"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn btn-danger" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {isEditing ? 'Update Record' : 'Save Record'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
