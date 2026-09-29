import urllib.request, ssl, re

ctx = ssl._create_unverified_context()
folders = {
    'shoots_1': 'https://drive.google.com/drive/folders/1A2hihLrsNPsKB1q0SYra6och5-fTiw4B',
    'shoots_2': 'https://drive.google.com/drive/folders/18CCNQFLHLW88RPhymAAOALKJrfWoBvA7',
    'resort_photos': 'https://drive.google.com/drive/folders/1GLZm0t5w5YwmVKKYOuGY8RCH1Zdkdhjo'
}

for name, u in folders.items():
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')
        # Find file names or image IDs
        # Google drive embeds item titles in quotes
        titles = re.findall(r'\[\"([^\"]+\.(?:jpg|jpeg|png|mp4|mov|JPG|PNG|JPEG))\"', html)
        print(f"[{name}] Found file titles ({len(titles)}):", titles[:10])
        
        # Look for drive file IDs
        # format: ["1abc...",...]
        file_ids = re.findall(r'\[\"([a-zA-Z0-9_-]{25,45})\"', html)
        # filter out common tokens
        valid_ids = [fid for fid in set(file_ids) if len(fid) in (28, 33)]
        print(f"[{name}] Found possible drive file IDs ({len(valid_ids)}):", list(valid_ids)[:5])
    except Exception as e:
        print(f"[{name}] Error: {e}")
