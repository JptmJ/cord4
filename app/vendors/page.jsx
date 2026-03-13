'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/vendors').then(r => r.json()),
    ]).then(([me, v]) => {
      if (!me.user) { window.location.href = '/login'; return; }
      setUser(me.user);
      setVendors(v.vendors || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="header-row">
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1>Vendors</h1>
            <p>Manage payout recipients</p>
          </div>
          {user?.role === 'OPS' && (
            <a href="/vendors/new" className="btn btn-primary">+ Add Vendor</a>
          )}
        </div>

        <div className="card">
          {loading ? (
            <div className="loading"><div className="spinner" />Loading vendors...</div>
          ) : vendors.length === 0 ? (
            <div className="empty">
              <h3>No vendors yet</h3>
              <p>Add your first vendor to get started</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>UPI ID</th>
                    <th>Bank Account</th>
                    <th>IFSC</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map(v => (
                    <tr key={v._id}>
                      <td style={{ fontWeight: 500 }}>{v.name}</td>
                      <td className="text-mono" style={{ color: 'var(--text-2)' }}>{v.upi_id || '—'}</td>
                      <td className="text-mono" style={{ color: 'var(--text-2)' }}>{v.bank_account || '—'}</td>
                      <td className="text-mono" style={{ color: 'var(--text-2)' }}>{v.ifsc || '—'}</td>
                      <td>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: 500, background: v.is_active ? 'var(--green-bg)' : 'var(--surface-2)', color: v.is_active ? 'var(--green)' : 'var(--text-2)' }}>
                          {v.is_active ? 'Active' : 'Inactive'}
                        </span>
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
