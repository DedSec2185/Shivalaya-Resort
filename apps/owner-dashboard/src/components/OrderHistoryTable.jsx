import { SERVICE_LABELS, STATUS_LABELS } from '@panache/shared-types';

export default function OrderHistoryTable({ orders, statusFilter, serviceFilter, search, onStatusChange, onServiceChange, onSearchChange }) {
  return (
    <div className="table-section">
      <div className="table-section__header">
        <h3 className="table-section__title">Order History</h3>
        <div className="table-filters">
          <input
            type="search"
            className="filter-input"
            placeholder="Search name, phone, room…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <select className="filter-select" value={statusFilter} onChange={(e) => onStatusChange(e.target.value)}>
            <option value="all">All Status</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select className="filter-select" value={serviceFilter} onChange={(e) => onServiceChange(e.target.value)}>
            <option value="all">All Service</option>
            {Object.entries(SERVICE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="table-empty">No orders match your filters</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="order-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Guest</th>
                <th>Service</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const dt = new Date(o.created_at);
                const itemSummary = (o.items || [])
                  .slice(0, 2)
                  .map((i) => `${i.qty}× ${i.name}`)
                  .join(', ');
                const more = (o.items?.length || 0) > 2 ? ` +${o.items.length - 2}` : '';

                return (
                  <tr key={o.id}>
                    <td>#{o.id.slice(0, 8).toUpperCase()}</td>
                    <td>{dt.toLocaleDateString('en-IN')} {dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      {o.guest_name}
                      <br />
                      <small style={{ color: 'var(--muted)' }}>{o.guest_phone}</small>
                      {o.room_number && <><br /><small>Room {o.room_number}</small></>}
                    </td>
                    <td>{SERVICE_LABELS[o.service_type]}</td>
                    <td title={(o.items || []).map((i) => `${i.qty}× ${i.name}`).join(', ')}>
                      {itemSummary}{more}
                    </td>
                    <td><strong>₹{o.total}</strong></td>
                    <td>{STATUS_LABELS[o.status] || o.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
