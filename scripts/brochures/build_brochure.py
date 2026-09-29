import os, subprocess
from pathlib import Path

def get_workspace_root():
    p = Path(__file__).resolve().parent
    while p != p.parent:
        if (p / 'package.json').exists():
            return p
        p = p.parent
    return Path.cwd()

WORKSPACE = get_workspace_root()
os.chdir(WORKSPACE)
BROCHURES_DIR = WORKSPACE / "marketing" / "brochures"
BROCHURES_DIR.mkdir(parents=True, exist_ok=True)

part1 = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Shivalaya Resort — Pre-Wedding Shoot Packages</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Montserrat:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --emerald: #0A3423;
      --emerald-dark: #062217;
      --gold: #C8963E;
      --gold-light: #E5C384;
      --gold-bright: #FFD700;
      --cream: #FAF8F5;
      --warm-white: #FFFFFF;
      --charcoal: #222222;
      --slate: #4A5568;
    }
    body {
      background: #121519;
      color: var(--charcoal);
      font-family: 'Montserrat', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px 0;
      line-height: 1.5;
    }
    .web-controls {
      position: fixed;
      top: 20px;
      right: 25px;
      z-index: 1000;
      display: flex;
      gap: 12px;
      background: rgba(10, 52, 35, 0.9);
      backdrop-filter: blur(10px);
      padding: 10px 18px;
      border-radius: 40px;
      border: 1px solid var(--gold);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .web-btn {
      background: var(--gold);
      color: var(--emerald-dark);
      border: none;
      padding: 8px 18px;
      border-radius: 20px;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .web-btn:hover { background: #FFE680; transform: translateY(-2px); }
    .web-btn-outline { background: transparent; color: #fff; border: 1px solid var(--gold); }
    .web-btn-outline:hover { background: rgba(200, 150, 62, 0.2); }
    .page {
      width: 210mm;
      height: 297mm;
      position: relative;
      background: var(--cream);
      box-shadow: 0 15px 40px rgba(0,0,0,0.5);
      margin-bottom: 30px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      page-break-after: always;
      break-after: page;
    }
"""
part2 = """
    .cover-page {
      background: linear-gradient(180deg, rgba(6,34,23,0.88) 0%, rgba(10,52,35,0.72) 45%, rgba(6,34,23,0.96) 100%),
                  url('prewedding_assets/shoots_1_1.jpg') center/cover no-repeat;
      color: #fff;
      justify-content: space-between;
      padding: 55px 50px 45px 50px;
      border: 12px solid var(--emerald-dark);
      outline: 2px solid var(--gold);
      outline-offset: -8px;
    }
    .cover-top { text-align: center; }
    .cover-badge {
      width: 100px;
      height: 100px;
      margin: 0 auto 12px auto;
      border-radius: 50%;
      border: 2px solid var(--gold);
      padding: 4px;
      background: rgba(0,0,0,0.4);
    }
    .cover-badge img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
    .resort-name {
      font-family: 'Cinzel', serif;
      font-size: 34px;
      font-weight: 900;
      letter-spacing: 4px;
      color: var(--gold-light);
      text-shadow: 0 3px 15px rgba(0,0,0,0.8);
    }
    .resort-loc {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 3px;
      color: #E2ECE6;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .cover-middle {
      text-align: center;
      background: rgba(6, 34, 23, 0.75);
      border: 2px solid var(--gold);
      border-radius: 16px;
      padding: 30px 24px;
      backdrop-filter: blur(8px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .cover-tag {
      display: inline-block;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 3px;
      color: var(--gold-bright);
      text-transform: uppercase;
      border-bottom: 2px solid var(--gold);
      padding-bottom: 6px;
      margin-bottom: 14px;
    }
    .cover-title {
      font-family: 'Cinzel', serif;
      font-size: 40px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #FFFFFF;
      line-height: 1.15;
      text-shadow: 0 4px 20px rgba(0,0,0,0.8);
    }
    .cover-sub {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 21px;
      color: var(--gold-light);
      margin-top: 12px;
    }
    .cover-pills {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 20px;
      flex-wrap: wrap;
    }
    .pill {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid var(--gold-light);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #fff;
    }
    .cover-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(200, 150, 62, 0.4);
      padding-top: 16px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1px;
      color: var(--gold-light);
    }
    .inner-page {
      padding: 40px 45px 35px 45px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 2px solid var(--gold);
      padding-bottom: 12px;
      margin-bottom: 22px;
    }
    .page-header-left h3 {
      font-family: 'Cinzel', serif;
      font-size: 26px;
      font-weight: 900;
      color: var(--emerald);
      letter-spacing: 1px;
    }
    .page-header-left p {
      font-size: 12px;
      font-weight: 600;
      color: var(--gold);
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 2px;
    }
    .page-header-right {
      font-family: 'Cinzel', serif;
      font-size: 13px;
      font-weight: 800;
      color: var(--emerald);
      letter-spacing: 2px;
    }
"""
part3 = """
    .about-story {
      background: var(--warm-white);
      border-left: 4px solid var(--gold);
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.04);
    }
    .about-story p { font-size: 13.5px; color: #333; line-height: 1.6; }
    .highlight-quote {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 15px;
      color: var(--emerald);
      font-weight: 600;
      margin-top: 8px;
      display: block;
    }
    .gallery-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .venue-card {
      background: var(--warm-white);
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 6px 18px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
    }
    .venue-img-wrap { width: 100%; height: 140px; overflow: hidden; position: relative; }
    .venue-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .venue-card-body { padding: 12px 14px; }
    .venue-tag { font-size: 10px; font-weight: 800; color: var(--gold); letter-spacing: 1.5px; text-transform: uppercase; }
    .venue-title { font-family: 'Cinzel', serif; font-size: 15px; font-weight: 800; color: var(--emerald); margin: 2px 0 4px 0; }
    .venue-desc { font-size: 11.5px; color: var(--slate); line-height: 1.4; }
    .perks-strip {
      background: var(--emerald);
      color: #fff;
      border-radius: 12px;
      padding: 14px 20px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      text-align: center;
    }
    .perk-item h4 { font-size: 13px; font-weight: 800; color: var(--gold-bright); margin-bottom: 2px; }
    .perk-item p { font-size: 11px; color: #D6EADF; }
    .packages-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    .package-card {
      background: var(--warm-white);
      border-radius: 16px;
      border: 2px solid #E2ECE6;
      padding: 22px 20px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }
    .package-card.featured {
      border: 2px solid var(--gold);
      background: #FFFFFF;
      box-shadow: 0 10px 30px rgba(200, 150, 62, 0.15);
    }
    .card-ribbon {
      position: absolute;
      top: -12px;
      right: 20px;
      background: var(--gold);
      color: var(--emerald-dark);
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 1.5px;
      padding: 4px 12px;
      border-radius: 20px;
      text-transform: uppercase;
    }
    .pkg-header { border-bottom: 1px solid #EDF2F7; padding-bottom: 14px; margin-bottom: 14px; }
    .pkg-type { font-size: 11px; font-weight: 800; letter-spacing: 2px; color: var(--gold); text-transform: uppercase; }
    .pkg-title { font-family: 'Cinzel', serif; font-size: 24px; font-weight: 900; color: var(--emerald); margin-top: 2px; }
    .pkg-price { margin-top: 8px; display: flex; align-items: baseline; gap: 6px; }
    .pkg-amount { font-size: 28px; font-weight: 900; color: var(--emerald); }
    .pkg-note { font-size: 11px; color: var(--slate); font-weight: 600; }
    .item-list { list-style: none; display: flex; flex-direction: column; gap: 9px; }
    .item-row { display: flex; justify-content: space-between; align-items: flex-start; font-size: 12px; }
    .item-name { font-weight: 700; color: #2D3748; display: flex; align-items: center; gap: 6px; }
    .item-name::before { content: "•"; color: var(--gold); font-size: 16px; font-weight: 900; }
    .item-price { font-weight: 800; color: var(--emerald); white-space: nowrap; }
    .item-sub { font-size: 10.5px; color: #718096; margin-left: 14px; display: block; }
    .addons-box { background: var(--warm-white); border: 1px dashed var(--gold); border-radius: 12px; padding: 14px 18px; }
    .addons-box h4 { font-family: 'Cinzel', serif; font-size: 14px; font-weight: 800; color: var(--emerald); margin-bottom: 8px; letter-spacing: 1px; }
    .addons-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .addon-item { font-size: 11.5px; color: #333; }
    .addon-item strong { color: var(--emerald); display: block; }
    .timeline-container { background: var(--warm-white); border-radius: 14px; border: 1px solid #E2E8F0; padding: 16px 20px; margin-bottom: 18px; box-shadow: 0 4px 15px rgba(0,0,0,0.04); }
    .timeline-container h4 { font-family: 'Cinzel', serif; font-size: 15px; font-weight: 800; color: var(--emerald); margin-bottom: 12px; letter-spacing: 1px; }
    .timeline-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; }
    .timeline-slot { display: flex; gap: 10px; align-items: flex-start; font-size: 11.5px; }
    .time-badge { background: rgba(10, 52, 35, 0.08); color: var(--emerald); font-weight: 800; padding: 2px 8px; border-radius: 4px; white-space: nowrap; font-size: 10.5px; }
    .slot-desc strong { color: #2D3748; display: block; }
    .slot-desc span { color: #718096; font-size: 10.5px; }
    .booking-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 18px; margin-bottom: 16px; }
    .booking-card { background: var(--warm-white); border-radius: 14px; border: 1px solid #E2E8F0; padding: 16px 20px; }
    .booking-card h4 { font-family: 'Cinzel', serif; font-size: 14px; font-weight: 800; color: var(--emerald); margin-bottom: 10px; letter-spacing: 1px; }
    .steps-list { list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 11.5px; }
    .step-item { display: flex; gap: 8px; color: #333; }
    .step-num { width: 18px; height: 18px; background: var(--gold); color: #fff; font-size: 10px; font-weight: 900; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .policy-text { font-size: 11px; color: var(--slate); line-height: 1.5; }
    .policy-item { margin-bottom: 4px; }
    .policy-item strong { color: var(--emerald); }
    .contact-banner {
      background: linear-gradient(135deg, var(--emerald) 0%, var(--emerald-dark) 100%);
      color: #fff;
      border-radius: 16px;
      border: 2px solid var(--gold);
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    }
    .contact-left h3 { font-family: 'Cinzel', serif; font-size: 20px; font-weight: 900; color: var(--gold-bright); letter-spacing: 1px; }
    .contact-left p { font-size: 12px; color: #E2ECE6; margin-top: 3px; }
    .contact-numbers { font-size: 22px; font-weight: 900; color: #fff; letter-spacing: 1px; margin-top: 4px; }
    .contact-right { text-align: right; font-size: 11.5px; color: var(--gold-light); }
    .contact-right a { color: #fff; text-decoration: none; font-weight: 700; }
    .page-footer {
      border-top: 1px solid #E2E8F0;
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5px;
      color: #718096;
      font-weight: 600;
    }
    .page-footer strong { color: var(--emerald); }
    @media print {
      body { background: transparent; padding: 0; }
      .web-controls { display: none !important; }
      .page { margin: 0 !important; box-shadow: none !important; width: 210mm !important; height: 297mm !important; page-break-after: always !important; break-after: page !important; }
      @page { size: A4 portrait; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="web-controls">
    <button class="web-btn" onclick="window.print()">🖨️ Print / Save PDF</button>
    <a href="Shivalaya_Resort_PreWedding_Packages.pdf" download class="web-btn web-btn-outline">📥 Download PDF File</a>
  </div>
"""
part4 = """
  <!-- PAGE 1: COVER -->
  <div class="page cover-page">
    <div class="cover-top">
      <div class="cover-badge">
        <img src="shivalaya_badge_perfect.png" alt="Shivalaya Emblem">
      </div>
      <div class="resort-name">SHIVALAYA RESORT</div>
      <div class="resort-loc">BHIMTAL • NEAR NAINITAL • UTTARAKHAND</div>
    </div>

    <div class="cover-middle">
      <span class="cover-tag">DESTINATION PRE-WEDDING EXPERIENCES</span>
      <h1 class="cover-title">PRE-WEDDING SHOOT<br>PACKAGES</h1>
      <p class="cover-sub">One day. Unlimited frames. A Himalayan love story to keep forever.</p>
      
      <div class="cover-pills">
        <span class="pill">Himalayan Valley Panoramas</span>
        <span class="pill">Decorated Golf Cart</span>
        <span class="pill">Romantic Bonfire & Candlelight</span>
        <span class="pill">Luxury Suite Stays</span>
      </div>
    </div>

    <div class="cover-bottom">
      <div>📍 Ghorakhal - Bhimtal Road (13 KM from Kainchi Dham)</div>
      <div>📞 +91 76680 09400</div>
      <div>🌐 www.shivalayaresort.com</div>
    </div>
  </div>

  <!-- PAGE 2: VENUES & STORY -->
  <div class="page inner-page">
    <div>
      <div class="page-header">
        <div class="page-header-left">
          <h3>The Canvas of Your Dreams</h3>
          <p>Where Himalayan Nature Meets Timeless Architecture</p>
        </div>
        <div class="page-header-right">PAGE 02</div>
      </div>

      <div class="about-story">
        <p>
          Nestled at high altitude in the tranquil hills of Bhimtal, just 13 km from the sacred Kainchi Dham, <strong>Shivalaya Resort</strong> provides the quintessential mountain retreat for pre-wedding photography. You do not need to be an existing hotel resident to book your shoot — we warmly welcome couples traveling from Delhi NCR, across India, and worldwide who dream of capturing their love story against majestic Himalayan peaks.
        </p>
        <span class="highlight-quote">"From golden morning rays over pine ridges to starry starlight evenings by the fire — every corner is a cinematic frame."</span>
      </div>

      <div class="gallery-grid">
        <div class="venue-card">
          <div class="venue-img-wrap">
            <img src="prewedding_assets/resort_villa_terrace.jpg" alt="Panoramic Valley Terrace">
          </div>
          <div class="venue-card-body">
            <span class="venue-tag">LOCATION 01</span>
            <div class="venue-title">Panoramic Valley Terrace</div>
            <div class="venue-desc">Breathtaking 360° mountain horizons, ideal for sunrise silhouettes and sweeping flowy dress portraits.</div>
          </div>
        </div>

        <div class="venue-card">
          <div class="venue-img-wrap">
            <img src="prewedding_assets/resort_shiva_mural.jpg" alt="Sacred Shiva Mural Courtyard">
          </div>
          <div class="venue-card-body">
            <span class="venue-tag">LOCATION 02</span>
            <div class="venue-title">Sacred Shiva Courtyard</div>
            <div class="venue-desc">A magnificent hand-sculpted Lord Shiva stone mural offering a regal, spiritual, and artistic pre-wedding backdrop.</div>
          </div>
        </div>

        <div class="venue-card">
          <div class="venue-img-wrap">
            <img src="prewedding_assets/resort_cottage_steps.jpg" alt="Rustic Cottage & Steps">
          </div>
          <div class="venue-card-body">
            <span class="venue-tag">LOCATION 03</span>
            <div class="venue-title">Heritage Stone Cottages</div>
            <div class="venue-desc">Artisanal wooden gables, red trim rooflines, flowering hedge steps, and intimate mountain architecture.</div>
          </div>
        </div>

        <div class="venue-card">
          <div class="venue-img-wrap">
            <img src="prewedding_assets/shoots_2_2.jpg" alt="Sunset & Romance">
          </div>
          <div class="venue-card-body">
            <span class="venue-tag">LOCATION 04</span>
            <div class="venue-title">Golden Hour Garden Lawn</div>
            <div class="venue-desc">Manicured open lawn for romantic strolls, sunset veil shots, golf cart entry, and cozy evening bonfire frames.</div>
          </div>
        </div>
      </div>

      <div class="perks-strip">
        <div class="perk-item">
          <h4>Open to All Couples</h4>
          <p>No prior hotel stay required to book our shoot packages</p>
        </div>
        <div class="perk-item">
          <h4>Dedicated Resort Crew</h4>
          <p>Staff assistance for lighting, setups, and smooth transitions</p>
        </div>
        <div class="perk-item">
          <h4>Crew & Dressing Stays</h4>
          <p>Full suite room for couple + dedicated room for photography team</p>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>Shivalaya Resort, Bhimtal — Pre-Wedding Shoot Guide</div>
      <div><strong>www.shivalayaresort.com</strong></div>
      <div>+91 76680 09400</div>
    </div>
  </div>
"""
part5 = """
  <!-- PAGE 3: CURATED PACKAGES -->
  <div class="page inner-page">
    <div>
      <div class="page-header">
        <div class="page-header-left">
          <h3>Curated Shoot Packages</h3>
          <p>Tailored Options for Every Couple's Vision</p>
        </div>
        <div class="page-header-right">PAGE 03</div>
      </div>

      <div class="packages-container">
        <!-- STANDARD PACKAGE -->
        <div class="package-card">
          <div>
            <div class="pkg-header">
              <span class="pkg-type">CLASSIC EXPERIENCE</span>
              <div class="pkg-title">Standard Package</div>
              <div class="pkg-price">
                <span class="pkg-amount">₹ 19,000</span>
                <span class="pkg-note">All-Inclusive (or ₹5,000 Venue Only)</span>
              </div>
            </div>

            <ul class="item-list">
              <li>
                <div class="item-row">
                  <span class="item-name">Resort Venue Access (6 Hours)</span>
                  <span class="item-price">₹ 5,000</span>
                </div>
                <span class="item-sub">Access to all gardens, terraces, lawns & courtyards</span>
              </li>
              <li>
                <div class="item-row">
                  <span class="item-name">Decorated Golf Cart Setup</span>
                  <span class="item-price">₹ 3,000</span>
                </div>
                <span class="item-sub">Floral decorated cart on-property for entry & reels</span>
              </li>
              <li>
                <div class="item-row">
                  <span class="item-name">Candlelight Dinner Setup</span>
                  <span class="item-price">₹ 1,500</span>
                </div>
                <span class="item-sub">Romantic candlelight table setup for couple shoot</span>
              </li>
              <li>
                <div class="item-row">
                  <span class="item-name">Evening Mountain Bonfire</span>
                  <span class="item-price">₹ 1,500</span>
                </div>
                <span class="item-sub">Cozy bonfire setup for twilight & night frames</span>
              </li>
              <li>
                <div class="item-row">
                  <span class="item-name">1 Luxury Suite Room (1 Night)</span>
                  <span class="item-price">₹ 6,000</span>
                </div>
                <span class="item-sub">Accommodates couple & family (up to 4 guests)</span>
              </li>
              <li>
                <div class="item-row">
                  <span class="item-name">Photography Crew Room (1 Night)</span>
                  <span class="item-price">₹ 2,000</span>
                </div>
                <span class="item-sub">Dedicated room for cameramen & team (2 people)</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- PREMIUM PACKAGE -->
        <div class="package-card featured">
          <span class="card-ribbon">MOST POPULAR</span>
          <div>
            <div class="pkg-header">
              <span class="pkg-type">LUXURY FULL EXPERIENCE</span>
              <div class="pkg-title">Premium Package</div>
              <div class="pkg-price">
                <span class="pkg-amount">₹ 26,000</span>
                <span class="pkg-note">All-Inclusive (or ₹10,000 Venue + Decor)</span>
              </div>
            </div>

            <ul class="item-list">
              <li>
                <div class="item-row">
                  <span class="item-name">Venue Access (9 Hours) + Decor</span>
                  <span class="item-price">₹ 10,000</span>
                </div>
                <span class="item-sub">Full 9-hour slot with custom theme decor by resort staff</span>
              </li>
              <li>
                <div class="item-row">
                  <span class="item-name">Decorated Cart + Scenic Village Tour</span>
                  <span class="item-price">₹ 5,000</span>
                </div>
                <span class="item-sub">Decorated cart + guided scenic valley viewpoints tour</span>
              </li>
              <li>
                <div class="item-row">
                  <span class="item-name">Full Candlelight Dinner Setup</span>
                  <span class="item-price">₹ 1,500</span>
                </div>
                <span class="item-sub">Complete romantic styling for dinner shoot</span>
              </li>
              <li>
                <div class="item-row">
                  <span class="item-name">Premium Bonfire Experience</span>
                  <span class="item-price">₹ 1,500</span>
                </div>
                <span class="item-sub">Flickering bonfire setup with ambient seating</span>
              </li>
              <li>
                <div class="item-row">
                  <span class="item-name">1 Luxury Suite Room (1 Night)</span>
                  <span class="item-price">₹ 6,000</span>
                </div>
                <span class="item-sub">Accommodates couple & family (up to 4 guests)</span>
              </li>
              <li>
                <div class="item-row">
                  <span class="item-name">Photography Crew Room (1 Night)</span>
                  <span class="item-price">₹ 2,000</span>
                </div>
                <span class="item-sub">Dedicated room for cameramen & team (2 people)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- A LA CARTE ADD-ONS -->
      <div class="addons-box">
        <h4>Bespoke Add-On Experiences</h4>
        <div class="addons-grid">
          <div class="addon-item">
            <strong>Curated Wine Toast Setup</strong>
            Fine wine bottle & crystal glassware styling for toast portraits.
          </div>
          <div class="addon-item">
            <strong>Live Acoustic Guitarist</strong>
            Live acoustic guitarist to set candid, musical vibes for reels & videos.
          </div>
          <div class="addon-item">
            <strong>Panache Fine Dining</strong>
            Gourmet multi-cuisine dining & Kumaoni feasts for couple and crew.
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>Transparent Pricing • All Setups Handled by In-House Team</div>
      <div><strong>Shivalaya Resort Pre-Wedding</strong></div>
      <div>Packages 2026-2027</div>
    </div>
  </div>

  <!-- PAGE 4: ITINERARY & RESERVATIONS -->
  <div class="page inner-page">
    <div>
      <div class="page-header">
        <div class="page-header-left">
          <h3>Sample Flow & Reservations</h3>
          <p>Seamless Execution for Your Special Day</p>
        </div>
        <div class="page-header-right">PAGE 04</div>
      </div>

      <div class="timeline-container">
        <h4>Recommended Shoot Day Flow (Tailored with Your Photographer)</h4>
        <div class="timeline-grid">
          <div class="timeline-slot">
            <span class="time-badge">06:00 - 08:00 AM</span>
            <div class="slot-desc">
              <strong>Sunrise Horizon Shoot</strong>
              <span>Terrace panoramas, misty mountain silhouettes & morning light</span>
            </div>
          </div>
          <div class="timeline-slot">
            <span class="time-badge">08:00 - 09:30 AM</span>
            <div class="slot-desc">
              <strong>Breakfast & Wardrobe Change</strong>
              <span>Refresh at Suite room & breakfast at Panache Restaurant</span>
            </div>
          </div>
          <div class="timeline-slot">
            <span class="time-badge">09:30 - 01:00 PM</span>
            <div class="slot-desc">
              <strong>Architecture & Cultural Frames</strong>
              <span>Shiva mural courtyard, cottage wooden balconies & stone steps</span>
            </div>
          </div>
          <div class="timeline-slot">
            <span class="time-badge">01:00 - 02:30 PM</span>
            <div class="slot-desc">
              <strong>Lunch & Couple Relaxation</strong>
              <span>Mid-day rest, makeup touch-up, and lunch spread</span>
            </div>
          </div>
          <div class="timeline-slot">
            <span class="time-badge">02:30 - 04:30 PM</span>
            <div class="slot-desc">
              <strong>Decorated Golf Cart & Village Tour</strong>
              <span>Scenic village viewpoints, flower roads & playful couple reels</span>
            </div>
          </div>
          <div class="timeline-slot">
            <span class="time-badge">04:30 - 06:30 PM</span>
            <div class="slot-desc">
              <strong>Golden Hour & Bonfire Warmth</strong>
              <span>Sun-drenched valley portraits, glowing bonfire & fairy lights</span>
            </div>
          </div>
          <div class="timeline-slot">
            <span class="time-badge">06:30 - 08:30 PM</span>
            <div class="slot-desc">
              <strong>Candlelight Dinner & Toast</strong>
              <span>Romantic dinner setup, wine glass portraits & night stars</span>
            </div>
          </div>
          <div class="timeline-slot">
            <span class="time-badge">08:30 PM ONWARDS</span>
            <div class="slot-desc">
              <strong>Dinner & Overnight Rest</strong>
              <span>Cozy stay in luxury suite with family and photography team</span>
            </div>
          </div>
        </div>
      </div>

      <div class="booking-grid">
        <div class="booking-card">
          <h4>How to Reserve Your Date</h4>
          <ul class="steps-list">
            <li class="step-item">
              <span class="step-num">1</span>
              <div><strong>Share Brochure:</strong> Discuss package & shot-list with your photographer.</div>
            </li>
            <li class="step-item">
              <span class="step-num">2</span>
              <div><strong>Confirm Dates:</strong> Call our team to verify date and suite room availability.</div>
            </li>
            <li class="step-item">
              <span class="step-num">3</span>
              <div><strong>50% Advance:</strong> Pay advance to officially block the date and resort staff.</div>
            </li>
            <li class="step-item">
              <span class="step-num">4</span>
              <div><strong>Check-in & Shoot:</strong> Arrive at Shivalaya Resort; remaining balance upon arrival.</div>
            </li>
          </ul>
        </div>

        <div class="booking-card">
          <h4>Cancellation & Rescheduling</h4>
          <div class="policy-text">
            <div class="policy-item">
              <strong>100% Free Cancellation:</strong>
              Up to 15 days prior to shoot date.
            </div>
            <div class="policy-item">
              <strong>50% Refund:</strong>
              Between 7 to 15 days prior to shoot.
            </div>
            <div class="policy-item">
              <strong>Weather Rescheduling:</strong>
              Complimentary date rescheduling in case of severe mountain rain/fog.
            </div>
          </div>
        </div>
      </div>

      <div class="contact-banner">
        <div class="contact-left">
          <h3>Reserve Your Shoot Dates</h3>
          <p>Direct Pre-Wedding Shoot Coordinator & Resort Concierge</p>
          <div class="contact-numbers">📞 +91 76680 09400</div>
        </div>
        <div class="contact-right">
          <p>🌐 <a href="https://www.shivalayaresort.com" target="_blank">www.shivalayaresort.com</a></p>
          <p>📸 Instagram: <strong>@shivalayaresort</strong></p>
          <p>📍 Bhimtal - Ghorakhal Road, Uttarakhand</p>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>Shivalaya Resort — Where Every Frame Tells Your Love Story</div>
      <div><strong>www.shivalayaresort.com</strong></div>
      <div>Direct Line: +91 76680 09400</div>
    </div>
  </div>

</body>
</html>
"""

# Combine and write HTML
full_html = part1 + part2 + part3 + part4 + part5
out_file = BROCHURES_DIR / "prewedding_brochure.html"
with open(out_file, "w", encoding="utf-8") as f:
    f.write(full_html)
print(f"[OK] Saved {out_file}")

# Compile to PDF using Microsoft Edge
edge_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not os.path.exists(edge_exe):
    edge_exe = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"

pdf_target = str(BROCHURES_DIR / "Shivalaya_Resort_PreWedding_Packages.pdf")
html_url = "file:///" + str(out_file).replace("\\", "/")

cmd = [
    edge_exe,
    "--headless",
    "--no-sandbox",
    "--disable-gpu",
    "--print-to-pdf-no-header",
    f"--print-to-pdf={pdf_target}",
    html_url
]

print("Rendering high-res PDF with Microsoft Edge...")
res = subprocess.run(cmd, capture_output=True, text=True)
if os.path.exists(pdf_target) and os.path.getsize(pdf_target) > 50000:
    print(f"[OK] Generated PDF: {pdf_target} ({os.path.getsize(pdf_target)} bytes)")
else:
    print("Edge note:", res.stdout, res.stderr)

print(">>> PRE-WEDDING BROCHURE GENERATION COMPLETE! <<<")
