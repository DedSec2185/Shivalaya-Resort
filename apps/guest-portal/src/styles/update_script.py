import sys

css_append = """
/* ============ PREMIUM POLISH — v2 ============ */

/* Ambient grain overlay for organic warmth */
.app-root::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.025'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 1000;
  mix-blend-mode: overlay;
}

/* Staggered card entrance */
@keyframes cardSlideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Parallax-inspired hero shimmer */
@keyframes heroShimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Floating animation for decorative elements */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%      { transform: translateY(-8px); }
}

/* Pulse ring for live indicators */
@keyframes pulseRing {
  0%   { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2.4); opacity: 0; }
}

/* Glassmorphism card style */
.glass-card {
  background: rgba(255, 252, 244, 0.75);
  backdrop-filter: blur(20px) saturate(1.6);
  -webkit-backdrop-filter: blur(20px) saturate(1.6);
  border: 1px solid rgba(235, 224, 196, 0.6);
  border-radius: 18px;
  box-shadow: 
    0 4px 16px rgba(35, 31, 22, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), 
              box-shadow 0.3s ease,
              border-color 0.3s ease;
}
.glass-card:active {
  transform: scale(0.97);
}
@media (hover: hover) {
  .glass-card:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 12px 32px rgba(35, 31, 22, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
    border-color: var(--brass-light);
  }
}

/* Landing page action cards — enhanced */
.landing-card {
  position: relative;
  overflow: hidden;
  border: none;
  border-radius: 20px;
  padding: 24px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  text-align: left;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), 
              box-shadow 0.35s ease;
}
.landing-card:active {
  transform: scale(0.96);
}
@media (hover: hover) {
  .landing-card:hover {
    transform: translateY(-5px);
  }
  .landing-card:hover .landing-card-arrow {
    transform: translateX(4px);
    opacity: 1;
  }
}
.landing-card-arrow {
  transition: transform 0.3s ease, opacity 0.3s ease;
  opacity: 0.6;
  flex-shrink: 0;
}

/* Primary action card (Order Food) */
.landing-card-primary {
  background: linear-gradient(135deg, var(--forest-deep) 0%, #2a5a1c 50%, var(--forest) 100%);
  box-shadow: 0 10px 32px rgba(26, 46, 19, 0.35);
}
.landing-card-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: 
    repeating-linear-gradient(90deg, rgba(217,189,117,0.04) 0 1px, transparent 1px 28px),
    radial-gradient(ellipse at 80% 20%, rgba(217,189,117,0.1), transparent 60%);
  pointer-events: none;
}
.landing-card-primary::after {
  content: '';
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--brass-light), var(--brass), transparent);
}
@media (hover: hover) {
  .landing-card-primary:hover {
    box-shadow: 0 16px 44px rgba(26, 46, 19, 0.45);
  }
}

/* Secondary action card (Experiences) */
.landing-card-secondary {
  background: var(--card);
  border: 1.5px solid var(--parchment-deep);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}
.landing-card-secondary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 100% 0%, rgba(44,74,34,0.04), transparent 60%);
  pointer-events: none;
  border-radius: inherit;
}
@media (hover: hover) {
  .landing-card-secondary:hover {
    box-shadow: 0 12px 32px rgba(44, 74, 34, 0.12);
    border-color: var(--brass-light);
  }
}

/* Card icon container */
.landing-card-icon {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@media (hover: hover) {
  .landing-card:hover .landing-card-icon {
    transform: scale(1.1) rotate(-5deg);
  }
}
.landing-card-icon-primary {
  background: rgba(217, 189, 117, 0.15);
}
.landing-card-icon-secondary {
  background: rgba(44, 74, 34, 0.07);
}

/* Info tiles — landing page */
.info-tile {
  background: var(--card);
  border: 1px solid var(--parchment-deep);
  border-radius: 16px;
  padding: 16px 12px;
  text-align: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.3s ease,
              border-color 0.3s ease;
}
.info-tile:active {
  transform: scale(0.95);
}
@media (hover: hover) {
  .info-tile:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    border-color: var(--brass-light);
  }
}
.info-tile-icon {
  font-size: 24px;
  margin-bottom: 8px;
  display: block;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@media (hover: hover) {
  .info-tile:hover .info-tile-icon {
    transform: scale(1.15) rotate(-8deg);
  }
}

/* Session chip — glassmorphism */
.session-chip {
  margin: 14px 16px 0;
  background: rgba(255, 252, 244, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1.5px solid rgba(44, 74, 34, 0.15);
  border-radius: 14px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 14px rgba(44, 74, 34, 0.06);
  animation: cardSlideUp 0.5s cubic-bezier(0.2, 0.9, 0.25, 1.1) 0.2s both;
}
.session-chip-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--forest), var(--forest-deep));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(44, 74, 34, 0.2);
}
.session-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--forest);
  position: relative;
  flex-shrink: 0;
}
.session-pulse::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 2px solid var(--forest);
  animation: pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Hero section — enhanced bottom gradient */
.hero-landing {
  position: relative;
  height: 280px;
  overflow: hidden;
  border-radius: 0 0 32px 32px;
  flex-shrink: 0;
}
.hero-landing-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, var(--forest-deep) 0%, #3a5e28 45%, var(--forest) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-landing-bg::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(to top, rgba(26,46,19,0.85), transparent);
}
.hero-landing-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(26,46,19,0.15) 0%, rgba(26,46,19,0.7) 70%, rgba(26,46,19,0.9) 100%);
}
.hero-landing-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 22px 26px;
  color: #F3EEDB;
}
.hero-eyebrow-landing {
  font-size: 10px;
  letter-spacing: 2.8px;
  text-transform: uppercase;
  color: rgba(243, 238, 219, 0.55);
  font-weight: 700;
  margin-bottom: 8px;
}
.hero-title-landing {
  font-family: 'Fraunces', serif;
  font-size: 26px;
  font-weight: 700;
  font-style: italic;
  line-height: 1.2;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}
.hero-sub-landing {
  font-size: 12px;
  color: rgba(243, 238, 219, 0.75);
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Footer */
.landing-footer {
  text-align: center;
  padding: 12px 16px 36px;
  font-size: 10px;
  color: var(--sage);
  font-family: 'IBM Plex Mono', monospace;
  letter-spacing: 1.5px;
  opacity: 0.7;
}

/* Smooth scrollbar for desktop */
@media (min-width: 481px) {
  .app-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(35,31,22,0.15) transparent;
  }
  .app-scroll::-webkit-scrollbar { display: block; width: 4px; }
  .app-scroll::-webkit-scrollbar-track { background: transparent; }
  .app-scroll::-webkit-scrollbar-thumb { background: rgba(35,31,22,0.15); border-radius: 2px; }
}

/* Experiences page card polish */
.exp-card {
  background: var(--card);
  border: 1.5px solid var(--parchment-deep);
  border-radius: 18px;
  padding: 18px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.35s ease,
              border-color 0.35s ease;
  position: relative;
  overflow: hidden;
}
.exp-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--brass-light), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.exp-card:active {
  transform: scale(0.97);
}
@media (hover: hover) {
  .exp-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(35, 31, 22, 0.1);
    border-color: var(--brass-light);
  }
  .exp-card:hover::after {
    opacity: 1;
  }
}

/* Order tracking timeline polish */
.timeline-step {
  position: relative;
  padding-left: 32px;
  padding-bottom: 24px;
}
.timeline-step::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 24px;
  bottom: 0;
  width: 2px;
  background: var(--parchment-deep);
}
.timeline-step:last-child::before {
  display: none;
}
.timeline-dot {
  position: absolute;
  left: 2px;
  top: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--parchment-deep);
  border: 2px solid var(--parchment);
  transition: all 0.3s ease;
}
.timeline-dot.active {
  background: var(--forest);
  box-shadow: 0 0 0 4px rgba(44, 74, 34, 0.15);
}
.timeline-dot.active::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid var(--forest);
  animation: pulseRing 2s infinite;
}
"""

css_path = r'c:\Users\abhay\Desktop\Shivalaya Panache Menu\apps\guest-portal\src\styles\panache-theme.css'
with open(css_path, 'a', encoding='utf-8') as f:
    f.write('\n' + css_append.strip() + '\n')
print('CSS updated')

jsx_new = """  return (
    <div className="app-root">
      <div className="app-scroll">

        {/* ── HERO ─────────────────────────────────────────── */}
        <div ref={heroRef} className="reveal hero-landing">
          <div className="hero-landing-bg">
            <div style={{ textAlign: 'center', opacity: 0.15, color: '#fff' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              <div style={{ fontSize: '9px', marginTop: '6px', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '1.5px' }}>HERO IMAGE</div>
            </div>
          </div>
          <div className="hero-landing-overlay" />
          <div className="hero-landing-content">
            <div className="hero-eyebrow-landing">Shivalaya Resorts · Uttarakhand</div>
            {loading ? (
              <div className="hero-title-landing" style={{ opacity: 0.6 }}>Resolving session…</div>
            ) : guestName ? (
              <>
                <div className="hero-title-landing">Welcome, {guestName.split(' ')[0]}</div>
                <div className="hero-sub-landing">
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brass-light)', display: 'inline-block', animation: 'dotPulse 1.6s infinite' }} />
                  Room {roomNumber} · Checked In
                </div>
              </>
            ) : legacyTable ? (
              <>
                <div className="hero-title-landing">Welcome, Guest</div>
                <div className="hero-sub-landing">{legacyTable.replace('_', ' ')}</div>
              </>
            ) : (
              <>
                <div className="hero-title-landing">Welcome to the Hills</div>
                <div className="hero-sub-landing">Scan your room QR code to get started</div>
              </>
            )}
          </div>
        </div>

        {/* ── SESSION CHIP ─────────────────────────────────── */}
        {session && (
          <div className="session-chip">
            <div className="session-chip-avatar">
              <svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-deep)' }}>{session.guestName}</div>
              <div style={{ fontSize: '11px', color: 'var(--brass)', fontWeight: 600, marginTop: '1px' }}>Room {session.roomNumber} · Session Active</div>
            </div>
            <div className="session-pulse" />
          </div>
        )}

        {/* ── ACTION CARDS ─────────────────────────────────── */}
        <div ref={cardsRef} className="reveal" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Order Food card */}
          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="landing-card landing-card-primary"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
              <div className="landing-card-icon landing-card-icon-primary">🍽️</div>
              <div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 700, color: 'var(--brass-light)', letterSpacing: '0.2px' }}>
                  Order Food
                </div>
                <div style={{ fontSize: '11.5px', color: 'rgba(243,238,219,0.72)', marginTop: '3px', fontFamily: 'Inter, sans-serif' }}>
                  Panache Restaurant · Room Service
                </div>
              </div>
            </div>
            <svg className="landing-card-arrow" viewBox="0 0 24 24" fill="none" stroke="rgba(243,238,219,0.6)" strokeWidth="2.5" width="18" height="18">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>

          {/* Book Experiences card */}
          <button
            type="button"
            onClick={() => navigate('/experiences')}
            className="landing-card landing-card-secondary"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="landing-card-icon landing-card-icon-secondary">🏔️</div>
              <div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 700, color: 'var(--forest-deep)' }}>
                  Experiences
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--sage)', marginTop: '3px' }}>
                  Trekking · Yoga · Bonfire · Spa
                </div>
              </div>
            </div>
            <svg className="landing-card-arrow" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2.5" width="18" height="18">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>

          {/* Info tiles row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
            {[
              { icon: '📞', label: 'Reception', sub: 'Ext. 100' },
              { icon: '🛁', label: 'Housekeeping', sub: 'Ext. 101' },
            ].map(tile => (
              <div key={tile.label} className="info-tile">
                <span className="info-tile-icon">{tile.icon}</span>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-deep)' }}>{tile.label}</div>
                <div style={{ fontSize: '10.5px', color: 'var(--sage)', marginTop: '2px', fontFamily: 'IBM Plex Mono, monospace' }}>{tile.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FOOTER ─────────────────────────────────────────── */}
        <div ref={footRef} className="reveal landing-footer">
          SHIVALAYA RESORTS © {new Date().getFullYear()} · UTTARAKHAND
        </div>

      </div>
    </div>
  )
}
"""

jsx_path = r'c:\Users\abhay\Desktop\Shivalaya Panache Menu\apps\guest-portal\src\pages\LandingPage.tsx'
with open(jsx_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.strip() == 'return (':
        break
    new_lines.append(line)

new_content = ''.join(new_lines) + jsx_new + '\n'

with open(jsx_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('JSX updated')
