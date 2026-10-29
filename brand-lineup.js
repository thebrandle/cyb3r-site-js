/* ============================================================================
   CYB3R Media - service page card lineup (alanmenken.com-style)
   Drives the .bl section that lives in an HtmlEmbed on /brand-identity: the cards fly out
   from the centre on load, a hovered (or tapped / focused) card widens and turns to colour,
   and the big title below rebuilds letter by letter while the eyebrow and line crossfade.
   Every service's name and line are real HTML inside its card (h2 + p, screen-reader only);
   this script only reads them. Markup + CSS: see the embed. Reusable for other service pages.
   ========================================================================== */
(function () {
  "use strict";
  var root = document.querySelector(".bl");
  if (!root || root.dataset.blReady) return;
  root.dataset.blReady = "1";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = matchMedia("(hover: hover)").matches;
  var row = root.querySelector(".bl-row");
  var cards = [].slice.call(root.querySelectorAll(".bl-card"));
  var title = root.querySelector(".bl-title"), eyebrow = root.querySelector(".bl-eyebrow"), sub = root.querySelector(".bl-sub");
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var def = { e: eyebrow.textContent, t: title.textContent, s: sub.textContent };
  var data = cards.map(function (c, i) {
    var name = c.querySelector("h2").textContent.trim();
    return { e: pad(i + 1) + " / " + pad(cards.length), t: /[.!?]$/.test(name) ? name : name + ".", s: c.querySelector("p").textContent.trim() };
  });

  /* ---- the line under the title always keeps the height of the longest one, so swapping cards never
     changes the section's height (that moved the whole lineup up and down on some cards) ---- */
  function reserveSub() {
    var keep = sub.textContent, max = 0;
    sub.style.minHeight = "0px";
    [def].concat(data).forEach(function (d) { sub.textContent = d.s; max = Math.max(max, sub.offsetHeight); });
    sub.textContent = keep;
    sub.style.minHeight = max + "px";
  }
  reserveSub();
  var rsT = 0;
  addEventListener("resize", function () { cancelAnimationFrame(rsT); rsT = requestAnimationFrame(reserveSub); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reserveSub);

  /* ---- title: letters in random order, the closing full stop in teal ---- */
  var swapT = 0;
  function build(text) {
    title.textContent = "";
    var parts = text.split(" ");
    if (parts.length > 2) parts.splice(-2, 2, parts.slice(-2).join("\u00a0"));   // no single word alone on the last line
    parts.forEach(function (word, wi, words) {
      var w = document.createElement("span"); w.className = "bl-w";
      Array.prototype.forEach.call(word, function (ch, ci) {
        var l = document.createElement("span");
        l.className = "bl-l" + (ch === "." && wi === words.length - 1 && ci === word.length - 1 ? " bl-dot" : "");
        l.textContent = ch;
        l.style.setProperty("--d", (reduce ? 0 : Math.round(Math.random() * 420)) + "ms");
        w.appendChild(l);
      });
      title.appendChild(w);
      if (wi < words.length - 1) title.appendChild(document.createTextNode(" "));
    });
    title.offsetWidth;   // commit the hidden state so the transition runs
    title.querySelectorAll(".bl-l").forEach(function (l) { l.classList.add("in"); });
  }
  function swapTitle(text) {
    clearTimeout(swapT);
    var old = title.querySelectorAll(".bl-l");
    if (!old.length || reduce) return build(text);
    old.forEach(function (l) { l.style.setProperty("--d", Math.round(Math.random() * 120) + "ms"); l.classList.add("out"); l.classList.remove("in"); });
    swapT = setTimeout(function () { build(text); }, 240);
  }
  function crossfade(el, text) {   // the newest target always wins, even mid-fade
    el._next = text;
    if (el._busy || el.textContent === text) return;
    if (reduce) { el.textContent = text; return; }
    el._busy = true; el.classList.add("bl-fade");
    setTimeout(function () { el.textContent = el._next; el.classList.remove("bl-fade"); el._busy = false; }, 200);
  }

  /* ---- active card ---- */
  var cur = -1;
  function setActive(i) {
    if (i === cur) return;
    cur = i;
    cards.forEach(function (c, k) { c.classList.toggle("is-on", k === i); });
    root.classList.toggle("has-on", i > -1);
    var d = i > -1 ? data[i] : def;
    swapTitle(d.t); crossfade(eyebrow, d.e); crossfade(sub, d.s);
  }
  var leaveT = 0;
  cards.forEach(function (c, i) {
    c.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { clearTimeout(leaveT); setActive(i); } });
    // keyboard focus only: a tap also focuses the card, and the click below already handles taps
    c.addEventListener("focus", function () { if (c.matches(":focus-visible")) { clearTimeout(leaveT); setActive(i); } });
    // touch: tap opens a card, a second tap on it closes it again
    c.addEventListener("click", function () { if (!canHover) setActive(cur === i ? -1 : i); });
    c.addEventListener("keydown", function (e) { if (e.key === "Escape") { setActive(-1); c.blur(); } });
  });
  row.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") leaveT = setTimeout(function () { setActive(-1); }, 140); });
  row.addEventListener("focusout", function (e) { if (!row.contains(e.relatedTarget)) setActive(-1); });

  /* ---- entrance: cards gather at the centre, then spread into the row; title builds after ---- */
  function enter() {
    root.classList.remove("bl-pre");
    build(def.t);
    if (reduce) return;
    title.querySelectorAll(".bl-l").forEach(function (l) { l.style.setProperty("--d", 650 + Math.round(Math.random() * 420) + "ms"); });
    [eyebrow, sub].forEach(function (el, k) {
      el.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 700, delay: 900 + k * 120, easing: "ease", fill: "backwards" });
    });
    var rr = row.getBoundingClientRect(), mid = rr.left + rr.width / 2, n = cards.length;
    cards.forEach(function (c, k) {
      var r = c.getBoundingClientRect(), dx = mid - (r.left + r.width / 2);
      var order = Math.abs(k - (n - 1) / 2);   // centre cards leave first
      c.animate([
        { transform: "translateX(" + dx + "px) scale(.9)", opacity: 0 },
        { transform: "translateX(" + dx * 0.92 + "px) scale(.92)", opacity: 1, offset: 0.25 },
        { transform: "none", opacity: 1 }
      ], { duration: 1300, delay: 120 + order * 90, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", enter); else enter();
})();
