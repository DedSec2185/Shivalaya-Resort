import urllib.request, ssl, re

ctx = ssl._create_unverified_context()
u = "https://drive.google.com/drive/folders/1A2hihLrsNPsKB1q0SYra6och5-fTiw4B"
req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8', errors='ignore')

idx = html.find("6Z8A")
if idx != -1:
    print(html[idx-150:idx+250])
else:
    print("Not found")
