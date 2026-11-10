/**
 * CHRONO – code-authored pixel art for Peter (Pipeline B, see AGENTS.md §5).
 *
 * Every pixel below is hand-placed from docs/art/PETER_DESIGN.md and the approved concept
 * (art-source/characters/peter/concept/peter_master_v1.png). No image model, no external reference.
 *
 * Output goes to art-source/characters/peter/generated/candidates/ ONLY. Candidates enter
 * public/assets/ after the project owner approves them (AGENTS.md §6).
 *
 * Usage: node scripts/author-peter-sprites.js [outDir]
 *
 * Sheet layout (matches src/systems/animation/PeterAnimationConfig.ts):
 *   rows = down, up, left, right; 32x32 frames; idle 4 frames, walk 6 frames.
 */
import path from 'path';
import fs from 'fs';
import {
  hex,
  blank,
  mirrorHalf,
  flipH,
  checkRows,
  paint,
  stamp,
  renderSheet,
  preview,
  encodePng,
  writeFile,
} from './pixel-art/pixel.js';

const VERSION = 'v2';
const SIZE = 32;
const EMPTY = '.'.repeat(SIZE);
/** Rows 0..24 hold head + torso; rows 25..31 hold the legs layer. */
const UPPER_END = 25;

/** Palette = PETER_DESIGN.md §4 swatches, plus outline and two derived accents. */
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
  l: hex('#453123'), // leather strap / belt
  L: hex('#5e4532'), // leather highlight (derived)
  m: hex('#8c96a8'), // aged silver
  r: hex('#181c24'), // trousers
  b: hex('#2e2219'), // boots
  g: hex('#00c8ff'), // chronal fracture glow (Broken Blade)
};

/** 32-wide row from {startCol: 'pixels'} segments. */
function row(spec = {}) {
  const r = Array(SIZE).fill('.');
  for (const [col, str] of Object.entries(spec)) {
    [...str].forEach((ch, i) => (r[Number(col) + i] = ch));
  }
  return r.join('');
}
const rows = (specs) => specs.map(row);
const padTo32 = (list) => list.concat(Array(SIZE - list.length).fill(EMPTY));

// ---------------------------------------------------------------- FRONT (down)
// Left half only; mirrored for symmetry, then asymmetric details are painted on.
// Hair: compact rounded dome of tight curls, curls rise up/out, full coverage at the
// temples, forehead clear (no fringe/bangs) — PETER_DESIGN.md hairstyle lock.
const frontHalf = [
  '................',
  '...........OO.OO',
  '.........OOjHOjH',
  '........OjHhjHHj',
  '.......OHhjHhHjH',
  '.......OhHjHHhHh',
  '.......OHhjHssss',
  '.......OhHjShhss',
  '.......OHhSsSEss',
  '........OhSssssS',
  '........OHSsssss',
  '.........OSSsssS',
  '.........OkcOSSs',
  '.......OOkccCOtt',
  '......OkkcccCPtt',
  '......OkcccccPtt',
  '......OccOccccPt',
  '......OccOccccPt',
  '......OcCOccccPt',
  '......OcCOllllll',
  '......OSsOccccPr',
  '.......OOOcccCPr',
  '.........OcccCPr',
  '.........OccCpOr',
  '.........OcCpOOr',
];
const front = paint(padTo32(mirrorHalf(frontHalf)), [
  [15, 9, 's'], // one-pixel nose shadow (light from upper left)
  // diagonal strap, viewer-right shoulder -> viewer-left hip (as in the approved concept)
  [20, 13, 'l'],
  [19, 14, 'l'],
  [18, 15, 'L'],
  [17, 16, 'l'],
  [16, 17, 'l'],
  [15, 18, 'l'],
  [14, 18, 'l'],
  [13, 19, 'm'], // strap buckle
  [15, 19, 'm'],
  [16, 19, 'm'], // belt buckle
  [20, 15, 'm'],
  [20, 17, 'm'], // silver toggle clasps
  [11, 20, 'm'],
  [11, 21, 'l'],
  [10, 22, 'g'], // Broken Blade hilt + cerulean fracture glint at the hip
]);

// ------------------------------------------------------------------ BACK (up)
const backHalf = [
  '................',
  '...........OO.OO',
  '.........OOjHOjH',
  '........OjHhjHHj',
  '.......OHhjHhHjH',
  '.......OhHjHHhHh',
  '.......OHhHjHhHj',
  '.......OhHjHhHjH',
  '.......OHhHHjHhH',
  '........OhHjHhHj',
  '........OHhHhHjH',
  '.........OhHHhHH',
  '.........OkkCkkk',
  '.......OOkcccccc',
  '......OkkcccccCc',
  '......Okcccccccc',
  '......OccOcccccc',
  '......OccOcccccC',
  '......OcCOcccccC',
  '......OcCOllllll',
  '......OSsOcccccC',
  '.......OOOccccCC',
  '.........OccccCp',
  '.........OcccCpp',
  '.........OcCCOOO',
];
const back = paint(padTo32(mirrorHalf(backHalf)), [
  // strap seen from behind: viewer-left shoulder -> viewer-right hip
  [11, 13, 'l'],
  [12, 14, 'l'],
  [13, 15, 'L'],
  [14, 16, 'l'],
  [15, 17, 'l'],
  [16, 18, 'l'],
  [17, 18, 'l'],
]);

// ---------------------------------------------------------- SIDE (left-facing)
const left = padTo32(
  rows([
    {},
    { 13: 'OO', 16: 'OO' },
    { 11: 'OOjHOjHOO' },
    { 10: 'OjHhjHHjHhO' },
    { 9: 'OHhjHhHjHhHO' },
    { 9: 'OhHjHHhHjHhO' },
    { 9: 'OsssjHhHjHHO' },
    { 9: 'OshhsHjHhHjO' },
    { 8: 'OssEsSShHjHhO' },
    { 7: 'OssssSSShjHhHO' },
    { 8: 'OsssssShHjHO' },
    { 9: 'OSsssShHhO' },
    { 10: 'OSSSOhHO' },
    { 10: 'OkkcCccckkO' },
    { 10: 'OkccCcccccO' },
    { 10: 'OPcCccccccO' },
    { 10: 'OPcccccccCO' },
    { 10: 'OPcccccccCO' },
    { 10: 'OPccclccCCO' },
    { 10: 'OllllllmllO' },
    { 10: 'OPcccccccCO' },
    { 10: 'OPcccccccCO' },
    { 10: 'OPccccccCCO' },
    { 10: 'OPPcccccCCO' },
    { 10: 'OOPpcccCCOO' },
  ]),
);
/** Near arm hanging in front of the torso (separate layer so it can swing). */
const sideArm = padTo32(
  rows([
    ...Array(13).fill({}),
    { 13: 'OkkO' },
    { 13: 'OkcO' },
    { 13: 'OccO' },
    { 13: 'OccO' },
    { 13: 'OcCO' },
    { 13: 'OcCO' },
    { 13: 'OpPO' },
    { 13: 'OssO' },
    { 14: 'OO' },
  ]),
);

// ----------------------------------------------------------------- LEG POSES
const FRONT_LEG = ['OrrrO', 'OrrrO', 'ObbbO', 'ObbbbO', 'OblllO', 'OOOOOO'];

/** Front/back legs. A lifted leg is drawn 1px higher (mid-stride, foot off the ground). */
function frontLegs(liftLeft = 0, liftRight = 0) {
  const out = blank(SIZE);
  const place = (startCol, lift, mirrored) => {
    FRONT_LEG.forEach((s, i) => {
      const str = mirrored ? [...s].reverse().join('') : s;
      const col = mirrored ? startCol - str.length + 1 : startCol;
      const y = 25 + i - lift;
      out[y] = out[y].slice(0, col) + str + out[y].slice(col + str.length);
    });
  };
  place(9, liftLeft, false); // viewer-left leg, cols 9..14
  place(22, liftRight, true); // viewer-right leg, cols 17..22
  return out;
}

const SIDE_LEGS = {
  stand: [
    { 12: 'OrrrrO' },
    { 12: 'OrrrrO' },
    { 12: 'ObbbbO' },
    { 11: 'ObbbbbO' },
    { 10: 'OblllbO' },
    { 10: 'OOOOOOO' },
  ],
  stride: [
    { 11: 'OrrrOrrO' },
    { 10: 'OrrrO.OrrO' },
    { 9: 'ObbbO...ObbO' },
    { 8: 'ObbbbO...ObbO' },
    { 7: 'OblllbO..ObbbO' },
    { 7: 'OOOOOOO..OOOOO' },
  ],
  pass: [
    { 12: 'OrrrrO' },
    { 12: 'OrrOrO' },
    { 12: 'ObbOrrO' },
    { 11: 'ObbbbObbO' },
    { 10: 'OblllbOOO' },
    { 10: 'OOOOOOO' },
  ],
};

function sideLegs(pose) {
  const out = blank(SIZE);
  SIDE_LEGS[pose].forEach((spec, i) => (out[25 + i] = row(spec)));
  return out;
}

// --------------------------------------------------------------- COMPOSITION
const upperOnly = (full) => full.map((r, y) => (y < UPPER_END ? r : EMPTY));

/** Moves rows [from..to] of a layer down by 1px (breath / step bob). */
function shiftDown(layer, from, to) {
  const out = [...layer];
  for (let y = to; y >= from; y--) out[y + 1] = layer[y];
  out[from] = EMPTY;
  return out;
}

function compose(legs, upper, overlays = []) {
  let frame = stamp(blank(SIZE), legs);
  frame = stamp(frame, upper);
  for (const o of overlays) frame = stamp(frame, o.layer, o.dx ?? 0, o.dy ?? 0);
  return frame;
}

const VIEWS = {
  down: { upper: upperOnly(front), side: false },
  up: { upper: upperOnly(back), side: false },
  left: { upper: upperOnly(left), side: true },
};

/** Idle: 4 frames; frames 2-3 lower head and shoulders by 1px (slow breath). */
function idleFrames(view) {
  const v = VIEWS[view];
  const legs = v.side ? sideLegs('stand') : frontLegs();
  const breath = shiftDown(v.upper, 0, 13);
  const arm = v.side ? [{ layer: sideArm }] : [];
  return [v.upper, v.upper, breath, breath].map((upper) => compose(legs, upper, arm));
}

/** Walk: 6 frames — contact, down (bob), pass, opposite contact, down, pass. */
function walkFrames(view) {
  const v = VIEWS[view];
  const bob = shiftDown(v.upper, 0, UPPER_END - 1);
  if (v.side) {
    const seq = [
      ['stride', 0, -1],
      ['stride', 1, -1],
      ['pass', 0, 0],
      ['stride', 0, 1],
      ['stride', 1, 1],
      ['pass', 0, 0],
    ];
    return seq.map(([pose, down, swing]) =>
      compose(sideLegs(pose), down ? bob : v.upper, [{ layer: sideArm, dx: swing, dy: down }]),
    );
  }
  const seq = [
    [0, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
    [1, 0, 0],
    [1, 0, 1],
    [0, 0, 0],
  ];
  return seq.map(([liftL, liftR, down]) => compose(frontLegs(liftL, liftR), down ? bob : v.upper));
}

/** Rows in PeterAnimationConfig order: down, up, left, right (right = mirrored left). */
function buildGrid(framesFor) {
  const leftFrames = framesFor('left');
  const grid = [framesFor('down'), framesFor('up'), leftFrames, leftFrames.map(flipH)];
  grid.flat().forEach((f, i) => checkRows(f, `frame ${i}`));
  return grid;
}

// --------------------------------------------------------------------- OUTPUT
const outDir = path.resolve(process.argv[2] ?? 'art-source/characters/peter/generated/candidates');
const previewDir = path.join(outDir, 'previews');
fs.mkdirSync(previewDir, { recursive: true });

for (const [name, framesFor] of [
  ['idle', idleFrames],
  ['walk', walkFrames],
]) {
  const sheet = renderSheet(buildGrid(framesFor), PALETTE);
  const file = path.join(outDir, `peter_${name}_${VERSION}.png`);
  writeFile(file, encodePng(sheet.w, sheet.h, sheet.buf));
  writeFile(path.join(previewDir, `peter_${name}_${VERSION}_x6.png`), preview(sheet, 6));
  console.log(`✓ ${path.relative(process.cwd(), file)} (${sheet.w}x${sheet.h})`);
}
