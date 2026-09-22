import os
import sys
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
os.chdir(WORKSPACE)

# 1. HIGHWAY RED EDITION (CLEAN, FOCUSED BILLBOARD - 50M VISIBILITY)
RED_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Shivalaya Resort & Panache - Highway Red Edition (2x3 ft)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Montserrat:wght@600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0a0a0a;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      font-family: 'Montserrat', sans-serif;
    }
    .poster {
      width: 800px;
      height: 1200px;
      position: relative;
      background: radial-gradient(circle at 50% 25%, #a60005 0%, #780004 55%, #420002 100%);
      border: 8px solid #FFD700;
      outline: 3px solid rgba(255, 215, 0, 0.5);
      outline-offset: -16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 36px 38px 30px 38px;
      color: #fff;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0,0,0,0.9);
    }

    /* 1. TOP HIGHWAY STRIP */
    .top-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0, 0, 0, 0.7);
      border: 2px solid #FFD700;
      border-radius: 40px;
      padding: 8px 10px 8px 24px;
      white-space: nowrap;
    }
    .location-tag {
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #FFD700;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .distance-hero {
      background: #FFD700;
      color: #630000;
      font-size: 18px;
      font-weight: 900;
      padding: 8px 22px;
      border-radius: 30px;
      letter-spacing: 1px;
      text-transform: uppercase;
      box-shadow: 0 3px 10px rgba(0,0,0,0.4);
      white-space: nowrap;
    }

    /* 2. PILGRIM HOOK */
    .hook-block {
      text-align: center;
      margin-top: 6px;
    }
    .hook-lead {
      font-size: 30px;
      font-weight: 900;
      color: #FFE600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      line-height: 1.2;
      white-space: nowrap;
    }
    .hook-main {
      font-size: 46px;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: 2px;
      text-transform: uppercase;
      line-height: 1.15;
      margin-top: 2px;
      white-space: nowrap;
      text-shadow: 0 4px 18px rgba(0,0,0,0.9);
    }

    /* 3. EXCLUSIVITY CALLOUT (GHORAKHAL'S ONLY LUXURY RESTAURANT) */
    .usp-banner {
      background: #FFE600;
      border-radius: 18px;
      padding: 16px 22px;
      text-align: center;
      box-shadow: 0 8px 25px rgba(0,0,0,0.6);
      margin: 10px 0;
    }
    .usp-question {
      font-size: 32px;
      font-weight: 900;
      color: #7A0000;
      line-height: 1.15;
      white-space: nowrap;
    }
    .usp-claim {
      font-size: 25px;
      font-weight: 900;
      color: #000000;
      line-height: 1.2;
      text-transform: uppercase;
      margin-top: 4px;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    .usp-sub {
      font-size: 15px;
      font-weight: 800;
      color: #550000;
      margin-top: 6px;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    /* 4. MASTER BRAND HERO */
    .brand-hero {
      background: rgba(0, 0, 0, 0.5);
      border: 3px solid rgba(255, 215, 0, 0.85);
      border-radius: 24px;
      padding: 22px 24px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .logo-medallion {
      width: 120px;
      height: 120px;
      margin: 0 auto 10px auto;
      border-radius: 50%;
      border: 3px solid #FFD700;
      background: #000;
      box-shadow: 0 0 24px rgba(255, 215, 0, 0.6);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-medallion img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
    .restaurant-title {
      font-family: 'Cinzel', serif;
      font-size: 46px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #FFFFFF;
      text-shadow: 0 4px 15px rgba(0,0,0,0.8);
      line-height: 1.1;
      white-space: nowrap;
    }
    .resort-connector {
      font-family: 'Cinzel', serif;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 3px;
      color: #FFDF00;
      text-shadow: 0 3px 12px rgba(0,0,0,0.8);
      margin-top: 6px;
      white-space: nowrap;
    }
    .cuisines-bar {
      margin-top: 14px;
      display: inline-block;
      background: rgba(255, 215, 0, 0.15);
      border: 1.5px solid #FFD700;
      border-radius: 20px;
      padding: 8px 20px;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #FFF2BD;
      text-transform: uppercase;
      white-space: nowrap;
    }

    /* 5. BOTTOM HIGHWAY DIRECTION & MASSIVE NUMBERS */
    .bottom-anchor {
      background: #FFD700;
      border-radius: 20px;
      padding: 16px 20px;
      color: #5B0000;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8);
    }
    .direction-banner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      border-bottom: 2px dashed #9E7400;
      padding-bottom: 10px;
      margin-bottom: 10px;
      white-space: nowrap;
    }
    .direction-arrow {
      font-size: 42px;
      font-weight: 900;
      color: #990000;
      line-height: 1;
    }
    .direction-main {
      font-size: 28px;
      font-weight: 900;
      color: #700000;
      letter-spacing: 1px;
      line-height: 1.1;
      white-space: nowrap;
    }
    .direction-sub {
      font-size: 16px;
      font-weight: 800;
      color: #222222;
      margin-top: 3px;
      white-space: nowrap;
    }
    .call-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    .call-label {
      font-size: 13px;
      font-weight: 900;
      color: #700000;
      letter-spacing: 2px;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .call-numbers {
      font-size: 38px;
      font-weight: 900;
      color: #8C0000;
      letter-spacing: 2px;
      line-height: 1.15;
      white-space: nowrap;
      text-align: center;
      width: 100%;
    }
    .num-sep {
      color: #700000;
      font-weight: 700;
      margin: 0 10px;
      opacity: 0.7;
    }

    @media print {
      @page { size: 24in 36in; margin: 0; }
      body { background: transparent; padding: 0; }
      .poster { width: 100vw !important; height: 100vh !important; box-shadow: none !important; border-radius: 0 !important; }
    }
  </style>
</head>
<body>
  <div class="poster">
    <!-- Top Strip: Road & 5 Mins Distance -->
    <div class="top-strip">
      <div class="location-tag">GOLU DEVTA MANDIR ROAD</div>
      <div class="distance-hero">BAS 2 KM • SIRF 5 MINS DRIVE</div>
    </div>

    <!-- Pilgrim Hook: Balanced & Grand -->
    <div class="hook-block">
      <div class="hook-lead">MANDIR DARSHAN KE BAAD...</div>
      <div class="hook-main">SWAAD BHI, SUKOON BHI!</div>
    </div>

    <!-- Core Exclusivity Callout: The Only Luxury Dining around Ghorakhal -->
    <div class="usp-banner">
      <div class="usp-question">“Random Dhaba Kyun?”</div>
      <div class="usp-claim">GHORAKHAL'S ONLY LUXURY MULTI-CUISINE DINING</div>
      <div class="usp-sub">100% Family Ambience • Breathtaking Valley Views • Ample Parking</div>
    </div>

    <!-- Master Brand Hero: Panache Restaurant at Shivalaya Resort -->
    <div class="brand-hero">
      <div class="logo-medallion">
        <img src="../assets/branding/shivalaya_badge_perfect.png" onerror="this.src='../assets/branding/shivalaya_logo.jpg'" alt="Shivalaya Resort Logo">
      </div>
      <div class="restaurant-title">PANACHE RESTAURANT</div>
      <div class="resort-connector">AT SHIVALAYA RESORT</div>
      <div class="cuisines-bar">
        AUTHENTIC PAHADI • SHUDDH VRAT THALI • NORTH INDIAN • CAFE
      </div>
    </div>

    <!-- Bottom Highway Direction & Massive Unclipped Contact -->
    <div class="bottom-anchor">
      <div class="direction-banner">
        <div class="direction-arrow">➔</div>
        <div>
          <div class="direction-main">TURN FOR SHIVALAYA RESORT</div>
          <div class="direction-sub">Mandir Gate Se Bas 2 KM Aage (Near Pine Crest School)</div>
        </div>
      </div>
      <div class="call-box">
        <div class="call-label">CALL FOR TABLE BOOKING & DIRECTIONS</div>
        <div class="call-numbers">76680 09400<span class="num-sep">|</span>94121 56361</div>
      </div>
    </div>
  </div>
</body>
</html>
"""

# 2. ALPINE WHITE & EMERALD EDITION (CRISP, PURE, LUXURY MOUNTAIN PALETTE)
WHITE_HTML = RED_HTML.replace(
    """radial-gradient(circle at 50% 25%, #a60005 0%, #780004 55%, #420002 100%)""",
    """linear-gradient(180deg, #FFFFFF 0%, #F5FAF6 45%, #E5F0E8 100%)"""
).replace(
    """border: 8px solid #FFD700;""",
    """border: 8px solid #0F3E2C;"""
).replace(
    """outline: 3px solid rgba(255, 215, 0, 0.5);""",
    """outline: 3px solid rgba(200, 150, 62, 0.6);"""
).replace(
    """background: rgba(0, 0, 0, 0.7);
      border: 2px solid #FFD700;""",
    """background: #0F3E2C;
      border: 2px solid #C8963E;"""
).replace(
    """color: #FFD700;
      text-transform: uppercase;
      white-space: nowrap;""",
    """color: #FFFFFF;
      text-transform: uppercase;
      white-space: nowrap;"""
).replace(
    """background: #FFD700;
      color: #630000;""",
    """background: #C8963E;
      color: #FFFFFF;"""
).replace(
    """color: #FFE600;""",
    """color: #0F3E2C;"""
).replace(
    """color: #FFFFFF;
      letter-spacing: 2px;
      text-transform: uppercase;
      line-height: 1.15;
      margin-top: 2px;
      white-space: nowrap;
      text-shadow: 0 4px 18px rgba(0,0,0,0.9);""",
    """color: #0F3E2C;
      letter-spacing: 2px;
      text-transform: uppercase;
      line-height: 1.15;
      margin-top: 2px;
      white-space: nowrap;
      text-shadow: none;"""
).replace(
    """background: #FFE600;
      border-radius: 18px;
      padding: 16px 22px;
      text-align: center;
      box-shadow: 0 8px 25px rgba(0,0,0,0.6);
      margin: 10px 0;""",
    """background: #0F3E2C;
      border-radius: 18px;
      padding: 16px 22px;
      text-align: center;
      box-shadow: 0 8px 25px rgba(15,62,44,0.3);
      margin: 10px 0;"""
).replace(
    """color: #7A0000;""",
    """color: #FFD700;"""
).replace(
    """color: #000000;
      line-height: 1.2;
      text-transform: uppercase;
      margin-top: 4px;
      letter-spacing: 0.5px;
      white-space: nowrap;""",
    """color: #FFFFFF;
      line-height: 1.2;
      text-transform: uppercase;
      margin-top: 4px;
      letter-spacing: 0.5px;
      white-space: nowrap;"""
).replace(
    """color: #550000;
      margin-top: 6px;""",
    """color: #D6EADF;
      margin-top: 6px;"""
).replace(
    """background: rgba(0, 0, 0, 0.5);
      border: 3px solid rgba(255, 215, 0, 0.85);""",
    """background: #FFFFFF;
      border: 3px solid #0F3E2C;"""
).replace(
    """color: #FFFFFF;
      text-shadow: 0 4px 15px rgba(0,0,0,0.8);
      line-height: 1.1;
      white-space: nowrap;""",
    """color: #0F3E2C;
      text-shadow: none;
      line-height: 1.1;
      white-space: nowrap;"""
).replace(
    """color: #FFDF00;
      text-shadow: 0 3px 12px rgba(0,0,0,0.8);
      margin-top: 6px;
      white-space: nowrap;""",
    """color: #C8963E;
      text-shadow: none;
      margin-top: 6px;
      white-space: nowrap;"""
).replace(
    """background: rgba(255, 215, 0, 0.15);
      border: 1.5px solid #FFD700;
      border-radius: 20px;
      padding: 8px 20px;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #FFF2BD;""",
    """background: #F4F8F5;
      border: 1.5px solid #0F3E2C;
      border-radius: 20px;
      padding: 8px 20px;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #0F3E2C;"""
).replace(
    """background: #FFD700;
      border-radius: 20px;
      padding: 16px 20px;
      color: #5B0000;""",
    """background: #0F3E2C;
      border-radius: 20px;
      padding: 16px 20px;
      color: #FFFFFF;"""
).replace(
    """color: #990000;""",
    """color: #FFD700;"""
).replace(
    """color: #700000;
      letter-spacing: 1px;""",
    """color: #FFFFFF;
      letter-spacing: 1px;"""
).replace(
    """color: #222222;""",
    """color: #D6EADF;"""
).replace(
    """color: #700000;
      letter-spacing: 2px;""",
    """color: #FFD700;
      letter-spacing: 2px;"""
).replace(
    """color: #8C0000;
      letter-spacing: 2px;""",
    """color: #FFFFFF;
      letter-spacing: 2px;"""
).replace(
    """color: #700000;
      font-weight: 700;""",
    """color: #C8963E;
      font-weight: 700;"""
)

# 3. STUDIO HUB HTML
STUDIO_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Shivalaya Resort & Panache - Highway Poster Studio</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0d0f12;
      color: #e2e8f0;
      font-family: 'Montserrat', sans-serif;
      padding: 24px;
    }
    .header {
      max-width: 1440px;
      margin: 0 auto 24px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #1a1f26;
      padding: 18px 28px;
      border-radius: 16px;
      border: 1px solid #2d3748;
    }
    .title h1 { font-size: 24px; font-weight: 900; color: #FFD700; }
    .title p { font-size: 13px; color: #a0aec0; margin-top: 4px; }
    .actions { display: flex; gap: 12px; }
    .btn {
      padding: 10px 18px;
      font-size: 13px;
      font-weight: 800;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }
    .btn-red { background: #b30006; color: white; border: 1px solid #ff4d4d; }
    .btn-white { background: #0F3E2C; color: #FFD700; border: 1px solid #2d8a63; }
    .btn-action { background: #3182ce; color: white; }
    .btn:hover { transform: translateY(-2px); opacity: 0.95; }

    .gallery {
      max-width: 1440px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
    }
    .preview-card {
      background: #1a1f26;
      border-radius: 16px;
      border: 1px solid #2d3748;
      padding: 18px;
      text-align: center;
    }
    .preview-card h2 {
      font-size: 18px;
      font-weight: 800;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .tag { font-size: 12px; padding: 4px 10px; border-radius: 20px; }
    .tag-red { background: #b30006; color: white; }
    .tag-green { background: #0F3E2C; color: #FFD700; }
    
    .frame-wrap {
      width: 100%;
      aspect-ratio: 800 / 1200;
      background: #000;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #4a5568;
      position: relative;
    }
    iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 800px;
      height: 1200px;
      border: none;
      transform-origin: top left;
    }
    .distance-mode iframe {
      filter: blur(2.5px) contrast(1.15);
    }
  </style>
  <script>
    function resizeIframes() {
      const wraps = document.querySelectorAll('.frame-wrap');
      wraps.forEach(wrap => {
        const iframe = wrap.querySelector('iframe');
        const scale = wrap.clientWidth / 800;
        iframe.style.transform = 'scale(' + scale + ')';
      });
    }
    window.addEventListener('load', resizeIframes);
    window.addEventListener('resize', resizeIframes);

    function toggle50m() {
      document.body.classList.toggle('distance-mode');
      const btn = document.getElementById('distBtn');
      if (document.body.classList.contains('distance-mode')) {
        btn.innerText = 'Normal View';
        btn.style.background = '#e53e3e';
      } else {
        btn.innerText = 'Test 50m Distance Blur';
        btn.style.background = '#3182ce';
      }
    }
  </script>
</head>
<body>
  <div class="header">
    <div class="title">
      <h1>Shivalaya Resort & Panache Restaurant — Highway Kiosk Studio</h1>
      <p>Standard 2ft × 3ft (24" × 36") Roadside Billboard • High-Voltage 50-Meter Readability</p>
    </div>
    <div class="actions">
      <button id="distBtn" class="btn btn-action" onclick="toggle50m()">Test 50m Distance Blur</button>
      <a href="poster_edition_red.html" target="_blank" class="btn btn-red">Open Red (Full Tab)</a>
      <a href="poster_edition_white.html" target="_blank" class="btn btn-white">Open White (Full Tab)</a>
    </div>
  </div>

  <div class="gallery">
    <div class="preview-card">
      <h2>Highway Red Edition <span class="tag tag-red">Maximum Contrast (50m Punch)</span></h2>
      <div class="frame-wrap">
        <iframe src="poster_edition_red.html"></iframe>
      </div>
    </div>
    <div class="preview-card">
      <h2>Alpine White & Emerald Edition <span class="tag tag-green">Mountain Luxury</span></h2>
      <div class="frame-wrap">
        <iframe src="poster_edition_white.html"></iframe>
      </div>
    </div>
  </div>
</body>
</html>
"""

posters_dir = WORKSPACE / "posters"
posters_dir.mkdir(parents=True, exist_ok=True)

with open(posters_dir / "poster_edition_red.html", "w", encoding="utf-8") as f:
    f.write(RED_HTML)
print("[OK] Saved clean posters/poster_edition_red.html")

with open(posters_dir / "poster_edition_white.html", "w", encoding="utf-8") as f:
    f.write(WHITE_HTML)
print("[OK] Saved clean posters/poster_edition_white.html")

with open(posters_dir / "poster_studio.html", "w", encoding="utf-8") as f:
    f.write(STUDIO_HTML)
print("[OK] Saved clean posters/poster_studio.html")
print(">>> ALL CLEAN BILLBOARDS GENERATED SUCCESSFULLY IN posters/! <<<")
