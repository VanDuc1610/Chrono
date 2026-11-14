import { describe, expect, it } from 'vitest';
import {
  laserStage,
  reflect,
  ringCrosses,
  ringState,
  stepIndex,
  traceBeam,
  trailPosition,
  twinPaired,
  type Mirror,
} from '../src/world/Chapter6Rules';

describe('Chapter 6 light beam', () => {
  const open = () => false;
  const base = {
    start: { x: 0, y: 0 },
    dir: { x: 1, y: 0 },
    prisms: new Set<string>(),
    brass: new Set<string>(),
    target: { x: 3, y: 3 },
    blocked: (x: number, y: number) => x < 0 || y < 0 || x > 5 || y > 5,
  };

  it('turns on mirrors: / sends east to north, \\ sends east to south', () => {
    expect(reflect({ x: 1, y: 0 }, '/')).toEqual({ x: 0, y: -1 });
    expect(reflect({ x: 1, y: 0 }, '\\')).toEqual({ x: 0, y: 1 });
    expect(reflect({ x: 0, y: 1 }, '\\')).toEqual({ x: 1, y: 0 });
  });

  it('reaches the target blue only through the prism', () => {
    const mirrors = new Map<string, Mirror>([['3,0', '\\']]);
    const white = traceBeam({ ...base, mirrors });
    expect(white.end).toBe('target');
    expect(white.lit).toBe(false);
    const blue = traceBeam({ ...base, mirrors, prisms: new Set(['3,1']) });
    expect(blue.lit).toBe(true);
    expect(blue.path.map((t) => `${t.x},${t.y}`)).toEqual([
      '0,0',
      '1,0',
      '2,0',
      '3,0',
      '3,1',
      '3,2',
      '3,3',
    ]);
    expect(open()).toBe(false);
  });

  it('a white beam scatters on brass, a blue one passes', () => {
    const mirrors = new Map<string, Mirror>([['3,0', '\\']]);
    const scattered = traceBeam({ ...base, mirrors, brass: new Set(['3,2']) });
    expect(scattered.end).toBe('brass');
    const passed = traceBeam({
      ...base,
      mirrors,
      prisms: new Set(['3,1']),
      brass: new Set(['3,2']),
    });
    expect(passed.lit).toBe(true);
  });

  it('stops at walls', () => {
    const trace = traceBeam({ ...base, mirrors: new Map() });
    expect(trace.end).toBe('wall');
    expect(trace.path[trace.path.length - 1]).toEqual({ x: 5, y: 0 });
  });
});

describe('Chapter 6 map enemies', () => {
  it('Heel Shadow stands where Peter was a moment ago', () => {
    const log = [
      { t: 0, x: 10, y: 10 },
      { t: 500, x: 20, y: 10 },
      { t: 1000, x: 30, y: 10 },
      { t: 1500, x: 40, y: 10 },
    ];
    expect(trailPosition(log, 2000, 1500)).toEqual({ x: 20, y: 10 });
    expect(trailPosition(log, 1000, 1500)).toEqual({ x: 10, y: 10 });
    expect(trailPosition([], 1000, 1500)).toBeNull();
  });

  it('Twin Star needs both orbs inside the window', () => {
    expect(twinPaired(1000, 1400, 500)).toBe(true);
    expect(twinPaired(1000, 1600, 500)).toBe(false);
    expect(twinPaired(-Infinity, 1000, 500)).toBe(false);
  });

  it('Origin Nullifier beats three times, then the ring grows', () => {
    expect(ringState(100, 0, 400, 600, 120)).toEqual({ phase: 'beat', beat: 1 });
    expect(ringState(900, 0, 400, 600, 120)).toEqual({ phase: 'beat', beat: 3 });
    expect(ringState(1500, 0, 400, 600, 120)).toEqual({ phase: 'ring', radius: 60 });
    expect(ringState(1900, 0, 400, 600, 120)).toEqual({ phase: 'done' });
    expect(ringCrosses(64, 60)).toBe(true);
    expect(ringCrosses(90, 60)).toBe(false);
  });

  it('Archon Construct blinks three times, then fires', () => {
    expect(laserStage(100, 0, 500, 400)).toEqual({ stage: 'blink', n: 1, lit: true });
    expect(laserStage(300, 0, 500, 400)).toEqual({ stage: 'blink', n: 1, lit: false });
    expect(laserStage(1100, 0, 500, 400)).toEqual({ stage: 'blink', n: 3, lit: true });
    expect(laserStage(1600, 0, 500, 400)).toEqual({ stage: 'fire' });
    expect(laserStage(2000, 0, 500, 400)).toEqual({ stage: 'done' });
  });

  it('geared dials wrap both ways', () => {
    expect(stepIndex(0, -1, 4)).toBe(3);
    expect(stepIndex(3, 1, 4)).toBe(0);
    expect(stepIndex(2, 5, 4)).toBe(3);
  });
});
