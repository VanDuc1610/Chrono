/**
 * Chapter 6 "The Hour of the Gods" rules as pure functions (CHAPTER_06_DESIGN.md §17) — no Phaser,
 * so they are unit-tested: the light beam through mirrors and a prism, and the timing of the
 * four new map enemies.
 */

export interface Tile {
  x: number;
  y: number;
}

export type Mirror = '/' | '\\';

export interface BeamSetup {
  start: Tile;
  /** First step direction from the start tile (one of the four axes). */
  dir: Tile;
  /** Mirrors by "x,y": '/' turns east into north, '\\' turns east into south. */
  mirrors: ReadonlyMap<string, Mirror>;
  /** Tiles that tint the beam blue. */
  prisms: ReadonlySet<string>;
  /** Brass pillars scatter a white beam; a blue one passes them. */
  brass: ReadonlySet<string>;
  target: Tile;
  blocked: (x: number, y: number) => boolean;
  maxSteps?: number;
}

export interface BeamTrace {
  /** Tiles the beam passes, start first. */
  path: Tile[];
  color: 'white' | 'blue';
  /** Why it stopped. */
  end: 'target' | 'wall' | 'brass' | 'steps';
  /** Reached the target already blue. */
  lit: boolean;
}

export const tileKey = (t: Tile): string => `${t.x},${t.y}`;

/** Turns a direction on a mirror. */
export function reflect(dir: Tile, mirror: Mirror): Tile {
  // `|| 0` keeps -0 out of the result.
  return mirror === '/' ? { x: -dir.y || 0, y: -dir.x || 0 } : { x: dir.y, y: dir.x };
}

/** Follows the beam tile by tile until it hits the target, a wall or a brass pillar. */
export function traceBeam(s: BeamSetup): BeamTrace {
  let pos = { ...s.start };
  let dir = { ...s.dir };
  let color: 'white' | 'blue' = 'white';
  const path: Tile[] = [{ ...pos }];
  const max = s.maxSteps ?? 200;
  for (let i = 0; i < max; i++) {
    pos = { x: pos.x + dir.x, y: pos.y + dir.y };
    const key = tileKey(pos);
    // Mirror, prism, brass and target pillars stand on wall tiles but take the beam.
    const special =
      s.mirrors.has(key) ||
      s.prisms.has(key) ||
      s.brass.has(key) ||
      (pos.x === s.target.x && pos.y === s.target.y);
    if (!special && s.blocked(pos.x, pos.y)) return { path, color, end: 'wall', lit: false };
    path.push({ ...pos });
    if (pos.x === s.target.x && pos.y === s.target.y) {
      return { path, color, end: 'target', lit: color === 'blue' };
    }
    if (s.brass.has(key) && color === 'white') return { path, color, end: 'brass', lit: false };
    if (s.prisms.has(key)) color = 'blue';
    const m = s.mirrors.get(key);
    if (m) dir = reflect(dir, m);
  }
  return { path, color, end: 'steps', lit: false };
}

/** Where a Heel Shadow stands: where Peter was `delayMs` ago (his oldest known spot before that). */
export function trailPosition(
  history: readonly { t: number; x: number; y: number }[],
  now: number,
  delayMs: number,
): { x: number; y: number } | null {
  if (history.length === 0) return null;
  const want = now - delayMs;
  let best = history[0];
  for (const h of history) {
    if (h.t <= want) best = h;
    else break;
  }
  return { x: best.x, y: best.y };
}

/** Twin Star: a hit only counts when the other orb was hit within the window. */
export function twinPaired(otherHitAt: number, now: number, windowMs: number): boolean {
  return now - otherHitAt <= windowMs;
}

export type RingState =
  { phase: 'beat'; beat: 1 | 2 | 3 } | { phase: 'ring'; radius: number } | { phase: 'done' };

/** Origin Nullifier: three beats (`beatMs` each), then a ring grows to `radius` in `ringMs`. */
export function ringState(
  now: number,
  startAt: number,
  beatMs: number,
  ringMs: number,
  radius: number,
): RingState {
  const t = now - startAt;
  if (t < 0) return { phase: 'done' };
  if (t < beatMs * 3) return { phase: 'beat', beat: (Math.floor(t / beatMs) + 1) as 1 | 2 | 3 };
  const r = t - beatMs * 3;
  if (r <= ringMs) return { phase: 'ring', radius: (radius * r) / ringMs };
  return { phase: 'done' };
}

/** True when the ring's edge is passing over someone `dist` px from its centre. */
export function ringCrosses(dist: number, radius: number, band = 12): boolean {
  return Math.abs(dist - radius) <= band;
}

export type LaserStage =
  { stage: 'blink'; n: 1 | 2 | 3; lit: boolean } | { stage: 'fire' } | { stage: 'done' };

/**
 * Archon Construct: the laser line blinks three times (`blinkMs` per blink, lit for its first
 * half), then fires for `fireMs`. Slashing the construct during the third blink turns it off.
 */
export function laserStage(
  now: number,
  startAt: number,
  blinkMs: number,
  fireMs: number,
): LaserStage {
  const t = now - startAt;
  if (t < 0) return { stage: 'done' };
  if (t < blinkMs * 3) {
    const n = (Math.floor(t / blinkMs) + 1) as 1 | 2 | 3;
    return { stage: 'blink', n, lit: t % blinkMs < blinkMs / 2 };
  }
  if (t < blinkMs * 3 + fireMs) return { stage: 'fire' };
  return { stage: 'done' };
}

/** A dial index moved by `step` (negative turns it back), wrapping around. */
export function stepIndex(index: number, step: number, length: number): number {
  return (((index + step) % length) + length) % length;
}
