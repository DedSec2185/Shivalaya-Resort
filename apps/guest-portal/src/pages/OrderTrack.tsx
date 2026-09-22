import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Printer } from 'lucide-react'
import CustomerBillModal from '../components/CustomerBillModal'

interface Order {
  id: string
  order_number: string
  resort_id: string
  guest_id: string | null
  room_id: string | null
  table_id: string | null
  service_type: string
  guest_name: string
  guest_phone: string
  items: Array<{
    id: string
    name: string
    qty: number
    price: number
    variant_label?: string | null
  }>
  subtotal: number
  tax_amount?: number | null
  grand_total?: number | null
  payment_status?: string | null
  payment_method?: string | null
  status: string
  special_note: string | null
  created_at: string
  restaurant_tables?: { table_number: string } | null
  rooms?: { room_number: string } | null
}

const STATUS_STEPS = [
  { key: 'new', label: 'Order Received', icon: '📝', desc: 'Sent to receptionist & kitchen' },
  { key: 'confirmed', label: 'Confirmed', icon: '👍', desc: 'Accepted by Panache team' },
  { key: 'preparing', label: 'Preparing', icon: '🍳', desc: 'Chef is preparing your meal' },
  { key: 'ready', label: 'Ready!', icon: '🛎️', desc: 'On its way to your table/room' },
  { key: 'served', label: 'Served', icon: '✅', desc: 'Delivered. Enjoy your meal!' }
]

export default function OrderTrack() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [order, setOrder] = useState<Order | null>(null)
  const [pulse, setPulse] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showBillModal, setShowBillModal] = useState(false)

  // Use order number passed through navigation state, fallback to ID
  const orderNumber = location.state?.orderNumber || order?.order_number || id?.slice(0, 8).toUpperCase()

  useEffect(() => {
    if (!id) return

    // Initial fetch of order details including table or room joins
    supabase
      .from('orders')
      .select('*, restaurant_tables(table_number), rooms(room_number)')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setOrder(data as Order)
        }
        setLoading(false)
      })

    // Real-time subscription: only this specific order
    const channel = supabase
      .channel(`order_track_${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`
        },
        async () => {
          // Re-fetch to retain relational data
          const { data } = await supabase
            .from('orders')
            .select('*, restaurant_tables(table_number), rooms(room_number)')
            .eq('id', id)
            .single()

          if (data) {
            setOrder(data as Order)
            setPulse(true)
            setTimeout(() => setPulse(false), 800)

            if (data.status === 'ready' && navigator.vibrate) {
              navigator.vibrate([200, 100, 200])
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id])

  if (loading) {
    return (
      <div className="app-root flex items-center justify-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <span style={{ color: 'var(--sage)', fontFamily: 'Inter, sans-serif' }}>Loading order status...</span>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="app-root" style={{ background: 'var(--bg)', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <p style={{ marginTop: '16px', color: 'var(--sage)', fontFamily: 'Inter, sans-serif' }}>Order not found</p>
        </div>
        <button className="btn-main" style={{ marginTop: '20px' }} onClick={() => navigate('/menu')}>
          Back to Menu
        </button>
      </div>
    )
  }

  const currentStatusIndex = STATUS_STEPS.findIndex(s => s.key === order.status)
  const currentStep = STATUS_STEPS[currentStatusIndex] || STATUS_STEPS[0]

  // Resolve location string
  const tableName = order.restaurant_tables?.table_number
  const roomNum = order.rooms?.room_number
  const isWalkIn = order.service_type === 'walk_in' || order.service_type === 'dine_in' || order.service_type === 'takeaway'

  let locationBadge = 'Dine-In'
  if (order.service_type === 'takeaway') {
    locationBadge = 'Takeaway Counter'
  } else if (tableName) {
    locationBadge = `Table ${tableName} (Panache)`
  } else if (roomNum) {
    locationBadge = `Room ${roomNum} (Resort)`
  } else if (order.service_type === 'room_service') {
    locationBadge = 'Room Service'
  }

  const subtotal = order.subtotal || 0
  const tax = order.tax_amount != null ? order.tax_amount : Math.round(subtotal * 0.05 * 100) / 100
  const grandTotal = order.grand_total != null ? order.grand_total : Math.round((subtotal + tax) * 100) / 100

  return (
    <>
      <style>{`
        .tracker-step-circle {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 700;
          background: var(--parchment-deep); color: var(--sage);
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        .tracker-step-circle.active {
          background: var(--forest); color: #FFFFFF;
          border-color: var(--brass-light);
          box-shadow: 0 0 0 4px rgba(44,74,34,0.2);
          transform: scale(1.1);
        }
        .tracker-step-circle.completed {
          background: var(--brass); color: #FFFFFF;
        }
        .tracker-pulse {
          animation: trackerPulse 0.8s ease;
        }
        @keyframes trackerPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div className="app-root" style={{ background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
            
            {/* Top Navigation */}
            <div className="topnav" style={{ flexShrink: 0 }}>
              <div className="brand-mini" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <img src="/panache_logo.jpg" alt="Panache Logo" className="monogram-img" />
                <div className="brand-mini-text">Panache</div>
              </div>
              <div className="nav-actions">
                <button className="icon-btn" onClick={() => navigate('/menu')} aria-label="Menu">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Main Content (Scrollable) */}
            <div className="app-scroll" style={{ flex: 1, padding: '20px' }}>
              
              {/* Order Info Panel */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: '24px', fontWeight: 700, color: 'var(--forest-deep)' }}>
                      Live Order Tracker
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--sage)', fontWeight: 600, marginTop: '4px' }}>
                      #{orderNumber} · {locationBadge}
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '100px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: isWalkIn ? 'rgba(173,138,63,0.15)' : 'rgba(44,74,34,0.12)',
                    color: isWalkIn ? 'var(--forest-deep)' : 'var(--forest)',
                    border: '1px solid rgba(173,138,63,0.3)'
                  }}>
                    {isWalkIn ? '🍽️ Walk-In Dining' : '🛎️ In-House Guest'}
                  </span>
                </div>
              </div>

              {/* Status Banner */}
              <div className={`receipt ${pulse ? 'tracker-pulse' : ''}`} style={{
                background: 'linear-gradient(135deg, var(--forest-deep), var(--forest))',
                color: '#F3EEDB',
                textAlign: 'center',
                padding: '20px',
                borderRadius: '14px',
                marginBottom: '22px',
                boxShadow: '0 8px 24px rgba(26,46,19,0.2)'
              }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>{currentStep.icon}</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: '22px', fontWeight: 700, color: 'var(--brass-light)' }}>
                  {currentStep.label}
                </div>
                <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '4px' }}>
                  {currentStep.desc}
                </div>
              </div>

              {/* Stepper Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '20px 10px', position: 'relative' }}>
                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx < currentStatusIndex;
                  const isActive = idx === currentStatusIndex;

                  return (
                    <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
                      <div className={`tracker-step-circle ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                        {isCompleted ? '✓' : step.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: isActive ? 800 : 600, color: isActive ? 'var(--forest-deep)' : 'var(--ink)' }}>
                          {step.label}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--sage)', fontWeight: 500 }}>
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Receipt Summary with 5% GST & Payment Status */}
              <div className="receipt" style={{ marginTop: '24px', borderRadius: '14px', padding: '16px', background: '#FFFFFF', border: '1px solid var(--parchment-deep)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--forest-deep)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Itemized Tax Invoice
                  </div>
                  {/* Payment Status Pill */}
                  {order.payment_status === 'paid' ? (
                    <span style={{ fontSize: '10.5px', fontWeight: 700, background: '#E8F5E9', color: '#2E7D32', padding: '3px 8px', borderRadius: '100px' }}>
                      ✓ PAID ({order.payment_method?.toUpperCase() || 'SETTLED'})
                    </span>
                  ) : order.payment_status === 'folio' ? (
                    <span style={{ fontSize: '10.5px', fontWeight: 700, background: '#FFF8E1', color: '#B78103', padding: '3px 8px', borderRadius: '100px' }}>
                      ROOM FOLIO CHARGE
                    </span>
                  ) : (
                    <span style={{ fontSize: '10.5px', fontWeight: 700, background: '#FFF3E0', color: '#E65100', padding: '3px 8px', borderRadius: '100px' }}>
                      PAY AT TABLE / COUNTER
                    </span>
                  )}
                </div>

                <div className="receipt-div" style={{ height: '1px', background: 'var(--parchment-deep)', margin: '8px 0' }} />

                {order.items.map((it, i) => (
                  <div className="receipt-line" key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', margin: '8px 0', color: 'var(--ink)' }}>
                    <span>{it.name} {it.variant_label ? `(${it.variant_label})` : ''} × {it.qty}</span>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>₹{((it.price || 0) * (it.qty || 0)).toLocaleString('en-IN')}</span>
                  </div>
                ))}

                <div className="receipt-div" style={{ height: '1px', background: 'var(--parchment-deep)', margin: '10px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--sage)', marginBottom: '4px' }}>
                  <span>Food Subtotal</span>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--sage)', marginBottom: '8px' }}>
                  <span>Restaurant GST (5% CGST+SGST)</span>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>₹{Number(tax).toFixed(2)}</span>
                </div>

                <div className="receipt-total" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16.5px', color: 'var(--forest-deep)', paddingTop: '8px', borderTop: '1.5px dashed var(--parchment-deep)' }}>
                  <span>Grand Total</span>
                  <span className="amt" style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--brass)' }}>
                    ₹{Number(grandTotal).toFixed(2)}
                  </span>
                </div>

                {/* Print Official Bill Action Button */}
                <button
                  type="button"
                  onClick={() => setShowBillModal(true)}
                  style={{
                    width: '100%',
                    marginTop: '14px',
                    padding: '11px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--brass)',
                    background: 'rgba(173,138,63,0.08)',
                    color: 'var(--forest-deep)',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Printer size={15} color="var(--brass)" />
                  <span>View / Print Official Bill (80mm / PDF)</span>
                </button>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="sheet-footer" style={{ padding: '16px', flexShrink: 0, background: 'var(--card)', borderTop: '1px solid var(--parchment-deep)' }}>
              <button type="button" className="btn-main" onClick={() => navigate('/menu')}>
                Back to Panache Menu
              </button>
            </div>
      </div>

      {showBillModal && order && (
        <CustomerBillModal order={order} onClose={() => setShowBillModal(false)} />
      )}
    </>
  )
}
