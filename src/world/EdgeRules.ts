/**
 * Soft terrain edges (T-88), pure rules. Ground kinds are ranked (0 = drawn over everything after
 * it). A cell of kind X that touches a lower kind shows X's LPC border piece over the lower
 * neighbour's ground, so the boundary between sand and water, grass and dirt, follows a soft
 * edge instead of the tile grid.
 *
 * Pieces (frame order of the edges strip): 0 TL, 1 T, 2 TR, 3 L, 4 R, 5 BL, 6 B, 7 BR, then the
 * inner corners for a lower kind only at the diagonal: 8 SE, 9 SW, 10 NE, 11 NW; 12 a lone patch.
 */

/** Rank of ground with no LPC kind (paving, floors): every kind may spill over it, it never spills. */
export const PLAIN_GROUND = 99;
export interface EdgePiece {
  piece: number;
  /** The neighbouring cell whose ground is drawn under the piece. */
  under: { x: number; y: number };
}

/** `kind(x, y)`: rank of the ground kind there, or -1 (unknown, wall art, outside the map). */
export function edgePieceAt(
  x: number,
  y: number,
  kind: (x: number, y: number) => number,
): EdgePiece | null {
  const me = kind(x, y);
  if (me < 0 || me >= PLAIN_GROUND) return null;
  const lower = (dx: number, dy: number): boolean => {
    const o = kind(x + dx, y + dy);
    return o >= 0 && o > me;
  };
  const n = !lower(0, -1);
  const s = !lower(0, 1);
  const w = !lower(-1, 0);
  const e = !lower(1, 0);
  let piece = -1;
  // A lone tile becomes a small patch; a one-tile strip has no piece that fits and stays whole.
  if (!n && !s && !w && !e) piece = 12;
  else if ((!n && !s) || (!w && !e)) return null;
  else if (!n && !w) piece = 0;
  else if (!n && !e) piece = 2;
  else if (!s && !w) piece = 5;
  else if (!s && !e) piece = 7;
  else if (!n) piece = 1;
  else if (!s) piece = 6;
  else if (!w) piece = 3;
  else if (!e) piece = 4;
  else if (lower(1, 1)) piece = 8;
  else if (lower(-1, 1)) piece = 9;
  else if (lower(1, -1)) piece = 10;
  else if (lower(-1, -1)) piece = 11;
  if (piece < 0) return null;
  for (const [dx, dy] of [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ])
    if (lower(dx, dy)) return { piece, under: { x: x + dx, y: y + dy } };
  return null;
}
