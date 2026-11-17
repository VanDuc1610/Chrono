/**
 * T-86: writes public/assets/data/neon.json for every map — the neon line-art skin rises chapter by
 * chapter (owner, 2026-11-17): outlines over the tiles at first, the floor dimming and the stars
 * coming out mid-story, the whole world turned to glowing lines over a void from Chapter 6 on.
 * Hand-tuned entries listed in KEEP are left as they are (approved previews).
 * Idempotent.
 *
 * Usage: node scripts/neon.mjs
 */
import fs from 'fs';

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const OUT = 'public/assets/data/neon.json';
const maps = read('public/assets/data/maps.json').maps;
const old = fs.existsSync(OUT) ? read(OUT).maps : {};
const KEEP = new Set(['map_ch1_shore_gate', 'map_ch9_apex_nexus']);

/** Per chapter: strength (1 = full void), outline colour, accent colour, void colour. */
const THEMES = {
  0: { level: 0.25, line: '#7fd8ff', accent: '#ffc46b' },
  1: { level: 0.3, line: '#5ee7ff', accent: '#ffc46b' },
  2: { level: 0.4, line: '#7fb4ff', accent: '#ffb86b' },
  3: { level: 0.5, line: '#8affc8', accent: '#ffd36b', void: '#040b0a' },
  4: { level: 0.6, line: '#ff8a7a', accent: '#ffd36b', void: '#0c0506' },
  5: { level: 0.7, line: '#6bf0ff', accent: '#ff9ad5', void: '#04080e' },
  6: { level: 1, line: '#dfe9ff', accent: '#ffd36b', void: '#080a16', ghost: 0.14 },
  7: { level: 1, line: '#ff9a5e', accent: '#ffe08a', void: '#0c0504', ghost: 0.1 },
  8: { level: 1, line: '#8affe4', accent: '#ff8ad8', void: '#030a0c', ghost: 0.08 },
  9: { level: 1, line: '#b98cff', accent: '#ffd36b', void: '#06030f', ghost: 0.08 },
};

const out = {};
for (const [id, m] of Object.entries(maps)) {
  if (KEEP.has(id) && old[id]) {
    out[id] = old[id];
    continue;
  }
  out[id] = { ...THEMES[m.chapter ?? 0] };
}
fs.writeFileSync(OUT, JSON.stringify({ maps: out }, null, 2) + '\n');
console.log(`neon.json: ${Object.keys(out).length} maps`);
