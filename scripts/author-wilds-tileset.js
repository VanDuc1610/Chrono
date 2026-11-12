/**
 * CHRONO – code-authored "wilds" tileset for the Prologue v2 (Pipeline B, AGENTS.md §5):
 * the Forgotten Forest and the Old Lighthouse headland (PROLOGUE_V2_DESIGN.md §2, §7).
 *
 * Deterministic pixel rules only — no image model, no external reference. Output goes to
 * art-source/environment/wilds/generated/candidates/ ONLY; owner approval is required before
 * anything is copied to public/assets/ (AGENTS.md §6).
 *
 * 8 × 5 tiles of 32 px (256 × 160); indices in scripts/wilds-layout.js.
 *   0-15 ground (walkable, opaque) · 16-39 walls layer (collide; props on transparent bg)
 *
 * Usage: node scripts/author-wilds-tileset.js [outDir]
 */
import path from 'path';
import fs from 'fs';
import { hex, encodePng, writeFile } from './pixel-art/pixel.js';
import {
  T,
  rnd,
  tile,
  put,
  rect,
  ellipse,
  speckle,
  outline,
  over,
  rasterTiles,
  scaledPng,
  renderLayout,
} from './pixel-art/tile-kit.js';
import { forestLayout, lighthouseLayout } from './wilds-layout.js';

// v2 = v1 (approved ENV_WILDS_001, tiles 0-39 unchanged) + Chapter 1 props (40-42).
const VERSION = 'v2';
const COLS = 8;

/** Cold, desaturated wilds: dusk forest greens, violet-ash fracture, basalt and a night sea. */
const PALETTE = {
  O: hex('#0b0d10'), // outline
  l: hex('#2c2a22'), // loam
  L: hex('#3a372b'), // loam light
  k: hex('#1e1c17'), // loam dark
  y: hex('#4a4a2e'), // dry leaf
  m: hex('#2f4a32'), // moss
  M: hex('#3f6040'), // moss light
  e: hex('#5a4c38'), // trail
  E: hex('#463a2a'), // trail shade
  d: hex('#23271f'), // mud
  D: hex('#33392c'), // mud sheen
  f: hex('#8a96a0'), // mist
  j: hex('#4e5658'), // faint mist
  F: hex('#b8c2c8'), // mist light
  v: hex('#7a5cd6'), // violet fracture light
  V: hex('#4a3a7a'), // violet deep
  a: hex('#8a8494'), // ash grey
  A: hex('#5e5a66'), // ash dark
  r: hex('#4a3a2a'), // root / bark
  R: hex('#33281c'), // bark dark
  b: hex('#3a3f46'), // basalt
  B: hex('#2a2e34'), // basalt dark
  h: hex('#555c66'), // basalt highlight
  n: hex('#5a6a3a'), // lichen
  g: hex('#6a7a4a'), // salt grass
  G: hex('#4a5a34'), // salt grass shade
  s: hex('#1d3a52'), // night sea
  S: hex('#142a3e'), // deep sea
  w: hex('#2e5a7a'), // wave
  W: hex('#c8dce6'), // foam
  c: hex('#00c8ff'), // chronal cyan
  C: hex('#88edff'), // luminous apex
  '*': hex('#e6f9ff'), // white light
  t: hex('#1f3a24'), // canopy dark
  T: hex('#2c5232'), // canopy
  u: hex('#3e6e42'), // canopy light
  x: hex('#0f1a12'), // canopy shadow
  p: hex('#6a6a6e'), // flagstone
  P: hex('#4a4a50'), // flagstone dark
  q: hex('#16181c'), // lighthouse black stone
  Q: hex('#26292f'), // lighthouse stone light
  o: hex('#b88a3e'), // brass
  $: hex('#8c6628'), // brass dark
  i: hex('#d8e8f0'), // frozen wave glass
  I: hex('#9ab8c8'), // frozen wave shade
  z: hex('#7a6a58'), // rusted iron
};

// ------------------------------------------------------------------ ground 0-15
function loam(seed = 1) {
  const t = tile('l');
  speckle(t, seed, [
    ['L', 10],
    ['k', 10],
    ['y', 4],
  ]);
  for (const [x, y] of [
    [6, 9],
    [21, 5],
    [14, 24],
  ]) {
    rect(t, x, y, x + 2, y, 'y');
    put(t, x + 1, y + 1, 'y');
  }
  return t;
}
function moss() {
  const t = loam(2);
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const blob = Math.sin(x / 5) + Math.cos(y / 4) + Math.sin((x + y) / 7);
      if (blob > 0.6) put(t, x, y, rnd(x, y, 3) < 25 ? 'M' : 'm');
    }
  return t;
}
function trail() {
  const t = tile('e');
  speckle(t, 4, [
    ['E', 16],
    ['k', 4],
    ['L', 6],
  ]);
  return t;
}
function mud() {
  const t = tile('d');
  speckle(t, 5, [
    ['D', 14],
    ['k', 10],
  ]);
  for (let x = 3; x < 12; x++) put(t, x, 20, 'D');
  for (let x = 18; x < 26; x++) put(t, x, 9, 'D');
  return t;
}
function mist() {
  const t = loam(6);
  // Soft low-lying fog patches.
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const v = Math.sin(x / 7 + y / 13) * Math.cos(y / 6 - x / 17);
      if (v > 0.4 && rnd(x, y, 7) < 45) put(t, x, y, v > 0.8 && rnd(x, y, 8) < 25 ? 'f' : 'j');
    }
  return t;
}
function fracture() {
  const t = loam(10);
  speckle(t, 10, [['a', 10]]);
  const cracks = [
    [
      [3, 6],
      [10, 12],
      [14, 11],
      [20, 18],
      [28, 21],
    ],
    [
      [14, 11],
      [16, 4],
    ],
    [
      [20, 18],
      [18, 28],
    ],
  ];
  for (const pts of cracks)
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let k = 0; k <= n; k++) {
        const x = Math.round(x0 + ((x1 - x0) * k) / n);
        const y = Math.round(y0 + ((y1 - y0) * k) / n);
        put(t, x, y, 'v');
        put(t, x + 1, y, 'V');
        put(t, x, y - 1, 'A');
      }
    }
  put(t, 14, 11, 'C');
  return t;
}
function roots() {
  const t = loam(11);
  for (const [y0, amp, ph] of [
    [8, 3, 0],
    [22, 2, 2],
  ])
    for (let x = 0; x < T; x++) {
      const y = Math.round(y0 + Math.sin(x / 5 + ph) * amp);
      put(t, x, y, 'r');
      put(t, x, y + 1, 'R');
      put(t, x, y - 1, 'r');
    }
  return t;
}
function basalt(seed = 12) {
  const t = tile('b');
  // Hexagonal column tops.
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const row = Math.floor(y / 10);
      const xx = (x + (row % 2) * 6) % 12;
      const yy = y % 10;
      if (yy === 0 || xx === 0 || (yy < 3 && (xx < 3 - yy || xx > 8 + yy))) put(t, x, y, 'B');
      else if (yy === 1 || xx === 1) put(t, x, y, 'h');
    }
  speckle(t, seed, [['B', 5]], ['b']);
  return t;
}
function basaltLichen() {
  const t = basalt(13);
  for (const [x, y, r] of [
    [8, 9, 3],
    [22, 22, 4],
    [25, 6, 2],
  ])
    for (let yy = -r; yy <= r; yy++)
      for (let xx = -r; xx <= r; xx++)
        if (xx * xx + yy * yy <= r * r && rnd(x + xx, y + yy, 14) < 65) put(t, x + xx, y + yy, 'n');
  return t;
}
function saltGrass() {
  const t = basalt(15);
  for (const [x, y] of [
    [6, 14],
    [17, 8],
    [24, 24],
    [11, 27],
  ])
    for (let k = 0; k < 4; k++) {
      const h = 3 + ((x + k) % 3);
      for (let j = 0; j < h; j++)
        put(t, x + k - 1 + (j > 2 ? (k % 2 ? 1 : -1) : 0), y - j, j === h - 1 ? 'g' : 'G');
    }
  return t;
}
function steps() {
  const t = tile('b');
  for (let y = 0; y < T; y++) {
    const s = y % 8;
    rect(t, 0, y, T - 1, y, s === 0 ? 'h' : s === 7 ? 'B' : 'b');
  }
  rect(t, 0, 0, 2, T - 1, 'B');
  rect(t, 29, 0, T - 1, T - 1, 'B');
  return t;
}
function flagstone() {
  const t = tile('p');
  speckle(t, 16, [['P', 12]]);
  for (let y = 0; y < T; y++) {
    if (y % 16 === 15) rect(t, 0, y, T - 1, y, 'B');
    const off = Math.floor(y / 16) % 2 ? 8 : 0;
    for (let x = 0; x < T; x++) if ((x + off) % 16 === 15 && y % 16 !== 15) put(t, x, y, 'B');
  }
  return t;
}
function tidePool() {
  const t = basalt(17);
  ellipse(t, 15, 16, 9, 6, 'B');
  ellipse(t, 15, 16, 8, 5, 's');
  ellipse(t, 13, 14, 3, 1.5, 'w');
  put(t, 18, 17, 'C');
  return t;
}
function foamRock() {
  const t = basalt(18);
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) if (rnd(x, y, 19) < (x < 6 || x > 25 ? 55 : 6)) put(t, x, y, 'W');
  return t;
}
function hatch() {
  const t = loam(20);
  ellipse(t, 16, 16, 13, 11, 'B');
  ellipse(t, 16, 16, 12, 10, 'b');
  ellipse(t, 16, 16, 8, 6.5, 'B');
  ellipse(t, 16, 16, 7, 5.5, 'h');
  // A six-armed rune — the six Authorities — dimly lit.
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    for (let r = 2; r < 6; r++)
      put(t, Math.round(16 + Math.cos(a) * r), Math.round(16 + Math.sin(a) * r * 0.8), 'c');
  }
  put(t, 16, 16, 'C');
  return t;
}
function lightFloor() {
  const t = flagstone();
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const d = Math.abs(x - 15.5) / 16 + y / 40;
      if (rnd(x, y, 21) < 60 - d * 70) put(t, x, y, d < 0.35 ? '*' : 'C');
    }
  return t;
}

// ------------------------------------------------------------------ walls 16-28
function sea(seed = 22) {
  const t = tile('s');
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      if (y % 8 === 3 && (x + y * 2) % 13 < 5) put(t, x, y, 'w');
      else if (y % 8 === 7 && (x + y) % 11 < 4) put(t, x, y, 'S');
    }
  speckle(t, seed, [['S', 6]], ['s']);
  return t;
}
function cliff() {
  const t = tile('B');
  for (let x = 0; x < T; x++) {
    if (x % 6 === 0) rect(t, x, 0, x, T - 1, 'q');
    else if (x % 6 === 1) rect(t, x, 0, x, 20, 'b');
  }
  rect(t, 0, 0, T - 1, 2, 'h');
  for (let y = 22; y < T; y++)
    for (let x = 0; x < T; x++) if (rnd(x, y, 23) < (y - 21) * 9) put(t, x, y, 'W');
  return t;
}
function basaltColumns() {
  const t = tile('b');
  for (let x = 0; x < T; x++) {
    const c = x % 8;
    rect(t, x, 0, x, T - 1, c === 0 ? 'B' : c === 1 ? 'h' : c === 7 ? 'B' : 'b');
  }
  for (let x = 0; x < T; x += 8)
    rect(t, x + 1, 2 + (x % 16 ? 3 : 0), x + 6, 2 + (x % 16 ? 3 : 0), 'h');
  rect(t, 0, 28, T - 1, T - 1, 'q');
  return t;
}
function canopy(seed = 24) {
  const t = tile('t');
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const v = Math.sin(x / 3.2 + seed) + Math.cos(y / 2.7) + Math.sin((x - y) / 4);
      put(t, x, y, v > 1.4 ? 'u' : v > 0.3 ? 'T' : v < -1.6 ? 'x' : 't');
    }
  return t;
}
function mangrove() {
  const t = tile();
  // Stilt roots arching out from a short trunk under a round dark crown.
  rect(t, 14, 12, 18, 21, 'r');
  rect(t, 17, 12, 18, 21, 'R');
  for (const x1 of [3, 9, 23, 29])
    for (let k = 0; k <= 12; k++) {
      const x = Math.round(16 + ((x1 - 16) * k) / 12);
      const y = Math.round(19 + k * 0.9 - Math.sin((k / 12) * Math.PI) * 3);
      put(t, x, y, 'r');
      put(t, x, y + 1, 'R');
    }
  ellipse(t, 16, 9, 13, 8.5, 'T');
  speckle(
    t,
    25,
    [
      ['u', 16],
      ['t', 26],
    ],
    ['T'],
  );
  for (let x = 6; x < 27; x++) if (t[16][x] !== '.') put(t, x, 17, 'x');
  return outline(t);
}
function elderTree() {
  const t = tile();
  rect(t, 8, 0, 23, T - 1, 'r');
  for (let y = 0; y < T; y++) {
    put(t, 8 + (y % 5 === 0 ? 1 : 0), y, 'R');
    put(t, 23, y, 'R');
    if (y % 6 === 2) rect(t, 12, y, 16, y, 'R');
  }
  ellipse(t, 15, 15, 3, 4, 'R');
  ellipse(t, 15, 15, 1.5, 2.5, 'k');
  for (const x of [5, 6, 25, 26]) rect(t, x, 26, x, T - 1, 'r');
  return outline(t);
}
function fallenLog() {
  const t = tile();
  rect(t, 2, 14, 29, 24, 'r');
  rect(t, 2, 14, 29, 15, 'L');
  rect(t, 2, 22, 29, 24, 'R');
  ellipse(t, 29, 19, 3, 5, 'y');
  ellipse(t, 29, 19, 1.5, 3, 'e');
  for (const x of [8, 15, 21]) rect(t, x, 16, x + 2, 17, 'm');
  return outline(t);
}
function thicket() {
  const t = tile();
  for (const [x, y, r] of [
    [9, 18, 8],
    [21, 17, 8],
    [15, 11, 7],
    [15, 23, 7],
  ])
    ellipse(t, x, y, r, r * 0.8, 'T');
  speckle(
    t,
    26,
    [
      ['u', 14],
      ['t', 22],
    ],
    ['T'],
  );
  return outline(t);
}
function ferns() {
  const t = tile();
  for (const [bx, a0] of [
    [10, -2.4],
    [16, -1.6],
    [22, -0.8],
    [13, -2.0],
    [19, -1.1],
  ])
    for (let r = 0; r < 13; r++) {
      const x = Math.round(bx + Math.cos(a0) * r);
      const y = Math.round(28 + Math.sin(a0) * r + (r * r) / 22);
      put(t, x, y, r % 3 ? 'M' : 'm');
      put(t, x + 1, y, 'm');
    }
  return outline(t);
}
function monolith() {
  const t = tile();
  rect(t, 10, 3, 21, 28, 'b');
  rect(t, 10, 3, 11, 28, 'h');
  rect(t, 20, 3, 21, 28, 'B');
  rect(t, 11, 1, 20, 2, 'b');
  // Six worn marks; one is scraped away entirely.
  for (let k = 0; k < 6; k++) {
    const y = 6 + k * 3.5;
    if (k === 3) rect(t, 13, Math.round(y), 18, Math.round(y), 'a');
    else rect(t, 14, Math.round(y), 17, Math.round(y), k % 2 ? 'c' : 'B');
  }
  ellipse(t, 16, 29, 9, 2, 'm');
  return outline(t);
}
function crevice() {
  const t = tile();
  ellipse(t, 16, 18, 14, 12, 'b');
  ellipse(t, 13, 14, 6, 5, 'h');
  for (let y = 6; y < 30; y++) {
    const x = Math.round(16 + Math.sin(y / 3) * 2);
    rect(t, x - 1, y, x + 1, y, 'B');
    put(t, x, y, y > 14 && y < 22 ? 'c' : 'k');
  }
  // The Minor Chrono Shard wedged in the crack.
  rect(t, 15, 16, 17, 20, 'C');
  put(t, 16, 15, '*');
  return outline(t);
}
function ashCrystals() {
  const t = tile();
  for (const [x, w, h] of [
    [8, 3, 12],
    [13, 4, 20],
    [19, 3, 15],
    [23, 2, 9],
  ]) {
    for (let y = 0; y < h; y++) {
      const half = Math.max(0, Math.round((w * (h - y)) / h));
      rect(t, x - half, 29 - y, x + half, 29 - y, y > h - 3 ? 'C' : 'v');
      put(t, x + half, 29 - y, 'V');
    }
  }
  ellipse(t, 15, 29, 11, 2, 'a');
  return outline(t);
}
function erasedTree() {
  const t = tile();
  rect(t, 14, 6, 17, T - 1, 'a');
  rect(t, 16, 6, 17, T - 1, 'A');
  for (const [x0, y0, dx] of [
    [14, 12, -1],
    [17, 9, 1],
    [14, 6, -1],
    [17, 4, 1],
  ])
    for (let k = 0; k < 9; k++) put(t, x0 + dx * k, y0 - Math.floor(k / 2), 'a');
  // Parts of it are simply missing — holes the world forgot to fill.
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) if (t[y][x] !== '.' && rnd(x, y, 28) < 14) put(t, x, y, '.');
  return outline(t, 'A');
}

// ------------------------------------------------------------------ lighthouse & props 29-39
/** One half (left / right) of the 2×3 lighthouse; `part` 0 top, 1 middle, 2 base. */
function lighthouse(part, side) {
  const t = tile();
  const W = 2 * T;
  const full = Array.from({ length: T }, () => Array(W).fill('.'));
  const set = (x, y, ch) => {
    if (x >= 0 && y >= 0 && x < W && y < T) full[y][x] = ch;
  };
  const yAbs = (y) => part * T + y; // 0..95 over the tower
  for (let y = 0; y < T; y++) {
    const Y = yAbs(y);
    // Tower narrows toward the top; lantern room on the first 26 rows.
    const half =
      Y < 6
        ? Math.round(3 + Y * 1.4)
        : Y < 22
          ? 10
          : Y < 26
            ? 14
            : Math.round(11 + (Y - 26) * 0.12);
    for (let x = 32 - half; x < 32 + half; x++) {
      const rel = x - (32 - half);
      let ch = rel < 3 ? 'Q' : x > 32 + half - 4 ? 'O' : 'q';
      if (Y >= 26 && (Y - 26) % 14 === 0) ch = 'Q';
      if (Y < 6)
        ch = rel < 2 ? 'Q' : 'q'; // domed cap
      else if (Y < 22) {
        // Lantern room: brass frame, glazing bars, dark glass.
        if (Y < 8 || Y > 19) ch = 'o';
        else if (rel % 4 === 0) ch = '$';
        else ch = rel % 4 === 1 && Y < 13 ? 'i' : 'I';
      } else if (Y < 26) ch = Y === 25 ? 'B' : 'Q'; // gallery
      set(x, y, ch);
    }
    if (Y >= 2 && Y < 6) set(31, y, 'o'); // finial
    if (Y >= 22 && Y < 26) {
      set(32 - 16, y, 'z');
      set(32 + 15, y, 'z');
    } // gallery railing
  }
  // Dark lens (unlit until the lenses align), a slit window, the door.
  if (part === 0)
    for (let y = 10; y < 18; y++) for (let x = 28; x < 36; x++) set(x, y, (x + y) % 3 ? 'B' : 'I');
  if (part === 1) for (let y = 10; y < 20; y++) for (let x = 30; x < 34; x++) set(x, y, 'B');
  if (part === 2) {
    for (let y = 8; y < T; y++)
      for (let x = 26; x < 38; x++) set(x, y, y === 8 || x === 26 || x === 37 ? 'Q' : 'R');
    set(35, 20, 'o');
  }
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) t[y][x] = full[y][x + side * T];
  return part === 2 ? t : t;
}
function lens() {
  const t = tile();
  rect(t, 11, 22, 20, 29, 'P'); // pedestal
  rect(t, 9, 28, 22, 30, 'p');
  rect(t, 14, 15, 17, 22, '$');
  ellipse(t, 16, 11, 8, 8, 'o');
  ellipse(t, 16, 11, 6, 6, 'I');
  ellipse(t, 14, 9, 2.5, 2, 'i');
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    put(t, Math.round(16 + Math.cos(a) * 7), Math.round(11 + Math.sin(a) * 7), '$');
  }
  // Lever.
  for (let k = 0; k < 6; k++) put(t, 22 + k, 22 - k, 'z');
  put(t, 28, 16, 'o');
  return outline(t);
}
function tablet() {
  const t = tile();
  rect(t, 8, 2, 23, 27, 'q');
  rect(t, 8, 2, 9, 27, 'Q');
  rect(t, 9, 0, 22, 1, 'q');
  rect(t, 6, 27, 25, 30, 'B');
  // Cerulean glyph lines (UNWRITTEN record).
  for (let y = 6; y < 24; y += 3)
    for (let x = 11; x < 21; x++) if (rnd(x, y, 36) < 62) put(t, x, y, y === 6 ? 'C' : 'c');
  return outline(t);
}
function gate() {
  const t = tile();
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const dx = x - 15.5;
      const inArch = y > 4 + (dx * dx) / 12;
      const pillar = Math.abs(dx) > 10 && Math.abs(dx) < 15;
      if (pillar && y > 2) put(t, x, y, Math.abs(dx) > 13 ? 'B' : 'b');
      else if (inArch && Math.abs(dx) <= 10)
        put(t, x, y, Math.abs(dx) < 4 ? '*' : Math.abs(dx) < 7 ? 'C' : 'c');
    }
  for (let x = 2; x < 30; x++) put(t, x, 2 + Math.round((x - 15.5) ** 2 / 40), 'h');
  return outline(t);
}
function frozenWave() {
  const t = sea(37);
  const wave = tile();
  for (let x = 4; x < 28; x++) {
    const top = Math.round(
      26 - Math.sin(((x - 4) / 24) * Math.PI) * 18 - (x > 18 ? (x - 18) * 0.6 : 0),
    );
    for (let y = top; y < 28; y++) put(wave, x, y, y - top < 2 ? 'i' : (x + y) % 5 ? 'I' : 'i');
  }
  // Spray hanging in the air, stopped mid-fall.
  for (const [x, y] of [
    [22, 7],
    [25, 10],
    [19, 5],
    [27, 13],
  ])
    put(wave, x, y, 'i');
  return over(t, outline(wave, 'S'));
}
function railing() {
  const t = tile();
  rect(t, 0, 12, T - 1, 13, 'z');
  rect(t, 0, 20, T - 1, 20, 'z');
  for (const x of [3, 15, 27]) rect(t, x, 10, x + 1, 28, 'z');
  for (let x = 6; x < 13; x++) put(t, x, 13, '.'); // a broken span
  return outline(t);
}

// ------------------------------------------------------------------ Chapter 1 props 40-42
/** A broken stone sundial: the gnomon's shadow is stuck on one mark. */
function sundial() {
  const t = tile();
  ellipse(t, 16, 26, 11, 4, 'B'); // plinth
  rect(t, 11, 14, 21, 25, 'b');
  rect(t, 11, 14, 12, 25, 'h');
  ellipse(t, 16, 13, 11, 5, 'b'); // dial face
  ellipse(t, 16, 12.5, 9.5, 4, 'h');
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    put(t, Math.round(16 + Math.cos(a) * 8), Math.round(12.5 + Math.sin(a) * 3.3), 'B');
  }
  for (let k = 0; k < 7; k++) put(t, 16 + Math.floor(k / 2), 12 - k, 'o'); // bronze gnomon, snapped
  for (let k = 0; k < 6; k++) put(t, 15 - k, 13 + Math.floor(k / 2), 'B'); // the frozen shadow
  put(t, 9, 11, 'c');
  rect(t, 20, 16, 22, 16, 'B'); // crack
  return outline(t);
}
/** A wooden tide marker post with painted rings; the water line is frozen on it. */
function tideMarker() {
  const t = tile();
  rect(t, 14, 2, 17, 31, 'r');
  rect(t, 14, 2, 14, 31, 'L');
  for (let y = 5; y < 30; y += 5) rect(t, 14, y, 17, y, y % 10 === 0 ? 'z' : 'W');
  rect(t, 10, 19, 21, 21, 'i'); // the stopped waterline, a ring of ice
  rect(t, 10, 19, 21, 19, 'I');
  put(t, 9, 20, 'i');
  put(t, 22, 20, 'i');
  return outline(t);
}
/** The bronze tide wheel that opens the sluices below the beacon. */
function tideWheel() {
  const t = tile();
  rect(t, 9, 24, 22, 30, 'B'); // stone base
  rect(t, 9, 24, 22, 24, 'h');
  rect(t, 15, 15, 16, 24, 'z'); // axle
  for (let k = 0; k < 48; k++) {
    const a = (k / 48) * Math.PI * 2;
    put(t, Math.round(16 + Math.cos(a) * 10), Math.round(13 + Math.sin(a) * 10), k % 6 ? 'o' : '$');
  }
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    for (let r = 2; r < 10; r++)
      put(t, Math.round(16 + Math.cos(a) * r), Math.round(13 + Math.sin(a) * r), 'o');
  }
  ellipse(t, 16, 13, 2.2, 2.2, '$');
  put(t, 16, 13, 'c');
  return outline(t);
}

const TILES = [
  loam(),
  moss(),
  trail(),
  mud(),
  mist(),
  fracture(),
  roots(),
  basalt(),
  basaltLichen(),
  saltGrass(),
  steps(),
  flagstone(),
  tidePool(),
  foamRock(),
  hatch(),
  lightFloor(),
  sea(),
  cliff(),
  basaltColumns(),
  canopy(),
  mangrove(),
  elderTree(),
  fallenLog(),
  thicket(),
  ferns(),
  monolith(),
  crevice(),
  ashCrystals(),
  erasedTree(),
  lighthouse(0, 0),
  lighthouse(0, 1),
  lighthouse(1, 0),
  lighthouse(1, 1),
  lighthouse(2, 0),
  lighthouse(2, 1),
  lens(),
  tablet(),
  gate(),
  frozenWave(),
  railing(),
  sundial(),
  tideMarker(),
  tideWheel(),
];

const outDir = path.resolve(process.argv[2] ?? 'art-source/environment/wilds/generated/candidates');
const previewDir = path.join(outDir, 'previews');
fs.mkdirSync(previewDir, { recursive: true });

const sheet = rasterTiles(TILES, PALETTE, COLS);
const file = path.join(outDir, `wilds_tileset_${VERSION}.png`);
writeFile(file, encodePng(sheet.w, sheet.h, sheet.buf));
writeFile(path.join(previewDir, `wilds_tileset_${VERSION}_x4.png`), scaledPng(sheet, 4));
writeFile(
  path.join(previewDir, `wilds_forest_${VERSION}.png`),
  scaledPng(renderLayout(sheet, forestLayout(), COLS), 1),
);
writeFile(
  path.join(previewDir, `wilds_lighthouse_${VERSION}.png`),
  scaledPng(renderLayout(sheet, lighthouseLayout(), COLS), 1),
);
console.log(`✓ ${path.relative(process.cwd(), file)} (${sheet.w}x${sheet.h})`);
