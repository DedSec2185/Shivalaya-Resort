import { useState } from 'react';

export default function LoginScreen({ onLogin, loading, error: externalError }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');

  const displayError = err || externalError;

  function pressKey(k) {
    if (k === 'clear') { setPin(''); setErr(''); return; }
    if (pin.length >= 4) return;
    const next = pin + k;
    setPin(next);
    if (next.length === 4) {
      setErr('');
      onLogin(next).then(ok => {
        if (!ok) setPin('');
      });
    }
  }

  const filledDots = pin.length;
  const keys = ['1','2','3','4','5','6','7','8','9','clear','0'];

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="#2C1D07" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/>
          </svg>
        </div>

        <div className="login-wordmark">Panache<span className="accent">.</span></div>
        <div className="login-tagline">Owner's Ledger · Shivalaya Resorts</div>

        <div className="pin-dots">
          {[0,1,2,3].map(i => (
            <div key={i} className={`pin-dot ${i < filledDots ? 'filled' : ''}`} />
          ))}
        </div>

        <div className="login-error">
          {loading ? 'Verifying…' : displayError}
        </div>

        <div className="pin-pad">
          {keys.map(k => (
            <button
              key={k}
              type="button"
              className={`pin-key ${k === 'clear' ? 'clear' : ''}`}
              onClick={() => pressKey(k)}
              disabled={loading}
            >
              {k === 'clear' ? '⌫' : k}
            </button>
          ))}
          {/* 0 spans 2 columns — handled via CSS wide on the 0 key */}
        </div>

        <div style={{ fontSize: 11, color: 'var(--sage)', marginTop: 12 }}>
          Demo PIN: <strong style={{ fontFamily: 'IBM Plex Mono' }}>0000</strong>
        </div>
      </div>
    </div>
  );
}
