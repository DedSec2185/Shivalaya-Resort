import type { Order } from '../hooks/useOrders'

interface KOTModalProps {
  order: Order
  onClose: () => void
}

export default function KOTModal({ order, onClose }: KOTModalProps) {
  const dateStr = new Date(order.created_at).toLocaleString('en-IN')

  function handlePrint() {
    window.print()
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 print:hidden"
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 9999
        }}
        onClick={onClose}
      >
        {/* On-screen modal container */}
        <div 
          className="bg-[#F8F6F0] rounded-xl max-w-sm w-full p-6 text-black border border-[#DCD6C5]"
          style={{
            background: '#F8F6F0',
            borderRadius: '12px',
            maxWidth: '360px',
            width: '100%',
            padding: '24px',
            border: '1px solid #DCD6C5',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Print container */}
          <div id="kot-container" className="font-mono text-sm leading-relaxed">
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>KOT TICKET</div>
              <div style={{ fontSize: '12px', marginTop: '2px', color: '#666' }}>Shivalaya Panache Restaurant</div>
            </div>
            
            <div className="kot-divider" style={{ borderTop: '1px dashed black', margin: '8px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>Order No:</span>
              <strong style={{ fontSize: '14px' }}>{order.order_number}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '4px' }}>
              <span>Service Type:</span>
              <strong style={{ fontSize: '14px', textTransform: 'uppercase' }}>
                {order.service_type === 'room_service' 
                  ? `Room ${order.room_number || 'N/A'}` 
                  : `Table ${order.table_number || 'N/A'}`}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '4px' }}>
              <span>Time:</span>
              <span>{dateStr}</span>
            </div>
            
            <div className="kot-divider" style={{ borderTop: '1px dashed black', margin: '8px 0' }} />

            <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>ITEMS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {order.items.map((it, idx) => (
                <div key={idx} style={{ fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>{it.name}</span>
                    <span>Qty: {it.qty}</span>
                  </div>
                  {it.variant_label && (
                    <div style={{ fontSize: '11px', color: '#555', paddingLeft: '8px', fontStyle: 'italic' }}>
                      ↳ {it.variant_label}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {order.special_note && (
              <>
                <div className="kot-divider" style={{ borderTop: '1px dashed black', margin: '8px 0' }} />
                <div style={{ fontSize: '12px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>SPECIAL NOTES:</div>
                  <div style={{ background: '#FFF', padding: '6px', borderRadius: '4px', border: '1px solid #EAEAEA', fontStyle: 'italic' }}>
                    {order.special_note}
                  </div>
                </div>
              </>
            )}

            <div className="kot-divider" style={{ borderTop: '1px dashed black', margin: '8px 0' }} />
            <div style={{ textAlign: 'center', fontSize: '11px', color: '#666', marginTop: '8px' }}>
              --- End of Ticket ---
            </div>
          </div>

          {/* Action buttons (hidden on print) */}
          <div className="flex gap-3 mt-6 print:hidden" style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            <button
              type="button"
              className="btn-main"
              onClick={onClose}
              style={{
                flex: 1,
                background: '#EAE6D8',
                color: '#2D5016',
                border: '1px solid #DCD6C5',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
            <button
              type="button"
              className="btn-main"
              onClick={handlePrint}
              style={{
                flex: 1,
                background: 'var(--forest)',
                color: 'white',
                border: 'none',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Print Ticket
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
