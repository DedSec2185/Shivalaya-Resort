import { useEffect, useRef, useState } from 'react';
import RevenueChart from './RevenueChart';
import ServiceRings from './ServiceRings';
import { PERIOD_DATA } from '../utils/demoData';

// --- helpers ---
function countUp(setter, target, duration = 900) {
  const start    = performance.now();
  const step = (now) => {
    const p     = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    setter(Math.round(target * eased));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function ClockDisplay() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  return (
    <div className="header-clock">
      {time}
      <span className="clock-date">{date}</span>
    </div>
  );
}

function KpiCard({ icon, label, value, prefix, suffix, delta }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => { countUp(setDisplay, value); }, [value]);

  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <div className="kpi-icon">{icon}</div>
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">
        {prefix && <span className="cur">{prefix}</span>}
        {display.toLocaleString('en-IN')}
        {suffix && <span className="unit">{suffix}</span>}
      </div>
      {delta && (
        <div className={`kpi-delta ${delta.dir}`}>
          {delta.dir === 'up' ? '↑' : '↓'} {delta.val}
        </div>
      )}
    </div>
  );
}

function BestSellers({ items }) {
  const max = Math.max(...items.map(i => i.c));
  return (
    <div>
      {items.map((item, idx) => (
        <div className="bar-row" key={idx}>
          <div className="bar-label">
            <span>{item.n}</span>
            <span className="bar-count">{item.c}</span>
          </div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${(item.c / max * 100).toFixed(0)}%`, transitionDelay: `${idx * 90}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const TYPE_CLASS  = { room: 'type-room', dinein: 'type-dinein', pickup: 'type-pickup' };
const STATUS_TEXT = { served: 'Served', ready: 'Ready', preparing: 'Preparing', new: 'New', cancelled: 'Cancelled' };

function LedgerTable({ orders }) {
  if (!orders?.length) {
    return (
      <div className="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 3h9l3 4v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"/>
          <path d="M9 9h6M9 13h6M9 17h3"/>
        </svg>
        <h3>No orders yet</h3>
        <p>Orders will appear here once they start coming in.</p>
      </div>
    );
  }

  return (
    <table className="ledger-table">
      <thead>
        <tr>
          <th>Order</th><th>Guest</th><th>Type</th>
          <th>Items</th><th>Amount</th><th>Status</th><th>Time</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o, idx) => (
          <tr key={o.id} style={{ animationDelay: `${idx * 0.06}s` }}>
            <td><span className="order-id">#{o.id}</span></td>
            <td>{o.name}</td>
            <td><span className={`type-pill ${TYPE_CLASS[o.type] ?? ''}`}>{o.typeLabel}</span></td>
            <td>{o.items}</td>
            <td><span className="order-amt">₹{o.amount.toLocaleString('en-IN')}</span></td>
            <td>
              <span className="status-stamp">
                <span className={`status-dot ${o.status}`} />
                {STATUS_TEXT[o.status] ?? o.status}
              </span>
            </td>
            <td>{o.time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function LedgerView({ showToast }) {
  const [period, setPeriod] = useState('today');
  const [spinning, setSpinning] = useState(false);
  const data = PERIOD_DATA[period];

  function handleRefresh() {
    setSpinning(true);
    setTimeout(() => { setSpinning(false); showToast('Ledger refreshed'); }, 700);
  }

  function handleExport() {
    const headers = ['Order,Guest,Type,Items,Amount,Status,Time'];
    const rows = data.orders_list.map(o =>
      `${o.id},"${o.name}","${o.typeLabel}",${o.items},${o.amount},${o.status},"${o.time}"`
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url; a.download = `panache-ledger-${period}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast('Ledger exported as CSV');
  }

  return (
    <div>
      {/* Page header */}
      <header className="page-header">
        <div className="page-header-top">
          <div>
            <div className="page-wordmark">Panache<span className="accent">.</span></div>
            <div className="page-subtitle">Owner's Ledger · Shivalaya Resorts, Bhimtal</div>
          </div>
          <div className="header-right">
            <ClockDisplay />
            <div className="header-seal" title="Live sync">
              <svg viewBox="0 0 24 24" fill="none" stroke="#2C1D07" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/>
              </svg>
            </div>
          </div>
        </div>

        <nav className="period-tabs">
          {[
            { key: 'today', label: 'Today' },
            { key: 'week',  label: 'This Week' },
            { key: 'month', label: 'This Month' },
          ].map(p => (
            <button
              key={p.key}
              type="button"
              className={`period-tab ${period === p.key ? 'active' : ''}`}
              onClick={() => setPeriod(p.key)}
            >{p.label}</button>
          ))}
        </nav>
      </header>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <KpiCard
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="8"/><path d="M12 8v8M9.5 10a2.5 2.5 0 015 0c0 3-5 2-5 5a2.5 2.5 0 005 0"/></svg>}
          label="Revenue" prefix="₹" value={data.revenue} delta={data.deltas.revenue}
        />
        <KpiCard
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 3h9l3 4v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"/><path d="M9 9h6M9 13h6M9 17h3"/></svg>}
          label="Orders Served" value={data.orders} delta={data.deltas.orders}
        />
        <KpiCard
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 15c2-6 5-9 8-9s6 3 8 9M4 15a2 2 0 002 2h12a2 2 0 002-2"/></svg>}
          label="Avg. Order Value" prefix="₹" value={data.avg} delta={data.deltas.avg}
        />
        <KpiCard
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 2h12M6 22h12M8 2c0 5 8 5 8 10s-8 5-8 10M16 2c0 5-8 5-8 10s8 5 8 10"/></svg>}
          label="Avg. Prep Time" value={data.prep} suffix=" min" delta={data.deltas.prep}
        />
      </div>

      {/* Charts shelf */}
      <div className="shelf">
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Revenue Ledger</div>
            <div className="panel-sub">{data.subLabel}</div>
          </div>
          <RevenueChart trend={data.trend} key={period} />
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Best Sellers</div>
            <div className="panel-sub">By orders</div>
          </div>
          <BestSellers items={data.items} key={period} />
        </div>
      </div>

      {/* Service rings */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-head">
          <div className="panel-title">Orders by Service Type</div>
          <div className="panel-sub">{data.subLabel.split('·')[1]?.trim() ?? ''}</div>
        </div>
        <ServiceRings service={data.service} key={period} />
      </div>

      {/* Order history */}
      <div className="ledger-table-wrap">
        <div className="panel-head">
          <div className="panel-title">Recent Entries</div>
          <div className="panel-sub">Order history</div>
        </div>
        <LedgerTable orders={data.orders_list} />
      </div>

      {/* Actions */}
      <div className="ledger-actions">
        <button type="button" className="btn-ledger primary" onClick={handleExport}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v3a1 1 0 001 1h14a1 1 0 001-1v-3"/>
          </svg>
          Export Ledger (CSV)
        </button>
        <button type="button" className="btn-ledger ghost" onClick={() => showToast('Summary emailed to owner')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18v12H3z"/><path d="M3 7l9 6 9-6"/>
          </svg>
          Email Summary
        </button>
        <button type="button" className={`btn-ledger ghost ${spinning ? 'spinning' : ''}`} onClick={handleRefresh}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4v6h6M20 20v-6h-6"/><path d="M4.5 15a8 8 0 0013.9 3.4M19.5 9A8 8 0 005.6 5.6"/>
          </svg>
          Refresh
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 12, fontSize: 11, color: 'var(--sage)', fontFamily: 'IBM Plex Mono', letterSpacing: '0.3px' }}>
        PANACHE · Shivalaya Resorts, Bhimtal — Owner's Dashboard v1
      </div>
    </div>
  );
}
