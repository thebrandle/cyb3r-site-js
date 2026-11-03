"""Relevance Advertising in the brand-nw.com home layout -> embed.html (one Webflow HtmlEmbed: style + markup).

All copy below is the /relevance-advertising page's, word for word (checked against the live page 2026-11-03).
Media: thebrandle/cyb3r-svc-media lp/ (hero film = the flat 0819 deck render with the hero-v7 soundtrack)."""
from html import escape as e
from pathlib import Path

HERE = Path(__file__).parent
MEDIA = 'https://cdn.jsdelivr.net/gh/thebrandle/cyb3r-svc-media@ed55d270d348dbe0e40df976f96d09c314b7f7c4/lp/'
RA = 'https://cdn.prod.website-files.com/6a180c5b2a617f73fd65d264/'

LOGOS = [  # the strip on the current page, same order
    ('6a1d4781430b7b79ed778a29_fenwick.png', 'Fenwick'),
    ('6a1d47815575ed4c8b55a13a_hoka.png', 'HOKA'),
    ('6a1d4781bb693fbdfbc48558_bq.png', 'B&Q'),
    ('6a1c1523bd358dea9af45598_estee.svg', 'Estée Lauder'),
    ('6a1d461d2ca2508ff9f3e65e_ufc.png', 'UFC'),
    ('6a1d461d5140de07b80f9519_network-rail.png', 'Network Rail'),
    ('6a1d461dc77530f55617c06f_lego.png', 'LEGO'),
    ('6a1d91a2644ccb0bf6cd2d0c_volkswagen_02.png', 'Volkswagen'),
    ('6a1d461dbda46ca16cd10f0f_vue.png', 'Vue'),
    ('6a1d461deb044d7d665cdc22_sandals.png', 'Sandals'),
    ('6a1d91a2dd14b078c9416258_greene-king_02.png', 'Greene King'),
    ('6a1d461ddb3fd286a25fec53_krispy-kreme.png', 'Krispy Kreme'),
    ('6a1d461f3e500c2560add64d_coors.png', 'Coors'),
    ('6a1d4629b2152996dca0a9c2_nhs.png', 'NHS'),
    ('https://cdn.prod.website-files.com/6a293cec4280dd8c699d4d08/6a856e1bc06e240ce9b06f5b_ticker-logo-fxpro-v2.svg', 'FxPro'),
]

EXAMPLES = [  # (category, brand, line, video, poster)
    ('TRAVEL', 'Sandals', 'Caribbean luxury, placed in front of travellers ready to book.',
     '6a180c5b2a617f73fd65d264%2F6a1cb1db31fed60b9bfd8ef6_Sandals_TRAVEL_Hotels_StLuci_970x250%20%281%29_mp4.mp4', 'ex-sandals.webp'),
    ('AUTO', 'Volkswagen', 'Taking the new Golf to drivers already researching their next car.',
     '6a180c5b2a617f73fd65d264%2F6a1cb05a6251df8cb0c1ef69_Volkswagen_AUTOMOTIVE_Q1_2026_Golf_970x250_mp4.mp4', 'ex-vw.webp'),
    ('RETAIL', 'B&Q', 'Meeting home and garden shoppers the moment inspiration strikes.',
     '6a180c5b2a617f73fd65d264%2F6a1d1c53b187ffdba169e2b8_B%26Q%20_RETAIL_House%20%26%20Garden_Plants_mp4.mp4', 'ex-bq.webp'),
    ('ELECTRONICS', 'Hisense', 'Putting 100-inch TVs beside the blockbusters they were built for.',
     '6a180c5b2a617f73fd65d264%2F6a1d1c6a7682ee1bfc2e980c_Hisense_ELECTRONICS_reacher_970x250_mp4.mp4', 'ex-hisense.webp'),
    ('ENTERTAINMENT', 'VUE Cinemas', 'Filling seats by reaching film fans mid-review.',
     '6a180c5b2a617f73fd65d264%2F6a1d1c73ce7c60654d87af21_VUE%20Cinemas_%20ENTERTAINMENT_HailMary_970x250_mp4.mp4', 'ex-vue.webp'),
]

TRANSPARENCY = [
    ('Full-Path URLs', 'No settling for a top-level domain. You get the complete page URL for every placement, so you always know exactly where your ad ran.'),
    ('Impression-Level Data', 'Follow the numbers that matter. Review impressions, clicks, conversions and spend for every single placement, reported without rounding or hiding.'),
    ('Creative Variants', 'Total clarity on your messaging. See which creative variant the agent chose for each page, and the context signals that drove that choice.'),
]

MODELS = [  # (number, title, copy, pills)
    ('01', 'Managed Execution', 'We carry the heavy lifting. Our team runs your campaigns end-to-end, steering programmatic delivery toward the outcomes that matter most to you.',
     ['End-to-End Partnership', 'Zero Manual Setup', 'Maximum Returns']),
    ('02', 'DSP Overlays', 'Curate your own environments. Activate the agent as a single targeting line inside the Google Ads account your team already runs, with no migration.',
     ['Complete Buying Control', 'Direct PMP Access', 'Alignment Overlays']),
    ('03', 'Intelligent Creative', 'Let our creative technology respond to live signals and page context in real time. We wrap your existing assets or build bespoke, high-impact variants.',
     ['Live Data Points', 'Existing Asset Wrappers', 'Placement-Level Matching']),
]

ARROW = '<svg viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M2 11 11 2M4 2h7v7" stroke="currentColor" stroke-width="1.4"/></svg>'


def stmt(dim, rest, tag='h2', extra=''):
    return f'<{tag} class="lnw-stmt{extra}" data-split><span class="lnw-dim">{e(dim)}</span> {e(rest)}</{tag}>'


def head(label, dim, rest, tag='h2', extra=''):
    lab = f'<p class="lnw-lab">{e(label)}</p>' if label else ''
    return f'<div class="lnw-head">{lab}{stmt(dim, rest, tag, extra)}</div>'


def band(k):
    return f'<div class="lnw-band" aria-hidden="true"><div class="lnw-band__m lnw-band__m--{k}"><i></i><i></i><i></i></div></div>'


def logos():
    def lis():
        out = []
        for f, alt in LOGOS:
            src = f if f.startswith('http') else RA + f
            out.append(f'<li><img src="{src}" alt="{e(alt)}" width="143" height="80" loading="lazy" decoding="async"></li>')
        return ''.join(out)
    return (f'<div class="lnw-logos"><div class="lnw-logos__track">'
            f'<ul class="lnw-logos__list">{lis()}</ul><ul class="lnw-logos__list" aria-hidden="true">{lis()}</ul></div></div>')


hero = (
    '<section class="lnw-hero" id="lnwHero" aria-label="Watch the video">'
    f'<video class="lnw-hero__v" muted loop playsinline autoplay preload="auto" poster="{MEDIA}relevance-poster-1280.webp"'
    f' data-s1080="{MEDIA}relevance-1080.mp4" data-s720="{MEDIA}relevance-720.mp4" data-s540="{MEDIA}relevance-540.mp4"></video>'
    # pick the rendition before the hosted script arrives, so the film starts with the page
    '<script>(function(v){var c=navigator.connection;if(c&&c.saveData)return;'
    'var w=(innerWidth>innerHeight?Math.max(innerWidth,innerHeight*16/9):innerWidth)*Math.min(devicePixelRatio||1,2);'
    "v.src=v.getAttribute(w>1100?'data-s1080':w>700?'data-s720':'data-s540');})(document.currentScript.previousElementSibling)</script>"
    '<button class="lnw-hero__hit" type="button" aria-label="Watch the video"></button>'
    '<div class="lnw-ctrl">'
    '<button class="is-pause" type="button" data-c="play" aria-label="Play video">'
    '<svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4.5 17.5 12 6.5 19.5z" fill="currentColor"/></svg>'
    '<svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg></button>'
    '<div class="lnw-ctrl__bar" data-c="seek" role="slider" tabindex="0" aria-label="Seek video" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>'
    '<span class="lnw-ctrl__t">0:00 / 0:55</span>'
    '<button class="is-sound" type="button" data-c="sound" aria-label="Turn sound on" aria-pressed="false">'
    '<svg class="i-on" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    '<svg class="i-off" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="m16 9.5 5 5m0-5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    '</button></div></section>'
)

position = (
    '<section class="lnw-sec lnw-pos"><div class="lnw-frame lnw-grid">'
    + head('The Relevance Agent for Google Ads', 'Make every', 'moment matter', 'h1', ' lnw-stmt--xl') +
    '<div class="lnw-side">'
    '<p class="lnw-lead" data-reveal>Agentic AI that makes real-time, placement-level decisions at scale.</p>'
    f'<div class="lnw-acts" data-reveal style="--d:1"><a href="#" class="lnw-btn">Book a Discovery Call{ARROW}</a>'
    f'<a href="#lnwHero" class="lnw-link" data-watch>Watch the video{ARROW}</a></div>'
    '</div></div></section>'
)

steps = (
    '<div class="lnw-steps">'
    '<div class="lnw-step" data-reveal style="--d:0"><p class="lnw-step__tags"><span>Targeting</span><span>Context</span></p>'
    '<h3 class="lnw-step__t">Match the brief</h3><p class="lnw-step__b">Billions of pages analysed</p></div>'
    '<div class="lnw-step" data-reveal style="--d:1"><p class="lnw-step__tags"><span>Creative</span><span>Messaging</span></p>'
    '<h3 class="lnw-step__t">Align one creative, or millions</h3><p class="lnw-step__b">Millions of unique creatives served</p></div>'
    '<div class="lnw-step" data-reveal style="--d:2"><p class="lnw-step__tags"><span>Alignment Score</span></p>'
    '<p class="lnw-fig"><span class="lnw-dim">60%</span><span data-count-from="60">70%</span></p>'
    '<p class="lnw-step__b"><span class="lnw-dim">Measures how closely the message fits the page</span>'
    '<span>Only serve an ad when the message meets the moment</span></p></div>'
    '<div class="lnw-step" data-reveal style="--d:3"><p class="lnw-step__tags"></p>'
    '<h3 class="lnw-step__t">Delivery at Scale</h3>'
    '<p class="lnw-step__b"><span class="lnw-dim">Millions of ad variations</span><span>Millions of aligned moments</span></p></div>'
    '</div>'
)

agent = (
    '<section class="lnw-sec lnw-agent"><div class="lnw-frame">'
    '<p class="lnw-lab">Relevance Agent</p>' + stmt('Uniting creative', 'and media intelligence') + steps +
    '</div></section>'
)


def cards():
    out = []
    for i, (cat, brand, line, vid, poster) in enumerate(EXAMPLES):
        out.append(
            f'<article class="lnw-card" style="--delay:{min(i, 6) * 80}ms"><div class="lnw-card__m">'
            f'<video muted loop playsinline preload="none" poster="{MEDIA}{poster}" data-src="https://cdn.prod.website-files.com/{vid}"></video></div>'
            f'<div class="lnw-card__meta"><h3>{e(brand)}</h3><p class="lnw-tag">{e(cat)}</p><p class="lnw-card__d">{e(line)}</p></div></article>')
    return ''.join(out)


names = ''.join(f'<span>{e(b)}</span><i>·</i>' for _, b, _, _, _ in EXAMPLES)
work = (
    '<section class="lnw-sec lnw-work">'
    f'<div class="lnw-marq" data-drift="1" aria-hidden="true"><div class="lnw-marq__track">{names * 3}</div></div>'
    f'<div class="lnw-rail"><div class="lnw-rail__track">{cards()}</div></div>'
    '</section>'
)

results = (
    '<section class="lnw-sec lnw-res"><div class="lnw-frame">'
    '<p class="lnw-lab">Proven Results</p>' + stmt('Relevance =', 'Results') +
    '<div class="lnw-stats">'
    '<div class="lnw-stat" data-reveal style="--d:0"><p class="lnw-stat__n" data-count>30%</p><p class="lnw-stat__l">Decrease in CPA</p></div>'
    '<div class="lnw-stat" data-reveal style="--d:1"><p class="lnw-stat__n" data-count>3x</p><p class="lnw-stat__l">Longer Attention</p></div>'
    '<div class="lnw-stat" data-reveal style="--d:2"><p class="lnw-stat__n" data-count>21%</p><p class="lnw-stat__l">Uplift in Brand Awareness</p></div>'
    '</div></div></section>'
)

platform = (
    '<section class="lnw-sec lnw-plat"><div class="lnw-frame lnw-grid">'
    + head('Inside the platform', 'Detailed, actionable insights', 'for creative and media') +
    '<div class="lnw-side"><p class="lnw-lead" data-reveal>Our AI-DCO reporting unlocks opportunities with every targeting partner and publisher you work with.</p></div>'
    '</div><div class="lnw-frame"><figure class="lnw-plat__img" data-reveal>'
    f'<img src="{MEDIA}platform-dashboard-1100.webp" srcset="{MEDIA}platform-dashboard-1100.webp 1100w, {MEDIA}platform-dashboard-1650.webp 1650w"'
    ' sizes="(max-width: 1240px) 92vw, 1180px" width="1650" height="956" alt="Reporting dashboard" loading="lazy" decoding="async"></figure></div></section>'
)

rows = ''.join(f'<div class="lnw-row" data-reveal><h3 class="lnw-row__t">{e(t)}</h3><p class="lnw-row__d">{e(d)}</p></div>' for t, d in TRANSPARENCY)
transparency = (
    '<section class="lnw-sec lnw-trans"><div class="lnw-frame lnw-grid">'
    + head('', 'Built on', 'Absolute Transparency') +
    '<div class="lnw-side"><p class="lnw-lead" data-reveal>We work in the open. We bring a new standard of trust to Google Ads display by sharing the exact placement data other platforms keep hidden.</p></div>'
    f'</div><div class="lnw-frame"><div class="lnw-rows">{rows}</div></div></section>'
)


def caps():
    out = []
    for i, (n, title, copy, pills) in enumerate(MODELS):
        pid = f'lnwCap{n}'
        pl = ''.join(f'<li>{e(p)}</li>' for p in pills)
        out.append(
            f'<div class="lnw-cap{" is-open" if i == 0 else ""}"><h3 class="lnw-cap__h">'
            f'<button class="lnw-cap__s" type="button" aria-expanded="{"true" if i == 0 else "false"}" aria-controls="{pid}">'
            f'<span class="lnw-cap__n">{n}</span><span class="lnw-cap__t"><span class="lnw-tag">Activation Model</span><b>{e(title)}</b></span>'
            f'<span class="lnw-cap__x" aria-hidden="true"></span></button></h3>'
            f'<div class="lnw-cap__body" id="{pid}"><div class="lnw-cap__in"><div><p class="lnw-cap__d">{e(copy)}</p>'
            f'<ul class="lnw-pills">{pl}</ul></div></div></div></div>')
    return ''.join(out)


integration = (
    '<section class="lnw-sec lnw-int"><div class="lnw-frame lnw-grid">'
    + head('Proven Results', 'Seamless', 'Enterprise Integration') +
    '<div class="lnw-side"><p class="lnw-lead" data-reveal>One intelligent layer on top of Google Ads, built for enterprise scale.</p></div>'
    f'</div><div class="lnw-frame"><div class="lnw-acc">{caps()}</div></div></section>'
)

cta = (
    '<section class="lnw-sec lnw-cta"><div class="lnw-frame lnw-grid">'
    + head('', 'Running', 'Google Display Ads?') +
    '<div class="lnw-side"><p class="lnw-lead" data-reveal>Partner with us to make every Google Display Ads placement meet real human intent and drive stronger commercial outcomes.</p>'
    f'<div class="lnw-acts" data-reveal style="--d:1"><a href="#" class="lnw-btn">Book a Discovery Call{ARROW}</a></div></div>'
    '</div></section>'
)

ring = 'Book a Discovery Call · Book a Discovery Call · '
badge = (
    '<a class="lnw-badge" href="#" aria-label="Book a Discovery Call"><span class="lnw-badge__disc"></span>'
    '<span class="lnw-badge__ring" aria-hidden="true"><svg viewBox="0 0 120 120"><defs><path id="lnwRing" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"/></defs>'
    f'<text textLength="280" lengthAdjust="spacing"><textPath href="#lnwRing">{ring}</textPath></text></svg></span>'
    '<svg class="lnw-badge__arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M8 5h11v11" stroke="currentColor" stroke-width="1.8"/></svg></a>'
)

markup = ('<div class="lnw" id="lnw">' + hero + position + logos() + band('a') + agent + work + results + band('b')
          + platform + transparency + integration + band('c') + cta + badge + '</div>')

# two HtmlEmbeds on the page, in this order (each stays well under Webflow's embed size limit)
style = (HERE / 'style.html').read_text()
(HERE / 'embed-style.html').write_text(style)
(HERE / 'embed-body.html').write_text(markup + '\n')
for f in ('embed-style.html', 'embed-body.html'):
    print(f, len((HERE / f).read_text()), 'chars')
