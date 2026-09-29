# Shivalaya Panache — Domain Migration & URL Transition Guide

> **Zero-Breakage Strategy:** Start immediately on free, high-performance Vercel links (`.vercel.app`). Transition seamlessly to a custom domain (e.g., `shivalayaresort.com` or `shivalayapanache.com`) whenever ready in less than 10 minutes with zero downtime.

---

## 1. Phase 1: Launch on Vercel Subdomains (Day 1 — Ready Now)

Your 3 applications deploy independently to Vercel with dedicated links:

| Application | Recommended Vercel Project Name | Default Production URL | Target User |
| :--- | :--- | :--- | :--- |
| **Guest Portal** | `shivalaya-guest` | `https://shivalaya-guest.vercel.app` | Guests (Table & Room QRs) |
| **Kitchen KDS** | `shivalaya-kitchen` | `https://shivalaya-kitchen.vercel.app` | Chefs & Kitchen Staff |
| **Resort Reception** | `shivalaya-reception` | `https://shivalaya-reception.vercel.app` | Front Desk, Billing & Owners |

### Why this is completely risk-free:
1. **Instant HTTPS & Global CDN:** Free high-speed SSL certificates and Edge distribution via Vercel.
2. **Zero Code Dependency on URLs:** All 3 apps use relative routing and environment variables. None of the internal logic hardcodes URLs.
3. **No Domain Upfront Cost:** Start operations, train staff, print test QR standees, and verify guest experience before spending money on domain registration.

---

## 2. Phase 2: Adding a Custom Domain (When You Have Domain ID)

When you purchase your domain (from GoDaddy, Namecheap, Cloudflare, Hostinger, Google Domains, etc.), you can map it with zero downtime.

### Recommended Subdomain Layout

| Application | Custom Subdomain | Purpose |
| :--- | :--- | :--- |
| **Guest Portal** | `menu.shivalayaresort.com` *(or `order.`)* | Clean, memorable URL for QR standees |
| **Kitchen Panel** | `kitchen.shivalayaresort.com` | Dedicated kitchen display URL |
| **Reception / Desk** | `desk.shivalayaresort.com` *(or `admin.`)* | Reception & Billing workstation URL |
| **Main Website** | `www.shivalayaresort.com` | Marketing website / Room booking (if needed) |

---

## 3. Step-by-Step Migration Instructions

### Step 1: Add Custom Domain to Vercel Projects

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. For each project (`shivalaya-guest`, `shivalaya-kitchen`, `shivalaya-reception`):
   - Go to **Project Settings** → **Domains**.
   - Type your desired subdomain (e.g. `menu.shivalayaresort.com`).
   - Click **Add**.
   - Choose:
     - **Option A (Recommended):** Add as primary domain, and keep `shivalaya-guest.vercel.app` as a 308 redirect or parallel alias.
3. Vercel will display the exact DNS records needed.

---

### Step 2: Configure DNS Records at Domain Registrar

Log in to your DNS provider (e.g. GoDaddy, Cloudflare, Namecheap) and add the following CNAME records:

| Type | Name / Host | Target / Value | TTL |
| :--- | :--- | :--- | :--- |
| `CNAME` | `menu` | `cname.vercel-dns.com.` | Auto / 300s |
| `CNAME` | `kitchen` | `cname.vercel-dns.com.` | Auto / 300s |
| `CNAME` | `desk` | `cname.vercel-dns.com.` | Auto / 300s |

*(Note: If configuring the root apex domain like `shivalayaresort.com`, create an `A` record pointing to `76.76.21.21` as shown in Vercel).*

---

### Step 3: Automatic SSL Certificate Generation

- Vercel automatically requests and provisions a Let's Encrypt TLS/SSL certificate.
- Usually takes **1 to 3 minutes** after DNS propagation.
- Status in Vercel will turn green: `Valid Configuration` & `Certificate Issued`.

---

### Step 4: Update Reception Portal Environment Variable

In the **Resort Reception** project on Vercel:
1. Go to **Settings** → **Environment Variables**.
2. Update `VITE_GUEST_PORTAL_URL`:
   - Change from: `https://shivalaya-guest.vercel.app`
   - Change to: `https://menu.shivalayaresort.com`
3. Click **Save** and trigger a **Redeploy** (Deployments → Latest → Redeploy).
4. **Why this matters:** When Front Desk staff generates new QR codes for rooms or tables from the reception dashboard, the QR codes will now encode the custom branded domain.

---

### Step 5: Update Supabase Authentication URL Settings

If staff members log into Reception using Supabase Email/Password or Magic Links:
1. Open [Supabase Dashboard](https://supabase.com/dashboard) → Your Project.
2. Go to **Authentication** → **URL Configuration**.
3. Update **Site URL**: `https://desk.shivalayaresort.com`
4. Under **Redirect URLs**, add:
   - `https://desk.shivalayaresort.com/**`
   - `https://menu.shivalayaresort.com/**`
   - *(Keep existing `https://*.vercel.app/**` and `http://localhost:*` entries so nothing breaks!)*
5. Click **Save**.

---

### Step 6: Physical QR Code Standee Replacement Strategy

To avoid any operational disruption during the physical transition:

1. **Dual Routing (Zero Interruption):**
   - Vercel keeps the old `.vercel.app` links active even after the custom domain is added.
   - If a guest scans an existing printed QR code pointing to `https://shivalaya-guest.vercel.app/?table=T04`, it will continue to work seamlessly or redirect to `https://menu.shivalayaresort.com/?table=T04`.
2. **Batch Printing:**
   - Print new QR acrylic standees with `menu.shivalayaresort.com/?table=...` and `menu.shivalayaresort.com/?room=...`.
   - Swap standees table by table and room by room during daily housekeeping.
   - Zero guest friction, zero missed orders.

---

## 4. Verification & Testing Checklist

After adding the domain, verify each item:

- [ ] `https://menu.shivalayaresort.com` opens guest menu without SSL warnings.
- [ ] Scanning QR with parameter `?table=T01` correctly pre-fills Table 1.
- [ ] Scanning QR with parameter `?room=101` correctly pre-fills Room 101.
- [ ] Placing a test order shows up immediately in `https://kitchen.shivalayaresort.com`.
- [ ] Kitchen status update ("Preparing" → "Ready") updates guest tracker in real-time.
- [ ] Reception dashboard generates QR codes displaying the new domain.
- [ ] Old `.vercel.app` link forwards cleanly to the new domain.
