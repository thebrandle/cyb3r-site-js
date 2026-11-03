/* cyb3rLandingNW - Relevance Advertising in the brand-nw.com home layout (markup + CSS: landing-nw/embed-*.html).
 * Motion follows brand-nw.com: a navy intro curtain, eased wheel/keyboard scrolling, the page gliding half a screen
 * down once the film has run (unless the visitor moved first), statements rising line by line, mono labels decoding,
 * labels and side copy lagging the scroll, magnetic links, a scroll-scrubbed logo strip, a brand-name strip that
 * drifts with scroll speed, a scroll-linked example rail whose cards open from the bottom, fixed-layer image bands,
 * floating statements, a one-open accordion, the floating Discovery Call badge, a pop-up that opens as a circle
 * from the click and a veil that rises before leaving for another page. The hero film is a muted loop; "Watch the
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
  function ensureSrc() { if (!vid.getAttribute('src')) vid.src = pickSrc(); }
  function fmt(s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function modalOpen() { var m = document.getElementById('cybModal'); return !!(m && m.classList.contains('is-open')); }
  if (vid) {
    var ctrl = hero.querySelector('.lnw-ctrl'), bPlay = ctrl.querySelector('[data-c=play]'), bSound = ctrl.querySelector('[data-c=sound]');
    var bar = ctrl.querySelector('[data-c=seek]'), fill = bar.querySelector('i'), time = ctrl.querySelector('.lnw-ctrl__t');
    var saveData = navigator.connection && navigator.connection.saveData;
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

  /* ---- intro: a navy field (already covering the first frame) pulls up off the film, then the page comes alive */
  var introDone = false, fontsDone = false;
  function maybeStart() {
    if (!introDone || !fontsDone) return;
    startReveals();
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
