/**
 * CHRONO – Peter redrawn at the LPC scale (Pipeline B, code-authored, AGENTS.md §5).
 *
 * Owner, 2026-11-17: the world moves to LPC-style 3/4 tiles (32px tiles, characters ~1.5 tiles
 * tall in 64x64 frames). Peter is redrawn at that scale from docs/art/PETER_DESIGN.md only: every
 * pixel below is placed by hand from the written spec and its palette swatches. Only the LPC
 * frame metrics are matched (64x64 cell, ~47 px tall, feet on y = 61) so he stands at the same
 * height as LPC people; no LPC body or any external character art is used as a base.
 *
 * Identity lock kept: short, compact, tightly coiled curls growing up and out (rounded, slightly
 * elevated, covering the sides); gray-blue eyes; stubble; high collar; charcoal-blue duster with
 * four silver clasp pairs; diagonal leather strap (left shoulder to right hip) with silver buckle;
 * belt with silver buckle; purple lining and turned cuffs; Torn Notebook on the right hip; Stopped
 * Watch on a chain; the Broken Blade in the right hand with its cerulean glow.
 *
 * Output: art-source/characters/peter/generated/candidates/ ONLY (owner approval before use).
 * Usage: node scripts/author-peter-lpc.js [outDir]
 *
 * v1 front still approved by the owner (2026-11-17, keep him slender). v2: idle (4 frames) and
 * walk (6 frames) in four directions; rows down, up, left, right as in PeterAnimationConfig.
 */
import fs from 'fs';
import path from 'path';
import { hex, checkRows, renderSheet, preview, encodePng, writeFile } from './pixel-art/pixel.js';

const SIZE = 64;

/** PETER_DESIGN.md §3-4 swatches, plus outline, notebook pages and leather highlight. */
const PALETTE = {
  O: hex('#120f17'), // outline (near-black violet)
  h: hex('#22160f'), // curly hair shadow
  H: hex('#3b291d'), // curly hair base
  j: hex('#594132'), // curly hair highlight
  s: hex('#dab9a0'), // skin
  S: hex('#b28e76'), // skin shadow / stubble
  E: hex('#607d9c'), // gray-blue eyes
  c: hex('#263248'), // coat charcoal-blue
  C: hex('#161e2e'), // coat shadow
  k: hex('#3d4f70'), // coat highlight
  p: hex('#281e36'), // purple lining
  P: hex('#3a2a4f'), // purple trim
  t: hex('#12151d'), // ribbed tunic
  l: hex('#453123'), // leather strap / belt / notebook cover
  L: hex('#5e4532'), // leather highlight (derived)
  m: hex('#8c96a8'), // aged silver
  n: hex('#8c96a5'), // Broken Blade steel
  g: hex('#00c8ff'), // chronal fracture glow
  w: hex('#a6f0ff'), // chronal glow, light
  W: hex('#e6f9ff'), // chronal apex white / watch face
  q: hex('#e8dcc0'), // notebook pages (cream parchment)
  r: hex('#181c24'), // trousers
  b: hex('#2e2219'), // boots
  d: hex('#008ab8'), // fading chronal trail (after-images, spent sparks)
};

/** Front view, 32 columns (x 16..47), from the top curl (y 15) to the soles (y 61). */
const FRONT = [
  '..........O.OO.OO.OO.O..........', // curls, bumpy crown
  '.........OjOjHOjHOjHOjO.........',
  '........OjHhjHhjHhjHhjHO........', // tight coils: light top, dark underside
  '........OHhjHhjHhjHhjHhO........',
  '........OjHhjHhjHhjHhjHO........',
  '........OHhjhHhjhHhjhHhO........', // curls stop at the brow, no fringe
  '........OHjssssssssssjHO........',
  '........OhHssssssssssHhO........',
  '........OHhshhsssshhshHO........', // brows
  '.........OhsOEssssEOshO.........', // gray-blue eyes; curls cover the ears
  '.........OSssssSSssssSO.........', // nose
  '.........OSssssssssssSO.........',
  '..........OSsssSSsssSO..........', // mouth
  '..........OSSsSssSsSSO..........', // faint stubble on the jaw
  '...........OSSSSSSSSO...........',
  '.........OkcCOSSSSOCckO.........', // high collar round the neck
  '........OkccCOttttOCcckO........', // ribbed tunic at the throat
  '.....OOOkkccCCOttOCCcckkOOO.....', // shoulders
  '....OkkcOcccccCmmCcccccOckkO....', // clasp pair 1
  '....OkccOccccCCttCCccccOcckO....',
  '....OkccOcccccCmmCcccccOcckO....', // clasp pair 2
  '....OccCOccccCCttCCccccOCccO....',
  '....OccCOcccccCmmCcccccOCccO....', // clasp pair 3
  '....OccCOcccccCCCCcccccOCccO....',
  '....OcCCOcccccCmmCcccccOCCcO....', // clasp pair 4
  '....OcCCOccccccCCccccccOCCcO....',
  '....OCCOOccccccCCccccccOOCCO....',
  '....OPPO.OcccccCCcccccO.OPPO....', // turned purple cuffs
  '....OssO.OcccccCCcccccO.OssO....', // hands
  '....OSsO.OllllmmmmllllO.OsSO....', // belt, silver buckle
  '.....OO..OccccCppCccccO..OO.....', // coat opens on its lining
  '.........OcccCOrrOCcccO.........',
  '.........OcccCprrpCcccO.........',
  '.........OcccCprrpCcccO.........',
  '.......OcccCprrOOrrpCcccO.......', // duster flares, legs part
  '.......OcccCprrOOrrpCcccO.......',
  '.......OcccCprrOOrrpCcccO.......',
  '.......OccCCprrOOrrpCCccO.......',
  '.......OkcCCprrOOrrpCCckO.......', // hem highlight
  '........OOOOPrrOOrrPOOOO........', // mid-calf hem, purple trim
  '............OLLOOLLO............', // boot turnover cuffs
  '............OblOOlbO............',
  '............ObbOObbO............',
  '............ObbOObbO............',
  '............ObbOObbO............',
  '...........ObbbOObbbO...........',
  '...........OOOOOOOOOO...........', // soles
];

/** Peter's own left is the viewer's right: the strap runs from there down to his right hip. */
function details(rows) {
  const g = rows.map((r) => [...r]);
  const put = (x, y, ch) => {
    if (g[y]?.[x] !== undefined) g[y][x] = ch;
  };
  // Diagonal strap: viewer-right shoulder (col 21, row 18) to viewer-left hip (col 9, row 29).
  for (let i = 0; i <= 11; i++) {
    const x = 21 - i;
    const y = 18 + i;
    if (g[y][x] === 'm' || g[y][x] === 't') continue; // clasps and tunic stay on top
    put(x, y, 'l');
    if (g[y][x + 1] !== 'O' && g[y][x + 1] !== 'm') put(x + 1, y, i % 3 === 0 ? 'L' : 'l');
  }
  put(17, 22, 'm'); // square strap buckle on the chest
  put(18, 22, 'm');
  // Torn Notebook on the right hip (viewer's left), cream pages between leather covers.
  for (const [x, y, ch] of [
    [8, 30, 'O'],
    [9, 30, 'O'],
    [10, 30, 'O'],
    [11, 30, 'O'],
    [8, 31, 'O'],
    [9, 31, 'l'],
    [10, 31, 'L'],
    [11, 31, 'O'],
    [8, 32, 'O'],
    [9, 32, 'q'],
    [10, 32, 'q'],
    [11, 32, 'O'],
    [8, 33, 'O'],
    [9, 33, 'l'],
    [10, 33, 'l'],
    [11, 33, 'O'],
    [8, 34, 'O'],
    [9, 34, 'O'],
    [10, 34, 'O'],
    [11, 34, 'O'],
  ])
    put(x, y, ch);
  // Stopped Watch on its chain, hanging from the belt on his left.
  put(19, 30, 'm');
  put(20, 31, 'm');
  put(20, 32, 'O');
  put(21, 32, 'O');
  put(20, 33, 'W');
  put(21, 33, 'm');
  put(20, 34, 'O');
  put(21, 34, 'O');
  return g.map((r) => r.join(''));
}

/**
 * Back view: curls cover the whole back of the head down to the nape; seamed coat back, no
 * clasps; the strap runs from his left shoulder (viewer's left) to his right hip.
 */
const BACK_HEAD = [
  '..O.OO.OO.OO.O..',
  '.OjOjHOjHOjHOjO.',
  'OjHhjHhjHhjHhjHO',
  'OHhjHhjHhjHhjHhO',
  'OjHhjHhjHhjHhjHO',
  'OHhjHhjHhjHhjHhO',
  'OhHhjHhjHhjHhHhO',
  'OHhjHhjHhjHhjHhO',
  'OhHhHhjHhjHhHhhO',
  '.OhHhjHhHhjHhhO.',
  '.OHhhHhjhHhhHhO.', // curls down to the nape
  '.OhHhjHhjHhjHhO.',
  '..OHhhHhhHhhHO..',
  '...OhhhhhhhhO...', // nape curls
  '.....OSSSSO.....', // a narrow neck under the collar
].map((r) => '........' + r + '........');

function backRows() {
  const body = FRONT.slice(15).map((r, i) => {
    let row = r.replace(/m/g, 'C').replace(/t/g, 'C');
    if (i === 14) row = row.replace('llllCCCCllll', 'llllllllllll'); // belt; the buckle is in front
    if (i >= 15) row = row.replace(/p/g, 'c').replace(/r/g, 'c'); // the coat back hides the legs
    return row;
  });
  const g = [...BACK_HEAD, ...body].map((r) => [...r]);
  const put = (x, y, ch) => {
    if (g[y]?.[x] !== undefined && g[y][x] !== '.' && g[y][x] !== 'O') g[y][x] = ch;
  };
  for (let i = 0; i <= 11; i++) {
    put(10 + i, 18 + i, 'l');
    put(11 + i, 18 + i, i % 3 === 0 ? 'L' : 'l');
  }
  // Torn Notebook on his right hip (viewer's right from behind).
  for (const [x, y, ch] of [
    [20, 31, 'l'],
    [21, 31, 'L'],
    [20, 32, 'q'],
    [21, 32, 'q'],
    [20, 33, 'l'],
    [21, 33, 'l'],
  ])
    put(x, y, ch);
  return g.map((r) => r.join(''));
}

/** Side view, facing right: hair mass behind, face and nose to the right, near arm over the coat. */
const SIDE = [
  '...........O.OO.OO.O............',
  '..........OjOjHOjHOjO...........',
  '.........OjHhjHhjHhjHO..........',
  '.........OHhjHhjHhjHhjO.........',
  '.........OjHhjHhjHhjHhO.........',
  '.........OHhjHhjHhjHhHhO........', // curls stop at the brow
  '.........OhHhjHhjHhssssO........',
  '.........OHhjHhjHhhssssO........',
  '.........OhHhjHhjHshhssO........', // brow
  '.........OHhjHhjHhssOEsO........', // gray-blue eye
  '.........OhHhjHhjhSsssssO.......', // nose
  '.........OHhjHhjHhSssssO........',
  '..........OhHhjhSsssSSO.........', // mouth
  '..........OHhhSsSsSsO...........', // stubbled jaw
  '...........OhhSSSSO.............', // nape curls over the neck
  '..........OkcCCOSSO.............', // high collar
  '..........OkccCCOtO.............',
  '.........OkkccccCCCO............',
  '.........OkcccOkkcCCO...........', // near arm
  '.........OccccOkccCCmO..........', // clasps at the front edge
  '.........OccccOkccCCcO..........',
  '.........OCcccOkccCCmO..........',
  '.........OCcccOkccCCcO..........',
  '.........OCcccOcccCCmO..........',
  '.........OCcccOcccCCcO..........',
  '.........OCCccOcccCCmO..........',
  '.........OCCccOcCCCCcO..........',
  '.........OCCccOPPOCCcO..........', // turned cuff
  '.........OCCccOssOCCcO..........', // hand
  '.........OllllOsSOlllO..........', // belt
  '.........OCcccccCCcpO...........',
  '.........OCcccccCCcprO..........', // the coat opens at the front
  '.........OCcccccCCcprO..........',
  '.........OCcccccCCcprO..........',
  '........OCccccccCCcprO..........',
  '........OCccccccCCcprO..........',
  '........OCccccccCCcprO..........',
  '........OCcccccCCCcprO..........',
  '........OkcccccCCCcprO..........',
  '........OOOOOOOPPPPrrO..........', // hem
];

function sideRows() {
  const g = SIDE.map((r) => [...r]);
  const put = (x, y, ch) => {
    if ('cCk'.includes(g[y]?.[x] ?? '.')) g[y][x] = ch;
  };
  for (let i = 0; i <= 10; i++) if (10 + i < 14 || 10 + i > 17) put(10 + i, 18 + i, 'l');
  for (const [x, y, ch] of [
    [11, 30, 'l'],
    [12, 30, 'L'],
    [11, 31, 'q'],
    [12, 31, 'q'],
    [11, 32, 'l'],
    [12, 32, 'l'],
  ])
    put(x, y, ch);
  return g.map((r) => r.join(''));
}

/** One boot from the front or back (left and right), and from the side (toe to the right). */
const BOOT = ['OLLO', 'OblO', 'ObbO', 'ObbO', 'ObbO', 'ObbbO', 'OOOOO'];
const BOOT_R = ['OLLO', 'OlbO', 'ObbO', 'ObbO', 'ObbO', 'ObbbO', 'OOOOO'];
const SIDE_BOOT = ['OLLLLO', 'OblllO', 'ObbbbO', 'ObbbbO', 'ObbbbOO', 'ObbbbbbO', 'OOOOOOOO'];
const FEET_Y = 61;

/** Rows 18..29 of the side view, columns 14..17 hold the near arm; this paints it out. */
function armlessSide(rows) {
  return rows.map((r, y) => {
    if (y < 18 || y > 29) return r;
    const fill = y === 29 ? 'llll' : y < 21 ? 'kccc' : 'cccc';
    return r.slice(0, 14) + fill + r.slice(18);
  });
}

/** Upper body rows (32 wide, 40 tall) for a view, with closed or kindled eyes if asked. */
function upperRows(view, { armless = false, eyes = null }) {
  let rows =
    view === 'front'
      ? details(FRONT).slice(0, 40)
      : view === 'back'
        ? backRows().slice(0, 40)
        : sideRows();
  if (view === 'side' && armless) rows = armlessSide(rows);
  if (eyes && view !== 'back') {
    rows = rows.map((r, y) => {
      if (y !== 9) return r;
      if (eyes === 'shut') return r.replace(/OE/g, 'hh').replace(/EO/g, 'hh');
      return r.replace(/E/g, 'g'); // Temporal Sight: the gray-blue eyes kindle cerulean
    });
  }
  return rows;
}

const grid = () => Array.from({ length: SIZE }, () => Array(SIZE).fill('.'));
const inside = (x, y) => x >= 0 && y >= 0 && x < SIZE && y < SIZE;
/** Paints `rows` into the frame with its last row on y = bottom. */
function place(g, rows, x0, bottom) {
  const top = bottom - rows.length + 1;
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch !== '.' && inside(x0 + x, top + y)) g[top + y][x0 + x] = ch;
    }),
  );
}
/** Paints only on transparent pixels (auras, arcs and after-images stay behind Peter). */
const under = (g, x, y, ch) => {
  if (inside(x, y) && g[y][x] === '.') g[y][x] = ch;
};
const over = (g, x, y, ch) => {
  if (inside(x, y)) g[y][x] = ch;
};
/** Outlines a set of pixels on their transparent sides. */
function outline(g, pts) {
  for (const [x, y] of pts)
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ])
      under(g, x + dx, y + dy, 'O');
}

/**
 * The body without effects: boots, then the upper body. `bob` lowers (+) or raises (-) the upper
 * body; `lift` raises a boot; `stride` moves the side boots; `dx` leans the upper body forward.
 * Returns the grid and the anchor points (fist, shoulder) for posing.
 */
function body(view, o = {}) {
  const { bob = 0, lift = [0, 0], stride = [0, 0], dx = 0 } = o;
  const g = grid();
  if (view === 'side') {
    place(g, SIDE_BOOT, 30 + stride[0], FEET_Y - lift[0]);
    place(g, SIDE_BOOT, 30 + stride[1], FEET_Y - lift[1]);
  } else {
    place(g, BOOT, 28, FEET_Y - lift[0]);
    place(g, BOOT_R, 32, FEET_Y - lift[1]);
  }
  const bottom = FEET_Y - BOOT.length + bob;
  const x0 = 16 + dx;
  place(g, upperRows(view, o), x0, bottom);
  const top = bottom - 39;
  const fist = { front: [x0 + 5, top + 28], back: [x0 + 26, top + 28], side: [x0 + 16, top + 28] }[
    view
  ];
  return { g, top, x0, fist, shoulder: [x0 + 15, top + 18], offHand: [x0 + 26, top + 28] };
}

/** The Broken Blade resting point-down in the fist (as approved, v1). (hx, hy) = the fist. */
function restBladeAt(g, hx, hy, bright) {
  const put = (x, y, ch) => {
    if (g[y]?.[x] !== undefined) g[y][x] = ch;
  };
  put(hx, hy - 1, 'm'); // pommel
  for (let x = hx - 3; x <= hx + 3; x++) put(x, hy + 2, 'm'); // crossguard
  put(hx - 4, hy + 2, 'O');
  put(hx + 4, hy + 2, 'O');
  for (let y = hy + 3; y <= hy + 10; y++) {
    put(hx - 1, y, 'O');
    put(hx, y, (y + (bright ? 1 : 0)) % 2 ? 'n' : 'w'); // the glow runs down the fuller
    put(hx + 1, y, 'n');
    put(hx + 2, y, 'O');
  }
  put(hx - 1, hy + 11, 'O');
  put(hx, hy + 11, 'g');
  put(hx + 1, hy + 11, bright ? 'W' : 'w');
  put(hx + 2, hy + 11, 'O');
  put(hx, hy + 12, 'O');
  put(hx + 1, hy + 12, 'g');
  put(hx + 2, hy + 12, 'O');
  put(hx - 2, hy + 9, 'g');
  put(hx + 3, hy + 7, bright ? 'w' : 'g');
  put(hx - 2, hy + 6, 'g');
}

function restBlade(g, [hx, hy], bright) {
  restBladeAt(g, hx, hy, bright);
}

/**
 * The Broken Blade from the fist (hx, hy) along a 45°-step direction (dx, dy): pommel behind the
 * fist, crossguard, steel broken off after `len` px, cerulean glow along one edge, a white-hot
 * jagged break at the tip.
 */
function bladeAt(g, hx, hy, dx, dy, len, bright = false) {
  const px = -dy;
  const py = dx; // perpendicular, the glowing edge side
  const pts = [];
  const put = (x, y, ch) => {
    over(g, x, y, ch);
    pts.push([x, y]);
  };
  put(hx - dx, hy - dy, 'm'); // pommel
  const cx = hx + dx;
  const cy = hy + dy;
  for (const k of [-2, -1, 0, 1, 2]) put(cx + px * k, cy + py * k, 'm'); // crossguard
  for (let k = 2; k <= len + 1; k++) {
    const x = hx + dx * k;
    const y = hy + dy * k;
    put(x, y, 'n');
    put(x + px, y + py, (k + (bright ? 1 : 0)) % 2 ? 'w' : 'g');
    if (dx !== 0 && dy !== 0) put(x - px, y, 'n'); // diagonals get a second steel pixel
  }
  const tx = hx + dx * (len + 2);
  const ty = hy + dy * (len + 2);
  put(tx, ty, bright ? 'W' : 'w');
  put(tx + px, ty + py, 'g');
  outline(g, pts);
  under(g, tx + dx, ty + dy, 'g'); // the fracture spits a spark
  under(g, tx + dx * 2 - px, ty + dy * 2 - py, bright ? 'w' : 'g');
}

/** Coat sleeve from the shoulder to the hand: outlined, purple turned cuff, bare hand. */
function armTo(g, [sx, sy], [hx, hy]) {
  const pts = [];
  const steps = Math.max(Math.abs(hx - sx), Math.abs(hy - sy));
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(sx + ((hx - sx) * i) / steps);
    const y = Math.round(sy + ((hy - sy) * i) / steps);
    const ch = i >= steps - 1 ? 's' : i === steps - 2 ? 'P' : 'c';
    for (const [ax, ay] of [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ]) {
      over(g, x + ax, y + ay, ch === 'c' && ay === 1 ? 'C' : ch);
      pts.push([x + ax, y + ay]);
    }
  }
  outline(g, pts);
}

/** A crescent slash trail around (cx, cy), angles in radians from the facing direction. */
function slashArc(g, cx, cy, r, a0, a1, face, fading = false) {
  for (let a = a0; a <= a1; a += 0.04) {
    const t = (a - a0) / (a1 - a0); // thin at the start, full at the blade
    const x = (k) => Math.round(cx + Math.cos(a + face) * (r + k));
    const y = (k) => Math.round(cy + Math.sin(a + face) * (r + k) * 0.75);
    if (fading) {
      if (Math.round(a * 25) % 3 === 0) under(g, x(0), y(0), 'd');
      continue;
    }
    under(g, x(0), y(0), 'W');
    if (t > 0.3) under(g, x(1), y(1), 'w');
    if (t > 0.6) under(g, x(2), y(2), 'g');
  }
}

/** Whole-frame shift (knock-back, lunge). */
function shift(g, dx, dy) {
  const out = grid();
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++) if (g[y][x] !== '.') under(out, x + dx, y + dy, g[y][x]);
  return out;
}
/** Hit flash: everything but the outline turns chronal white. */
const flash = (g) => g.map((r) => r.map((c) => (c === '.' || c === 'O' ? c : 'W')));
/** After-image of `src` at (dx, dy) in fading cyan, every other row, behind the body. */
function ghost(g, src, dx, dy, color = 'd', every = 3) {
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++)
      if (src[y][x] !== '.' && (y + dy) % every === 0 && (x + y) % 2 === 0)
        under(g, x + dx, y + dy, color);
}
const done = (g) => g.map((r) => r.join(''));

/** Facing angle (radians) of each view for arcs and rings. */
const FACE = { front: Math.PI / 2, back: -Math.PI / 2, side: 0 };
/** Unit step "forward" in each view. */
const FWD = { front: [0, 1], back: [0, -1], side: [1, 0] };

// ------------------------------------------------------------------ the sheets

/** Idle: breathing, the blade's glow pulsing with it. */
const IDLE = [{ bob: 0 }, { bob: 0, bright: true }, { bob: 1, bright: true }, { bob: 1 }];
/** Walk: each boot lifts in turn while the body rises a pixel (side: legs pass under the coat). */
const WALK = [
  { bob: 0 },
  { bob: -1, lift: [2, 0] },
  { bob: 0, lift: [1, 0], bright: true },
  { bob: 0, bright: true },
  { bob: -1, lift: [0, 2] },
  { bob: 0, lift: [0, 1] },
];
const SIDE_WALK = [
  { bob: 0, stride: [-4, 3] },
  { bob: -1, stride: [-2, 1], lift: [1, 0] },
  { bob: 0, bright: true },
  { bob: 0, stride: [3, -4], bright: true },
  { bob: -1, stride: [1, -2], lift: [0, 1] },
  { bob: 0 },
];
/** Run: longer strides, higher steps, a deeper bob and a forward lean. */
const RUN = [
  { bob: 0, lift: [0, 0] },
  { bob: -2, lift: [3, 0] },
  { bob: -1, lift: [2, 0], bright: true },
  { bob: 0, lift: [0, 0], bright: true },
  { bob: -2, lift: [0, 3] },
  { bob: -1, lift: [0, 2] },
];
const SIDE_RUN = [
  { bob: 0, dx: 1, stride: [-6, 5] },
  { bob: -2, dx: 1, stride: [-3, 2], lift: [2, 0] },
  { bob: -1, dx: 1, lift: [1, 0], bright: true },
  { bob: 0, dx: 1, stride: [5, -6], bright: true },
  { bob: -2, dx: 1, stride: [2, -3], lift: [0, 2] },
  { bob: -1, dx: 1, lift: [0, 1] },
];

function locomotion(view, poses, armed = true) {
  return poses.map((o) => {
    const b = body(view, o);
    if (armed) restBlade(b.g, b.fist, o.bright);
    return done(b.g);
  });
}

/** Attack: wind-up, raise, strike (+arc), follow-through (+fading arc), recover, rest. */
function attack(view) {
  const frames = [];
  if (view === 'side') {
    const poses = [
      { o: { bob: 1 }, hand: [-4, 3], dir: [-1, 0], len: 7 },
      { o: {}, hand: [-3, -5], dir: [-1, -1], len: 7 },
      { o: { dx: 1 }, hand: [7, 3], dir: [1, 0], len: 9, arc: 'full' },
      { o: { dx: 1 }, hand: [6, 8], dir: [1, 1], len: 8, arc: 'fade' },
      { o: {}, hand: [3, 9], dir: [0, 1], len: 8 },
    ];
    for (const p of poses) {
      const b = body('side', { ...p.o, armless: true });
      const [sx, sy] = b.shoulder;
      const hand = [sx + p.hand[0], sy + p.hand[1]];
      if (p.arc) slashArc(b.g, sx + 2, sy + 4, 15, -1.9, 0.6, FACE.side, p.arc === 'fade');
      bladeAt(b.g, hand[0], hand[1], p.dir[0], p.dir[1], p.len, p.arc === 'full');
      armTo(b.g, [sx, sy], hand);
      frames.push(done(b.g));
    }
  } else {
    const s = view === 'front' ? 1 : -1; // the blade hand is viewer-left from the front
    const poses = [
      { o: { bob: 1 }, dir: [-s, -1], len: 7 },
      { o: {}, dir: [0, -1], len: 8 },
      { o: {}, dir: [s, view === 'front' ? 1 : -1], len: 9, arc: 'full' },
      { o: {}, dir: [0, view === 'front' ? 1 : -1], len: 8, arc: 'fade' },
      { o: {}, dir: [0, 1], len: 7 },
    ];
    for (const p of poses) {
      const b = body(view, p.o);
      if (p.arc) slashArc(b.g, 32, b.top + 30, 18, -1.3, 1.3, FACE[view], p.arc === 'fade');
      bladeAt(b.g, b.fist[0], b.fist[1], p.dir[0], p.dir[1], p.len, p.arc === 'full');
      frames.push(done(b.g));
    }
  }
  const rest = body(view);
  restBlade(rest.g, rest.fist);
  frames.push(done(rest.g));
  return frames;
}

/** Hurt: white impact flash, knocked back with eyes shut and a chronal crack, stagger, steady. */
function hurt(view) {
  const [fx, fy] = FWD[view];
  const a = body(view);
  restBlade(a.g, a.fist);
  const b = body(view, { eyes: 'shut' });
  restBlade(b.g, b.fist);
  for (const [x, y, ch] of [
    [0, 0, 'W'],
    [1, -1, 'w'],
    [-1, 1, 'g'],
    [2, 1, 'g'],
    [-2, -1, 'w'],
  ])
    over(b.g, 32 + x, b.top + 22 + y, ch);
  const c = body(view, { bob: 2, eyes: 'shut' });
  restBlade(c.g, c.fist);
  const d = body(view, { bob: 1 });
  restBlade(d.g, d.fist);
  return [
    done(flash(a.g)),
    done(shift(b.g, -fx * 2, -fy * 2)),
    done(shift(c.g, -fx, -fy)),
    done(d.g),
  ];
}

/** Temporal Sight: blade raised point-up, eyes kindled, a turning ring of chronal motes. */
function temporalSight(view) {
  return [0, 1, 2, 3].map((i) => {
    const b = body(view, { eyes: 'glow', armless: view === 'side', bob: i === 2 ? -1 : 0 });
    if (view === 'side') {
      const [sx, sy] = b.shoulder;
      const hand = [sx + 10, sy + 4]; // held out in front of his face
      bladeAt(b.g, hand[0], hand[1], 0, -1, 9, i % 2 === 1);
      armTo(b.g, [sx, sy], hand);
    } else bladeAt(b.g, b.fist[0], b.fist[1], 0, -1, 9, i % 2 === 1);
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2 + (i * Math.PI) / 10;
      const x = Math.round(32 + Math.cos(a) * 21);
      const y = Math.round(b.top + 30 + Math.sin(a) * 7);
      under(b.g, x, y, k % 3 === 0 ? 'W' : k % 3 === 1 ? 'w' : 'g');
      if (k % 2 === 0) under(b.g, x + 1, y, 'd');
    }
    return done(b.g);
  });
}

/** Dash: crouch, lunge with one after-image, full stretch with two, recover with dust. */
function dash(view) {
  const [fx, fy] = FWD[view];
  const pose = (o) => {
    const b = body(view, o);
    restBlade(b.g, b.fist);
    return b.g;
  };
  const crouch = pose({ bob: 2 });
  const lungeBody = pose({ bob: 1, stride: view === 'side' ? [-3, 3] : [0, 0] });
  const lunge = shift(lungeBody, fx * 3, fy * 3);
  ghost(lunge, lungeBody, -fx * 1, -fy * 1);
  const stretchBody = pose({
    bob: 1,
    dx: view === 'side' ? 1 : 0,
    stride: view === 'side' ? [-5, 5] : [0, 0],
  });
  const stretch = shift(stretchBody, fx * 5, fy * 5);
  ghost(stretch, stretchBody, fx * 1, fy * 1);
  ghost(stretch, stretchBody, -fx * 3, -fy * 3, 'd', 4);
  const recover = pose({ bob: 1 });
  for (const [x, y] of [
    [-6, 0],
    [-8, -1],
    [-9, 1],
    [6, 0],
    [8, -1],
  ])
    under(recover, 32 + x - fx * 4, FEET_Y + y - Math.max(0, fy) * 2, 'L');
  return [done(crouch), done(lunge), done(stretch), done(recover)];
}

/** Shoot: aim (launcher raised in the left hand), release (spark), recoil, rest. The blade stays. */
function shoot(view) {
  const frames = [];
  for (let i = 0; i < 4; i++) {
    const b = body(view);
    restBlade(b.g, b.fist);
    if (i < 3) {
      const recoil = i === 2 ? 1 : 0;
      let hand;
      let dir;
      if (view === 'side') {
        const [sx, sy] = b.shoulder;
        hand = [sx + 9 - recoil, sy + 3];
        dir = [1, 0];
        armTo(b.g, [sx + 2, sy + 1], hand);
      } else if (view === 'front') {
        hand = [b.offHand[0], b.offHand[1] - recoil];
        dir = [0, 1];
      } else {
        hand = [21, b.top + 28 + recoil]; // his left hand, viewer-left from behind
        dir = [0, -1];
      }
      const [hx, hy] = hand;
      const [dx, dy] = dir;
      const pts = [
        [hx + dx, hy + dy, 'm'],
        [hx + dx * 2, hy + dy * 2, 'L'],
        [hx + dx * 2 - dy, hy + dy * 2 - dx, 'L'],
        [hx + dx * 2 + dy, hy + dy * 2 + dx, 'L'],
        [hx + dx * 3, hy + dy * 3, 'm'],
      ];
      for (const [x, y, ch] of pts) over(b.g, x, y, ch);
      outline(b.g, pts);
      if (i > 0) {
        const k = i === 1 ? 5 : 7;
        const sxp = hx + dx * k;
        const syp = hy + dy * k;
        const c = i === 1 ? 'W' : 'g';
        const e = i === 1 ? 'w' : 'd';
        over(b.g, sxp, syp, c);
        under(b.g, sxp + dx, syp + dy, e);
        under(b.g, sxp - dy, syp - dx, e);
        under(b.g, sxp + dy, syp + dx, e);
      }
    }
    frames.push(done(b.g));
  }
  return frames;
}

const flip = (rows) => rows.map((r) => [...r].reverse().join(''));
/** Rows: down, up, left, right (PeterAnimationConfig). Left mirrors right. */
function sheet(make) {
  const right = make('side');
  return [make('front'), make('back'), right.map(flip), right];
}

checkRows(FRONT, 'front', 32);
checkRows(SIDE, 'side', 32);
const SHEETS = [
  ['peter_lpc_idle', (v) => locomotion(v, IDLE)],
  ['peter_lpc_walk', (v) => locomotion(v, v === 'side' ? SIDE_WALK : WALK)],
  ['peter_lpc_idle_unarmed', (v) => locomotion(v, IDLE, false)],
  ['peter_lpc_walk_unarmed', (v) => locomotion(v, v === 'side' ? SIDE_WALK : WALK, false)],
  ['peter_lpc_run', (v) => locomotion(v, v === 'side' ? SIDE_RUN : RUN)],
  ['peter_lpc_attack', attack],
  ['peter_lpc_hurt', hurt],
  ['peter_lpc_temporal_sight', temporalSight],
  ['peter_lpc_dash', dash],
  ['peter_lpc_shoot', shoot],
];
const outDir = process.argv[2] ?? 'art-source/characters/peter/generated/candidates';
fs.mkdirSync(outDir, { recursive: true });
for (const [name, make] of SHEETS) {
  const g = sheet(make);
  g.flat().forEach((f, i) => checkRows(f, `${name}[${i}]`, SIZE));
  const sh = renderSheet(g, PALETTE, SIZE);
  writeFile(path.join(outDir, `${name}.png`), encodePng(sh.w, sh.h, sh.buf));
  writeFile(path.join(outDir, `${name}_x4.png`), preview(sh, 4));
  console.log(`${name}.png (${sh.w}x${sh.h})`);
}
// The approved v1 front still, kept for the record.
const still = body('front');
restBlade(still.g, still.fist);
const st = renderSheet([[done(still.g)]], PALETTE, SIZE);
writeFile(path.join(outDir, 'peter_lpc_v1_front.png'), encodePng(st.w, st.h, st.buf));
writeFile(path.join(outDir, 'peter_lpc_v1_front_x8.png'), preview(st, 8));
