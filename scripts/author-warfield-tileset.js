/**
 * CHRONO – "warfield" tileset for Chapter 4's endless battlefield (Pipeline B, AGENTS.md §5),
 * CHAPTER_04_DESIGN.md §2, §13.5.
 *
 * Tiles 0-42 are the approved wilds tiles (ENV_WILDS_001 v2) recoloured, colour by colour, into a
 * scorched-war palette (burnt earth, ash, charred trees, ember red instead of violet) — same shapes,
 * same indices, so wilds layouts and the wilds collision range carry over. Tiles 43-63 are new.
 * Deterministic; no image model, no external reference. Output:
 * art-source/environment/warfield/generated/candidates/ ONLY (owner approval required).
 *
 * 8 × 8 tiles of 32 px (256 × 256). New indices:
 *   ground (walkable): 43 arrow field · 44 duckboards · 45 shell crater · 46 ash drift · 47 blood mud
 *   walls layer (collide, 48-63): 48 war tent · 49 palisade · 50 spiked barrier · 51 torn banner ·
 *   52 siege wreck · 53 sword forest · 54 burnt chariot · 55 burial mound · 56 signal mirror ·
 *   57 cover rock · 58 treaty table · 59 memorial altar · 60 ritual pillar · 61 sandbags ·
 *   62 supply crates · 63 Finality Seal
 *
 * Usage: node scripts/author-warfield-tileset.js
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
  rasterTiles,
  scaledPng,
  renderLayout,
} from './pixel-art/tile-kit.js';

const VERSION = 'v1';
const COLS = 8;
const SOURCE = 'art-source/environment/wilds/generated/approved/wilds_tileset_v2.png';

/** Wilds palette (author-wilds-tileset.js) -> scorched battlefield. Unlisted colours stay. */
const RECOLOR = [
  ['#2c2a22', '#3a2e26'], // loam -> burnt earth
  ['#3a372b', '#4a3a30'],
  ['#1e1c17', '#241a16'],
  ['#4a4a2e', '#5e3e2a'], // dry leaf -> cinders
  ['#2f4a32', '#46423c'], // moss -> ash crust
  ['#3f6040', '#58534a'],
  ['#5a4c38', '#6a5040'], // trail
  ['#463a2a', '#503a2c'],
  ['#23271f', '#2e2420'], // mud
  ['#33392c', '#3e302a'],
  ['#8a96a0', '#8a8480'], // mist -> smoke
  ['#4e5658', '#5a524e'],
  ['#b8c2c8', '#b8aea4'],
  ['#7a5cd6', '#c84a2a'], // violet fracture -> ember
  ['#4a3a7a', '#7a2a1e'],
  ['#4a3a2a', '#2e2420'], // bark -> charred
  ['#33281c', '#1c1612'],
  ['#5a6a3a', '#5a4a3a'], // lichen
  ['#6a7a4a', '#7a6a48'], // salt grass -> dead grass
  ['#4a5a34', '#5a4a32'],
  ['#1d3a52', '#2e2a2a'], // sea -> murky river
  ['#142a3e', '#221e1e'],
  ['#2e5a7a', '#4a3a34'],
  ['#c8dce6', '#8a7a6a'],
  ['#1f3a24', '#2a2420'], // canopy -> burnt trees
  ['#2c5232', '#3a302a'],
  ['#3e6e42', '#4a3e34'],
  ['#0f1a12', '#140f0c'],
];

const P = {
  O: hex('#0c0a08'),
  d: hex('#3a2e26'), // burnt earth
  D: hex('#4a3a30'),
  k: hex('#241a16'),
  n: hex('#5e3e2a'), // cinders
  a: hex('#8a8480'), // ash
  A: hex('#5a524e'),
  q: hex('#b8aea4'), // pale ash
  m: hex('#2e2420'), // mud
  M: hex('#3e302a'),
  b: hex('#4a1e1a'), // blood mud
  B: hex('#6a2a22'),
  w: hex('#7a5a3a'), // wood
  W: hex('#5a402a'),
  x: hex('#3a2a1c'), // wood dark
  c: hex('#8a7a62'), // canvas
  C: hex('#6a5c48'),
  r: hex('#a82a2a'), // banner red
  R: hex('#701a1a'),
  i: hex('#9aa0a8'), // iron / blades
  I: hex('#5e646c'),
  s: hex('#7a7470'), // stone
  S: hex('#55504c'),
  t: hex('#9a948e'), // stone light
  e: hex('#ff8a3a'), // ember
  E: hex('#c84a2a'),
  f: hex('#e8dcc0'), // fletching / paper
  g: hex('#c8a040'), // gold seal
  G: hex('#8a6a28'),
  l: hex('#c8d8ff'), // mirror glint
  L: hex('#6a7a9a'),
  v: hex('#d8e0e8'), // finality white
  V: hex('#9aa8c0'),
  y: hex('#e0b860'), // candle flame
};

// ------------------------------------------------------------------ recoloured wilds 0-42
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

// ------------------------------------------------------------------ ground 43-47
function earth(seed) {
  return speckle(tile('d'), seed, [
    ['D', 12],
    ['k', 10],
    ['n', 3],
  ]);
}
function arrowField() {
  const t = earth(43);
  // Arrows stuck slantwise in the ground: shadow, wooden shaft, pale fletching.
  for (const [x, y, lean] of [
    [5, 5, 1],
    [20, 3, -1],
    [24, 17, 1],
    [9, 19, 0],
    [16, 11, -1],
  ]) {
    for (let k = 0; k < 9; k++) {
      const xx = x + Math.round((k * lean) / 3);
      put(t, xx, y + k, 'w');
      put(t, xx + 1, y + k, 'W');
    }
    rect(t, x - 1, y - 1, x - 1, y + 1, 'f');
    rect(t, x + 2, y - 1, x + 2, y + 1, 'f');
    const ex = x + Math.round((9 * lean) / 3);
    rect(t, ex - 1, y + 9, ex + 2, y + 9, 'k');
  }
  return t;
}
function duckboards() {
  const t = tile('m');
  speckle(t, 44, [['M', 18]]);
  for (let y = 2; y < T; y += 6) {
    rect(t, 3, y, 28, y + 3, 'w');
    rect(t, 3, y + 3, 28, y + 3, 'W');
    put(t, 6, y + 1, 'x');
    put(t, 25, y + 1, 'x');
  }
  rect(t, 3, 0, 4, T - 1, 'x');
  rect(t, 27, 0, 28, T - 1, 'x');
  return t;
}
function crater() {
  const t = earth(45);
  ellipse(t, 16, 16, 13, 11, 'k');
  ellipse(t, 16, 17, 10, 8, 'm');
  ellipse(t, 15, 18, 5, 4, 'k');
  for (let a = 0; a < 40; a++) {
    const r = (a / 40) * Math.PI * 2;
    put(t, Math.round(16 + Math.cos(r) * 14), Math.round(16 + Math.sin(r) * 12), 'D');
  }
  put(t, 20, 12, 'n');
  put(t, 9, 20, 'n');
  return t;
}
function ashDrift() {
  const t = tile('A');
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const v = Math.sin(x / 6 + y / 11) + Math.cos(y / 5 - x / 13);
      if (v > 0.2) put(t, x, y, rnd(x, y, 46) < 30 ? 'q' : 'a');
    }
  return speckle(t, 47, [['k', 3]]);
}
function bloodMud() {
  const t = tile('m');
  speckle(t, 48, [
    ['b', 22],
    ['B', 6],
    ['M', 10],
  ]);
  for (let x = 4; x < 14; x++) put(t, x, 11, 'B');
  for (let x = 18; x < 28; x++) put(t, x, 23, 'b');
  return t;
}

// ------------------------------------------------------------------ props 48-63 (transparent bg)
function warTent() {
  const t = tile('.');
  for (let y = 6; y < 28; y++) {
    const half = Math.round((y - 6) * 0.62);
    rect(t, 16 - half, y, 16 + half, y, y % 6 ? 'c' : 'C');
  }
  for (let y = 16; y < 28; y++) rect(t, 15, y, 17, y, 'x'); // open flap
  put(t, 16, 4, 'w');
  rect(t, 16, 2, 20, 4, 'r');
  rect(t, 2, 27, 30, 28, 'C');
  return outline(t);
}
function palisade() {
  const t = tile('.');
  for (let k = 0; k < 5; k++) {
    const x = 2 + k * 6;
    rect(t, x, 8, x + 4, 29, k % 2 ? 'w' : 'W');
    for (let y = 2; y < 8; y++)
      rect(t, x + Math.floor((y - 2) / 3), y, x + 4 - Math.floor((y - 2) / 3), y, 'w');
    put(t, x + 2, 2, 'x');
  }
  rect(t, 1, 14, 30, 15, 'x');
  rect(t, 1, 23, 30, 24, 'x');
  return outline(t);
}
function spikedBarrier() {
  const t = tile('.');
  rect(t, 3, 17, 28, 19, 'W');
  for (const [x0, y0, x1, y1] of [
    [4, 28, 14, 6],
    [14, 28, 4, 6],
    [18, 28, 28, 6],
    [28, 28, 18, 6],
  ]) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let k = 0; k <= n; k++) {
      const x = Math.round(x0 + ((x1 - x0) * k) / n);
      const y = Math.round(y0 + ((y1 - y0) * k) / n);
      put(t, x, y, k > n - 3 ? 'i' : 'w');
      put(t, x + 1, y, k > n - 3 ? 'I' : 'x');
    }
  }
  return outline(t);
}
function tornBanner() {
  const t = tile('.');
  rect(t, 8, 2, 9, 29, 'x');
  rect(t, 6, 28, 12, 29, 'W');
  for (let y = 3; y < 20; y++) {
    const len = 16 - ((y * 5) % 4) - Math.max(0, y - 14) * 2;
    for (let x = 0; x < len; x++)
      if (!((x === 7 && y > 8 && y < 11) || (x === 11 && y === 14)))
        put(t, 10 + x, y + Math.round(Math.sin(x / 3)), y % 5 ? 'r' : 'R');
  }
  return outline(t);
}
function siegeWreck() {
  const t = tile('.');
  ellipse(t, 12, 18, 9, 9, 'W');
  ellipse(t, 12, 18, 6, 6, '.');
  for (let a = 0; a < 6; a++) {
    const r = (a / 6) * Math.PI * 2;
    for (let k = 0; k < 7; k++)
      put(t, Math.round(12 + Math.cos(r) * k), Math.round(18 + Math.sin(r) * k), 'x');
  }
  ellipse(t, 12, 18, 2, 2, 'I');
  rect(t, 16, 22, 30, 25, 'w');
  rect(t, 22, 14, 24, 25, 'W');
  put(t, 27, 21, 'n');
  for (let k = 0; k < 3; k++) put(t, 20 + k * 3, 12 - k, 'A'); // smoke wisp
  return outline(t);
}
function swordForest() {
  const t = tile('.');
  for (const [x, top, lean] of [
    [5, 8, 1],
    [10, 4, 0],
    [15, 10, -1],
    [20, 6, 1],
    [25, 9, 0],
    [12, 14, 1],
    [22, 15, -1],
  ]) {
    for (let y = top; y < 28; y++) {
      const xx = x + Math.round(((y - top) * lean) / 10);
      put(t, xx, y, 'i');
      put(t, xx + 1, y, 'I');
    }
    rect(t, x - 2, top + 5, x + 2, top + 5, 'x');
    put(t, x, top - 1, 'G');
  }
  rect(t, 2, 27, 29, 29, 'k');
  return outline(t);
}
function burntChariot() {
  const t = tile('.');
  rect(t, 6, 10, 26, 20, 'x');
  rect(t, 6, 10, 26, 11, 'W');
  for (let x = 8; x < 26; x += 4) put(t, x, 14, 'n');
  for (const cx of [9, 23]) {
    ellipse(t, cx, 22, 6, 6, 'W');
    ellipse(t, cx, 22, 3, 3, 'x');
    put(t, cx, 22, 'I');
  }
  rect(t, 26, 13, 31, 14, 'W'); // broken shaft
  put(t, 14, 8, 'A');
  put(t, 18, 6, 'A');
  put(t, 16, 4, 'a');
  return outline(t);
}
function burialMound() {
  const t = tile('.');
  ellipse(t, 16, 22, 13, 7, 'D');
  ellipse(t, 16, 21, 11, 5, 'd');
  for (let k = 0; k < 10; k++) put(t, 6 + k * 2, 22 + (k % 2), 'k');
  rect(t, 15, 5, 16, 20, 'W'); // empty marker stake
  rect(t, 12, 9, 19, 10, 'W');
  return outline(t);
}
function signalMirror() {
  const t = tile('.');
  for (const [x0, x1] of [
    [8, 15],
    [24, 17],
    [16, 16],
  ])
    for (let y = 14; y < 30; y++)
      put(t, Math.round(x0 + ((x1 - x0) * (y - 14)) / 16), 29 - (y - 14), 'x');
  ellipse(t, 16, 9, 8, 7, 'I');
  ellipse(t, 16, 9, 6, 5, 'L');
  ellipse(t, 14, 7, 2, 2, 'l');
  put(t, 19, 11, 'l');
  return outline(t);
}
function coverRock() {
  const t = tile('.');
  ellipse(t, 16, 18, 13, 11, 's');
  ellipse(t, 13, 14, 7, 5, 't');
  ellipse(t, 20, 23, 8, 4, 'S');
  for (const [x, y] of [
    [9, 17],
    [22, 15],
    [17, 24],
  ])
    put(t, x, y, 'x'); // arrows stuck in the rock
  put(t, 10, 16, 'f');
  put(t, 23, 14, 'f');
  return outline(t);
}
function treatyTable() {
  const t = tile('.');
  rect(t, 3, 10, 28, 18, 't');
  rect(t, 3, 18, 28, 20, 's');
  rect(t, 5, 20, 8, 28, 'S');
  rect(t, 23, 20, 26, 28, 'S');
  for (let k = 0; k < 4; k++) rect(t, 5 + k * 6, 12, 8 + k * 6, 16, 'f'); // four empty slots
  for (let k = 0; k < 4; k++) put(t, 6 + k * 6, 14, 'C');
  return outline(t);
}
function memorialAltar() {
  const t = tile('.');
  rect(t, 6, 14, 25, 28, 's');
  rect(t, 4, 12, 27, 14, 't');
  rect(t, 8, 18, 23, 25, 'S');
  for (let y = 19; y < 25; y += 2) rect(t, 10, y, 21, y, 'A'); // carved names
  for (const x of [8, 23]) {
    rect(t, x, 8, x, 11, 'f');
    put(t, x, 7, 'y');
  }
  put(t, 15, 10, 'r');
  put(t, 16, 9, 'r');
  put(t, 17, 10, 'r');
  return outline(t);
}
function ritualPillar() {
  const t = tile('.');
  rect(t, 10, 6, 21, 28, 's');
  rect(t, 8, 26, 23, 29, 'S');
  rect(t, 8, 3, 23, 6, 't');
  for (let y = 9; y < 25; y += 4) rect(t, 12, y, 19, y, 'S');
  ellipse(t, 16, 16, 3, 3, 'V');
  put(t, 16, 16, 'v');
  return outline(t);
}
function sandbags() {
  const t = tile('.');
  for (let row = 0; row < 3; row++)
    for (let k = 0; k < 4 - (row === 2 ? 1 : 0); k++) {
      const x = 2 + k * 7 + (row % 2) * 3;
      const y = 22 - row * 6;
      ellipse(t, x + 3, y, 3.5, 2.6, row % 2 ? 'C' : 'c');
      put(t, x + 3, y - 1, 'f');
    }
  return outline(t);
}
function supplyCrates() {
  const t = tile('.');
  rect(t, 3, 14, 15, 27, 'w');
  rect(t, 3, 14, 15, 15, 'W');
  rect(t, 8, 14, 9, 27, 'x');
  rect(t, 16, 8, 28, 20, 'w');
  rect(t, 16, 8, 28, 9, 'W');
  rect(t, 21, 8, 22, 20, 'x');
  ellipse(t, 23, 25, 6, 4, 'c'); // sack
  ellipse(t, 23, 21, 3, 2, 'C');
  return outline(t);
}
function finalitySeal() {
  const t = tile('.');
  ellipse(t, 16, 16, 13, 13, 'V');
  ellipse(t, 16, 16, 11, 11, 'S');
  ellipse(t, 16, 16, 8, 8, 'v');
  rect(t, 15, 6, 17, 26, 'S'); // a closing line through the circle: the end of a sentence
  rect(t, 8, 15, 24, 17, 'S');
  ellipse(t, 16, 16, 3, 3, 'g');
  put(t, 16, 16, 'y');
  return outline(t);
}

const NEW_TILES = [
  arrowField(),
  duckboards(),
  crater(),
  ashDrift(),
  bloodMud(),
  warTent(),
  palisade(),
  spikedBarrier(),
  tornBanner(),
  siegeWreck(),
  swordForest(),
  burntChariot(),
  burialMound(),
  signalMirror(),
  coverRock(),
  treatyTable(),
  memorialAltar(),
  ritualPillar(),
  sandbags(),
  supplyCrates(),
  finalitySeal(),
];

// ------------------------------------------------------------------ assemble + previews
const base = recolouredBase(); // 256 × 192 (indices 0-47; 43-47 empty)
const sheet = { w: 256, h: 256, buf: Buffer.alloc(256 * 256 * 4) };
base.buf.copy(sheet.buf, 0);
const extra = rasterTiles(NEW_TILES, P, NEW_TILES.length); // one row strip
NEW_TILES.forEach((_, k) => {
  const idx = 43 + k;
  const dx = (idx % COLS) * T;
  const dy = Math.floor(idx / COLS) * T;
  for (let y = 0; y < T; y++)
    extra.buf.copy(
      sheet.buf,
      ((dy + y) * 256 + dx) * 4,
      (y * extra.w + k * T) * 4,
      (y * extra.w + k * T + T) * 4,
    );
});

// Sample scene for review: a trench line under arrow fire.
const W = 14;
const H = 9;
const ground = Array.from({ length: H }, (_, y) =>
  Array.from({ length: W }, (_, x) =>
    y === 4
      ? 44
      : (x + y) % 7 === 0
        ? 43
        : x > 10
          ? 46
          : y > 6 && x < 5
            ? 47
            : (x * 3 + y) % 11 === 0
              ? 45
              : 0,
  ),
);
const walls = Array.from({ length: H }, () => Array(W).fill(-1));
const place = (x, y, i) => (walls[y][x] = i);
for (let x = 0; x < W; x++) if (x !== 6) place(x, 0, 49);
place(1, 2, 48);
place(3, 2, 62);
place(5, 2, 51);
place(8, 2, 57);
place(10, 2, 50);
place(12, 2, 53);
place(2, 6, 61);
place(4, 6, 54);
place(7, 6, 55);
place(9, 6, 52);
place(11, 6, 56);
place(12, 7, 60);
place(1, 8, 58);
place(4, 8, 59);
place(7, 8, 63);
place(10, 8, 21); // a burnt elder tree from the recoloured wilds tiles
place(12, 8, 19);

const outDir = path.resolve('art-source/environment/warfield/generated/candidates');
const previewDir = path.join(outDir, 'previews');
fs.mkdirSync(previewDir, { recursive: true });
const file = path.join(outDir, `warfield_tileset_${VERSION}.png`);
writeFile(file, encodePng(sheet.w, sheet.h, sheet.buf));
writeFile(path.join(previewDir, `warfield_tileset_${VERSION}_x3.png`), scaledPng(sheet, 3));
writeFile(
  path.join(previewDir, `warfield_sample_${VERSION}.png`),
  scaledPng(renderLayout(sheet, { width: W, height: H, ground, walls }, COLS), 2),
);
void rnd;
console.log(`✓ ${path.relative(process.cwd(), file)} (${sheet.w}x${sheet.h})`);
