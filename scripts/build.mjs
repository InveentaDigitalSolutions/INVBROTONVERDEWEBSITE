/* Build:
   1. Renders the catalogue sections into index.html from data/catalog.json (between @catalog markers, idempotent).
   2. Writes dark.html, the dark twin of index.html (never edit it by hand).
   3. Writes dist/brotonverde-light.html and dist/brotonverde-dark.html — single files with CSS, JS and lite images inlined. */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cat = JSON.parse(await readFile(join(root, 'data/catalog.json'), 'utf8'));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const fmt = (n) => (n && /^\d+$/.test(String(n))) ? Number(n).toLocaleString('en-US') : (n || '—');
const img = (v, ...roles) => { for (const r of roles) if (v.images[r]) return 'assets/img/catalog/' + v.images[r]; return null; };

/* Genus notes — the nursery's own words, business-facing */
const GENUS = {
  Aglaonema: 'Slow, coloured foliage for low light. Tip cuttings.',
  Aphelandra: 'Striped leaves, yellow bracts. Bright, indirect light.',
  Asarum: 'Wild ginger. Thick, glossy leaves on a mounding plant.',
  Begonia: 'Maculata canes grow fast; rex types slower and finer.',
  Chlorophytum: 'Spider plant. Pups cascade, made for baskets.',
  Cordyline: 'Slow, long-lived colour for containers and patios.',
  Ctenanthe: 'Never-never plant. Upright, quick, bamboo-like.',
  Dieffenbachia: 'Lush, upright, one of the most-sold houseplants.',
  Episcia: 'Velvet olive and purple foliage, pink flowers, quick.',
  Fittonia: 'Nerve plant. Tiny cuttings, 12,000 to a box, very slow.',
  Hedera: 'English ivy. Hardy, quick, indoors or out.',
  Maranta: 'Prayer plant. Patterned leaves, trailing, slow.',
  Monstera: 'Split leaves on vining stems. Fast and large.',
  Nematanthus: 'Goldfish plant. Small flowers, baskets or small formats.',
  Peperomia: 'Diverse, slow and easy. Leaf and tip cuttings.',
  Philodendron: 'Heart-shaped, trailing, as easy as Pothos.',
  Pothos: 'Epipremnum. The volume programme; fastest lines Jade, Golden, Hawaiian.',
  Rhoeo: 'Oyster plant. Fast and easy, high light.',
  Scindapsus: 'Soft heart leaves with silver. Slow, trailing.',
  Tradescantia: 'Fast, easy, indoors and out. Baskets.'
};
const LIGHT = { 'Bright Indirect Sunlight': 'Bright indirect', 'Low-Medium light': 'Low–medium', 'Bright Light': 'Bright', 'Shade': 'Shade', 'Partial Shade': 'Partial shade', 'Full Sun': 'Full sun' };
const genera = [...new Set(cat.map(v => v.genus))];

/* Featured Pothos cards */
const pothos = cat.filter(v => v.genus === 'Pothos');
const pothosHtml = pothos.map(v => `
        <article class="pcard">
          <div class="pcard__media">
            <img class="pcard__pot" src="${img(v, 'pot', 'leaf', 'grid')}" alt="${esc(v.short)}" loading="lazy" />
            ${img(v, 'grid') ? `<img class="pcard__grid" src="${img(v, 'grid')}" alt="${esc(v.short)} cutting on the measuring grid" loading="lazy" />` : ''}
          </div>
          <div class="pcard__body">
            <div class="pcard__row"><h4>${esc(v.short)}</h4><span class="tag">${esc(v.product)}</span></div>
            <p class="latin">${esc(v.latin)}</p>
            <p class="pcard__desc">${esc((v.bullets[0] || '').replace(/^Also commonly known as/i, 'Also known as'))}</p>
            <dl class="pcard__specs"><div><dt>Size</dt><dd>${esc(v.size_in)} · ${esc(v.size_cm)}</dd></div><div><dt>Per box</dt><dd>${fmt(v.units_per_box)}</dd></div><div><dt>Light</dt><dd>${esc(v.light.map(l => LIGHT[l] || l).slice(0, 2).join(', ') || '—')}</dd></div></dl>
          </div>
        </article>`).join('');

/* Genus accordion */
const generaHtml = genera.map((g, i) => {
  const vs = cat.filter(v => v.genus === g);
  const types = [...new Set(vs.map(v => v.product))].join(' · ');
  const hero = vs.find(v => v.images.pot) || vs[0];
  const sizes = vs.map(v => v.size_in).filter(Boolean);
  const chips = vs.map(v => `
          <div class="vchip">
            <img src="${img(v, 'pot', 'leaf', 'grid')}" alt="" loading="lazy" />
            <div><b>${esc(v.short)}</b><span>${esc(v.product)} · ${esc(v.size_in)} · ${fmt(v.units_per_box)} per box</span></div>
          </div>`).join('');
  return `
      <div class="grow" data-genus="${esc(g)}">
        <button class="grow__head" aria-expanded="false">
          <span class="grow__n mono">${String(i + 1).padStart(2, '0')}</span>
          <img class="grow__thumb" src="${img(hero, 'pot', 'leaf', 'grid')}" alt="" loading="lazy" />
          <span class="grow__name">${esc(g)}${g === 'Pothos' ? ' <em>Epipremnum</em>' : g === 'Hedera' ? ' <em>Ivy</em>' : ''}</span>
          <span class="grow__desc">${esc(GENUS[g] || '')}</span>
          <span class="grow__meta"><b>${vs.length}</b> ${vs.length === 1 ? 'line' : 'lines'}<i>${esc(types)}</i></span>
          <span class="grow__plus" aria-hidden="true"></span>
        </button>
        <div class="grow__panel"><div class="grow__inner">${chips}</div></div>
      </div>`;
}).join('');

/* Sizes strip: all Pothos with a grid photo, then one representative per other genus */
const withGrid = cat.filter(v => v.images.grid);
const sizeItems = [...withGrid.filter(v => v.genus === 'Pothos'), ...genera.filter(g => g !== 'Pothos').map(g => withGrid.find(v => v.genus === g)).filter(Boolean)];
const sizesHtml = sizeItems.map(v => `
    <figure class="scard">
      <div class="scard__media"><img src="${img(v, 'grid')}" alt="${esc(v.name)} cutting on the measuring grid" loading="lazy" /></div>
      <figcaption>
        <div class="scard__row"><b>${esc(v.genus === 'Pothos' ? v.short : v.short)}</b><span class="mono">${esc(v.genus === 'Pothos' ? 'POTHOS' : v.genus.toUpperCase())}</span></div>
        <div class="scard__size"><span>${esc(v.size_in)}</span><i>${esc(v.size_cm)}</i></div>
        <div class="scard__meta"><span>${esc(v.product)}</span><span>${fmt(v.units_per_box)} per box</span></div>
      </figcaption>
    </figure>`).join('');

/* Form chips + marquee */
const formChips = genera.map(g => `        <label><input type="checkbox" name="genus" value="${esc(g)}" /><span>${esc(g)}</span></label>`).join('\n');
const marquee = genera.concat(genera).map(g => `<span>${esc(g)}</span><i>✦</i>`).join('');

const inject = (html, key, body) => html.replace(new RegExp(`(<!-- @catalog:${key} -->)[\\s\\S]*?(<!-- @/catalog:${key} -->)`), `$1${body}\n$2`);
let light = await readFile(join(root, 'index.html'), 'utf8');
light = inject(light, 'pothos', pothosHtml);
light = inject(light, 'genera', generaHtml);
light = inject(light, 'sizes', sizesHtml);
light = inject(light, 'formchips', '\n' + formChips);
light = light.replace(/<div class="marquee__track" id="marqueeTrack">[\s\S]*?<\/div>/, `<div class="marquee__track" id="marqueeTrack">${marquee}</div>`);
await writeFile(join(root, 'index.html'), light);

/* dark twin */
const dark = light
  .replace('<html lang="en" data-theme="light">', '<html lang="en" data-theme="dark">')
  .replace('<meta name="theme-color" content="#F6F4EE" />', '<meta name="theme-color" content="#0A1410" />')
  .replace('<a class="theme-link mono" id="themeLink" href="dark.html">DARK VERSION</a>', '<a class="theme-link mono" id="themeLink" href="index.html">LIGHT VERSION</a>');
await writeFile(join(root, 'dark.html'), dark);

/* single files */
const css = await readFile(join(root, 'css/styles.css'), 'utf8');
const js = await readFile(join(root, 'js/main.js'), 'utf8');
const cache = new Map();
const data = async (path) => {
  if (!cache.has(path)) {
    const lite = path.replace('assets/img/', 'assets/img/lite/').replace(/\.jpg$/, '.webp');
    let file = join(root, lite);
    try { await access(file); } catch { file = join(root, path.replace(/\.jpg$/, '.webp')); }
    cache.set(path, 'data:image/webp;base64,' + (await readFile(file)).toString('base64'));
  }
  return cache.get(path);
};
await mkdir(join(root, 'dist'), { recursive: true });
for (const [theme, html] of [['light', light], ['dark', dark]]) {
  const body = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));
  const fonts = html.match(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/)[0];
  let out = body.replace('<script src="js/main.js"></script>', `<script>\n${js}\n</script>`).replace(/<a class="theme-link[^<]*<\/a>/, '');
  const refs = [...new Set([...out.matchAll(/assets\/img\/[\w\/-]+\.(?:webp|jpg)/g)].map(m => m[0]))];
  for (const ref of refs) out = out.replaceAll(ref, await data(ref));
  const themedCss = css.replaceAll('html[data-theme="dark"]', 'html[data-theme="dark"],body[data-theme="dark"]').replaceAll('html[data-theme="light"]', 'html[data-theme="light"],body[data-theme="light"]');
  const single = `<title>Broton Verde${theme === 'dark' ? ' (dark)' : ''}</title>\n${fonts}\n<style>\n${themedCss}\n</style>\n${out}\n<script>document.documentElement.setAttribute('data-theme','${theme}');document.body.setAttribute('data-theme','${theme}');</script>`;
  await writeFile(join(root, 'dist', `brotonverde-${theme}.html`), single);
  console.log(`dist/brotonverde-${theme}.html`, (single.length / 1024 / 1024).toFixed(2), 'MB');
}
console.log(`index.html rendered (${cat.length} lines, ${genera.length} genera), dark.html regenerated`);
