/**
 * CHRONO – Chapter 6 characters (Pipeline B, AGENTS.md §5), CHAPTER_06_DESIGN.md §9, §12, §17:
 *   The Broken Herald (48x48, 4 idle + kneeling), The Genesis Warden (64x64, 4 idle + spent),
 *   Echo of the First Forgotten (48x48 x4), The Remnant Deacon (48x48 x4),
 *   Heel Shadow (Peter's own shadow — keeps the curly-hair silhouette), Origin Nullifier,
 *   Archon Construct (32x32 x4), Twin Star orb (16x16 x4),
 *   Chronos' Remnant and Archon Solon (32x32 x4).
 * Deterministic pixel rules only — no image model, no external reference.
 * Output: art-source/{npcs,enemies}/<name>/generated/candidates/ ONLY.
 *
 * Usage: node scripts/author-ch6-characters.js
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
      for (let y = Math.round(y0); y <= y1; y++)
        for (let x = Math.round(x0); x <= x1; x++) put(x, y, ch);
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

// ------------------------------------------------------------------ The Broken Herald (48x48)
const HERALD = {
  O: hex('#0e0c14'),
  m: hex('#d8dce6'), // silver mask
  M: hex('#9aa0b0'),
  c: hex('#3a3450'), // ragged cloak
  C: hex('#262236'),
  w: hex('#a87a4a'), // rusted metal wing
  W: hex('#7a5232'),
  g: hex('#e8c060'), // gold trim
  e: hex('#9fe8ff'), // eye slit light
};
function heraldFrame(phase, kneel = false) {
  const c = canvas(48);
  const bob = kneel ? 7 : [0, -1, -1, 0][phase];
  // Whole left wing (fanned metal feathers), broken right wing.
  const flap = kneel ? 6 : [0, -2, -3, -1][phase];
  for (let k = 0; k < 5; k++) c.line(18, 18 + bob, 3 + k * 2, 6 + k * 4 + flap, k % 2 ? 'W' : 'w');
  c.line(30, 18 + bob, 38, 12 + bob, 'w');
  c.line(31, 19 + bob, 40, 16 + bob, 'W');
  c.put(41, 15 + bob, 'W');
  // Cloak.
  for (let y = 16; y <= 46; y++) {
    const half = Math.round(6 + (y - 16) * 0.35);
    for (let x = 24 - half; x <= 24 + half; x++) {
      if (y > 40 && (x + y + phase) % 4 === 0) continue; // ragged hem
      c.put(x, y + (kneel ? 2 : 0), (x + Math.floor(y / 3)) % 5 === 0 ? 'C' : 'c');
    }
  }
  c.rect(17, 20 + bob, 31, 21 + bob, 'g');
  // Silver veiled mask.
  c.ellipse(24, 11 + bob, 6, 7, 'm');
  c.rect(19, 12 + bob, 29, 13 + bob, 'M');
  c.rect(21, 10 + bob, 27, 10 + bob, 'e');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ The Genesis Warden (64x64)
const WARDEN = {
  O: hex('#0c0a10'),
  k: hex('#d4d8e4'), // platinum body
  K: hex('#9aa0b2'),
  q: hex('#646a7c'),
  g: hex('#e8c060'), // gear crown
  G: hex('#a8822c'),
  y: hex('#fff0a8'), // core light
  w: hex('#ffffff'),
};
function wardenFrame(phase, spent = false) {
  const c = canvas(64);
  const bob = [0, 0, -1, -1][phase];
  // Lion body lying, front paws forward.
  c.ellipse(36, 44 + bob, 22, 11, 'K');
  c.ellipse(36, 42 + bob, 20, 9, 'k');
  c.rect(8, 50 + bob, 22, 55 + bob, 'K');
  c.rect(8, 50 + bob, 22, 51 + bob, 'k');
  c.rect(46, 50 + bob, 58, 55 + bob, 'q');
  // Human head of the sphinx.
  c.ellipse(20, 26 + bob, 8, 10, 'k');
  c.rect(14, 30 + bob, 26, 36 + bob, 'K');
  c.rect(16, 24 + bob, 18, 25 + bob, spent ? 'q' : 'y');
  c.rect(22, 24 + bob, 24, 25 + bob, spent ? 'q' : 'y');
  // Gear crown, turning.
  if (!spent) {
    c.ellipse(20, 14 + bob, 9, 4, 'g');
    for (let k = 0; k < 6; k++) {
      const a = ((k + phase * 0.5) * Math.PI) / 3;
      c.rect(
        20 + Math.cos(a) * 9 - 1,
        14 + bob + Math.sin(a) * 4 - 2,
        20 + Math.cos(a) * 9,
        14 + bob + Math.sin(a) * 4,
        'G',
      );
    }
  } else {
    c.ellipse(46, 60, 6, 2, 'G');
  }
  // Core on its back (the regulator).
  c.ellipse(46, 36 + bob, 5, 5, 'G');
  c.ellipse(46, 36 + bob, 3, 3, spent ? 'q' : phase % 2 ? 'w' : 'y');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Echo of the First Forgotten (48x48)
const ECHO = {
  O: [6, 4, 10, 255],
  v: [24, 14, 38, 235],
  V: [48, 28, 72, 220],
  p: [140, 100, 220, 200],
  g: hex('#e8c060'), // glyph chains
  e: hex('#f4ecff'),
};
function echoFrame(phase) {
  const c = canvas(48);
  const sway = [0, 1, 0, -1][phase];
  for (let y = 6; y <= 46; y++) {
    const half = Math.round(5 + Math.sin(y / 6) * 3 + (y - 6) * 0.3);
    for (let x = 24 - half + sway; x <= 24 + half + sway; x++)
      c.put(x, y, (x + y + phase) % 7 === 0 ? 'p' : y % 5 === 0 ? 'V' : 'v');
  }
  c.ellipse(24 + sway, 12, 7, 8, 'v');
  c.put(21 + sway, 12, 'e');
  c.put(27 + sway, 12, 'e');
  // Golden glyph chains binding it.
  for (const y of [20, 30, 40]) {
    for (let x = 8; x <= 40; x += 2) c.put(x, y + ((x / 2 + phase) % 2), 'g');
  }
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ The Remnant Deacon (48x48)
const DEACON = {
  O: hex('#100e14'),
  r: hex('#c8ccd8'), // silver robe
  R: hex('#8a90a0'),
  f: hex('#e8e0f0'), // pale face
  h: hex('#5a5a6a'), // hammer head
  H: hex('#3a3a48'),
  l: hex('#7a5a3a'), // shaft
  g: hex('#e8c060'),
};
function deaconFrame(phase) {
  const c = canvas(48);
  const bob = [0, -1, 0, 1][phase];
  for (let y = 16; y <= 46; y++) {
    const half = Math.round(5 + (y - 16) * 0.32);
    for (let x = 22 - half; x <= 22 + half; x++)
      c.put(x, y, x === 22 ? 'g' : y % 6 === 0 ? 'R' : 'r');
  }
  c.ellipse(22, 10 + bob, 5, 6, 'f');
  c.rect(17, 4 + bob, 27, 6 + bob, 'R');
  // Hammer held up, swaying with the cadence.
  const tilt = [0, 1, 2, 1][phase];
  c.line(30, 30, 36 + tilt, 8 + bob, 'l');
  c.rect(31 + tilt, 3 + bob, 43 + tilt, 9 + bob, 'h');
  c.rect(31 + tilt, 8 + bob, 43 + tilt, 9 + bob, 'H');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Heel Shadow (Peter's shadow)
const SHADOW = {
  O: [12, 6, 20, 255],
  s: [30, 18, 46, 220],
  S: [52, 34, 76, 200],
  e: [200, 170, 255, 255],
};
function shadowFrame(phase) {
  const c = canvas(32);
  const step = [0, 1, 0, -1][phase];
  // Curly hair silhouette (springy coils, full rounded coverage — Peter's identity lock).
  for (const [x, y] of [
    [12, 6],
    [15, 4],
    [18, 4],
    [21, 6],
    [11, 9],
    [22, 9],
    [16, 6],
  ])
    c.ellipse(x, y, 2.6, 2.6, 'S');
  c.ellipse(16.5, 10, 5, 5, 's');
  c.rect(12, 15, 21, 24, 's');
  c.rect(10, 16, 11, 22, 's');
  c.rect(22, 16, 23, 22, 's');
  c.rect(13, 25, 15, 29 + step, 's');
  c.rect(18, 25, 20, 29 - step, 's');
  c.put(14, 10, 'e');
  c.put(19, 10, 'e');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Origin Nullifier
const NULLIFIER = {
  O: hex('#0c0a12'),
  k: hex('#c8ccd8'),
  K: hex('#8a90a0'),
  w: hex('#f4f4ff'),
  p: hex('#a070e0'),
  P: hex('#5a3a9a'),
};
function nullifierFrame(phase) {
  const c = canvas(32);
  const bob = [0, -1, -1, 0][phase];
  c.ellipse(16, 15 + bob, 11, 10, 'K');
  c.ellipse(16, 15 + bob, 9, 8, 'k');
  c.ellipse(16, 15 + bob, 6, 6, 'w');
  const pupil = [4, 3, 2, 3][phase];
  c.ellipse(16, 15 + bob, pupil, pupil, 'p');
  c.ellipse(16, 15 + bob, pupil / 2, pupil / 2, 'P');
  for (const [x0, x1] of [
    [4, 8],
    [24, 28],
  ])
    c.rect(x0, 14 + bob, x1, 16 + bob, 'K');
  c.rect(15, 26 + bob, 17, 29 + bob, 'K');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Archon Construct
const CONSTRUCT = {
  O: hex('#0e0c10'),
  m: hex('#e0d8c8'),
  M: hex('#a89c88'),
  r: hex('#ff5a3a'),
  g: hex('#e8c060'),
};
function constructFrame(phase) {
  const c = canvas(32);
  const lift = [0, 1, 2, 1][phase];
  c.rect(10, 10, 21, 24, 'm');
  c.rect(10, 22, 21, 24, 'M');
  c.ellipse(16, 7, 4, 4, 'm');
  c.rect(14, 6, 18, 7, 'r');
  // Four arms: two raised (they lift with the beat), two low.
  c.rect(5, 6 - lift, 8, 13, 'M');
  c.rect(23, 6 - lift, 26, 13, 'M');
  c.rect(5, 15, 8, 21, 'm');
  c.rect(23, 15, 26, 21, 'm');
  c.rect(11, 25, 14, 29, 'M');
  c.rect(17, 25, 20, 29, 'M');
  c.rect(13, 14, 18, 15, 'g');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Twin Star orb (16x16)
const ORB = {
  O: hex('#100c08'),
  y: hex('#ffe08a'),
  Y: hex('#e8a83a'),
  w: hex('#ffffff'),
};
function orbFrame(phase) {
  const c = canvas(16);
  c.ellipse(8, 8, 5, 5, 'Y');
  c.ellipse(8, 8, 4, 4, 'y');
  c.put(6 + (phase % 2), 6, 'w');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Chronos' Remnant
const REMNANT = {
  O: [40, 30, 10, 200],
  y: [255, 230, 150, 200],
  Y: [220, 180, 90, 190],
  w: [255, 250, 230, 230],
  g: hex('#e8c060'),
};
function remnantFrame(phase) {
  const c = canvas(32);
  const bob = [0, -1, -1, 0][phase];
  for (let y = 12; y <= 30; y++) {
    const half = Math.round(4 + (y - 12) * 0.35);
    for (let x = 16 - half; x <= 16 + half; x++) c.put(x, y + bob, (x + y) % 5 ? 'y' : 'Y');
  }
  c.ellipse(16, 8 + bob, 4, 5, 'w');
  // A broken crown of hands of a clock.
  c.line(16, 2 + bob, 16, 5 + bob, 'g');
  c.line(12, 3 + bob, 14, 5 + bob, 'g');
  c.line(20, 3 + bob, 18, 5 + bob, 'g');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Archon Solon (ghost)
const SOLON = {
  O: [20, 30, 50, 220],
  b: [180, 210, 240, 210],
  B: [120, 150, 190, 200],
  f: [230, 240, 255, 230],
  g: hex('#c8a040'),
};
function solonFrame(phase) {
  const c = canvas(32);
  const bob = [0, -1, 0, 1][phase];
  for (let y = 13; y <= 30; y++) {
    const half = Math.round(4 + (y - 13) * 0.3);
    for (let x = 16 - half; x <= 16 + half; x++) c.put(x, y + bob, x % 4 ? 'b' : 'B');
  }
  c.ellipse(16, 8 + bob, 4, 5, 'f');
  c.rect(12, 13 + bob, 20, 13 + bob, 'g');
  // A stamp held in both hands (the seal he regrets).
  c.rect(14, 18 + bob, 18, 21 + bob, 'g');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ output
const four = (fn) => [0, 1, 2, 3].map((p) => fn(p));
const OUT = [
  [
    'enemies/broken_herald',
    'broken_herald_v1.png',
    [...four((p) => heraldFrame(p)), heraldFrame(0, true)],
    48,
    HERALD,
    6,
  ],
  [
    'enemies/genesis_warden',
    'genesis_warden_v1.png',
    [...four((p) => wardenFrame(p)), wardenFrame(0, true)],
    64,
    WARDEN,
    4,
  ],
  ['enemies/echo_forgotten', 'echo_forgotten_v1.png', four(echoFrame), 48, ECHO, 6],
  ['enemies/remnant_deacon', 'remnant_deacon_v1.png', four(deaconFrame), 48, DEACON, 6],
  ['enemies/heel_shadow', 'heel_shadow_v1.png', four(shadowFrame), 32, SHADOW, 8],
  ['enemies/origin_nullifier', 'origin_nullifier_v1.png', four(nullifierFrame), 32, NULLIFIER, 8],
  ['enemies/archon_construct', 'archon_construct_v1.png', four(constructFrame), 32, CONSTRUCT, 8],
  ['enemies/twin_star', 'twin_star_v1.png', four(orbFrame), 16, ORB, 12],
  ['npcs/chronos_remnant', 'chronos_remnant_idle_v1.png', four(remnantFrame), 32, REMNANT, 8],
  ['npcs/solon', 'solon_idle_v1.png', four(solonFrame), 32, SOLON, 8],
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
