/* Broton Verde — scroll engine (shared by the light and dark pages)
   Every animation is one-shot: it plays once when its element enters the viewport and
   then rests in its final state. Nothing is tied to scroll position, so there is never a
   half-way frame. Smooth scrolling via Lenis; GSAP for the reveals. */

(() => {
  const CONFIG = { email: 'ventas@brotonverde.com' };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  $('#year').textContent = new Date().getFullYear();

  /* ── Static fallback ─────────────────────────────────────── */
  if (!hasGsap || reduce) {
    document.body.classList.add('no-motion');
    $$('.reveal-up, .pcard, .grow').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    $$('[data-count]').forEach(el => el.textContent = el.dataset.count);
    setupNav(); setupForm(); setupMenu(null); setupGenera();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });

  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTo = (target) => { if (lenis) lenis.scrollTo(target, { offset: -8, duration: 1.2 }); else target.scrollIntoView({ behavior: 'smooth' }); };
  const splitChars = (el) => { const chars = el.textContent.split(''); el.textContent = ''; chars.forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; el.appendChild(s); }); return $$('.ch', el); };

  /* ── Hero intro ──────────────────────────────────────────── */
  const heroTitleLines = $$('.hero__title .split');
  gsap.set(heroTitleLines, { yPercent: 110 });
  gsap.set('.hero__frame', { autoAlpha: 0, y: 30, scale: 0.97 });
  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .to(heroTitleLines, { yPercent: 0, duration: 1.3, stagger: 0.1 }, 0.05)
    .to('.hero__frame', { autoAlpha: 1, y: 0, scale: 1, duration: 1.5 }, 0.15)
    .to('.hero .reveal-up', { autoAlpha: 1, y: 0, duration: 1, stagger: 0.07 }, 0.25)
    .from('.nav', { y: -16, autoAlpha: 0, duration: 0.9 }, 0.1);
  // the only continuous effect: a gentle drift of the hero photo, always fully visible
  gsap.to('#heroFrame img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ── One-shot reveals ────────────────────────────────────── */
  $$('.reveal-up').forEach(el => { if ($('#hero').contains(el)) return; gsap.to(el, { autoAlpha: 1, y: 0, duration: 1, scrollTrigger: { trigger: el, start: 'top 90%', once: true } }); });
  $$('.reveal-lines').forEach(h => { const lines = $$('.split', h); gsap.set(lines, { yPercent: 110 }); gsap.to(lines, { yPercent: 0, duration: 1.2, stagger: 0.1, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 88%', once: true } }); });
  $$('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || '0', 10), obj = { v: 0 };
    gsap.to(obj, { v: target, duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = obj.v.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });
  gsap.set('.pcard', { autoAlpha: 0, y: 24 });
  ScrollTrigger.batch('.pcard', { start: 'top 95%', once: true, onEnter: b => gsap.to(b, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.8 }) });
  gsap.set('.grow', { autoAlpha: 0, x: -16 });
  ScrollTrigger.batch('.grow', { start: 'top 95%', once: true, onEnter: b => gsap.to(b, { autoAlpha: 1, x: 0, stagger: 0.05, duration: 0.7 }) });
  gsap.set('.scard', { autoAlpha: 0, y: 24 });
  ScrollTrigger.batch('.scard', { start: 'top 95%', once: true, onEnter: b => gsap.to(b, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.8 }) });

  /* Flight routes draw once when the card enters */
  const routes = [['#routeNA', '#planeNA'], ['#routeEU', '#planeEU']].map(([r, p]) => ({ arc: $(r), plane: $(p) })).filter(x => x.arc && x.plane);
  routes.forEach(({ arc }) => { const len = arc.getTotalLength(); arc.style.strokeDasharray = len; arc.style.strokeDashoffset = len; });
  ScrollTrigger.create({ trigger: '.flight', start: 'top 85%', once: true, onEnter: () => {
    routes.forEach(({ arc, plane }, i) => {
      const len = arc.getTotalLength(), st = { p: 0 };
      gsap.to(st, { p: 1, duration: 1.8, delay: i * 0.25, ease: 'power2.inOut', onUpdate: () => {
        arc.style.strokeDashoffset = len * (1 - st.p);
        const pt = arc.getPointAtLength(len * st.p), pt2 = arc.getPointAtLength(Math.min(len, len * st.p + 2));
        plane.setAttribute('transform', `translate(${pt.x} ${pt.y}) rotate(${Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI})`);
      } });
    });
  } });

  const chars = $$('.footer__big .split-chars').flatMap(splitChars);
  gsap.set(chars, { yPercent: 110 });
  gsap.to(chars, { yPercent: 0, duration: 1.1, stagger: 0.03, ease: 'power4.out', scrollTrigger: { trigger: '.footer__big', start: 'top 95%', once: true } });

  /* Nav adapts over light sections of the dark page */
  $$('.section--alt').forEach(sec => ScrollTrigger.create({ trigger: sec, start: 'top 60px', end: 'bottom 60px', toggleClass: { targets: '#nav', className: 'is-light' } }));

  setupNav(); setupMenu(scrollTo); setupForm(); setupGenera();
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const id = a.getAttribute('href'); if (id.length < 2) return; const t = $(id); if (!t) return; e.preventDefault(); scrollTo(t); }));
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());

  /* ── helpers ─────────────────────────────────────────────── */
  function setupNav() {
    const nav = $('#nav'); let last = 0;
    const onScroll = (y) => { nav.classList.toggle('is-scrolled', y > 40); nav.classList.toggle('is-hidden', y > 600 && y > last + 4 && !$('#menu').classList.contains('is-open')); if (y < last - 4 || y < 600) nav.classList.remove('is-hidden'); last = y; };
    if (hasGsap && !reduce) ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => onScroll(self.scroll()) });
    else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
    onScroll(window.scrollY);
  }
  function setupMenu(scroller) {
    const burger = $('#burger'), menu = $('#menu');
    const close = () => { burger.setAttribute('aria-expanded', 'false'); menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true'); };
    burger.addEventListener('click', () => { const open = burger.getAttribute('aria-expanded') !== 'true'; burger.setAttribute('aria-expanded', String(open)); menu.classList.toggle('is-open', open); menu.setAttribute('aria-hidden', String(!open)); });
    $$('a', menu).forEach(a => a.addEventListener('click', e => { close(); const t = $(a.getAttribute('href')); if (t && scroller) { e.preventDefault(); setTimeout(() => scroller(t), 250); } }));
  }
  function setupGenera() {
    const rows = $$('.grow');
    rows.forEach(row => {
      const head = $('.grow__head', row), panel = $('.grow__panel', row);
      head.addEventListener('click', () => {
        const open = !row.classList.contains('is-open');
        rows.forEach(r => { r.classList.remove('is-open'); $('.grow__head', r).setAttribute('aria-expanded', 'false'); $('.grow__panel', r).style.maxHeight = '0px'; });
        if (open) { row.classList.add('is-open'); head.setAttribute('aria-expanded', 'true'); panel.style.maxHeight = panel.scrollHeight + 'px'; }
        if (hasGsap && !reduce) setTimeout(() => ScrollTrigger.refresh(), 450);
      });
    });
  }
  function setupForm() {
    const form = $('#form'), hint = $('#formHint');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(form), get = k => (fd.get(k) || '').toString().trim();
      if (!get('name') || !get('email')) { hint.textContent = 'NAME AND EMAIL ARE REQUIRED'; return; }
      const lines = [`Name: ${get('name')}`, `Company: ${get('company')}`, `Email: ${get('email')}`, `Country: ${get('country')}`, `Material: ${fd.getAll('material').join(', ') || '—'}`, `Groups: ${fd.getAll('genus').join(', ') || '—'}`, '', get('message')];
      window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(`Availability request — ${get('company') || get('name')}`)}&body=${encodeURIComponent(lines.join('\n'))}`;
      hint.textContent = 'OPENING YOUR MAIL CLIENT…';
    });
  }
})();
