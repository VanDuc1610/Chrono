import type { Point } from './ActionRules';

/**
 * Peter's six Authority skills (owner, 2026-11-18): one per Authority he mends, chapters 1-6
 * (Continuum, Causality, Memory, Finality, Possibility, Origin), carried in three slots on Z / X / C
 * beside Temporal Strike (right click). Tuning lives in public/assets/data/skills.json.
 */
export type Authority =
  'continuum' | 'causality' | 'memory' | 'finality' | 'possibility' | 'origin';

export interface SkillDef {
  id: string;
  authority: Authority;
  /** Unlocked once this chapter is finished (its Authority mended). */
  chapter: number;
  color: string;
  mpCost: number;
  cooldownMs: number;
  /** Damage multiplier on Peter's attack (the skill's main blow). */
  mult: number;
  range?: number;
  arcDeg?: number;
  radius?: number;
  knockback?: number;
  slowPct?: number;
  slowMs?: number;
  hopRange?: number;
  hops?: number;
  falloff?: number;
  durationMs?: number;
  everyMs?: number;
  executePct?: number;
  burnMult?: number;
  burnTicks?: number;
  burnEveryMs?: number;
  fuseMs?: number;
  critWindowMs?: number;
  healPct?: number;
  shieldPct?: number;
}

export interface SkillDatabase {
  slots: number;
  skills: SkillDef[];
}

/** The skills Peter has, in the order he gains them. */
export function unlockedSkills(db: SkillDatabase, lastFinishedChapter: number): SkillDef[] {
  return db.skills
    .filter((s) => s.chapter <= lastFinishedChapter)
    .sort((a, b) => a.chapter - b.chapter);
}

/**
 * The slots after a check: skills no longer known are cleared, and newly known ones fill the first
 * empty slots (a player who has not set the slots gets the skills as they come).
 */
export function fillSlots(
  slots: (string | null)[],
  known: string[],
  count: number,
): (string | null)[] {
  const out = Array.from({ length: count }, (_, i) => {
    const id = slots[i] ?? null;
    return id && known.includes(id) ? id : null;
  });
  for (const id of known) {
    if (out.includes(id)) continue;
    const free = out.indexOf(null);
    if (free < 0) break;
    out[free] = id;
  }
  return out;
}

/** Puts a skill in a slot; if it already sits in another slot, the two swap. */
export function assignSlot(
  slots: (string | null)[],
  index: number,
  id: string | null,
): (string | null)[] {
  const out = [...slots];
  const from = id ? out.indexOf(id) : -1;
  if (from >= 0 && from !== index) out[from] = out[index] ?? null;
  out[index] = id;
  return out;
}

/** The damage of one skill blow: attack × mult less defence, never below `min`. */
export function skillDamage(attack: number, mult: number, defense: number, min = 3): number {
  return Math.max(min, Math.floor(attack * mult - defense));
}

/**
 * Causality's chain: the nearest target within `range` of Peter, then each hop to the nearest
 * untouched target within `hopRange` of the last one, up to `hops` targets. Returns their indices.
 */
export function chainOrder(
  from: Point,
  targets: Point[],
  range: number,
  hopRange: number,
  hops: number,
): number[] {
  const order: number[] = [];
  let at = from;
  let reach = range;
  while (order.length < hops) {
    let best = -1;
    let bestD = reach;
    targets.forEach((t, i) => {
      if (order.includes(i)) return;
      const d = Math.hypot(t.x - at.x, t.y - at.y);
      if (d <= bestD) {
        bestD = d;
        best = i;
      }
    });
    if (best < 0) break;
    order.push(best);
    at = targets[best];
    reach = hopRange;
  }
  return order;
}

/** Each hop of the chain hits a little softer. */
export function chainMult(mult: number, falloff: number, hop: number): number {
  return mult * Math.max(0.2, 1 - falloff * hop);
}

/** Finality ends a foe below this share of its HP outright (never a boss). */
export function executes(hp: number, maxHp: number, pct: number, boss: boolean): boolean {
  return !boss && hp > 0 && hp <= maxHp * pct;
}

/** Origin's shield takes a blow first: what the shield keeps and what reaches Peter. */
export function absorb(shield: number, damage: number): { shield: number; damage: number } {
  const taken = Math.min(shield, damage);
  return { shield: shield - taken, damage: damage - taken };
}

/** How far Possibility's blink goes: up to `range` px, stopping before the first blocked step. */
export function blinkDistance(range: number, blocked: (d: number) => boolean, step = 8): number {
  let d = 0;
  while (d + step <= range && !blocked(d + step)) d += step;
  return d;
}
