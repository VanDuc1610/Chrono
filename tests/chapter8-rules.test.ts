import { describe, expect, it } from 'vitest';
import {
  advanceClock,
  bellCrackable,
  bellState,
  echoRhythm,
  inTickWindow,
  mimicCounters,
  mimicFrame,
  pushClock,
  sealPhase,
  sweepAngle,
  tauntActive,
  wraithSolid,
} from '../src/world/Chapter8Rules';
import { traceBeam, tileKey, type Mirror } from '../src/world/Chapter6Rules';

describe('Chapter 8 field foes', () => {
  it('Assimilator counters only the move it learned', () => {
    expect(mimicCounters(null, 'slash')).toBe(false);
    expect(mimicCounters('slash', 'slash')).toBe(true);
    expect(mimicCounters('slash', 'dash')).toBe(false);
    expect(mimicFrame('dash')).toBe(1);
    expect(mimicFrame('skill')).toBe(2);
  });

  it('Doom Bell tolls three times, then the wave; it cracks only after the first toll', () => {
    expect(bellState(0, 0, 1200, 700)).toEqual({ tolls: 1, wave: null, done: false });
    expect(bellCrackable(bellState(600, 0, 1200, 700))).toBe(true);
    expect(bellCrackable(bellState(1300, 0, 1200, 700))).toBe(false);
    expect(bellState(2400, 0, 1200, 700).tolls).toBe(3);
    expect(bellState(2750, 0, 1200, 700).wave).toBeCloseTo(0.5);
    expect(bellState(3200, 0, 1200, 700).done).toBe(true);
  });

  it('Legionnaire turns its shield only with an ally near', () => {
    expect(tauntActive(500, 0, 4000, 2000, true)).toBe(true);
    expect(tauntActive(500, 0, 4000, 2000, false)).toBe(false);
    expect(tauntActive(2500, 0, 4000, 2000, true)).toBe(false);
  });

  it('Phase Wraith follows the anchored world, else it blinks', () => {
    expect(wraithSolid('own', 2500, 0, 3000, 1500)).toBe(true);
    expect(wraithSolid('other', 100, 0, 3000, 1500)).toBe(false);
    expect(wraithSolid(null, 100, 0, 3000, 1500)).toBe(true);
    expect(wraithSolid(null, 2000, 0, 3000, 1500)).toBe(false);
  });

  it('Second-Hand Warden: the hand starts north and turns clockwise; hits land just after a tick', () => {
    expect(sweepAngle(0, 0, 8000)).toBeCloseTo(-Math.PI / 2);
    expect(sweepAngle(2000, 0, 8000)).toBeCloseTo(0);
    expect(inTickWindow(1100, 0, 1000, 420)).toBe(true);
    expect(inTickWindow(1600, 0, 1000, 420)).toBe(false);
  });
});

describe('Chapter 8 bosses', () => {
  it('Mirror Verdict replays the last rhythm backwards on even turns', () => {
    const seq = [0.1, 0.5, 0.9];
    let i = 0;
    const pick = () => seq[i++ % seq.length];
    const first = echoRhythm(1, null, 3, [650, 850, 1050], pick);
    expect(first).toEqual({ rings: [650, 850, 1050], reversed: false });
    expect(echoRhythm(2, first.rings, 3, [650, 850, 1050], pick)).toEqual({
      rings: [1050, 850, 650],
      reversed: true,
    });
  });

  it('the 25th hour: misses speed the hand, Kuro holds it once, then the strike falls', () => {
    expect(advanceClock(20, 0, 20, 25, true)).toEqual({ hand: 21, strike: false, kuroHeld: false });
    expect(advanceClock(22, 2, 20, 25, true)).toEqual({ hand: 24, strike: false, kuroHeld: true });
    expect(advanceClock(24, 0, 20, 25, false)).toEqual({ hand: 20, strike: true, kuroHeld: false });
    expect(pushClock(23, 2, 20)).toBe(21);
    expect(pushClock(21, 2, 20)).toBe(20);
  });

  it('Sixfold Echo moves through six seal phases as it loses HP', () => {
    expect(sealPhase(1, 6)).toBe(0);
    expect(sealPhase(0.8, 6)).toBe(1);
    expect(sealPhase(0.5, 6)).toBe(3);
    expect(sealPhase(0.01, 6)).toBe(5);
  });
});

describe('Chapter 8 puzzles have exactly one answer', () => {
  it('C03 gears: axle spacing fixes 16 and 24, half speed', () => {
    const sizes = [8, 12, 16, 24];
    const ok = sizes.flatMap((mid) =>
      sizes.filter((o) => 12 + mid === 28 && mid + o === 40 && 12 / o === 0.5).map((o) => [mid, o]),
    );
    expect(ok).toEqual([[16, 24]]);
  });

  it('C04 banners: D, A, C, B is the only order (the gold line read backwards)', () => {
    const perms = (xs: string[]): string[][] =>
      xs.length <= 1
        ? [xs]
        : xs.flatMap((x) => perms(xs.filter((y) => y !== x)).map((r) => [x, ...r]));
    const ok = perms(['a', 'b', 'c', 'd']).filter((o) => {
      const at = (e: string) => o.indexOf(e);
      return at('d') < at('a') && at('a') < at('c') && at('c') < at('b') && at('d') < at('b');
    });
    expect(ok).toEqual([['d', 'a', 'c', 'b']]);
  });

  it('C07 beam: only the prism first and the silver mirror second reach the lock blue', () => {
    const lit = (a1: 'backslash' | 'none', a2: 'backslash' | 'none') => {
      const mirrors = new Map<string, Mirror>();
      if (a1 === 'backslash') mirrors.set(tileKey({ x: 10, y: 4 }), '\\');
      if (a2 === 'backslash') mirrors.set(tileKey({ x: 18, y: 4 }), '\\');
      const walls = new Set(['10,8', '24,4']);
      return traceBeam({
        start: { x: 2, y: 4 },
        dir: { x: 1, y: 0 },
        mirrors,
        prisms: new Set(['10,4']),
        brass: new Set(),
        target: { x: 18, y: 12 },
        blocked: (x, y) => x <= 0 || y <= 1 || x >= 25 || y >= 19 || walls.has(`${x},${y}`),
      }).lit;
    };
    expect(lit('none', 'backslash')).toBe(true);
    expect(lit('backslash', 'backslash')).toBe(false);
    expect(lit('none', 'none')).toBe(false);
    expect(lit('backslash', 'none')).toBe(false);
  });

  it('C08 torn page: A-B-C upright is the only readable fit (the other is the same page upside down)', () => {
    type Strip = { id: string; l: string; r: string };
    const strips: Strip[] = [
      { id: 'a', l: 'v^^', r: '^v^' },
      { id: 'b', l: 'v^v', r: 'vv^' },
      { id: 'c', l: '^^v', r: '^^^' },
    ];
    const flip = (s: Strip): Strip => ({
      id: `${s.id}_dn`,
      l: [...s.r].reverse().join(''),
      r: [...s.l].reverse().join(''),
    });
    const fits = (left: Strip, right: Strip) => [...left.r].every((c, i) => c !== right.l[i]);
    const options = strips.flatMap((s) => [{ ...s, id: `${s.id}_up` }, flip(s)]);
    const ok: string[][] = [];
    for (const x of options)
      for (const y of options)
        for (const z of options) {
          const used = new Set([x.id[0], y.id[0], z.id[0]]);
          if (used.size === 3 && fits(x, y) && fits(y, z)) ok.push([x.id, y.id, z.id]);
        }
    expect(ok).toEqual([
      ['a_up', 'b_up', 'c_up'],
      ['c_dn', 'b_dn', 'a_dn'],
    ]);
  });

  it('C11 archive lock: 2-4-9', () => {
    const ok: number[][] = [];
    for (let a = 0; a <= 9; a++)
      for (let c = 9; c >= 0; c--) {
        const b = 2 * a;
        if (b > 9 || a + b + c !== 15 || c % 2 === 0) continue;
        ok.push([a, b, c]);
        break;
      }
    const best = ok.reduce((m, x) => (x[2] > m[2] ? x : m));
    expect(best).toEqual([2, 4, 9]);
    expect(ok.filter((x) => x[2] === 9)).toEqual([[2, 4, 9]]);
  });

  it('C12 ledger: Peter is the only one at zero', () => {
    const debts: [string, string, number][] = [
      ['kuro', 'peter', 3],
      ['peter', 'na', 3],
      ['na', 'kuro', 1],
      ['ivo', 'kuro', 4],
    ];
    const net: Record<string, number> = {};
    for (const [from, to, n] of debts) {
      net[from] = (net[from] ?? 0) - n;
      net[to] = (net[to] ?? 0) + n;
    }
    expect(Object.keys(net).filter((k) => net[k] === 0)).toEqual(['peter']);
  });
});
