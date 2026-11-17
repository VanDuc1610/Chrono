import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { readDerived, renderCredits } from './credits.mjs';

function pngs(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = `${directory}/${entry.name}`;
    return entry.isDirectory() ? pngs(file) : /\.png$/i.test(file) ? [file] : [];
  });
}

export async function auditCredits() {
  const manifest = JSON.parse(readFileSync('art-source/lpc/manifest.json', 'utf8'));
  // Game assets cut or recoloured from the vendored sources (T-88), each naming its sources.
  const derived = readDerived();
  return {
    derived: derived.map((entry) => ({
      ...entry,
      hash: createHash('sha256').update(readFileSync(entry.file)).digest('hex'),
    })),
    pngs: [...pngs('art-source/lpc/raw'), ...pngs('public/assets/lpc')],
    assets: manifest.map((entry) => {
      const bytes = readFileSync(entry.file);
      return {
        file: entry.file,
        signature: [...bytes.subarray(0, 8)],
        hash: createHash('sha256').update(bytes).digest('hex'),
      };
    }),
    rendered: await renderCredits(manifest, derived),
    committed: readFileSync('CREDITS.md', 'utf8'),
  };
}
