// Generates on-brand illustrated placeholder images (WebP) for every image slot.
// These stand in until real photos are added with `npm run images`
// (see src/data/images.json and CREDITS.md). Run: npm run images:placeholders
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';

const OUT = new URL('../public/images/', import.meta.url);
await mkdir(OUT, { recursive: true });
const manifest = JSON.parse(readFileSync(new URL('../src/data/images.json', import.meta.url)));

// Small seeded RNG so the art is the same on every run.
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

const C = {
  forest950: '#0d2419', forest900: '#143826', forest800: '#1b4a33', forest700: '#235c40',
  forest600: '#2d7350', leaf: '#3f8a5c', sage: '#7fa889', sage2: '#a9c6ae',
  cream: '#faf7f0', sand: '#e8dcc2', bark: '#5b3d2a', bark2: '#7a5539', wood: '#d9b38a',
  wood2: '#c49466', amber: '#f59e0b', orange: '#f97316',
};

function canopy(cx, cy, rx, ry, color, seed, n = 26, extra = '') {
  const r = rng(seed);
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r());
    const x = cx + Math.cos(a) * rx * d * 0.85;
    const y = cy + Math.sin(a) * ry * d * 0.75;
    const rad = (rx + ry) * (0.16 + r() * 0.16);
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(1)}" fill="${color}" ${extra}/>`;
  }
  return s;
}

function tree({ x, ground, h, w, seed, dark = C.forest800, light = C.forest600, trunk = C.bark, highlights = [] }) {
  const tw = w * 0.09;
  const top = ground - h;
  let s = `<path d="M${x - tw} ${ground} C ${x - tw * 0.6} ${ground - h * 0.3}, ${x - tw * 0.4} ${top + h * 0.45}, ${x - tw * 2.5} ${top + h * 0.32}
    L ${x - tw * 2} ${top + h * 0.28} C ${x - tw * 0.2} ${top + h * 0.38}, ${x} ${top + h * 0.4}, ${x + tw * 0.2} ${top + h * 0.3}
    L ${x + tw * 0.8} ${top + h * 0.3} C ${x + tw * 0.8} ${top + h * 0.42}, ${x + tw * 1.2} ${top + h * 0.38}, ${x + tw * 2.8} ${top + h * 0.3}
    L ${x + tw * 3} ${top + h * 0.35} C ${x + tw * 1.2} ${top + h * 0.48}, ${x + tw * 0.6} ${ground - h * 0.3}, ${x + tw} ${ground} Z" fill="${trunk}"/>`;
  s += canopy(x, top + h * 0.28, w / 2, h * 0.32, dark, seed, 30);
  s += canopy(x - w * 0.05, top + h * 0.2, w / 2.4, h * 0.24, light, seed + 7, 22);
  for (const [color, sd] of highlights) s += canopy(x + w * 0.08, top + h * 0.22, w / 3.2, h * 0.2, color, sd, 9);
  return s;
}

function hills(W, H, y, amp, color, seed) {
  const r = rng(seed);
  let d = `M0 ${H} L0 ${y}`;
  const steps = 5;
  for (let i = 1; i <= steps; i++) {
    const x = (W / steps) * i;
    const cy = y + (r() - 0.5) * amp * 2;
    d += ` Q ${x - W / steps / 2} ${cy - amp}, ${x} ${cy}`;
  }
  return `<path d="${d} L${W} ${H} Z" fill="${color}"/>`;
}

function grass(W, H, y, color, seed) {
  const r = rng(seed);
  let s = '';
  for (let i = 0; i < 90; i++) {
    const x = r() * W;
    const yy = y + r() * (H - y);
    const h = 6 + r() * 14;
    s += `<path d="M${x.toFixed(0)} ${yy.toFixed(0)} l2 ${-h.toFixed(0)} l2 ${h.toFixed(0)}" fill="${color}" opacity="0.5"/>`;
  }
  return s;
}

function house(x, ground, s = 1) {
  const w = 220 * s, h = 120 * s;
  return `<g>
    <rect x="${x}" y="${ground - h}" width="${w}" height="${h}" fill="${C.sand}"/>
    <path d="M${x - 20 * s} ${ground - h} L${x + w / 2} ${ground - h - 80 * s} L${x + w + 20 * s} ${ground - h} Z" fill="#6b4a3a"/>
    <rect x="${x + 30 * s}" y="${ground - h + 30 * s}" width="${40 * s}" height="${36 * s}" fill="#fbe9c6"/>
    <rect x="${x + 150 * s}" y="${ground - h + 30 * s}" width="${40 * s}" height="${36 * s}" fill="#fbe9c6"/>
    <rect x="${x + 92 * s}" y="${ground - 70 * s}" width="${36 * s}" height="${70 * s}" fill="${C.forest800}"/>
  </g>`;
}

function logEnd(cx, cy, r) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.wood2}"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.82}" fill="${C.wood}"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.6}" fill="none" stroke="${C.wood2}" stroke-width="${r * 0.05}"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.38}" fill="none" stroke="${C.wood2}" stroke-width="${r * 0.05}"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.14}" fill="${C.wood2}"/>`;
}

const sky = (id, a, b) =>
  `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#${id})"/>`;

const scenes = {
  hero(W, H) {
    return sky('s', '#f2c27a', '#fcecc9') +
      `<circle cx="${W * 0.3}" cy="${H * 0.36}" r="${H * 0.11}" fill="#fff4d6" opacity="0.9"/>` +
      hills(W, H, H * 0.58, 40, C.sage2, 3) + hills(W, H, H * 0.66, 30, C.sage, 5) +
      tree({ x: W * 0.12, ground: H * 0.72, h: H * 0.3, w: W * 0.12, seed: 11, dark: C.forest700, light: C.leaf }) +
      house(W * 0.36, H * 0.82, 1.1) +
      hills(W, H, H * 0.8, 12, C.forest700, 9) +
      tree({ x: W * 0.74, ground: H * 0.86, h: H * 0.7, w: W * 0.42, seed: 21 }) +
      `<rect y="${H * 0.86}" width="${W}" height="${H * 0.14}" fill="${C.forest800}"/>` + grass(W, H, H * 0.86, C.forest600, 4);
  },
  'service-removal'(W, H) {
    return sky('s', '#cfe3dc', '#f4efe2') +
      hills(W, H, H * 0.55, 30, C.sage2, 2) +
      tree({ x: W * 0.25, ground: H * 0.68, h: H * 0.55, w: W * 0.32, seed: 31 }) +
      hills(W, H, H * 0.68, 10, C.forest700, 7) +
      `<rect y="${H * 0.74}" width="${W}" height="${H * 0.26}" fill="${C.forest800}"/>` +
      `<path d="M${W * 0.52} ${H * 0.82} h${W * 0.42} v${H * 0.08} h-${W * 0.42} z" fill="${C.bark2}"/>` +
      logEnd(W * 0.56, H * 0.73, H * 0.09) + logEnd(W * 0.66, H * 0.73, H * 0.09) + logEnd(W * 0.76, H * 0.73, H * 0.09) +
      logEnd(W * 0.86, H * 0.73, H * 0.09) + logEnd(W * 0.61, H * 0.6, H * 0.085) + logEnd(W * 0.71, H * 0.6, H * 0.085) +
      logEnd(W * 0.81, H * 0.6, H * 0.085) + logEnd(W * 0.66, H * 0.48, H * 0.08) + logEnd(W * 0.76, H * 0.48, H * 0.08) +
      grass(W, H, H * 0.86, C.forest600, 8);
  },
  'service-trimming'(W, H) {
    return sky('s', '#bcd9e6', '#eef4ec') +
      hills(W, H, H * 0.62, 25, C.sage2, 4) +
      tree({ x: W * 0.55, ground: H * 0.84, h: H * 0.78, w: W * 0.6, seed: 41, dark: C.forest700, light: C.leaf }) +
      `<g stroke="${C.amber}" stroke-width="${W * 0.008}" stroke-linecap="round">
        <line x1="${W * 0.18}" y1="${H * 0.9}" x2="${W * 0.36}" y2="${H * 0.36}"/>
        <line x1="${W * 0.24}" y1="${H * 0.92}" x2="${W * 0.41}" y2="${H * 0.38}"/></g>` +
      Array.from({ length: 9 }, (_, i) => {
        const t = 0.08 + i * 0.1;
        return `<line x1="${W * (0.18 + 0.18 * t)}" y1="${H * (0.9 - 0.54 * t)}" x2="${W * (0.24 + 0.17 * t)}" y2="${H * (0.92 - 0.54 * t)}" stroke="${C.amber}" stroke-width="${W * 0.006}"/>`;
      }).join('') +
      `<rect y="${H * 0.86}" width="${W}" height="${H * 0.14}" fill="${C.forest800}"/>` +
      `<path d="M${W * 0.7} ${H * 0.9} l${W * 0.12} -${H * 0.03} l${W * 0.02} ${H * 0.02} l-${W * 0.12} ${H * 0.03}z" fill="${C.bark2}"/>` +
      canopy(W * 0.82, H * 0.86, W * 0.04, H * 0.03, C.leaf, 5, 6) + grass(W, H, H * 0.86, C.forest600, 3);
  },
  'service-stump'(W, H) {
    const r = rng(77);
    let chips = '';
    for (let i = 0; i < 260; i++) {
      const x = r() * W, y = r() * H;
      chips += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(4 + r() * 8).toFixed(1)}" ry="${(2 + r() * 3).toFixed(1)}" fill="${r() > 0.5 ? C.wood : C.wood2}" opacity="0.55" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
    }
    const cx = W * 0.5, cy = H * 0.52, R = H * 0.34;
    let rings = '';
    for (let i = 1; i < 9; i++) rings += `<circle cx="${cx + i * 2}" cy="${cy - i}" r="${R * (1 - i * 0.1)}" fill="none" stroke="${C.wood2}" stroke-width="3" opacity="0.8"/>`;
    return `<rect width="100%" height="100%" fill="#5d7a4a"/>` + grass(W, H, 0, C.forest700, 9) +
      `<ellipse cx="${W * 0.5}" cy="${H * 0.55}" rx="${W * 0.42}" ry="${H * 0.46}" fill="#7a5a3c" opacity="0.6"/>` + chips +
      `<circle cx="${cx}" cy="${cy + 10}" r="${R * 1.08}" fill="${C.bark}"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="${C.wood}"/>` + rings +
      `<path d="M${cx} ${cy} L${cx + R * 0.7} ${cy - R * 0.5}" stroke="${C.bark2}" stroke-width="3"/>`;
  },
  'service-storm'(W, H) {
    let rain = '';
    const r = rng(5);
    for (let i = 0; i < 120; i++) {
      const x = r() * W, y = r() * H * 0.9;
      rain += `<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x - 10).toFixed(0)}" y2="${(y + 30).toFixed(0)}" stroke="#c9d6e3" stroke-width="2" opacity="0.35"/>`;
    }
    return sky('s', '#2a3442', '#58667a') +
      canopy(W * 0.3, H * 0.12, W * 0.3, H * 0.1, '#3b4656', 3, 20) + canopy(W * 0.75, H * 0.1, W * 0.3, H * 0.1, '#46525f', 9, 20) +
      `<path d="M${W * 0.62} ${H * 0.14} l-${W * 0.05} ${H * 0.2} h${W * 0.03} l-${W * 0.04} ${H * 0.2} l${W * 0.09} -${H * 0.25} h-${W * 0.03} l${W * 0.04} -${H * 0.15}z" fill="#fde68a"/>` +
      hills(W, H, H * 0.66, 18, '#2f4a3c', 8) + house(W * 0.08, H * 0.82, 1) +
      `<rect y="${H * 0.82}" width="${W}" height="${H * 0.18}" fill="#24382d"/>` +
      `<g transform="rotate(-62 ${W * 0.58} ${H * 0.84})">` + tree({ x: W * 0.58, ground: H * 0.84, h: H * 0.62, w: W * 0.34, seed: 51, dark: '#1d3b2b', light: '#2b5440' }) + '</g>' +
      Array.from({ length: 10 }, (_, i) => `<rect x="${W * 0.36 + i * W * 0.06}" y="${H * 0.76}" width="${W * 0.012}" height="${H * 0.08}" fill="#a28d74"/>`).join('') +
      `<rect x="${W * 0.36}" y="${H * 0.78}" width="${W * 0.56}" height="${H * 0.012}" fill="#a28d74"/>` + rain;
  },
  'service-clearing'(W, H) {
    const r = rng(12);
    let tracks = '';
    for (let i = 0; i < 14; i++) tracks += `<rect x="${W * 0.1 + i * W * 0.06}" y="${H * (0.8 + (i % 2) * 0.06)}" width="${W * 0.035}" height="${H * 0.012}" fill="#8b6b4a" opacity="0.6"/>`;
    let line = '';
    for (let i = 0; i < 9; i++) line += tree({ x: W * (0.02 + i * 0.12 + r() * 0.04), ground: H * 0.56, h: H * (0.22 + r() * 0.1), w: W * 0.13, seed: 60 + i, dark: C.forest700, light: C.forest600 });
    return sky('s', '#d9e8ef', '#f6f1e4') + hills(W, H, H * 0.45, 20, C.sage2, 1) + line +
      `<rect y="${H * 0.56}" width="${W}" height="${H * 0.44}" fill="#b08d63"/>` +
      `<path d="M0 ${H * 0.56} Q ${W * 0.5} ${H * 0.6}, ${W} ${H * 0.56} L${W} ${H * 0.64} Q ${W * 0.5} ${H * 0.68}, 0 ${H * 0.64}Z" fill="#7d9a5e"/>` +
      `<ellipse cx="${W * 0.72}" cy="${H * 0.74}" rx="${W * 0.14}" ry="${H * 0.08}" fill="#8a6a45"/><ellipse cx="${W * 0.72}" cy="${H * 0.7}" rx="${W * 0.1}" ry="${H * 0.06}" fill="#9c7b52"/>` +
      `<ellipse cx="${W * 0.25}" cy="${H * 0.7}" rx="${W * 0.09}" ry="${H * 0.05}" fill="#8a6a45"/>` + tracks;
  },
  'service-oakwilt'(W, H) {
    return sky('s', '#e6dcc6', '#f7f2e6') + hills(W, H, H * 0.62, 25, C.sage2, 6) +
      tree({ x: W * 0.28, ground: H * 0.8, h: H * 0.42, w: W * 0.34, seed: 91, dark: C.forest700, light: C.leaf }) +
      tree({ x: W * 0.68, ground: H * 0.86, h: H * 0.66, w: W * 0.5, seed: 71, highlights: [['#b7792f', 4], ['#9c5a24', 8], ['#c9a253', 13]] }) +
      `<rect y="${H * 0.84}" width="${W}" height="${H * 0.16}" fill="${C.forest800}"/>` + grass(W, H, H * 0.84, C.forest600, 2);
  },
  'about-team'(W, H) {
    return sky('s', '#e3efe7', '#faf7f0') + hills(W, H, H * 0.62, 25, C.sage2, 6) +
      tree({ x: W * 0.8, ground: H * 0.86, h: H * 0.6, w: W * 0.36, seed: 101 }) +
      `<rect y="${H * 0.84}" width="${W}" height="${H * 0.16}" fill="${C.forest800}"/>` +
      `<rect x="${W * 0.12}" y="${H * 0.3}" width="${W * 0.5}" height="${H * 0.34}" rx="18" fill="#ffffff" opacity="0.88"/>` +
      `<text x="${W * 0.37}" y="${H * 0.45}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${H * 0.065}" fill="${C.forest900}">Team photo</text>` +
      `<text x="${W * 0.37}" y="${H * 0.55}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${H * 0.045}" fill="${C.forest700}">[CONFIRM: real crew photo]</text>`;
  },
};

async function render(name, W, H, file, { format = 'webp', quality = 72 } = {}) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${scenes[name](W, H)}</svg>`;
  let img = sharp(Buffer.from(svg));
  img = format === 'jpg' ? img.jpeg({ quality: 80, mozjpeg: true }) : img.webp({ quality });
  await img.toFile(new URL(file, OUT).pathname);
}

for (const slot of manifest.images) {
  if (!scenes[slot.id]) continue;
  for (const w of slot.widths) {
    const h = Math.round((w * slot.height) / slot.width);
    await render(slot.id, w, h, `${slot.id}-${w}.webp`);
  }
}

// Open Graph image (JPEG for widest social support) with name overlay.
const biz = JSON.parse(readFileSync(new URL('../src/data/business.json', import.meta.url)));
{
  const W = 1200, H = 630;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${scenes.hero(W, H)}
    <rect width="${W}" height="${H}" fill="${C.forest950}" opacity="0.55"/>
    <text x="70" y="260" font-family="Arial, sans-serif" font-weight="800" font-size="78" fill="#ffffff">${biz.name}</text>
    <text x="70" y="335" font-family="Arial, sans-serif" font-size="40" fill="#f3eee2">Tree removal, trimming &amp; stump grinding</text>
    <text x="70" y="390" font-family="Arial, sans-serif" font-size="40" fill="#f3eee2">${biz.address.city}, ${biz.address.state} and nearby</text>
    <rect x="70" y="440" width="380" height="76" rx="12" fill="${C.orange}"/>
    <text x="260" y="490" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="36" fill="${C.forest950}">${biz.phone.display}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toFile(new URL('og-default.jpg', OUT).pathname);
}

// Favicon set.
const iconSvg = (pad = 0) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect x="${pad}" y="${pad}" width="${64 - pad * 2}" height="${64 - pad * 2}" rx="${pad ? 0 : 14}" fill="${C.forest900}"/>
  <path d="M30 50 h4 v-12 h-4z" fill="${C.wood}"/>
  <circle cx="32" cy="26" r="13" fill="${C.leaf}"/><circle cx="23" cy="31" r="8" fill="${C.leaf}"/><circle cx="41" cy="31" r="8" fill="${C.leaf}"/>
  <circle cx="35" cy="22" r="5" fill="${C.orange}"/>
</svg>`;
const PUB = new URL('../public/', import.meta.url);
await writeFile(new URL('favicon.svg', PUB), iconSvg());
await sharp(Buffer.from(iconSvg(0))).resize(180, 180).png().toFile(new URL('apple-touch-icon.png', PUB).pathname);
await sharp(Buffer.from(iconSvg(0))).resize(192, 192).png().toFile(new URL('icon-192.png', PUB).pathname);
await sharp(Buffer.from(iconSvg(0))).resize(512, 512).png().toFile(new URL('icon-512.png', PUB).pathname);
// favicon.ico: a single 32x32 PNG wrapped in an ICO container.
const png32 = await sharp(Buffer.from(iconSvg())).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6); header.writeUInt8(32, 7); header.writeUInt8(0, 8); header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
header.writeUInt32LE(png32.length, 14); header.writeUInt32LE(22, 18);
await writeFile(new URL('favicon.ico', PUB), Buffer.concat([header, png32]));

console.log('Placeholder images and icons generated in public/.');
