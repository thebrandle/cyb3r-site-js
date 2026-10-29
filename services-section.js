/* ============================================================================
   CYB3R Media — Services scroll section (stacked, pinned panels)
   Self-contained: injects its own scoped CSS + markup right after the hero on
   the Services page, hides the old "Work in Motion" (.dm) section it replaces,
   builds 6 service panels (video left, copy right) and runs the pinned-stack
   scroll. Dark theme, sharp corners. Ported from the trionn-style section.
   Load once on the Services page (registered hosted script, footer).
   Deep links: /services#<slug> (slugs in the services array below; the homepage
   Design in Motion cards link here) lands on that service's panel.
   Each panel ends in a "Learn more" button to /<slug>, the service's own page (same
   button as the homepage Selected Works "Explore project"). Those pages are not built
   yet, so a button only appears once its page answers 200; /services?ctapreview shows all.
   ========================================================================== */
(function () {
  "use strict";
  if (window.__cybSvcSection) return; window.__cybSvcSection = 1;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ===== CONTENT: CYB3R's 6 services + videos (edit freely) =====
   * Videos moved off Cloudinary (account locked, every asset 401'd) to Supabase Storage.
   * The renditions are pre-encoded, not transformed on the fly, so the w_#### token lives
   * in the FILENAME - that keeps the existing .replace("w_1440","w_720") swap below working.
   * Available per clip: w_1440 (desktop), w_800, w_720 (mobile), w_640, w_480. */
  var V = "https://rmvgighiqekznberfkiz.supabase.co/storage/v1/object/public/media/svc/";
  var PLUS = "https://cdn.prod.website-files.com/6a293cec4280dd8c699d4d08/6a44c6196a38f1b057c124e8_svglogoplus.png"; /* CYB3R teal plus icon */
  var services = [
    { slug: "brand-identity", title: "Brand & Identity", caption: "Identity systems built to travel across every touchpoint.",
      desc: "Positioning, naming and visual identity that give your brand credibility, clarity and lasting recognition.",
      caps: ["Brand strategy & positioning", "Visual identity systems", "Logo & wordmark design", "Brand guidelines", "Creative direction", "Messaging & tone of voice"],
      video: V + "brand_w_1440.mp4" },
    { slug: "web-design-development", title: "Web Design & Development", caption: "Designed to perform on every screen.",
      desc: "High-fidelity websites and web apps designed to attract, engage and convert, built for speed and scale.",
      caps: ["Web design (UX/UI)", "Webflow & headless builds", "Responsive, motion-first interfaces", "Landing pages & funnels", "CMS & integrations", "Performance & SEO foundations"],
      video: V + "webui_w_1440.mp4" },
    { slug: "seo-google-ads", title: "SEO & Google Ads", caption: "Engineered to scale measurable growth.",
      desc: "Organic search and paid media built to put you in front of high-intent buyers and grow qualified pipeline.",
      caps: ["Technical & on-page SEO", "Content & link strategy", "Google Ads (Search, PMax)", "Paid media management", "Conversion tracking", "Reporting & optimisation"],
      video: V + "seoupsacled_w_1440.mp4" },
    { slug: "social-media-content", title: "Social Media & Content", caption: "Content that compounds attention into demand.",
      desc: "Social-first content and community that build audience, authority and a steady stream of inbound interest.",
      caps: ["Social strategy", "Content production", "Short-form video", "Community management", "Paid social", "Influencer & partnerships"],
      video: V + "socialmedia_w_1440.mp4" },
    { slug: "commercial-print-production", title: "Commercial Print & Production", caption: "Tactile brand experiences, produced end to end.",
      desc: "Print, packaging and physical collateral produced to the same standard as everything you do online.",
      caps: ["Print & packaging design", "Merchandise", "Large-format & signage", "Event & retail collateral", "Artwork & pre-press", "Production management"],
      video: V + "commercialprint_w_1440.mp4" },
    { slug: "ai-driven-advertising", title: "AI-Driven Advertising", caption: "Smarter campaigns, powered by automation.",
      desc: "AI-assisted creative, targeting and optimisation that make every ad dollar work harder across the funnel.",
      caps: ["AI creative & iteration", "Audience modelling", "Automated bidding & budgets", "Predictive optimisation", "Full-funnel measurement", "Continuous experimentation"],
      video: V + "aidriven_w_1440.mp4" }
  ];

  /* ===== scoped CSS (dark, sharp corners; all under .cyb-svc) ===== */
  var CSS =
  ".cyb-svc{--ink:#EDEDEF;--ink-2:#A7ACB4;--ink-dim:#727782;--line:rgba(255,255,255,.12);--line-2:rgba(255,255,255,.24);--accent:#39F1E0;--bg:#1A232D;--mono:ui-monospace,'SF Mono',Menlo,Consolas,monospace}" +
  ".cyb-svc *{box-sizing:border-box}" +
  ".cyb-svc .svc-pin{position:relative;height:800vh;background:var(--bg)}" +
  ".cyb-svc .svc-stage{position:sticky;top:0;height:100vh;overflow:hidden;background:var(--bg)}" +
  ".cyb-svc .panel{position:absolute;inset:0;display:flex;will-change:transform;background:var(--bg)}" +
  ".cyb-svc .pinner{position:absolute;inset:0;display:flex}" +
  ".cyb-svc .col-left{width:50%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;padding:5vh 3vw;background:#202A36}" +
  ".cyb-svc .panel.blk-dark .col-left{background:#39F1E0}" +
  ".cyb-svc .panel.blk-dark .p-caption{color:#0d1116}" +
  ".cyb-svc .p-caption{font-family:var(--mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink);text-align:center;max-width:32ch;line-height:1.5}" +
  ".cyb-svc .p-caption .w{display:inline-block;white-space:pre;will-change:filter,opacity}" +
  ".cyb-svc .v-card{position:relative;width:min(88%,660px);aspect-ratio:3/2;overflow:hidden;border-radius:0;background:#000;border:1px solid var(--line)}" +
  ".cyb-svc .v-card video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:0;display:block}" +
  ".cyb-svc .v-card .v-tag{position:absolute;left:0;right:0;bottom:0;padding:16px;font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#fff;background:linear-gradient(180deg,transparent,rgba(0,0,0,.74));display:flex;justify-content:space-between;align-items:flex-end;gap:10px}" +
  ".cyb-svc .v-card .v-tag b{color:var(--accent);font-weight:600}" +
  ".cyb-svc .divider{position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--line);z-index:5}" +
  ".cyb-svc .divider .x{position:absolute;left:50%;width:15px;height:15px;transform:translateX(-50%);object-fit:contain}" +
  ".cyb-svc .divider .x.t{top:9vh}.cyb-svc .divider .x.b{bottom:9vh}" +
  ".cyb-svc .col-right{width:50%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:8vh 5vw 8vh 4vw;background:var(--bg);color:var(--ink)}" +
  ".cyb-svc .col-right h2{font-weight:500;letter-spacing:-.02em;font-size:clamp(1.6rem,2.6vw,2.3rem);margin:0 0 18px;color:#fff}" +
  ".cyb-svc .col-right .s-desc{color:var(--ink-2);font-size:1rem;line-height:1.55;max-width:46ch;margin:0 0 40px}" +
  ".cyb-svc .col-right .s-label{font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-dim);margin-bottom:6px}" +
  ".cyb-svc .cap-row{position:relative;padding:16px 0}" +
  ".cyb-svc .cap-row .cap-line{position:absolute;left:0;top:0;height:1px;width:100%;background:var(--line);transform:scaleX(0);transform-origin:left}" +
  ".cyb-svc .cap-row .cap-txt{font-size:1.04rem;letter-spacing:-.01em;color:var(--ink)}" +
  "@media(max-width:860px){.cyb-svc .svc-pin{height:auto}.cyb-svc .svc-stage{position:static;height:auto;overflow:visible}.cyb-svc .panel{position:relative;inset:auto;flex-direction:column;transform:none!important}.cyb-svc .pinner{position:relative;inset:auto;flex-direction:column;transform:none!important}.cyb-svc .col-left,.cyb-svc .col-right{width:100%}.cyb-svc .divider{display:none}.cyb-svc .col-left{padding:40px 24px}.cyb-svc .col-right{padding:34px 24px 48px}.cyb-svc .cap-row .cap-line{transform:scaleX(1)!important}}" +
  "@media (prefers-reduced-motion:reduce){.cyb-svc .cap-row .cap-line{transform:scaleX(1)!important}.cyb-svc .p-caption .w{opacity:1!important;filter:none!important}}" +
  /* "Learn more" = the homepage Selected Works button (cyb3r-sections.css), rescoped */
  ".cyb-svc .cta-row{ margin-top:28px; }" +
  ".cyb-svc .button_wrapper{ --step:30ms; --base-dur:300ms; --dur-step:30ms; --run:28px; --out-time:200ms; --in-time:320ms; --ul-out-time:1000ms; --ul-in-time:500ms; --arrow-gap:10px; --inset-min:8px; position:relative; display:inline-block; }" +
  ".cyb-svc .button_wrapper .btn{ position:relative; display:block; text-decoration:none; color:var(--ink); font-family:\"Inter\",Helvetica,Arial,system-ui,sans-serif; font-weight:500; text-transform:none; letter-spacing:-.5px; font-size:1rem; padding:8px 0 10px; width:15rem; overflow:hidden; cursor:pointer; }" +
  ".cyb-svc .button_wrapper .word{ display:inline-flex; transform:translate(0); position:relative; z-index:1; }" +
  ".cyb-svc .button_wrapper .text{ display:inline-block; white-space:pre; transition-property:transform; transition-duration:var(--dur,var(--base-dur)); transition-timing-function:ease; transition-delay:var(--delay,0s); transform:translate(0); }" +
  ".cyb-svc .button_wrapper.is-hovered .text{ transform:translateX(var(--group-move,0px)); }" +
  ".cyb-svc .button_wrapper .arrow{ position:absolute; top:50%; transform:translateY(-50%); width:20px; height:1em; overflow:hidden; }" +
  ".cyb-svc .button_wrapper .arrow.arrow-right{ right:2px; }" +
  ".cyb-svc .button_wrapper .arrow.arrow-left{ left:0; }" +
  ".cyb-svc .button_wrapper .arrow-sprite{ display:inline-block; will-change:transform,opacity; }" +
  ".cyb-svc .button_wrapper .u-right, .cyb-svc .button_wrapper .u-left{ position:absolute; left:0; bottom:2px; height:1px; width:100%; }" +
  ".cyb-svc .button_wrapper .u-right{ background:var(--ink); }" +
  ".cyb-svc .button_wrapper .u-left{ background:var(--accent); }" +
  ".cyb-svc .button_wrapper:focus-visible{ outline:2px solid var(--accent); outline-offset:3px; }" +
  ".dm{display:none!important}"; /* replaces the old Work in Motion section */

  function boot() {
    if (document.querySelector(".cyb-svc")) return;
    var mc = document.querySelector(".main-content"); if (!mc) return;
    var st = document.createElement("style"); st.id = "cyb-svc-css"; st.textContent = CSS; document.head.appendChild(st);
    var hero = mc.querySelector(".hero.for-inner");
    var wrap = document.createElement("div"); wrap.className = "cyb-svc";
    wrap.innerHTML = '<div class="svc-pin" id="svcPin"><div class="svc-stage" id="svcStage"></div></div>';
    // Prefer the native Designer host (.svc-scroll-host, placed after the hero) so the user can
    // control the section's outer padding/margin in the Webflow editor. Fallback: inject after hero.
    var host = document.querySelector(".svc-scroll-host");
    if (host) host.appendChild(wrap);
    else if (hero) hero.insertAdjacentElement("afterend", wrap);
    else mc.insertBefore(wrap, mc.firstChild);
    build();
  }

  /* Selected Works button, verbatim from cyb3r-sections.js makeButton (keep the two in step) */
  function makeButton(label, opts){
    opts=opts||{};
    const wrap=document.createElement("span"); wrap.className="button_wrapper";
    const btn=document.createElement("a"); btn.className="btn"; btn.href=opts.href||"#";
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
      let target; if(mode==="in") target=br.right-padR+1;
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

  function build() {
    var N = services.length;
    var stage = document.getElementById("svcStage");
    var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); };
    var panels = services.map(function (s, i) {
      var p = document.createElement("div");
      p.className = "panel blk-" + (i % 2 ? "dark" : "light"); p.style.zIndex = String(10 + i);
      p.innerHTML =
        '<div class="pinner">' +
          '<div class="col-left">' +
            '<div class="p-caption" data-cap>' + esc(s.caption) + '</div>' +
            '<div class="v-card"><video muted loop playsinline preload="metadata" src="' + (innerWidth <= 820 ? s.video.replace("w_1440", "w_720").replace("q_auto:best", "q_auto") : s.video) + '"></video>' +
              '<div class="v-tag"><span>' + esc(s.title) + '</span><b>0' + (i + 1) + ' / 0' + N + '</b></div></div>' +
          '</div>' +
          '<div class="divider"><img class="x t" src="' + PLUS + '" alt=""><img class="x b" src="' + PLUS + '" alt=""></div>' +
          '<div class="col-right">' +
            '<h2>' + esc(s.title) + '</h2>' +
            '<p class="s-desc">' + esc(s.desc) + '</p>' +
            '<div class="s-label">Our core capabilities</div>' +
            s.caps.map(function (c) { return '<div class="cap-row"><span class="cap-line"></span><span class="cap-txt">' + esc(c) + '</span></div>'; }).join("") +
            '<div class="cta-row" hidden></div>' +
          '</div>' +
        '</div>';
      stage.appendChild(p);
      return { el: p, vid: p.querySelector("video"), capEl: p.querySelector("[data-cap]"),
        capWords: null, lines: [].slice.call(p.querySelectorAll(".cap-line")), revealed: false };
    });

    panels.forEach(function (pn) {
      var el = pn.capEl, text = el.textContent; el.textContent = "";
      pn.capWords = text.split(" ").map(function (w, i, arr) {
        var s = document.createElement("span"); s.className = "w"; s.textContent = w + (i < arr.length - 1 ? " " : ""); el.appendChild(s); return s;
      });
    });

    function reveal(pn) {
      if (pn.vid) { try { var pr = pn.vid.play(); if (pr && pr.catch) pr.catch(function () {}); } catch (e) {} }
      pn.capWords.forEach(function (w, i) {
        w.style.opacity = "0"; w.style.filter = "blur(10px)";
        w.animate([{ opacity: 0, filter: "blur(10px)" }, { opacity: 1, filter: "blur(0px)" }], { duration: 600, delay: i * 60, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" });
      });
      pn.lines.forEach(function (ln, i) {
        ln.style.transform = "scaleX(0)";
        ln.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 900, delay: i * 80, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" });
      });
    }
    function hide(pn) {
      if (pn.vid) { try { pn.vid.pause(); } catch (e) {} }
      pn.capWords.forEach(function (w) { w.getAnimations().forEach(function (a) { a.cancel(); }); w.style.opacity = "0"; w.style.filter = "blur(10px)"; });
      pn.lines.forEach(function (ln) { ln.getAnimations().forEach(function (a) { a.cancel(); }); ln.style.transform = "scaleX(0)"; });
    }

    panels.forEach(function (pn, i) { pn.el.style.transform = "translateY(" + (i === 0 ? 0 : 100) + "%)"; if (i > 0) hide(pn); });
    panels[0].revealed = true;
    if (reduce) panels.forEach(reveal);

    var pin = document.getElementById("svcPin");

    /* perf: the loop idles while the section is off-screen; videos pause when the section
     * leaves view AND when a panel is fully covered by the next one (before this, scrolling
     * to the last panel left all six videos decoding at once - the scroll jank). The first
     * panel's reveal (incl. its video) waits for the section to actually approach. */
    var svcVisible = false, started = reduce, svcPauseT = 0;
    function pauseAll() { panels.forEach(function (pn) { if (pn.vid && !pn.vid.paused) pn.vid.pause(); }); }
    function resumeTop() { panels.forEach(function (pn) { if (pn.revealed && !pn.covered && pn.vid && pn.vid.paused) { var p = pn.vid.play(); if (p && p.catch) p.catch(function () {}); } }); }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        for (var i = 0; i < es.length; i++) {
          svcVisible = es[i].isIntersecting;
          if (svcVisible) {
            if (svcPauseT) { clearTimeout(svcPauseT); svcPauseT = 0; }
            if (!started) { started = true; reveal(panels[0]); } else resumeTop();
          } else if (!svcPauseT) {
            svcPauseT = setTimeout(function () { svcPauseT = 0; if (!svcVisible) pauseAll(); }, 700);
          }
        }
      }, { rootMargin: "250px" }).observe(pin);
    } else { svcVisible = true; if (!started) { started = true; reveal(panels[0]); } }

    var progress = 0, _last = performance.now(), applied = -1;
    function targetProgress() { var r = pin.getBoundingClientRect(); var total = pin.offsetHeight - innerHeight; return clamp(-r.top / total, 0, 1); }
    var SEG = N - 1;
    function render() {
      if (!svcVisible) { _last = performance.now(); requestAnimationFrame(render); return; }
      var target = targetProgress();
      progress = reduce ? target : progress + (target - progress) * (1 - Math.pow(0.0016, Math.min(0.05, (performance.now() - _last) / 1000)));
      _last = performance.now();
      if (Math.abs(progress - target) < 0.0002) progress = target;              // snap once converged
      if (progress === applied) { requestAnimationFrame(render); return; }      // settled: skip all writes
      applied = progress;
      panels.forEach(function (pn, i) {
        if (i === 0) return;                                                    // panel 0 never moves
        var segStart = (i - 1) / SEG, span = 1 / SEG;
        var raw = clamp((progress - segStart) / span, 0, 1);
        var slide = clamp(raw / 0.7, 0, 1);
        var tf = "translateY(" + ((1 - slide) * 100) + "%)";
        if (pn.el.style.transform !== tf) pn.el.style.transform = tf;
        if (slide > 0.25 && !pn.revealed) { pn.revealed = true; reveal(pn); }
        if (slide < 0.05 && pn.revealed) { pn.revealed = false; hide(pn); }
        var below = panels[i - 1];
        if (slide >= 0.999) {
          if (!below.covered) { below.covered = true; if (below.vid && !below.vid.paused) below.vid.pause(); }
        } else if (below.covered) {
          below.covered = false;
          if (below.revealed && below.vid && below.vid.paused) { var pr = below.vid.play(); if (pr && pr.catch) pr.catch(function () {}); }
        }
      });
      requestAnimationFrame(render);
    }
    render();

    /* "Learn more" -> /<slug>, the service's own page. Hidden until that page answers 200 (it 404s
     * until published), so a page going live shows its button with no code change. */
    var ctaPreview = /[?&]ctapreview\b/.test(location.search);
    panels.forEach(function (pn, i) {
      var row = pn.el.querySelector(".cta-row"), href = "/" + services[i].slug;
      function show() { row.appendChild(makeButton("Learn more", { href: href })); row.hidden = false; }
      if (ctaPreview) return show();
      fetch(href, { method: "HEAD" }).then(function (r) { if (r.ok) show(); }).catch(function () {});
    });

    /* deep link: /services#<slug> scrolls to that service's panel. Desktop = the pinned stack, so
     * scroll to the point where panel i has fully slid in (slide ends at 70% of its segment; 85%
     * leaves margin before the next panel starts). <=860px the panels sit in normal flow, so scroll
     * to the panel itself, clear of the fixed header. Re-runs on load (late fonts/images above can
     * shift the pin) unless the visitor has already scrolled, and follows later hash changes. */
    function hashIndex() {
      var slug = decodeURIComponent((location.hash || "").slice(1)).toLowerCase(), hit = -1;
      services.forEach(function (s, k) { if (s.slug === slug) hit = k; });
      return hit;
    }
    function goTo(i, smooth) {
      var y;
      if (innerWidth <= 860) {
        var nt = document.querySelector(".navigation-top");
        y = panels[i].el.getBoundingClientRect().top + scrollY - Math.min(nt ? nt.offsetHeight : 70, 120);
      } else {
        var top = pin.getBoundingClientRect().top + scrollY, total = pin.offsetHeight - innerHeight;
        y = top + (i === 0 ? 0 : (i - 1 + 0.85) / SEG) * total;
      }
      window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: smooth ? "smooth" : "auto" });
      return Math.round(window.scrollY);
    }
    var deep = hashIndex();
    if (deep > -1) {
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      var landed = goTo(deep, false);
      addEventListener("load", function () {
        if (Math.abs(window.scrollY - landed) < 4) landed = goTo(deep, false);
      });
    }
    addEventListener("hashchange", function () { var i = hashIndex(); if (i > -1) goTo(i, true); });
  }

  if (document.readyState !== "loading") boot(); else document.addEventListener("DOMContentLoaded", boot);
})();
