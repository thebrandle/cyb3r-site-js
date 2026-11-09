# Builds the Dubai pages' two embeds from content.py. Styles live in one hosted file, dubai.css (linked in each page's
# head), so the embeds hold only copy and markup. Usage (repo root): python3 service-pages/dubai/build.py
import json, os, html, re, sys
D = os.path.dirname(os.path.abspath(__file__)); SP = os.path.dirname(D); ROOT = os.path.dirname(SP)
sys.path.insert(0, D)
from content import PAGES
CDN = 'https://cdn.prod.website-files.com/6a293cec4280dd8c699d4d08/'
e = lambda s: html.escape(s, quote=True)
src = {}
def card(k):
    src.setdefault(k['src'], json.load(open(os.path.join(SP, k['src'] + '.json'), encoding='utf-8')))
    return src[k['src']]['cards'][k['i']]
strip = lambda f: re.sub(r'</?style>', '', open(os.path.join(SP, f), encoding='utf-8').read())
EXTRA = '''
/* Dubai pages: copy and FAQ under the pairs */
.dx{background:#1A232D;color:#fff;padding:clamp(40px,7vh,96px) 2% clamp(48px,8vh,110px);font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
.dx *{box-sizing:border-box}
.dx-in{max-width:1240px;margin:0 auto}
.dx-s{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(16px,4vw,72px);padding:clamp(34px,4.4vw,64px) 0;border-top:1px solid rgba(255,255,255,.14)}
.dx h2{margin:0;font-family:inherit;font-size:clamp(28px,2.9vw,44px);font-weight:500;line-height:1.14;letter-spacing:-.03em;color:#fff;text-wrap:balance;text-transform:none}
.dx p{margin:0 0 1em;font-family:inherit;font-size:clamp(16px,1.2vw,18px);font-weight:400;line-height:1.62;letter-spacing:0;color:rgba(255,255,255,.76);opacity:1;text-wrap:pretty}
.dx p:last-child{margin-bottom:0}
.dx-f{padding-top:clamp(34px,4.4vw,64px);border-top:1px solid rgba(255,255,255,.14)}
.dx-f>h2{margin-bottom:clamp(20px,2.4vw,34px)}
.dx details{border-top:1px solid rgba(255,255,255,.14)}
.dx details:last-of-type{border-bottom:1px solid rgba(255,255,255,.14)}
.dx summary{position:relative;display:block;padding:22px 44px 22px 0;cursor:pointer;list-style:none;font-size:clamp(18px,1.5vw,22px);font-weight:500;line-height:1.3;letter-spacing:-.015em;color:#fff}
.dx summary::-webkit-details-marker{display:none}
.dx summary::after{content:"+";position:absolute;right:4px;top:50%;transform:translateY(-50%);font-size:26px;font-weight:300;color:#39F1E0}
.dx details[open] summary::after{content:"\\2212"}
.dx details>div{padding:0 44px 24px 0;max-width:820px}
.dx-c{display:flex;flex-wrap:wrap;align-items:center;gap:14px 28px;margin-top:clamp(30px,3.6vw,52px)}
.dx-b{display:inline-block;padding:17px 26px;background:#39F1E0;color:#0F0E0E;font-size:16px;font-weight:600;line-height:1;text-decoration:none;transition:background-color .3s ease}
.dx-b:hover{background:#fff;color:#0F0E0E}
.dx-l{color:#fff;font-size:16px;text-decoration:underline;text-underline-offset:4px}
.dx-l:hover{color:#39F1E0}
/* the 3, as a mask here so the embeds stay small */
.bp-mark{background:currentColor;-webkit-mask:url(three.svg) center/contain no-repeat;mask:url(three.svg) center/contain no-repeat}
@media (max-width:767px){.dx-s{grid-template-columns:1fr}.dx{padding-left:20px;padding-right:20px}}
'''
open(os.path.join(ROOT, 'service-pages/dubai/dubai.css'), 'w', encoding='utf-8').write(strip('lineup-style.html') + strip('pairs-style.html') + EXTRA)
out = {}
for i, c in enumerate(PAGES):
    pv, nx = PAGES[i - 1], PAGES[(i + 1) % len(PAGES)]
    assert len(c['cards']) == 6 and len(c['pairs']) == 16, c['slug']
    for k in c['cards']: assert len(k['line']) <= 140, k['name']
    for a, l, b, r in c['pairs']: assert len(l) <= 20 and len(r) <= 16, (l, r)
    cards = ''.join(f'<li class="bl-card" tabindex="0"><img src="{CDN}{card(k)["img"]}" alt="{e(card(k)["alt"])}" width="800" height="1400" decoding="async">'
                    f'<div class="sr-only"><h2>{e(k["name"])}</h2><p>{e(k["line"])}</p></div></li>' for k in c['cards'])
    lineup = f'''<section class="bl bl-pre" aria-labelledby="bl-h">
<h1 id="bl-h" class="sr-only">{e(c["h1"])}</h1>
<p class="sr-only">{e(c["intro"])}</p>
<ul class="bl-row" role="list">{cards}</ul>
<div class="bl-copy" aria-hidden="true"><p class="bl-eyebrow">Services</p><p class="bl-title">{e(c["h1"])}.</p><p class="bl-sub">{e(c["intro"])}</p></div>
<div class="bl-foot"><a class="bl-prev" href="/{pv["slug"]}">&larr; Previous<span class="bl-nx-full">: {e(pv["h1"])}</span><span class="bl-nx-short" aria-hidden="true">: {e(pv["short"])}</span></a><a class="bl-next" href="/{nx["slug"]}">Next<span class="bl-nx-full">: {e(nx["h1"])}</span><span class="bl-nx-short" aria-hidden="true">: {e(nx["short"])}</span> &rarr;</a></div>
</section>'''
    cls = lambda side, w: f'bp-{side}' + (' bp-b' if w == 'B' else '')
    rows = '\n'.join(f'<li class="bp-row"><span class="{cls("l", a)}">{e(l)}</span> <span class="{cls("r", b)}">{e(r)}</span></li>' for a, l, b, r in c['pairs'])
    secs = ''.join(f'<div class="dx-s"><h2>{e(h)}</h2><div>' + ''.join(f'<p>{e(p)}</p>' for p in ps) + '</div></div>' for h, ps in c['sections'])
    faqs = ''.join(f'<details itemscope itemprop="mainEntity" itemtype="https://schema.org/Question"><summary itemprop="name">{e(q)}</summary><div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer"><p itemprop="text">{e(a)}</p></div></details>' for q, a in c['faqs'])
    parent = json.load(open(os.path.join(SP, c['parent'] + '.json'), encoding='utf-8'))
    pairs = f'''<section class="bp bp-pre" aria-labelledby="bp-h">
<h2 id="bp-h" class="sr-only">What our {e(c["h1"])} team covers</h2>
<div class="bp-wrap">
<ul class="bp-list" role="list">
{rows}
</ul>
<div class="bp-track" aria-hidden="true"><span class="bp-mark"></span></div>
</div>
</section>
<section class="dx"><div class="dx-in">{secs}
<div class="dx-f" itemscope itemtype="https://schema.org/FAQPage"><h2>Questions we get asked</h2>{faqs}</div>
</div></section>'''
    assert not any(ch in lineup + pairs for ch in '—–'), c['slug']
    open(os.path.join(D, f'{c["slug"]}-lineup.html'), 'w', encoding='utf-8').write(lineup)
    open(os.path.join(D, f'{c["slug"]}-pairs.html'), 'w', encoding='utf-8').write(pairs)
    words = len(re.sub('<[^>]+>', ' ', lineup + pairs).split())
    print(c['slug'], len(lineup), len(pairs), 'words', words, 'title', len(c['title']), 'desc', len(c['desc']))
