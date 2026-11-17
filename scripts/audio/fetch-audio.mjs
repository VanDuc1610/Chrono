import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { prepareAudio } from './prepare-audio.mjs';
import { readZipMember } from './zip.mjs';
import { setDefaultResultOrder } from 'node:dns';
setDefaultResultOrder('ipv4first');

const file = 'art-source/audio/manifest.json';
const manifest = JSON.parse(await fs.readFile(file, 'utf8'));
const pin = process.argv.includes('--pin');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
export function signature(bytes) {
  if (bytes.subarray(0, 4).toString() === 'OggS') return 'ogg';
  if (bytes.subarray(0, 3).toString() === 'ID3' || (bytes[0] === 255 && (bytes[1] & 224) === 224))
    return 'mp3';
  if (bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WAVE')
    return 'wav';
  if (bytes[0] === 80 && bytes[1] === 75 && bytes[2] === 3 && bytes[3] === 4) return 'zip';
  throw new Error('Unrecognised audio/archive signature');
}
for (const entry of manifest) {
  // Dropped sources and archive packs (only their named members ship) are skipped.
  if (entry.status === 'dropped' || entry.status === 'archive') continue;
  const target = path.resolve(entry.file);
  if (
    !target.startsWith(path.resolve('public/assets/audio') + path.sep) ||
    !/^[a-z0-9_]+$/.test(entry.id)
  )
    throw new Error('Unsafe output path');
  const url = new URL(entry.directUrl);
  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'opengameart.org' ||
    !url.pathname.startsWith('/sites/default/files/')
  )
    throw new Error('Unapproved source URL');
  let output;
  try {
    output = await fs.readFile(target);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (output && entry.sha256) {
    signature(output);
    if (hash(output) !== entry.sha256) throw new Error(`Output checksum mismatch: ${entry.id}`);
    console.log(`${entry.id}: verified local`);
    continue;
  }
  if (!pin && (!entry.sha256 || !entry.sourceSha256))
    throw new Error(`Unpinned audio: ${entry.id}`);
  // Archive members share their pack's cached download (`archiveId`).
  const raw =
    'art-source/audio/raw/' +
    (entry.archiveId ?? entry.id) +
    '.' +
    new URL(entry.directUrl).pathname.split('.').pop();
  let source;
  try {
    source = await fs.readFile(raw);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (!source) {
    let last;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        source = Buffer.from(await response.arrayBuffer());
        break;
      } catch (error) {
        last = error;
      }
    }
    if (!source) throw last;
  }
  if (source.length > 100_000_000) throw new Error('Oversized source');
  const format = signature(source);
  if (format === 'zip' && !entry.member)
    throw new Error('Archive source needs an explicit member preparation');
  const sourceHash = hash(source);
  if (entry.sourceSha256 && entry.sourceSha256 !== sourceHash)
    throw new Error(`Source checksum mismatch: ${entry.id}`);
  entry.sourceSha256 = sourceHash;
  await fs.mkdir(path.dirname(raw), { recursive: true });
  await fs.writeFile(raw, source);
  // A named member is read out of the archive (nothing else is extracted, nothing is run).
  const media = format === 'zip' ? readZipMember(source, entry.member) : source;
  const mediaFormat = signature(media);
  // Sound effects are short: shipped as they are (WAV); music is trimmed like the other tracks.
  const info =
    entry.kind === 'sfx'
      ? { bytes: media, format: mediaFormat, duration: undefined }
      : prepareAudio(media);
  if (!target.endsWith('.' + info.format)) throw new Error('Output format must match source');
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, info.bytes);
  output = await fs.readFile(target);
  if (!['ogg', 'mp3', 'wav'].includes(signature(output)) || output.length > 2_500_000)
    throw new Error(`Invalid/oversized output: ${entry.id}`);
  const digest = hash(output);
  if (entry.sha256 && digest !== entry.sha256)
    throw new Error(`Prepared checksum mismatch: ${entry.id}; use the pinned encoder version`);
  entry.sha256 = digest;
  entry.processing =
    entry.kind === 'sfx'
      ? { format: info.format, method: 'Archive member shipped unmodified' }
      : {
          duration: info.duration,
          format: info.format,
          method: 'Node frame/page trim; runtime crossfade loop',
        };
  entry.status = 'kept';
  if (pin) await fs.writeFile(file, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`${entry.id}: pinned ${output.length} bytes`);
}
