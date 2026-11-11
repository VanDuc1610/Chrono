/**
 * Shared helpers for code-authored 32×32 tilesets (Pipeline B). Tiles are 2-D arrays of palette
 * characters; '.' is transparent. Deterministic: no randomness beyond the coordinate hash.
 */
import { encodePng } from './pixel.js';

export const T = 32;

/** Deterministic per-pixel hash in [0, 100). */
export const rnd = (x, y, s) => (((x * 73856093) ^ (y * 19349663) ^ (s * 83492791)) >>> 0) % 100;

export const tile = (ch = '.') => Array.from({ length: T }, () => Array(T).fill(ch));

export const put = (t, x, y, ch) => {
  if (x >= 0 && y >= 0 && x < T && y < T) t[y][x] = ch;
};

export const rect = (t, x0, y0, x1, y1, ch) => {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(t, x, y, ch);
};

export const ellipse = (t, cx, cy, rx, ry, ch) => {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) put(t, x, y, ch);
};

/** Replace pixels with a weighted pick [[char, percent], ...], optionally only over `only` chars. */
export const speckle = (t, seed, picks, only = null) => {
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      if (only && !only.includes(t[y][x])) continue;
      const r = rnd(x, y, seed);
      let acc = 0;
      for (const [ch, pct] of picks) {
        acc += pct;
        if (r < acc) {
          t[y][x] = ch;
          break;
        }
      }
    }
  return t;
};

/** 1-px outline around opaque pixels (props on the walls layer). */
export const outline = (t, ch = 'O') => {
  const src = t.map((r) => [...r]);
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      if (src[y][x] !== '.') continue;
      const near = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].some(([dx, dy]) => src[y + dy]?.[x + dx] && src[y + dy][x + dx] !== '.');
      if (near) t[y][x] = ch;
    }
  return t;
};

/** Copy the opaque pixels of `top` onto a copy of `base`. */
export const over = (base, top) =>
  base.map((r, y) => r.map((ch, x) => (top[y][x] === '.' ? ch : top[y][x])));

export function rasterTiles(tiles, palette, cols) {
  const rows = Math.ceil(tiles.length / cols);
  const w = cols * T;
  const h = rows * T;
  const buf = Buffer.alloc(w * h * 4);
  tiles.forEach((t, i) => {
    const ox = (i % cols) * T;
    const oy = Math.floor(i / cols) * T;
    t.forEach((row, y) =>
      row.forEach((ch, x) => {
        if (ch === '.') return;
        const c = palette[ch];
        if (!c) throw new Error(`tile ${i}: unknown palette char "${ch}"`);
        buf.set(c, ((oy + y) * w + ox + x) * 4);
      }),
    );
  });
  return { w, h, buf };
}

export function scaledPng(img, k, bg = [38, 42, 52, 255]) {
  const W = img.w * k;
  const H = img.h * k;
  const out = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = (Math.floor(y / k) * img.w + Math.floor(x / k)) * 4;
      const c = img.buf[i + 3] ? img.buf.subarray(i, i + 4) : bg;
      out.set([c[0], c[1], c[2], 255], (y * W + x) * 4);
    }
  return encodePng(W, H, out);
}

/** Draws a layout ({ width, height, ground, walls } of tile indices, -1 empty) with a sheet. */
export function renderLayout(sheet, layout, cols) {
  const w = layout.width * T;
  const h = layout.height * T;
  const buf = Buffer.alloc(w * h * 4);
  for (const layer of [layout.ground, layout.walls])
    layer.forEach((row, ty) =>
      row.forEach((idx, tx) => {
        if (idx < 0) return;
        const sx = (idx % cols) * T;
        const sy = Math.floor(idx / cols) * T;
        for (let y = 0; y < T; y++)
          for (let x = 0; x < T; x++) {
            const si = ((sy + y) * sheet.w + sx + x) * 4;
            if (sheet.buf[si + 3])
              sheet.buf.copy(buf, ((ty * T + y) * w + tx * T + x) * 4, si, si + 4);
          }
      }),
    );
  return { w, h, buf };
}
