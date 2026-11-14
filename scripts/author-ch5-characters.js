/**
 * CHRONO – Chapter 5 characters (Pipeline B, AGENTS.md §5), CHAPTER_05_DESIGN.md §4, §8, §11:
 *   The Other Peter (48x48, 4 idle + kneeling; keeps Peter's curly-hair identity lock, grey streaks),
 *   The Unborn King (64x64, 4 idle + crowns fallen), Engineer Ivo, Mira (32x32 x4),
 *   Branch Phantom, Unborn Cocoon, Unborn Horror, Paradox Crystal, Chronos Gardener (32x32 x4).
 * Deterministic pixel rules only — no image model, no external reference.
 * Output: art-source/{npcs,enemies}/<name>/generated/candidates/ ONLY.
 *
 * Usage: node scripts/author-ch5-characters.js
 */
import path from 'path';
import fs from 'fs';
import { hex, encodePng, writeFile } from './pixel-art/pixel.js';

function canvas(size) {
  const g = Array.from({ length: size }, () => Array(size).fill('.'));
  const put = (x, y, ch) => {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && y >= 0 && x < size && y < size) g[y][x] = ch;
  };
  return {
    g,
    put,
    rect: (x0, y0, x1, y1, ch) => {
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, ch);
    },
    ellipse: (cx, cy, rx, ry, ch) => {
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
        for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
          if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) put(x, y, ch);
    },
    line: (x0, y0, x1, y1, ch) => {
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
      for (let i = 0; i <= n; i++) put(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, ch);
    },
    outline: (ch = 'O') => {
      const src = g.map((r) => [...r]);
      for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++)
          if (
            src[y][x] === '.' &&
            [
              [1, 0],
              [-1, 0],
              [0, 1],
              [0, -1],
            ].some(([dx, dy]) => (src[y + dy]?.[x + dx] ?? '.') !== '.')
          )
            g[y][x] = ch;
    },
  };
}

function render(frames, size, palette) {
  const w = size * frames.length;
  const buf = Buffer.alloc(w * size * 4);
  frames.forEach((g, i) =>
    g.forEach((row, y) =>
      row.forEach((ch, x) => {
        if (ch === '.') return;
        const c = palette[ch];
        if (!c) throw new Error(`unknown palette char "${ch}"`);
        buf.set(c, (y * w + i * size + x) * 4);
      }),
    ),
  );
  return { w, h: size, buf };
}

function preview(img, k, bg = [24, 30, 46, 255]) {
  const W = img.w * k;
  const H = img.h * k;
  const out = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = (Math.floor(y / k) * img.w + Math.floor(x / k)) * 4;
      const a = img.buf[i + 3] / 255;
      const o = (y * W + x) * 4;
      for (let ch = 0; ch < 3; ch++)
        out[o + ch] = Math.round(img.buf[i + ch] * a + bg[ch] * (1 - a));
      out[o + 3] = 255;
    }
  return encodePng(W, H, out);
}

// ------------------------------------------------------------------ The Other Peter (48x48)
/** Peter's approved palette (PETER_DESIGN.md §4) + the Gardener's white armour and grey streaks. */
const OTHER = {
  O: hex('#120f17'),
  h: hex('#22160f'), // curly hair shadow
  H: hex('#3b291d'), // curly hair base
  j: hex('#594132'), // curly hair highlight
  y: hex('#9a9aa4'), // grey streaks (older Peter, owner-approved)
  s: hex('#dab9a0'),
  S: hex('#b28e76'),
  E: hex('#607d9c'),
  a: hex('#e6e6ee'), // Gardener armour
  A: hex('#b8bcc8'),
  q: hex('#8a8e9c'),
  v: hex('#7a5cd6'), // violet trim (Chronos remnant)
  m: hex('#c8ccd4'), // shear blades
  M: hex('#8c96a8'),
  l: hex('#453123'), // shear grip leather
  r: hex('#181c24'),
};
function otherPeterFrame(phase, kneel = false) {
  const c = canvas(48);
  const bob = kneel ? 6 : [0, -1, 0, 1][phase];
  const hy = 11 + bob;
  // Head: compact, rounded, slightly elevated curly hair covering top, sides and back.
  c.ellipse(24, hy, 7.5, 6.5, 'H');
  c.ellipse(24, hy + 3, 5.2, 5, 's');
  for (let x = 17; x <= 31; x += 2) {
    // springy curls along the top edge, growing up and out
    c.put(x, hy - 6 + ((x >> 1) % 2), 'j');
    c.put(x + 1, hy - 5, 'h');
  }
  for (const [x, y] of [
    [18, hy - 2],
    [30, hy - 2],
    [17, hy + 1],
    [31, hy + 1],
    [21, hy - 4],
    [27, hy - 4],
  ])
    c.put(x, y, 'h');
  for (const [x, y] of [
    [20, hy - 5],
    [25, hy - 6],
    [29, hy - 3],
    [18, hy],
  ])
    c.put(x, y, 'y'); // grey streaks
  c.put(22, hy + 3, 'E');
  c.put(26, hy + 3, 'E');
  c.rect(22, hy + 6, 26, hy + 6, 'S'); // stubble
  // Gardener armour: broad white plates with violet seams.
  for (let y = hy + 9; y <= hy + 28; y++) {
    const half = Math.round(9 - Math.max(0, y - (hy + 20)) * 0.3);
    c.rect(24 - half, y, 24 + half, y, y % 5 === 0 ? 'A' : 'a');
  }
  c.ellipse(14, hy + 11, 4, 3, 'A');
  c.ellipse(34, hy + 11, 4, 3, 'A');
  c.line(24, hy + 9, 24, hy + 28, 'v');
  c.rect(17, hy + 20, 31, hy + 20, 'q');
  if (!kneel) {
    c.rect(18, hy + 29, 22, 46, 'r');
    c.rect(26, hy + 29, 30, 46, 'r');
  } else {
    c.rect(16, hy + 28, 32, hy + 31, 'r');
  }
  // Giant pruning shears: two long blades crossing, held across the body.
  const open = kneel ? 0 : phase % 2;
  if (!kneel) {
    c.line(34, hy + 22, 46, hy - 6 - open, 'm');
    c.line(35, hy + 22, 47, hy - 5 - open, 'M');
    c.line(34, hy + 22, 44, hy - 8 + open * 2, 'm');
    c.rect(31, hy + 20, 35, hy + 24, 'l');
  } else {
    c.line(6, 44, 30, 44, 'm');
    c.line(8, 46, 30, 42, 'M');
  }
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ The Unborn King (64x64)
const KING = {
  O: hex('#0a080c'),
  f: hex('#d8d4e0'), // faceless face
  F: hex('#b0acbc'),
  w: hex('#efe8d8'), // swaddling cloths
  W: hex('#c8bfa8'),
  b: hex('#b8d0e8'), // pale blue swaddle
  B: hex('#8aa4c0'),
  g: hex('#d8b048'), // crowns
  G: hex('#a07a28'),
  i: hex('#c8ccd4'),
  I: hex('#8c96a8'),
  z: hex('#b8784a'),
  Z: hex('#8a5432'),
  t: hex('#5a4a6a'), // throne shadow
  p: [190, 160, 255, 140], // motes
};
function kingFrame(phase, fallen = false) {
  const c = canvas(64);
  const bob = [0, -1, -1, 0][phase];
  // Robe of unused swaddling cloths, wrapping strips.
  for (let y = 24; y <= 62; y++) {
    const half = Math.round(10 + (y - 24) * 0.45);
    for (let x = 32 - half; x <= 32 + half; x++) {
      const band = Math.floor((y + x * 0.4 + phase) / 4) % 3;
      c.put(x, y + bob, band === 0 ? 'w' : band === 1 ? 'b' : 'W');
    }
  }
  c.line(32, 26 + bob, 32, 62, 'B');
  // Arms cradling an empty bundle.
  c.ellipse(32, 44 + bob, 9, 5, 'w');
  c.ellipse(32, 44 + bob, 5, 2.5, 'W');
  // Faceless head.
  c.ellipse(32, 18 + bob, 8, 9, 'f');
  c.ellipse(32, 21 + bob, 6, 5, 'F');
  if (!fallen) {
    // Three crowns stacked: bronze, silver, gold.
    const crowns = [
      ['z', 'Z', 9],
      ['i', 'I', 5],
      ['g', 'G', 1],
    ];
    crowns.forEach(([ch, sh, y0], k) => {
      const yy = y0 + bob;
      c.rect(26 - k, yy + 2, 38 + k, yy + 3, ch);
      for (const x of [26 - k, 29, 32, 35, 38 + k]) c.put(x, yy + 1, ch);
      c.put(32, yy, sh);
    });
  } else {
    for (const [x, y, ch] of [
      [12, 58, 'g'],
      [50, 56, 'i'],
      [20, 60, 'z'],
    ])
      c.rect(x, y, x + 4, y + 1, ch);
  }
  for (let k = 0; k < 8; k++)
    c.put(4 + ((k * 17 + phase * 5) % 56), 4 + ((k * 23 + phase * 3) % 52), 'p');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Engineer Ivo
const IVO = {
  O: hex('#0e0c0c'),
  w: hex('#d8d8d8'), // white hair
  s: hex('#c89a7c'),
  S: hex('#9c7258'),
  e: hex('#2a2a2a'),
  g: hex('#6ab0c8'), // goggles
  G: hex('#3a4a52'),
  o: hex('#c87a2a'), // orange overalls
  q: hex('#8a5420'),
  c: hex('#6a5a4a'), // cane
  f: hex('#2a2420'),
};
function ivoFrame(phase) {
  const c = canvas(32);
  c.ellipse(16, 9, 4.5, 4.5, 'w');
  c.ellipse(16, 10, 3.5, 4, 's');
  c.rect(12, 6, 20, 7, 'G');
  c.put(14, 6, 'g');
  c.put(18, 6, 'g');
  c.put(14, 10, phase === 2 ? 'S' : 'e');
  c.put(18, 10, phase === 2 ? 'S' : 'e');
  c.rect(14, 12, 18, 13, 'w'); // stubble beard
  for (let y = 15; y < 27; y++) c.rect(11, y, 21, y, y % 4 ? 'o' : 'q');
  c.rect(14, 15, 18, 19, 'q');
  c.rect(12, 27, 14, 30, 'f');
  c.rect(18, 27, 20, 30, 'f');
  // Cane, trembling.
  const tr = phase === 1 ? 1 : 0;
  c.line(23 + tr, 16, 24, 30, 'c');
  c.rect(21, 17, 23, 18, 's');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Mira
const MIRA = {
  O: hex('#0e0c10'),
  h: hex('#4a2e1e'), // dark brown pigtails
  s: hex('#e0b896'),
  S: hex('#b88a6a'),
  e: hex('#2a2030'),
  k: hex('#5a6e8a'), // oversized grey-blue coat
  K: hex('#3e4e66'),
  d: [230, 230, 240, 200], // chalk dust
  y: hex('#f0d060'), // chalk in hand
  f: hex('#2a2a30'),
};
function miraFrame(phase) {
  const c = canvas(32);
  const by = 4; // she is small
  c.ellipse(16, 10 + by, 4, 4, 'h');
  c.ellipse(16, 11 + by, 3.2, 3.4, 's');
  c.rect(10, 9 + by, 11, 13 + by, 'h'); // pigtails
  c.rect(21, 9 + by, 22, 13 + by, 'h');
  c.put(14, 11 + by, phase === 3 ? 'S' : 'e');
  c.put(18, 11 + by, phase === 3 ? 'S' : 'e');
  c.put(16, 13 + by, 'S');
  for (let y = 15 + by; y < 27; y++) c.rect(11, y, 21, y, y % 4 ? 'k' : 'K');
  c.rect(12, 27, 14, 30, 'f');
  c.rect(18, 27, 20, 30, 'f');
  // Arm raised, drawing with chalk.
  const up = phase % 2;
  c.rect(21, 15 + by - up * 2, 22, 18 + by, 'k');
  c.put(22, 14 + by - up * 2, 'y');
  if (up) {
    c.put(24, 12 + by, 'd');
    c.put(25, 14 + by, 'd');
  }
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Branch Phantom
const PHANTOM = {
  O: hex('#0a0810'),
  p: [150, 110, 255, 235], // solid self
  P: [100, 70, 200, 225],
  g: [150, 110, 255, 90], // the other-branch ghost
  e: hex('#e8f4ff'),
};
function phantomFrame(phase) {
  const c = canvas(32);
  const solidLeft = phase < 2;
  const sx = solidLeft ? 12 : 20;
  const gx = solidLeft ? 20 : 12;
  for (const [x, ch] of [
    [gx, 'g'],
    [sx, 'p'],
  ]) {
    c.ellipse(x, 10, 5, 5, ch);
    for (let y = 14; y < 29; y++) {
      const half = Math.round(5 - (y - 14) * 0.3 + Math.sin((y + phase) / 2));
      if (half > 0) c.rect(x - half, y, x + half, y, ch === 'p' && y % 4 === 0 ? 'P' : ch);
    }
  }
  c.put(sx - 2, 10, 'e');
  c.put(sx + 2, 10, 'e');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Unborn Cocoon
const COCOON = {
  O: hex('#0c080c'),
  c: hex('#c8b8c8'), // pale shell
  C: hex('#9a8a9e'),
  v: hex('#a84a6a'), // veins
  l: [255, 200, 220, 170], // inner glow
  r: hex('#4a3a3a'), // roots
};
function cocoonFrame(phase) {
  const c = canvas(32);
  const pulse = [0, 1, 2, 1][phase];
  c.line(10, 29, 16, 24, 'r');
  c.line(22, 29, 16, 24, 'r');
  c.ellipse(16, 17, 7 + pulse * 0.4, 10 + pulse * 0.4, 'c');
  c.ellipse(17, 18, 4, 6, 'C');
  c.ellipse(16, 17, 2 + pulse, 3 + pulse, 'l');
  c.line(12, 10, 14, 24, 'v');
  c.line(20, 9, 19, 25, 'v');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Unborn Horror (hatched)
const HORROR = {
  O: hex('#0a0608'),
  b: hex('#d0b8c0'), // pale skin-like hide
  B: hex('#a08890'),
  e: hex('#14080c'), // empty eyes
  l: hex('#ff8aa8'),
  s: hex('#7a5a64'), // shell shards
};
function horrorFrame(phase) {
  const c = canvas(32);
  const crawl = [0, 1, 0, -1][phase];
  c.ellipse(16, 19, 9, 6, 'b');
  c.ellipse(16, 12, 6, 5, 'b');
  c.ellipse(13, 12, 1.6, 2, 'e');
  c.ellipse(19, 12, 1.6, 2, 'e');
  c.put(13, 11, 'l');
  c.put(19, 11, 'l');
  for (const [x0, dir] of [
    [9, -1],
    [12, -1],
    [20, 1],
    [23, 1],
  ]) {
    c.line(x0, 21, x0 + dir * 4, 27 + ((x0 + crawl) % 2), 'B');
  }
  c.rect(8, 24, 11, 25, 's');
  c.rect(21, 25, 24, 26, 's');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Paradox Crystal
const CRYSTAL = {
  O: hex('#08080e'),
  c: [140, 120, 255, 230],
  C: [90, 70, 200, 230],
  m: hex('#d8e8ff'), // mirror facet
  g: [100, 220, 255, 180],
};
function crystalFrame(phase) {
  const c = canvas(32);
  const dy = [0, -1, -2, -1][phase];
  const pts = [
    [16, 3],
    [24, 14],
    [16, 28],
    [8, 14],
  ];
  for (let y = 3; y <= 28; y++)
    for (let x = 8; x <= 24; x++) {
      let inside = true;
      for (let i = 0; i < 4; i++) {
        const [x0, y0] = pts[i];
        const [x1, y1] = pts[(i + 1) % 4];
        if ((x1 - x0) * (y - y0) - (y1 - y0) * (x - x0) < 0) inside = false;
      }
      if (inside) c.put(x, y + dy, x < 16 ? 'c' : 'C');
    }
  c.line(16, 4 + dy, 16, 27 + dy, 'm');
  c.rect(13 + (phase % 2), 10 + dy, 15 + (phase % 2), 14 + dy, 'm');
  for (const [x, y] of [
    [5, 8],
    [27, 18],
    [6, 24],
  ])
    if ((x + phase) % 2) c.put(x, y, 'g');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Chronos Gardener (faces left)
const GARDENER = {
  O: hex('#0a0a0e'),
  w: hex('#e8e6e0'), // porcelain body
  W: hex('#b8b4ac'),
  e: hex('#7a5cd6'), // single violet lens
  m: hex('#c8ccd4'),
  M: hex('#8c96a8'),
  f: hex('#4a4a52'),
};
function gardenerFrame(phase) {
  const c = canvas(32);
  const raise = phase === 3 ? -4 : 0;
  c.ellipse(17, 8, 4.5, 4.5, 'w');
  c.ellipse(15, 8, 1.6, 1.6, 'e');
  for (let y = 13; y < 26; y++) c.rect(12, y, 22, y, y % 4 ? 'w' : 'W');
  c.rect(13, 26, 15, 30, 'f');
  c.rect(19, 26, 21, 30, 'f');
  // Long shear arms reaching forward (left).
  c.line(12, 16, 1, 14 + raise, 'm');
  c.line(12, 18, 1, 19 + raise, 'M');
  c.line(1, 14 + raise, 3, 17 + raise, 'm');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ output
const four = (fn) => [0, 1, 2, 3].map((p) => fn(p));
const OUT = [
  [
    'enemies/other_peter',
    'other_peter_v1.png',
    [...four((p) => otherPeterFrame(p)), otherPeterFrame(0, true)],
    48,
    OTHER,
    6,
  ],
  [
    'enemies/unborn_king',
    'unborn_king_v1.png',
    [...four((p) => kingFrame(p)), kingFrame(0, true)],
    64,
    KING,
    4,
  ],
  ['npcs/ivo', 'ivo_idle_v1.png', four(ivoFrame), 32, IVO, 8],
  ['npcs/mira', 'mira_idle_v1.png', four(miraFrame), 32, MIRA, 8],
  ['enemies/branch_phantom', 'branch_phantom_v1.png', four(phantomFrame), 32, PHANTOM, 8],
  ['enemies/unborn_cocoon', 'unborn_cocoon_v1.png', four(cocoonFrame), 32, COCOON, 8],
  ['enemies/unborn_horror', 'unborn_horror_v1.png', four(horrorFrame), 32, HORROR, 8],
  ['enemies/paradox_crystal', 'paradox_crystal_v1.png', four(crystalFrame), 32, CRYSTAL, 8],
  ['enemies/chronos_gardener', 'chronos_gardener_v1.png', four(gardenerFrame), 32, GARDENER, 8],
].map(([dir, name, frames, size, palette, k]) => ({
  file: `art-source/${dir}/generated/candidates/${name}`,
  frames,
  size,
  palette,
  k,
}));
for (const o of OUT) {
  const img = render(o.frames, o.size, o.palette);
  const dir = path.dirname(o.file);
  fs.mkdirSync(path.join(dir, 'previews'), { recursive: true });
  writeFile(o.file, encodePng(img.w, img.h, img.buf));
  writeFile(
    path.join(dir, 'previews', path.basename(o.file, '.png') + `_x${o.k}.png`),
    preview(img, o.k),
  );
  console.log(`✓ ${o.file} (${img.w}x${img.h})`);
}
