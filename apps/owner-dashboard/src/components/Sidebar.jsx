export default function Sidebar({ activeView, onNav, owner, onLogout, mobileOpen, onCloseMobile }) {

  const navItems = [
    {
      section: 'Analytics',
      items: [
        { id: 'ledger', label: "Ledger", icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 3h9l3 4v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"/>
            <path d="M9 9h6M9 13h6M9 17h3"/>
          </svg>
        )},
      ]
    },
    {
      section: 'Management',
      items: [
        { id: 'folio', label: 'Guest Folio & Billing', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>
          </svg>
        )},
        { id: 'menu', label: 'Menu & Prices', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 15c2-6 5-9 8-9s6 3 8 9M4 15a2 2 0 002 2h12a2 2 0 002-2M4 15l2 3M20 15l-2 3"/>
          </svg>
        )},
        { id: 'staff', label: 'Staff Accounts', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="9" cy="7" r="4"/><path d="M2 21v-1a7 7 0 0114 0v1"/>
            <path d="M16 3.13a4 4 0 010 7.75"/>
            <path d="M22 21v-1a4 4 0 00-3-3.87"/>
          </svg>
        )},
      ]
    },
    {
      section: 'Settings',
      items: [
        { id: 'profile', label: 'Owner Profile', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="4"/><path d="M4 20v-1a8 8 0 0116 0v1"/>
          </svg>
        )},
      ]
    }
  ];

  const initials = owner?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() ?? 'OW';

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={onCloseMobile}
      />

      <aside className={`owner-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-wordmark">Panache<span className="accent">.</span></div>
          <div className="sidebar-tagline">Owner's Ledger</div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(section => (
            <div key={section.section}>
              <div className="nav-section-label">{section.section}</div>
              {section.items.map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                  onClick={() => { onNav(item.id); onCloseMobile(); }}
                >
                  {item.icon}
                  <span className="nav-item-text">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer — user info + logout */}
        <div className="sidebar-footer">
          <button type="button" className="sidebar-user" onClick={() => { onNav('profile'); onCloseMobile(); }}>
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{owner?.name ?? 'Owner'}</div>
              <div className="user-role">Owner</div>
            </div>
          </button>

          <button type="button" className="sidebar-logout-btn" onClick={onLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
