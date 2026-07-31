import { useState, useEffect, useRef } from 'react';
import MenuHero from './components/MenuHero';
import SectionTabs from './components/SectionTabs';
import MenuItemCard from './components/MenuItemCard';
import CartBar from './components/CartBar';
import CheckoutModal from './components/CheckoutModal';
import OrderConfirmation from './components/OrderConfirmation';
import OrderTrackerModal from './components/OrderTrackerModal';
import { useMenu } from './hooks/useMenu';
import { useCart } from './hooks/useCart';

// Skeleton loader — shown while menu is fetching
function SkeletonLoader() {
  return (
    <div className="skeleton-block">
      {Array.from({ length: 2 }).map((_, si) => (
        <div key={si} style={{ marginBottom: '28px' }}>
          <div className="skeleton-section-title" />
          {Array.from({ length: 4 }).map((_, ii) => (
            <div className="skeleton-item" key={ii}>
              <div className="skeleton-item-info">
                <div className="skeleton-line" style={{ width: `${55 + Math.random() * 35}%` }} />
                <div className="skeleton-line short" />
              </div>
              <div className="skeleton-btn" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const { sections, itemsBySection, loading, error } = useMenu();
  const { lines, totalItems, total, addItem, removeItem, clearCart, getQty } = useCart();
  const [activeSection, setActiveSection] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  
  // Persistent Active Order Tracking
  const [activeOrder, setActiveOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('panache_active_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showTracker, setShowTracker] = useState(false);

  // Search
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const searchInputRef = useRef(null);

  const sectionRefs = useRef({});
  const appScrollRef = useRef(null);
  const appScreenRef = useRef(null);

  useEffect(() => {
    if (sections.length && !activeSection) {
      setActiveSection(sections[0]);
    }
  }, [sections, activeSection]);

  // Focus search input when opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 280);
    }
  }, [showSearch]);

  // iOS-style scale effect — shrink background when sheet is open
  useEffect(() => {
    const screen = appScreenRef.current;
    if (!screen) return;
    if (showCheckout) {
      screen.classList.add('sheet-open');
    } else {
      screen.classList.remove('sheet-open');
    }
  }, [showCheckout]);

  // Intersection observer: reveal sections + sync active pill
  useEffect(() => {
    if (!sections.length) return;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            revealObserver.unobserve(e.target);
          }
        });
      },
      { root: appScrollRef.current, threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );

    const activePillObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActiveSection(e.target.dataset.section);
          }
        });
      },
      { root: appScrollRef.current, rootMargin: '-140px 0px -65% 0px', threshold: 0 }
    );

    sections.forEach((section) => {
      const el = sectionRefs.current[section];
      if (el) {
        revealObserver.observe(el);
        activePillObserver.observe(el);
      }
    });

    return () => {
      revealObserver.disconnect();
      activePillObserver.disconnect();
    };
  }, [sections, searchValue]);

  function scrollToSection(section) {
    setActiveSection(section);
    const target = sectionRefs.current[section];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleOrderSuccess(order) {
    setShowCheckout(false);
    setConfirmedOrder(order);
    setActiveOrder(order);
    try {
      localStorage.setItem('panache_active_order', JSON.stringify(order));
    } catch (e) {}
    clearCart();
  }

  function handleNewOrder() {
    setConfirmedOrder(null);
    setSearchValue('');
    setShowSearch(false);
    if (appScrollRef.current) appScrollRef.current.scrollTop = 0;
  }

  const searchLower = searchValue.toLowerCase();

  return (
    <div className="stage">
      <div className="stage-caption">Live Preview — Panache Customer Menu · Mobile</div>

      <div className="phone-frame">
        <div className="app-screen" ref={appScreenRef}>

          {/* Main scrollable content */}
          <div className="app-scroll" ref={appScrollRef}>

            {/* Sticky Top Nav */}
            <div className="topnav">
              <div className="brand-mini" tabIndex={0}>
                <img src="/panache_logo.jpg" alt="Panache Logo" className="monogram-img" />
                <div className="brand-mini-text">Panache</div>
              </div>
              <div className="nav-actions">
                {(activeOrder || confirmedOrder) && (
                  <button
                    className="icon-btn"
                    onClick={() => setShowTracker(true)}
                    aria-label="Track active order"
                    title="Track active order"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="cart-badge show" style={{ background: 'var(--forest)', width: 10, height: 10, minWidth: 10, padding: 0 }}>
                    </span>
                  </button>
                )}
                <button
                  className="icon-btn"
                  onClick={() => setShowSearch(prev => !prev)}
                  aria-label="Search menu"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                </button>
                <button
                  className="icon-btn"
                  onClick={() => totalItems > 0 && setShowCheckout(true)}
                  aria-label="View cart"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3h2l2.4 12.4a2 2 0 002 1.6h8.2a2 2 0 002-1.6L21 8H6" />
                    <circle cx="9" cy="20" r="1.4" />
                    <circle cx="18" cy="20" r="1.4" />
                  </svg>
                  <span className={`cart-badge ${totalItems > 0 ? 'show' : ''}`}>
                    {totalItems}
                  </span>
                </button>
              </div>
            </div>

            {/* Search row */}
            <div className={`search-row ${showSearch ? 'open' : ''}`}>
              <div className="search-input-wrap">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="search-input"
                  placeholder="Search dishes, e.g. paneer, chicken…"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                {searchValue && (
                  <button className="search-clear" onClick={() => setSearchValue('')} aria-label="Clear search">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Hero */}
            <MenuHero />

            {/* Active Order Banner — displayed when guest has an active order */}
            {(activeOrder || confirmedOrder) && (
              <div
                className="active-order-banner"
                onClick={() => setShowTracker(true)}
                role="button"
                tabIndex={0}
              >
                <div className="active-order-left">
                  <div className="active-order-dot" />
                  <div>
                    <div className="active-order-title">Active Order #{(activeOrder || confirmedOrder)?.id?.slice(0,8).toUpperCase()}</div>
                    <div className="active-order-desc">Tap to track live order status ➔</div>
                  </div>
                </div>
                <div className="active-order-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            )}

            {/* Skeleton loader */}
            {loading && <SkeletonLoader />}

            {error && (
              <div className="empty-state" style={{ paddingTop: '40px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                <p>Unable to load menu. {error}</p>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* Section Pills */}
                <SectionTabs
                  sections={sections.filter(section =>
                    (itemsBySection[section] || []).some(item =>
                      item.name.toLowerCase().includes(searchLower)
                    )
                  )}
                  activeSection={activeSection}
                  onSelect={scrollToSection}
                />

                {/* Menu Sections */}
                <div className="menu-list">
                  {sections.map((section) => {
                    const filteredItems = (itemsBySection[section] || []).filter(item =>
                      item.name.toLowerCase().includes(searchLower)
                    );
                    if (filteredItems.length === 0) return null;

                    return (
                      <div
                        key={section}
                        className="section-block"
                        data-section={section}
                        ref={(el) => { sectionRefs.current[section] = el; }}
                      >
                        <div className="section-head" id={`sec-${section}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M6 3v8M4 3v5a2 2 0 002 2 2 2 0 002-2V3M18 3c-2 0-3 2-3 5s1 4 3 4M18 3v18" />
                          </svg>
                          <h2>{section}</h2>
                          <div className="section-rule" />
                        </div>

                        {filteredItems.map((item, idx) => (
                          <MenuItemCard
                            key={item.id}
                            item={item}
                            qty={getQty(item.id)}
                            onAdd={() => addItem(item)}
                            onRemove={() => removeItem(item.id)}
                            rowIndex={idx}
                          />
                        ))}
                      </div>
                    );
                  })}

                  {/* No results state */}
                  {searchValue && sections.every(s =>
                    !(itemsBySection[s] || []).some(i => i.name.toLowerCase().includes(searchLower))
                  ) && (
                    <div className="empty-state" style={{ paddingTop: '40px' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="11" cy="11" r="7" />
                        <path d="M21 21l-4.3-4.3" />
                      </svg>
                      <p>No dishes found for "{searchValue}"</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Floating Cart Bar */}
          <CartBar
            totalItems={totalItems}
            total={total}
            onCheckout={() => setShowCheckout(true)}
          />

          {/* Checkout bottom sheet + iOS backdrop dim */}
          {showCheckout && (
            <CheckoutModal
              lines={lines}
              total={total}
              onClose={() => setShowCheckout(false)}
              onSuccess={handleOrderSuccess}
            />
          )}

          {/* Order confirmed overlay */}
          {confirmedOrder && (
            <OrderConfirmation
              order={confirmedOrder}
              onTrackOrder={() => setShowTracker(true)}
              onNewOrder={handleNewOrder}
            />
          )}

          {/* Order Tracker Modal */}
          {showTracker && (
            <OrderTrackerModal
              order={activeOrder || confirmedOrder}
              onClose={() => setShowTracker(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
