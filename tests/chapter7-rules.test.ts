import { describe, expect, it } from 'vitest';
import {
  chainCenters,
  chainVerdict,
  figureEight,
  houndSolid,
  huskFrozen,
  huskPulls,
  tellStage,
} from '../src/world/Chapter7Rules';

describe('Chapter 7 map enemies', () => {
  it('Hollow Husk freezes while Peter stands still and pulls after a while', () => {
    expect(huskFrozen(0)).toBe(true);
    expect(huskFrozen(120)).toBe(false);
    expect(huskPulls(1000, 2500, 2000)).toBe(false);
    expect(huskPulls(1000, 3000, 2000)).toBe(true);
  });

  it('a tell opens its window only at the end, then strikes', () => {
    expect(tellStage(100, 0, 800, 250)).toEqual({ stage: 'tell', window: false });
    expect(tellStage(600, 0, 800, 250)).toEqual({ stage: 'tell', window: true });
    expect(tellStage(820, 0, 800, 250)).toEqual({ stage: 'strike' });
    expect(tellStage(1000, 0, 800, 250)).toEqual({ stage: 'done' });
  });

  it('Ink Hound runs, then stands solid', () => {
    expect(houndSolid(500, 0, 1600, 300)).toBe(false);
    expect(houndSolid(1700, 0, 1600, 300)).toBe(true);
    expect(houndSolid(1950, 0, 1600, 300)).toBe(false);
    const p = figureEight({ x: 100, y: 100 }, 0, 50, 2000);
    expect(p).toEqual({ x: 100, y: 100 });
  });

  it('Void Inquisitor: only where all three chain circles meet is safe', () => {
    const spot = { x: 200, y: 200 };
    const centers = chainCenters(spot, 40);
    expect(chainVerdict(spot, centers, 60)).toBe('safe');
    expect(chainVerdict({ x: 260, y: 200 }, centers, 60)).toBe('hit');
    expect(chainVerdict({ x: 500, y: 500 }, centers, 60)).toBe('hit');
  });
});
