import { useEffect, useState } from 'react';
import { api } from '../api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const INITIAL_FORM = {
  amount: '', type: 'EXPENSE', category: '',
  date: new Date().toISOString().split('T')[0], description: '',
};

export default function Records() {
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [saving, setSaving]     = useState(false);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const canWrite  = user?.role !== 'VIEWER';
  const canDelete = user?.role === 'ADMIN';

  useEffect(() => { fetchRecords(); }, []);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/records');
      setRecords(res.data.data.records);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setIsEditing(false); setEditId(null);
    setFormData(INITIAL_FORM); setShowModal(true);
  };

  const openEdit = (r: any) => {
    setIsEditing(true); setEditId(r.id);
    setFormData({
      amount: String(r.amount), type: r.type, category: r.category,
      date: new Date(r.date).toISOString().split('T')[0],
      description: r.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        amount: Number(formData.amount), type: formData.type,
        category: formData.category,
        date: new Date(formData.date).toISOString(),
        description: formData.description,
      };
      if (isEditing && editId) await api.patch(`/records/${editId}`, payload);
      else                     await api.post('/records', payload);
      setShowModal(false); fetchRecords();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to save record');
    } finally { setSaving(false); }
  };

  const deleteRecord = async (id: string) => {
    if (!confirm('Delete this record?')) return;
    try { await api.delete(`/records/${id}`); fetchRecords(); }
    catch { alert('Failed to delete record.'); }
  };

  const fmt = (n: number) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading) return (
    <div className="loading-screen">
      <div style={{ width: 20, height: 20, border: '2px solid rgba(0,200,150,0.15)', borderTop: '2px solid #00c896', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      Loading records...
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">All Records</h1>
          <p className="page-subtitle">{records.length} financial entries</p>
        </div>
        {canWrite && (
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Record
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 28 }}>Category</th>
              <th>Description</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              {canWrite && <th style={{ textAlign: 'right', paddingRight: 28 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {records.map((r: any) => (
              <tr key={r.id}>
                <td style={{ paddingLeft: 28 }}>
                  <span className="category-pill">{r.category}</span>
                </td>
                <td style={{ color: 'var(--on-surface-variant)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.description}
                </td>
                <td style={{ fontFamily: 'Space Grotesk, monospace', fontSize: '0.82rem', color: 'var(--on-surface-variant)' }}>
                  {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td style={{ textAlign: 'right' }} className={r.type === 'INCOME' ? 'amount-income' : 'amount-expense'}>
                  {r.type === 'INCOME' ? '+' : '-'}{fmt(r.amount)}
                </td>
                {canWrite && (
                  <td style={{ textAlign: 'right', paddingRight: 28 }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost" onClick={() => openEdit(r)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        <Pencil size={13} /> Edit
                      </button>
                      {canDelete && (
                        <button className="btn btn-danger" onClick={() => deleteRecord(r.id)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                          <Trash2 size={13} /> Delete
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-card">
            <h2 className="modal-title">{isEditing ? 'Edit Record' : 'New Record'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="form-label">Type</label>
                  <select className="form-input form-select" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Amount ($)</label>
                  <input type="number" className="form-input" required min="0.01" step="0.01" placeholder="0.00"
                    value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="form-label">Category</label>
                <input type="text" className="form-input" required placeholder="e.g. Salary, Utilities"
                  value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Date</label>
                <input type="date" className="form-input" required
                  value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Description</label>
                <input type="text" className="form-input" placeholder="Optional note"
                  value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving...' : isEditing ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
