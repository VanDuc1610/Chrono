/**
 * CHRONO – the non-human field monsters at the LPC scale (Pipeline B, code-authored).
 *
 * Owner, 2026-11-18: the 32 px monsters were shown 1.5x and looked coarse beside the LPC people;
 * they are redrawn here at the people's pixel size in 64x64 frames (4-frame idles, the old frame
 * numbers). Every pixel is placed by the shapes below; no external art. Shapes are lit from the
 * upper left along a 4-5 step ramp and outlined in near-black violet, as the LPC sheets are.
 * Creatures that walk stand with their lowest pixels on y = 61; floating ones hover above it and
 * bob, so the contact shadow (drawn by the game at the feet line) sits under them.
 *
 * Output: art-source/monsters/candidates/<name>.png (+ _x4 previews). `--install` copies them to
 * public/assets/enemies/v2/ (the files PreloadScene loads).
 * Usage: node scripts/author-monsters.js [--install]
 */
import fs from 'fs';
import path from 'path';
import { encodePng, preview } from './pixel-art/pixel.js';

const F = 64;
const OUTLINE = '#120f17';
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/** A 64x64 RGBA canvas with a few drawing helpers. */
class Canvas {
  constructor() {
    this.px = Buffer.alloc(F * F * 4);
  }
  set(x, y, c, a = 255) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= F || y >= F || !c) return;
    this.px.set([...hex(c), a], (y * F + x) * 4);
  }
  get(x, y) {
    if (x < 0 || y < 0 || x >= F || y >= F) return 0;
    return this.px[(y * F + x) * 4 + 3];
  }
  /** Filled ellipse shaded along `ramp` (dark..light), lit from the upper left. */
  ellipse(cx, cy, rx, ry, ramp, { light = [-0.55, -0.8], flat = false } = {}) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        const d = dx * dx + dy * dy;
        if (d > 1) continue;
        const lit = flat ? 0.5 : 0.5 + 0.5 * (dx * light[0] + dy * light[1]) - 0.25 * d;
        this.set(x, y, ramp[Math.max(0, Math.min(ramp.length - 1, Math.floor(lit * ramp.length)))]);
      }
  }
  /** Filled polygon (even-odd), shaded by height between y0 and y1 along `ramp` (light at top). */
  poly(pts, ramp, vertical = true) {
    const ys = pts.map((p) => p[1]);
    const xs = pts.map((p) => p[0]);
    const [y0, y1] = [Math.min(...ys), Math.max(...ys)];
    const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++)
      for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) {
        let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const [xi, yi] = pts[i];
          const [xj, yj] = pts[j];
          if (
            yi > y + 0.5 !== yj > y + 0.5 &&
            x + 0.5 < ((xj - xi) * (y + 0.5 - yi)) / (yj - yi) + xi
          )
            inside = !inside;
        }
        if (!inside) continue;
        const t = vertical
          ? 1 - (y - y0) / Math.max(1, y1 - y0)
          : 1 - (x - x0) / Math.max(1, x1 - x0);
        this.set(x, y, ramp[Math.max(0, Math.min(ramp.length - 1, Math.floor(t * ramp.length)))]);
      }
  }
  line(x0, y0, x1, y1, c) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) this.set(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, c);
  }
  /** A 1 px outline on every transparent pixel touching the shape. */
  outline(c = OUTLINE) {
    const mark = [];
    for (let y = 0; y < F; y++)
      for (let x = 0; x < F; x++) {
        if (this.get(x, y)) continue;
        if (this.get(x + 1, y) || this.get(x - 1, y) || this.get(x, y + 1) || this.get(x, y - 1))
          mark.push([x, y]);
      }
    for (const [x, y] of mark) this.set(x, y, c);
  }
  /** Copies `other` on top (opaque pixels only). */
  over(other) {
    for (let i = 0; i < this.px.length; i += 4)
      if (other.px[i + 3]) other.px.copy(this.px, i, i, i + 4);
  }
  /** Scales every alpha by k (spirits). */
  fade(k) {
    for (let i = 3; i < this.px.length; i += 4) this.px[i] = Math.round(this.px[i] * k);
  }
  shifted(dx, dy) {
    const out = new Canvas();
    for (let y = 0; y < F; y++)
      for (let x = 0; x < F; x++) {
        const i = (y * F + x) * 4;
        if (!this.px[i + 3]) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= F || ny >= F) continue;
        this.px.copy(out.px, (ny * F + nx) * 4, i, i + 4);
      }
    return out;
  }
}

// ------------------------------------------------------------------ the monsters
// Each draws frame k (0-3) and returns a Canvas. `bob` = [0, -1, -2, -1] for floaters.
const BOB = [0, -1, -2, -1];
const pulse = (k) => k === 1 || k === 2;

/** Temporal Shade (chapter 0): a ragged crimson-black hood, cyan eyes, a red core, raking claws. */
function shade(k) {
  const c = new Canvas();
  const y0 = 12 + BOB[k];
  const cloak = ['#1a0610', '#2e0c1e', '#46142e', '#5e2040'];
  c.poly(
    [
      [32, y0],
      [41, y0 + 6],
      [44, y0 + 18],
      [47, y0 + 34],
      [43, y0 + 31],
      [40, y0 + 40],
      [36, y0 + 34],
      [32, y0 + 43],
      [28, y0 + 34],
      [24, y0 + 40],
      [21, y0 + 31],
      [17, y0 + 34],
      [20, y0 + 18],
      [23, y0 + 6],
    ],
    cloak,
  );
  c.ellipse(32, y0 + 9, 6, 6, ['#06020a', '#0e0614']); // the hood's dark
  const eye = pulse(k) ? '#a6f0ff' : '#00c8ff';
  for (const x of [29, 34]) {
    c.set(x, y0 + 9, eye);
    c.set(x + 1, y0 + 9, eye);
  }
  c.ellipse(32, y0 + 22, 3, 3, pulse(k) ? ['#ff3a5a', '#ff8aa0'] : ['#c01838', '#ff3a5a']);
  // claws reaching out either side
  for (const s of [-1, 1]) {
    c.line(32 + s * 12, y0 + 20, 32 + s * 18, y0 + 26, '#46142e');
    for (let t = 0; t < 3; t++)
      c.line(32 + s * 18, y0 + 26, 32 + s * (19 + t), y0 + 29 + t, '#ff5a8a');
  }
  c.outline();
  return c;
}

/** Drowned Drifter (chapter 1): a translucent sea-glass ghost, kelp trailing, a green heart. */
function drifter(k) {
  const c = new Canvas();
  const y0 = 10 + BOB[k];
  const glass = ['#1e5a6a', '#2e8296', '#4ab0c4', '#86d8e6', '#c4f0f6'];
  c.ellipse(32, y0 + 10, 9, 9, glass); // head
  c.poly(
    [
      [22, y0 + 14],
      [42, y0 + 14],
      [45, y0 + 34],
      [41, y0 + 44],
      [37, y0 + 38],
      [32, y0 + 46],
      [27, y0 + 38],
      [23, y0 + 44],
      [19, y0 + 34],
    ],
    glass,
  );
  for (const x of [28, 35]) {
    c.set(x, y0 + 10, '#0e2a32');
    c.set(x + 1, y0 + 10, '#0e2a32');
  }
  c.ellipse(32, y0 + 25, 3, 4, pulse(k) ? ['#4ae08a', '#b4ffc8'] : ['#2aa860', '#4ae08a']);
  // kelp strands
  for (const [x, len] of [
    [24, 9],
    [30, 7],
    [37, 10],
  ])
    for (let i = 0; i < len; i++)
      c.set(x + Math.round(Math.sin((i + k) / 2) * 1.5), y0 + 36 + i, '#2e6a3a');
  c.outline('#0a2a32');
  c.fade(0.92);
  return c;
}

/** Memory Wraith (chapter 3): a violet hood over a spiralling tail, cyan eyes, motes of memory. */
function memoryWraith(k) {
  const c = new Canvas();
  const y0 = 12 + BOB[k];
  const violet = ['#2a1a46', '#432a6e', '#64449a', '#8a6ac4', '#b49ae6'];
  c.ellipse(32, y0 + 10, 9, 10, violet);
  c.ellipse(32, y0 + 12, 6, 6, ['#0c0818', '#160e28']);
  for (const x of [29, 34]) {
    c.set(x, y0 + 12, '#4ae0ff');
    c.set(x + 1, y0 + 12, '#4ae0ff');
  }
  // spiralling tail
  for (let i = 0; i < 26; i++) {
    const t = i / 26;
    const r = 9 * (1 - t) + 1;
    const x = 32 + Math.sin(t * 7 + k * 0.8) * 4 * t;
    const y = y0 + 18 + i;
    c.ellipse(x, y, r, 1.2, violet, { flat: true });
  }
  c.outline();
  for (const [x, y] of [
    [18, 18],
    [46, 24],
    [20, 40],
    [45, 42],
  ])
    c.set(x, y + ((k + x) % 3) - 1, (k + y) % 2 ? '#e6f9ff' : '#b48cff');
  return c;
}

/** Thought Eater (chapter 3): a low violet beetle with crystal thoughts growing from its back. */
function thoughtEater(k) {
  const c = new Canvas();
  const shell = ['#1e1230', '#34204e', '#4e3274', '#6c4c9a'];
  const sway = k === 1 || k === 2 ? 1 : 0;
  // legs
  for (const [x, dir] of [
    [22, -1],
    [28, -1],
    [36, 1],
    [42, 1],
  ]) {
    c.line(x, 50, x + dir * 4, 56 - sway, '#24163a');
    c.line(x + dir * 4, 56 - sway, x + dir * 6, 61, '#24163a');
  }
  c.ellipse(32, 47, 15, 9, shell);
  c.ellipse(19, 50, 6, 5, shell); // head
  c.set(16, 49, '#ff4a5a');
  c.set(18, 49, '#ff4a5a');
  c.line(14, 52, 11, 54, '#c8b4ff'); // mandibles
  c.line(16, 54, 13, 57, '#c8b4ff');
  // crystal spines
  for (const [x, h] of [
    [26, 12],
    [31, 16],
    [36, 13],
    [41, 9],
  ]) {
    const glow = ['#5a3c9e', '#8a6ad8', '#c4b0ff', '#ece4ff'];
    c.poly(
      [
        [x - 2, 42],
        [x, 42 - h - (pulse(k) ? 1 : 0)],
        [x + 2, 42],
      ],
      glow,
    );
  }
  c.outline();
  return c;
}

/** Branch Phantom (chapter 2-3): a lavender spirit with its faded twin from the other branch. */
function branchPhantom(k) {
  const c = new Canvas();
  const body = (cx, y0, ramp) => {
    const s = new Canvas();
    s.ellipse(cx, y0 + 8, 7, 8, ramp);
    s.poly(
      [
        [cx - 8, y0 + 12],
        [cx + 8, y0 + 12],
        [cx + 9, y0 + 32],
        [cx + 4, y0 + 28],
        [cx, y0 + 34],
        [cx - 4, y0 + 28],
        [cx - 9, y0 + 32],
      ],
      ramp,
    );
    for (const x of [cx - 3, cx + 2]) s.set(x, y0 + 8, '#2a1a46');
    s.outline('#2a1a46');
    return s;
  };
  const twin = body(39 + (k % 2), 16 + BOB[(k + 2) % 4], [
    '#8a7ab4',
    '#b0a2d8',
    '#d4caf0',
    '#eee8fc',
  ]);
  twin.fade(0.5);
  c.over(twin);
  c.over(body(27, 18 + BOB[k], ['#4e3a86', '#7058b4', '#9a84dc', '#c4b4f4']));
  return c;
}

/** Paradox Crystal (chapter 5): a floating faceted crystal, shards orbiting it. */
function paradoxCrystal(k) {
  const c = new Canvas();
  const y0 = 12 + BOB[k];
  const left = ['#2a3a8a', '#3c58c0', '#5a7ee8'];
  const right = ['#1a2460', '#26388e', '#3a52b8'];
  c.poly(
    [
      [32, y0],
      [19, y0 + 19],
      [32, y0 + 40],
    ],
    left,
    false,
  );
  c.poly(
    [
      [32, y0],
      [45, y0 + 19],
      [32, y0 + 40],
    ],
    right,
    false,
  );
  c.line(32, y0 + 1, 32, y0 + 39, '#a8c4ff');
  c.line(23, y0 + 16, 31, y0 + 4, '#e6f0ff');
  c.outline('#0c1030');
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + k * (Math.PI / 6);
    const x = 32 + Math.cos(a) * 18;
    const y = y0 + 20 + Math.sin(a) * 7;
    c.set(x, y, '#c4d8ff');
    c.set(x + 1, y, '#5a7ee8');
    c.set(x, y + 1, '#3c58c0');
  }
  return c;
}

export const MONSTERS = {
  shade_float: { frames: 4, draw: shade },
  drifter_float: { frames: 4, draw: drifter },
  memory_wraith: { frames: 4, draw: memoryWraith },
  thought_eater: { frames: 4, draw: thoughtEater },
  branch_phantom: { frames: 4, draw: branchPhantom },
  paradox_crystal: { frames: 4, draw: paradoxCrystal },
};

// ------------------------------------------------------------------ output
const install = process.argv.includes('--install');
const outDir = 'art-source/monsters/candidates';
fs.mkdirSync(outDir, { recursive: true });
if (install) fs.mkdirSync('public/assets/enemies/v2', { recursive: true });
for (const [name, m] of Object.entries(MONSTERS)) {
  const w = m.frames * F;
  const buf = Buffer.alloc(w * F * 4);
  for (let k = 0; k < m.frames; k++) {
    const fr = m.draw(k).px;
    for (let y = 0; y < F; y++) fr.copy(buf, (y * w + k * F) * 4, y * F * 4, (y + 1) * F * 4);
  }
  const png = encodePng(w, F, buf);
  fs.writeFileSync(path.join(outDir, `${name}.png`), png);
  fs.writeFileSync(path.join(outDir, `${name}_x4.png`), preview({ w, h: F, buf }, 4));
  if (install) fs.writeFileSync(`public/assets/enemies/v2/${name}.png`, png);
  console.log(`${name}.png (${w}x${F})`);
}
