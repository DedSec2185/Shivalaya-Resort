import { useEffect, useRef, useState } from 'react';

/**
 * Animated SVG revenue chart — pure React port of the vanilla JS original
 */
export default function RevenueChart({ trend }) {
  const lineRef = useRef(null);
  const areaRef = useRef(null);
  const [tip, setTip]       = useState({ visible: false, text: '', x: 0, y: 0 });

  const W = 560, H = 260, PL = 34, PR = 10, PT = 18, PB = 32;

  const max = Math.max(...trend.map(d => d.v)) * 1.15;
  const stepX = (W - PL - PR) / (trend.length - 1);
  const xAt   = i => PL + i * stepX;
  const yAt   = v => PT + (H - PT - PB) * (1 - v / max);

  const pts      = trend.map((d, i) => [xAt(i), yAt(d.v)]);
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const areaPath = linePath + ` L${pts[pts.length-1][0].toFixed(1)} ${H-PB} L${pts[0][0].toFixed(1)} ${H-PB} Z`;

  // Animate line draw on trend change
  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;
    const len = line.getTotalLength();
    line.style.transition = 'none';
    line.style.strokeDasharray  = len;
    line.style.strokeDashoffset = len;
    if (areaRef.current) areaRef.current.style.opacity = 0;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        line.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)';
        line.style.strokeDashoffset = 0;
        if (areaRef.current) {
          areaRef.current.style.transition = 'opacity 0.9s ease 0.3s';
          areaRef.current.style.opacity = 1;
        }
      });
    });
  }, [trend]);

  // grid lines
  const gridLines = [0,1,2,3].map(i => {
    const y = PT + (H - PT - PB) * (i / 3);
    return <line key={i} className="grid-line" x1={PL} y1={y} x2={W - PR} y2={y} />;
  });

  return (
    <div className="chart-wrap" style={{ position: 'relative' }}>
      {/* Tooltip */}
      {tip.visible && (
        <div
          className="chart-tip show"
          style={{ left: tip.x, top: tip.y }}
        >{tip.text}</div>
      )}

      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#AD8A3F" stopOpacity="0.38"/>
            <stop offset="100%" stopColor="#AD8A3F" stopOpacity="0"/>
          </linearGradient>
        </defs>

        <g>{gridLines}</g>

        <path ref={areaRef} d={areaPath} className="rev-area" />
        <path ref={lineRef} d={linePath} className="rev-line" />

        {/* Dots */}
        {pts.map(([x, y], i) => {
          const d = trend[i];
          return (
            <circle
              key={i}
              className="rev-dot"
              cx={x} cy={y} r={5}
              onMouseEnter={e => {
                const wrap = e.currentTarget.closest('.chart-wrap');
                const rect = wrap.getBoundingClientRect();
                const relX = (x / W) * rect.width;
                const relY = (y / H) * rect.height;
                setTip({ visible: true, text: `${d.l} · ₹${d.v.toLocaleString('en-IN')}`, x: relX, y: relY });
              }}
              onMouseLeave={() => setTip(t => ({ ...t, visible: false }))}
            />
          );
        })}

        {/* X-axis labels */}
        {trend.map((d, i) => (
          <text key={i} className="axis-label" x={xAt(i)} y={H - 8} textAnchor="middle">{d.l}</text>
        ))}
      </svg>
    </div>
  );
}
