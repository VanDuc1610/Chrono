/**
 * CHRONO – Chapter 8 tileset (Pipeline B, .agents/rules/chrono-art.md §4), "The Null Hour & The
 * Convergence" (design: docs/story/CHAPTER_08_DESIGN.md §13.1):
 *
 * convergence_tileset (128 × 512, 4 × 16): the approved dungeon tiles 0-15 tinted to dusk slate
 *   with seam gold (same shapes and indices), + 16-63 — props of the worlds stitched together:
 *   collide 16 seam rift · 17 anchor post (empty) · 18 anchor post (seal set, lit) · 19 lighthouse ·
 *   20 smoke stack · 21 basket boat on steel · 22 steel bulkhead · 23 Khánh Hòa water channel ·
 *   24 legion gate (closed) · 25 legion shield wall · 26 barbed wire · 27 shell crater ·
 *   28 ragged red banner · 29 imperial gold banner · 30 silver mirror · 31 prism · 32 bronze mirror ·
 *   33 grave-stele wall · 34 shelf of flowing names · 35 lectern (page lit) · 36 great gear wall ·
 *   37 gear door (closed) · 38 seal socket (empty) · 39 seal socket (set) · 40 tower clock face ·
 *   41 tower bell · 42 torn-page pedestal · 43 command table · 44 barricade · 45 cloud pillar ·
 *   46 steel crates · 47 stopped clock hand;
 *   walkable 48 Khánh Hòa sand · 49 steel deck · 50 Sol-Karis marble · 51 trench mud ·
 *   52 grave flagstone · 53 cloud floor · 54 pier planks · 55 steel catwalk · 56 trench boards ·
 *   57 marble stair · 58 rail track · 59 clock floor · 60 tower stair · 61 seam path ·
 *   62 faded (the other world, outline only) · 63 anchor-zone glow.
 *   Collision: GID 4-48 (indices 3-47).
 *
 * Deterministic; no image model. Output: art-source/environment/convergence/generated/candidates/.
 * Usage: node scripts/author-ch8-tileset.js
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
  O: hex('#0a0a10'),
  g: hex('#f0c860'), // seam gold
  G: hex('#a07c30'),
  y: hex('#fff2b8'),
  v: hex('#140c22'), // void behind the seams
  // Khánh Hòa
  s: hex('#e2c896'), // sand
  S: hex('#b89a68'),
  w: hex('#3a8ab8'), // sea
  W: hex('#2a6088'),
  f: hex('#cfeaf6'), // foam
  r: hex('#c84a3a'), // lighthouse red
  R: hex('#8a2e26'),
  z: hex('#f4f0e6'), // white paint
  b: hex('#8a6a42'), // wood / basket
  B: hex('#5e4628'),
  // Beta steel
  m: hex('#7c8696'),
  M: hex('#4e5664'),
  n: hex('#a8b2c0'),
  k: hex('#2c3038'),
  o: hex('#d87a30'), // rust / furnace glow
  // Sol-Karis and the war plain
  q: hex('#e8e2d4'), // marble
  Q: hex('#b8b0a0'),
  c: hex('#9c2a2a'), // war red
  C: hex('#5e1a1a'),
  d: hex('#6a5640'), // mud
  D: hex('#46382a'),
  x: hex('#9aa0a8'), // wire
  // Forgotten kingdom and heaven
  a: hex('#8e9aa8'), // grave stone
  A: hex('#5e6876'),
  e: hex('#f4f6ff'), // cloud
  E: hex('#c4cce8'),
  p: hex('#b48cff'), // prism violet
  u: hex('#e4ecf4'), // silver
  t: hex('#c8823a'), // bronze
  i: [30, 20, 52, 230], // flowing ink
  h: [240, 200, 96, 150], // faded outline (the other world)
  l: [250, 226, 140, 70], // anchor-zone glow
};
const C = (fn) => outline(fn(tile('.')));
const fill = (base, seed, picks) => speckle(tile(base), seed, picks);

const anchorPost = (lit) =>
  C((t) => {
    rect(t, 11, 6, 20, 28, 'A');
    rect(t, 12, 7, 19, 27, 'a');
    rect(t, 9, 26, 22, 29, 'A');
    // Two world signs carved on the post: a wave and a gear.
    for (let x = 13; x <= 18; x++) put(t, x, 11 + (x % 2), 'W');
    ellipse(t, 15.5, 21, 2.5, 2.5, 'M');
    put(t, 15, 21, 'a');
    rect(t, 14, 15, 17, 17, lit ? 'g' : 'v');
    if (lit) {
      put(t, 15, 15, 'y');
      for (const [x, y] of [
        [10, 5],
        [21, 5],
        [15, 3],
      ])
        put(t, x, y, 'g');
    }
    return t;
  });
const mirror = (frame, glass) =>
  C((t) => {
    rect(t, 9, 4, 22, 26, frame);
    rect(t, 11, 6, 20, 24, glass);
    for (let k = 0; k < 6; k++) put(t, 12 + k, 18 - k * 2, 'z');
    rect(t, 13, 26, 18, 29, frame);
    return t;
  });
const socket = (set) =>
  C((t) => {
    ellipse(t, 16, 18, 11, 9, 'G');
    ellipse(t, 16, 17, 9, 7, 'k');
    ellipse(t, 16, 17, 5, 4, set ? 'g' : 'v');
    if (set) {
      ellipse(t, 16, 16, 2, 2, 'y');
      put(t, 16, 9, 'y');
    }
    return t;
  });

const COLLIDE = [
  // 16 seam rift: two worlds torn apart, held by gold thread.
  (() => {
    const t = tile('v');
    for (let y = 0; y < T; y++) {
      const x = 16 + Math.round(Math.sin(y / 4) * 3);
      rect(t, x - 2, y, x + 2, y, y % 4 < 2 ? 'g' : 'G');
      if (y % 6 === 0) rect(t, x - 7, y, x + 7, y, 'g');
    }
    return speckle(t, 801, [['y', 2]], 'v');
  })(),
  anchorPost(false),
  anchorPost(true),
  C((t) => {
    // Lighthouse.
    for (let y = 6; y < 29; y++) {
      const half = Math.round(4 + (y - 6) * 0.12);
      rect(t, 16 - half, y, 16 + half, y, Math.floor(y / 5) % 2 ? 'r' : 'z');
    }
    rect(t, 12, 2, 19, 6, 'k');
    rect(t, 13, 3, 18, 5, 'y');
    return t;
  }),
  C((t) => {
    // Smoke stack with a rust band.
    rect(t, 11, 6, 20, 29, 'M');
    rect(t, 12, 6, 19, 29, 'm');
    rect(t, 11, 12, 20, 13, 'o');
    rect(t, 10, 4, 21, 6, 'k');
    ellipse(t, 13, 2, 3, 2, 'n');
    return t;
  }),
  C((t) => {
    // A Khánh Hòa basket boat stranded on a steel plate.
    rect(t, 2, 22, 29, 29, 'M');
    for (let x = 3; x < 29; x += 6) put(t, x, 25, 'n');
    ellipse(t, 16, 18, 11, 6, 'B');
    ellipse(t, 16, 17, 9, 4, 'b');
    for (let x = 8; x < 25; x += 3) put(t, x, 17, 'B');
    return t;
  }),
  (() => {
    // Steel bulkhead (full tile wall).
    const t = tile('M');
    for (let y = 0; y < T; y += 8) rect(t, 0, y, T - 1, y + 1, 'k');
    for (let x = 4; x < T; x += 8) for (let y = 4; y < T; y += 8) put(t, x, y, 'n');
    return t;
  })(),
  (() => {
    const t = tile('w');
    for (let y = 3; y < T; y += 7)
      for (let x = (y * 3) % 6; x < T; x += 9) rect(t, x, y, x + 3, y, 'f');
    return speckle(t, 802, [['W', 18]]);
  })(),
  C((t) => {
    // Legion gate, closed: gold-studded oak under a marble arch.
    rect(t, 3, 2, 28, 29, 'Q');
    rect(t, 6, 6, 25, 29, 'B');
    rect(t, 15, 6, 16, 29, 'k');
    for (const y of [10, 18, 25]) for (const x of [9, 21]) put(t, x, y, 'g');
    rect(t, 3, 2, 28, 4, 'q');
    return t;
  }),
  C((t) => {
    // A row of legion shields.
    for (const x of [2, 12, 22]) {
      rect(t, x, 8, x + 8, 27, 'c');
      rect(t, x + 1, 9, x + 7, 26, 'C');
      ellipse(t, x + 4, 17, 2, 2, 'g');
    }
    return t;
  }),
  (() => {
    const t = tile('.');
    for (let x = 0; x < T; x++) {
      put(t, x, 12 + Math.round(Math.sin(x / 2)), 'x');
      put(t, x, 22 + Math.round(Math.cos(x / 2)), 'x');
      if (x % 4 === 0) {
        put(t, x, 11, 'x');
        put(t, x, 21, 'x');
      }
    }
    rect(t, 3, 8, 4, 28, 'D');
    rect(t, 27, 8, 28, 28, 'D');
    return t;
  })(),
  (() => {
    const t = fill('d', 803, [['D', 20]]);
    ellipse(t, 16, 17, 12, 9, 'D');
    ellipse(t, 16, 18, 8, 5, 'k');
    return t;
  })(),
  C((t) => {
    rect(t, 6, 2, 7, 29, 'B');
    rect(t, 8, 4, 24, 16, 'c');
    for (let y = 4; y <= 16; y++) if (y % 3 === 0) put(t, 24 - (y % 4), y, '.');
    for (let x = 10; x < 24; x += 5) rect(t, x, 14, x + 1, 18, 'c');
    return t;
  }),
  C((t) => {
    rect(t, 15, 2, 16, 29, 'G');
    rect(t, 8, 4, 23, 20, 'g');
    rect(t, 9, 5, 22, 19, 'G');
    ellipse(t, 15.5, 12, 3, 3, 'g');
    return t;
  }),
  mirror('u', 'n'),
  C((t) => {
    // Prism of heaven.
    for (let y = 6; y < 26; y++) {
      const half = Math.round((y - 6) * 0.45);
      rect(t, 16 - half, y, 16 + half, y, y % 3 ? 'p' : 'e');
    }
    rect(t, 7, 26, 25, 28, 'E');
    return t;
  }),
  mirror('t', 'g'),
  (() => {
    const t = tile('A');
    for (const x of [1, 11, 21]) {
      rect(t, x, 4, x + 8, 31, 'a');
      ellipse(t, x + 4, 5, 4, 3, 'a');
      for (let y = 10; y < 26; y += 4) rect(t, x + 2, y, x + 6, y, 'A');
    }
    return t;
  })(),
  C((t) => {
    rect(t, 4, 3, 27, 28, 'B');
    for (const y of [5, 13, 21]) {
      rect(t, 5, y, 26, y + 6, 'b');
      for (let x = 6; x < 26; x += 3) rect(t, x, y + 1, x + 1, y + 6, (x + y) % 2 ? 'z' : 'a');
    }
    // Names running off the shelf like ink.
    for (let y = 26; y < 32; y++) put(t, 9 + (y % 3), y, 'i');
    for (let y = 27; y < 32; y++) put(t, 20 + (y % 2), y, 'i');
    return t;
  }),
  C((t) => {
    rect(t, 14, 14, 17, 29, 'B');
    rect(t, 7, 9, 24, 15, 'b');
    rect(t, 9, 10, 22, 13, 'z');
    rect(t, 10, 11, 21, 11, 'y');
    put(t, 15, 7, 'y');
    return t;
  }),
  (() => {
    // Great gear wall.
    const t = tile('k');
    ellipse(t, 16, 16, 13, 13, 'M');
    ellipse(t, 16, 16, 10, 10, 'm');
    ellipse(t, 16, 16, 3, 3, 'k');
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const x = 16 + Math.cos(a) * 13;
      const y = 16 + Math.sin(a) * 13;
      rect(t, Math.round(x) - 1, Math.round(y) - 1, Math.round(x) + 1, Math.round(y) + 1, 'n');
    }
    return t;
  })(),
  C((t) => {
    rect(t, 3, 2, 28, 29, 'k');
    rect(t, 5, 4, 26, 29, 'M');
    ellipse(t, 16, 16, 7, 7, 'm');
    ellipse(t, 16, 16, 3, 3, 'o');
    rect(t, 15, 4, 16, 29, 'k');
    return t;
  }),
  socket(false),
  socket(true),
  (() => {
    // Tower clock face (wall).
    const t = tile('A');
    ellipse(t, 16, 16, 14, 14, 'G');
    ellipse(t, 16, 16, 12, 12, 'z');
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      put(t, 16 + Math.round(Math.sin(a) * 10), 16 - Math.round(Math.cos(a) * 10), 'k');
    }
    rect(t, 16, 6, 16, 16, 'k');
    rect(t, 16, 16, 21, 16, 'k');
    return t;
  })(),
  C((t) => {
    rect(t, 6, 3, 25, 5, 'B');
    for (let y = 6; y < 26; y++) {
      const half = Math.round(4 + (y - 6) * 0.4);
      rect(t, 16 - half, y, 16 + half, y, y % 5 ? 't' : 'G');
    }
    ellipse(t, 16, 27, 3, 2, 'G');
    return t;
  }),
  C((t) => {
    rect(t, 9, 14, 22, 29, 'a');
    rect(t, 7, 12, 24, 14, 'A');
    // A strip of torn paper, its edge like teeth.
    rect(t, 11, 5, 20, 11, 'z');
    for (let y = 5; y <= 11; y += 2) put(t, 21, y, 'z');
    for (let y = 6; y <= 11; y += 2) put(t, 10, y, 'z');
    rect(t, 13, 7, 18, 7, 'E');
    return t;
  }),
  C((t) => {
    rect(t, 2, 10, 29, 22, 'B');
    rect(t, 3, 11, 28, 20, 'b');
    for (const [x, y, ch] of [
      [7, 14, 'c'],
      [24, 14, 'm'],
      [7, 18, 'a'],
      [24, 18, 'd'],
    ])
      rect(t, x - 1, y - 1, x + 1, y + 1, ch);
    rect(t, 14, 13, 17, 18, 'z');
    rect(t, 4, 22, 6, 28, 'B');
    rect(t, 25, 22, 27, 28, 'B');
    return t;
  }),
  C((t) => {
    for (const [x, y] of [
      [3, 18],
      [12, 14],
      [20, 19],
      [8, 9],
      [17, 6],
    ])
      rect(t, x, y, x + 10, y + 3, (x + y) % 2 ? 'b' : 'B');
    rect(t, 6, 24, 26, 28, 'D');
    return t;
  }),
  C((t) => {
    rect(t, 10, 4, 21, 28, 'E');
    rect(t, 11, 4, 20, 28, 'e');
    for (let y = 7; y < 27; y += 5) rect(t, 11, y, 20, y, 'E');
    ellipse(t, 15.5, 4, 7, 3, 'e');
    ellipse(t, 15.5, 28, 7, 3, 'E');
    return t;
  }),
  C((t) => {
    for (const [x, y] of [
      [3, 14],
      [16, 14],
      [9, 3],
    ]) {
      rect(t, x, y, x + 12, y + 12, 'M');
      rect(t, x + 1, y + 1, x + 11, y + 11, 'm');
      rect(t, x + 1, y + 6, x + 11, y + 6, 'k');
    }
    return t;
  }),
  C((t) => {
    // The giant hour hand, stopped, lying across the floor.
    for (let k = 0; k < 26; k++) {
      const x = 3 + k;
      const y = 26 - Math.round(k * 0.75);
      rect(t, x, y - 1, x, y + 1, k > 20 ? 'g' : 'G');
    }
    ellipse(t, 4, 26, 3, 3, 'G');
    return t;
  }),
];

const WALK = [
  fill('s', 811, [
    ['S', 14],
    ['z', 2],
  ]),
  (() => {
    const t = tile('m');
    for (let y = 0; y < T; y += 16) rect(t, 0, y, T - 1, y, 'M');
    for (let x = 0; x < T; x += 16) rect(t, x, 0, x, T - 1, 'M');
    for (const [x, y] of [
      [3, 3],
      [19, 3],
      [3, 19],
      [19, 19],
    ])
      put(t, x, y, 'n');
    return t;
  })(),
  (() => {
    const t = tile('q');
    for (let y = 0; y < T; y += 16) rect(t, 0, y, T - 1, y, 'Q');
    rect(t, 0, 0, 0, T - 1, 'Q');
    for (let k = 0; k < 10; k++) put(t, 4 + k * 2, 6 + ((k * 5) % 9), 'Q');
    return t;
  })(),
  fill('d', 812, [
    ['D', 22],
    ['b', 3],
  ]),
  (() => {
    const t = tile('a');
    for (let y = 0; y < T; y += 11) rect(t, 0, y, T - 1, y, 'A');
    for (let y = 0; y < T; y += 11) rect(t, (y * 7) % 17, y, (y * 7) % 17, y + 10, 'A');
    return t;
  })(),
  fill('e', 813, [
    ['E', 16],
    ['y', 1],
  ]),
  (() => {
    const t = tile('w');
    for (let x = 0; x < T; x++) {
      rect(t, x, 6, x, 25, x % 8 === 0 ? 'B' : 'b');
    }
    rect(t, 0, 6, T - 1, 6, 'B');
    rect(t, 0, 25, T - 1, 25, 'B');
    return t;
  })(),
  (() => {
    const t = tile('v');
    rect(t, 0, 8, T - 1, 23, 'M');
    for (let x = 0; x < T; x += 3) rect(t, x, 9, x, 22, 'k');
    rect(t, 0, 8, T - 1, 8, 'n');
    rect(t, 0, 23, T - 1, 23, 'n');
    return t;
  })(),
  (() => {
    const t = tile('D');
    for (let x = 0; x < T; x += 6) rect(t, x, 4, x + 4, 27, (x / 6) % 2 ? 'b' : 'B');
    return t;
  })(),
  (() => {
    const t = tile('q');
    for (let y = 0; y < T; y += 6) {
      rect(t, 0, y, T - 1, y + 1, 'Q');
      rect(t, 0, y + 4, T - 1, y + 4, 'z');
    }
    return t;
  })(),
  (() => {
    const t = fill('s', 814, [['S', 10]]);
    for (let y = 2; y < T; y += 6) rect(t, 6, y, 25, y + 2, 'B');
    rect(t, 9, 0, 10, T - 1, 'n');
    rect(t, 21, 0, 22, T - 1, 'n');
    return t;
  })(),
  (() => {
    const t = tile('A');
    for (let r = 4; r <= 16; r += 6)
      for (let k = 0; k < 64; k++) {
        const a = (k / 64) * Math.PI * 2;
        put(t, 16 + Math.round(Math.cos(a) * r), 16 + Math.round(Math.sin(a) * r), 'G');
      }
    return t;
  })(),
  (() => {
    const t = tile('A');
    for (let y = 0; y < T; y += 8) {
      rect(t, 0, y, T - 1, y + 5, 'a');
      rect(t, 0, y + 6, T - 1, y + 6, 'k');
    }
    return t;
  })(),
  (() => {
    const t = fill('A', 815, [['a', 14]]);
    for (let y = 0; y < T; y++) {
      const x = 16 + Math.round(Math.sin(y / 5) * 2);
      put(t, x, y, 'g');
      if (y % 8 === 0) put(t, x + 1, y, 'y');
    }
    return t;
  })(),
  (() => {
    // The other world, faded to a dashed gold outline: you can walk through it.
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
    // Ground held by an anchor: slate with a faint gold lattice.
    const t = fill('a', 816, [['A', 10]]);
    for (let y = 0; y < T; y += 8) for (let x = 0; x < T; x++) if (x % 2 === 0) put(t, x, y, 'G');
    for (let x = 0; x < T; x += 8) for (let y = 0; y < T; y++) if (y % 2 === 0) put(t, x, y, 'G');
    for (const [x, y] of [
      [4, 4],
      [20, 12],
      [12, 28],
    ])
      put(t, x, y, 'y');
    return t;
  })(),
];

const EXTRA = [...COLLIDE, ...WALK];
if (COLLIDE.length !== 32 || WALK.length !== 16)
  throw new Error(`expected 32 + 16 tiles, got ${COLLIDE.length} + ${WALK.length}`);

const DUSK_RAMP = [
  [10, 10, 16],
  [40, 38, 50],
  [82, 76, 88],
  [140, 128, 120],
  [226, 212, 186],
];
const sheet = sheetWith(
  tinted(
    'public/assets/tilesets/dungeon_tileset.png',
    DUSK_RAMP,
    (l) => [255, Math.round(170 + l * 70), Math.round(70 + l * 60)],
    1.5,
  ),
  EXTRA,
  P,
  16,
);
const dir = path.resolve('art-source/environment/convergence/generated/candidates');
fs.mkdirSync(path.join(dir, 'previews'), { recursive: true });
const file = path.join(dir, 'convergence_tileset_v1.png');
writeFile(file, encodePng(sheet.w, sheet.h, sheet.buf));
writeFile(path.join(dir, 'previews', 'convergence_tileset_v1_x3.png'), scaledPng(sheet, 3));
console.log(`✓ ${path.relative(process.cwd(), file)} (${sheet.w}x${sheet.h})`);
