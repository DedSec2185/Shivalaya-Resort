import { useState } from 'react';
import OrderCard from './OrderCard';
import StatusBadge from './StatusBadge';
import { useLanguage } from '../context/LanguageContext';

const KANBAN_COLS = [
  { status: 'new',       key: 'newOrders',  colorClass: 'col-new'      },
  { status: 'confirmed', key: 'confirmed',  colorClass: 'col-confirmed'},
  { status: 'preparing', key: 'inKitchen',  colorClass: 'col-preparing'},
  { status: 'ready',     key: 'ready',      colorClass: 'col-ready'    },
  { status: 'cancelled', key: 'cancelled',  colorClass: 'col-cancelled'},
];

function KanbanColumn({ col, orders, onUpdateStatus, onSelect }) {
  const { t } = useLanguage();
  const colOrders = orders.filter(o => o.status === col.status);
  const hasItems  = colOrders.length > 0;

  return (
    <div className="kanban-col" id={`col-${col.status}`}>
      <div className={`kanban-col-head ${col.colorClass}`}>
        <span className="kanban-col-title">{t(col.key)}</span>
        <span className={`kanban-col-count ${col.colorClass}${hasItems ? ' has-items' : ''}`}>
          {colOrders.length}
        </span>
      </div>
      <div className="kanban-cards">
        {colOrders.length === 0 ? (
          <div className="kanban-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>{t('noActiveOrders')}</p>
          </div>
        ) : (
          colOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={onUpdateStatus}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ── Completed / Cancelled table view ─────────────────────────────── */
function ListView({ orders, title, emptyMessage, onSelect }) {
  const { t, translateFood, translateName } = useLanguage();
  const formatTime = d => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const formatDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div className="completed-view">
      <div className="completed-view-head">
        <h2 className="completed-view-title">{title}</h2>
        <span className="completed-count-chip">{orders.length} {t('itemsCount')}</span>
      </div>

      {orders.length === 0 ? (
        <div className="kanban-empty" style={{ marginTop: 60 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{width:48,height:48,color:'rgba(255,255,255,0.15)'}}>
            <circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" />
          </svg>
          <p style={{color:'rgba(255,255,255,0.25)',fontSize:14}}>{emptyMessage}</p>
        </div>
      ) : (
        <div className="completed-table-wrap">
          <table className="completed-table">
            <thead>
              <tr>
                <th>{t('orderId')}</th>
                <th>{t('guest')}</th>
                <th>{t('room')}</th>
                <th>{t('service')}</th>
                <th>{t('orderItems')}</th>
                <th>{t('totalAmount')}</th>
                <th>{t('status')}</th>
                <th>{t('time')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} onClick={() => onSelect(order)}>
                  <td className="td-id">#{order.id.slice(0,8).toUpperCase()}</td>
                  <td className="td-guest">{translateName(order.guest_name)}</td>
                  <td>{order.room_number || '—'}</td>
                  <td>{order.service_type === 'room_service' ? t('roomService') : order.service_type === 'dine_in' ? t('dineIn') : t('takeaway')}</td>
                  <td>{(order.items || []).map(i => translateFood(i.name)).join(', ')}</td>
                  <td className="td-total">₹{(order.total||0).toLocaleString('en-IN')}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td className="td-time">{formatDate(order.created_at)} · {formatTime(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const TAB_CONFIG = [
  { id: 'all',       key: 'allActive',    colorClass: 'tab-all',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
  { id: 'new',       key: 'newOrders',    colorClass: 'tab-new',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg> },
  { id: 'confirmed', key: 'confirmed',    colorClass: 'tab-confirmed', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg> },
  { id: 'preparing', key: 'inKitchen',    colorClass: 'tab-preparing', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
  { id: 'ready',     key: 'ready',        colorClass: 'tab-ready',     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> },
  { id: 'cancelled', key: 'cancelled',    colorClass: 'tab-cancelled', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg> },
];

/* ── Main export ──────────────────────────────────────── */
export default function OrderQueue({
  activeOrders,
  completedOrders,
  cancelledOrders,
  view,               // 'kanban' | 'completed' | 'cancelled'
  onUpdateStatus,
  onSelect,
}) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('all');

  if (view === 'completed') {
    return <ListView orders={completedOrders} title={t('completed')} emptyMessage={t('noCompletedOrders')} onSelect={onSelect} />;
  }
  if (view === 'cancelled') {
    return <ListView orders={cancelledOrders} title={t('cancelled')} emptyMessage={t('noCancelledOrders')} onSelect={onSelect} />;
  }

  const filteredCols = activeTab === 'all' 
    ? KANBAN_COLS 
    : KANBAN_COLS.filter(c => c.status === activeTab);

  return (
    <div className="kanban-wrapper">
      {/* Premium Section Filter Bar */}
      <div className="section-filter-bar">
        {TAB_CONFIG.map(tab => {
          const count = tab.id === 'all' 
            ? activeOrders.length 
            : activeOrders.filter(o => o.status === tab.id).length;

          return (
            <button
              key={tab.id}
              type="button"
              className={`filter-btn ${tab.colorClass} ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="filter-btn-icon">{tab.icon}</span>
              <span className="filter-btn-label">{t(tab.key)}</span>
              <span className="filter-btn-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="kanban-board">
        {filteredCols.map(col => (
          <KanbanColumn
            key={col.status}
            col={col}
            orders={activeOrders}
            onUpdateStatus={onUpdateStatus}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
