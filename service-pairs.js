/* ============================================================================
   CYB3R Media - service page "3" pairs (bennettandclive.com clients list)
   Drives the .bp section that sits in an HtmlEmbed under the card lineup on /brand-identity: CSS holds
   the CYB3R 3 at the middle of the screen (position: sticky), and every row within about three rows of
   it parts around it, the left word sliding left and the right word right, easing back to the centre
   line as the 3 moves on. Markup + CSS: see the embed. Reusable for the other service pages.
   ========================================================================== */
(function () {
  "use strict";
  var root = document.querySelector(".bp");
  if (!root || root.dataset.bpReady) return;
  root.dataset.bpReady = "1";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;   // CSS hides the 3, rows stay still
  var mark = root.querySelector(".bp-mark");
  var rows = [].slice.call(root.querySelectorAll(".bp-row")).map(function (el) {
    return { el: el, l: el.querySelector(".bp-l"), r: el.querySelector(".bp-r"), y: 0 };
  });
  var amp = 0, reach = 1, last = null, raf = 0;

  function measure() {   // row centres relative to the section, how far a row is pushed and how far the push reaches
    var top = root.getBoundingClientRect().top, h = 0;
    rows.forEach(function (o) { var b = o.el.getBoundingClientRect(); o.y = b.top - top + b.height / 2; h = b.height; });
    amp = innerWidth < 768 ? innerWidth * 0.05 : Math.min(130, innerWidth * 0.07);   // 100px at 1440, as on the reference
    reach = h * 3.2;
    last = null;
  }
  function frame() {
    raf = 0;
    var top = root.getBoundingClientRect().top, m = mark.getBoundingClientRect();
    var cy = Math.round(m.top + m.height / 2 - top);   // where the 3 sits inside the section
    if (cy === last) return;
    last = cy;
    rows.forEach(function (o) {
      var d = (o.y - cy) / reach, f = Math.abs(d) < 1 ? Math.pow(Math.cos(d * Math.PI / 2), 2) : 0, x = (f * amp).toFixed(1);
      o.l.style.transform = "translate3d(-" + x + "px,0,0)";
      o.r.style.transform = "translate3d(" + x + "px,0,0)";
    });
  }
  function request() { if (!raf) raf = requestAnimationFrame(frame); }

  measure(); frame();
  root.classList.remove("bp-pre");
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", function () { measure(); request(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); request(); });
})();
