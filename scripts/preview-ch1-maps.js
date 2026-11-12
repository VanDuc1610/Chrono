/**
 * Renders the Chapter 1 layouts (scripts/ch1-layout.js) with the approved tilesets, for review.
 * Usage: node scripts/preview-ch1-maps.js  →  art-source/maps/chapter1/previews/<map>.png
 */
import fs from 'fs';
import path from 'path';
import { parsePNG } from './validate-candidate.js';
import { renderLayout, scaledPng } from './pixel-art/tile-kit.js';
import { writeFile } from './pixel-art/pixel.js';
import { CH1_MAPS } from './ch1-layout.js';
import { CH2_MAPS } from './ch2-layout.js';

/** `node <script> ch2` builds Chapter 2 instead of Chapter 1. */
const CH2 = process.argv[2] === 'ch2';
const MAPS = CH2 ? CH2_MAPS : CH1_MAPS;

const SHEETS = {
  // v2 candidates (Chapter 1 props) until approved, then the deployed files.
  wilds: fs.existsSync('art-source/environment/wilds/generated/candidates/wilds_tileset_v2.png')
    ? 'art-source/environment/wilds/generated/candidates/wilds_tileset_v2.png'
    : 'public/assets/tilesets/wilds_tileset.png',
  coastal: fs.existsSync(
    'art-source/environment/coastal/generated/candidates/coastal_tileset_v2.png',
  )
    ? 'art-source/environment/coastal/generated/candidates/coastal_tileset_v2.png'
    : 'public/assets/tilesets/coastal_tileset.png',
  dungeon: 'public/assets/tilesets/dungeon_tileset.png',
  // Candidate until approved (ENV_SUNKEN_001).
  sunken: fs.existsSync('public/assets/tilesets/sunken_tileset.png')
    ? 'public/assets/tilesets/sunken_tileset.png'
    : 'art-source/environment/sunken/generated/candidates/sunken_tileset_v1.png',
};

function loadSheet(file) {
  const { ihdr, pixels } = parsePNG(file);
  return { w: ihdr.width, h: ihdr.height, buf: Buffer.from(pixels), cols: ihdr.width / 32 };
}

const outDir = CH2 ? 'art-source/maps/chapter2/previews' : 'art-source/maps/chapter1/previews';
fs.mkdirSync(outDir, { recursive: true });
for (const def of MAPS) {
  const sheet = loadSheet(SHEETS[def.tileset]);
  const layout = def.build();
  writeFile(
    path.join(outDir, `${def.id}.png`),
    scaledPng(renderLayout(sheet, layout, sheet.cols), 1),
  );
  if (layout.extraLayers?.Walls_LowTide) {
    const low = { ...layout, walls: layout.extraLayers.Walls_LowTide };
    writeFile(
      path.join(outDir, `${def.id}_low_tide.png`),
      scaledPng(renderLayout(sheet, low, sheet.cols), 1),
    );
  }
  console.log(`✓ ${def.id} (${layout.width}x${layout.height})`);
}
