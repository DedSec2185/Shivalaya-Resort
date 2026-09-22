import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import MenuHero from '../components/MenuHero'
import SectionTabs from '../components/SectionTabs'
import MenuItemCard from '../components/MenuItemCard'
import CartBar from '../components/CartBar'
import CheckoutModal from '../components/CheckoutModal'
import VariantPicker from '../components/VariantPicker'
import { useMenu, MenuItem } from '../hooks/useMenu'
import { useCart } from '../store/useCart'
import { useGuestAuth } from '../contexts/GuestAuthContext'
import { User } from 'lucide-react'

// Skeleton loader — shown while menu is fetching
function SkeletonLoader() {
  return (
    <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {Array.from({ length: 2 }).map((_, si) => (
        <div key={si}>
          {/* Skeleton Section Title */}
          <motion.div
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            style={{ width: '140px', height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', marginBottom: '16px' }}
          />
          {/* Skeleton Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Array.from({ length: 3 }).map((_, ii) => (
              <motion.div
                key={ii}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: ii * 0.1 }}
                style={{
                  height: '100px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.02)'
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MenuPage() {
  const navigate = useNavigate()
  const { categories, items, loading, error } = useMenu()
  const cart = useCart()
  const { guest, isLoggedIn } = useGuestAuth()

  const [activeSection, setActiveSection] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)
  const [selectedItemForVariant, setSelectedItemForVariant] = useState<MenuItem | null>(null)
  
  // Search
  const [showSearch, setShowSearch] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const appScrollRef = useRef<HTMLDivElement>(null)
  const appScreenRef = useRef<HTMLDivElement>(null)

  // Sync active section to first available category initially
  useEffect(() => {
    if (categories.length > 0 && !activeSection) {
      setActiveSection(categories[0].name)
    }
  }, [categories, activeSection])

  // Focus search input when opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 280)
    }
  }, [showSearch])

  // iOS-style scale effect — shrink background when sheet is open
  useEffect(() => {
    const screen = appScreenRef.current
    if (!screen) return
    if (showCheckout || selectedItemForVariant) {
      screen.classList.add('sheet-open')
    } else {
      screen.classList.remove('sheet-open')
    }
  }, [showCheckout, selectedItemForVariant])

  // Deterministic scroll tracking for active category tab + reveal animation
  useEffect(() => {
    if (!categories.length) return

    const container = appScrollRef.current
    if (!container) return

    // Initialize to first category
    if (!activeSection) {
      setActiveSection(categories[0].name)
    }

    let ticking = false

    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        const containerRect = container.getBoundingClientRect()
        // Target trigger line right below sticky topnav and category tabs (~170px)
        const triggerLine = containerRect.top + 175

        let currentActive = categories[0].name
        for (const cat of categories) {
          const el = sectionRefs.current[cat.name]
          if (el) {
            const rect = el.getBoundingClientRect()
            if (rect.top <= triggerLine) {
              currentActive = cat.name
            }
          }
        }
        setActiveSection(currentActive)
      })
    }

    // Single run to ensure correct pill on load
    handleScroll()

    container.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Reveal observer for entry animations
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed')
            revealObserver.unobserve(e.target)
          }
        })
      },
      { root: container, threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    )

    categories.forEach((cat) => {
      const el = sectionRefs.current[cat.name]
      if (el) revealObserver.observe(el)
    })

    return () => {
      container.removeEventListener('scroll', handleScroll)
      window.removeEventListener('scroll', handleScroll)
      revealObserver.disconnect()
    }
  }, [categories, searchValue])

  function scrollToSection(section: string) {
    setActiveSection(section)
    const target = sectionRefs.current[section]
    const container = appScrollRef.current
    if (target && container) {
      const containerRect = container.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      const topOffset = 155 // sticky header (60px) + tabs (50px) + padding
      const scrollPosition = container.scrollTop + (targetRect.top - containerRect.top) - topOffset
      container.scrollTo({ top: Math.max(0, scrollPosition), behavior: 'smooth' })
    } else if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function handleAddClick(item: MenuItem) {
    if (item.has_variants) {
      setSelectedItemForVariant(item)
    } else {
      cart.add({
        id: item.id,
        name: item.name,
        price: item.base_price,
        qty: 1
      })
    }
  }

  function handleOrderSuccess(order: { order_id: string; order_number: string }) {
    setShowCheckout(false)
    navigate(`/order/${order.order_id}`, { state: { orderNumber: order.order_number } })
  }

  const searchLower = searchValue.toLowerCase()

  // Group items by category
  const itemsBySection = categories.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    acc[cat.name] = items.filter(item => item.category_id === cat.id)
    return acc
  }, {})

  const activeCategoryList = categories.map(c => c.name)

  return (
    <>
      <div className="app-root">
        {/* Main scrollable content */}
        <div className="app-scroll" ref={appScrollRef}>
          {/* Sticky Top Nav */}
          <div className="topnav" style={{ padding: '12px 0' }}>
            <div className="desktop-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="brand-mini" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/panache_logo.jpg" alt="Panache Logo" className="monogram-img" />
                <div className="brand-mini-text">Panache</div>
              </div>

              {/* Desktop Nav Links */}
              <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontSize: '15px', fontWeight: 500, color: 'var(--sage)', cursor: 'pointer' }}>Home</button>
                <button onClick={() => navigate('/menu')} style={{ background: 'none', border: 'none', fontSize: '15px', fontWeight: 700, color: 'var(--forest-deep)', cursor: 'pointer', borderBottom: '2px solid var(--brass)', paddingBottom: '2px' }}>Panache Menu</button>
                <button onClick={() => navigate('/experiences')} style={{ background: 'none', border: 'none', fontSize: '15px', fontWeight: 500, color: 'var(--sage)', cursor: 'pointer' }}>Experiences</button>
                <button onClick={() => navigate('/orders')} style={{ background: 'none', border: 'none', fontSize: '15px', fontWeight: 500, color: 'var(--sage)', cursor: 'pointer' }}>My Orders</button>
                <button 
                  onClick={() => navigate(isLoggedIn ? '/profile' : '/login')} 
                  style={{ 
                    background: isLoggedIn ? 'rgba(44, 74, 34, 0.08)' : 'none', 
                    border: isLoggedIn ? '1.5px solid var(--forest-deep)' : 'none', 
                    borderRadius: '100px',
                    padding: isLoggedIn ? '6px 16px' : '0',
                    fontSize: '14.5px', 
                    fontWeight: 600, 
                    color: 'var(--forest-deep)', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <User size={15} color="var(--forest-deep)" />
                  <span>{isLoggedIn ? (guest?.name ? guest.name.split(' ')[0] : `Suite ${guest?.roomNumber || ''}`) : 'Sign In'}</span>
                </button>
              </div>

              <div className="nav-actions">
                <button
                  className="icon-btn"
                  onClick={() => navigate(isLoggedIn ? '/profile' : '/login')}
                  aria-label={isLoggedIn ? "View Profile" : "Sign In"}
                  title={isLoggedIn ? (guest?.name || `Suite ${guest?.roomNumber}` || 'Profile') : "Sign In"}
                  style={{ position: 'relative' }}
                >
                  <User size={20} color="var(--forest-deep)" />
                  {isLoggedIn && (
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#2ecc71',
                      border: '1.5px solid #fff'
                    }} />
                  )}
                </button>
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
                  onClick={() => {
                    const lastId = localStorage.getItem('panache_last_order_id')
                    if (lastId) navigate(`/order/${lastId}`)
                    else navigate('/orders')
                  }}
                  aria-label="Track Food Orders"
                  title="Track Food Orders"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </button>
                <button
                  className="icon-btn"
                  onClick={() => cart.count() > 0 && setShowCheckout(true)}
                  aria-label="View cart"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3h2l2.4 12.4a2 2 0 002 1.6h8.2a2 2 0 002-1.6L21 8H6" />
                    <circle cx="9" cy="20" r="1.4" />
                    <circle cx="18" cy="20" r="1.4" />
                  </svg>
                  <span className={`cart-badge ${cart.count() > 0 ? 'show' : ''}`}>
                    {cart.count()}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="desktop-container">

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
                      sections={activeCategoryList.filter(section =>
                        (itemsBySection[section] || []).some(item =>
                          item.name.toLowerCase().includes(searchLower)
                        )
                      )}
                      activeSection={activeSection}
                      onSelect={scrollToSection}
                    />

                    {/* Menu Sections */}
                    <div className="menu-list">
                      {activeCategoryList.map((section) => {
                        const filteredItems = (itemsBySection[section] || []).filter(item =>
                          item.name.toLowerCase().includes(searchLower)
                        )
                        if (filteredItems.length === 0) return null

                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            key={section}
                            className="section-block"
                            data-section={section}
                            ref={(el) => { sectionRefs.current[section] = el }}
                          >
                            <div className="section-head" id={`sec-${section}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', marginTop: '16px' }}>
                              <h2 style={{ fontSize: '24px', color: 'var(--forest-deep)', margin: 0, fontFamily: 'Fraunces, serif', fontWeight: 700 }}>{section}</h2>
                              <div style={{ flex: 1, height: '1.5px', background: 'linear-gradient(90deg, rgba(26,46,19,0.18) 0%, transparent 100%)' }} />
                            </div>

                            <div className="section-items-grid">
                              {filteredItems.map((item, idx) => (
                                <MenuItemCard
                                  key={item.id}
                                  item={{
                                    id: item.id,
                                    name: item.name,
                                    base_price: item.base_price,
                                    description: item.description,
                                    is_vegetarian: item.is_vegetarian,
                                    is_special: item.is_special,
                                    is_available: item.is_available,
                                    has_variants: item.has_variants
                                  }}
                                  qty={cart.getQty(item.id)}
                                  onAdd={() => handleAddClick(item)}
                                  onRemove={() => cart.remove(item.id)}
                                  rowIndex={idx}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )
                      })}

                      {/* No results state */}
                      {searchValue && activeCategoryList.every(s =>
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

              {/* Floating Cart Bar */}
              <CartBar
                totalItems={cart.count()}
                total={cart.total()}
                onCheckout={() => setShowCheckout(true)}
              />
          </div>
        </div>
      </div>

      {/* Checkout bottom sheet */}
      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onSuccess={handleOrderSuccess}
        />
      )}

      {/* Variant customization bottom sheet */}
      {selectedItemForVariant && (
        <VariantPicker
          item={selectedItemForVariant}
          onClose={() => setSelectedItemForVariant(null)}
        />
      )}
    </>
  )
}
