/* ============================================================================
   CYB3R Media - service page "3" pairs (bennettandclive.com clients list)
   Drives the .bp section that sits in an HtmlEmbed under the card lineup on every service page: CSS holds
   the CYB3R 3 at the middle of the screen (position: sticky), and every row within about three rows of
   it parts around it, the left word sliding left and the right word right, easing back to the centre
   line as the 3 moves on. Rows glide toward their spot over a few frames instead of jumping with each
   scroll event (phones deliver those unevenly, which read as jitter). Markup + CSS: see the embed.
   ========================================================================== */
(function () {
  "use strict";
  var root = document.querySelector(".bp");
  if (!root || root.dataset.bpReady) return;
  root.dataset.bpReady = "1";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;   // CSS hides the 3, rows stay still
  var mark = root.querySelector(".bp-mark");
  var rows = [].slice.call(root.querySelectorAll(".bp-row")).map(function (el) {
    return { el: el, l: el.querySelector(".bp-l"), r: el.querySelector(".bp-r"), y: 0, x: -1 };
  });
  var TAU = 100;   // ms for a row to cover ~63% of the way to its spot, about GSAP scrub .3
  var amp = 0, reach = 1, raf = 0, then = 0, snap = true;

  function measure() {   // row centres relative to the section, how far a row is pushed and how far the push reaches
    var box = root.getBoundingClientRect(), h = 0, room = Infinity, range = document.createRange();
    rows.forEach(function (o) {
      var b = o.el.getBoundingClientRect(), x = Math.max(o.x, 0), l, r;
      o.y = b.top - box.top + b.height / 2; h = b.height;
      range.selectNodeContents(o.l); l = range.getBoundingClientRect();
      range.selectNodeContents(o.r); r = range.getBoundingClientRect();
      room = Math.min(room, l.left + x - box.left, box.right - (r.right - x));   // space between each word and the screen edge at rest
    });
    // 100px at 1440 as on the reference, but never so far that the longest word leaves the screen
    amp = Math.max(0, Math.min(innerWidth < 768 ? innerWidth * 0.08 : Math.min(130, innerWidth * 0.07), room - innerWidth * 0.04));
    reach = h * 3.2;
  }
  function frame(now) {
    raf = 0;
    var dt = then ? Math.min(now - then, 50) : 16, k = snap ? 1 : 1 - Math.exp(-dt / TAU), busy = false;
    var top = root.getBoundingClientRect().top, m = mark.getBoundingClientRect(), cy = m.top + m.height / 2 - top;   // where the 3 sits inside the section
    then = now; snap = false;
    rows.forEach(function (o) {
      var d = (o.y - cy) / reach, f = Math.abs(d) < 1 ? Math.pow(Math.cos(d * Math.PI / 2), 2) : 0, goal = f * amp;
      var x = o.x + (goal - o.x) * k;
      if (Math.abs(goal - x) < 0.1) x = goal; else busy = true;
      if (x === o.x) return;
      o.x = x;
      o.l.style.transform = "translate3d(" + (-x).toFixed(2) + "px,0,0)";
      o.r.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0)";
    });
    if (busy) raf = requestAnimationFrame(frame); else then = 0;
  }
  function request() { if (!raf) raf = requestAnimationFrame(frame); }

  measure(); request();
  root.classList.remove("bp-pre");
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", function () { measure(); request(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); request(); });
})();
