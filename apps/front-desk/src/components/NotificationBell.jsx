import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function NotificationBell({ count, newOrders = [], onSelectOrder }) {
  const { t, translateName } = useLanguage();
  const prevCount = useRef(count);
  const btnRef    = useRef(null);
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (count > prevCount.current && btnRef.current) {
      btnRef.current.classList.remove('ringing');
      void btnRef.current.offsetWidth;
      btnRef.current.classList.add('ringing');
    }
    prevCount.current = count;
  }, [count]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const recentOrders = newOrders.slice(0, 3);

  return (
    <div className="notif-wrapper" style={{ position: 'relative' }}>
      <button
        type="button"
        className="notif-bell"
        ref={btnRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`${count} new order${count !== 1 ? 's' : ''}`}
        title={t('notifications')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {count > 0 && (
          <span key={count} className="notif-bell-badge">{count}</span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown" ref={dropdownRef}>
          <div className="notif-dropdown-header">
            <h4>{t('notifications')}</h4>
            <span>{count} {t('statNew')}</span>
          </div>
          <div className="notif-dropdown-list">
            {recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <div 
                  key={order.id} 
                  className="notif-dropdown-item"
                  onClick={() => {
                    setIsOpen(false);
                    if (onSelectOrder) onSelectOrder(order);
                  }}
                >
                  <div className="notif-item-header">
                    <strong>{translateName(order.guest_name)}</strong>
                    <span className="notif-time">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="notif-item-detail">
                    {order.service_type === 'dine_in' ? order.table_number : `${t('room')} ${order.room_number}`}
                    <span> • ₹{order.total}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="notif-empty">{t('noNewNotifications')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
