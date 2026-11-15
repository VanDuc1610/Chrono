/**
 * CHRONO – Chapter 8 characters (Pipeline B, .agents/rules/chrono-art.md §4) for "The Null Hour &
 * The Convergence" (design: docs/story/CHAPTER_08_DESIGN.md §9, §13.1, owner decisions §17):
 *   Assimilator, Phase Wraith, Doom Bell, Twin-Era Legionnaire, Second-Hand Warden (32x32 x4);
 *   The Convergent Praetor (48x48 x4 + broken), The Herald of the Null Hour (64x64 x4 + stopped),
 *   The Sixfold Echo (48x48 x6, one frame per seal), Chronos reborn (48x48 x4: tall, silver-white
 *   hair, a gold cloak fraying into chains, a clock face with no hands behind him).
 * Deterministic pixel rules only — no image model, no external reference.
 * Output: art-source/{npcs,enemies}/<name>/generated/candidates/ ONLY.
 *
 * Usage: node scripts/author-ch8-characters.js
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

// ------------------------------------------------------------------ Assimilator (32)
/** A grey lump that copies Peter: a blank face, a mimic of his curls on top, and the icon of the
 *  move it has learned floating above (slash / dash / skill, cycling through the frames). */
const ASSIM = {
  O: hex('#0c0c12'),
  g: hex('#8a8c98'),
  G: hex('#5c5e6a'),
  l: hex('#b4b6c2'),
  e: hex('#f0f2ff'),
  i: hex('#f0c860'), // learned-move icon
};
function assimFrame(phase) {
  const c = canvas(32);
  const squash = [0, 1, 0, -1][phase];
  // A soft blob with drips at its base, no fixed shape of its own.
  c.ellipse(16, 20 + squash / 2, 9 + squash, 9 - squash, 'g');
  c.ellipse(13, 17, 3, 2, 'l');
  for (const [x, len] of [
    [9, 2 + (phase % 2)],
    [14, 3],
    [20, 2 + ((phase + 1) % 2)],
    [23, 1],
  ])
    c.rect(x, 28, x + 1, 28 + len, 'G');
  // A lumpy imitation of Peter's curls.
  for (const x of [11, 14, 17, 20]) c.ellipse(x, 12 + squash, 2.2, 2.2, 'l');
  c.ellipse(13, 20, 1.5, 2, 'e');
  c.ellipse(19, 20, 1.5, 2, 'e');
  c.put(13, 20, 'O');
  c.put(19, 20, 'O');
  // One arm grown into a copy of Peter's blade.
  c.line(25, 21, 30, 14, 'l');
  c.line(26, 21, 31, 14, 'G');
  // The learned move icon.
  if (phase === 0) c.line(13, 3, 19, 8, 'i');
  if (phase === 1) {
    c.line(12, 6, 20, 6, 'i');
    c.line(17, 4, 20, 6, 'i');
    c.line(17, 8, 20, 6, 'i');
  }
  if (phase === 2) {
    c.line(16, 2, 16, 8, 'i');
    c.line(13, 5, 19, 5, 'i');
    c.put(14, 3, 'i');
    c.put(18, 7, 'i');
  }
  if (phase === 3) c.line(13, 3, 19, 8, 'i');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Phase Wraith (32)
/** Half Khánh Hòa sea-blue, half Beta steel; on odd frames it is only an outline (out of phase). */
const WRAITH = {
  O: hex('#08101a'),
  b: [70, 150, 200, 235],
  B: [40, 96, 140, 235],
  m: [140, 150, 166, 235],
  M: [86, 94, 108, 235],
  e: hex('#fff2b8'),
  h: [240, 200, 96, 150], // the dashed outline when out of phase
};
function wraithFrame(phase) {
  const c = canvas(32);
  const solid = phase === 0 || phase === 1;
  const bob = [0, -1, 0, 1][phase];
  for (let y = 7; y < 30; y++) {
    const half = Math.round(3 + (y - 7) * 0.33 + Math.sin((y + phase * 3) / 3));
    for (let x = 16 - half; x <= 16 + half; x++) {
      if (!solid) {
        if ((x === 16 - half || x === 16 + half) && (y + phase) % 3 !== 0) c.put(x, y + bob, 'h');
        continue;
      }
      const left = x < 16;
      c.put(x, y + bob, left ? (y % 4 ? 'b' : 'B') : y % 4 ? 'm' : 'M');
    }
  }
  if (solid) {
    c.ellipse(16, 9 + bob, 4, 4, 'b');
    c.rect(16, 5 + bob, 20, 13 + bob, 'm');
  } else c.ring(16, 9 + bob, 4, 'h', 2);
  c.put(14, 9 + bob, 'e');
  c.put(18, 9 + bob, 'e');
  if (solid) c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Doom Bell (32)
/** A bronze bell hung from a broken clock arm; frames 1-3 show toll rings 1-3. */
const BELL = {
  O: hex('#120a04'),
  t: hex('#c8823a'),
  T: hex('#8a5424'),
  y: hex('#ffd890'),
  k: hex('#2c2a30'),
  r: [255, 220, 140, 200],
};
function bellFrame(phase) {
  const c = canvas(32);
  c.rect(6, 2, 26, 3, 'k');
  c.rect(15, 3, 16, 7, 'k');
  for (let y = 8; y < 26; y++) {
    const half = Math.round(4 + (y - 8) * 0.45);
    c.rect(16 - half, y, 16 + half, y, y % 6 === 0 ? 'T' : 't');
  }
  c.rect(6, 26, 26, 27, 'T');
  c.put(12, 12, 'y');
  // A face scratched into the bronze.
  c.put(13, 16, 'k');
  c.put(19, 16, 'k');
  c.rect(14, 20, 18, 20, 'k');
  c.ellipse(16 + [0, -1, 1, 0][phase], 29, 2, 2, 'T');
  c.outline();
  // Toll arcs on both sides, one more per toll.
  for (let k = 0; k < phase; k++) {
    const d = 11 + k * 2;
    for (let y = 10; y <= 24; y++) {
      const dx = Math.round(Math.sqrt(Math.max(0, 64 - (y - 17) ** 2)) / 3);
      c.put(16 - d - dx, y, 'r');
      c.put(16 + d + dx, y, 'r');
    }
  }
  return c.g;
}

// ------------------------------------------------------------------ Twin-Era Legionnaire (32)
/** A Sol-Karis legionnaire's crest and red cloak over a trench soldier's helmet and coat; the
 *  shield glows red on frame 3 (turned to an ally — the opening). */
const LEGION = {
  O: hex('#0e0a08'),
  h: hex('#7c8696'), // trench helmet
  H: hex('#4e5664'),
  c: hex('#c84a3a'), // crest / cloak
  C: hex('#8a2e26'),
  k: hex('#6a6450'), // trench coat
  K: hex('#46422e'),
  s: hex('#d8b090'),
  q: hex('#e8e2d4'), // marble shield
  Q: hex('#b8b0a0'),
  g: hex('#e8c060'),
  r: hex('#ff6a50'),
};
function legionFrame(phase) {
  const c = canvas(32);
  const step = [0, 1, 0, -1][phase];
  c.rect(9, 13, 21, 26, 'C');
  c.rect(11, 14, 19, 26, 'k');
  c.rect(11, 20, 19, 20, 'K');
  c.rect(12, 27, 14, 30 + Math.min(0, step), 'K');
  c.rect(17, 27, 19, 30 - Math.max(0, step), 'K');
  c.ellipse(15, 9, 4, 4, 's');
  c.ellipse(15, 7, 5.5, 3, 'h');
  c.rect(9, 8, 21, 8, 'H');
  for (let x = 11; x <= 19; x++) c.put(x, 3 + Math.round(Math.abs(x - 15) / 3), 'c');
  c.put(14, 9, 'K');
  c.put(17, 9, 'K');
  // The shield.
  const glow = phase === 3;
  c.rect(20, 12, 28, 26, glow ? 'r' : 'Q');
  c.rect(21, 13, 27, 25, glow ? 'c' : 'q');
  c.ellipse(24, 19, 2, 2, 'g');
  c.line(5, 26, 9, 10, 'H');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Second-Hand Warden (32)
/** A thin clockwork knight carrying a long second hand like a lance; its chest dial ticks. */
const WARDEN = {
  O: hex('#0a0a10'),
  m: hex('#a8b2c0'),
  M: hex('#5c6676'),
  z: hex('#f4f0e6'),
  k: hex('#22242c'),
  g: hex('#f0c860'),
  G: hex('#a07c30'),
};
function wardenFrame(phase) {
  const c = canvas(32);
  c.rect(12, 12, 19, 25, 'M');
  c.rect(13, 13, 18, 24, 'm');
  c.ellipse(15.5, 18, 3, 3, 'z');
  const a = (phase / 4) * Math.PI * 2 - Math.PI / 2;
  c.line(15.5, 18, 15.5 + Math.cos(a) * 2.5, 18 + Math.sin(a) * 2.5, 'k');
  c.rect(13, 26, 14, 30, 'M');
  c.rect(17, 26, 18, 30, 'M');
  c.ellipse(15.5, 8, 3.5, 4, 'M');
  c.rect(13, 7, 18, 8, 'k');
  c.put(14, 7, 'g');
  c.put(17, 7, 'g');
  // The second hand, held like a lance, sweeping a little each frame.
  const tip = [-10, -6, -2, -6][phase];
  c.line(20, 20, 31, 20 + tip, 'G');
  c.line(20, 21, 31, 21 + tip, 'g');
  c.ellipse(20, 20.5, 1.5, 1.5, 'G');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ The Convergent Praetor (48)
/** Chapter 2's exiled praetor and Chapter 4's crimson standard grown into one: the left half in
 *  gold-trimmed imperial white, the right half in a war-torn red banner, a gold seam down the middle.
 *  The 5th frame is the shield broken by Lyra. */
const PRAETOR = {
  O: hex('#0a0806'),
  q: hex('#e8e2d4'),
  Q: hex('#b8b0a0'),
  c: hex('#b8382e'),
  C: hex('#6e1e1a'),
  g: hex('#f0c860'),
  G: hex('#a07c30'),
  s: hex('#d8b090'),
  k: hex('#2c2a30'),
  y: hex('#fff2b8'),
};
function praetorFrame(phase, broken = false) {
  const c = canvas(48);
  const bob = [0, -1, -1, 0][phase];
  for (let y = 18; y < 45; y++) {
    const half = Math.round(7 + (y - 18) * 0.3);
    for (let x = 24 - half; x <= 24 + half; x++)
      c.put(x, y + bob, x < 24 ? (y % 6 ? 'q' : 'Q') : y % 5 ? 'c' : 'C');
  }
  // Ragged hem on the banner side.
  for (let x = 25; x < 36; x += 3) c.put(x, 45 + bob, '.');
  c.rect(24, 16 + bob, 24, 44 + bob, 'g');
  c.ellipse(24, 11 + bob, 5, 6, 's');
  c.rect(18, 5 + bob, 30, 8 + bob, 'G');
  for (const x of [19, 23, 27, 30]) c.put(x, 4 + bob, 'g');
  c.put(22, 11 + bob, 'k');
  c.put(26, 11 + bob, 'y');
  // Scales of false causality in the left hand, a broken standard in the right.
  c.line(10, 20 + bob, 10, 32 + bob, 'G');
  c.line(5, 22 + bob, 15, 22 + bob, 'G');
  c.ellipse(5, 25 + bob, 2.5, 1.5, 'g');
  c.ellipse(15, 24 + bob + (phase % 2), 2.5, 1.5, 'g');
  if (broken) {
    c.line(36, 36, 44, 30, 'Q');
    c.line(38, 40, 46, 42, 'Q');
  } else {
    c.rect(36, 18 + bob, 44, 36 + bob, 'Q');
    c.rect(37, 19 + bob, 43, 35 + bob, 'q');
    c.line(40, 20 + bob, 40, 34 + bob, 'g');
  }
  c.line(32, 4, 34, 46, 'k');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Herald of the Null Hour (64)
/** A hooded giant whose body is a clock face; the hour hand creeps toward the 25th mark each frame.
 *  The 5th frame is stopped at 11:59 with Peter's half seal set in the centre. */
const HERALD = {
  O: hex('#06060c'),
  v: [26, 20, 40, 245],
  V: [48, 40, 70, 240],
  z: hex('#f4f0e6'),
  Z: hex('#c8c0b0'),
  k: hex('#1c1a22'),
  g: hex('#f0c860'),
  G: hex('#a07c30'),
  r: hex('#ff5a3a'), // the 25th mark
  y: hex('#fff2b8'),
};
function heraldFrame(phase, stopped = false) {
  const c = canvas(64);
  const bob = stopped ? 0 : [0, -1, -1, 0][phase];
  // Hooded cloak.
  for (let y = 6; y < 62; y++) {
    const half = Math.round(6 + (y - 6) * 0.42);
    c.rect(32 - half, y + bob, 32 + half, y + bob, y % 7 === 0 ? 'V' : 'v');
  }
  c.ellipse(32, 12 + bob, 7, 7, 'k');
  c.put(29, 12 + bob, 'g');
  c.put(35, 12 + bob, 'g');
  // The clock face body: 25 marks, the last one red.
  c.ellipse(32, 38 + bob, 17, 17, 'G');
  c.ellipse(32, 38 + bob, 15, 15, 'z');
  for (let k = 0; k < 25; k++) {
    const a = (k / 25) * Math.PI * 2 - Math.PI / 2;
    c.put(32 + Math.cos(a) * 13, 38 + bob + Math.sin(a) * 13, k === 24 ? 'r' : 'k');
    if (k === 24) c.put(32 + Math.cos(a) * 12, 38 + bob + Math.sin(a) * 12, 'r');
  }
  const hour = stopped ? 23.9 : 20 + phase;
  const a = (hour / 25) * Math.PI * 2 - Math.PI / 2;
  c.line(32, 38 + bob, 32 + Math.cos(a) * 9, 38 + bob + Math.sin(a) * 9, 'k');
  const m = stopped ? -Math.PI / 2 - 0.12 : (phase / 4) * Math.PI * 2;
  c.line(32, 38 + bob, 32 + Math.cos(m) * 12, 38 + bob + Math.sin(m) * 12, 'G');
  c.ellipse(32, 38 + bob, 2, 2, stopped ? 'y' : 'k');
  if (stopped) c.ring(32, 38, 4, 'g');
  // Two long arms ending in pendulum blades.
  c.line(14, 30 + bob, 4, 50 + (phase % 2), 'V');
  c.line(50, 30 + bob, 60, 50 + ((phase + 1) % 2), 'V');
  c.ellipse(4, 52 + (phase % 2), 3, 3, 'G');
  c.ellipse(60, 52 + ((phase + 1) % 2), 3, 3, 'G');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ The Sixfold Echo (48)
/** A faceless figure ringed by six seal sigils; each frame, one sigil burns and the body takes its
 *  colour (Continuum sea, Causality gold, Memory crystal, Finality red, Possibility violet, Origin white). */
const SIXFOLD = {
  O: hex('#06060c'),
  v: [30, 26, 44, 240],
  V: [54, 48, 74, 235],
  1: hex('#4aa8d8'),
  2: hex('#f0c860'),
  3: hex('#9ae8e0'),
  4: hex('#d84a3a'),
  5: hex('#a07cf0'),
  6: hex('#f6f4ff'),
  e: hex('#f6f4ff'),
};
function sixfoldFrame(phase) {
  const c = canvas(48);
  const lit = String(phase + 1);
  for (let y = 10; y < 46; y++) {
    const half = Math.round(4 + (y - 10) * 0.3);
    c.rect(24 - half, y, 24 + half, y, y % 5 === 0 ? lit : 'v');
  }
  c.ellipse(24, 10, 5, 6, 'V');
  c.put(22, 10, 'e');
  c.put(26, 10, 'e');
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 - Math.PI / 3;
    const x = 24 + Math.cos(a) * 19;
    const y = 28 + Math.sin(a) * 14;
    c.ellipse(x, y, k === phase ? 3 : 2, k === phase ? 3 : 2, String(k + 1));
  }
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ Chronos reborn (48)
/** Tall, silver-white hair to the shoulders, a gold cloak fraying into chains at the hem, a clock
 *  face with no hands floating behind him (owner decision, CHAPTER_08_DESIGN.md §17). */
const CHRONOS = {
  O: hex('#0a0806'),
  h: hex('#eeeef4'), // silver-white hair
  H: hex('#b8bac8'),
  s: hex('#e4c8aa'),
  S: hex('#b89878'),
  e: hex('#f0c860'),
  g: hex('#e8b850'), // gold cloak
  G: hex('#a07828'),
  w: hex('#f4f0e6'), // white robe
  W: hex('#c8c0b0'),
  c: hex('#c8a040'), // chain links
  z: [244, 240, 230, 150], // the handless clock behind him
  Z: [200, 170, 90, 170],
};
function chronosFrame(phase) {
  const c = canvas(48);
  const bob = [0, 0, -1, 0][phase];
  // The clock face with no hands.
  c.ellipse(24, 16, 15, 15, 'Z');
  c.ellipse(24, 16, 13, 13, 'z');
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    c.put(24 + Math.sin(a) * 11, 16 - Math.cos(a) * 11, 'Z');
  }
  // Cloak and robe.
  for (let y = 18; y < 42; y++) {
    const half = Math.round(5 + (y - 18) * 0.22);
    c.rect(24 - half, y + bob, 24 + half, y + bob, y % 6 === 0 ? 'G' : 'g');
  }
  c.rect(22, 19 + bob, 26, 41 + bob, 'w');
  c.rect(22, 30 + bob, 26, 30 + bob, 'W');
  // The hem frays into chains.
  for (let x = 17; x <= 31; x += 2) {
    const len = 2 + ((x * 7 + phase) % 4);
    for (let k = 0; k < len; k++) c.put(x, 42 + bob + k, k % 2 ? 'G' : 'c');
  }
  // Head and long silver-white hair.
  c.ellipse(24, 11 + bob, 5, 6, 'h');
  c.rect(19, 11 + bob, 20, 20 + bob, 'h');
  c.rect(28, 11 + bob, 29, 20 + bob, 'h');
  c.ellipse(24, 12 + bob, 3.6, 4.4, 's');
  c.rect(20, 6 + bob, 28, 8 + bob, 'h');
  c.put(22, 12 + bob, phase === 3 ? 'S' : 'e');
  c.put(26, 12 + bob, phase === 3 ? 'S' : 'e');
  c.put(24, 15 + bob, 'S');
  c.put(21, 9 + bob, 'H');
  c.put(27, 8 + bob, 'H');
  c.outline();
  return c.g;
}

// ------------------------------------------------------------------ output
const four = (fn) => [0, 1, 2, 3].map((p) => fn(p));
const OUT = [
  ['enemies/assimilator', 'assimilator_v1.png', four(assimFrame), 32, ASSIM, 8],
  ['enemies/phase_wraith', 'phase_wraith_v1.png', four(wraithFrame), 32, WRAITH, 8],
  ['enemies/doom_bell', 'doom_bell_v1.png', four(bellFrame), 32, BELL, 8],
  ['enemies/twin_era_legionnaire', 'twin_era_legionnaire_v1.png', four(legionFrame), 32, LEGION, 8],
  ['enemies/second_hand_warden', 'second_hand_warden_v1.png', four(wardenFrame), 32, WARDEN, 8],
  [
    'enemies/convergent_praetor',
    'convergent_praetor_v1.png',
    [...four((p) => praetorFrame(p)), praetorFrame(0, true)],
    48,
    PRAETOR,
    6,
  ],
  [
    'enemies/null_hour_herald',
    'null_hour_herald_v1.png',
    [...four((p) => heraldFrame(p)), heraldFrame(0, true)],
    64,
    HERALD,
    5,
  ],
  [
    'enemies/sixfold_echo',
    'sixfold_echo_v1.png',
    [0, 1, 2, 3, 4, 5].map(sixfoldFrame),
    48,
    SIXFOLD,
    6,
  ],
  ['npcs/chronos_reborn', 'chronos_reborn_idle_v1.png', four(chronosFrame), 48, CHRONOS, 6],
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
