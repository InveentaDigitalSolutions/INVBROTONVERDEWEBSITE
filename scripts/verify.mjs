/* Visual + layout verification.
   Serves the site, scrolls through it at three viewports, screenshots every section,
   and fails loudly on: horizontal overflow, console errors, broken images, or any
   element wider than the viewport.
   Usage: node scripts/verify.mjs [outDir]  (needs a `playwright` install on NODE_PATH or nearby) */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(process.argv[2] || join(root, 'shots'));
const pageFile = process.argv[3] || 'index.html';
await mkdir(out, { recursive: true });

const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  try {
    const data = await readFile(join(root, p));
    res.writeHead(200, { 'content-type': mime[extname(p)] || 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, r));
const url = `http://127.0.0.1:${server.address().port}/${pageFile}`;

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 390, height: 844, mobile: true },
];
const sections = null; // derived from [data-shot] in the page

const browser = await chromium.launch();
const problems = [];
for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.mobile, hasTouch: !!vp.mobile, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3400); // preloader + intro

  // scroll through the whole page in steps so every trigger fires
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  let overflowAt = [];
  for (let y = 0; y <= total; y += Math.round(vp.height * 0.6)) {
    await page.evaluate(v => window.scrollTo(0, v), y);
    await page.waitForTimeout(140);
    const w = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    if (w[0] > w[1] + 1) overflowAt.push(`${y}px: scrollWidth ${w[0]} > ${w[1]}`);
  }
  await page.waitForTimeout(600);

  // screenshots per section (scroll each into view, let scrubs settle)
  const shots = await page.evaluate(() => [...document.querySelectorAll('[data-shot]')].map((el, i) => el.id || el.className.split(' ')[0] || String(i)));
  for (let i = 0; i < shots.length; i++) {
    await page.evaluate(i => { const el = document.querySelectorAll('[data-shot]')[i]; window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 1); }, i);
    await page.waitForTimeout(900);
    await page.screenshot({ path: join(out, `${vp.name}-${String(i).padStart(2, '0')}-${shots[i]}.jpg`), type: 'jpeg', quality: 72 });
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(out, `${vp.name}-full.jpg`), type: 'jpeg', quality: 55, fullPage: true });

  // checks
  const report = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const wide = [];
    document.querySelectorAll('main *, header *, footer *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width === 0) return;
      // only flag elements that themselves extend past the viewport and are not inside an overflow-clipped ancestor
      let a = el, clipped = false;
      while (a && a !== document.body) { const o = getComputedStyle(a).overflow; if (o !== 'visible') { clipped = true; break; } a = a.parentElement; }
      if (!clipped && (r.right > vw + 2 || r.left < -2)) wide.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} → ${Math.round(r.left)}..${Math.round(r.right)}`);
    });
    const imgs = [...document.images].filter(im => im.complete && im.naturalWidth === 0).map(im => im.currentSrc || im.src); // lazy images still pending are not broken
    return { wide: wide.slice(0, 20), imgs, height: document.documentElement.scrollHeight };
  });
  if (overflowAt.length) problems.push(`${vp.name}: horizontal overflow at ${overflowAt.slice(0, 5).join(' | ')}`);
  if (report.wide.length) problems.push(`${vp.name}: elements outside viewport → ${report.wide.join(' ; ')}`);
  if (report.imgs.length) problems.push(`${vp.name}: broken images → ${report.imgs.join(', ')}`);
  if (errors.length) problems.push(`${vp.name}: console errors → ${errors.join(' | ')}`);
  console.log(`${vp.name}: height ${report.height}px, ${errors.length} console errors, ${overflowAt.length} overflow samples, ${report.wide.length} wide elements, ${report.imgs.length} broken images`);
  await ctx.close();
}
await browser.close();
server.close();
if (problems.length) { console.log('\nPROBLEMS:\n- ' + problems.join('\n- ')); process.exit(1); }
console.log('\nAll checks passed. Screenshots in ' + out);
