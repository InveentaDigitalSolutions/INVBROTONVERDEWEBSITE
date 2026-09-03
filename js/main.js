/* Broton Verde — scroll engine (shared by the light and dark pages)
   Lenis (smooth scroll) + GSAP ScrollTrigger. Degrades to a static page when the
   libraries fail to load or the visitor prefers reduced motion. */

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
    $$('.reveal-up').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    $$('.scrub-words .sw').forEach(w => w.style.opacity = 1);
    $$('[data-count]').forEach(el => el.textContent = el.dataset.count);
    $$('.growth__slide').forEach(s => s.classList.add('is-active'));
    setupNav(); setupForm(); setupMenu(null); setupGenera();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });

  /* ── Smooth scroll ───────────────────────────────────────── */
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTo = (target) => { if (lenis) lenis.scrollTo(target, { offset: -8, duration: 1.4 }); else target.scrollIntoView({ behavior: 'smooth' }); };

  /* ── Text splitting ──────────────────────────────────────── */
  const splitWords = (el, cls = 'sw') => {
    const text = el.textContent.trim().split(/\s+/); el.textContent = '';
    text.forEach((word, i) => { const s = document.createElement('span'); s.className = cls; s.textContent = word; el.appendChild(s); if (i < text.length - 1) el.appendChild(document.createTextNode(' ')); });
    return $$('.' + cls, el);
  };
  const splitChars = (el) => { const chars = el.textContent.split(''); el.textContent = ''; chars.forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; el.appendChild(s); }); return $$('.ch', el); };

  /* ── Hero intro (no preloader) ───────────────────────────── */
  const heroTitleLines = $$('.hero__title .split');
  const heroReveals = $$('.hero .reveal-up');
  gsap.set(heroTitleLines, { yPercent: 110 });
  gsap.set('.hero__frame', { autoAlpha: 0, y: 40, scale: 0.96 });
  gsap.set('.hero__card', { autoAlpha: 0, y: 30 });
  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .to(heroTitleLines, { yPercent: 0, duration: 1.4, stagger: 0.1 }, 0.1)
    .to('.hero__frame', { autoAlpha: 1, y: 0, scale: 1, duration: 1.6 }, 0.2)
    .to(heroReveals, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.3)
    .to('.hero__card', { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.15 }, 0.6)
    .from('.nav', { y: -16, autoAlpha: 0, duration: 1 }, 0.2);

  /* ── Hero parallax (scroll + pointer) ────────────────────── */
  const hero = $('#hero'), stage = $('#heroStage');
  $$('[data-depth]', stage).forEach(layer => gsap.to(layer, { y: () => parseFloat(layer.dataset.depth) * -140, ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true } }));
  gsap.to('.hero__bg', { y: 120, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  // Glass cards stay static: transforming a backdrop-filtered element every frame flickers.

  /* ── Generic reveals ─────────────────────────────────────── */
  $$('.reveal-up').forEach(el => { if (hero.contains(el)) return; gsap.to(el, { autoAlpha: 1, y: 0, duration: 1.1, scrollTrigger: { trigger: el, start: 'top 88%', once: true } }); });
  $$('.reveal-lines').forEach(h => { const lines = $$('.split', h); gsap.set(lines, { yPercent: 110 }); gsap.to(lines, { yPercent: 0, duration: 1.3, stagger: 0.12, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 85%', once: true } }); });
  $$('.scrub-words').forEach(p => { const words = splitWords(p); gsap.to(words, { opacity: 1, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 50%', scrub: 0.6 } }); });
  $$('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || '0', 10), obj = { v: 0 };
    gsap.to(obj, { v: target, duration: 1.8, ease: 'power2.out', onUpdate: () => { el.textContent = obj.v.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
  const skewTo = $$('.marquee__row').map(r => gsap.quickTo(r, 'skewX', { duration: 0.6, ease: 'power3' }));
  ScrollTrigger.create({ onUpdate: self => { const v = gsap.utils.clamp(-10, 10, self.getVelocity() / 160); skewTo.forEach(fn => fn(v)); } });

  /* ── Stacking cards ──────────────────────────────────────── */
  const stackCards = $$('[data-stack]');
  ScrollTrigger.matchMedia({
    '(min-width: 900px)': () => {
      stackCards.forEach((card, i) => {
        card.style.position = 'sticky'; card.style.top = (110 + i * 18) + 'px';
        const next = stackCards[i + 1]; if (!next) return;
        gsap.to(card, { scale: 0.95, filter: 'brightness(0.88)', ease: 'none', scrollTrigger: { trigger: next, start: 'top 70%', end: 'top 130px', scrub: true } });
      });
    },
    '(max-width: 899px)': () => { stackCards.forEach(card => { card.style.position = ''; card.style.top = ''; gsap.set(card, { clearProps: 'scale,filter' }); }); }
  });

  /* ── Growth: pinned crossfade ────────────────────────────── */
  const growth = $('#growth'), slides = $$('.growth__slide'), caps = $$('.growth__cap'), gbar = $('#growthBar');
  if (growth) {
    const n = slides.length;
    const setStep = (i) => { slides.forEach((s, k) => s.classList.toggle('is-active', k === i)); caps.forEach((c, k) => c.classList.toggle('is-active', k === i)); };
    slides.forEach((s, k) => gsap.set(s, { opacity: k === 0 ? 1 : 0 }));
    ScrollTrigger.create({ trigger: growth, pin: '#growthPin', start: 'top top', end: () => '+=' + innerHeight * (n - 1) * 0.9, scrub: true, anticipatePin: 1,
      onUpdate: self => { const p = self.progress * (n - 1); slides.forEach((s, k) => { const d = Math.abs(p - k); gsap.set(s, { opacity: gsap.utils.clamp(0, 1, 1.2 - d), scale: 1 + (p - k) * 0.03 }); }); setStep(Math.round(p)); gbar.style.width = (self.progress * 100) + '%'; } });
  }

  /* ── Catalogue: featured cards + genus accordion ─────────── */
  ScrollTrigger.batch('.pcard', { start: 'top 92%', once: true, onEnter: b => gsap.to(b, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.9 }) });
  gsap.set('.pcard', { autoAlpha: 0, y: 30 });
  ScrollTrigger.batch('.grow', { start: 'top 92%', once: true, onEnter: b => gsap.to(b, { autoAlpha: 1, x: 0, stagger: 0.05, duration: 0.8 }) });
  gsap.set('.grow', { autoAlpha: 0, x: -20 });
  setupGenera();

  /* ── Sizes: pinned horizontal strip ──────────────────────── */
  const sizes = $('#sizes'), sizesTrack = $('#sizesTrack');
  ScrollTrigger.matchMedia({
    '(min-width: 900px)': () => {
      const dist = () => sizesTrack.scrollWidth - innerWidth;
      const tween = gsap.to(sizesTrack, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: sizes, pin: true, scrub: 1, start: 'top top', end: () => '+=' + dist() * 1.05, invalidateOnRefresh: true, anticipatePin: 1 } });
      $$('.scard', sizesTrack).forEach(c => gsap.from(c, { y: 40, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 95%', once: true } }));
      return () => gsap.set(sizesTrack, { clearProps: 'x' });
    },
    '(max-width: 899px)': () => { gsap.set(sizesTrack, { clearProps: 'x' }); }
  });

  /* ── The nursery: reveal + parallax ──────────────────────── */
  const placeReveal = $('#placeReveal');
  ScrollTrigger.matchMedia({ '(min-width: 900px)': () => {
    gsap.fromTo(placeReveal, { clipPath: 'inset(0 var(--gutter) 0 var(--gutter) round 28px)' }, { clipPath: 'inset(0 0px 0 0px round 0px)', ease: 'none', scrollTrigger: { trigger: placeReveal, start: 'top 80%', end: 'top 10%', scrub: true } });
  } });
  gsap.fromTo('.place__photo', { y: '-8%' }, { y: '8%', ease: 'none', scrollTrigger: { trigger: placeReveal, start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.place__photo img', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: placeReveal, start: 'top bottom', end: 'center center', scrub: true } });

  /* ── Process ─────────────────────────────────────────────── */
  gsap.to('#tlPath', { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: 0.5 } });
  $$('.step').forEach(step => {
    const media = $('.step__media', step), image = $('img', media), text = $('.step__text', step);
    gsap.fromTo(image, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: step, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from(media, { clipPath: 'inset(12% 8% 12% 8% round 24px)', scale: 0.96, duration: 1.4, scrollTrigger: { trigger: step, start: 'top 80%', once: true } });
    gsap.from(text.children, { y: 30, autoAlpha: 0, stagger: 0.1, duration: 1, scrollTrigger: { trigger: step, start: 'top 75%', once: true } });
  });

  /* ── Two flight routes ───────────────────────────────────── */
  [['#routeNA', '#planeNA'], ['#routeEU', '#planeEU']].forEach(([r, p], i) => {
    const arc = $(r), plane = $(p); if (!arc || !plane) return;
    const len = arc.getTotalLength(); arc.style.strokeDasharray = len; arc.style.strokeDashoffset = len;
    const st = { p: 0 };
    gsap.to(st, { p: 1, ease: 'none', scrollTrigger: { trigger: '.flight', start: 'top 85%', end: 'bottom 40%', scrub: 0.8 }, delay: i * 0.1,
      onUpdate: () => { arc.style.strokeDashoffset = len * (1 - st.p); const pt = arc.getPointAtLength(len * st.p), pt2 = arc.getPointAtLength(Math.min(len, len * st.p + 2)); plane.setAttribute('transform', `translate(${pt.x} ${pt.y}) rotate(${Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI})`); } });
  });

  /* ── Sheet + finale + footer ─────────────────────────────── */
  const sheet = $('#sheet');
  gsap.fromTo('.sheet__card', { y: 60, rotateX: 14, rotateY: -14 }, { y: -40, rotateX: 4, rotateY: -6, ease: 'none', scrollTrigger: { trigger: sheet, start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.sheet__chip--a', { y: 30 }, { y: -24, ease: 'none', scrollTrigger: { trigger: sheet, start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.sheet__chip--b', { y: 60 }, { y: -30, ease: 'none', scrollTrigger: { trigger: sheet, start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.finale__photo', { y: '-8%' }, { y: '8%', ease: 'none', scrollTrigger: { trigger: '.finale', start: 'top bottom', end: 'bottom top', scrub: true } });
  const chars = $$('.footer__big .split-chars').flatMap(splitChars);
  gsap.set(chars, { yPercent: 110 });
  gsap.to(chars, { yPercent: 0, duration: 1.2, stagger: 0.03, ease: 'power4.out', scrollTrigger: { trigger: '.footer__big', start: 'top 92%', once: true } });

  /* ── Nav adapts over light sections (dark page) ──────────── */
  $$('.section--alt').forEach(sec => ScrollTrigger.create({ trigger: sec, start: 'top 60px', end: 'bottom 60px', toggleClass: { targets: '#nav', className: 'is-light' } }));

  /* ── Wiring ──────────────────────────────────────────────── */
  setupNav(); setupMenu(scrollTo); setupForm();
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
  /* Genus rows open one at a time; panel height animates via max-height. */
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
      const lines = [`Name: ${get('name')}`, `Company: ${get('company')}`, `Email: ${get('email')}`, `Country: ${get('country')}`, `Cutting type: ${fd.getAll('material').join(', ') || '—'}`, `Genera: ${fd.getAll('genus').join(', ') || '—'}`, '', get('message')];
      window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(`Availability request — ${get('company') || get('name')}`)}&body=${encodeURIComponent(lines.join('\n'))}`;
      hint.textContent = 'OPENING YOUR MAIL CLIENT…';
    });
  }
})();
