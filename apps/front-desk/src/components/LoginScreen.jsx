import { useState } from 'react';

export default function LoginScreen({ onLogin, loading, error }) {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);

  function handleKey(key) {
    if (loading) return;

    if (key === 'clear') { setPin(''); return; }
    if (key === 'back')  { setPin(p => p.slice(0, -1)); return; }
    if (pin.length >= 4) return;

    const next = pin + key;
    setPin(next);

    if (next.length === 4) {
      const result = onLogin(next);
      // If returned value is a promise, wait; if sync false, shake
      Promise.resolve(result).then(ok => {
        if (ok === false) {
          setShake(true);
          setTimeout(() => setShake(false), 500);
        }
        setPin('');
      });
    }
  }

  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="login-screen">
      <div className="login-card">
        {/* Logo */}
        <img src="/panache_logo.jpg" alt="Panache" className="login-logo" />

        <h1 className="login-title">Front Desk</h1>
        <p className="login-subtitle">Shivalaya Panache · Staff Portal</p>

        <p className="login-label">Enter your 4-digit staff PIN</p>

        {/* PIN Dots */}
        <div className={`pin-display${shake ? ' shake' : ''}`}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`pin-dot${i < pin.length ? ' filled' : ''}`} />
          ))}
        </div>

        {/* Numpad */}
        <div className="pin-pad">
          {keys.map(n => (
            <button
              key={n}
              type="button"
              className="pin-key"
              onClick={() => handleKey(String(n))}
              disabled={loading}
            >
              {n}
            </button>
          ))}
          <button type="button" className="pin-key pin-key--action" onClick={() => handleKey('clear')} disabled={loading}>
            Clear
          </button>
          <button type="button" className="pin-key" onClick={() => handleKey('0')} disabled={loading}>
            0
          </button>
          <button type="button" className="pin-key pin-key--action" onClick={() => handleKey('back')} disabled={loading}>
            ⌫
          </button>
        </div>

        {loading && <p className="login-hint">Verifying…</p>}
        {error   && <p className="login-error">{error}</p>}

        {/* Demo hint */}
        <p className="login-hint" style={{ marginTop: 14 }}>
          Demo PIN: <strong>1234</strong>
        </p>
      </div>
    </div>
  );
}
