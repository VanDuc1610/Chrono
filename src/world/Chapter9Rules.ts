/**
 * Chapter 9 "The Fractured Divinity" rules as pure functions (CHAPTER_09_DESIGN.md §10 with §20) —
 * no Phaser, so they are unit-tested: the Nexus Sentinel's thrust and the Nexus Inquisitor's
 * four-blow chain.
 */

export type ThrustPhase = 'warn' | 'lunge' | 'stuck' | 'done';

/** Nexus Sentinel: a red line for `warnMs`, a lunge for `lungeMs`, then its blade sticks `stuckMs`. */
export function thrustPhase(
  now: number,
  startAt: number,
  warnMs: number,
  lungeMs: number,
  stuckMs: number,
): ThrustPhase {
  const t = now - startAt;
  if (t < warnMs) return 'warn';
  if (t < warnMs + lungeMs) return 'lunge';
  if (t < warnMs + lungeMs + stuckMs) return 'stuck';
  return 'done';
}

export interface ChainState {
  /** Blows struck so far in this chain (0-4). */
  beat: number;
  /** After the fourth blow: the guard is open. */
  open: boolean;
  /** The chain and its opening are over. */
  done: boolean;
}

/** Nexus Inquisitor: four blows `beatMs` apart (the first at `beatMs`), then open for `windowMs`. */
export function chainState(
  now: number,
  startAt: number,
  beatMs: number,
  windowMs: number,
): ChainState {
  const t = now - startAt;
  const beat = Math.max(0, Math.min(4, Math.floor(t / beatMs)));
  if (beat < 4) return { beat, open: false, done: false };
  const after = t - 4 * beatMs;
  return { beat: 4, open: after < windowMs, done: after >= windowMs };
}

/**
 * Chapter 9 field traits. They live here until T-82 (Codex) releases CombatTypes.ts; ActionCombat
 * reads them by widening `enemy.field`.
 */
export interface Ch9FieldTraits {
  /**
   * Nexus Sentinel: within `range` it locks a red line on Peter for `warnMs`, lunges along it for
   * `lungeMs` (`damageMult` if Peter is on the line and not dodging), then its blade sticks
   * `stuckMs`: slashes then deal `stuckMult`, otherwise only `guardMult`.
   */
  thrust?: {
    range: number;
    warnMs: number;
    lungeMs: number;
    stuckMs: number;
    damageMult: number;
    stuckMult: number;
    guardMult: number;
    cooldownMs: number;
  };
  /**
   * Nexus Inquisitor: within `range`, four blows `beatMs` apart hit Peter if he is within `reach`;
   * after the fourth its guard is open for `windowMs`, the only time slashes land.
   */
  chain4?: { range: number; reach: number; beatMs: number; windowMs: number; damageMult: number };
}
