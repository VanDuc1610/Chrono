import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const manifestPath = 'art-source/lpc/manifest.json';
const entries = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const pin = process.argv.includes('--pin');
const sources = new Map([
  ['LiberatedPixelCup/RPG_Maker_MZ_LPC_Starter_Kit', 'c4b2dafe697b6fc7f53aa35d8727afe7542d6e2a'],
  [
    'LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator',
    '04140673ec02906f8233523639733c83690df750',
  ],
]);
const root = path.resolve('art-source/lpc/raw');
for (const entry of entries) {
  const target = path.resolve(entry.file);
  if (
    sources.get(entry.repo) !== entry.sha ||
    !target.startsWith(root + path.sep) ||
    !entry.path.endsWith('.png') ||
    entry.path.split('/').includes('..')
  ) {
    throw new Error(`Unsafe source or destination: ${entry.id}`);
  }
  if (!entry.sha256 && !pin) throw new Error(`Unpinned asset: ${entry.id}`);
  let bytes;
  let missing = false;
  try {
    bytes = await fs.readFile(target);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    missing = true;
    const host = entry.repo.endsWith('Starter_Kit')
      ? 'https://media.githubusercontent.com/media'
      : 'https://raw.githubusercontent.com';
    const response = await fetch(
      `${host}/${entry.repo}/${entry.sha}/${entry.path.split('/').map(encodeURIComponent).join('/')}`,
    );
    if (!response.ok) throw new Error(`${entry.id}: HTTP ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
  }
  if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
    throw new Error(`Not a PNG: ${entry.id}`);
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (entry.sha256 && entry.sha256 !== hash) throw new Error(`Checksum mismatch: ${entry.id}`);
  if (!entry.sha256) entry.sha256 = hash;
  if (missing) {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, bytes);
  }
  console.log(`${entry.id}: verified`);
}
if (pin) await fs.writeFile(manifestPath, JSON.stringify(entries, null, 2) + '\n');
