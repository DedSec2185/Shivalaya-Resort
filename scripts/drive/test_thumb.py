import urllib.request, ssl

ctx = ssl._create_unverified_context()
fid = "1IbfKodr6BnbLFyQZXrKgfvHcvgbOSszl"
url = f"https://lh3.googleusercontent.com/d/{fid}=w1200"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    data = urllib.request.urlopen(req, context=ctx).read()
    print("Downloaded bytes:", len(data))
    with open("prewedding_assets/sample_couple_1.jpg", "wb") as f:
        f.write(data)
    print("Successfully saved sample_couple_1.jpg!")
except Exception as e:
    print("Error:", e)
