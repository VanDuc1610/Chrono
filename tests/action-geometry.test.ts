import { describe, expect, it } from 'vitest';
import { segmentDistance } from '../src/systems/action/GeometryRules';

describe('field attack segment distance', () => {
  const a = { x: 2, y: 3 };
  const b = { x: 8, y: 3 };
  it('measures perpendicular distance inside a locked attack line', () => {
    expect(segmentDistance({ x: 5, y: 7 }, a, b)).toBe(4);
    expect(segmentDistance({ x: 5, y: 3 }, a, b)).toBe(0);
  });
  it('clamps to endpoints instead of extending the hazard indefinitely', () => {
    expect(segmentDistance({ x: -1, y: 7 }, a, b)).toBe(5);
    expect(segmentDistance({ x: 11, y: 7 }, a, b)).toBe(5);
  });
  it('handles a zero-length telegraph without NaN and preserves endpoint order', () => {
    const p = { x: 5, y: 7 };
    expect(segmentDistance(p, a, a)).toBe(5);
    expect(segmentDistance(p, a, b)).toBe(segmentDistance(p, b, a));
  });
});
