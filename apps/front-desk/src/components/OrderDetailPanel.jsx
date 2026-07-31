import { useState, useEffect } from 'react';
import PrintTicket from './PrintTicket';
import StatusBadge from './StatusBadge';
import { parseTableAndNote } from './OrderCard';
import { useLanguage } from '../context/LanguageContext';

const STATUS_FLOW = {
  new:       { next: 'confirmed', labelKey: 'confirmOrder',   actionClass: 'confirm'  },
  confirmed: { next: 'preparing', labelKey: 'sendToKitchen', actionClass: 'kitchen'  },
  preparing: { next: 'ready',     labelKey: 'markReady',      actionClass: 'ready'    },
  ready:     { next: 'served',    labelKey: 'markServed',  actionClass: 'serve'    },
};

export default function OrderDetailPanel({ order, onClose, onUpdateStatus, staffName }) {
  const { t, translateFood, translateName } = useLanguage();
  const [updating, setUpdating]     = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [printVariant, setPrintVariant] = useState(null);

  const shortId  = order.id.slice(0, 8).toUpperCase();
  const flow     = STATUS_FLOW[order.status];
  const items    = order.items || [];
  const time     = new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const date     = new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const isDone   = ['served', 'cancelled'].includes(order.status);
  const { tableNumber, cleanNote } = parseTableAndNote(order.note, order.table_number);

  const SERVICE_ICONS = {
    room_service: '🛎',
    dine_in: '🍽',
    takeaway: '📦',
  };

  const serviceLabel = order.service_type === 'room_service' ? t('roomService') : order.service_type === 'dine_in' ? t('dineIn') : t('takeaway');

  useEffect(() => {
    if (printVariant) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      const handleAfterPrint = () => {
        setPrintVariant(null);
      };
      window.addEventListener('afterprint', handleAfterPrint);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('afterprint', handleAfterPrint);
      };
    }
  }, [printVariant]);

  async function handleAdvance() {
    if (!flow) return;
    setUpdating(true);
    await onUpdateStatus(order.id, flow.next);
    setUpdating(false);
    if (flow.next === 'served') onClose();
  }

  async function handleCancel() {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    await onUpdateStatus(order.id, 'cancelled');
    setCancelling(false);
    onClose();
  }

  function handlePrint(variant) {
    setPrintVariant(variant);
  }

  return (
    <>
      {/* Dark backdrop */}
      <div className="detail-backdrop" onClick={onClose} />

      {/* Slide-in panel */}
      <aside className="detail-panel" aria-label="Order detail">

        {/* Dark header */}
        <div className="detail-header">
          <div className="detail-header-top">
            <div>
              <div className="detail-order-id">#{shortId} · {date} at {time}</div>
              <div className="detail-guest-name">{translateName(order.guest_name)}</div>
              <div className="detail-meta">
                 <span className="detail-meta-chip">
                  {SERVICE_ICONS[order.service_type] || '•'}
                  {' '}{serviceLabel}
                </span>
                {order.service_type === 'dine_in' && (
                  <span className="detail-meta-chip" style={{ background: 'rgba(217,189,117,0.18)', border: '1px solid var(--brass-light)', color: 'var(--brass-light)', fontWeight: 'bold' }}>
                    🍽️ {tableNumber || 'Table 4'}
                  </span>
                )}
                {order.service_type === 'room_service' && order.room_number && (
                  <span 
                    className="detail-meta-chip" 
                    style={{ background: 'rgba(217,189,117,0.18)', border: '1px solid var(--brass-light)', color: 'var(--brass-light)', fontWeight: 'bold' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 2 }}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>
                    {t('room')} {order.room_number}
                  </span>
                )}
                {order.service_type !== 'room_service' && order.room_number && (
                  <span className="detail-meta-chip" style={{ opacity: 0.75 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 2, width: 12, height: 12 }}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>
                    {t('room')} {order.room_number} ({t('billing')})
                  </span>
                )}
                {order.guest_phone && (
                  <span className="detail-meta-chip">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.07 12 19.79 19.79 0 011 3.18 2 2 0 013 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                    {order.guest_phone}
                  </span>
                )}
                <StatusBadge status={order.status} />
              </div>
            </div>
            <button type="button" className="btn-detail-close" onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="detail-body">

          {/* Items */}
          <div className="detail-section-title">{t('orderItems')}</div>
          {items.map((item, i) => (
            <div className="detail-item-row" key={i}>
              <div>
                <div className="detail-item-name">{translateFood(item.name)}</div>
                <div className="detail-item-qty">Qty: {item.qty}</div>
              </div>
              <div className="detail-item-price">₹{((item.price || 0) * (item.qty || 0)).toLocaleString('en-IN')}</div>
            </div>
          ))}

          {/* Total */}
          <div className="detail-divider" />
          <div className="detail-total-row">
            <span className="detail-total-label">{t('totalAmount')}</span>
            <span className="detail-total-value">₹{(order.total || 0).toLocaleString('en-IN')}</span>
          </div>

          {/* Note */}
          {cleanNote && (
            <div className="detail-note">
              <strong>{t('specialNote')}:</strong> {cleanNote}
            </div>
          )}

        </div>

        {/* Action footer */}
        {!isDone && (
          <div className="detail-footer">
            {/* Primary advance button */}
            {flow && (
              <button
                type="button"
                className="btn-detail primary"
                onClick={handleAdvance}
                disabled={updating}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{width:16,height:16}}>
                  <path d="M9 18l6-6-6-6" />
                </svg>
                {updating ? 'Updating…' : t(flow.labelKey)}
              </button>
            )}

            {/* Print + Cancel row */}
            <div className="detail-actions-row">
              <button type="button" className="btn-detail outline-print" onClick={() => handlePrint('kitchen')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}>
                  <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                </svg>
                {t('kitchenTicket')}
              </button>
              <button type="button" className="btn-detail outline-print" onClick={() => handlePrint('bill')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}>
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                {t('guestBill')}
              </button>
            </div>

            {/* Cancel */}
            <button
              type="button"
              className="btn-detail danger"
              onClick={handleCancel}
              disabled={cancelling}
              style={{ width: '100%' }}
            >
              {cancelling ? 'Cancelling…' : `✕ ${t('cancelOrder')}`}
            </button>
          </div>
        )}

        {/* Completed state footer */}
        {isDone && (
          <div className="detail-footer">
            <div className="detail-actions-row">
              <button type="button" className="btn-detail outline-print" onClick={() => handlePrint('bill')}>
                Print Guest Bill
              </button>
              <button type="button" className="btn-detail outline-print" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </aside>

      {printVariant && <PrintTicket order={order} variant={printVariant} />}
    </>
  );
}
