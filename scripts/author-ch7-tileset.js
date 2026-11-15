/**
 * CHRONO – Chapter 7 tileset (Pipeline B, AGENTS.md §5), "The Cradle of the Forgotten"
 * (outline: CHAPTER_06_DESIGN.md §14.2; art contract for T-69 / T-70):
 *
 * voidcore_tileset (128 × 384, 4 × 12): the approved dungeon tiles 0-15 tinted to the Deep Void's
 *   ink and pale cyan (same shapes and indices), + 16-47:
 *   collide 16 deep void · 17 name stone (erased) · 18 name stone (renamed, glowing) ·
 *   19 glyph-chain post · 20 memory lantern (dark) · 21 memory lantern (lit) · 22 cradle of the
 *   forgotten · 23 ghost house (outline only) · 24 hollow tree · 25 echo well · 26 broken clock face ·
 *   27 nameless grave · 28 void crystal · 29 ash heap · 30 door of forgetting · 31 altar of names ·
 *   32 shelf of blank books · 33 bench · 34 beached boat · 35 broken banyan stump (the promise rock) ·
 *   36 still pool · 37 blank bell · 38 fog wall · 39 Origin seal half · 40 void rift ·
 *   41 ink pool · 42 chain wall · 43 renamed gate (open frame); walkable 44 ash-glass ·
 *   45 rune path (lit) · 46 drift island · 47 faded sand.
 *   Collision: GID 4-44 (indices 3-43).
 *
 * Deterministic; no image model. Output: art-source/environment/voidcore/generated/candidates/.
 * Usage: node scripts/author-ch7-tileset.js
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

const VP = {
  O: hex('#04050a'),
  v: hex('#05060c'), // deep void
  V: hex('#10142a'),
  s: hex('#cfe8ff'), // faint stars / motes
  c: hex('#7ad8e8'), // pale cyan glow
  C: hex('#3a8a9a'),
  w: hex('#f2fbff'),
  g: hex('#e8c060'), // gold glyph chains
  G: hex('#9a7a2a'),
  k: hex('#3a3e52'), // ink stone
  K: hex('#262a3a'),
  n: hex('#5a6078'),
  a: hex('#8a8ea4'), // ash
  A: hex('#5c6074'),
  t: hex('#3a2e2a'), // dead wood
  T: hex('#58463c'),
  b: hex('#c8a878'), // faded sand / boat wood
  B: hex('#8a704e'),
  p: hex('#8a6ad8'), // violet (Kuro's Interval)
  i: [16, 18, 34, 230], // ink
  f: [200, 220, 240, 110], // fog
  h: [120, 220, 240, 150], // ghost outline
};
const C = (fn) => outline(fn(tile('.')));
const deepVoid = (seed) => {
  const t = tile('v');
  speckle(t, seed, [
    ['V', 14],
    ['s', 1],
  ]);
  return t;
};
const nameStone = (lit) =>
  C((t) => {
    rect(t, 9, 6, 22, 28, 'k');
    rect(t, 9, 26, 22, 28, 'K');
    ellipse(t, 16, 6, 7, 3, 'k');
    if (lit) {
      for (const y of [10, 14, 18, 22]) rect(t, 12, y, 19, y, 'c');
      put(t, 13, 11, 'w');
    } else {
      for (const y of [10, 14, 18, 22]) {
        rect(t, 12, y, 19, y, 'n');
        put(t, 12 + ((y * 3) % 7), y, 'K');
      }
    }
    return t;
  });
const lantern = (lit) =>
  C((t) => {
    rect(t, 15, 4, 16, 10, 'n');
    rect(t, 11, 10, 20, 22, 'K');
    rect(t, 12, 11, 19, 21, lit ? 'c' : 'V');
    if (lit) ellipse(t, 16, 16, 2, 3, 'w');
    rect(t, 12, 23, 19, 28, 'n');
    return t;
  });
const VOID_TILES = [
  deepVoid(701),
  nameStone(false),
  nameStone(true),
  C((t) => {
    rect(t, 14, 4, 17, 28, 'K');
    for (let y = 6; y < 28; y += 3) {
      put(t, 12, y, 'g');
      put(t, 19, y + 1, 'g');
      put(t, 13, y + 1, 'G');
    }
    return t;
  }),
  lantern(false),
  lantern(true),
  C((t) => {
    // A cradle rocking over nothing.
    ellipse(t, 16, 20, 12, 6, 'T');
    ellipse(t, 16, 18, 10, 4, 't');
    rect(t, 6, 24, 9, 27, 'T');
    rect(t, 22, 24, 25, 27, 'T');
    ellipse(t, 16, 17, 5, 2, 'f');
    return t;
  }),
  (() => {
    // A house that was erased: only its outline is left.
    const t = tile('.');
    for (let x = 6; x <= 25; x++) {
      put(t, x, 12, 'h');
      put(t, x, 28, 'h');
    }
    for (let y = 12; y <= 28; y++) {
      put(t, 6, y, 'h');
      put(t, 25, y, 'h');
    }
    for (let i = 0; i < 10; i++) {
      put(t, 6 + i, 12 - i, 'h');
      put(t, 25 - i, 12 - i, 'h');
    }
    rect(t, 14, 20, 17, 28, 'h');
    return t;
  })(),
  C((t) => {
    rect(t, 13, 12, 18, 28, 't');
    ellipse(t, 16, 18, 1.5, 3, 'v');
    for (const [x, y] of [
      [9, 6],
      [22, 5],
      [12, 9],
      [20, 9],
    ])
      rect(t, Math.min(x, 16), y, Math.max(x, 16), y, 'T');
    return t;
  }),
  C((t) => {
    ellipse(t, 16, 18, 11, 8, 'n');
    ellipse(t, 16, 17, 8, 5, 'v');
    ellipse(t, 16, 17, 3, 2, 'c');
    return t;
  }),
  C((t) => {
    ellipse(t, 16, 16, 11, 11, 'b');
    ellipse(t, 16, 16, 9, 9, 'w');
    rect(t, 16, 9, 16, 16, 'k');
    rect(t, 16, 16, 21, 16, 'k');
    for (let i = 0; i < 8; i++) put(t, 9 + i * 2, 22 - i, 'K');
    return t;
  }),
  C((t) => {
    rect(t, 10, 20, 21, 28, 'k');
    rect(t, 13, 10, 18, 20, 'n');
    rect(t, 10, 13, 21, 15, 'n');
    return t;
  }),
  C((t) => {
    for (let y = 8; y < 28; y++) {
      const half = Math.round(2 + (y - 8) * 0.35);
      rect(t, 16 - half, y, 16 + half, y, y % 4 ? 'C' : 'c');
    }
    put(t, 15, 10, 'w');
    return t;
  }),
  C((t) => {
    ellipse(t, 16, 24, 11, 5, 'A');
    ellipse(t, 16, 22, 8, 4, 'a');
    put(t, 13, 20, 'w');
    return t;
  }),
  C((t) => {
    rect(t, 8, 4, 23, 28, 'K');
    rect(t, 10, 6, 21, 28, 'v');
    for (let y = 8; y < 28; y += 4) rect(t, 12, y, 19, y, 'i');
    return t;
  }),
  C((t) => {
    rect(t, 6, 14, 25, 28, 'k');
    rect(t, 8, 12, 23, 14, 'n');
    ellipse(t, 16, 8, 4, 4, 'g');
    ellipse(t, 16, 8, 2, 2, 'w');
    return t;
  }),
  C((t) => {
    rect(t, 4, 4, 27, 28, 'T');
    for (const y of [6, 14, 22]) {
      rect(t, 5, y, 26, y + 6, 't');
      for (let x = 6; x < 26; x += 3) rect(t, x, y + 1, x + 1, y + 6, 'w');
    }
    return t;
  }),
  C((t) => {
    rect(t, 5, 16, 26, 19, 'T');
    rect(t, 7, 20, 9, 26, 't');
    rect(t, 22, 20, 24, 26, 't');
    return t;
  }),
  C((t) => {
    ellipse(t, 16, 21, 13, 5, 'B');
    ellipse(t, 16, 19, 11, 3, 'b');
    rect(t, 15, 6, 16, 19, 'T');
    return t;
  }),
  C((t) => {
    // The broken banyan on the rock where the promise was made.
    ellipse(t, 16, 25, 13, 4, 'n');
    rect(t, 12, 12, 19, 24, 'T');
    rect(t, 19, 8, 21, 14, 't');
    rect(t, 9, 10, 12, 13, 't');
    put(t, 20, 7, 'T');
    return t;
  }),
  (() => {
    const t = tile('C');
    for (let y = 0; y < T; y += 6) rect(t, 0, y, T - 1, y, 'c');
    return speckle(t, 720, [['w', 3]]);
  })(),
  C((t) => {
    ellipse(t, 16, 15, 10, 11, 'n');
    ellipse(t, 16, 13, 7, 8, 'k');
    rect(t, 8, 24, 23, 26, 'n');
    return t;
  }),
  (() => {
    const t = tile('.');
    for (let y = 0; y < T; y++)
      for (let x = 0; x < T; x++) if ((x + y * 2) % 5 !== 0) put(t, x, y, 'f');
    return t;
  })(),
  C((t) => {
    ellipse(t, 16, 16, 12, 12, 'g');
    ellipse(t, 16, 16, 9, 9, 'w');
    rect(t, 4, 4, 15, 28, 'v');
    for (let y = 6; y < 27; y += 3) put(t, 16, y, 'G');
    return t;
  }),
  (() => {
    const t = tile('v');
    for (let y = 2; y < 30; y++) {
      const half = Math.round(3 - Math.abs(y - 16) / 6);
      if (half > 0) rect(t, 16 - half, y, 16 + half, y, y % 3 ? 'p' : 'c');
    }
    return t;
  })(),
  (() => {
    const t = tile('.');
    ellipse(t, 16, 18, 13, 9, 'i');
    ellipse(t, 13, 16, 3, 2, 'V');
    return t;
  })(),
  C((t) => {
    rect(t, 0, 8, 31, 24, 'K');
    for (let x = 1; x < 31; x += 4) {
      rect(t, x, 10, x + 2, 12, 'g');
      rect(t, x + 2, 18, x + 4, 20, 'G');
    }
    return t;
  }),
  C((t) => {
    rect(t, 6, 4, 9, 28, 'c');
    rect(t, 22, 4, 25, 28, 'c');
    rect(t, 6, 4, 25, 7, 'c');
    for (let y = 9; y < 27; y += 4) put(t, 16, y, 'w');
    return t;
  }),
  (() => {
    const t = tile('A');
    for (let y = 0; y < T; y += 8) rect(t, 0, y, T - 1, y, 'a');
    return speckle(t, 730, [
      ['n', 12],
      ['s', 1],
    ]);
  })(),
  (() => {
    const t = tile('K');
    rect(t, 0, 13, 31, 18, 'k');
    for (let x = 2; x < 32; x += 6) rect(t, x, 15, x + 2, 16, 'c');
    return t;
  })(),
  (() => {
    const t = tile('v');
    ellipse(t, 16, 16, 15, 11, 'k');
    ellipse(t, 16, 14, 13, 8, 'n');
    return speckle(t, 740, [['a', 10]], 'n');
  })(),
  (() => {
    const t = tile('b');
    return speckle(t, 750, [
      ['B', 14],
      ['a', 10],
    ]);
  })(),
];
if (VOID_TILES.length !== 32) throw new Error(`expected 32 tiles, got ${VOID_TILES.length}`);

const INK_RAMP = [
  [6, 8, 14],
  [22, 26, 40],
  [46, 54, 76],
  [96, 110, 136],
  [186, 210, 226],
];
const voidcore = sheetWith(
  tinted(
    'public/assets/tilesets/dungeon_tileset.png',
    INK_RAMP,
    (l) => [Math.round(90 + l * 60), Math.round(200 + l * 40), 240],
    1.6,
  ),
  VOID_TILES,
  VP,
  12,
);
const dir = path.resolve('art-source/environment/voidcore/generated/candidates');
fs.mkdirSync(path.join(dir, 'previews'), { recursive: true });
const file = path.join(dir, 'voidcore_tileset_v1.png');
writeFile(file, encodePng(voidcore.w, voidcore.h, voidcore.buf));
writeFile(path.join(dir, 'previews', 'voidcore_tileset_v1_x3.png'), scaledPng(voidcore, 3));
console.log(`✓ ${path.relative(process.cwd(), file)} (${voidcore.w}x${voidcore.h})`);
