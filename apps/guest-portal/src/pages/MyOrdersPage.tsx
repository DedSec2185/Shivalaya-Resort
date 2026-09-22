import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ChevronLeft, Loader2, Receipt, Calendar, ArrowRight, Sparkles, User, Printer } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGuestAuth } from '../contexts/GuestAuthContext'
import CustomerBillModal from '../components/CustomerBillModal'

const SESSION_KEY = 'panache_guest_session'

export default function MyOrdersPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { guest, isLoggedIn } = useGuestAuth()
  const initialTab = (location.state as { tab?: 'food' | 'activity' })?.tab || 'food'
  const [activeTab, setActiveTab] = useState<'food' | 'activity'>(initialTab)
  
  const [phone, setPhone] = useState<string | null>(null)
  
  const [foodOrders, setFoodOrders] = useState<any[]>([])
  const [activityBookings, setActivityBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderForBill, setSelectedOrderForBill] = useState<any | null>(null)

  useEffect(() => {
    if ((location.state as { tab?: 'food' | 'activity' })?.tab) {
      setActiveTab((location.state as { tab: 'food' | 'activity' }).tab)
    }
  }, [location.state])

  useEffect(() => {
    // Resolve phone number
    let guestPhone = null
    try {
      const cached = sessionStorage.getItem(SESSION_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        guestPhone = parsed.guestPhone
      }
    } catch { /* ignore */ }
    
    if (!guestPhone) {
      guestPhone = sessionStorage.getItem('guestPhone')
    }
    
    setPhone(guestPhone)
    
    if (guestPhone) {
      fetchData(guestPhone)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchData = async (guestPhone: string) => {
    setLoading(true)
    
    try {
      const [ordersRes, bookingsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .eq('guest_phone', guestPhone)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('activity_bookings')
          .select('*, activities(name)')
          .eq('guest_phone', guestPhone)
          .order('created_at', { ascending: false })
      ])
      
      if (!ordersRes.error && ordersRes.data) {
        setFoodOrders(ordersRes.data)
      }
      
      if (!bookingsRes.error && bookingsRes.data) {
        setActivityBookings(bookingsRes.data)
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch(status) {
      case 'new': return 'var(--brass)'
      case 'confirmed': return 'var(--forest)'
      case 'preparing': return 'var(--brass)'
      case 'ready': return '#4CAF50'
      case 'served': return 'var(--sage)'
      case 'cancelled': return 'var(--rust)'
      default: return 'var(--sage)'
    }
  }

  const getBookingStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'var(--brass)'
      case 'confirmed': return 'var(--forest)'
      case 'completed': return 'var(--sage)'
      case 'cancelled': return 'var(--rust)'
      default: return 'var(--sage)'
    }
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
  
  const formatJustDate = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="app-root" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--parchment)' }}>
      {/* Top Nav */}
      <div className="topnav" style={{ padding: '12px 0', background: 'rgba(255, 252, 244, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(217,189,117,0.2)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="desktop-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="brand-mini" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              className="icon-btn" 
              aria-label="Go back" 
              onClick={(e) => { e.stopPropagation(); navigate('/'); }}
              style={{ width: '32px', height: '32px', marginRight: '2px' }}
            >
              <ChevronLeft size={18} />
            </button>
            <img 
              src="https://shivalayaresort.com/wp-content/uploads/2024/11/Shivalaya-Resort-Logo-t.png" 
              alt="Shivalaya Logo" 
              style={{ width: '34px', height: '34px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))' }} 
            />
            <div>
              <div className="brand-mini-text" style={{ fontSize: '18px', lineHeight: 1.1, color: 'var(--forest-deep)', fontFamily: 'Fraunces, serif', fontWeight: 700 }}>
                Shivalaya
              </div>
              <div style={{ fontSize: '9.5px', color: 'var(--brass)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Orders & Stays
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontSize: '15px', fontWeight: 500, color: 'var(--sage)', cursor: 'pointer' }}>Home</button>
            <button onClick={() => navigate('/menu')} style={{ background: 'none', border: 'none', fontSize: '15px', fontWeight: 500, color: 'var(--sage)', cursor: 'pointer' }}>Panache Menu</button>
            <button onClick={() => navigate('/experiences')} style={{ background: 'none', border: 'none', fontSize: '15px', fontWeight: 500, color: 'var(--sage)', cursor: 'pointer' }}>Experiences</button>
            <button onClick={() => navigate('/orders')} style={{ background: 'none', border: 'none', fontSize: '15px', fontWeight: 700, color: 'var(--forest-deep)', cursor: 'pointer', borderBottom: '2px solid var(--brass)', paddingBottom: '2px' }}>My Orders</button>
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
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '14px 20px 8px', background: 'var(--parchment)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(44, 74, 34, 0.06)',
          padding: '4px',
          borderRadius: '16px',
          border: '1px solid rgba(44, 74, 34, 0.08)',
          position: 'relative'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('food')}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              border: 'none',
              background: 'transparent',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'food' ? 'var(--forest-deep)' : 'var(--sage)',
              transition: 'color 0.2s ease',
              zIndex: 1,
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            {activeTab === 'food' && (
              <motion.div
                layoutId="activeOrdersTab"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#FFF',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(26,46,19,0.08)',
                  border: '1px solid rgba(173,138,63,0.2)',
                  zIndex: -1
                }}
              />
            )}
            <Receipt size={16} />
            <span>Food Orders</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              border: 'none',
              background: 'transparent',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'activity' ? 'var(--forest-deep)' : 'var(--sage)',
              transition: 'color 0.2s ease',
              zIndex: 1,
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            {activeTab === 'activity' && (
              <motion.div
                layoutId="activeOrdersTab"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#FFF',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(26,46,19,0.08)',
                  border: '1px solid rgba(173,138,63,0.2)',
                  zIndex: -1
                }}
              />
            )}
            <Calendar size={16} />
            <span>Activity Bookings</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="app-scroll" style={{ flex: 1, padding: '20px 16px 120px' }}>
        {!phone ? (
          <div className="empty-state">
            <Receipt size={48} />
            <p>We don't have a phone number on file for you.<br/>Place an order to see it here.</p>
          </div>
        ) : loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0', color: 'var(--sage)' }}>
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : activeTab === 'food' ? (
          /* Food Orders */
          foodOrders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {foodOrders.map(order => (
                <div 
                  key={order.id} 
                  className="glass-card" 
                  style={{ padding: '16px', cursor: 'pointer' }}
                  onClick={() => navigate(`/order/${order.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '13px', fontWeight: 600, color: 'var(--sage)' }}>
                        #{order.order_number || order.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--sage)', marginTop: '2px' }}>
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                    <span 
                      className="special-tag" 
                      style={{ 
                        background: getOrderStatusColor(order.status), 
                        color: '#FFF',
                        padding: '4px 8px',
                        borderRadius: '12px'
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                  
                  <div style={{ borderTop: '1px dashed var(--line)', borderBottom: '1px dashed var(--line)', padding: '12px 0', margin: '12px 0', fontSize: '13.5px', color: 'var(--ink)' }}>
                    {order.items?.slice(0, 3).map((item: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>{item.qty}x {item.name}</span>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <div style={{ color: 'var(--sage)', fontSize: '12px', marginTop: '4px' }}>
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '16px', fontWeight: 700, color: 'var(--forest-deep)' }}>
                      ₹{order.subtotal?.toLocaleString('en-IN') || '0'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedOrderForBill(order)
                        }}
                        style={{
                          background: 'rgba(173,138,63,0.12)',
                          border: '1px solid rgba(173,138,63,0.3)',
                          borderRadius: '8px',
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: 'var(--forest-deep)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        <Printer size={13} color="var(--brass)" />
                        <span>Print Bill</span>
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: 'var(--brass)', fontWeight: 600 }}>
                        Track <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Receipt size={48} />
              <p>No food orders found.</p>
            </div>
          )
        ) : (
          /* Activity Bookings */
          activityBookings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activityBookings.map(booking => (
                <div key={booking.id} className="glass-card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '13px', fontWeight: 600, color: 'var(--sage)' }}>
                        #{booking.booking_number || booking.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--sage)', marginTop: '2px' }}>
                        Booked: {formatDate(booking.created_at)}
                      </div>
                    </div>
                    <span 
                      className="special-tag" 
                      style={{ 
                        background: getBookingStatusColor(booking.status), 
                        color: '#FFF',
                        padding: '4px 8px',
                        borderRadius: '12px'
                      }}
                    >
                      {booking.status}
                    </span>
                  </div>
                  
                  <div style={{ padding: '8px 0', marginBottom: '12px' }}>
                    <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', color: 'var(--forest-deep)', fontWeight: 700, margin: '0 0 4px' }}>
                      {booking.activities?.name || 'Unknown Activity'}
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--ink-soft)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} color="var(--sage)" />
                        {booking.booking_date ? formatJustDate(booking.booking_date) : 'TBD'}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--line)', paddingTop: '12px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--sage)' }}>
                      Guests: {booking.number_guests || 1}
                    </div>
                    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '16px', fontWeight: 700, color: 'var(--forest-deep)' }}>
                      ₹{(booking.total_price || booking.total_amount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Calendar size={48} />
              <p>No activity bookings found.</p>
            </div>
          )
        )}
      </div>

      {selectedOrderForBill && (
        <CustomerBillModal order={selectedOrderForBill} onClose={() => setSelectedOrderForBill(null)} />
      )}
    </div>
  )
}
