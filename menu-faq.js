/* ============================================================================
   CYB3R Media - site menu + FAQ helpers (registered "cyb3rMenuFaq", site-wide footer)
   1. FAQ single-open and click-inside-the-menu-to-close: the original inline cyb3rMenuFaq 0.0.1, verbatim.
   2. Services dropdown in the overlay menu (was menu-services.js): a + on the Services row opens the six
      service pages in small type; the menu panel scrolls if the open list makes it taller than the screen.
   One file because the site allows 15 site-wide scripts and all 15 slots are taken.
   ========================================================================== */
(function(){document.addEventListener('click',function(e){var t=e.target;if(!t||!t.closest)return;var tg=t.closest('.fq2-toggle');if(tg){var it=tg.closest('.fq2-item');var op=document.querySelectorAll('.fq2-item.open');for(var i=0;i<op.length;i++){if(op[i]!==it)op[i].classList.remove('open');}return;}var bur=document.querySelector('.hamburger-flex');if(!bur||!bur.classList.contains('cy-burger-open'))return;if(bur.contains(t)||t.closest('a'))return;var fm=document.querySelector('.fixed-menu');if(fm&&fm.contains(t))bur.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));},false);})();
(function () {
  "use strict";
  var a = document.querySelector(".fixed-menu .menu-big-first a.button-big-menu[href='/services']");
  if (!a || a.parentNode.classList.contains("cy-svc")) return;
  var SUB = [["brand-identity", "Brand & Identity"], ["web-design-development", "Web Design & Development"], ["seo-google-ads", "SEO & Google Ads"],
    ["social-media-content", "Social Media & Content"], ["commercial-print-production", "Commercial Print & Production"], ["ai-driven-advertising", "AI-Driven Advertising"]];
  var here = location.pathname.replace(/\/$/, "");

  var css = document.createElement("style");
  css.textContent =
    ".cy-svc-row{position:relative}" +
    ".cy-svc-tg{position:absolute;right:0;top:0;bottom:0;width:52px;margin:0;padding:0;border:0;background:none;color:#fff;cursor:pointer;-webkit-tap-highlight-color:transparent}" +
    ".cy-svc-tg::before,.cy-svc-tg::after{content:'';position:absolute;left:50%;top:50%;width:16px;height:1.5px;margin:-.75px 0 0 -8px;background:currentColor;transition:transform .35s cubic-bezier(.22,1,.36,1)}" +
    ".cy-svc-tg::after{transform:rotate(90deg)}" +
    ".cy-svc.is-open .cy-svc-tg::after{transform:rotate(0)}" +   /* + becomes - */
    ".cy-svc-tg:hover,.cy-svc-tg:focus-visible{color:#39F1E0}" +
    ".cy-svc-tg:focus-visible{outline:2px solid #39F1E0;outline-offset:-8px}" +
    ".cy-svc-list{list-style:none;margin:0;padding:0;height:0;overflow:hidden;transition:height .45s cubic-bezier(.22,1,.36,1)}" +
    ".cy-svc-list li{margin:0;padding:0;font-size:inherit;line-height:inherit;letter-spacing:normal;opacity:1}" +   /* the theme sizes and dims every li */
    ".cy-svc-list li:first-child{padding-top:12px}.cy-svc-list li:last-child{padding-bottom:16px}" +
    ".cy-svc-a{display:block;padding:7px 0;font:500 16px/1.35 Inter,sans-serif;letter-spacing:-.01em;color:rgba(255,255,255,.7);text-decoration:none;transition:color .2s}" +
    ".cy-svc-a:hover,.cy-svc-a:focus-visible,.cy-svc-a[aria-current]{color:#39F1E0}" +
    "@media (max-width:767px){.cy-svc-a{padding:8px 0;font-size:15px}}" +
    ".fixed-menu .navigation-content{overflow-y:auto;overscroll-behavior:contain}" +
    "@media (max-width:479px){.fixed-menu .navigation-content{justify-content:safe center}}" +   /* centred phone menu: an overflow must not cut off Home */
    "@media (prefers-reduced-motion:reduce){.cy-svc-list,.cy-svc-tg::after{transition:none}}";
  document.head.appendChild(css);

  var wrap = document.createElement("div"), row = document.createElement("div"), btn = document.createElement("button"), list = document.createElement("ul");
  wrap.className = "cy-svc"; row.className = "cy-svc-row";   // the row holds the Services link and the +, the list opens under it
  a.parentNode.insertBefore(wrap, a); wrap.appendChild(row); row.appendChild(a);
  btn.type = "button"; btn.className = "cy-svc-tg"; btn.setAttribute("aria-controls", "cy-svc-list");
  list.className = "cy-svc-list"; list.id = "cy-svc-list"; list.setAttribute("role", "list");
  list.innerHTML = SUB.map(function (s) {
    return '<li><a class="cy-svc-a" href="/' + s[0] + '"' + (here === "/" + s[0] ? ' aria-current="page"' : "") + ">" + s[1].replace(/&/g, "&amp;") + "</a></li>";
  }).join("");
  row.appendChild(btn); wrap.appendChild(list);

  function set(open) {
    wrap.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Hide the service pages" : "Show the service pages");
    list.style.height = open ? list.scrollHeight + "px" : "0px";
    [].forEach.call(list.querySelectorAll("a"), function (l) { l.tabIndex = open ? 0 : -1; });
  }
  // stopPropagation: the menu's own script closes the menu on any non-link click inside it
  btn.addEventListener("click", function (e) { e.stopPropagation(); set(!wrap.classList.contains("is-open")); });
  set(false);
  var nav = a.closest(".navigation-content"); if (nav) nav.setAttribute("data-lenis-prevent", "");   // smooth scroll must not swallow the menu's own scrolling
  addEventListener("resize", function () { if (wrap.classList.contains("is-open")) list.style.height = list.scrollHeight + "px"; });
})();
