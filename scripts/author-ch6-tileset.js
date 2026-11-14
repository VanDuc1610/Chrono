/**
 * CHRONO – Chapter 6 tileset (Pipeline B, AGENTS.md §5), CHAPTER_06_DESIGN.md §12, §17:
 *
 * celestial_tileset (128 × 384, 4 × 12): the approved dungeon tiles 0-15 tinted to the Celestial
 *   Realm's white marble and gold (same shapes and indices), + 16-47:
 *   collide 16 star void · 17 broken column · 18 platinum gear · 19 mirror "/" · 20 mirror "\" ·
 *   21 lamp · 22 prism · 23 brass pillar · 24 archon eye (dark) · 25 archon eye (lit) ·
 *   26 glyph altar · 27 glyph stele · 28 mural · 29 authority altar · 30 authority altar (lit) ·
 *   31 mute bell · 32 stone shelf · 33 archon statue · 34 broken throne · 35-38 chess sun / moon /
 *   comet / void · 39 empty chess cell · 40 gold ring wall · 41 light cascade · 42 light curtain ·
 *   43 Origin seal; walkable 44 frozen crystal step · 45 ring gap · 46 cloud bridge · 47 star dust.
 *   Collision: GID 4-44 (indices 3-43).
 *
 * Deterministic; no image model. Output: art-source/environment/celestial/generated/candidates/.
 * Usage: node scripts/author-ch6-tileset.js
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
      const t = Math.min(0.999, 0.25 + lum * 2.1) * (ramp.length - 1);
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

const CP = {
  O: hex('#0c0a14'),
  v: hex('#0a0814'), // void between stars
  V: hex('#1c1630'),
  s: hex('#f4ecff'), // stars
  p: hex('#8a6ad8'), // violet nebula
  m: hex('#ece6da'), // marble
  M: hex('#c8bfae'),
  n: hex('#9a907e'),
  g: hex('#e8c060'), // gold
  G: hex('#b08a30'),
  w: hex('#fffbe8'), // white light
  y: hex('#ffe9a0'), // warm light
  b: hex('#58b8ff'), // blue light
  B: hex('#2a78c8'),
  k: hex('#c8ccd8'), // platinum
  K: hex('#8a90a0'),
  r: hex('#b06a2a'), // brass
  R: hex('#7a4618'),
  e: hex('#3a2a50'), // dark eye
  q: hex('#5a4a3a'), // shelf wood / book
  Q: hex('#8a3a3a'),
  c: hex('#d8f0ff'), // crystal
  C: hex('#98c8e8'),
  d: [255, 240, 200, 160], // cloud
  D: [230, 220, 255, 120],
  h: [255, 236, 170, 140], // curtain light
};
const C = (fn) => outline(fn(tile('.')));
const starVoid = (seed) => {
  const t = tile('v');
  speckle(t, seed, [
    ['V', 16],
    ['p', 4],
    ['s', 2],
  ]);
  return t;
};
const mirror = (slash) =>
  C((t) => {
    rect(t, 9, 24, 22, 28, 'M');
    rect(t, 14, 18, 17, 24, 'k');
    for (let i = 0; i < 16; i++) {
      const x = slash ? 8 + i : 23 - i;
      const y = 3 + i;
      rect(t, x, y, x + 1, y, 'c');
      put(t, x + 2, y, 'C');
    }
    return t;
  });
const eye = (lit) =>
  C((t) => {
    rect(t, 9, 10, 22, 28, 'm');
    rect(t, 9, 26, 22, 28, 'M');
    ellipse(t, 16, 9, 6, 6, 'm');
    ellipse(t, 16, 9, 3, 2, lit ? 'b' : 'e');
    if (lit) put(t, 16, 9, 'w');
    rect(t, 12, 16, 19, 17, 'g');
    return t;
  });
const authority = (lit) =>
  C((t) => {
    rect(t, 7, 14, 24, 28, 'M');
    rect(t, 9, 12, 22, 14, 'm');
    ellipse(t, 16, 20, 4, 4, lit ? 'y' : 'n');
    if (lit) {
      ellipse(t, 16, 7, 4, 5, 'y');
      ellipse(t, 16, 7, 2, 3, 'w');
    }
    return t;
  });
const piece = (draw) =>
  C((t) => {
    rect(t, 4, 4, 27, 27, 'M');
    rect(t, 6, 6, 25, 25, 'm');
    draw(t);
    return t;
  });
const CELESTIAL_TILES = [
  starVoid(601),
  C((t) => {
    rect(t, 10, 8, 21, 28, 'm');
    for (let x = 11; x < 21; x += 3) rect(t, x, 9, x, 27, 'M');
    rect(t, 8, 26, 23, 28, 'M');
    rect(t, 10, 6, 15, 8, 'm');
    rect(t, 17, 4, 21, 8, 'n');
    return t;
  }),
  C((t) => {
    ellipse(t, 16, 16, 13, 13, 'k');
    ellipse(t, 16, 16, 9, 9, 'K');
    ellipse(t, 16, 16, 4, 4, 'k');
    for (let a = 0; a < 8; a++) {
      const x = 16 + Math.cos((a * Math.PI) / 4) * 13;
      const y = 16 + Math.sin((a * Math.PI) / 4) * 13;
      ellipse(t, Math.round(x), Math.round(y), 2, 2, 'K');
    }
    put(t, 12, 10, 'r');
    return t;
  }),
  mirror(true),
  mirror(false),
  C((t) => {
    rect(t, 12, 18, 19, 28, 'G');
    rect(t, 10, 16, 21, 18, 'g');
    ellipse(t, 16, 11, 5, 6, 'y');
    ellipse(t, 16, 12, 3, 4, 'w');
    return t;
  }),
  C((t) => {
    rect(t, 11, 22, 20, 28, 'M');
    for (let y = 6; y < 22; y++) {
      const half = Math.round((y - 6) * 0.45);
      rect(t, 16 - half, y, 16 + half, y, y % 3 ? 'c' : 'b');
    }
    return t;
  }),
  C((t) => {
    rect(t, 11, 6, 20, 28, 'r');
    rect(t, 11, 6, 13, 28, 'R');
    rect(t, 9, 4, 22, 6, 'r');
    rect(t, 9, 26, 22, 28, 'R');
    return t;
  }),
  eye(false),
  eye(true),
  C((t) => {
    rect(t, 5, 12, 26, 28, 'M');
    rect(t, 6, 10, 25, 12, 'm');
    for (const x of [9, 15, 21]) {
      rect(t, x, 15, x + 3, 22, 'n');
      put(t, x + 1, 17, 'g');
      put(t, x + 2, 19, 'g');
    }
    return t;
  }),
  C((t) => {
    rect(t, 8, 4, 23, 28, 'm');
    rect(t, 8, 26, 23, 28, 'M');
    for (const [x, y] of [
      [11, 8],
      [17, 8],
      [11, 15],
      [17, 15],
      [14, 21],
    ]) {
      rect(t, x, y, x + 3, y, 'G');
      rect(t, x + 1, y + 1, x + 1, y + 3, 'G');
    }
    return t;
  }),
  C((t) => {
    rect(t, 3, 5, 28, 26, 'g');
    rect(t, 5, 7, 26, 24, 'n');
    ellipse(t, 12, 13, 4, 3, 'M');
    rect(t, 16, 16, 24, 22, 'M');
    put(t, 21, 10, 'y');
    return t;
  }),
  authority(false),
  authority(true),
  C((t) => {
    ellipse(t, 16, 15, 10, 11, 'r');
    ellipse(t, 16, 13, 7, 8, 'R');
    rect(t, 6, 23, 25, 26, 'r');
    rect(t, 14, 2, 17, 5, 'G');
    rect(t, 9, 15, 11, 18, 'n');
    return t;
  }),
  C((t) => {
    rect(t, 4, 4, 27, 28, 'n');
    for (const y of [6, 14, 22]) {
      rect(t, 5, y, 26, y + 6, 'M');
      for (let x = 6; x < 26; x += 3) rect(t, x, y + 1, x + 1, y + 6, (x + y) % 2 ? 'q' : 'Q');
    }
    return t;
  }),
  C((t) => {
    rect(t, 10, 22, 21, 28, 'M');
    rect(t, 11, 10, 20, 22, 'm');
    ellipse(t, 16, 7, 4, 4, 'm');
    rect(t, 7, 12, 10, 18, 'm');
    rect(t, 21, 12, 24, 18, 'm');
    rect(t, 13, 6, 19, 7, 'n');
    return t;
  }),
  C((t) => {
    rect(t, 6, 14, 25, 28, 'g');
    rect(t, 8, 4, 23, 14, 'G');
    rect(t, 10, 6, 21, 12, 'm');
    for (let i = 0; i < 6; i++) put(t, 12 + i * 2, 8 + (i % 3) * 2, 'v');
    rect(t, 18, 18, 25, 22, 'v');
    return t;
  }),
  piece((t) => {
    ellipse(t, 16, 16, 6, 6, 'y');
    for (let a = 0; a < 8; a++)
      put(
        t,
        Math.round(16 + Math.cos((a * Math.PI) / 4) * 9),
        Math.round(16 + Math.sin((a * Math.PI) / 4) * 9),
        'g',
      );
  }),
  piece((t) => {
    ellipse(t, 16, 16, 7, 7, 'c');
    ellipse(t, 19, 14, 6, 6, 'm');
  }),
  piece((t) => {
    ellipse(t, 19, 12, 4, 4, 'b');
    for (let i = 0; i < 8; i++) put(t, 15 - i, 16 + i, i % 2 ? 'C' : 'c');
  }),
  piece((t) => {
    ellipse(t, 16, 16, 7, 7, 'v');
    ellipse(t, 16, 16, 7, 7, 'v');
    put(t, 16, 16, 'p');
  }),
  piece(() => {}),
  C((t) => {
    rect(t, 2, 2, 29, 29, 'G');
    rect(t, 4, 4, 27, 27, 'g');
    rect(t, 8, 8, 23, 23, 'G');
    ellipse(t, 16, 16, 4, 4, 'y');
    put(t, 15, 15, 'w');
    return t;
  }),
  (() => {
    const t = tile('y');
    for (let y = 0; y < T; y++)
      for (let x = 0; x < T; x++) if ((x * 3 + y * 2) % 11 < 3) put(t, x, y, 'w');
    return speckle(t, 640, [['g', 6]]);
  })(),
  (() => {
    const t = tile('.');
    for (let x = 2; x < 30; x++) rect(t, x, 0, x, 31, x % 4 === 0 ? 'w' : 'h');
    return t;
  })(),
  C((t) => {
    ellipse(t, 16, 16, 12, 12, 'g');
    ellipse(t, 16, 16, 9, 9, 'w');
    ellipse(t, 16, 16, 5, 5, 'y');
    for (let i = 0; i < 10; i++) put(t, 10 + i, 6 + i * 2, 'v');
    return t;
  }),
  (() => {
    const t = tile('c');
    for (let y = 0; y < T; y += 8) rect(t, 0, y, T - 1, y + 1, 'C');
    return speckle(t, 650, [['w', 5]]);
  })(),
  (() => {
    const t = tile('m');
    rect(t, 0, 13, 31, 18, 'g');
    rect(t, 0, 15, 31, 16, 'y');
    return t;
  })(),
  (() => {
    const t = tile('v');
    ellipse(t, 16, 16, 15, 11, 'd');
    ellipse(t, 10, 13, 8, 6, 'D');
    ellipse(t, 22, 19, 8, 6, 'd');
    return t;
  })(),
  (() => {
    const t = tile('M');
    return speckle(t, 660, [
      ['m', 30],
      ['g', 3],
      ['s', 2],
    ]);
  })(),
];
if (CELESTIAL_TILES.length !== 32)
  throw new Error(`expected 32 tiles, got ${CELESTIAL_TILES.length}`);

const MARBLE_RAMP = [
  [18, 16, 26],
  [86, 80, 92],
  [168, 160, 150],
  [220, 212, 198],
  [250, 246, 236],
];
const celestial = sheetWith(
  tinted('public/assets/tilesets/dungeon_tileset.png', MARBLE_RAMP, (l) => [
    255,
    Math.round(200 + l * 40),
    Math.round(90 + l * 60),
  ]),
  CELESTIAL_TILES,
  CP,
  12,
);
const dir = path.resolve('art-source/environment/celestial/generated/candidates');
fs.mkdirSync(path.join(dir, 'previews'), { recursive: true });
const file = path.join(dir, 'celestial_tileset_v1.png');
writeFile(file, encodePng(celestial.w, celestial.h, celestial.buf));
writeFile(path.join(dir, 'previews', 'celestial_tileset_v1_x3.png'), scaledPng(celestial, 3));
console.log(`✓ ${path.relative(process.cwd(), file)} (${celestial.w}x${celestial.h})`);
