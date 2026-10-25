// Post-build SEO/content audit: title & description length, one H1, word counts,
// noindex in demo mode, duplicate titles. Run after `npm run build`: node scripts/audit.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) files.push(p);
  }
})(dist);

const strip = (h) => h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ');
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const titles = new Map();
let problems = 0;
const rows = [];
for (const f of files.sort()) {
  const html = readFileSync(f, 'utf8');
  const rel = f.replace(dist, '/');
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
  const desc = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  const article = html.match(/<article>([\s\S]*?)<\/article>/)?.[1];
  const words = article ? strip(article).split(/\s+/).filter((w) => /[a-z]/i.test(w)).length : 0;
  const issues = [];
  if (!title || title.length >= 60) issues.push(`title ${title.length}`);
  if (!desc || desc.length >= 155) issues.push(`desc ${desc.length}`);
  if (h1s !== 1) issues.push(`h1 x${h1s}`);
  if (titles.has(title)) issues.push(`duplicate title with ${titles.get(title)}`);
  titles.set(title, rel);
  if (!/<link rel="canonical"/.test(html) && !/404|thank-you/.test(rel)) issues.push('no canonical');
  problems += issues.length;
  rows.push(`${rel.padEnd(45)} t${String(title.length).padStart(3)} d${String(desc.length).padStart(4)} words ${String(words).padStart(4)} ${issues.join(', ')}`);
}
console.log(rows.join('\n'));
console.log(problems ? `\n${problems} issue(s)` : '\nNo issues.');
process.exit(problems ? 1 : 0);
