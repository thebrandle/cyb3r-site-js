# Builds the service pages' two embeds (card lineup + "3" pairs) from the shared templates in this folder
# and service-pages/<slug>.json. Each lineup ends with "Previous: <service>" and "Next: <service>" (the pages
# loop, so the six link in a ring); the pairs embed ends with the homepage "View all" link to /services.
# Usage (repo root): python3 service-pages/build.py  ->  <slug>-embed.html + <slug>-pairs-embed.html for every slug
import json, os, html
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(D)
ORDER = ["brand-identity", "web-design-development", "seo-google-ads", "social-media-content",
         "commercial-print-production", "ai-driven-advertising"]
CDN = 'https://cdn.prod.website-files.com/6a293cec4280dd8c699d4d08/'
e = lambda s: html.escape(s, quote=True)
read = lambda f: open(os.path.join(D, f), encoding='utf-8').read().strip()
style, pstyle, mark = read('lineup-style.html'), read('pairs-style.html'), read('mark.html')
# "View all" = the homepage "Our Latest Work" link: the site's Button Arrow component markup (variant "second"), so the
# site-wide Webflow hover (letters roll up) and the site head's teal hover apply to it as they do on the homepage
V = 'w-variant-6632bb10-76fa-59ca-dc99-473964798be3'
more = (f'<div class="bp-more"><div class="container"><a data-wf--button-arrow--variant="second" href="/services" aria-label="View all services" '
        f'class="button-arrow {V} projectscta w-inline-block"><div class="button-title-flex {V}">'
        + f'<div class="button-small-name {V}">View all</div>' * 2 +
        f'</div><img width="9" aria-hidden="true" alt="Arrow icon" src="{CDN}6a293cee4280dd8c699d5138_arrows.png" loading="lazy" class="arrow-gray"></a></div></div>')
pages = {s: json.load(open(os.path.join(D, s + '.json'), encoding='utf-8')) for s in ORDER if os.path.exists(os.path.join(D, s + '.json'))}
live = [s for s in ORDER if s in pages]
for i, slug in enumerate(live):
    c, pv, nx = pages[slug], pages[live[i - 1]], pages[live[(i + 1) % len(live)]]
    cards = ''.join(f'<li class="bl-card" tabindex="0"><img src="{CDN}{k["img"]}" alt="{e(k["alt"])}" width="800" height="1400" decoding="async">'
                    f'<div class="sr-only"><h2>{e(k["name"])}</h2><p>{e(k["line"])}</p></div></li>' for k in c['cards'])
    lineup = f'''{style}
<section class="bl bl-pre" aria-labelledby="bl-h">
<h1 id="bl-h" class="sr-only">{e(c["h1"])}</h1>
<p class="sr-only">{e(c["intro"])}</p>
<ul class="bl-row" role="list">{cards}</ul>
<div class="bl-copy" aria-hidden="true"><p class="bl-eyebrow">Services</p><p class="bl-title">{e(c["h1"])}.</p><p class="bl-sub">{e(c["intro"])}</p></div>
<div class="bl-foot"><a class="bl-prev" href="/{pv["slug"]}">&larr; Previous<span class="bl-nx-full">: {e(pv["h1"])}</span><span class="bl-nx-short" aria-hidden="true">: {e(pv["short"])}</span></a><a class="bl-next" href="/{nx["slug"]}">Next<span class="bl-nx-full">: {e(nx["h1"])}</span><span class="bl-nx-short" aria-hidden="true">: {e(nx["short"])}</span> &rarr;</a></div>
</section>'''
    cls = lambda side, w: f'bp-{side}' + (' bp-b' if w == 'B' else '')
    rows = '\n'.join(f'<li class="bp-row"><span class="{cls("l", a)}">{e(l)}</span> <span class="{cls("r", b)}">{e(r)}</span></li>' for a, l, b, r in c['pairs'])
    pairs = f'''{pstyle}
<section class="bp bp-pre" aria-labelledby="bp-h">
<h2 id="bp-h" class="sr-only">{e(c["pairs_h2"])}</h2>
<div class="bp-wrap">
<ul class="bp-list" role="list">
{rows}
</ul>
{mark}
</div>
</section>
{more}
'''
    assert len(c['cards']) == 6 and len(c['pairs']) == 16, slug
    assert not any(ch in lineup + pairs for ch in '—–'), slug + ': long dash'
    open(os.path.join(ROOT, f'{slug}-embed.html'), 'w', encoding='utf-8').write(lineup)
    open(os.path.join(ROOT, f'{slug}-pairs-embed.html'), 'w', encoding='utf-8').write(pairs)
    print(f'{slug}: lineup {len(lineup)}  pairs {len(pairs)}  prev <- {pv["slug"]}  next -> {nx["slug"]}')
