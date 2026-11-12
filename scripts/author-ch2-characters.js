/**
 * CHRONO – Chapter 2 characters (Pipeline B, AGENTS.md §5), CHAPTER_02_DESIGN.md §4, §6, §11:
 *   - Lyra, rebel vanguard            (32×32, 4-frame idle: breath + scarf)
 *   - The Exiled Praetor               (32×32, 4-frame idle: stylus tapping)
 *   - The Imperial Automaton           (32×32, 4-frame walk, shield held in front)
 *   - The Causality Enforcer           (32×32, 4-frame stance, plume and rapier)
 *   - The Imperial Verdict (boss)      (64×64, 4-frame idle + 1 released/kneeling frame)
 * Deterministic pixel rules only — no image model, no external reference.
 * Output: art-source/{npcs,enemies}/<name>/generated/candidates/ ONLY (owner approval required).
 *
 * Usage: node scripts/author-ch2-characters.js
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

// ------------------------------------------------------------------ Lyra
const LYRA = {
  O: hex('#120e10'),
  h: hex('#1e1a22'), // black hair, chin length
  H: hex('#3a3444'),
  s: hex('#d8a07a'),
  S: hex('#b07a58'),
  e: hex('#20161a'),
  l: hex('#6a4a32'), // leather armour
  L: hex('#4a3222'),
  b: hex('#c8963a'), // brass straps
  r: hex('#b03a32'), // red scarf
  R: hex('#7a2222'),
  p: hex('#3a3440'), // trousers
  f: hex('#2a2018'), // boots
  m: hex('#a8b4c0'), // blade
};
function lyraFrame(phase) {
  const c = canvas(32);
  const br = phase === 1 || phase === 2 ? 1 : 0;
  // Head: chin-length black hair, straight fringe.
  c.ellipse(16, 9, 5, 5.5, 'h');
  c.ellipse(16, 10, 3.6, 4, 's');
  c.rect(12, 5, 20, 7, 'h');
  c.rect(11, 8, 12, 13, 'h');
  c.rect(20, 8, 21, 13, 'h');
  c.put(13, 6, 'H');
  c.put(17, 5, 'H');
  c.put(14, 10, 'e');
  c.put(18, 10, 'e');
  c.put(16, 12, 'S');
  // Scarf blowing to the side.
  c.rect(12, 14, 20, 15, 'r');
  const tail = [0, 1, 2, 1][phase];
  c.rect(20, 15, 22 + tail, 16, 'r');
  c.put(23 + tail, 17, 'R');
  // Leather armour with brass straps.
  c.rect(11, 16 + br, 21, 25, 'l');
  c.rect(11, 16 + br, 11, 25, 'L');
  c.line(12, 16 + br, 20, 24, 'b');
  c.rect(11, 22, 21, 22, 'b');
  c.rect(9, 17 + br, 10, 23, 'l');
  c.rect(22, 17 + br, 23, 23, 'l');
  c.put(9, 24, 's');
  c.put(23, 24, 's');
  // Short sword at the hip.
  c.rect(24, 21, 24, 28, 'm');
  c.rect(23, 21, 25, 21, 'b');
  // Legs, boots.
  c.rect(12, 26, 15, 28, 'p');
  c.rect(17, 26, 20, 28, 'p');
  c.rect(12, 29, 15, 30, 'f');
  c.rect(17, 29, 20, 30, 'f');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ the Exiled Praetor
const PRAETOR = {
  O: hex('#141214'),
  w: hex('#e4e0d8'), // white hair and beard
  W: hex('#b8b2a8'),
  s: hex('#c8987a'),
  S: hex('#a07458'),
  e: hex('#2a2020'),
  g: hex('#d8b048'), // golden blindfold pushed up
  t: hex('#d6cfc0'), // torn toga
  T: hex('#a89e8a'),
  v: hex('#6a3a6e'), // purple stripe
  k: hex('#3a3a40'), // stylus
};
function praetorFrame(phase) {
  const c = canvas(32);
  const tap = [0, 1, 0, -1][phase];
  // Head with wild white hair; the blindfold band pushed up on the forehead.
  c.ellipse(16, 9, 5.5, 5, 'w');
  c.ellipse(16, 10, 3.8, 4, 's');
  c.rect(12, 7, 20, 7, 'g');
  c.put(21, 8, 'g');
  c.put(22, 9, 'g');
  c.put(14, 10, 'e');
  c.put(18, 10, 'e');
  c.rect(14, 9, 15, 9, 'W');
  c.rect(17, 9, 18, 9, 'W');
  // Long beard.
  c.ellipse(16, 15, 3.5, 3.5, 'w');
  c.rect(15, 16, 17, 19, 'W');
  // Toga draped from one shoulder, torn hem.
  for (let y = 15; y < 30; y++) {
    const half = Math.round(5 + (y - 15) * 0.22);
    c.rect(16 - half, y, 16 + half, y, y % 5 === 0 ? 'T' : 't');
  }
  c.line(10, 16, 22, 28, 'v');
  c.line(11, 16, 23, 28, 'v');
  for (const x of [10, 13, 18, 21]) c.put(x, 30, 'T');
  c.ellipse(16, 15, 3.5, 3, 'w');
  // Hand with the chisel-stylus, tapping.
  c.rect(22, 18 + tap, 23, 19 + tap, 's');
  c.line(23, 17 + tap, 26, 12 + tap, 'k');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ the Imperial Automaton
const AUTOMATON = {
  O: hex('#100c08'),
  a: hex('#a87a3a'), // brass body
  A: hex('#7a5626'),
  h: hex('#d8a858'),
  j: hex('#4a3a2a'), // joints
  e: hex('#ff5a3a'), // eye slit
  s: hex('#8a2a24'), // red scutum shield
  S: hex('#5e1c18'),
  g: hex('#e0b850'), // gold boss and rim
};
function automatonFrame(phase) {
  const c = canvas(32);
  const step = [0, 1, 0, -1][phase];
  const bob = phase % 2;
  // Legs, alternating.
  c.rect(12, 23, 14, 29 + Math.min(0, step), 'j');
  c.rect(18, 23, 20, 29 - Math.max(0, step), 'j');
  c.rect(11, 29 + Math.min(0, step), 15, 30 + Math.min(0, step), 'A');
  c.rect(17, 29 - Math.max(0, step), 21, 30 - Math.max(0, step), 'A');
  // Barrel torso and helmeted head with one eye slit.
  c.rect(10, 12 + bob, 22, 23, 'a');
  c.rect(10, 12 + bob, 10, 23, 'A');
  c.rect(11, 16, 21, 16, 'h');
  c.rect(12, 4 + bob, 20, 11 + bob, 'a');
  c.rect(12, 4 + bob, 20, 5 + bob, 'h');
  c.rect(13, 8 + bob, 19, 8 + bob, 'e');
  c.put(16, 3 + bob, 'g');
  c.put(16, 2 + bob, 'g');
  // Tall rectangular shield carried in front (left), gold rim and boss.
  c.rect(4, 11 + bob, 11, 27 + bob, 's');
  c.rect(4, 11 + bob, 11, 11 + bob, 'g');
  c.rect(4, 27 + bob, 11, 27 + bob, 'g');
  c.rect(4, 11 + bob, 4, 27 + bob, 'S');
  c.ellipse(7.5, 19 + bob, 1.6, 1.6, 'g');
  // Arm on the right.
  c.rect(23, 13 + bob, 25, 21, 'j');
  c.rect(23, 22, 25, 23, 'a');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ the Causality Enforcer
const ENFORCER = {
  O: hex('#0e0a12'),
  v: hex('#4a2e6a'), // dark violet light armour
  V: hex('#2e1c44'),
  i: hex('#7a5aa0'),
  m: hex('#8c8a96'), // helmet steel
  M: hex('#5a5862'),
  p: hex('#c8302a'), // crest plume
  P: hex('#8a1e1a'),
  e: hex('#ffd0a0'), // eyes behind the visor
  c: hex('#3a1c2a'), // cape
  r: hex('#d8dce4'), // rapier
  g: hex('#c8a040'),
};
function enforcerFrame(phase) {
  const c = canvas(32);
  const lunge = [0, 0, 1, 0][phase];
  const sway = phase % 2;
  // Cape behind.
  for (let y = 12; y < 28; y++) c.rect(9 - (y > 20 ? 1 : 0), y, 13, y, 'c');
  // Legs in a fencing stance.
  c.rect(12, 23, 14, 30, 'V');
  c.rect(18 + lunge, 23, 20 + lunge, 30, 'V');
  c.rect(11, 30, 14, 30, 'M');
  c.rect(18 + lunge, 30, 21 + lunge, 30, 'M');
  // Lean torso.
  c.rect(12, 13, 20, 23, 'v');
  c.rect(12, 13, 12, 23, 'V');
  c.rect(13, 18, 19, 18, 'i');
  // Plumed helmet with a T visor.
  c.ellipse(16, 8, 4.5, 4.5, 'm');
  c.rect(12, 9, 20, 10, 'M');
  c.rect(15, 7, 17, 11, 'M');
  c.put(14, 9, 'e');
  c.put(18, 9, 'e');
  for (let k = 0; k < 9; k++)
    c.put(12 + k, 3 - Math.round(Math.sin((k / 8) * Math.PI) * 2) + sway, k % 3 ? 'p' : 'P');
  c.rect(12, 4 + sway, 20, 4 + sway, 'p');
  // Sword arm extended, rapier pointing forward.
  c.rect(20, 15, 23 + lunge, 16, 'v');
  c.rect(23 + lunge, 14, 24 + lunge, 17, 'g');
  c.line(25 + lunge, 15, 30, 15 - (phase === 2 ? 0 : 1), 'r');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ The Imperial Verdict (64)
const VERDICT = {
  O: hex('#0a080a'),
  b: hex('#3a3430'), // blackened bronze
  B: hex('#24201e'),
  h: hex('#6a5e52'),
  g: hex('#e0b440'), // golden blindfold, scales
  G: hex('#a07a24'),
  f: hex('#ff8a3a'), // flaming blade
  F: hex('#ffd060'),
  s: hex('#c8ccd8'), // blade steel
  c: hex('#ffb060'), // causality glow (amber)
  k: hex('#5a4a3a'),
};
function verdict(phase, kneel = false) {
  const c = canvas(64);
  const bob = kneel ? 8 : phase === 1 || phase === 2 ? 1 : 0;
  const Y = (y) => y + bob;
  // Pedestal-like legs (or kneeling).
  if (kneel) {
    c.rect(20, 50, 30, 59, 'b');
    c.rect(34, 53, 46, 59, 'b');
  } else {
    c.rect(22, Y(44), 29, 59, 'b');
    c.rect(35, Y(44), 42, 59, 'b');
  }
  c.rect(16, 59, 48, 62, 'k');
  // Robed torso of a statue, folds.
  for (let y = Y(18); y <= Y(46); y++) {
    const half = Math.round(10 + (y - Y(18)) * 0.12);
    c.rect(32 - half, y, 32 + half, y, (y - bob) % 7 === 0 ? 'B' : 'b');
  }
  c.line(26, Y(20), 22, Y(44), 'h');
  c.line(38, Y(20), 42, Y(44), 'h');
  // Head with the golden blindfold.
  c.ellipse(32, Y(10), 7, 8, 'b');
  c.ellipse(30, Y(6), 2.5, 2, 'h');
  c.rect(25, Y(9), 39, Y(11), 'g');
  c.rect(39, Y(10), 42, Y(13), 'G');
  // Left arm raised with the tilted Scales.
  c.rect(12, Y(20), 17, Y(34), 'b');
  c.line(10, Y(12), 10, Y(22), 'g');
  const tilt = kneel ? 3 : [2, 1, 2, 3][phase];
  c.line(3, Y(12) - tilt, 17, Y(12) + tilt, 'g');
  c.line(4, Y(13) - tilt, 4, Y(18) - tilt, 'G');
  c.line(16, Y(13) + tilt, 16, Y(18) + tilt, 'G');
  c.rect(1, Y(18) - tilt, 7, Y(19) - tilt, 'g');
  c.rect(13, Y(18) + tilt, 19, Y(19) + tilt, 'g');
  if (kneel) {
    // Broken scales: one pan fallen.
    c.rect(1, Y(18) - tilt, 7, Y(19) - tilt, '.');
    c.rect(2, 60, 8, 61, 'g');
  }
  // Right arm with the flaming Sword of Judgement.
  c.rect(47, Y(20), 52, Y(34), 'b');
  if (kneel) {
    c.line(50, 40, 58, 61, 's');
    c.line(51, 40, 59, 61, 's');
  } else {
    c.rect(49, Y(2), 50, Y(33), 's');
    c.rect(46, Y(32), 53, Y(33), 'g');
    for (let y = 2; y < 32; y += 2) {
      const flick = (y + phase) % 4 === 0 ? 1 : 0;
      c.put(48 - flick, Y(y), y % 4 ? 'f' : 'F');
      c.put(51 + flick, Y(y + 1), y % 4 ? 'F' : 'f');
    }
  }
  // The causality core glowing in the chest.
  c.ellipse(32, Y(28), 3, 3, kneel ? 'G' : phase % 2 ? 'c' : 'g');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ output
const OUT = [
  {
    file: 'art-source/npcs/lyra/generated/candidates/lyra_idle_v1.png',
    frames: [0, 1, 2, 3].map(lyraFrame),
    size: 32,
    palette: LYRA,
    k: 8,
  },
  {
    file: 'art-source/npcs/exiled_praetor/generated/candidates/exiled_praetor_idle_v1.png',
    frames: [0, 1, 2, 3].map(praetorFrame),
    size: 32,
    palette: PRAETOR,
    k: 8,
  },
  {
    file: 'art-source/enemies/imperial_automaton/generated/candidates/imperial_automaton_walk_v1.png',
    frames: [0, 1, 2, 3].map(automatonFrame),
    size: 32,
    palette: AUTOMATON,
    k: 8,
  },
  {
    file: 'art-source/enemies/causality_enforcer/generated/candidates/causality_enforcer_v1.png',
    frames: [0, 1, 2, 3].map(enforcerFrame),
    size: 32,
    palette: ENFORCER,
    k: 8,
  },
  {
    file: 'art-source/enemies/imperial_verdict/generated/candidates/imperial_verdict_v1.png',
    frames: [verdict(0), verdict(1), verdict(2), verdict(3), verdict(0, true)],
    size: 64,
    palette: VERDICT,
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
