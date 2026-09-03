/* Build:
   1. Renders the catalogue sections into index.html from data/products.json — the nursery's own
      32 lines (read from the FarmTrack app), enriched with photos/specs where the 2026–27
      foliage catalogue (data/catalog.json) carries the same line. Idempotent, between @catalog markers.
   2. Writes dark.html, the dark twin of index.html (never edit it by hand).
   3. Writes dist/brotonverde-light.html and dist/brotonverde-dark.html — single files with CSS, JS and lite images inlined. */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { groups, lines } = JSON.parse(await readFile(join(root, 'data/products.json'), 'utf8'));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const exists = async (p) => { try { await access(join(root, p)); return true; } catch { return false; } };
const img = (v, ...roles) => { for (const r of roles) if (v.images && v.images[r]) return 'assets/img/catalog/' + v.images[r]; return null; };
const GRADES = ['Petit', 'Mini Petit', 'Small', 'Medium', 'California', 'Large', 'Extra Large'];
const CUT = { pothos: 'Leaf & eye · Tips', 'satin-pothos': 'Leaf & eye', philodendron: 'Leaf & eye', dieffenbachia: 'Tips', sansevieria: 'Divisions · Leaf' };
const GROUP_IMG = { pothos: 'assets/img/catalog/pothos-epipremnum-aureum-hawaiian-pot.webp', sansevieria: 'assets/img/catalog/group-sansevieria-photo.webp', 'satin-pothos': 'assets/img/catalog/scindapsus-pictus-exotica-pot.webp', philodendron: 'assets/img/catalog/philodendron-hederaceum-brazil-pot.webp', dieffenbachia: 'assets/img/catalog/group-dieffenbachia-photo.webp' };

const lineImg = (v) => img(v, 'pot', 'photo', 'leaf', 'grid');
const mediaHtml = (v, cls) => {
  const src = lineImg(v);
  if (src) return `<img class="${cls}" src="${src}" alt="${esc(v.variety)}" loading="lazy" />`;
  return `<div class="${cls} ${cls}--pending"><img src="${GROUP_IMG[v.group]}" alt="" loading="lazy" /><span class="mono">PHOTO TO FOLLOW</span></div>`;
};

/* Featured Pothos */
const pothos = lines.filter(v => v.group === 'pothos' && lineImg(v)); // featured: only lines with a photograph; the group list below carries all 13
const pothosHtml = pothos.map(v => `
        <article class="pcard${lineImg(v) ? '' : ' pcard--pending'}">
          <div class="pcard__media">
            ${mediaHtml(v, 'pcard__pot')}
            ${img(v, 'grid') ? `<img class="pcard__grid" src="${img(v, 'grid')}" alt="${esc(v.variety)} cutting on the measuring grid" loading="lazy" />` : ''}
          </div>
          <div class="pcard__body">
            <div class="pcard__row"><h4>${esc(v.variety)}</h4><span class="tag">URC · RC</span></div>
            <p class="latin">${esc(v.latin)}</p>
            <p class="pcard__desc">${esc(v.spec?.bullets?.[0] || 'Cut leaf-and-eye from stock beds on rotation; sized on the table before it is counted.')}</p>
            <dl class="pcard__specs"><div><dt>Cutting</dt><dd>${esc(CUT[v.group])}</dd></div><div><dt>Grades</dt><dd>Petit → XL</dd></div><div><dt>Sold as</dt><dd>Unrooted · Rooted</dd></div></dl>
          </div>
        </article>`).join('');

/* Group accordion */
const groupsHtml = groups.map((g, i) => {
  const vs = lines.filter(v => v.group === g.key);
  const chips = vs.map(v => `
          <div class="vchip${lineImg(v) ? '' : ' vchip--pending'}">
            ${lineImg(v) ? `<img src="${lineImg(v)}" alt="" loading="lazy" />` : `<i></i>`}
            <div><b>${esc(v.variety)}</b><span>${esc(CUT[g.key])} · URC / RC</span></div>
          </div>`).join('');
  return `
      <div class="grow" data-group="${esc(g.key)}">
        <button class="grow__head" aria-expanded="false">
          <span class="grow__n mono">${String(i + 1).padStart(2, '0')}</span>
          <img class="grow__thumb" src="${GROUP_IMG[g.key]}" alt="" loading="lazy" />
          <span class="grow__name">${esc(g.title)} <em>${esc(g.latin)}</em></span>
          <span class="grow__desc">${esc(g.note)}</span>
          <span class="grow__meta"><b>${vs.length}</b> ${vs.length === 1 ? 'line' : 'lines'}<i>${esc(CUT[g.key])}</i></span>
          <span class="grow__plus" aria-hidden="true"></span>
        </button>
        <div class="grow__panel"><div class="grow__inner">${chips}</div></div>
      </div>`;
}).join('');

/* Sizes strip: grade chips rendered in the page; cards for the lines that have a grid photo */
const withGrid = lines.filter(v => v.images.grid);
const sizesHtml = withGrid.map(v => `
    <figure class="scard">
      <div class="scard__media"><img src="${img(v, 'grid')}" alt="${esc(v.groupTitle)} ${esc(v.variety)} cutting on the measuring grid" loading="lazy" /></div>
      <figcaption>
        <div class="scard__row"><b>${esc(v.variety)}</b><span class="mono">${esc(v.groupTitle.toUpperCase())}</span></div>
        <div class="scard__size"><span>${esc(v.spec?.product || 'L&E')}</span><i>leaf-and-eye cutting, graded on the grid</i></div>
        <div class="scard__meta"><span>Unrooted · Rooted</span><span>Petit → Extra Large</span></div>
      </figcaption>
    </figure>`).join('');
const gradesHtml = GRADES.map((g, i) => `<span class="grade-chip"><i class="mono">${String(i + 1).padStart(2, '0')}</i>${g}</span>`).join('');

const formChips = groups.map(g => `        <label><input type="checkbox" name="genus" value="${esc(g.title)}" /><span>${esc(g.title)}</span></label>`).join('\n');
const marquee = lines.map(v => `<span>${esc(v.variety)}</span><i>✦</i>`).join('');

const inject = (h, key, body) => h.replace(new RegExp(`(<!-- @catalog:${key} -->)[\\s\\S]*?(<!-- @/catalog:${key} -->)`), `$1${body}\n$2`);
let light = await readFile(join(root, 'index.html'), 'utf8');
light = inject(light, 'pothos', pothosHtml);
light = inject(light, 'genera', groupsHtml);
light = inject(light, 'sizes', sizesHtml);
light = inject(light, 'grades', gradesHtml);
light = inject(light, 'formchips', '\n' + formChips);
light = light.replace(/<div class="marquee__track" id="marqueeTrack">[\s\S]*?<\/div>/, `<div class="marquee__track" id="marqueeTrack">${marquee}${marquee}</div>`);
await writeFile(join(root, 'index.html'), light);

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
    const file = (await exists(lite)) ? lite : path.replace(/\.jpg$/, '.webp');
    cache.set(path, 'data:image/webp;base64,' + (await readFile(join(root, file))).toString('base64'));
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
console.log(`index.html rendered (${lines.length} lines, ${groups.length} groups), dark.html regenerated`);
