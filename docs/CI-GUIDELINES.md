# Broton Verde — Corporate identity guidelines

The visual identity as used on brotonverde.com (dark theme with light sections). This is the
reference for anything that carries the brand: the website, the nursery's own app, availability
sheets, decks, brochures, packaging labels and e-mail signatures.

---

## 1. Wordmark

The logo is a **wordmark only**: the two words `Broton Verde` set in Inter Tight Bold.
There is no symbol, no leaf, no tile.

| Part | Colour on dark | Colour on light | Face |
|---|---|---|---|
| `Broton` | White `#FFFFFF` | Navy `#151F2D` | Inter Tight 700 |
| `Verde` | Lime `#C4D93E` | Lime `#C4D93E` | Inter Tight 700 |

- Letter-spacing −0.035em (tight). One normal space between the words. Never italic, never
  all-caps, never a different weight for the two words.
- `Verde` is always lime. Only `Broton` changes with the background (white on dark, navy on light).
- Minimum size 18px on screen, 6mm cap height in print. Clear space around the mark of at
  least the height of the capital B.
- On photography, place the wordmark on a solid or frosted panel. Never directly over a busy image.
- On the white availability sheet the lime may be deepened to `#7F9228` so it reads on paper.

Sizes on the website: navigation 32px (desktop) / 26px (phone), footer display up to 180px,
availability sheet 17px.

```html
<span class="brand">Broton <em>Verde</em></span>
```
```css
.brand{font-family:"Inter Tight",sans-serif;font-weight:700;letter-spacing:-.035em;color:#FFFFFF}
.brand em{font-style:normal;color:#C4D93E}
```

---

## 2. Colour

### Brand colours

| Name | Hex | RGB | Use |
|---|---|---|---|
| **Shade** | `#0A1410` | 10 20 16 | Primary ground. The dark of the shade net. |
| **Navy** | `#151F2D` | 21 31 45 | Text on light surfaces; `Broton` on light. |
| **Lime** | `#C4D93E` | 196 217 62 | The brand accent: `Verde`, buttons and highlights on dark. |
| **Paper** | `#F5F3EC` | 245 243 236 | Light sections (catalogue, grades) and documents. |
| **Cream** | `#F2EFE6` | 242 239 230 | Text on dark. |

### Supporting colours

| Name | Hex | Use |
|---|---|---|
| Shade 2 | `#10201A` | Cards and panels on dark |
| Shade 3 | `#0E1B15` | Quiet bands on dark |
| Moss | `#2F6B3C` | Primary button on light surfaces |
| Green | `#3D8B40` | Italic accents, links and chart lines on light |
| Lime ink | `#7F9228` | Lime as small text on light surfaces |
| Ivory | `#EEEBE2` | Quiet light bands |
| White | `#FFFFFF` | Cards on light, the availability sheet |

### Text on dark (opacity steps of Cream)

| Role | Value |
|---|---|
| Headings, primary | `#F2EFE6` |
| Body | `rgba(242,239,230,.74)` |
| Labels, captions | `rgba(242,239,230,.46)` |
| Hairlines | `rgba(242,239,230,.12)` · stronger `.22` |

### Text on light (Navy steps)

| Role | Value |
|---|---|
| Headings, primary | `#151F2D` |
| Body | `#3E4A55` |
| Labels, captions | `#7B8590` |
| Hairlines | `rgba(21,31,45,.10)` · stronger `.18` |

### Rules

- Lime is an accent. It carries the second word of the wordmark, the primary button on dark,
  italic phrases in headings and small highlights. It is never a background for large areas of
  text and never used as body text on paper.
- On dark, buttons are lime with Shade text. On light, buttons are Moss with white text.
- Shade and Paper alternate by section. A light section on the dark site is a deliberate
  document-like moment (catalogue, grades, the availability sheet), not a random change.
- Contrast: every text/ground pair above meets WCAG AA at body size.

---

## 3. Typography

Three faces, each with one job.

| Role | Face | Weights | Notes |
|---|---|---|---|
| Display | **Fraunces** (optical size 144) | 300 Light, 300 Italic, 400 | Headlines and section titles. Letter-spacing −0.02em, line-height 1.02. One italic phrase per heading in Green (light) or Lime (dark). |
| Text and UI | **Inter Tight** | 300, 400, 500, 700 | Body 300 at 17px / 1.55. Buttons and navigation 500 / 400. Wordmark 700. |
| Labels and data | **IBM Plex Mono** | 400, 500 | 11px, uppercase, letter-spacing 0.14em. Eyebrows, table headings, captions, figures. |

Scale on the website:

| Element | Size |
|---|---|
| H1 | clamp(42px, 5.6vw, 82px) |
| H2 | clamp(36px, 4.6vw, 64px) |
| H3 | 24–32px |
| Lead paragraph | 16–19px, max 56 characters per line |
| Body | 17px |
| Small | 14–15px |
| Label | 11px mono |

Google Fonts import (all three faces):

```
https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=Inter+Tight:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap
```

Fallbacks: Fraunces → Iowan Old Style, Georgia. Inter Tight → Inter, system sans. Plex Mono →
system monospace.

---

## 4. Layout and surfaces

- Content width up to 1400px with a fluid gutter (20–72px). Sections have 64–112px of
  vertical padding; the site is deliberately short.
- Corner radius 22px on cards, frames and panels; 16px on catalogue tiles; full pill on buttons
  and chips.
- Frosted panels on dark: `rgba(16,32,26,.55)` fill, `blur(18px)` backdrop, 1px border
  `rgba(242,239,230,.14)`. On light: `rgba(255,255,255,.55)` fill, 1px border `rgba(255,255,255,.75)`.
  Blur is switched off on phones.
- Shadows are soft and long: `0 30px 60px -30px` at 35% (light) or 70% (dark).
- Two-column sections split 5/7 or 6/6. Card rows use 3 or 4 equal columns on desktop, 2 on
  tablet, 1 on phone.

---

## 5. Photography

- Real nursery photography only: stock beds, hanging baskets, shade net, aisles. No stock
  imagery, no illustrated leaves, no renders.
- Grade lightly: slight contrast, slightly desaturated, never oversaturated greens.
- Product photography for lines: plant cut-out on a neutral ground, or the cutting on the
  measuring grid. Square or 4:5.
- Never place text or UI elements over the main photograph; captions sit on a thin gradient
  strip along the bottom edge.
- No images that reveal location details, bed or house labels, vehicles or documents.

---

## 6. Motion

- Reveal once, then rest. Elements fade and rise 22px over about one second when they enter the
  viewport; headline lines rise from below a mask with a 0.1s stagger. Nothing is tied to scroll
  position; there are no pinned or scrubbed sections.
- One ambient effect at most per page (the slow drift of the hero photo).
- Respect `prefers-reduced-motion`: everything renders static.

---

## 7. Voice

- Customer-facing and factual. Talk about what the grower receives: line, grade, count,
  condition, availability, unrooted or rooted.
- Short declarative headings with one italic promise: *Foliage cuttings your programme* **can plan on.**
- Botanical names in italic (Fraunces Italic): *Epipremnum aureum*, *Sansevieria trifasciata*.
- Location is "Honduras". No town, altitude, airport, bed or house names, no internal codes.
- No talk of pots, trays or the nursery's internal process beyond what affects the buyer.
- Numbers as figures with thousands separators (24,000). Grades capitalised: Petit, Mini Petit,
  Small, Medium, California, Large, Extra Large.

---

## 8. Quick reference

```
Ground dark      #0A1410      Text on dark     #F2EFE6
Ground light     #F5F3EC      Text on light    #151F2D
Lime (brand)     #C4D93E      Moss (button)    #2F6B3C
Green (accent)   #3D8B40      Lime ink         #7F9228

Display   Fraunces 300 / 300 Italic
Text      Inter Tight 300 · 400 · 500
Labels    IBM Plex Mono 500, 11px, uppercase, +0.14em
Wordmark  Inter Tight 700, −0.035em, "Verde" in lime
Radius    22px cards · 16px tiles · pill buttons
```
