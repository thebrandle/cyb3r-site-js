/* ============================================================================
   CYB3R Media - homepage services (akaru.fr "Expertises" layout)
   Drives the .sx section in an HtmlEmbed on the homepage (markup + CSS: home-services/). Desktop: the stage
   pins for 100vh + 5 x 110vh and the scroll position p (0..5) places every panel: the active one fills the
   screen, the next two wait on the right as strips (20% and 5% of the width), and each panel's video shrinks
   to fill its strip, right-aligned to the following panel and resting on one baseline. Panel contents never
   move on screen (each panel's inner layer is counter-translated), so a new panel wipes across the old text.
   Every panel carries its own copy of the heading and the progress row in its own ink colour, which keeps
   them readable wherever a light and a dark panel meet. The site header turns dark over light panels.
   Videos (the service clips, poster first) load and play only while their panel is on screen. "Learn more" is
   the Services page button (makeButton below). Phones, tablets and reduced motion get stacked cards (CSS).
   ========================================================================== */
(function () {
  "use strict";
  var root = document.querySelector(".sx");
  if (!root || root.dataset.sxReady) return;
  root.dataset.sxReady = "1";
  var AR = 800 / 560, STEP = 1.1;   // clip aspect; scroll per panel, in viewport heights (CSS .sx-pin uses the same 110vh)
  var pin = root.querySelector(".sx-pin");
  var head = root.querySelector(".sx-stage > .sx-head"), nav = root.querySelector(".sx-stage > .sx-nav");
  var panels = [].slice.call(root.querySelectorAll(".sx-panel")), N = panels.length;
  var html = document.documentElement, logo = document.querySelector(".navigation-top .logo-first"), burger = document.querySelector(".navigation-top .hamburger-flex");
  var mq = matchMedia("(min-width: 992px) and (prefers-reduced-motion: no-preference)");
  var items = null, L = null, raf = 0, lastP = -1, near = false;
  var still = matchMedia("(prefers-reduced-motion: reduce)").matches || !!(navigator.connection && navigator.connection.saveData);
  var videos = panels.map(function (el) { return el.querySelector(".sx-media video"); });

  /* ---- service clips: poster until needed, src set once, start at the poster's second ---- */
  function load(v) {
    if (!v || v.dataset.on) return;
    v.dataset.on = "1";
    v.addEventListener("loadedmetadata", function () { var t = parseFloat(v.dataset.t) || 0; if (t < v.duration) v.currentTime = t; }, { once: true });
    v.src = innerWidth <= 820 ? v.dataset.srcSm : v.dataset.src;
    v.preload = "auto";
  }
  function run(v, on) {
    if (!v) return;
    if (on && !still) { load(v); if (v.paused) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } }
    else if (!v.paused) v.pause();
  }

  /* ---- heading letters rise once as the section comes into view ---- */
  function split(el) {
    var t = el.textContent; el.textContent = "";
    t.split("").forEach(function (ch, i) {
      var w = document.createElement("span"), c = document.createElement("span");
      w.className = "sx-cw"; c.className = "sx-c"; c.style.setProperty("--i", i); c.textContent = ch === " " ? " " : ch;
      w.appendChild(c); el.appendChild(w);
    });
  }

  /* ---- desktop: a heading + progress copy inside every panel ---- */
  function build() {
    items = panels.map(function (el) {
      var inner = el.querySelector(".sx-inner");
      var h = document.createElement("div"); h.className = "h1 for-h2 sx-head sx-copy"; h.setAttribute("aria-hidden", "true");
      h.innerHTML = head.querySelector(".sx-head-v").outerHTML;
      var n = nav.cloneNode(true); n.classList.add("sx-copy");
      inner.insertBefore(h, inner.firstChild); inner.appendChild(n);
      [].forEach.call(h.querySelectorAll(".sx-head-v"), function (v) { if (!v.querySelector(".sx-c")) split(v); });
      return { el: el, inner: inner, head: h, media: el.querySelector(".sx-media"), video: el.querySelector(".sx-media video"), dark: el.classList.contains("sx-dark"),
               bar: n.querySelector(".sx-nav-bar span"), titles: [].slice.call(n.querySelectorAll(".sx-nav-t")), x: 0 };
    });
    root.classList.add("sx-live");
  }

  /* panel left edge for a panel d steps away from the active one (d < 0 = already passed) */
  function X(d) {
    var W = L.W, s1 = L.s1, s2 = L.s2;
    if (d <= -1) return -W;
    if (d <= 0) return d * W;
    if (d <= 1) return d * (W - s1);
    if (d <= 2) return W - s1 + (d - 1) * (s1 - s2);
    if (d <= 3) return W - s2 + (d - 2) * s2;
    return W;
  }
  /* video [left, width]: fills the panel's strip, right-aligned to the next panel; a passing one drifts left and shrinks */
  function photo(d) {
    var iw = L.iw, S1 = L.s1 - L.s2, S2 = L.s2, w;
    if (d < 0) { var t = Math.min(-d, 1); return [L.xA - t * L.W * 0.233, iw * (1 - 0.2 * t)]; }
    if (d <= 1) w = iw + (S1 - iw) * d;
    else if (d <= 2) w = S1 + (S2 - S1) * (d - 1);
    else w = Math.max(0, S2 * (3 - d));
    return [X(d + 1) - w, w];
  }

  function layout() {
    var W = root.clientWidth, H = innerHeight;
    var gx = W * 0.1111, s1 = W * 0.2, s2 = W * 0.05;
    var ht = Math.max(H * 0.12, 96), hh = (items ? items[0].head : head).getBoundingClientRect().height || 84;   // heading = site title size
    var ib = H * 0.814, iw = W / 3, minTop = ht + hh + H * 0.05;
    if (ib - iw / AR < minTop) iw = Math.max(W * 0.18, (ib - minTop) * AR);   // short screens: smaller video, never under the heading
    L = { W: W, H: H, s1: s1, s2: s2, iw: iw, ib: ib, xA: W - s1 - iw, step: H * STEP };
    var s = root.style;
    s.setProperty("--sx-gx", gx + "px"); s.setProperty("--sx-ht", ht + "px");
    s.setProperty("--sx-cw", Math.max(240, L.xA - gx - W * 0.03) + "px"); s.setProperty("--sx-iw", iw + "px");
    var nt = Math.max(H * 0.919, ib + 44), tallest = 0;
    panels.forEach(function (el) { tallest = Math.max(tallest, el.querySelector(".sx-content").offsetHeight); });
    // text top = video top, but on short screens lifted clear of the progress row (never above the heading)
    s.setProperty("--sx-ct", Math.max(ht + hh + H * 0.03, Math.min(ib - iw / AR, nt - 28 - tallest)) + "px");
    s.setProperty("--sx-nt", nt + "px");
    var lr = logo && logo.getBoundingClientRect(), br = burger && burger.getBoundingClientRect();
    L.logoX = lr ? lr.left + Math.min(lr.width, 180) / 2 : 120;
    L.burgerX = br && br.width ? br.left + br.width / 2 : W - 54;
    L.bandY = br && br.height ? br.top + br.height / 2 : 70;
    lastP = -1;
  }

  function darkAt(x) {   // the topmost visible panel under screen x
    for (var i = N - 1; i >= 0; i--) if (!items[i].off && items[i].x <= x) return items[i].dark;
    return items[0].dark;
  }

  function frame() {
    raf = 0;
    if (!L || !items) return;
    var r = pin.getBoundingClientRect(), p = Math.min(N - 1, Math.max(0, -r.top / L.step));
    if (p !== lastP) {
      lastP = p;
      var sc = ((p + 1) / N).toFixed(4), reached = Math.floor(p + 0.75);
      items.forEach(function (it, i) {
        var d = i - p, off = d >= 3 || d <= -1;
        it.off = off; it.x = X(d);
        it.el.style.visibility = off ? "hidden" : "";
        it.el.classList.toggle("sx-peek", d > 0.5);
        if (!off) {
          var m = photo(d);
          it.el.style.transform = "translate3d(" + it.x.toFixed(2) + "px,0,0)";
          it.inner.style.transform = "translate3d(" + (-it.x).toFixed(2) + "px,0,0)";
          it.media.style.transform = "translate3d(" + m[0].toFixed(2) + "px," + (L.ib - m[1] / AR).toFixed(2) + "px,0) scale(" + (m[1] / L.iw).toFixed(4) + ")";
        }
        if (d < 1.6 && near) load(it.video);   // the next panel's clip is ready before it slides in
        it.bar.style.transform = "scaleX(" + sc + ")";
        it.titles.forEach(function (t, k) { t.classList.toggle("on", k <= reached); });
      });
    }
    items.forEach(function (it, i) { var d = i - p; run(it.video, near && !it.off && d > -1 && d <= 0.9); });   // active + the one wiping in or out
    var cover = r.top <= L.bandY && r.bottom >= L.bandY;   // the pinned stage is behind the header
    header(cover, darkAt(L.logoX), darkAt(L.burgerX));
  }
  function header(cover, dark1, dark2) {
    html.classList.toggle("sx-cover", cover);
    html.classList.toggle("sx-logo-dark", cover && !dark1);
    html.classList.toggle("sx-menu-dark", cover && !dark2);
  }
  /* stacked cards: the card under the header decides, or its photo (all dark) while the stack scrolls away */
  function stackFrame() {
    raf = 0;
    if (L || !near) return;
    var y = burger && burger.offsetWidth ? burger.getBoundingClientRect().top + 10 : 30;
    for (var i = N - 1; i >= 0; i--) {
      var r = panels[i].getBoundingClientRect();
      if (r.top <= y && r.bottom >= y) {
        var m = panels[i].querySelector(".sx-media").getBoundingClientRect(), dark = (m.top <= y && m.bottom >= y) || panels[i].classList.contains("sx-dark");
        return header(true, dark, dark);
      }
    }
    header(false);
  }
  function request() { if (!raf) raf = requestAnimationFrame(L ? frame : stackFrame); }

  function scrollToPanel(i, smooth) {
    var top = pin.getBoundingClientRect().top + scrollY + i * L.step;
    window.scrollTo({ top: Math.round(top), behavior: smooth ? "smooth" : "auto" });
  }

  function on() {
    if (!items) build();
    layout(); frame();
  }
  function off() {
    if (items) items.forEach(function (it) { it.el.style.transform = it.inner.style.transform = it.media.style.transform = it.el.style.visibility = ""; it.el.classList.remove("sx-peek"); });
    videos.forEach(function (v) { run(v, false); });
    header(false);
    L = null; request();
  }

  function headerHeight() {   // card top band = the header's height (stacked layout)
    var nb = document.querySelector(".navigation-top .navbar");
    if (nb && nb.offsetHeight) root.style.setProperty("--sx-hh", nb.offsetHeight + 8 + "px");
  }

  /* the Services page "Learn more" button, verbatim from services-section.js makeButton (keep the copies in step) */
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

  /* the static "Learn more" links become the Services page button; the full name stays as the accessible name */
  [].forEach.call(root.querySelectorAll("a.sx-cta"), function (a) {
    var wrap = makeButton("Learn more", { href: a.getAttribute("href") });
    wrap.querySelector(".btn").setAttribute("aria-label", a.textContent.replace(/\s+/g, " ").trim());
    a.parentNode.replaceChild(wrap, a);
  });

  headerHeight();
  [].forEach.call(root.querySelectorAll(".sx-head-v"), split);
  root.classList.add("sx-split");
  if (mq.matches) on();
  var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { root.classList.add("is-in"); io.disconnect(); } }, { rootMargin: "0px 0px -35% 0px" });
  io.observe(root.querySelector(".sx-stage"));
  new IntersectionObserver(function (es) {
    near = es[0].isIntersecting;
    if (!near) { videos.forEach(function (v) { run(v, false); }); if (!L) header(false); }
    request();
  }).observe(root);
  // stacked cards: a clip plays while a third of it is on screen
  var vio = new IntersectionObserver(function (es) { if (!L) es.forEach(function (e) { run(e.target, e.intersectionRatio >= 0.34); }); }, { threshold: [0, 0.34] });
  videos.forEach(function (v) { if (v) vio.observe(v); });

  addEventListener("scroll", function () { if (L || near) request(); }, { passive: true });
  addEventListener("resize", function () { headerHeight(); if (L) layout(); request(); });
  (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(function () { if (mq.matches) on(); else off(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (L) { layout(); request(); } });

  // keyboard: tabbing to a panel's Learn more brings that panel in; clicking a waiting strip scrolls to it
  root.addEventListener("focusin", function (e) {
    if (!L || !e.target.matches(":focus-visible")) return;
    var i = panels.indexOf(e.target.closest(".sx-panel"));
    if (i > -1 && Math.abs(lastP - i) > 0.01) scrollToPanel(i, false);
  });
  root.addEventListener("click", function (e) {
    if (!L || e.target.closest("a")) return;
    var i = panels.indexOf(e.target.closest(".sx-panel"));
    if (i > -1 && i - lastP > 0.5) scrollToPanel(i, true);
  });
})();
