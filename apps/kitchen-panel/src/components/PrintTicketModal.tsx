import { useState } from 'react'
import type { Order } from '../hooks/useOrders'
import { Printer, X, ChefHat, Receipt } from 'lucide-react'

interface PrintTicketModalProps {
  order: Order
  onClose: () => void
  initialMode?: 'kot' | 'bill'
}

// Helper to convert number to Indian currency words
function numberToWords(num: number): string {
  const rounded = Math.round(num)
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ]
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  if (rounded === 0) return 'Zero Rupees Only'
  if (rounded < 20) return a[rounded] + ' Rupees Only'

  function inWords(n: number): string {
    if (n < 20) return a[n]
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '')
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + inWords(n % 100) : '')
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '')
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '')
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '')
  }

  return inWords(rounded) + ' Rupees Only'
}

export default function PrintTicketModal({ order, onClose, initialMode = 'kot' }: PrintTicketModalProps) {
  const [mode, setMode] = useState<'kot' | 'bill'>(initialMode)

  const createdDate = new Date(order.created_at)
  const dateStr = createdDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
  const timeStr = createdDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })

  // Financial calculations with 5% Restaurant GST
  const subtotal = order.subtotal || order.items.reduce((acc, it) => acc + (it.price * it.qty), 0)
  const cgst = Math.round(subtotal * 0.025 * 100) / 100 // 2.5%
  const sgst = Math.round(subtotal * 0.025 * 100) / 100 // 2.5%
  const totalWithTax = subtotal + cgst + sgst
  const grandTotal = Math.round(totalWithTax)
  const roundOff = Math.round((grandTotal - totalWithTax) * 100) / 100

  const totalItemCount = order.items.reduce((sum, it) => sum + it.qty, 0)
  const serialNo = (order.order_number || 'PAN-00000').replace(/[^0-9]/g, '').slice(-5) || '1042'
  const kotNo = `KOT-${serialNo}`
  const invoiceNo = `INV-2026-${serialNo}`

  const isRoomService = order.service_type === 'room_service' || (!order.table_number && order.room_number)
  const isTakeaway = order.service_type === 'takeaway'

  const locationLabel = isRoomService
    ? `ROOM ${order.room_number || 'RESIDENT'}`
    : isTakeaway
    ? 'TAKEAWAY / PARCEL'
    : `TABLE ${order.table_number || 'T-01'}`

  const customerCategory = isRoomService
    ? `In-House Resident (Room ${order.room_number || 'N/A'})`
    : 'Walk-in / Restaurant Guest'

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      {/* ── ON-SCREEN MODAL (Hidden during @media print) ── */}
      <div
        className="print-modal-backdrop print-hidden"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 16, 12, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 99999,
          overflowY: 'auto'
        }}
        onClick={onClose}
      >
        <div
          className="print-modal-window"
          style={{
            background: '#F9F8F4',
            borderRadius: '20px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(173, 138, 63, 0.25)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '92vh'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div
            style={{
              padding: '16px 20px',
              background: '#1A2E13',
              color: '#F3EEDB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid var(--brass)'
            }}
          >
            <div>
              <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '18px', fontWeight: 700, color: 'var(--brass-light)' }}>
                Shivalaya Panache POS
              </div>
              <div style={{ fontSize: '11px', color: 'var(--sage)', letterSpacing: '0.5px' }}>
                Commercial Thermal Receipt & Invoice Engine
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F3EEDB',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Mode Selector Tabs */}
          <div
            style={{
              display: 'flex',
              padding: '10px 16px',
              background: '#EAE6D8',
              gap: '8px',
              borderBottom: '1px solid rgba(0,0,0,0.08)'
            }}
          >
            <button
              type="button"
              onClick={() => setMode('kot')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: mode === 'kot' ? '#1A2E13' : 'transparent',
                color: mode === 'kot' ? '#FFFFFF' : '#475440'
              }}
            >
              <ChefHat size={16} />
              <span>Kitchen KOT (रसोई पर्ची)</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('bill')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: mode === 'bill' ? '#1A2E13' : 'transparent',
                color: mode === 'bill' ? '#FFFFFF' : '#475440'
              }}
            >
              <Receipt size={16} />
              <span>Customer Tax Bill (ग्राहक बिल)</span>
            </button>
          </div>

          {/* Receipt Preview Scroll Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              background: '#ECE8DB',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            {/* Visual Paper Slip */}
            <div
              style={{
                width: '100%',
                maxWidth: '340px',
                background: '#FFFFFF',
                padding: '20px 18px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                borderRadius: '4px',
                border: '1px solid #D7D2C0',
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '12px',
                lineHeight: 1.35,
                color: '#111111'
              }}
            >
              {mode === 'kot' ? (
                /* ── KOT PREVIEW ───────────────────────────────── */
                <div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '1px' }}>
                      SHIVALAYA RESORTS & SPA
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>PANACHE RESTAURANT</div>
                    <div style={{ fontSize: '11px', marginTop: '2px', color: '#555' }}>
                      *** KITCHEN ORDER TICKET (KOT) ***
                    </div>
                  </div>

                  <div style={{ borderTop: '1px dashed #222', margin: '8px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>KOT NO: <strong>{kotNo}</strong></span>
                    <span>{dateStr}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '3px' }}>
                    <span>ORDER: <strong>{order.order_number}</strong></span>
                    <span>{timeStr}</span>
                  </div>

                  <div style={{ borderTop: '1px dashed #222', margin: '8px 0' }} />

                  {/* Destination Banner */}
                  <div
                    style={{
                      background: '#F0F0F0',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      textAlign: 'center',
                      fontWeight: 800,
                      fontSize: '14px',
                      letterSpacing: '0.5px',
                      border: '1px solid #DDD'
                    }}
                  >
                    {locationLabel}
                  </div>

                  {order.guest_name && (
                    <div style={{ marginTop: '6px', fontSize: '11.5px' }}>
                      <span>GUEST: </span>
                      <strong>{order.guest_name}</strong>
                      {order.guest_phone && <span style={{ color: '#555' }}> ({order.guest_phone})</span>}
                    </div>
                  )}

                  <div style={{ borderTop: '1px dashed #222', margin: '8px 0' }} />

                  {/* Items header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '12px' }}>
                    <span>QTY  ITEM DESCRIPTION</span>
                  </div>
                  <div style={{ borderTop: '1px solid #444', margin: '4px 0 8px 0' }} />

                  {/* Items rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {order.items.map((it, idx) => (
                      <div key={idx}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <span
                            style={{
                              fontWeight: 900,
                              background: '#222',
                              color: '#FFF',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              fontSize: '12px',
                              minWidth: '24px',
                              textAlign: 'center'
                            }}
                          >
                            {it.qty}
                          </span>
                          <span style={{ fontWeight: 800, fontSize: '13px', flex: 1 }}>
                            {it.name}
                          </span>
                        </div>
                        {it.variant_label && (
                          <div style={{ paddingLeft: '32px', fontSize: '11px', color: '#555', fontStyle: 'italic' }}>
                            ↳ {it.variant_label}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.special_note && (
                    <>
                      <div style={{ borderTop: '1px dashed #222', margin: '10px 0' }} />
                      <div style={{ background: '#FFF9E6', border: '1px solid #E6D8A8', padding: '6px 8px', borderRadius: '4px', fontSize: '11.5px' }}>
                        <div style={{ fontWeight: 800, color: '#8A5B00' }}>⚠️ CHEF INSTRUCTION:</div>
                        <div style={{ fontStyle: 'italic', marginTop: '2px', fontWeight: 600 }}>
                          "{order.special_note}"
                        </div>
                      </div>
                    </>
                  )}

                  <div style={{ borderTop: '1px dashed #222', margin: '10px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '12px' }}>
                    <span>TOTAL DISHES / UNITS:</span>
                    <span>{order.items.length} items ({totalItemCount} pcs)</span>
                  </div>

                  <div style={{ borderTop: '1px dashed #222', margin: '10px 0' }} />

                  <div style={{ textAlign: 'center', fontSize: '10.5px', color: '#666' }}>
                    --- KITCHEN COPY · SHIVALAYA RESORTS ---
                  </div>
                </div>
              ) : (
                /* ── CUSTOMER BILL PREVIEW ─────────────────────── */
                <div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '1px' }}>
                      SHIVALAYA RESORTS
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>PANACHE RESTAURANT</div>
                    <div style={{ fontSize: '10.5px', color: '#555', marginTop: '3px', lineHeight: 1.3 }}>
                      Pines, Gethia, Nainital, Uttarakhand - 263127<br />
                      GSTIN: 05AAACS1234F1Z8 | FSSAI: 12623005000123<br />
                      Ph: +91 98765 43210 / 98924 69015
                    </div>
                    <div style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '3px 0', margin: '8px 0', fontWeight: 800, fontSize: '12px', letterSpacing: '0.8px' }}>
                      RESTAURANT TAX INVOICE
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span>Bill No: <strong>{invoiceNo}</strong></span>
                    <span>Date: {dateStr}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
                    <span>Order No: <strong>{order.order_number}</strong></span>
                    <span>Time: {timeStr}</span>
                  </div>
                  <div style={{ fontSize: '11px', marginTop: '3px' }}>
                    <span>Customer: <strong>{order.guest_name || 'Walk-in Guest'}</strong></span>
                    {order.guest_phone && <span> ({order.guest_phone})</span>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
                    <span>Type: <strong>{customerCategory}</strong></span>
                    <span>{locationLabel}</span>
                  </div>

                  <div style={{ borderTop: '1px dashed #222', margin: '8px 0' }} />

                  {/* Table Header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr 30px 45px 55px', fontWeight: 800, fontSize: '11px', paddingBottom: '3px' }}>
                    <span>#</span>
                    <span>ITEM</span>
                    <span style={{ textAlign: 'center' }}>QTY</span>
                    <span style={{ textAlign: 'right' }}>RATE</span>
                    <span style={{ textAlign: 'right' }}>AMT</span>
                  </div>
                  <div style={{ borderTop: '1px solid #444', marginBottom: '6px' }} />

                  {/* Items Rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {order.items.map((it, idx) => {
                      const itemTotal = it.price * it.qty
                      return (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '20px 1fr 30px 45px 55px', fontSize: '11.5px', alignItems: 'baseline' }}>
                          <span style={{ color: '#666' }}>{idx + 1}</span>
                          <span style={{ fontWeight: 600, paddingRight: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {it.name}
                          </span>
                          <span style={{ textAlign: 'center', fontWeight: 700 }}>{it.qty}</span>
                          <span style={{ textAlign: 'right' }}>{it.price}</span>
                          <span style={{ textAlign: 'right', fontWeight: 700 }}>{itemTotal.toFixed(2)}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div style={{ borderTop: '1px dashed #222', margin: '8px 0' }} />

                  {/* Subtotal & Taxes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11.5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Subtotal ({totalItemCount} items):</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#444' }}>
                      <span>CGST (2.5%):</span>
                      <span>₹{cgst.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#444' }}>
                      <span>SGST (2.5%):</span>
                      <span>₹{sgst.toFixed(2)}</span>
                    </div>
                    {roundOff !== 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '10.5px' }}>
                        <span>Round Off:</span>
                        <span>{roundOff > 0 ? `+₹${roundOff.toFixed(2)}` : `-₹${Math.abs(roundOff).toFixed(2)}`}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '1.5px solid #000', borderBottom: '1.5px solid #000', padding: '6px 0', margin: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 900, fontSize: '13px' }}>NET AMOUNT:</span>
                    <span style={{ fontWeight: 900, fontSize: '16px' }}>₹{grandTotal.toLocaleString('en-IN')}.00</span>
                  </div>

                  <div style={{ fontSize: '10.5px', fontStyle: 'italic', color: '#444', marginBottom: '8px' }}>
                    Amount in words: {numberToWords(grandTotal)}
                  </div>

                  <div style={{ background: '#F4F4F4', padding: '5px 8px', borderRadius: '4px', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Payment Mode: <strong>{isRoomService ? 'Room Folio Credit' : 'Cash / UPI'}</strong></span>
                    <span style={{ fontWeight: 800, color: order.status === 'served' ? '#1B5E20' : '#E65100' }}>
                      {order.status === 'served' ? '● PAID' : '● SETTLED'}
                    </span>
                  </div>

                  <div style={{ borderTop: '1px dashed #222', margin: '10px 0' }} />

                  <div style={{ textAlign: 'center', fontSize: '10px', color: '#555', lineHeight: 1.35 }}>
                    Thank you for dining at Panache, Shivalaya Resorts!<br />
                    Taxes inclusive under composition / composite GST scheme.<br />
                    www.shivalayaresorts.com · Have a serene stay!
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div
            style={{
              padding: '16px 20px',
              background: '#FFFFFF',
              borderTop: '1px solid #E0DDD0',
              display: 'flex',
              gap: '12px'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                background: '#ECE8DB',
                color: '#33402E',
                border: '1px solid #D5CEBD',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>

            <button
              type="button"
              onClick={handlePrint}
              style={{
                flex: 2,
                padding: '12px 18px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #1A2E13 0%, #2D5016 100%)',
                color: '#FFFFFF',
                border: '1px solid var(--brass)',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(26, 46, 19, 0.3)'
              }}
            >
              <Printer size={17} />
              <span>Print {mode === 'kot' ? 'KOT Slip (रसोई पर्ची)' : 'Customer Bill (ग्राहक बिल)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── PRINT-ONLY ISOLATED SECTION (Rendered ONLY on @media print) ── */}
      <div id="printable-thermal-slip" className="print-only">
        {mode === 'kot' ? (
          /* PURE 80MM THERMAL KOT SLIP */
          <div className="thermal-kot">
            <div className="thermal-center bold">SHIVALAYA RESORTS & SPA</div>
            <div className="thermal-center bold">PANACHE RESTAURANT</div>
            <div className="thermal-center">*** KITCHEN ORDER TICKET (KOT) ***</div>
            <div className="thermal-dash">- - - - - - - - - - - - - - - - - - - - - - - -</div>
            <div className="thermal-row">
              <span>KOT NO: <strong>{kotNo}</strong></span>
              <span>{dateStr}</span>
            </div>
            <div className="thermal-row">
              <span>ORDER: <strong>{order.order_number}</strong></span>
              <span>{timeStr}</span>
            </div>
            <div className="thermal-dash">- - - - - - - - - - - - - - - - - - - - - - - -</div>
            <div className="thermal-banner bold">{locationLabel}</div>
            {order.guest_name && (
              <div className="thermal-row" style={{ marginTop: '2mm' }}>
                <span>GUEST: <strong>{order.guest_name}</strong></span>
                {order.guest_phone && <span>({order.guest_phone})</span>}
              </div>
            )}
            <div className="thermal-dash">- - - - - - - - - - - - - - - - - - - - - - - -</div>
            <div className="thermal-row bold">
              <span>QTY  ITEM DESCRIPTION</span>
            </div>
            <div className="thermal-line" />
            <div className="thermal-items">
              {order.items.map((it, idx) => (
                <div key={idx} className="thermal-item-block">
                  <div className="thermal-item-row bold">
                    <span className="thermal-qty">[{it.qty}]</span>
                    <span className="thermal-name">{it.name}</span>
                  </div>
                  {it.variant_label && (
                    <div className="thermal-sub">↳ {it.variant_label}</div>
                  )}
                </div>
              ))}
            </div>
            {order.special_note && (
              <>
                <div className="thermal-dash">- - - - - - - - - - - - - - - - - - - - - - - -</div>
                <div className="thermal-note">
                  <span className="bold">⚠️ CHEF INSTRUCTION: </span>
                  "{order.special_note}"
                </div>
              </>
            )}
            <div className="thermal-dash">- - - - - - - - - - - - - - - - - - - - - - - -</div>
            <div className="thermal-row bold">
              <span>TOTAL ITEMS:</span>
              <span>{order.items.length} items ({totalItemCount} units)</span>
            </div>
            <div className="thermal-dash">- - - - - - - - - - - - - - - - - - - - - - - -</div>
            <div className="thermal-center" style={{ fontSize: '9px' }}>
              --- END OF KOT SLIP ---
            </div>
          </div>
        ) : (
          /* PURE 80MM THERMAL CUSTOMER TAX INVOICE BILL */
          <div className="thermal-bill">
            <div className="thermal-center bold">SHIVALAYA RESORTS</div>
            <div className="thermal-center bold">PANACHE RESTAURANT</div>
            <div className="thermal-center" style={{ fontSize: '9px', lineHeight: 1.25 }}>
              Pines, Gethia, Nainital, Uttarakhand - 263127<br />
              GSTIN: 05AAACS1234F1Z8 | FSSAI: 12623005000123<br />
              Ph: +91 98765 43210
            </div>
            <div className="thermal-center bold" style={{ margin: '2mm 0', borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '1mm 0' }}>
              RESTAURANT TAX INVOICE
            </div>
            <div className="thermal-row">
              <span>Bill No: <strong>{invoiceNo}</strong></span>
              <span>Date: {dateStr}</span>
            </div>
            <div className="thermal-row">
              <span>Order No: <strong>{order.order_number}</strong></span>
              <span>Time: {timeStr}</span>
            </div>
            <div className="thermal-row">
              <span>Guest: <strong>{order.guest_name || 'Walk-in'}</strong></span>
              {order.guest_phone && <span>{order.guest_phone}</span>}
            </div>
            <div className="thermal-row">
              <span>Type: <strong>{customerCategory}</strong></span>
              <span>{locationLabel}</span>
            </div>
            <div className="thermal-dash">- - - - - - - - - - - - - - - - - - - - - - - -</div>
            <div className="thermal-row bold" style={{ fontSize: '10px' }}>
              <span>ITEM</span>
              <span>QTY  RATE  AMOUNT</span>
            </div>
            <div className="thermal-line" />
            <div className="thermal-items">
              {order.items.map((it, idx) => {
                const total = it.price * it.qty
                return (
                  <div key={idx} className="thermal-row" style={{ fontSize: '10px', marginTop: '1mm' }}>
                    <span style={{ maxWidth: '40mm', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {it.name}
                    </span>
                    <span>{it.qty} × {it.price} = ₹{total.toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
            <div className="thermal-dash">- - - - - - - - - - - - - - - - - - - - - - - -</div>
            <div className="thermal-row">
              <span>Item Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="thermal-row">
              <span>CGST (2.5%):</span>
              <span>₹{cgst.toFixed(2)}</span>
            </div>
            <div className="thermal-row">
              <span>SGST (2.5%):</span>
              <span>₹{sgst.toFixed(2)}</span>
            </div>
            {roundOff !== 0 && (
              <div className="thermal-row">
                <span>Round Off:</span>
                <span>{roundOff > 0 ? `+₹${roundOff.toFixed(2)}` : `-₹${Math.abs(roundOff).toFixed(2)}`}</span>
              </div>
            )}
            <div className="thermal-dash" style={{ margin: '1mm 0' }}>==========================================</div>
            <div className="thermal-row bold" style={{ fontSize: '12px' }}>
              <span>NET PAYABLE:</span>
              <span>₹{grandTotal.toLocaleString('en-IN')}.00</span>
            </div>
            <div className="thermal-dash" style={{ margin: '1mm 0' }}>==========================================</div>
            <div style={{ fontSize: '9px', fontStyle: 'italic', margin: '1mm 0' }}>
              Words: {numberToWords(grandTotal)}
            </div>
            <div className="thermal-row bold" style={{ margin: '1mm 0' }}>
              <span>Mode: {isRoomService ? 'Room Folio' : 'Cash / UPI'}</span>
              <span>{order.status === 'served' ? '● PAID' : '● SETTLED'}</span>
            </div>
            <div className="thermal-dash">- - - - - - - - - - - - - - - - - - - - - - - -</div>
            <div className="thermal-center" style={{ fontSize: '9px', lineHeight: 1.3 }}>
              Thank you for dining with us at Shivalaya Panache!<br />
              Visit us again in Nainital · www.shivalayaresorts.com
            </div>
          </div>
        )}
      </div>
    </>
  )
}
