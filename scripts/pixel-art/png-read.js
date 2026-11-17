// Minimal PNG -> RGBA decoder (no deps), the counterpart of pixel.js's encoder.
// Supports 8-bit greyscale, RGB, palette (with tRNS), grey+alpha and RGBA, non-interlaced;
// palette images may also use 1, 2 or 4 bits per pixel (some LPC sheets do).
import fs from 'fs';
import zlib from 'zlib';

const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

/** Reads a PNG file into { w, h, buf } with 4 bytes (RGBA) per pixel. */
export function readPng(file) {
  const bytes = fs.readFileSync(file);
  if (!SIGNATURE.every((b, i) => bytes[i] === b)) throw new Error(`${file}: not a PNG`);
  let pos = 8;
  let w = 0;
  let h = 0;
  let depth = 0;
  let type = 0;
  let interlace = 0;
  let palette = null;
  let trns = null;
  const idat = [];
  while (pos < bytes.length) {
    const len = bytes.readUInt32BE(pos);
    const kind = bytes.toString('ascii', pos + 4, pos + 8);
    const data = bytes.subarray(pos + 8, pos + 8 + len);
    if (kind === 'IHDR') {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      depth = data[8];
      type = data[9];
      interlace = data[12];
    } else if (kind === 'PLTE') palette = data;
    else if (kind === 'tRNS') trns = data;
    else if (kind === 'IDAT') idat.push(data);
    else if (kind === 'IEND') break;
    pos += 12 + len;
  }
  const packed = type === 3 && [1, 2, 4].includes(depth);
  if ((depth !== 8 && !packed) || interlace !== 0)
    throw new Error(
      `${file}: only 8-bit non-interlaced PNGs (depth ${depth}, interlace ${interlace})`,
    );
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[type];
  if (!channels) throw new Error(`${file}: colour type ${type} not supported`);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  // Packed palette rows are unfiltered byte by byte, then unpacked to one index per pixel.
  const stride = packed ? Math.ceil((w * depth) / 8) : w * channels;
  const unit = packed ? 1 : channels;
  const px = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= unit ? px[y * stride + x - unit] : 0;
      const b = y > 0 ? px[(y - 1) * stride + x] : 0;
      const c = x >= unit && y > 0 ? px[(y - 1) * stride + x - unit] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      px[y * stride + x] = v & 255;
    }
  }
  const idx = packed ? Buffer.alloc(w * h) : px;
  if (packed) {
    const mask = (1 << depth) - 1;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const bit = x * depth;
        idx[y * w + x] = (px[y * stride + (bit >> 3)] >> (8 - depth - (bit & 7))) & mask;
      }
  }
  const buf = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    const s = i * channels;
    if (type === 6) px.copy(buf, o, s, s + 4);
    else if (type === 2) {
      buf[o] = px[s];
      buf[o + 1] = px[s + 1];
      buf[o + 2] = px[s + 2];
      buf[o + 3] =
        trns &&
        trns.length >= 6 &&
        px[s] === trns[1] &&
        px[s + 1] === trns[3] &&
        px[s + 2] === trns[5]
          ? 0
          : 255;
    } else if (type === 3) {
      const k = idx[s];
      buf[o] = palette[k * 3];
      buf[o + 1] = palette[k * 3 + 1];
      buf[o + 2] = palette[k * 3 + 2];
      buf[o + 3] = trns && k < trns.length ? trns[k] : 255;
    } else if (type === 0) {
      buf[o] = buf[o + 1] = buf[o + 2] = px[s];
      // A tRNS chunk on a greyscale image names the one grey level that is transparent.
      buf[o + 3] = trns && trns.length >= 2 && px[s] === trns[1] ? 0 : 255;
    } else {
      buf[o] = buf[o + 1] = buf[o + 2] = px[s];
      buf[o + 3] = px[s + 1];
    }
  }
  return { w, h, buf };
}
