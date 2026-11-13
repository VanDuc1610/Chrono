/**
 * Chapter 4 map puzzles as plain data and pure functions (CHAPTER_04_DESIGN.md §13.2) — no Phaser,
 * so they are unit-tested.
 *
 * - A dial cycles through its values on each [E]; the current value is kept as one session flag
 *   `<dialId>_<key>` so it survives map changes and saves, and dialogue rules can test it.
 * - A scale weighs the sacks put on its two pans; the weights are never shown to the player.
 */

export interface DialValue {
  key: string;
  label: string;
}

/** Flag holding a dial's value. */
export const dialFlag = (dialId: string, key: string): string => `${dialId}_${key}`;

/** Index of the value whose flag is set (the first one when none is). */
export function dialIndex(
  dialId: string,
  values: readonly DialValue[],
  flag: (f: string) => boolean,
): number {
  const i = values.findIndex((v) => flag(dialFlag(dialId, v.key)));
  return i < 0 ? 0 : i;
}

/** Flags to write so the dial shows `index`: that value on, every other one off. */
export function dialFlags(
  dialId: string,
  values: readonly DialValue[],
  index: number,
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  values.forEach((v, i) => (out[dialFlag(dialId, v.key)] = i === index));
  return out;
}

export interface ScaleRules {
  /** Weight of each sack item id (never shown). */
  weights: Record<string, number>;
  /** Both pans exactly this heavy: the door opens gently. */
  balanceAt: number;
  /** Any pan heavier than this: the bolt bursts. */
  breakAbove: number;
}

export interface Pans {
  left: string[];
  right: string[];
}

export type ScaleReading = 'balanced' | 'overload' | 'left' | 'right' | 'even' | 'empty';

export function panWeight(rules: ScaleRules, pan: readonly string[]): number {
  return pan.reduce((sum, id) => sum + (rules.weights[id] ?? 0), 0);
}

/** What the scale does after a sack is put on it. Overload wins over balance. */
export function readScale(rules: ScaleRules, pans: Pans): ScaleReading {
  const l = panWeight(rules, pans.left);
  const r = panWeight(rules, pans.right);
  if (l > rules.breakAbove || r > rules.breakAbove) return 'overload';
  if (l === rules.balanceAt && r === rules.balanceAt) return 'balanced';
  if (l === 0 && r === 0) return 'empty';
  if (l === r) return 'even';
  return l > r ? 'left' : 'right';
}
