/**
 * CHRONO – Peter at the LPC scale (Pipeline B, code-authored, AGENTS.md §5).
 *
 * v4 (owner, 2026-11-17): a sturdier build that stands level with the LPC people (shoulders 28 px,
 * head 20 px, 36 px wide frame art), and a new costume. Owner's only fixed point: short, compact,
 * tightly coiled black curls. Freestyle otherwise; chosen design "áo tấc cách tân + thợ đồng hồ":
 * charcoal-navy áo tấc with a standing collar and a diagonal closure to the wearer's right, side
 * slits lined in cerulean over cream straight trousers, a black-and-cream khăn rằn with a tail,
 * a tool belt with brass tools and a pocket watch, a watchmaker's loupe at the temple, the Broken
 * Blade with its cerulean glow. Three chapter stages: 1 (chapters 0-1) as above; 2 (chapters 2-5)
 * adds a brass gear pauldron on his left shoulder and a half cape; 3 (chapters 6-9) adds cerulean
 * fracture lines along the blade arm. The light trousers, scarf and cerulean lining keep him
 * readable on the dark chapter 6-9 maps.
 *
 * Every pixel is placed here; no LPC body or external character art is used. Frame metrics as
 * before (64x64, feet on y = 61), so positions and the collider are unchanged.
 *
 * Output: art-source/characters/peter/generated/candidates/ (stage 1 `peter_lpc_*`, stages 2-3
 * `peter_lpc_s2_*`, `peter_lpc_s3_*`). Usage: node scripts/author-peter-lpc.js [outDir]
 */
import fs from 'fs';
import path from 'path';
import { hex, checkRows, renderSheet, preview, encodePng, writeFile } from './pixel-art/pixel.js';

const SIZE = 64;
/** Width of the hand-drawn body art (columns x0 .. x0 + 35). */
const ART_W = 36;

const PALETTE = {
  O: hex('#120f17'), // outline (near-black violet)
  h: hex('#141219'), // curls, shadow (black)
  H: hex('#25222c'), // curls, base
  j: hex('#423e4d'), // curls, cool sheen
  s: hex('#dab9a0'), // skin
  S: hex('#b28e76'), // skin shadow / stubble
  E: hex('#607d9c'), // gray-blue eyes
  c: hex('#263248'), // áo tấc, charcoal-navy
  C: hex('#161e2e'), // áo tấc, shadow
  k: hex('#3d4f70'), // áo tấc, highlight
  u: hex('#2f9ccc'), // cerulean lining, cuffs, collar band
  U: hex('#1d6688'), // cerulean lining, shadow
  x: hex('#c4b9a0'), // cream trousers
  X: hex('#8f856e'), // cream trousers, shadow
  y: hex('#c8964a'), // brass (tools, loupe, pauldron)
  Y: hex('#ecc878'), // brass, light
  K: hex('#1c1c22'), // khăn rằn, dark check
  Z: hex('#e6e0d0'), // khăn rằn, light check
  t: hex('#12151d'), // inner shadow
  l: hex('#453123'), // leather (belt, grip)
  L: hex('#5e4532'), // leather highlight, dust
  m: hex('#8c96a8'), // silver (knot buttons, crossguard, watch case)
  n: hex('#8c96a5'), // Broken Blade steel
  g: hex('#00c8ff'), // chronal glow
  w: hex('#a6f0ff'), // chronal glow, light
  W: hex('#e6f9ff'), // chronal apex white / watch face
  b: hex('#2e2219'), // boots
  B: hex('#4a3626'), // boot highlight
  d: hex('#008ab8'), // fading chronal trail (after-images, spent sparks)
};

/** Chapter stage being drawn (1-3); set by the sheet loop below. */
let STAGE = 1;

/** Mirrors 18-column left halves into 36-column rows. */
const mirror = (half) =>
  half.map((h) => {
    if (h.length !== 18) throw new Error(`half row ${h.length}: ${h}`);
    return h + [...h].reverse().join('');
  });

/** Front view, upper 40 rows (y 15..54): head, áo tấc, the slits down to the front-panel hem. */
const FRONT_HALF = [
  '...........O.OO.OO', // curls, bumpy crown
  '.........OOjOjHOjH',
  '........OjHhjHhjHh', // tight coils: light tops, dark undersides
  '.......OjHhjHhjHhj',
  '.......OHhjHhjHhjH',
  '.......OjHhjHhjHhj',
  '.......OHhjhHhjhHh', // the curls stop at the brow
  '.......OHjssssssss',
  '.......OhHssssssss',
  '.......OHhshhhssss', // brows
  '.......OhssOEEssss', // gray-blue eyes (row 10)
  '........Osssssssss',
  '........OssssssssS', // nose
  '.........OsssssssS', // mouth
  '.........OSsSsssss', // faint stubble at the jaw
  '..........OSsssssS',
  '.............OSSSS', // neck
  '...........Okkcccc', // standing collar (row 17)
  '.........OkkcccCcc',
  '....OOOOkkkccccccc', // shoulders, 28 wide
  '...OkkkcOccccccccc',
  '...OkkccOccccccccc',
  '...OkcccOccccccccc',
  '...OkcccOccccccccc',
  '...OccCcOccccccccc',
  '...OccCcOccccccccc',
  '...OcCCcOccccccccc',
  '...OcCCcOccccccccc',
  '...OCCCOOccccccccc',
  '...OuuuO.Occcccccc', // cerulean cuffs
  '...OsssO.Occcccccc', // hands (row 30)
  '...OSssO.Olllllyll', // tool belt
  '....OOO..Occcccccc',
  '.........OxxUccccc', // side slits: trousers and lining either side of the front panel
  '.........OxxUccccc',
  '.........OxXuccccc',
  '........OxxXuccccc',
  '........OxxXuccccc',
  '........OxxXukkkkk', // hem highlight
  '........OxxXOOOOOO', // front-panel hem (row 39)
];

/** Back view head: curls over the whole back of the head down to the nape. */
const BACK_HEAD_HALF = [
  '...........O.OO.OO',
  '.........OOjOjHOjH',
  '........OjHhjHhjHh',
  '.......OjHhjHhjHhj',
  '.......OHhjHhjHhjH',
  '.......OjHhjHhjHhj',
  '.......OHhjHhjHhjH',
  '.......OjHhjHhjHhj',
  '.......OHhjHhjHhjH',
  '.......OjHhjHhjHhj',
  '.......OhHhjHhjHhj',
  '........OHhjHhjHhj',
  '........OhHhjHhjHh',
  '.........OHhjHhjHh',
  '.........OShHhhHhh', // ears under the curls
  '..........OhhhhhhS', // nape curls
  '.............OSSSS',
];

const B = 17; // body row 0 (the collar)
const check = (x, y) => ((Math.floor(x / 2) + Math.floor(y / 2)) % 2 ? 'K' : 'Z');
const putIn = (g, x, y, ch) => {
  if (g[y]?.[x] !== undefined) g[y][x] = ch;
};
const stampIn = (g, x0, y0, rows) =>
  rows.forEach((r, dy) => [...r].forEach((ch, dx) => ch !== ' ' && putIn(g, x0 + dx, y0 + dy, ch)));
/** Stamps only where the art is empty (things that hang behind him). */
const behindIn = (g, x, y, ch) => {
  if (g[y]?.[x] === '.') g[y][x] = ch;
};
const flipStamp = (rows) => rows.map((r) => [...r].reverse().join(''));

/** The khăn rằn wrap: three checked rows round the neck. */
function scarfWrap(g) {
  for (let y = B - 1; y <= B + 1; y++)
    for (let x = 11; x <= 24; x++) putIn(g, x, y, x === 11 || x === 24 ? 'O' : check(x, y));
  for (let x = 12; x <= 23; x++) putIn(g, x, B + 2, 'O');
}

const PAULDRON = [
  '  O O O O  ',
  ' OYOYOyOyO ',
  'OYYYYyyyyyO',
  'OYYyOOOyyyO',
  'OYyyOuOyyyO',
  'OyyyOOOyyCO',
  'OyyyyyyyCCO',
  ' OOOOOOOOO ',
];

function frontRows() {
  const g = mirror(FRONT_HALF).map((r) => [...r]);
  // Diagonal closure toward the wearer's right (viewer's left) with silver knot buttons.
  for (let i = 0; i <= 6; i++) putIn(g, 17 - i, B + 1 + i, i % 2 === 0 ? 'm' : 'C');
  for (let x = 12; x <= 23; x++) putIn(g, x, B, x === 12 || x === 23 ? 'O' : 'U');
  scarfWrap(g);
  // The scarf's tail over the viewer-right chest, fringed.
  for (let y = B + 2; y <= B + 10; y++) {
    putIn(g, 20, y, 'O');
    for (let x = 21; x <= 24; x++) putIn(g, x, y, check(x, y));
    putIn(g, 25, y, 'O');
  }
  stampIn(g, 20, B + 11, ['OZKZKO', ' Z K Z']);
  // Tool belt: a screwdriver, tweezers, a small brass gear; the pocket watch on its chain.
  stampIn(g, 12, B + 14, ['y']);
  stampIn(g, 14, B + 14, ['Y']);
  stampIn(g, 24, B + 13, [' Y ', 'YyY', ' Y ']);
  stampIn(g, 27, B + 15, ['m ', ' m', 'OO', 'Wm', 'OO']);
  // The watchmaker's loupe at the viewer-right temple.
  stampIn(g, 25, 8, ['OyyO', 'yWwy', 'ywWy', 'OyyO']);
  if (STAGE >= 2) {
    stampIn(g, 24, B, PAULDRON);
    for (let y = B + 2; y <= B + 15; y++) {
      behindIn(g, 32, y, y > B + 13 ? 'u' : 'C');
      behindIn(g, 33, y, 'O');
    }
  }
  if (STAGE >= 3) crackArm(g, 4);
  return g.map((r) => r.join(''));
}

/** Stage 3: cerulean fracture lines up the blade arm (its outer column x0), and one on the jaw. */
function crackArm(g, x0, mirrorX = false) {
  const pts = [
    [1, 13],
    [1, 12],
    [2, 11],
    [2, 10],
    [1, 9],
    [2, 8],
    [3, 7],
    [2, 6],
    [1, 5],
    [2, 4],
    [3, 3],
    [0, 13],
    [2, 13],
  ];
  for (const [dx, dy] of pts) {
    const x = mirrorX ? x0 - dx : x0 + dx;
    const y = B + dy;
    if (!'.O'.includes(g[y]?.[x] ?? '.')) putIn(g, x, y, dy % 2 ? 'g' : 'w');
  }
}

function backRows() {
  const head = mirror(BACK_HEAD_HALF);
  const body = mirror(FRONT_HALF).slice(head.length);
  const g = [...head, ...body].map((r) => [...r]);
  scarfWrap(g);
  stampIn(g, 16, B + 2, ['OKZO', 'OZKO', ' OO ']); // the knot at the back of the neck
  if (STAGE >= 2) {
    // Pauldron on his left shoulder (viewer-left from behind); the half cape over that side.
    stampIn(g, 1, B, flipStamp(PAULDRON));
    for (let y = B + 3; y <= B + 17; y++) {
      for (let x = 9; x <= 16; x++)
        if (!'.'.includes(g[y][x])) putIn(g, x, y, y >= B + 16 ? 'u' : x === 9 ? 'k' : 'C');
      putIn(g, 17, y, 'O');
    }
  }
  if (STAGE >= 3) crackArm(g, ART_W - 1 - 4, true);
  return g.map((r) => r.join(''));
}

/** Side view facing right, upper 40 rows: curls behind, face to the right, near arm over the tunic. */
const SIDE = [
  '.............O.OO.OO.O',
  '...........OOjOjHOjHOjO',
  '..........OjHhjHhjHhjHhO',
  '.........OjHhjHhjHhjHhjHO',
  '.........OHhjHhjHhjHhjHhO',
  '.........OjHhjHhjHhjHhjHhO',
  '.........OHhjHhjHhjHhjhHhO', // the curls stop at the brow
  '.........OjHhjHhjHhjhssssO',
  '.........OHhjHhjHhjhsssssO',
  '.........OjHhjHhjHhsshhssO', // brow
  '.........OHhjHhjHhjssOEssO', // gray-blue eye (row 10)
  '.........OhHhjHhjhSsssssssO', // nose
  '.........OHhjHhjHhSssssssO',
  '..........OhHhjHhSsssssSO', // mouth
  '..........OHhjHSsSsssssO', // stubbled jaw
  '...........OhhSSSSSSSO',
  '............OOSSSSO', // neck
  '..........OQQQQQQQQO', // the scarf's wrap (row 17)
  '.......OQQOQQQQQQQQO', // its tail streams back
  '......OQQOOkkcccccUOO', // collar, cerulean band at the front
  '.....OQQO.OkkccccccccO',
  '.....OQO..OkcccOkkcCcO', // near arm (columns 15-18)
  '..........OccccOkccCcmO', // knot buttons down the front edge
  '..........OccccOkccCccO',
  '..........OCcccOkccCcmO',
  '..........OCcccOkccCccO',
  '..........OCcccOcccCcmO',
  '..........OCcccOcccCccO',
  '..........OCCccOcccCccO',
  '..........OCCccOcCCCccO',
  '..........OCCccOuuOCccO', // cerulean cuff
  '..........OCCccOssOCccO', // hand (row 31)
  '..........OlllyOsSOlllO', // tool belt
  '..........OCcccccCCcccO',
  '.........OxUccccccCCccO', // back slit: lining and trousers
  '.........OxUccccccCCccO',
  '.........OxUcccccccCcccO',
  '.........OxUcccccccCcccO',
  '.........OxUkkkkkkkkkkkO', // hem highlight
  '.........OxOOOOOOOOOOOOO', // hem
].map((r) => r.padEnd(ART_W, '.'));

function sideRows() {
  const g = SIDE.map((r, y) => [...r].map((ch, x) => (ch === 'Q' ? check(x, y) : ch)));
  stampIn(g, 21, 7, ['OyO', 'yWy', 'OyO']); // the loupe at his temple
  if (STAGE >= 2) {
    stampIn(g, 9, B + 1, [' OyOyO', 'OYYyyO', 'OYyyyO', ' OOOO ']); // far-shoulder pauldron
    for (let y = B + 3; y <= B + 19; y++) {
      behindIn(g, 9, y, y > B + 17 ? 'u' : 'C');
      behindIn(g, 8, y, 'O');
    }
  }
  if (STAGE >= 3)
    for (const [x, y] of [
      [16, 21],
      [17, 22],
      [16, 23],
      [17, 24],
      [17, 25],
      [16, 26],
      [17, 27],
      [16, 28],
      [17, 29],
    ])
      putIn(g, x, y, y % 2 ? 'g' : 'w');
  return g.map((r) => r.join(''));
}

/** One boot with the trouser above it, front/back (left; the right one mirrors) and side. */
const BOOT = ['.OxxxXO', '.OxxxXO', '.ObBbbO', '.ObBbbO', '.ObbbbO', 'ObbbbbO', 'OOOOOOO'];
const BOOT_R = BOOT.map((r) => [...r].reverse().join(''));
const SIDE_BOOT = ['OxxxXO', 'OxxxXO', 'ObBbbO', 'ObBbbO', 'ObbbbbOO', 'ObbbbbbbO', 'OOOOOOOOO'];
const FEET_Y = 61;

/** Side view rows 21..31: the near arm (columns 15-18) painted out for posed arms. */
function armlessSide(rows) {
  return rows.map((r, y) => {
    if (y < 21 || y > 31) return r;
    return r.slice(0, 15) + (y < 23 ? 'kccc' : 'cccc') + r.slice(19);
  });
}

/** Upper body rows (36 wide, 40 tall) for a view, with shut or kindled eyes if asked. */
function upperRows(view, { armless = false, eyes = null }) {
  let rows = view === 'front' ? frontRows() : view === 'back' ? backRows() : sideRows();
  if (view === 'side' && armless) rows = armlessSide(rows);
  if (eyes && view !== 'back') {
    rows = rows.map((r, y) => {
      if (y !== 10) return r;
      if (eyes === 'shut') return r.replace(/E/g, 'h');
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
    place(g, SIDE_BOOT, 26 + stride[0], FEET_Y - lift[0]);
    place(g, SIDE_BOOT, 26 + stride[1], FEET_Y - lift[1]);
  } else {
    place(g, BOOT, 23, FEET_Y - lift[0]);
    place(g, BOOT_R, 34, FEET_Y - lift[1]);
  }
  const bottom = FEET_Y - BOOT.length + bob;
  const x0 = 14 + dx;
  place(g, upperRows(view, o), x0, bottom);
  const top = bottom - 39;
  const fist = {
    front: [x0 + 5, top + 30],
    back: [x0 + 30, top + 30],
    side: [x0 + 16, top + 31],
  }[view];
  return { g, top, x0, fist, shoulder: [x0 + 16, top + 21], offHand: [x0 + 30, top + 30] };
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

/** Sleeve from the shoulder to the hand: outlined, cerulean cuff, bare hand (stage 3: cracked). */
function armTo(g, [sx, sy], [hx, hy]) {
  const pts = [];
  const steps = Math.max(Math.abs(hx - sx), Math.abs(hy - sy));
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(sx + ((hx - sx) * i) / steps);
    const y = Math.round(sy + ((hy - sy) * i) / steps);
    const crack = STAGE >= 3 && i % 3 === 1 && i < steps - 2;
    const ch = i >= steps - 1 ? 's' : i === steps - 2 ? 'u' : crack ? 'g' : 'c';
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
        hand = [b.x0 + 5, b.top + 30 + recoil]; // his left hand, viewer-left from behind
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

checkRows(mirror(FRONT_HALF), 'front', ART_W);
checkRows(SIDE, 'side', ART_W);
const SHEETS = [
  ['idle', (v) => locomotion(v, IDLE)],
  ['walk', (v) => locomotion(v, v === 'side' ? SIDE_WALK : WALK)],
  ['idle_unarmed', (v) => locomotion(v, IDLE, false)],
  ['walk_unarmed', (v) => locomotion(v, v === 'side' ? SIDE_WALK : WALK, false)],
  ['run', (v) => locomotion(v, v === 'side' ? SIDE_RUN : RUN)],
  ['attack', attack],
  ['hurt', hurt],
  ['temporal_sight', temporalSight],
  ['dash', dash],
  ['shoot', shoot],
];
const outDir = process.argv[2] ?? 'art-source/characters/peter/generated/candidates';
fs.mkdirSync(outDir, { recursive: true });
for (const stage of [1, 2, 3]) {
  STAGE = stage;
  const prefix = stage === 1 ? 'peter_lpc_' : `peter_lpc_s${stage}_`;
  for (const [name, make] of SHEETS) {
    const g = sheet(make);
    g.flat().forEach((f, i) => checkRows(f, `${prefix}${name}[${i}]`, SIZE));
    const sh = renderSheet(g, PALETTE, SIZE);
    writeFile(path.join(outDir, `${prefix}${name}.png`), encodePng(sh.w, sh.h, sh.buf));
    writeFile(path.join(outDir, `${prefix}${name}_x4.png`), preview(sh, 4));
    console.log(`${prefix}${name}.png (${sh.w}x${sh.h})`);
  }
  // A front still of each stage, for the record.
  const still = body('front');
  restBlade(still.g, still.fist);
  const st = renderSheet([[done(still.g)]], PALETTE, SIZE);
  writeFile(path.join(outDir, `peter_v4_stage${stage}_front.png`), encodePng(st.w, st.h, st.buf));
  writeFile(path.join(outDir, `peter_v4_stage${stage}_front_x8.png`), preview(st, 8));
}
