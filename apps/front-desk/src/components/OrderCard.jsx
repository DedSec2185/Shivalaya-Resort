import { useState } from 'react';
import PrintTicket from './PrintTicket';
import StatusBadge from './StatusBadge';
import { useLanguage } from '../context/LanguageContext';

const SERVICE_ICONS = {
  room_service: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  ),
  dine_in: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 20h20M12 4v12M8 8a4 4 0 008 0" />
    </svg>
  ),
  takeaway: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" />
    </svg>
  ),
};

const STATUS_FLOW = {
  new:       { next: 'confirmed', labelKey: 'confirmOrder',   actionClass: 'confirm'  },
  confirmed: { next: 'preparing', labelKey: 'sendToKitchen', actionClass: 'kitchen' },
  preparing: { next: 'ready',     labelKey: 'markReady', actionClass: 'ready'   },
  ready:     { next: 'served',    labelKey: 'markServed',   actionClass: 'serve'   },
};

function elapsedLabel(createdAt, t) {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (mins < 1)  return t ? t('justNow') : 'Just now';
  if (mins < 60) return `${mins}${t ? t('minsAgo') : 'm ago'}`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export function parseTableAndNote(note, table_number) {
  if (table_number) {
    const formatted = String(table_number).match(/^table/i) ? table_number : `Table ${table_number}`;
    const cleanNote = note ? note.replace(/^\[(Table\s*\d+|Table\s*.*?|T-\d+)\]\s*/i, '') : '';
    return { tableNumber: formatted, cleanNote };
  }
  if (!note) return { tableNumber: null, cleanNote: '' };
  const match = note.match(/^\[(Table\s*\d+|Table\s*.*?|T-\d+)\]\s*(.*)/i);
  if (match) {
    return { tableNumber: match[1], cleanNote: match[2] };
  }
  return { tableNumber: null, cleanNote: note };
}

function isOverdue(createdAt, status) {
  const mins = (Date.now() - new Date(createdAt).getTime()) / 60000;
  if (status === 'new')       return mins > 5;
  if (status === 'confirmed') return mins > 15;
  if (status === 'preparing') return mins > 30;
  return false;
}

export default function OrderCard({ order, onUpdateStatus, onSelect, staffName }) {
  const { t, translateFood, translateName } = useLanguage();
  const [updating, setUpdating] = useState(false);
  const [printVariant, setPrintVariant] = useState(null);

  const shortId  = order.id.slice(0, 8).toUpperCase();
  const flow     = STATUS_FLOW[order.status];
  const overdue  = isOverdue(order.created_at, order.status);
  const elapsed  = elapsedLabel(order.created_at, t);
  const { tableNumber } = parseTableAndNote(order.note, order.table_number);
  const items    = order.items || [];
  const preview  = items.slice(0, 3);
  const overflow = items.length - preview.length;

  const serviceLabel = order.service_type === 'room_service' ? t('roomService') : order.service_type === 'dine_in' ? t('dineIn') : t('takeaway');

  async function handleAdvance(e) {
    e.stopPropagation(); // don't open detail panel
    if (!flow) return;
    setUpdating(true);
    await onUpdateStatus(order.id, flow.next);
    setUpdating(false);
  }

  return (
    <>
      <article
        className={`order-card status-${order.status}${order.status === 'new' ? ' order-card--new' : ''}`}
        onClick={() => onSelect(order)}
        title="Click for full details"
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onSelect(order)}
      >
        {/* Header row */}
        <div className="order-card__head">
          <div>
            <div className="order-card__id">#{shortId}</div>
            <div className="order-card__guest">{translateName(order.guest_name)}</div>
            <div className="order-card__meta">
              {SERVICE_ICONS[order.service_type] || null}
              {serviceLabel}
              {order.service_type === 'dine_in' && (
                <span style={{ color: 'var(--brass-light)', fontWeight: 'bold', marginLeft: 4 }}>
                  · {tableNumber || 'Table 4'}
                </span>
              )}
              {order.service_type === 'room_service' && order.room_number && (
                <span style={{ color: 'var(--brass-light)', fontWeight: 'bold', marginLeft: 4 }}>
                  · {t('room')} {order.room_number}
                </span>
              )}
              {order.service_type !== 'room_service' && order.room_number && (
                <span style={{ opacity: 0.65, marginLeft: 4, fontSize: '0.85em' }}>
                  ({t('room')} {order.room_number})
                </span>
              )}
            </div>
          </div>
          <div className={`order-card__time${overdue ? ' overdue' : ''}`}>
            {elapsed}
          </div>
        </div>

        {/* Item preview */}
        <div className="order-card__items">
          {preview.map((item, i) => (
            <div className="order-card__item-row" key={i}>
              <span className="order-card__item-name">{item.qty}× {translateFood(item.name)}</span>
              <span className="order-card__item-price">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
            </div>
          ))}
          {overflow > 0 && (
            <div className="order-card__more">+ {overflow} more {t('itemsCount')}</div>
          )}
        </div>

        {/* Footer */}
        <div className="order-card__foot">
          <div className="order-card__total">₹{(order.total || 0).toLocaleString('en-IN')}</div>
          {flow && (
            <button
              type="button"
              className={`btn-card-action ${flow.actionClass}`}
              onClick={handleAdvance}
              disabled={updating}
            >
              {t(flow.labelKey)}
            </button>
          )}
        </div>
      </article>

      {printVariant && <PrintTicket order={order} variant={printVariant} />}
    </>
  );
}
