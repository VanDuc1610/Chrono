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

/** The Broken Blade, point down, glowing along the break. (hx, hy) = the fist. */
function blade(g, hx, hy, bright) {
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

const FEET_Y = 61;
/** Paints `rows` into the 64x64 frame with its last row on y = bottom. */
function place(g, rows, x0, bottom) {
  const top = bottom - rows.length + 1;
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch !== '.' && g[top + y]?.[x0 + x] !== undefined) g[top + y][x0 + x] = ch;
    }),
  );
}

/**
 * A frame: boots first (each may be lifted), then the upper body (-1 = up a pixel, +1 = settled a
 * pixel), then the blade in the fist.
 */
function frame(view, { bob = 0, lift = [0, 0], stride = [0, 0], bright = false }) {
  const g = Array.from({ length: SIZE }, () => Array(SIZE).fill('.'));
  if (view === 'side') {
    place(g, SIDE_BOOT, 30 + stride[0], FEET_Y - lift[0]); // far leg
    place(g, SIDE_BOOT, 30 + stride[1], FEET_Y - lift[1]); // near leg
  } else {
    place(g, BOOT, 28, FEET_Y - lift[0]);
    place(g, BOOT_R, 32, FEET_Y - lift[1]);
  }
  const upper =
    view === 'front'
      ? details(FRONT).slice(0, 40)
      : view === 'back'
        ? backRows().slice(0, 40)
        : sideRows();
  const upperBottom = FEET_Y - BOOT.length + bob;
  place(g, upper, 16, upperBottom);
  const fistY = upperBottom - 39 + 28;
  blade(g, view === 'front' ? 21 : view === 'back' ? 42 : 32, fistY, bright);
  return g.map((r) => r.join(''));
}

/** Breathing: settle a pixel and back; the blade's glow pulses with it. */
const IDLE = [{ bob: 0 }, { bob: 0, bright: true }, { bob: 1, bright: true }, { bob: 1 }];
/** Front/back walk: each boot lifts in turn while the body rises a pixel. */
const WALK = [
  { bob: 0 },
  { bob: -1, lift: [2, 0] },
  { bob: 0, lift: [1, 0], bright: true },
  { bob: 0, bright: true },
  { bob: -1, lift: [0, 2] },
  { bob: 0, lift: [0, 1] },
];
/** Side walk: the legs part and pass under the coat. */
const SIDE_WALK = [
  { bob: 0, stride: [-4, 3] },
  { bob: -1, stride: [-2, 1], lift: [1, 0] },
  { bob: 0, bright: true },
  { bob: 0, stride: [3, -4], bright: true },
  { bob: -1, stride: [1, -2], lift: [0, 1] },
  { bob: 0 },
];

const flip = (rows) => rows.map((r) => [...r].reverse().join(''));
/** Rows: down, up, left, right (PeterAnimationConfig). Left mirrors right. */
function sheet(frontBack, side) {
  const right = side.map((f) => frame('side', f));
  return [
    frontBack.map((f) => frame('front', f)),
    frontBack.map((f) => frame('back', f)),
    right.map(flip),
    right,
  ];
}

checkRows(FRONT, 'front', 32);
checkRows(SIDE, 'side', 32);
const outDir = process.argv[2] ?? 'art-source/characters/peter/generated/candidates';
fs.mkdirSync(outDir, { recursive: true });
for (const [name, grid] of [
  ['peter_lpc_idle', sheet(IDLE, IDLE)],
  ['peter_lpc_walk', sheet(WALK, SIDE_WALK)],
]) {
  grid.flat().forEach((f, i) => checkRows(f, `${name}[${i}]`, SIZE));
  const sh = renderSheet(grid, PALETTE, SIZE);
  writeFile(path.join(outDir, `${name}.png`), encodePng(sh.w, sh.h, sh.buf));
  writeFile(path.join(outDir, `${name}_x4.png`), preview(sh, 4));
  console.log(`${name}.png (${sh.w}x${sh.h}) -> ${outDir}`);
}
// The approved v1 front still, kept for the record.
const still = renderSheet([[frame('front', {})]], PALETTE, SIZE);
writeFile(path.join(outDir, 'peter_lpc_v1_front.png'), encodePng(still.w, still.h, still.buf));
writeFile(path.join(outDir, 'peter_lpc_v1_front_x8.png'), preview(still, 8));
