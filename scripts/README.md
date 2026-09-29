# Shivalaya Operational & Build Scripts

This directory houses automated generators, photo pipeline downloaders, and utility scripts organized by capability.

---

## 📂 Directory Layout

```
scripts/
├── brochures/                  # Brochure & lookbook generators
│   ├── generate_perfect_prewedding_brochure.py  # Master script: outputs HTML + compiles PDF
│   ├── build_luxury_marketing_brochure.py       # Luxury editorial generator
│   ├── build_perfect_prewedding_brochure.py     # Base interactive brochure
│   └── build_brochure.py                        # Classic brochure generator
├── posters/                    # Highway billboard generators
│   ├── build_posters.py                         # Generates red, white, studio poster editions
│   ├── build_final_posters.py                   # High-contrast refined billboard builder
│   └── build_clean_posters.py                   # Clean minimalist poster compiler
├── drive/                      # Google Drive media synchronization
│   ├── fetch_all_photos.py                      # Scrapes and saves photos from resort Drive folders
│   ├── download_drive_samples.py                # Downloads specific sample image batches
│   ├── dump_drive_snippet.py                    # Analyzes Drive HTML structure
│   ├── inspect_drive.py                         # Inspects Google Drive file IDs
│   └── test_thumb.py                            # Tests image thumbnail dimensions
└── utilities/                  # Schema, data & test utilities
    ├── run_update.py                            # Refreshes logo badges & regenerates posters
    ├── convert_seed.py                          # Converts legacy SQL inserts into modern schema format
    ├── inject_mock.py                           # Python test fixture injector
    └── inject_mock.js                           # Node.js test fixture injector
```

---

## ⚡ Quick Execution Commands

All scripts are configured with dynamic workspace root detection, so you can run them from anywhere in the repository:

### 1. Compile Pre-Wedding Shoot Brochures & PDF
```bash
python scripts/brochures/generate_perfect_prewedding_brochure.py
```
*Outputs to `marketing/brochures/` and compiles `Shivalaya_Resort_PreWedding_Packages.pdf`.*

### 2. Generate Highway Posters & Billboards
```bash
python scripts/posters/build_posters.py
```
*Outputs to `marketing/posters/` and opens `poster_studio.html` in your default browser.*

### 3. Sync Resort Photography from Drive
```bash
python scripts/drive/fetch_all_photos.py
```
*Saves photos into `marketing/brochures/prewedding_assets/`.*
