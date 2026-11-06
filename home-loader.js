/* CYB3R homepage sections loader (Selected Work .wk + Design in Motion .dm helix).
 * Loads three.js then the section CSS/JS from thebrandle/cyb3r-services-section@main.
 * Forked from muteebuilds/cyb3r-sections (that repo is not pushable by this account).
 * Sub-resources are pinned to an immutable @<commit> (jsDelivr @main resolution was
 * documented as unreliable/stale up to 12h). To update: push new js/css, bump B to the
 * new commit, re-register this loader (bumped version), re-apply, publish.
 * v2: the heavy chain (three.js ~600KB + engine + its card videos) is DEFERRED off the
 * critical path - it starts when the sections near the viewport (900px lead) or shortly
 * after window load, whichever comes first. Only the tiny CSS loads up front.
 * v3: the engine comes straight from cyb3r-site-js at a pinned commit, so a new engine needs only a new loader
 * version (the site-head RULES remap only touches cyb3r-services-section URLs). */
(function () {
  if (!document.querySelector('.wk,.dm')) return;
  var d = document, h = d.head, started = 0,
      B = 'https://cdn.jsdelivr.net/gh/thebrandle/cyb3r-services-section@de1b5cce689f82463ed8217d03ceee1b39d5af68/';
  var l = d.createElement('link'); l.rel = 'stylesheet'; l.href = B + 'cyb3r-sections.css'; h.appendChild(l);
  function j(u, c) { var s = d.createElement('script'); s.src = u; if (c) s.onload = c; h.appendChild(s); }
  function start() {
    if (started) return; started = 1;
    j('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', function () { j('https://cdn.jsdelivr.net/gh/thebrandle/cyb3r-site-js@5eb68ba8249ebd07addad2567d50bd13853a20c0/cyb3r-sections.js'); });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      for (var i = 0; i < es.length; i++) if (es[i].isIntersecting) { io.disconnect(); start(); return; }
    }, { rootMargin: '900px' });
    var roots = d.querySelectorAll('.wk,.dm');
    for (var i = 0; i < roots.length; i++) io.observe(roots[i]);
  }
  function late() { setTimeout(start, 2200); }
  if (d.readyState === 'complete') late(); else addEventListener('load', late);
})();
