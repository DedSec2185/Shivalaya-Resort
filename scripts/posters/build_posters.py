from pathlib import Path
import os
import sys
import webbrowser

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def get_workspace_root():
    p = Path(__file__).resolve().parent
    while p != p.parent:
        if (p / 'package.json').exists():
            return p
        p = p.parent
    return Path.cwd()

WORKSPACE = get_workspace_root()
os.chdir(WORKSPACE)

# 1. Create Padded Logo so circular border never gets clipped
try:
    from PIL import Image
    logo_path = WORKSPACE / "assets" / "branding" / "shivalaya_logo.jpg"
    padded_path = WORKSPACE / "assets" / "branding" / "shivalaya_logo_padded.jpg"
    if os.path.exists(logo_path):
        img = Image.open(logo_path)
        w, h = img.size
        # Add 12% luxury white padding
        pad_x = int(w * 0.12)
        pad_y = int(h * 0.12)
        new_img = Image.new("RGB", (w + pad_x * 2, h + pad_y * 2), (255, 255, 255))
        new_img.paste(img, (pad_x, pad_y))
        new_img.save(padded_path, quality=95)
        print("[OK] Created unclipped padded logo: assets/branding/shivalaya_logo_padded.jpg")
except Exception as e:
    print(f"Note on logo: {e}")

# 2. Highway Red Edition (Maximum 50m Punch - Competitor Style)
RED_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Shivalaya Resort & Panache - Highway Red Edition (2x3 ft)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Montserrat:wght@500;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #111;
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
      background: radial-gradient(circle at 50% 28%, #b30006 0%, #800004 55%, #4a0002 100%);
      border: 8px solid #FFD700;
      outline: 3px solid rgba(255, 215, 0, 0.4);
      outline-offset: -16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 36px 36px 32px 36px;
      color: #fff;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0,0,0,0.8);
    }

    /* TOP HIGHWAY STRIP */
    .top-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0, 0, 0, 0.45);
      border: 2px solid #FFD700;
      border-radius: 40px;
      padding: 10px 24px;
    }
    .strip-item {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #FFD700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .strip-badge {
      background: #FFD700;
      color: #700000;
      font-size: 15px;
      font-weight: 900;
      padding: 4px 14px;
      border-radius: 20px;
      letter-spacing: 1px;
    }

    /* HOOK BLOCK */
    .hook-block {
      text-align: center;
      margin-top: 10px;
    }
    .hook-pill {
      display: inline-block;
      background: #FFD700;
      color: #600000;
      font-size: 19px;
      font-weight: 900;
      padding: 7px 26px;
      border-radius: 30px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
      margin-bottom: 12px;
    }
    .main-question {
      font-size: 40px;
      font-weight: 900;
      color: #FFFFFF;
      line-height: 1.15;
      text-shadow: 0 4px 15px rgba(0,0,0,0.7);
      letter-spacing: -0.5px;
    }
    .main-punchline {
      font-size: 38px;
      font-weight: 900;
      color: #FFF200;
      line-height: 1.2;
      text-shadow: 0 4px 20px rgba(0,0,0,0.9);
      margin-top: 4px;
    }
    .hook-sub {
      margin-top: 8px;
      font-size: 16px;
      font-weight: 700;
      color: #FFE6E6;
      letter-spacing: 0.5px;
    }

    /* BRAND MASTER HERO */
    .brand-hero {
      background: rgba(0, 0, 0, 0.45);
      border: 3px solid rgba(255, 215, 0, 0.85);
      border-radius: 24px;
      padding: 20px 24px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .brand-logo-wrap {
      width: 110px;
      height: 110px;
      margin: 0 auto 10px auto;
      background: #ffffff;
      border-radius: 50%;
      border: 4px solid #FFD700;
      padding: 6px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .brand-logo-wrap img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 50%;
    }
    .resort-title {
      font-family: 'Cinzel', serif;
      font-size: 46px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #FFDF00;
      text-shadow: 0 4px 15px rgba(0,0,0,0.8);
      line-height: 1.1;
    }
    .resort-sub {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 4px;
      color: #FFFCF0;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .connector {
      margin: 10px auto;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 3px;
      color: #FFD700;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .connector::before, .connector::after {
      content: "";
      height: 1px;
      width: 60px;
      background: linear-gradient(90deg, transparent, #FFD700);
    }
    .connector::after {
      background: linear-gradient(90deg, #FFD700, transparent);
    }
    .restaurant-title {
      font-family: 'Cinzel', serif;
      font-size: 34px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #FFFFFF;
      text-shadow: 0 4px 14px rgba(0,0,0,0.8);
      line-height: 1.1;
    }
    .restaurant-type {
      font-size: 15px;
      font-weight: 700;
      color: #FFDE59;
      letter-spacing: 1.5px;
      margin-top: 4px;
    }

    /* 4-PILLAR FOOD RIBBON */
    .food-ribbon {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .food-pill {
      background: rgba(0, 0, 0, 0.55);
      border: 2px solid #FFD700;
      border-radius: 16px;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    }
    .food-icon {
      font-size: 32px;
      line-height: 1;
    }
    .food-name {
      font-size: 17px;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: 0.5px;
      line-height: 1.2;
    }
    .food-desc {
      font-size: 12px;
      font-weight: 600;
      color: #FFD700;
      margin-top: 2px;
    }

    /* BOTTOM HIGHWAY ACTION ANCHOR */
    .bottom-anchor {
      background: #FFD700;
      border-radius: 20px;
      padding: 16px 20px;
      color: #5B0000;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.7);
    }
    .direction-banner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      border-bottom: 2px dashed #9E7400;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .direction-arrow {
      font-size: 44px;
      font-weight: 900;
      color: #990000;
      animation: pulse 1.5s infinite;
    }
    .direction-text-main {
      font-size: 26px;
      font-weight: 900;
      color: #700000;
      letter-spacing: 1px;
      line-height: 1.1;
    }
    .direction-text-sub {
      font-size: 15px;
      font-weight: 800;
      color: #333333;
      margin-top: 2px;
    }
    .call-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
    }
    .call-label {
      font-size: 13px;
      font-weight: 900;
      color: #700000;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .call-numbers {
      font-size: 34px;
      font-weight: 900;
      color: #8C0000;
      letter-spacing: 1.5px;
      line-height: 1;
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
    <!-- Top Strip -->
    <div class="top-strip">
      <div class="strip-item">📍 GOLU DEVTA MANDIR ROAD</div>
      <div class="strip-badge">⚡ SIRF 5 MINS DRIVE (2 KM)</div>
    </div>

    <!-- Hook Block -->
    <div class="hook-block">
      <div class="hook-pill">🙏 DARSHAN KE BAAD... SWAAD BHI, SUKOON BHI!</div>
      <div class="main-question">“Random Dhaba Kyun?”</div>
      <div class="main-punchline">Jab 5 Mins Mein Hai Luxury Dining!</div>
      <div class="hook-sub">✨ 100% Family Ambience • Breathtaking Valley View • Spotless Cleanliness</div>
    </div>

    <!-- Brand Hero -->
    <div class="brand-hero">
      <div class="brand-logo-wrap">
        <img src="../../assets/branding/shivalaya_logo_padded.jpg" onerror="this.src='../../assets/branding/shivalaya_logo.jpg'" alt="Shivalaya Resort Logo">
      </div>
      <div class="resort-title">SHIVALAYA RESORT</div>
      <div class="resort-sub">Luxury Mountain Retreat & Stays</div>
      
      <div class="connector">HOME TO THE RENOWNED</div>
      
      <div class="restaurant-title">PANACHE RESTAURANT</div>
      <div class="restaurant-type">Fine Dining & Pure Mountain Flavours</div>
    </div>

    <!-- 4 Key Food Pillars -->
    <div class="food-ribbon">
      <div class="food-pill">
        <div class="food-icon">🍲</div>
        <div>
          <div class="food-name">KUMAONI (PAHADI)</div>
          <div class="food-desc">Bhat ki Chudkani, Kumaoni Raita</div>
        </div>
      </div>
      <div class="food-pill">
        <div class="food-icon">🥗</div>
        <div>
          <div class="food-name">SPECIAL VRAT THALI</div>
          <div class="food-desc">Sabudana Tikki, Kuttu Poori, Kheer</div>
        </div>
      </div>
      <div class="food-pill">
        <div class="food-icon">🥘</div>
        <div>
          <div class="food-name">NORTH INDIAN & TANDOOR</div>
          <div class="food-desc">Rich Dal Makhani, Paneer, Naan</div>
        </div>
      </div>
      <div class="food-pill">
        <div class="food-icon">☕</div>
        <div>
          <div class="food-name">CAFE & QUICK BITES</div>
          <div class="food-desc">Fresh Cold Coffee, Chai, Snacks</div>
        </div>
      </div>
    </div>

    <!-- Bottom Highway Anchor -->
    <div class="bottom-anchor">
      <div class="direction-banner">
        <div class="direction-arrow">➔</div>
        <div>
          <div class="direction-text-main">TURN FOR SHIVALAYA RESORT</div>
          <div class="direction-text-sub">Mandir Gate Se Bas 2 KM Aage (Near Pine Crest School)</div>
        </div>
      </div>
      <div class="call-row">
        <span class="call-label">FOR TABLE & BOOKINGS:</span>
        <span class="call-numbers">📞 +91 76680 09400</span>
      </div>
    </div>
  </div>
</body>
</html>
"""

# 3. Alpine White & Emerald Edition
WHITE_HTML = RED_HTML.replace(
    """radial-gradient(circle at 50% 28%, #b30006 0%, #800004 55%, #4a0002 100%)""",
    """linear-gradient(180deg, #FFFFFF 0%, #F4F8F5 50%, #E6EFEA 100%)"""
).replace(
    """border: 8px solid #FFD700;""",
    """border: 8px solid #0F3E2C;"""
).replace(
    """outline: 3px solid rgba(255, 215, 0, 0.4);""",
    """outline: 3px solid rgba(200, 150, 62, 0.6);"""
).replace(
    """background: rgba(0, 0, 0, 0.45);""",
    """background: rgba(15, 62, 44, 0.06);"""
).replace(
    """border: 2px solid #FFD700;""",
    """border: 2px solid #0F3E2C;"""
).replace(
    """color: #FFD700;""",
    """color: #0F3E2C;"""
).replace(
    """background: #FFD700;
      color: #700000;""",
    """background: #0F3E2C;
      color: #FFFFFF;"""
).replace(
    """background: #FFD700;
      color: #600000;""",
    """background: #0F3E2C;
      color: #FFD700;"""
).replace(
    """color: #FFFFFF;
      line-height: 1.15;""",
    """color: #0F3E2C;
      line-height: 1.15;"""
).replace(
    """color: #FFF200;""",
    """color: #B45309;"""
).replace(
    """color: #FFE6E6;""",
    """color: #2D5A47;"""
).replace(
    """border: 3px solid rgba(255, 215, 0, 0.85);""",
    """border: 3px solid #C8963E;"""
).replace(
    """color: #FFDF00;""",
    """color: #0F3E2C;"""
).replace(
    """color: #FFFCF0;""",
    """color: #555555;"""
).replace(
    """color: #FFFFFF;
      text-shadow: 0 4px 14px rgba(0,0,0,0.8);""",
    """color: #0F3E2C;
      text-shadow: none;"""
).replace(
    """color: #FFDE59;""",
    """color: #B45309;"""
).replace(
    """background: rgba(0, 0, 0, 0.55);
      border: 2px solid #FFD700;""",
    """background: #FFFFFF;
      border: 2px solid #0F3E2C;"""
).replace(
    """color: #FFFFFF;
      letter-spacing: 0.5px;""",
    """color: #0F3E2C;
      letter-spacing: 0.5px;"""
).replace(
    """color: #FFD700;
      margin-top: 2px;""",
    """color: #B45309;
      margin-top: 2px;"""
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
    """color: #333333;
      margin-top: 2px;""",
    """color: #E2ECE6;
      margin-top: 2px;"""
).replace(
    """color: #700000;
      letter-spacing: 1.5px;""",
    """color: #FFD700;
      letter-spacing: 1.5px;"""
).replace(
    """color: #8C0000;
      letter-spacing: 1.5px;""",
    """color: #FFFFFF;
      letter-spacing: 1.5px;"""
)

# 4. Studio Hub HTML
STUDIO_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Shivalaya Resort & Panache - Official Poster Studio</title>
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
      max-width: 1400px;
      margin: 0 auto 24px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #1a1f26;
      padding: 20px 30px;
      border-radius: 16px;
      border: 1px solid #2d3748;
    }
    .title h1 { font-size: 26px; font-weight: 900; color: #FFD700; }
    .title p { font-size: 14px; color: #a0aec0; margin-top: 4px; }
    .actions { display: flex; gap: 12px; }
    .btn {
      padding: 10px 20px;
      font-size: 14px;
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
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }
    .preview-card {
      background: #1a1f26;
      border-radius: 16px;
      border: 1px solid #2d3748;
      padding: 20px;
      text-align: center;
    }
    .preview-card h2 {
      font-size: 20px;
      font-weight: 800;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .tag { font-size: 12px; padding: 4px 10px; border-radius: 20px; }
    .tag-red { background: #b30006; color: white; }
    .tag-green { background: #0F3E2C; color: #FFD700; }
    
    .frame-wrap {
      width: 100%;
      height: 900px;
      background: #000;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #4a5568;
      transition: all 0.3s ease;
    }
    iframe {
      width: 800px;
      height: 1200px;
      border: none;
      transform-origin: top left;
    }
    .distance-mode iframe {
      filter: blur(2px) contrast(1.1);
      transform: scale(0.4) !important;
    }
  </style>
  <script>
    function resizeIframes() {
      const wraps = document.querySelectorAll('.frame-wrap');
      wraps.forEach(wrap => {
        const iframe = wrap.querySelector('iframe');
        const scale = wrap.offsetWidth / 800;
        iframe.style.transform = 'scale(' + scale + ')';
        wrap.style.height = (1200 * scale) + 'px';
      });
    }
    window.addEventListener('load', resizeIframes);
    window.addEventListener('resize', resizeIframes);

    function toggle50m() {
      document.body.classList.toggle('distance-mode');
      const btn = document.getElementById('distBtn');
      if (document.body.classList.contains('distance-mode')) {
        btn.innerText = '👀 Normal View';
        btn.style.background = '#e53e3e';
      } else {
        btn.innerText = '🚗 Test 50m Distance Blur';
        btn.style.background = '#3182ce';
        resizeIframes();
      }
    }
  </script>
</head>
<body>
  <div class="header">
    <div class="title">
      <h1>Shivalaya Resort & Panache Restaurant — Highway Kiosk Studio</h1>
      <p>Standard 2ft × 3ft (24" × 36") Roadside Billboard • Minimal Cognitive Load • 50-Meter Readability</p>
    </div>
    <div class="actions">
      <button id="distBtn" class="btn btn-action" onclick="toggle50m()">🚗 Test 50m Distance Blur</button>
      <a href="poster_edition_red.html" target="_blank" class="btn btn-red">Open Red Edition (Full Tab)</a>
      <a href="poster_edition_white.html" target="_blank" class="btn btn-white">Open White Edition (Full Tab)</a>
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

# Save Files
posters_dir = WORKSPACE / "marketing" / "posters"
posters_dir.mkdir(parents=True, exist_ok=True)

with open(posters_dir / "poster_edition_red.html", "w", encoding="utf-8") as f:
    f.write(RED_HTML)
print("[OK] Saved posters/poster_edition_red.html")

with open(posters_dir / "poster_edition_white.html", "w", encoding="utf-8") as f:
    f.write(WHITE_HTML)
print("[OK] Saved posters/poster_edition_white.html")

with open(posters_dir / "poster_studio.html", "w", encoding="utf-8") as f:
    f.write(STUDIO_HTML)
print("[OK] Saved posters/poster_studio.html")

# Auto-open in user's default browser
studio_abs = str(posters_dir / "poster_studio.html")
print(f"Opening in browser: {studio_abs}")
print("\n>>> ALL POSTERS GENERATED SUCCESSFULLY IN posters/! <<<")
