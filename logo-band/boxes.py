# Prints the BOX map for logo-band.js: the content box of every logo in the homepage CMS ticker (Ticker Logos collection),
# so the band can crop the padded 1588x1322 logo files without measuring them in the browser. Logos added to the CMS later
# still work (the script measures unknown files at runtime); re-run this after big logo changes and paste the output.
# Usage: python3 logo-band/boxes.py [cache_dir]
import io, re, sys, os, urllib.request
from PIL import Image
CACHE = sys.argv[1] if len(sys.argv) > 1 else '/tmp/cyb3r-logo-cache'
os.makedirs(CACHE, exist_ok=True)
get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})).read()
html = get('https://www.cyb3rmedia.com/').decode('utf-8')
sec = html[html.find('<section class="ticker-reveal'):]
sec = sec[:sec.find('</section>')]
srcs = []
for m in re.finditer(r'<div role="listitem" class="w-dyn-item"><img[^>]*src="([^"]+)"', sec):
    if m.group(1) not in srcs: srcs.append(m.group(1))
PAD = .004
out = []
for u in srcs:
    key = re.match(r'([0-9a-f]{24})_', u.rsplit('/', 1)[1]).group(1)
    f = os.path.join(CACHE, key)
    if not os.path.exists(f): open(f, 'wb').write(get(u))
    im = Image.open(f).convert('RGBA'); W, H = im.size; alpha = im.split()[3]
    x0, y0, x1, y1 = alpha.point(lambda v: 255 if v > 24 else 0).getbbox()
    crop = alpha.crop((x0, y0, x1, y1)); hist = crop.histogram()
    ink = sum(v * i for i, v in enumerate(hist)) / 255 / (crop.size[0] * crop.size[1])   # how much of the box is drawn
    b = [max(0, x0 / W - PAD), max(0, y0 / H - PAD), min(1, x1 / W + PAD), min(1, y1 / H + PAD)]
    out.append((key, b, (b[2] - b[0]) * W / ((b[3] - b[1]) * H), ink))
med = sorted(o[3] for o in out)[len(out) // 2]
for key, b, asp, ink in out:   # area factor: thin, airy logos get more room and dense ones less, so they read as one weight
    print('    "%s": [%s, %.3f, %.2f],' % (key, ', '.join('%.4f' % v for v in b), asp, max(.8, min(1.45, (med / ink) ** .5))))
print('    // %d logos' % len(srcs), file=sys.stderr)
