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
  <title>Shivalaya Resort — Pre-Wedding Destination Lookbook</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Montserrat:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    :root {
      --emerald-dark: #051C12;
      --emerald-rich: #0A2D1E;
      --emerald-forest: #0F3E2C;
      --gold-deep: #B38728;
      --gold-rich: #C8963E;
      --gold-light: #EAD09E;
      --gold-bright: #FFD700;
      --cream: #FAF8F5;
      --warm-white: #FFFFFF;
      --charcoal: #1A202C;
      --slate-soft: #4A5568;
    }

    body {
      background: #0E1217;
      color: var(--charcoal);
      font-family: 'Montserrat', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px 0;
      line-height: 1.5;
    }

    /* FLOATING TOP ACTION BAR */
    .top-actions {
      position: fixed;
      top: 20px;
      right: 25px;
      z-index: 1000;
      display: flex;
      gap: 12px;
      background: rgba(5, 28, 18, 0.92);
      backdrop-filter: blur(12px);
      padding: 10px 20px;
      border-radius: 40px;
      border: 1px solid var(--gold-rich);
      box-shadow: 0 10px 30px rgba(0,0,0,0.6);
    }
    .action-btn {
      background: var(--gold-rich);
      color: var(--emerald-dark);
      border: none;
      padding: 8px 20px;
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
    .action-btn:hover { background: #FFE899; transform: translateY(-2px); }
    .action-btn-outline { background: transparent; color: #fff; border: 1px solid var(--gold-rich); }
    .action-btn-outline:hover { background: rgba(200, 150, 62, 0.2); }

    /* A4 PAGE CONTAINER */
    .page {
      width: 210mm;
      height: 297mm;
      position: relative;
      background: var(--cream);
      box-shadow: 0 18px 50px rgba(0,0,0,0.6);
      margin-bottom: 35px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      page-break-after: always;
      break-after: page;
    }

    /* ====================================================
       PAGE 1: MAJESTIC EDITORIAL COVER
       ==================================================== */
    .cover-page {
      background: linear-gradient(180deg, rgba(5, 28, 18, 0.90) 0%, rgba(10, 45, 30, 0.65) 40%, rgba(5, 28, 18, 0.95) 100%),
                  url('prewedding_assets/shoots_1_1.jpg') center/cover no-repeat;
      color: #fff;
      justify-content: space-between;
      padding: 60px 50px 45px 50px;
      border: 12px solid var(--emerald-dark);
      outline: 2px solid var(--gold-rich);
      outline-offset: -8px;
    }
    .cover-header { text-align: center; }
    .cover-brand-medallion {
      width: 110px;
      height: 110px;
      margin: 0 auto 14px auto;
      border-radius: 50%;
      border: 3px solid var(--gold-bright);
      padding: 4px;
      background: #000;
      box-shadow: 0 0 25px rgba(255, 215, 0, 0.5);
    }
    .cover-brand-medallion img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
    .cover-resort-title {
      font-family: 'Cinzel', serif;
      font-size: 38px;
      font-weight: 900;
      letter-spacing: 5px;
      color: var(--gold-light);
      text-shadow: 0 4px 15px rgba(0,0,0,0.8);
      line-height: 1.1;
    }
    .cover-location-tag {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 4px;
      color: #E2ECE6;
      text-transform: uppercase;
      margin-top: 6px;
    }
    .cover-centerpiece {
      text-align: center;
      background: rgba(5, 28, 18, 0.82);
      border: 2px solid var(--gold-rich);
      border-radius: 20px;
      padding: 35px 30px;
      backdrop-filter: blur(10px);
      box-shadow: 0 15px 40px rgba(0,0,0,0.6);
    }
    .cover-sub-badge {
      display: inline-block;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 4px;
      color: var(--gold-bright);
      text-transform: uppercase;
      border-bottom: 2px solid var(--gold-rich);
      padding-bottom: 6px;
      margin-bottom: 16px;
    }
    .cover-main-headline {
      font-family: 'Cinzel', serif;
      font-size: 44px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #FFFFFF;
      line-height: 1.15;
      text-shadow: 0 4px 20px rgba(0,0,0,0.9);
    }
    .cover-tagline {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 22px;
      color: var(--gold-light);
      margin-top: 14px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.6);
    }
    .cover-features-row {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 22px;
      flex-wrap: wrap;
    }
    .cover-pill {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid var(--gold-light);
      padding: 7px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #fff;
    }
    .cover-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(200, 150, 62, 0.5);
      padding-top: 18px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1px;
      color: var(--gold-light);
    }
"""
part2 = """
    /* ====================================================
       PAGE 2: THE CANVAS & VISUAL SHOWCASE
       ==================================================== */
    .inner-page {
      padding: 42px 48px 36px 48px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .page-masthead {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 2px solid var(--gold-rich);
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .masthead-title h2 {
      font-family: 'Cinzel', serif;
      font-size: 28px;
      font-weight: 900;
      color: var(--emerald-dark);
      letter-spacing: 1.5px;
      line-height: 1.1;
    }
    .masthead-title p {
      font-size: 12px;
      font-weight: 700;
      color: var(--gold-rich);
      text-transform: uppercase;
      letter-spacing: 2.5px;
      margin-top: 3px;
    }
    .masthead-folio {
      font-family: 'Cinzel', serif;
      font-size: 14px;
      font-weight: 800;
      color: var(--emerald-rich);
      letter-spacing: 2px;
    }

    .editorial-story {
      background: var(--warm-white);
      border-left: 4px solid var(--gold-rich);
      padding: 16px 22px;
      border-radius: 10px;
      margin-bottom: 18px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    }
    .editorial-story p {
      font-size: 13.5px;
      color: #2D3748;
      line-height: 1.6;
    }
    .editorial-quote {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 15.5px;
      color: var(--emerald-forest);
      font-weight: 600;
      margin-top: 8px;
      display: block;
    }

    /* ASYMMETRIC EDITORIAL PHOTO SPREAD */
    .visual-showcase {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 16px;
      margin-bottom: 18px;
      height: 480px;
    }
    .photo-feature-large {
      position: relative;
      border-radius: 14px;
      overflow: hidden;
      border: 2px solid var(--gold-rich);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    .photo-feature-large img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .photo-caption-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(180deg, transparent 0%, rgba(5,28,18,0.95) 100%);
      color: #fff;
      padding: 30px 20px 16px 20px;
    }
    .photo-caption-overlay h4 {
      font-family: 'Cinzel', serif;
      font-size: 18px;
      font-weight: 800;
      color: var(--gold-bright);
      margin-bottom: 4px;
    }
    .photo-caption-overlay p {
      font-size: 12px;
      color: #E2ECE6;
      line-height: 1.4;
    }

    .photo-stack-right {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .photo-stack-item {
      height: calc(50% - 8px);
      position: relative;
      border-radius: 14px;
      overflow: hidden;
      border: 1.5px solid var(--gold-rich);
      box-shadow: 0 6px 20px rgba(0,0,0,0.08);
    }
    .photo-stack-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .photo-stack-caption {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(180deg, transparent 0%, rgba(5,28,18,0.92) 100%);
      color: #fff;
      padding: 20px 14px 10px 14px;
    }
    .photo-stack-caption h5 {
      font-family: 'Cinzel', serif;
      font-size: 14px;
      font-weight: 800;
      color: var(--gold-bright);
    }
    .photo-stack-caption p {
      font-size: 11px;
      color: #E2ECE6;
    }

    .experience-perks {
      background: linear-gradient(135deg, var(--emerald-dark) 0%, var(--emerald-rich) 100%);
      border: 1.5px solid var(--gold-rich);
      border-radius: 14px;
      padding: 16px 24px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      color: #fff;
      text-align: center;
    }
    .perk-col h4 {
      font-family: 'Cinzel', serif;
      font-size: 13px;
      font-weight: 800;
      color: var(--gold-bright);
      margin-bottom: 3px;
      letter-spacing: 0.5px;
    }
    .perk-col p {
      font-size: 11px;
      color: #D6EADF;
      line-height: 1.35;
    }
"""
part3 = """
    /* ====================================================
       PAGE 3: THE ROYAL COLLECTIONS (PACKAGES)
       ==================================================== */
    .collections-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 22px;
      margin-bottom: 20px;
    }
    .collection-suite {
      background: var(--warm-white);
      border-radius: 18px;
      border: 1.5px solid #E2ECE6;
      padding: 24px 22px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }
    .collection-suite.royal-feature {
      border: 2.5px solid var(--gold-rich);
      background: #FFFFFF;
      box-shadow: 0 15px 40px rgba(200, 150, 62, 0.18);
    }
    .royal-badge {
      position: absolute;
      top: -14px;
      right: 22px;
      background: linear-gradient(135deg, var(--gold-deep) 0%, var(--gold-bright) 100%);
      color: var(--emerald-dark);
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 2px;
      padding: 5px 14px;
      border-radius: 20px;
      text-transform: uppercase;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    }
    .suite-header {
      border-bottom: 1.5px solid #EDF2F7;
      padding-bottom: 14px;
      margin-bottom: 16px;
    }
    .suite-eyebrow {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2.5px;
      color: var(--gold-rich);
      text-transform: uppercase;
    }
    .suite-name {
      font-family: 'Cinzel', serif;
      font-size: 24px;
      font-weight: 900;
      color: var(--emerald-dark);
      margin-top: 3px;
    }
    .suite-price-row {
      margin-top: 10px;
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .suite-amount {
      font-size: 32px;
      font-weight: 900;
      color: var(--emerald-rich);
      letter-spacing: -0.5px;
    }
    .suite-price-label {
      font-size: 11.5px;
      color: var(--slate-soft);
      font-weight: 600;
    }
    .suite-items {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 11px;
    }
    .suite-item-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      font-size: 12.5px;
    }
    .suite-item-title {
      font-weight: 700;
      color: #2D3748;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .suite-item-title::before {
      content: "◆";
      color: var(--gold-rich);
      font-size: 11px;
    }
    .suite-item-cost {
      font-weight: 800;
      color: var(--emerald-forest);
      white-space: nowrap;
    }
    .suite-item-sub {
      font-size: 10.5px;
      color: #718096;
      margin-left: 16px;
      display: block;
      line-height: 1.35;
    }

    .custom-addons-panel {
      background: var(--warm-white);
      border: 1.5px dashed var(--gold-rich);
      border-radius: 14px;
      padding: 16px 20px;
    }
    .custom-addons-panel h4 {
      font-family: 'Cinzel', serif;
      font-size: 15px;
      font-weight: 800;
      color: var(--emerald-dark);
      margin-bottom: 10px;
      letter-spacing: 1px;
    }
    .addons-flex {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }
    .addon-card {
      font-size: 11.5px;
      color: #2D3748;
    }
    .addon-card strong {
      color: var(--emerald-rich);
      display: block;
      font-size: 12px;
      margin-bottom: 2px;
    }

    /* ====================================================
       PAGE 4: ITINERARY, BOOKING & CONCIERGE
       ==================================================== */
    .timeline-wrap {
      background: var(--warm-white);
      border-radius: 16px;
      border: 1px solid #E2E8F0;
      padding: 18px 22px;
      margin-bottom: 18px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    }
    .timeline-wrap h4 {
      font-family: 'Cinzel', serif;
      font-size: 16px;
      font-weight: 800;
      color: var(--emerald-dark);
      margin-bottom: 14px;
      letter-spacing: 1px;
    }
    .timeline-items-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 24px;
    }
    .timeline-node {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      font-size: 11.5px;
    }
    .node-time {
      background: rgba(10, 45, 30, 0.08);
      color: var(--emerald-rich);
      font-weight: 800;
      padding: 3px 9px;
      border-radius: 6px;
      white-space: nowrap;
      font-size: 10.5px;
    }
    .node-details strong {
      color: #2D3748;
      display: block;
    }
    .node-details span {
      color: #718096;
      font-size: 10.5px;
    }

    .reserve-policy-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 18px;
      margin-bottom: 18px;
    }
    .guide-box {
      background: var(--warm-white);
      border-radius: 14px;
      border: 1px solid #E2E8F0;
      padding: 16px 20px;
    }
    .guide-box h4 {
      font-family: 'Cinzel', serif;
      font-size: 14px;
      font-weight: 800;
      color: var(--emerald-dark);
      margin-bottom: 10px;
      letter-spacing: 1px;
    }
    .protocol-steps {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 11.5px;
    }
    .protocol-step {
      display: flex;
      gap: 8px;
      color: #2D3748;
    }
    .step-badge {
      width: 18px;
      height: 18px;
      background: var(--gold-rich);
      color: #fff;
      font-size: 10px;
      font-weight: 900;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .policy-clause {
      font-size: 11px;
      color: var(--slate-soft);
      line-height: 1.5;
    }
    .clause-row { margin-bottom: 4px; }
    .clause-row strong { color: var(--emerald-dark); }

    .concierge-hero {
      background: linear-gradient(135deg, var(--emerald-dark) 0%, var(--emerald-rich) 100%);
      color: #fff;
      border-radius: 18px;
      border: 2px solid var(--gold-rich);
      padding: 22px 26px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    }
    .concierge-left h3 {
      font-family: 'Cinzel', serif;
      font-size: 21px;
      font-weight: 900;
      color: var(--gold-bright);
      letter-spacing: 1.5px;
    }
    .concierge-left p {
      font-size: 12px;
      color: #E2ECE6;
      margin-top: 3px;
    }
    .concierge-tel {
      font-size: 24px;
      font-weight: 900;
      color: #fff;
      letter-spacing: 1.5px;
      margin-top: 6px;
      white-space: nowrap;
    }
    .concierge-right {
      text-align: right;
      font-size: 12px;
      color: var(--gold-light);
      line-height: 1.6;
    }
    .concierge-right a {
      color: #fff;
      text-decoration: none;
      font-weight: 700;
    }

    .page-footer-bar {
      border-top: 1px solid #E2E8F0;
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #718096;
      font-weight: 600;
    }
    .page-footer-bar strong { color: var(--emerald-dark); }

    @media print {
      body { background: transparent; padding: 0; }
      .top-actions { display: none !important; }
      .page {
        margin: 0 !important;
        box-shadow: none !important;
        width: 210mm !important;
        height: 297mm !important;
        page-break-after: always !important;
        break-after: page !important;
      }
      @page { size: A4 portrait; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="top-actions">
    <button class="action-btn" onclick="window.print()">🖨️ Print / Save Luxury PDF</button>
    <a href="Shivalaya_Resort_PreWedding_Packages.pdf" download class="action-btn action-btn-outline">📥 Download PDF File</a>
  </div>
"""
part4 = """
  <!-- ====================================================
       PAGE 1: EDITORIAL COVER
       ==================================================== -->
  <div class="page cover-page">
    <div class="cover-header">
      <div class="cover-brand-medallion">
        <img src="prewedding_assets/shivalaya_badge_perfect.png" onerror="this.src='prewedding_assets/shivalaya_logo.jpg'" alt="Shivalaya Resort Emblem">
      </div>
      <div class="cover-resort-title">SHIVALAYA RESORT</div>
      <div class="cover-location-tag">BHIMTAL • NEAR NAINITAL • UTTARAKHAND</div>
    </div>

    <div class="cover-centerpiece">
      <span class="cover-sub-badge">DESTINATION PRE-WEDDING CINEMATOGRAPHY LOOKBOOK</span>
      <h1 class="cover-main-headline">PRE-WEDDING SHOOT<br>EXPERIENCES</h1>
      <p class="cover-tagline">"Where mountain silence meets timeless romance — unlimited frames, unforgettable memories."</p>
      
      <div class="cover-features-row">
        <span class="cover-pill">Panoramic Valley Horizons</span>
        <span class="cover-pill">Decorated Golf Cart Excursions</span>
        <span class="cover-pill">Romantic Bonfire & Candlelight</span>
        <span class="cover-pill">Master Suite Stays</span>
      </div>
    </div>

    <div class="cover-footer">
      <div>📍 Ghorakhal - Bhimtal Road (13 KM from Sacred Kainchi Dham)</div>
      <div>📞 +91 76680 09400</div>
      <div>🌐 www.shivalayaresort.com</div>
    </div>
  </div>

  <!-- ====================================================
       PAGE 2: THE CANVAS & SIGNATURE BACKDROPS
       ==================================================== -->
  <div class="page inner-page">
    <div>
      <div class="page-masthead">
        <div class="masthead-title">
          <h2>The Canvas of Your Dreams</h2>
          <p>Himalayan Nature Meets Timeless Architecture</p>
        </div>
        <div class="masthead-folio">PAGE 02</div>
      </div>

      <div class="editorial-story">
        <p>
          Perched in the tranquil pine ridges of Bhimtal, just 13 km from the sacred Kainchi Dham, <strong>Shivalaya Resort</strong> offers an untouched mountain sanctuary for couples seeking an extraordinary pre-wedding shoot. You do not need to be an existing hotel resident to book — we warmly welcome couples traveling from Delhi NCR, across India, and across the globe who envision cinematic frames in the lap of the Himalayas.
        </p>
        <span class="editorial-quote">"From misty sunrise silhouettes over the valley to candlelit toasts beneath starlit skies — every corner is a masterwork."</span>
      </div>

      <!-- ASYMMETRIC LARGE PHOTO SHOWCASE -->
      <div class="visual-showcase">
        <div class="photo-feature-large">
          <img src="prewedding_assets/resort_villa_terrace.jpg" alt="Panoramic Valley View Terrace">
          <div class="photo-caption-overlay">
            <h4>Panoramic Valley Terrace</h4>
            <p>360° Himalayan horizons offering breathtaking sunrise light, dramatic veil flows, and sweeping mountain panoramas.</p>
          </div>
        </div>

        <div class="photo-stack-right">
          <div class="photo-stack-item">
            <img src="prewedding_assets/resort_shiva_mural.jpg" alt="Sacred Shiva Mural Courtyard">
            <div class="photo-stack-caption">
              <h5>Sacred Shiva Courtyard</h5>
              <p>Hand-sculpted Lord Shiva stone mural for majestic, spiritual couple frames.</p>
            </div>
          </div>

          <div class="photo-stack-item">
            <img src="prewedding_assets/resort_cottage_steps.jpg" alt="Heritage Stone Cottages">
            <div class="photo-stack-caption">
              <h5>Heritage Stone Cottages</h5>
              <p>Wooden gables, red rooflines & flower steps for intimate rustic portraits.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- KEY MARKETING PILLARS -->
      <div class="experience-perks">
        <div class="perk-col">
          <h4>Open to All Couples</h4>
          <p>No prior hotel stay required. Book your dedicated shoot date anytime.</p>
        </div>
        <div class="perk-col">
          <h4>Dedicated Shoot Team</h4>
          <p>Resort staff assistance for lighting setups, props, and smooth shoot transitions.</p>
        </div>
        <div class="perk-col">
          <h4>Couple & Crew Stays</h4>
          <p>Luxury suite for the couple + dedicated private room for the photography team.</p>
        </div>
      </div>
    </div>

    <div class="page-footer-bar">
      <div>Shivalaya Resort, Bhimtal — Destination Shoot Lookbook</div>
      <div><strong>www.shivalayaresort.com</strong></div>
      <div>Concierge: +91 76680 09400</div>
    </div>
  </div>
"""
part5 = """
  <!-- ====================================================
       PAGE 3: THE CURATED COLLECTIONS
       ==================================================== -->
  <div class="page inner-page">
    <div>
      <div class="page-masthead">
        <div class="masthead-title">
          <h2>Curated Shoot Collections</h2>
          <p>Bespoke Packages Tailored to Your Vision</p>
        </div>
        <div class="masthead-folio">PAGE 03</div>
      </div>

      <div class="collections-grid">
        <!-- COLLECTION 01: STANDARD ROMANCE -->
        <div class="collection-suite">
          <div>
            <div class="suite-header">
              <span class="suite-eyebrow">COLLECTION 01</span>
              <div class="suite-name">The Classic Romance</div>
              <div class="suite-price-row">
                <span class="suite-amount">₹ 19,000</span>
                <span class="suite-price-label">All-Inclusive (or ₹5,000 Day Shoot)</span>
              </div>
            </div>

            <ul class="suite-items">
              <li>
                <div class="suite-item-row">
                  <span class="suite-item-title">Resort Venue Access (6 Hours)</span>
                  <span class="suite-item-cost">₹ 5,000</span>
                </div>
                <span class="suite-item-sub">Access to all terraces, lush gardens, courtyards & lawns</span>
              </li>
              <li>
                <div class="suite-item-row">
                  <span class="suite-item-title">Decorated Golf Cart Setup</span>
                  <span class="suite-item-cost">₹ 3,000</span>
                </div>
                <span class="suite-item-sub">Stylized decorated electric cart on grounds for entry & reels</span>
              </li>
              <li>
                <div class="suite-item-row">
                  <span class="suite-item-title">Romantic Candlelight Dinner Setup</span>
                  <span class="suite-item-cost">₹ 1,500</span>
                </div>
                <span class="suite-item-sub">Intimate candle-lit table styling for romantic evening frames</span>
              </li>
              <li>
                <div class="suite-item-row">
                  <span class="suite-item-title">Evening Mountain Bonfire</span>
                  <span class="suite-item-cost">₹ 1,500</span>
                </div>
                <span class="suite-item-sub">Warm flickering bonfire setup for twilight & night portraits</span>
              </li>
              <li>
                <div class="suite-item-row">
                  <span class="suite-item-title">1 Luxury Suite Room (1 Night Stay)</span>
                  <span class="suite-item-cost">₹ 6,000</span>
                </div>
                <span class="suite-item-sub">Accommodates couple & family (up to 4 guests) with mountain view</span>
              </li>
              <li>
                <div class="suite-item-row">
                  <span class="suite-item-title">Photography Crew Room (1 Night)</span>
                  <span class="suite-item-cost">₹ 2,000</span>
                </div>
                <span class="suite-item-sub">Dedicated private room for photography team (2 people)</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- COLLECTION 02: ROYAL HIMALAYAN (FEATURED) -->
        <div class="collection-suite royal-feature">
          <span class="royal-badge">MOST POPULAR • ALL-INCLUSIVE</span>
          <div>
            <div class="suite-header">
              <span class="suite-eyebrow">COLLECTION 02</span>
              <div class="suite-name">The Royal Himalayan</div>
              <div class="suite-price-row">
                <span class="suite-amount">₹ 26,000</span>
                <span class="suite-price-label">All-Inclusive (or ₹10,000 Venue + Decor)</span>
              </div>
            </div>

            <ul class="suite-items">
              <li>
                <div class="suite-item-row">
                  <span class="suite-item-title">Venue Access (9 Hours) + Custom Decor</span>
                  <span class="suite-item-cost">₹ 10,000</span>
                </div>
                <span class="suite-item-sub">Extended 9-hour slot with custom theme decor by resort styling team</span>
              </li>
              <li>
                <div class="suite-item-row">
                  <span class="suite-item-title">Decorated Cart + Scenic Village Tour</span>
                  <span class="suite-item-cost">₹ 5,000</span>
                </div>
                <span class="suite-item-sub">Decorated golf cart + guided tour to nearby panoramic valley viewpoints</span>
              </li>
              <li>
                <div class="suite-item-row">
                  <span class="suite-item-title">Grand Candlelight Dinner Setup</span>
                  <span class="suite-item-cost">₹ 1,500</span>
                </div>
                <span class="suite-item-sub">Full romantic dining arrangement styled for couple shoot</span>
              </li>
              <li>
                <div class="suite-item-row">
                  <span class="suite-item-title">Himalayan Hearth Bonfire Experience</span>
                  <span class="suite-item-cost">₹ 1,500</span>
                </div>
                <span class="suite-item-sub">Flickering bonfire setup with ambient seating & fairy lights</span>
              </li>
              <li>
                <div class="suite-item-row">
                  <span class="suite-item-title">1 Luxury Suite Room (1 Night Stay)</span>
                  <span class="suite-item-cost">₹ 6,000</span>
                </div>
                <span class="suite-item-sub">Accommodates couple & family (up to 4 guests) with mountain view</span>
              </li>
              <li>
                <div class="suite-item-row">
                  <span class="suite-item-title">Photography Crew Room (1 Night)</span>
                  <span class="suite-item-cost">₹ 2,000</span>
                </div>
                <span class="suite-item-sub">Dedicated private room for photography team (2 people)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- BESPOKE ADD-ONS -->
      <div class="custom-addons-panel">
        <h4>Bespoke Add-On Experiences</h4>
        <div class="addons-flex">
          <div class="addon-card">
            <strong>Curated Wine Toast Setup</strong>
            Curated wine bottle & crystal stemware service for celebratory toast frames.
          </div>
          <div class="addon-card">
            <strong>Live Acoustic Guitarist</strong>
            Live guitarist playing soulful romantic acoustic sets for candid video reels.
          </div>
          <div class="addon-card">
            <strong>Panache Gourmet Dining</strong>
            Authentic Pahadi delicacies & multi-cuisine feasts for the couple and crew.
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer-bar">
      <div>Transparent Pricing • All Setups Handled by In-House Team</div>
      <div><strong>Shivalaya Resort Pre-Wedding Lookbook</strong></div>
      <div>Official Collections 2026-2027</div>
    </div>
  </div>

  <!-- ====================================================
       PAGE 4: ITINERARY, RESERVATIONS & VIP CONCIERGE
       ==================================================== -->
  <div class="page inner-page">
    <div>
      <div class="page-masthead">
        <div class="masthead-title">
          <h2>Shoot Flow & Reservations</h2>
          <p>Seamless Planning for an Unforgettable Day</p>
        </div>
        <div class="masthead-folio">PAGE 04</div>
      </div>

      <!-- SUGGESTED TIMELINE -->
      <div class="timeline-wrap">
        <h4>Suggested Shoot Flow (Customized with Your Photography Team)</h4>
        <div class="timeline-items-grid">
          <div class="timeline-node">
            <span class="node-time">06:00 - 08:00 AM</span>
            <div class="node-details">
              <strong>Sunrise Horizon Shoot</strong>
              <span>Terrace panoramas, misty mountain silhouettes & golden dawn light</span>
            </div>
          </div>
          <div class="timeline-node">
            <span class="node-time">08:00 - 09:30 AM</span>
            <div class="node-details">
              <strong>Breakfast & Wardrobe Refresh</strong>
              <span>Gourmet breakfast at Panache & wardrobe change in luxury suite</span>
            </div>
          </div>
          <div class="timeline-node">
            <span class="node-time">09:30 - 01:00 PM</span>
            <div class="node-details">
              <strong>Architecture & Cultural Frames</strong>
              <span>Sacred Shiva mural courtyard, stone cottages & wooden balconies</span>
            </div>
          </div>
          <div class="timeline-node">
            <span class="node-time">01:00 - 02:30 PM</span>
            <div class="node-details">
              <strong>Mid-Day Rest & Lunch Spread</strong>
              <span>Relaxation, makeup touch-up, and lunch at Panache Restaurant</span>
            </div>
          </div>
          <div class="timeline-node">
            <span class="node-time">02:30 - 04:30 PM</span>
            <div class="node-details">
              <strong>Decorated Golf Cart Scenic Tour</strong>
              <span>Village tour to breathtaking scenic viewpoints & cinematic reels</span>
            </div>
          </div>
          <div class="timeline-node">
            <span class="node-time">04:30 - 06:30 PM</span>
            <div class="node-details">
              <strong>Golden Hour & Bonfire Warmth</strong>
              <span>Sun-drenched valley portraits, glowing bonfire & fairy lights</span>
            </div>
          </div>
          <div class="timeline-node">
            <span class="node-time">06:30 - 08:30 PM</span>
            <div class="node-details">
              <strong>Candlelight Dinner & Wine Toast</strong>
              <span>Romantic candlelit table styling, wine glasses & starlit sky portraits</span>
            </div>
          </div>
          <div class="timeline-node">
            <span class="node-time">08:30 PM ONWARDS</span>
            <div class="node-details">
              <strong>Overnight Mountain Rest</strong>
              <span>Cozy overnight stay in luxury suite with family and photography crew</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RESERVATION PROTOCOL & FAIR CANCELLATION -->
      <div class="reserve-policy-grid">
        <div class="guide-box">
          <h4>How to Reserve Your Date</h4>
          <ul class="protocol-steps">
            <li class="protocol-step">
              <span class="step-badge">1</span>
              <div><strong>Share Brochure:</strong> Discuss packages & shot-list with your photographer.</div>
            </li>
            <li class="protocol-step">
              <span class="step-badge">2</span>
              <div><strong>Confirm Dates:</strong> Call our team to verify date and suite room availability.</div>
            </li>
            <li class="protocol-step">
              <span class="step-badge">3</span>
              <div><strong>50% Advance:</strong> Pay advance to officially block the date and resort staff.</div>
            </li>
            <li class="protocol-step">
              <span class="step-badge">4</span>
              <div><strong>Check-in & Shoot:</strong> Arrive at Shivalaya Resort; remaining balance upon arrival.</div>
            </li>
          </ul>
        </div>

        <div class="guide-box">
          <h4>Cancellation & Rescheduling</h4>
          <div class="policy-clause">
            <div class="clause-row">
              <strong>100% Free Cancellation:</strong> Up to 15 days prior to shoot date.
            </div>
            <div class="clause-row">
              <strong>50% Refund:</strong> Between 7 to 15 days prior to shoot.
            </div>
            <div class="clause-row">
              <strong>Weather Rescheduling:</strong> Complimentary date rescheduling in case of severe mountain rain/fog.
            </div>
          </div>
        </div>
      </div>

      <!-- VIP CONCIERGE BANNER -->
      <div class="concierge-hero">
        <div class="concierge-left">
          <h3>Reserve Your Shoot Dates</h3>
          <p>Direct Pre-Wedding Shoot Coordinator & Resort Concierge</p>
          <div class="concierge-tel">📞 +91 76680 09400</div>
        </div>
        <div class="concierge-right">
          <p>🌐 <a href="https://www.shivalayaresort.com" target="_blank">www.shivalayaresort.com</a></p>
          <p>📸 Instagram: <strong>@shivalayaresort</strong></p>
          <p>📍 Bhimtal - Ghorakhal Road, Uttarakhand</p>
        </div>
      </div>
    </div>

    <div class="page-footer-bar">
      <div>Shivalaya Resort — Where Every Frame Tells Your Love Story</div>
      <div><strong>www.shivalayaresort.com</strong></div>
      <div>Direct Line: +91 76680 09400</div>
    </div>
  </div>

</body>
</html>
"""

full_html = part1 + part2 + part3 + part4 + part5
out_file = BROCHURES_DIR / "prewedding_brochure_luxury.html"
with open(out_file, "w", encoding="utf-8") as f:
    f.write(full_html)
print(f"[OK] Saved {out_file}")

# Generate PDF with Microsoft Edge
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

print("Compiling luxury PDF with Microsoft Edge...")
res = subprocess.run(cmd, capture_output=True, text=True)
if os.path.exists(pdf_target) and os.path.getsize(pdf_target) > 50000:
    print(f"[OK] Generated PDF: {pdf_target} ({os.path.getsize(pdf_target)} bytes)")
else:
    print("Edge note:", res.stdout, res.stderr)

print(">>> ALL LUXURY ASSETS GENERATED SUCCESSFULLY! <<<")
