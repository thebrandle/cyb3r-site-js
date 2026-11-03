/* cyb3rLandingNW - Relevance Advertising in the brand-nw.com home layout (markup + CSS: landing-nw/embed-*.html).
 * Motion follows brand-nw.com: a navy intro curtain, eased wheel/keyboard scrolling, the page gliding half a screen
 * down once the film has run (unless the visitor moved first), statements rising line by line, mono labels decoding,
 * labels and side copy lagging the scroll, magnetic links, a scroll-scrubbed logo strip, a brand-name strip that
 * drifts with scroll speed, a scroll-linked example rail whose cards open from the bottom, fixed-layer image bands,
 * floating statements, a one-open accordion, the floating Discovery Call badge, a pop-up that opens as a circle
 * from the click, a veil that rises before leaving for another page, and after the hero a 3D world the scroll
 * flies through along a teal thread of light (three.js, after ysuriadesign.co). The hero film is a muted loop;
 * "Watch the video" or a click on the film restarts it with sound and controls. The Discovery Call modal (second block) moves
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
    if (root.classList.contains('is-3d')) return false;   /* the 3D world shows through the bands instead */
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

  /* ---- the light thread, in 3D (after ysuriadesign.co). After the hero the page floats over a three.js world - a
     navy space of drifting dust and slow-turning dark shards - and the scroll flies a camera along a rail through it.
     A teal thread of light runs beside the camera into the distance and ties the sections together: it weaves under
     the opening statement, threads a gate of light at each image band, runs through four rings for the four agent
     steps, loops round the shard field at the work, coils round the camera at the results, swings wide at the
     platform, lays a ruler under the transparency rows and ends in a ring of light at the closing call to action.
     Pulses run ahead along it and light the shards they pass. three.js r128 (the copy the homepage loads) arrives
     after the intro; off for reduced motion, and without WebGL the page keeps its image bands. */
  var threadOn = function () {};
  (function thread3d() {
    var hero = document.getElementById('lnwHero');
    if (reduce || !hero) return;
    var started = false;
    threadOn = function () {
      if (started) return; started = true;
      if (window.THREE && window.THREE.WebGLRenderer) { init(window.THREE); return; }
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      s.integrity = 'sha512-dLxUelApnYxpLt6K2iomGngnHO83iUvZytA3YjDUCjT0HDOHKXnVYdf3hU4JjM8uEhxf9nD1/ey98U3t2vZ0qQ==';
      s.crossOrigin = 'anonymous';
      s.onload = function () { if (window.THREE) init(window.THREE); };
      document.head.appendChild(s);
    };

    /* every line of light (thread, gates, ruler) is a camera-facing ribbon: world width, so it thins with distance,
       never under a pixel; a hot core inside a soft halo, fogged by depth, pulses travelling along it */
    var RIBBON_VS = [
      'attribute vec3 tdir;attribute float side;attribute float arc;',
      'uniform vec2 uRes;uniform float uWidth;uniform float uMinPx;',
      'varying float vSide;varying float vArc;varying float vDepth;varying float vPx;',
      'void main(){',
      ' vec4 mv=modelViewMatrix*vec4(position,1.0);vec4 mt=modelViewMatrix*vec4(position+tdir,1.0);',
      ' float z=min(mv.z,-0.08);',
      ' vec4 c=projectionMatrix*vec4(mv.xy,z,1.0);vec4 c2=projectionMatrix*vec4(mt.xy,min(mt.z,-0.08),1.0);',
      ' vec2 d=(c2.xy/c2.w-c.xy/c.w)*uRes;float dl=length(d);',
      ' vec2 n=dl>0.0001?vec2(-d.y,d.x)/dl:vec2(0.0,1.0);',
      ' float ppu=projectionMatrix[1][1]*uRes.y*0.5/-z,px=clamp(uWidth*ppu,uMinPx,220.0);',
      /* where the line turns toward the camera it narrows, instead of fanning into a starburst */
      ' px=max(uMinPx,px*mix(0.22,1.0,smoothstep(0.04,0.4,dl*0.5/ppu)));',
      ' c.xy+=n*side*px*2.0/uRes*c.w;gl_Position=c;',
      ' vSide=side;vArc=arc;vDepth=-mv.z;vPx=px;}'
    ].join('\n');
    var RIBBON_FS = [
      'uniform vec3 uColor;uniform vec3 uCore;uniform float uGain;uniform float uFog;',
      'uniform float uPulse[4];uniform float uPulseGain;uniform float uFrom;uniform float uTo;',
      'varying float vSide;varying float vArc;varying float vDepth;varying float vPx;',
      'void main(){',
      ' float a=abs(vSide),dpx=a*vPx,cw=max(vPx*0.1,1.2),q=dpx/cw;',
      ' float core=exp(-q*q);float halo=exp(-dpx/max(vPx*0.3,1.6))*(1.0-smoothstep(0.7,1.0,a));',
      ' float p=0.0;for(int k=0;k<4;k++){float e=(vArc-uPulse[k])*0.55;p+=exp(-e*e);}p*=uPulseGain;',
      ' float f=exp(-vDepth*vDepth*uFog*uFog)*smoothstep(0.5,4.5,vDepth);',
      ' float ends=smoothstep(uFrom,uFrom+1.5,vArc)*(1.0-smoothstep(uTo-0.6,uTo,vArc));',
      ' vec3 col=(uColor*halo*0.55*(1.0+p*2.2)+uCore*core*(0.85+p*1.6))*f*ends*uGain;',
      ' gl_FragColor=vec4(col,1.0);}'
    ].join('\n');
    /* dust and flares: round soft points sized in world units */
    var DOT_VS = [
      'attribute vec4 aRnd;uniform float uTime;uniform float uPx;uniform float uFog;uniform float uMaxPx;varying float vA;',
      'void main(){vec3 p=position;',
      ' p.x+=sin(uTime*0.27+aRnd.y*6.28)*0.35*aRnd.w;p.y+=cos(uTime*0.21+aRnd.y*4.1)*0.35*aRnd.w;',
      ' vec4 mv=modelViewMatrix*vec4(p,1.0);float d=max(-mv.z,0.05);',
      ' gl_PointSize=clamp(aRnd.x*uPx/d,1.0,uMaxPx);',
      ' float tw=0.6+0.4*sin(uTime*1.5+aRnd.y*23.0);',
      ' vA=aRnd.z*tw*exp(-d*d*uFog*uFog)*smoothstep(0.4,2.5,d)*step(0.0,-mv.z);',
      ' gl_Position=projectionMatrix*mv;}'
    ].join('\n');
    var DOT_FS = 'uniform vec3 uColor;varying float vA;void main(){vec2 q=gl_PointCoord*2.0-1.0;float r=dot(q,q);if(r>1.0)discard;' +
      'gl_FragColor=vec4(uColor*exp(-r*4.0)*vA,1.0);}';
    /* shards: dark faceted solids turning slowly, a teal rim, lit by the pulses and the thread near the camera */
    var SHARD_VS = [
      'attribute vec4 aSpin;uniform float uTime;varying vec3 vN;varying vec3 vW;',
      'vec3 rot(vec3 v,vec3 ax,float a){float c=cos(a),s=sin(a);return v*c+cross(ax,v)*s+ax*dot(ax,v)*(1.0-c);}',
      'void main(){float a=uTime*aSpin.w;vec3 p=rot(position,aSpin.xyz,a),n=rot(normal,aSpin.xyz,a);',
      ' mat4 m=modelMatrix;',
      ' #ifdef USE_INSTANCING',
      ' m=m*instanceMatrix;',
      ' #endif',
      ' vec4 w=m*vec4(p,1.0);vN=normalize(mat3(m)*n);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}'
    ].join('\n');
    var SHARD_FS = [
      'uniform vec3 uBase;uniform vec3 uTeal;uniform vec3 uFogCol;uniform float uFog;uniform vec3 uL[6];uniform float uLi[6];',
      'varying vec3 vN;varying vec3 vW;',
      'void main(){vec3 N=normalize(vN),V=normalize(cameraPosition-vW);',
      ' float fr=1.0-max(dot(N,V),0.0);float key=max(dot(N,normalize(vec3(0.35,1.0,0.25))),0.0);',
      ' vec3 c=uBase*(0.28+0.72*key)+uTeal*fr*fr*fr*0.42;',
      ' for(int i=0;i<6;i++){vec3 L=uL[i]-vW;float d2=dot(L,L);c+=uTeal*uLi[i]*max(dot(N,L*inversesqrt(d2+0.0001)),0.0)/(1.0+d2*0.16);}',
      ' float d=length(cameraPosition-vW);gl_FragColor=vec4(mix(uFogCol,c,exp(-d*d*uFog*uFog)),1.0);}'
    ].join('\n');

    function init(T) {
      var cvs = document.createElement('canvas'), renderer, phone = window.innerWidth < 768;
      cvs.className = 'lnw-thread'; cvs.setAttribute('aria-hidden', 'true');
      try { renderer = new T.WebGLRenderer({ canvas: cvs, antialias: !phone, alpha: false, powerPreference: 'high-performance' }); }
      catch (e) { return; }
      root.insertBefore(cvs, root.firstChild);
      root.classList.add('is-3d');
      var BG = new T.Color('#131c25'), TEAL = new T.Color('#39F1E0'), CORE = new T.Color('#e6fffc'), FOG = 0.02, UNIT = 45;   /* UNIT: world units per screen of scroll */
      renderer.setClearColor(BG, 1);
      var scene = new T.Scene(), cam = new T.PerspectiveCamera(58, 1, 0.05, 170), world = new T.Group();
      scene.add(world);
      var res = new T.Vector2(1, 1), time = 0, last = performance.now(), dpr = 1;
      var pulse = [0, 0, 0, 0], lightP = [], lightI = [0, 0, 0, 0, 0, 0];
      for (var li = 0; li < 6; li++) lightP.push(new T.Vector3(0, -999, 0));

      function ribbonMat(width, minPx, gain, pulses) {
        return new T.ShaderMaterial({
          uniforms: { uRes: { value: res }, uWidth: { value: width }, uMinPx: { value: minPx }, uColor: { value: TEAL }, uCore: { value: CORE },
            uGain: { value: gain }, uFog: { value: FOG }, uPulse: { value: pulses ? pulse : [-999, -999, -999, -999] }, uPulseGain: { value: pulses ? 1 : 0 },
            uFrom: { value: -1e5 }, uTo: { value: 1e5 } },
          vertexShader: RIBBON_VS, fragmentShader: RIBBON_FS, transparent: true, depthWrite: false, blending: T.AdditiveBlending
        });
      }
      function dotMat(color, maxPx) {
        return new T.ShaderMaterial({
          uniforms: { uTime: { value: 0 }, uPx: { value: 500 }, uFog: { value: FOG }, uMaxPx: { value: maxPx }, uColor: { value: new T.Color(color) } },
          vertexShader: DOT_VS, fragmentShader: DOT_FS, transparent: true, depthWrite: false, blending: T.AdditiveBlending
        });
      }
      var threadMat = ribbonMat(0.5, 1.3, 1, true), ringMat = ribbonMat(0.3, 1.1, 0.75, false), tickMat = ribbonMat(0.16, 0.9, 0.5, false);
      var dustMat = dotMat('#bdfaf4', 40), flareMat = dotMat('#7ff6ea', 420);
      var shardMat = new T.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uBase: { value: new T.Color('#223140') }, uTeal: { value: TEAL }, uFogCol: { value: BG }, uFog: { value: FOG },
          uL: { value: lightP }, uLi: { value: lightI } },
        vertexShader: SHARD_VS, fragmentShader: SHARD_FS
      });

      /* geometry for any number of polylines: two vertices per point (the ribbon's two edges) */
      function ribbonGeo(lines) {
        var n = 0, i, j;
        lines.forEach(function (l) { n += l.p.length / 3; });
        var pos = new Float32Array(n * 6), td = new Float32Array(n * 6), side = new Float32Array(n * 2), arc = new Float32Array(n * 2), idx = [], v = 0;
        lines.forEach(function (l) {
          var m = l.p.length / 3, p = l.p, base = v;
          for (i = 0; i < m; i++) {
            var a = l.closed ? (i + m - 1) % m : Math.max(i - 1, 0), b = l.closed ? (i + 1) % m : Math.min(i + 1, m - 1);
            var tx = p[b * 3] - p[a * 3], ty = p[b * 3 + 1] - p[a * 3 + 1], tz = p[b * 3 + 2] - p[a * 3 + 2], tl = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1;
            for (j = 0; j < 2; j++) {
              var o = v * 3;
              pos[o] = p[i * 3]; pos[o + 1] = p[i * 3 + 1]; pos[o + 2] = p[i * 3 + 2];
              td[o] = tx / tl; td[o + 1] = ty / tl; td[o + 2] = tz / tl;
              side[v] = j ? -1 : 1; arc[v] = l.a ? l.a[i] : 0; v++;
            }
            if (i < m - 1 || l.closed) {
              var q = base + i * 2, r = base + ((i + 1) % m) * 2;
              idx.push(q, q + 1, r, q + 1, r + 1, r);
            }
          }
        });
        var g = new T.BufferGeometry();
        g.setAttribute('position', new T.BufferAttribute(pos, 3));
        g.setAttribute('tdir', new T.BufferAttribute(td, 3));
        g.setAttribute('side', new T.BufferAttribute(side, 1));
        g.setAttribute('arc', new T.BufferAttribute(arc, 1));
        g.setIndex(idx);
        return g;
      }

      /* ---- the layout: where each section sits along the rail (s = world units; the camera is at s while the page
         is scrolled s/UNIT screens past the end of the hero) */
      var L = null, rail = null, thread = null, threadMesh = null, segs = [];
      function measure() {
        var sy = window.pageYOffset, vh = window.innerHeight, hb = hero.getBoundingClientRect().bottom + sy;
        var k = UNIT / vh, secs = [];
        Array.prototype.forEach.call(root.children, function (el) {
          if (el === hero || el === cvs || !el.offsetHeight || el.classList.contains('lnw-badge')) return;
          var r = el.getBoundingClientRect(), c = el.classList;
          secs.push({ kind: c.contains('lnw-band') ? 'band' : c.contains('lnw-logos') ? 'logos' : c.contains('lnw-agent') ? 'agent' : c.contains('lnw-work') ? 'work'
            : c.contains('lnw-res') ? 'res' : c.contains('lnw-plat') ? 'plat' : c.contains('lnw-trans') ? 'trans' : c.contains('lnw-int') ? 'int'
            : c.contains('lnw-cta') ? 'cta' : 'pos',
            s: (r.top + sy - hb - vh * 0.55) * k, e: (r.bottom + sy - hb - vh * 0.55) * k });
        });
        var end = Math.max(20, (root.getBoundingClientRect().bottom + sy - vh - hb) * k);
        return { hb: hb, k: k, vh: vh, w: window.innerWidth, end: end, secs: secs,
          sig: [Math.round(hb), window.innerWidth, Math.round(end)].concat(secs.map(function (x) { return Math.round(x.s); })).join(',') };
      }

      /* ---- the rail: a long gentle curve forward (-z), sampled every DS with a frame (tangent, right, up) */
      var DS = 0.2, S0 = -60;
      function makeRail(len) {
        var pts = [], s;
        for (s = S0 - 12; s <= len + 200; s += 12)
          pts.push(new T.Vector3(10 * Math.sin(s / 41) + 4 * Math.sin(s / 15.3 + 1), 3.2 * Math.sin(s / 33 + 2) + 1.2 * Math.sin(s / 11.7), -s));
        var curve = new T.CatmullRomCurve3(pts, false, 'centripetal');
        curve.arcLengthDivisions = pts.length * 40;   /* even spacing along a long curve */
        var total = curve.getLength(), n = Math.floor(total / DS);
        var sp = curve.getSpacedPoints(n), P = new Float32Array((n + 1) * 3), Tg = new Float32Array((n + 1) * 3), R = new Float32Array((n + 1) * 3), U = new Float32Array((n + 1) * 3);
        var t = new T.Vector3(), r = new T.Vector3(), u = new T.Vector3(), up = new T.Vector3(0, 1, 0);
        for (var i = 0; i <= n; i++) {
          P[i * 3] = sp[i].x; P[i * 3 + 1] = sp[i].y; P[i * 3 + 2] = sp[i].z;
          t.subVectors(sp[Math.min(i + 1, n)], sp[Math.max(i - 1, 0)]).normalize();
          r.crossVectors(t, up).normalize(); u.crossVectors(r, t).normalize();
          Tg[i * 3] = t.x; Tg[i * 3 + 1] = t.y; Tg[i * 3 + 2] = t.z;
          R[i * 3] = r.x; R[i * 3 + 1] = r.y; R[i * 3 + 2] = r.z;
          U[i * 3] = u.x; U[i * 3 + 1] = u.y; U[i * 3 + 2] = u.z;
        }
        return { n: n + 1, ds: total / n, s0: S0 - 12, P: P, T: Tg, R: R, U: U };   /* s counts arc length from the first control point */
      }
      function lerp3(A, a, f, v) { v.set(A[a] + (A[a + 3] - A[a]) * f, A[a + 1] + (A[a + 4] - A[a + 1]) * f, A[a + 2] + (A[a + 5] - A[a + 2]) * f); }
      function at(s, o) {   /* rail point + frame at s, interpolated: o = {p, t, r, u} */
        var f = (s - rail.s0) / rail.ds, i = Math.floor(f);
        if (i < 0) { i = 0; f = 0; } else if (i > rail.n - 2) { i = rail.n - 2; f = 1; } else f -= i;
        lerp3(rail.P, i * 3, f, o.p); lerp3(rail.T, i * 3, f, o.t); lerp3(rail.R, i * 3, f, o.r); lerp3(rail.U, i * 3, f, o.u);
        return o;
      }
      function frameObj() { return { p: new T.Vector3(), t: new T.Vector3(), r: new T.Vector3(), u: new T.Vector3() }; }

      /* ---- where the thread sits beside the rail, section by section (dx right, dy up, in the rail's frame) */
      var TAU = Math.PI * 2;
      function pattern(kind, u, s) {
        switch (kind) {
          case 'logos': return [2.2 * Math.sin(0.15 * u + 2), -2.4];
          case 'band': return [0.5 * Math.sin(0.2 * u), -2.5];
          case 'agent': return [0.35 * Math.sin(0.3 * u), -1.85];
          case 'work': { var a = u * TAU / 24 - Math.PI / 2; return [4.4 * Math.cos(a), 3.5 * Math.sin(a) - 0.4]; }
          case 'res': { var b = u * TAU / 10 - Math.PI / 2; return [2.5 * Math.cos(b), 2.5 * Math.sin(b)]; }
          case 'plat': return [6.5 * Math.sin(u * TAU / 46), -0.8 + 2.6 * Math.cos(u * TAU / 46)];
          case 'trans': return [-3.4, -1.7];
          case 'int': return [3.6 * Math.sin(0.13 * u + 1), -1.4 + 0.9 * Math.sin(0.09 * u)];
          case 'cta': {
            var w = clamp((s - (L.end - 8)) / 30, 0, 1); w = w * w * (3 - 2 * w);
            return [2.6 * Math.sin(0.12 * u + 0.5) * (1 - w), (-1.6 + 0.5 * Math.sin(0.1 * u)) * (1 - w) + 0.2 * w];
          }
          default: return [3.4 * Math.sin(0.1 * u + 0.6), -1.5 + 0.7 * Math.sin(0.07 * u)];
        }
      }
      function disp(s) {
        var i = 0, BL = 7;
        while (i < segs.length - 1 && s >= segs[i + 1].b) i++;
        var d = pattern(segs[i].kind, s - segs[i].o, s), j = -1;
        if (i > 0 && s < segs[i].b + BL) j = i - 1;
        else if (i < segs.length - 1 && s > segs[i + 1].b - BL) j = i + 1;
        if (j < 0) return d;
        var bd = j < i ? segs[i].b : segs[i + 1].b, w = clamp((s - bd + BL) / (2 * BL), 0, 1), e = pattern(segs[j].kind, s - segs[j].o, s);
        w = w * w * (3 - 2 * w);   /* weight of the later section across the boundary */
        if (j < i) w = 1 - w;
        return [d[0] + (e[0] - d[0]) * w, d[1] + (e[1] - d[1]) * w];
      }
      var F1 = null;
      function threadPoint(s, v) { at(s, F1); var d = disp(s); return v.copy(F1.p).addScaledVector(F1.r, d[0]).addScaledVector(F1.u, d[1]); }

      function dispose() {
        while (world.children.length) { var c = world.children.pop(); if (c.geometry) c.geometry.dispose(); if (c.dispose) c.dispose(); }
      }
      function build() {
        var M = measure();
        if (L && M.sig === L.sig) return;
        L = M; F1 = frameObj();
        dispose();
        rail = makeRail(L.end + 60);
        /* the stretch of thread seen while each section is on screen starts a little ahead of its anchor */
        segs = L.secs.map(function (x) { return { kind: x.kind, b: x.s + 8, o: x.s + 8, s: x.s, e: x.e }; });
        segs[0].b = -1e5;
        var sStart = 4, sEnd = L.end + 22, A = frameObj(), v = new T.Vector3(), lines = [], i, j, s;
        /* the thread */
        var tp = [], ta = [];
        for (s = sStart; s <= sEnd + 0.001; s += DS) { threadPoint(s, v); tp.push(v.x, v.y, v.z); ta.push(s); }
        thread = { from: sStart, to: sEnd, step: DS, count: ta.length };
        threadMesh = new T.Mesh(ribbonGeo([{ p: tp, a: ta }]), threadMat);
        threadMat.uniforms.uFrom.value = sStart; threadMat.uniforms.uTo.value = sEnd;
        threadMesh.frustumCulled = false; world.add(threadMesh);
        /* gates: one at each image band, four rings over the agent steps, the closing ring the thread runs into */
        function ring(sc, rad, lift) {
          at(sc, A); var p = [];
          for (j = 0; j < 96; j++) {
            var a = j / 96 * TAU;
            p.push(A.p.x + A.r.x * Math.cos(a) * rad + A.u.x * (Math.sin(a) * rad + lift), A.p.y + A.r.y * Math.cos(a) * rad + A.u.y * (Math.sin(a) * rad + lift),
              A.p.z + A.r.z * Math.cos(a) * rad + A.u.z * (Math.sin(a) * rad + lift));
          }
          lines.push({ p: p, closed: true });
        }
        segs.forEach(function (g) {
          if (g.kind === 'band') ring(g.s + 24, 4.6, 0.2);
          if (g.kind === 'agent') { var span = Math.max(28, g.e - g.s - 18); for (j = 0; j < 4; j++) ring(g.s + 16 + j * span / 3.4, 3.2, 0.1); }
        });
        ring(sEnd, 3.0, 0.2); ring(sEnd, 3.7, 0.2);
        var rings = new T.Mesh(ribbonGeo(lines), ringMat); rings.frustumCulled = false; world.add(rings);
        /* a ruler of ticks under the transparency rows */
        var ticks = [];
        segs.forEach(function (g) {
          if (g.kind !== 'trans') return;
          for (s = g.b + 6, j = 0; s < g.b + Math.max(30, g.e - g.s); s += 2.2, j++) {
            at(s, A); threadPoint(s, v);
            var h = j % 5 ? 0.42 : 0.95;
            ticks.push({ p: [v.x, v.y, v.z, v.x + A.u.x * h, v.y + A.u.y * h, v.z + A.u.z * h] });
          }
        });
        if (ticks.length) { var tk = new T.Mesh(ribbonGeo(ticks), tickMat); tk.frustumCulled = false; world.add(tk); }
        /* dust through the whole volume */
        var len = sEnd - S0 + 40, nd = Math.min(5200, Math.round(len * (phone ? 2.6 : 4.4))), dp = new Float32Array(nd * 3), dr = new Float32Array(nd * 4);
        for (i = 0; i < nd; i++) {
          s = S0 + Math.random() * len; at(s, A);
          var ang = Math.random() * TAU, rad = 0.8 + Math.pow(Math.random(), 0.8) * 18;
          v.copy(A.p).addScaledVector(A.r, Math.cos(ang) * rad).addScaledVector(A.u, Math.sin(ang) * rad * 0.8);
          dp[i * 3] = v.x; dp[i * 3 + 1] = v.y; dp[i * 3 + 2] = v.z;
          dr[i * 4] = 0.03 + Math.random() * 0.06; dr[i * 4 + 1] = Math.random(); dr[i * 4 + 2] = 0.25 + Math.random() * 0.75; dr[i * 4 + 3] = Math.random();
        }
        var dg = new T.BufferGeometry();
        dg.setAttribute('position', new T.BufferAttribute(dp, 3)); dg.setAttribute('aRnd', new T.BufferAttribute(dr, 4));
        var dust = new T.Points(dg, dustMat); dust.frustumCulled = false; world.add(dust);
        /* flares: the spark where the thread starts, the light inside the closing ring */
        var fp = [], fr = [];
        function flare(p, size, gain) { fp.push(p.x, p.y, p.z); fr.push(size, 0.5, gain, 0); }
        threadPoint(sStart, v); flare(v, 0.9, 1); flare(v, 3.2, 0.35);
        threadPoint(sEnd, v); flare(v, 1.2, 1); flare(v, 6.5, 0.4);
        var fg = new T.BufferGeometry();
        fg.setAttribute('position', new T.BufferAttribute(new Float32Array(fp), 3)); fg.setAttribute('aRnd', new T.BufferAttribute(new Float32Array(fr), 4));
        var flares = new T.Points(fg, flareMat); flares.frustumCulled = false; world.add(flares);
        /* shards: scattered round the rail, thicker round the work */
        var base = new T.IcosahedronGeometry(1, 0), bp = base.attributes.position, jit = {};
        for (i = 0; i < bp.count; i++) {
          var key = bp.getX(i).toFixed(3) + ',' + bp.getY(i).toFixed(3) + ',' + bp.getZ(i).toFixed(3);
          if (!jit[key]) jit[key] = 0.72 + Math.random() * 0.5;
          bp.setXYZ(i, bp.getX(i) * jit[key], bp.getY(i) * jit[key], bp.getZ(i) * jit[key]);
        }
        base.computeVertexNormals();
        var work = segs.filter(function (g) { return g.kind === 'work'; })[0], extra = work ? (phone ? 30 : 60) : 0;
        var ns = Math.round(clamp(len * (phone ? 0.16 : 0.28), 60, 320)) + extra, spin = new Float32Array(ns * 4);
        var shards = new T.InstancedMesh(base, shardMat, ns), m = new T.Matrix4(), qt = new T.Quaternion(), sc = new T.Vector3(), ax = new T.Vector3();
        for (i = 0; i < ns; i++) {
          var near = i >= ns - extra;
          s = near ? work.o + Math.random() * Math.max(40, work.e - work.s + 20) : S0 + 20 + Math.random() * (len - 20);
          at(s, A);
          var an = Math.random() * TAU, rr = near ? 5.5 + Math.random() * 9 : 6 + Math.pow(Math.random(), 1.3) * 22;
          v.copy(A.p).addScaledVector(A.r, Math.cos(an) * rr).addScaledVector(A.u, Math.sin(an) * rr * 0.72);
          var k = (0.18 + Math.pow(Math.random(), 2.2) * (near ? 1.3 : 1.9)) * clamp(rr / 11, 0.45, 1);   /* the close ones stay small */
          sc.set(k * (0.8 + Math.random() * 0.5), k * (0.7 + Math.random() * 0.6), k * (0.8 + Math.random() * 0.5));
          qt.setFromAxisAngle(ax.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), Math.random() * TAU);
          m.compose(v, qt, sc); shards.setMatrixAt(i, m);
          ax.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
          spin[i * 4] = ax.x; spin[i * 4 + 1] = ax.y; spin[i * 4 + 2] = ax.z; spin[i * 4 + 3] = (0.05 + Math.random() * 0.3) * (Math.random() < 0.5 ? -1 : 1);
        }
        base.setAttribute('aSpin', new T.InstancedBufferAttribute(spin, 4));
        shards.instanceMatrix.needsUpdate = true; shards.frustumCulled = false; world.add(shards);
        wake();
      }

      /* ---- size, pointer, the frame */
      function size() {
        var w = cvs.clientWidth || window.innerWidth, h = cvs.clientHeight || window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 1.75);
        renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
        res.set(Math.round(w * dpr), Math.round(h * dpr));
        cam.aspect = w / h;
        threadMat.uniforms.uMinPx.value = 1.3 * dpr; ringMat.uniforms.uMinPx.value = 1.1 * dpr; tickMat.uniforms.uMinPx.value = 0.9 * dpr;
      }
      var mx = 0, my = 0, cmx = 0, cmy = 0, sCam = null, vel = 0, fov = 58, raf = 0, CA = frameObj(), CB = frameObj(), tgt = new T.Vector3(), upv = new T.Vector3();
      if (fine) window.addEventListener('mousemove', function (e) { mx = e.clientX / window.innerWidth * 2 - 1; my = e.clientY / window.innerHeight * 2 - 1; }, { passive: true });

      function frame(now) {
        raf = 0;
        var dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
        if (!rail || document.hidden) return;
        var ch = cvs.clientHeight || window.innerHeight, hbv = hero.getBoundingClientRect().bottom, rbv = root.getBoundingClientRect().bottom;
        var on = hbv < ch - 1 && rbv > 1;
        cvs.classList.toggle('is-on', on);
        if (!on) { sCam = null; return; }
        cvs.style.clipPath = 'inset(' + Math.max(0, Math.round(hbv)) + 'px 0 ' + Math.max(0, Math.round(ch - rbv)) + 'px 0)';
        time += dt;
        var target = clamp((window.pageYOffset - L.hb) * L.k, S0 + 4, L.end);
        if (sCam === null) sCam = target;
        var prev = sCam;
        sCam += (target - sCam) * (1 - Math.exp(-dt * 6));
        vel += ((sCam - prev) / dt - vel) * 0.08;
        cmx += (mx - cmx) * 0.05; cmy += (my - cmy) * 0.05;
        /* camera: just above the rail, looking ahead and a touch down, leaning into the bends */
        at(sCam, CA); at(sCam + 14, CB);
        cam.position.copy(CA.p).addScaledVector(CA.u, 0.45 - cmy * 0.35).addScaledVector(CA.r, cmx * 0.7);
        tgt.copy(CB.p).addScaledVector(CB.u, -0.75).addScaledVector(CB.r, cmx * 0.25);
        var turn = (CB.t.x - CA.t.x) * CA.r.x + (CB.t.y - CA.t.y) * CA.r.y + (CB.t.z - CA.t.z) * CA.r.z, roll = clamp(-turn * 1.4, -0.22, 0.22);
        upv.copy(CA.u).multiplyScalar(Math.cos(roll)).addScaledVector(CA.r, Math.sin(roll));
        cam.up.copy(upv); cam.lookAt(tgt);
        var wantFov = (cam.aspect < 1 ? 70 : 56) + Math.min(9, Math.abs(vel) * 0.12);
        fov += (wantFov - fov) * 0.08;
        if (Math.abs(cam.fov - fov) > 0.01) { cam.fov = fov; cam.updateProjectionMatrix(); }
        /* pulses run ahead of the camera along the thread and light the shards they pass */
        var i;
        for (i = 0; i < 4; i++) {
          var ps = sCam - 6 + ((time * 12 + i * 19) % 76);
          pulse[i] = ps;
          if (ps > thread.from && ps < thread.to) { threadPoint(ps, lightP[i]); lightI[i] = 1.1; } else lightI[i] = 0;
        }
        threadPoint(clamp(sCam + 5, thread.from, thread.to), lightP[4]); lightI[4] = 0.55;
        threadPoint(clamp(sCam + 15, thread.from, thread.to), lightP[5]); lightI[5] = 0.45;
        /* only the stretch of thread near the camera is drawn */
        var i0 = clamp(Math.floor((sCam - 4 - thread.from) / thread.step), 0, thread.count - 1), i1 = clamp(Math.ceil((sCam + 95 - thread.from) / thread.step), 0, thread.count - 1);
        threadMesh.geometry.setDrawRange(i0 * 6, Math.max(0, i1 - i0) * 6);
        var px = res.y * cam.projectionMatrix.elements[5] * 0.5;
        dustMat.uniforms.uTime.value = flareMat.uniforms.uTime.value = shardMat.uniforms.uTime.value = time;
        dustMat.uniforms.uPx.value = flareMat.uniforms.uPx.value = px;
        renderer.render(scene, cam);
        raf = requestAnimationFrame(frame);   /* keeps running while the world is on screen */
      }
      function wake() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
      var bt = 0, lastW = window.innerWidth;
      function relayout() { clearTimeout(bt); bt = setTimeout(function () { size(); build(); }, 220); }
      window.addEventListener('scroll', wake, { passive: true });
      window.addEventListener('resize', function () {
        size(); wake();
        if (window.innerWidth !== lastW) { lastW = window.innerWidth; phone = lastW < 768; relayout(); }   /* phones: the address bar alone never rebuilds */
      });
      document.addEventListener('visibilitychange', wake);
      if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(root);
      size(); build();
    }
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
