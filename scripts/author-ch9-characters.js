/**
 * CHRONO – Chapter 9 characters (Pipeline B, .agents/rules/chrono-art.md §4) for "The Fractured
 * Divinity" (design: docs/story/CHAPTER_09_DESIGN.md §13 with §20, owner decisions §21):
 *   map foes Nexus Sentinel, Entropy Specter, Chronal Juggernaut, Paradox Weaver and the elite Nexus
 *   Inquisitor (32x32 x4); Kuro's lieutenants Bran, Lyra, Neris (48x48 x4 + beaten) in their
 *   approved colours twisted by Possibility, and Peter's other self (the approved Chapter 5 sprite
 *   recoloured, curly hair kept); Kuro the Puppet Master (48x48 x4 + sealed); the Primeval Architect
 *   (64x64 x4 + spent), Chronos's combat form (64x64 x4), the Sixfold Divinity (64x64 x4 + phase 2 +
 *   spent) and the Void Singularity Core (64x64 x4).
 * Deterministic pixel rules only — no image model, no external reference.
 * Output: art-source/enemies/<name>/generated/candidates/ ONLY.
 *
 * Usage: node scripts/author-ch9-characters.js
 */
import path from 'path';
import fs from 'fs';
import { hex, encodePng, writeFile } from './pixel-art/pixel.js';
import { parsePNG } from './validate-candidate.js';

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
    ring: (cx, cy, r, ch, step = 1, skip = () => false) => {
      const n = Math.max(24, Math.round(r * 7));
      for (let k = 0; k < n; k += step)
        if (!skip(k, n)) {
          const a = (k / n) * Math.PI * 2;
          put(cx + Math.cos(a) * r, cy + Math.sin(a) * r, ch);
        }
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

const four = (fn) => [0, 1, 2, 3].map((p) => fn(p));
const VIO = { p: hex('#a07cf0'), P: hex('#6a4ab0'), i: [24, 12, 40, 235], c: hex('#00c8ff') };

// ------------------------------------------------------------------ Nexus Sentinel (32)
const SENT = {
  O: hex('#07040e'),
  k: hex('#3a2e52'),
  K: hex('#241a38'),
  m: hex('#8a8aa8'),
  c: hex('#00c8ff'),
  w: hex('#eef2ff'),
  r: hex('#ff4a4a'),
};
function sentinelFrame(phase) {
  const c = canvas(32);
  const bob = [0, -1, 0, 1][phase];
  c.rect(11, 12 + bob, 20, 25, 'K');
  c.rect(12, 13 + bob, 19, 24, 'k');
  c.rect(12, 26, 14, 30, 'K');
  c.rect(17, 26, 19, 30, 'K');
  c.ellipse(15.5, 8 + bob, 4, 4.5, 'm');
  c.rect(12, 8 + bob, 19, 9 + bob, 'K');
  c.put(14, 8 + bob, phase === 3 ? 'r' : 'c');
  c.put(17, 8 + bob, phase === 3 ? 'r' : 'c');
  // Two light blades: crossed when it winds up (frame 3).
  if (phase === 3) {
    c.line(6, 6, 25, 22, 'c');
    c.line(25, 6, 6, 22, 'c');
  } else {
    c.line(9, 14 + bob, 3, 26, 'c');
    c.line(22, 14 + bob, 28, 26, 'c');
  }
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Entropy Specter (32)
const SPEC = {
  O: [12, 6, 24, 220],
  v: [60, 40, 110, 200],
  V: [36, 22, 70, 210],
  w: hex('#eef2ff'),
  c: hex('#00c8ff'),
  h: [160, 130, 230, 120],
};
function specterFrame(phase) {
  const c = canvas(32);
  const bob = [0, -1, -2, -1][phase];
  for (let y = 6; y < 29; y++) {
    const half = Math.round(4 + (y - 6) * 0.3 + Math.sin((y + phase * 3) / 3));
    c.rect(16 - half, y + bob, 16 + half, y + bob, y % 4 ? 'v' : 'V');
  }
  c.ellipse(16, 8 + bob, 4, 4, 'v');
  c.put(14, 8 + bob, 'w');
  c.put(18, 8 + bob, 'w');
  // The chest beats on the 0.8 s pulse (bright on even frames).
  c.ellipse(16, 16 + bob, phase % 2 ? 1.5 : 2.5, phase % 2 ? 1.5 : 2.5, 'c');
  // Two faint decoy outlines at its sides.
  for (const dx of [-11, 11])
    for (let y = 10; y < 26; y += 2) c.put(16 + dx + (y % 4 ? 1 : 0), y + bob, 'h');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Chronal Juggernaut (32)
const JUG = {
  O: hex('#07040e'),
  g: hex('#e5c158'),
  G: hex('#9a7a2a'),
  k: hex('#3a2e52'),
  y: hex('#fff2b8'),
  r: hex('#ff4a4a'),
};
function juggernautFrame(phase) {
  const c = canvas(32);
  c.ellipse(16, 17, 12, 12, 'G');
  c.ellipse(16, 17, 9, 9, 'g');
  c.ellipse(16, 17, 4, 4, 'k');
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + (phase * Math.PI) / 16;
    c.rect(
      Math.round(16 + Math.cos(a) * 12) - 1,
      Math.round(17 + Math.sin(a) * 12) - 1,
      Math.round(16 + Math.cos(a) * 12) + 1,
      Math.round(17 + Math.sin(a) * 12) + 1,
      'G',
    );
  }
  // The 0.4 s stall: its core glows red (frame 3).
  c.ellipse(16, 17, 2, 2, phase === 3 ? 'r' : 'y');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Paradox Weaver (32)
const WEAV = {
  O: hex('#07040e'),
  w: hex('#eef2ff'),
  W: hex('#b8c4e8'),
  p: hex('#a07cf0'),
  P: hex('#6a4ab0'),
  c: hex('#00c8ff'),
};
function weaverFrame(phase) {
  const c = canvas(32);
  const open = phase >= 2;
  c.ellipse(16, 17, 4, 6, 'P');
  c.ellipse(16, 17, 2, 3, open ? 'c' : 'p');
  for (const [sx, sy] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    const reach = open ? 12 : 5;
    for (let k = 0; k < 6; k++) {
      const x = 16 + sx * (3 + (k * reach) / 6);
      const y = 17 + sy * (2 + (k * (open ? 8 : 6)) / 6);
      c.rect(
        Math.round(Math.min(x, 16 + sx * 3)),
        Math.round(y),
        Math.round(Math.max(x, 16 + sx * 3)),
        Math.round(y),
        k % 2 ? 'W' : 'w',
      );
    }
  }
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Nexus Inquisitor (32, elite)
const INQ = {
  O: hex('#07040e'),
  r: hex('#4a2a7a'),
  R: hex('#2e1656'),
  f: hex('#d8d0e8'),
  g: hex('#e5c158'),
  G: hex('#9a7a2a'),
  c: hex('#00c8ff'),
};
function inquisitorFrame(phase) {
  const c = canvas(32);
  const bob = [0, -1, 0, 1][phase];
  for (let y = 12; y < 30; y++) {
    const half = Math.round(4 + (y - 12) * 0.35);
    c.rect(14 - half, y, 14 + half, y, y % 3 === 0 ? 'R' : 'r');
  }
  c.ellipse(14, 8 + bob, 4, 5, 'R');
  c.rect(12, 8 + bob, 16, 9 + bob, 'f');
  // A hammer of judgement, raised higher each beat of its four-blow chain.
  const lift = [10, 6, 2, 12][phase];
  c.rect(23, lift, 24, 26, 'G');
  c.rect(20, lift - 2, 27, lift + 2, 'g');
  c.put(23, lift, 'c');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Lieutenants (48)
/** A 48 px body in a 32 px NPC's colours, with Possibility's violet cracks and glowing eyes. */
function lieutenant(c, { hair, skin, torso, torsoDark, legs, bob }) {
  for (let y = 22; y < 40; y++) {
    const half = Math.round(7 + (y - 22) * 0.18);
    c.rect(24 - half, y + bob, 24 + half, y + bob, y % 6 === 0 ? torsoDark : torso);
  }
  c.rect(18, 40, 21, 45, legs);
  c.rect(27, 40, 30, 45, legs);
  c.ellipse(24, 13 + bob, 6.5, 7, hair);
  c.ellipse(24, 15 + bob, 5, 5.5, skin);
  c.put(22, 15 + bob, 'p');
  c.put(26, 15 + bob, 'p');
  for (const [x, y] of [
    [19, 26],
    [20, 30],
    [29, 33],
    [28, 36],
  ])
    c.put(x, y + bob, 'P');
}
const BRAN = {
  O: hex('#07040e'),
  h: hex('#b0844e'),
  s: hex('#d8b090'),
  t: hex('#6a6e50'),
  T: hex('#4a4c36'),
  l: hex('#3a2e2a'),
  w: hex('#eef2ff'),
  W: hex('#b8c4e8'),
  m: hex('#8a8aa8'),
  ...VIO,
};
function branFrame(phase, beaten = false) {
  const c = canvas(48);
  const bob = beaten ? 4 : [0, -1, -1, 0][phase];
  lieutenant(c, { hair: 'h', skin: 's', torso: 't', torsoDark: 'T', legs: 'l', bob });
  c.rect(17, 10 + bob, 31, 11 + bob, 'w');
  c.rect(15, 23 + bob, 17, 32 + bob, 'W');
  c.rect(31, 23 + bob, 33, 32 + bob, 'W');
  // His spear, wrapped in a violet chain of vengeance.
  if (beaten) c.line(30, 44, 46, 38, 'm');
  else {
    c.line(37, 4, 37, 44, 'l');
    c.rect(36, 1, 38, 5, 'm');
    for (let y = 8; y < 42; y += 4) c.put(36 + ((y + phase) % 3), y, 'p');
  }
  c.outline();
  return c.g;
}
const LYRA = {
  O: hex('#07040e'),
  h: hex('#14141a'),
  s: hex('#d8a888'),
  t: hex('#6a4a2e'),
  T: hex('#4a3420'),
  l: hex('#2a2a36'),
  r: hex('#b8382e'),
  g: hex('#e5c158'),
  m: hex('#b8c4e8'),
  ...VIO,
};
function lyraFrame(phase, beaten = false) {
  const c = canvas(48);
  const bob = beaten ? 4 : [0, -1, -1, 0][phase];
  lieutenant(c, { hair: 'h', skin: 's', torso: 't', torsoDark: 'T', legs: 'l', bob });
  c.rect(17, 21 + bob, 31, 23 + bob, 'r');
  c.line(18, 25 + bob, 30, 37 + bob, 'g');
  // The halberd of a judge: scales hanging from it, both pans violet.
  if (beaten) c.line(30, 44, 46, 40, 'm');
  else {
    c.line(38, 2, 38, 44, 'T');
    c.rect(35, 2, 41, 6, 'm');
    c.line(33, 10, 43, 10, 'g');
    c.ellipse(33, 13 + (phase % 2), 2, 1, 'p');
    c.ellipse(43, 13 + ((phase + 1) % 2), 2, 1, 'p');
  }
  c.outline();
  return c.g;
}
const NERIS = {
  O: hex('#07040e'),
  h: hex('#7a5232'),
  s: hex('#d8b090'),
  t: hex('#8a8aa0'),
  T: hex('#5c5c70'),
  l: hex('#2a2a36'),
  b: hex('#7a5232'),
  w: hex('#eef2ff'),
  i: [24, 12, 40, 235],
  p: hex('#a07cf0'),
  P: hex('#6a4ab0'),
  c: hex('#00c8ff'),
};
function nerisFrame(phase, beaten = false) {
  const c = canvas(48);
  const bob = beaten ? 4 : [0, -1, -1, 0][phase];
  lieutenant(c, { hair: 'h', skin: 's', torso: 't', torsoDark: 'T', legs: 'l', bob });
  c.rect(17, 14 + bob, 18, 26 + bob, 'h');
  // An open book, its ink spiralling out in three rings.
  c.rect(8, 26 + bob, 16, 31 + bob, 'w');
  c.rect(12, 26 + bob, 12, 31 + bob, 'b');
  if (!beaten)
    for (let r = 4; r <= 12; r += 4)
      for (let k = 0; k < 18; k++) {
        if ((k + phase + r) % 3 === 0) continue;
        const a = (k / 18) * Math.PI * 2 + (r / 4) * phase * 0.5;
        c.put(12 + Math.cos(a) * r, 28 + bob + Math.sin(a) * r * 0.6, 'i');
      }
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Kuro, the Puppet Master (48)
/** Kuro's approved look (straight black hair, silver-grey cloak, violet eyes), a crown of branches,
 *  violet strings hanging from his fingers. The 5th frame: sealed inside the white page. */
const KURO_PM = {
  O: hex('#07040e'),
  h: hex('#14141a'),
  s: hex('#c8a488'),
  e: hex('#c8a0ff'),
  c: hex('#9098a6'),
  C: hex('#5c6270'),
  u: hex('#1a1c24'),
  p: hex('#a07cf0'),
  P: hex('#6a4ab0'),
  w: [244, 244, 255, 200],
  W: hex('#eef2ff'),
};
function kuroPMFrame(phase, sealed = false) {
  const c = canvas(48);
  const bob = [0, -1, -1, 0][phase];
  for (let y = 18; y < 44; y++) c.rect(15, y + bob, 33, y + bob, y % 7 === 0 ? 'C' : 'c');
  c.rect(20, 20 + bob, 28, 42 + bob, 'u');
  c.ellipse(24, 12 + bob, 6, 7, 'h');
  c.ellipse(24, 14 + bob, 5, 5, 's');
  c.rect(18, 7 + bob, 30, 10 + bob, 'h');
  c.put(22, 14 + bob, 'e');
  c.put(26, 14 + bob, 'e');
  // A crown of twisted branches.
  for (const x of [18, 22, 26, 30]) c.line(x, 6 + bob, x + (x < 24 ? -2 : 2), 1 + bob, 'p');
  if (sealed) {
    for (let y = 2; y < 47; y++)
      for (let x = 6; x < 42; x++) if ((x + y) % 2 === 0 && c.g[y][x] !== '.') c.put(x, y, 'w');
    c.rect(6, 2, 41, 2, 'W');
    c.rect(6, 46, 41, 46, 'W');
  }
  c.outline();
  // Puppet strings from both hands, thin (drawn after the outline).
  for (const [hx, side] of [
    [13, -1],
    [35, 1],
  ]) {
    c.ellipse(hx, 26 + bob, 2, 2, 's');
    for (let k = 0; k < 3; k++)
      for (let y = 28; y < 46; y += 2)
        c.put(hx + side * (k * 3 - 2) + ((y + phase) % 2), y + bob, 'p');
  }
  return c.g;
}

// ------------------------------------------------------------------ Primeval Architect (64)
const ARCH = {
  O: hex('#07040e'),
  k: hex('#5c4e7a'),
  K: hex('#3a2e52'),
  n: hex('#8a7aa8'),
  g: hex('#e5c158'),
  G: hex('#9a7a2a'),
  c: hex('#00c8ff'),
  y: hex('#fff2b8'),
};
function architectFrame(phase, spent = false) {
  const c = canvas(64);
  const bob = spent ? 6 : [0, -1, -1, 0][phase];
  c.rect(20, 22 + bob, 43, 50 + bob, 'K');
  c.rect(22, 24 + bob, 41, 48 + bob, 'k');
  c.rect(22, 51, 28, 61, 'K');
  c.rect(35, 51, 41, 61, 'K');
  c.rect(24, 8 + bob, 39, 21 + bob, 'k');
  c.rect(27, 13 + bob, 36, 15 + bob, spent ? 'K' : 'c');
  c.ellipse(31.5, 36 + bob, 4, 4, spent ? 'K' : 'c');
  // Four arms, each turning a flywheel (time, space, causality, the fourth idle).
  const arms = [
    [12, 22],
    [52, 22],
    [10, 44],
    [54, 44],
  ];
  arms.forEach(([x, y], k) => {
    c.line(k % 2 ? 43 : 20, 28 + bob + (k > 1 ? 14 : 0), x, y + bob, 'K');
    c.ellipse(x, y + bob, 6, 6, 'G');
    c.ellipse(x, y + bob, 4, 4, k === phase && !spent ? 'y' : 'g');
    const a = (phase / 4) * Math.PI * 2 + k;
    c.line(x, y + bob, x + Math.cos(a) * 5, y + bob + Math.sin(a) * 5, 'G');
  });
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Chronos, combat form (64)
const CHR = {
  O: hex('#0a0806'),
  h: hex('#eeeef4'),
  H: hex('#b8bac8'),
  s: hex('#e4c8aa'),
  S: hex('#b89878'),
  e: hex('#f0c860'),
  g: hex('#e8b850'),
  G: hex('#a07828'),
  w: hex('#f4f0e6'),
  W: hex('#c8c0b0'),
  c: hex('#c8a040'),
  z: [244, 240, 230, 150],
  Z: [200, 170, 90, 170],
  y: hex('#fff2b8'),
};
function chronosCombatFrame(phase) {
  const c = canvas(64);
  const bob = [0, -1, -1, 0][phase];
  c.ellipse(32, 20, 21, 21, 'Z');
  c.ellipse(32, 20, 18, 18, 'z');
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    c.put(32 + Math.sin(a) * 15, 20 - Math.cos(a) * 15, 'Z');
  }
  for (let y = 24; y < 56; y++) {
    const half = Math.round(7 + (y - 24) * 0.3);
    c.rect(32 - half, y + bob, 32 + half, y + bob, y % 7 === 0 ? 'G' : 'g');
  }
  c.rect(29, 25 + bob, 35, 55 + bob, 'w');
  for (let x = 22; x <= 42; x += 2) {
    const len = 2 + ((x * 7 + phase) % 5);
    for (let k = 0; k < len; k++) c.put(x, 56 + bob + k, k % 2 ? 'G' : 'c');
  }
  c.ellipse(32, 15 + bob, 6.5, 8, 'h');
  c.rect(25, 15 + bob, 27, 28 + bob, 'h');
  c.rect(37, 15 + bob, 39, 28 + bob, 'h');
  c.ellipse(32, 16 + bob, 4.8, 5.8, 's');
  c.put(30, 16 + bob, 'e');
  c.put(34, 16 + bob, 'e');
  // Right arm raised, a golden seal of judgement blazing in the hand.
  c.line(40, 28 + bob, 50, 14 + bob, 'g');
  c.ellipse(52, 11 + bob, 4 + (phase % 2), 4 + (phase % 2), 'e');
  c.ellipse(52, 11 + bob, 2, 2, 'y');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ The Sixfold Divinity (64)
/** Frames 0-3: six wings of light, one per seal, beating. 4: phase 2 (wings torn to four, Kuro
 *  has left its side). 5: spent at 12:00, wings folded, a page glowing at its heart. */
const SIX = {
  O: hex('#06060c'),
  v: [40, 30, 70, 240],
  V: [70, 56, 110, 235],
  w: hex('#f6f4ff'),
  1: hex('#4aa8d8'),
  2: hex('#f0c860'),
  3: hex('#9ae8e0'),
  4: hex('#d84a3a'),
  5: hex('#a07cf0'),
  6: hex('#f6f4ff'),
  c: hex('#00c8ff'),
};
function sixfoldDivinityFrame(phase, state = 0) {
  const c = canvas(64);
  const bob = state === 2 ? 4 : [0, -1, -2, -1][phase];
  const wings = state === 0 ? [1, 2, 3, 4, 5, 6] : state === 1 ? [1, 2, 3, 6] : [];
  wings.forEach((w, k) => {
    const side = k % 2 ? 1 : -1;
    const tier = Math.floor(k / 2);
    const lift = state === 0 ? [-2, 0, 2, 0][phase] : 0;
    for (let i = 0; i < 18; i++) {
      const x = 32 + side * (6 + i);
      const y = 18 + tier * 9 + bob + lift - Math.round(i * (0.6 - tier * 0.25));
      c.put(x, y, String(w));
      if (i % 3 === 0) c.put(x, y + 1, String(w));
    }
  });
  for (let y = 14; y < 58; y++) {
    const half = Math.round(4 + (y - 14) * 0.22);
    c.rect(32 - half, y + bob, 32 + half, y + bob, y % 6 === 0 ? 'V' : 'v');
  }
  c.ellipse(32, 12 + bob, 5, 6, 'V');
  c.put(30, 12 + bob, 'w');
  c.put(34, 12 + bob, 'w');
  if (state === 2) c.rect(29, 28 + bob, 35, 34 + bob, 'w');
  else c.ellipse(32, 30 + bob, 3, 3, 'c');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Void Singularity Core (64)
const CORE = {
  O: hex('#030206'),
  k: hex('#0a0614'),
  K: hex('#1a0933'),
  p: hex('#a07cf0'),
  P: hex('#6a4ab0'),
  c: hex('#00c8ff'),
  w: hex('#eef2ff'),
};
function coreFrame(phase) {
  const c = canvas(64);
  for (let t = 0; t < 6; t++) {
    const base = (t / 6) * Math.PI * 2 + phase * 0.25;
    for (let r = 14; r < 30; r++) {
      const a = base + Math.sin(r / 4 + phase) * 0.35;
      c.put(32 + Math.cos(a) * r, 32 + Math.sin(a) * r, r % 3 ? 'p' : 'c');
    }
  }
  c.ellipse(32, 32, 14, 14, 'K');
  c.ellipse(32, 32, 11, 11, 'k');
  c.ellipse(32, 32, 4 + (phase % 2), 4 + (phase % 2), 'P');
  c.put(28, 28, 'w');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Peter's other self, recoloured
/** The approved Chapter 5 Other Peter (curly hair kept, identity lock) recoloured for Kuro's
 *  lieutenant: white plate → ink-violet, blue eyes → violet glow. */
function otherPeterLieutenant() {
  const src = path.resolve('public/assets/enemies/other_peter.png');
  const { ihdr, pixels } = parsePNG(src);
  const out = Buffer.from(pixels);
  for (let i = 0; i < out.length; i += 4) {
    if (!out[i + 3]) continue;
    const [r, g, b] = [out[i], out[i + 1], out[i + 2]];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lum = (r + g + b) / 3;
    if (max - min < 40 && lum > 120) {
      // armour and the white blade
      const t = (lum - 120) / 135;
      out[i] = Math.round(50 + t * 90);
      out[i + 1] = Math.round(30 + t * 60);
      out[i + 2] = Math.round(90 + t * 120);
    } else if (b > r + 40 && b > g + 10) {
      // eyes and the purple seam
      out[i] = 200;
      out[i + 1] = 160;
      out[i + 2] = 255;
    }
  }
  return { w: ihdr.width, h: ihdr.height, buf: out };
}

// ------------------------------------------------------------------ output
const OUT = [
  ['enemies/nexus_sentinel', 'nexus_sentinel_v1.png', four(sentinelFrame), 32, SENT, 8],
  ['enemies/entropy_specter', 'entropy_specter_v1.png', four(specterFrame), 32, SPEC, 8],
  ['enemies/chronal_juggernaut', 'chronal_juggernaut_v1.png', four(juggernautFrame), 32, JUG, 8],
  ['enemies/paradox_weaver', 'paradox_weaver_v1.png', four(weaverFrame), 32, WEAV, 8],
  ['enemies/nexus_inquisitor', 'nexus_inquisitor_v1.png', four(inquisitorFrame), 32, INQ, 8],
  [
    'enemies/lieutenant_bran',
    'lieutenant_bran_v1.png',
    [...four((p) => branFrame(p)), branFrame(0, true)],
    48,
    BRAN,
    6,
  ],
  [
    'enemies/lieutenant_lyra',
    'lieutenant_lyra_v1.png',
    [...four((p) => lyraFrame(p)), lyraFrame(0, true)],
    48,
    LYRA,
    6,
  ],
  [
    'enemies/lieutenant_neris',
    'lieutenant_neris_v1.png',
    [...four((p) => nerisFrame(p)), nerisFrame(0, true)],
    48,
    NERIS,
    6,
  ],
  [
    'enemies/kuro_puppet_master',
    'kuro_puppet_master_v1.png',
    [...four((p) => kuroPMFrame(p)), kuroPMFrame(0, true)],
    48,
    KURO_PM,
    6,
  ],
  [
    'enemies/primeval_architect',
    'primeval_architect_v1.png',
    [...four((p) => architectFrame(p)), architectFrame(0, true)],
    64,
    ARCH,
    5,
  ],
  ['enemies/chronos_combat', 'chronos_combat_v1.png', four(chronosCombatFrame), 64, CHR, 5],
  [
    'enemies/sixfold_divinity',
    'sixfold_divinity_v1.png',
    [
      ...four((p) => sixfoldDivinityFrame(p, 0)),
      sixfoldDivinityFrame(0, 1),
      sixfoldDivinityFrame(0, 2),
    ],
    64,
    SIX,
    5,
  ],
  ['enemies/void_singularity_core', 'void_singularity_core_v1.png', four(coreFrame), 64, CORE, 5],
].map(([dir, name, frames, size, palette, k]) => ({
  file: `art-source/${dir}/generated/candidates/${name}`,
  img: render(frames, size, palette),
  k,
}));
OUT.push({
  file: 'art-source/enemies/lieutenant_other_peter/generated/candidates/lieutenant_other_peter_v1.png',
  img: otherPeterLieutenant(),
  k: 6,
});
for (const o of OUT) {
  const dir = path.dirname(o.file);
  fs.mkdirSync(path.join(dir, 'previews'), { recursive: true });
  writeFile(o.file, encodePng(o.img.w, o.img.h, o.img.buf));
  writeFile(
    path.join(dir, 'previews', path.basename(o.file, '.png') + `_x${o.k}.png`),
    preview(o.img, o.k),
  );
  console.log(`✓ ${o.file} (${o.img.w}x${o.img.h})`);
}
