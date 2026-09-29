import urllib.request, ssl, re, json, os

ctx = ssl._create_unverified_context()
os.makedirs("prewedding_assets", exist_ok=True)

folders = {
    'shoots': 'https://drive.google.com/drive/folders/1A2hihLrsNPsKB1q0SYra6och5-fTiw4B',
    'resort': 'https://drive.google.com/drive/folders/1GLZm0t5w5YwmVKKYOuGY8RCH1Zdkdhjo'
}

for name, u in folders.items():
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
        
        # Look for pattern: ["<fileId>","<fileName>.JPG",...
        matches = re.findall(r'\[\"([a-zA-Z0-9_-]{25,40})\",\"([^\"]+\.(?:JPG|jpg|png|PNG))\"', html)
        print(f"[{name}] Found matches:", len(matches))
        
        count = 0
        for fid, fname in matches:
            if count >= 6:
                break
            out_path = os.path.join("prewedding_assets", f"{name}_{count}_{fname}")
            if os.path.exists(out_path):
                count += 1
                continue
            # Try downloading via direct drive download link
            dl_url = f"https://drive.google.com/uc?export=download&id={fid}"
            try:
                dreq = urllib.request.Request(dl_url, headers={'User-Agent': 'Mozilla/5.0'})
                data = urllib.request.urlopen(dreq, context=ctx, timeout=10).read()
                if len(data) > 10000 and b"<!DOCTYPE" not in data[:100]:
                    with open(out_path, "wb") as f:
                        f.write(data)
                    print(f"Downloaded {out_path} ({len(data)} bytes)")
                    count += 1
                else:
                    # Might be thumbnail
                    thumb_url = f"https://lh3.googleusercontent.com/d/{fid}=w1200"
                    treq = urllib.request.Request(thumb_url, headers={'User-Agent': 'Mozilla/5.0'})
                    tdata = urllib.request.urlopen(treq, context=ctx, timeout=10).read()
                    if len(tdata) > 5000:
                        with open(out_path, "wb") as f:
                            f.write(tdata)
                        print(f"Downloaded thumbnail {out_path} ({len(tdata)} bytes)")
                        count += 1
            except Exception as de:
                print(f"Error downloading {fid}: {de}")
    except Exception as e:
        print(f"Error on {name}: {e}")
