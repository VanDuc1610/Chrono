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

const outDir = path.resolve(process.argv[2] ?? 'art-source/npcs/vendor_ba/generated/candidates');
const previewDir = path.join(outDir, 'previews');
fs.mkdirSync(previewDir, { recursive: true });

const sheet = renderSheet([frames], PALETTE);
const file = path.join(outDir, `vendor_ba_idle_${VERSION}.png`);
writeFile(file, encodePng(sheet.w, sheet.h, sheet.buf));
writeFile(path.join(previewDir, `vendor_ba_idle_${VERSION}_x8.png`), preview(sheet, 8));
console.log(`✓ ${path.relative(process.cwd(), file)} (${sheet.w}x${sheet.h})`);
