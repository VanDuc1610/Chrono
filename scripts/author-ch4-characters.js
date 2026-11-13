/**
 * CHRONO – Chapter 4 characters (Pipeline B, AGENTS.md §5), CHAPTER_04_DESIGN.md §4, §8, §10.2, §13:
 *   General Aldric, General Kaelen, Private Bran, Chronicler Elion, Private Renard, Kuro (32x32 x4 idle;
 *   Kuro has a 5th "Interval flicker" frame); Ghost Sniper, Endless Phalanx, Banner Carrier (32x32 x4);
 *   The Crimson Standard (48x48, 4 idle + blood wall); The Last War (64x64, 4 idle + kneeling).
 * Deterministic pixel rules only — no image model, no external reference.
 * Output: art-source/{npcs,enemies}/<name>/generated/candidates/ ONLY (owner approval required).
 *
 * Usage: node scripts/author-ch4-characters.js
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

/** A standing human: head, torso and legs; returns the canvas so each character dresses it. */
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

// ------------------------------------------------------------------ General Aldric (Veridia)
const ALDRIC = {
  O: hex('#0e1014'),
  w: hex('#e4e2dc'), // white hair and beard
  W: hex('#b0aea8'),
  s: hex('#c89a7c'),
  S: hex('#9c7258'),
  e: hex('#2a2a30'),
  a: hex('#7a8494'), // cracked plate
  A: hex('#545c6a'),
  k: hex('#2c3240'), // crack lines
  b: hex('#3a5a8a'), // torn blue cloak
  B: hex('#28406a'),
  l: hex('#6a4a2e'), // leather straps
  x: hex('#c8ccd4'), // sword planted in the ground
  X: hex('#8a8e98'),
  g: hex('#c8a040'), // pommel
  f: hex('#2a2c34'),
};
function aldricFrame(phase) {
  const c = canvas(32);
  const sway = [0, 1, 1, 0][phase];
  // Cloak behind, its torn hem stirring.
  for (let y = 13; y < 29; y++) c.rect(9 - (y > 22 ? 1 : 0), y, 23 + (y > 22 ? sway : 0), y, 'B');
  for (const x of [9, 13, 18, 22]) c.put(x + ((x + phase) % 2), 29, 'B');
  body(c, {
    hair: 'w',
    skin: 's',
    shade: 'S',
    eye: 'e',
    blink: phase === 2,
    torso: 'a',
    torsoDark: 'A',
    legs: 'f',
  });
  // Long beard.
  c.rect(14, 12, 18, 15, 'w');
  c.rect(15, 16, 17, 17, 'W');
  // Cracks and straps on the plate.
  c.line(13, 18, 15, 22, 'k');
  c.line(18, 20, 20, 24, 'k');
  c.line(12, 16, 20, 24, 'l');
  // Cloak over the shoulders.
  c.rect(10, 14, 12, 18, 'b');
  c.rect(20, 14, 22, 18, 'b');
  // Sword point-down in front, both trembling hands on the pommel.
  const tr = phase === 1 ? 1 : 0;
  c.rect(16, 18, 16, 30, 'x');
  c.rect(17, 19, 17, 30, 'X');
  c.rect(13, 17, 20, 17, 'X');
  c.put(16 + tr, 15, 'g');
  c.rect(15 + tr, 16, 17 + tr, 16, 's');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ General Kaelen (Sol-Karis)
const KAELEN = {
  O: hex('#0a0a0c'),
  h: hex('#2a2420'), // cropped dark hair
  s: hex('#b88468'),
  S: hex('#8a5e48'),
  e: hex('#1a1a20'),
  z: hex('#e0a090'), // scar
  a: hex('#2a2a30'), // black armour
  A: hex('#18181c'),
  u: hex('#c8902a'), // broken-sun emblem
  r: hex('#7a2a24'), // dark red sash
  q: hex('#9aa0a8'), // glaive blade
  Q: hex('#5e646c'),
  p: hex('#4a3424'), // glaive haft
  f: hex('#1c1c22'),
};
function kaelenFrame(phase) {
  const c = canvas(32);
  body(c, {
    hair: 'h',
    skin: 's',
    shade: 'S',
    eye: 'e',
    blink: phase === 2,
    torso: 'a',
    torsoDark: 'A',
    legs: 'f',
    wide: 6,
  });
  c.rect(12, 5, 20, 7, 'h');
  // Scar from brow across the nose (between the eyes, which stay visible).
  c.line(15, 7, 17, 12, 'z');
  // Broad pauldrons.
  c.rect(8, 14, 11, 17, 'A');
  c.rect(21, 14, 24, 17, 'A');
  // Broken sun on the chest: a disc with half its rays.
  c.ellipse(16, 19, 2, 2, 'u');
  for (const [x, y] of [
    [16, 16],
    [13, 19],
    [14, 17],
  ])
    c.put(x, y, 'u');
  c.rect(10, 23, 22, 23, 'r');
  // Glaive held upright.
  const lift = phase === 1 ? -1 : 0;
  c.rect(26, 3 + lift, 26, 30 + lift, 'p');
  c.rect(25, 1 + lift, 27, 6 + lift, 'q');
  c.put(28, 3 + lift, 'Q');
  c.put(24, 4 + lift, 'Q');
  c.rect(23, 18, 25, 19, 's');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Private Bran, who counts his deaths
const BRAN = {
  O: hex('#0e0e10'),
  h: hex('#8a6a3a'), // dusty sandy hair
  s: hex('#d0a888'),
  S: hex('#a07a60'),
  e: hex('#2a2a2a'),
  t: hex('#6a6e58'), // worn tabard
  T: hex('#4a4e3c'),
  w: hex('#e8e4dc'), // bandages
  W: hex('#b8b0a4'),
  p: hex('#7a5a36'), // wooden spear
  m: hex('#2a1a10'), // tally marks
  i: hex('#9aa0a8'),
  f: hex('#3a3428'),
};
function branFrame(phase) {
  const c = canvas(32);
  body(c, {
    hair: 'h',
    skin: 's',
    shade: 'S',
    eye: 'e',
    blink: phase === 3,
    torso: 't',
    torsoDark: 'T',
    legs: 'f',
    wide: 4,
  });
  // Bandage round the brow and the neck.
  c.rect(12, 7, 20, 7, 'w');
  c.put(20, 8, 'W');
  c.rect(14, 14, 18, 14, 'w');
  // Bandaged arms.
  c.rect(10, 16, 11, 22, 'w');
  c.put(10, 18, 'W');
  c.rect(21, 16, 22, 22, 'w');
  // Spear covered in tally marks, the tip lowered on the "counting" frame.
  const tip = phase === 1 ? 1 : 0;
  c.rect(24, 4 + tip, 24, 30, 'p');
  for (let y = 9; y < 28; y += 2) c.put(24, y, 'm');
  c.rect(23, 1 + tip, 25, 3 + tip, 'i');
  c.put(24, 0 + tip, 'i');
  c.rect(22, 20, 23, 21, 's');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Chronicler Elion
const ELION = {
  O: hex('#0e0c0c'),
  w: hex('#c8c4bc'), // thin grey hair
  s: hex('#c8a088'),
  S: hex('#9a765e'),
  e: hex('#b8c0c8'), // clouded eyes
  r: hex('#7a7670'), // ash-dyed robe
  R: hex('#5a5650'),
  k: hex('#5a3a22'), // hide-bound tome
  K: hex('#3e2614'),
  c: hex('#8a8e96'), // iron chain
  p: hex('#e8dcc0'), // page edges
  f: hex('#3a3632'),
};
function elionFrame(phase) {
  const c = canvas(32);
  const stoop = 1;
  body(c, {
    hair: 'w',
    skin: 's',
    shade: 'S',
    eye: 'e',
    blink: phase === 2,
    torso: 'r',
    torsoDark: 'R',
    legs: 'f',
    bob: stoop,
    wide: 5,
  });
  // Bald crown with thin hair at the sides.
  c.rect(14, 4 + stoop, 18, 6 + stoop, 's');
  // Robe hem to the ground.
  c.rect(10, 26, 22, 29, 'r');
  c.rect(10, 29, 22, 29, 'R');
  // Tome hugged to the chest, wrapped in a chain.
  const grip = phase === 1 ? 1 : 0;
  c.rect(12, 17 - grip, 20, 23 - grip, 'k');
  c.rect(12, 23 - grip, 20, 23 - grip, 'K');
  c.rect(20, 18 - grip, 20, 22 - grip, 'p');
  c.line(12, 18 - grip, 20, 22 - grip, 'c');
  c.line(12, 22 - grip, 20, 18 - grip, 'c');
  c.rect(10, 19, 11, 21, 's');
  c.rect(21, 19, 22, 21, 's');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Private Renard, afraid
const RENARD = {
  O: hex('#0e0e12'),
  h: hex('#7a3a1e'), // ginger hair under the helm
  s: hex('#e0b496'),
  S: hex('#b08468'),
  e: hex('#202028'),
  m: hex('#8a929c'), // oversized helm
  M: hex('#5e6670'),
  t: hex('#3a5a8a'), // Veridia blue tabard
  T: hex('#28406a'),
  l: hex('#6a4a2e'),
  x: hex('#a8acb4'), // short sword held low
  f: hex('#2c2c34'),
};
function renardFrame(phase) {
  const c = canvas(32);
  const shake = [0, 1, 0, -1][phase];
  body(c, {
    hair: 'h',
    skin: 's',
    shade: 'S',
    eye: 'e',
    blink: false,
    torso: 't',
    torsoDark: 'T',
    legs: 'f',
    wide: 4,
  });
  // Helm too big for him, slipping over the eyes.
  c.ellipse(16 + shake * 0.5, 7, 5.5, 4, 'm');
  c.rect(11, 8, 21, 8, 'M');
  // Wide frightened eyes (white showing).
  c.put(14, 10, 'e');
  c.put(18, 10, 'e');
  c.rect(15, 13, 17, 13, 'S'); // trembling mouth
  c.line(12, 16, 20, 24, 'l');
  // Sword held low, the blade shaking.
  c.rect(21, 22, 22, 23, 's');
  c.line(23, 23, 27 + shake, 29, 'x');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Kuro, the Forgotten One
const KURO = {
  O: hex('#08080c'),
  h: hex('#14141a'), // straight black hair, cut short
  H: hex('#2a2a36'),
  s: hex('#d0a888'),
  S: hex('#a07c64'),
  e: hex('#9a7aff'), // cold eyes with a violet glint
  c: hex('#9aa0ac'), // silver-grey cloak
  C: hex('#6e7480'),
  d: hex('#4a4e58'),
  v: [150, 110, 255, 230], // Interval violet fraying the hem
  V: [96, 190, 255, 200], // blue sparks
  u: hex('#1e2028'), // dark tunic
  f: hex('#16161c'),
};
function kuroFrame(phase) {
  const c = canvas(32);
  const flicker = phase === 4;
  // Cloak, cut long, falling straight.
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
  // Straight fringe swept to one side (never curly — Peter keeps the curls).
  c.rect(11, 5, 21, 7, 'h');
  c.rect(12, 8, 15, 8, 'h');
  c.put(19, 5, 'H');
  c.put(20, 6, 'H');
  // High collar and the cloak's open front.
  c.rect(12, 14, 13, 18, 'C');
  c.rect(19, 14, 20, 18, 'C');
  // Frayed hem dissolving into Interval light.
  for (let x = 9; x <= 23; x++) {
    const k = (x * 5 + phase * 3) % 7;
    if (k < 3) c.put(x, 29, 'v');
    if (k === 0) c.put(x, 30, 'v');
  }
  for (const [x, y] of [
    [6, 18],
    [26, 12],
    [7, 26],
    [25, 24],
  ])
    if ((x + y + phase) % 3 === 0) c.put(x, y, 'V');
  if (flicker) {
    // A slice of him slips sideways, as if the Interval pulled at the frame.
    for (let y = 16; y < 21; y++) {
      const row = [...c.g[y]];
      for (let x = 0; x < 32; x++) c.g[y][x] = row[x - 2] ?? '.';
      c.put(8, y, 'v');
    }
  }
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Ghost Sniper
const SNIPER = {
  O: hex('#0a080a'),
  c: [70, 66, 72, 230], // ragged hood
  C: [48, 44, 52, 220],
  d: [36, 32, 40, 160],
  v: hex('#050406'),
  e: hex('#ff3a2a'), // burning red eyes
  b: hex('#1a1210'), // black bow
  B: hex('#3a2a20'),
  s: [220, 210, 200, 200], // string
  a: hex('#9aa0a8'), // nocked arrow
  r: [255, 60, 40, 200], // aim glint
};
function sniperFrame(phase) {
  const c = canvas(32);
  const dy = [0, -1, -1, 0][phase];
  c.ellipse(15, 9 + dy, 5.5, 5.5, 'c');
  c.ellipse(15, 10 + dy, 3.2, 3.6, 'v');
  c.put(13, 10 + dy, 'e');
  c.put(16, 10 + dy, 'e');
  for (let y = 14; y < 29; y++) {
    const half = Math.round(6 - (y - 14) * 0.35 + Math.sin((y + phase * 2) / 2.2));
    if (half > 0) c.rect(15 - half, y + dy, 15 + half, y + dy, y > 24 ? 'd' : y % 3 ? 'c' : 'C');
  }
  // Longbow drawn to the left, an arrow nocked.
  for (let y = 6; y <= 24; y++) c.put(6 + Math.round(Math.abs(y - 15) ** 2 / 40), y + dy, 'b');
  c.put(7, 15 + dy, 'B');
  c.line(8, 6 + dy, 13, 15 + dy, 's');
  c.line(8, 24 + dy, 13, 15 + dy, 's');
  c.line(2, 15 + dy, 13, 15 + dy, 'a');
  if (phase % 2) c.put(1, 15 + dy, 'r');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Endless Phalanx (faces left)
const PHALANX = {
  O: hex('#0a0a0c'),
  m: hex('#6a7078'), // helm
  M: hex('#4a5058'),
  v: hex('#0c0c10'), // visor slit
  e: hex('#d8e0ff'), // pale eyes in the slit
  a: hex('#4e545e'), // mail
  A: hex('#363a42'),
  w: hex('#7a6a52'), // tower shield wood
  W: hex('#5a4c3a'),
  i: hex('#9aa0a8'), // shield rim
  p: hex('#5a4228'), // spear haft
  q: hex('#c0c6ce'), // spear head
  f: hex('#24262c'),
};
function phalanxFrame(phase) {
  const c = canvas(32);
  const step = [0, 1, 0, -1][phase];
  // Body behind the shield.
  c.ellipse(18, 8, 4.5, 4.5, 'm');
  c.rect(14, 9, 22, 9, 'M');
  c.rect(15, 8, 18, 8, 'v');
  c.put(15, 8, 'e');
  for (let y = 13; y < 27; y++) c.rect(14, y, 23, y, y % 4 ? 'a' : 'A');
  c.rect(15, 27, 17, 30 + (step > 0 ? 0 : 0), 'f');
  c.rect(20, 27, 22, 30, 'f');
  // Spear thrust forward over the shield.
  const thrust = phase === 1 ? -2 : 0;
  c.line(26, 12, 3 + thrust, 12, 'p');
  c.rect(1 + thrust, 11, 3 + thrust, 13, 'q');
  c.put(0 + thrust, 12, 'q');
  // Tall tower shield on the left (front).
  c.rect(7, 9 + step * 0, 13, 29, 'w');
  for (let y = 10; y < 29; y += 4) c.rect(7, y, 13, y, 'W');
  c.rect(7, 9, 13, 9, 'i');
  c.rect(7, 29, 13, 29, 'i');
  c.rect(7, 9, 7, 29, 'i');
  c.put(10, 18, 'i');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Banner Carrier
const CARRIER = {
  O: hex('#0c0a0a'),
  h: hex('#3a2a20'),
  s: hex('#b88468'),
  S: hex('#8a5e48'),
  e: hex('#1e1a1a'),
  t: hex('#5a4a40'), // grim brown coat
  T: hex('#3e322a'),
  p: hex('#5a4228'), // pole
  r: hex('#a82a2a'), // blood banner
  R: hex('#701a1a'),
  g: [255, 70, 60, 120], // crimson aura
  f: hex('#2a2420'),
};
function carrierFrame(phase) {
  const c = canvas(32);
  // Aura ring pulsing on the ground.
  const rr = 13 + (phase % 2);
  for (let a = 0; a < 40; a++) {
    const t = (a / 40) * Math.PI * 2;
    if (a % 3 !== phase % 3) c.put(16 + Math.cos(t) * rr, 27 + Math.sin(t) * 3.5, 'g');
  }
  body(c, {
    hair: 'h',
    skin: 's',
    shade: 'S',
    eye: 'e',
    blink: false,
    torso: 't',
    torsoDark: 'T',
    legs: 'f',
    wide: 4,
  });
  c.rect(14, 13, 18, 13, 'S'); // chanting mouth
  // Huge torn banner on a pole, waving.
  c.rect(22, 1, 22, 28, 'p');
  c.rect(20, 19, 21, 20, 's');
  const wave = [0, 1, 2, 1][phase];
  for (let y = 2; y < 15; y++) {
    const len = 7 + Math.round(Math.sin((y + wave * 2) / 2)) - (y > 11 ? (y * 3) % 4 : 0);
    for (let x = 0; x < len; x++)
      c.put(23 + x, y + (x > 4 ? (wave + x) % 2 : 0), y % 4 ? 'r' : 'R');
  }
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ The Crimson Standard (48x48)
const STANDARD = {
  O: hex('#0a0606'),
  r: hex('#a82424'), // blood-soaked cloth
  R: hex('#6e1414'),
  q: hex('#d24a3a'),
  p: hex('#4a3020'), // great pole
  P: hex('#2e1e14'),
  a: hex('#6a5a52'), // rusted armour shell
  A: hex('#463a34'),
  z: hex('#8a5a3a'), // rust
  v: hex('#140808'), // empty helm
  e: hex('#ff5a3a'),
  k: [40, 6, 10, 200], // black-red vortex
  K: [140, 20, 30, 170],
  w: [220, 40, 50, 120], // blood wall
};
function standardFrame(phase, wall = false) {
  const c = canvas(48);
  const bob = [0, -1, -2, -1][phase];
  // Black-red vortex the shell floats over.
  for (let a = 0; a < 70; a++) {
    const t = (a / 70) * Math.PI * 2 + phase * 0.4;
    const r = 7 + (a % 6);
    c.put(20 + Math.cos(t) * r * 1.4, 43 + Math.sin(t) * r * 0.3, a % 2 ? 'k' : 'K');
  }
  // Hollow rusted breastplate with pauldrons and an empty helm.
  for (let y = 26; y <= 38; y++) {
    const half = Math.round(9 - Math.max(0, y - 32) * 0.9);
    c.rect(20 - half, y + bob, 20 + half, y + bob, y % 4 ? 'a' : 'A');
  }
  c.ellipse(10, 27 + bob, 4, 3, 'A');
  c.ellipse(30, 27 + bob, 4, 3, 'A');
  for (const [x, y] of [
    [15, 29],
    [24, 33],
    [18, 36],
    [26, 28],
  ])
    c.put(x, y + bob, 'z');
  c.ellipse(20, 21 + bob, 4.5, 4.5, 'A');
  c.rect(17, 21 + bob, 23, 22 + bob, 'v');
  c.put(18, 21 + bob, 'e');
  c.put(22, 21 + bob, 'e');
  // The great pole through it.
  c.rect(20, 1 + bob, 21, 42 + bob, 'p');
  c.rect(21, 1 + bob, 21, 42 + bob, 'P');
  c.rect(18, 1 + bob, 23, 2 + bob, 'P');
  // A wide blood-soaked banner with a ragged, torn edge.
  for (let y = 3; y <= 24; y++) {
    const ragged = (y * 7) % 5;
    const len = 24 - ragged - Math.max(0, y - 18) * 2;
    for (let x = 0; x < len; x++) {
      const yy = y + bob + Math.round(Math.sin((x + phase * 3) / 4) * 1.2);
      if ((x === 9 && y > 8 && y < 11) || (x > 14 && x < 17 && y === 16)) continue; // two tears
      c.put(22 + x, yy, x % 8 === 0 || y % 7 === 0 ? 'R' : 'r');
    }
  }
  for (const [x, y] of [
    [27, 6],
    [33, 12],
    [29, 19],
  ])
    c.put(x, y + bob, 'q');
  // Blood dripping from the hem.
  for (const x of [25, 30, 35, 40])
    for (let k = 0; k < 2 + ((x + phase) % 3); k++) c.put(x, 25 + bob + k, 'q');
  if (wall) {
    for (let a = 0; a < 100; a++) {
      const t = (a / 100) * Math.PI * 2;
      c.put(22 + Math.cos(t) * 21, 24 + Math.sin(t) * 21, 'w');
      if (a % 2) c.put(22 + Math.cos(t) * 20, 24 + Math.sin(t) * 20, 'w');
    }
    c.line(20, 30, 3, 44, 'q');
    c.line(20, 30, 42, 44, 'q');
  }
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ The Last War (64x64)
const LASTWAR = {
  O: hex('#060606'),
  i: hex('#8a9098'), // fused blades
  I: hex('#5a6068'),
  j: hex('#3a3e46'),
  b: hex('#e0d8c8'), // skulls
  B: hex('#a8a090'),
  v: hex('#0e0a0a'),
  f: hex('#ff8a3a'), // ash-fire
  F: hex('#ffd07a'),
  g: hex('#c84a2a'),
  s: hex('#c8ccd4'), // greatswords
  S: hex('#7a7e86'),
  a: [150, 140, 130, 150], // ash drifting
};
function lastWarFrame(phase, kneel = false) {
  const c = canvas(64);
  const bob = kneel ? 6 : [0, -1, -2, -1][phase];
  const fl = phase % 2;
  // Legs of stacked shields (or knees on the ground).
  if (kneel) {
    c.rect(20, 52, 29, 58, 'I');
    c.rect(35, 55, 45, 61, 'I');
  } else {
    for (const x0 of [21, 35]) {
      c.rect(x0, 44, x0 + 8, 62, 'I');
      for (let y = 46; y < 62; y += 4) c.rect(x0, y, x0 + 8, y, 'j');
    }
  }
  // Torso: broad shoulders tapering to the waist, plated with fused blades.
  for (let y = 18; y <= 44; y++) {
    const half = Math.round(18 - (y - 18) * 0.42);
    for (let x = 32 - half; x <= 32 + half; x++)
      c.put(x, y + bob, (x + y * 2) % 7 === 0 ? 'j' : (x - y) % 9 === 0 ? 'i' : 'I');
  }
  // Blades jutting out of the shoulders and back.
  for (const [x0, y0, x1, y1] of [
    [16, 19, 8, 9],
    [20, 18, 15, 6],
    [44, 18, 49, 6],
    [48, 19, 56, 9],
    [24, 18, 22, 8],
    [40, 18, 42, 8],
  ])
    c.line(x0, y0 + bob, x1, y1 + bob, 's');
  // Burning core and skulls set in the chest.
  c.ellipse(32, 31 + bob, 3, 3, fl ? 'f' : 'F');
  for (const [x, y] of [
    [24, 26],
    [40, 26],
    [32, 38],
  ]) {
    c.ellipse(x, y + bob, 2.6, 2.6, 'b');
    c.put(x - 1, y + bob, 'v');
    c.put(x + 1, y + bob, 'v');
    c.put(x, y + 2 + bob, 'B');
  }
  // Helm crowned with broken spear tips, visor burning.
  c.ellipse(32, 12 + bob, 6, 6, 'j');
  c.rect(27, 12 + bob, 37, 13 + bob, 'v');
  c.rect(29, 12 + bob, 35, 12 + bob, fl ? 'f' : 'F');
  for (const x of [27, 30, 34, 37]) c.line(x, 7 + bob, x + (x < 32 ? -1 : 1), 3 + bob, 'i');
  // Arms down to the fists, each raising a burning greatsword.
  const lift = kneel ? 8 : phase === 1 ? -2 : 0;
  c.rect(11, 22 + bob, 15, 36 + bob, 'I');
  c.rect(49, 22 + bob, 53, 36 + bob, 'I');
  c.rect(10, 35 + bob, 15, 38 + bob, 'j');
  c.rect(49, 35 + bob, 54, 38 + bob, 'j');
  for (const [hx, tx] of [
    [12, 2],
    [52, 62],
  ]) {
    const hy = 36 + bob;
    const ty = 4 + lift;
    c.line(hx, hy, tx, ty, 's');
    c.line(hx + (tx < hx ? 1 : -1), hy, tx + (tx < hx ? 1 : -1), ty, 'S');
    // Ash-fire licking up the blade.
    const n = 10;
    for (let k = 2; k < n; k++) {
      const x = Math.round(hx + ((tx - hx) * k) / n);
      const y = Math.round(hy + ((ty - hy) * k) / n);
      c.put(x + ((k + fl) % 2 ? 1 : -1), y - 1, k % 3 ? 'f' : 'F');
      if ((k + fl) % 2) c.put(x, y - 2, 'g');
    }
  }
  for (let k = 0; k < 10; k++) c.put(3 + ((k * 13 + phase * 7) % 58), 3 + ((k * 29 + phase * 3) % 46), 'a');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ output
const four = (fn) => [0, 1, 2, 3].map((p) => fn(p));
const OUT = [
  ['npcs/aldric', 'aldric_idle_v1.png', four(aldricFrame), 32, ALDRIC, 8],
  ['npcs/kaelen', 'kaelen_idle_v1.png', four(kaelenFrame), 32, KAELEN, 8],
  ['npcs/soldier_bran', 'soldier_bran_idle_v1.png', four(branFrame), 32, BRAN, 8],
  ['npcs/chronicler_elion', 'chronicler_elion_idle_v1.png', four(elionFrame), 32, ELION, 8],
  ['npcs/renard', 'renard_idle_v1.png', four(renardFrame), 32, RENARD, 8],
  ['npcs/kuro', 'kuro_idle_v1.png', [0, 1, 2, 3, 4].map(kuroFrame), 32, KURO, 8],
  ['enemies/ghost_sniper', 'ghost_sniper_v1.png', four(sniperFrame), 32, SNIPER, 8],
  ['enemies/endless_phalanx', 'endless_phalanx_v1.png', four(phalanxFrame), 32, PHALANX, 8],
  ['enemies/banner_carrier', 'banner_carrier_v1.png', four(carrierFrame), 32, CARRIER, 8],
  [
    'enemies/crimson_standard',
    'crimson_standard_v1.png',
    [...four((p) => standardFrame(p)), standardFrame(0, true)],
    48,
    STANDARD,
    6,
  ],
  [
    'enemies/the_last_war',
    'the_last_war_v1.png',
    [...four((p) => lastWarFrame(p)), lastWarFrame(0, true)],
    64,
    LASTWAR,
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
