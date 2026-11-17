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

/** Unborn Cocoon (chapter 5): an upright fleshy pod on root-legs, an embryo glowing inside. */
function unbornCocoon(k) {
  const c = new Canvas();
  const flesh = ['#5a3a46', '#86566a', '#b07c90', '#d8a8b8', '#f0d0dc'];
  for (const [x, dx] of [
    [26, -4],
    [32, 0],
    [38, 4],
  ])
    c.line(x, 52, x + dx, 61, '#5a3a46');
  c.ellipse(32, 36, 12, 18, flesh);
  c.ellipse(32, 38, 5, 7, pulse(k) ? ['#ff6a9a', '#ffb4cc'] : ['#c83a6a', '#ff6a9a']);
  for (const [x0, y0, x1, y1] of [
    [24, 26, 28, 48],
    [40, 24, 36, 50],
    [30, 20, 26, 34],
  ])
    c.line(x0, y0, x1, y1, '#86566a');
  c.outline('#2a1420');
  return c;
}

/** Unborn Horror (chapter 5): a pale, too-new crawler on four thin limbs, all eyes. */
function unbornHorror(k) {
  const c = new Canvas();
  const skin = ['#6a4a56', '#9a7280', '#c8a2ae', '#ecccd4'];
  const step = k % 2;
  for (const [x, dir, s] of [
    [22, -1, 0],
    [27, -1, 1],
    [37, 1, 0],
    [42, 1, 1],
  ]) {
    const lift = s === step ? 1 : 0;
    c.line(x, 48, x + dir * 4, 54 - lift, '#6a4a56');
    c.line(x + dir * 4, 54 - lift, x + dir * 5, 61 - lift, '#6a4a56');
  }
  c.ellipse(32, 42, 14, 11, skin);
  for (const [x, y, r] of [
    [27, 40, 2.5],
    [36, 39, 3],
    [32, 46, 1.6],
    [41, 44, 1.6],
  ]) {
    c.ellipse(x, y, r, r, ['#f6f0f2']);
    c.set(x, y, '#2a0a14');
  }
  c.outline('#2a1420');
  return c;
}

/** Chronos's Gardener (chapter 5): a tall bandaged pruner holding open shears. */
function chronosGardener(k) {
  const c = new Canvas();
  const wrap = ['#8a8478', '#b4ae9e', '#d8d2c2', '#f2ecdc'];
  c.poly(
    [
      [24, 24],
      [40, 24],
      [42, 56],
      [22, 56],
    ],
    wrap,
  );
  for (let y = 26; y < 56; y += 4) c.line(23, y, 41, y + 1, '#8a8478');
  c.ellipse(32, 18, 7, 8, wrap);
  for (let y = 13; y < 25; y += 3) c.line(25, y, 39, y + 1, '#8a8478');
  c.set(34, 17, pulse(k) ? '#d0a8ff' : '#9a6ae0');
  c.set(35, 17, pulse(k) ? '#d0a8ff' : '#9a6ae0');
  c.line(26, 56, 26, 61, '#5a564c');
  c.line(37, 56, 37, 61, '#5a564c');
  // the shears, held out to the viewer's left
  const open = k % 2 ? 2 : 0;
  c.line(24, 34, 14, 30 - open, '#c8d0dc');
  c.line(24, 35, 14, 38 + open, '#c8d0dc');
  c.line(25, 34, 19, 32, '#646e80');
  c.outline();
  return c;
}

/** Origin Nullifier (chapter 6): a floating eye in a spiked steel ring. */
function originNullifier(k) {
  const c = new Canvas();
  const y = 32 + BOB[k];
  for (let a = 0; a < 8; a++) {
    const t = (a / 8) * Math.PI * 2 + k * 0.1;
    c.poly(
      [
        [32 + Math.cos(t - 0.15) * 15, y + Math.sin(t - 0.15) * 15],
        [32 + Math.cos(t) * 20, y + Math.sin(t) * 20],
        [32 + Math.cos(t + 0.15) * 15, y + Math.sin(t + 0.15) * 15],
      ],
      ['#4a5262', '#8a94a6'],
    );
  }
  c.ellipse(32, y, 15, 15, ['#3a4250', '#646e80', '#98a2b4', '#c8d0dc']);
  c.ellipse(32, y, 11, 11, ['#d8dce6', '#f6f8fc']);
  c.ellipse(
    32,
    y,
    6,
    6,
    pulse(k) ? ['#7a4ae0', '#b48cff', '#e0d0ff'] : ['#4a2aa0', '#7a4ae0', '#b48cff'],
  );
  c.ellipse(32, y, 2, 2, ['#0a0612']);
  c.set(29, y - 3, '#ffffff');
  c.outline();
  return c;
}

/** Archon Construct (chapter 6): a cream stone golem with a molten visor and heavy arms. */
function archonConstruct(k) {
  const c = new Canvas();
  const stone = ['#7a7060', '#a89c86', '#d0c6ae', '#eee6d2'];
  c.poly(
    [
      [22, 26],
      [42, 26],
      [44, 50],
      [20, 50],
    ],
    stone,
  );
  c.poly(
    [
      [26, 12],
      [38, 12],
      [39, 26],
      [25, 26],
    ],
    stone,
  );
  c.poly(
    [
      [27, 17],
      [37, 17],
      [37, 20],
      [27, 20],
    ],
    pulse(k) ? ['#ff9a3a', '#ffe08a'] : ['#e05a1a', '#ff9a3a'],
  );
  for (const x of [13, 45])
    c.poly(
      [
        [x, 26],
        [x + 7, 26],
        [x + 7, 48],
        [x, 48],
      ],
      stone,
    );
  c.poly(
    [
      [23, 50],
      [30, 50],
      [30, 61],
      [23, 61],
    ],
    stone,
  );
  c.poly(
    [
      [34, 50],
      [41, 50],
      [41, 61],
      [34, 61],
    ],
    stone,
  );
  c.poly(
    [
      [29, 32],
      [35, 32],
      [35, 38],
      [29, 38],
    ],
    ['#c8964a', '#ecc878'],
  );
  c.outline();
  return c;
}

/** Name Eater (chapter 7): a dark spiked orb that is mostly mouth. */
function nameEater(k) {
  const c = new Canvas();
  const y = 34 + BOB[k];
  for (let a = 0; a < 12; a++) {
    const t = (a / 12) * Math.PI * 2;
    c.poly(
      [
        [32 + Math.cos(t - 0.2) * 15, y + Math.sin(t - 0.2) * 15],
        [32 + Math.cos(t) * 19, y + Math.sin(t) * 19],
        [32 + Math.cos(t + 0.2) * 15, y + Math.sin(t + 0.2) * 15],
      ],
      ['#1e1230', '#34204e'],
    );
  }
  c.ellipse(32, y, 16, 16, ['#120a20', '#24163a', '#3a2858', '#56407e']);
  const gape = pulse(k) ? 5 : 3;
  c.ellipse(32, y + 3, 11, gape, ['#05020a']);
  for (let x = 22; x <= 42; x += 3) {
    c.set(x, y + 3 - gape + 1, '#f2ecdc');
    c.set(x + 1, y + 3 + gape - 1, '#f2ecdc');
  }
  c.set(27, y - 7, '#b48cff');
  c.set(37, y - 7, '#b48cff');
  c.outline();
  return c;
}

/** Erasure Moths (chapter 7): a small swarm of pale moths, each beat a different place. */
function erasureMoths(k) {
  const c = new Canvas();
  const spots = [
    [22, 28],
    [38, 24],
    [30, 36],
    [44, 38],
    [18, 44],
    [34, 48],
  ];
  spots.forEach(([x, y], i) => {
    const dx = Math.round(Math.sin(k * 1.6 + i) * 2);
    const dy = Math.round(Math.cos(k * 1.3 + i * 2) * 2);
    const open = (k + i) % 2;
    const px = x + dx;
    const py = y + dy;
    for (const s of [-1, 1]) {
      c.ellipse(px + s * (2 + open), py - 1, 2 + open, 2, ['#c8c4d8', '#f2f0fa'], { flat: true });
      c.set(px + s * (2 + open), py - 1, '#9a8ac0');
    }
    c.line(px, py - 2, px, py + 1, '#3a3050');
  });
  c.outline('#3a3050');
  return c;
}

/** Ink Hound (chapter 7): a black hound of spilled ink, violet eyes, drips under it. */
function inkHound(k) {
  const c = new Canvas();
  const ink = ['#06040a', '#120c1a', '#1e162c', '#2e2442'];
  const stride = k % 2 ? 2 : -2;
  for (const [x, s] of [
    [21, 1],
    [26, -1],
    [38, 1],
    [43, -1],
  ])
    c.poly(
      [
        [x - 2, 46],
        [x + 2, 46],
        [x + 1 + s * stride * 0.5, 61],
        [x - 1 + s * stride * 0.5, 61],
      ],
      ink,
    );
  c.ellipse(32, 42, 15, 7, ink);
  c.ellipse(17, 36, 7, 6, ink); // head
  c.poly(
    [
      [12, 38],
      [6, 41],
      [12, 42],
    ],
    ink,
  ); // snout
  c.poly(
    [
      [15, 30],
      [17, 25],
      [20, 31],
    ],
    ink,
  ); // ear
  c.poly(
    [
      [46, 40],
      [54, 34 + (k % 2)],
      [48, 43],
    ],
    ink,
  ); // tail
  c.set(15, 35, pulse(k) ? '#e0c8ff' : '#b48cff');
  c.set(16, 35, '#b48cff');
  for (const x of [24, 33, 40]) c.set(x, 50 + ((k + x) % 3), '#2e2442');
  c.outline('#3a2a5a');
  return c;
}

/** Assimilator (chapter 8): a grey fuzzy mimic; the sign over it shows the move it learned. */
function assimilator(k) {
  const c = new Canvas();
  const fur = ['#4a4c56', '#74767e', '#9ea0a8', '#c8cad0'];
  c.ellipse(32, 46, 14, 12, fur);
  for (let a = 0; a < 16; a++) {
    const t = (a / 16) * Math.PI * 2;
    c.set(32 + Math.cos(t) * 15, 46 + Math.sin(t) * 13, '#9ea0a8');
  }
  for (const x of [27, 36]) {
    c.ellipse(x, 44, 2.4, 3, ['#ffffff']);
    c.set(x, 45, '#120f17');
  }
  c.line(45, 46, 52, 38, '#74767e');
  c.line(26, 57, 26, 61, '#4a4c56');
  c.line(38, 57, 38, 61, '#4a4c56');
  c.outline();
  // the learned move: 0 and 3 the blade, 1 the dash arrow, 2 the skill spark
  const g = ['#b8862e', '#ecc878'];
  if (k === 1) {
    c.line(24, 26, 38, 26, g[1]);
    c.line(35, 23, 38, 26, g[1]);
    c.line(35, 29, 38, 26, g[1]);
  } else if (k === 2) {
    c.line(31, 18, 31, 32, g[1]);
    c.line(24, 25, 38, 25, g[1]);
    c.line(27, 21, 35, 29, g[0]);
    c.line(35, 21, 27, 29, g[0]);
  } else {
    c.line(26, 32, 37, 21, '#d0d6e0');
    c.line(25, 29, 29, 33, g[1]);
  }
  return c;
}

/** Phase Wraith (chapter 8): a robed spirit split down the middle between two moments. */
function phaseWraith(k) {
  const c = new Canvas();
  const y0 = 12 + BOB[k];
  c.poly(
    [
      [32, y0],
      [32, y0 + 46],
      [18, y0 + 46],
      [24, y0 + 12],
    ],
    ['#3a6a9a', '#5a92c4', '#86bce6'],
  );
  c.poly(
    [
      [32, y0],
      [40, y0 + 12],
      [46, y0 + 46],
      [32, y0 + 46],
    ],
    ['#4a4c56', '#74767e', '#9ea0a8'],
  );
  c.ellipse(32, y0 + 10, 5, 5, ['#0c0a12']);
  c.set(30, y0 + 10, '#ffe08a');
  c.set(34, y0 + 10, '#ffe08a');
  for (let y = y0 + 16; y < y0 + 46; y += 5)
    c.line(19 + (y - y0) / 8, y, 45 - (y - y0) / 8, y, '#2a3a5a');
  c.outline();
  if (k % 2) c.fade(0.85);
  return c;
}

/** Doom Bell (chapter 8): a bronze bell with a sleeping face; frames 0-3 show the tolls rung. */
function doomBell(k) {
  const c = new Canvas();
  const bronze = ['#5a3412', '#8c5a22', '#c48a3a', '#e8b866', '#f8dc9a'];
  c.poly(
    [
      [20, 12],
      [44, 12],
      [44, 15],
      [20, 15],
    ],
    ['#2a1a0a', '#4a3018'],
  );
  c.line(32, 15, 32, 19, '#4a3018');
  c.poly(
    [
      [32, 19],
      [42, 26],
      [46, 52],
      [50, 56],
      [14, 56],
      [18, 52],
      [22, 26],
    ],
    bronze,
    false,
  );
  for (const y of [32, 44]) c.line(20, y, 44, y, '#8c5a22');
  c.line(28, 40, 29, 40, '#2a1a0a');
  c.line(35, 40, 36, 40, '#2a1a0a');
  c.line(30, 48, 34, 48, '#2a1a0a');
  c.ellipse(32, 59, 3, 2, bronze); // clapper
  c.outline();
  for (let t = 0; t < k; t++)
    for (const s of [-1, 1])
      for (let y = 30; y <= 50; y++)
        c.set(
          32 + s * (20 + t * 3) + Math.round(Math.abs(y - 40) / 4) * -s,
          y,
          t === k - 1 ? '#fff4c8' : '#e8b866',
        );
  return c;
}

/** Entropy Specter (chapter 9): a stacked violet shroud around a cerulean core, sparks shedding. */
function entropySpecter(k) {
  const c = new Canvas();
  const y0 = 14 + BOB[k];
  const shroud = ['#1e1638', '#34285a', '#4e3e82', '#6e5aa8'];
  for (let i = 0; i < 4; i++) {
    const w = 8 + i * 3;
    c.poly(
      [
        [32 - w, y0 + 10 + i * 9],
        [32 + w, y0 + 10 + i * 9],
        [32 + w + 2, y0 + 20 + i * 9],
        [32 - w - 2, y0 + 20 + i * 9],
      ],
      shroud,
    );
  }
  c.ellipse(32, y0 + 7, 7, 7, shroud);
  c.set(30, y0 + 7, '#e8e0ff');
  c.set(34, y0 + 7, '#e8e0ff');
  c.ellipse(32, y0 + 27, 4, 4, pulse(k) ? ['#4ae0ff', '#e6f9ff'] : ['#00a8d8', '#4ae0ff']);
  c.outline();
  for (const [x, y] of [
    [16, 30],
    [48, 26],
    [14, 46],
    [50, 44],
    [22, 54],
    [42, 56],
  ])
    c.set(x, y + ((k + x) % 3), (x + k) % 2 ? '#4ae0ff' : '#b48cff');
  return c;
}

/** Chronal Juggernaut (chapter 9): a great rolling gear-wheel with a violet eye at its hub. */
function chronalJuggernaut(k) {
  const c = new Canvas();
  const y = 40;
  const rot = (k * Math.PI) / 16;
  for (let a = 0; a < 12; a++) {
    const t = (a / 12) * Math.PI * 2 + rot;
    const [cx, cy] = [32 + Math.cos(t) * 19, y + Math.sin(t) * 19];
    c.ellipse(cx, cy, 3, 3, ['#7a5222', '#b88432']);
  }
  c.ellipse(32, y, 19, 19, ['#5a3a14', '#8c6428', '#c8964a', '#ecc878']);
  c.ellipse(32, y, 12, 12, ['#3a2410', '#5a3a14']);
  for (let a = 0; a < 6; a++) {
    const t = (a / 6) * Math.PI * 2 + rot;
    c.line(32, y, 32 + Math.cos(t) * 11, y + Math.sin(t) * 11, '#8c6428');
  }
  c.ellipse(32, y, 5, 5, pulse(k) ? ['#7a4ae0', '#e0d0ff'] : ['#4a2aa0', '#b48cff']);
  c.set(32, y, '#0a0612');
  c.outline();
  return c;
}

/** Paradox Weaver (chapter 9): a four-armed star of violet threads around a crystal heart. */
function paradoxWeaver(k) {
  const c = new Canvas();
  const y = 34 + BOB[k];
  const thread = ['#2a1a5a', '#4a32a0', '#7a5ae0', '#b49aff'];
  for (let a = 0; a < 4; a++) {
    const t = (a / 4) * Math.PI * 2 + Math.PI / 4 + (k % 2 ? 0.08 : 0);
    c.poly(
      [
        [32 + Math.cos(t - 0.5) * 6, y + Math.sin(t - 0.5) * 6],
        [32 + Math.cos(t) * 21, y + Math.sin(t) * 21],
        [32 + Math.cos(t + 0.5) * 6, y + Math.sin(t + 0.5) * 6],
      ],
      thread,
    );
  }
  c.poly(
    [
      [32, y - 7],
      [38, y],
      [32, y + 7],
      [26, y],
    ],
    pulse(k) ? ['#c8d8ff', '#ffffff'] : ['#8aa8ff', '#c8d8ff'],
  );
  c.outline('#120a2a');
  return c;
}

export const MONSTERS = {
  shade_float: { frames: 4, draw: shade },
  drifter_float: { frames: 4, draw: drifter },
  memory_wraith: { frames: 4, draw: memoryWraith },
  thought_eater: { frames: 4, draw: thoughtEater },
  branch_phantom: { frames: 4, draw: branchPhantom },
  paradox_crystal: { frames: 4, draw: paradoxCrystal },
  unborn_cocoon: { frames: 4, draw: unbornCocoon },
  unborn_horror: { frames: 4, draw: unbornHorror },
  chronos_gardener: { frames: 4, draw: chronosGardener },
  origin_nullifier: { frames: 4, draw: originNullifier },
  archon_construct: { frames: 4, draw: archonConstruct },
  name_eater: { frames: 4, draw: nameEater },
  erasure_moths: { frames: 4, draw: erasureMoths },
  ink_hound: { frames: 4, draw: inkHound },
  assimilator: { frames: 4, draw: assimilator },
  phase_wraith: { frames: 4, draw: phaseWraith },
  doom_bell: { frames: 4, draw: doomBell },
  entropy_specter: { frames: 4, draw: entropySpecter },
  chronal_juggernaut: { frames: 4, draw: chronalJuggernaut },
  paradox_weaver: { frames: 4, draw: paradoxWeaver },
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
