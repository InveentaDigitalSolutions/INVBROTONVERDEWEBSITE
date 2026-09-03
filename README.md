# Broton Verde — website

Marketing site for **Broton Verde** (AGRIGENTUM S.A.), an ornamental foliage nursery in
Aldea El Olvido, Santa Cruz de Yojoa, Honduras. The nursery sells **unrooted (URC) and
rooted (RC) cuttings as single units** — never pots or trays — and flies them out of
San Pedro Sula weekly.

Two versions to choose from, one source:

- `index.html` — **light** ("surgically clean" paper palette)
- `dark.html` — **dark** twin, generated from `index.html` by `node scripts/build.mjs` (never edit by hand)

Both share `css/styles.css` (theme tokens on `html[data-theme]`) and `js/main.js`.

## Stack

| Layer | Choice |
|---|---|
| Smooth scroll | [Lenis](https://github.com/darkroomengineering/lenis) 1.1 (jsDelivr) |
| Scroll animation | GSAP 3.12 + ScrollTrigger (cdnjs) |
| Type | Fraunces (display) · Inter Tight (text) · IBM Plex Mono (labels) — Google Fonts |
| Images | `assets/img/*.webp` with `.jpg` fallbacks, graded from the nursery's own photos |

Everything degrades to a static page when the CDN scripts fail or the visitor prefers
reduced motion.

## Brand

- **Shade** `#0A1410` ink green-black (the shade net) · **Cream** `#F2EFE6` · **Lime** `#C4D93E` (the app's lime-400)
  · **Moss** `#2F5A3F`
- Logo: wordmark only (no leaf tile, per the nursery) — bold Inter Tight, `Broton` in ink and
  `Verde` in green (`#3D8B40` light / `#C4D93E` dark).
- Signature element: the **day arc** at the top — a sun travels an arc as you scroll, with a dot
  per section (`[data-arc]`).

## Content rules (from the nursery)

- Location: country only ("Honduras"). No town, altitude, airport, bed or shadehouse names.
- Customer-facing copy: consistency of grades, availability, clean material, unrooted or rooted.
  No process talk (cut-off days, flights) beyond the logistics section.
- Animations are one-shot reveals; nothing is scrubbed to scroll position.

## Catalogue data

`data/catalog.json` is parsed from the 2026–27 foliage catalogue PDF (93 lines, 20 genera:
cutting type, published size, units per box, light, photos). `scripts/build.mjs` renders it
into the Pothos feature, the genus accordion, the sizes strip and the form chips between the
`@catalog` markers in `index.html`. Re-run the build after editing the JSON.

## Images

- Nursery photography: graded crops of Broton Verde's own photos (`assets/img/*.webp|jpg`).
- Variety, size and genus photos (`assets/img/catalog/`) are extracted from the catalogue PDF.
  The PDF states its images are the catalogue publisher's property, used by permission —
  confirm Broton Verde's right to publish them before launch.

## Run locally

```sh
python3 -m http.server 8080      # then open http://localhost:8080
```

## Verify

`scripts/verify.mjs` serves the site, scrolls through it at desktop / tablet / mobile,
screenshots every section and fails on horizontal overflow, console errors, broken
images or elements outside the viewport.

```sh
npm i -D playwright && npx playwright install chromium
node scripts/verify.mjs shots/ index.html   # or dark.html
```

## Things to change before going live

- `CONFIG.email` at the top of `js/main.js` and the address in the Contact section
  (currently `ventas@brotonverde.com`, a placeholder).
- The availability sheet figures are illustrative and say so on the card.
- **Placeholder figure in the hero stats**: "12 M cuttings a year" is a placeholder.
- European gateways (Amsterdam, Frankfurt) and North American ones (Miami, Houston, Los Angeles)
  are examples to confirm.
- Deploy: drop the folder on Netlify / Vercel / any static host. `node scripts/build.mjs` also
  writes `dist/brotonverde-light.html` and `dist/brotonverde-dark.html` (single files, images inlined).
