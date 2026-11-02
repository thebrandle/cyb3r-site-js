/* ============================================================================
   CYB3R Media - homepage logo band (the learnwithzero.com "5,000+ companies" wave)
   The client logos ride three curved rows on the brand teal: each row bows up at the
   edges, logos shrink and tilt as they round the curve, the rows drift (alternating
   directions), sweep in from the sides when the band arrives, take a shove when you
   scroll and slow to a third under the pointer. Motion maths ported from learnwithzero.
   Logos come from the homepage CMS ticker (section.ticker-reveal, Ticker Logos
   collection), which the band's embed hides and keeps only as the data source, so a
   logo added in the CMS shows up here too. BOX = each logo's content box inside its
   padded file (logo-band/boxes.py prints it); unknown files are measured at runtime.
   Load once on the homepage (registered hosted script, footer).
   ========================================================================== */
(function () {
  "use strict";
  var root = document.querySelector(".lb");
  if (!root || root.__lb) return; root.__lb = 1;
  var rowsEl = root.querySelector(".lb-rows"), head = root.querySelector(".lb-head"), html = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); };
  var BOX = {   // file id: [x0, y0, x1, y1] as fractions of the file, the box's aspect ratio, an area factor
    "6ab0beebf64ef41e6288afb9": [0.0275, 0.2721, 0.9719, 0.7082, 2.601, 1.05],
    "6ab0beedf64ef41e6288aff6": [0.1906, 0.1314, 0.8113, 0.8686, 1.011, 0.82],
    "6ab0beedf64ef41e6288afd3": [0.1226, 0.2381, 0.8774, 0.7113, 1.916, 1.01],
    "6ab0beecf64ef41e6288afc4": [0.1345, 0.1715, 0.8208, 0.7960, 1.320, 1.45],
    "6ab0beedf64ef41e6288afe4": [0.0609, 0.2774, 0.9492, 0.8852, 1.756, 1.20],
    "6ab0beedf64ef41e6288aff2": [0.2000, 0.1132, 0.7981, 0.8875, 0.928, 1.09],
    "6ab0beebf64ef41e6288afbc": [0.0000, 0.3833, 1.0000, 0.5781, 6.165, 1.01],
    "6ab0beedf64ef41e6288afd6": [0.0130, 0.3122, 0.9870, 0.6364, 3.609, 1.00],
    "6ab0beedf64ef41e6288afe1": [0.0514, 0.3500, 0.9354, 0.6659, 3.362, 0.93],
    "6ab0beedf64ef41e6288afdd": [0.0432, 0.3757, 0.9580, 0.5948, 5.017, 0.93],
    "6ab0beedf64ef41e6288b006": [0.1434, 0.2267, 0.8560, 0.7725, 1.568, 0.84],
    "6ab0beedf64ef41e6288b009": [0.0130, 0.3629, 0.9807, 0.6379, 4.227, 1.44],
    "6ab0beedf64ef41e6288aff9": [0.1408, 0.1480, 0.8333, 0.8368, 1.208, 1.05],
    "6ab0beedf64ef41e6288afee": [0.0149, 0.3621, 0.9958, 0.6054, 4.844, 1.03],
    "6ab0beedf64ef41e6288afd0": [0.0143, 0.3561, 0.9857, 0.6439, 4.054, 1.07],
    "6ab0beedf64ef41e6288afea": [0.0508, 0.3054, 0.9555, 0.6553, 3.106, 0.80],
    "6ab0beedf64ef41e6288afff": [0.0628, 0.2502, 0.9417, 0.7498, 2.113, 1.45],
    "6ab0beedf64ef41e6288affc": [0.1339, 0.3099, 0.8837, 0.7113, 2.244, 1.00],
    "6ab0beedf64ef41e6288afe7": [0.0000, 0.3447, 0.9971, 0.6553, 3.856, 0.84],
    "6ab0beedf64ef41e6288b00d": [0.1622, 0.0694, 0.8743, 0.9231, 1.002, 0.93],
    "6ab0bef2f64ef41e6288b116": [0.0495, 0.3583, 0.9511, 0.6424, 3.812, 0.81],
    "6ab0bef1f64ef41e6288b0ef": [0.0000, 0.4075, 1.0000, 0.5917, 6.520, 0.80],
    "6ab0bef2f64ef41e6288b12a": [0.0000, 0.2744, 1.0000, 0.7256, 2.662, 0.80],
    "6ab0bef2f64ef41e6288b113": [0.0000, 0.1972, 1.0000, 0.8043, 1.979, 1.09],
    "6ab0bef2f64ef41e6288b109": [0.0615, 0.1178, 0.9757, 0.8232, 1.557, 0.98],
    "6ab0bef2f64ef41e6288b125": [0.1270, 0.0474, 0.8699, 0.9480, 0.991, 0.88],
    "6ab0bef1f64ef41e6288b0ec": [0.0835, 0.1261, 0.9372, 0.7869, 1.552, 1.45],
    "6ab0bef2f64ef41e6288b10c": [0.0187, 0.2244, 0.9813, 0.7688, 2.124, 0.80],
    "6ab0bef0f64ef41e6288b0e2": [0.1326, 0.0437, 0.8944, 0.9571, 1.002, 0.91],
    "6ab0bef0f64ef41e6288b0e5": [0.0413, 0.2184, 0.9587, 0.7604, 2.033, 1.38],
    "6ab0bef2f64ef41e6288b119": [0.0823, 0.2244, 0.9561, 0.7763, 1.902, 0.83],
    "6ab0bef1f64ef41e6288b0f9": [0.0785, 0.2721, 0.8869, 0.7627, 1.979, 1.15],
    "6ab0bef1f64ef41e6288b0f6": [0.0439, 0.1813, 0.9675, 0.8179, 1.743, 1.06],
    "6ab0bef1f64ef41e6288b0fc": [0.0357, 0.1700, 0.9813, 0.7536, 1.946, 0.89],
    "6ab0bef1f64ef41e6288b0ff": [0.0199, 0.2827, 0.9725, 0.6893, 2.814, 1.45],
    "6ab0bef2f64ef41e6288b110": [0.0363, 0.3099, 0.9876, 0.6946, 2.970, 0.98]
  };
  var HALF = 62 * Math.PI / 180, MIN_SCALE = .4, SLOW = 1 / 3, BEND = .85, F = 2;   // logos are drawn at 2x and scaled down

  /* the logos, in collection order, de-duplicated */
  var seen = {}, logos = [];
  [].forEach.call(document.querySelectorAll("section.ticker-reveal .w-dyn-item img"), function (im) {
    var src = im.getAttribute("data-cyb-src") || im.getAttribute("src"), id = src && (src.split("/").pop().match(/^[0-9a-f]{24}/) || [])[0];   // the site's image deferral parks the real URL in data-cyb-src
    if (!src || /^data:/.test(src) || seen[src]) return; seen[src] = 1;
    logos.push({ src: src, url: src, box: id && BOX[id], name: (im.getAttribute("alt") || "").replace(/\s*logo\.?\s*$/i, "") });
  });
  if (!logos.length) { root.style.display = "none"; return; }

  /* a logo the map does not know: fetch it once (the blob then paints it, so there is no second download) and find its box */
  function measure(o) {
    fetch(o.src, { mode: "cors" }).then(function (r) { return r.blob(); }).then(function (blob) {
      return createImageBitmap(blob).then(function (bmp) {
        var w = 200, h = Math.max(1, Math.round(200 * bmp.height / bmp.width)), c = document.createElement("canvas");
        c.width = w; c.height = h;
        var g = c.getContext("2d"); g.drawImage(bmp, 0, 0, w, h);
        var d = g.getImageData(0, 0, w, h).data, x0 = w, y0 = h, x1 = -1, y1 = -1;
        for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        if (x1 < 0) return;
        var b = [Math.max(0, x0 / w - .006), Math.max(0, y0 / h - .006), Math.min(1, (x1 + 1) / w + .006), Math.min(1, (y1 + 1) / h + .006)];
        b.push((b[2] - b[0]) * bmp.width / ((b[3] - b[1]) * bmp.height));
        o.box = b; o.url = URL.createObjectURL(blob); lastS = 0; layout();
      });
    }).catch(function () {});
  }

  var rows = [[], [], []], L = null, lastS = 0, off = null, prog = [0, 0, 0], dirty = true;
  var speed = 1, speedTo = 1, kick = 0, raf = 0, last = 0, near = false, inView = false, t0 = -1, lastY = window.scrollY || 0, bandY = 70;

  /* every logo gets the same visual area (wide wordmarks come out shorter), capped in width */
  function build(s) {
    rowsEl.textContent = "";
    rows = [[], [], []];
    var area = s * s * 3, wmax = s * 4.8, n = 0;
    logos.forEach(function (o) {
      if (!o.box) { if (!o.asked) { o.asked = 1; measure(o); } return; }
      var b = o.box, a = b[4], h = Math.sqrt(area * (b[5] || 1) / Math.max(a, 1)), w = Math.min(wmax, h * a); h = w / a;
      var el = document.createElement("span"), iw = w * F / (b[2] - b[0]), ih = h * F / (b[3] - b[1]);
      el.className = "lb-logo";
      el.style.width = (w * F).toFixed(1) + "px"; el.style.height = (h * F).toFixed(1) + "px";
      el.innerHTML = '<i style="background-image:url(&quot;' + esc(o.url) + '&quot;);background-size:' + iw.toFixed(1) + "px " + ih.toFixed(1) + "px;background-position:" +
        (-b[0] * iw).toFixed(1) + "px " + (-b[1] * ih).toFixed(1) + 'px"></i>' + (o.name ? '<span class="sr-only">' + esc(o.name) + "</span>" : "");
      rowsEl.appendChild(el);
      rows[n++ % 3].push({ el: el, w: w, h: h, x: 0, vis: false });
    });
  }

  function layout() {
    var W = root.offsetWidth, vh = window.innerHeight || 800;
    if (!W || !near) return;
    var mob = W < 700, s = mob ? clamp(W * .072, 26, 34) : clamp(Math.min(W, 1440) * .017, 18, 46);
    if (Math.abs(s - lastS) >= .5) { build(s); lastS = s; }
    var R = W / 2 / Math.sin(HALF), lift = Math.min(vh * .105, W * .085, W * W / (4.6 * vh)), Rf = (W * W / 4 + lift * lift) / (2 * lift);
    /* top down: padding, the two-line heading, a clear gap above the top row where it passes the heading's ends, the rows, padding */
    var rr = root.getBoundingClientRect(), half = 0, tall = function (r) { return r.reduce(function (m, o) { return Math.max(m, o.h); }, s) / 2; };
    [].forEach.call(head.querySelectorAll(".lb-l"), function (ln) {
      var g = document.createRange(); g.selectNodeContents(ln);
      var q = g.getBoundingClientRect(); if (q.width) half = Math.max(half, Math.abs(q.left - rr.left - W / 2), Math.abs(q.right - rr.left - W / 2));
    });
    var hx = Math.min(half + 12, Rf * .9), rise = (Rf - Math.sqrt(Rf * Rf - hx * hx)) * BEND, gap = mob ? 36 : clamp(W * .036, 40, 64);
    var yt = head.offsetTop + head.offsetHeight + gap + rise + tall(rows[0]), ym = yt + s * 2.85, yb = ym + s * 2.85, wmax = 0;
    root.style.minHeight = "0px";   // the CSS min-height only holds the space until this exact height lands
    root.style.height = Math.ceil(yb + tall(rows[2]) + (parseFloat(getComputedStyle(root).paddingBottom) || 0)) + "px";
    var sums = rows.map(function (r) { return r.reduce(function (a, o) { if (o.w > wmax) wmax = o.w; return a + o.w; }, 0); });
    var span = 2 * R * Math.asin(Math.min(1, (W / 2 + wmax * .3) / R)), gap = s * 3.4;
    rows.forEach(function (r, i) { if (r.length) gap = Math.max(gap, (span + wmax + 8 - sums[i]) / r.length); });
    var loop = rows.map(function (r, i) { var a = gap / 2; r.forEach(function (o) { o.x = a + o.w / 2; a += o.w + gap; }); return Math.max(1, sums[i] + r.length * gap); });
    if (!off) off = [0, loop[1] / Math.max(1, rows[1].length) / 2, loop[2] / Math.max(1, rows[2].length) / 4];
    L = { W: W, s: s, R: R, bow: s * 2.1, Rf: Rf, cap: Rf * .9, y: [yt, ym, yb], loop: loop, v: [-W * .022, W * .019, -W * .016], top: yt - s * 1.6, mob: mob };
    var burger = document.querySelector(".navigation-top .hamburger-flex"), br = burger && burger.getBoundingClientRect();
    bandY = br && br.height ? br.top + br.height / 2 : 70;
    dirty = true; draw(); headerTone();
  }

  /* place every logo: angle round a circle of radius R (scale = its cosine), height on a flatter arc, tilt = that arc's slope;
     while a row is still arriving (e < 1) it comes in from the side, larger and more bowed */
  function draw() {
    if (!L || !dirty) return; dirty = false;
    for (var r = 0; r < 3; r++) {
      var e = prog[r], list = rows[r], n = L.loop[r], dir = r % 2 ? -1 : 1, l = 1 - e;
      var u = L.R * (.42 + .58 * e), bow = L.bow * 3 * l, c = 1 + 1.7 * l, d = dir * l * L.W, y0 = L.y[r], lim = L.mob ? 1.54 : 1.5;
      if (L.mob) { u = L.R; c = 1; d = 0; bow = L.s * 2.4 * l; }
      for (var j = 0; j < list.length; j++) {
        var o = list[j], k = ((o.x + off[r]) % n + n) % n - n / 2, T = L.mob ? k / u + dir * l * 2.35 : (k + d * 1.15) / u;
        if (e <= .001 || T > lim || T < -lim) {
          if (o.vis) { o.vis = false; o.el.style.transform = "translate3d(-200vw,0,0)"; }
          continue;
        }
        var cs = Math.cos(T), sn = Math.sin(T), sc = Math.max(MIN_SCALE, cs) * c, x = L.W / 2 + u * sn * c + d * .3, dx = clamp(x - L.W / 2, -L.cap, L.cap);
        var q = Math.sqrt(L.Rf * L.Rf - dx * dx), y = y0 - (L.Rf - q) * BEND - bow * (1 - cs) * c;
        var rot = Math.atan(-dx / q * BEND - bow / u * sn / Math.max(.3, cs)) * 57.2958;
        o.vis = true;
        o.el.style.transform = "translate3d(" + (x - o.w * F / 2).toFixed(2) + "px," + (y - o.h * F / 2).toFixed(2) + "px,0) rotate(" + rot.toFixed(2) + "deg) scale(" + (sc / F).toFixed(4) + ")";
      }
    }
  }

  function tick(now) {
    raf = 0;
    if (!L) return;
    var dt = Math.min(100, last ? now - last : 16); last = now;
    if (t0 >= 0) {
      var mob = L.mob, dur = mob ? 1500 : 950, gap = mob ? 140 : 120, pw = mob ? 4 : 3;   // power3 / power4 ease-out, rows staggered
      for (var r = 0; r < 3; r++) prog[r] = reduce ? 1 : 1 - Math.pow(1 - clamp((now - t0 - r * gap) / dur, 0, 1), pw);
    }
    if (!reduce) {
      speed += (speedTo - speed) * (1 - Math.exp(-dt / 320));
      var shove = kick * (1 - Math.exp(-dt / 240)); kick -= shove;
      for (var i = 0; i < 3; i++) off[i] += L.v[i] * dt / 1000 * speed + (i % 2 ? shove : -shove);
    }
    dirty = true; draw();
    if (inView && (!reduce || prog[2] < 1)) raf = requestAnimationFrame(tick);
  }
  function play() { if (!raf && inView) { last = 0; raf = requestAnimationFrame(tick); } }

  /* the header over the teal: dark logo and menu lines while the band is behind it (no white on the brand teal) */
  function headerTone() {
    var r = root.getBoundingClientRect();
    html.classList.toggle("lb-dark", near && r.top <= bandY && r.bottom >= bandY);
  }

  /* heading (two .lb-l lines): words rise into place when the band arrives */
  if (!reduce && head) {
    var wi = 0;
    head.setAttribute("aria-label", head.textContent.replace(/\s+/g, " ").trim());
    [].forEach.call(head.querySelectorAll(".lb-l"), function (ln) {
      ln.innerHTML = ln.textContent.trim().split(/\s+/).map(function (w) { return '<span class="lb-w" aria-hidden="true"><span style="--i:' + (wi++) + '">' + esc(w) + "</span></span>"; }).join(" ");
    });
    root.classList.add("lb-split");
  }

  new IntersectionObserver(function (en) {   // build (and load the logos) only when the band gets close
    near = en[0].isIntersecting;
    if (near) layout(); else html.classList.remove("lb-dark");
  }, { rootMargin: "600px 0px" }).observe(root);
  new IntersectionObserver(function (en) {
    inView = en[0].isIntersecting;
    if (inView && t0 < 0 && en[0].intersectionRatio >= .2) { t0 = performance.now(); root.classList.add("is-in"); }
    if (inView) play();
  }, { threshold: [0, .2] }).observe(root);

  addEventListener("scroll", function () {
    var y = window.scrollY || 0, dy = y - lastY; lastY = y;
    if (!near) return;
    headerTone();
    if (inView && L && dy && !reduce) { kick = clamp(kick + dy * .2 * clamp(L.W / 1512, .45, 1.3), -L.W * .3, L.W * .3); play(); }
  }, { passive: true });
  root.addEventListener("pointermove", function (ev) {   // a third of the speed while the pointer is over the logos
    if (ev.pointerType !== "mouse" || !L) return;
    var dx = clamp(ev.clientX - L.W / 2, -L.cap, L.cap), y = ev.clientY - root.getBoundingClientRect().top;
    speedTo = y > L.top - (L.Rf - Math.sqrt(L.Rf * L.Rf - dx * dx)) * BEND ? SLOW : 1;
  }, { passive: true });
  root.addEventListener("pointerleave", function () { speedTo = 1; });
  var rt;
  addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { layout(); play(); }, 160); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); });
})();
