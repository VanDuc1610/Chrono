/**
 * CHRONO – code-authored pixel art for the Temporal Shade (Pipeline B, see AGENTS.md §5).
 *
 * Every pixel is hand-placed from docs/art/SHADE_DESIGN.md (no concept image exists; written spec
 * only). No image model, no external reference. Output goes to
 * art-source/enemies/temporal_shade/generated/candidates/ ONLY — owner approval is required
 * before anything is copied to public/assets/ (AGENTS.md §6).
 *
 * Usage: node scripts/author-shade-sprites.js [outDir]
 *
 * Sheet: shade_float_<ver>.png — 4 frames × 32 px in one row (idle / float loop, 6 FPS).
 * The vertical hover bob stays a runtime tween; frames animate the core pulse, claws and mist.
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

/** SHADE_DESIGN.md §3 swatches + one derived mantle highlight. */
const PALETTE = {
  V: hex('#0e0614'), // Abyssal Void — outline, cowl depths, face hollow
  N: hex('#260b1e'), // Null Violet — mantle mid-tone
  n: hex('#3d1631'), // mantle rim light (derived from Null Violet)
  A: hex('#6b153e'), // Abyssal Claret — core outer glow
  K: hex('#b82352'), // Fracture Carmine — core body, claw tips
  R: hex('#ff4d79'), // Temporal Bleed Rose — core apex
  e: hex('#00c8ff'), // Cerulean Eye Spark — eyes
};

// Left half (cols 0..15), mirrored. Levitating hooded humanoid, no legs: the body tapers into
// mist ending ~5 px above the ground plane (row 30) per §4 "Levitation Offset".
const baseHalf = [
  '................', // 0
  '...............V', // 1  hood peak
  '..............Vn', // 2
  '.............VnN', // 3
  '............VnNN', // 4
  '...........VnNNN', // 5
  '..........VnNNVV', // 6  hollow under the cowl
  '..........VnNVVV', // 7
  '..........VnNVeV', // 8  cerulean pinpoint eye
  '..........VNNVVV', // 9
  '.........VNNNNVV', // 10
  '........VnNNNNNA', // 11 shoulders; jagged fracture core (diamond, rows 11-15)
  '.......VnNNNNNAR', // 12
  '......VnNVNNNAKR', // 13
  '.....VnNV.VNNNAK', // 14 elongated spectral arms part from the body
  '....VnNV..VNNNNA', // 15
  '...VnNV...VNNNNN', // 16
  '...VNV....VNNNNN', // 17
  '..VKV.....VNNNNN', // 18 claw
  '.VKVK.....VNNNNN', // 19 talons
  '.K..K......VNNNN', // 20
  '...........VNNNN', // 21 mist tail tapering to a point
  '............VNNN', // 22
  '............VNVN', // 23
  '.............VNN', // 24
  '..............VN', // 25
  '...............V', // 26 lowest pixel: 4 px above the ground plane (row 30)
  '................',
  '................',
  '................',
  '................',
  '................',
];

const base = mirrorHalf(baseHalf);
checkRows(base, 'shade base');

/** Per-frame variations: core pulse, claws drifting, mist tail wisps trading sides. */
const frames = [
  // 0: rest
  base,
  // 1: core flares — rose floods the crystal; a wisp breaks off the tail
  paint(base, [
    [14, 12, 'R'],
    [17, 12, 'R'],
    [14, 13, 'R'],
    [17, 13, 'R'],
    [15, 14, 'R'],
    [16, 14, 'R'],
    [14, 27, 'V'],
  ]),
  // 2: talons flex inward, core settles
  paint(base, [
    [1, 20, '.'],
    [4, 20, '.'],
    [2, 20, 'K'],
    [3, 20, 'K'],
    [30, 20, '.'],
    [27, 20, '.'],
    [29, 20, 'K'],
    [28, 20, 'K'],
  ]),
  // 3: core dims to claret; the opposite wisp trails
  paint(base, [
    [15, 12, 'K'],
    [16, 12, 'K'],
    [15, 13, 'K'],
    [16, 13, 'K'],
    [17, 27, 'V'],
  ]),
];
frames.forEach((f, i) => checkRows(f, `shade frame ${i}`));

const outDir = path.resolve(
  process.argv[2] ?? 'art-source/enemies/temporal_shade/generated/candidates',
);
const previewDir = path.join(outDir, 'previews');
fs.mkdirSync(previewDir, { recursive: true });

const sheet = renderSheet([frames], PALETTE);
const file = path.join(outDir, `shade_float_${VERSION}.png`);
writeFile(file, encodePng(sheet.w, sheet.h, sheet.buf));
writeFile(path.join(previewDir, `shade_float_${VERSION}_x8.png`), preview(sheet, 8));
console.log(`✓ ${path.relative(process.cwd(), file)} (${sheet.w}x${sheet.h})`);
