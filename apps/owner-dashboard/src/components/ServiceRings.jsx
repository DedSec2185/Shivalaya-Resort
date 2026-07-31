import { useEffect, useRef } from 'react';

export default function ServiceRings({ service }) {
  const ringsRef = useRef([]);

  const total  = (service.room + service.dinein + service.pickup) || 1;
  const R      = 32;
  const C      = 2 * Math.PI * R;

  const config = [
    { key: 'room',   cls: '',       name: 'Room Service', val: service.room   },
    { key: 'dinein', cls: 'dinein', name: 'Dine-In',     val: service.dinein },
    { key: 'pickup', cls: 'pickup', name: 'Pickup',       val: service.pickup },
  ];

  useEffect(() => {
    // Reset to full offset first then animate to target
    ringsRef.current.forEach((el, i) => {
      if (!el) return;
      const pct    = config[i].val / total;
      const target = C - pct * C;
      el.style.transition        = 'none';
      el.style.strokeDashoffset  = C;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition       = 'stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)';
          el.style.strokeDashoffset = target;
        });
      });
    });
  }, [service]);

  return (
    <div className="rings-row">
      {config.map((c, i) => {
        const pct = Math.round((c.val / total) * 100);
        return (
          <div key={c.key} className={`ring-item ${c.cls}`}>
            <svg viewBox="0 0 74 74">
              <circle className="ring-bg" cx="37" cy="37" r={R} />
              <circle
                className="ring-fg"
                cx="37" cy="37" r={R}
                ref={el => ringsRef.current[i] = el}
                transform="rotate(-90 37 37)"
                strokeDasharray={C}
                strokeDashoffset={C}
              />
              <text x="37" y="42" textAnchor="middle" className="ring-pct" fill="var(--ink)">{pct}%</text>
            </svg>
            <div className="ring-name">{c.name}</div>
            <div className="ring-count">{c.val} orders</div>
          </div>
        );
      })}
    </div>
  );
}
