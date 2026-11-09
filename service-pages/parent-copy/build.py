import re,html,json,urllib.request,random,sys
sys.path.insert(0,'.')
from content import PAGES
css=open('dubai.css').read().split('\n')
dxcss=[l for l in css[95:115]+[css[119],css[121]] if '.dx-l' not in l]
style='<style>\n/* body copy + FAQ under the pairs (same rules as dubai.css) */\n'+'\n'.join(dxcss)+'\n</style>\n'
e=lambda s:html.escape(s,quote=False)
for slug,p in PAGES.items():
    secs=''.join(f'<div class="dx-s"><h2>{e(h)}</h2><div>'+''.join(f'<p>{e(x)}</p>' for x in ps)+'</div></div>' for h,ps in p['sections'])
    faq=''.join(f'<details itemscope itemprop="mainEntity" itemtype="https://schema.org/Question"><summary itemprop="name">{e(q)}</summary><div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer"><p itemprop="text">{e(a)}</p></div></details>' for q,a in p['faq'])
    dx=style+f'<section class="dx"><div class="dx-in">{secs}\n<div class="dx-f" itemscope itemtype="https://schema.org/FAQPage"><h2>Questions we get asked</h2>{faq}</div>\n<div class="dx-c"><a class="dx-b" href="/contact">Book a free consultation</a></div>\n</div></section>\n'
    live=urllib.request.urlopen(f'https://www.cyb3rmedia.com/{slug}?v={random.random()}').read().decode()
    i=live.find('<style>\n/* Service page "3" pairs'); j=live.find('<div class="bp-more">',i); k=live.find('</a></div></div>',j)+16
    old=live[i:k]+'\n'
    assert i>0 and j>0 and old.count('<section')==1,slug
    new=old.replace('<div class="bp-more">',dx+'<div class="bp-more">')
    open(f'{slug}.old.html','w').write(old); open(f'{slug}.new.html','w').write(new)
    open(f'{slug}.preview.html','w').write(live.replace(old.rstrip('\n'),new.rstrip('\n')))
    txt=re.sub('<[^>]+>',' ',dx.split('</style>')[1])
    print(slug,len(txt.split()),'words', 'LONGDASH' if re.search('[–—]',dx) else '')
