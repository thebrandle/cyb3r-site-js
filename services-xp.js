/* ============================================================================
   CYB3R Media - homepage services (akaru.fr "Expertises" layout)
   Drives the .sx section in an HtmlEmbed on the homepage (markup + CSS: home-services/). Desktop: the stage
   pins for 100vh + 5 x 110vh and the scroll position p (0..5) places every panel: the active one fills the
   screen, the next two wait on the right as strips (20% and 5% of the width), and each panel's photo shrinks
   to fill its strip, right-aligned to the following panel and resting on one baseline. Panel contents never
   move on screen (each panel's inner layer is counter-translated), so a new panel wipes across the old text.
   Every panel carries its own copy of the heading and the progress row in its own ink colour, which keeps
   them readable wherever a light and a dark panel meet. The site header turns dark over light panels.
   Phones, tablets and reduced motion get stacked cards (CSS); there the script only keeps the header readable.
   ========================================================================== */
(function () {
  "use strict";
  var root = document.querySelector(".sx");
  if (!root || root.dataset.sxReady) return;
  root.dataset.sxReady = "1";
  var AR = 1.379, STEP = 1.1;   // photo aspect; scroll per panel, in viewport heights (CSS .sx-pin uses the same 110vh)
  var pin = root.querySelector(".sx-pin");
  var head = root.querySelector(".sx-stage > .sx-head"), nav = root.querySelector(".sx-stage > .sx-nav");
  var panels = [].slice.call(root.querySelectorAll(".sx-panel")), N = panels.length;
  var html = document.documentElement, logo = document.querySelector(".navigation-top .logo-first"), burger = document.querySelector(".navigation-top .hamburger-flex");
  var mq = matchMedia("(min-width: 992px) and (prefers-reduced-motion: no-preference)");
  var items = null, L = null, raf = 0, lastP = -1, near = false;

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
      var h = document.createElement("div"); h.className = "sx-head sx-copy"; h.setAttribute("aria-hidden", "true");
      h.innerHTML = head.querySelector(".sx-head-v").outerHTML;
      var n = nav.cloneNode(true); n.classList.add("sx-copy");
      inner.insertBefore(h, inner.firstChild); inner.appendChild(n);
      [].forEach.call(h.querySelectorAll(".sx-head-v"), function (v) { if (!v.querySelector(".sx-c")) split(v); });
      return { el: el, inner: inner, media: el.querySelector(".sx-media"), dark: el.classList.contains("sx-dark"),
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
  /* photo [left, width]: fills the panel's strip, right-aligned to the next panel; a passing photo drifts left and shrinks */
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
    var hs = Math.min(128, Math.max(56, W * 0.0667)), ht = Math.max(H * 0.12, 96);
    var ib = H * 0.814, iw = W / 3, minTop = ht + hs * 1.1 + H * 0.05;
    if (ib - iw / AR < minTop) iw = Math.max(W * 0.18, (ib - minTop) * AR);   // short screens: smaller photo, never under the heading
    L = { W: W, H: H, s1: s1, s2: s2, iw: iw, ib: ib, xA: W - s1 - iw, step: H * STEP };
    var s = root.style;
    s.setProperty("--sx-gx", gx + "px"); s.setProperty("--sx-hs", hs + "px"); s.setProperty("--sx-ht", ht + "px");
    s.setProperty("--sx-ct", ib - iw / AR + "px"); s.setProperty("--sx-cw", Math.max(240, L.xA - gx - W * 0.03) + "px");
    s.setProperty("--sx-iw", iw + "px"); s.setProperty("--sx-nt", Math.max(H * 0.919, ib + 44) + "px");
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
        it.bar.style.transform = "scaleX(" + sc + ")";
        it.titles.forEach(function (t, k) { t.classList.toggle("on", k <= reached); });
      });
    }
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
    header(false);
    L = null; request();
  }

  function headerHeight() {   // card top band = the header's height (stacked layout)
    var nb = document.querySelector(".navigation-top .navbar");
    if (nb && nb.offsetHeight) root.style.setProperty("--sx-hh", nb.offsetHeight + 8 + "px");
  }

  headerHeight();
  [].forEach.call(root.querySelectorAll(".sx-head-v"), split);
  root.classList.add("sx-split");
  if (mq.matches) on();
  var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { root.classList.add("is-in"); io.disconnect(); } }, { rootMargin: "0px 0px -35% 0px" });
  io.observe(root.querySelector(".sx-stage"));
  new IntersectionObserver(function (es) { near = es[0].isIntersecting; if (!near && !L) header(false); request(); }).observe(root);

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
