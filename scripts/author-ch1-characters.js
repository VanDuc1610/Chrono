/**
 * CHRONO – Chapter 1 characters (Pipeline B, AGENTS.md §5), CHAPTER_01_DESIGN.md §4 and §6:
 *   - The old lighthouse keeper  (32×32, 4-frame idle: lantern flicker + breath)
 *   - The Drowned Drifter        (32×32, 4-frame float)
 *   - The Sunken Bellkeeper      (64×64, 4-frame idle + 1 released/kneeling frame)
 * Deterministic pixel rules only — no image model, no external reference.
 * Output: art-source/{npcs,enemies}/<name>/generated/candidates/ ONLY (owner approval required).
 *
 * Usage: node scripts/author-ch1-characters.js
 */
import path from 'path';
import fs from 'fs';
import { hex, encodePng, writeFile } from './pixel-art/pixel.js';

const rnd = (x, y, s) => (((x * 73856093) ^ (y * 19349663) ^ (s * 83492791)) >>> 0) % 100;

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

// ------------------------------------------------------------------ the old lighthouse keeper
const KEEPER = {
  O: hex('#141210'),
  h: hex('#c8c4bc'), // white hair under the hood
  s: hex('#c09070'), // weathered skin
  S: hex('#946a4e'),
  e: hex('#2a2420'),
  c: hex('#4e6a62'), // faded sea-green áo tơi
  C: hex('#3a5049'),
  k: hex('#6e8a80'), // coat highlight
  p: hex('#3a3632'), // trousers
  f: hex('#4a3626'), // boots
  l: hex('#ffd666'), // lantern glow
  L: hex('#e8a030'),
  m: hex('#5a4a3a'), // lantern frame
};
function keeperFrame(phase) {
  const c = canvas(32);
  const bob = phase >= 2 ? 1 : 0;
  // Stooped: head forward and low, hood over white hair.
  c.ellipse(14, 9 + bob, 5, 5, 'c');
  c.ellipse(15, 10 + bob, 3.5, 3.5, 's');
  c.rect(11, 6 + bob, 17, 7 + bob, 'h');
  c.put(14, 10 + bob, 'e');
  c.put(17, 10 + bob, 'e');
  c.put(15, 12 + bob, 'S');
  c.rect(14, 13 + bob, 17, 13 + bob, 'h'); // stubble
  // Long raincoat, hunched shoulders.
  for (let y = 14; y < 27; y++) {
    const half = Math.round(4 + (y - 14) * 0.18);
    c.rect(
      15 - half,
      y + (y < 18 ? bob : 0),
      15 + half,
      y + (y < 18 ? bob : 0),
      y % 6 === 0 ? 'C' : 'c',
    );
  }
  c.rect(11, 15 + bob, 11, 24, 'k');
  c.rect(12, 27, 14, 29, 'p');
  c.rect(17, 27, 19, 29, 'p');
  c.rect(11, 30, 14, 30, 'f');
  c.rect(17, 30, 20, 30, 'f');
  // Arm held out with the storm lantern; the flame flickers.
  c.rect(19, 17 + bob, 23, 18 + bob, 'c');
  c.put(24, 18 + bob, 's');
  c.rect(23, 19, 27, 19, 'm');
  c.rect(23, 20, 23, 25, 'm');
  c.rect(27, 20, 27, 25, 'm');
  c.rect(23, 26, 27, 26, 'm');
  const flame = [
    ['l', 'L'],
    ['L', 'l'],
    ['l', 'l'],
    ['L', 'L'],
  ][phase];
  c.rect(24, 20, 26, 25, flame[0]);
  c.rect(25, 21, 25, 24, flame[1]);
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ the Drowned Drifter
const DRIFTER = {
  O: hex('#06141a'),
  w: [58, 159, 186, 200], // seawater body, translucent
  W: [136, 210, 228, 210],
  d: [29, 95, 120, 190],
  g: hex('#2e6a3a'), // kelp
  G: hex('#1c4a28'),
  c: hex('#46e0b0'), // drowned light at its core
  a: hex('#b4ffe0'),
  e: hex('#e6f9ff'),
};
function drifterFrame(phase) {
  const c = canvas(32);
  const dy = [0, -1, -2, -1][phase];
  // A hunched human shape made of seawater, trailing off into a tail of water.
  c.ellipse(16, 9 + dy, 5, 5, 'w');
  c.ellipse(16, 18 + dy, 8, 7, 'w');
  for (let y = 24; y < 31; y++) c.rect(16 - (31 - y), y + dy, 16 + (31 - y) - 1, y + dy, 'd');
  c.ellipse(14, 7 + dy, 2, 1.5, 'W');
  c.ellipse(12, 16 + dy, 2, 3, 'W');
  // Long arms hanging, swaying.
  const sway = [0, 1, 0, -1][phase];
  c.rect(8 + sway, 14 + dy, 9 + sway, 25 + dy, 'w');
  c.rect(23 - sway, 14 + dy, 24 - sway, 25 + dy, 'w');
  // Hollow eyes and a glowing core.
  c.put(14, 9 + dy, 'e');
  c.put(18, 9 + dy, 'e');
  c.ellipse(16, 18 + dy, 2.2, 2.2, phase % 2 ? 'a' : 'c');
  // Kelp clinging to it.
  for (let k = 0; k < 9; k++) {
    c.put(11 + Math.round(Math.sin(k / 2 + phase) * 1), 11 + k + dy, k % 3 ? 'g' : 'G');
    c.put(21 + Math.round(Math.cos(k / 2 + phase) * 1), 13 + k + dy, k % 3 ? 'G' : 'g');
  }
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ The Sunken Bellkeeper (64)
const BELLKEEPER = {
  O: hex('#0a0f12'),
  a: hex('#6e5a3a'), // salt-eaten bronze armour
  A: hex('#4a3c26'),
  h: hex('#9a8256'),
  v: hex('#0a1418'), // visor
  y: hex('#ffd666'), // eyes: warm, tired light
  r: hex('#e07a6a'), // coral
  R: hex('#a84a48'),
  b: hex('#3f7a5a'), // the cracked bell, verdigris
  B: hex('#6aa47a'),
  k: hex('#8c6628'), // bell lip
  c: hex('#46e0b0'), // light through the crack
  z: hex('#5a5a5e'), // anchor chain
  Z: hex('#3a3a3e'),
};
function bellkeeper(phase, kneel = false) {
  const c = canvas(64);
  const bob = kneel ? 8 : phase === 1 || phase === 2 ? 1 : 0;
  const Y = (y) => y + bob;
  // Legs (or one knee down when released).
  if (kneel) {
    c.rect(20, 50, 30, 58, 'a');
    c.rect(34, 52, 46, 58, 'a');
  } else {
    c.rect(22, Y(46), 29, 60, 'a');
    c.rect(35, Y(46), 42, 60, 'a');
    c.rect(20, 58, 31, 61, 'A');
    c.rect(33, 58, 44, 61, 'A');
  }
  // Heavy torso and shoulders.
  c.rect(20, Y(20), 44, Y(44), 'a');
  c.ellipse(18, Y(22), 8, 6, 'a');
  c.ellipse(46, Y(22), 8, 6, 'a');
  c.ellipse(16, Y(20), 4, 2, 'h');
  c.ellipse(44, Y(20), 4, 2, 'h');
  // Helm: a domed diver-like helmet with a narrow visor and two tired, warm lights.
  c.ellipse(32, Y(12), 9, 9, 'a');
  c.ellipse(29, Y(8), 3, 2, 'h');
  c.rect(26, Y(12), 38, Y(14), 'v');
  c.put(29, Y(13), 'y');
  c.put(35, Y(13), 'y');
  // Arms wrapped around the great cracked bell held against the chest.
  const by = kneel ? 52 : Y(30);
  for (let y = 0; y < 18; y++) {
    const half = Math.round(5 + y * 0.45 + (y > 14 ? (y - 14) * 1.2 : 0));
    c.rect(32 - half, by - 8 + y, 32 + half, by - 8 + y, y > 15 ? 'k' : x0col(y));
  }
  function x0col(y) {
    return y % 5 === 0 ? 'B' : 'b';
  }
  for (const [x, y] of [
    [34, 0],
    [35, 3],
    [33, 6],
    [35, 9],
    [36, 12],
  ])
    c.put(x, by - 8 + y, phase % 2 && !kneel ? 'c' : 'B');
  c.rect(14, Y(26), 19, Y(40), 'a');
  c.rect(45, Y(26), 50, Y(40), 'a');
  c.ellipse(22, by, 4, 3, 'A');
  c.ellipse(42, by, 4, 3, 'A');
  // Broken anchor chains over the shoulders.
  for (let k = 0; k < 14; k++) {
    c.put(13 + k, Y(17) + Math.round(k * 0.3), k % 2 ? 'z' : 'Z');
    c.put(51 - k, Y(17) + Math.round(k * 0.3), k % 2 ? 'Z' : 'z');
  }
  c.rect(10, Y(17), 11, Y(30), 'z');
  // Coral crusting the armour.
  for (const [x, y] of [
    [21, 24],
    [43, 26],
    [24, 40],
    [40, 42],
    [17, 33],
    [47, 34],
  ]) {
    c.put(x, Y(y), 'r');
    c.put(x + 1, Y(y), 'R');
    c.put(x, Y(y) - 1, 'r');
  }
  if (kneel) {
    // Head bowed: drop the eyes' light, and let the bell rest on the floor.
    for (let y = 0; y < 64; y++)
      for (let x = 0; x < 64; x++) if (c.g[y][x] === 'y') c.g[y][x] = 'v';
    for (let k = 0; k < 20; k++)
      c.put(6 + ((k * 23) % 52), 2 + ((k * 31) % 22), rnd(k, 1, 3) < 50 ? 'c' : 'B');
  }
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ output
const OUT = [
  {
    file: 'art-source/npcs/old_keeper/generated/candidates/old_keeper_idle_v1.png',
    frames: [0, 1, 2, 3].map(keeperFrame),
    size: 32,
    palette: KEEPER,
    k: 8,
  },
  {
    file: 'art-source/enemies/drifter/generated/candidates/drifter_float_v1.png',
    frames: [0, 1, 2, 3].map(drifterFrame),
    size: 32,
    palette: DRIFTER,
    k: 8,
  },
  {
    file: 'art-source/enemies/bellkeeper/generated/candidates/bellkeeper_v1.png',
    frames: [bellkeeper(0), bellkeeper(1), bellkeeper(2), bellkeeper(3), bellkeeper(0, true)],
    size: 64,
    palette: BELLKEEPER,
    k: 4,
  },
];
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
