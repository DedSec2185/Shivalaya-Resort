export default function StatsGrid({ revenue, orderCount, aov, servedCount, byService }) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-card__label">Revenue (Served)</div>
        <div className="stat-card__value stat-card__value--gold">₹{revenue.toLocaleString('en-IN')}</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__label">Total Orders</div>
        <div className="stat-card__value">{orderCount}</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__label">Avg Order Value</div>
        <div className="stat-card__value">₹{aov}</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__label">Served</div>
        <div className="stat-card__value">{servedCount}</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__label">Room Service</div>
        <div className="stat-card__value">{byService.room_service}</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__label">Dine In</div>
        <div className="stat-card__value">{byService.dine_in}</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__label">Pick Up</div>
        <div className="stat-card__value">{byService.pickup}</div>
      </div>
    </div>
  );
}
