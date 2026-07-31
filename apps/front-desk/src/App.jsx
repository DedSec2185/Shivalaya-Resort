import { useState, useEffect, useCallback, useRef } from 'react';
import LoginScreen from './components/LoginScreen';
import OrderQueue from './components/OrderQueue';
import OrderDetailPanel from './components/OrderDetailPanel';
import ProfilePanel from './components/ProfilePanel';
import NotificationBell from './components/NotificationBell';
import { useStaffAuth } from './hooks/useStaffAuth';
import { useOrdersRealtime } from './hooks/useOrdersRealtime';
import { useNotificationSound } from './hooks/useNotificationSound';
import './index.css';

import { useLanguage } from './context/LanguageContext';

/* ── Live clock hook ────────────────────────────── */
function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function ClockDisplay({ time }) {
  const pad  = n => String(n).padStart(2, '0');
  const hh   = pad(time.getHours());
  const mm   = pad(time.getMinutes());
  const ss   = pad(time.getSeconds());
  const blink = time.getSeconds() % 2 === 0;
  return (
    <div className="topbar-clock">
      {hh}<span className="colon" style={{ opacity: blink ? 1 : 0.35 }}>:</span>
      {mm}<span className="colon" style={{ opacity: blink ? 1 : 0.35 }}>:</span>
      {ss}
    </div>
  );
}

/* ── Sidebar nav items ──────────────────────────── */
const NAV_ITEMS = [
  {
    id: 'kanban',
    labelKey: 'activeOrders',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="18" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/>
      </svg>
    ),
  },
  {
    id: 'completed',
    labelKey: 'completed',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/>
      </svg>
    ),
  },
  {
    id: 'cancelled',
    labelKey: 'cancelled',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
      </svg>
    ),
  },
  {
    id: 'profile',
    labelKey: 'staffProfile',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

/* ── Main App ───────────────────────────────────── */
export default function App() {
  const { staff, loading: authLoading, error: authError, login, logout, updateProfile, updatePin, isAuthenticated } = useStaffAuth();
  const { playBeep } = useNotificationSound();
  const { lang, setLang, t, translateName } = useLanguage();
  const knownOrdersRef = useRef(new Set());
  const time = useClock();

  const [view, setView]                 = useState('kanban');   // 'kanban' | 'completed' | 'cancelled' | 'profile'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // State for the temporary new order banner
  const [latestNewOrder, setLatestNewOrder] = useState(null);

  const handleNewOrder = useCallback((order) => {
    if (!knownOrdersRef.current.has(order.id)) {
      knownOrdersRef.current.add(order.id);
      if (order.status === 'new') {
        playBeep();
        setLatestNewOrder(order);
        // Clear banner after 5 seconds
        setTimeout(() => {
          setLatestNewOrder(prev => (prev?.id === order.id ? null : prev));
        }, 5000);
      }
    }
  }, [playBeep]);

  const {
    orders,
    activeOrders,
    completedOrders,
    cancelledOrders,
    newOrderCount,
    loading: ordersLoading,
    updateStatus,
  } = useOrdersRealtime({ onNewOrder: handleNewOrder });

  // Close detail panel if the selected order disappears
  useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find(o => o.id === selectedOrder.id);
      if (!updated) {
        setSelectedOrder(null);
      } else {
        setSelectedOrder(updated);
      }
    }
  }, [orders, selectedOrder]);

  async function handleUpdateStatus(orderId, status) {
    return updateStatus(orderId, status, staff?.name || 'Staff');
  }

  // Computed stats
  const todayTotal = completedOrders
    .filter(o => o.status === 'served')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const todayServed = completedOrders.filter(o => o.status === 'served').length;

  // Staff avatar initials
  const initials = staff?.name
    ? staff.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  /* ── Not authenticated ── */
  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} loading={authLoading} error={authError} />;
  }

  return (
    <div className={`desk-shell${lang === 'hi' ? ' lang-hi' : ''}`}>

      {/* ══ TOP BAR ══════════════════════════════════════════════ */}
      <header className="desk-topbar">
        {/* Brand */}
        <div className="topbar-brand">
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img src="/panache_logo.jpg" alt="Panache" className="topbar-logo" />
          <div>
            <div className="topbar-title">Panache</div>
            <div className="topbar-subtitle">{t('brandSub')}</div>
          </div>
        </div>

        {/* Live clock (centred) */}
        <ClockDisplay time={time} />

        {/* Right: stats + language switcher + bell + staff */}
        <div className="topbar-right">
          {/* Language Switcher Pill */}
          <div className="lang-switcher">
            <button
              type="button"
              className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLang('en')}
              title="Switch to English"
            >
              <span>🇬🇧</span> English
            </button>
            <button
              type="button"
              className={`lang-btn ${lang === 'hi' ? 'active' : ''}`}
              onClick={() => setLang('hi')}
              title="हिन्दी में बदलें"
            >
              <span>🇮🇳</span> हिन्दी
            </button>
          </div>

          {/* New orders chip */}
          <div className="stat-chip">
            <div className="stat-chip-dot red" />
            <span className="stat-chip-label">{t('statNew')}</span>
            <span className="stat-chip-value">{newOrderCount}</span>
          </div>

          {/* Active orders chip */}
          <div className="stat-chip">
            <div className="stat-chip-dot gold" />
            <span className="stat-chip-label">{t('statActive')}</span>
            <span className="stat-chip-value">{activeOrders.length}</span>
          </div>

          {/* Today served + revenue */}
          <div className="stat-chip">
            <div className="stat-chip-dot green" />
            <span className="stat-chip-label">{t('statToday')}</span>
            <span className="stat-chip-value">
              {todayServed > 0 ? `₹${todayTotal.toLocaleString('en-IN')}` : todayServed}
            </span>
          </div>

          <div className="topbar-divider" />

          <NotificationBell 
            count={newOrderCount} 
            newOrders={orders.filter(o => o.status === 'new')}
            onSelectOrder={(order) => {
              setView('kanban');
              setSelectedOrder(order);
            }}
          />

          <div className="topbar-staff" onClick={() => setView('profile')} title="Click to view Staff Profile" role="button" tabIndex={0}>
            <div className="staff-avatar">{initials}</div>
            <span className="staff-name">{staff?.name || 'Staff'}</span>
          </div>

          <button type="button" className="btn-logout" onClick={logout}>
            {t('logOut')}
          </button>
        </div>
      </header>

      {/* ══ NEW ORDER POP BANNER ══════════════════════════════════ */}
      {latestNewOrder && (
        <div key={latestNewOrder.id} className="new-order-banner">
          <div className="new-order-banner-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </div>
          <div className="new-order-banner-content">
            <h4>{t('newOrderArrived')}</h4>
            <p>
              {translateName(latestNewOrder.guest_name)} • {' '}
              {latestNewOrder.service_type === 'dine_in' 
                ? (latestNewOrder.table_number || t('table')) 
                : `${t('room')} ${latestNewOrder.room_number || ''}`}
            </p>
          </div>
        </div>
      )}

      {/* ══ BODY ═════════════════════════════════════════════════ */}
      <div className="desk-body">
      
        {/* Mobile menu backdrop */}
        {mobileMenuOpen && (
          <div className="mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* ── Sidebar ─────────────────────────────── */}
        <aside className={`desk-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-section-label">Views</div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-item${view === item.id ? ' active' : ''}`}
                onClick={() => { 
                  setView(item.id); 
                  setSelectedOrder(null); 
                  setMobileMenuOpen(false); 
                }}
              >
                {item.icon}
                <span>{t(item.labelKey)}</span>
                {item.id === 'kanban' && newOrderCount > 0 && (
                  <span key={newOrderCount} className="sidebar-nav-badge">{newOrderCount}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="sidebar-divider" />

          {/* Today's summary stats */}
          <div className="sidebar-today">
            <div className="sidebar-today-title">Today's Summary</div>
            <div className="sidebar-stat-row">
              <span className="sidebar-stat-label">Orders Served</span>
              <span className="sidebar-stat-value">{todayServed}</span>
            </div>
            <div className="sidebar-stat-row">
              <span className="sidebar-stat-label">Revenue</span>
              <span className="sidebar-stat-value">₹{todayTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="sidebar-stat-row">
              <span className="sidebar-stat-label">Active Now</span>
              <span className="sidebar-stat-value">{activeOrders.length}</span>
            </div>
            <div className="sidebar-stat-row">
              <span className="sidebar-stat-label">Cancelled</span>
              <span className="sidebar-stat-value">{completedOrders.filter(o => o.status === 'cancelled').length}</span>
            </div>

            {/* Live indicator */}
            <div className="sidebar-live-dot">
              <div className="live-indicator" />
              <span>Live · Updating</span>
            </div>
          </div>
        </aside>

        {/* ── Main content ────────────────────────── */}
        <main className="desk-main">
          {view === 'profile' ? (
            <ProfilePanel
              staff={staff}
              onUpdateProfile={updateProfile}
              onUpdatePin={updatePin}
            />
          ) : ordersLoading ? (
            /* Skeleton loader */
            <div className="kanban-board" style={{ alignItems: 'flex-start' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="kanban-col" style={{ animation: `fadeUp 0.4s ease ${i * 0.1}s both` }}>
                  <div className="kanban-col-head col-new" style={{ borderBottomColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="skeleton-line" style={{ width: 100, height: 12 }} />
                    <div className="skeleton-line" style={{ width: 24, height: 24, borderRadius: 12 }} />
                  </div>
                  <div className="kanban-cards" style={{ gap: 10 }}>
                    {[0, 1].map(j => (
                      <div key={j} className="skeleton-card">
                        <div className="skeleton-line" style={{ width: '60%' }} />
                        <div className="skeleton-line" style={{ width: '80%' }} />
                        <div className="skeleton-line" style={{ width: '40%', height: 11 }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <OrderQueue
              activeOrders={activeOrders}
              completedOrders={completedOrders}
              cancelledOrders={cancelledOrders}
              view={view}
              onUpdateStatus={handleUpdateStatus}
              onSelect={setSelectedOrder}
            />
          )}
        </main>

        {/* ── Slide-in detail panel ───────────────── */}
        {selectedOrder && (
          <OrderDetailPanel
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdateStatus={handleUpdateStatus}
            staffName={staff?.name}
          />
        )}
      </div>
    </div>
  );
}
