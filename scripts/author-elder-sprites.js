/**
 * CHRONO – code-authored pixel art for the Elder Chronographer (Pipeline B, AGENTS.md §5).
 *
 * Every pixel is hand-placed from docs/art/ELDER_DESIGN.md (written spec only — no concept image
 * exists). No image model, no external reference. Output goes to
 * art-source/npcs/elder/generated/candidates/ ONLY; owner approval is required before anything
 * is copied to public/assets/ (AGENTS.md §6).
 *
 * Usage: node scripts/author-elder-sprites.js [outDir]
 *
 * Sheet: elder_idle_<ver>.png — 4 frames × 32 px, facing down (ELDER_DESIGN §5: default facing
 * front; 4-frame breathing cycle with a pulsing astrolabe shard).
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

const VERSION = 'v2';
const EMPTY = '.'.repeat(32);

/** ELDER_DESIGN.md §2-4 swatches, plus outline and derived leather/oak tones. */
const PALETTE = {
  O: hex('#120f17'), // outline
  I: hex('#161a29'), // robe slate-navy (cowl, mantle)
  i: hex('#28324f'), // robe highlight (hood rim, shoulders)
  g: hex('#262d3d'), // slate-gray cassock
  B: hex('#8c6628'), // aged bronze / brass (stole, hem trim, astrolabe)
  Y: hex('#ffd666'), // chrono amber glow (staff shard)
  w: hex('#e8edf5'), // silver hair / beard
  W: hex('#8c97ad'), // hair shadow
  s: hex('#c9b097'), // parchment skin
  S: hex('#9e836b'), // skin shadow
  e: hex('#d19e34'), // amber-gold eyes
  l: hex('#4a3626'), // leather girdle / satchel (derived)
  o: hex('#5b4a3a'), // petrified oak staff (derived)
  f: hex('#221d18'), // scholar slippers
};

// Left half (cols 0..15), mirrored. Deep cowl, snow-white hair at the temples, beard to the
// chest, gold-embroidered stole over both shoulders, cassock to the floor with bronze hem.
const baseHalf = [
  '................', // 0
  '................', // 1
  '............OOOO', // 2  cowl
  '..........OOiIII', // 3
  '.........OiIIIII', // 4
  '........OiIIOOOO', // 5  hood opening
  '........OiIOwsss', // 6  silver hair at the temple, brow
  '........OiIOwSes', // 7  amber eye
  '........OiIOwsss', // 8
  '........OiIOwwss', // 9  beard begins
  '.......OiIIOwwww', // 10
  '......OiIIIIOwww', // 11 mantle over stooped shoulders
  '.....OiIBIIIIOWw', // 12 embroidered stole
  '.....OiIBIIIgOWw', // 13
  '.....OIIBIIIggOw', // 14 beard tip
  '.....OIIBIIIgggg', // 15
  '.....OIIBIIIgggg', // 16
  '....OIIIBIIIllll', // 17 leather girdle
  '....OIIIIIIIgggg', // 18
  '....OIIIIIIIgggg', // 19
  '....OIIIIIIIgggg', // 20
  '....OIIIIIIIgggg', // 21
  '....OiIIIIIIgggg', // 22
  '....OIIIIIIIgggg', // 23
  '....OIIIIIIIgggg', // 24
  '....OIIIIIIIgggg', // 25
  '....OIIIIIIIgggg', // 26
  '....OBBBBBBBBBBB', // 27 bronze hem
  '.....OOOOOOOOffO', // 28 slippers peek out
  '.............OOO', // 29
  '................',
  '................',
];

const base = paint(mirrorHalf(baseHalf), [
  // asymmetric face detail: nose shadow, closed contemplative mouth line in the beard
  [15, 8, 'S'],
  [15, 10, 'W'],
  [16, 10, 'W'],
  // right hand resting at the side (viewer-left) + scroll satchel at the right hip
  [4, 16, 'O'],
  [4, 15, 'O'],
  [5, 16, 's'],
  [5, 17, 'S'],
  [6, 18, 'l'],
  [7, 18, 'l'],
  [6, 19, 'l'],
  [7, 19, 'l'],
  [5, 18, 'O'],
  [5, 19, 'O'],
  [6, 20, 'O'],
  [7, 20, 'O'],
  // left hand (viewer-right) gripping the astrolabe staff
  [24, 16, 's'],
  [25, 16, 'S'],
  ...Array.from({ length: 21 }, (_, k) => [26, 8 + k, 'o']),
  ...Array.from({ length: 21 }, (_, k) => [27, 8 + k, 'O']),
  [26, 29, 'O'],
]);

/** Astrolabe head: bronze ring around a suspended amber shard; `phase` rotates the ring gap. */
function astrolabe(phase, glow) {
  const ring = [
    [25, 3],
    [26, 2],
    [27, 2],
    [28, 3],
    [28, 4],
    [28, 5],
    [27, 6],
    [26, 6],
    [25, 5],
    [25, 4],
  ];
  const px = ring.map(([x, y], idx) => [x, y, (idx + phase) % 5 === 0 ? 'O' : 'B']);
  return [
    ...px,
    [26, 4, glow ? 'Y' : 'B'],
    [27, 4, 'Y'],
    [26, 3, glow ? 'Y' : 'O'],
    [27, 5, glow ? 'Y' : 'O'],
    [26, 7, 'B'], // collar joining ring to staff
    [24, 2, 'O'],
    [29, 4, 'O'],
    [26, 1, 'O'],
    [27, 1, 'O'],
  ];
}

/** Breath: lower head, mantle and beard by 1px (rows 2..14). */
function breathe(rows) {
  const out = [...rows];
  for (let y = 14; y >= 2; y--) out[y + 1] = rows[y];
  out[2] = EMPTY;
  return out;
}

const restBody = base;
// Staff column must not move when breathing: re-stamp it after shifting.
const staffCols = (rows) =>
  paint(
    rows,
    Array.from({ length: 22 }, (_, k) => [
      [26, 8 + k, base[8 + k][26]],
      [27, 8 + k, base[8 + k][27]],
    ]).flat(),
  );
const breathBody = staffCols(breathe(base));

const frames = [
  paint(restBody, astrolabe(0, true)),
  paint(restBody, astrolabe(1, false)),
  paint(breathBody, astrolabe(2, true)),
  paint(breathBody, astrolabe(3, false)),
];
frames.forEach((f, i) => checkRows(f, `elder frame ${i}`));

const outDir = path.resolve(process.argv[2] ?? 'art-source/npcs/elder/generated/candidates');
const previewDir = path.join(outDir, 'previews');
fs.mkdirSync(previewDir, { recursive: true });

const sheet = renderSheet([frames], PALETTE);
const file = path.join(outDir, `elder_idle_${VERSION}.png`);
writeFile(file, encodePng(sheet.w, sheet.h, sheet.buf));
writeFile(path.join(previewDir, `elder_idle_${VERSION}_x8.png`), preview(sheet, 8));
console.log(`✓ ${path.relative(process.cwd(), file)} (${sheet.w}x${sheet.h})`);
