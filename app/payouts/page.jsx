'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVendor, setFilterVendor] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/vendors').then(r => r.json()),
    ]).then(([me, v]) => {
      if (!me.user) { window.location.href = '/login'; return; }
      setUser(me.user);
      setVendors(v.vendors || []);
      loadPayouts('', '');
    });
  }, []);

  function loadPayouts(status, vendor) {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (vendor) params.set('vendor_id', vendor);
    fetch(`/api/payouts?${params}`).then(r => r.json()).then(d => {
      setPayouts(d.payouts || []);
    }).finally(() => setLoading(false));
  }

  function handleStatusChange(e) {
    setFilterStatus(e.target.value);
    loadPayouts(e.target.value, filterVendor);
  }

  function handleVendorChange(e) {
    setFilterVendor(e.target.value);
    loadPayouts(filterStatus, e.target.value);
  }

  function formatAmount(n) {
    return '₹' + Number(n).toLocaleString('en-IN');
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="header-row">
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1>Payouts</h1>
            <p>Track and manage all payout requests</p>
          </div>
          {user?.role === 'OPS' && (
            <a href="/payouts/new" className="btn btn-primary">+ New Payout</a>
          )}
        </div>

        <div className="filters">
          <select className="filter-select" value={filterStatus} onChange={handleStatusChange}>
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Resubmitted">Resubmitted</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select className="filter-select" value={filterVendor} onChange={handleVendorChange}>
            <option value="">All Vendors</option>
            {vendors.map(v => (
              <option key={v._id} value={v._id}>{v.name}</option>
            ))}
          </select>
          {(filterStatus || filterVendor) && (
            <button className="btn btn-sm btn-outline" onClick={() => { setFilterStatus(''); setFilterVendor(''); loadPayouts('', ''); }}>
              Clear filters
            </button>
          )}
          <span style={{ fontSize: '13px', color: 'var(--text-2)', marginLeft: 'auto' }}>
            {payouts.length} result{payouts.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="card">
          {loading ? (
            <div className="loading"><div className="spinner" />Loading payouts...</div>
          ) : payouts.length === 0 ? (
            <div className="empty">
              <h3>No payouts found</h3>
              <p>{filterStatus || filterVendor ? 'Try adjusting your filters' : 'Create your first payout to get started'}</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(p => (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 500 }}>{p.vendor_id?.name || '—'}</td>
                      <td className="text-mono" style={{ fontWeight: 500 }}>{formatAmount(p.amount)}</td>
                      <td>
                        <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-2)', fontFamily: 'DM Mono, monospace', fontWeight: 500 }}>{p.mode}</span>
                      </td>
                      <td><span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span></td>
                      <td style={{ color: 'var(--text-2)', fontSize: '13px' }}>{p.created_by?.name || '—'}</td>
                      <td style={{ color: 'var(--text-2)', fontSize: '13px' }}>{formatDate(p.createdAt)}</td>
                      <td>
                        <a href={`/payouts/${p._id}`} className="btn btn-sm btn-outline">View →</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
