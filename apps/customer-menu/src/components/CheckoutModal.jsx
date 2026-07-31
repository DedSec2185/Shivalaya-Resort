import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getRuntimeEnv } from '@panache/shared-types';

const ROOMS = [
  ...Array.from({ length: 15 }, (_, i) => `1${String(i + 1).padStart(2, '0')}`),
  ...Array.from({ length: 15 }, (_, i) => `2${String(i + 1).padStart(2, '0')}`),
  ...Array.from({ length: 15 }, (_, i) => `3${String(i + 1).padStart(2, '0')}`)
];

const TABLES = Array.from({ length: 15 }, (_, i) => `Table ${i + 1}`);

export default function CheckoutModal({ lines, total, onClose, onSuccess }) {
  const [step, setStep] = useState('cart'); // 'cart' | 'details'
  
  // Mandatory fields
  const [roomNumber, setRoomNumber] = useState('');
  const [serviceType, setServiceType] = useState('dine_in'); // 'room_service' | 'dine_in' | 'pickup'
  
  // Optional/Conditional fields
  const [tableNumber, setTableNumber] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Shaking effect state for validation
  const [errors, setErrors] = useState({ roomNumber: false, tableNumber: false, name: false, phone: false });

  function triggerShake(field) {
    setErrors(prev => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setErrors(prev => ({ ...prev, [field]: false }));
    }, 1200);
  }

  async function handlePlaceOrder() {
    let hasError = false;
    
    // Room number is ALWAYS mandatory
    if (!roomNumber) {
      triggerShake('roomNumber');
      hasError = true;
    }

    // Name and phone are mandatory
    if (!name.trim()) {
      triggerShake('name');
      hasError = true;
    }
    if (!phone.trim()) {
      triggerShake('phone');
      hasError = true;
    }

    // Table number is mandatory IF dine-in
    if (serviceType === 'dine_in' && !tableNumber) {
      triggerShake('tableNumber');
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);
    setErrorMessage('');

    // Prepend Table Number to notes if Dine In
    const finalNote = serviceType === 'dine_in' 
      ? `[${tableNumber}] ${note}`.trim()
      : note.trim();

    const orderData = {
      service_type: serviceType,
      room_number: roomNumber,
      guest_name: name,
      guest_phone: phone,
      note: finalNote,
      items: lines.map(line => ({
        id: line.id,
        name: line.name,
        price: line.price,
        qty: line.qty,
        veg: line.veg
      })),
      total: total,
      status: 'new'
    };

    const { isDemoMode } = getRuntimeEnv(import.meta.env);

    if (!isDemoMode && supabase) {
      try {
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('id')
          .eq('slug', 'panache-shivalaya')
          .single();

        if (!restaurant) {
          throw new Error('Restaurant not found');
        }

        const { data, error } = await supabase
          .from('orders')
          .insert({
            ...orderData,
            restaurant_id: restaurant.id
          })
          .select()
          .single();

        if (error) throw error;
        onSuccess(data);
      } catch (err) {
        console.error('Error placing order:', err);
        setErrorMessage(err.message || 'Failed to place order. Please try again.');
        setIsSubmitting(false);
      }
    } else {
      // Mock local success for offline mode
      setTimeout(() => {
        onSuccess({
          id: 'PAN-' + String(Math.floor(Math.random() * 90000) + 10000),
          ...orderData,
          created_at: new Date().toISOString()
        });
      }, 800);
    }
  }

  // Animation helper for shake effect
  const shakeStyle = {
    animation: 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both',
    borderColor: 'var(--rust)',
    color: 'var(--rust)'
  };

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
          background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23231F16%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
          background-repeat: no-repeat;
          background-position: right 14px top 50%;
          background-size: 10px auto;
          padding-right: 36px;
        }
      `}</style>
      <div className="backdrop show" onClick={onClose} />
      <div className="sheet show">
        <div className="sheet-handle" />
        <div className="sheet-head">
          <div className="sheet-title">
            {step === 'cart' ? 'Your Order' : 'Guest Details'}
          </div>
          <button className="sheet-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="sheet-body">
          {step === 'cart' ? (
            lines.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 10px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3h2l2.4 12.4a2 2 0 002 1.6h8.2a2 2 0 002-1.6L21 8H6" />
                </svg>
                <p>Your cart is empty. Add a few favourites!</p>
              </div>
            ) : (
              lines.map((line) => (
                <div className="cart-row" key={line.id}>
                  <div className="cart-row-info">
                    <div className="cart-row-name">{line.name}</div>
                    <div className="cart-row-price">₹{line.price} × {line.qty}</div>
                  </div>
                  <div className="cart-row-info" style={{ flex: 'none', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', marginRight: '10px', color: 'var(--sage)' }}>
                      ₹{(line.price * line.qty).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))
            )
          ) : (
            <>
              {errorMessage && (
                <div style={{ color: 'var(--rust)', fontSize: '12px', marginBottom: '10px', fontWeight: 600 }}>
                  {errorMessage}
                </div>
              )}

              {/* Room Number Dropdown (Always First and Mandatory) */}
              <div className="form-group" style={errors.roomNumber ? shakeStyle : {}}>
                <label className="form-label" style={errors.roomNumber ? { color: 'inherit' } : {}}>
                  Room Number *
                </label>
                <select
                  className="form-input"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  style={errors.roomNumber ? { borderColor: 'inherit' } : {}}
                >
                  <option value="" disabled>Select Room</option>
                  {ROOMS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Service Type Segmented Control */}
              <div className="form-group">
                <label className="form-label">Service Type *</label>
                <div className="segmented">
                  <input
                    type="radio"
                    name="svc"
                    id="svcRoom"
                    className="seg-opt"
                    checked={serviceType === 'room_service'}
                    onChange={() => setServiceType('room_service')}
                  />
                  <label htmlFor="svcRoom" className="seg-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 20V8a2 2 0 012-2h14a2 2 0 012 2v12M3 12h18M7 12V8" />
                    </svg>
                    <span>Room</span>
                  </label>

                  <input
                    type="radio"
                    name="svc"
                    id="svcDine"
                    className="seg-opt"
                    checked={serviceType === 'dine_in'}
                    onChange={() => setServiceType('dine_in')}
                  />
                  <label htmlFor="svcDine" className="seg-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 3v8a3 3 0 003 3v7M4 3a3 3 0 000 8M20 3v18M20 3a2 2 0 00-2 2v4a2 2 0 002 2" />
                    </svg>
                    <span>Dine-In</span>
                  </label>

                  <input
                    type="radio"
                    name="svc"
                    id="svcPickup"
                    className="seg-opt"
                    checked={serviceType === 'pickup'}
                    onChange={() => setServiceType('pickup')}
                  />
                  <label htmlFor="svcPickup" className="seg-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 8h16l-1.5 11a2 2 0 01-2 2h-9a2 2 0 01-2-2L4 8zM8 8V6a4 4 0 018 0v2" />
                    </svg>
                    <span>Pickup</span>
                  </label>
                </div>
              </div>

              {/* Table Number Dropdown (Mandatory if Dine In) */}
              <div className={`room-field ${serviceType === 'dine_in' ? 'open' : ''}`} style={errors.tableNumber ? shakeStyle : {}}>
                <label className="form-label" style={errors.tableNumber ? { color: 'inherit' } : {}}>
                  Table Number *
                </label>
                <select
                  className="form-input"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  style={errors.tableNumber ? { borderColor: 'inherit' } : {}}
                >
                  <option value="" disabled>Select Table</option>
                  {TABLES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Name Field */}
              <div className="form-group" style={errors.name ? shakeStyle : {}}>
                <label className="form-label" style={errors.name ? { color: 'inherit' } : {}}>
                  Full Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={errors.name ? { borderColor: 'inherit' } : {}}
                />
              </div>

              {/* Phone Field */}
              <div className="form-group" style={errors.phone ? shakeStyle : {}}>
                <label className="form-label" style={errors.phone ? { color: 'inherit' } : {}}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="10 digits, no spaces (e.g. 9876543210)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  style={errors.phone ? { borderColor: 'inherit' } : {}}
                />
              </div>

              {/* Notes Field */}
              <div className="form-group">
                <label className="form-label">Special Notes (Optional)</label>
                <input
                  type="text"
                  className="form-textarea"
                  style={{ height: 'auto' }}
                  placeholder="No onions, extra spicy, etc."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <div className="sheet-footer">
          {step === 'cart' ? (
            <>
              <div className="cart-total-row" style={{ marginBottom: '12px' }}>
                <span className="cart-total-label">Total Amount</span>
                <span className="cart-total-amt">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
              <button
                type="button"
                className="btn-main"
                disabled={lines.length === 0}
                onClick={() => setStep('details')}
              >
                Proceed to Details
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn-main"
                onClick={() => setStep('cart')}
                style={{
                  background: 'var(--card)',
                  color: 'var(--forest-deep)',
                  border: '1.5px solid var(--parchment-deep)',
                  marginBottom: '8px'
                }}
              >
                Back to Cart
              </button>
              <button
                type="button"
                className="btn-main"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
