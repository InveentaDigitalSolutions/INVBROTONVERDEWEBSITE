/* Builds dist/brotonverde-single.html: the whole site in one file with CSS, JS and the
   lite image set inlined (data URIs). Used for the Claude artifact / quick sharing.
   Fonts and GSAP/Lenis still load from their CDNs. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let html = await readFile(join(root, 'index.html'), 'utf8');
const css = await readFile(join(root, 'css/styles.css'), 'utf8');
const js = await readFile(join(root, 'js/main.js'), 'utf8');
const body = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));
const fonts = html.match(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/)[0];
const cache = new Map();
const data = async (name) => {
  if (!cache.has(name)) {
    const buf = await readFile(join(root, 'assets/img/lite', name + '.webp'));
    cache.set(name, 'data:image/webp;base64,' + buf.toString('base64'));
  }
  return cache.get(name);
};
let out = body.replace('<link rel="stylesheet" href="css/styles.css" />', '').replace('<script src="js/main.js"></script>', `<script>\n${js}\n</script>`);
const refs = [...out.matchAll(/assets\/img\/([\w-]+)\.(webp|jpg)/g)].map(m => m[1]);
for (const name of new Set(refs)) {
  const uri = await data(name);
  out = out.replaceAll(`assets/img/${name}.webp`, uri).replaceAll(`assets/img/${name}.jpg`, uri);
}
const single = `<title>Broton Verde</title>\n<meta name="theme-color" content="#0a1410" />\n${fonts}\n<style>\n${css}\n</style>\n${out}`;
await mkdir(join(root, 'dist'), { recursive: true });
await writeFile(join(root, 'dist/brotonverde-single.html'), single);
console.log('dist/brotonverde-single.html', (single.length / 1024 / 1024).toFixed(2), 'MB');
