# Broton Verde — Light mode design specification

The light theme of brotonverde.com. Everything below is what `css/styles.css` implements under
`html[data-theme="light"]`; use it to reproduce the look in other material (decks, brochures,
the code app) or to brief a designer.

---

## 1. Logo

The logo is a **wordmark only**. No leaf, no tile, no symbol.

| Part | Face | Weight | Colour (light mode) |
|---|---|---|---|
| `Broton` | Inter Tight | 700 (Bold) | Navy `#151F2D` |
| `Verde` | Inter Tight | 700 (Bold) | Lime `#C4D93E` |

- Letter-spacing **−0.035em**, one space between the two words, no italic.
- Sizes in use: nav **32px** (desktop), **26px** (phone); availability sheet header 17px;
  footer display **clamp(52px, 12vw, 180px)** with letter-spacing −0.05em, line-height 0.92.
- Dark-mode variant: `Broton` white `#FFFFFF`, `Verde` lime `#C4D93E`. The lime never changes.
- Clear space: at least the height of the capital B on every side.
- Never recolour Verde, never place the wordmark over busy photography without a frosted or
  solid panel behind it.

HTML used on the site:

```html
<a class="nav__brand" href="#top">Broton <em>Verde</em></a>
```
```css
.nav__brand{font-family:"Inter Tight";font-weight:700;font-size:32px;letter-spacing:-.035em;color:#151F2D}
.nav__brand em{font-style:normal;color:#C4D93E}
```

---

## 2. Colour tokens

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#F5F3EC` | Page ground (warm paper) |
| `--bg-2` | `#FFFFFF` | Cards, table, form |
| `--bg-3` | `#EEEBE2` | Quiet bands (catalogue, logistics, footer) |
| `--ink` | `#151F2D` | Headings, primary text, wordmark (navy) |
| `--ink-2` | `#3E4A55` | Body text |
| `--mute` | `#7B8590` | Labels, captions, secondary |
| `--line` | `rgba(21,31,45,.10)` | Hairlines |
| `--line-2` | `rgba(21,31,45,.18)` | Stronger rules, ghost-button borders |
| `--green` | `#2F6B3C` | Primary button (moss) |
| `--green-2` | `#3D8B40` | Italic accents in headings, links, chart lines |
| `--lime` | `#C4D93E` | Brand lime: Verde in the wordmark, selection colour |
| `--lime-ink` | `#7F9228` | Lime that reads as text on paper (card kickers) |
| `--glass` | `rgba(255,255,255,.55)` | Frosted panel fill |
| `--glass-2` | `rgba(255,255,255,.72)` | Frosted card fill |
| `--glass-line` | `rgba(255,255,255,.75)` | Frosted panel border |

Shadows: `--shadow: 0 30px 60px -30px rgba(21,31,45,.35)` on cards;
`--shadow-2: 0 50px 90px -40px rgba(21,31,45,.45)` on the hero frame and sheet.

Rule of thumb: navy carries the words, moss carries the actions, lime is reserved for the
brand and for small accents. Lime is never used as large text on paper.

---

## 3. Typography

| Role | Face | Weight / style | Size |
|---|---|---|---|
| Display (H1, H2) | Fraunces, optical size 144 | 300 Light; accents *300 Italic* in `--green-2` | H1 clamp(42px, 5.6vw, 82px) · H2 clamp(36px, 4.6vw, 64px) |
| Section and card titles (H3) | Fraunces | 400 | clamp(20–32px) |
| Body | Inter Tight | 300 | 17px, line-height 1.55 |
| Lead paragraph | Inter Tight | 300 | clamp(16px, 1.2vw, 19px), colour `--ink-2`, max 56 characters |
| Labels, eyebrows, table heads | IBM Plex Mono | 500 | 11px, uppercase, letter-spacing 0.14em, colour `--mute` |
| Buttons, nav | Inter Tight | 500 / 400 | 15px / 14px |
| Wordmark | Inter Tight | 700 | see §1 |

Display headings use letter-spacing −0.02em and line-height 1.02. Body copy stays under
roughly 60 characters per line. Every H2 has one italic green phrase; no more than one.

Google Fonts import:

```
https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=Inter+Tight:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap
```

---

## 4. Surfaces and glass

- Frosted panels: `background: rgba(255,255,255,.55); backdrop-filter: blur(18px) saturate(1.2);
  border: 1px solid rgba(255,255,255,.75)`. Used on the nav bar (once scrolled), the "why us"
  cards, material cards, the flight map, the availability sheet and the form.
- Under 900px the blur is switched off and the fill becomes `rgba(255,255,255,.72)` for performance.
- Corner radius **22px** on cards and frames, 16px on catalogue tiles, 999px on pills and buttons.
- Hero backdrop: the nursery aisle photo blurred 14px, desaturated, at 26% opacity, faded to
  `--bg` at top and bottom. The hero photo itself sits in a 22px-radius frame with a 1px
  white border and a thin dark caption strip along its bottom edge. Nothing overlays the photo.

---

## 5. Components

**Buttons**
- Primary: moss `#2F6B3C` fill, white text, pill, 14px 22px padding, soft green shadow, lifts 2px on hover.
- Ghost: transparent, 1px `--line-2` border, fills white on hover.
- Link: text only in `--ink-2` with an arrow that slides 4px on hover.

**Nav**: fixed, transparent over the hero; frosted bar once scrolled; hides on scroll down, returns on scroll up. Wordmark left, five links centre, "DARK VERSION" text link and the primary button right.

**Eyebrow + heading pattern**: mono label in `--mute`, then a two-line Fraunces heading whose second line is italic green, then a lead paragraph on the right on desktop.

**Stat**: mono label, Fraunces 300 figure clamp(28–40px), one-line description in `--ink-2`.

**Catalogue tile** (`.pcard`): 16px radius, `--bg-3` media area with a faint lime radial glow behind the cut-out plant photo; body on white with Fraunces name, italic Latin name in `--mute`, three mono-labelled specs.

**Group row** (`.grow`): numbered row with thumbnail, Fraunces group name with italic Latin name, one-line note, line count, and a circular plus that becomes a navy minus when open. Opening one closes the others.

**Grade chip**: white pill, 1px hairline, Fraunces 17px, green mono index (01–07).

**Size card** (`.scard`): white, 16px radius, square grid photo, Fraunces name, green "L&E" figure.

**Availability sheet**: white frosted card tilted 5° / −7° on desktop (flat on phones), mono table heads, tabular figures right-aligned, wordmark top right.

**Form**: frosted card, underline inputs that turn green on focus, pill checkboxes that fill moss when checked.

---

## 6. Motion

All animation is one-shot. An element animates once when it enters the viewport and then
rests in its final state; nothing is bound to scroll position.

- Headings: lines rise from below a mask, 1.2s, `power4.out`, staggered 0.1s.
- Blocks: fade and rise 22px, 1s.
- Counters: count up over 1.6s.
- Flight routes: stroke draws over 1.8s when the card enters, second route 0.25s later.
- Hero photo: the only continuous effect, a slow vertical drift of the image inside its frame.
- Smooth scrolling via Lenis (lerp 0.09). Respects `prefers-reduced-motion`: everything renders static.

---

## 7. Spacing and grid

- Content width `min(1400px, 100% − 2 × gutter)`, gutter `clamp(20px, 4vw, 72px)`.
- Section padding `clamp(64px, 8vw, 112px)` top and bottom.
- Two-column sections split 5/7 or 6/6 with a `clamp(30px, 5vw, 80px)` gap.
- Card grids: 4 columns (why us, catalogue), 3 columns (material), gap 14–16px.
- Breakpoints: 1100px (grids to 2 columns), 900px (single column, nav collapses to the burger menu, blur off), 560px (type steps down).

---

## 8. Voice

Customer-facing and factual: what the buyer gets (line, grade, count, condition), how supply
behaves (weekly availability, stock beds on rotation, renewed mother stock), and how to order.
No process narrative, no internal names, no location beyond "Honduras". Headings are short
statements; the italic green phrase carries the promise.
