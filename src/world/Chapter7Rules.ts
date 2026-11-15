/**
 * Chapter 7 "The Cradle of the Forgotten" rules as pure functions (CHAPTER_07_DESIGN.md §18) —
 * no Phaser, so they are unit-tested: the timing of the four new map enemies and the Void
 * Inquisitor's chain trial.
 */

export interface Pt {
  x: number;
  y: number;
}

/** Hollow Husk: frozen while Peter stands still. */
export function huskFrozen(peterSpeed: number, threshold = 8): boolean {
  return peterSpeed < threshold;
}

/** Peter has stood still long enough for the husk's chest to start pulling him. */
export function huskPulls(stillSince: number, now: number, pullAfterMs: number): boolean {
  return now - stillSince >= pullAfterMs;
}

export type TellStage =
  { stage: 'tell'; window: boolean } | { stage: 'strike' } | { stage: 'done' };

/**
 * A wind-up of `tellMs` whose last `windowMs` is the moment to act (Name Eater's glowing mouth,
 * the moths closing in), then the strike lands at its end.
 */
export function tellStage(
  now: number,
  startAt: number,
  tellMs: number,
  windowMs: number,
): TellStage {
  const t = now - startAt;
  if (t < 0) return { stage: 'done' };
  if (t < tellMs) return { stage: 'tell', window: t >= tellMs - windowMs };
  if (t < tellMs + 60) return { stage: 'strike' };
  return { stage: 'done' };
}

/** Ink Hound: runs for `runMs`, then stands solid for `pauseMs`, again and again. */
export function houndSolid(now: number, offset: number, runMs: number, pauseMs: number): boolean {
  return (now + offset) % (runMs + pauseMs) >= runMs;
}

/** Ink Hound's run: a figure eight around the spot it guards. */
export function figureEight(center: Pt, t: number, radius: number, periodMs: number): Pt {
  const a = (t / periodMs) * Math.PI * 2;
  return { x: center.x + Math.sin(a) * radius, y: center.y + (Math.sin(a * 2) * radius) / 2 };
}

/** Void Inquisitor: three chain circles around `spot`, 120° apart, `offset` px from it. */
export function chainCenters(spot: Pt, offset: number, turn = 0): Pt[] {
  return [0, 1, 2].map((k) => {
    const a = turn + (k * Math.PI * 2) / 3;
    return { x: spot.x + Math.cos(a) * offset, y: spot.y + Math.sin(a) * offset };
  });
}

/**
 * Where Peter stands when the chains close: inside all three circles (the one safe spot), inside
 * some of them (hit), or outside all (hit — the chains sweep the whole ground).
 */
export function chainVerdict(p: Pt, centers: Pt[], radius: number): 'safe' | 'hit' {
  const inside = centers.filter((c) => Math.hypot(p.x - c.x, p.y - c.y) <= radius).length;
  return inside === centers.length ? 'safe' : 'hit';
}
