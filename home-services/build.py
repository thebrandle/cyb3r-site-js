# Builds the homepage services section embed (akaru.fr "Expertises" layout) from the six service-pages/<slug>.json files:
# panel title = the page h1, list = its six card names, photo = one of its card photos, Learn more -> /<slug>.
# Usage (repo root): python3 home-services/build.py  ->  home-services/services-xp-embed.html
import json, os, html
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(D)
CDN = 'https://cdn.prod.website-files.com/6a293cec4280dd8c699d4d08/'
e = lambda s: html.escape(s, quote=True)
# slug: (card photo index, panel colour from the site palette, text theme)
PANELS = [('brand-identity', 2, '#39F1E0', 'light'), ('web-design-development', 2, '#202A36', 'dark'),
          ('seo-google-ads', 2, '#FFD6E8', 'light'), ('social-media-content', 2, '#BCBEC0', 'light'),
          ('commercial-print-production', 4, '#0F0E0E', 'dark'), ('ai-driven-advertising', 2, '#F7F7F7', 'light')]
INK = {'light': ('#0F0E0E', 'rgba(15,14,14,.5)'), 'dark': ('#FFFFFF', 'rgba(255,255,255,.55)')}
ARROW = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" focusable="false"><path d="M2.5 9.5l7-7M4 2.5h5.5V8"/></svg>'
style = open(os.path.join(D, 'style.html'), encoding='utf-8').read().strip()
panels, nav = [], []
for i, (slug, k, bg, theme) in enumerate(PANELS):
    c = json.load(open(os.path.join(ROOT, 'service-pages', slug + '.json'), encoding='utf-8'))
    ink, ink2 = INK[theme]; n = f'{i + 1:02d}'; card = c['cards'][k]
    items = ''.join(f'<li>{e(x["name"])}</li>' for x in c['cards'])
    panels.append(
        f'<article class="sx-panel sx-{theme}" style="--sx-bg:{bg};--sx-ink:{ink};--sx-ink2:{ink2}" aria-labelledby="sx-t{i + 1}"><div class="sx-inner">'
        f'<div class="sx-content"><span class="sx-index" aria-hidden="true">{n}</span><h3 class="sx-title" id="sx-t{i + 1}">{e(c["h1"])}</h3>'
        f'<ul class="sx-list" role="list">{items}</ul>'
        f'<a class="sx-cta" href="/{slug}"><span class="sx-cta-l">Learn more<span class="sr-only"> about {e(c["h1"])}</span></span>'
        f'<span class="sx-cta-d" aria-hidden="true">{ARROW}</span></a></div>'
        f'<div class="sx-media"><img src="{CDN}{card["img"]}" alt="{e(card["alt"])}" width="800" height="1400" loading="lazy" decoding="async"></div>'
        f'</div></article>')
    nav.append(f'<div class="sx-nav-i"><span>{n}</span><span class="sx-nav-t{" on" if i == 0 else ""}">{e(c["short"])}</span></div>')
out = f'''{style}
<section class="sx" aria-labelledby="sx-h">
<div class="sx-pin"><div class="sx-stage">
<h2 class="sx-head" id="sx-h"><span class="sr-only">Services</span><span class="sx-head-v" aria-hidden="true">Services</span></h2>
<div class="sx-panels">
{chr(10).join(panels)}
</div>
<div class="sx-nav" aria-hidden="true">{''.join(nav)}<span class="sx-nav-bar"><span></span></span></div>
</div></div>
</section>
'''
assert len(PANELS) == 6 and not any(ch in out for ch in '—–'), 'six panels, no long dashes'
open(os.path.join(D, 'services-xp-embed.html'), 'w', encoding='utf-8').write(out)
print('embed', len(out), 'chars')
