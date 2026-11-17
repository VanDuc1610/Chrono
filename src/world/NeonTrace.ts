/**
 * Neon skin geometry (pure, no Phaser): the glowing outline of a map is traced from its collision
 * grid, so every map gets one without anyone drawing it. Units are tiles.
 */

/** A straight boundary run between solid and open tiles. (nx, ny) points into the solid side. */
export interface NeonEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  nx: number;
  ny: number;
}

/** A square of solid tiles (top-left corner and side length), room for a medallion. */
export interface NeonBlock {
  x: number;
  y: number;
  size: number;
}

export type SolidAt = (x: number, y: number) => boolean;

/**
 * Every boundary between a solid and an open tile, merged into maximal straight runs.
 * Outside the map counts as solid, so open tiles on the border get a line too.
 */
export function traceEdges(w: number, h: number, solid: SolidAt): NeonEdge[] {
  const s = (x: number, y: number): boolean =>
    x < 0 || y < 0 || x >= w || y >= h ? true : solid(x, y);
  const edges: NeonEdge[] = [];
  // Horizontal boundaries: line y sits between rows y-1 and y.
  for (let y = 0; y <= h; y++) {
    let run: { from: number; ny: number } | null = null;
    for (let x = 0; x <= w; x++) {
      let ny = 0;
      if (x < w) {
        const above = s(x, y - 1);
        const below = s(x, y);
        if (above && !below) ny = -1;
        else if (!above && below) ny = 1;
      }
      if (run && run.ny !== ny) {
        edges.push({ x1: run.from, y1: y, x2: x, y2: y, nx: 0, ny: run.ny });
        run = null;
      }
      if (!run && ny !== 0) run = { from: x, ny };
    }
  }
  // Vertical boundaries: line x sits between columns x-1 and x.
  for (let x = 0; x <= w; x++) {
    let run: { from: number; nx: number } | null = null;
    for (let y = 0; y <= h; y++) {
      let nx = 0;
      if (y < h) {
        const left = s(x - 1, y);
        const right = s(x, y);
        if (left && !right) nx = -1;
        else if (!left && right) nx = 1;
      }
      if (run && run.nx !== nx) {
        edges.push({ x1: x, y1: run.from, x2: x, y2: y, nx: run.nx, ny: 0 });
        run = null;
      }
      if (!run && nx !== 0) run = { from: y, nx };
    }
  }
  return edges;
}

/**
 * Largest non-overlapping squares of solid tiles (side >= min), biggest first, at most `max`.
 * Squares touching the map border are skipped: the camera often stops there.
 */
export function solidBlocks(
  w: number,
  h: number,
  solid: SolidAt,
  min: number,
  max: number,
): NeonBlock[] {
  // size[y][x]: side of the largest solid square whose bottom-right corner is (x, y).
  const size: number[][] = [];
  const candidates: NeonBlock[] = [];
  for (let y = 0; y < h; y++) {
    size.push([]);
    for (let x = 0; x < w; x++) {
      const inner = x > 0 && y > 0 && x < w - 1 && y < h - 1;
      const v =
        inner && solid(x, y)
          ? 1 + Math.min(size[y - 1][x], size[y][x - 1] ?? 0, size[y - 1][x - 1])
          : 0;
      size[y].push(v);
      if (v >= min) candidates.push({ x: x - v + 1, y: y - v + 1, size: v });
    }
  }
  candidates.sort((a, b) => b.size - a.size || a.y - b.y || a.x - b.x);
  const taken: NeonBlock[] = [];
  const overlaps = (a: NeonBlock, b: NeonBlock): boolean =>
    a.x < b.x + b.size && b.x < a.x + a.size && a.y < b.y + b.size && b.y < a.y + a.size;
  for (const c of candidates) {
    if (taken.length >= max) break;
    if (taken.some((t) => overlaps(t, c))) continue;
    taken.push(c);
  }
  return taken;
}

/** Small seeded RNG (mulberry32): the same map always gets the same stars. */
export function seededRng(seed: string): () => number {
  let a = 0;
  for (let i = 0; i < seed.length; i++) a = (Math.imul(a, 31) + seed.charCodeAt(i)) | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A plain segment in tile units. */
export interface NeonLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Boundaries between floor regions of different kinds (a dirt path on grass, a carpet on stone).
 * `kind` is the tile's floor kind, or -1 where no line should be drawn (walls). Regions smaller
 * than `minArea` tiles (scattered tile variants) melt into their largest neighbour first, so
 * the lines follow real shapes, not noise.
 */
export function traceRegions(
  w: number,
  h: number,
  kind: (x: number, y: number) => number,
  minArea: number,
): NeonLine[] {
  const label = new Int32Array(w * h).fill(-1);
  const kinds: number[] = [];
  const sizes: number[] = [];
  for (let i = 0; i < w * h; i++) {
    if (label[i] >= 0) continue;
    const k = kind(i % w, Math.floor(i / w));
    if (k < 0) continue;
    const id = kinds.length;
    kinds.push(k);
    sizes.push(0);
    const stack = [i];
    label[i] = id;
    while (stack.length > 0) {
      const c = stack.pop()!;
      sizes[id]++;
      const cx = c % w;
      const cy = Math.floor(c / w);
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const n = ny * w + nx;
        if (label[n] < 0 && kind(nx, ny) === k) {
          label[n] = id;
          stack.push(n);
        }
      }
    }
  }
  // Small regions take the kind they share the longest border with (among real regions).
  const finalKind = kinds.slice();
  for (let id = 0; id < kinds.length; id++) {
    if (sizes[id] >= minArea) continue;
    const border = new Map<number, number>();
    for (let i = 0; i < w * h; i++) {
      if (label[i] !== id) continue;
      const x = i % w;
      const y = Math.floor(i / w);
      for (const [nx, ny] of [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ]) {
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const o = label[ny * w + nx];
        if (o >= 0 && o !== id && sizes[o] >= minArea)
          border.set(kinds[o], (border.get(kinds[o]) ?? 0) + 1);
      }
    }
    let best = -1;
    let most = 0;
    for (const [k, n] of border)
      if (n > most) {
        most = n;
        best = k;
      }
    if (best >= 0) finalKind[id] = best;
  }
  const at = (x: number, y: number): number => {
    const l = label[y * w + x];
    return l < 0 ? -1 : finalKind[l];
  };
  const differ = (a: number, b: number): boolean => a >= 0 && b >= 0 && a !== b;
  const lines: NeonLine[] = [];
  for (let y = 1; y < h; y++) {
    let from = -1;
    for (let x = 0; x <= w; x++) {
      const d = x < w && differ(at(x, y - 1), at(x, y));
      if (d && from < 0) from = x;
      if (!d && from >= 0) {
        lines.push({ x1: from, y1: y, x2: x, y2: y });
        from = -1;
      }
    }
  }
  for (let x = 1; x < w; x++) {
    let from = -1;
    for (let y = 0; y <= h; y++) {
      const d = y < h && differ(at(x - 1, y), at(x, y));
      if (d && from < 0) from = y;
      if (!d && from >= 0) {
        lines.push({ x1: x, y1: from, x2: x, y2: y });
        from = -1;
      }
    }
  }
  return lines;
}

/**
 * Props: small clusters of solid tiles (a pillar, a statue, a crate) that do not touch the map
 * border. They keep their pixel art under the neon skin instead of becoming line-art boxes.
 * Returns their tile indices (y * w + x).
 */
export function propTiles(w: number, h: number, solid: SolidAt, maxSize: number): Set<number> {
  const seen = new Uint8Array(w * h);
  const props = new Set<number>();
  for (let i = 0; i < w * h; i++) {
    if (seen[i] || !solid(i % w, Math.floor(i / w))) continue;
    const cells: number[] = [];
    let border = false;
    const stack = [i];
    seen[i] = 1;
    while (stack.length > 0) {
      const c = stack.pop()!;
      cells.push(c);
      const x = c % w;
      const y = Math.floor(c / w);
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) border = true;
      for (const [nx, ny] of [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ]) {
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const n = ny * w + nx;
        if (!seen[n] && solid(nx, ny)) {
          seen[n] = 1;
          stack.push(n);
        }
      }
    }
    if (!border && cells.length <= maxSize) for (const c of cells) props.add(c);
  }
  return props;
}
