/**
 * Writes public/assets/data/neon.json: the accent colour of the neon marks on every map (rings on
 * points of interest, frames on exits and puzzle pieces), by chapter. Every chapter is drawn in LPC
 * art since 2026-11-18 (owner); the line-art void of T-86 was retired, so accents are all there is.
 * Idempotent.
 *
 * Usage: node scripts/neon.mjs
 */
import fs from 'fs';

const OUT = 'public/assets/data/neon.json';
const maps = JSON.parse(fs.readFileSync('public/assets/data/maps.json', 'utf8')).maps;

/** Accent colour per chapter. */
const ACCENT = {
  0: '#ffc46b',
  1: '#ffc46b',
  2: '#ffb86b',
  3: '#ffd36b',
  4: '#ffd36b',
  5: '#ff9ad5',
  6: '#ffd36b',
  7: '#ffe08a',
  8: '#ff8ad8',
  9: '#ffd36b',
};

const out = {};
for (const [id, m] of Object.entries(maps))
  out[id] = { accent: ACCENT[m.chapter ?? 0] ?? ACCENT[0] };
fs.writeFileSync(OUT, JSON.stringify({ maps: out }, null, 2) + '\n');
console.log(`neon.json: ${Object.keys(out).length} maps`);
