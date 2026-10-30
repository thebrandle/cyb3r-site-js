/* =====================================================================
   TRIONN sections — logic. Requires window.THREE (three.js r128) loaded first.
   BRAND KNOBS (edit these):
   • Section 1 cards  -> the `projects` array  (name, desc, kick, hero, g[gradient])
   • Section 2 cards  -> the `PAL` array  ([hexColor, LABEL, Title])  + `GRID_IDX`
   • Headline / caption / heading text lives in the HTML markup, not here.
   • To use real images instead of colour panels, see PROMPT.md ("Use real images").
   Do NOT rename the element ids the script queries (wkPin, track, cur, barFill,
   viewAllHost, dmPin, gl, hwTop, hwBottom, caption, bar, phase).
   ===================================================================== */
/* ===== SECTION 1: Selected work (horizontal) ===== */

(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const lerp=(a,b,t)=>a+(b-a)*t;

  // `work` = the exact project NAME on the Work page (used to open that project's overlay in a new tab)
  // VIDEOS: moved off Cloudinary (account locked, all assets 401'd) to Supabase Storage.
  // Renditions are pre-encoded, not transformed on the fly, so the w_#### token sits in the
  // FILENAME - which keeps the existing .replace("w_1280","w_720") mobile swap below working.
  const projects=[
    { name:"Early Health City", desc:"Strategy, brand and design for a landmark health destination.",
      kick:"Strategy · Branding · Design", hero:"Health, reimagined.", work:"Early Health City",
      img:"https://cdn.jsdelivr.net/gh/thebrandle/cyb3r-services-section@7056b7fffe28ac8d8888f7720fe747b1159866e0/sw-early-health.webp",
      vscale:1.08,
      video:"https://rmvgighiqekznberfkiz.supabase.co/storage/v1/object/public/media/wk/earlyhealthcity_w_1280.mp4" },
    { name:"Stable Rise", desc:"Brand, website and ongoing SEO for a UK property investment firm.",
      kick:"Branding · Web · SEO · Content", hero:"Invested with confidence.", work:"Stable Rise",
      img:"https://cdn.jsdelivr.net/gh/thebrandle/cyb3r-wk-media@c5ccf8516964b592ec415a1c66b1e4348d178a8d/sw/sw-stablerise.webp",
      video:"https://cdn.jsdelivr.net/gh/thebrandle/cyb3r-wk-media@c5ccf8516964b592ec415a1c66b1e4348d178a8d/wk/stablerise_w_1280.mp4" },
    { name:"Cyb3r Group", desc:"Social, content and AI-driven advertising engineered for growth.",
      kick:"Social · Content · AI Advertising", hero:"Growth, engineered.", work:"CYB3R",
      img:"https://cdn.jsdelivr.net/gh/thebrandle/cyb3r-services-section@7056b7fffe28ac8d8888f7720fe747b1159866e0/sw-cyb3r-group.webp",
      video:"https://rmvgighiqekznberfkiz.supabase.co/storage/v1/object/public/media/wk/cyb3r_w_1280.mp4" },
    { name:"Gattaca Genomics", desc:"Web design and development for a next-generation genomics platform.",
      kick:"Web Design · Development", hero:"Decoding tomorrow.", work:"Gattaca Genomics",
      img:"https://cdn.jsdelivr.net/gh/thebrandle/cyb3r-services-section@7056b7fffe28ac8d8888f7720fe747b1159866e0/sw-gattaca.webp",
      video:"https://rmvgighiqekznberfkiz.supabase.co/storage/v1/object/public/media/wk/gattaca_w_1280.mp4" }
  ];
  /* Card placeholder images above mirror the 'Selected Works' CMS collection (collection
   * 6a479f199798230430066283) - when the user swaps an image there, copy the new asset URL
   * here too; the engine does not read the CMS at runtime. vscale = slight video zoom. */
  const N=projects.length;
  const track=document.getElementById("track");
  if(!track) return;   // guard: section absent (e.g. a page with only .dm) -> don't crash the file

  /* ---------- exact button_wrapper ---------- */
  function makeButton(label, opts){
    opts=opts||{};
    const wrap=document.createElement("span"); wrap.className="button_wrapper";
    const btn=document.createElement("a"); btn.className="btn"; btn.href=opts.href||"#"; btn.setAttribute("aria-label",label);   // the label is split into per-letter spans below
    if(opts.target){ btn.target=opts.target; btn.rel="noopener"; }
    const uR=document.createElement("span"); uR.className="u-right"; const uL=document.createElement("span"); uL.className="u-left";
    const word=document.createElement("span"); word.className="word";
    [...label].forEach(ch=>{ const s=document.createElement("span"); s.className="text"; s.textContent=ch; word.appendChild(s); });
    const aR=document.createElement("span"); aR.className="arrow arrow-right"; aR.setAttribute("aria-hidden","true"); aR.innerHTML='<span class="arrow-sprite">→</span>';
    const aL=document.createElement("span"); aL.className="arrow arrow-left"; aL.setAttribute("aria-hidden","true"); aL.innerHTML='<span class="arrow-sprite">→</span>';
    btn.append(uR,uL,word,aR,aL); wrap.append(btn); if(!opts.href) btn.addEventListener("click",e=>e.preventDefault());
    const num=(el,k,d)=>{ const v=parseFloat(getComputedStyle(el).getPropertyValue(k)); return Number.isFinite(v)?v:d; };
    const kill=el=>el&&el.getAnimations().forEach(a=>{ try{a.commitStyles();}catch(e){} a.cancel(); });
    const slide=(el,tx,op,dur,delay=0)=>{ if(!el)return; el.getAnimations().forEach(a=>a.cancel());
      const cs=getComputedStyle(el); const m=new DOMMatrixReadOnly(cs.transform==="none"?"":cs.transform).m41;
      const a=el.animate([{transform:`translateX(${m}px)`,opacity:cs.opacity},{transform:`translateX(${tx})`,opacity:op}],{duration:dur,delay,easing:"ease",fill:"forwards"});
      a.onfinish=()=>{ el.style.transform=`translateX(${tx})`; el.style.opacity=String(op); }; };
    const scaleUL=(el,origin,to,dur,delay=0)=>{ if(!el)return; el.style.transformOrigin=`${origin} center`; kill(el);
      const cs=getComputedStyle(el); const mm=new DOMMatrixReadOnly(cs.transform==="none"?"":cs.transform); const from=Math.hypot(mm.m11,mm.m12)||1;
      const a=el.animate([{transform:`scaleX(${from})`},{transform:`scaleX(${to})`}],{duration:dur,delay,easing:"ease",fill:"forwards"}); a.onfinish=()=>el.style.transform=`scaleX(${to})`; };
    const texts=[...word.querySelectorAll(".text")]; const step=30,baseDur=300,durStep=30,reentry=0.5;
    function groupMove(mode){
      const br=btn.getBoundingClientRect(),wr=word.getBoundingClientRect(); const padR=parseFloat(getComputedStyle(btn).paddingRight)||0;
      let target; if(mode==="in") target=br.right-padR-2;   // stop 2px inside the clip; +1 cut the last letter
      else { const arw=aR.getBoundingClientRect().width; const gap=num(wrap,"--arrow-gap",10); const inset=Math.max(num(wrap,"--inset-min",8),0.5*padR); target=br.right-inset-arw-gap; }
      const move=Math.max(0,target-wr.right); const n=texts.length;
      texts.forEach((el,r)=>{ const o=mode==="in"?n-r-1:r; el.style.setProperty("--group-move",move+"px"); el.style.setProperty("--delay",(o*step)+"ms"); el.style.setProperty("--dur",(baseDur+o*durStep)+"ms"); });
      return Math.max(120,Math.round(((n-1)*step+(baseDur+(n-1)*durStep))*reentry));
    }
    requestAnimationFrame(()=>{ groupMove("out"); const spR=aR.querySelector(".arrow-sprite"),spL=aL.querySelector(".arrow-sprite");
      spR.style.opacity="1"; spR.style.transform="translateX(0)"; spL.style.opacity="0"; spL.style.transform="translateX(-120%)";
      uR.style.transformOrigin="right center"; uR.style.transform="scaleX(1)"; uL.style.transformOrigin="left center"; uL.style.transform="scaleX(0)"; });
    let inT,outT;
    const enter=()=>{ clearTimeout(outT); const s=groupMove("in"); btn.offsetWidth; wrap.classList.add("is-hovered");
      const run=getComputedStyle(wrap).getPropertyValue("--run").trim()||"28px";
      slide(aR.querySelector(".arrow-sprite"),run,0,200,0); slide(aL.querySelector(".arrow-sprite"),"0px",1,320,s);
      scaleUL(uR,"right",0,1000,0); inT=setTimeout(()=>scaleUL(uL,"left",1,500,0),s); };
    const leave=()=>{ clearTimeout(inT); const i=groupMove("out"); btn.offsetWidth; wrap.classList.remove("is-hovered");
      const run=getComputedStyle(wrap).getPropertyValue("--run").trim()||"28px";
      slide(aL.querySelector(".arrow-sprite"),`calc(-1 * ${run})`,0,200,0); slide(aR.querySelector(".arrow-sprite"),"0px",1,320,i);
      scaleUL(uL,"left",0,1000,0); outT=setTimeout(()=>scaleUL(uR,"right",1,500,0),i); };
    btn.addEventListener("mouseenter",enter); btn.addEventListener("mouseleave",leave); btn.addEventListener("focus",enter); btn.addEventListener("blur",leave);
    return wrap;
  }

  /* ---------- build track: heading panel + card panels ---------- */
  const headPanel=document.createElement("div"); headPanel.className="panel head";
  headPanel.innerHTML=`<h2>Selected Works</h2><p class="lede">A living showcase of selected CYB3R Media projects across brand, web design and performance marketing.</p><div class="cta-row" id="viewAllHost"></div>`;
  track.appendChild(headPanel);
  headPanel.querySelector("#viewAllHost").appendChild(makeButton("View all work",{href:"/work"}));

  const cards=projects.map((p)=>{
    const el=document.createElement("div"); el.className="panel card";
    const inner=document.createElement("div"); inner.className="p-inner";
    const vsrc=(p.video&&innerWidth<=820)?p.video.replace("w_1280","w_720"):p.video;   // lighter decode on phones/tablets
    inner.innerHTML=`<div class="art"><div class="scene" style="background-image:url('${p.img}')"></div>${p.video?`<video class="scene-vid" muted loop playsinline preload="none" poster="${p.img}"${p.vscale?` style="transform:scale(${p.vscale})"`:``}><source src="${vsrc}" type="video/mp4"></video>`:``}</div>
      <div class="info"><div class="cardline"></div><h3>${p.name}</h3><div class="cta-row"></div></div>`;
    el.appendChild(inner); track.appendChild(el);
    inner.querySelector(".cta-row").appendChild(makeButton("Explore project",{href:"/work?project="+encodeURIComponent(p.work), target:"_blank"}));
    return { el, inner, cardline:inner.querySelector(".cardline"), h3:inner.querySelector("h3"), p:inner.querySelector("p"), cta:inner.querySelector(".cta-row"), played:false, drew:false };
  });

  /* ---------- card videos: play only while in view (perf + reduced-motion aware) ---------- */
  if(!reduce && "IntersectionObserver" in window){
    // hysteresis: play on entry, pause only after 500ms continuously out - cards cross the
    // viewport edge constantly during the horizontal scroll and play/pause thrash hitches
    const vPauseT=new WeakMap();
    const vio=new IntersectionObserver((ents)=>{ ents.forEach(en=>{ const v=en.target;
      if(en.isIntersecting){ const t=vPauseT.get(v); if(t){ clearTimeout(t); vPauseT.delete(v); }
        v.muted=true; const pr=v.play(); if(pr&&pr.catch) pr.catch(()=>{}); }
      else if(!vPauseT.has(v)){ vPauseT.set(v, setTimeout(()=>{ vPauseT.delete(v); v.pause(); }, 500)); } }); },{threshold:0.15});
    cards.forEach(c=>{ const v=c.inner.querySelector(".scene-vid"); if(v){ v.muted=true;
      v.addEventListener("playing",()=>v.classList.add("sv-on"));
      ["waiting","pause","emptied"].forEach(ev=>v.addEventListener(ev,()=>v.classList.remove("sv-on")));
      v.addEventListener("error",()=>{ try{v.remove();}catch(e){} },true);
      vio.observe(v); } });
  }

  /* ---------- layout (exact: heading = 0.5W, cards = 0.5W each → A=0.5w, R=0.5w) ---------- */
  let W=0, headW=0, cardW=0, trackW=0, entryDist=0, stageH=0;
  function layout(){
    W=window.innerWidth; stageH=document.querySelector(".wk .pin-stage").clientHeight;
    headW=W*0.5; cardW=W*0.5; entryDist=Math.min(550, stageH*0.6);
    headPanel.style.width=headW+"px";
    cards.forEach(c=>{ c.el.style.width=cardW+"px"; });
    trackW=headW + N*cardW;
  }
  layout(); addEventListener("resize",layout);

  /* ---------- scroll-driven, Lenis-style continuous smoothing ---------- */
  const pin=document.getElementById("wkPin"), cur=document.getElementById("cur"), barFill=document.getElementById("barFill");
  let progress=0;                                   // smoothed
  const anim=(el,dur,delay)=>el.animate([{opacity:0,transform:"translateY(24px)"},{opacity:1,transform:"translateY(0)"}],{duration:dur,delay,easing:"cubic-bezier(.22,1,.36,1)",fill:"both"});
  function playPanel(c){ anim(c.h3,700,0); if(c.p) anim(c.p,600,120); anim(c.cta,400,c.p?240:140); }
  function hidePanel(c){ [c.h3,c.p,c.cta].filter(Boolean).forEach(el=>{ el.getAnimations().forEach(a=>a.cancel()); el.style.opacity="0"; el.style.transform="translateY(24px)"; }); }
  cards.forEach(hidePanel);

  function targetProgress(){ const r=pin.getBoundingClientRect(); const total=pin.offsetHeight-window.innerHeight; return clamp(-r.top/total,0,1); }

  // perf: the loop idles (no layout reads, no style writes) while the section is off-screen
  let wkVisible=true;
  if("IntersectionObserver" in window){ wkVisible=false;
    new IntersectionObserver(es=>{ es.forEach(e=>{ wkVisible=e.isIntersecting; }); },{rootMargin:"300px"}).observe(pin);
  }

  let wkApplied=-1;
  function render(){
    if(!wkVisible){ requestAnimationFrame(render); return; }
    // continuous smoothing every frame (this is what makes it Lenis-smooth)
    const wkTarget=targetProgress();
    progress = reduce ? wkTarget : lerp(progress, wkTarget, 0.1);
    if(Math.abs(progress-wkTarget)<0.0002) progress=wkTarget;              // snap once converged
    if(progress===wkApplied){ requestAnimationFrame(render); return; }     // settled: skip all writes
    wkApplied=progress;

    const S = progress*(trackW - W);                // horizontal offset, like the site's S = k*o
    track.style.transform=`translate3d(${-S}px,0,0)`;

    cards.forEach((c,t)=>{
      // EXACT site formula: r = (A + t*R + R/2 - S)/W ; A=headW, R=cardW
      const r = (headW + t*cardW + cardW/2 - S) / W;
      let y;
      if(r>1.2) y=entryDist;
      else if(r>0.5) y=entryDist*(1-(1-Math.pow(1-(1.2-r)/0.7,3)));   // 550*(1-u)^3
      else y=0;
      c.inner.style.transform=`translate3d(0,${y}px,0)`;
      if(r<1.05 && !c.played){ c.played=true; playPanel(c); }
      if(r>1.15 && c.played){ c.played=false; hidePanel(c); }
      if(r<1 && !c.drew){ c.drew=true; c.cardline.animate([{transform:"scaleY(0)"},{transform:"scaleY(1)"}],{duration:1200,easing:"cubic-bezier(.16,1,.3,1)",fill:"forwards"}); }
      if(r>1.1 && c.drew){ c.drew=false; c.cardline.getAnimations().forEach(a=>a.cancel()); c.cardline.style.transform="scaleY(0)"; }
    });

    // counter = nearest card to center
    let best=0,bd=1e9; cards.forEach((c,t)=>{ const r=(headW+t*cardW+cardW/2-S)/W; const d=Math.abs(r-0.75); if(d<bd){bd=d;best=t;} });
    const curTxt=String(best+1).padStart(2,"0");
    if(cur.textContent!==curTxt) cur.textContent=curTxt;                   // text writes force layout - only on change
    barFill.style.transform=`scaleX(${progress})`;
    requestAnimationFrame(render);
  }
  render();
})();

/* ===== SECTION 2: Design in Motion (real three.js helix) ===== */

(() => {
  "use strict";
  const T = window.THREE;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const lerp=(a,b,t)=>a+(b-a)*t;

  // ---- exact constants from the bundle ----
  const RIB_N = 9;                         // ribbon cards (w.length)
  const SPACING = 6.2, CARD_ARC = 5.8;
  const EP = (RIB_N-1)*SPACING + CARD_ARC; // 55.4
  const b  = 28/(2*Math.PI*2);             // 2.2282
  const ARCX = Math.sqrt(144 + b*b);       // 12.2049
  const HLEN = 2*Math.PI*2*ARCX;           // 153.38
  const EG = ((0.5*HLEN + EP + 10)/(HLEN+EP))*(400/600);  // grid threshold ≈ 0.4537
  const ASPECT = 568/812;                  // 0.69951
  const V = 2*Math.PI;
  const O = CARD_ARC*ASPECT;               // card height in world units
  const RIB_P_END = 400/600;               // ribbon completes at g = 0.6667

  const isTab = ()=> innerWidth>=768 && innerWidth<1200;
  const fovDeg = ()=> innerWidth<768?58: isTab()?54:52;
  const camZ   = ()=> innerWidth<768?28: isTab()?24:22;
  const gCols  = ()=> innerWidth<768?2:3;

  // ---- CYB3R service cards: 6 videos + titles (Cloudinary, pre-cropped to the card aspect 812:568, CORS ok) ----
  const CARDS=[
    ["https://rmvgighiqekznberfkiz.supabase.co/storage/v1/object/public/media/svc/brand_w_800.mp4","Brand & Identity"],
    ["https://rmvgighiqekznberfkiz.supabase.co/storage/v1/object/public/media/svc/webui_w_800.mp4","Web Design & Development"],
    ["https://rmvgighiqekznberfkiz.supabase.co/storage/v1/object/public/media/svc/seoupsacled_w_800.mp4","SEO & Google Ads"],
    ["https://rmvgighiqekznberfkiz.supabase.co/storage/v1/object/public/media/svc/socialmedia_w_800.mp4","Social Media & Content"],
    ["https://rmvgighiqekznberfkiz.supabase.co/storage/v1/object/public/media/svc/commercialprint_w_800.mp4","Commercial Print & Production"],
    ["https://rmvgighiqekznberfkiz.supabase.co/storage/v1/object/public/media/svc/aidriven_w_800.mp4","AI-Driven Advertising"]
  ];
  const PAL=[0,1,2,3,4,5,0,1,2];           // 9 ribbon cards = indices into CARDS (6 unique, cycled)
  const GRID_IDX=[0,1,2,3,4,5];            // 6 grid cards, one per service
  // one-line service blurbs, shown in a tooltip when you hover a settled grid card (index matches CARDS)
  const DESC=[
    "Logo systems, brand guidelines and visual identities that give your business a distinct, consistent presence.",
    "Fast, responsive websites and web apps engineered to convert - from UX and design through build and launch.",
    "Search strategies and Google Ads that put you in front of high-intent customers and grow qualified traffic.",
    "Scroll-stopping content and always-on social management that build audience, community and demand.",
    "Print, packaging and large-format production - crafted, colour-accurate and delivered to spec.",
    "AI-powered creative and media buying that optimise spend and scale performance in real time."
  ];
  // clicking a settled grid card opens /services#<slug>; services-section.js scrolls its pinned
  // stack to the matching panel (index matches CARDS - keep both lists in the same order)
  const SLUG=["brand-identity","web-design-development","seo-google-ads","social-media-content","commercial-print-production","ai-driven-advertising"];

  const _cardCache={};
  const DMV=[]; let dmSeen=false;   // card videos start cold; fetched + played only once .dm approaches
  function getCard(idx){
    if(_cardCache[idx]) return _cardCache[idx];
    let [url,title]=CARDS[idx];
    url=url.replace("w_800", innerWidth<=820?"w_480":"w_640");   // six concurrent decodes: keep each one small
    // playing video -> VideoTexture (auto-updates each frame). Cloudinary crops to the card aspect so nothing stretches.
    const vid=document.createElement("video");
    vid.crossOrigin="anonymous"; vid.muted=true; vid.defaultMuted=true; vid.loop=true; vid.playsInline=true;
    vid.setAttribute("muted",""); vid.setAttribute("playsinline",""); vid.setAttribute("webkit-playsinline",""); vid.preload="none";
    vid.style.cssText="position:fixed;left:-9999px;top:0;width:2px;height:2px;opacity:0;pointer-events:none";
    (document.body||document.documentElement).appendChild(vid);
    vid.src=url; DMV.push(vid); if(dmSeen){ const pr=vid.play(); if(pr&&pr.catch) pr.catch(function(){}); }
    const vtex=new T.VideoTexture(vid); vtex.minFilter=T.LinearFilter; vtex.magFilter=T.LinearFilter; vtex.generateMipmaps=false;
    // static label overlay (transparent, bottom gradient + title) composited over the video in the shader
    const cw=812,ch=568; const c=document.createElement("canvas"); c.width=cw; c.height=ch; const x=c.getContext("2d");
    x.clearRect(0,0,cw,ch);
    const gr=x.createLinearGradient(0,ch*0.40,0,ch); gr.addColorStop(0,"rgba(0,0,0,0)"); gr.addColorStop(1,"rgba(0,0,0,.72)"); x.fillStyle=gr; x.fillRect(0,ch*0.40,cw,ch*0.60);
    x.fillStyle="#fff"; x.font="600 48px Inter,Helvetica,Arial,sans-serif"; wrap(x,title,44,ch-40,cw-88,54);
    const ltex=new T.CanvasTexture(c); ltex.minFilter=T.LinearFilter; ltex.magFilter=T.LinearFilter; ltex.generateMipmaps=false;
    return (_cardCache[idx]={vtex,ltex,vid});
  }
  function wrap(ctx,text,x,y,maxW,lh){ const words=text.split(" "); let line="",yy=y-lh; const lines=[];
    for(const w of words){ const test=line?line+" "+w:w; if(ctx.measureText(test).width>maxW && line){ lines.push(line); line=w; } else line=test; } lines.push(line);
    lines.forEach((ln,i)=>ctx.fillText(ln,x,y-(lines.length-1-i)*lh)); }
  function shade(hex,amt){ const n=parseInt(hex.slice(1),16); let r=(n>>16)+amt,g=((n>>8)&255)+amt,bl=(n&255)+amt;
    r=clamp(r,0,255);g=clamp(g,0,255);bl=clamp(bl,0,255); return "#"+((1<<24)+(r<<16)+(g<<8)+bl).toString(16).slice(1); }
  function luminance(hex){ const n=parseInt(hex.slice(1),16); return 0.2126*(n>>16)+0.7152*((n>>8)&255)+0.0722*(n&255); }

  // ---- renderer / scene / camera ----
  const canvas=document.getElementById("gl");
  if(!canvas || !T) return;   // guard: .dm absent, or three.js not loaded -> don't crash
  // network + render gate: card videos download/play AND the WebGL loop renders only while
  // the section is near the viewport; both idle when it is far away
  let dmVisible=false, dmPauseT=0;
  (function(){ const dmRoot=canvas.closest(".dm")||canvas;
    if("IntersectionObserver" in window){
      new IntersectionObserver(function(es){ es.forEach(function(e){
        dmVisible=e.isIntersecting;
        if(e.isIntersecting){ dmSeen=true;
          if(dmPauseT){ clearTimeout(dmPauseT); dmPauseT=0; }
          // stagger the six decoder spin-ups instead of starting them all in one frame
          DMV.forEach(function(v,i){ if(v.preload==="none") v.preload="auto";
            setTimeout(function(){ if(dmVisible){ const p=v.play(); if(p&&p.catch) p.catch(function(){}); } }, i*70); });
        } else if(dmSeen && !dmPauseT){
          dmPauseT=setTimeout(function(){ dmPauseT=0; if(!dmVisible) DMV.forEach(function(v){ v.pause(); }); }, 700);
        }
      }); },{rootMargin:"700px"}).observe(dmRoot);
    } else { dmSeen=true; dmVisible=true; DMV.forEach(function(v){ const p=v.play(); if(p&&p.catch) p.catch(function(){}); }); }
  })();
  // GPU budget: no MSAA at retina density (the DPR already masks aliasing) and a lower
  // pixel ratio below desktop - full-viewport WebGL at DPR 2 was 4x the pixels per frame
  const DPR=devicePixelRatio||1;
  const renderer=new T.WebGLRenderer({canvas, alpha:true, antialias:DPR<2});
  renderer.setPixelRatio(innerWidth<=991 ? Math.min(1.5, DPR) : Math.min(2, DPR));
  renderer.setClearColor(0x040508, 0);
  const scene=new T.Scene();
  let camera=new T.PerspectiveCamera(fovDeg(), innerWidth/innerHeight, 0.1, 500);
  camera.position.set(0,0,camZ()); camera.lookAt(0,0,0);

  function size(){ camera.fov=fovDeg(); camera.aspect=innerWidth/innerHeight; camera.position.z=camZ(); camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false); buildGrid(); }
  // ---- helix point ----
  function q(e){ const t=(e-V)/2; return new T.Vector3(12*Math.cos(e), -16 + e*b - 2.5*Math.exp(-t*t), 12*Math.sin(e)); }
  function tangent(e){ const t=(e-V)/2, r=((-2*t)/2)*2.5*Math.exp(-t*t); return new T.Vector3(-12*Math.sin(e), b-r, 12*Math.cos(e)).normalize(); }

  // ---- ribbon cards (PlaneGeometry(1,1,116,1) rewritten each frame) ----
  const ribMat = card => new T.ShaderMaterial({ uniforms:{ map:{value:card.vtex}, label:{value:card.ltex} },
    vertexShader:"varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
    fragmentShader:"uniform sampler2D map; uniform sampler2D label; varying vec2 vUv; void main(){ vec2 uv=vUv; if(gl_FrontFacing) uv.x=1.0-uv.x; vec4 v=texture2D(map,uv); vec4 l=texture2D(label,uv); gl_FragColor=vec4(mix(v.rgb,l.rgb,l.a),1.0); }",
    side:T.DoubleSide });
  const ribbon=[];
  for(let i=0;i<RIB_N;i++){ const geo=new T.PlaneGeometry(1,1,116,1);
    const mesh=new T.Mesh(geo, ribMat(getCard(PAL[i])));
    mesh.visible=false; mesh.renderOrder=1; mesh.frustumCulled=false;
    mesh.geometry.boundingSphere=new T.Sphere(new T.Vector3(0,0,0),1e3);
    mesh.userData={hoverScale:1, uvWritten:false}; scene.add(mesh); ribbon.push(mesh); }

  function buildRibbonCard(mesh, cardStart, r){
    const n=mesh.geometry.attributes.position, uvA=mesh.geometry.attributes.uv;
    const a=CARD_ARC*r, o=cardStart+2.9-0.5*a, s=O*r, writeUV=!mesh.userData.uvWritten;
    for(let e=0;e<117;e++){
      const tt=e/116, rr=(o+tt*a)/ARCX, c=Math.cos(rr), u=Math.sin(rr), d=(rr-V)/2, f=2.5*Math.exp(-d*d);
      const hx=12*c, hy=-16+rr*b-f, hz=12*u;
      let g=-12*u, w=b-((-2*d)/2)*f, v=12*c; const yl=Math.sqrt(g*g+w*w+v*v)||1; g/=yl; w/=yl; v/=yl;
      let M=w*u, S=v*c-g*u, P=-w*c; let Tn=Math.sqrt(M*M+S*S+P*P)||1; M/=Tn; S/=Tn; P/=Tn;
      S+=0.6; Tn=Math.sqrt(M*M+S*S+P*P)||1; M/=Tn; S/=Tn; P/=Tn;
      for(let r2=0;r2<2;r2++){ const aa=(r2===0?-0.5:0.5)*s, idx=117*r2+e;
        n.setXYZ(idx, hx+M*aa, hy+S*aa, hz+P*aa); if(writeUV) uvA.setXY(idx, tt, r2); }
    }
    n.needsUpdate=true; if(writeUV){ uvA.needsUpdate=true; mesh.userData.uvWritten=true; }
    mesh.position.set(0,0,0); mesh.rotation.set(0,0,0); mesh.scale.set(1,1,1);
  }

  // ---- grid cards (rounded-corner SDF shader) + wave ----
  const gridFrag=`uniform sampler2D map; uniform sampler2D label; uniform vec2 uSize; uniform float uRadius; varying vec2 vUv;
    void main(){ vec2 pxPos=(vUv-0.5)*uSize; vec2 halfSize=uSize*0.5; vec2 q=abs(pxPos)-halfSize+uRadius;
      float dist=min(max(q.x,q.y),0.0)+length(max(q,0.0))-uRadius; float alpha=1.0-smoothstep(-0.5,0.5,dist);
      if(alpha<=0.0) discard; vec4 v=texture2D(map,vUv); vec4 l=texture2D(label,vUv); gl_FragColor=vec4(mix(v.rgb,l.rgb,l.a), alpha); }`;
  let grid=[], cardW=1, cardH=1, gapX=0.5, gapY=0.7, GCOLS=3, GROWS=2;
  function gridWidth(){ const e=Math.tan(fovDeg()*Math.PI/180/2)*camZ(), t=e*(innerWidth/innerHeight), r=gCols(),
      n=innerWidth<768?3:2, o=innerWidth>=1440, s=innerWidth<768?0.18:isTab()?0.28:o?0.5:0.38, cc=innerWidth<768?0.22:isTab()?0.36:o?0.7:0.55;
    return Math.min((2*t*(innerWidth<768?0.88:isTab()?0.84:o?0.78:0.8)-(r-1)*s)/r,
                    (2*e*(innerWidth<768||isTab()?0.82:o?0.78:0.8)-(n-1)*cc)/n/ASPECT, innerWidth<768?99:isTab()?8.5:9.2); }
  function buildGrid(){
    grid.forEach(g=>scene.remove(g)); grid=[];
    GCOLS=gCols(); GROWS=innerWidth<768?3:2; const o=innerWidth>=1440;
    gapX=innerWidth<768?0.18:isTab()?0.28:o?0.5:0.38; gapY=innerWidth<768?0.22:isTab()?0.36:o?0.7:0.55;
    cardW=gridWidth(); cardH=cardW*ASPECT;
    const e=Math.tan(fovDeg()*Math.PI/180/2)*camZ(), r=fovDeg(); // px size for the SDF uniform
    const n=innerHeight/(2*Math.tan(r*Math.PI/180/2)*camZ()); const uSizePx=new T.Vector2(cardW*n, cardH*n);
    GRID_IDX.forEach((pi)=>{
      const geo=new T.PlaneGeometry(cardW, cardH, 20, 12);
      const card=getCard(pi);
      const mesh=new T.Mesh(geo, new T.ShaderMaterial({ uniforms:{ map:{value:card.vtex}, label:{value:card.ltex}, uSize:{value:uSizePx}, uRadius:{value:0} },
        vertexShader:"varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
        fragmentShader:gridFrag, side:T.DoubleSide, transparent:true }));
      mesh.visible=false; mesh.renderOrder=3; mesh.frustumCulled=false;
      const posArr=geo.attributes.position.array, cnt=posArr.length/3, restX=new Float32Array(cnt), restY=new Float32Array(cnt);
      for(let i=0;i<cnt;i++){ restX[i]=posArr[3*i]; restY[i]=posArr[3*i+1]; }
      mesh.userData={restX, restY, wave:1, waveT:0, waveFlat:false}; scene.add(mesh); grid.push(mesh);
    });
  }
  function gridSlot(e){ const col=e%GCOLS, row=Math.floor(e/GCOLS);
    return new T.Vector3(-(0.5*(GCOLS*cardW+(GCOLS-1)*gapX))+0.5*cardW+col*(cardW+gapX),
                          0.5*(GROWS*cardH+(GROWS-1)*gapY)-0.5*cardH-row*(cardH+gapY), 0); }
  function applyWave(mesh, amt, waveT, e){
    const pos=mesh.geometry.attributes.position, {restX,restY}=mesh.userData;
    const s=cardW, l=cardH, c=GCOLS, u=e%c, d=Math.floor(e/c), f=u>0 && u<c-1;
    for(let i=0;i<pos.count;i++){ const cc=restX[i], hh=restY[i]; let nn;
      if(f) nn=1-(hh/l+0.5);
      else { const ee=cc/s+0.5, tt=1-(hh/l+0.5);
        nn = u===0 ? (d===0? ee+tt : ee+1-tt)*0.5 : (d===0? 1-ee+tt : 1-ee+1-tt)*0.5; }
      pos.setXYZ(i, cc, hh, amt*nn*Math.sin(nn*Math.PI*0.9 - 2*waveT)*s*0.12);
    }
    pos.needsUpdate=true;
  }
  buildGrid(); addEventListener("resize", size);

  // ---- hover tooltips on the settled grid cards (raycast -> DOM tip; subtle cross-fade on card change) ----
  let curH=0;
  (function(){
    const ray=new T.Raycaster();
    const tip=document.createElement("div"); tip.className="dm-tip";
    tip.style.cssText="position:fixed;z-index:60;max-width:290px;padding:14px 16px;background:rgba(10,14,20,.93);border:1px solid rgba(57,241,224,.4);color:#eaf6f5;font:400 14px/1.55 Inter,Helvetica,Arial,sans-serif;pointer-events:none;opacity:0;transform:translateY(8px);transition:opacity .28s cubic-bezier(.22,1,.36,1),transform .28s cubic-bezier(.22,1,.36,1);box-shadow:0 12px 40px rgba(0,0,0,.5)";
    const tipT=document.createElement("div"); tipT.style.cssText="font-weight:600;letter-spacing:.03em;color:#39F1E0;margin-bottom:6px;font-size:12px;text-transform:uppercase";
    const tipB=document.createElement("div"); tip.appendChild(tipT); tip.appendChild(tipB);
    (document.body||document.documentElement).appendChild(tip);
    let hoverI=-1, shownI=-1, swap=null;
    function render(e){ const ci=GRID_IDX[e]; tipT.textContent=CARDS[ci][1]; tipB.textContent=DESC[ci]; shownI=e; }
    function hide(){ if(hoverI===-1) return; hoverI=-1; if(swap){ clearTimeout(swap); swap=null; } tip.style.opacity="0"; tip.style.transform="translateY(8px)"; canvas.style.cursor=""; }
    // grid card under the pointer, or -1 while the grid has not settled / nothing is hit
    function hitAt(ev){
      if(curH<0.72) return -1;
      const rect=canvas.getBoundingClientRect();
      const nx=((ev.clientX-rect.left)/rect.width)*2-1, ny=-((ev.clientY-rect.top)/rect.height)*2+1;
      ray.setFromCamera({x:nx,y:ny}, camera);
      const hits=ray.intersectObjects(grid.filter(g=>g.visible), false);
      return hits.length ? grid.indexOf(hits[0].object) : -1;
    }
    function move(ev){
      const e=hitAt(ev);
      if(e<0){ hide(); return; }
      canvas.style.cursor="pointer";
      tip.style.left=Math.min(ev.clientX+18, innerWidth-306)+"px";
      tip.style.top=Math.min(ev.clientY+18, innerHeight-150)+"px";
      if(e===hoverI) return;                                   // same card -> just trail the cursor
      hoverI=e;
      if(shownI===-1){ render(e); tip.style.opacity="1"; tip.style.transform="translateY(0)"; return; }   // first appearance: rise + fade in
      // moved to a different card -> subtle cross-fade (the box stays put, the content dips out then back in)
      if(swap) clearTimeout(swap);
      tip.style.opacity="0";
      swap=setTimeout(function(){ if(hoverI===e){ render(e); tip.style.opacity="1"; } }, 190);
    }
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseleave", hide);
    // click (or tap) a settled card -> that service's panel on the Services page. Raycasts at the
    // click point itself, so it never depends on the tooltip's delayed cross-fade.
    canvas.addEventListener("click", function(ev){
      const e=hitAt(ev); if(e<0) return;
      location.href="/services#"+SLUG[GRID_IDX[e]];
    });
  })();

  // ---- scroll drive (Lenis-style continuous smoothing) ----
  const pin=document.getElementById("dmPin"), hwTop=document.getElementById("hwTop"), hwBottom=document.getElementById("hwBottom"),
        caption=document.getElementById("caption"), bar=document.getElementById("bar"), phaseEl=document.getElementById("phase");
  // the "View our services" underline IS the scroll progress bar: move the bar box under the link
  (function(){ var fc=document.querySelector(".dm .foot-cta"), bb=bar&&bar.parentElement;
    if(fc&&bb&&bb.classList.contains("bar")) fc.appendChild(bb); })();
  function pinProgress(){ const r=pin.getBoundingClientRect(); const total=pin.offsetHeight-innerHeight; return clamp(-r.top/total,0,1); }
  let gSmooth=0, last=performance.now();

  // fast-scroll freeze: while the section is being scrolled through quickly, pause the six
  // texture videos (a paused video keeps its last frame - invisible while cards are moving)
  // and resume ~0.3s after the scroll settles. Six concurrent decodes only when actually watched.
  let dmFast=false, dmCalmT=0, _gPrev=-1;
  function dmSetFast(fast){
    if(fast===dmFast) return; dmFast=fast;
    if(fast){ DMV.forEach(function(v){ if(!v.paused) v.pause(); }); }
    else if(dmVisible){ DMV.forEach(function(v,i){ setTimeout(function(){ if(dmVisible&&!dmFast){ const p=v.play(); if(p&&p.catch) p.catch(function(){}); } }, i*60); }); }
  }
  function tick(now){
    if(!dmVisible){ last=now; requestAnimationFrame(tick); return; }   // idle off-screen: no geometry math, no WebGL render
    const dt=Math.min(0.05,(now-last)/1000); last=now;
    { const gNow=gSmooth; const gv=_gPrev<0?0:Math.abs(gNow-_gPrev); _gPrev=gNow;
      if(gv>0.002){ if(dmCalmT){ clearTimeout(dmCalmT); dmCalmT=0; } dmSetFast(true); }
      else if(dmFast && !dmCalmT){ dmCalmT=setTimeout(function(){ dmCalmT=0; dmSetFast(false); }, 300); } }
    gSmooth += (pinProgress()-gSmooth)*(1-Math.pow(0.001, dt));    // ≈0.1/frame, matches Lenis
    const g=gSmooth;
    const P=Math.min(1, g/RIB_P_END);
    const H=clamp((g-EG)/(1-EG),0,1);
    curH=H;

    // ribbon
    const lead=P*(HLEN+EP)-EP+25;
    for(let e=0;e<RIB_N;e++){ const cardPos=lead+SPACING*e; const vis=P<1 && cardPos>0 && cardPos<HLEN;
      ribbon[e].visible=vis; if(vis) buildRibbonCard(ribbon[e], Math.min(cardPos, HLEN-0.001), ribbon[e].userData.hoverScale??1); }

    // grid + wave
    const U=Math.tan(fovDeg()*Math.PI/180/2)*camZ(), Yf=U*(innerWidth/innerHeight);
    for(let e=0;e<grid.length;e++){ const mesh=grid[e]; const r=clamp((H-0.08*e)/0.4,0,1);
      if(r<=0 && !mesh.userData.wave){ mesh.visible=false; continue; } mesh.visible=true;
      const n=1-Math.pow(1-r,3); const slot=gridSlot(e); const col=e%GCOLS, row=Math.floor(e/GCOLS);
      const l = e<GCOLS ? U+2*cardH : -U-2*cardH;
      const u = col===0 ? -Yf-2*cardW : col===GCOLS-1 ? Yf+2*cardW : slot.x;
      mesh.position.set(u+(slot.x-u)*n, l+(slot.y-l)*n, 0);
      mesh.userData.waveT += 1.08*dt;
      mesh.userData.wave = r<1 ? Math.min(1, mesh.userData.wave+1.8*dt) : Math.max(0, mesh.userData.wave-0.72*dt);
      if(mesh.userData.wave>0){ applyWave(mesh, mesh.userData.wave, mesh.userData.waveT, e); mesh.userData.waveFlat=false; }
      else if(!mesh.userData.waveFlat){ applyWave(mesh,0,mesh.userData.waveT,e); mesh.userData.waveFlat=true; }
    }

    // headline (DOM) — opposite directions, and caption fade (exact: max(0,1-4H))
    const hp=clamp(g/0.72,0,1);
    hwTop.style.transform=`translateX(${lerp(-100,100,hp)}vw)`;
    hwBottom.style.transform=`translateX(${lerp(100,-100,hp)}vw)`;
    caption.style.opacity=String(Math.max(0,1-4*H));
    phaseEl.textContent = H>0 ? "GRID" : "RIBBON"; bar.style.transform=`scaleX(${g})`;

    renderer.render(scene,camera);
    requestAnimationFrame(tick);
  }
  size(); requestAnimationFrame(tick);
})();
