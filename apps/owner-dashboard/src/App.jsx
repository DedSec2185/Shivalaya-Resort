import { useState, useCallback, useRef } from 'react';
import LoginScreen      from './components/LoginScreen';
import Sidebar          from './components/Sidebar';
import LedgerView       from './components/LedgerView';
import GuestFolioView    from './components/GuestFolioView';
import StaffManagement  from './components/StaffManagement';
import MenuManagement   from './components/MenuManagement';
import OwnerProfile     from './components/OwnerProfile';
import { useOwnerAuth } from './hooks/useOwnerAuth';

// ─────────────────────────────────────────────
// Toast — kept at app level so all views share it
// ─────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState({ msg: '', show: false });
  const timerRef = useRef(null);

  const showToast = useCallback((msg) => {
    clearTimeout(timerRef.current);
    setToast({ msg, show: true });
    timerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2800);
  }, []);

  const ToastEl = (
    <div className={`toast ${toast.show ? 'show' : ''}`}>
      <span className="toast-dot" />
      <span>{toast.msg}</span>
    </div>
  );

  return { showToast, ToastEl };
}

// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────
export default function App() {
  const { owner, loading, error, login, logout, updateProfile, updatePin, isAuthenticated } = useOwnerAuth();
  const [view, setView]           = useState('ledger');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { showToast, ToastEl }    = useToast();

  // ── Not authenticated → show login ──
  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} loading={loading} error={error} />;
  }

  // ── Render correct view ──
  const renderView = () => {
    switch (view) {
      case 'ledger':
        return <LedgerView showToast={showToast} />;
      case 'folio':
        return <GuestFolioView showToast={showToast} />;
      case 'staff':
        return <StaffManagement showToast={showToast} />;
      case 'menu':
        return <MenuManagement showToast={showToast} />;
      case 'profile':
        return (
          <OwnerProfile
            owner={owner}
            onUpdateProfile={updateProfile}
            onUpdatePin={updatePin}
            showToast={showToast}
          />
        );
      default:
        return <LedgerView showToast={showToast} />;
    }
  };

  return (
    <div className="owner-shell">
      {/* Mobile hamburger toggle */}
      <button
        type="button"
        className="sidebar-mobile-toggle"
        onClick={() => setMobileMenuOpen(o => !o)}
        aria-label="Toggle navigation"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {/* Sidebar */}
      <Sidebar
        activeView={view}
        onNav={setView}
        owner={owner}
        onLogout={logout}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main content */}
      <main className="owner-main">
        {renderView()}
      </main>

      {/* Global toast */}
      {ToastEl}
    </div>
  );
}
