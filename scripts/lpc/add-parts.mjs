/**
 * Adds LPC character-generator sheets to art-source/lpc/manifest.json with their credits taken
 * from the pinned CREDITS.csv (art-source/lpc/credits/characters.csv). Then run
 * `node scripts/lpc/fetch-lpc.mjs --pin` to download, verify and pin them.
 *
 * Usage: node scripts/lpc/add-parts.mjs body/bodies/female/walk.png hair/plain/adult/walk.png ...
 */
import fs from 'fs';

const REPO = 'LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator';
const SHA = '04140673ec02906f8233523639733c83690df750';
const manifestPath = 'art-source/lpc/manifest.json';

/** One CSV line into fields (quoted fields may hold commas). */
function fields(line) {
  const out = [];
  let cur = '';
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (ch === ',' && !quoted) {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}
const list = (s) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

/** CREDITS.csv spelling to the SPDX-like ids the manifest uses ("CC0" -> CC0-1.0; "3.0+" -> 3.0). */
const licenceId = (l) => (l === 'CC0' ? 'CC0-1.0' : l.replace(/ /g, '-').replace(/\+$/, ''));

const rows = new Map(
  fs
    .readFileSync('art-source/lpc/credits/characters.csv', 'utf8')
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map((l) => {
      const f = fields(l);
      return [f[0], f];
    }),
);
const entries = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
for (const p of process.argv.slice(2)) {
  const row = rows.get(p);
  if (!row) throw new Error(`Not in CREDITS.csv: ${p}`);
  const [, notes, authors, licenses, urls] = row;
  const id = `character-${p
    .replace(/\/walk\.png$/, '')
    .replace(/\.png$/, '')
    .replace(/[/_]/g, '-')}`;
  if (entries.some((e) => e.id === id || e.path === `spritesheets/${p}`)) continue;
  if (!authors || !licenses) throw new Error(`No authors or licence: ${p}`);
  entries.push({
    id,
    repo: REPO,
    sha: SHA,
    path: `spritesheets/${p}`,
    file: `art-source/lpc/raw/characters/${p}`,
    authors: list(authors),
    licenses: [...new Set(list(licenses).map(licenceId))],
    urls: list(urls),
    notes: notes || 'Unmodified source PNG; credits from pinned CREDITS.csv.',
  });
  console.log(`added ${id}`);
}
fs.writeFileSync(manifestPath, JSON.stringify(entries, null, 2) + '\n');
