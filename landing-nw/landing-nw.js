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
    /* these two keep the muted lead-in on its own line once it is split into words too, see the matching rule in the style embed */
    if (el.closest('.lnw-trans, .lnw-ch--trans, .lnw-int')) {
      var lead = words.filter(function (w) { return w.classList.contains('lnw-dim'); }).pop();
      el.insertBefore(document.createElement('br'), lead.nextSibling);
    }
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
  var lag = reduce || JOURNEY ? [] : $$('.lnw-lab, .lnw-side').filter(function (el) { return !el.closest('.lnw-int, .lnw-cta'); }).map(function (el, i) {
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
      if (inJourney(el)) return;
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
    badge.classList.toggle('is-on', ready && !watching && !ending && !modalOpen());
  }
  var endEls = [JOURNEY && root.querySelector('.lnw-int'), root.querySelector('.lnw-cta')].concat(Array.prototype.slice.call(document.querySelectorAll('section.for-services, .foot2, footer')))
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

  /* ---- the journey (after ysuriadesign.co). Between the hero and the integration section the page becomes one pinned
     3D world: a teal thread of light sweeps up, down and sideways through space in long curves and the camera rides along
     it, one stop per screen of scroll - the client logos in a ring round the thread, each agent step, each example, the
     three results together, the platform, the three transparency cards together - each hung by the thread, joined to it
     by a bright joint; the pieces ahead and behind stay faded until the camera reaches them. The piece in view
     sits mid-screen, its copy bottom left. It opens on the thread running straight into the screen and ends under
     the transparency cards; the activation models (three open cards side by side) and the closing call to action follow as
     normal sections. Every word and picture is the page's own, moved into place (not copied); the pieces are HTML set
     in 3D over a three.js canvas (r128, the copy the homepage loads). Off for reduced motion and without WebGL, where
     the page keeps its normal sections. */
  var journeyOn = function () {};
  (function journey() {
    if (!JOURNEY) return;
    var jReady = false, failed = false, wake = function () {};
    journeyOn = function () { jReady = true; wake(); };
    var tall = window.innerWidth < window.innerHeight;   /* portrait screens get narrower pieces */

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
    var before = tall ? q('.lnw-pos') : hero;   /* portrait screens: the opening copy stays under the film, the thread starts after it */
    before.parentNode.insertBefore(track, before.nextSibling);
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
      var it = { el: box, w: w, op: -1, stop: -1 }; items.push(it); return it;
    }
    /* copy into chapters (page order), pieces into space */
    var cards = $$('.lnw-work .lnw-card'), CH = {};
    if (tall) q('.lnw-pos').classList.add('lnw-stay');
    else CH.pos = chapter([q('.lnw-pos .lnw-head'), q('.lnw-pos .lnw-side')]);
    CH.agent = chapter([q('.lnw-agent .lnw-lab'), q('.lnw-agent .lnw-stmt')]);
    CH.cards = cards.map(function (c) { return chapter([c.querySelector('.lnw-card__meta')]); });
    CH.res = chapter([q('.lnw-res .lnw-lab'), q('.lnw-res .lnw-stmt')]);
    CH.plat = chapter([q('.lnw-plat .lnw-head'), q('.lnw-plat .lnw-side')]);
    CH.trans = chapter([q('.lnw-trans .lnw-head'), q('.lnw-trans .lnw-side')]);
    CH.trans.classList.add('lnw-ch--trans');
    var IT = {
      logos: $$('.lnw-logos__list:first-child img').map(function (img) { return item(img, tall ? 150 : 170, 'is-logo'); }),
      steps: $$('.lnw-agent .lnw-step').map(function (s) { return item(s, tall ? 300 : 360, 'is-card is-step'); }),
      names: item(q('.lnw-work .lnw-marq'), 5600, 'is-names'),
      cards: cards.map(function (c) { return item(c, tall ? 260 : 300, 'is-film'); }),
      stats: $$('.lnw-res .lnw-stat').map(function (s) { var it = item(s, tall ? 340 : 460, 'is-stat'); if (it) it.solo = true; return it; }),
      plat: item(q('.lnw-plat__img'), tall ? 760 : 1000, 'is-plat'),
      rows: $$('.lnw-trans .lnw-row').map(function (r) { return item(r, tall ? 640 : 440, 'is-card is-row'); })
    };
    $$('img', stage).forEach(function (img) { img.loading = 'eager'; });
    $$('[data-reveal]', stage).forEach(function (el) { el.classList.add('is-in'); });
    /* after the journey the activation models are plain open cards: nothing to toggle, so no buttons */
    $$('.lnw-cap').forEach(function (c, i) {
      var b = c.querySelector('.lnw-cap__s'), h = document.createElement('span');
      h.className = b.className; h.innerHTML = b.innerHTML; b.parentNode.replaceChild(h, b);
      c.classList.add('is-open'); c.setAttribute('data-reveal', ''); c.style.setProperty('--d', i);
    });
    root.classList.add('is-journey');

    /* ---- the stops: one per screen of scroll (hold + travel = 1 screen) */
    var STOPS = [];
    function stop(k, g, ch, its) {
      STOPS.push({ k: k, g: g, ch: ch, it: (its || []).filter(Boolean), hold: 0.42, travel: 0.58 });
      (its || []).forEach(function (it) { if (it) it.stop = STOPS.length - 1; });
    }
    stop('pos', 1, CH.pos);
    stop('logos', 1, null, IT.logos);
    IT.steps.forEach(function (it) { stop('step', 2, CH.agent, [it]); });
    IT.cards.forEach(function (it, i) { stop('work', 3, CH.cards[i], [it]); STOPS[STOPS.length - 1].i = i; });
    if (IT.stats.length) stop('stat', 4, CH.res, IT.stats);
    if (IT.plat) stop('plat', 5, CH.plat, [IT.plat]);
    if (IT.rows.length) stop('row', 6, CH.trans, IT.rows);
    STOPS[0].hold = tall ? 0.2 : 0.6; STOPS[STOPS.length - 1].hold = 0.6; STOPS[STOPS.length - 1].travel = 0;
    var TOTAL = 0, GROUPS = STOPS[STOPS.length - 1].g;
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

    /* the thread is a camera-facing ribbon: world width, so it thins with distance, never under a pixel; a hot core
       inside a soft halo, fogged by depth, pulses travelling along it */
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
      ' float f=exp(-vDepth*vDepth*uFog*uFog)*mix(0.25,1.0,smoothstep(120.0,1100.0,vDepth))*smoothstep(60.0,320.0,vDepth);',   /* softer right under the camera, over the copy */
      ' float ends=smoothstep(uFrom,uFrom+60.0,vArc)*(1.0-smoothstep(uTo-2600.0,uTo,vArc));',
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
      var res = new T.Vector2(1, 1), pulse = [0, 0, 0, 0], lightP = [], lightI = [0, 0, 0, 0, 0, 0], up = new T.Vector3(0, 1, 0);
      for (var li = 0; li < 6; li++) lightP.push(new T.Vector3(0, -1e5, 0));
      var threadMat = new T.ShaderMaterial({
        uniforms: { uRes: { value: res }, uWidth: { value: 20 }, uMinPx: { value: 1.2 }, uColor: { value: TEAL }, uCore: { value: CORE },
          uGain: { value: 1 }, uFog: { value: FOG }, uPulse: { value: pulse }, uPulseGain: { value: 1 }, uFrom: { value: 0 }, uTo: { value: 1e9 } },
        vertexShader: RIBBON_VS, fragmentShader: RIBBON_FS, transparent: true, depthWrite: false, blending: T.AdditiveBlending
      });
      function dotMat(color, maxPx) {
        return new T.ShaderMaterial({
          uniforms: { uTime: { value: 0 }, uPx: { value: 1000 }, uFog: { value: FOG }, uMaxPx: { value: maxPx }, uColor: { value: new T.Color(color) } },
          vertexShader: DOT_VS, fragmentShader: DOT_FS, transparent: true, depthWrite: false, blending: T.AdditiveBlending
        });
      }
      var dustMat = dotMat('#bdfaf4', 34), flareMat = dotMat('#7ff6ea', 380);
      var shardMat = new T.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uBase: { value: new T.Color('#223140') }, uTeal: { value: TEAL }, uFogCol: { value: BG }, uFog: { value: FOG },
          uL: { value: lightP }, uLi: { value: lightI } },
        vertexShader: SHARD_VS, fragmentShader: SHARD_FS
      });
      function add(obj) { obj.frustumCulled = false; world.add(obj); return obj; }

      /* ---- the thread: one long line whose heading swings slowly, left and right a quarter turn out of step with up and
         down, so it sweeps every way in long even curves, with no corner anywhere, and never doubles back. Seen from this
         low a sideways bend on its own would flatten into a sharp tip, which is why a climb or a dive always comes with it.
         It opens going straight into the screen and ends under the last cards, in a point of light */
      /* pieces that share one point: centre to centre (stacked gapY), the outer two pulled toward the camera and turned in
         (stacked, tilted), their share of the screen, their height on it, how far above the thread they float and the
         slope the thread takes under them (the results keep it below their labels) */
      var GROUP = {
        stat: { gap: 480, gapY: 40, pull: 170, turn: 0.3, tilt: 0.22, fw: 0.72, fh: 0.56, sy: tall ? 0.47 : 0.44, rise: 250, dip: -0.1 },
        row: { gap: 470, gapY: 24, pull: 110, turn: 0.2, tilt: 0.1, fw: 0.69, fh: 0.54, sy: tall ? 0.42 : 0.36, rise: 40, dip: 0 }
      };
      var LEN = 5200;   /* the stops sit along it at set distances */
      STOPS.forEach(function (s, n) {
        if (n > 1) LEN += STOPS[n - 1].k === 'plat' || s.k === 'plat' || GROUP[s.k] ? 5200 : 4600;
        s.arc = n ? LEN : 0;
      });
      function ease(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
      var NS = Math.round(LEN / 24), ds = LEN / NS, sp = [], tp = [], ta = [], i, head = new T.Vector3(0, 0, 900);
      for (i = 0; i <= NS; i++) {
        var u = i * ds, e = ease((u - 3000) / 7000) * ease((LEN - u - 1200) / 7000), calm = 0, dip = 0;   /* straight at both ends */
        var yaw = e * (0.62 * Math.sin(u / 2300) + 0.2 * Math.sin(u / 1300 + 1)), pitch = e * (0.36 * Math.cos(u / 2300) + 0.12 * Math.sin(u / 1700 + 2));
        STOPS.forEach(function (s) {   /* and runs straight in under a group, which is met head on */
          var c = GROUP[s.k] ? ease((4300 - Math.abs(u - s.arc - 500)) / 1800) : 0;
          if (c > calm) { calm = c; dip = GROUP[s.k].dip; }
        });
        yaw *= 1 - calm; pitch = pitch * (1 - calm) + dip * calm;
        sp.push(head.clone()); tp.push(head.x, head.y, head.z); ta.push(u);
        head.x += ds * Math.sin(yaw) * Math.cos(pitch); head.y += ds * Math.sin(pitch); head.z -= ds * Math.cos(yaw) * Math.cos(pitch);
      }
      (function () {   /* the ribbon: two vertices per sample (its edges) */
        var n = NS + 1, pos = new Float32Array(n * 6), td = new Float32Array(n * 6), side = new Float32Array(n * 2), arc = new Float32Array(n * 2), idx = [];
        for (var k = 0; k < n; k++) {
          var a = Math.max(k - 1, 0), b = Math.min(k + 1, n - 1), tx = tp[b * 3] - tp[a * 3], ty = tp[b * 3 + 1] - tp[a * 3 + 1], tz = tp[b * 3 + 2] - tp[a * 3 + 2];
          var tl = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1;
          for (var j2 = 0; j2 < 2; j2++) {
            var v2 = k * 2 + j2, o = v2 * 3;
            pos[o] = tp[k * 3]; pos[o + 1] = tp[k * 3 + 1]; pos[o + 2] = tp[k * 3 + 2];
            td[o] = tx / tl; td[o + 1] = ty / tl; td[o + 2] = tz / tl; side[v2] = j2 ? -1 : 1; arc[v2] = ta[k];
          }
          if (k < n - 1) idx.push(k * 2, k * 2 + 1, k * 2 + 2, k * 2 + 1, k * 2 + 3, k * 2 + 2);
        }
        var g = new T.BufferGeometry();
        g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('tdir', new T.BufferAttribute(td, 3));
        g.setAttribute('side', new T.BufferAttribute(side, 1)); g.setAttribute('arc', new T.BufferAttribute(arc, 1));
        g.setIndex(idx);
        add(new T.Mesh(g, threadMat));
      })();
      function ptAt(s, out) { var f = clamp(s / LEN, 0, 1) * NS, k = Math.min(NS - 1, Math.floor(f)); return out.copy(sp[k]).lerp(sp[k + 1], f - k); }
      function tanAt(s, out) { var k = clamp(Math.round(s / LEN * NS), 4, NS - 4); return out.subVectors(sp[k + 4], sp[k - 4]).normalize(); }

      /* ---- the pieces, hung beside the thread at their bends, turned a little toward it */
      var dummy = new T.Object3D();
      function eps(v) { return Math.abs(v) < 1e-10 ? 0 : v; }
      function place(it, p, ry, rx) {   /* an HTML piece at a point in space (CSS3D, as three's CSS3DRenderer) */
        if (!it) return;
        dummy.position.copy(p); dummy.rotation.set(rx || 0, ry, 0, 'YXZ'); dummy.updateMatrixWorld(true);
        var e = dummy.matrixWorld.elements;
        it.el.style.transform = 'translate(-50%,-50%) matrix3d(' + [e[0], e[1], e[2], e[3], -e[4], -e[5], -e[6], -e[7], e[8], e[9], e[10], e[11], e[12], e[13], e[14], e[15]].map(eps).join(',') + ')';
        it.pos = p.clone();
      }
      var JOINTS = [], tv = new T.Vector3(), rv = new T.Vector3();
      STOPS.forEach(function (s, n) {
        if (!n) return;
        s.J = ptAt(s.arc, new T.Vector3());
        var t = tv.subVectors(s.J, ptAt(s.arc - 1300, rv)).clone().setY(0).normalize(), r = new T.Vector3().crossVectors(t, up).normalize();   /* square to the way in, which is still curving */
        s.t = t; s.r = r; s.side = n % 2 ? 1 : -1;
        if (s.k === 'logos') {   /* the ring stands round the thread, square to it */
          var ry0 = Math.atan2(-t.x, -t.z), LR = tall ? [420, 660] : [800, 480];
          s.ry = ry0; s.side = 0;
          IT.logos.forEach(function (it, k) {
            var a = k / IT.logos.length * TAU + 0.2;
            place(it, s.J.clone().addScaledVector(r, Math.cos(a) * LR[0]).addScaledVector(up, Math.sin(a) * LR[1]).addScaledVector(t, Math.sin(a * 2) * 120), ry0 - Math.cos(a) * 0.45, Math.sin(a) * 0.3);
          });
          return;
        }
        var G = GROUP[s.k];
        if (G) {   /* a group floats above the thread, which runs away beneath it: an arc round it, a stack on portrait screens */
          var rh = Math.max.apply(null, s.it.map(function (it) { return it.el.offsetHeight; })) || 240, c = s.J.clone().addScaledVector(up, (tall ? 1.5 * rh + G.gapY : rh / 2) + G.rise);
          s.ry = Math.atan2(-t.x, -t.z); s.side = 0; s.P = c; s.sy = G.sy;
          s.box = tall ? { w: s.it[0].w, h: 3 * rh + 2 * G.gapY, fh: G.fh } : { w: 2 * G.gap + s.it[0].w, h: rh, fw: G.fw };
          s.it.forEach(function (it, k) {
            var o = k - 1;
            it.el.firstChild.style.minHeight = rh + 'px';
            if (tall) place(it, c.clone().addScaledVector(up, -o * (rh + G.gapY)), s.ry, -o * G.tilt);
            else place(it, c.clone().addScaledVector(r, o * G.gap).addScaledVector(t, -Math.abs(o) * G.pull), s.ry - o * G.turn, 0);
          });
          JOINTS.push({ n: n, p: s.J.clone().addScaledVector(up, 20) });
          return;
        }
        /* anything else hangs off to one side, its near edge on the thread */
        var it = s.it[0];
        it.h = it.el.offsetHeight || it.w * 0.7;
        var face = t.clone().negate().multiplyScalar(Math.cos(0.28)).addScaledVector(r, -s.side * Math.sin(0.28)).normalize();
        var X = new T.Vector3(face.z, 0, -face.x);   /* the piece's own right */
        var p = s.J.clone().addScaledVector(X, s.side * (it.w / 2 + 34)), jp = s.J.clone().addScaledVector(X, s.side * 14);
        s.ry = Math.atan2(face.x, face.z);
        place(it, p, s.ry, 0);
        s.P = p;
        JOINTS.push({ n: n, p: jp });
      });
      var works = STOPS.filter(function (s) { return s.k === 'work'; });
      if (works.length && IT.names) {   /* the brand names, a faint wall far behind the examples */
        var sw = works[Math.floor(works.length / 2)];
        place(IT.names, sw.J.clone().addScaledVector(sw.t, 6200).addScaledVector(up, 900), Math.atan2(-sw.t.x, -sw.t.z), 0);
      }
      /* joints where each piece meets the thread, and the light where it ends, under the last cards */
      var fp = [], fr = [], kc = sp[NS];
      JOINTS.forEach(function (jn) { fp.push(jn.p.x, jn.p.y, jn.p.z, jn.p.x, jn.p.y, jn.p.z); fr.push(46, 0.5, 0.3, 0, 160, 0.5, 0.1, 0); });
      fp.push(kc.x, kc.y, kc.z, kc.x, kc.y, kc.z); fr.push(90, 0.5, 1, 0, 340, 0.5, 0.3, 0);
      var fg = new T.BufferGeometry(), fAttr = new T.BufferAttribute(new Float32Array(fr), 4);
      fg.setAttribute('position', new T.BufferAttribute(new Float32Array(fp), 3)); fg.setAttribute('aRnd', fAttr);
      add(new T.Points(fg, flareMat));

      /* ---- dust and shards along the route, kept off the thread (the camera rides it) and clear of the pieces */
      var pieces = items.filter(function (it) { return it.pos && it !== IT.names; }).map(function (it) { return it.pos; }), v = new T.Vector3(), dir = new T.Vector3();
      function clear(p) {
        for (var k = 0; k < pieces.length; k++) if (pieces[k].distanceToSquared(p) < 700 * 700) return false;
        for (k = 0; k <= NS; k += 6) if (sp[k].distanceToSquared(p) < 720 * 720) return false;
        return true;
      }
      var nd = phone ? 2200 : 4600, dp = new Float32Array(nd * 3), dr = new Float32Array(nd * 4);
      for (i = 0; i < nd; i++) {
        v.copy(sp[Math.floor(Math.random() * NS)]).add(dir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(220 + Math.pow(Math.random(), 0.7) * 2800));
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
      var nsh = phone ? 150 : 300, spin = new Float32Array(nsh * 4), shards = new T.InstancedMesh(base, shardMat, nsh), m4 = new T.Matrix4(), qt = new T.Quaternion(), sc = new T.Vector3(), ax = new T.Vector3();
      for (i = 0; i < nsh; i++) {
        var tries = 0;
        do { v.copy(sp[Math.floor(Math.random() * NS)]).add(dir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(760 + Math.pow(Math.random(), 1.2) * 2400)); }
        while (!clear(v) && ++tries < 14);
        var k = 26 + Math.pow(Math.random(), 2.4) * 190;
        sc.set(k * (0.8 + Math.random() * 0.5), k * (0.7 + Math.random() * 0.6), k * (0.8 + Math.random() * 0.5));
        qt.setFromAxisAngle(ax.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), Math.random() * TAU);
        m4.compose(v, qt, sc); shards.setMatrixAt(i, m4);
        ax.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        spin[i * 4] = ax.x; spin[i * 4 + 1] = ax.y; spin[i * 4 + 2] = ax.z; spin[i * 4 + 3] = (0.05 + Math.random() * 0.3) * (Math.random() < 0.5 ? -1 : 1);
      }
      base.setAttribute('aSpin', new T.InstancedBufferAttribute(spin, 4));
      shards.instanceMatrix.needsUpdate = true; add(shards);

      /* ---- the ride: the camera travels along the thread itself, just above and to one side of it, and never leaves
         it. At each piece it slows to a hold a little before the bend, so the piece hangs in view beside the line; then
         it runs on along the thread to the next. Each stop: c0..c1 = the stretch of thread held, in arc length */
      var W = 1, Hh = 1, portrait = null;
      function viewDist(it) {   /* far enough to frame the piece, never so close its type is enlarged much */
        var vt = Math.tan(cam.fov * Math.PI / 360), ht = vt * cam.aspect, fovPx = Hh / (2 * vt);
        return Math.max(it.w / (2 * ht * (portrait ? 0.8 : it.fw || 0.42)), (it.h || it.w * 0.7) / (2 * vt * (portrait ? it.fh || 0.44 : 0.6)), fovPx * 0.9);
      }
      function route() {
        STOPS.forEach(function (s, n) {
          var back = !n ? 0 : s.k === 'logos' ? (portrait ? 2000 : 1600) : viewDist(s.box || s.it[0]) * (s.box ? 1 : 0.92);
          var at = !n ? 260 : s.arc - back;
          s.c0 = at - 130; s.c1 = at + 130;
          if (!n) { s.c0 = 0; s.c1 = 420; }
        });
        for (var n = 1; n < STOPS.length; n++) {   /* the ride only ever moves forward */
          var p0 = STOPS[n - 1];
          if (STOPS[n].c0 < p0.c1 + 300) { STOPS[n].c0 = p0.c1 + 300; STOPS[n].c1 = Math.max(STOPS[n].c1, STOPS[n].c0 + 120); }
        }
        /* scroll -> place on the thread: a monotone cubic (Fritsch-Carlson) through every hold, so the speed changes
           smoothly - slow by each piece, quicker between them, never a dead stop or a jolt */
        KX = []; KY = [];
        STOPS.forEach(function (s) { KX.push(s.h0, s.h1); KY.push(s.c0, s.c1); });
        var m = KX.length, dd = [], i2;
        KM = [];
        for (i2 = 0; i2 < m - 1; i2++) dd[i2] = (KY[i2 + 1] - KY[i2]) / Math.max(1e-6, KX[i2 + 1] - KX[i2]);
        KM[0] = dd[0]; KM[m - 1] = dd[m - 2];
        for (i2 = 1; i2 < m - 1; i2++) KM[i2] = dd[i2 - 1] * dd[i2] <= 0 ? 0 : (dd[i2 - 1] + dd[i2]) / 2;
        for (i2 = 0; i2 < m - 1; i2++) {
          if (!dd[i2]) { KM[i2] = KM[i2 + 1] = 0; continue; }
          var ka = KM[i2] / dd[i2], kb = KM[i2 + 1] / dd[i2], hh2 = ka * ka + kb * kb;
          if (hh2 > 9) { var tt = 3 / Math.sqrt(hh2); KM[i2] = tt * ka * dd[i2]; KM[i2 + 1] = tt * kb * dd[i2]; }
        }
      }
      var KX = [], KY = [], KM = [];
      function mapS(x) {
        var m = KX.length, j = 0;
        if (x <= KX[0]) return KY[0];
        if (x >= KX[m - 1]) return KY[m - 1];
        while (j < m - 2 && x > KX[j + 1]) j++;
        var h = KX[j + 1] - KX[j], t = (x - KX[j]) / h, t2 = t * t, t3 = t2 * t;
        return (2 * t3 - 3 * t2 + 1) * KY[j] + (t3 - 2 * t2 + t) * h * KM[j] + (-2 * t3 + 3 * t2) * KY[j + 1] + (t3 - t2) * h * KM[j + 1];
      }
      function bell(n, pr) {   /* how much stop n is "the one in view": 1 at its hold, easing to 0 half a screen either side */
        var s = STOPS[n], x = pr - (s.h0 + s.h1) / 2;
        if ((n === 0 && x < 0) || (n === STOPS.length - 1 && x > 0)) return 1;
        return Math.abs(x) >= 0.62 ? 0 : 0.5 + 0.5 * Math.cos(Math.PI * x / 0.62);
      }
      function where(pr) {   /* where on the thread the camera is, the stop in reach, the hold or travel we are in */
        for (var n = 0; n < STOPS.length; n++) {
          var s = STOPS[n];
          if (pr <= s.h1 || n === STOPS.length - 1) return { s: mapS(pr), n: n, a: n, g: -1 };
          if (pr < s.h1 + s.travel) { var g0 = (pr - s.h1) / s.travel; return { s: mapS(pr), n: g0 < 0.5 ? n : n + 1, a: n, g: g0 }; }
        }
      }
      function chapterOf(w) {   /* copy shared by neighbouring stops stays up; otherwise it hands over mid-flight */
        if (w.g < 0) return STOPS[w.a].ch;
        var c0 = STOPS[w.a].ch, c1 = STOPS[w.a + 1].ch;
        return c0 === c1 ? c0 : w.g < 0.3 ? c0 : w.g > 0.7 ? c1 : null;
      }

      /* ---- size, pointer, the frame */
      var dpr = 1, lastFov = 0;
      function size() {
        W = stage.clientWidth || window.innerWidth; Hh = stage.clientHeight || window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 1.75);
        renderer.setPixelRatio(dpr); renderer.setSize(W, Hh, false);
        res.set(Math.round(W * dpr), Math.round(Hh * dpr));
        cam.aspect = W / Hh; cam.fov = cam.aspect < 1 ? 56 : 42; cam.updateProjectionMatrix();
        threadMat.uniforms.uMinPx.value = 1.3 * dpr;
        portrait = cam.aspect < 1; route();
      }
      var mx = 0, my = 0, cmx = 0, cmy = 0, prog = null, raf = 0, last = performance.now(), time = 0, act = new Float32Array(STOPS.length);
      var cpos = new T.Vector3(), ahead = new T.Vector3(), tgt = new T.Vector3(), fwd = new T.Vector3(), rgt = new T.Vector3(), upv = new T.Vector3();
      var t1 = new T.Vector3(), t2 = new T.Vector3(), tr = new T.Vector3(), aim = new T.Vector3(), tgtS = new T.Vector3(), snap = true, sideNow = 0, lift = 0;
      var curCh = null, curN = -1, curG = 0;
      if (fine) window.addEventListener('mousemove', function (e) { mx = e.clientX / window.innerWidth * 2 - 1; my = e.clientY / window.innerHeight * 2 - 1; }, { passive: true });
      function cardFilm(n, on) {
        var c = IT.cards[n] && IT.cards[n].el.firstChild, vd = c && c.querySelector('video');
        if (!vd) return;
        if (on) { c.classList.add('is-in'); if (!vd.getAttribute('src')) vd.src = vd.getAttribute('data-src'); var pp = vd.play(); if (pp && pp.catch) pp.catch(function () {}); }
        else if (!vd.paused) vd.pause();
      }
      function enter(n) {   /* a stop comes into reach: its film plays, its figure counts */
        var s = STOPS[n];
        root.classList.toggle('is-end', n === STOPS.length - 1);
        STOPS.forEach(function (x, k) { if (x.i != null) cardFilm(x.i, k === n); });
        s.it.forEach(function (it) {
          $$('[data-count-from]', it.el).forEach(function (c) { count(c, +c.getAttribute('data-count-from')); });
          $$('[data-count]', it.el).forEach(function (c) { count(c); });
        });
        var nx = STOPS[n + 1];
        if (nx && nx.i != null) { var nv = IT.cards[nx.i].el.querySelector('video'); if (nv && !nv.getAttribute('src')) nv.src = nv.getAttribute('data-src'); }
      }
      function aimAt(p, sx, sy, out) {   /* the point to look at so p lands at (sx, sy) of the screen */
        fwd.subVectors(p, cam.position); var d = fwd.length(); fwd.divideScalar(d || 1);
        rgt.crossVectors(fwd, up).normalize(); upv.crossVectors(rgt, fwd);
        var hh = d * Math.tan(cam.fov * Math.PI / 360), hw = hh * cam.aspect;
        return out.copy(p).addScaledVector(rgt, -(sx - 0.5) * 2 * hw).addScaledVector(upv, -(0.5 - sy) * 2 * hh);
      }

      function frame(now) {
        raf = 0;
        var dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
        var r = track.getBoundingClientRect(), vh = window.innerHeight;
        if (document.hidden || r.top > vh || r.bottom < 0) { prog = null; snap = true; return; }
        time += dt;
        var pinned = Math.max(1, r.height - Hh), target = clamp(-r.top / pinned, 0, 1) * TOTAL;
        if (prog === null) prog = target;
        prog += (target - prog) * (1 - Math.exp(-dt * 4.5));   /* a little glide on every scroll */
        if (Math.abs(target - prog) < 1e-4) prog = target;
        var w = where(prog), k;
        /* which piece is in view: a smooth weight per stop, peaking at its hold */
        var inView = 0;
        for (k = 0; k < act.length; k++) { act[k] = bell(k, prog); inView += act[k]; }
        /* on the thread: just above it, off to the side away from the piece in reach; in flight it rises to look down on the
           line, since from level even a long curve foreshortens into a corner */
        var sideT = 0;
        for (k = 0; k < act.length; k++) sideT += act[k] * (STOPS[k].side || 0);
        sideNow += (sideT - sideNow) * (1 - Math.exp(-dt * 4));
        var liftT = clamp(1 - inView, 0, 1);
        lift += (liftT - lift) * (1 - Math.exp(-dt * 4));
        ptAt(w.s, cpos); tanAt(w.s, t1);
        tr.crossVectors(t1, up).normalize();
        cmx += (mx - cmx) * 0.05; cmy += (my - cmy) * 0.05;
        cam.position.copy(cpos).addScaledVector(up, 200 + lift * 520 - cmy * 30).addScaledVector(tr, -sideNow * 190 + cmx * 50);
        /* look along the thread ahead, turning to frame the piece in reach (it sits right of centre over the copy,
           centred on portrait screens) */
        ptAt(w.s + 2000, ahead); ahead.addScaledVector(up, -30);
        tgt.copy(ahead);
        for (k = 0; k < act.length; k++) {
          if (!act[k] || !STOPS[k].P) continue;
          var sk = STOPS[k];
          aimAt(sk.P, portrait || !sk.side ? 0.5 : 0.62, sk.sy || (portrait ? 0.36 : 0.44), aim);
          tgt.lerp(aim, act[k] * (portrait ? 1 : 0.9));
        }
        /* lean into the bends */
        tanAt(w.s + 500, t2);
        var roll = clamp(-((t2.x - t1.x) * tr.x + (t2.z - t1.z) * tr.z) * 1.1, -0.16, 0.16) * lift;   /* level while a piece is held */
        cam.up.copy(up).multiplyScalar(Math.cos(roll)).addScaledVector(tr, Math.sin(roll));
        /* the gaze eases round, never snaps: the direction is smoothed (a smoothed point would trail behind a fast camera) */
        aim.subVectors(tgt, cam.position).normalize();
        if (snap || !tgtS.lengthSq()) tgtS.copy(aim); else tgtS.lerp(aim, 1 - Math.exp(-dt * 4)).normalize();
        snap = false;
        cam.lookAt(aim.copy(cam.position).addScaledVector(tgtS, 1000)); cam.updateMatrixWorld();
        /* HTML pieces: the camera moves them all in one transform (three's CSS3DRenderer maths) */
        var fovPx = cam.projectionMatrix.elements[5] * Hh / 2, e = cam.matrixWorldInverse.elements;
        if (fovPx !== lastFov) { view.style.perspective = fovPx + 'px'; lastFov = fovPx; }
        cam3.style.transform = 'translateZ(' + fovPx + 'px) matrix3d(' + [e[0], -e[1], e[2], e[3], e[4], -e[5], e[6], e[7], e[8], -e[9], e[10], e[11], e[12], -e[13], e[14], e[15]].map(eps).join(',') +
          ') translate(' + W / 2 + 'px,' + Hh / 2 + 'px)';
        /* only the piece in reach is lit; the rest wait faded until the camera gets to them */
        var workW = 0;
        STOPS.forEach(function (s, n) { if (s.k === 'work') workW = Math.max(workW, act[n]); });
        cam.getWorldDirection(fwd);
        for (k = 0; k < items.length; k++) {
          var it = items[k];
          if (!it.pos) continue;
          v.subVectors(it.pos, cam.position);
          var d = v.length(), lit = it.stop >= 0 ? Math.min(1, act[it.stop] * 1.6) : it === IT.names ? workW * 0.5 : 0;
          var ghost = d < 4600 && !it.solo ? 0.07 : 0;   /* a result waits unseen: its figure has not counted yet */
          var op = v.dot(fwd) < 120 ? 0 : Math.max(lit, ghost) * clamp((d - 300) / 450, 0, 1) * clamp((7200 - d) / 1600, 0, 1);
          op = Math.round(op * 50) / 50;
          if (op !== it.op) { it.op = op; it.el.style.opacity = op; it.el.style.visibility = op ? 'visible' : 'hidden'; }
        }
        /* the stop in reach, its copy, the counter */
        if (w.n !== curN) { curN = w.n; enter(curN); }
        var chEl = jReady ? chapterOf(w) : null;
        if (chEl !== curCh) {
          if (curCh) { curCh.classList.remove('is-on'); var so = curCh.querySelector('.lnw-stmt'); if (so) so.classList.remove('is-in'); }
          if (chEl) {
            chEl.classList.add('is-on');
            var sn = chEl.querySelector('.lnw-stmt');
            if (sn) requestAnimationFrame(function () { sn.classList.add('is-in'); });
            $$('.lnw-lab, .lnw-tag', chEl).forEach(scramble);
          }
          curCh = chEl; view.classList.toggle('is-copy', !!chEl);
        }
        var g = STOPS[w.n].g;
        if (g !== curG) { curG = g; hudN.textContent = '0' + g + ' / 0' + GROUPS; }
        hudBar.style.height = (prog / TOTAL * 100).toFixed(2) + '%';
        /* the thread melts away a set way ahead: far off, a bend foreshortens into what reads as a corner */
        threadMat.uniforms.uTo.value = w.s + (tall ? 3800 : 5400);
        /* pulses run on ahead of the camera along the thread and light the shards they pass */
        for (k = 0; k < 4; k++) {
          var pa = w.s + 200 + ((time * 1100 + k * 1650) % 6600);
          pulse[k] = pa;
          if (pa > 0 && pa < LEN) { ptAt(pa, lightP[k]); lightI[k] = 1.1; } else lightI[k] = 0;
        }
        ptAt(w.s + 900, lightP[4]); lightI[4] = 0.6;
        lightP[5].copy(STOPS[w.n].P || ahead); lightI[5] = 0.5;
        /* the joints of the piece in reach burn bright */
        for (k = 0; k < JOINTS.length; k++) { var jl = act[JOINTS[k].n]; fAttr.setZ(k * 2, 0.3 + 0.85 * jl); fAttr.setZ(k * 2 + 1, 0.08 + 0.3 * jl); }
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
