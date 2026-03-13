'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

const ACTION_ICONS = {
  CREATED: '✦',
  SUBMITTED: '→',
  RESUBMITTED: '↺',
  APPROVED: '✓',
  REJECTED: '✕',
};

function RejectModal({ onConfirm, onCancel, loading }) {
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');

  function handleConfirm() {
    if (!reason.trim()) { setErr('Rejection reason is required'); return; }
    onConfirm(reason.trim());
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Reject Payout</h3>
        <p className="modal-desc">Please provide a reason for rejection. This will be recorded in the audit trail.</p>
        {err && <div className="alert alert-error">{err}</div>}
        <div className="form-group">
          <label className="form-label">Reason *</label>
          <textarea
            className="form-textarea"
            value={reason}
            onChange={e => { setReason(e.target.value); setErr(''); }}
            placeholder="e.g. Insufficient documentation, duplicate request..."
            rows={3}
            autoFocus
          />
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-red" onClick={handleConfirm} disabled={loading}>
            {loading ? <><div className="spinner" />Rejecting...</> : 'Confirm Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResubmitModal({ onConfirm, onCancel, loading }) {
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');

  function handleConfirm() {
    if (!reason.trim()) { setErr('Resubmit reason is required'); return; }
    onConfirm(reason.trim());
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Resubmit Payout</h3>
        <p className="modal-desc">Provide a short note explaining why you're resubmitting for approval.</p>
        {err && <div className="alert alert-error">{err}</div>}
        <div className="form-group">
          <label className="form-label">Reason *</label>
          <textarea
            className="form-textarea"
            value={reason}
            onChange={e => { setReason(e.target.value); setErr(''); }}
            placeholder="e.g. Fixed documentation, updated bank details..."
            rows={3}
            autoFocus
          />
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleConfirm} disabled={loading}>
            {loading ? <><div className="spinner" />Resubmitting...</> : 'Resubmit for Approval'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PayoutDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [payout, setPayout] = useState(null);
  const [audits, setAudits] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showResubmitModal, setShowResubmitModal] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch(`/api/payouts/${id}`).then(r => r.json()),
    ]).then(([me, d]) => {
      if (!me.user) { window.location.href = '/login'; return; }
      setUser(me.user);
      if (d.error) { setError(d.error); return; }
      setPayout(d.payout);
      setAudits(d.audits || []);
    }).catch(() => setError('Failed to load payout')).finally(() => setLoading(false));
  }, [id]);

  async function doAction(endpoint, body = {}) {
    setError(''); setSuccess(''); setActionLoading(true);
    try {
      const res = await fetch(`/api/payouts/${id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setSuccess(data.message);
      // Reload payout data
      const updated = await fetch(`/api/payouts/${id}`).then(r => r.json());
      setPayout(updated.payout);
      setAudits(updated.audits || []);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setActionLoading(false);
      setShowRejectModal(false);
      setShowResubmitModal(false);
    }
  }

  function formatAmount(n) {
    return '₹' + Number(n).toLocaleString('en-IN');
  }

  function formatDate(d) {
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  if (loading) return (
    <div className="layout">
      <Sidebar />
      <main className="main"><div className="loading"><div className="spinner" />Loading payout...</div></main>
    </div>
  );

  if (error && !payout) return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="alert alert-error">{error}</div>
        <a href="/payouts" className="btn btn-outline">← Back to Payouts</a>
      </main>
    </div>
  );

  const canSubmit = user?.role === 'OPS' && payout?.status === 'Draft';
  const canApprove = user?.role === 'FINANCE' && (payout?.status === 'Submitted' || payout?.status === 'Resubmitted');
  const canReject = user?.role === 'FINANCE' && (payout?.status === 'Submitted' || payout?.status === 'Resubmitted');
  const canResubmit = user?.role === 'OPS' && payout?.status === 'Rejected';

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        {(showRejectModal) && (
          <RejectModal
            onConfirm={reason => doAction('reject', { reason })}
            onCancel={() => setShowRejectModal(false)}
            loading={actionLoading}
          />
        )}
        {showResubmitModal && (
          <ResubmitModal
            onConfirm={reason => doAction('resubmit', { reason })}
            onCancel={() => setShowResubmitModal(false)}
            loading={actionLoading}
          />
        )}

        <div className="header-row">
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              Payout Detail
              {payout && <span className={`badge badge-${payout.status.toLowerCase()}`}>{payout.status}</span>}
            </h1>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12.5px', color: 'var(--text-3)' }}>{id}</p>
          </div>
          <a href="/payouts" className="btn btn-outline">← Back</a>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Action Buttons */}
        {(canSubmit || canApprove || canReject || canResubmit) && (
          <div className="card mb-4" style={{ marginBottom: '16px' }}>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: 500 }}>Actions:</span>
              {canSubmit && (
                <button className="btn btn-primary" onClick={() => doAction('submit')} disabled={actionLoading}>
                  {actionLoading ? <><div className="spinner" />Processing...</> : '↑ Submit for Approval'}
                </button>
              )}
              {canApprove && (
                <button className="btn btn-green" onClick={() => doAction('approve')} disabled={actionLoading}>
                  {actionLoading ? <><div className="spinner" />Processing...</> : '✓ Approve Payout'}
                </button>
              )}
              {canReject && (
                <button className="btn btn-red" onClick={() => setShowRejectModal(true)} disabled={actionLoading}>
                  ✕ Reject
                </button>
              )}
              {canResubmit && (
                <button className="btn btn-primary" onClick={() => setShowResubmitModal(true)} disabled={actionLoading}>
                  ↺ Resubmit for Approval
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid-2" style={{ marginBottom: '20px' }}>
          {/* Payout Info */}
          <div className="card">
            <div className="card-header"><div className="card-title">Payout Information</div></div>
            <div className="card-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Amount</label>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '20px', fontWeight: 600, color: 'var(--green)' }}>
                    {payout && formatAmount(payout.amount)}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Mode</label>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 600 }}>{payout?.mode}</span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span><span className={`badge badge-${payout?.status?.toLowerCase()}`}>{payout?.status}</span></span>
                </div>
                <div className="detail-item">
                  <label>Created</label>
                  <span style={{ fontSize: '13px' }}>{payout && formatDate(payout.createdAt)}</span>
                </div>
                <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                  <label>Note</label>
                  <span style={{ color: payout?.note ? 'var(--text)' : 'var(--text-3)' }}>
                    {payout?.note || 'No note provided'}
                  </span>
                </div>
                {payout?.status === 'Rejected' && payout?.decision_reason && (
                  <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                    <label>Rejection Reason</label>
                    <span style={{ color: 'var(--red)', fontStyle: 'italic' }}>{payout.decision_reason}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vendor Info */}
          <div className="card">
            <div className="card-header"><div className="card-title">Vendor Details</div></div>
            <div className="card-body">
              <div className="detail-grid">
                <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                  <label>Vendor Name</label>
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>{payout?.vendor_id?.name || '—'}</span>
                </div>
                <div className="detail-item">
                  <label>UPI ID</label>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px' }}>{payout?.vendor_id?.upi_id || '—'}</span>
                </div>
                <div className="detail-item">
                  <label>IFSC</label>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px' }}>{payout?.vendor_id?.ifsc || '—'}</span>
                </div>
                <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                  <label>Bank Account</label>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px' }}>{payout?.vendor_id?.bank_account || '—'}</span>
                </div>
                <div className="detail-item">
                  <label>Created By</label>
                  <span style={{ fontSize: '13px' }}>
                    {payout?.created_by?.name || '—'}{' '}
                    <span className={`role-chip role-${payout?.created_by?.role?.toLowerCase()}`}>{payout?.created_by?.role}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Trail */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Audit Trail</div>
            <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>{audits.length} event{audits.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="card-body">
            {audits.length === 0 ? (
              <div style={{ color: 'var(--text-2)', fontSize: '13.5px' }}>No audit events yet.</div>
            ) : (
              <div className="audit-list">
                {audits.map(a => (
                  <div key={a._id} className="audit-item">
                    <div className={`audit-dot audit-dot-${a.action.toLowerCase()}`}>
                      {ACTION_ICONS[a.action] || '•'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="audit-action">{a.action.charAt(0) + a.action.slice(1).toLowerCase()}</div>
                      <div className="audit-meta">
                        by <strong>{a.performed_by_name}</strong>{' '}
                        <span className={`role-chip role-${a.performed_by_role.toLowerCase()}`}>{a.performed_by_role}</span>
                        {' · '}{formatDate(a.createdAt)}
                      </div>
                      {a.note && <div className="audit-note">"{a.note}"</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
