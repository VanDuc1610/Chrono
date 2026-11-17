/** Trim only on codec frame/page boundaries. No downloaded code is ever executed. */
export function prepareAudio(bytes, seconds = 60, maxBytes = 2_400_000) {
  if (bytes.subarray(0, 4).toString() === 'OggS') {
    const pages = [];
    let offset = 0;
    let rate = 0;
    let duration = 0;
    while (offset < bytes.length) {
      if (bytes.subarray(offset, offset + 4).toString() !== 'OggS')
        throw new Error('Invalid Ogg page');
      const segments = bytes[offset + 26];
      const header = 27 + segments;
      const length =
        header + [...bytes.subarray(offset + 27, offset + header)].reduce((a, b) => a + b, 0);
      if (offset + length > bytes.length) throw new Error('Truncated Ogg page');
      const page = Buffer.from(bytes.subarray(offset, offset + length));
      if (!pages.length) {
        if (page.subarray(header, header + 7).toString('binary') !== '\x01vorbis')
          throw new Error('Only Vorbis Ogg accepted');
        rate = page.readUInt32LE(header + 12);
        if (!rate) throw new Error('Invalid sample rate');
      }
      const granule = page.readBigUInt64LE(6);
      const elapsed = granule === 0xffffffffffffffffn ? duration : Number(granule) / rate;
      if (pages.length >= 3 && (elapsed > seconds || offset + length > maxBytes)) break;
      pages.push(page);
      duration = elapsed;
      offset += length;
    }
    if (pages.length < 3 || duration <= 1) throw new Error('Ogg excerpt too short');
    const last = pages.at(-1);
    last[5] |= 4;
    last.fill(0, 22, 26);
    let crc = 0;
    for (const byte of last) {
      crc ^= byte << 24;
      for (let i = 0; i < 8; i++) crc = (crc << 1) ^ (crc & 0x80000000 ? 0x04c11db7 : 0);
    }
    last.writeUInt32LE(crc >>> 0, 22);
    return { bytes: Buffer.concat(pages), duration, format: 'ogg' };
  }
  let start = 0;
  if (bytes.subarray(0, 3).toString() === 'ID3')
    start =
      10 +
      ((bytes[6] & 127) << 21) +
      ((bytes[7] & 127) << 14) +
      ((bytes[8] & 127) << 7) +
      (bytes[9] & 127);
  let offset = start,
    duration = 0,
    first = -1,
    end = start;
  while (offset + 4 <= bytes.length) {
    const h = bytes.readUInt32BE(offset);
    const version = (h >>> 19) & 3,
      layer = (h >>> 17) & 3,
      bitrateIndex = (h >>> 12) & 15,
      sampleIndex = (h >>> 10) & 3;
    if (
      h >>> 21 !== 2047 ||
      version === 1 ||
      layer !== 1 ||
      bitrateIndex === 0 ||
      bitrateIndex === 15 ||
      sampleIndex === 3
    ) {
      if (first >= 0) break;
      offset++;
      continue;
    }
    const rate = [44100, 48000, 32000][sampleIndex] / (version === 3 ? 1 : version === 2 ? 2 : 4);
    const bitrate = (
      version === 3
        ? [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]
        : [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160]
    )[bitrateIndex];
    const size = Math.floor(((version === 3 ? 144000 : 72000) * bitrate) / rate) + ((h >>> 9) & 1);
    const dt = (version === 3 ? 1152 : 576) / rate;
    if (offset + size > bytes.length || duration + dt > seconds || offset + size - start > maxBytes)
      break;
    if (first < 0) first = offset;
    offset += size;
    end = offset;
    duration += dt;
  }
  if (first < 0 || duration < 1) throw new Error('Invalid/short MP3');
  return { bytes: Buffer.from(bytes.subarray(first, end)), duration, format: 'mp3' };
}
