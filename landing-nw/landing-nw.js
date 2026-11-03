/* cyb3rLandingNW - Relevance Advertising in the brand-nw.com home layout (markup + CSS: landing-nw/embed.html).
 * Runs the hero film (muted ambient loop; "Watch the video" or a click on the film restarts it with sound and
 * controls), the word reveals and label scramble, the image-band and name-strip scroll links, the example rail,
 * the counters, the integration accordion, the floating Discovery Call badge and the Discovery Call modal, which
 * moves the page's NATIVE Webflow form (#cybDiscoveryNative) into it so submissions still land in Webflow. */
(function () {
  if (window.__lnw) return; window.__lnw = 1;
  var root = document.getElementById('lnw');
  if (!root) return;
  var html = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function $$(s, el) { return Array.prototype.slice.call((el || root).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* one rAF per scroll/resize for everything scroll-linked */
  var ticks = [], queued = false;
  function onTick(fn) { ticks.push(fn); }
  function frame() { queued = false; for (var i = 0; i < ticks.length; i++) ticks[i](); }
  function kick() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  /* 0 while the element enters at the bottom, 1 once it has left at the top */
  function progress(el) {
    var r = el.getBoundingClientRect(), vh = window.innerHeight;
    return clamp((vh - r.top) / (vh + r.height), 0, 1);
  }

  /* ---- header height (portrait hero sits below it) */
  function headerHeight() {
    var logo = document.querySelector('.navigation-top .logo-first, .navigation-top a img, .navigation-top img');
    var h = logo ? logo.getBoundingClientRect().bottom + 22 : 92;
    root.style.setProperty('--lnw-hh', Math.round(clamp(h, 64, 140)) + 'px');
  }
  headerHeight();
  window.addEventListener('load', headerHeight);

  /* ---- word split for the statements (keeps the muted lead-in span) */
  function split(el) {
    var i = 0, walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (t) {
      var frag = document.createDocumentFragment();
      t.textContent.split(/(\s+)/).forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span'), wi = document.createElement('span');
        w.className = 'lnw-w'; wi.className = 'lnw-wi'; wi.style.setProperty('--i', i++);
        wi.textContent = p; w.appendChild(wi); frag.appendChild(w);
      });
      t.parentNode.replaceChild(frag, t);
    });
    el.classList.add('is-split');
  }
  var stmts = $$('.lnw-stmt[data-split]');
  if (!reduce) stmts.forEach(split); else stmts.forEach(function (el) { el.classList.add('is-split', 'is-in'); });

  /* ---- mono labels decode like a terminal when they come into view */
  var GLYPH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#%+=<>';
  function scramble(el) {
    if (el.__scr || reduce) return; el.__scr = 1;
    var fin = el.textContent, len = fin.length, frames = clamp(Math.round(len * 1.4), 14, 42), f = 0;
    el.style.minWidth = el.offsetWidth + 'px';
    var iv = setInterval(function () {
      var reveal = (f / frames) * len, out = '';
      for (var i = 0; i < len; i++) {
        var ch = fin.charAt(i);
        out += (ch === ' ' || i < reveal) ? ch : GLYPH.charAt((f * 7 + i * 13) % GLYPH.length);
      }
      el.textContent = out;
      if (++f > frames) { clearInterval(iv); el.textContent = fin; el.style.minWidth = ''; }
    }, 28);
  }

  /* ---- counters: keep prefix/suffix, count the integer part */
  function count(el, from) {
    if (el.__cnt || reduce) return; el.__cnt = 1;
    var m = (el.__final || el.textContent).match(/^(\D*)(\d+)(.*)$/);
    if (!m) return;
    var to = +m[2], start = from == null ? 0 : from, t0 = null, dur = 1500;
    function step(t) {
      if (!t0) t0 = t;
      var k = clamp((t - t0) / dur, 0, 1), ease = 1 - Math.pow(1 - k, 3);
      el.textContent = m[1] + Math.round(start + (to - start) * ease) + m[3];
      if (k < 1) requestAnimationFrame(step);
    }
    el.textContent = m[1] + start + m[3];
    requestAnimationFrame(step);
  }
  /* park each figure at its start value until it counts; the written value stays the target */
  function park(el, start) { el.__final = el.textContent; if (!reduce) el.textContent = el.textContent.replace(/\d+/, start); }
  $$('[data-count]').forEach(function (el) { park(el, '0'); });
  $$('[data-count-from]').forEach(function (el) { park(el, el.getAttribute('data-count-from')); });

  /* ---- reveal everything once it is 10% into the viewport */
  var revealIO = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target; revealIO.unobserve(el);
      el.classList.add('is-in');
      if (el.classList.contains('lnw-lab')) scramble(el);
      $$('[data-count]', el).forEach(function (c) { count(c); });
      $$('[data-count-from]', el).forEach(function (c) { count(c, +c.getAttribute('data-count-from')); });
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  $$('[data-reveal], .lnw-stmt[data-split], .lnw-lab').forEach(function (el) {
    if (reduce) { el.classList.add('is-in'); return; }
    revealIO.observe(el);
  });

  /* ---- statements float a few px against the scroll (brand-nw floatType) */
  if (!reduce) onTick(function () {
    var vh = window.innerHeight, mid = vh / 2;
    stmts.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var d = ((r.top + r.height / 2) - mid) / vh;
      el.style.transform = 'translate3d(0,' + (d * 14).toFixed(2) + 'px,0)';
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
    var loop = function () { sync(); raf = (!vid.paused && watching) ? requestAnimationFrame(loop) : 0; };
    ['play', 'pause', 'volumechange', 'loadedmetadata', 'seeked', 'timeupdate'].forEach(function (ev) {
      vid.addEventListener(ev, function () { sync(); if (ev === 'play' && watching && !raf) raf = requestAnimationFrame(loop); });
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
      if (!raf) raf = requestAnimationFrame(loop);   /* the ambient loop was already playing, so no 'play' event comes */
      badgeState();
      if (hero.getBoundingClientRect().top < -4 || hero.getBoundingClientRect().top > 4)
        window.scrollTo({ top: hero.getBoundingClientRect().top + window.pageYOffset, behavior: reduce ? 'auto' : 'smooth' });
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
    new IntersectionObserver(function (es) {
      heroSeen = es[0].isIntersecting;
      if (!heroSeen) { if (!vid.paused) vid.pause(); }
      else if (!watching && !reduce && !saveData) { ensureSrc(); var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
    }, { threshold: 0.05 }).observe(hero);
    sync();
  }

  /* ---- image bands: only composite the fixed layer while its window is on screen */
  var bands = $$('.lnw-band');
  var bandIO = new IntersectionObserver(function (es) {
    es.forEach(function (en) { en.target.classList.toggle('is-live', en.isIntersecting); });
  }, { rootMargin: '10% 0px' });
  bands.forEach(function (b) { bandIO.observe(b); });
  if (!reduce) onTick(function () {
    bands.forEach(function (b, k) {
      if (!b.classList.contains('is-live')) return;
      var p = progress(b) - 0.5, orbs = b.querySelectorAll('i');
      for (var i = 0; i < orbs.length; i++) {
        var s = (i + 1) * (k % 2 ? -1 : 1);
        orbs[i].style.transform = 'translate3d(' + (p * 60 * s).toFixed(1) + 'px,' + (p * -140 * (i + 1) / 2).toFixed(1) + 'px,0)';
      }
    });
  });

  /* ---- selected work: the name strip travels with the scroll, the rail follows on mouse devices */
  var work = root.querySelector('.lnw-work');
  var track = work && work.querySelector('.lnw-marq__track');
  var rail = work && work.querySelector('.lnw-rail'), railTrack = rail && rail.querySelector('.lnw-rail__track');
  if (work && !reduce) onTick(function () {
    var p = progress(work);
    if (track) track.style.transform = 'translate3d(' + (-50 + p * 46).toFixed(2) + 'vw,0,0)';
    if (rail && rail.classList.contains('is-linked')) {
      var max = railTrack.scrollWidth - rail.clientWidth;
      railTrack.style.transform = 'translate3d(' + (max > 0 ? -clamp((p - 0.12) / 0.62, 0, 1) * max : 0).toFixed(1) + 'px,0,0)';
    }
  });
  function linkRail() {
    if (!rail) return;
    var on = fine && !reduce && window.innerWidth > 767;
    rail.classList.toggle('is-linked', on);
    if (!on) railTrack.style.transform = '';
  }
  linkRail(); window.addEventListener('resize', linkRail);

  /* card films load a screen early and only play while visible */
  var cardIO = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      var v = en.target;
      if (en.isIntersecting) {
        if (!v.getAttribute('src')) v.src = v.getAttribute('data-src');
        if (!reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      } else if (!v.paused) v.pause();
    });
  }, { rootMargin: '0px 25% 0px 25%', threshold: 0.2 });
  $$('.lnw-card video').forEach(function (v) { cardIO.observe(v); });

  /* ---- integration accordion (no script: every model shows open) */
  $$('.lnw-cap').forEach(function (cap) {
    var btn = cap.querySelector('.lnw-cap__s');
    btn.addEventListener('click', function () {
      var open = !cap.classList.contains('is-open');
      cap.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---- floating badge: in after the first second, out over the closing CTA + footer, the film and the modal */
  var badge = root.querySelector('.lnw-badge'), ready = false, ending = 0;
  function modalOpen() { var m = document.getElementById('cybModal'); return !!(m && m.classList.contains('is-open')); }
  function badgeState() {
    if (!badge) return;
    badge.classList.toggle('is-on', ready && !watching && !ending && !modalOpen());
  }
  setTimeout(function () { ready = true; badgeState(); }, reduce ? 0 : 900);
  var endIO = new IntersectionObserver(function (es) {
    es.forEach(function (en) { en.target.__in = en.isIntersecting; });
    ending = 0;
    endEls.forEach(function (el) { if (el.__in) ending++; });
    badgeState();
  }, { threshold: 0 });
  var endEls = [root.querySelector('.lnw-cta')].concat(Array.prototype.slice.call(document.querySelectorAll('section.for-services, .foot2, footer')))
    .filter(function (el, i, a) { return el && a.indexOf(el) === i; });
  endEls.forEach(function (el) { endIO.observe(el); });
  document.addEventListener('click', function () { setTimeout(badgeState, 0); }, true);
  document.addEventListener('keydown', function () { setTimeout(badgeState, 0); });

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
