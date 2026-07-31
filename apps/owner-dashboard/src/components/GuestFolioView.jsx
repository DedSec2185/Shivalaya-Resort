import { useState } from 'react';
import { DEMO_FOLIOS } from '../utils/demoData';

export default function GuestFolioView({ showToast }) {
  const [searchRoom, setSearchRoom] = useState('302');
  const [dateFilter, setDateFilter] = useState('stay'); // 'stay' | 'today' | 'all'

  // Search logic: room number or name match
  const normalizedSearch = searchRoom.trim().toLowerCase().replace('room', '').trim();
  
  let folioData = DEMO_FOLIOS[normalizedSearch];

  if (!folioData) {
    // Try searching by name or phone
    const foundKey = Object.keys(DEMO_FOLIOS).find(key => {
      const f = DEMO_FOLIOS[key];
      return f.guestName.toLowerCase().includes(normalizedSearch) || f.phone.includes(normalizedSearch);
    });
    if (foundKey) folioData = DEMO_FOLIOS[foundKey];
  }

  // Calculate totals
  const orders = folioData ? folioData.orders : [];
  const grandTotal = orders.reduce((sum, o) => sum + o.amount, 0);
  const totalItemsCount = orders.reduce((sum, o) => sum + o.items.reduce((iSum, i) => iSum + i.qty, 0), 0);

  function handlePrint() {
    window.print();
  }

  function handleEmail() {
    if (showToast) showToast(`Folio statement sent to ${folioData?.guestName}'s email`);
  }

  return (
    <div className="mgmt-view">
      <div className="mgmt-header">
        <div>
          <div className="mgmt-title">Guest Folio & Checkout Billing</div>
          <div className="mgmt-subtitle">Room-based food & beverage bill lookup for guest checkouts</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn-action ghost-action" onClick={handleEmail} disabled={!folioData}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
            Email Statement
          </button>
          <button type="button" className="btn-action" onClick={handlePrint} disabled={!folioData}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
            Print Folio
          </button>
        </div>
      </div>

      {/* Search Bar & Quick Room Presets */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <input
          className="search-input"
          placeholder="Search by Room # (e.g. 302), Guest Name, or Phone…"
          value={searchRoom}
          onChange={e => setSearchRoom(e.target.value)}
        />
        <select className="filter-select" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
          <option value="stay">Entire Stay Period</option>
          <option value="today">Today Only</option>
          <option value="all">All Dates</option>
        </select>
      </div>

      {/* Quick Presets Pills */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sage)', alignSelf: 'center', marginRight: 4 }}>
          Demo Quick Search:
        </span>
        {['302', '108', '405', '201'].map(rm => (
          <button
            key={rm}
            type="button"
            className={`cat-pill ${searchRoom === rm ? 'active' : ''}`}
            onClick={() => setSearchRoom(rm)}
            style={{ padding: '6px 16px', fontSize: 13 }}
          >
            Room {rm} ({DEMO_FOLIOS[rm]?.guestName.split(' ')[0]})
          </button>
        ))}
      </div>

      {!folioData ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
          <h3>No room orders found</h3>
          <p>Enter a room number like <strong>302</strong>, <strong>108</strong>, or <strong>405</strong> to view itemized stay bill.</p>
        </div>
      ) : (
        <div className="folio-grid">

          {/* Left: Guest & Stay Summary Card */}
          <div className="profile-card" style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="user-avatar" style={{ width: 56, height: 56, fontSize: 20 }}>
                {folioData.room}
              </div>
              <span className="type-pill type-room" style={{ fontSize: 12, padding: '4px 12px' }}>
                {folioData.status}
              </span>
            </div>

            <div className="profile-name" style={{ fontSize: 22 }}>Room {folioData.room}</div>
            <div className="profile-title" style={{ color: 'var(--ink)', fontSize: 15, textTransform: 'none', marginBottom: 12 }}>
              {folioData.guestName}
            </div>

            <div style={{ fontSize: 13.5, color: 'var(--sage)', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>📞 {folioData.phone}</div>
              <div>📅 Check-In: <strong>{folioData.checkIn}</strong></div>
              <div>📅 Check-Out: <strong>{folioData.checkOut}</strong></div>
            </div>

            <div className="profile-stats" style={{ marginTop: 24, paddingTop: 20 }}>
              <div>
                <div className="profile-stat-value">{orders.length}</div>
                <div className="profile-stat-label">Total Orders</div>
              </div>
              <div>
                <div className="profile-stat-value">{totalItemsCount}</div>
                <div className="profile-stat-label">Dishes Served</div>
              </div>
            </div>

            {/* Grand Total Highlight Box */}
            <div style={{
              marginTop: 24,
              padding: '20px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, var(--forest-deep), var(--forest-mid))',
              color: '#F3EEDB',
              boxShadow: '0 8px 24px rgba(26,46,19,0.25)',
              border: '1px solid rgba(217,189,117,0.3)'
            }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1.6px', fontWeight: 800, color: 'var(--brass-light)' }}>
                Total F&B Checkout Bill
              </div>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 34, fontWeight: 700, marginTop: 6, color: '#FFFFFF' }}>
                ₹{grandTotal.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 11.5, opacity: 0.75, marginTop: 4 }}>
                Anchored to Room {folioData.room}
              </div>
            </div>
          </div>

          {/* Right: Itemized Stay Orders List */}
          <div className="settings-panel">
            <div className="settings-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Itemized Order History ({orders.length})</span>
              <span style={{ fontSize: 13, color: 'var(--sage)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                {folioData.checkIn} – {folioData.checkOut}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 14,
                    padding: '18px 20px',
                    border: '1.5px solid rgba(35,31,22,0.1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, pb: 10, borderBottom: '1px dashed var(--line)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="order-id">{ord.id}</span>
                      <span className={`type-pill ${ord.serviceType === 'room_service' ? 'type-room' : ord.serviceType === 'dine_in' ? 'type-dinein' : 'type-pickup'}`}>
                        {ord.serviceLabel}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--sage)', fontWeight: 600 }}>
                      {ord.date}
                    </div>
                  </div>

                  {/* Items Breakdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                    {ord.items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>
                        <span>{it.name} <span style={{ color: 'var(--sage)', fontSize: 13 }}>× {it.qty}</span></span>
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--ink-soft)' }}>₹{(it.price * it.qty).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px dashed var(--line)' }}>
                    <span className="status-stamp" style={{ fontSize: 12 }}>
                      <span className="status-dot served" />
                      Status: {ord.status.toUpperCase()}
                    </span>
                    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 16, fontWeight: 700, color: 'var(--brass)' }}>
                      Subtotal: ₹{ord.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
