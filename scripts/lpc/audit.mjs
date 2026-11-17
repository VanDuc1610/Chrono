import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { renderCredits } from './credits.mjs';

function pngs(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = `${directory}/${entry.name}`;
    return entry.isDirectory() ? pngs(file) : /\.png$/i.test(file) ? [file] : [];
  });
}

export async function auditCredits() {
  const manifest = JSON.parse(readFileSync('art-source/lpc/manifest.json', 'utf8'));
  return {
    pngs: [...pngs('art-source/lpc/raw'), ...pngs('public/assets/lpc')],
    assets: manifest.map((entry) => {
      const bytes = readFileSync(entry.file);
      return {
        file: entry.file,
        signature: [...bytes.subarray(0, 8)],
        hash: createHash('sha256').update(bytes).digest('hex'),
      };
    }),
    rendered: await renderCredits(manifest),
    committed: readFileSync('CREDITS.md', 'utf8'),
  };
}
