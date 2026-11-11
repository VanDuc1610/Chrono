/**
 * CHRONO – code-authored boss sprite: The Drowned Sentinel (Pipeline B, AGENTS.md §5).
 *
 * A guardian half again as tall as a man: ancient bronze armour gone green with verdigris,
 * crusted with barnacles and hung with kelp, a broken halberd, and a skin of sea-water frozen
 * mid-motion around him like cracked glass (PROLOGUE_V2_DESIGN.md §3, §5). Deterministic pixel
 * rules only — no image model, no external reference.
 * Output: art-source/enemies/sentinel/generated/candidates/ ONLY (owner approval required).
 *
 * Usage: node scripts/author-sentinel-sprites.js [outDir]
 * Sheet: sentinel_<ver>.png — 64×64 frames: 0-3 idle (frozen film shimmers, kelp sways, slow
 * bob), 4 released (kneeling, head bowed, film shattered into rising motes).
 */
import path from 'path';
import fs from 'fs';
import { hex, encodePng, writeFile } from './pixel-art/pixel.js';

const VERSION = 'v1';
const S = 64;

const PALETTE = {
  O: hex('#0a0f12'), // outline
  a: hex('#4a7a6a'), // verdigris armour
  A: hex('#2e5248'), // armour shade
  h: hex('#7aa894'), // armour highlight
  b: hex('#8c6628'), // bronze showing through
  B: hex('#5a4019'), // bronze dark
  n: hex('#c8c0b0'), // barnacle
  N: hex('#8a8478'), // barnacle shade
  g: hex('#2e5a2a'), // kelp
  G: hex('#1e3e1c'), // kelp dark
  v: hex('#0a1418'), // visor dark
  c: hex('#00c8ff'), // eye glow
  C: hex('#88edff'), // eye core / motes
  i: hex('#9ad8f0'), // frozen water film
  I: hex('#d8f4ff'), // film glint
  w: hex('#5a4630'), // halberd shaft
  s: hex('#8a96a0'), // blade
  t: hex('#c0c8d0'), // blade edge
};

const rnd = (x, y, s) => (((x * 73856093) ^ (y * 19349663) ^ (s * 83492791)) >>> 0) % 100;
const canvas = () => Array.from({ length: S }, () => Array(S).fill('.'));
const put = (g, x, y, ch) => {
  if (x >= 0 && y >= 0 && x < S && y < S) g[y][x] = ch;
};
const rect = (g, x0, y0, x1, y1, ch) => {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, ch);
};
const ellipse = (g, cx, cy, rx, ry, ch) => {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) put(g, x, y, ch);
};
const outline = (g) => {
  const src = g.map((r) => [...r]);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      if (src[y][x] !== '.') continue;
      if (
        [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ].some(([dx, dy]) => (src[y + dy]?.[x + dx] ?? '.') !== '.')
      )
        g[y][x] = 'O';
    }
  return g;
};
/** Shade the right side of an area (light comes from the upper left). */
const shadeRight = (g, x0, x1, y0, y1, from) => {
  for (let y = y0; y <= y1; y++)
    for (let x = from; x <= x1; x++) if (g[y][x] === 'a') put(g, x, y, 'A');
};
const barnacles = (g, pts) =>
  pts.forEach(([x, y]) => {
    put(g, x, y, 'n');
    put(g, x + 1, y, 'N');
    put(g, x, y + 1, 'N');
  });
/** A kelp strand hanging from (x, y), `len` px, swaying by `sway` px at its tip. */
const kelp = (g, x, y, len, sway) => {
  for (let k = 0; k < len; k++) {
    const dx = Math.round(Math.sin((k / len) * Math.PI * 0.9) * sway);
    put(g, x + dx, y + k, k % 3 === 2 ? 'G' : 'g');
  }
};

/** Standing guardian; `phase` 0..3 drives bob, kelp sway and the film shimmer. */
function standing(phase) {
  const g = canvas();
  const bob = phase === 1 || phase === 2 ? 1 : 0;
  const Y = (y) => y + bob;

  // Broken halberd in his right hand (viewer-left): shaft, a cracked crescent blade.
  rect(g, 9, Y(10), 10, 60, 'w');
  for (let y = 0; y < 13; y++) {
    const w = Math.round(Math.sin((y / 12) * Math.PI) * 7);
    for (let x = 11; x <= 11 + w; x++) put(g, x, Y(8 + y), x === 11 + w ? 't' : 's');
  }
  for (const [x, y] of [
    [15, 11],
    [16, 12],
    [17, 14],
  ])
    put(g, x, Y(y), '.'); // the broken edge

  // Legs and greaves.
  rect(g, 23, Y(48), 30, 60, 'a');
  rect(g, 34, Y(48), 41, 60, 'a');
  rect(g, 21, 59, 31, 61, 'A');
  rect(g, 33, 59, 43, 61, 'A');
  // Tassets (skirt plates) and belt.
  for (let y = 0; y < 9; y++)
    rect(g, 22 - Math.floor(y / 3), Y(40 + y), 42 + Math.floor(y / 3), Y(40 + y), 'a');
  rect(g, 22, Y(39), 42, Y(40), 'b');
  rect(g, 31, Y(39), 33, Y(40), 'B');
  // Torso with a ridged breastplate.
  rect(g, 22, Y(20), 42, Y(38), 'a');
  for (const y of [25, 30, 35]) rect(g, 24, Y(y), 40, Y(y), 'A');
  rect(g, 31, Y(21), 33, Y(37), 'h');
  // Arms: right (viewer-left) grips the shaft, left hangs.
  rect(g, 13, Y(24), 19, Y(40), 'a');
  ellipse(g, 12, Y(42), 4, 3, 'A');
  rect(g, 45, Y(24), 51, Y(41), 'a');
  ellipse(g, 48, Y(44), 4, 3, 'A');
  // Pauldrons.
  ellipse(g, 18, Y(23), 9, 6, 'a');
  ellipse(g, 46, Y(23), 9, 6, 'a');
  ellipse(g, 16, Y(21), 5, 2, 'h');
  ellipse(g, 44, Y(21), 5, 2, 'h');
  // Helm with a fin-like crest and a dark visor slit, two cold eyes.
  ellipse(g, 32, Y(13), 9, 9, 'a');
  for (let y = 0; y < 7; y++) rect(g, 31, Y(1 + y), 33, Y(1 + y), y < 2 ? 'B' : 'b');
  rect(g, 25, Y(13), 39, Y(15), 'v');
  put(g, 28, Y(14), 'c');
  put(g, 29, Y(14), 'C');
  put(g, 35, Y(14), 'C');
  put(g, 36, Y(14), 'c');
  ellipse(g, 29, Y(9), 3, 2, 'h');

  // Light from the upper left.
  shadeRight(g, 0, 63, 0, 63, 37);
  shadeRight(g, 0, 19, 24, 44, 17);

  // Sea-life: barnacles and kelp.
  barnacles(g, [
    [14, Y(22)],
    [21, Y(25)],
    [45, Y(20)],
    [50, Y(26)],
    [25, Y(33)],
    [38, Y(29)],
    [26, Y(53)],
    [39, Y(56)],
    [35, Y(10)],
  ]);
  const sway = [0, 1, 2, 1][phase];
  kelp(g, 12, Y(28), 14, sway);
  kelp(g, 50, Y(28), 12, -sway);
  kelp(g, 24, Y(41), 10, sway);
  kelp(g, 40, Y(41), 12, -sway);

  outline(g);

  // Frozen water film: a shell of cracked glass around him; the glints travel with `phase`.
  for (let k = 0; k < 120; k++) {
    const a = (k / 120) * Math.PI * 2;
    const x = Math.round(32 + Math.cos(a) * 29);
    const y = Math.round(Y(33) + Math.sin(a) * 30);
    if ((k + phase * 4) % 15 < 4) continue; // breaks in the film
    if (g[y]?.[x] === '.') put(g, x, y, (k + phase * 3) % 9 === 0 ? 'I' : 'i');
  }
  for (const [x, y] of [
    [6, 24],
    [58, 30],
    [8, 50],
    [56, 52],
  ]) {
    const glint = (x + phase * 7) % 3 === 0;
    put(g, x, Y(y), glint ? 'I' : 'i');
  }
  return g;
}

/** Released: kneeling on one knee, head bowed, halberd laid down, the film shattered into motes. */
function kneeling() {
  const g = canvas();
  // Halberd laid across the ground.
  rect(g, 4, 60, 58, 61, 'w');
  for (let x = 0; x < 9; x++)
    rect(g, 4 + x, 56 + Math.round(x / 3), 4 + x, 59, x === 0 ? 't' : 's');
  // Bent knee (viewer-left) and the kneeling leg.
  rect(g, 20, 48, 30, 58, 'a');
  rect(g, 34, 52, 46, 58, 'a');
  rect(g, 44, 46, 48, 58, 'A');
  // Body lower and bowed forward.
  for (let y = 0; y < 7; y++)
    rect(g, 22 - Math.floor(y / 3), 42 + y, 42 + Math.floor(y / 3), 42 + y, 'a');
  rect(g, 22, 41, 42, 42, 'b');
  rect(g, 22, 26, 42, 40, 'a');
  for (const y of [31, 36]) rect(g, 24, y, 40, y, 'A');
  ellipse(g, 18, 29, 9, 6, 'a');
  ellipse(g, 46, 29, 9, 6, 'a');
  rect(g, 14, 30, 19, 44, 'a');
  rect(g, 45, 30, 50, 46, 'a');
  ellipse(g, 24, 46, 4, 3, 'A'); // hand resting on the knee
  // Bowed helm: visor lower, eyes dimmed to a single faint light.
  ellipse(g, 32, 24, 9, 8, 'a');
  for (let y = 0; y < 5; y++) rect(g, 31, 13 + y, 33, 13 + y, 'b');
  rect(g, 25, 27, 39, 28, 'v');
  put(g, 30, 27, 'c');
  put(g, 34, 27, 'c');
  shadeRight(g, 0, 63, 0, 63, 37);
  barnacles(g, [
    [15, 27],
    [45, 26],
    [26, 37],
    [38, 34],
    [25, 52],
  ]);
  kelp(g, 13, 34, 12, 1);
  kelp(g, 50, 34, 10, -1);
  outline(g);
  // The film, broken free: motes drifting upward, brighter the higher they rise.
  for (let k = 0; k < 26; k++) {
    const x = 6 + ((k * 23) % 52);
    const y = 4 + ((k * 37) % 40);
    if (g[y][x] === '.') put(g, x, y, y < 18 ? 'C' : rnd(x, y, 5) < 50 ? 'I' : 'i');
  }
  return g;
}

function render(frames) {
  const w = S * frames.length;
  const buf = Buffer.alloc(w * S * 4);
  frames.forEach((g, i) =>
    g.forEach((row, y) =>
      row.forEach((ch, x) => {
        if (ch === '.') return;
        const c = PALETTE[ch];
        if (!c) throw new Error(`frame ${i}: unknown palette char "${ch}"`);
        buf.set(c, (y * w + i * S + x) * 4);
      }),
    ),
  );
  return { w, h: S, buf };
}

function preview(img, k, bg = [24, 30, 46, 255]) {
  const W = img.w * k;
  const H = img.h * k;
  const out = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = (Math.floor(y / k) * img.w + Math.floor(x / k)) * 4;
      const c = img.buf[i + 3] ? img.buf.subarray(i, i + 4) : bg;
      out.set([c[0], c[1], c[2], 255], (y * W + x) * 4);
    }
  return encodePng(W, H, out);
}

const outDir = path.resolve(process.argv[2] ?? 'art-source/enemies/sentinel/generated/candidates');
const previewDir = path.join(outDir, 'previews');
fs.mkdirSync(previewDir, { recursive: true });

const sheet = render([standing(0), standing(1), standing(2), standing(3), kneeling()]);
const file = path.join(outDir, `sentinel_${VERSION}.png`);
writeFile(file, encodePng(sheet.w, sheet.h, sheet.buf));
writeFile(path.join(previewDir, `sentinel_${VERSION}_x4.png`), preview(sheet, 4));
console.log(`✓ ${path.relative(process.cwd(), file)} (${sheet.w}x${sheet.h})`);
