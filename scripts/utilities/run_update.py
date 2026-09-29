import os
from pathlib import Path
from PIL import Image, ImageDraw

def get_workspace_root():
    p = Path(__file__).resolve().parent
    while p != p.parent:
        if (p / 'package.json').exists():
            return p
        p = p.parent
    return Path.cwd()

WORKSPACE = get_workspace_root()
os.chdir(WORKSPACE)

# 1. Create seamless circular Shivalaya medallion
try:
    logo_path = WORKSPACE / "assets" / "branding" / "shivalaya_logo.jpg"
    badge_path = WORKSPACE / "assets" / "branding" / "shivalaya_badge_perfect.png"
    orig = Image.open(logo_path).convert("RGBA")
    size = 800
    badge = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(badge)
    # Double gold ring on black circle
    draw.ellipse((8, 8, size - 8, size - 8), fill=(8, 8, 8, 255), outline=(255, 215, 0, 255), width=10)
    draw.ellipse((22, 22, size - 22, size - 22), outline=(255, 215, 0, 160), width=3)
    
    # Scale content to fit comfortably inside the circle
    scale = 0.74
    new_w = int(orig.width * scale)
    new_h = int(orig.height * scale)
    scaled = orig.resize((new_w, new_h), Image.Resampling.LANCZOS)
    datas = scaled.getdata()
    newData = []
    for item in datas:
        if (item[0] + item[1] + item[2]) / 3 < 30:
            newData.append((0, 0, 0, 0))
        else:
            newData.append(item)
    scaled.putdata(newData)
    pos_x = (size - new_w) // 2
    pos_y = (size - new_h) // 2
    badge.paste(scaled, (pos_x, pos_y), scaled)
    badge.save(badge_path, "PNG")
    print(f"[OK] Created {badge_path}")
except Exception as e:
    print(f"Error creating badge: {e}")

# 2. Highway Red Edition HTML
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
      padding: 32px 34px 28px 34px;
      color: #fff;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0,0,0,0.9);
    }

    /* 1. TOP HIGHWAY LOCATION STRIP */
    .top-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0, 0, 0, 0.65);
      border: 2px solid #FFD700;
      border-radius: 40px;
      padding: 8px 24px;
    }
    .top-strip-text {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #FFD700;
      text-transform: uppercase;
    }
    .top-strip-badge {
      background: #FFD700;
      color: #630000;
      font-size: 15px;
      font-weight: 900;
      padding: 4px 14px;
      border-radius: 20px;
      letter-spacing: 1px;
    }

    /* 2. GRAND HOOK BLOCK (50-METER VISIBILITY) */
    .hook-block {
      text-align: center;
      margin-top: 4px;
    }
    .spiritual-lead {
      font-size: 21px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #FFE6A3;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .hook-hero {
      font-size: 48px;
      font-weight: 900;
      color: #FFFFFF;
      line-height: 1.1;
      letter-spacing: 1px;
      text-transform: uppercase;
      text-shadow: 0 4px 18px rgba(0,0,0,0.9);
    }
    .dhaba-banner {
      background: #FFE600;
      border-radius: 14px;
      padding: 10px 18px;
      margin: 8px 0;
      box-shadow: 0 6px 20px rgba(0,0,0,0.6);
    }
    .dhaba-q {
      font-size: 32px;
      font-weight: 900;
      color: #7A0000;
      line-height: 1.15;
    }
    .dhaba-ans {
      font-size: 28px;
      font-weight: 900;
      color: #000000;
      line-height: 1.2;
      text-transform: uppercase;
    }
    .features-strip {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      background: rgba(0, 0, 0, 0.65);
      border: 2px solid #FFD700;
      border-radius: 30px;
      padding: 8px 18px;
      font-size: 17px;
      font-weight: 800;
      color: #FFF3BD;
      letter-spacing: 0.5px;
    }

    /* 3. RESORT HERO & PANACHE */
    .brand-hero {
      background: rgba(0, 0, 0, 0.45);
      border: 3px solid rgba(255, 215, 0, 0.85);
      border-radius: 20px;
      padding: 16px 20px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .logo-medallion {
      width: 116px;
      height: 116px;
      margin: 0 auto 6px auto;
      border-radius: 50%;
      border: 3px solid #FFD700;
      background: #000;
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
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
      color: #FFFFFF;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .connector {
      margin: 8px auto;
      font-size: 13px;
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
      width: 50px;
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
      text-shadow: 0 4px 12px rgba(0,0,0,0.8);
      line-height: 1.1;
    }
    .restaurant-sub {
      font-size: 14px;
      font-weight: 700;
      color: #FFD700;
      letter-spacing: 1.5px;
      margin-top: 2px;
    }

    /* 4. FOUR FOOD PILLARS (HIGH CONTRAST BOLD) */
    .food-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .food-card {
      background: rgba(0, 0, 0, 0.75);
      border: 2.5px solid #FFD700;
      border-radius: 14px;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.5);
    }
    .food-emoji {
      font-size: 36px;
      line-height: 1;
    }
    .food-heading {
      font-size: 20px;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: 0.5px;
      line-height: 1.2;
    }
    .food-desc {
      font-size: 13px;
      font-weight: 700;
      color: #FFD700;
      margin-top: 2px;
    }

    /* 5. BOTTOM HIGHWAY DIRECTION & GIANT PHONE NUMBERS */
    .bottom-anchor {
      background: #FFD700;
      border-radius: 18px;
      padding: 14px 20px;
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
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    .direction-arrow {
      font-size: 42px;
      font-weight: 900;
      color: #990000;
    }
    .direction-main {
      font-size: 27px;
      font-weight: 900;
      color: #700000;
      letter-spacing: 1px;
      line-height: 1.1;
    }
    .direction-sub {
      font-size: 15px;
      font-weight: 800;
      color: #222222;
      margin-top: 2px;
    }
    .call-strip {
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
      font-size: 35px;
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
      <div class="top-strip-text">📍 GOLU DEVTA MANDIR ROAD</div>
      <div class="top-strip-badge">⚡ SIRF 5 MINS DRIVE (2 KM)</div>
    </div>

    <!-- Massive Hook Section -->
    <div class="hook-block">
      <div class="spiritual-lead">🙏 GOLU DEVTA MANDIR DARSHAN KE BAAD...</div>
      <div class="hook-hero">SWAAD BHI, SUKOON BHI!</div>
      
      <div class="dhaba-banner">
        <div class="dhaba-q">“Random Dhaba Kyun?”</div>
        <div class="dhaba-ans">Jab 5 Mins Mein Hai Luxury Dining!</div>
      </div>

      <div class="features-strip">
        <span>⭐ 100% FAMILY AMBIENCE</span>
        <span>•</span>
        <span>VALLEY VIEW DINING</span>
        <span>•</span>
        <span>AMPLE PARKING</span>
      </div>
    </div>

    <!-- Resort Master Brand Hero -->
    <div class="brand-hero">
      <div class="logo-medallion">
        <img src="../../assets/branding/shivalaya_badge_perfect.png" onerror="this.src='../../assets/branding/shivalaya_logo.jpg'" alt="Shivalaya Resort Logo">
      </div>
      <div class="resort-title">SHIVALAYA RESORT</div>
      <div class="resort-sub">LUXURY MOUNTAIN RETREAT & STAYS</div>
      
      <div class="connector">HOME TO THE RENOWNED</div>
      
      <div class="restaurant-title">PANACHE RESTAURANT</div>
      <div class="restaurant-sub">Fine Dining & Authentic Himalayan Cuisine</div>
    </div>

    <!-- 4 High-Contrast Food Pillars -->
    <div class="food-grid">
      <div class="food-card">
        <div class="food-emoji">🍲</div>
        <div>
          <div class="food-heading">KUMAONI (PAHADI)</div>
          <div class="food-desc">Bhat ki Chudkani, Kumaoni Raita</div>
        </div>
      </div>
      <div class="food-card">
        <div class="food-emoji">🥗</div>
        <div>
          <div class="food-heading">SPECIAL VRAT THALI</div>
          <div class="food-desc">Sabudana Tikki, Kuttu Poori, Kheer</div>
        </div>
      </div>
      <div class="food-card">
        <div class="food-emoji">🥘</div>
        <div>
          <div class="food-heading">NORTH INDIAN & TANDOOR</div>
          <div class="food-desc">Rich Dal Makhani, Paneer, Naan</div>
        </div>
      </div>
      <div class="food-card">
        <div class="food-emoji">☕</div>
        <div>
          <div class="food-heading">CAFE & QUICK BITES</div>
          <div class="food-desc">Cold Coffee, Pahadi Chai, Snacks</div>
        </div>
      </div>
    </div>

    <!-- Bottom Highway Direction & Numbers -->
    <div class="bottom-anchor">
      <div class="direction-banner">
        <div class="direction-arrow">➔</div>
        <div>
          <div class="direction-main">TURN FOR SHIVALAYA RESORT</div>
          <div class="direction-sub">Mandir Gate Se Bas 2 KM Aage (Near Pine Crest School)</div>
        </div>
      </div>
      <div class="call-strip">
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
    """radial-gradient(circle at 50% 25%, #a60005 0%, #780004 55%, #420002 100%)""",
    """linear-gradient(180deg, #FFFFFF 0%, #F5FAF6 45%, #E5F0E8 100%)"""
).replace(
    """border: 8px solid #FFD700;""",
    """border: 8px solid #0F3E2C;"""
).replace(
    """outline: 3px solid rgba(255, 215, 0, 0.5);""",
    """outline: 3px solid rgba(200, 150, 62, 0.6);"""
).replace(
    """background: rgba(0, 0, 0, 0.65);
      border: 2px solid #FFD700;""",
    """background: #0F3E2C;
      border: 2px solid #C8963E;"""
).replace(
    """color: #FFD700;
      text-transform: uppercase;""",
    """color: #FFFFFF;
      text-transform: uppercase;"""
).replace(
    """background: #FFD700;
      color: #630000;""",
    """background: #C8963E;
      color: #FFFFFF;"""
).replace(
    """color: #FFE6A3;""",
    """color: #0F3E2C;"""
).replace(
    """color: #FFFFFF;
      line-height: 1.1;
      letter-spacing: 1px;
      text-transform: uppercase;
      text-shadow: 0 4px 18px rgba(0,0,0,0.9);""",
    """color: #0F3E2C;
      line-height: 1.1;
      letter-spacing: 1px;
      text-transform: uppercase;
      text-shadow: none;"""
).replace(
    """background: #FFE600;
      border-radius: 14px;
      padding: 10px 18px;
      margin: 8px 0;
      box-shadow: 0 6px 20px rgba(0,0,0,0.6);""",
    """background: #0F3E2C;
      border-radius: 14px;
      padding: 10px 18px;
      margin: 8px 0;
      box-shadow: 0 6px 20px rgba(15,62,44,0.3);"""
).replace(
    """color: #7A0000;""",
    """color: #FFD700;"""
).replace(
    """color: #000000;
      line-height: 1.2;
      text-transform: uppercase;""",
    """color: #FFFFFF;
      line-height: 1.2;
      text-transform: uppercase;"""
).replace(
    """background: rgba(0, 0, 0, 0.65);
      border: 2px solid #FFD700;
      border-radius: 30px;
      padding: 8px 18px;
      font-size: 17px;
      font-weight: 800;
      color: #FFF3BD;""",
    """background: #FFFFFF;
      border: 2.5px solid #0F3E2C;
      border-radius: 30px;
      padding: 8px 18px;
      font-size: 17px;
      font-weight: 800;
      color: #0F3E2C;"""
).replace(
    """background: rgba(0, 0, 0, 0.45);
      border: 3px solid rgba(255, 215, 0, 0.85);""",
    """background: #FFFFFF;
      border: 3px solid #0F3E2C;"""
).replace(
    """color: #FFDF00;
      text-shadow: 0 4px 15px rgba(0,0,0,0.8);""",
    """color: #0F3E2C;
      text-shadow: none;"""
).replace(
    """color: #FFFFFF;
      text-transform: uppercase;
      margin-top: 2px;""",
    """color: #555555;
      text-transform: uppercase;
      margin-top: 2px;"""
).replace(
    """color: #FFD700;
      text-transform: uppercase;
      display: flex;""",
    """color: #C8963E;
      text-transform: uppercase;
      display: flex;"""
).replace(
    """color: #FFFFFF;
      text-shadow: 0 4px 12px rgba(0,0,0,0.8);""",
    """color: #0F3E2C;
      text-shadow: none;"""
).replace(
    """color: #FFD700;
      letter-spacing: 1.5px;""",
    """color: #B45309;
      letter-spacing: 1.5px;"""
).replace(
    """background: rgba(0, 0, 0, 0.75);
      border: 2.5px solid #FFD700;""",
    """background: #FFFFFF;
      border: 2.5px solid #0F3E2C;"""
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
      border-radius: 18px;
      padding: 14px 20px;
      color: #5B0000;""",
    """background: #0F3E2C;
      border-radius: 18px;
      padding: 14px 20px;
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
        btn.innerText = '👀 Normal View';
        btn.style.background = '#e53e3e';
      } else {
        btn.innerText = '🚗 Test 50m Distance Blur';
        btn.style.background = '#3182ce';
      }
    }
  </script>
</head>
<body>
  <div class="header">
    <div class="title">
      <h1>Shivalaya Resort & Panache Restaurant — Highway Kiosk Studio</h1>
      <p>Standard 2ft × 3ft (24" × 36") Roadside Billboard • High-Voltage 50-Meter Contrast</p>
    </div>
    <div class="actions">
      <button id="distBtn" class="btn btn-action" onclick="toggle50m()">🚗 Test 50m Distance Blur</button>
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
print(">>> ALL FILES SUCCESSFULLY UPDATED DIRECTLY IN posters/! <<<")
