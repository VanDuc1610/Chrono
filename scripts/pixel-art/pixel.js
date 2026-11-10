// Minimal pixel-map -> PNG toolkit (no deps).
import fs from 'fs';
import zlib from 'zlib';

const CRC_TABLE = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = -1;
  for (const v of buf) c = (c >>> 8) ^ CRC_TABLE[(c ^ v) & 255];
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
export function encodePng(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

export function hex(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

/** A frame is an array of 32 strings of 32 palette chars ('.' = transparent). */
export function blank(size = 32) {
  return Array.from({ length: size }, () => '.'.repeat(size));
}

export function checkRows(rows, name, size = 32) {
  rows.forEach((r, i) => {
    if (r.length !== size) throw new Error(`${name}: row ${i} has ${r.length} chars: "${r}"`);
  });
}

/** Mirror half rows (16 chars) into 32-wide symmetric rows. */
export function mirrorHalf(halfRows) {
  return halfRows.map((r) => r + [...r].reverse().join(''));
}

export function flipH(rows) {
  return rows.map((r) => [...r].reverse().join(''));
}

/** Paint `src` rows onto `dst` at (dx, dy); '.' in src is transparent. */
export function stamp(dst, src, dx = 0, dy = 0) {
  const out = dst.map((r) => [...r]);
  src.forEach((row, y) => {
    const ty = y + dy;
    if (ty < 0 || ty >= out.length) return;
    [...row].forEach((ch, x) => {
      const tx = x + dx;
      if (ch === '.' || tx < 0 || tx >= out[ty].length) return;
      out[ty][tx] = ch;
    });
  });
  return out.map((r) => r.join(''));
}

/** Set individual pixels: list of [x, y, ch]. */
export function paint(rows, pixels) {
  const out = rows.map((r) => [...r]);
  for (const [x, y, ch] of pixels) out[y][x] = ch;
  return out.map((r) => r.join(''));
}

/** Render frames (grid[row][col] of frames) to an RGBA sheet. */
export function renderSheet(grid, palette, size = 32) {
  const rowsN = grid.length;
  const colsN = Math.max(...grid.map((r) => r.length));
  const w = colsN * size;
  const h = rowsN * size;
  const buf = Buffer.alloc(w * h * 4);
  grid.forEach((frames, gr) =>
    frames.forEach((frame, gc) =>
      frame.forEach((row, y) =>
        [...row].forEach((ch, x) => {
          if (ch === '.') return;
          const col = palette[ch];
          if (!col) throw new Error(`Unknown palette char "${ch}"`);
          const o = ((gr * size + y) * w + gc * size + x) * 4;
          buf[o] = col[0];
          buf[o + 1] = col[1];
          buf[o + 2] = col[2];
          buf[o + 3] = col[3];
        }),
      ),
    ),
  );
  return { w, h, buf };
}

/** Nearest-neighbour upscale onto an opaque backdrop, for human review only. */
export function preview(sheet, scale, bg = [38, 42, 52, 255]) {
  const W = sheet.w * scale;
  const H = sheet.h * scale;
  const out = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = (Math.floor(y / scale) * sheet.w + Math.floor(x / scale)) * 4;
      const o = (y * W + x) * 4;
      const a = sheet.buf[i + 3];
      const c = a ? sheet.buf.subarray(i, i + 4) : bg;
      out[o] = c[0];
      out[o + 1] = c[1];
      out[o + 2] = c[2];
      out[o + 3] = 255;
    }
  return encodePng(W, H, out);
}

export function writeFile(path, data) {
  fs.writeFileSync(path, data);
}
