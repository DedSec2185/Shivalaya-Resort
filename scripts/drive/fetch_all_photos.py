import urllib.request, ssl, re, os
from pathlib import Path

def get_workspace_root():
    p = Path(__file__).resolve().parent
    while p != p.parent:
        if (p / 'package.json').exists():
            return p
        p = p.parent
    return Path.cwd()

WORKSPACE = get_workspace_root()
ASSETS_DIR = WORKSPACE / "marketing" / "brochures" / "prewedding_assets"
ASSETS_DIR.mkdir(parents=True, exist_ok=True)

folders = {
    'shoots_1': 'https://drive.google.com/drive/folders/1A2hihLrsNPsKB1q0SYra6och5-fTiw4B',
    'shoots_2': 'https://drive.google.com/drive/folders/18CCNQFLHLW88RPhymAAOALKJrfWoBvA7',
    'resort': 'https://drive.google.com/drive/folders/1GLZm0t5w5YwmVKKYOuGY8RCH1Zdkdhjo'
}

for name, u in folders.items():
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
        
        # Matches: ssk='5:auSv138:<fileId>-0-16' or similar
        # Find all file IDs following the ssk pattern
        file_ids = re.findall(r'ssk=[\'\"][^\'\"]*:([a-zA-Z0-9_-]{28,35})-[0-9]+', html)
        print(f"[{name}] Found file IDs: {len(file_ids)}")
        
        # Take unique IDs
        unique_ids = []
        for fid in file_ids:
            if fid not in unique_ids and len(fid) in (33, 28):
                unique_ids.append(fid)
                
        print(f"[{name}] Unique IDs: {len(unique_ids)}")
        
        # Download top 4 from each
        for i, fid in enumerate(unique_ids[:4]):
            target = str(ASSETS_DIR / f"{name}_{i+1}.jpg")
            if os.path.exists(target) and os.path.getsize(target) > 10000:
                print(f"Already exists: {target}")
                continue
            url = f"https://lh3.googleusercontent.com/d/{fid}=w1200"
            try:
                treq = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                tdata = urllib.request.urlopen(treq, context=ctx, timeout=15).read()
                if len(tdata) > 10000:
                    with open(target, "wb") as f:
                        f.write(tdata)
                    print(f"Saved {target} ({len(tdata)} bytes)")
            except Exception as e:
                print(f"Failed {fid}: {e}")
    except Exception as ex:
        print(f"Error on {name}: {ex}")

# Also copy the user uploaded images into prewedding_assets
import shutil
user_uploads = [
    (r"C:\Users\abhay\.gemini\antigravity\brain\900812d6-2937-4edf-b17b-3aa6a48e19e8\.user_uploaded\media_1790501670376.jpg", "resort_villa_terrace.jpg"),
    (r"C:\Users\abhay\.gemini\antigravity\brain\900812d6-2937-4edf-b17b-3aa6a48e19e8\.user_uploaded\media_1790501680561.jpg", "resort_shiva_mural.jpg"),
    (r"C:\Users\abhay\.gemini\antigravity\brain\900812d6-2937-4edf-b17b-3aa6a48e19e8\.user_uploaded\media_1790501712390.jpg", "resort_cottage_steps.jpg"),
    (r"C:\Users\abhay\.gemini\antigravity\brain\900812d6-2937-4edf-b17b-3aa6a48e19e8\.user_uploaded\media_1790501832743.jpg", "resort_entrance_gate.jpg"),
]

for src, dst_name in user_uploads:
    if os.path.exists(src):
        dst = str(ASSETS_DIR / dst_name)
        shutil.copy2(src, dst)
        print(f"Copied user upload to {dst}")

print("All asset preparations complete!")
