// Checks every internal link, image and asset in dist/ resolves to a built file,
// and that every #fragment points at a real id. External links are listed, not
// fetched (pass --external to also request them). Run after `npm run build`.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const base = (process.env.BASE_PATH || '/').replace(/\/$/, '');
const checkExternal = process.argv.includes('--external');

const pages = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) pages.push(p);
  }
})(dist);

const ids = new Map();
for (const p of pages) ids.set(p, new Set([...readFileSync(p, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));

function resolve(pathname) {
  let rel = decodeURIComponent(pathname);
  if (base && rel.startsWith(base)) rel = rel.slice(base.length) || '/';
  const candidates = rel.endsWith('/') ? [join(dist, rel, 'index.html')] : [join(dist, rel), join(dist, rel, 'index.html')];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile());
}

// Absolute links back to this site (canonical, og:url) are checked like internal ones.
const siteOrigin = (readFileSync(join(dist, 'index.html'), 'utf8').match(/<link rel="canonical" href="(https?:\/\/[^/"]+)/) || [])[1];

const broken = [];
const external = new Set();
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const from = page.replace(dist, '/');
  const refs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const s of html.matchAll(/\ssrcset="([^"]+)"/g)) refs.push(...s[1].split(',').map((x) => x.trim().split(/\s+/)[0]));
  for (let ref of refs) {
    if (/^(mailto:|tel:|data:|javascript:)/.test(ref)) continue;
    if (siteOrigin && ref.startsWith(siteOrigin + '/')) ref = ref.slice(siteOrigin.length);
    else if (/^https?:\/\//.test(ref) || ref.startsWith('//')) { external.add(ref); continue; }
    const u = new URL(ref, 'http://x' + from);
    const target = u.pathname === new URL('http://x' + from).pathname && ref.startsWith('#') ? page : resolve(u.pathname);
    if (!target) { broken.push(`${from} -> ${ref} (missing)`); continue; }
    const frag = u.hash.slice(1);
    if (frag && target.endsWith('.html') && !ids.get(target)?.has(frag)) broken.push(`${from} -> ${ref} (no #${frag})`);
  }
}

if (checkExternal) {
  for (const href of external) {
    if (/fonts\.(googleapis|gstatic)\.com$|fonts\.googleapis\.com\/?$/.test(href)) continue;
    try {
      const r = await fetch(href, { method: 'GET', redirect: 'follow' });
      if (r.status >= 400) broken.push(`external ${href} (${r.status})`);
    } catch (e) { broken.push(`external ${href} (${e.message})`); }
  }
}

console.log(`Checked ${pages.length} pages. External links found: ${external.size}${checkExternal ? ' (fetched)' : ' (not fetched, use --external)'}.`);
for (const e of [...external].sort()) console.log('  ext', e);
if (broken.length) { console.error(`\n${broken.length} broken link(s):\n` + [...new Set(broken)].join('\n')); process.exit(1); }
console.log('No broken internal links.');
