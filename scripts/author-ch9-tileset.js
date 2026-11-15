/**
 * CHRONO – Chapter 9 tileset (Pipeline B, .agents/rules/chrono-art.md §4), "The Fractured Divinity"
 * (design: docs/story/CHAPTER_09_DESIGN.md §13 with §20):
 *
 * nexus_tileset (128 × 512, 4 × 16): the approved dungeon tiles 0-15 tinted nexus violet with cyan
 *   glows (same shapes and indices), + 16-63:
 *   collide 16 star abyss · 17 crystal shards · 18 cracked mirror crystal · 19 gear wall ·
 *   20 inscription plinth · 21 plinth (page lit) · 22 the empty chair · 23 throne of origin ·
 *   24 tri-scales · 25 spectral prism · 26 red crystal · 27 blue crystal · 28 green crystal ·
 *   29 statue of Chronos · 30 statue of Kuro · 31 statue of Thiên Nguyên · 32 pendulum ·
 *   33 palimpsest lectern · 34 penrose pillar · 35 magic-square stone · 36 crystal chime ·
 *   37 astrolabe · 38 stele of vows · 39 quantum gear · 40 octagon pillar (dark) · 41 (lit) ·
 *   42 gold chain wall · 43 violet storm barrier · 44 twisted possibility tree · 45 broken mirror ·
 *   46 handless clock face · 47 six-seal socket;
 *   walkable 48 nexus floor · 49 gold-edged floor · 50 star bridge · 51 crystal floor ·
 *   52 gear floor · 53 starfield floor · 54 penrose step (lit) · 55 Khánh Hòa sand ·
 *   56 clock-shop boards · 57 cyan rune path · 58 violet branch path · 59 mirror floor ·
 *   60 gold chain bridge · 61 shore (sea edge) · 62 faded · 63 cyan-glow floor.
 *   Collision: GID 4-48 (indices 3-47).
 *
 * Deterministic; no image model. Output: art-source/environment/nexus/generated/candidates/.
 * Usage: node scripts/author-ch9-tileset.js
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
function tinted(file, ramp, glow, gain) {
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
      const t = Math.min(0.999, lum * gain) * (ramp.length - 1);
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

const P = {
  O: hex('#07040e'),
  v: hex('#1a0933'), // nexus void violet
  V: hex('#2e1656'),
  s: hex('#f4f0ff'), // stars
  g: hex('#e5c158'), // torn gold chain
  G: hex('#9a7a2a'),
  y: hex('#fff2b8'),
  c: hex('#00c8ff'), // cyan of the Unwritten
  C: hex('#0a7ab0'),
  w: hex('#eef2ff'), // crystal white
  W: hex('#b8c4e8'),
  k: hex('#3a2e52'), // stone
  K: hex('#241a38'),
  n: hex('#5c4e7a'),
  m: hex('#8a8aa8'), // steel
  M: hex('#565a70'),
  r: hex('#e04a4a'), // red crystal
  b: hex('#4a8ae0'), // blue crystal
  e: hex('#4ac070'), // green crystal
  p: hex('#a07cf0'), // possibility violet
  P: hex('#6a4ab0'),
  t: hex('#8a6a42'), // wood
  T: hex('#5e4628'),
  a: hex('#e2c896'), // Khánh Hòa sand
  A: hex('#b89a68'),
  o: hex('#3a8ab8'), // sea
  h: [240, 200, 96, 150], // faded outline
  l: [0, 200, 255, 90], // cyan glow
};
const C = (fn) => outline(fn(tile('.')));
const fill = (base, seed, picks) => speckle(tile(base), seed, picks);
const crystal = (ch, dark) =>
  C((t) => {
    for (let y = 6; y < 28; y++) {
      const half = Math.round(6 - Math.abs(y - 17) * 0.45);
      if (half > 0) rect(t, 16 - half, y, 16 + half, y, y % 4 ? ch : dark);
    }
    put(t, 14, 11, 'w');
    put(t, 15, 12, 'w');
    return t;
  });
const statue = (head, robe, mark) =>
  C((t) => {
    rect(t, 8, 25, 23, 29, 'k');
    rect(t, 11, 12, 20, 25, robe);
    ellipse(t, 15.5, 9, 4, 4.5, head);
    rect(t, 14, 15, 17, 17, mark);
    return t;
  });
const pillar = (lit) =>
  C((t) => {
    rect(t, 11, 5, 20, 28, 'K');
    rect(t, 12, 6, 19, 27, 'k');
    rect(t, 9, 26, 22, 29, 'n');
    ellipse(t, 15.5, 5, 5, 2, lit ? 'c' : 'n');
    if (lit) {
      rect(t, 15, 8, 16, 24, 'c');
      put(t, 15, 3, 'w');
    }
    return t;
  });

const COLLIDE = [
  // 16 star abyss
  (() => {
    const t = tile('v');
    return speckle(t, 901, [
      ['V', 16],
      ['s', 2],
      ['p', 1],
    ]);
  })(),
  // 17 crystal shard wall
  (() => {
    const t = tile('V');
    for (const [x, h] of [
      [4, 20],
      [11, 26],
      [18, 22],
      [25, 18],
    ])
      for (let y = 31 - h; y < 32; y++)
        rect(t, x, y, x + 4 - Math.round((32 - y) / 9), y, y % 3 ? 'W' : 'w');
    return t;
  })(),
  // 18 cracked mirror crystal
  C((t) => {
    rect(t, 8, 3, 23, 28, 'W');
    rect(t, 10, 5, 21, 26, 'w');
    for (let k = 0; k < 10; k++) put(t, 12 + k, 7 + k * 2, 'V');
    for (let k = 0; k < 6; k++) put(t, 20 - k, 9 + k * 2, 'V');
    return t;
  }),
  // 19 gear wall
  (() => {
    const t = tile('K');
    ellipse(t, 16, 16, 12, 12, 'G');
    ellipse(t, 16, 16, 9, 9, 'g');
    ellipse(t, 16, 16, 3, 3, 'K');
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      rect(
        t,
        Math.round(16 + Math.cos(a) * 12) - 1,
        Math.round(16 + Math.sin(a) * 12) - 1,
        Math.round(16 + Math.cos(a) * 12) + 1,
        Math.round(16 + Math.sin(a) * 12) + 1,
        'y',
      );
    }
    return t;
  })(),
  // 20 inscription plinth (dark), 21 plinth (lit page)
  ...[false, true].map((lit) =>
    C((t) => {
      rect(t, 9, 14, 22, 29, 'k');
      rect(t, 7, 12, 24, 14, 'n');
      rect(t, 11, 6, 20, 11, lit ? 'w' : 'W');
      if (lit) {
        rect(t, 12, 8, 19, 8, 'c');
        put(t, 15, 4, 'c');
        put(t, 16, 3, 'c');
      }
      return t;
    }),
  ),
  // 22 the empty chair
  C((t) => {
    rect(t, 10, 4, 21, 18, 'w');
    rect(t, 11, 5, 20, 17, 'W');
    rect(t, 8, 18, 23, 21, 'w');
    rect(t, 9, 22, 10, 28, 'W');
    rect(t, 21, 22, 22, 28, 'W');
    return t;
  }),
  // 23 throne of origin
  C((t) => {
    rect(t, 6, 2, 25, 18, 'G');
    rect(t, 8, 4, 23, 17, 'g');
    ellipse(t, 15.5, 9, 4, 4, 'y');
    rect(t, 4, 18, 27, 22, 'G');
    rect(t, 6, 23, 8, 29, 'G');
    rect(t, 23, 23, 25, 29, 'G');
    return t;
  }),
  // 24 tri-scales
  C((t) => {
    rect(t, 15, 6, 16, 27, 'G');
    rect(t, 4, 8, 27, 9, 'g');
    for (const x of [4, 15.5, 27]) ellipse(t, x, 15, 3.5, 1.5, 'g');
    for (const x of [4, 27]) rect(t, x, 10, x, 14, 'G');
    rect(t, 10, 27, 21, 29, 'G');
    return t;
  }),
  // 25 spectral prism
  C((t) => {
    for (let y = 5; y < 27; y++) {
      const half = Math.round((y - 5) * 0.5);
      rect(t, 16 - half, y, 16 + half, y, 'w');
    }
    put(t, 16, 12, 'r');
    put(t, 13, 20, 'e');
    put(t, 19, 20, 'b');
    return t;
  }),
  crystal('r', 'w'),
  crystal('b', 'w'),
  crystal('e', 'w'),
  // 29 statue Chronos, 30 statue Kuro, 31 statue Thiên Nguyên
  statue('w', 'g', 'G'),
  statue('K', 'm', 'p'),
  statue('W', 'W', 'c'),
  // 32 pendulum
  C((t) => {
    rect(t, 6, 2, 25, 4, 'G');
    rect(t, 15, 4, 16, 22, 'g');
    ellipse(t, 15.5, 25, 5, 4, 'G');
    ellipse(t, 15.5, 25, 3, 2, 'y');
    return t;
  }),
  // 33 palimpsest lectern
  C((t) => {
    rect(t, 14, 15, 17, 29, 'T');
    rect(t, 6, 8, 25, 15, 't');
    rect(t, 8, 9, 23, 14, 'a');
    rect(t, 10, 10, 21, 10, 'g');
    rect(t, 10, 12, 18, 12, 'p');
    rect(t, 10, 13, 15, 13, 'c');
    return t;
  }),
  // 34 penrose pillar
  C((t) => {
    for (let k = 0; k < 4; k++)
      rect(t, 6 + k * 4, 24 - k * 6, 13 + k * 4, 28 - k * 6, k % 2 ? 'k' : 'n');
    return t;
  }),
  // 35 magic-square stone
  C((t) => {
    rect(t, 5, 5, 26, 26, 'n');
    rect(t, 7, 7, 24, 24, 'k');
    for (const v of [12, 19]) {
      rect(t, v, 7, v, 24, 'n');
      rect(t, 7, v, 24, v, 'n');
    }
    return t;
  }),
  // 36 crystal chime
  C((t) => {
    rect(t, 8, 3, 23, 4, 'G');
    rect(t, 15, 4, 16, 8, 'G');
    for (let y = 9; y < 26; y++) {
      const half = Math.round(3 + (y - 9) * 0.3);
      rect(t, 16 - half, y, 16 + half, y, y % 5 ? 'W' : 'w');
    }
    return t;
  }),
  // 37 astrolabe
  C((t) => {
    ellipse(t, 16, 16, 12, 12, 'G');
    ellipse(t, 16, 16, 10, 10, 'K');
    for (const [r, ch] of [
      [8, 'g'],
      [5, 'c'],
      [2, 'y'],
    ])
      for (let k = 0; k < 32; k++) {
        const a = (k / 32) * Math.PI * 2;
        put(t, 16 + Math.round(Math.cos(a) * r), 16 + Math.round(Math.sin(a) * r), ch);
      }
    return t;
  }),
  // 38 tomb-of-vows stele
  C((t) => {
    rect(t, 9, 6, 22, 28, 'n');
    ellipse(t, 15.5, 6, 6.5, 3, 'n');
    for (const y of [11, 15, 19, 23]) rect(t, 12, y, 19, y, 'K');
    return t;
  }),
  // 39 quantum gear
  C((t) => {
    ellipse(t, 16, 16, 11, 11, 'P');
    ellipse(t, 16, 16, 8, 8, 'p');
    ellipse(t, 16, 16, 3, 3, 'c');
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      rect(
        t,
        Math.round(16 + Math.cos(a) * 12) - 1,
        Math.round(16 + Math.sin(a) * 12) - 1,
        Math.round(16 + Math.cos(a) * 12) + 1,
        Math.round(16 + Math.sin(a) * 12) + 1,
        'P',
      );
    }
    return t;
  }),
  pillar(false),
  pillar(true),
  // 42 gold chain wall
  C((t) => {
    rect(t, 0, 8, 31, 24, 'K');
    for (let x = 1; x < 31; x += 4) {
      rect(t, x, 10, x + 2, 12, 'g');
      rect(t, x + 2, 18, x + 4, 20, 'G');
    }
    return t;
  }),
  // 43 violet storm barrier (Kuro)
  (() => {
    const t = tile('P');
    for (let y = 0; y < 32; y++) {
      const x = 16 + Math.round(Math.sin(y / 3) * 8);
      rect(t, x - 2, y, x + 2, y, 'p');
      if (y % 5 === 0) put(t, (x + 9) % 32, y, 'w');
    }
    return t;
  })(),
  // 44 twisted possibility tree
  C((t) => {
    rect(t, 14, 14, 17, 29, 'P');
    for (const [x, y] of [
      [6, 6],
      [26, 5],
      [9, 12],
      [23, 11],
      [16, 3],
    ]) {
      const n = Math.max(Math.abs(x - 16), Math.abs(y - 14));
      for (let i = 0; i <= n; i++)
        put(t, Math.round(16 + ((x - 16) * i) / n), Math.round(14 + ((y - 14) * i) / n), 'p');
      put(t, x, y, 'c');
    }
    return t;
  }),
  // 45 broken mirror
  C((t) => {
    rect(t, 9, 4, 22, 27, 'm');
    rect(t, 11, 6, 20, 25, 'W');
    for (const [x, y] of [
      [13, 8],
      [18, 12],
      [12, 18],
      [17, 22],
    ])
      rect(t, x, y, x + 2, y, 'K');
    return t;
  }),
  // 46 clock face without hands
  (() => {
    const t = tile('V');
    ellipse(t, 16, 16, 14, 14, 'G');
    ellipse(t, 16, 16, 12, 12, 'w');
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      put(t, 16 + Math.round(Math.sin(a) * 10), 16 - Math.round(Math.cos(a) * 10), 'K');
    }
    return t;
  })(),
  // 47 seal socket (six-colour ring)
  C((t) => {
    ellipse(t, 16, 16, 11, 11, 'G');
    ellipse(t, 16, 16, 8, 8, 'K');
    ['b', 'g', 'c', 'r', 'p', 'w'].forEach((ch, k) => {
      const a = (k / 6) * Math.PI * 2;
      ellipse(t, 16 + Math.cos(a) * 6, 16 + Math.sin(a) * 6, 1.5, 1.5, ch);
    });
    return t;
  }),
];

const WALK = [
  fill('V', 911, [
    ['v', 14],
    ['n', 3],
  ]),
  (() => {
    const t = fill('V', 912, [['v', 10]]);
    rect(t, 0, 0, 31, 1, 'G');
    rect(t, 0, 30, 31, 31, 'G');
    return t;
  })(),
  (() => {
    const t = tile('v');
    rect(t, 0, 9, 31, 22, 'K');
    for (let x = 0; x < 32; x += 4) rect(t, x, 10, x + 2, 21, 'n');
    for (let x = 1; x < 32; x += 6) put(t, x, 15, 's');
    return t;
  })(),
  fill('W', 913, [
    ['w', 12],
    ['c', 1],
  ]),
  (() => {
    const t = tile('K');
    for (let r = 4; r <= 16; r += 6)
      for (let k = 0; k < 64; k++) {
        const a = (k / 64) * Math.PI * 2;
        put(t, 16 + Math.round(Math.cos(a) * r), 16 + Math.round(Math.sin(a) * r), 'G');
      }
    return t;
  })(),
  fill('V', 914, [
    ['s', 2],
    ['W', 10],
  ]),
  (() => {
    const t = tile('n');
    rect(t, 0, 0, 31, 3, 'c');
    rect(t, 0, 28, 31, 31, 'K');
    return t;
  })(),
  fill('a', 915, [['A', 14]]),
  (() => {
    const t = tile('t');
    for (let y = 0; y < 32; y += 8) rect(t, 0, y, 31, y, 'T');
    return t;
  })(),
  (() => {
    const t = fill('K', 916, [['n', 8]]);
    for (let y = 0; y < 32; y++) {
      const x = 16 + Math.round(Math.sin(y / 5) * 2);
      put(t, x, y, 'c');
    }
    return t;
  })(),
  (() => {
    const t = fill('V', 917, [['v', 8]]);
    for (let y = 0; y < 32; y++) {
      const x = 16 + Math.round(Math.sin(y / 4) * 3);
      put(t, x, y, 'p');
      put(t, x + 1, y, 'P');
    }
    return t;
  })(),
  (() => {
    const t = tile('W');
    for (let k = 0; k < 32; k += 8) {
      rect(t, k, 0, k, 31, 'm');
      rect(t, 0, k, 31, k, 'm');
    }
    return t;
  })(),
  (() => {
    const t = tile('v');
    rect(t, 0, 9, 31, 22, 'G');
    for (let x = 1; x < 31; x += 4) rect(t, x, 11, x + 2, 20, 'g');
    return t;
  })(),
  (() => {
    const t = fill('o', 918, [['w', 4]]);
    rect(t, 0, 24, 31, 31, 'a');
    return t;
  })(),
  (() => {
    const t = tile('.');
    for (let k = 2; k < 30; k++)
      if (k % 4 < 2) {
        put(t, k, 3, 'h');
        put(t, k, 28, 'h');
        put(t, 3, k, 'h');
        put(t, 28, k, 'h');
      }
    return t;
  })(),
  (() => {
    const t = fill('V', 919, [['v', 10]]);
    for (let y = 0; y < 32; y += 8) for (let x = 0; x < 32; x++) if (x % 2 === 0) put(t, x, y, 'C');
    for (const [x, y] of [
      [4, 4],
      [20, 12],
      [12, 28],
    ])
      put(t, x, y, 'c');
    return t;
  })(),
];

const EXTRA = [...COLLIDE, ...WALK];
if (COLLIDE.length !== 32 || WALK.length !== 16)
  throw new Error(`expected 32 + 16 tiles, got ${COLLIDE.length} + ${WALK.length}`);

const NEXUS_RAMP = [
  [6, 3, 14],
  [26, 12, 50],
  [54, 32, 92],
  [110, 90, 150],
  [226, 214, 250],
];
const sheet = sheetWith(
  tinted(
    'public/assets/tilesets/dungeon_tileset.png',
    NEXUS_RAMP,
    (l) => [Math.round(40 + l * 60), Math.round(190 + l * 50), 255],
    1.5,
  ),
  EXTRA,
  P,
  16,
);
const dir = path.resolve('art-source/environment/nexus/generated/candidates');
fs.mkdirSync(path.join(dir, 'previews'), { recursive: true });
const file = path.join(dir, 'nexus_tileset_v1.png');
writeFile(file, encodePng(sheet.w, sheet.h, sheet.buf));
writeFile(path.join(dir, 'previews', 'nexus_tileset_v1_x3.png'), scaledPng(sheet, 3));
console.log(`✓ ${path.relative(process.cwd(), file)} (${sheet.w}x${sheet.h})`);
