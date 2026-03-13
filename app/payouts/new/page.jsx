'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function NewPayoutPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({ vendor_id: '', amount: '', mode: 'NEFT', note: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/vendors').then(r => r.json()),
    ]).then(([me, v]) => {
      if (!me.user) { window.location.href = '/login'; return; }
      if (me.user.role !== 'OPS') { window.location.href = '/payouts'; return; }
      setVendors((v.vendors || []).filter(x => x.is_active));
    }).finally(() => setPageLoading(false));
  }, []);

  function set(field) {
    return e => setForm(p => ({ ...p, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.vendor_id) { setError('Please select a vendor'); return; }
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      setError('Amount must be greater than 0'); return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create payout'); return; }
      router.push(`/payouts/${data.payout._id}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) return (
    <div className="layout">
      <Sidebar />
      <main className="main"><div className="loading"><div className="spinner" />Loading...</div></main>
    </div>
  );

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="header-row">
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1>New Payout</h1>
            <p>Create a draft payout request</p>
          </div>
          <a href="/payouts" className="btn btn-outline">← Back</a>
        </div>

        <div className="card" style={{ maxWidth: '560px' }}>
          <div className="card-header"><div className="card-title">Payout Details</div></div>
          <div className="card-body">
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Vendor *</label>
                <select className="form-select" value={form.vendor_id} onChange={set('vendor_id')} required>
                  <option value="">Select a vendor...</option>
                  {vendors.map(v => (
                    <option key={v._id} value={v._id}>{v.name}</option>
                  ))}
                </select>
                {vendors.length === 0 && (
                  <div className="form-error">No active vendors. <a href="/vendors/new">Add one first.</a></div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.amount}
                    onChange={set('amount')}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Mode *</label>
                  <select className="form-select" value={form.mode} onChange={set('mode')}>
                    <option value="NEFT">NEFT</option>
                    <option value="IMPS">IMPS</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Note <span className="opt">(optional)</span></label>
                <textarea
                  className="form-textarea"
                  value={form.note}
                  onChange={set('note')}
                  placeholder="e.g. Monthly retainer, Invoice #123..."
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading || vendors.length === 0}>
                  {loading ? <><div className="spinner" />Creating...</> : 'Create Payout'}
                </button>
                <a href="/payouts" className="btn btn-outline">Cancel</a>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
