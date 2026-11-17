import { describe, expect, it } from 'vitest';
import { isGlowing, shieldBlocks } from '../src/systems/action/ActionRules';

describe('Chapter 2 field enemies', () => {
  it('a front shield blocks hits from the front, not from behind or while recovering', () => {
    const e = { x: 0, y: 0 };
    expect(shieldBlocks(0, e, { x: 20, y: 0 }, 140, 'chase')).toBe(true);
    expect(shieldBlocks(0, e, { x: -20, y: 0 }, 140, 'chase')).toBe(false);
    expect(shieldBlocks(0, e, { x: 0, y: 20 }, 140, 'chase')).toBe(false); // side, 90° > 70°
    expect(shieldBlocks(0, e, { x: 20, y: 0 }, 140, 'recover')).toBe(false);
  });

  it('glows for glowMs of every cycle', () => {
    expect(isGlowing(0, 0, 3000, 900)).toBe(true);
    expect(isGlowing(899, 0, 3000, 900)).toBe(true);
    expect(isGlowing(900, 0, 3000, 900)).toBe(false);
    expect(isGlowing(3100, 0, 3000, 900)).toBe(true);
    expect(isGlowing(100, 2950, 3000, 900)).toBe(true);
  });
});
