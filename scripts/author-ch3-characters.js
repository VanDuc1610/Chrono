/**
 * CHRONO – Chapter 3 characters (Pipeline B, AGENTS.md §5), CHAPTER_03_DESIGN.md §4, §6, §12:
 *   Neris, King Alden (32x32 x4 idle); Memory Wraith, Thought Eater, Hollow Archivist (32x32 x4);
 *   The Keeper Without a Face (48x48, 4 idle + cracked); The Nameless Choir (64x64, 4 idle + dissolving).
 * Deterministic pixel rules only — no image model, no external reference.
 * Output: art-source/{npcs,enemies}/<name>/generated/candidates/ ONLY (owner approval required).
 *
 * Usage: node scripts/author-ch3-characters.js
 */
import path from 'path';
import fs from 'fs';
import { hex, encodePng, writeFile } from './pixel-art/pixel.js';

function canvas(size) {
  const g = Array.from({ length: size }, () => Array(size).fill('.'));
  const put = (x, y, ch) => {
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
      for (let i = 0; i <= n; i++)
        put(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), ch);
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

// ------------------------------------------------------------------ Neris, the nameless librarian
const NERIS = {
  O: hex('#121014'),
  h: hex('#5a3a2a'), // chestnut hair, side braid
  H: hex('#7a5038'),
  s: hex('#e0b090'),
  S: hex('#b88468'),
  e: hex('#2a2030'),
  t: hex('#8a8a92'), // ash-grey tunic
  T: hex('#64646c'),
  b: hex('#6ab0d8'), // faint blue embroidery
  l: hex('#7a5232'), // leather satchel
  g: hex('#c8e8ff'), // reading lens
  k: hex('#4a3a5a'), // book cover
  p: hex('#e8e0d0'), // pages
  f: hex('#3a3036'),
};
function nerisFrame(phase) {
  const c = canvas(32);
  const blink = phase === 2;
  c.ellipse(16, 9, 5, 5.5, 'h');
  c.ellipse(16, 10, 3.6, 4, 's');
  c.rect(12, 5, 20, 7, 'h');
  c.put(14, 6, 'H');
  c.put(18, 5, 'H');
  c.put(14, 10, blink ? 'S' : 'e');
  c.put(18, 10, blink ? 'S' : 'e');
  c.put(16, 12, 'S');
  // Braid over the left shoulder.
  for (let k = 0; k < 9; k++) c.put(11 - (k > 3 ? 1 : 0), 12 + k, k % 2 ? 'H' : 'h');
  // Tunic with embroidery.
  for (let y = 15; y < 28; y++) {
    const half = Math.round(5 + (y - 15) * 0.15);
    c.rect(16 - half, y, 16 + half, y, 't');
  }
  c.rect(12, 15, 12, 27, 'T');
  c.rect(15, 16, 17, 16, 'b');
  c.put(16, 18, 'b');
  c.rect(13, 26, 19, 26, 'b');
  // Satchel with a lens.
  c.rect(19, 21, 23, 25, 'l');
  c.put(21, 23, 'g');
  c.line(14, 15, 21, 21, 'l');
  // Book held open, a page turning.
  c.rect(9, 19, 14, 22, 'k');
  c.rect(10, 19, 13, 21, 'p');
  if (phase === 1) c.rect(11, 18, 12, 18, 'p');
  c.put(15, 21, 's');
  c.rect(13, 28, 15, 30, 'f');
  c.rect(17, 28, 19, 30, 'f');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ King Alden on his throne
const KING = {
  O: hex('#100c0c'),
  w: hex('#a8a4a0'), // greying hair and beard
  W: hex('#7c7874'),
  s: hex('#c8987a'),
  S: hex('#a07458'),
  e: hex('#2a2020'),
  c: hex('#d8b048'), // crown, askew
  r: hex('#8a2a2a'), // royal robe, faded
  R: hex('#5e1c1c'),
  y: hex('#c8a040'), // gold trim
  t: hex('#5a4a5a'), // stone throne
  T: hex('#3e3240'),
  v: hex('#d8dce4'), // silver chalice
};
function kingFrame(phase) {
  const c = canvas(32);
  const tremble = [0, 1, 0, -1][phase];
  // Throne back and armrests.
  c.rect(8, 3, 24, 26, 't');
  c.rect(8, 3, 24, 4, 'T');
  c.rect(6, 18, 9, 28, 'T');
  c.rect(23, 18, 26, 28, 'T');
  // Seated king, head bowed.
  c.ellipse(16, 10, 4.5, 4.5, 'w');
  c.ellipse(16, 11, 3.4, 3.6, 's');
  c.put(14, 11, 'e');
  c.put(18, 11, 'e');
  c.rect(14, 13, 18, 15, 'w');
  c.rect(15, 15, 17, 16, 'W');
  // Crown slipping to one side.
  c.rect(12, 5, 17, 6, 'c');
  c.put(12, 4, 'c');
  c.put(15, 4, 'c');
  c.put(17, 5, 'c');
  // Robe.
  for (let y = 15; y < 28; y++)
    c.rect(11 - (y > 22 ? 1 : 0), y, 21 + (y > 22 ? 1 : 0), y, y % 4 ? 'r' : 'R');
  c.rect(15, 15, 17, 27, 'y');
  c.rect(10, 27, 22, 27, 'y');
  // Hand holding the silver chalice, trembling.
  c.rect(20, 19 + tremble, 21, 20 + tremble, 's');
  c.rect(21, 15 + tremble, 24, 17 + tremble, 'v');
  c.rect(22, 18 + tremble, 23, 18 + tremble, 'v');
  c.rect(21, 19 + tremble, 24, 19 + tremble, 'v');
  // Other hand at the temple.
  c.rect(11, 12, 12, 14, 's');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Memory Wraith
const WRAITH = {
  O: hex('#0c0812'),
  c: [104, 62, 150, 230], // tattered violet cloak
  C: [70, 38, 108, 220],
  d: [50, 26, 80, 170],
  v: hex('#06040a'), // void under the hood
  e: hex('#7ff0ff'),
  m: [200, 160, 255, 150], // memory motes
};
function wraithFrame(phase) {
  const c = canvas(32);
  const dy = [0, -1, -2, -1][phase];
  c.ellipse(16, 10 + dy, 6, 6, 'c');
  c.ellipse(16, 11 + dy, 3.5, 4, 'v');
  c.put(14, 11 + dy, 'e');
  c.put(18, 11 + dy, 'e');
  for (let y = 15; y < 30; y++) {
    // Wide shoulders tapering into a wisp that sways with the frame.
    const half = Math.round(8 - (y - 15) * 0.5 + Math.sin((y + phase * 2) / 2.5) * 1.2);
    if (half > 0) c.rect(16 - half, y + dy, 16 + half, y + dy, y > 25 ? 'd' : y % 3 ? 'c' : 'C');
  }
  // Ragged hem.
  for (const x of [11, 14, 18, 21]) c.put(x, 29 + dy + ((x + phase) % 2), 'd');
  // Claws reaching out.
  c.rect(8, 17 + dy, 10, 18 + dy, 'C');
  c.rect(22, 17 + dy, 24, 18 + dy, 'C');
  for (const [x, y] of [
    [5, 6],
    [27, 12],
    [6, 22],
    [26, 26],
  ])
    if ((x + y + phase) % 2) c.put(x, y + dy, 'm');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Thought Eater
const EATER = {
  O: hex('#0a060c'),
  b: hex('#4a2a5a'), // hide
  B: hex('#2e1a3a'),
  h: hex('#6e4a82'),
  x: hex('#b070ff'), // crystal shards on its back
  X: hex('#e0c0ff'),
  m: hex('#1a0a12'), // maw
  t: hex('#e8e0d8'), // teeth
  e: hex('#ffcf5a'),
};
function eaterFrame(phase) {
  const c = canvas(32);
  const step = phase % 2;
  // Low, wide body.
  c.ellipse(16, 20, 10, 6, 'b');
  c.ellipse(16, 18, 8, 4, 'h');
  // Six legs scuttling.
  for (const [x, dir] of [
    [9, -1],
    [13, -1],
    [19, 1],
    [23, 1],
  ]) {
    const lift = (x + step) % 2;
    c.line(x, 23, x + dir * 2, 28 - lift, 'B');
  }
  c.line(6, 21, 3, 26 - step, 'B');
  c.line(26, 21, 29, 26 - (1 - step), 'B');
  // Crystal shards gnawed from memories.
  for (const [x, h] of [
    [11, 5],
    [15, 7],
    [19, 5],
    [22, 3],
  ]) {
    c.line(x, 15, x + 1, 15 - h, 'x');
    c.put(x + 1, 15 - h, 'X');
  }
  // Head and maw.
  c.ellipse(7, 19, 4, 3.5, 'b');
  c.rect(3, 19, 7, 21, 'm');
  for (const x of [3, 5, 7]) c.put(x, 19 + (phase === 2 ? 0 : 1), 't');
  c.put(8, 17, 'e');
  c.put(6, 17, 'e');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Hollow Archivist
const ARCHIVIST = {
  O: hex('#0c0c10'),
  r: hex('#7a7670'), // ash-grey robe
  R: hex('#55524e'),
  v: hex('#050508'), // empty hood
  g: hex('#9fd3ff'), // faint glow inside
  k: hex('#b08a4a'), // bronze tube staff
  K: hex('#7a5e30'),
  p: hex('#e0d8c0'), // scroll tags
};
function archivistFrame(phase) {
  const c = canvas(32);
  const sway = [0, 1, 0, -1][phase];
  // Tall robe, hood empty.
  c.ellipse(15, 8, 5, 5.5, 'r');
  c.ellipse(15, 9, 3.2, 4, 'v');
  if (phase % 2) c.put(15, 9, 'g');
  for (let y = 13; y < 31; y++) {
    const half = Math.round(4 + (y - 13) * 0.25);
    c.rect(
      15 - half + (y > 26 ? sway : 0),
      y,
      15 + half + (y > 26 ? sway : 0),
      y,
      y % 5 ? 'r' : 'R',
    );
  }
  // Scroll tags hanging from the belt.
  for (const x of [12, 15, 18]) c.rect(x, 20, x, 22 + (x % 2), 'p');
  c.rect(11, 19, 19, 19, 'R');
  // Staff of bronze archive tubes.
  c.rect(23, 3, 24, 30, 'k');
  for (const y of [4, 8, 12]) c.rect(22, y, 25, y + 1, 'K');
  c.rect(20, 15, 22, 16, 'r');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ The Keeper Without a Face (48)
const KEEPER = {
  O: hex('#0a0a0c'),
  r: hex('#6e6e74'), // grey shroud
  R: hex('#4a4a50'),
  h: hex('#9a9aa2'),
  m: hex('#b8d8f0'), // mirror face
  M: hex('#e8f6ff'),
  n: hex('#7aa0c0'),
  x: hex('#3a5a7a'), // cracks
  b: hex('#c8d0dc'), // mirror-shard blade
};
function keeperFrame(phase, cracked = false) {
  const c = canvas(48);
  const dy = cracked ? 4 : [0, 1, 1, 0][phase];
  // Shroud.
  for (let y = 16; y < 46; y++) {
    const half = Math.round(9 + (y - 16) * 0.22);
    c.rect(24 - half, y + (y < 30 ? dy : 0), 24 + half, y + (y < 30 ? dy : 0), y % 6 ? 'r' : 'R');
  }
  c.ellipse(24, 12 + dy, 9, 9, 'r');
  c.line(17, 18 + dy, 14, 44, 'h');
  // Flat mirror where the face should be.
  c.ellipse(24, 13 + dy, 6, 7, 'n');
  c.ellipse(24, 13 + dy, 5, 6, 'm');
  c.line(21, 9 + dy, 23, 7 + dy, 'M');
  c.put(27, 16 + dy, 'M');
  if (cracked) {
    c.line(20, 8, 28, 19, 'x');
    c.line(26, 8, 22, 18, 'x');
  }
  // Arms and the mirror-shard blade.
  c.rect(12, 22 + dy, 15, 34, 'r');
  c.rect(33, 22 + dy, 36, 34, 'r');
  if (cracked) {
    c.line(34, 40, 42, 46, 'b');
  } else {
    c.line(36, 34, 44, 18 - phase, 'b');
    c.line(37, 34, 45, 18 - phase, 'b');
  }
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ The Nameless Choir (64)
const CHOIR = {
  O: hex('#060408'),
  k: hex('#1e1626'), // black crystal
  K: hex('#3a2c4a'),
  h: hex('#5a4a72'),
  c: hex('#7ff0ff'), // core light
  f: [214, 220, 236, 230], // pale ghost faces
  F: [150, 160, 190, 210],
  e: hex('#1a1420'),
  s: [180, 140, 255, 160], // song motes
};
function choirFrame(phase, dissolving = false) {
  const c = canvas(64);
  const bob = dissolving ? 0 : [0, -1, -2, -1][phase];
  // Floating black crystal mass.
  const pts = [
    [32, 8],
    [44, 22],
    [40, 46],
    [32, 54],
    [24, 46],
    [20, 22],
  ];
  for (let y = 8; y <= 54; y++)
    for (let x = 16; x <= 48; x++) {
      let inside = true;
      for (let i = 0; i < pts.length; i++) {
        const [x0, y0] = pts[i];
        const [x1, y1] = pts[(i + 1) % pts.length];
        if ((x1 - x0) * (y - y0) - (y1 - y0) * (x - x0) < 0) inside = false;
      }
      if (inside && !(dissolving && (x * 7 + y * 3) % 5 === 0))
        c.put(x, y + bob, (x + y) % 9 === 0 ? 'K' : 'k');
    }
  c.line(32, 9 + bob, 26, 45 + bob, 'h');
  c.line(32, 9 + bob, 40, 44 + bob, 'K');
  c.ellipse(32, 30 + bob, 3, 4, dissolving ? 'h' : 'c');
  // Ghost faces orbiting and singing.
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + phase * (Math.PI / 12);
    const fx = Math.round(32 + Math.cos(a) * 25);
    const fy = Math.round(31 + Math.sin(a) * 18) + bob;
    if (dissolving && k % 2) continue;
    c.ellipse(fx, fy, 3.5, 4, k % 2 ? 'F' : 'f');
    c.put(fx - 1, fy - 1, 'e');
    c.put(fx + 1, fy - 1, 'e');
    c.rect(fx - 1, fy + 1, fx + 1, fy + 2, 'e'); // open, singing mouths
  }
  for (let k = 0; k < 8; k++) c.put(((k * 17 + phase * 5) % 60) + 2, ((k * 23) % 58) + 3, 's');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ output
const OUT = [
  ['npcs/neris', 'neris_idle_v1.png', [0, 1, 2, 3].map(nerisFrame), 32, NERIS, 8],
  ['npcs/amnesiac_king', 'amnesiac_king_idle_v1.png', [0, 1, 2, 3].map(kingFrame), 32, KING, 8],
  ['enemies/memory_wraith', 'memory_wraith_v1.png', [0, 1, 2, 3].map(wraithFrame), 32, WRAITH, 8],
  ['enemies/thought_eater', 'thought_eater_v1.png', [0, 1, 2, 3].map(eaterFrame), 32, EATER, 8],
  [
    'enemies/hollow_archivist',
    'hollow_archivist_v1.png',
    [0, 1, 2, 3].map(archivistFrame),
    32,
    ARCHIVIST,
    8,
  ],
  [
    'enemies/faceless_keeper',
    'faceless_keeper_v1.png',
    [keeperFrame(0), keeperFrame(1), keeperFrame(2), keeperFrame(3), keeperFrame(0, true)],
    48,
    KEEPER,
    6,
  ],
  [
    'enemies/nameless_choir',
    'nameless_choir_v1.png',
    [choirFrame(0), choirFrame(1), choirFrame(2), choirFrame(3), choirFrame(0, true)],
    64,
    CHOIR,
    4,
  ],
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
