import { Printer, X, ShieldCheck } from 'lucide-react'

export interface BillOrder {
  id: string
  order_number?: string
  created_at: string
  service_type?: string
  guest_name?: string
  guest_phone?: string
  room_number?: string | null
  table_number?: string | null
  subtotal?: number
  tax_amount?: number | null
  grand_total?: number | null
  payment_status?: string | null
  payment_method?: string | null
  special_note?: string | null
  items: Array<{
    id?: string
    name: string
    qty: number
    price: number
    variant_label?: string | null
  }>
  restaurant_tables?: { table_number: string } | null
  rooms?: { room_number: string } | null
}

interface CustomerBillModalProps {
  order: BillOrder
  onClose: () => void
}

// Convert amount to Indian currency words
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

export default function CustomerBillModal({ order, onClose }: CustomerBillModalProps) {
  const createdDate = new Date(order.created_at || Date.now())
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
  const subtotal = order.subtotal || order.items?.reduce((acc, it) => acc + (it.price * it.qty), 0) || 0
  const cgst = Math.round(subtotal * 0.025 * 100) / 100 // 2.5%
  const sgst = Math.round(subtotal * 0.025 * 100) / 100 // 2.5%
  const totalWithTax = subtotal + cgst + sgst
  const grandTotal = Math.round(totalWithTax)
  const roundOff = Math.round((grandTotal - totalWithTax) * 100) / 100

  const totalItemCount = order.items?.reduce((sum, it) => sum + it.qty, 0) || 0
  const rawOrderNum = order.order_number || (order.id ? order.id.slice(0, 8).toUpperCase() : 'PAN-00001')
  const serialNo = rawOrderNum.replace(/[^0-9]/g, '').slice(-5) || '1001'
  const invoiceNo = `INV-2026-${serialNo}`

  // Location resolution
  const resolvedTable = order.restaurant_tables?.table_number || order.table_number
  const resolvedRoom = order.rooms?.room_number || order.room_number
  const isRoomService = order.service_type === 'room_service' || (!resolvedTable && !!resolvedRoom)
  const isTakeaway = order.service_type === 'takeaway'

  let locationBadge = 'Dine-In Table'
  let locationDetail = resolvedTable ? `Table ${resolvedTable}` : 'Restaurant Table'
  if (isTakeaway) {
    locationBadge = 'Takeaway'
    locationDetail = 'Self-Pickup Counter'
  } else if (isRoomService) {
    locationBadge = 'In-House Resident'
    locationDetail = `Suite ${resolvedRoom || 'Room'}`
  } else if (resolvedTable) {
    locationBadge = 'Walk-In Dining'
    locationDetail = `Table ${resolvedTable}`
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <div 
        className="customer-bill-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 18, 8, 0.82)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
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
          className="customer-bill-dialog"
          style={{
            background: '#F9F8F4',
            borderRadius: '20px',
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(173, 138, 63, 0.25)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '94vh'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Top Header (Screen Only) */}
          <div 
            className="no-print"
            style={{
              padding: '14px 18px',
              background: '#1A2E13',
              color: '#F3EEDB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid var(--brass)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--brass-light)" />
              <div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: '16px', fontWeight: 700, color: 'var(--brass-light)' }}>
                  Official Food Bill & Tax Invoice
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--sage)' }}>
                  Shivalaya Panache Restaurant · 80mm GST Thermal Slip
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F3EEDB',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Printable 80mm Receipt Area */}
          <div 
            style={{
              padding: '20px 16px',
              overflowY: 'auto',
              flex: 1,
              background: '#EAE6D8',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            {/* The actual paper slip */}
            <div 
              id="printable-guest-bill"
              className="thermal-slip-paper"
              style={{
                width: '76mm',
                background: '#FFFFFF',
                color: '#000000',
                padding: '12px 10px',
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: '11px',
                lineHeight: 1.25,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                borderRadius: '4px'
              }}
            >
              {/* Hotel / Restaurant Brand Header */}
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '0.5px' }}>
                  SHIVALAYA RESORTS
                </div>
                <div style={{ fontSize: '12px', fontWeight: 800, marginTop: '1px' }}>
                  PANACHE RESTAURANT & LOUNGE
                </div>
                <div style={{ fontSize: '9px', marginTop: '2px', color: '#333' }}>
                  Pines, Gethia, Bhowali-Nainital Road
                </div>
                <div style={{ fontSize: '9px', color: '#333' }}>
                  Nainital, Uttarakhand - 263127
                </div>
                <div style={{ fontSize: '9px', marginTop: '3px', fontWeight: 700 }}>
                  GSTIN: 05AAACS1234F1Z8
                </div>
                <div style={{ fontSize: '8.5px', color: '#444' }}>
                  FSSAI Lic No: 12623005000123
                </div>
                <div style={{ fontSize: '8.5px', color: '#444' }}>
                  Ph: +91 88000 00000 / +91 98765 43210
                </div>
              </div>

              {/* Title & Divider */}
              <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '4px 0', textAlign: 'center', margin: '6px 0' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '1px' }}>
                  TAX INVOICE / RETAIL BILL
                </span>
              </div>

              {/* Bill Meta Data */}
              <div style={{ fontSize: '9.5px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Invoice No: <strong>{invoiceNo}</strong></span>
                  <span>Date: {dateStr}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Order Ref: <strong>{rawOrderNum}</strong></span>
                  <span>Time: {timeStr}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                  <span>Location: <strong>{locationDetail}</strong></span>
                  <span>({locationBadge})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Guest: {order.guest_name || 'Walk-In Customer'}</span>
                  <span>Mob: {order.guest_phone || 'N/A'}</span>
                </div>
              </div>

              {/* Items Table Header */}
              <div style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '3px 0', fontSize: '9px', fontWeight: 800, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ width: '46%' }}>ITEM</span>
                <span style={{ width: '14%', textAlign: 'center' }}>QTY</span>
                <span style={{ width: '18%', textAlign: 'right' }}>RATE</span>
                <span style={{ width: '22%', textAlign: 'right' }}>AMOUNT</span>
              </div>

              {/* Item Rows */}
              <div style={{ margin: '4px 0' }}>
                {order.items?.map((it, idx) => {
                  const lineTotal = (it.price || 0) * (it.qty || 1)
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', padding: '2px 0' }}>
                      <div style={{ width: '46%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {it.name}
                        {it.variant_label && (
                          <span style={{ fontSize: '8px', display: 'block', color: '#444' }}>({it.variant_label})</span>
                        )}
                      </div>
                      <div style={{ width: '14%', textAlign: 'center' }}>{it.qty}</div>
                      <div style={{ width: '18%', textAlign: 'right' }}>{Number(it.price || 0).toFixed(2)}</div>
                      <div style={{ width: '22%', textAlign: 'right', fontWeight: 700 }}>{lineTotal.toFixed(2)}</div>
                    </div>
                  )
                })}
              </div>

              {/* Subtotal & Taxes */}
              <div style={{ borderTop: '1px dashed #000', paddingTop: '4px', fontSize: '9.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span>Total Items: {totalItemCount}</span>
                  <span>Subtotal: ₹{subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#222' }}>
                  <span>CGST @ 2.5%:</span>
                  <span>₹{cgst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#222' }}>
                  <span>SGST @ 2.5%:</span>
                  <span>₹{sgst.toFixed(2)}</span>
                </div>
                {roundOff !== 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#444', fontSize: '8.5px' }}>
                    <span>Round Off:</span>
                    <span>{roundOff > 0 ? `+₹${roundOff.toFixed(2)}` : `-₹${Math.abs(roundOff).toFixed(2)}`}</span>
                  </div>
                )}
              </div>

              {/* Grand Total Box */}
              <div 
                style={{
                  borderTop: '2px solid #000',
                  borderBottom: '2px solid #000',
                  margin: '6px 0',
                  padding: '5px 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline'
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 900 }}>NET PAYABLE:</span>
                <span style={{ fontSize: '15px', fontWeight: 900 }}>₹{grandTotal.toFixed(2)}</span>
              </div>

              {/* Amount in words */}
              <div style={{ fontSize: '8.5px', fontStyle: 'italic', margin: '4px 0', color: '#333' }}>
                Amount in words: {numberToWords(grandTotal)}
              </div>

              {/* Settlement / Payment Status Banner */}
              <div 
                style={{
                  border: '1px solid #000',
                  padding: '4px',
                  textAlign: 'center',
                  margin: '6px 0',
                  fontSize: '9.5px',
                  fontWeight: 800,
                  background: order.payment_status === 'paid' ? '#f0fdf4' : '#fffbeb'
                }}
              >
                {order.payment_status === 'paid' ? (
                  <span>PAID VIA {order.payment_method?.toUpperCase() || 'DIGITAL / CASH'}</span>
                ) : isRoomService ? (
                  <span>ROOM FOLIO POSTING — BILLED TO SUITE</span>
                ) : (
                  <span>PAYABLE AT TABLE / RECEPTION COUNTER</span>
                )}
              </div>

              {/* Footer Hospitality Message */}
              <div style={{ textAlign: 'center', fontSize: '8px', color: '#444', marginTop: '8px', borderTop: '1px dashed #000', paddingTop: '6px' }}>
                <div style={{ fontWeight: 700, fontSize: '9px', marginBottom: '2px' }}>
                  Thank you for visiting Panache!
                </div>
                <div>Enjoy your peaceful stay in the hills.</div>
                <div style={{ marginTop: '2px' }}>www.shivalayaresort.com · GST Inclusive Food Bill</div>
                <div style={{ marginTop: '2px', fontSize: '7.5px' }}>* Computer-Generated Official Tax Invoice *</div>
              </div>
            </div>
          </div>

          {/* Modal Actions Footer (Screen Only) */}
          <div 
            className="no-print"
            style={{
              padding: '14px 18px',
              background: '#FFFFFF',
              borderTop: '1px solid var(--parchment-deep)',
              display: 'flex',
              gap: '10px'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: '12px',
                border: '1.5px solid var(--parchment-deep)',
                background: 'transparent',
                color: 'var(--sage)',
                fontSize: '13px',
                fontWeight: 600,
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
                padding: '11px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, var(--forest-deep), var(--forest))',
                color: '#FFF',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(26,46,19,0.25)'
              }}
            >
              <Printer size={16} />
              <span>Print Tax Invoice (80mm / PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
