# Builds a service page's two embeds from the Brand & Identity templates (same CSS) and service-pages/<slug>.json.
# Usage (repo root): python3 service-pages/build.py web-design-development  ->  <slug>-embed.html + <slug>-pairs-embed.html
import json, re, sys, html, os
S = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
slug = sys.argv[1]
c = json.load(open(f'{S}/service-pages/{slug}.json', encoding='utf-8'))
e = lambda s: html.escape(s, quote=True)
CDN = 'https://cdn.prod.website-files.com/6a293cec4280dd8c699d4d08/'
style = re.search(r'<style>[\s\S]*?</style>', open(f'{S}/brand-identity-embed.html', encoding='utf-8').read()).group(0)
style = style.replace('/* Brand & Identity service lineup (alanmenken.com-style).', '/* Service page card lineup (alanmenken.com-style).')
cards = ''.join(f'<li class="bl-card" tabindex="0"><img src="{CDN}{k["img"]}" alt="{e(k["alt"])}" width="800" height="1400" decoding="async">'
                f'<div class="sr-only"><h2>{e(k["name"])}</h2><p>{e(k["line"])}</p></div></li>' for k in c['cards'])
lineup = f'''{style}
<section class="bl bl-pre" aria-labelledby="bl-h">
<h1 id="bl-h" class="sr-only">{e(c["h1"])}</h1>
<p class="sr-only">{e(c["intro"])}</p>
<ul class="bl-row" role="list">{cards}</ul>
<div class="bl-copy" aria-hidden="true"><p class="bl-eyebrow">Services</p><p class="bl-title">{e(c["h1"])}.</p><p class="bl-sub">{e(c["intro"])}</p></div>
<div class="bl-foot"><a href="/services#{c["slug"]}">&larr; All services</a><span><span class="bl-hint-hover">Hover a card to explore</span><span class="bl-hint-touch">Tap a card to explore</span></span></div>
</section>'''
p = open(f'{S}/brand-identity-pairs-embed.html', encoding='utf-8').read()
pstyle = re.search(r'<style>[\s\S]*?</style>', p).group(0).replace('/* Brand & Identity "3" pairs', '/* Service page "3" pairs')
mark = re.search(r'<div class="bp-track"[\s\S]*?</div>', p).group(0)
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
'''
open(f'{S}/{slug}-embed.html', 'w', encoding='utf-8').write(lineup)
open(f'{S}/{slug}-pairs-embed.html', 'w', encoding='utf-8').write(pairs)
print('lineup', len(lineup), 'pairs', len(pairs), '| em/en dashes:', sum(lineup.count(x) + pairs.count(x) for x in '—–'))
