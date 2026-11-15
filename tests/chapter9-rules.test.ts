import { describe, expect, it } from 'vitest';
import { chainState, thrustPhase } from '../src/world/Chapter9Rules';

const perms = <T>(xs: T[]): T[][] =>
  xs.length <= 1
    ? [xs]
    : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((r) => [x, ...r]));

describe('Chapter 9 field foes', () => {
  it('Nexus Sentinel: warn, lunge, stuck, done', () => {
    expect(thrustPhase(100, 0, 700, 250, 1200)).toBe('warn');
    expect(thrustPhase(800, 0, 700, 250, 1200)).toBe('lunge');
    expect(thrustPhase(1500, 0, 700, 250, 1200)).toBe('stuck');
    expect(thrustPhase(2200, 0, 700, 250, 1200)).toBe('done');
  });

  it('Nexus Inquisitor: four blows, then a short opening', () => {
    expect(chainState(100, 0, 450, 1000)).toEqual({ beat: 0, open: false, done: false });
    expect(chainState(1400, 0, 450, 1000).beat).toBe(3);
    expect(chainState(1900, 0, 450, 1000)).toEqual({ beat: 4, open: true, done: false });
    expect(chainState(2900, 0, 450, 1000).done).toBe(true);
  });
});

describe('Chapter 9 puzzles have exactly one answer (design §6 with §20)', () => {
  it('C01 tri-balance: past 9, present 6, future 12', () => {
    const w = [3, 5, 6, 8, 9, 11, 12];
    const ok: number[][] = [];
    for (const past of w)
      for (const now of w)
        for (const fut of w)
          if (past === now + 3 && fut === 2 * past - now && past + now + fut === 27)
            ok.push([past, now, fut]);
    expect(ok).toEqual([[9, 6, 12]]);
  });

  it('C02 nested spectrum: north red, south-east blue, south-west green', () => {
    const ok = perms(['r', 'b', 'g']).filter(([n, se, sw]) => {
      const pair = (a: string, b: string) => new Set([a, b]);
      const eq = (s: Set<string>, t: string[]) => t.every((x) => s.has(x)) && s.size === t.length;
      return (
        eq(pair(se, sw), ['b', 'g']) && eq(pair(n, sw), ['r', 'g']) && eq(pair(n, se), ['r', 'b'])
      );
    });
    expect(ok).toEqual([['r', 'b', 'g']]);
  });

  it('C03 three witnesses: Kuro lies, Thiên Nguyên tells the truth, Chronos is half', () => {
    // Facts the room shows: Chronos's second line (its plinth is the only unbroken one) is true;
    // Thiên Nguyên's second line (the second chair) is true.
    const kinds = ['truth', 'lie', 'half'] as const;
    const ok = perms([...kinds]).filter(([a, b, c]) => {
      const holds = (k: string, s1: boolean, s2: boolean) =>
        k === 'truth' ? s1 && s2 : k === 'lie' ? !s1 && !s2 : !s1 && s2;
      return (
        holds(a, c === 'lie', true) &&
        holds(b, a === 'truth', b === 'truth') &&
        holds(c, b === 'lie', true)
      );
    });
    expect(ok).toEqual([['half', 'lie', 'truth']]);
  });

  it('C04 escapement: 2, 8, 4', () => {
    const ok: number[][] = [];
    for (let a = 1; a <= 9; a++)
      for (let b = 1; b <= 9; b++)
        for (let c = 1; c <= 9; c++)
          if (a % 2 === 0 && [2, 3, 5, 7].includes(a) && b === a ** 3 && c * c === a * b)
            ok.push([a, b, c]);
    expect(ok).toEqual([[2, 8, 4]]);
  });

  it('C05 palimpsest: gold, ash, violet', () => {
    const ok = perms(['gold', 'ash', 'violet']).filter((o) => {
      const at = (x: string) => o.indexOf(x);
      return at('gold') === 0 && at('ash') < at('violet');
    });
    expect(ok).toEqual([['gold', 'ash', 'violet']]);
  });

  it('C06 penrose steps: 3, 5, 8, 13, 21 among the offered stones', () => {
    const offered = [
      [3, 4, 6],
      [4, 5, 7],
      [7, 8, 10],
      [11, 13, 15],
      [20, 21, 25],
    ];
    const seq = [1, 2];
    const picks = offered.map((opts) => {
      const next = seq[seq.length - 1] + seq[seq.length - 2];
      seq.push(next);
      return opts.filter((o) => o === next);
    });
    expect(picks).toEqual([[3], [5], [8], [13], [21]]);
  });

  it('C07 magic square: 5 centre, 4 south-west, 2 south-east', () => {
    const ok: number[][] = [];
    for (let a = 1; a <= 9; a++)
      for (let b = 1; b <= 9; b++)
        for (let c = 1; c <= 9; c++) {
          const g = [8, 1, 6, 3, a, 7, b, 9, c];
          const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
          ];
          if (lines.every((l) => l.reduce((s, i) => s + g[i], 0) === 15)) ok.push([a, b, c]);
        }
    expect(ok).toEqual([[5, 4, 2]]);
  });

  it('C08 chimes: +2, +2, +3 make C-E-G-C', () => {
    const start = [2, 5, 9];
    const goal = [4, 7, 12];
    const ok: number[][] = [];
    for (const x of [0, 1, 2, 3])
      for (const y of [0, 1, 2, 3])
        for (const z of [0, 1, 2, 3])
          if (start[0] + x === goal[0] && start[1] + y === goal[1] && start[2] + z === goal[2])
            ok.push([x, y, z]);
    expect(ok).toEqual([[2, 2, 3]]);
  });

  it('C09 astrolabe: k = 2 days in 1..12', () => {
    const ok = [...Array(12).keys()]
      .map((i) => i + 1)
      .filter((k) => (1 + k) % 3 === 0 && (2 + k) % 4 === 0 && (4 + k) % 6 === 0);
    expect(ok).toEqual([2]);
  });

  it('C11 vows: B, A, C, D', () => {
    const ok = perms(['A', 'B', 'C', 'D']).filter((o) => {
      const at = (x: string) => o.indexOf(x) + 1;
      return at('D') === 4 && at('A') !== 1 && at('C') === at('A') + 1 && at('B') % 2 === 1;
    });
    expect(ok).toEqual([['B', 'A', 'C', 'D']]);
  });

  it('C12 quantum gears: 3, 4, 5', () => {
    const ok: number[][] = [];
    for (let a = 1; a <= 5; a++)
      for (let b = 1; b <= 5; b++)
        for (let c = 1; c <= 5; c++)
          if (a === 3 && b === a + 1 && c * c === a * a + b * b) ok.push([a, b, c]);
    expect(ok).toEqual([[3, 4, 5]]);
  });

  it('C13 octagon ring: pressing a pillar flips it and its two neighbours; only {2, 4} lights all eight', () => {
    // Lit at the start: 3, 6, 7, 8 (1-based). On a ring of 8 this flip system is invertible, so the
    // set of pillars to press is unique (order does not matter, pressing twice undoes).
    const start = [false, false, true, false, false, true, true, true];
    const ok: number[][] = [];
    for (let mask = 0; mask < 256; mask++) {
      const st = [...start];
      const pressed: number[] = [];
      for (let k = 0; k < 8; k++)
        if (mask & (1 << k)) {
          pressed.push(k + 1);
          for (const d of [-1, 0, 1]) st[(k + d + 8) % 8] = !st[(k + d + 8) % 8];
        }
      if (st.every(Boolean)) ok.push(pressed);
    }
    expect(ok).toEqual([[2, 4]]);
  });
});
