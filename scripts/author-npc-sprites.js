/**
 * CHRONO – code-authored townsfolk sprites for the Prologue v2 (Pipeline B, AGENTS.md §5).
 *
 * Cô Ba (npc_vendor_ba): ~45, Central-Vietnam street vendor — hair in a low bun, khăn rằn
 * (checked scarf) at the neck, light-brown áo bà ba, black trousers, a ladle for bánh căn batter
 * (PROLOGUE_V2_DESIGN.md §3). Every pixel is placed here — no image model, no external reference.
 * Output: art-source/npcs/vendor_ba/generated/candidates/ ONLY (owner approval required).
 *
 * Usage: node scripts/author-npc-sprites.js [outDir]
 * Sheet: vendor_ba_idle_<ver>.png — 4 frames × 32 px facing down (breathing + stirring the ladle).
 */
import path from 'path';
import fs from 'fs';
import {
  hex,
  mirrorHalf,
  checkRows,
  paint,
  renderSheet,
  preview,
  encodePng,
  writeFile,
} from './pixel-art/pixel.js';

const VERSION = 'v1';
const EMPTY = '.'.repeat(32);

const PALETTE = {
  O: hex('#1a1410'), // outline
  h: hex('#2a1e18'), // hair
  H: hex('#4a3628'), // hair sheen
  s: hex('#d8a878'), // skin
  S: hex('#b07e54'), // skin shadow
  e: hex('#2a1e18'), // eyes
  m: hex('#9a5a48'), // mouth
  r: hex('#1e1e22'), // khăn rằn dark check
  w: hex('#e8e0d0'), // khăn rằn light check
  b: hex('#b89870'), // áo bà ba
  B: hex('#8e7050'), // áo shade
  k: hex('#6a5038'), // buttons
  p: hex('#2a2a30'), // trousers
  P: hex('#3e3e46'), // trousers sheen
  f: hex('#5a3a22'), // sandals
  l: hex('#a8acb0'), // ladle bowl
  L: hex('#7a5030'), // ladle handle
  y: hex('#e8d4a2'), // batter drip
};

// Left half (cols 0..15), mirrored.
const half = [
  '................', // 0
  '................', // 1
  '..........OOOOOO', // 2  crown
  '.........OhhHhhh', // 3
  '........OhhhhHhh', // 4
  '........OhhhhhHh', // 5
  '........OhhhSsss', // 6  hairline, forehead
  '........OhhSssss', // 7
  '........OhhSesss', // 8  eyes
  '........OhhSssss', // 9
  '.........OhSssss', // 10
  '.........OhOSsss', // 11 jaw
  '..........OOSsss', // 12 chin / neck
  '..........Orwrwr', // 13 khăn rằn
  '.........Owrwrwr', // 14
  '........ObbbbbbB', // 15 áo bà ba, slender shoulders
  '.......ObbbbbbbB', // 16
  '.......ObBbbbbbk', // 17 button
  '.......ObBbbbbbB', // 18
  '.......ObBbbbbbB', // 19
  '.......ObBbbbbbk', // 20 button
  '......OsOBbbbbbB', // 21 hands at the sides
  '......OsOBbbbbbB', // 22
  '.......OOBBBBBBB', // 23 hem
  '.........OppppPO', // 24 trousers
  '.........OppppPO', // 25
  '.........OppppPO', // 26
  '.........OppppPO', // 27
  '.........OfffffO', // 28 sandals
  '.........OOOOOOO', // 29
  '................',
  '................',
];

const base = paint(mirrorHalf(half), [
  // low bun at the back of the head
  [14, 0, 'O'],
  [15, 0, 'O'],
  [16, 0, 'O'],
  [17, 0, 'O'],
  [13, 1, 'O'],
  [14, 1, 'h'],
  [15, 1, 'H'],
  [16, 1, 'h'],
  [17, 1, 'h'],
  [18, 1, 'O'],
  // kind, slightly worried face: soft mouth, a crease between the brows
  [15, 11, 'm'],
  [16, 11, 'm'],
  [15, 7, 'S'],
  [16, 7, 'S'],
  // the scarf's loose end over her left shoulder (viewer-right)
  [21, 15, 'r'],
  [22, 15, 'w'],
  [21, 16, 'w'],
  [22, 16, 'r'],
  [22, 17, 'r'],
]);

/** Ladle in her left hand (viewer-right), stirring: `phase` 0..3 moves the bowl in a small circle. */
function ladle(phase) {
  const [dx, dy] = [
    [0, 0],
    [1, -1],
    [0, -2],
    [-1, -1],
  ][phase];
  const bx = 27 + dx;
  const by = 13 + dy;
  const px = [];
  // handle from the hand (25, 21) up to the bowl
  for (let k = 0; k <= 7; k++) {
    const x = Math.round(25 + ((bx - 25) * k) / 7);
    const y = Math.round(21 + ((by + 2 - 21) * k) / 7);
    px.push([x, y, 'L']);
  }
  px.push([bx - 1, by, 'O'], [bx, by, 'l'], [bx + 1, by, 'l'], [bx + 2, by, 'O']);
  px.push([bx, by + 1, 'O'], [bx + 1, by + 1, 'O']);
  if (phase === 2) px.push([bx + 1, by + 2, 'y']); // a drip of batter
  // her hand around the handle
  px.push([25, 21, 's'], [26, 21, 'O'], [25, 22, 'O']);
  return px;
}

/** Breath: lower head, scarf and shoulders by 1 px (rows 0..16). */
function breathe(rows) {
  const out = [...rows];
  for (let y = 16; y >= 0; y--) out[y + 1] = rows[y];
  out[0] = EMPTY;
  return out;
}

const frames = [
  paint(base, ladle(0)),
  paint(base, ladle(1)),
  paint(breathe(base), ladle(2)),
  paint(breathe(base), ladle(3)),
];
frames.forEach((f, i) => checkRows(f, `vendor_ba frame ${i}`));

// ------------------------------------------------------------------ Ông Sáu
// ~60, sun-dark skin, grey stubble, nón lá (conical hat), faded blue work shirt; sits cross-legged
// mending a green net in his lap (PROLOGUE_V2_DESIGN.md §3).
const SAU_PALETTE = {
  O: hex('#1a1410'),
  n: hex('#d8c48a'), // nón lá
  N: hex('#b09a62'), // nón lá shade / ribs
  s: hex('#b07848'), // tanned skin
  S: hex('#8a5a34'), // skin shadow
  e: hex('#2a1e18'), // eyes
  w: hex('#b8b4ac'), // grey stubble
  W: hex('#8a867e'), // stubble shade
  b: hex('#5a7a9a'), // faded blue shirt
  B: hex('#445e78'), // shirt shade
  p: hex('#3a3a3a'), // trousers
  P: hex('#4e4e4e'), // trousers sheen
  a: hex('#4a7a5a'), // net
  A: hex('#34604a'), // net knots
  F: hex('#e86a2a'), // float
  L: hex('#a8743f'), // wooden netting shuttle
};

const sauHalf = [
  '................', // 0
  '................', // 1
  '................', // 2
  '................', // 3
  '................', // 4
  '...............O', // 5  hat tip
  '..............On', // 6
  '.............OnN', // 7
  '............OnnN', // 8
  '...........OnnnN', // 9
  '.........OOnnnnN', // 10
  '......OOOnnnnnnN', // 11 brim
  '.....ONNNNNNNNNN', // 12 brim underside
  '......OOOOSsssss', // 13 face in the hat's shade
  '.........OSsesss', // 14 eyes
  '.........OSsssss', // 15
  '.........OSwwwww', // 16 grey stubble
  '..........OWwwww', // 17
  '........OObbbbbb', // 18 shoulders
  '.......ObbbbbbbB', // 19
  '......ObbbbbbbbB', // 20
  '......ObBbbbbbbB', // 21
  '.....OsObbbbbbbB', // 22 hands on the net
  '....OaaaaaaaaaaA', // 23 net over his lap
  '...OaAaaAaaAaaAa', // 24
  '...OaaAaaAaaAaaA', // 25
  '...OppppppppAaaa', // 26 crossed legs under the net
  '...OppppPPppppPP', // 27
  '....OOOOOOOOOOOO', // 28
  '................', // 29
  '................', // 30
  '................', // 31
];

const sauBase = paint(mirrorHalf(sauHalf), [
  [15, 16, 'S'], // mouth line in the stubble
  [16, 16, 'S'],
  [9, 25, 'F'], // float tied into the net
  [10, 25, 'F'],
  [22, 26, 'F'],
]);

/** The netting shuttle in his right hand (viewer-right) going in and out of the mesh. */
function shuttle(phase) {
  const [dx, dy] = [
    [0, 0],
    [1, -1],
    [2, 0],
    [1, 1],
  ][phase];
  const x = 22 + dx;
  const y = 21 + dy;
  return [
    [x, y, 'L'],
    [x + 1, y, 'L'],
    [x + 1, y - 1, 'O'],
    [x + 2, y, 'O'],
    [x - 1, y + 1, 's'], // his hand
    [x, y + 1, 'S'],
  ];
}

/** Breath: hat and head drop 1 px (rows 0..17). */
function breatheSau(rows) {
  const out = [...rows];
  for (let y = 17; y >= 0; y--) out[y + 1] = rows[y];
  out[0] = EMPTY;
  return out;
}

const sauFrames = [
  paint(sauBase, shuttle(0)),
  paint(sauBase, shuttle(1)),
  paint(breatheSau(sauBase), shuttle(2)),
  paint(breatheSau(sauBase), shuttle(3)),
];
sauFrames.forEach((f, i) => checkRows(f, `fisherman_sau frame ${i}`));

// ------------------------------------------------------------------ the forgotten child
// A small barefoot child half-erased from the world: no face, faded colours, pixels missing,
// cold motes where the rest of them used to be (Residual Existence, not a ghost story).
const ghost = (h, a) => [...hex(h).slice(0, 3), a];
const CHILD_PALETTE = {
  O: ghost('#2a2e3a', 90),
  h: ghost('#3a3a44', 170), // hair
  s: ghost('#c0a898', 150), // skin, faded
  L: ghost('#d8d8e0', 150), // white shirt
  g: ghost('#8a94a8', 150), // shorts
  G: ghost('#6a7488', 150),
  c: hex('#00c8ff'), // chronal motes
  C: hex('#88edff'),
};

const childHalf = [
  ...Array(12).fill('................'),
  '..............OO', // 12
  '.............Ohh', // 13
  '............Ohhh', // 14
  '............Ohss', // 15 a face nobody can recall
  '............Ohss', // 16
  '.............Oss', // 17
  '...........OLLLL', // 18 white shirt
  '..........OLLLLL', // 19
  '..........OsLLLL', // 20
  '..........OsLLLL', // 21
  '...........OLLLL', // 22
  '...........OggGg', // 23 shorts
  '............OsO.', // 24 bare legs (the sandals are on the doorstep)
  '............OsO.', // 25
  '............OOO.', // 26
  ...Array(5).fill('................'),
];
const childBase = mirrorHalf(childHalf);

/** Remove ~16 % of the pixels (different ones per frame) and leave cold motes behind. */
function erase(rows, seed) {
  const hash = (x, y) => (((x * 73856093) ^ (y * 19349663) ^ (seed * 83492791)) >>> 0) % 100;
  const out = rows.map((r, y) =>
    [...r].map((ch, x) => (ch !== '.' && hash(x, y) < 16 ? '.' : ch)).join(''),
  );
  const motes = [
    [10, 14],
    [21, 17],
    [12, 9],
    [20, 22],
    [9, 20],
    [22, 11],
  ].filter((_, k) => (k + seed) % 2 === 0);
  return paint(
    out,
    motes.map(([x, y], k) => [x, y, k % 2 ? 'C' : 'c']),
  );
}
const childFrames = [erase(childBase, 1), erase(childBase, 2)];
childFrames.forEach((f, i) => checkRows(f, `forgotten_child frame ${i}`));

// ------------------------------------------------------------------ output
/** name -> [folder, file stem, version, frames, palette]. Cô Ba v1 is approved (NPC_VENDOR_BA_001). */
const SHEETS = {
  vendor_ba: ['vendor_ba', 'vendor_ba_idle', VERSION, frames, PALETTE],
  fisherman_sau: ['fisherman_sau', 'fisherman_sau_idle', 'v1', sauFrames, SAU_PALETTE],
  forgotten_child: ['forgotten_child', 'forgotten_child_idle', 'v1', childFrames, CHILD_PALETTE],
};

// Usage: node scripts/author-npc-sprites.js [outRoot] [--sheets=a,b]
// Default: only sheets that are not approved yet, so approved art is never re-emitted.
const args = process.argv.slice(2);
const sheetArg = args.find((a) => a.startsWith('--sheets='));
const wanted = sheetArg
  ? sheetArg.slice('--sheets='.length).split(',')
  : ['fisherman_sau', 'forgotten_child'];
const outRoot = args.find((a) => !a.startsWith('--'));

for (const name of wanted) {
  if (!SHEETS[name]) throw new Error(`Unknown sheet "${name}"`);
  const [folder, stem, version, sheetFrames, palette] = SHEETS[name];
  const outDir = path.resolve(outRoot ?? `art-source/npcs/${folder}/generated/candidates`);
  const previewDir = path.join(outDir, 'previews');
  fs.mkdirSync(previewDir, { recursive: true });
  const sheet = renderSheet([sheetFrames], palette);
  const file = path.join(outDir, `${stem}_${version}.png`);
  writeFile(file, encodePng(sheet.w, sheet.h, sheet.buf));
  writeFile(path.join(previewDir, `${stem}_${version}_x8.png`), preview(sheet, 8));
  console.log(`✓ ${path.relative(process.cwd(), file)} (${sheet.w}x${sheet.h})`);
}
