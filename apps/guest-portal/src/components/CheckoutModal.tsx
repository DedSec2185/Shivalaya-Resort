import { useState } from 'react'
import { useCart } from '../store/useCart'
import { usePlaceOrder } from '../hooks/useOrder'
import { useGuestAuth } from '../contexts/GuestAuthContext'

interface CheckoutModalProps {
  onClose: () => void
  onSuccess: (order: { order_id: string; order_number: string }) => void
}

const TABLES = Array.from({ length: 12 }, (_, i) => `T-${String(i + 1).padStart(2, '0')}`)
const SESSION_KEY = 'panache_guest_session'

export default function CheckoutModal({ onClose, onSuccess }: CheckoutModalProps) {
  const cart = useCart()
  const placeOrder = usePlaceOrder()
  const { guest, isLoggedIn, isResortGuest } = useGuestAuth()

  // Resolve session info
  const lockedSession = guest || (() => {
    try {
      const c = sessionStorage.getItem(SESSION_KEY)
      return c ? JSON.parse(c) : null
    } catch { return null }
  })()

  const isSessionLocked = !!(guest?.sessionToken || lockedSession?.token || lockedSession?.sessionToken)
  const isResident = isResortGuest || !!lockedSession?.roomNumber

  const [step, setStep] = useState<'cart' | 'details'>('cart')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Pre-fill: if resident default to room_service, otherwise dine_in
  const [serviceType, setServiceType] = useState(() =>
    sessionStorage.getItem('qr_type') || (isResident ? 'room_service' : 'dine_in')
  )
  const [tableNumber, setTableNumber] = useState(() =>
    sessionStorage.getItem('qr_table') || 'T-01'
  )
  const [name, setName] = useState(() =>
    guest?.name || lockedSession?.guestName || sessionStorage.getItem('guestName') || ''
  )
  const [phone, setPhone] = useState(() =>
    guest?.phone || lockedSession?.guestPhone || sessionStorage.getItem('guestPhone') || ''
  )
  const [note, setNote] = useState('')

  const [errors, setErrors] = useState({ tableNumber: false, name: false, phone: false })

  // Financial calculations with 5% GST
  const subtotal = cart.total()
  const taxAmount = Math.round(subtotal * 0.05 * 100) / 100
  const grandTotal = Math.round((subtotal + taxAmount) * 100) / 100

  function triggerShake(field: keyof typeof errors) {
    setErrors(prev => ({ ...prev, [field]: true }))
    setTimeout(() => setErrors(prev => ({ ...prev, [field]: false })), 1200)
  }

  async function handlePlaceOrder() {
    let hasError = false

    if (!name.trim()) { triggerShake('name'); hasError = true }
    if (!phone.trim() || phone.length !== 10) { triggerShake('phone'); hasError = true }
    if (serviceType === 'dine_in' && !tableNumber) { triggerShake('tableNumber'); hasError = true }

    if (hasError) return

    setIsSubmitting(true)
    setErrorMessage('')

    const result = await placeOrder({
      guestName: name,
      guestPhone: phone,
      serviceType: !isResident && serviceType === 'room_service' ? 'dine_in' : serviceType,
      roomNumber: isResident ? (lockedSession?.roomNumber || sessionStorage.getItem('qr_room') || undefined) : undefined,
      tableNumber: serviceType === 'dine_in' ? tableNumber : undefined,
      specialNote: note
    })

    setIsSubmitting(false)

    if (result.success && result.orderId) {
      const orderNum = (result as any).orderNumber || 'PAN-XXXXX'
      try {
        localStorage.setItem('panache_last_order_id', result.orderId)
        localStorage.setItem('panache_last_order_number', orderNum)
        localStorage.setItem('panache_last_order_time', Date.now().toString())
      } catch { /* ignore */ }
      onSuccess({ order_id: result.orderId, order_number: orderNum })
    } else {
      setErrorMessage(result.error || 'Failed to place order')
    }
  }

  const shakeStyle = { animation: 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both', borderColor: 'var(--rust)', color: 'var(--rust)' }

  return (
    <>
      <style>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        select.form-input {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23707B6A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 16px;
          padding-right: 40px;
        }
      `}</style>

      <div className="backdrop show" onClick={onClose} />
      <div className="sheet show">
        <div className="sheet-handle" />

        <div className="sheet-head">
          <div className="sheet-title">{step === 'cart' ? 'Your Cart' : 'Checkout & Table Details'}</div>
          <button type="button" className="sheet-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="sheet-body">
          {step === 'cart' ? (
            <div>
              {cart.items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--sage)' }}>Your cart is empty</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {cart.items.map(item => (
                    <div key={item.id + (item.variant_label || '')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--card)', borderRadius: '10px', border: '1px solid var(--parchment-deep)' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '13.5px' }}>{item.name}</div>
                        {item.variant_label && <div style={{ fontSize: '11px', color: 'var(--sage)', marginTop: '2px' }}>{item.variant_label}</div>}
                        <div style={{ fontSize: '12.5px', color: 'var(--brass)', marginTop: '3px', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>₹{item.price} × {item.qty}</div>
                      </div>
                      <div className="stepper" style={{ transform: 'scale(0.88)' }}>
                        <button type="button" onClick={() => cart.remove(item.id, item.variant_label)}>−</button>
                        <span className="qty">{item.qty}</span>
                        <button type="button" onClick={() => cart.add(item)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {errorMessage && (
                <div style={{ padding: '11px 14px', background: 'rgba(154,69,48,0.1)', color: 'var(--rust)', borderRadius: '10px', fontSize: '12.5px', border: '1px solid rgba(154,69,48,0.2)' }}>
                  {errorMessage}
                </div>
              )}

              {/* Resident vs Walk-In Banner */}
              {isResident ? (
                <div style={{ padding: '12px 14px', background: 'rgba(44,74,34,0.08)', borderRadius: '12px', border: '1.5px solid rgba(44,74,34,0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>🛎️</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-deep)' }}>
                      {lockedSession?.guestName || name || 'Resort Guest'}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--brass)', marginTop: '1px' }}>
                      Room {lockedSession?.roomNumber || 'Resident'} · Charges bill directly to your Room Folio
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '12px 14px', background: 'rgba(173,138,63,0.12)', borderRadius: '12px', border: '1.5px solid rgba(173,138,63,0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>🍽️</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-deep)' }}>
                      Panache Restaurant Diner (Walk-In)
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--forest)', marginTop: '1px' }}>
                      Table direct dining · Itemized bill payable by Cash / UPI / Card
                    </div>
                  </div>
                </div>
              )}

              {/* Service Type */}
              <div className="form-group">
                <label className="form-label">Service Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: isResident ? '1fr 1fr 1fr' : '1fr 1fr', gap: '8px' }}>
                  {[
                    ...(isResident ? [{ value: 'room_service', label: 'Room Service', icon: '🛎️' }] : []),
                    { value: 'dine_in', label: 'Dine In (Table)', icon: '🍽️' },
                    { value: 'takeaway', label: 'Takeaway', icon: '🛍️' },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      style={{
                        padding: '10px 6px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer',
                        border: serviceType === opt.value ? '1.5px solid var(--forest)' : '1.5px solid var(--parchment-deep)',
                        background: serviceType === opt.value ? 'rgba(44,74,34,0.07)' : 'var(--card)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <input type="radio" name="service_type" value={opt.value} checked={serviceType === opt.value} onChange={() => setServiceType(opt.value)} style={{ display: 'none' }} />
                      <div style={{ fontSize: '18px', marginBottom: '4px' }}>{opt.icon}</div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: serviceType === opt.value ? 'var(--forest-deep)' : 'var(--ink-soft)' }}>{opt.label}</div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Table number — only for dine-in */}
              {serviceType === 'dine_in' && (
                <div className="form-group" style={errors.tableNumber ? shakeStyle : {}}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="form-label" style={errors.tableNumber ? { color: 'inherit' } : {}}>Select Restaurant Table *</label>
                    <span style={{ fontSize: '11px', color: 'var(--brass)', fontWeight: 600 }}>T-01 to T-12</span>
                  </div>
                  <select className="form-input" value={tableNumber} onChange={e => setTableNumber(e.target.value)} style={errors.tableNumber ? { borderColor: 'inherit' } : {}}>
                    {TABLES.map(t => <option key={t} value={t}>Table {t} (Indoor / Garden Seating)</option>)}
                  </select>
                </div>
              )}

              {/* Name */}
              <div className="form-group" style={errors.name ? shakeStyle : {}}>
                <label className="form-label" style={errors.name ? { color: 'inherit' } : {}}>Full Name / Party *</label>
                {isSessionLocked && guest?.name ? (
                  <div className="form-input" style={{ background: 'rgba(44,74,34,0.04)', color: 'var(--ink)', cursor: 'default', userSelect: 'none' }}>{name}</div>
                ) : (
                  <input type="text" className="form-input" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} style={errors.name ? { borderColor: 'inherit' } : {}} />
                )}
              </div>

              {/* Phone */}
              <div className="form-group" style={errors.phone ? shakeStyle : {}}>
                <label className="form-label" style={errors.phone ? { color: 'inherit' } : {}}>Phone Number (For Digital Receipt) *</label>
                {isSessionLocked && guest?.phone ? (
                  <div className="form-input" style={{ background: 'rgba(44,74,34,0.04)', color: 'var(--ink)', cursor: 'default', userSelect: 'none' }}>{phone}</div>
                ) : (
                  <input type="tel" className="form-input" placeholder="10 digits (e.g. 9876543210)" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} style={errors.phone ? { borderColor: 'inherit' } : {}} />
                )}
              </div>

              {/* Special Notes */}
              <div className="form-group">
                <label className="form-label">Special Notes / Spice Level (Optional)</label>
                <input type="text" className="form-textarea" style={{ height: 'auto' }} placeholder="Less spicy, no onions, cutlery needed, etc." value={note} onChange={e => setNote(e.target.value)} />
              </div>

              {/* Tax breakdown summary box */}
              <div style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '12px', padding: '12px 14px', border: '1px solid var(--parchment-deep)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--sage)' }}>
                  <span>Food Subtotal</span>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--sage)' }}>
                  <span>Restaurant GST (5%)</span>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div style={{ height: '1px', background: 'var(--parchment-deep)', margin: '2px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: 'var(--forest-deep)', fontWeight: 700 }}>
                  <span>Grand Total</span>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>₹{grandTotal.toFixed(2)}</span>
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--sage)', marginTop: '2px' }}>
                  {isResident ? 'Direct room folio billing' : 'Payable at table or reception counter upon delivery'}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sheet-footer">
          {step === 'cart' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--sage)', fontWeight: 600 }}>Subtotal (Excl. 5% GST)</div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: '19px', color: 'var(--forest-deep)' }}>₹{subtotal.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--sage)', fontWeight: 600 }}>Grand Total</div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: '19px', color: 'var(--brass)' }}>₹{grandTotal.toFixed(2)}</div>
                </div>
              </div>
              <button type="button" className="btn-main" disabled={cart.items.length === 0} onClick={() => setStep('details')}>
                Proceed to Details & Seating
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 6l6 6-6 6" /></svg>
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn-main" onClick={() => setStep('cart')} style={{ background: 'var(--card)', color: 'var(--forest-deep)', border: '1.5px solid var(--parchment-deep)', marginBottom: '8px' }}>
                ← Back to Cart
              </button>
              <button type="button" className="btn-main" onClick={handlePlaceOrder} disabled={isSubmitting}>
                {isSubmitting ? 'Sending Order to Kitchen…' : `Place Order (₹${grandTotal.toFixed(2)})`}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
