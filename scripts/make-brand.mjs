// Builds web-ready logo files from the owner's logo (brand/logo-source.webp,
// gold on black). Run after replacing the source file: npm run brand
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const SRC = new URL('../brand/logo-source.webp', import.meta.url).pathname;
const OUT = (f) => new URL(`../public/images/brand/${f}`, import.meta.url).pathname;
const PUB = (f) => new URL(`../public/${f}`, import.meta.url).pathname;

// Crop boxes measured on the 1219x911 source.
const FULL = { left: 196, top: 105, width: 860, height: 660 };
const TREE = { left: 226, top: 118, width: 790, height: 440 };

// Gold-on-black -> gold-on-transparent: alpha follows brightness.
async function transparent(region) {
  const { data, info } = await sharp(SRC).extract(region).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const lum = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
    const a = Math.max(0, Math.min(1, (lum - 28) / 90));
    // Lift dark fringe pixels toward the gold so edges don't look muddy.
    if (a > 0 && a < 1) { data[i] = Math.min(255, data[i] / a); data[i + 1] = Math.min(255, data[i + 1] / a); data[i + 2] = Math.min(255, data[i + 2] / a); }
    data[i + 3] = Math.round(a * 255);
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
}

const tree = await (await transparent(TREE)).png().toBuffer();
for (const w of [160, 320, 800]) await sharp(tree).resize(w).webp({ quality: 76, alphaQuality: 85 }).toFile(OUT(`logo-tree-${w}.webp`));
const full = await (await transparent(FULL)).png().toBuffer();
for (const w of [400, 800]) await sharp(full).resize(w).webp({ quality: 76, alphaQuality: 85 }).toFile(OUT(`logo-full-${w}.webp`));

// Favicons: logo tree on the brand's near-black.
async function icon(size, padRatio = 0.06) {
  const inner = Math.round(size * (1 - padRatio * 2));
  const t = await sharp(tree).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: '#0a0f0c' } })
    .composite([{ input: t, gravity: 'center' }]).png().toBuffer();
}
await writeFile(PUB('apple-touch-icon.png'), await icon(180));
await writeFile(PUB('icon-192.png'), await icon(192));
await writeFile(PUB('icon-512.png'), await icon(512));
const png32 = await icon(32, 0.04);
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6); header.writeUInt8(32, 7); header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
header.writeUInt32LE(png32.length, 14); header.writeUInt32LE(22, 18);
await writeFile(PUB('favicon.ico'), Buffer.concat([header, png32]));
const png64 = (await icon(64, 0.04)).toString('base64');
await writeFile(PUB('favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><image href="data:image/png;base64,${png64}" width="64" height="64"/></svg>`);

// Open Graph image: the full logo centered on black.
const og = await sharp(full).resize({ height: 500 }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#0a0f0c' } })
  .composite([{ input: og, gravity: 'center' }]).jpeg({ quality: 85, mozjpeg: true }).toFile(OUT('../og-default.jpg'));
console.log('Brand assets written to public/images/brand and public/.');
