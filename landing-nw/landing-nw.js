/* cyb3rLandingNW - Relevance Advertising in the brand-nw.com home layout (markup + CSS: landing-nw/embed-*.html).
 * Motion follows brand-nw.com: a navy intro curtain, eased wheel/keyboard scrolling, the page gliding half a screen
 * down once the film has run (unless the visitor moved first), statements rising line by line, mono labels decoding,
 * labels and side copy lagging the scroll, magnetic links, a scroll-scrubbed logo strip, a brand-name strip that
 * drifts with scroll speed, a scroll-linked example rail whose cards open from the bottom, fixed-layer image bands,
 * floating statements, a one-open accordion, the floating Discovery Call badge, a pop-up that opens as a circle
 * from the click, and a veil that rises before leaving for another page. After the hero the page becomes a 3D journey:
 * the scroll flies along a teal thread of light from one piece of content to the next (three.js, after ysuriadesign.co).
 * The hero film is a muted loop; "Watch the video" or a click on the film restarts it with sound and controls. The Discovery Call modal (second block) moves
 * the page's NATIVE Webflow form (#cybDiscoveryNative) into it, so submissions still land in Webflow. */
(function () {
  if (window.__lnw) return; window.__lnw = 1;
  var root = document.getElementById('lnw');
  if (!root) return;
  var html = document.documentElement, body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = window.matchMedia('(hover: none)').matches || 'ontouchstart' in window;
  var fine = !touch && window.matchMedia('(pointer: fine)').matches;
  /* the 3D journey replaces the stacked sections wherever the browser can draw it (journey() below) */
  var JOURNEY = !reduce && !!document.getElementById('lnwHero') && (function () {
    try { var c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) && !!(window.CSS && CSS.supports && CSS.supports('transform-style', 'preserve-3d')); }
    catch (e) { return false; }
  })();
  function inJourney(el) { return JOURNEY && !!el.closest('.lnw-stage'); }
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
      stmts.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight && !inJourney(el)) el.classList.add('is-in'); });
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
    var off = function (el) { return !inJourney(el); };   /* the journey reveals its own copy, stop by stop */
    var targets = $$('[data-reveal], .lnw-stmt[data-split]').filter(off), term = $$('.lnw-lab, .lnw-tag, .lnw-step__tags span, .lnw-cap__n, .lnw-pills li').filter(off);
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
  var lag = (reduce || JOURNEY) ? [] : $$('.lnw-lab, .lnw-side').map(function (el, i) {
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
    if (!reduce && !JOURNEY) stmts.forEach(function (el) {
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
    if (JOURNEY) return false;
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
  if (logoTrack && !reduce && !JOURNEY) onTick(function () {
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
    var on = fine && !reduce && !JOURNEY && window.innerWidth > 767;
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
  else if (!JOURNEY) {   /* in the journey each card opens when the camera reaches it */
    var cardIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { cardIO.unobserve(en.target); en.target.classList.add('is-in'); } });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    cards.forEach(function (c) { cardIO.observe(c); });
  }
  /* card films load a screen early and only play while visible */
  if (IO && !JOURNEY) {
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
    badge.classList.toggle('is-on', ready && !watching && !ending && !jEnd && !modalOpen());
  }
  var endEls = [JOURNEY ? null : root.querySelector('.lnw-cta')].concat(Array.prototype.slice.call(document.querySelectorAll('section.for-services, .foot2, footer')))
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

  /* ---- the journey (after ysuriadesign.co). Between the hero and the footer the page becomes one pinned 3D world.
     The scroll flies a camera along a teal thread of light from one piece of the page to the next, each set in its own
     place and at its own angle: the opening ring, a ring of client logos, the four agent steps hanging from the thread,
     the five examples, the results inside its coils, the platform it circles, the transparency ruler, the three
     activation models in their rings and the closing ring it runs into. The piece in view sits mid-screen, joined to the
     thread; its copy sits bottom left. Every word and picture is the page's own, moved into place (not copied); the
     pieces in space are HTML set in 3D over a three.js canvas (r128, the copy the homepage loads). Off for reduced
     motion and without WebGL, where the page keeps its normal sections. */
  var jEnd = false, journeyOn = function () {};
  (function journey() {
    if (!JOURNEY) return;
    var jReady = false, failed = false, wake = function () {};
    journeyOn = function () { jReady = true; wake(); };

    /* ---- the stage: a track as tall as the trip, a sticky full-screen stage inside it */
    var track = document.createElement('div'), stage = document.createElement('div'), cvs = document.createElement('canvas');
    var view = document.createElement('div'), cam3 = document.createElement('div'), ov = document.createElement('div'), hud = document.createElement('div');
    track.className = 'lnw-track'; stage.className = 'lnw-stage'; cvs.className = 'lnw-gl'; view.className = 'lnw-3d'; cam3.className = 'lnw-3d__cam';
    ov.className = 'lnw-ov'; hud.className = 'lnw-hud';
    cvs.setAttribute('aria-hidden', 'true'); hud.setAttribute('aria-hidden', 'true');
    hud.innerHTML = '<span class="lnw-hud__n"></span><span class="lnw-hud__bar"><i></i></span>';
    view.appendChild(cam3);
    [cvs, view, ov, hud].forEach(function (el) { stage.appendChild(el); });
    track.appendChild(stage);
    hero.parentNode.insertBefore(track, hero.nextSibling);
    var hudN = hud.firstChild, hudBar = hud.lastChild.firstChild;

    var moved = [];
    function take(el, into) { if (!el) return null; moved.push([el, el.parentNode, el.nextSibling]); into.appendChild(el); return el; }
    function q(s) { return root.querySelector(s); }
    function chapter(parts) {
      var c = document.createElement('div'); c.className = 'lnw-ch';
      parts.forEach(function (p) { take(p, c); });
      ov.appendChild(c); return c;
    }
    var items = [];
    function item(el, w, cls) {
      if (!el) return null;
      var box = document.createElement('div'); box.className = 'lnw-3d__it ' + cls; box.style.width = w + 'px';
      take(el, box); cam3.appendChild(box);
      var it = { el: box, op: -1 }; items.push(it); return it;
    }
    /* copy into chapters (page order), pieces into space */
    var cards = $$('.lnw-work .lnw-card'), CH = {};
    CH.pos = chapter([q('.lnw-pos .lnw-head'), q('.lnw-pos .lnw-side')]);
    CH.agent = chapter([q('.lnw-agent .lnw-lab'), q('.lnw-agent .lnw-stmt')]);
    CH.cards = cards.map(function (c) { return chapter([c.querySelector('.lnw-card__meta')]); });
    CH.res = chapter([q('.lnw-res .lnw-lab'), q('.lnw-res .lnw-stmt')]);
    CH.plat = chapter([q('.lnw-plat .lnw-head'), q('.lnw-plat .lnw-side')]);
    CH.trans = chapter([q('.lnw-trans .lnw-head'), q('.lnw-trans .lnw-side')]);
    CH['int'] = chapter([q('.lnw-int .lnw-head'), q('.lnw-int .lnw-side')]);
    CH.cta = chapter([q('.lnw-cta .lnw-head'), q('.lnw-cta .lnw-side')]);
    var IT = {
      logos: $$('.lnw-logos__list:first-child img').map(function (img) { img.loading = 'eager'; return item(img, 170, 'is-logo'); }),
      steps: $$('.lnw-agent .lnw-step').map(function (s) { return item(s, 340, 'is-card is-step'); }),
      names: item(q('.lnw-work .lnw-marq'), 5600, 'is-names'),
      cards: cards.map(function (c) { return item(c, 300, 'is-film'); }),
      stats: $$('.lnw-res .lnw-stat').map(function (s) { return item(s, 480, 'is-stat'); }),
      plat: item(q('.lnw-plat__img'), 1000, 'is-plat'),
      rows: $$('.lnw-trans .lnw-row').map(function (r) { return item(r, 520, 'is-card is-row'); }),
      caps: $$('.lnw-int .lnw-cap').map(function (c) { return item(c, 500, 'is-card is-cap'); })
    };
    $$('img', stage).forEach(function (img) { img.loading = 'eager'; });
    $$('[data-reveal]', stage).forEach(function (el) { el.classList.add('is-in'); });
    $$('.lnw-cap', stage).forEach(function (c) {
      c.classList.add('is-open');
      var b = c.querySelector('.lnw-cap__s'); b.setAttribute('aria-expanded', 'true'); b.setAttribute('tabindex', '-1');
    });
    root.classList.add('is-journey');

    /* ---- the stops: how long the camera holds at each piece and travels to the next, in screens of scroll */
    var STOPS = [{ k: 'pos', g: 1, ch: CH.pos, hold: 1, travel: 1 }, { k: 'logos', g: 1, ch: null, hold: 0.7, travel: 1 },
      { k: 'agent', g: 2, ch: CH.agent, hold: 1.8, travel: 1 }];
    CH.cards.forEach(function (c, i) { STOPS.push({ k: 'work' + i, i: i, g: 3, ch: c, hold: 0.5, travel: i < CH.cards.length - 1 ? 0.55 : 1 }); });
    STOPS.push({ k: 'res', g: 4, ch: CH.res, hold: 1.6, travel: 1 }, { k: 'plat', g: 5, ch: CH.plat, hold: 1.2, travel: 1 },
      { k: 'trans', g: 6, ch: CH.trans, hold: 1.4, travel: 1 }, { k: 'int', g: 7, ch: CH['int'], hold: 1.6, travel: 1 },
      { k: 'cta', g: 8, ch: CH.cta, hold: 1.2, travel: 0 });
    var TOTAL = 0, GROUPS = 8;
    STOPS.forEach(function (s) { s.h0 = TOTAL; TOTAL += s.hold; s.h1 = TOTAL; TOTAL += s.travel; });
    track.style.height = ((TOTAL + 1) * 100) + 'vh';

    /* three.js failed to arrive: put everything back where it came from */
    function revert() {
      if (failed) return; failed = true;
      for (var i = moved.length - 1; i >= 0; i--) moved[i][1].insertBefore(moved[i][0], moved[i][2]);
      if (track.parentNode) track.parentNode.removeChild(track);
      root.classList.remove('is-journey');
      $$('.lnw-stmt, [data-reveal], .lnw-card').forEach(function (el) { el.classList.add('is-in'); });
    }
    if (window.THREE && window.THREE.WebGLRenderer) setTimeout(function () { init(window.THREE); }, 0);
    else {
      var tag = document.createElement('script');
      tag.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      tag.integrity = 'sha512-dLxUelApnYxpLt6K2iomGngnHO83iUvZytA3YjDUCjT0HDOHKXnVYdf3hU4JjM8uEhxf9nD1/ey98U3t2vZ0qQ==';
      tag.crossOrigin = 'anonymous';
      tag.onload = function () { if (window.THREE && window.THREE.WebGLRenderer) init(window.THREE); else revert(); };
      tag.onerror = revert;
      document.head.appendChild(tag);
    }

    /* every line of light (thread, rings, ruler ticks) is a camera-facing ribbon: world width, so it thins with distance,
       never under a pixel; a hot core inside a soft halo, fogged by depth, pulses travelling along it */
    var RIBBON_VS = [
      'attribute vec3 tdir;attribute float side;attribute float arc;',
      'uniform vec2 uRes;uniform float uWidth;uniform float uMinPx;',
      'varying float vSide;varying float vArc;varying float vDepth;varying float vPx;',
      'void main(){',
      ' vec4 mv=modelViewMatrix*vec4(position,1.0);vec4 mt=modelViewMatrix*vec4(position+tdir*20.0,1.0);',
      ' float z=min(mv.z,-12.0);',
      ' vec4 c=projectionMatrix*vec4(mv.xy,z,1.0);vec4 c2=projectionMatrix*vec4(mt.xy,min(mt.z,-12.0),1.0);',
      ' vec2 d=(c2.xy/c2.w-c.xy/c.w)*uRes;float dl=length(d);',
      ' vec2 n=dl>0.0001?vec2(-d.y,d.x)/dl:vec2(0.0,1.0);',
      ' float ppu=projectionMatrix[1][1]*uRes.y*0.5/-z,px=clamp(uWidth*ppu,uMinPx,200.0);',
      /* where the line turns toward the camera it narrows, instead of fanning into a starburst */
      ' px=max(uMinPx,px*mix(0.22,1.0,smoothstep(0.04,0.4,dl*0.5/(ppu*20.0))));',
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
      ' float p=0.0;for(int k=0;k<4;k++){float e=(vArc-uPulse[k])/90.0;p+=exp(-e*e);}p*=uPulseGain;',
      ' float f=exp(-vDepth*vDepth*uFog*uFog)*smoothstep(60.0,320.0,vDepth);',
      ' float ends=smoothstep(uFrom,uFrom+60.0,vArc)*(1.0-smoothstep(uTo-20.0,uTo,vArc));',
      ' vec3 col=(uColor*halo*0.55*(1.0+p*2.2)+uCore*core*(0.85+p*1.6))*f*ends*uGain;',
      ' gl_FragColor=vec4(col,1.0);}'
    ].join('\n');
    /* dust and flares: round soft points sized in world units */
    var DOT_VS = [
      'attribute vec4 aRnd;uniform float uTime;uniform float uPx;uniform float uFog;uniform float uMaxPx;varying float vA;',
      'void main(){vec3 p=position;',
      ' p.x+=sin(uTime*0.27+aRnd.y*6.28)*30.0*aRnd.w;p.y+=cos(uTime*0.21+aRnd.y*4.1)*30.0*aRnd.w;',
      ' vec4 mv=modelViewMatrix*vec4(p,1.0);float d=max(-mv.z,1.0);',
      ' gl_PointSize=clamp(aRnd.x*uPx/d,1.0,uMaxPx);',
      ' float tw=0.6+0.4*sin(uTime*1.5+aRnd.y*23.0);',
      ' vA=aRnd.z*tw*exp(-d*d*uFog*uFog)*smoothstep(40.0,260.0,d)*step(0.0,-mv.z);',
      ' gl_Position=projectionMatrix*mv;}'
    ].join('\n');
    var DOT_FS = 'uniform vec3 uColor;varying float vA;void main(){vec2 q=gl_PointCoord*2.0-1.0;float r=dot(q,q);if(r>1.0)discard;' +
      'gl_FragColor=vec4(uColor*exp(-r*4.0)*vA,1.0);}';
    /* shards: dark faceted solids turning slowly, a teal rim, lit by the pulses and the piece in view */
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
      ' for(int i=0;i<6;i++){vec3 L=uL[i]-vW;float d2=dot(L,L);c+=uTeal*uLi[i]*max(dot(N,L*inversesqrt(d2+1.0)),0.0)/(1.0+d2*0.000012);}',
      ' float d=length(cameraPosition-vW);gl_FragColor=vec4(mix(uFogCol,c,exp(-d*d*uFog*uFog)),1.0);}'
    ].join('\n');

    function init(T) {
      if (failed) return;
      var renderer, phone = window.innerWidth < 768;
      try { renderer = new T.WebGLRenderer({ canvas: cvs, antialias: !phone, alpha: false, powerPreference: 'high-performance' }); }
      catch (e) { revert(); return; }
      var BG = new T.Color('#131c25'), TEAL = new T.Color('#39F1E0'), CORE = new T.Color('#e6fffc'), FOG = 1 / 5200, TAU = Math.PI * 2;
      renderer.setClearColor(BG, 1);
      var scene = new T.Scene(), cam = new T.PerspectiveCamera(40, 1, 10, 26000), world = new T.Group();
      scene.add(world);
      var res = new T.Vector2(1, 1), pulse = [0, 0, 0, 0], lightP = [], lightI = [0, 0, 0, 0, 0, 0];
      for (var li = 0; li < 6; li++) lightP.push(new T.Vector3(0, -1e5, 0));

      function ribbonMat(width, gain, pulses) {
        return new T.ShaderMaterial({
          uniforms: { uRes: { value: res }, uWidth: { value: width }, uMinPx: { value: 1.2 }, uColor: { value: TEAL }, uCore: { value: CORE },
            uGain: { value: gain }, uFog: { value: FOG }, uPulse: { value: pulses ? pulse : [-1e6, -1e6, -1e6, -1e6] }, uPulseGain: { value: pulses ? 1 : 0 },
            uFrom: { value: -1e9 }, uTo: { value: 1e9 } },
          vertexShader: RIBBON_VS, fragmentShader: RIBBON_FS, transparent: true, depthWrite: false, blending: T.AdditiveBlending
        });
      }
      function dotMat(color, maxPx) {
        return new T.ShaderMaterial({
          uniforms: { uTime: { value: 0 }, uPx: { value: 1000 }, uFog: { value: FOG }, uMaxPx: { value: maxPx }, uColor: { value: new T.Color(color) } },
          vertexShader: DOT_VS, fragmentShader: DOT_FS, transparent: true, depthWrite: false, blending: T.AdditiveBlending
        });
      }
      var threadMat = ribbonMat(20, 1, true), ringMat = ribbonMat(9, 0.65, false), tickMat = ribbonMat(5, 0.55, false);
      var dustMat = dotMat('#bdfaf4', 34), flareMat = dotMat('#7ff6ea', 380);
      var shardMat = new T.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uBase: { value: new T.Color('#223140') }, uTeal: { value: TEAL }, uFogCol: { value: BG }, uFog: { value: FOG },
          uL: { value: lightP }, uLi: { value: lightI } },
        vertexShader: SHARD_VS, fragmentShader: SHARD_FS
      });
      function ribbonGeo(lines) {   /* two vertices per point (the ribbon's edges), any number of polylines */
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
            if (i < m - 1 || l.closed) { var qv = base + i * 2, rv = base + ((i + 1) % m) * 2; idx.push(qv, qv + 1, rv, qv + 1, rv + 1, rv); }
          }
        });
        var g = new T.BufferGeometry();
        g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('tdir', new T.BufferAttribute(td, 3));
        g.setAttribute('side', new T.BufferAttribute(side, 1)); g.setAttribute('arc', new T.BufferAttribute(arc, 1));
        g.setIndex(idx);
        return g;
      }
      function add(obj) { obj.frustumCulled = false; world.add(obj); return obj; }

      /* ---- the world: each piece of the page in its own frame (origin + turn), so the camera swings between them */
      var SEC = { pos: [0, 0, 0, 0], logos: [2600, 600, -3800, -35], agent: [7000, -200, -6600, -65], work: [10600, 900, -11000, -20],
        res: [9800, -300, -18200, 25], plat: [6400, 1200, -22400, 50], trans: [2600, -500, -26200, 20], 'int': [1200, 400, -30600, -15], cta: [2800, 0, -35000, 0] };
      function yaw(s) { return SEC[s][3] * Math.PI / 180; }
      function P(s, x, y, z) { var f = SEC[s], a = yaw(s), c = Math.cos(a), si = Math.sin(a); return new T.Vector3(f[0] + x * c + z * si, f[1] + y, f[2] - x * si + z * c); }
      var dummy = new T.Object3D();
      function eps(v) { return Math.abs(v) < 1e-10 ? 0 : v; }
      function place(it, s, x, y, z, ry, rx) {   /* an HTML piece at a point in space (CSS3D, as three's CSS3DRenderer) */
        if (!it) return;
        dummy.position.copy(P(s, x, y, z)); dummy.rotation.set(rx || 0, yaw(s) + (ry || 0), 0, 'YXZ'); dummy.updateMatrixWorld(true);
        var e = dummy.matrixWorld.elements;
        it.el.style.transform = 'translate(-50%,-50%) matrix3d(' + [e[0], e[1], e[2], e[3], -e[4], -e[5], -e[6], -e[7], e[8], e[9], e[10], e[11], e[12], e[13], e[14], e[15]].map(eps).join(',') + ')';
        it.pos = dummy.position.clone();
      }
      var camCurve, focCurve, idxA = [], idxB = [], portrait = null, up = new T.Vector3(0, 1, 0);
      var TP = [], RINGS = [], TICKS = [], F = {}, tall = window.innerWidth < window.innerHeight;   /* portrait: taller layouts */
      function ringAt(s, x, y, z, r, ry) {
        var a = yaw(s) + (ry || 0), X = new T.Vector3(Math.cos(a), 0, -Math.sin(a)), c = P(s, x, y, z), p = [];
        for (var j = 0; j < 120; j++) { var t = j / 120 * TAU; p.push(c.x + X.x * Math.cos(t) * r, c.y + Math.sin(t) * r, c.z + X.z * Math.cos(t) * r); }
        RINGS.push({ p: p, closed: true });
      }
      function H(it, d) { return (it && it.el.offsetHeight) || d; }
      /* opening: the thread starts in a ring of light */
      ringAt('pos', 260, 60, 0, 430);
      TP.push(P('pos', 260, 60, 0), P('pos', 320, 80, -700), P('pos', 760, 280, -1800));
      F.pos = { A: [P('pos', -260, -80, 1600), P('pos', 260, 60, 0)], B: [P('pos', -40, -30, 1180), P('pos', 260, 60, -60)] };
      /* the client logos stand in a ring the camera flies through */
      IT.logos.forEach(function (it, k) {
        var th = k / IT.logos.length * TAU + 0.2;
        place(it, 'logos', Math.cos(th) * (tall ? 420 : 780), Math.sin(th) * (tall ? 660 : 470), Math.sin(th * 2) * 120, -Math.cos(th) * 0.45, Math.sin(th) * 0.3);
      });
      TP.push(P('logos', -100, 60, 1000), P('logos', 0, 0, 0), P('logos', 60, -40, -900), P('logos', 360, -160, -1800));
      F.logos = { A: [P('logos', 0, 0, 2050), P('logos', 0, 0, 0)], B: [P('logos', 0, 30, 820), P('logos', 0, 0, -400)],
        via: [P('logos', 0, 10, -1100), P('logos', 0, -40, -2600)], centre: true };
      /* the four agent steps hang from the thread (on portrait screens they hang in a column, the thread at their left) */
      var AX = [-930, -310, 310, 930];
      TP.push(P('agent', tall ? -700 : -1600, tall ? 1000 : 420, 600));
      IT.steps.forEach(function (it, k) {
        var hh = H(it, 270) / 2;
        if (tall) {
          var y = 620 - k * 420, zc = -k * 120;
          place(it, 'agent', 0, y, zc, 0, 0);
          TP.push(P('agent', -430, y + 130, zc + 30), P('agent', -174, y, zc + 4), P('agent', -430, y - 130, zc + 30));
          return;
        }
        var x = AX[k], z = -Math.abs(x) * 0.18;
        place(it, 'agent', x, 0, z, -x / 2600, 0);
        TP.push(P('agent', x - 230, hh + 110, z + 30), P('agent', x, hh + 4, z + 4), P('agent', x + 230, hh + 110, z + 30));
      });
      TP.push(P('agent', tall ? -600 : 1650, tall ? -1100 : 320, -350));
      F.agent = tall ? { A: [P('agent', -160, 700, 1350), P('agent', 0, 620, 0)], B: [P('agent', -120, -560, 1250), P('agent', 0, -640, -360)] }
        : { A: [P('agent', -1260, 80, 1150), P('agent', -930, 0, -170)], B: [P('agent', 880, 60, 1080), P('agent', 930, 0, -170)] };
      /* the five examples float in a field of shards; the thread runs under each one */
      var WK = [[-460, 60, 0, 0.32, 0.04], [620, 380, -1500, -0.38, -0.05], [-380, -180, -3000, 0.28, 0.03], [700, 160, -4500, -0.34, -0.04], [-520, 300, -6000, 0.3, 0.05]];
      place(IT.names, 'work', 0, -150, -8200, 0, 0);
      TP.push(P('work', -1300, -600, 1300));
      IT.cards.forEach(function (it, k) {
        var w = WK[k], hh = H(it, 432) / 2, s = k % 2 ? -1 : 1;
        place(it, 'work', w[0], w[1], w[2], w[3], w[4]);
        TP.push(P('work', w[0] - 300 * s, w[1] - hh - 130, w[2] + 120), P('work', w[0], w[1] - hh - 6, w[2] + 8), P('work', w[0] + 300 * s, w[1] - hh - 130, w[2] - 120));
        var ry = yaw('work') + w[3], nx = Math.sin(ry), nz = Math.cos(ry), rx = Math.cos(ry), rz = -Math.sin(ry), C = P('work', w[0], w[1], w[2]);
        F['work' + k] = {
          A: [new T.Vector3(C.x + nx * 1120 - rx * 280 * s, C.y + 40, C.z + nz * 1120 - rz * 280 * s), C.clone()],
          B: [new T.Vector3(C.x + nx * 960 - rx * 130 * s, C.y + 20, C.z + nz * 960 - rz * 130 * s), C.clone()] };
      });
      /* the results sit inside the thread's coils */
      var RS = [[-760, 120, 0, 0.2], [40, -120, -900, 0], [820, 160, -1800, -0.2]];
      TP.push(P('res', -1500, -300, 900));
      IT.stats.forEach(function (it, k) {
        var r = RS[k];
        place(it, 'res', r[0], r[1], r[2], r[3], 0);
        for (var j = 0; j <= 16; j++) { var th = -Math.PI / 2 + j / 16 * Math.PI * 2.5; TP.push(P('res', r[0] + Math.cos(th) * 430, r[1] + Math.sin(th) * 300, r[2] + 240 - j * 30)); }
      });
      F.res = { A: [P('res', -1120, 60, 1350), P('res', -760, 120, 0)], B: [P('res', 560, 120, -480), P('res', 820, 160, -1800)] };
      /* the platform: the thread circles the dashboard and runs in behind it */
      place(IT.plat, 'plat', 0, 0, 0, 0, -0.06);
      [[-1000, -260, 700], [-780, 0, 0], [-560, 420, -320], [0, 540, -420], [560, 420, -320], [780, 0, 0], [560, -400, -320], [0, -470, -470],
        [-160, -100, -300], [0, 0, -130], [420, -260, -700]].forEach(function (p) { TP.push(P('plat', p[0], p[1], p[2])); });
      F.plat = { A: [P('plat', -1500, 220, 700), P('plat', 0, 0, 0)], B: [P('plat', -260, 90, 1400), P('plat', 0, 0, 0)] };
      /* transparency: a ruler with the three rows standing on it */
      var RX = [-960, 0, 960], x;
      TP.push(P('trans', -2200, -200, 700));
      for (x = -1700; x <= 1700; x += 425) TP.push(P('trans', x, -270, 0));
      TP.push(P('trans', 2200, -120, -600));
      for (x = -1600; x <= 1600; x += 80) TICKS.push({ p: [].concat(P('trans', x, -270, 0).toArray(), P('trans', x, Math.round((x + 1600) / 80) % 5 ? -238 : -198, 0).toArray()) });
      IT.rows.forEach(function (it, k) { place(it, 'trans', RX[k], -180 + H(it, 150) / 2, 0, -RX[k] / 8000, 0); });
      F.trans = { A: [P('trans', -1550, -120, 1050), P('trans', -960, -100, 0)], B: [P('trans', 1100, -90, 1080), P('trans', 960, -100, 0)] };
      /* integration: each activation model inside a ring on the thread */
      var IX = [[-900, 0, 0, 0.15], [0, 0, -500, 0], [900, 0, -1000, -0.15]];
      TP.push(P('int', -1800, -320, 760));
      IT.caps.forEach(function (it, k) {
        var c = IX[k];
        place(it, 'int', c[0], c[1], c[2], c[3], 0);
        ringAt('int', c[0], c[1], c[2] - 70, 330, c[3]);
        TP.push(P('int', c[0], c[1], c[2] - 90));
        if (k < 2) TP.push(P('int', c[0] + 450, k ? -330 : 330, c[2] - 330));
      });
      TP.push(P('int', 1700, 220, -1500));
      F['int'] = { A: [P('int', -1420, 60, 1120), P('int', -900, 0, 0)], B: [P('int', 1120, 40, 280), P('int', 900, 0, -1000)] };
      /* closing: the thread runs into a ring of light */
      ringAt('cta', 240, 80, 0, 560); ringAt('cta', 240, 80, -40, 650);
      TP.push(P('cta', -900, -520, 1500), P('cta', -320, -220, 700), P('cta', 110, 30, 220), P('cta', 240, 80, 0));
      F.cta = { A: [P('cta', -420, -120, 2600), P('cta', 240, 80, 0)], B: [P('cta', -150, -60, 1900), P('cta', 240, 80, 0)] };

      /* the thread itself */
      var curve = new T.CatmullRomCurve3(TP, false, 'centripetal');
      curve.arcLengthDivisions = TP.length * 40;
      var LEN = curve.getLength(), NS = Math.round(LEN / 26), sp = curve.getSpacedPoints(NS), tp = [], ta = [], i;
      for (i = 0; i <= NS; i++) { tp.push(sp[i].x, sp[i].y, sp[i].z); ta.push(i / NS * LEN); }
      var threadMesh = add(new T.Mesh(ribbonGeo([{ p: tp, a: ta }]), threadMat));
      threadMat.uniforms.uFrom.value = 0; threadMat.uniforms.uTo.value = LEN;
      add(new T.Mesh(ribbonGeo(RINGS), ringMat));
      add(new T.Mesh(ribbonGeo(TICKS), tickMat));
      function nearestArc(v) { var best = 0, bd = 1e18; for (var k = 0; k <= NS; k += 2) { var d = sp[k].distanceToSquared(v); if (d < bd) { bd = d; best = k; } } return best; }
      STOPS.forEach(function (s) { s.f = F[s.k]; s.arcI = nearestArc(s.f.B[1]); s.arc = ta[s.arcI]; });
      /* flares: the spark where the thread starts, a light where it meets each piece, the light inside the closing ring */
      var fp = [], fr = [];
      function flare(v, size, gain) { fp.push(v.x, v.y, v.z); fr.push(size, 0.5, gain, 0); }
      flare(sp[0], 70, 1); flare(sp[0], 260, 0.35);
      STOPS.forEach(function (s) { flare(sp[s.arcI], 46, 0.3); });
      flare(sp[NS], 90, 1); flare(sp[NS], 520, 0.4);
      var fg = new T.BufferGeometry(), fAttr = new T.BufferAttribute(new Float32Array(fr), 4);
      fg.setAttribute('position', new T.BufferAttribute(new Float32Array(fp), 3)); fg.setAttribute('aRnd', fAttr);
      add(new T.Points(fg, flareMat));
      portrait = tall; route();
      var camPts = camCurve.getPoints(Math.max(300, camCurve.np * 6));
      /* dust and shards along the whole route, kept clear of the pieces and of the camera's path */
      var pieces = items.filter(function (it) { return it.pos; }).map(function (it) { return it.pos; }), v = new T.Vector3(), dir = new T.Vector3();
      function clear(p, r) {
        for (var k = 0; k < pieces.length; k++) if (pieces[k].distanceToSquared(p) < r * r) return false;
        for (k = 0; k < camPts.length; k++) if (camPts[k].distanceToSquared(p) < 640 * 640) return false;
        return true;
      }
      var nd = phone ? 2200 : 4600, dp = new Float32Array(nd * 3), dr = new Float32Array(nd * 4);
      for (i = 0; i < nd; i++) {
        v.copy(sp[Math.floor(Math.random() * NS)]).add(dir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(160 + Math.pow(Math.random(), 0.7) * 2800));
        dp[i * 3] = v.x; dp[i * 3 + 1] = v.y; dp[i * 3 + 2] = v.z;
        dr[i * 4] = 3 + Math.random() * 6; dr[i * 4 + 1] = Math.random(); dr[i * 4 + 2] = 0.25 + Math.random() * 0.75; dr[i * 4 + 3] = Math.random();
      }
      var dg = new T.BufferGeometry();
      dg.setAttribute('position', new T.BufferAttribute(dp, 3)); dg.setAttribute('aRnd', new T.BufferAttribute(dr, 4));
      add(new T.Points(dg, dustMat));
      var base = new T.IcosahedronGeometry(1, 0), bp = base.attributes.position, jit = {};
      for (i = 0; i < bp.count; i++) {
        var key = bp.getX(i).toFixed(3) + ',' + bp.getY(i).toFixed(3) + ',' + bp.getZ(i).toFixed(3);
        if (!jit[key]) jit[key] = 0.72 + Math.random() * 0.5;
        bp.setXYZ(i, bp.getX(i) * jit[key], bp.getY(i) * jit[key], bp.getZ(i) * jit[key]);
      }
      base.computeVertexNormals();
      var nsh = phone ? 170 : 340, spin = new Float32Array(nsh * 4), shards = new T.InstancedMesh(base, shardMat, nsh), m4 = new T.Matrix4(), qt = new T.Quaternion(), sc = new T.Vector3(), ax = new T.Vector3();
      for (i = 0; i < nsh; i++) {
        var tries = 0;
        do { v.copy(sp[Math.floor(Math.random() * NS)]).add(dir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(420 + Math.pow(Math.random(), 1.2) * 2600)); }
        while (!clear(v, 620) && ++tries < 14);
        var k = 26 + Math.pow(Math.random(), 2.4) * 190;
        sc.set(k * (0.8 + Math.random() * 0.5), k * (0.7 + Math.random() * 0.6), k * (0.8 + Math.random() * 0.5));
        qt.setFromAxisAngle(ax.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), Math.random() * TAU);
        m4.compose(v, qt, sc); shards.setMatrixAt(i, m4);
        ax.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        spin[i * 4] = ax.x; spin[i * 4 + 1] = ax.y; spin[i * 4 + 2] = ax.z; spin[i * 4 + 3] = (0.05 + Math.random() * 0.3) * (Math.random() < 0.5 ? -1 : 1);
      }
      base.setAttribute('aSpin', new T.InstancedBufferAttribute(spin, 4));
      shards.instanceMatrix.needsUpdate = true; add(shards);

      /* ---- the camera route: for each stop an arrival (A) and a departure (B) view, a swing (via) between stops;
         the camera follows one curve, its point of interest another */
      function route() {
        var CP = [], AP = [], pull = portrait ? 1.14 : 1;
        function push(c, a) { CP.push(a.clone().add(c.clone().sub(a).multiplyScalar(pull))); AP.push(a.clone()); }
        STOPS.forEach(function (s, n) {
          idxA[n] = CP.length; push(s.f.A[0], s.f.A[1]);
          idxB[n] = CP.length; push(s.f.B[0], s.f.B[1]);
          var nx = STOPS[n + 1];
          if (!nx) return;
          if (s.f.via) { push(s.f.via[0], s.f.via[1]); return; }
          var b = s.f.B[0], a2 = nx.f.A[0], mid = b.clone().add(a2).multiplyScalar(0.5), d = a2.clone().sub(b), L2 = d.length();
          var sideV = new T.Vector3().crossVectors(d, up).normalize();
          mid.addScaledVector(up, L2 * 0.12).addScaledVector(sideV, L2 * 0.16 * (n % 2 ? 1 : -1));
          push(mid, s.f.B[1].clone().add(nx.f.A[1]).multiplyScalar(0.5));
        });
        camCurve = new T.CatmullRomCurve3(CP, false, 'centripetal');
        focCurve = new T.CatmullRomCurve3(AP, false, 'centripetal');
        camCurve.np = CP.length;
      }
      function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
      function where(pr) {   /* curve parameter, the stop in reach, how far along */
        for (var n = 0; n < STOPS.length; n++) {
          var s = STOPS[n];
          if (pr <= s.h1 || n === STOPS.length - 1) {
            var f = clamp((pr - s.h0) / s.hold, 0, 1);
            return { t: idxA[n] + f * (idxB[n] - idxA[n]), n: n, arc: s.arc, roll: 0 };
          }
          if (pr < s.h1 + s.travel) {
            var g0 = (pr - s.h1) / s.travel, e = ease(g0);
            /* the camera banks into each flight and levels out to arrive */
            return { t: idxB[n] + e * (idxA[n + 1] - idxB[n]), n: e < 0.5 ? n : n + 1, arc: s.arc + (STOPS[n + 1].arc - s.arc) * e, roll: Math.sin(Math.PI * g0) * (n % 2 ? 0.2 : -0.2) };
          }
        }
      }
      function chapterAt(pr) {
        for (var n = 0; n < STOPS.length; n++) {
          var s = STOPS[n], before = n ? STOPS[n - 1].travel * 0.3 : 1e9, after = n === STOPS.length - 1 ? 1e9 : s.travel * 0.3;
          if (pr >= s.h0 - before && pr <= s.h1 + after) return n;
        }
        return -1;
      }

      /* ---- size, pointer, the frame */
      var W = 1, Hh = 1, dpr = 1, lastFov = 0;
      function size() {
        W = stage.clientWidth || window.innerWidth; Hh = stage.clientHeight || window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 1.75);
        renderer.setPixelRatio(dpr); renderer.setSize(W, Hh, false);
        res.set(Math.round(W * dpr), Math.round(Hh * dpr));
        cam.aspect = W / Hh; cam.fov = cam.aspect < 1 ? 52 : 40; cam.updateProjectionMatrix();
        threadMat.uniforms.uMinPx.value = 1.3 * dpr; ringMat.uniforms.uMinPx.value = 1.1 * dpr; tickMat.uniforms.uMinPx.value = 0.9 * dpr;
        var pt = cam.aspect < 1;
        if (pt !== portrait) { portrait = pt; route(); }
      }
      var mx = 0, my = 0, cmx = 0, cmy = 0, prog = null, raf = 0, last = performance.now(), time = 0;
      var cpos = new T.Vector3(), fpos = new T.Vector3(), tgt = new T.Vector3(), fwd = new T.Vector3(), rgt = new T.Vector3(), upv = new T.Vector3();
      var curCh = null, curN = -1, curG = 0, counted = {};
      if (fine) window.addEventListener('mousemove', function (e) { mx = e.clientX / window.innerWidth * 2 - 1; my = e.clientY / window.innerHeight * 2 - 1; }, { passive: true });
      function cardFilm(n, on) {
        var c = IT.cards[n] && IT.cards[n].el.firstChild, vd = c && c.querySelector('video');
        if (!vd) return;
        if (on) { c.classList.add('is-in'); if (!vd.getAttribute('src')) vd.src = vd.getAttribute('data-src'); var pp = vd.play(); if (pp && pp.catch) pp.catch(function () {}); }
        else if (!vd.paused) vd.pause();
      }
      function enter(n) {   /* a stop comes into reach: its film plays, its figures count */
        STOPS.forEach(function (s, k) { if (s.i != null) cardFilm(s.i, k === n); });
        var g = STOPS[n].g;
        if (g === 2 && !counted[2]) { counted[2] = 1; $$('[data-count-from]', stage).forEach(function (c) { count(c, +c.getAttribute('data-count-from')); }); }
        if (g === 4 && !counted[4]) { counted[4] = 1; $$('[data-count]', stage).forEach(function (c) { count(c); }); }
        var nx = STOPS[n + 1];
        if (nx && nx.i != null) { var nv = IT.cards[nx.i].el.querySelector('video'); if (nv && !nv.getAttribute('src')) nv.src = nv.getAttribute('data-src'); }
      }

      function frame(now) {
        raf = 0;
        var dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
        var r = track.getBoundingClientRect(), vh = window.innerHeight;
        if (document.hidden || r.top > vh || r.bottom < 0) { prog = null; return; }
        time += dt;
        var pinned = Math.max(1, r.height - Hh), target = clamp(-r.top / pinned, 0, 1) * TOTAL;
        if (prog === null) prog = target;
        prog += (target - prog) * (1 - Math.exp(-dt * 7));
        if (Math.abs(target - prog) < 1e-4) prog = target;
        var w = where(prog), u = w.t / (camCurve.np - 1);
        camCurve.getPoint(u, cpos); focCurve.getPoint(u, fpos);
        cmx += (mx - cmx) * 0.05; cmy += (my - cmy) * 0.05;
        /* aim so the piece sits right of centre above the copy (centred on portrait screens and in the logo ring) */
        fwd.subVectors(fpos, cpos); var dist = fwd.length(); fwd.divideScalar(dist || 1);
        rgt.crossVectors(fwd, up).normalize(); upv.crossVectors(rgt, fwd);
        var hh = dist * Math.tan(cam.fov * Math.PI / 360), hw = hh * cam.aspect, st = STOPS[w.n];
        var sx = portrait || st.f.centre ? 0.5 : 0.6, sy = st.f.centre ? 0.5 : portrait ? 0.36 : 0.44;
        tgt.copy(fpos).addScaledVector(rgt, -(sx - 0.5) * 2 * hw).addScaledVector(upv, -(0.5 - sy) * 2 * hh);
        cam.position.copy(cpos).addScaledVector(rgt, cmx * 60).addScaledVector(upv, -cmy * 40);
        cam.up.copy(up).multiplyScalar(Math.cos(w.roll)).addScaledVector(rgt, Math.sin(w.roll));
        cam.lookAt(tgt); cam.updateMatrixWorld();
        /* HTML pieces: the camera moves them all in one transform (three's CSS3DRenderer maths) */
        var fovPx = cam.projectionMatrix.elements[5] * Hh / 2, e = cam.matrixWorldInverse.elements;
        if (fovPx !== lastFov) { view.style.perspective = fovPx + 'px'; lastFov = fovPx; }
        cam3.style.transform = 'translateZ(' + fovPx + 'px) matrix3d(' + [e[0], -e[1], e[2], e[3], e[4], -e[5], e[6], e[7], e[8], -e[9], e[10], e[11], e[12], -e[13], e[14], e[15]].map(eps).join(',') +
          ') translate(' + W / 2 + 'px,' + Hh / 2 + 'px)';
        cam.getWorldDirection(fwd);
        for (var k = 0; k < items.length; k++) {
          var it = items[k];
          if (!it.pos) continue;
          v.subVectors(it.pos, cam.position);
          var d = v.length(), front = v.dot(fwd), op = front < 120 ? 0 : clamp((6200 - d) / 1900, 0, 1) * clamp((d - 260) / 420, 0, 1);
          op = Math.round(op * 50) / 50;
          if (op !== it.op) { it.op = op; it.el.style.opacity = op; it.el.style.visibility = op ? 'visible' : 'hidden'; }
        }
        /* the stop in reach, its copy, the counter */
        if (w.n !== curN) { curN = w.n; enter(curN); }
        var ci = jReady ? chapterAt(prog) : -1, chEl = ci >= 0 ? STOPS[ci].ch : null;
        if (chEl !== curCh) {
          if (curCh) { curCh.classList.remove('is-on'); var so = curCh.querySelector('.lnw-stmt'); if (so) so.classList.remove('is-in'); }
          if (chEl) {
            chEl.classList.add('is-on');
            var sn = chEl.querySelector('.lnw-stmt');
            if (sn) requestAnimationFrame(function () { sn.classList.add('is-in'); });
            $$('.lnw-lab, .lnw-tag', chEl).forEach(scramble);
          }
          curCh = chEl;
        }
        var g = STOPS[w.n].g;
        if (g !== curG) { curG = g; hudN.textContent = '0' + g + ' / 0' + GROUPS; }
        hudBar.style.height = (prog / TOTAL * 100).toFixed(2) + '%';
        var end = jReady && g === GROUPS;
        if (end !== jEnd) { jEnd = end; badgeState(); }
        /* pulses run ahead along the thread from the piece in reach and light the shards they pass */
        for (k = 0; k < 4; k++) {
          var pa = w.arc - 500 + ((time * 1100 + k * 1650) % 6600);
          pulse[k] = pa;
          if (pa > 0 && pa < LEN) { lightP[k].copy(sp[clamp(Math.round(pa / LEN * NS), 0, NS)]); lightI[k] = 1.1; } else lightI[k] = 0;
        }
        lightP[4].copy(fpos); lightI[4] = 0.6;
        lightP[5].copy(sp[clamp(Math.round(w.arc / LEN * NS), 0, NS)]); lightI[5] = 0.5;
        /* the light where the thread meets the piece in reach burns brighter */
        for (k = 0; k < STOPS.length; k++) fAttr.setZ(2 + k, k === w.n ? 1 : 0.3);
        fAttr.needsUpdate = true;
        var px = res.y * cam.projectionMatrix.elements[5] * 0.5;
        dustMat.uniforms.uTime.value = flareMat.uniforms.uTime.value = shardMat.uniforms.uTime.value = time;
        dustMat.uniforms.uPx.value = flareMat.uniforms.uPx.value = px;
        renderer.render(scene, cam);
        raf = requestAnimationFrame(frame);   /* keeps running while the stage is on screen */
      }
      wake = function () { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
      window.addEventListener('scroll', wake, { passive: true });
      var rt = 0;
      window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { size(); wake(); }, 120); });
      document.addEventListener('visibilitychange', wake);
      size(); wake();
    }
  })();

  /* ---- intro: a navy field (already covering the first frame) pulls up off the film, then the page comes alive */
  var introDone = false, fontsDone = false;
  function maybeStart() {
    if (!introDone || !fontsDone) return;
    startReveals();
    journeyOn();
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
