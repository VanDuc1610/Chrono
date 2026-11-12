/**
 * CHRONO – "sunken" tileset for Chapter 1's underwater ruins (Pipeline B, AGENTS.md §5).
 *
 * Tiles 0-15 are the approved sanctuary tiles (ENV_SANCTUARY_002) recoloured, colour by colour, into
 * a deep-sea palette (mossy teal stone, verdigris, green-cyan phosphorescence, coral instead of
 * violet) — same shapes, different place. Tiles 16-23 are new underwater props drawn here.
 * Deterministic; no image model, no external reference. Output:
 * art-source/environment/sunken/generated/candidates/ ONLY (owner approval required).
 *
 * 4 × 6 tiles of 32 px (128 × 192). New indices:
 *   16 chime pillar · 17 cracked Time Bell · 18 coral cluster · 19 kelp · 20 shallow water (ground)
 *   21 seabed sand (ground) · 22 unnamed watch case · 23 Continuum Seal
 *
 * Usage: node scripts/author-sunken-tileset.js
 */
import path from 'path';
import fs from 'fs';
import { hex, encodePng, writeFile } from './pixel-art/pixel.js';
import { parsePNG } from './validate-candidate.js';
import {
  T,
  rnd,
  tile,
  put,
  rect,
  ellipse,
  speckle,
  outline,
  over,
  rasterTiles,
  scaledPng,
  renderLayout,
} from './pixel-art/tile-kit.js';
import { ruinsLayout, sanctumLayout } from './ch1-layout.js';

const VERSION = 'v1';
const SOURCE = 'art-source/environment/sanctuary/generated/approved/sanctuary_tileset_v3.png';

/** Sanctuary palette (author-sanctuary-tileset.js) -> sunken palette. */
const RECOLOR = [
  ['#07080f', '#03100f'],
  ['#0e121e', '#082220'],
  ['#1b2234', '#0f3a36'],
  ['#29344c', '#1b524a'],
  ['#404f6e', '#2e7064'],
  ['#8c6628', '#3f7a5a'],
  ['#b88a3e', '#6aa47a'],
  ['#008ab8', '#1f9e7a'],
  ['#00c8ff', '#46e0b0'],
  ['#88edff', '#b4ffe0'],
  ['#05060b', '#020807'],
  ['#8c96a8', '#7aa49a'],
  ['#7a5cd6', '#e07a6a'],
  ['#d9cba8', '#cfe0c8'],
  ['#a8987a', '#8fa898'],
];

const P = {
  O: hex('#020807'),
  v: hex('#03100f'),
  m: hex('#082220'),
  S: hex('#0f3a36'),
  s: hex('#1b524a'),
  h: hex('#2e7064'),
  b: hex('#3f7a5a'), // verdigris
  B: hex('#6aa47a'),
  k: hex('#8c6628'), // old bronze showing through
  K: hex('#b88a3e'),
  d: hex('#1f9e7a'), // dim phosphor
  c: hex('#46e0b0'), // phosphor
  a: hex('#b4ffe0'), // phosphor apex
  r: hex('#e07a6a'), // coral
  R: hex('#a84a48'), // coral shade
  g: hex('#2e6a3a'), // kelp
  G: hex('#1c4a28'), // kelp shade
  w: hex('#14484a'), // deep pool
  W: hex('#22625e'), // pool light
  n: hex('#3e4a3c'), // seabed silt
  N: hex('#2f3a2e'), // silt shade
  e: hex('#cfe0c8'), // pale glint
  x: hex('#b8bcc4'), // silver (watch case)
  t: hex('#5a5248'), // ink / hands
};

// ------------------------------------------------------------------ recoloured base tiles 0-15
function recolouredBase() {
  const { ihdr, pixels } = parsePNG(SOURCE);
  const map = new Map(RECOLOR.map(([a, b]) => [a.toLowerCase(), hex(b)]));
  const toHex = (r, g, b) => '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');
  const out = Buffer.from(pixels);
  for (let i = 0; i < out.length; i += 4) {
    if (!out[i + 3]) continue;
    const to = map.get(toHex(out[i], out[i + 1], out[i + 2]));
    if (to) out.set(to.slice(0, 3), i);
  }
  return { w: ihdr.width, h: ihdr.height, buf: out };
}

// ------------------------------------------------------------------ new props 16-23
function seabedSand() {
  const t = tile('n');
  speckle(t, 61, [
    ['N', 14],
    ['h', 3],
  ]);
  for (const [x, y] of [
    [7, 9],
    [22, 23],
  ]) {
    rect(t, x, y, x + 2, y, 'e');
    put(t, x + 1, y + 1, 'N');
  }
  return t;
}
function shallowWater() {
  const t = seabedSand();
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const v = Math.sin(x / 4 + y / 7) + Math.cos(y / 3 - x / 9);
      t[y][x] = v > 1.2 ? 'W' : v > -0.4 ? 'w' : t[y][x] === 'n' ? 'd' : t[y][x];
    }
  return t;
}
function chimePillar() {
  const t = tile();
  rect(t, 11, 10, 20, 30, 's');
  rect(t, 11, 10, 12, 30, 'h');
  rect(t, 19, 10, 20, 30, 'S');
  rect(t, 9, 28, 22, 31, 'S');
  // A small bronze bell hanging from an arm, tarnished green; a phosphor crack.
  rect(t, 13, 4, 18, 5, 'b');
  ellipse(t, 15.5, 9, 4, 3.5, 'b');
  rect(t, 12, 11, 19, 12, 'B');
  put(t, 15, 13, 'k');
  for (let y = 15; y < 27; y += 3) put(t, 15 + (y % 2), y, 'c');
  return outline(t);
}
function crackedBell() {
  const t = tile();
  // The great Time Bell, cracked, hung from a chain.
  rect(t, 15, 0, 16, 3, 'S');
  rect(t, 13, 3, 18, 4, 'k'); // crown loop
  // Bell profile: rounded shoulder, gently widening waist, flared lip.
  const profile = (y) => {
    if (y < 10) return 4 + Math.sqrt(Math.max(0, 36 - (10 - y) ** 2)) * 0.9;
    if (y < 22) return 9.4 + (y - 10) * 0.25;
    return 12.4 + (y - 22) * 0.9;
  };
  for (let y = 5; y < 28; y++) {
    const half = Math.round(profile(y));
    for (let x = 16 - half; x < 16 + half; x++)
      put(t, x, y, x < 16 - half + 2 ? 'B' : x > 16 + half - 3 ? 'm' : 'b');
  }
  rect(t, 3, 27, 28, 28, 'k'); // bronze lip
  rect(t, 9, 16, 22, 16, 'B'); // sound bow ring
  for (const [x, y] of [
    [17, 8],
    [18, 11],
    [16, 14],
    [17, 17],
    [19, 20],
    [18, 23],
  ])
    put(t, x, y, 'c');
  put(t, 18, 12, 'a');
  return outline(t);
}
function coral() {
  const t = tile();
  for (const [x0, h, a] of [
    [9, 16, -0.4],
    [15, 22, 0.1],
    [21, 14, 0.5],
  ]) {
    for (let k = 0; k < h; k++) {
      const x = Math.round(x0 + Math.sin(k / 3 + a) * 2);
      put(t, x, 30 - k, k % 4 === 0 ? 'R' : 'r');
      put(t, x + 1, 30 - k, 'r');
      if (k % 5 === 3) {
        put(t, x - 2, 29 - k, 'r');
        put(t, x + 3, 29 - k, 'r');
      }
    }
  }
  ellipse(t, 15, 30, 10, 2, 'N');
  return outline(t);
}
function kelp() {
  const t = tile();
  for (const [x0, ph] of [
    [8, 0],
    [14, 1.7],
    [20, 3.1],
    [25, 0.9],
  ])
    for (let y = 4; y < 31; y++) {
      const x = Math.round(x0 + Math.sin(y / 4 + ph) * 2);
      put(t, x, y, y % 5 === 0 ? 'G' : 'g');
      if (y % 6 === 2) put(t, x + 1, y, 'g');
    }
  return outline(t, 'v');
}
function watchCase() {
  const t = seabedSand();
  const p = tile();
  ellipse(p, 16, 17, 6, 6, 'x');
  ellipse(p, 16, 17, 4.5, 4.5, 'e');
  put(p, 16, 14, 't');
  put(p, 16, 15, 't');
  put(p, 17, 17, 't');
  rect(p, 15, 10, 17, 11, 'x'); // crown
  for (let k = 0; k < 7; k++) put(p, 22 + k, 18 + (k % 2), 'x'); // broken chain
  return over(t, outline(p));
}
function continuumSeal() {
  const t = tile();
  // An hourglass of light inside a ring — the Continuum mark.
  for (let k = 0; k < 40; k++) {
    const a = (k / 40) * Math.PI * 2;
    put(t, Math.round(16 + Math.cos(a) * 12), Math.round(16 + Math.sin(a) * 12), k % 4 ? 'c' : 'a');
  }
  for (let y = 7; y <= 25; y++) {
    const half = Math.max(1, Math.round(Math.abs(y - 16) * 0.6));
    for (let x = 16 - half; x <= 16 + half; x++) put(t, x, y, Math.abs(y - 16) < 3 ? 'a' : 'd');
  }
  return outline(t, 'v');
}

const NEW_TILES = [
  chimePillar(),
  crackedBell(),
  coral(),
  kelp(),
  shallowWater(),
  seabedSand(),
  watchCase(),
  continuumSeal(),
];
void rnd;

// ------------------------------------------------------------------ assemble + previews
const base = recolouredBase(); // 128 × 128
const extra = rasterTiles(NEW_TILES, P, 4); // 128 × 64
const sheet = { w: 128, h: base.h + extra.h, buf: Buffer.alloc(128 * (base.h + extra.h) * 4) };
base.buf.copy(sheet.buf, 0);
extra.buf.copy(sheet.buf, base.buf.length);

const outDir = path.resolve('art-source/environment/sunken/generated/candidates');
const previewDir = path.join(outDir, 'previews');
fs.mkdirSync(previewDir, { recursive: true });
const file = path.join(outDir, `sunken_tileset_${VERSION}.png`);
writeFile(file, encodePng(sheet.w, sheet.h, sheet.buf));
writeFile(path.join(previewDir, `sunken_tileset_${VERSION}_x4.png`), scaledPng(sheet, 4));
for (const [name, build] of [
  ['sunken_corridors', ruinsLayout],
  ['bell_sanctum', sanctumLayout],
]) {
  writeFile(
    path.join(previewDir, `${name}_${VERSION}.png`),
    scaledPng(renderLayout(sheet, build(), 4), 1),
  );
}
console.log(`✓ ${path.relative(process.cwd(), file)} (${sheet.w}x${sheet.h})`);
