import zlib from 'node:zlib';

/**
 * Reads ONE named member out of a ZIP held in memory (stored or deflated), without extracting
 * anything else and without running anything. Used for the audio packs whose source is an archive
 * (T-97): the manifest names the exact member; anything unexpected throws.
 */
export function readZipMember(zip, name) {
  // End of central directory: the last 22+ bytes hold its signature.
  let eocd = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 65557); i--)
    if (zip.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  if (eocd < 0) throw new Error('Not a ZIP (no end of central directory)');
  const count = zip.readUInt16LE(eocd + 10);
  let p = zip.readUInt32LE(eocd + 16);
  for (let n = 0; n < count; n++) {
    if (zip.readUInt32LE(p) !== 0x02014b50) throw new Error('Corrupt central directory');
    const method = zip.readUInt16LE(p + 10);
    const compSize = zip.readUInt32LE(p + 20);
    const size = zip.readUInt32LE(p + 24);
    const nameLen = zip.readUInt16LE(p + 28);
    const extraLen = zip.readUInt16LE(p + 30);
    const commentLen = zip.readUInt16LE(p + 32);
    const local = zip.readUInt32LE(p + 42);
    const entryName = zip.toString('utf8', p + 46, p + 46 + nameLen);
    p += 46 + nameLen + extraLen + commentLen;
    if (entryName !== name) continue;
    if (zip.readUInt32LE(local) !== 0x04034b50) throw new Error('Corrupt local header');
    const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
    const data = zip.subarray(start, start + compSize);
    const out = method === 0 ? Buffer.from(data) : method === 8 ? zlib.inflateRawSync(data) : null;
    if (!out) throw new Error(`Unsupported compression ${method} for ${name}`);
    if (out.length !== size) throw new Error(`Size mismatch for ${name}`);
    return out;
  }
  throw new Error(`Member not found: ${name}`);
}
