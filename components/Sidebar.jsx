'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const icons = {
  dashboard: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  vendors: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  payouts: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  logout: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) setUser(d.user);
    }).catch(() => { });
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: icons.dashboard },
    { href: '/vendors', label: 'Vendors', icon: icons.vendors },
    { href: '/payouts', label: 'Payouts', icon: icons.payouts },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
        Payout
        <span>Manager</span>
      </div>

      <div className="nav-section">
        <div className="nav-label">Navigation</div>
        {navItems.map(item => (
          <a
            key={item.href}
            href={item.href}
            className={`nav-item ${pathname.startsWith(item.href) ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </a>
        ))}
      </div>

      <div className="sidebar-footer">
        {user && (
          <div className="user-info" style={{ marginBottom: '12px' }}>
            <strong>{user.name}</strong>
            <span className={`role-chip role-${user.role.toLowerCase()}`}>{user.role}</span>
          </div>
        )}
        <button className="nav-item" onClick={handleLogout} style={{ padding: '8px 0' }}>
          {icons.logout}
          Logout
        </button>
      </div>
    </div>
  );
}
