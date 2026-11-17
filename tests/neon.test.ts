import { describe, expect, it } from 'vitest';
import neonJson from '../public/assets/data/neon.json';
import mapsJson from '../public/assets/data/maps.json';
import {
  propTiles,
  seededRng,
  solidBlocks,
  traceEdges,
  traceRegions,
} from '../src/world/NeonTrace';

/** Builds a solid-at lookup from rows of '#' (solid) and '.' (open). */
const grid = (rows: string[]) => ({
  w: rows[0].length,
  h: rows.length,
  solid: (x: number, y: number) => rows[y][x] === '#',
});

describe('neon outline tracing', () => {
  it('outlines a lone pillar and the open border, normals pointing into the solid side', () => {
    const g = grid(['...', '.#.', '...']);
    const edges = traceEdges(g.w, g.h, g.solid);
    expect(edges).toHaveLength(8);
    // Pillar: top edge at y=1 with the solid below it.
    expect(edges).toContainEqual({ x1: 1, y1: 1, x2: 2, y2: 1, nx: 0, ny: 1 });
    expect(edges).toContainEqual({ x1: 2, y1: 1, x2: 2, y2: 2, nx: -1, ny: 0 });
    // Map border: one merged run per side, solid (outside) above / left.
    expect(edges).toContainEqual({ x1: 0, y1: 0, x2: 3, y2: 0, nx: 0, ny: -1 });
    expect(edges).toContainEqual({ x1: 0, y1: 0, x2: 0, y2: 3, nx: -1, ny: 0 });
  });

  it('merges straight runs and draws nothing inside a solid mass', () => {
    const g = grid(['####', '####', '....', '####']);
    const edges = traceEdges(g.w, g.h, g.solid);
    // A corridor: one line above it, one below, and its two open ends at the map border.
    expect(edges).toHaveLength(4);
    expect(edges).toContainEqual({ x1: 0, y1: 2, x2: 4, y2: 2, nx: 0, ny: -1 });
    expect(edges).toContainEqual({ x1: 0, y1: 3, x2: 4, y2: 3, nx: 0, ny: 1 });
  });

  it('finds the largest wall squares away from the border, without overlap', () => {
    const rows = ['#######', '#.....#', '#.###.#', '#.###.#', '#.###.#', '#.....#', '#######'];
    const g = grid(rows);
    expect(solidBlocks(g.w, g.h, g.solid, 3, 8)).toEqual([{ x: 2, y: 2, size: 3 }]);
    expect(solidBlocks(g.w, g.h, g.solid, 4, 8)).toEqual([]);
  });

  it('gives each map the same stars every time', () => {
    const a = seededRng('map_x');
    const b = seededRng('map_x');
    const seq = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(seq);
    for (const v of seq) expect(v).toBeGreaterThanOrEqual(0);
    for (const v of seq) expect(v).toBeLessThan(1);
  });
});

describe('neon data', () => {
  const maps = (mapsJson as unknown as { maps: Record<string, unknown> }).maps;
  const neon = (
    neonJson as unknown as {
      maps: Record<string, { level: number; line: string; accent: string; void?: string }>;
    }
  ).maps;
  it('only names real maps, with colours and a level in range', () => {
    for (const [id, d] of Object.entries(neon)) {
      expect(maps[id], id).toBeDefined();
      expect(d.level).toBeGreaterThan(0);
      expect(d.level).toBeLessThanOrEqual(1);
      for (const c of [d.line, d.accent, d.void ?? '#000000']) expect(c).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe('neon floor regions', () => {
  it('outlines a path across the floor and ignores lone tile variants', () => {
    // 1 = grass with lone variants (2, one touching the path), 3 = a path across the floor.
    const rows = ['11111', '12111', '33333', '11211'];
    const kind = (x: number, y: number) => Number(rows[y][x]);
    const lines = traceRegions(5, 4, kind, 2);
    expect(lines).toEqual([
      { x1: 0, y1: 2, x2: 5, y2: 2 },
      { x1: 0, y1: 3, x2: 5, y2: 3 },
    ]);
  });

  it('draws nothing next to walls (-1)', () => {
    const rows = ['#1', '#3'];
    const kind = (x: number, y: number) => (rows[y][x] === '#' ? -1 : Number(rows[y][x]));
    expect(traceRegions(2, 2, kind, 1)).toEqual([{ x1: 1, y1: 1, x2: 2, y2: 1 }]);
  });
});

describe('neon props', () => {
  it('keeps lone pillars and small clusters as props, never the walls', () => {
    const g = grid(['#######', '#.....#', '#.#.##.', '#.....#', '#..####', '#######']);
    const props = [...propTiles(g.w, g.h, g.solid, 3)].sort((a, b) => a - b);
    // The pillar at (2,2) and the pair at (4,2)-(5,2); the bottom block touches the wall.
    expect(props).toEqual([2 * 7 + 2, 2 * 7 + 4, 2 * 7 + 5]);
  });
});
