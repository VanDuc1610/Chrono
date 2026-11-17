import { describe, expect, it } from 'vitest';
import { edgePieceAt } from '../src/world/EdgeRules';

/** Rows of digits: the rank of each cell's ground kind ('.' = unknown). */
const grid = (rows: string[]) => (x: number, y: number) => {
  const c = rows[y]?.[x];
  return c === undefined || c === '.' ? -1 : Number(c);
};

describe('soft terrain edges', () => {
  // A 3x3 patch of kind 0 (water) in kind 1 (sand).
  const k = grid(['11111', '10001', '10001', '10001', '11111']);

  it('gives the patch border its edge and corner pieces over the lower kind', () => {
    expect(edgePieceAt(1, 1, k)).toEqual({ piece: 0, under: { x: 1, y: 0 } });
    expect(edgePieceAt(2, 1, k)?.piece).toBe(1);
    expect(edgePieceAt(3, 1, k)?.piece).toBe(2);
    expect(edgePieceAt(1, 2, k)?.piece).toBe(3);
    expect(edgePieceAt(3, 2, k)?.piece).toBe(4);
    expect(edgePieceAt(1, 3, k)?.piece).toBe(5);
    expect(edgePieceAt(2, 3, k)?.piece).toBe(6);
    expect(edgePieceAt(3, 3, k)?.piece).toBe(7);
  });

  it('leaves the inside, the lower kind and unknown cells alone', () => {
    expect(edgePieceAt(2, 2, k)).toBeNull();
    expect(edgePieceAt(0, 0, k)).toBeNull();
    expect(edgePieceAt(0, 0, grid(['.0', '01']))).toBeNull();
  });

  it('uses an inner corner when the lower kind only touches a diagonal', () => {
    const notch = grid(['000', '000', '001']);
    expect(edgePieceAt(1, 1, notch)).toEqual({ piece: 8, under: { x: 2, y: 2 } });
  });

  it('turns a lone tile into a small patch, lets plain ground take spills, keeps strips whole', () => {
    expect(edgePieceAt(1, 1, grid(['111', '101', '111']))?.piece).toBe(12);
    const plain = (x: number, y: number) => (x === 1 && y === 1 ? 0 : 99);
    expect(edgePieceAt(1, 1, plain)?.piece).toBe(12);
    expect(edgePieceAt(0, 0, plain)).toBeNull();
    expect(edgePieceAt(1, 1, grid(['101', '101', '101']))).toBeNull();
    expect(edgePieceAt(1, 1, grid(['000', '111', '000']))).toBeNull();
  });
});
