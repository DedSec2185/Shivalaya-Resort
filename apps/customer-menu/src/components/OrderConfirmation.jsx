import { useEffect, useState } from 'react';

export default function OrderConfirmation({ order, onTrackOrder, onNewOrder }) {
  const [particles, setParticles] = useState([]);
  const [dustParticles, setDustParticles] = useState([]);

  useEffect(() => {
    // Falling confetti
    const newParticles = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      size: 4 + Math.random() * 6,
      left: Math.random() * 100,
      duration: 1.5 + Math.random() * 1.4,
      delay: Math.random() * 0.6,
    }));
    setParticles(newParticles);

    // Stamp dust burst particles (12 radial particles)
    const dust = Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * 360;
      const dist = 55 + Math.random() * 40;
      const dx = Math.cos((angle * Math.PI) / 180) * dist;
      const dy = Math.sin((angle * Math.PI) / 180) * dist;
      return {
        id: i,
        size: 4 + Math.random() * 5,
        dx: `${dx}px`,
        dy: `${dy}px`,
      };
    });
    setDustParticles(dust);
  }, []);

  if (!order) return null;

  const shortId = (order.id || 'DEMO-12345').slice(0, 10).toUpperCase();
  const orderItems = order.items || [];
  const itemCount = orderItems.reduce((sum, item) => sum + (item.qty || 0), 0);

  return (
    <div className="success-overlay show" style={{ position: 'absolute', zIndex: 60 }}>

      {/* Falling confetti */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Gold stamp with dust burst */}
      <div style={{ position: 'relative' }}>
        <div className="stamp">
          <svg viewBox="0 0 24 24" fill="none" stroke="#2C1D07" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Radial dust particles around stamp */}
        {dustParticles.map((d) => (
          <div
            key={d.id}
            className="dust-particle"
            style={{
              width: `${d.size}px`,
              height: `${d.size}px`,
              top: '50%',
              left: '50%',
              marginTop: `-${d.size / 2}px`,
              marginLeft: `-${d.size / 2}px`,
              '--dx': d.dx,
              '--dy': d.dy,
              background: `hsl(${42 + Math.random() * 16}deg, 72%, ${60 + Math.random() * 15}%)`,
            }}
          />
        ))}
      </div>

      <div className="success-title">Order Confirmed!</div>
      <div className="success-sub">Sit back — the kitchen has your ticket.</div>

      {/* Receipt prints in like thermal paper */}
      <div className="receipt">
        <div className="receipt-oid">#{shortId}</div>
        <div className="receipt-div" />
        {orderItems.slice(0, 4).map((item, i) => (
          <div className="receipt-line" key={`${item.id}-${i}`}>
            <span>{item.name} × {item.qty}</span>
            <span>₹{((item.price || 0) * (item.qty || 0)).toLocaleString('en-IN')}</span>
          </div>
        ))}
        {orderItems.length > 4 && (
          <div className="receipt-line">
            <span style={{ fontStyle: 'italic' }}>+ {orderItems.length - 4} more item(s)</span>
            <span />
          </div>
        )}
        <div className="receipt-div" />
        <div className="receipt-total">
          <span>Total ({itemCount} items)</span>
          <span className="amt">₹{(order.total || 0).toLocaleString('en-IN')}</span>
        </div>
        {order.room_number && (
          <div className="receipt-line" style={{ marginTop: '6px', fontSize: '10.5px', opacity: 0.6 }}>
            <span>Room {order.room_number}</span>
            <span>{order.service_type?.replace('_', ' ')}</span>
          </div>
        )}
      </div>

      <div className="success-actions">
        <button
          type="button"
          className="btn-outline"
          onClick={onTrackOrder}
        >
          Track Order Live ➔
        </button>
        <button type="button" className="btn-solid" onClick={onNewOrder}>
          Order More
        </button>
      </div>
    </div>
  );
}
