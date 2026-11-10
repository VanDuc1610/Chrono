/**
 * CHRONO – code-authored tileset for the Shattered Antechamber (Pipeline B, AGENTS.md §5).
 *
 * Built from docs/art/ENVIRONMENT_GUIDE.md (palette §4, tile rules §2-3). Every pixel comes from
 * the deterministic rules and explicit pixel lists below — no image model, no external reference.
 * Output goes to art-source/environment/sanctuary/generated/candidates/ ONLY; owner approval is
 * required before it replaces public/assets/tilesets/dungeon_tileset.png (AGENTS.md §6).
 *
 * Tile indices are FIXED by public/assets/maps/prologue_map.json (GID = index + 1):
 *   0 void · 1 slate floor · 2 engraved chronal pavement · 3 wall top / cornice
 *   4 wall face · 5 ruined pillar · 6 chrono crystal · 7 Altar of Moments
 *   8 cracked fracture floor · 9 slate floor variant · 10 stele · 11 frozen astrolabe
 *   12 reliquary · 13 threshold gate (wall face) · 14 torn journal leaf (on engraved floor)
 *   15 empty (reserved)
 * Ground tiles (0-2, 8-9) are opaque; props on the Walls layer (5-7) have transparent
 * backgrounds so the floor shows through.
 *
 * Usage: node scripts/author-sanctuary-tileset.js [outDir]
 * Also writes previews/: the tileset ×4 and the real prologue map rendered with it.
 */
import path from 'path';
import fs from 'fs';
import { hex, encodePng, writeFile } from './pixel-art/pixel.js';
import { GROUND_PROPS, WALL_PROPS } from './map-props.js';

const VERSION = 'v3';
const T = 32;

/** ENVIRONMENT_GUIDE §4 swatches + dormant cyan (§3.1) + outline. */
const PALETTE = {
  v: hex('#07080f'), // Abyssal Shadow — recesses, deep cracks
  m: hex('#0e121e'), // Midnight Slate — mortar, wall shadow
  S: hex('#1b2234'), // Vault Stone — primary flagstone
  s: hex('#29344c'), // Weathered Slate — mid-tones, wall blocks
  h: hex('#404f6e'), // High Stone Rim — top-edge highlights, fluting
  b: hex('#8c6628'), // Aged Bronze Mold — cornice, altar trim
  B: hex('#b88a3e'), // bronze highlight (derived)
  d: hex('#008ab8'), // dormant cyan dust
  c: hex('#00c8ff'), // Chronal Cyan Inlay
  a: hex('#88edff'), // Luminous Apex
  O: hex('#05060b'), // prop outline
  w: hex('#8c96a8'), // aged silver (stele reliefs)
  p: hex('#7a5cd6'), // violet-blue fracture light (threshold keystone, derived)
  q: hex('#d9cba8'), // vellum page (derived)
  Q: hex('#a8987a'), // vellum shadow / faded ink (derived)
};

/** Deterministic per-pixel hash in [0, 100). */
const rnd = (x, y, seed) => (((x * 73856093) ^ (y * 19349663) ^ (seed * 83492791)) >>> 0) % 100;

const tile = (fill) => Array.from({ length: T }, () => Array(T).fill(fill));
const put = (t, x, y, ch) => {
  if (x >= 0 && y >= 0 && x < T && y < T) t[y][x] = ch;
};
const line = (t, pts, ch) => pts.forEach(([x, y]) => put(t, x, y, ch));

// ------------------------------------------------------------------ GROUND

/** Weathered slate flagstones: offset 16px courses, bevelled edges, fine speckle. */
function flagstones(seed, crackSet = []) {
  const t = tile('S');
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const course = y < 16 ? 0 : 1;
      const lx = (x + course * 8) % 16;
      const ly = y % 16;
      if (ly === 0 || lx === 0) t[y][x] = 'm';
      else if (ly === 1 || lx === 1)
        t[y][x] = 's'; // top/left bevel catches the light
      else if (ly === 15 || lx === 15)
        t[y][x] = 'v'; // bottom/right recess
      else if (rnd(x, y, seed) < 6) t[y][x] = 's';
      else if (rnd(x, y, seed + 7) < 3) t[y][x] = 'm';
    }
  line(t, crackSet, 'v');
  return t;
}

const FINE_CRACK_A = [
  [5, 4],
  [6, 5],
  [6, 6],
  [7, 7],
  [22, 21],
  [23, 22],
  [23, 23],
  [24, 24],
  [25, 24],
];
const FINE_CRACK_B = [
  [26, 6],
  [25, 7],
  [25, 8],
  [11, 25],
  [12, 26],
  [12, 27],
];

function voidTile() {
  const t = tile('v');
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) if (rnd(x, y, 3) < 4) t[y][x] = 'm';
  return t;
}

/** Engraved chronal pavement: concentric carved rings, 12 hour ticks, cyan dust in grooves. */
function engravedTile() {
  const t = flagstones(11);
  const cx = 15.5;
  const cy = 15.5;
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const r = Math.hypot(x - cx, y - cy);
      const ang = Math.atan2(y - cy, x - cx);
      if (Math.abs(r - 12) < 0.6) t[y][x] = rnd(x, y, 5) < 30 ? 'd' : 'm';
      else if (Math.abs(r - 7) < 0.55) t[y][x] = rnd(x, y, 9) < 25 ? 'd' : 'm';
      else if (r < 2.2) t[y][x] = r < 1 ? 'a' : 'c';
      // twelve divisions of the day between the rings
      const hour = (ang / (Math.PI * 2)) * 12;
      if (r > 8 && r < 11.4 && Math.abs(hour - Math.round(hour)) < 0.07) t[y][x] = 'm';
    }
  return t;
}

/** Cracked fracture floor: flagstones split by a fissure leaking cyan light. */
function fractureTile() {
  const t = flagstones(23);
  const fissure = [
    [3, 9],
    [4, 10],
    [5, 10],
    [6, 11],
    [7, 12],
    [8, 12],
    [9, 13],
    [10, 14],
    [11, 15],
    [12, 15],
    [13, 16],
    [14, 17],
    [15, 17],
    [16, 18],
    [17, 19],
    [18, 20],
    [19, 20],
    [20, 21],
    [21, 22],
    [22, 23],
    [23, 23],
    [24, 24],
    [25, 25],
    [26, 26],
  ];
  fissure.forEach(([x, y], i) => {
    put(t, x, y, i % 5 === 2 ? 'a' : 'c');
    put(t, x, y - 1, 'v');
    put(t, x + 1, y + 1, 'v');
    if (i % 4 === 0) put(t, x + 1, y - 1, 'd');
  });
  return t;
}

// ------------------------------------------------------------------- WALLS

/**
 * Wall top seen from above: square capstones with even mortar on all four sides, so the tile
 * repeats cleanly both along the horizontal border and down the vertical side walls.
 */
function wallTopTile() {
  const t = tile('m');
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const bx = x % 16;
      const by = y % 16;
      if (bx >= 1 && bx <= 14 && by >= 1 && by <= 14) {
        if (by === 1 || bx === 1) t[y][x] = 'h';
        else if (by === 14 || bx === 14) t[y][x] = 'S';
        else t[y][x] = rnd(x, y, 31) < 8 ? 'S' : 's';
      }
    }
  return t;
}

/** Lower sanctuary wall face: megalithic slate courses with chisel marks and a faint fissure. */
function wallFaceTile() {
  const t = tile('s');
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const course = Math.floor(y / 11);
      const ly = y % 11;
      const lx = (x + (course % 2) * 12) % 24;
      if (ly === 0 || lx === 0) t[y][x] = 'm';
      else if (ly === 1) t[y][x] = 'h';
      else if (ly >= 9) t[y][x] = 'S';
      else if (rnd(x, y, 41) < 7) t[y][x] = 'S';
    }
  // chisel marks
  line(
    t,
    [
      [5, 4],
      [6, 5],
      [17, 15],
      [18, 16],
      [9, 26],
      [10, 27],
    ],
    'm',
  );
  // hairline fissure with dormant chronal light
  line(
    t,
    [
      [27, 13],
      [26, 14],
      [26, 15],
      [27, 16],
    ],
    'd',
  );
  // bronze-trimmed cornice where the capstones meet the wall face (ENVIRONMENT_GUIDE §3.2)
  for (let x = 0; x < T; x++) {
    t[0][x] = 'b';
    t[1][x] = x % 6 === 0 ? 'B' : 'b';
    t[2][x] = 'm';
  }
  // contact shadow where the wall meets the floor
  for (let x = 0; x < T; x++) {
    t[30][x] = 'm';
    t[31][x] = 'v';
  }
  return t;
}

// ------------------------------------------------------------------- PROPS

/** Parse a 32-row prop drawing ('.' = transparent). */
function prop(rows) {
  if (rows.length !== T || rows.some((r) => r.length !== T)) {
    throw new Error('prop must be 32x32');
  }
  return rows.map((r) => [...r]);
}

/** Fluted ruined pillar stub with a shattered top, on a square plinth. */
const pillarTile = prop([
  '................................',
  '................................',
  '..........OO.....OO.............',
  '.........OhhO...OhhOO...........',
  '........OhhshOOOhssshO..........',
  '........OhsssshhssssshO.........',
  '........OssSsssSssSsshO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OsShsSshsSshssO.........',
  '........OSSmSSmmSSmSSSO.........',
  '......OOhhhhhhhhhhhhhhhOO.......',
  '......OhssssssssssssssssO.......',
  '......OsSSSSSSSSSSSSSSSSO.......',
  '......OmmmmmmmmmmmmmmmmmO.......',
  '......OOOOOOOOOOOOOOOOOOO.......',
  '.......vvvvvvvvvvvvvvvvvv.......',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
]);

/** Fractured chrono crystal cluster growing from the floor. */
const crystalTile = prop([
  '................................',
  '................................',
  '................................',
  '...............O................',
  '..............OaO...............',
  '..............OacO..............',
  '.............OaacO..............',
  '.............OacccO.............',
  '.............OacccO....O........',
  '.....O.......OacccdO..OaO.......',
  '....OaO......OacccdO..OacO......',
  '....OacO.....OaccdcO.OaacO......',
  '...OaacO.....OacccdO.OaccdO.....',
  '...OaccdO....OaccdcO.OaccdO.....',
  '...OacccO....OacccdO.OacddO.....',
  '...OaccdO....OaccdcOOOaccdO.....',
  '....OacdO...OOacccdOOacccdO.....',
  '....OaccdO..OaacccdOOaccdO......',
  '....OacddOOOaaccccdOacccdO......',
  '.....OacdOOaaccccddOaccdO.......',
  '.....OaccdOacccccddOacdO........',
  '......OacdOacccccdOacddO........',
  '.......OOcdaccccddOccdO.........',
  '.......OmOOOOOOOOOOOOOmO........',
  '......OmmmmmmmmmmmmmmmmmO.......',
  '.......vvvvvvvvvvvvvvvvv........',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
]);

/** Altar of Moments: obsidian-slate pedestal, bronze trim, celestial dial, glowing shard socket. */
const altarTile = prop([
  '................................',
  '................................',
  '....OOOOOOOOOOOOOOOOOOOOOOOO....',
  '...ObBBbbbbbbbbbbbbbbbbbbBBbO...',
  '...OhhhhhhhhhhhhhhhhhhhhhhhhO...',
  '...OhsssssssmmmmmmmmssssssshO...',
  '...OhssssmmmSSSSSSSSmmmssssSO...',
  '...OhsssmSSSmmdmmdmmSSSmsssSO...',
  '...OhssmSSmdSSSSSSSSdmSSmssSO...',
  '...OhssmSmSSSSSccSSSSSmSmssSO...',
  '...OhsmSSdSSSScaacSSSSdSSmsSO...',
  '...OhsmSSmSSSScaacSSSSmSSmsSO...',
  '...OhssmSmSSSSSccSSSSSmSmssSO...',
  '...OhssmSSmdSSSSSSSSdmSSmssSO...',
  '...OhsssmSSSmmdmmdmmSSSmsssSO...',
  '...OhssssmmmSSSSSSSSmmmssssSO...',
  '...OhsssssssmmmmmmmmssssssSSO...',
  '...ObbbbbbbbbbbbbbbbbbbbbbbbO...',
  '....OSSSSSSSSSSSSSSSSSSSSSSO....',
  '....OsSmmSSSSmmSSSSmmSSSSmSO....',
  '....OsSmmSSSSmmSSSSmmSSSSmSO....',
  '....OsSSSSSSSSSSSSSSSSSSSSSO....',
  '...OOhhhhhhhhhhhhhhhhhhhhhhOO...',
  '...ObBBbbbbbbbbbbbbbbbbbbBBbO...',
  '...OmmmmmmmmmmmmmmmmmmmmmmmmO...',
  '...OOOOOOOOOOOOOOOOOOOOOOOOOO...',
  '....vvvvvvvvvvvvvvvvvvvvvvvv....',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
]);

// ------------------------------------------------------- T-22 PROP TILES (10-14)
// Points of interest from the approved content proposal (docs/narrative/PROLOGUE_CONTENT_PROPOSAL.md).

const blankTile = () => tile('.');
const rect = (t, x0, y0, x1, y1, ch) => {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(t, x, y, ch);
};
/** Pixels whose distance from (cx, cy) lies in [r0, r1). */
const ring = (t, cx, cy, r0, r1, ch, pred = () => true) => {
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const r = Math.hypot(x - cx, y - cy);
      if (r >= r0 && r < r1 && pred(x, y)) put(t, x, y, ch);
    }
};
/** Stone plinth with a lit top lip, outline and contact shadow, spanning cols x0..x1. */
function plinth(t, x0, x1, top) {
  rect(t, x0, top, x1, top + 3, 'S');
  rect(t, x0 + 1, top, x1 - 1, top, 'h');
  rect(t, x0, top + 3, x1, top + 3, 'O');
  for (let y = top; y <= top + 3; y++) {
    put(t, x0, y, 'O');
    put(t, x1, y, 'O');
  }
  rect(t, x0 + 1, top + 4, x1 - 1, top + 4, 'v');
}

/**
 * 10 · Stele of the Six Authorities: basalt slab, six silver reliefs around a shattered dial,
 * and a gouged crescent (the erased "seventh hour") chiselled beneath them.
 */
function steleTile() {
  const t = blankTile();
  plinth(t, 8, 23, 23);
  // lighter weathered slate than the floor so the stele reads against it
  rect(t, 10, 3, 21, 22, 's');
  rect(t, 11, 3, 12, 22, 'h');
  rect(t, 19, 3, 20, 22, 'S');
  rect(t, 11, 2, 20, 2, 'O');
  for (let y = 3; y <= 22; y++) {
    put(t, 10, y, 'O');
    put(t, 21, y, 'O');
  }
  put(t, 11, 3, 'O');
  put(t, 20, 3, 'O');
  rect(t, 12, 4, 19, 4, 'h');
  // six silver reliefs around the dial (Origin ... Finality)
  line(
    t,
    [
      [13, 7],
      [18, 7],
      [12, 11],
      [19, 11],
      [13, 15],
      [18, 15],
    ],
    'w',
  );
  // shattered dial with a faint chronal crack
  ring(t, 15.5, 11, 2.4, 3.3, 'm');
  line(
    t,
    [
      [15, 10],
      [16, 11],
      [15, 12],
    ],
    'd',
  );
  put(t, 16, 10, 'c');
  // gouged crescent with ash-grey edges
  line(
    t,
    [
      [13, 18],
      [14, 19],
      [15, 20],
      [16, 20],
      [17, 19],
      [18, 18],
    ],
    'v',
  );
  put(t, 14, 18, 'h');
  put(t, 17, 18, 'h');
  return t;
}

/**
 * 11 · Frozen Astrolabe: brass rings hanging in stagnant time above a plinth, oil drops
 * suspended mid-air around the jammed escapement wheel.
 */
function frozenAstrolabeTile() {
  const t = blankTile();
  plinth(t, 10, 21, 22);
  const cx = 15.5;
  const cy = 10.5;
  ring(t, cx, cy, 7.6, 8.4, 'O');
  ring(t, cx, cy, 6.5, 7.6, 'b');
  ring(t, cx, cy, 6.5, 7.6, 'B', (x, y) => x < cx && y < cy); // light from upper left
  ring(t, cx, cy, 3.6, 4.4, 'b');
  for (let k = -6; k <= 6; k++) {
    put(t, Math.round(cx + k * 0.7), Math.round(cy + k * 0.7), 'b'); // tilted ecliptic bar
  }
  ring(t, cx, cy, 0, 1.6, 'B');
  // jammed escapement wheel on the rim
  ring(t, 22, 15, 0, 1.6, 'B');
  put(t, 22, 15, 'O');
  // oil drops frozen in the air
  line(
    t,
    [
      [8, 5],
      [24, 8],
      [7, 14],
      [23, 19],
    ],
    'a',
  );
  put(t, 25, 12, 'c');
  return t;
}

/**
 * 12 · Cracked Reliquary: lead-lined monastic box with bronze straps; one surviving crystal
 * pulses through the crack.
 */
function reliquaryTile() {
  const t = blankTile();
  rect(t, 6, 10, 25, 26, 'O');
  rect(t, 7, 11, 24, 15, 's');
  rect(t, 7, 11, 24, 11, 'h');
  rect(t, 7, 15, 24, 15, 'b');
  rect(t, 7, 16, 24, 25, 'S');
  for (const x of [8, 9, 22, 23]) rect(t, x, 11, x, 25, x === 8 || x === 22 ? 'B' : 'b');
  rect(t, 7, 25, 24, 25, 'm');
  // the crack, leaking the last cerulean crystal's light
  const crack = [
    [12, 13],
    [13, 14],
    [13, 15],
    [14, 16],
    [15, 17],
    [15, 18],
    [16, 19],
    [17, 20],
    [17, 21],
    [18, 22],
    [19, 23],
  ];
  crack.forEach(([x, y], i) => put(t, x, y, i % 3 === 1 ? 'c' : 'v'));
  put(t, 16, 18, 'a');
  put(t, 16, 17, 'a');
  rect(t, 7, 27, 24, 27, 'v');
  return t;
}

/**
 * 13 · Sealed Threshold Gates set into the north wall face: twin slate leaves under an arch,
 * clockwork reliefs, violet-blue fractures across the keystone.
 */
function thresholdGateTile() {
  const t = wallFaceTile();
  const cx = 15.5;
  const cy = 13;
  for (let y = 3; y < 30; y++)
    for (let x = 7; x <= 24; x++) {
      const r = Math.hypot(x - cx, y - cy);
      const inArch = y >= cy ? x >= 9 && x <= 22 : r < 6.6;
      const frame = y >= cy ? x === 8 || x === 23 : r >= 6.6 && r < 7.6;
      const outline = y >= cy ? x === 7 || x === 24 : r >= 7.6 && r < 8.4;
      if (inArch) t[y][x] = 'm';
      else if (frame) t[y][x] = 'h';
      else if (outline) t[y][x] = 'O';
    }
  rect(t, 10, 9, 13, 28, 'S');
  rect(t, 18, 9, 21, 28, 'S');
  rect(t, 15, 7, 16, 29, 'v'); // seam between the two leaves
  ring(t, 11.5, 19, 1.4, 2.3, 'b');
  ring(t, 19.5, 19, 1.4, 2.3, 'b');
  put(t, 11, 19, 'B');
  put(t, 20, 19, 'B');
  // keystone with violet-blue hairline fractures
  rect(t, 14, 3, 17, 5, 'h');
  line(
    t,
    [
      [15, 3],
      [16, 4],
      [15, 5],
      [16, 6],
      [13, 6],
      [18, 6],
    ],
    'p',
  );
  rect(t, 8, 29, 23, 29, 'v');
  return t;
}

/** 14 · Torn Journal Leaf lying on the engraved pavement (Ground layer, no collision). */
function tornPageTile() {
  const t = engravedTile();
  for (let y = 18; y <= 26; y++) {
    const x0 = 17 + Math.floor((y - 18) / 3);
    const x1 = 26 - ((y * 7) % 3); // ragged torn edge
    for (let x = x0; x <= x1; x++) t[y][x] = 'q';
    put(t, x1 + 1, y, 'v');
  }
  rect(t, 18, 27, 25, 27, 'v');
  // handwritten equations and the twice-underlined warning
  line(
    t,
    [
      [19, 20],
      [20, 20],
      [22, 20],
      [23, 20],
      [24, 20],
    ],
    'm',
  );
  line(
    t,
    [
      [20, 22],
      [21, 22],
      [22, 22],
      [24, 22],
    ],
    'm',
  );
  rect(t, 19, 24, 23, 24, 'Q');
  rect(t, 19, 25, 22, 25, 'Q');
  return t;
}

// -------------------------------------------------------------------- SHEET

const TILES = [
  voidTile(), // 0
  flagstones(1, FINE_CRACK_A), // 1
  engravedTile(), // 2
  wallTopTile(), // 3
  wallFaceTile(), // 4
  pillarTile, // 5
  crystalTile, // 6
  altarTile, // 7
  fractureTile(), // 8
  flagstones(17, FINE_CRACK_B), // 9
  steleTile(), // 10
  frozenAstrolabeTile(), // 11
  reliquaryTile(), // 12
  thresholdGateTile(), // 13
  tornPageTile(), // 14
];

function rasterTiles(tiles, cols, rowsN) {
  const w = cols * T;
  const h = rowsN * T;
  const buf = Buffer.alloc(w * h * 4);
  tiles.forEach((t, i) => {
    const ox = (i % cols) * T;
    const oy = Math.floor(i / cols) * T;
    t.forEach((row, y) =>
      row.forEach((ch, x) => {
        if (ch === '.') return;
        const c = PALETTE[ch];
        if (!c) throw new Error(`tile ${i}: unknown palette char "${ch}"`);
        const o = ((oy + y) * w + ox + x) * 4;
        buf[o] = c[0];
        buf[o + 1] = c[1];
        buf[o + 2] = c[2];
        buf[o + 3] = c[3];
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
      const o = (y * W + x) * 4;
      const a = img.buf[i + 3];
      const c = a ? img.buf.subarray(i, i + 4) : bg;
      out.set([c[0], c[1], c[2], 255], o);
    }
  return encodePng(W, H, out);
}

/**
 * Renders the real map (Ground then Walls layer) with this tileset, for review.
 * `props` overlays planned prop placements (scripts/map-props.js) before they are approved.
 */
function renderMap(sheet, mapPath, props = { ground: [], walls: [] }) {
  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  for (const [name, list] of [
    ['Ground', props.ground],
    ['Walls', props.walls],
  ]) {
    const layer = map.layers.find((l) => l.name === name);
    for (const p of list) layer.data[p.y * map.width + p.x] = p.gid;
  }
  const w = map.width * T;
  const h = map.height * T;
  const buf = Buffer.alloc(w * h * 4);
  for (const layerName of ['Ground', 'Walls']) {
    const layer = map.layers.find((l) => l.name === layerName);
    layer.data.forEach((gid, idx) => {
      if (!gid) return;
      const tIdx = gid - 1;
      const sx = (tIdx % 4) * T;
      const sy = Math.floor(tIdx / 4) * T;
      const dx = (idx % map.width) * T;
      const dy = Math.floor(idx / map.width) * T;
      for (let y = 0; y < T; y++)
        for (let x = 0; x < T; x++) {
          const si = ((sy + y) * sheet.w + sx + x) * 4;
          if (!sheet.buf[si + 3]) continue;
          sheet.buf.copy(buf, ((dy + y) * w + dx + x) * 4, si, si + 4);
        }
    });
  }
  return { w, h, buf };
}

const outDir = path.resolve(
  process.argv[2] ?? 'art-source/environment/sanctuary/generated/candidates',
);
const previewDir = path.join(outDir, 'previews');
fs.mkdirSync(previewDir, { recursive: true });

const sheet = rasterTiles(TILES, 4, 4);
const file = path.join(outDir, `sanctuary_tileset_${VERSION}.png`);
writeFile(file, encodePng(sheet.w, sheet.h, sheet.buf));
writeFile(path.join(previewDir, `sanctuary_tileset_${VERSION}_x4.png`), scaled(sheet, 4));
const room = renderMap(sheet, path.resolve('public/assets/maps/prologue_map.json'), {
  ground: GROUND_PROPS,
  walls: WALL_PROPS,
});
writeFile(path.join(previewDir, `sanctuary_room_${VERSION}.png`), scaled(room, 1));
console.log(`✓ ${path.relative(process.cwd(), file)} (${sheet.w}x${sheet.h})`);
