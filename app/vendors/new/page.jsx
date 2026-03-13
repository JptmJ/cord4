'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function NewVendorPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', upi_id: '', bank_account: '', ifsc: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { window.location.href = '/login'; return; }
      if (d.user.role !== 'OPS') { window.location.href = '/vendors'; }
    });
  }, []);

  function set(field) {
    return e => setForm(p => ({ ...p, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Vendor name is required'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create vendor'); return; }
      router.push('/vendors');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="header-row">
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1>Add Vendor</h1>
            <p>Create a new payout recipient</p>
          </div>
          <a href="/vendors" className="btn btn-outline">← Back</a>
        </div>

        <div className="card" style={{ maxWidth: '560px' }}>
          <div className="card-header"><div className="card-title">Vendor Details</div></div>
          <div className="card-body">
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={form.name} onChange={set('name')} placeholder="Acme Corp" required />
              </div>
              <div className="form-group">
                <label className="form-label">UPI ID <span className="opt">(optional)</span></label>
                <input className="form-input" value={form.upi_id} onChange={set('upi_id')} placeholder="vendor@upi" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Bank Account <span className="opt">(optional)</span></label>
                  <input className="form-input" value={form.bank_account} onChange={set('bank_account')} placeholder="1234567890" />
                </div>
                <div className="form-group">
                  <label className="form-label">IFSC <span className="opt">(optional)</span></label>
                  <input className="form-input" value={form.ifsc} onChange={set('ifsc')} placeholder="HDFC0001234" style={{ textTransform: 'uppercase' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><div className="spinner" />Creating...</> : 'Create Vendor'}
                </button>
                <a href="/vendors" className="btn btn-outline">Cancel</a>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
