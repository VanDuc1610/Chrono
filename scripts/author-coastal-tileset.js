/**
 * CHRONO – code-authored coastal tileset for the Prologue v2 (Pipeline B, AGENTS.md §5):
 * the Khánh Hòa fishing town and Peter's attic room (PROLOGUE_V2_DESIGN.md §2, §7).
 *
 * Every pixel comes from the deterministic rules below — no image model, no external reference.
 * Output goes to art-source/environment/coastal/generated/candidates/ ONLY; owner approval is
 * required before anything is copied to public/assets/ (AGENTS.md §6).
 *
 * 8 × 5 tiles of 32 px (256 × 160). Indices (GID = index + 1) are listed in scripts/coastal-layout.js.
 *   0-15  ground (walkable, opaque)      16-39 walls layer (collide; props have transparent bg)
 *
 * Usage: node scripts/author-coastal-tileset.js [outDir]
 * Writes the sheet, a ×4 preview, and the planned town (28×18) and room (14×10) rendered with it.
 */
import path from 'path';
import fs from 'fs';
import { hex, encodePng, writeFile } from './pixel-art/pixel.js';
import { roomLayout, townLayout } from './coastal-layout.js';

const VERSION = 'v1';
const T = 32;
const COLS = 8;

/** Warm daylight coast, slightly faded (the town is quietly being forgotten). */
const PALETTE = {
  O: hex('#2a1e14'), // warm outline
  n: hex('#d8c08a'), // sand
  N: hex('#e8d4a2'), // sand light
  m: hex('#b89c64'), // sand shadow / wet sand
  k: hex('#9c8050'), // sand speck
  e: hex('#b08a5a'), // packed earth path
  E: hex('#946f45'), // path shadow
  g: hex('#7a9a4a'), // coastal grass
  G: hex('#5a7a34'), // grass shadow
  H: hex('#9cba5e'), // grass light
  r: hex('#b4583a'), // gạch tàu brick
  R: hex('#8e3f28'), // brick shadow
  j: hex('#c9a07a'), // mortar
  w: hex('#8a5a32'), // wood
  W: hex('#6e4426'), // wood dark
  y: hex('#a8743f'), // wood light
  Y: hex('#4a2c18'), // wood gap
  u: hex('#2a7f9a'), // sea
  U: hex('#1d5f78'), // deep sea
  i: hex('#3a9fba'), // wave light
  f: hex('#d8f0f0'), // foam
  L: hex('#e8e2d0'), // lime wall
  l: hex('#c8c0a8'), // lime shade
  z: hex('#a49c84'), // wall stain
  Z: hex('#8a8270'), // wall base
  b: hex('#3a6a9a'), // blue shutter
  B: hex('#2a5078'), // shutter shade
  d: hex('#7a4a28'), // door wood
  D: hex('#5a3418'), // door dark / frames
  t: hex('#b04a2a'), // roof tile
  T: hex('#8a3418'), // roof shade
  q: hex('#d06a3a'), // roof highlight
  p: hex('#8a6a44'), // palm trunk
  P: hex('#6a4e30'), // trunk ring / coconut
  v: hex('#4a8a3a'), // frond
  V: hex('#2e6a2a'), // frond shade
  x: hex('#6aaa4a'), // frond light
  o: hex('#6a5a3a'), // basket-boat weave
  X: hex('#3a3022'), // tar
  c: hex('#a0603a'), // clay stove
  C: hex('#7a4428'), // clay shade
  K: hex('#2a2a2a'), // charcoal / cake mould
  F: hex('#e86a2a'), // ember / float
  h: hex('#c8342a'), // red plastic
  Q: hex('#9a2420'), // red plastic shade
  a: hex('#4a7a5a'), // net
  A: hex('#34604a'), // net shade
  s: hex('#8a8a84'), // stone
  S: hex('#6a6a66'), // stone shade
  I: hex('#1a2a4a'), // frozen night water
  '*': hex('#e6f9ff'), // star / chronal white
  '~': hex('#00c8ff'), // chronal cyan
  '^': hex('#88edff'), // luminous apex
  M: hex('#6a4a30'), // room wall plank
  J: hex('#54381f'), // room wall seam
  '#': hex('#3a2818'), // beam
  1: hex('#d8d4c8'), // sheet
  2: hex('#ece8dc'), // pillow
  3: hex('#4a6a8a'), // blanket
  4: hex('#3a5470'), // blanket fold
  5: hex('#8a3a2a'), // book red
  6: hex('#3a5a7a'), // book blue
  7: hex('#6a7a3a'), // book green
  8: hex('#ece4cc'), // paper
  9: hex('#5a5248'), // ink
  $: hex('#c8a040'), // brass
  '%': hex('#b8bcc4'), // silver
  '&': hex('#9fd0e8'), // sky
  '@': hex('#3a9fba'), // sea seen through the window
  '!': hex('#5a5248'), // ash
  '"': hex('#3a342c'), // scorch
  '(': hex('#8a3a3a'), // rug
  ')': hex('#c8a060'), // rug pattern
  '+': hex('#a8a49c'), // smoke
};

// ------------------------------------------------------------------ helpers
const rnd = (x, y, s) => (((x * 73856093) ^ (y * 19349663) ^ (s * 83492791)) >>> 0) % 100;
const tile = (ch = '.') => Array.from({ length: T }, () => Array(T).fill(ch));
const put = (t, x, y, ch) => {
  if (x >= 0 && y >= 0 && x < T && y < T) t[y][x] = ch;
};
const rect = (t, x0, y0, x1, y1, ch) => {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(t, x, y, ch);
};
const ellipse = (t, cx, cy, rx, ry, ch) => {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) put(t, x, y, ch);
};
/** Replace every pixel with a weighted pick: [[char, percent], ...]. */
const speckle = (t, seed, picks, only = null) => {
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      if (only && !only.includes(t[y][x])) continue;
      const r = rnd(x, y, seed);
      let acc = 0;
      for (const [ch, pct] of picks) {
        acc += pct;
        if (r < acc) {
          t[y][x] = ch;
          break;
        }
      }
    }
};
/** 1-px outline around opaque pixels (props). */
const outline = (t, ch = 'O') => {
  const src = t.map((r) => [...r]);
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      if (src[y][x] !== '.') continue;
      const n = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].some(([dx, dy]) => src[y + dy]?.[x + dx] && src[y + dy][x + dx] !== '.');
      if (n) t[y][x] = ch;
    }
  return t;
};

// ------------------------------------------------------------------ ground 0-15
function sand(seed = 1) {
  const t = tile('n');
  speckle(t, seed, [
    ['N', 9],
    ['m', 7],
    ['k', 3],
  ]);
  return t;
}
function sandShells() {
  const t = sand(2);
  for (const [x, y] of [
    [7, 9],
    [22, 20],
  ]) {
    rect(t, x, y, x + 2, y, 'L');
    rect(t, x, y + 1, x + 2, y + 1, 'l');
    put(t, x + 1, y - 1, 'L');
  }
  for (const [x, y] of [
    [16, 6],
    [26, 11],
    [11, 25],
  ]) {
    rect(t, x, y, x + 1, y + 1, 's');
    put(t, x + 1, y + 1, 'S');
  }
  return t;
}
function dirtPath(seed = 3) {
  const t = tile('e');
  speckle(t, seed, [
    ['E', 14],
    ['m', 5],
    ['k', 3],
  ]);
  return t;
}
function grass() {
  const t = sand(4);
  for (const [x, y] of [
    [5, 12],
    [14, 6],
    [21, 18],
    [9, 26],
    [26, 27],
  ]) {
    for (let k = 0; k < 5; k++) {
      const bx = x + k - 2;
      const hgt = 3 + ((k * 7 + x) % 3);
      for (let j = 0; j < hgt; j++)
        put(t, bx + (j > 2 ? (k % 2 ? 1 : -1) : 0), y - j, j === hgt - 1 ? 'H' : k % 2 ? 'g' : 'G');
    }
  }
  return t;
}
function brick(seed = 5) {
  const t = tile('r');
  speckle(t, seed, [['R', 12]]);
  for (let y = 0; y < T; y++) {
    if (y % 8 === 7) rect(t, 0, y, T - 1, y, 'j');
    const off = Math.floor(y / 8) % 2 ? 8 : 0;
    for (let x = 0; x < T; x++) if ((x + off) % 16 === 15 && y % 8 !== 7) put(t, x, y, 'j');
  }
  return t;
}
function woodFloor(seed = 6, knots = false) {
  const t = tile('w');
  for (let y = 0; y < T; y++) {
    const plank = Math.floor(y / 8);
    if (y % 8 === 7) rect(t, 0, y, T - 1, y, 'Y');
    else if (y % 8 === 0) rect(t, 0, y, T - 1, y, 'y');
    const seam = (plank * 11 + seed * 5) % T;
    if (y % 8 !== 7) put(t, seam, y, 'Y');
  }
  speckle(t, seed, [['W', 10]], ['w']);
  if (knots) {
    ellipse(t, 9, 11, 2, 1, 'W');
    put(t, 9, 11, 'Y');
    ellipse(t, 23, 27, 2, 1, 'W');
  }
  return t;
}
function pier() {
  const t = tile('W');
  for (let x = 0; x < T; x++) {
    if (x % 8 === 7) rect(t, x, 0, x, T - 1, '#');
    else if (x % 8 === 0) rect(t, x, 0, x, T - 1, 'w');
  }
  speckle(t, 8, [['Y', 6]], ['W']);
  for (const y of [4, 20]) for (let x = 0; x < T; x += 8) put(t, x + 3, y, 's');
  return t;
}
function shore() {
  const t = sand(9);
  speckle(t, 9, [['m', 40]]);
  for (let x = 0; x < T; x++) {
    const edge = 18 + Math.round(Math.sin(x / 4) * 2);
    put(t, x, edge, 'f');
    put(t, x, edge - 1, rnd(x, 1, 9) < 50 ? 'f' : 'm');
    for (let y = edge + 1; y < T; y++) put(t, x, y, y < edge + 4 ? 'i' : 'u');
  }
  return t;
}
function sandals() {
  const t = brick(10);
  for (const [x, y] of [
    [11, 12],
    [17, 13],
  ]) {
    ellipse(t, x + 1.5, y + 3, 2, 4, 'D');
    rect(t, x, y + 1, x + 3, y + 1, 'h');
    put(t, x + 1, y + 3, 'h');
    put(t, x + 2, y + 3, 'h');
  }
  return t;
}
function rug() {
  const t = tile('(');
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const dx = Math.abs((x % 16) - 7.5);
      const dy = Math.abs((y % 16) - 7.5);
      if (Math.abs(dx + dy - 6) < 0.8) put(t, x, y, ')');
    }
  return t;
}
function emptyLot() {
  const t = dirtPath(11);
  speckle(t, 11, [
    ['!', 12],
    ['"', 6],
  ]);
  // Broken brick footing of a house nobody remembers.
  for (let x = 2; x < 30; x++) if (rnd(x, 3, 11) < 70) put(t, x, 3, 'R');
  for (let y = 3; y < 29; y++) if (rnd(2, y, 12) < 70) put(t, 2, y, 'R');
  for (let x = 6; x < 30; x++) if (rnd(x, 28, 13) < 45) put(t, x, 28, 'R');
  // Residual Existence: a few cold motes only Peter notices.
  for (const [x, y] of [
    [12, 14],
    [20, 9],
    [17, 22],
  ])
    put(t, x, y, '~');
  put(t, 13, 14, '^');
  return t;
}
function threshold() {
  const t = woodFloor(12);
  rect(t, 6, 6, 25, 25, 'D');
  rect(t, 8, 8, 23, 23, 'd');
  for (let y = 26; y < T; y++)
    for (let x = 0; x < T; x++) if (rnd(x, y, 12) < 50) put(t, x, y, 'N');
  return t;
}
function footprints() {
  const t = sand(13);
  for (let k = 0; k < 4; k++) {
    const x = 6 + k * 6;
    const y = 24 - k * 6 + (k % 2) * 3;
    ellipse(t, x, y, 1.2, 2, 'm');
  }
  return t;
}
function pathPebbles() {
  const t = dirtPath(14);
  for (const [x, y] of [
    [6, 8],
    [19, 4],
    [25, 21],
    [10, 27],
  ]) {
    rect(t, x, y, x + 1, y, 's');
    put(t, x, y + 1, 'S');
  }
  return t;
}

// ------------------------------------------------------------------ structures 16-23
function water() {
  const t = tile('u');
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      if (y % 8 === 2 && (x + y) % 12 < 5) put(t, x, y, 'i');
      else if (y % 8 === 6 && (x + y * 2) % 14 < 3) put(t, x, y, 'U');
    }
  for (const [x, y] of [
    [5, 10],
    [21, 26],
  ])
    put(t, x, y, 'f');
  return t;
}
function limeWall(seed = 17) {
  const t = tile('L');
  speckle(t, seed, [['l', 10]]);
  rect(t, 0, 0, T - 1, 1, 'l');
  for (let y = 24; y < T; y++)
    for (let x = 0; x < T; x++)
      put(t, x, y, y > 29 ? 'Z' : rnd(x, y, seed) < 40 + (y - 24) * 8 ? 'z' : t[y][x]);
  for (let k = 0; k < 6; k++) put(t, 23 + (k % 2), 8 + k, 'z');
  return t;
}
function wallWindow() {
  const t = limeWall(18);
  rect(t, 8, 7, 23, 22, 'D');
  for (let y = 8; y <= 21; y++)
    for (let x = 9; x <= 22; x++) put(t, x, y, x === 15 || x === 16 ? 'B' : y % 2 ? 'b' : 'B');
  rect(t, 7, 23, 24, 23, 'Z');
  return t;
}
function door() {
  const t = limeWall(19);
  rect(t, 7, 3, 24, T - 1, 'D');
  for (let y = 5; y < T; y++)
    for (let x = 9; x <= 22; x++) put(t, x, y, (x - 9) % 4 === 3 ? 'D' : 'd');
  put(t, 20, 18, '$');
  put(t, 20, 19, '$');
  return t;
}
function roofBand(t, y0 = 0, y1 = T - 1) {
  for (let y = y0; y <= y1; y++) {
    const band = Math.floor(y / 6);
    const yy = y % 6;
    for (let x = 0; x < T; x++) {
      const col = (x + band * 4) % 8;
      let ch = 't';
      if (yy === 0 && col < 6) ch = 'q';
      else if (yy === 5 || col === 7) ch = 'T';
      put(t, x, y, ch);
    }
  }
  return t;
}
function roof() {
  return roofBand(tile());
}
function eave() {
  const t = roofBand(tile(), 0, 19);
  rect(t, 0, 20, T - 1, 22, 'T');
  rect(t, 0, 23, T - 1, 23, 'O');
  rect(t, 0, 24, T - 1, T - 1, 'l');
  for (let x = 0; x < T; x += 4) put(t, x, 22, 'q');
  return t;
}
function roomWall() {
  const t = tile('M');
  for (let x = 0; x < T; x++) if (x % 6 === 5) rect(t, x, 0, x, T - 1, 'J');
  rect(t, 0, 28, T - 1, T - 1, '#');
  rect(t, 0, 27, T - 1, 27, 'J');
  return t;
}
function roomBeam() {
  const t = tile('#');
  for (let x = 0; x < T; x++) if (rnd(x, 0, 23) < 30) put(t, x, 14, 'J');
  rect(t, 0, 30, T - 1, 31, 'J');
  return t;
}

// ------------------------------------------------------------------ props 24-31
function palmTrunk() {
  const t = tile();
  for (let y = 0; y < T; y++) {
    const cx = 15 + Math.round(Math.sin(y / 9) * 2);
    const half = y > 27 ? 4 : 2;
    for (let x = cx - half; x <= cx + half; x++)
      put(t, x, y, y % 4 === 0 ? 'P' : x === cx + half ? 'P' : 'p');
  }
  ellipse(t, 16, 31, 6, 1.2, 'm');
  return outline(t);
}
function palmCrown() {
  const t = tile();
  const cx = 15;
  const cy = 17;
  // Fronds fan up and out, then droop under their own weight.
  for (const a of [Math.PI, -2.6, -2.0, -1.4, -0.9, -0.4, 0]) {
    for (let r = 1; r < 15; r++) {
      const x = Math.round(cx + Math.cos(a) * r);
      const y = Math.round(cy + Math.sin(a) * r * 0.8 + (r * r) / 18);
      put(t, x, y, r < 4 ? 'V' : 'v');
      put(t, x, y + 1, 'V');
      if (r % 2 === 0) put(t, x, y - 1, 'x');
      if (r > 4 && r % 3 === 1) put(t, x, y + 2, 'V'); // leaflets
    }
  }
  ellipse(t, 14, 19, 1.8, 1.8, 'P');
  ellipse(t, 17, 19.5, 1.8, 1.8, 'P');
  for (let y = 21; y < T; y++) put(t, 15 + Math.round(Math.sin(y / 9) * 2), y, 'p');
  return outline(t);
}
function basketBoat() {
  const t = tile();
  ellipse(t, 16, 19, 14, 9, 'o');
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) if (t[y][x] === 'o' && (x + y) % 3 === 0) put(t, x, y, 'X');
  ellipse(t, 16, 18, 10, 5.5, 'X');
  ellipse(t, 16, 17, 8, 3.5, 'o');
  rect(t, 6, 16, 26, 16, 'd'); // seat plank
  return outline(t);
}
function banhCanStall() {
  const t = tile();
  ellipse(t, 16, 21, 13, 8, 'c');
  for (let y = 21; y < 30; y++)
    for (let x = 3; x < 30; x++) if (t[y][x] === 'c' && y > 24) put(t, x, y, 'C');
  rect(t, 13, 25, 19, 28, 'K');
  rect(t, 14, 26, 18, 27, 'F');
  for (const [mx, my] of [
    [8, 17],
    [14, 16],
    [20, 16],
    [26, 17],
    [11, 21],
    [17, 21],
    [23, 21],
  ]) {
    ellipse(t, mx, my, 2.3, 1.6, 'K');
    if ((mx + my) % 2) ellipse(t, mx, my, 1.4, 0.9, 'N');
  }
  for (const [x, y] of [
    [10, 9],
    [11, 7],
    [10, 5],
    [21, 8],
    [22, 6],
  ])
    put(t, x, y, '+');
  return outline(t);
}
function redStool() {
  const t = tile();
  for (const [x, y] of [
    [10, 19],
    [21, 19],
    [12, 23],
    [19, 23],
  ])
    rect(t, x, y, x + 1, y + 4, 'Q');
  ellipse(t, 16, 17, 8, 4.5, 'h');
  ellipse(t, 14, 16, 3, 1.5, 'Q');
  put(t, 12, 15, 'L');
  return outline(t);
}
function netPile() {
  const t = tile();
  ellipse(t, 16, 21, 13, 8, 'a');
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++)
      if (t[y][x] === 'a' && ((x + y) % 4 === 0 || (x - y + 64) % 4 === 0)) put(t, x, y, 'A');
  for (const [x, y] of [
    [8, 18],
    [22, 23],
    [17, 15],
  ])
    rect(t, x, y, x + 1, y + 1, 'F');
  return outline(t);
}
function well() {
  const t = tile();
  ellipse(t, 16, 19, 13, 9, 's');
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++)
      if (t[y][x] === 's' && (x * 3 + y * 5) % 11 === 0) put(t, x, y, 'S');
  ellipse(t, 16, 18, 9, 5.5, 'I');
  for (const [x, y, ch] of [
    [12, 17, '*'],
    [19, 16, '*'],
    [16, 20, '^'],
    [21, 19, '~'],
    [10, 19, '~'],
  ])
    put(t, x, y, ch);
  return outline(t);
}
function stoneFence() {
  const t = tile();
  for (const [x, y, rx, ry] of [
    [5, 24, 5, 4],
    [15, 25, 5, 4],
    [26, 24, 5, 4],
    [10, 17, 5, 4],
    [21, 17, 5, 4],
  ]) {
    ellipse(t, x, y, rx, ry, 's');
    ellipse(t, x + 1, y + 1, rx - 1.5, ry - 1.5, 'S');
    ellipse(t, x - 1, y - 1, rx - 2.5, ry - 2.5, 's');
  }
  return outline(t);
}

// ------------------------------------------------------------------ room props 32-39
function bedHead() {
  const t = tile();
  rect(t, 4, 4, 27, T - 1, 'd');
  rect(t, 4, 4, 27, 9, 'D');
  rect(t, 6, 11, 25, T - 1, '1');
  ellipse(t, 15.5, 16, 8, 4, '2');
  rect(t, 6, 24, 25, T - 1, '3');
  rect(t, 6, 24, 25, 24, '4');
  return outline(t);
}
function bedFoot() {
  const t = tile();
  rect(t, 4, 0, 27, 26, 'd');
  rect(t, 6, 0, 25, 22, '3');
  for (const y of [6, 13, 20]) rect(t, 6, y, 25, y, '4');
  rect(t, 4, 23, 27, 27, 'D');
  return outline(t);
}
function desk() {
  const t = tile();
  rect(t, 2, 8, 29, 21, 'w');
  rect(t, 2, 8, 29, 8, 'y');
  rect(t, 2, 22, 29, 27, 'W');
  rect(t, 3, 28, 5, T - 1, 'D');
  rect(t, 26, 28, 28, T - 1, 'D');
  // Papers covered in equations and the torn notebook.
  rect(t, 5, 10, 13, 18, '8');
  for (const y of [12, 14, 16])
    for (let x = 6; x < 12; x++) if (rnd(x, y, 34) < 60) put(t, x, y, '9');
  rect(t, 16, 11, 25, 19, '6');
  rect(t, 17, 12, 25, 18, '8');
  for (let y = 12; y <= 18; y += 2) put(t, 25, y, '.');
  rect(t, 20, 14, 23, 14, '9');
  put(t, 27, 12, '$');
  put(t, 27, 13, '$');
  return outline(t);
}
function bookshelf() {
  const t = tile();
  rect(t, 3, 0, 28, T - 1, 'D');
  const books = ['5', '6', '7', '8', '6', '5', '7'];
  for (const [top, bottom] of [
    [1, 9],
    [11, 19],
    [21, 29],
  ]) {
    rect(t, 5, top, 26, bottom, '#');
    let x = 5;
    let k = top;
    while (x < 26) {
      const wdt = 2 + (k % 2);
      const h = bottom - top - (k % 3);
      rect(t, x, bottom - h, Math.min(x + wdt - 1, 26), bottom, books[k % books.length]);
      x += wdt + 1;
      k++;
    }
    rect(t, 3, bottom + 1, 28, bottom + 1, 'J');
  }
  return outline(t);
}
function keyTable() {
  const t = tile();
  rect(t, 7, 12, 24, 20, 'w');
  rect(t, 7, 12, 24, 12, 'y');
  rect(t, 7, 21, 24, 23, 'W');
  rect(t, 8, 24, 9, 30, 'D');
  rect(t, 22, 24, 23, 30, 'D');
  // The brass key nobody remembers giving Peter.
  ellipse(t, 12, 16, 2, 2, '$');
  put(t, 12, 16, 'w');
  rect(t, 14, 16, 20, 16, '$');
  put(t, 19, 17, '$');
  put(t, 17, 17, '$');
  return outline(t);
}
function wallPhoto() {
  const t = roomWall();
  rect(t, 9, 5, 22, 21, 'D');
  rect(t, 11, 7, 20, 19, '8');
  // Peter (round curly silhouette) and a second figure that has been scraped away.
  ellipse(t, 13.5, 11, 2, 2, 'M');
  rect(t, 12, 13, 15, 18, '9');
  for (let y = 9; y <= 18; y++)
    for (let x = 16; x <= 19; x++)
      if (rnd(x, y, 37) < 55) put(t, x, y, rnd(x, y, 38) < 50 ? '%' : '+');
  return t;
}
function wallWindowSea() {
  const t = roomWall();
  rect(t, 6, 4, 25, 23, '#');
  rect(t, 8, 6, 23, 14, '&');
  rect(t, 8, 15, 23, 21, '@');
  rect(t, 8, 15, 23, 15, 'f');
  rect(t, 15, 6, 16, 21, '#');
  rect(t, 5, 24, 26, 25, 'y');
  return t;
}
function nightstandWatch() {
  const t = tile();
  rect(t, 6, 10, 25, 22, 'w');
  rect(t, 6, 10, 25, 10, 'y');
  rect(t, 6, 23, 25, 28, 'W');
  rect(t, 13, 25, 18, 25, '$');
  // The Stopped Watch on its silver chain.
  ellipse(t, 15, 15, 4, 3.5, '%');
  ellipse(t, 15, 15, 2.8, 2.4, '8');
  put(t, 15, 13, '9');
  put(t, 15, 14, '9');
  put(t, 16, 15, '9');
  for (let k = 0; k < 6; k++) put(t, 19 + k, 15 + (k % 2), '%');
  return outline(t);
}

const TILES = [
  sand(1),
  sandShells(),
  dirtPath(),
  grass(),
  brick(),
  woodFloor(6),
  woodFloor(7, true),
  pier(),
  shore(),
  sandals(),
  rug(),
  emptyLot(),
  threshold(),
  footprints(),
  pathPebbles(),
  tile(),
  water(),
  limeWall(),
  wallWindow(),
  door(),
  roof(),
  eave(),
  roomWall(),
  roomBeam(),
  palmTrunk(),
  palmCrown(),
  basketBoat(),
  banhCanStall(),
  redStool(),
  netPile(),
  well(),
  stoneFence(),
  bedHead(),
  bedFoot(),
  desk(),
  bookshelf(),
  keyTable(),
  wallPhoto(),
  wallWindowSea(),
  nightstandWatch(),
];

// ------------------------------------------------------------------ output
function rasterTiles(tiles) {
  const rows = Math.ceil(tiles.length / COLS);
  const w = COLS * T;
  const h = rows * T;
  const buf = Buffer.alloc(w * h * 4);
  tiles.forEach((t, i) => {
    const ox = (i % COLS) * T;
    const oy = Math.floor(i / COLS) * T;
    t.forEach((row, y) =>
      row.forEach((ch, x) => {
        if (ch === '.') return;
        const c = PALETTE[ch];
        if (!c) throw new Error(`tile ${i}: unknown palette char "${ch}"`);
        buf.set(c, ((oy + y) * w + ox + x) * 4);
      }),
    );
  });
  return { w, h, buf };
}

function scaled(img, k, bg = [38, 42, 52, 255]) {
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

/** Draws a layout (ground then walls) with the sheet; used for the review previews. */
function renderLayout(sheet, layout) {
  const w = layout.width * T;
  const h = layout.height * T;
  const buf = Buffer.alloc(w * h * 4);
  for (const layer of [layout.ground, layout.walls])
    layer.forEach((row, ty) =>
      row.forEach((idx, tx) => {
        if (idx < 0) return;
        const sx = (idx % COLS) * T;
        const sy = Math.floor(idx / COLS) * T;
        for (let y = 0; y < T; y++)
          for (let x = 0; x < T; x++) {
            const si = ((sy + y) * sheet.w + sx + x) * 4;
            if (sheet.buf[si + 3])
              sheet.buf.copy(buf, ((ty * T + y) * w + tx * T + x) * 4, si, si + 4);
          }
      }),
    );
  return { w, h, buf };
}

const outDir = path.resolve(
  process.argv[2] ?? 'art-source/environment/coastal/generated/candidates',
);
const previewDir = path.join(outDir, 'previews');
fs.mkdirSync(previewDir, { recursive: true });

const sheet = rasterTiles(TILES);
const file = path.join(outDir, `coastal_tileset_${VERSION}.png`);
writeFile(file, encodePng(sheet.w, sheet.h, sheet.buf));
writeFile(path.join(previewDir, `coastal_tileset_${VERSION}_x4.png`), scaled(sheet, 4));
writeFile(
  path.join(previewDir, `coastal_town_${VERSION}.png`),
  scaled(renderLayout(sheet, townLayout()), 1),
);
writeFile(
  path.join(previewDir, `coastal_room_${VERSION}_x2.png`),
  scaled(renderLayout(sheet, roomLayout()), 2),
);
console.log(`✓ ${path.relative(process.cwd(), file)} (${sheet.w}x${sheet.h})`);
