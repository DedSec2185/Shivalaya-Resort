import { useState, useEffect } from 'react';

const STATUS_STEPS = [
  { id: 'new', label: 'Order Received', icon: '📝', desc: 'Sent to Front Desk' },
  { id: 'confirmed', label: 'Confirmed', icon: '👨‍🍳', desc: 'Accepted by Receptionist' },
  { id: 'kitchen', label: 'Preparing', icon: '🍲', desc: 'Kitchen is cooking your meal' },
  { id: 'ready', label: 'Order Ready', icon: '🛎️', desc: 'On its way to your room / table' },
  { id: 'served', label: 'Served', icon: '✅', desc: 'Delivered — Enjoy your meal!' }
];

export default function OrderTrackerModal({ order, onClose }) {
  const [currentStatusIndex, setCurrentStatusIndex] = useState(1); // Default to 'confirmed' for demo
  const [pulse, setPulse] = useState(false);

  // Auto-advance simulation demo (optional toggle)
  function advanceStatus() {
    if (currentStatusIndex < STATUS_STEPS.length - 1) {
      setCurrentStatusIndex(prev => prev + 1);
      setPulse(true);
      setTimeout(() => setPulse(false), 800);
    }
  }

  const shortId = (order?.id || 'PAN-84920').slice(0, 10).toUpperCase();
  const items = order?.items || [];
  const total = order?.total || 0;
  const room = order?.room_number || '302';
  const serviceType = (order?.service_type || 'dine_in').replace('_', ' ').toUpperCase();

  const currentStep = STATUS_STEPS[currentStatusIndex];

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

      <div className="backdrop show" onClick={onClose} style={{ zIndex: 70 }} />
      <div className="sheet show" style={{ zIndex: 71, maxHeight: '90vh' }}>
        <div className="sheet-handle" />
        
        <div className="sheet-head">
          <div>
            <div className="sheet-title">Order Status Tracker</div>
            <div style={{ fontSize: 12, color: 'var(--sage)', fontWeight: 600, marginTop: 2 }}>
              #{shortId} · Room {room} ({serviceType})
            </div>
          </div>
          <button className="sheet-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="sheet-body" style={{ padding: '20px' }}>
          
          {/* Current Status Highlight Banner */}
          <div className={`receipt ${pulse ? 'tracker-pulse' : ''}`} style={{
            background: 'linear-gradient(135deg, var(--forest-deep), var(--forest))',
            color: '#F3EEDB',
            textAlign: 'center',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{currentStep.icon}</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: 'var(--brass-light)' }}>
              {currentStep.label}
            </div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
              {currentStep.desc}
            </div>
          </div>

          {/* Stepper Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: '20px 10px', position: 'relative' }}>
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStatusIndex;
              const isActive = idx === currentStatusIndex;

              return (
                <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
                  <div className={`tracker-step-circle ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                    {isCompleted ? '✓' : step.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: isActive ? 800 : 600, color: isActive ? 'var(--forest-deep)' : 'var(--ink)' }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--sage)', fontWeight: 500 }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Itemized Receipt Breakdown */}
          <div className="receipt" style={{ marginTop: 24 }}>
            <div className="receipt-oid">Receipt Summary</div>
            <div className="receipt-div" />
            {items.map((it, i) => (
              <div className="receipt-line" key={i}>
                <span>{it.name} × {it.qty}</span>
                <span>₹{((it.price || 0) * (it.qty || 0)).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="receipt-div" />
            <div className="receipt-total">
              <span>Total Amount</span>
              <span className="amt">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

        </div>

        {/* Footer with Demo Advancement Button */}
        <div className="sheet-footer" style={{ gap: 10 }}>
          {currentStatusIndex < STATUS_STEPS.length - 1 && (
            <button
              type="button"
              className="btn-main"
              onClick={advanceStatus}
              style={{ background: 'var(--brass)', color: '#FFFFFF', marginBottom: 6 }}
            >
              ⚡ Simulate Kitchen Advance (Demo)
            </button>
          )}
          <button type="button" className="btn-main" onClick={onClose}>
            Back to Menu
          </button>
        </div>

      </div>
    </>
  );
}
