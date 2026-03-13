'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      router.push('/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function fillCreds(email, password) {
    setForm({ email, password });
    setError('');
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Payout Manager</h1>
        <p className="subtitle">Sign in to continue</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="you@demo.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? <><div className="spinner" />Signing in...</> : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: '24px', padding: '14px', background: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Demo Credentials</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => fillCreds('ops@demo.com', 'ops123')}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>ops@demo.com</div>
                <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>ops123</div>
              </div>
              <span className="role-chip role-ops">OPS</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => fillCreds('finance@demo.com', 'fin123')}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>finance@demo.com</div>
                <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>fin123</div>
              </div>
              <span className="role-chip role-finance">FINANCE</span>
            </div>
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '8px' }}>Click a row to auto-fill credentials</div>
        </div>
      </div>
    </div>
  );
}
