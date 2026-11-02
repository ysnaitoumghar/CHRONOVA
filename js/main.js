/* CHRONOVA — main.js (vanilla, no framework)
   Modules: preloader · header · menu · reveals · parallax · carousel · marquee · footer · newsletter · bag · cursor · smooth scroll
   Only transform/opacity are animated from JS. */
(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var desktopMQ = window.matchMedia('(min-width: 900px)');
  window.__cn = true; // tells the inline safety-net that the script ran

  var lenis = null;       // set by smoothScroll()
  var scrollSubs = [];    // rAF-throttled scroll listeners
  var ticking = false;
  function onScroll(fn) { scrollSubs.push(fn); }
  function runScroll() { ticking = false; var y = window.pageYOffset; scrollSubs.forEach(function (f) { f(y); }); }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(runScroll); } }, { passive: true });

  /* ---------- preloader ---------- */
  function preloader(done) {
    var el = $('#preloader');
    if (!el || root.classList.contains('skip-pre')) { requestAnimationFrame(done); return; }
    $$('.preloader__word span', el).forEach(function (s, i) { s.style.setProperty('--i', i); });
    requestAnimationFrame(function () { el.classList.add('is-run'); });
    setTimeout(function () { el.classList.add('is-out'); done(); }, 1000);   // curtain lifts, hero reveals underneath
    setTimeout(function () { el.style.display = 'none'; try { sessionStorage.setItem('cn-pre', '1'); } catch (e) {} }, 1650);
  }

  /* ---------- announcement bar (mobile cross-fade) ---------- */
  function announce() {
    var msgs = $$('.bar__msg'); if (msgs.length < 2 || reduce) return;
    var i = 0;
    setInterval(function () {
      if (desktopMQ.matches) return;
      msgs[i].classList.remove('is-active'); i = (i + 1) % msgs.length; msgs[i].classList.add('is-active');
    }, 4000);
  }

  /* ---------- header ---------- */
  function header() {
    var h = $('#header'), bar = $('#bar'); if (!h) return;
    var lastY = window.pageYOffset, barH = bar ? bar.offsetHeight : 0;
    window.addEventListener('resize', function () { barH = bar ? bar.offsetHeight : 0; });
    function update(y) {
      var off = Math.max(0, barH - y);
      h.style.setProperty('--bar-off', off + 'px');
      h.classList.toggle('is-solid', y > 80);
      var menuOpen = root.classList.contains('menu-open');
      if (!menuOpen) {
        if (y > lastY + 6 && y > 200) h.classList.add('is-hidden');
        else if (y < lastY - 6 || y < 200) h.classList.remove('is-hidden');
      }
      if (Math.abs(y - lastY) > 6) lastY = y;
    }
    barH = bar ? bar.offsetHeight : 0;
    update(window.pageYOffset);
    onScroll(update);
  }

  /* ---------- mobile menu (focus trap, scroll lock) ---------- */
  function menu() {
    var burger = $('#burger'), m = $('#menu'); if (!burger || !m) return;
    var open = false;
    $$('.menu__nav a span', m).forEach(function (s, i) { s.style.setProperty('--i', i); });
    var focusables = function () { return [burger].concat($$('a, button', m)); };

    function set(state) {
      open = state;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      root.classList.toggle('menu-open', open);
      m.setAttribute('aria-hidden', String(!open));
      if (open) { m.hidden = false; requestAnimationFrame(function () { m.classList.add('is-open'); var first = $('a', m); if (first) first.focus({ preventScroll: true }); }); if (lenis) lenis.stop(); }
      else { m.classList.remove('is-open'); setTimeout(function () { if (!open) m.hidden = true; }, 650); if (lenis) lenis.start(); }
      if (!open) burger.focus({ preventScroll: true });
    }
    burger.addEventListener('click', function () { set(!open); });
    m.addEventListener('click', function (e) { if (e.target.closest('a')) { open = true; closeKeep(); } });
    function closeKeep() { // close on link tap, don't steal scroll to burger focus
      open = false; burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu');
      root.classList.remove('menu-open'); m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true');
      setTimeout(function () { m.hidden = true; }, 650); if (lenis) lenis.start();
    }
    document.addEventListener('keydown', function (e) {
      if (!open) return;
      if (e.key === 'Escape') { set(false); return; }
      if (e.key !== 'Tab') return;
      var f = focusables(), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    desktopMQ.addEventListener('change', function (e) { if (e.matches && open) set(false); });
  }

  /* ---------- reveals (IntersectionObserver + CSS transitions) ---------- */
  function reveals() {
    // wrap each h2 in a mask so its text can rise line-wise
    $$('.h2[data-reveal]').forEach(function (h) {
      if (h.querySelector('.line')) return;
      h.innerHTML = '<span class="line"><span>' + h.innerHTML + '</span></span>';
    });
    var els = $$('[data-reveal]');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- parallax (transform only) ---------- */
  function parallax() {
    if (reduce) return;
    var items = $$('[data-parallax]').map(function (el) { return { el: el, k: parseFloat(el.dataset.parallax) || 0.1, inner: el.classList.contains('hero__media') ? null : el.querySelector('img') }; });
    function update() {
      var vh = window.innerHeight;
      items.forEach(function (it) {
        var r = it.el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        if (it.inner) { // image inside a clipped wrapper: scaled 1.12, drift ±
          var p = (r.top + r.height / 2 - vh / 2) / vh;
          it.inner.style.transform = 'translate3d(0,' + (p * -it.k * 100).toFixed(2) + 'px,0) scale(1.12)';
        } else {        // hero: slow drift down as the page scrolls
          var y = Math.max(0, window.pageYOffset);
          it.el.style.transform = 'translate3d(0,' + (y * it.k).toFixed(2) + 'px,0)';
        }
      });
    }
    update(); onScroll(update); window.addEventListener('resize', update);
  }

  /* ---------- carousel UI (progress + counter) ---------- */
  function carousel() {
    var track = $('#cards'), thumb = $('#progressThumb'), cur = $('#counterCur'); if (!track || !thumb) return;
    var n = $$('.card', track).length;
    function update() {
      var max = track.scrollWidth - track.clientWidth;
      var p = max > 0 ? Math.min(1, Math.max(0, track.scrollLeft / max)) : 0;
      thumb.style.width = (100 / n) + '%';
      thumb.style.transform = 'translate3d(' + (p * (n - 1) * 100) + '%,0,0)';
      if (cur) cur.textContent = String(Math.round(p * (n - 1)) + 1);
    }
    var t = false;
    track.addEventListener('scroll', function () { if (!t) { t = true; requestAnimationFrame(function () { t = false; update(); }); } }, { passive: true });
    window.addEventListener('resize', update); update();
    track.addEventListener('keydown', function (e) {
      var step = track.clientWidth * 0.82;
      if (e.key === 'ArrowRight') { track.scrollBy({ left: step, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { track.scrollBy({ left: -step, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  }

  /* ---------- marquee: pause on touch ---------- */
  function marquee() {
    var m = $('[data-marquee]'); if (!m) return;
    var resume;
    m.addEventListener('touchstart', function () { clearTimeout(resume); m.classList.add('is-paused'); }, { passive: true });
    ['touchend', 'touchcancel'].forEach(function (ev) { m.addEventListener(ev, function () { resume = setTimeout(function () { m.classList.remove('is-paused'); }, 1500); }, { passive: true }); });
  }

  /* ---------- footer accordions (mobile) ---------- */
  function footer() {
    $$('.fcol').forEach(function (col) {
      var btn = $('button', col);
      btn.addEventListener('click', function () {
        if (desktopMQ.matches) return;
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        col.classList.toggle('is-open', !open);
      });
    });
    function sync() { $$('.fcol button').forEach(function (b) { b.tabIndex = desktopMQ.matches ? -1 : 0; if (desktopMQ.matches) b.setAttribute('aria-expanded', 'true'); else if (!b.closest('.fcol').classList.contains('is-open')) b.setAttribute('aria-expanded', 'false'); }); }
    desktopMQ.addEventListener('change', sync); sync();
  }

  /* ---------- products (edit here to change copy, prices, specs) ---------- */
  var PRODUCTS = {
    'meridian-40': { n: 1, alt: true, name: 'Meridian 40', dial: 'Noir sunburst dial', price: 12400, ref: 'CN-4010', badge: 'New',
      desc: 'The reference that defines the house. A deep noir sunburst dial, a chronograph layout kept deliberately quiet, and a 904L steel case polished and brushed by hand. Every Meridian is regulated to chronometer standard before it leaves Genève.',
      specs: [['Case', '40 mm · 904L steel'], ['Dial', 'Noir sunburst'], ['Movement', 'Calibre CN-01, automatic'], ['Power reserve', '72 hours'], ['Water resistance', '100 m'], ['Crystal', 'Sapphire, anti-reflective']] },
    'equinoxe-39': { n: 2, alt: true, name: 'Équinoxe 39', dial: 'Platinum dial', price: 14900, ref: 'CN-3910', badge: '',
      desc: 'A calm, silvered dial with layered sub-registers that catch the light only when the wrist turns. The Équinoxe is the most reserved of the four: steel on steel, with a fully brushed bracelet.',
      specs: [['Case', '39 mm · 904L steel'], ['Dial', 'Platinum, layered'], ['Movement', 'Calibre CN-01, automatic'], ['Power reserve', '72 hours'], ['Water resistance', '100 m'], ['Crystal', 'Sapphire, anti-reflective']] },
    'orbital-42': { n: 3, alt: false, name: 'Orbital 42', dial: 'Graphite dial', price: 18600, ref: 'CN-4220', badge: 'Limited · 250',
      desc: 'Our largest case and our rarest dial. A graphite finish with three recessed counters and a graduated bezel, produced in a single run of 250 numbered pieces, each signed on the case back by its watchmaker.',
      specs: [['Case', '42 mm · 904L steel'], ['Dial', 'Graphite, three counters'], ['Movement', 'Calibre CN-01, automatic'], ['Power reserve', '72 hours'], ['Water resistance', '100 m'], ['Edition', '250 numbered pieces']] },
    'solstice-38': { n: 4, alt: false, name: 'Solstice 38', dial: 'White lacquer dial', price: 11200, ref: 'CN-3810', badge: '',
      desc: 'The lightest of the family: a white lacquer dial, slim steel hands and a 38 mm case that sits close to the wrist. Quiet, precise and made to be worn every day.',
      specs: [['Case', '38 mm · 904L steel'], ['Dial', 'White lacquer'], ['Movement', 'Calibre CN-01, automatic'], ['Power reserve', '72 hours'], ['Water resistance', '100 m'], ['Crystal', 'Sapphire, anti-reflective']] }
  };
  function chf(v) { return 'CHF ' + v.toLocaleString('en-US'); }
  function pic(n, suffix, sizes, alt, eager) {
    var base = 'images/watch-' + n + suffix;
    return '<picture><source type="image/webp" srcset="' + base + '-640.webp 640w, ' + base + '-1080.webp 1080w, ' + base + '-1600.webp 1600w" sizes="' + sizes + '">' +
      '<img src="' + base + '.jpg" width="1600" height="2000" alt="' + alt + '" decoding="async"' + (eager ? '' : ' loading="lazy"') + '></picture>';
  }

  /* ---------- panels (bag drawer + product detail): focus trap, scroll lock, Esc ---------- */
  var current = null, returnTo = null;
  function openPanel(el, trigger) {
    if (current && current !== el) closePanel(true);
    if (!current) returnTo = trigger || document.activeElement;
    current = el; el.hidden = false; el.setAttribute('aria-hidden', 'false');
    root.classList.add('panel-open'); if (lenis) lenis.stop();
    requestAnimationFrame(function () { el.classList.add('is-open'); var c = $('.panel__head [data-close]', el); if (c) c.focus({ preventScroll: true }); });
  }
  function closePanel(silent) {
    var el = current; if (!el) return;
    el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true'); current = null;
    root.classList.remove('panel-open'); if (lenis && !root.classList.contains('menu-open')) lenis.start();
    setTimeout(function () { if (current !== el) el.hidden = true; }, 850);
    if (!silent && returnTo && returnTo.focus) returnTo.focus({ preventScroll: true });
    if (/^#p-/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
  }
  function panels() {
    document.addEventListener('click', function (e) { if (e.target.closest('[data-close]') && current) closePanel(); });
    document.addEventListener('keydown', function (e) {
      if (!current) return;
      if (e.key === 'Escape') { closePanel(); return; }
      if (e.key !== 'Tab') return;
      var f = $$('a[href], button:not([disabled]):not([tabindex="-1"])', current).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    window.addEventListener('hashchange', function () { var m = location.hash.match(/^#p-(.+)$/); if (m && PRODUCTS[m[1]]) openProduct(m[1]); });
    var m = location.hash.match(/^#p-(.+)$/); if (m && PRODUCTS[m[1]]) openProduct(m[1]);
  }

  /* ---------- product detail ---------- */
  function openProduct(slug, trigger) {
    var p = PRODUCTS[slug]; if (!p) return;
    var body = $('#pdp-body'), sizes = '(min-width:900px) 40vw, 100vw';
    body.innerHTML =
      '<div class="pdp__grid"><div class="pdp__media">' +
        '<figure>' + pic(p.n, '', sizes, p.name + ' — ' + p.dial, true) + '</figure>' +
        (p.alt ? '<figure>' + pic(p.n, '-alt', sizes, p.name + ' — detail view') + '</figure>' : '') +
      '</div><div class="pdp__info">' +
        '<p class="label">Ref. ' + p.ref + '</p>' +
        (p.badge ? '<span class="glass label pdp__badge">' + p.badge + '</span>' : '') +
        '<h2 class="h2" id="pdp-title">' + p.name + '</h2>' +
        '<p class="label">' + p.dial + '</p>' +
        '<p class="price pdp__price">' + chf(p.price) + '</p>' +
        '<p class="body">' + p.desc + '</p>' +
        '<button class="btn btn--solid" type="button" data-add="' + slug + '">Add to bag</button>' +
        '<dl class="spec-table">' + p.specs.map(function (s) { return '<div><dt>' + s[0] + '</dt><dd>' + s[1] + '</dd></div>'; }).join('') + '</dl>' +
        '<div class="pdp__perks label"><span>Complimentary insured shipping</span><span>Five-year international warranty</span></div>' +
      '</div></div>';
    body.scrollTop = 0;
    history.replaceState(null, '', '#p-' + slug);
    openPanel($('#pdp'), trigger);
  }

  /* ---------- bag (persists in localStorage) ---------- */
  var items = [];
  try { items = JSON.parse(localStorage.getItem('cn-bag') || '[]').filter(function (i) { return PRODUCTS[i.slug] && i.qty > 0; }); } catch (e) { items = []; }
  function saveBag() { try { localStorage.setItem('cn-bag', JSON.stringify(items)); } catch (e) {} }
  function bagCount() { return items.reduce(function (s, i) { return s + i.qty; }, 0); }
  function renderBag(msg) {
    var count = bagCount();
    $('#bagCount').textContent = count;
    $('.icon-btn--bag').setAttribute('aria-label', 'Bag, ' + count + (count === 1 ? ' item' : ' items'));
    var body = $('#bag-body'), foot = $('#bag-foot');
    if (!items.length) {
      body.innerHTML = '<div class="bag-empty"><svg aria-hidden="true"><use href="#i-bag"/></svg><p class="t">Your bag is empty.</p><p>Four references are waiting in the collection.</p><a class="btn btn--glass" href="#collection" data-close>Discover the collection</a></div>';
      foot.innerHTML = ''; return;
    }
    var total = 0;
    body.innerHTML = '<ul class="bag-list">' + items.map(function (i) {
      var p = PRODUCTS[i.slug]; total += p.price * i.qty;
      return '<li class="bag-item"><img src="images/watch-' + p.n + '-640.webp" width="76" height="95" alt="">' +
        '<div><h3>' + p.name + '</h3><p class="label">' + p.dial + '</p>' +
        '<div class="qty" role="group" aria-label="Quantity of ' + p.name + '"><button type="button" data-dec="' + i.slug + '" aria-label="Decrease quantity">−</button><span aria-live="polite">' + i.qty + '</span><button type="button" data-inc="' + i.slug + '" aria-label="Increase quantity">+</button></div></div>' +
        '<div class="bag-item__r"><p class="price">' + chf(p.price * i.qty) + '</p><button class="rm" type="button" data-rm="' + i.slug + '" aria-label="Remove ' + p.name + '">Remove</button></div></li>';
    }).join('') + '</ul>';
    foot.innerHTML = '<div class="sum"><span class="label">Subtotal</span><span class="price">' + chf(total) + '</span></div>' +
      '<p class="foot-note">Insured worldwide shipping is complimentary. Taxes are calculated at checkout.</p>' +
      '<button class="btn btn--solid" type="button" data-checkout>Checkout</button>' +
      '<p class="foot-note foot-note--msg" role="status">' + (msg || '') + '</p>';
  }
  function addItem(slug) {
    var f = items.filter(function (i) { return i.slug === slug; })[0];
    if (f) f.qty = Math.min(9, f.qty + 1); else items.push({ slug: slug, qty: 1 });
    saveBag(); renderBag();
  }
  function bag() {
    renderBag();
    document.addEventListener('click', function (e) {
      var t = e.target, el;
      if ((el = t.closest('[data-add]'))) { e.preventDefault(); addItem(el.dataset.add); openPanel($('#bag'), el); return; }
      if ((el = t.closest('[data-open-bag]'))) { openPanel($('#bag'), el); return; }
      if ((el = t.closest('[data-inc]'))) { addItem(el.dataset.inc); return; }
      if ((el = t.closest('[data-dec]'))) {
        var f = items.filter(function (i) { return i.slug === el.dataset.dec; })[0];
        if (f) { f.qty--; items = items.filter(function (i) { return i.qty > 0; }); saveBag(); renderBag(); }
        return;
      }
      if ((el = t.closest('[data-rm]'))) { items = items.filter(function (i) { return i.slug !== el.dataset.rm; }); saveBag(); renderBag(); return; }
      if (t.closest('[data-checkout]')) { renderBag('Checkout is not connected in this demo.'); }
    });
  }

  /* ---------- newsletter ---------- */
  function newsletter() {
    var f = $('#nl'), input = $('#nl-email'), msg = $('#nl-msg'), ok = $('#nl-ok'); if (!f) return;
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    function err(t) { msg.textContent = t; input.setAttribute('aria-invalid', 'true'); input.focus(); }
    input.addEventListener('input', function () { msg.textContent = ''; input.removeAttribute('aria-invalid'); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v) return err('Please enter your email address.');
      if (!re.test(v)) return err('That address does not look right. Please check it and try again.');
      /* ------------------------------------------------------------------
         PLUG A BACKEND HERE: POST { email: v } to your provider
         (Mailchimp, Brevo, Formspree, a serverless function, ...).
         Show the success state only after the request resolves.
         ------------------------------------------------------------------ */
      f.hidden = true; ok.hidden = false; ok.setAttribute('tabindex', '-1'); ok.focus({ preventScroll: true });
    });
  }

  /* ---------- custom cursor + magnetic buttons (fine pointers only) ---------- */
  function cursor() {
    if (!finePointer || reduce) return;
    var c = $('#cursor'); if (!c) return;
    root.classList.add('has-cursor');
    var x = -100, y = -100, cx = x, cy = y;
    window.addEventListener('mousemove', function (e) { x = e.clientX; y = e.clientY; c.classList.add('is-on'); }, { passive: true });
    document.addEventListener('mouseleave', function () { c.classList.remove('is-on'); });
    (function loop() { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; c.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)'; requestAnimationFrame(loop); })();
    document.addEventListener('mouseover', function (e) {
      var t = e.target; c.classList.toggle('is-view', !!t.closest('[data-cursor="View"]') && !t.closest('.add'));
      c.classList.toggle('is-link', !!t.closest('a, button, input') && !t.closest('[data-cursor="View"]') || !!t.closest('.add'));
    });
    $$('[data-magnetic]').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate3d(' + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + 'px,0)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- smooth scroll (Lenis, desktop only; native on touch) ---------- */
  function smoothScroll() {
    if (!finePointer || reduce || typeof window.Lenis === 'undefined') return;
    try {
      lenis = new window.Lenis({ duration: 1.2, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
      root.classList.add('lenis', 'lenis-smooth');
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
      lenis.on('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(runScroll); } });
    } catch (e) { lenis = null; }
  }
  // anchor links (works with or without Lenis)
  function anchors() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]'); if (!a) return;
      var id = a.getAttribute('href'); if (id.length < 2) return;
      var pm = id.match(/^#p-(.+)$/);
      if (pm && PRODUCTS[pm[1]]) { e.preventDefault(); openProduct(pm[1], a); return; }
      var t = $(id); if (!t) return;
      e.preventDefault();
      var go = function () {
        if (lenis) lenis.scrollTo(t, { offset: -60, duration: 1.6 });
        else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', id);
      };
      if (root.classList.contains('menu-open')) setTimeout(go, 80); else go();
    });
  }

  /* ---------- boot ---------- */
  function ready() { root.classList.add('is-ready'); }
  announce(); header(); menu(); reveals(); parallax(); carousel(); marquee(); footer(); bag(); panels(); newsletter(); cursor(); anchors();
  smoothScroll();
  preloader(ready);
  window.addEventListener('load', function () { if (!lenis) smoothScroll(); }); // Lenis CDN may land after DOMContentLoaded
})();
