'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardPage() {
  const [payouts, setPayouts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/payouts').then(r => r.json()),
      fetch('/api/vendors').then(r => r.json()),
    ]).then(([me, p, v]) => {
      if (!me.user) { window.location.href = '/login'; return; }
      setUser(me.user);
      setPayouts(p.payouts || []);
      setVendors(v.vendors || []);
    }).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: payouts.length,
    draft: payouts.filter(p => p.status === 'Draft').length,
    submitted: payouts.filter(p => p.status === 'Submitted').length,
    resubmitted: payouts.filter(p => p.status === 'Resubmitted').length,
    approved: payouts.filter(p => p.status === 'Approved').length,
    rejected: payouts.filter(p => p.status === 'Rejected').length,
    totalAmount: payouts.filter(p => p.status === 'Approved').reduce((s, p) => s + p.amount, 0),
  };

  if (loading) return (
    <div className="layout">
      <Sidebar />
      <main className="main"><div className="loading"><div className="spinner" />Loading...</div></main>
    </div>
  );

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Welcome back{user ? `, ${user.name}` : ''}. Here's what's happening.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total Payouts', value: stats.total, color: 'var(--text)' },
            { label: 'Pending Review', value: stats.submitted + stats.resubmitted, color: 'var(--blue)' },
            { label: 'Approved', value: stats.approved, color: 'var(--green)' },
            { label: 'Approved Value', value: `₹${stats.totalAmount.toLocaleString('en-IN')}`, color: 'var(--green)', mono: true },
          ].map(s => (
            <div key={s.label} className="card">
              <div className="card-body">
                <div style={{ fontSize: '12px', color: 'var(--text-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px' }}>{s.label}</div>
                <div style={{ fontSize: '26px', fontWeight: 600, color: s.color, fontFamily: s.mono ? 'DM Mono, monospace' : 'inherit', letterSpacing: s.mono ? '-0.5px' : '-0.5px' }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Status Breakdown</div>
            </div>
            <div className="card-body">
              {[
                { label: 'Draft', count: stats.draft, cls: 'badge-draft' },
                { label: 'Submitted', count: stats.submitted, cls: 'badge-submitted' },
                { label: 'Resubmitted', count: stats.resubmitted, cls: 'badge-resubmitted' },
                { label: 'Approved', count: stats.approved, cls: 'badge-approved' },
                { label: 'Rejected', count: stats.rejected, cls: 'badge-rejected' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span className={`badge ${s.cls}`}>{s.label}</span>
                  <span style={{ fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent Payouts</div>
              <a href="/payouts" className="btn btn-sm btn-outline">View all</a>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {payouts.slice(0, 5).length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-2)' }}>No payouts yet</div>
              ) : payouts.slice(0, 5).map(p => (
                <a key={p._id} href={`/payouts/${p._id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 18px', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '13.5px' }}>{p.vendor_id?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>{p.mode}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 500, fontSize: '13.5px' }}>₹{p.amount.toLocaleString('en-IN')}</div>
                    <span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
