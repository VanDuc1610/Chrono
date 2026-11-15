/**
 * Chapter 8 "The Null Hour & The Convergence" rules as pure functions (CHAPTER_08_DESIGN.md §9,
 * §18) — no Phaser, so they are unit-tested: the four new map foes, the Second-Hand Warden, and the
 * turn-based tricks of the Convergent Praetor, the Herald of the Null Hour and the Sixfold Echo.
 */

export type PeterMove = 'slash' | 'dash' | 'skill';

/** Assimilator: it has learned Peter's last move; using that same move again is countered. */
export function mimicCounters(learned: PeterMove | null, move: PeterMove): boolean {
  return learned !== null && learned === move;
}

/** Sprite frame showing the learned move (0 slash, 1 dash, 2 skill). */
export function mimicFrame(learned: PeterMove | null): number {
  return learned === 'dash' ? 1 : learned === 'skill' ? 2 : 0;
}

export interface BellState {
  /** Tolls rung so far in this cycle (0-3). */
  tolls: number;
  /** The third toll's wave is spreading (0..1 of its radius), or null. */
  wave: number | null;
  /** The cycle is over: start the next one. */
  done: boolean;
}

/**
 * Doom Bell: tolls at `startAt`, `+tollMs`, `+2·tollMs`; the third toll sends a wave out over
 * `waveMs`. A slash while exactly one toll has rung cracks the bell (the cycle restarts).
 */
export function bellState(now: number, startAt: number, tollMs: number, waveMs: number): BellState {
  const t = now - startAt;
  if (t < 0) return { tolls: 0, wave: null, done: false };
  const tolls = Math.min(3, Math.floor(t / tollMs) + 1);
  if (tolls < 3) return { tolls, wave: null, done: false };
  const w = (t - 2 * tollMs) / waveMs;
  if (w >= 1) return { tolls: 3, wave: null, done: true };
  return { tolls: 3, wave: w, done: false };
}

/** The bell can be cracked between the first and the second toll. */
export function bellCrackable(s: BellState): boolean {
  return s.tolls === 1;
}

/** Twin-Era Legionnaire: with an ally near, it turns its shield to the ally for `turnMs` of every `everyMs`. */
export function tauntActive(
  now: number,
  offset: number,
  everyMs: number,
  turnMs: number,
  allyNear: boolean,
): boolean {
  return allyNear && (now + offset) % everyMs < turnMs;
}

/** Phase Wraith: its own world anchored → solid; the other world → faded; else it blinks. */
export function wraithSolid(
  anchored: 'own' | 'other' | null,
  now: number,
  offset: number,
  everyMs: number,
  solidMs: number,
): boolean {
  if (anchored === 'own') return true;
  if (anchored === 'other') return false;
  return (now + offset) % everyMs < solidMs;
}

/** Second-Hand Warden: the hand's angle (radians, clockwise from north) `periodMs` per turn. */
export function sweepAngle(now: number, startAt: number, periodMs: number): number {
  const t = (((now - startAt) % periodMs) + periodMs) % periodMs;
  return (t / periodMs) * Math.PI * 2 - Math.PI / 2;
}

/** The Warden can be hurt only in the `windowMs` right after each tick. */
export function inTickWindow(
  now: number,
  offset: number,
  tickMs: number,
  windowMs: number,
): boolean {
  return (now + offset) % tickMs < windowMs;
}

/**
 * Convergent Praetor's Mirror Verdict: odd turns play a fresh ring rhythm, even turns play the
 * previous one backwards. `pick` draws ring durations from `pool`.
 */
export function echoRhythm(
  turn: number,
  previous: readonly number[] | null,
  count: number,
  pool: readonly number[],
  pick: () => number,
): { rings: number[]; reversed: boolean } {
  if (turn % 2 === 0 && previous && previous.length > 0) {
    return { rings: [...previous].reverse(), reversed: true };
  }
  const rings: number[] = [];
  for (let k = 0; k < count; k++) rings.push(pool[Math.floor(pick() * pool.length) % pool.length]);
  return { rings, reversed: false };
}

export interface ClockStep {
  hand: number;
  /** The hand reached the top: the Null Strike falls (then the hand resets). */
  strike: boolean;
  /** Kuro held the hand back this turn (once per fight). */
  kuroHeld: boolean;
}

/**
 * Herald of the Null Hour: after its turn the hand moves 1 + one per missed ring. Reaching `top`
 * strikes and resets to `start`, unless Kuro still has his one save (the hand stops one short).
 */
export function advanceClock(
  hand: number,
  misses: number,
  start: number,
  top: number,
  kuroSaveLeft: boolean,
): ClockStep {
  const next = hand + 1 + Math.max(0, misses);
  if (next < top) return { hand: next, strike: false, kuroHeld: false };
  if (kuroSaveLeft) return { hand: top - 1, strike: false, kuroHeld: true };
  return { hand: start, strike: true, kuroHeld: false };
}

/** A companion pushes the hand back by `by` (never below `start`). */
export function pushClock(hand: number, by: number, start: number): number {
  return Math.max(start, hand - by);
}

/** Sixfold Echo: which of its `n` seal phases is active at this HP ratio (0 first). */
export function sealPhase(hpRatio: number, n: number): number {
  const lost = 1 - Math.max(0, Math.min(1, hpRatio));
  return Math.min(n - 1, Math.floor(lost * n + 1e-9));
}
