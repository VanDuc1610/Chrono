/**
 * A tiny pixel-art drawing kit for the code-authored sprites (author-monsters.js,
 * author-bosses.js): lit ellipses and polygons along colour ramps, lines, an outline pass.
 */
export const OUTLINE = '#120f17';
export const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/** A square RGBA canvas (64 px by default) with a few drawing helpers. */
export class Canvas {
  constructor(size = 64) {
    this.size = size;
    this.px = Buffer.alloc(size * size * 4);
  }
  set(x, y, c, a = 255) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.size || y >= this.size || !c) return;
    this.px.set([...hex(c), a], (y * this.size + x) * 4);
  }
  get(x, y) {
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) return 0;
    return this.px[(y * this.size + x) * 4 + 3];
  }
  /** Filled ellipse shaded along `ramp` (dark..light), lit from the upper left. */
  ellipse(cx, cy, rx, ry, ramp, { light = [-0.55, -0.8], flat = false } = {}) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        const d = dx * dx + dy * dy;
        if (d > 1) continue;
        const lit = flat ? 0.5 : 0.5 + 0.5 * (dx * light[0] + dy * light[1]) - 0.25 * d;
        this.set(x, y, ramp[Math.max(0, Math.min(ramp.length - 1, Math.floor(lit * ramp.length)))]);
      }
  }
  /** Filled polygon (even-odd), shaded by height between y0 and y1 along `ramp` (light at top). */
  poly(pts, ramp, vertical = true) {
    const ys = pts.map((p) => p[1]);
    const xs = pts.map((p) => p[0]);
    const [y0, y1] = [Math.min(...ys), Math.max(...ys)];
    const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++)
      for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) {
        let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const [xi, yi] = pts[i];
          const [xj, yj] = pts[j];
          if (
            yi > y + 0.5 !== yj > y + 0.5 &&
            x + 0.5 < ((xj - xi) * (y + 0.5 - yi)) / (yj - yi) + xi
          )
            inside = !inside;
        }
        if (!inside) continue;
        const t = vertical
          ? 1 - (y - y0) / Math.max(1, y1 - y0)
          : 1 - (x - x0) / Math.max(1, x1 - x0);
        this.set(x, y, ramp[Math.max(0, Math.min(ramp.length - 1, Math.floor(t * ramp.length)))]);
      }
  }
  line(x0, y0, x1, y1, c) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) this.set(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, c);
  }
  /** A 1 px outline on every transparent pixel touching the shape. */
  outline(c = OUTLINE) {
    const mark = [];
    for (let y = 0; y < this.size; y++)
      for (let x = 0; x < this.size; x++) {
        if (this.get(x, y)) continue;
        if (this.get(x + 1, y) || this.get(x - 1, y) || this.get(x, y + 1) || this.get(x, y - 1))
          mark.push([x, y]);
      }
    for (const [x, y] of mark) this.set(x, y, c);
  }
  /** Copies `other` on top (opaque pixels only). */
  over(other) {
    for (let i = 0; i < this.px.length; i += 4)
      if (other.px[i + 3]) other.px.copy(this.px, i, i, i + 4);
  }
  /** Scales every alpha by k (spirits). */
  fade(k) {
    for (let i = 3; i < this.px.length; i += 4) this.px[i] = Math.round(this.px[i] * k);
  }
  shifted(dx, dy) {
    const out = new Canvas(this.size);
    for (let y = 0; y < this.size; y++)
      for (let x = 0; x < this.size; x++) {
        const i = (y * this.size + x) * 4;
        if (!this.px[i + 3]) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= this.size || ny >= this.size) continue;
        this.px.copy(out.px, (ny * this.size + nx) * 4, i, i + 4);
      }
    return out;
  }
}
