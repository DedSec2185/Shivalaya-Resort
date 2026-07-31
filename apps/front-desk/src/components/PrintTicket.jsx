import { parseTableAndNote } from './OrderCard';
import { useLanguage } from '../context/LanguageContext';

export default function PrintTicket({ order, variant = 'bill' }) {
  const { t, translateFood, translateName } = useLanguage();
  if (!order) return null;

  const shortId = order.id.slice(0, 8).toUpperCase();
  const isKitchen = variant === 'kitchen';
  const time = new Date(order.created_at).toLocaleString('en-IN', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
  const { tableNumber, cleanNote } = parseTableAndNote(order.note, order.table_number);
  
  const serviceLabel = order.service_type === 'room_service' ? t('roomService') : order.service_type === 'dine_in' ? t('dineIn') : t('takeaway');

  return (
    <div className={`print-ticket print-ticket--${variant}`} id={`print-${order.id}-${variant}`}>
      <div className="print-ticket__header">
        <div className="print-ticket__title">SHIVALAYA RESORT</div>
        <div className="print-ticket__subtitle">PANACHE RESTAURANT</div>
        <div className="print-ticket__badge">{isKitchen ? `*** ${t('kitchenTicket').toUpperCase()} ***` : `*** ${t('guestBill').toUpperCase()} ***`}</div>
        <div className="print-ticket__order-id">{t('orderId')} #{shortId}</div>
        <div className="print-ticket__date">{time}</div>
      </div>

      <div className="print-ticket__divider" />

      <div className="print-ticket__meta">
        <div><strong>{t('guest')}:</strong> {translateName(order.guest_name) || t('guest')} {order.guest_phone ? `(${order.guest_phone})` : ''}</div>
        <div><strong>{t('service')}:</strong> {serviceLabel}</div>
        {tableNumber && <div><strong>Location:</strong> {tableNumber}</div>}
        {order.room_number && <div><strong>{t('room')}:</strong> {t('room')} {order.room_number}</div>}
        {cleanNote && <div className="print-ticket__note"><strong>{t('specialNote')}:</strong> {cleanNote}</div>}
      </div>

      <div className="print-ticket__divider" />

      <div className="print-ticket__items-head">
        <span>{t('orderItems').toUpperCase()}</span>
        {!isKitchen && <span>{t('totalAmount').toUpperCase()}</span>}
      </div>

      {order.items?.map((item, i) => (
        <div key={i} className="print-ticket__item">
          <span>{item.qty} × {translateFood(item.name)}</span>
          {!isKitchen && <span className="print-ticket__item-price">₹{((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}</span>}
        </div>
      ))}

      {!isKitchen && (
        <>
          <div className="print-ticket__divider" />
          <div className="print-ticket__total">
            <span>{t('totalAmount').toUpperCase()}</span>
            <span>₹{(order.total || 0).toLocaleString('en-IN')}</span>
          </div>
        </>
      )}

      <div className="print-ticket__footer">
        <div>Thank you!</div>
      </div>
    </div>
  );
}

