/**
 * CHRONO – Chapter 7 characters, first set (Pipeline B, AGENTS.md §5) for "The Cradle of the
 * Forgotten" (outline: CHAPTER_06_DESIGN.md §14.2; art contract for T-69 / T-70):
 *   Kuro void-touched (32x32 x5, keeps Kuro's approved look: straight black hair, silver-grey cloak),
 *   Kuro's mother (an echo), a nameless shade, The First Forgotten (frail, 48x48 x4),
 *   Name Eater, Hollow Husk, Erasure Moths, Ink Hound (32x32 x4); bosses after the design: The Nameless
 *   Weeper, Kuro's boss form (48x48 x5), The Primordial Shade (48x48 x4), The Void Inquisitor (32x32 x4).
 * Deterministic pixel rules only — no image model, no external reference.
 * Output: art-source/{npcs,enemies}/<name>/generated/candidates/ ONLY.
 *
 * Usage: node scripts/author-ch7-characters.js
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

function body(c, { hair, skin, shade, eye, blink, torso, torsoDark, legs, bob = 0, wide = 5 }) {
  c.ellipse(16, 9 + bob, 4.6, 5, hair);
  c.ellipse(16, 10 + bob, 3.6, 4, skin);
  c.put(14, 10 + bob, blink ? shade : eye);
  c.put(18, 10 + bob, blink ? shade : eye);
  c.put(16, 12 + bob, shade);
  for (let y = 15; y < 27; y++) {
    const half = Math.round(wide + (y - 15) * 0.12);
    c.rect(16 - half, y + bob, 16 + half, y + bob, y % 5 === 0 ? torsoDark : torso);
  }
  c.rect(12, 27, 14, 30, legs);
  c.rect(18, 27, 20, 30, legs);
}

// ------------------------------------------------------------------ Kuro, void-touched
/** Kuro's approved look (straight black hair, silver-grey cloak) eaten by the void: ink cracks,
 *  the left eye gone dark, the hem dissolving into black instead of Interval violet. */
const KURO_VOID = {
  O: hex('#04040a'),
  h: hex('#14141a'),
  H: hex('#2a2a36'),
  s: hex('#c8a488'),
  S: hex('#98765e'),
  e: hex('#9a7aff'),
  x: hex('#05060c'), // the dark eye
  c: hex('#7e8490'), // greyer cloak
  C: hex('#565c68'),
  d: hex('#3a3e48'),
  u: hex('#1a1c24'),
  f: hex('#14141a'),
  i: [18, 10, 32, 240], // void ink
  k: [190, 150, 255, 220], // violet cracks
};
function kuroVoidFrame(phase) {
  const c = canvas(32);
  const flare = phase === 4;
  for (let y = 13; y < 29; y++) c.rect(9, y, 23, y, y % 6 === 0 ? 'C' : 'c');
  body(c, {
    hair: 'h',
    skin: 's',
    shade: 'S',
    eye: 'e',
    blink: phase === 2,
    torso: 'u',
    torsoDark: 'd',
    legs: 'f',
    wide: 4,
  });
  c.rect(11, 5, 21, 7, 'h');
  c.rect(12, 8, 15, 8, 'h');
  c.put(19, 5, 'H');
  c.put(20, 6, 'H');
  c.put(14, 10, 'x');
  c.rect(12, 14, 13, 18, 'C');
  c.rect(19, 14, 20, 18, 'C');
  // Ink cracks climbing the cloak and one cheek.
  for (const [x, y] of [
    [10, 26],
    [11, 24],
    [11, 22],
    [12, 21],
    [22, 25],
    [21, 23],
    [13, 11],
    [12, 12],
  ])
    c.put(x, y, (x + y + phase) % 3 === 0 ? 'k' : 'i');
  // The hem dissolves into black.
  for (let x = 9; x <= 23; x++) {
    const k = (x * 5 + phase * 3) % 7;
    if (k < 4) c.put(x, 29, 'i');
    if (k < 2) c.put(x, 30, 'i');
  }
  if (flare) {
    for (let y = 2; y < 30; y += 2) {
      c.put(6, y, 'i');
      c.put(26, y + 1, 'i');
    }
    c.put(18, 10, 'k');
  }
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Kuro's mother (an echo)
const MOTHER = {
  O: [30, 36, 56, 210],
  h: [40, 40, 52, 220], // dark hair in a low bun
  s: [226, 206, 190, 210],
  S: [190, 168, 150, 210],
  e: [60, 60, 80, 220],
  a: [168, 196, 220, 200], // faded áo bà ba, pale blue
  A: [128, 156, 186, 200],
  f: [90, 100, 120, 200],
  g: [232, 192, 96, 230], // a small gold hairpin
};
function motherFrame(phase) {
  const c = canvas(32);
  const sway = [0, 0, 1, 0][phase];
  body(c, {
    hair: 'h',
    skin: 's',
    shade: 'S',
    eye: 'e',
    blink: phase === 3,
    torso: 'a',
    torsoDark: 'A',
    legs: 'f',
    bob: sway,
    wide: 4,
  });
  c.ellipse(20, 12 + sway, 2.5, 2, 'h');
  c.put(21, 11 + sway, 'g');
  // Hands folded as if humming a song.
  c.rect(14, 20 + sway, 18, 21 + sway, 'S');
  // Fading at the feet.
  for (let x = 11; x <= 21; x++) if ((x + phase) % 3 === 0) c.put(x, 30, '.');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Nameless shade
const SHADE = {
  O: [32, 22, 54, 180],
  p: [222, 208, 246, 170],
  P: [178, 158, 222, 160],
  n: [122, 100, 172, 160],
};
function shadeFrame(phase) {
  const c = canvas(32);
  const bob = [0, -1, -1, 0][phase];
  c.ellipse(16, 9 + bob, 4.5, 5, 'p');
  for (let y = 15; y < 30; y++) {
    const half = Math.round(4 + (y - 15) * 0.3);
    c.rect(16 - half, y + bob, 16 + half, y + bob, y % 4 === 0 ? 'P' : 'p');
  }
  // No face: a blank where the name was.
  c.rect(14, 9 + bob, 18, 10 + bob, 'n');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ The First Forgotten (frail, 48)
const FIRST = {
  O: [8, 6, 14, 255],
  v: [28, 20, 44, 240],
  V: [52, 40, 80, 230],
  w: [232, 226, 210, 230], // a dim halo of the first light
  g: hex('#e8c060'),
  G: hex('#9a7a2a'),
  e: hex('#f4ecff'),
};
function firstFrame(phase) {
  const c = canvas(48);
  const breath = [0, 1, 1, 0][phase];
  // A dim halo of the first light, broken on one side, behind the bowed head.
  for (let k = 0; k < 28; k++) {
    if (k > 19 && k < 24) continue;
    const ang = (k / 28) * Math.PI * 2;
    c.put(24 + Math.cos(ang) * 10, 13 + breath + Math.sin(ang) * 10, 'w');
  }
  // Kneeling: a once-enormous figure folded small, robe pooling on the ground.
  c.ellipse(24, 38, 15, 7, 'v');
  for (let y = 20; y <= 38; y++) {
    const half = Math.round(5 + (y - 20) * 0.45);
    c.rect(
      24 - half,
      y + (y > 34 ? 0 : breath),
      24 + half,
      y + (y > 34 ? 0 : breath),
      y % 5 ? 'v' : 'V',
    );
  }
  c.ellipse(24, 15 + breath, 5, 6, 'V');
  c.ellipse(24, 16 + breath, 4, 4, 'v');
  c.put(22, 16 + breath, 'e');
  c.put(26, 16 + breath, 'e');
  // Arms hanging, wrists bound by golden glyph chains — two links already broken.
  c.rect(15, 24 + breath, 17, 34, 'V');
  c.rect(31, 24 + breath, 33, 34, 'V');
  for (let x = 4; x <= 44; x += 2) {
    if ((x > 18 && x < 22) || (x > 34 && x < 38)) continue;
    c.put(x, 32 + ((x / 2 + phase) % 2), 'g');
  }
  for (let y = 26; y <= 44; y += 2) {
    c.put(6, y, 'G');
    c.put(42, y + 1, 'G');
  }
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Name Eater
const EATER = {
  O: hex('#06060a'),
  m: hex('#2a2238'),
  M: hex('#4a3a62'),
  t: hex('#e8e0f0'), // teeth
  c: hex('#b48cff'), // swallowed glyph letters
};
function eaterFrame(phase) {
  const c = canvas(32);
  const open = [3, 5, 7, 5][phase];
  c.ellipse(16, 18, 11, 10, 'M');
  c.ellipse(16, 18, 9, 8, 'm');
  c.rect(8, 18 - Math.floor(open / 2), 24, 18 + Math.ceil(open / 2), 'O');
  for (let x = 9; x <= 23; x += 3) {
    c.put(x, 18 - Math.floor(open / 2), 't');
    c.put(x + 1, 18 + Math.ceil(open / 2), 't');
  }
  // Letters being sucked in.
  for (const [x, y] of [
    [3, 12],
    [27, 10],
    [4, 24],
    [28, 22],
  ])
    if ((x + phase) % 2 === 0) c.put(x + (phase % 2 ? 1 : 0), y, 'c');
  c.rect(10, 28, 12, 30, 'M');
  c.rect(20, 28, 22, 30, 'M');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Hollow Husk
const HUSK = {
  O: hex('#0a0a10'),
  a: hex('#8e86a8'),
  A: hex('#5e5678'),
  v: hex('#0a0614'), // the hole where a name was
  c: hex('#b48cff'),
};
function huskFrame(phase) {
  const c = canvas(32);
  const step = [0, 1, 0, -1][phase];
  body(c, {
    hair: 'A',
    skin: 'a',
    shade: 'A',
    eye: 'v',
    blink: false,
    torso: 'a',
    torsoDark: 'A',
    legs: 'A',
  });
  c.ellipse(16, 20, 3, 3, 'v');
  if (phase % 2) c.put(16, 20, 'c');
  c.rect(12, 27, 14, 30 + step, 'A');
  c.rect(18, 27, 20, 30 - step, 'A');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Erasure Moths (a swarm)
const MOTH = {
  O: [20, 24, 36, 220],
  w: hex('#f2f4f8'),
  W: hex('#b8c0cc'),
  c: hex('#b48cff'),
};
function mothFrame(phase) {
  const c = canvas(32);
  const spots = [
    [8, 9],
    [20, 6],
    [14, 16],
    [24, 18],
    [9, 23],
    [18, 25],
  ];
  spots.forEach(([x, y], k) => {
    const up = (k + phase) % 2;
    const dx = ((k * 3 + phase) % 3) - 1;
    c.put(x + dx - 1, y - up, 'w');
    c.put(x + dx + 1, y - up, 'w');
    c.put(x + dx, y, 'W');
    if (k === phase) c.put(x + dx, y + 1, 'c');
  });
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Ink Hound
const HOUND = {
  O: hex('#04040a'),
  i: hex('#1a1028'),
  I: hex('#2e2048'),
  e: hex('#b48cff'),
  d: [20, 12, 34, 200], // dripping ink
};
function houndFrame(phase) {
  const c = canvas(32);
  const run = [0, 1, 0, -1][phase];
  c.ellipse(15, 18, 9, 5, 'i');
  c.ellipse(24, 14, 4, 4, 'i');
  c.rect(26, 12, 29, 15, 'I');
  c.put(25, 13, 'e');
  c.rect(9 + run, 22, 10 + run, 27, 'I');
  c.rect(19 - run, 22, 20 - run, 27, 'I');
  c.rect(4, 15, 7, 16, 'I');
  for (let x = 5; x <= 20; x += 5) c.put(x + phase, 28, 'd');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ The Nameless Weeper (48)
const WEEPER = {
  O: hex('#06040c'),
  k: hex('#4a405e'), // weeping stone
  K: hex('#2e2640'),
  n: hex('#6a5e86'),
  e: hex('#14101e'), // hollow eyes
  t: hex('#b48cff'), // violet tears
  T: hex('#e6dcff'),
};
function weeperFrame(phase, spent = false) {
  const c = canvas(48);
  const drop = phase * 3;
  c.ellipse(24, 30, 18, 15, 'K');
  c.ellipse(24, 28, 16, 13, 'k');
  // Three faces pressed into the stone.
  for (const [x, y, r] of [
    [24, 22, 6],
    [14, 31, 5],
    [34, 31, 5],
  ]) {
    c.ellipse(x, y, r, r + 1, 'n');
    c.put(x - 2, y - 1, 'e');
    c.put(x + 2, y - 1, 'e');
    c.rect(x - 2, y + 3, x + 2, y + 3, 'e');
    if (!spent) {
      c.line(x - 2, y, x - 2, y + 4 + (drop % 6), 't');
      c.put(x - 2, y + 5 + (drop % 6), 'T');
    }
  }
  if (spent) c.ellipse(24, 44, 14, 2, 't');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Kuro, boss form (48)
const KURO_BOSS = {
  O: hex('#04030a'),
  h: hex('#14141a'),
  H: hex('#2a2a36'),
  s: hex('#c8a488'),
  S: hex('#98765e'),
  e: hex('#9a7aff'),
  x: hex('#05030c'),
  c: hex('#7e8490'),
  C: hex('#565c68'),
  u: hex('#1a1c24'),
  i: [20, 10, 34, 240], // void ink
  k: [190, 150, 255, 230], // violet cracks
  b: hex('#c8b0ff'), // the Possibility blade
  B: hex('#7a5cd6'),
};
function kuroBossFrame(phase, knelt = false) {
  const c = canvas(48);
  const bob = knelt ? 6 : [0, -1, -1, 0][phase];
  const hem = knelt ? 40 : 44;
  // Ink wings unfolding behind him (gone when he kneels).
  if (!knelt)
    for (let k = 0; k < 6; k++) {
      c.line(24, 20 + bob, 4 + k * 2, 6 + k * 3 + (phase % 2), 'i');
      c.line(24, 20 + bob, 44 - k * 2, 6 + k * 3 + ((phase + 1) % 2), 'i');
    }
  // Cloak and body, scaled from his 32 px sprite.
  for (let y = 19; y < hem; y++) c.rect(15, y + bob, 33, y + bob, y % 7 === 0 ? 'C' : 'c');
  c.rect(19, 21 + bob, 29, hem - 4 + bob, 'u');
  c.ellipse(24, 13 + bob, 6, 7, 'h');
  c.ellipse(24, 15 + bob, 5, 5, 's');
  c.rect(18, 8 + bob, 30, 11 + bob, 'h');
  c.rect(19, 12 + bob, 22, 12 + bob, 'h');
  c.put(22, 15 + bob, 'x');
  c.put(26, 15 + bob, 'e');
  for (const [x, y] of [
    [16, 38],
    [17, 35],
    [18, 32],
    [31, 37],
    [30, 34],
    [21, 16],
  ])
    c.put(x, y + bob, (x + y + phase) % 3 === 0 ? 'k' : 'i');
  // His own blade of Possibility, lowered when he kneels.
  if (knelt) c.line(34, 44, 44, 40, 'b');
  else {
    c.line(34, 30 + bob, 42, 8 + bob, 'b');
    c.line(35, 30 + bob, 43, 8 + bob, 'B');
  }
  for (let x = 15; x <= 33; x++) if ((x * 3 + phase) % 5 < 2) c.put(x, 45, 'i');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ The Primordial Shade (48)
const PRIMORDIAL = {
  O: [6, 4, 12, 255],
  v: [26, 16, 44, 240],
  V: [52, 34, 84, 230],
  e: hex('#f6f0ff'),
  t: hex('#b48cff'), // the true ring
  g: hex('#e8c060'), // the false ring
};
function primordialFrame(phase) {
  const c = canvas(48);
  for (let y = 8; y < 46; y++) {
    const half = Math.round(4 + (y - 8) * 0.32 + Math.sin((y + phase * 2) / 5));
    c.rect(24 - half, y, 24 + half, y, y % 6 === 0 ? 'V' : 'v');
  }
  c.ellipse(24, 10, 5, 6, 'v');
  c.put(22, 10, 'e');
  c.put(26, 10, 'e');
  // Two rings circling it, a violet one and a gold one, out of step.
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2;
    if ((k + phase) % 3 !== 0) c.put(24 + Math.cos(a) * 17, 28 + Math.sin(a) * 6, 't');
    if ((k + phase + 1) % 3 !== 0) c.put(24 + Math.cos(a) * 13, 22 + Math.sin(a + 1) * 9, 'g');
  }
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ The Void Inquisitor (32)
const INQUISITOR = {
  O: hex('#06040a'),
  r: hex('#3a2e52'), // chain-mail robe
  R: hex('#261c3a'),
  f: hex('#d8d0e8'),
  g: hex('#e8c060'), // judgement chains
  G: hex('#9a7a2a'),
  t: hex('#b48cff'),
};
function inquisitorFrame(phase) {
  const c = canvas(32);
  const bob = [0, -1, 0, 1][phase];
  for (let y = 12; y < 30; y++) {
    const half = Math.round(4 + (y - 12) * 0.35);
    c.rect(15 - half, y, 15 + half, y, y % 3 === 0 ? 'R' : 'r');
  }
  c.ellipse(15, 8 + bob, 4, 5, 'R');
  c.rect(13, 8 + bob, 17, 9 + bob, 'f');
  // A staff crowned with a glyph, chains swinging from it.
  c.rect(24, 4 + bob, 25, 29, 'G');
  c.ellipse(24.5, 4 + bob, 2.5, 2.5, 't');
  for (let k = 0; k < 4; k++) c.put(26 + ((k + phase) % 2), 8 + k * 3, 'g');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ output
const four = (fn) => [0, 1, 2, 3].map((p) => fn(p));
const OUT = [
  ['npcs/kuro_void', 'kuro_void_idle_v1.png', [0, 1, 2, 3, 4].map(kuroVoidFrame), 32, KURO_VOID, 8],
  ['npcs/kuro_mother', 'kuro_mother_idle_v1.png', four(motherFrame), 32, MOTHER, 8],
  ['npcs/nameless_shade', 'nameless_shade_idle_v1.png', four(shadeFrame), 32, SHADE, 8],
  ['npcs/first_forgotten', 'first_forgotten_idle_v1.png', four(firstFrame), 48, FIRST, 6],
  ['enemies/name_eater', 'name_eater_v1.png', four(eaterFrame), 32, EATER, 8],
  ['enemies/hollow_husk', 'hollow_husk_v1.png', four(huskFrame), 32, HUSK, 8],
  ['enemies/erasure_moths', 'erasure_moths_v1.png', four(mothFrame), 32, MOTH, 8],
  ['enemies/ink_hound', 'ink_hound_v1.png', four(houndFrame), 32, HOUND, 8],
  [
    'enemies/nameless_weeper',
    'nameless_weeper_v1.png',
    [...four((p) => weeperFrame(p)), weeperFrame(0, true)],
    48,
    WEEPER,
    6,
  ],
  [
    'enemies/kuro_boss',
    'kuro_boss_v1.png',
    [...four((p) => kuroBossFrame(p)), kuroBossFrame(0, true)],
    48,
    KURO_BOSS,
    6,
  ],
  ['enemies/primordial_shade', 'primordial_shade_v1.png', four(primordialFrame), 48, PRIMORDIAL, 6],
  ['enemies/void_inquisitor', 'void_inquisitor_v1.png', four(inquisitorFrame), 32, INQUISITOR, 8],
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
