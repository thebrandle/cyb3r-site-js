/* cyb3rLandingNW - Relevance Advertising in the brand-nw.com home layout (markup + CSS: landing-nw/embed-*.html).
 * Motion follows brand-nw.com: a navy intro curtain, eased wheel/keyboard scrolling, the page gliding half a screen
 * down once the film has run (unless the visitor moved first), statements rising line by line, mono labels decoding,
 * labels and side copy lagging the scroll, magnetic links, a scroll-scrubbed logo strip, a brand-name strip that
 * drifts with scroll speed, a scroll-linked example rail whose cards open from the bottom, fixed-layer image bands,
 * floating statements, a one-open accordion, the floating Discovery Call badge, a pop-up that opens as a circle
 * from the click, a veil that rises before leaving for another page, and a teal light thread that winds through
 * the page after the hero (WebGL, after ysuriadesign.co). The hero film is a muted loop; "Watch the
 * video" or a click on the film restarts it with sound and controls. The Discovery Call modal (second block) moves
 * the page's NATIVE Webflow form (#cybDiscoveryNative) into it, so submissions still land in Webflow. */
(function () {
  if (window.__lnw) return; window.__lnw = 1;
  var root = document.getElementById('lnw');
  if (!root) return;
  var html = document.documentElement, body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = window.matchMedia('(hover: none)').matches || 'ontouchstart' in window;
  var fine = !touch && window.matchMedia('(pointer: fine)').matches;
  function $$(s, el) { return Array.prototype.slice.call((el || root).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function maxScroll() { return Math.max(0, html.scrollHeight - window.innerHeight); }
  /* 0 while the element enters at the bottom, 1 once it has left at the top */
  function progress(el) {
    var r = el.getBoundingClientRect(), vh = window.innerHeight;
    return clamp((vh - r.top) / (vh + r.height), 0, 1);
  }

  /* ---- one loop for the eased scroll and every scroll-linked effect; it sleeps while nothing moves */
  var SS = { target: window.pageYOffset, current: window.pageYOffset, last: window.pageYOffset, ease: 0.085, locked: false,
    on: !reduce && !touch && !html.classList.contains('lenis') && !window.lenis };
  var ticks = [], running = false;
  function onTick(fn) { ticks.push(fn); }
  function loop() {
    var busy = false;
    if (SS.on && !SS.locked) {
      if (Math.abs(window.pageYOffset - SS.last) > 2) SS.target = SS.current = window.pageYOffset;   /* anchor, scrollbar, another script */
      SS.target = clamp(SS.target, 0, maxScroll());
      var prev = SS.current;
      SS.current += (SS.target - SS.current) * SS.ease;
      if (Math.abs(SS.target - SS.current) < 0.1) SS.current = SS.target;
      if (Math.round(SS.current) !== Math.round(prev)) window.scrollTo(0, SS.current);
      SS.last = window.pageYOffset;
      if (SS.current !== SS.target) busy = true;
    }
    for (var i = 0; i < ticks.length; i++) if (ticks[i]()) busy = true;
    if (busy) requestAnimationFrame(loop); else running = false;
  }
  function kick() { if (!running) { running = true; requestAnimationFrame(loop); } }
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  function scrollToY(y) {
    if (SS.on) { SS.last = window.pageYOffset; SS.target = clamp(y, 0, maxScroll()); kick(); }
    else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  }
  function jumpTo(y) { window.scrollTo(0, y); SS.target = SS.current = SS.last = window.pageYOffset; }

  /* overlays (the pop-up, the site menu) keep their own native scrolling */
  function nativeZone(t) { return !!(t && t.closest && t.closest('.cyb-modal, .fixed-menu, [data-lenis-prevent], textarea, select')); }
  function pageFrozen() { return getComputedStyle(html).overflow === 'hidden' || getComputedStyle(body).overflow === 'hidden'; }
  if (SS.on) {
    html.classList.add('lnw-smooth');
    window.addEventListener('wheel', function (e) {
      if (SS.locked || e.ctrlKey || nativeZone(e.target) || pageFrozen()) return;
      e.preventDefault();
      var d = e.deltaY;
      if (e.deltaMode === 1) d *= 22; else if (e.deltaMode === 2) d *= window.innerHeight;
      SS.target = clamp(SS.target + d, 0, maxScroll()); kick();
    }, { passive: false });
    window.addEventListener('keydown', function (e) {
      if (SS.locked || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target;
      if (t && (/^(input|textarea|select|button)$/i.test(t.tagName) || t.isContentEditable || t.getAttribute('role') === 'slider')) return;
      if (nativeZone(t) || pageFrozen()) return;
      var h = window.innerHeight, d = null;
      if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) d = h * 0.9;
      else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) d = -h * 0.9;
      else if (e.key === 'ArrowDown') d = 120;
      else if (e.key === 'ArrowUp') d = -120;
      else if (e.key === 'Home') d = -SS.target;
      else if (e.key === 'End') d = maxScroll() - SS.target;
      if (d === null) return;
      e.preventDefault(); SS.target = clamp(SS.target + d, 0, maxScroll()); kick();
    });
  }

  /* ---- header height (portrait hero sits below it) */
  function headerHeight() {
    var logo = document.querySelector('.navigation-top .logo-first, .navigation-top a img, .navigation-top img');
    var h = logo ? logo.getBoundingClientRect().bottom + 22 : 92;
    root.style.setProperty('--lnw-hh', Math.round(clamp(h, 64, 140)) + 'px');
  }
  headerHeight();
  window.addEventListener('load', headerHeight);

  /* ---- statements rise line by line: words are measured, grouped into lines, each line in its own mask */
  var stmts = $$('.lnw-stmt[data-split]');
  function splitLines(el) {
    if (el.__orig == null) el.__orig = el.innerHTML;
    el.innerHTML = el.__orig;
    if (!el.offsetParent || el.getBoundingClientRect().width < 80) return false;
    var words = [];
    (function walk(node, cls) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span');
            if (cls) w.className = cls;
            w.style.display = 'inline-block'; w.textContent = p;
            words.push(w); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) {
          /* the muted lead-in hands its class to each word, so a line can break inside it */
          walk(n, ((cls ? cls + ' ' : '') + (n.className || '')).trim());
          while (n.firstChild) node.insertBefore(n.firstChild, n);
          node.removeChild(n);
        }
      });
    })(el, '');
    var tol = Math.max(8, parseFloat(getComputedStyle(el).fontSize) * 0.45), lines = [], cur = [], top = null;
    words.forEach(function (w) {
      var t = w.offsetTop;
      if (top === null) top = t;
      if (t - top > tol) { lines.push(cur); cur = []; top = t; }
      cur.push(w);
    });
    if (cur.length) lines.push(cur);
    if (lines.length > 3 && lines.length === words.length) { el.innerHTML = el.__orig; return false; }   /* measured under a broken layout */
    el.innerHTML = '';
    lines.forEach(function (ln, i) {
      var line = document.createElement('span'), inner = document.createElement('span');
      line.className = 'lnw-line'; inner.style.transitionDelay = (i * 0.075) + 's';
      ln.forEach(function (w, k) { if (k) inner.appendChild(document.createTextNode(' ')); inner.appendChild(w); });
      line.appendChild(inner);
      if (i) el.appendChild(document.createTextNode(' '));   /* keeps the words apart for screen readers and search */
      el.appendChild(line);
    });
    return true;
  }
  function splitAll() {
    stmts.forEach(function (el) {
      var ok = !reduce && splitLines(el);
      el.classList.add('is-split');
      if (!ok) el.classList.add('is-in');
    });
  }
  function whenFonts(cb) {
    var fired = false, go = function () { if (!fired) { fired = true; cb(); } };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    setTimeout(go, 2500);
  }
  var resizeT = 0, lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastW) return;   /* phone toolbars change only the height */
    lastW = window.innerWidth;
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      stmts.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); });
      splitAll();
    }, 260);
  });

  /* ---- mono labels decode left to right like a terminal */
  var GLYPH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·#%+=';
  function scramble(el) {
    if (el.__scr || reduce) return; el.__scr = 1;
    var fin = el.textContent, len = fin.length, frames = clamp(Math.round(len * 1.4), 14, 46), f = 0;
    el.style.minWidth = el.offsetWidth + 'px';
    var iv = setInterval(function () {
      var reveal = (f / frames) * len, out = '';
      for (var i = 0; i < len; i++) {
        var ch = fin.charAt(i);
        out += (ch === ' ' || i < reveal) ? ch : GLYPH.charAt((f * 7 + i * 13) % GLYPH.length);
      }
      el.textContent = out;
      if (++f > frames) { clearInterval(iv); el.textContent = fin; el.style.minWidth = ''; }
    }, 26);
  }

  /* ---- counters keep prefix/suffix and count the integer part; parked at the start value until revealed */
  function count(el, from) {
    if (el.__cnt || reduce) return; el.__cnt = 1;
    var m = (el.__final || el.textContent).match(/^(\D*)(\d+)(.*)$/);
    if (!m) return;
    var to = +m[2], start = from == null ? 0 : from, t0 = null, dur = 1500;
    function step(t) {
      if (!t0) t0 = t;
      var k = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = m[1] + Math.round(start + (to - start) * e) + m[3];
      if (k < 1) requestAnimationFrame(step);
    }
    el.textContent = m[1] + start + m[3];
    requestAnimationFrame(step);
  }
  function park(el, start) { el.__final = el.textContent; if (!reduce) el.textContent = el.textContent.replace(/\d+/, start); }
  $$('[data-count]').forEach(function (el) { park(el, '0'); });
  $$('[data-count-from]').forEach(function (el) { park(el, el.getAttribute('data-count-from')); });

  function show(el) {
    el.classList.add('is-in');
    $$('[data-count]', el).forEach(function (c) { count(c); });
    $$('[data-count-from]', el).forEach(function (c) { count(c, +c.getAttribute('data-count-from')); });
  }
  var IO = 'IntersectionObserver' in window;
  function startReveals() {
    var targets = $$('[data-reveal], .lnw-stmt[data-split]'), term = $$('.lnw-lab, .lnw-tag, .lnw-step__tags span, .lnw-cap__n, .lnw-pills li');
    if (reduce || !IO) { targets.forEach(show); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { io.unobserve(en.target); show(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    targets.forEach(function (el) { io.observe(el); });
    var tio = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { tio.unobserve(en.target); scramble(en.target); } });
    }, { threshold: 0.6 });
    term.forEach(function (el) { tio.observe(el); });
  }

  /* ---- labels and side copy trail the scroll; statements float a few px against it */
  var lag = reduce ? [] : $$('.lnw-lab, .lnw-side').map(function (el, i) {
    el.classList.add('lnw-lag');
    return { el: el, cur: 28 + (i % 3) * 6, tgt: 28 };
  });
  onTick(function () {
    var vh = window.innerHeight, moving = false;
    lag.forEach(function (it) {
      var r = it.el.getBoundingClientRect(), top = r.top - it.cur;
      if (top > vh + 300 || top + r.height < -300) return;
      it.tgt = clamp(((top + r.height / 2 - vh * 0.54) / vh) * 74, -44, 50);
      it.cur += (it.tgt - it.cur) * 0.14;
      if (Math.abs(it.tgt - it.cur) > 0.12) moving = true; else it.cur = it.tgt;
      it.el.style.transform = 'translate3d(0,' + it.cur.toFixed(2) + 'px,0)';
    });
    if (!reduce) stmts.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      el.style.transform = 'translate3d(0,' + ((((r.top + r.height / 2) - vh / 2) / vh) * 14).toFixed(2) + 'px,0)';
    });
    return moving;
  });

  /* ---- links and buttons lean toward the cursor */
  if (fine && !reduce) $$('.lnw-link, .lnw-btn').forEach(function (el) {
    var tx = 0, ty = 0, cx = 0, cy = 0, on = false;
    el.addEventListener('mouseenter', function () { on = true; kick(); });
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left - cx + r.width / 2)) * 0.28;
      ty = (e.clientY - (r.top - cy + r.height / 2)) * 0.28;
      kick();
    });
    el.addEventListener('mouseleave', function () { on = false; tx = ty = 0; kick(); });
    onTick(function () {
      if (!on && Math.abs(cx) < 0.05 && Math.abs(cy) < 0.05) {
        if (cx || cy) { cx = cy = 0; el.style.transform = ''; }
        return false;
      }
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
      el.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)';
      return true;
    });
  });

  /* ---- hero film */
  var hero = document.getElementById('lnwHero'), vid = hero && hero.querySelector('video');
  var watching = false, heroSeen = true;
  function pickSrc() {
    var w = (innerWidth > innerHeight ? Math.max(innerWidth, innerHeight * 16 / 9) : innerWidth) * Math.min(window.devicePixelRatio || 1, 2);
    return vid.getAttribute(w > 1100 ? 'data-s1080' : w > 700 ? 'data-s720' : 'data-s540');
  }
  function ensureSrc() {
    if (vid.getAttribute('src') || vid.querySelector('source')) return;   /* a film uploaded in Webflow brings its own sources */
    var u = pickSrc(); if (u) vid.src = u;
  }
  function fmt(s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function modalOpen() { var m = document.getElementById('cybModal'); return !!(m && m.classList.contains('is-open')); }
  if (vid) {
    var ctrl = hero.querySelector('.lnw-ctrl'), bPlay = ctrl.querySelector('[data-c=play]'), bSound = ctrl.querySelector('[data-c=sound]');
    var bar = ctrl.querySelector('[data-c=seek]'), fill = bar.querySelector('i'), time = ctrl.querySelector('.lnw-ctrl__t');
    var saveData = navigator.connection && navigator.connection.saveData;
    if (vid.getAttribute('data-film') === 'webflow') hero.classList.add('is-silent');   /* Webflow strips audio from uploads */
    if (reduce || saveData) { vid.removeAttribute('autoplay'); vid.pause(); }

    var sync = function () {
      var d = vid.duration || 55, t = vid.currentTime || 0, pct = clamp(t / d * 100, 0, 100);
      fill.style.width = pct + '%';
      bar.setAttribute('aria-valuenow', Math.round(pct));
      time.textContent = fmt(t) + ' / ' + fmt(d);
      bPlay.className = vid.paused ? 'is-pause' : 'is-play';
      bPlay.setAttribute('aria-label', vid.paused ? 'Play video' : 'Pause video');
      bSound.className = vid.muted ? 'is-sound' : 'is-muted';
      bSound.setAttribute('aria-label', vid.muted ? 'Turn sound on' : 'Turn sound off');
      bSound.setAttribute('aria-pressed', vid.muted ? 'false' : 'true');
    };
    var raf = 0;
    var tickVid = function () { sync(); raf = (!vid.paused && watching) ? requestAnimationFrame(tickVid) : 0; };
    ['play', 'pause', 'volumechange', 'loadedmetadata', 'seeked', 'timeupdate'].forEach(function (ev) {
      vid.addEventListener(ev, function () { sync(); if (ev === 'play' && watching && !raf) raf = requestAnimationFrame(tickVid); });
    });

    var ambient = function () {
      watching = false; hero.classList.remove('is-watching');
      vid.loop = true; vid.muted = true;
      if (!reduce && !saveData && heroSeen) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
      badgeState();
    };
    var watch = function () {
      ensureSrc();
      watching = true; hero.classList.add('is-watching');
      vid.loop = false; vid.muted = false;
      try { vid.currentTime = 0; } catch (err) {}
      var p = vid.play();
      if (p && p.catch) p.catch(function () { vid.muted = true; vid.play().catch(function () {}); });
      if (!raf) raf = requestAnimationFrame(tickVid);   /* the ambient loop was already playing, so no 'play' event comes */
      badgeState();
      var top = hero.getBoundingClientRect().top;
      if (Math.abs(top) > 4) scrollToY(top + window.pageYOffset);
    };
    hero.querySelector('.lnw-hero__hit').addEventListener('click', watch);
    $$('[data-watch]').forEach(function (a) { a.addEventListener('click', function (ev) { ev.preventDefault(); watch(); }); });
    vid.addEventListener('ended', function () { if (watching) { try { vid.currentTime = 0; } catch (err) {} ambient(); } });
    bPlay.addEventListener('click', function () { if (vid.paused) vid.play(); else vid.pause(); });
    bSound.addEventListener('click', function () { vid.muted = !vid.muted; });

    var seekTo = function (x) {
      var r = bar.getBoundingClientRect(), d = vid.duration;
      if (!d) return;
      vid.currentTime = clamp((x - r.left) / r.width, 0, 1) * d; sync();
    };
    bar.addEventListener('pointerdown', function (ev) {
      bar.setPointerCapture(ev.pointerId); seekTo(ev.clientX);
      var mv = function (e2) { seekTo(e2.clientX); };
      var up = function () { bar.removeEventListener('pointermove', mv); bar.removeEventListener('pointerup', up); };
      bar.addEventListener('pointermove', mv); bar.addEventListener('pointerup', up);
    });
    bar.addEventListener('keydown', function (ev) {
      if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
      ev.preventDefault(); vid.currentTime = clamp(vid.currentTime + (ev.key === 'ArrowRight' ? 5 : -5), 0, vid.duration || 55); sync();
    });

    /* pause whenever the film is off screen; the ambient loop resumes when it returns */
    if (IO) new IntersectionObserver(function (es) {
      heroSeen = es[0].isIntersecting;
      if (!heroSeen) { if (!vid.paused) vid.pause(); }
      else if (!watching && !reduce && !saveData) { ensureSrc(); var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
    }, { threshold: 0.05 }).observe(hero);
    sync();
  }

  /* ---- once the film has run (it jumps back to the start) or after 8 s, the page glides half a screen down -
     unless the visitor has already scrolled, touched, clicked or pressed a key */
  function halfStart() {
    if (!vid || reduce || location.hash || hero.offsetHeight < window.innerHeight * 0.9) return;   /* portrait: a 16:9 frame, nothing to uncover */
    var stopped = false, done = false, lastT = 0;
    var stop = function () { stopped = true; };
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (t) { window.addEventListener(t, stop, { passive: true, once: true }); });
    var glide = function () {
      if (done) return; done = true;
      if (stopped || watching || window.pageYOffset > 2 || modalOpen()) return;
      var to = Math.round(window.innerHeight / 2), t0 = performance.now();
      (function step(now) {
        if (stopped) return;
        var p = Math.min(1, (now - t0) / 1200);
        jumpTo(Math.round(to * (1 - Math.pow(1 - p, 4))));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    };
    vid.addEventListener('timeupdate', function () { var t = vid.currentTime; if (lastT > 1 && t < lastT - 0.5) glide(); lastT = t; });
    setTimeout(glide, 8000);
  }

  /* ---- image bands: only composite the fixed layer while its window is on screen */
  var bands = $$('.lnw-band');
  if (IO) {
    var bandIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) { en.target.classList.toggle('is-live', en.isIntersecting); });
    }, { rootMargin: '10% 0px' });
    bands.forEach(function (b) { bandIO.observe(b); });
  } else bands.forEach(function (b) { b.classList.add('is-live'); });
  if (!reduce) onTick(function () {
    bands.forEach(function (b, k) {
      if (!b.classList.contains('is-live')) return;
      var p = progress(b) - 0.5, orbs = b.querySelectorAll('i');
      for (var i = 0; i < orbs.length; i++) {
        var s = (i + 1) * (k % 2 ? -1 : 1);
        orbs[i].style.transform = 'translate3d(' + (p * 60 * s).toFixed(1) + 'px,' + (p * -140 * (i + 1) / 2).toFixed(1) + 'px,0)';
      }
    });
    return false;
  });

  /* ---- logo strip: scrubbed by the scroll position, never moving on its own */
  var logos = root.querySelector('.lnw-logos'), logoTrack = logos && logos.querySelector('.lnw-logos__track');
  if (logoTrack && !reduce) onTick(function () {
    logoTrack.style.transform = 'translate3d(-' + (6 + progress(logos) * 28).toFixed(2) + 'vw,0,0)';
    return false;
  });

  /* ---- brand-name strip: drifts with the scroll speed (down = right, up = left), endless, eased out */
  var drift = root.querySelector('[data-drift]'), dTrack = drift && drift.firstElementChild;
  var dPos = null, dEase = 0, dLast = window.pageYOffset;
  if (dTrack && !reduce) onTick(function () {
    var y = window.pageYOffset, delta = y - dLast;
    dLast = y;
    dEase += (delta - dEase) * 0.12;
    if (Math.abs(dEase) < 0.01) dEase = 0;
    var set = dTrack.scrollWidth / 3;   /* the track holds the names three times */
    if (!set) return false;
    if (dPos === null) dPos = -set * 0.35;
    dPos += dEase * 0.55;
    if (dPos >= 0) dPos -= set;
    if (dPos <= -set) dPos += set;
    dTrack.style.transform = 'translate3d(' + dPos.toFixed(2) + 'px,0,0)';
    return dEase !== 0;
  });

  /* ---- example rail: follows the scroll on mouse devices, swipes natively on touch; cards open from the bottom */
  var work = root.querySelector('.lnw-work');
  var rail = work && work.querySelector('.lnw-rail'), railTrack = rail && rail.querySelector('.lnw-rail__track');
  function linkRail() {
    if (!rail) return;
    var on = fine && !reduce && window.innerWidth > 767;
    rail.classList.toggle('is-linked', on);
    if (!on) railTrack.style.transform = '';
  }
  linkRail(); window.addEventListener('resize', linkRail);
  if (rail) onTick(function () {
    if (!rail.classList.contains('is-linked')) return false;
    var max = railTrack.scrollWidth - rail.clientWidth;
    railTrack.style.transform = 'translate3d(' + (max > 0 ? -clamp((progress(work) - 0.12) / 0.62, 0, 1) * max : 0).toFixed(1) + 'px,0,0)';
    return false;
  });
  var cards = $$('.lnw-card');
  if (reduce || !IO) cards.forEach(function (c) { c.classList.add('is-in'); });
  else {
    var cardIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { cardIO.unobserve(en.target); en.target.classList.add('is-in'); } });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    cards.forEach(function (c) { cardIO.observe(c); });
  }
  /* card films load a screen early and only play while visible */
  if (IO) {
    var filmIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (!v.getAttribute('src')) v.src = v.getAttribute('data-src');
          if (!reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        } else if (!v.paused) v.pause();
      });
    }, { rootMargin: '0px 25% 0px 25%', threshold: 0.2 });
    $$('.lnw-card video').forEach(function (v) { filmIO.observe(v); });
  }

  /* ---- integration accordion: one model open at a time (no script: all open) */
  var caps = $$('.lnw-cap');
  function setCap(cap, open) {
    cap.classList.toggle('is-open', open);
    cap.querySelector('.lnw-cap__s').setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  caps.forEach(function (cap) {
    cap.querySelector('.lnw-cap__s').addEventListener('click', function () {
      var open = !cap.classList.contains('is-open');
      caps.forEach(function (o) { setCap(o, o === cap ? open : false); });
    });
  });

  /* ---- floating badge: in after the intro, resting over the closing CTA + footer, the film and the pop-up */
  var badge = root.querySelector('.lnw-badge'), ready = false, ending = 0;
  function badgeState() {
    if (!badge) return;
    badge.classList.toggle('is-on', ready && !watching && !ending && !modalOpen());
  }
  var endEls = [root.querySelector('.lnw-cta')].concat(Array.prototype.slice.call(document.querySelectorAll('section.for-services, .foot2, footer')))
    .filter(function (el, i, a) { return el && a.indexOf(el) === i; });
  if (IO) {
    var endIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) { en.target.__in = en.isIntersecting; });
      ending = endEls.filter(function (el) { return el.__in; }).length;
      badgeState();
    }, { rootMargin: '0px 0px -18% 0px', threshold: 0 });
    endEls.forEach(function (el) { endIO.observe(el); });
  }
  document.addEventListener('keydown', function () { setTimeout(badgeState, 0); });

  /* ---- the pop-up opens as a circle from wherever its CTA was clicked */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a,button');
    if (!a || (a.textContent || '').toLowerCase().indexOf('discovery call') === -1) return;
    var m = document.getElementById('cybModal');
    if (!m || m.contains(a)) return;
    var x = e.clientX, y = e.clientY;
    if (!x && !y) { var r = a.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }   /* keyboard */
    m.style.setProperty('--lnw-cx', Math.round(x) + 'px');
    m.style.setProperty('--lnw-cy', Math.round(y) + 'px');
    setTimeout(badgeState, 0);
  }, true);
  document.addEventListener('click', function () { setTimeout(badgeState, 0); });

  /* ---- leaving for another page on this site: a navy veil rises first */
  if (!reduce) {
    var veil = document.createElement('div');
    veil.className = 'lnw-veil';
    body.appendChild(veil);
    window.addEventListener('pageshow', function (e) { if (e.persisted) veil.classList.remove('is-up'); });
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      var url;
      try { url = new URL(a.getAttribute('href'), location.href); } catch (err) { return; }
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      veil.classList.add('is-up');
      setTimeout(function () { location.href = url.href; }, 620);
    });
  }

  /* ---- the light thread (after ysuriadesign.co): one teal line of light winding through the page in 3D after the
     hero. Its point runs 72% down the screen, so it leads on as you scroll; depth gives it parallax and thickness,
     pulses of light travel along it, dust floats around it, and it ends plugged into the closing Discovery Call
     button. WebGL1 in a transparent fixed canvas behind the copy (the sections sit above it at z-index 1). */
  var threadOn = function () {};
  (function lightThread() {
    if (reduce) return;
    var cvs = document.createElement('canvas'), gl = null;
    cvs.className = 'lnw-thread'; cvs.setAttribute('aria-hidden', 'true');
    try { gl = cvs.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true }); } catch (e) {}
    if (!gl) return;
    root.insertBefore(cvs, root.firstChild);
    var D = 1.6, HEAD = 0.72, COL = [0.224, 0.945, 0.878], small = window.innerWidth < 768;

    function program(vs, fs) {
      var p = gl.createProgram();
      [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]].forEach(function (s) {
        var sh = gl.createShader(s[0]); gl.shaderSource(sh, s[1]); gl.compileShader(sh); gl.attachShader(p, sh);
      });
      gl.linkProgram(p);
      return p;
    }
    /* a ribbon around the line: hot core + soft halo, pulses travelling from the start to the point, a brighter tip */
    var line = program(
      'attribute vec4 a;attribute float t;uniform vec2 res;varying float vs,vl,vt;' +
      'void main(){vs=a.z;vl=a.w;vt=t;gl_Position=vec4(a.x/res.x*2.-1.,1.-a.y/res.y*2.,0.,1.);}',
      'precision mediump float;varying float vs,vl,vt;uniform float time,head;uniform vec3 col;' +
      'void main(){float d=vs*vs,core=exp(-d*150.),halo=exp(-d*6.5),p=0.;' +
      'for(int k=0;k<3;k++){float e=(vt-fract(time*.06+float(k)/3.)*head)*170.;p+=exp(-e*e);}' +
      'float q=(vt-head)*120.,tip=exp(-q*q),fade=smoothstep(0.,.012,vt);' +
      'float i=(halo*.38+core)*(1.+p*1.5+tip*2.4)*vl*fade;' +
      'vec3 c=col*i+vec3(.8,1.,.97)*core*vl*fade*(.55+p+tip*1.6);' +
      'gl_FragColor=vec4(c,clamp(max(c.r,max(c.g,c.b)),0.,1.));}');
    /* round soft points: floating dust, the spark at the point, the light where it plugs in */
    var dots = program(
      'attribute vec4 a;uniform vec2 res;uniform float dpr;varying float va;' +
      'void main(){va=a.w;gl_Position=vec4(a.x/res.x*2.-1.,1.-a.y/res.y*2.,0.,1.);gl_PointSize=a.z*dpr;}',
      'precision mediump float;varying float va;uniform vec3 col;' +
      'void main(){vec2 q=gl_PointCoord*2.-1.;float r=dot(q,q);if(r>1.)discard;' +
      'vec3 c=(col*exp(-r*3.2)+vec3(1.)*exp(-r*16.)*.7)*va;gl_FragColor=vec4(c,clamp(max(c.r,max(c.g,c.b)),0.,1.));}');
    var L = { a: gl.getAttribLocation(line, 'a'), t: gl.getAttribLocation(line, 't'), res: gl.getUniformLocation(line, 'res'),
      time: gl.getUniformLocation(line, 'time'), head: gl.getUniformLocation(line, 'head'), col: gl.getUniformLocation(line, 'col') };
    var P = { a: gl.getAttribLocation(dots, 'a'), res: gl.getUniformLocation(dots, 'res'), dpr: gl.getUniformLocation(dots, 'dpr'), col: gl.getUniformLocation(dots, 'col') };
    var lineBuf = gl.createBuffer(), dotBuf = gl.createBuffer();
    var maxPt = (gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) || [1, 64])[1];

    /* the path: through the side margins of each section, swooping across (toward the viewer) in the gap above it,
       diving deep into each image band, ending on the closing button. x = px from the centre, y = page px, z = depth */
    var SX, SY, SZ, ST, N = 0, startY = 0, endY = 0, plug = null, dust = [];
    function crc(p0, p1, p2, p3, u) {   /* centripetal Catmull-Rom: no loops or cusps between uneven stops */
      function knot(ti, a, b) { return ti + Math.max(Math.pow(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2) + Math.pow(b[2] - a[2], 2), 0.25), 1e-4); }
      var t0 = 0, t1 = knot(t0, p0, p1), t2 = knot(t1, p1, p2), t3 = knot(t2, p2, p3), t = t1 + (t2 - t1) * u, o = [];
      for (var j = 0; j < 3; j++) {
        var a1 = ((t1 - t) * p0[j] + (t - t0) * p1[j]) / (t1 - t0), a2 = ((t2 - t) * p1[j] + (t - t1) * p2[j]) / (t2 - t1);
        var a3 = ((t3 - t) * p2[j] + (t - t2) * p3[j]) / (t3 - t2);
        var b1 = ((t2 - t) * a1 + (t - t0) * a2) / (t2 - t0), b2 = ((t3 - t) * a2 + (t - t1) * a3) / (t3 - t1);
        o[j] = ((t2 - t) * b1 + (t - t1) * b2) / (t2 - t1);
      }
      return o;
    }
    function build() {
      var W = window.innerWidth, sy = window.pageYOffset, E = W * (small ? 0.46 : 0.44), Z = W * 0.5, pts = [], side = 1;
      var hero = document.getElementById('lnwHero'), cta = root.querySelector('.lnw-cta'), btn = cta && cta.querySelector('.lnw-btn');
      if (!hero || !btn || !hero.offsetHeight) return;
      function box(el) { var r = el.getBoundingClientRect(); return { t: r.top + sy, b: r.bottom + sy, h: r.height }; }
      var h = box(hero);
      startY = h.b;
      pts.push([W * 0.28, h.b - 90, -1.3]);   /* rises from under the bottom edge of the film */
      Array.prototype.forEach.call(root.children, function (el) {
        if (el === hero || el === cvs || el === cta || !el.offsetHeight || el.classList.contains('lnw-badge')) return;
        var r = box(el);
        if (el.classList.contains('lnw-band')) { pts.push([side * W * 0.12, r.t + r.h / 2, -1.7]); side = -side; return; }
        if (el.classList.contains('lnw-logos')) { pts.push([-side * W * 0.12, r.t + r.h * 0.42, -0.3], [side * E, r.t + r.h * 0.62, -0.12]); return; }
        var pad = Math.min(parseFloat(getComputedStyle(el).paddingTop) || 120, r.h * 0.2);
        pts.push([0, r.t + pad * 0.45, 0.4],
          [side * E, r.t + pad + (r.h - 2 * pad) * 0.12, 0.05],
          [side * E * 0.97, r.b - pad - (r.h - 2 * pad) * 0.12, -0.08]);
        side = -side;
      });
      var c = box(cta), b = btn.getBoundingClientRect(), bx = b.left - W / 2 - 4, by = b.top + sy + b.height / 2;
      pts.push([0, c.t + 70, 0.35], [-E, c.t + (by - c.t) * 0.55, 0.12], [bx - 70, by, 0.03], [bx, by, 0]);
      plug = [bx, by];
      endY = by;
      /* sample the curve every ~7 px of path, depth scaled into px only for the spacing */
      var Q = pts.map(function (p) { return [p[0], p[1], p[2] * Z]; }), n = Q.length, out = [];
      Q.unshift([2 * Q[0][0] - Q[1][0], 2 * Q[0][1] - Q[1][1], 2 * Q[0][2] - Q[1][2]]);
      Q.push([2 * Q[n][0] - Q[n - 1][0], 2 * Q[n][1] - Q[n - 1][1], 2 * Q[n][2] - Q[n - 1][2]]);
      for (var i = 1; i < Q.length - 2; i++) {
        var seg = Math.sqrt(Math.pow(Q[i + 1][0] - Q[i][0], 2) + Math.pow(Q[i + 1][1] - Q[i][1], 2) + Math.pow(Q[i + 1][2] - Q[i][2], 2));
        for (var k = 0, m = Math.max(2, Math.ceil(seg / 7)); k < m; k++) out.push(crc(Q[i - 1], Q[i], Q[i + 1], Q[i + 2], k / m));
      }
      out.push(Q[Q.length - 2]);
      N = out.length; SX = new Float32Array(N); SY = new Float32Array(N); SZ = new Float32Array(N); ST = new Float32Array(N);
      var len = 0;
      for (i = 0; i < N; i++) {
        SX[i] = out[i][0]; SY[i] = out[i][1]; SZ[i] = out[i][2] / Z;
        if (i) len += Math.sqrt(Math.pow(SX[i] - SX[i - 1], 2) + Math.pow(SY[i] - SY[i - 1], 2) + Math.pow(out[i][2] - out[i - 1][2], 2));
        ST[i] = len;
      }
      for (i = 0; i < N; i++) ST[i] /= len || 1;
      /* dust in the volume around the path */
      dust = [];
      for (i = 0, n = small ? 60 : 150; i < n; i++) dust.push([(Math.random() - 0.5) * W * 1.2, startY + Math.random() * (endY - startY), Math.random() * 2.3 - 1.6, 1.1 + Math.random() * 2, Math.random() * 6.28, 0.3 + Math.random() * 0.6]);
      wake();
    }
    var buildT = 0;
    function rebuild() { clearTimeout(buildT); buildT = setTimeout(build, 120); }

    var dpr = 1, cw = 0, ch = 0, mx = 0, my = 0, cx = 0, cy = 0, raf = 0, ready = false;
    var vbuf = new Float32Array(0), pbuf = new Float32Array(0);
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
      var w = Math.round(window.innerWidth * dpr), hh = Math.round(window.innerHeight * dpr);
      if (w !== cw || hh !== ch) { cw = cvs.width = w; ch = cvs.height = hh; }
    }
    if (!touch) window.addEventListener('mousemove', function (e) { mx = (e.clientX / window.innerWidth - 0.5) * 60; my = (e.clientY / window.innerHeight - 0.5) * 40; }, { passive: true });

    function frame(now) {
      raf = 0;
      var sy = window.pageYOffset, vh = window.innerHeight, W = window.innerWidth;
      var on = ready && N > 1 && !document.hidden && sy + vh > startY + 10 && sy < endY + vh * 0.25;
      cvs.classList.toggle('is-on', on);
      if (!on) return;
      size();
      gl.viewport(0, 0, cw, ch);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
      cx += (mx - cx) * 0.06; cy += (my - cy) * 0.06;
      var camY = sy + vh / 2, headY = sy + vh * HEAD, time = now / 1000, span = vh * 1.2 + 300;
      /* screen position of a page point: the content plane (z 0) stays put, nearer/further layers drift with depth */
      function proj(x, y, z, o) { var f = D / (D - z); o[0] = W / 2 + x * f - cx * (f - 1); o[1] = vh / 2 + (y - camY) * f - cy * (f - 1); o[2] = f; return o; }
      var lo = 0, hi = N - 1;
      while (lo < hi) { var mid = (lo + hi) >> 1; if (SY[mid] < headY) lo = mid + 1; else hi = mid; }
      var hIdx = lo, head = headY >= SY[N - 1] ? 1 : ST[hIdx];
      var i0 = 0;
      while (i0 < hIdx && SY[i0] < camY - span) i0++;
      var cnt = hIdx - i0 + 1, A = [0, 0, 0], B = [0, 0, 0], C = [0, 0, 0], tip = null;
      if (vbuf.length < cnt * 10) vbuf = new Float32Array(cnt * 10 + 200);
      var v = 0, hwBase = small ? 22 : 32;
      for (var i = i0; i <= hIdx; i++) {
        proj(SX[i], SY[i], SZ[i], B);
        var ia = Math.max(i - 1, 0), ib = Math.min(i + 1, N - 1);
        proj(SX[ia], SY[ia], SZ[ia], A); proj(SX[ib], SY[ib], SZ[ib], C);
        var tx = C[0] - A[0], ty = C[1] - A[1], tl = Math.sqrt(tx * tx + ty * ty) || 1, nx = -ty / tl, ny = tx / tl;
        var hw = hwBase * B[2], light = Math.min(1.25, Math.max(0.22, 0.22 + 0.78 * (SZ[i] + 1.7) / 2.1));
        vbuf[v++] = B[0] + nx * hw; vbuf[v++] = B[1] + ny * hw; vbuf[v++] = 1; vbuf[v++] = light; vbuf[v++] = ST[i];
        vbuf[v++] = B[0] - nx * hw; vbuf[v++] = B[1] - ny * hw; vbuf[v++] = -1; vbuf[v++] = light; vbuf[v++] = ST[i];
        if (i === hIdx) tip = [B[0], B[1], B[2]];
      }
      if (v >= 20) {
        gl.useProgram(line);
        gl.uniform2f(L.res, W, vh); gl.uniform1f(L.time, time); gl.uniform1f(L.head, head); gl.uniform3fv(L.col, COL);
        gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf); gl.bufferData(gl.ARRAY_BUFFER, vbuf.subarray(0, v), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(L.a); gl.vertexAttribPointer(L.a, 4, gl.FLOAT, false, 20, 0);
        gl.enableVertexAttribArray(L.t); gl.vertexAttribPointer(L.t, 1, gl.FLOAT, false, 20, 16);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, v / 5);
        gl.disableVertexAttribArray(L.t);
      }
      /* dust, the spark at the point, and the light on the button once the thread arrives */
      if (pbuf.length < dust.length * 4 + 16) pbuf = new Float32Array(dust.length * 4 + 16);
      var p = 0;
      for (i = 0; i < dust.length; i++) {
        var d = dust[i], y = d[1] + Math.cos(time * 0.17 + d[4] * 1.3) * 10;
        if (Math.abs(y - camY) > span || y > endY) continue;
        proj(d[0] + Math.sin(time * 0.21 + d[4]) * 14, y, d[2], A);
        if (A[0] < -20 || A[0] > W + 20 || A[1] < -20 || A[1] > vh + 20) continue;
        var tw = 0.6 + 0.4 * Math.sin(time * 1.7 + d[4] * 3);
        pbuf[p++] = A[0]; pbuf[p++] = A[1]; pbuf[p++] = Math.min(maxPt / dpr, d[3] * A[2]); pbuf[p++] = d[5] * tw * Math.min(1, Math.max(0.2, (d[2] + 1.7) / 2.2));
      }
      if (tip && head < 1) {
        pbuf[p++] = tip[0]; pbuf[p++] = tip[1]; pbuf[p++] = Math.min(maxPt / dpr, 30 * tip[2]); pbuf[p++] = 1;
        pbuf[p++] = tip[0]; pbuf[p++] = tip[1]; pbuf[p++] = Math.min(maxPt / dpr, 110 * tip[2]); pbuf[p++] = 0.2;
      }
      if (head >= 1 && plug) {
        proj(plug[0], plug[1], 0, A);
        var beat = 0.75 + 0.25 * Math.sin(time * 3);
        pbuf[p++] = A[0]; pbuf[p++] = A[1]; pbuf[p++] = Math.min(maxPt / dpr, 34); pbuf[p++] = beat;
        pbuf[p++] = A[0]; pbuf[p++] = A[1]; pbuf[p++] = Math.min(maxPt / dpr, 120); pbuf[p++] = 0.22 * beat;
      }
      if (p) {
        gl.useProgram(dots);
        gl.uniform2f(P.res, W, vh); gl.uniform1f(P.dpr, dpr); gl.uniform3fv(P.col, COL);
        gl.bindBuffer(gl.ARRAY_BUFFER, dotBuf); gl.bufferData(gl.ARRAY_BUFFER, pbuf.subarray(0, p), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(P.a); gl.vertexAttribPointer(P.a, 4, gl.FLOAT, false, 16, 0);
        gl.drawArrays(gl.POINTS, 0, p / 4);
      }
      raf = requestAnimationFrame(frame);   /* keeps running while on screen: the pulses never stop */
    }
    function wake() { if (!raf && ready) raf = requestAnimationFrame(frame); }
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', function () { small = window.innerWidth < 768; rebuild(); wake(); });
    document.addEventListener('visibilitychange', wake);
    if ('ResizeObserver' in window) new ResizeObserver(rebuild).observe(root);
    cvs.addEventListener('webglcontextlost', function (e) { e.preventDefault(); ready = false; cvs.classList.remove('is-on'); });
    threadOn = function () { ready = true; build(); };
  })();

  /* ---- intro: a navy field (already covering the first frame) pulls up off the film, then the page comes alive */
  var introDone = false, fontsDone = false;
  function maybeStart() {
    if (!introDone || !fontsDone) return;
    startReveals();
    threadOn();
    setTimeout(function () { ready = true; badgeState(); }, reduce ? 0 : 420);
    kick();
  }
  function intro(done) {
    if (reduce || !html.classList.contains('lnw-intro')) { html.classList.remove('lnw-intro'); done(); return; }
    var box = document.createElement('div'), field = document.createElement('i');
    box.className = 'lnw-boot'; box.appendChild(field); body.appendChild(box);
    html.classList.remove('lnw-intro');   /* the panel takes over in the same frame */
    SS.locked = true; body.classList.add('lnw-locked');
    var HOLD = 620, PULL = 1000, t0 = performance.now(), released = false, finished = false;
    var release = function () {
      if (released) return; released = true;
      SS.locked = false; body.classList.remove('lnw-locked');
      SS.target = SS.current = SS.last = window.pageYOffset;
    };
    var finish = function () {
      if (finished) return; finished = true;
      release();
      if (box.parentNode) box.parentNode.removeChild(box);
      done();
    };
    var ease = function (t) { return t < 0.5 ? 16 * Math.pow(t, 5) : 1 - Math.pow(-2 * t + 2, 5) / 2; };
    (function step(now) {
      var t = now - t0;
      if (t >= HOLD) {
        var p = clamp((t - HOLD) / PULL, 0, 1);
        field.style.height = (100 - 100 * ease(p)).toFixed(2) + '%';
        if (p > 0.6) release();
        if (p >= 1) { finish(); return; }
      }
      requestAnimationFrame(step);
    })(t0);
    setTimeout(finish, HOLD + PULL + 2400);   /* background tabs never paint */
  }
  halfStart();   /* its 8 s count from page start, as on brand-nw.com */
  intro(function () { introDone = true; maybeStart(); });
  whenFonts(function () { splitAll(); fontsDone = true; maybeStart(); });

  kick();
})();

/* ── Discovery Call modal (from cyb3rLandingPage 2.25.0, unchanged) ─────────
 * Branching qualifier in front of the NATIVE Webflow form (#cybDiscoveryNative).
 * The real <form> is a page element so Webflow's own JS binds it at load and
 * submissions land in Form Submissions. We only move it into the modal and
 * toggle which fields are on screen - we never rebuild or re-submit it. */
(function(){
  if (window.__cybDiscovery) return; window.__cybDiscovery = 1;

  var SERVICES = 'https://www.cyb3rmedia.com/services';

  /* the id may sit on the <form> or on the .w-form block depending on how
     Webflow rendered it - always work with the .w-form block so the success
     and error messages travel into the modal with the form */
  function findHost(){
    var el = document.getElementById('cybDiscoveryNative');
    if (!el) return null;
    return (el.closest && el.closest('.w-form')) || el;
  }
  (function hideEarly(){
    var h = findHost();
    if (h) h.style.display = 'none';
    else if (document.readyState === 'loading')
      document.addEventListener('DOMContentLoaded', hideEarly);
  })();

  var PLACEHOLDER = {
    cybSpend:   'Current monthly ad spend',
    cybName:    'Full name',
    cybEmail:   'Work email',
    cybWebsite: 'Company website',
    cybBudget:  'Budget for display advertising'
  };

  function build(){
    var host = findHost();
    if (!host || document.getElementById('cybModal')) return;

    var m = document.createElement('div');
    m.id = 'cybModal';
    m.className = 'cyb-modal';
    m.setAttribute('role','dialog');
    m.setAttribute('aria-modal','true');
    m.setAttribute('aria-label','Book a discovery call');
    m.innerHTML =
      '<div class="cyb-modal_backdrop" data-close></div>' +
      '<div class="cyb-modal_panel">' +
        '<button class="cyb-modal_x" data-close aria-label="Close">&times;</button>' +
        '<div class="cyb-modal_body">' +
          '<div class="cyb-step" data-step="q1">' +
            '<div class="cyb-eyebrow">Book a discovery call</div>' +
            '<h3>Are you currently running Google display adverts?</h3>' +
            '<div class="cyb-choices">' +
              '<button class="cyb-btn" data-a="q1-yes">Yes</button>' +
              '<button class="cyb-btn is-ghost" data-a="q1-no">No</button>' +
            '</div>' +
          '</div>' +
          '<div class="cyb-step" data-step="q2" hidden>' +
            '<div class="cyb-eyebrow">Book a discovery call</div>' +
            '<h3>Are you interested in running display adverts?</h3>' +
            '<div class="cyb-choices">' +
              '<button class="cyb-btn" data-a="q2-yes">Yes</button>' +
              '<button class="cyb-btn is-ghost" data-a="q2-no">No</button>' +
            '</div>' +
          '</div>' +
          '<div class="cyb-step" data-step="out" hidden>' +
            '<div class="cyb-eyebrow">Not the right fit</div>' +
            '<h3>This one is built for advertisers</h3>' +
            '<p>Our relevance platform is designed for brands already investing in ' +
            'display media, so it would not be much use to you yet. That said, ' +
            'display is only part of what we do - brand, web, SEO, social and ' +
            'production may be a far better place to start.</p>' +
            '<div class="cyb-choices">' +
              '<a class="cyb-btn" href="' + SERVICES + '">Explore our services</a>' +
              '<button class="cyb-btn is-ghost" data-close>Close</button>' +
            '</div>' +
          '</div>' +
          '<div class="cyb-step" data-step="form" hidden>' +
            '<div class="cyb-eyebrow">Book a discovery call</div>' +
            '<h3 data-formtitle>A few details and we will be in touch</h3>' +
            '<div class="cyb-formhost"></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(m);

    /* move the real Webflow form into the modal - the handler is bound to the
       element itself, so relocating the node keeps submission working */
    m.querySelector('.cyb-formhost').appendChild(host);
    var innerForm = host.querySelector('form');
    if (innerForm) innerForm.style.display = 'block';
    host.style.display = 'block';   /* undoes the inline park from hideEarly */

    /* Webflow's auto-generated labels are redundant next to placeholders, and the
       two qualifier fields are answered by the buttons - keep both out of sight
       but in the form so their values still post. */
    m.querySelectorAll('.cyb-formhost label').forEach(function(l){ l.style.display = 'none'; });
    ['cybQ1','cybQ2'].forEach(function(id){
      var f = m.querySelector('#' + id);
      if (f) { f.type = 'hidden'; }
    });
    Object.keys(PLACEHOLDER).forEach(function(id){
      var f = m.querySelector('#' + id);
      if (f) f.setAttribute('placeholder', PLACEHOLDER[id]);
    });
    var submit = m.querySelector('.cyb-formhost input[type=submit]');
    if (submit) submit.value = 'Request my discovery call';

    var spendRow = m.querySelector('#cybSpend');   /* only for existing advertisers */
    spendRow.style.display = 'none';

    function show(name){
      m.querySelectorAll('.cyb-step').forEach(function(s){
        s.hidden = (s.getAttribute('data-step') !== name);
      });
    }
    function open(){
      m.classList.add('is-open');
      document.documentElement.style.overflow = 'hidden';
      show('q1');
      var f = m.querySelector('#cybQ1'); if (f) f.value = '';
      var g = m.querySelector('#cybQ2'); if (g) g.value = '';
    }
    function close(){
      m.classList.remove('is-open');
      document.documentElement.style.overflow = '';
    }

    m.addEventListener('click', function(e){
      var t = e.target;
      if (t.hasAttribute && t.hasAttribute('data-close')) { e.preventDefault(); return close(); }
      var a = t.getAttribute && t.getAttribute('data-a');
      if (!a) return;
      e.preventDefault();
      if (a === 'q1-yes') {
        m.querySelector('#cybQ1').value = 'Yes';
        spendRow.style.display = '';
        spendRow.setAttribute('required','required');
        m.querySelector('[data-formtitle]').textContent = 'Tell us about your current activity';
        show('form');
      } else if (a === 'q1-no') {
        m.querySelector('#cybQ1').value = 'No';
        show('q2');
      } else if (a === 'q2-yes') {
        m.querySelector('#cybQ2').value = 'Yes';
        spendRow.style.display = 'none';
        spendRow.removeAttribute('required');
        spendRow.value = '';
        m.querySelector('[data-formtitle]').textContent = 'A few details and we will be in touch';
        show('form');
      } else if (a === 'q2-no') {
        m.querySelector('#cybQ2').value = 'No';
        show('out');
      }
    });

    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && m.classList.contains('is-open')) close();
    });

    /* every "book a discovery call" CTA on the page opens this */
    document.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('a,button');
      if (!a || m.contains(a)) return;
      var txt = (a.textContent || '').trim().toLowerCase();
      if (txt.indexOf('discovery call') === -1) return;
      e.preventDefault();
      open();
    }, true);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', build);
  else build();
  setTimeout(build, 1200);          /* the CTAs arrive with the injected markup */
})();
