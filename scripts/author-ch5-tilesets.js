/**
 * CHRONO – Chapter 5 tilesets (Pipeline B, AGENTS.md §5), CHAPTER_05_DESIGN.md §3, §11:
 *
 * interval_tileset (128 × 384, 4 × 12): the approved sunken tiles 0-31 tinted to the Interval's
 *   violet-silver (same shapes and indices), + 32-47:
 *   collide 32 void · 33 branch sprout · 34 seed tree · 35-37 silver / copper / iron portraits ·
 *   38 swaddle throne · 39 anchor post · 40 Possibility Seal · 41 genealogy board · 42 grey stele ·
 *   43 seed plot; walkable 44 plank over the void · 45 shadow plank · 46 violet island · 47 grey island.
 *   Collision: GID 4-44 (indices 3-43).
 *
 * steel_tileset (128 × 256, 4 × 8): the approved dungeon tiles 0-15 tinted to Beta's rusted steel,
 *   + 16-31: collide 16 generator · 17 switch panel · 18 reactor core · 19 stopped clock tower ·
 *   20 pipes · 21 steel abyss · 22 bunk bed · 23 chalk-drawn wall · 24 wall clock · 25 safe ·
 *   26 watchmaker's bench · 27 wedding photo; walkable 28 steel plank · 29 shadow plank ·
 *   30 wooden floor · 31 grating. Collision: GID 4-28 (indices 3-27).
 *
 * Deterministic; no image model. Output: art-source/environment/{interval,steel}/generated/candidates/.
 * Usage: node scripts/author-ch5-tilesets.js
 */
import path from 'path';
import fs from 'fs';
import { hex, encodePng, writeFile } from './pixel-art/pixel.js';
import { parsePNG } from './validate-candidate.js';
import {
  T,
  tile,
  put,
  rect,
  ellipse,
  speckle,
  outline,
  rasterTiles,
  scaledPng,
} from './pixel-art/tile-kit.js';

/** Tints an approved sheet by luminance into a ramp; saturated glows map to `glow`. */
function tinted(file, ramp, glow) {
  const { ihdr, pixels } = parsePNG(file);
  const out = Buffer.from(pixels);
  const mix = (a, b, t) => Math.round(a + (b - a) * t);
  for (let i = 0; i < out.length; i += 4) {
    if (!out[i + 3]) continue;
    const [r, g, b] = [out[i], out[i + 1], out[i + 2]];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lum = (0.3 * r + 0.59 * g + 0.11 * b) / 255;
    let c;
    if (max - min > 90 && max > 150) c = glow(lum);
    else {
      const t = Math.min(0.999, lum * 1.35) * (ramp.length - 1);
      const k = Math.floor(t);
      const f = t - k;
      c = [0, 1, 2].map((ch) => mix(ramp[k][ch], ramp[k + 1][ch], f));
    }
    out[i] = c[0];
    out[i + 1] = c[1];
    out[i + 2] = c[2];
  }
  return { w: ihdr.width, h: ihdr.height, buf: out };
}

function sheetWith(base, extraTiles, palette, totalRows) {
  const cols = base.w / T;
  const sheet = { w: base.w, h: totalRows * T, buf: Buffer.alloc(base.w * totalRows * T * 4) };
  base.buf.copy(sheet.buf, 0);
  const strip = rasterTiles(extraTiles, palette, extraTiles.length);
  const first = (base.w / T) * (base.h / T);
  extraTiles.forEach((_, k) => {
    const idx = first + k;
    const dx = (idx % cols) * T;
    const dy = Math.floor(idx / cols) * T;
    for (let y = 0; y < T; y++)
      strip.buf.copy(
        sheet.buf,
        ((dy + y) * sheet.w + dx) * 4,
        (y * strip.w + k * T) * 4,
        (y * strip.w + k * T + T) * 4,
      );
  });
  return sheet;
}

// ------------------------------------------------------------------ interval tiles
const IP = {
  O: hex('#06050c'),
  v: hex('#0c0a16'), // void
  V: hex('#16122a'),
  s: [200, 190, 255, 255], // stars / sprout light
  g: hex('#b09aff'), // glow
  G: hex('#7a5cd6'),
  w: hex('#e8e0ff'),
  t: hex('#3a2e60'), // tree bark
  T: hex('#5a4a8a'),
  f: hex('#cfe6ff'), // fruit
  i: hex('#c8ccd4'), // silver frame
  c: hex('#b8784a'), // copper frame
  r: hex('#6a6e78'), // iron frame
  p: hex('#2a2448'), // portrait canvas
  q: hex('#efe8d8'), // swaddle
  Q: hex('#c8bfa8'),
  a: hex('#8a80b0'), // stone
  A: hex('#5a5080'),
  d: hex('#4a3e30'), // soil
  D: hex('#2e261c'),
  k: hex('#7a5a3a'), // plank
  K: hex('#5a402a'),
  h: [180, 160, 255, 120], // shadow plank
  u: hex('#4a3e76'), // violet island
  U: hex('#342a58'),
  y: hex('#7a7884'), // grey island
  Y: hex('#55525e'),
};
const voidTile = (seed) => {
  const t = tile('v');
  speckle(t, seed, [
    ['V', 18],
    ['s', 1],
  ]);
  return t;
};
const portrait = (frame) => {
  const t = tile('.');
  rect(t, 7, 4, 24, 27, frame);
  rect(t, 9, 6, 22, 25, 'p');
  ellipse(t, 16, 13, 4, 5, 'A');
  rect(t, 11, 19, 21, 25, 'A');
  return outline(t);
};
const INTERVAL_TILES = [
  voidTile(501),
  (() => {
    const t = tile('.');
    rect(t, 15, 18, 16, 28, 'T');
    ellipse(t, 16, 14, 5, 6, 'G');
    ellipse(t, 16, 14, 3, 4, 'g');
    ellipse(t, 16, 13, 1.5, 2, 'w');
    put(t, 10, 8, 's');
    put(t, 22, 10, 's');
    return outline(t);
  })(),
  (() => {
    const t = tile('.');
    rect(t, 14, 16, 18, 29, 't');
    ellipse(t, 16, 11, 11, 9, 'T');
    for (const [x, y] of [
      [9, 9],
      [20, 7],
      [14, 14],
      [23, 13],
      [11, 4],
    ])
      ellipse(t, x, y, 1.6, 1.6, 'f');
    return outline(t);
  })(),
  portrait('i'),
  portrait('c'),
  portrait('r'),
  (() => {
    const t = tile('.');
    rect(t, 7, 6, 24, 28, 'Q');
    rect(t, 9, 8, 22, 18, 'q');
    for (let y = 9; y < 28; y += 3) rect(t, 8, y, 23, y, 'Q');
    rect(t, 5, 18, 8, 28, 'q');
    rect(t, 23, 18, 26, 28, 'q');
    return outline(t);
  })(),
  (() => {
    const t = tile('.');
    rect(t, 14, 8, 17, 28, 'a');
    ellipse(t, 16, 7, 6, 6, 'g');
    ellipse(t, 16, 7, 4, 4, '.');
    rect(t, 10, 26, 21, 28, 'A');
    return outline(t);
  })(),
  (() => {
    const t = tile('.');
    ellipse(t, 16, 16, 9, 12, 'G');
    ellipse(t, 16, 15, 6, 9, 'g');
    ellipse(t, 16, 14, 2.5, 4, 'w');
    return outline(t);
  })(),
  (() => {
    const t = tile('.');
    rect(t, 4, 6, 27, 25, 'a');
    rect(t, 6, 8, 25, 23, 'q');
    for (const [x0, x1, y] of [
      [14, 17, 10],
      [8, 23, 15],
      [8, 11, 20],
      [13, 18, 20],
      [20, 23, 20],
    ])
      rect(t, x0, y, x1, y, 'A');
    rect(t, 15, 11, 16, 14, 'A');
    return outline(t);
  })(),
  (() => {
    const t = tile('.');
    rect(t, 10, 5, 21, 28, 'y');
    rect(t, 10, 5, 21, 6, 'Y');
    for (let y = 9; y < 25; y += 3) rect(t, 12, y, 19, y, 'Y');
    put(t, 8, 12, 'y');
    put(t, 23, 18, 'y');
    return outline(t);
  })(),
  (() => {
    const t = tile('.');
    ellipse(t, 16, 20, 11, 6, 'd');
    ellipse(t, 16, 19, 8, 4, 'D');
    ellipse(t, 16, 18, 2, 1.5, 'O');
    return outline(t);
  })(),
  (() => {
    const t = voidTile(512);
    rect(t, 3, 4, 28, 27, 'k');
    for (let x = 3; x < 29; x += 6) rect(t, x, 4, x, 27, 'K');
    return t;
  })(),
  (() => {
    const t = voidTile(513);
    for (let y = 4; y < 28; y++) for (let x = 3; x < 29; x++) if ((x + y) % 2) put(t, x, y, 'h');
    return t;
  })(),
  speckle(tile('u'), 514, [
    ['U', 20],
    ['g', 2],
  ]),
  speckle(tile('y'), 515, [
    ['Y', 25],
    ['V', 4],
  ]),
];

// ------------------------------------------------------------------ steel tiles
const SP = {
  O: hex('#08090c'),
  m: hex('#5a626e'), // steel
  M: hex('#3a404a'),
  n: hex('#8a94a2'),
  z: hex('#8a5432'), // rust
  o: hex('#e08a3a'), // reactor glow
  y: hex('#ffd07a'),
  v: hex('#0a0c10'), // abyss
  V: hex('#14181e'),
  k: hex('#8a6a46'), // wood
  K: hex('#6a4e32'),
  c: hex('#e8e4dc'), // chalk / photo light
  b: hex('#6ab0e0'),
  r: hex('#d06a5a'),
  g: hex('#f0d060'),
  h: [200, 220, 255, 110],
  w: hex('#c8ccd4'),
};
const ST = (fn) => outline(fn(tile('.')));
const STEEL_TILES = [
  ST((t) => {
    rect(t, 6, 8, 25, 28, 'm');
    rect(t, 6, 8, 25, 9, 'n');
    ellipse(t, 16, 18, 5, 5, 'M');
    ellipse(t, 16, 18, 2.5, 2.5, 'o');
    put(t, 9, 25, 'z');
    return t;
  }),
  ST((t) => {
    rect(t, 8, 6, 23, 26, 'M');
    rect(t, 10, 8, 21, 24, 'm');
    for (const y of [11, 16, 21]) rect(t, 12, y, 19, y + 1, 'n');
    put(t, 14, 11, 'o');
    return t;
  }),
  ST((t) => {
    ellipse(t, 16, 17, 12, 11, 'M');
    ellipse(t, 16, 17, 8, 7, 'o');
    ellipse(t, 16, 17, 4, 3.5, 'y');
    return t;
  }),
  ST((t) => {
    rect(t, 10, 2, 21, 29, 'm');
    ellipse(t, 16, 9, 5, 5, 'c');
    put(t, 16, 9, 'O');
    put(t, 16, 6, 'O');
    put(t, 18, 10, 'O');
    put(t, 13, 20, 'z');
    return t;
  }),
  ST((t) => {
    rect(t, 2, 8, 29, 11, 'm');
    rect(t, 2, 18, 29, 21, 'M');
    rect(t, 12, 8, 15, 21, 'n');
    put(t, 22, 9, 'z');
    return t;
  }),
  (() => {
    const t = tile('v');
    speckle(t, 616, [['V', 22]]);
    return t;
  })(),
  ST((t) => {
    rect(t, 4, 8, 27, 13, 'k');
    rect(t, 4, 18, 27, 23, 'k');
    rect(t, 4, 6, 6, 26, 'K');
    rect(t, 25, 6, 27, 26, 'K');
    rect(t, 7, 9, 13, 12, 'c');
    return t;
  }),
  (() => {
    const t = tile('M');
    speckle(t, 618, [['m', 20]]);
    ellipse(t, 9, 8, 4, 2, 'c');
    ellipse(t, 22, 6, 3, 3, 'g');
    rect(t, 4, 20, 28, 20, 'b');
    rect(t, 6, 24, 26, 24, 'r');
    put(t, 15, 14, 'c');
    put(t, 17, 13, 'c');
    return t;
  })(),
  ST((t) => {
    ellipse(t, 16, 14, 9, 9, 'K');
    ellipse(t, 16, 14, 7, 7, 'c');
    rect(t, 16, 9, 16, 14, 'O');
    rect(t, 16, 14, 19, 14, 'O');
    rect(t, 15, 23, 17, 28, 'K');
    return t;
  }),
  ST((t) => {
    rect(t, 6, 6, 25, 27, 'M');
    rect(t, 8, 8, 23, 25, 'm');
    ellipse(t, 16, 16, 4, 4, 'n');
    put(t, 16, 16, 'O');
    rect(t, 20, 15, 21, 18, 'w');
    return t;
  }),
  ST((t) => {
    rect(t, 3, 12, 28, 16, 'k');
    rect(t, 3, 16, 28, 17, 'K');
    rect(t, 5, 17, 7, 27, 'K');
    rect(t, 24, 17, 26, 27, 'K');
    ellipse(t, 11, 11, 3, 2, 'w');
    put(t, 19, 11, 'n');
    return t;
  }),
  ST((t) => {
    rect(t, 8, 5, 23, 24, 'K');
    rect(t, 10, 7, 21, 22, 'c');
    ellipse(t, 13, 12, 2, 2.5, 'k');
    ellipse(t, 18, 12, 2, 2.5, 'k');
    rect(t, 12, 16, 19, 21, 'b');
    return t;
  }),
  (() => {
    const t = tile('v');
    rect(t, 3, 4, 28, 27, 'm');
    for (let x = 3; x < 29; x += 5) rect(t, x, 4, x, 27, 'M');
    return t;
  })(),
  (() => {
    const t = tile('v');
    for (let y = 4; y < 28; y++) for (let x = 3; x < 29; x++) if ((x + y) % 2) put(t, x, y, 'h');
    return t;
  })(),
  (() => {
    const t = tile('k');
    for (let y = 0; y < T; y += 8) rect(t, 0, y, T - 1, y, 'K');
    return speckle(t, 630, [['K', 6]]);
  })(),
  (() => {
    const t = tile('M');
    for (let y = 2; y < T; y += 4) rect(t, 0, y, T - 1, y, 'm');
    for (let x = 2; x < T; x += 4) rect(t, x, 0, x, T - 1, 'm');
    return t;
  })(),
];

// ------------------------------------------------------------------ assemble
const INTERVAL_RAMP = [
  [10, 8, 20],
  [36, 28, 64],
  [74, 62, 118],
  [138, 128, 176],
  [224, 220, 244],
];
const STEEL_RAMP = [
  [10, 12, 16],
  [38, 42, 50],
  [74, 80, 92],
  [126, 134, 148],
  [208, 212, 220],
];
const interval = sheetWith(
  tinted('public/assets/tilesets/sunken_tileset.png', INTERVAL_RAMP, (l) => [
    Math.round(150 + l * 80),
    Math.round(120 + l * 90),
    255,
  ]),
  INTERVAL_TILES,
  IP,
  12,
);
const steel = sheetWith(
  tinted('public/assets/tilesets/dungeon_tileset.png', STEEL_RAMP, (l) => [
    255,
    Math.round(120 + l * 80),
    Math.round(40 + l * 40),
  ]),
  STEEL_TILES,
  SP,
  8,
);
for (const [name, sheet] of [
  ['interval', interval],
  ['steel', steel],
]) {
  const dir = path.resolve(`art-source/environment/${name}/generated/candidates`);
  fs.mkdirSync(path.join(dir, 'previews'), { recursive: true });
  const file = path.join(dir, `${name}_tileset_v1.png`);
  writeFile(file, encodePng(sheet.w, sheet.h, sheet.buf));
  writeFile(path.join(dir, 'previews', `${name}_tileset_v1_x3.png`), scaledPng(sheet, 3));
  console.log(`✓ ${path.relative(process.cwd(), file)} (${sheet.w}x${sheet.h})`);
}
