import type { RangedProfile } from '../inventory/InventoryTypes';

/** How each melee family swings (T-84). The weapon's own reach / swingMs still apply. */
export interface MeleeShape {
  /** Slash width in degrees. */
  arcDeg: number;
  /** Damage relative to a sword slash. */
  damageMult: number;
  /** Knockback relative to the default. */
  knockMult: number;
  /** Slash colour. */
  color: number;
}

export const MELEE_SHAPES: Record<string, MeleeShape> = {
  /** Balanced arc. */
  sword: { arcDeg: 120, damageMult: 1, knockMult: 1, color: 0xbfefff },
  /** Narrow, quick stab; a little more critical (see `meleeCritBonus`). */
  rapier: { arcDeg: 70, damageMult: 0.95, knockMult: 0.6, color: 0xe6f6ff },
  /** Narrow, long thrust. */
  spear: { arcDeg: 50, damageMult: 1.1, knockMult: 1.2, color: 0xffe6a8 },
  /** Wide, heavy sweep. */
  heavy: { arcDeg: 170, damageMult: 1.25, knockMult: 1.8, color: 0xffc58a },
};

export function meleeShape(family: string | undefined): MeleeShape {
  return MELEE_SHAPES[family ?? 'sword'] ?? MELEE_SHAPES.sword;
}

/** Extra critical chance of a family (rapiers find the gaps). */
export function meleeCritBonus(family: string | undefined): number {
  return family === 'rapier' ? 0.1 : 0;
}

/** Aim angles of one trigger pull: `shots` spread evenly over `spreadDeg`, centred on `aim`. */
export function shotAngles(
  aim: number,
  profile: Pick<RangedProfile, 'shots' | 'spreadDeg'>,
): number[] {
  const n = Math.max(1, profile.shots ?? 1);
  if (n === 1) return [aim];
  const spread = ((profile.spreadDeg ?? 20) * Math.PI) / 180;
  return Array.from({ length: n }, (_, i) => aim - spread / 2 + (spread * i) / (n - 1));
}

/** Attack used by a shot: Peter's attack without his melee weapon, plus the ranged weapon's. */
export function rangedAttack(
  peterAttack: number,
  meleeWeaponAttack: number,
  rangedAttack: number,
): number {
  return Math.max(1, peterAttack - meleeWeaponAttack + rangedAttack);
}

/** Point-to-segment distance: did a shot moving from `a` to `b` this frame pass within `r` of `p`? */
export function segmentHits(
  a: { x: number; y: number },
  b: { x: number; y: number },
  p: { x: number; y: number },
  r: number,
): boolean {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  const cx = a.x + dx * t;
  const cy = a.y + dy * t;
  return Math.hypot(p.x - cx, p.y - cy) <= r;
}
