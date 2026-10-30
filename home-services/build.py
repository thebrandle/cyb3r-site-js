# Builds the homepage services section embed (akaru.fr "Expertises" layout) from the six service-pages/<slug>.json files:
# panel title = the page h1, list = its six card names, media = the service's video (the clips the Work in Motion
# helix used, posters cut from them), Learn more -> /<slug> (services-xp.js turns it into the site's Learn more button).
# Usage (repo root): python3 home-services/build.py  ->  home-services/services-xp-embed.html
import json, os, html
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(D)
CDN = 'https://cdn.prod.website-files.com/6a293cec4280dd8c699d4d08/'
SVC = 'https://cdn.jsdelivr.net/gh/thebrandle/cyb3r-svc-media@cee4bd881fd2f54bf585b89afca9c778f15c43b9/svc/'
e = lambda s: html.escape(s, quote=True)
# slug, clip name (svc/<name>_w_800|480.mp4), poster asset + the second it was cut at, panel colour (site palette), text theme
PANELS = [('brand-identity', 'brand', '6ae51e096168c53b85abadb6_cyb3r-svc-brand-poster.webp', 0.2, '#39F1E0', 'light'),
          ('web-design-development', 'webui', '6ae51e0938a2019734b45910_cyb3r-svc-webui-poster.webp', 3, '#202A36', 'dark'),
          ('seo-google-ads', 'seoupsacled', '6ae51e0912957b9d593ec139_cyb3r-svc-seoupsacled-poster.webp', 1.5, '#FFFFFF', 'light'),
          ('social-media-content', 'socialmedia', '6ae51e096a03b7a61be06f57_cyb3r-svc-socialmedia-poster.webp', 0.2, '#BCBEC0', 'light'),
          ('commercial-print-production', 'commercialprint', '6ae51e0a58f1e8457be18be6_cyb3r-svc-commercialprint-poster.webp', 1.5, '#0F0E0E', 'dark'),
          ('ai-driven-advertising', 'aidriven', '6ae51e0aeca4ce6d6842ae3a_cyb3r-svc-aidriven-poster.webp', 8, '#F7F7F7', 'light')]
# ink, faint ink (list marks), Learn more underline at rest / on hover (dark panels = the Services page colours)
INK = {'light': ('#0F0E0E', 'rgba(15,14,14,.5)', 'rgba(15,14,14,.3)', '#0F0E0E'),
       'dark': ('#FFFFFF', 'rgba(255,255,255,.55)', '#FFFFFF', '#39F1E0')}
style = open(os.path.join(D, 'style.html'), encoding='utf-8').read().strip()
panels, nav = [], []
for i, (slug, clip, poster, t, bg, theme) in enumerate(PANELS):
    c = json.load(open(os.path.join(ROOT, 'service-pages', slug + '.json'), encoding='utf-8'))
    ink, ink2, line, accent = INK[theme]; n = f'{i + 1:02d}'
    items = ''.join(f'<li>{e(x["name"])}</li>' for x in c['cards'])
    panels.append(
        f'<article class="sx-panel sx-{theme}" style="--sx-bg:{bg};--sx-ink:{ink};--sx-ink2:{ink2};--sx-line:{line};--sx-accent:{accent}" aria-labelledby="sx-t{i + 1}"><div class="sx-inner">'
        f'<div class="sx-content"><span class="sx-index" aria-hidden="true">{n}</span><h3 class="sx-title" id="sx-t{i + 1}">{e(c["h1"])}</h3>'
        f'<ul class="sx-list" role="list">{items}</ul>'
        f'<a class="sx-cta" href="/{slug}">Learn more<span class="sr-only"> about {e(c["h1"])}</span></a></div>'
        f'<div class="sx-media"><video muted loop playsinline disablepictureinpicture disableremoteplayback preload="none" tabindex="-1" aria-hidden="true" '
        f'poster="{CDN}{poster}" data-src="{SVC}{clip}_w_800.mp4" data-src-sm="{SVC}{clip}_w_480.mp4" data-t="{t}"></video></div>'
        f'</div></article>')
    nav.append(f'<div class="sx-nav-i"><span>{n}</span><span class="sx-nav-t{" on" if i == 0 else ""}">{e(c["short"])}</span></div>')
out = f'''{style}
<section class="sx" aria-labelledby="sx-h">
<div class="sx-pin"><div class="sx-stage">
<h2 class="h1 for-h2 sx-head" id="sx-h"><span class="sr-only">Services</span><span class="sx-head-v" aria-hidden="true">Services</span></h2>
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
