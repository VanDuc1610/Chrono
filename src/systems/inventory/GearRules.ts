import type { Authority } from '../action/AuthorityRules';
import type { EquipStats } from './InventoryTypes';

/**
 * Gear rarity, special effects and sets (owner, 2026-11-18). Data in
 * public/assets/data/equipment.json; pure rules here so they stay unit-testable.
 */
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export const RARITIES: readonly Rarity[] = ['common', 'rare', 'epic', 'legendary'];

export type GearEffectKind =
  /** Share of melee / ranged damage dealt that heals Peter. */
  | 'lifesteal'
  /** Hits set the foe burning: this share of the hit again, over 3 ticks. */
  | 'burnOnHit'
  /** Hits slow the foe by this share for 1.5 s. */
  | 'slowOnHit'
  /** MP gained per hit. */
  | 'mpOnHit'
  /** Extra crit chance (crits deal 1.5×). */
  | 'crit'
  /** Authority skills deal this much more (one Authority, or all when `authority` is absent). */
  | 'skillPower'
  /** Authority cooldowns are this share shorter. */
  | 'cooldownCut'
  /** Dash cooldown shorter by this many ms. */
  | 'dashCut'
  /** This share of the damage Peter takes in melee is dealt back. */
  | 'thorns'
  /** HP regained every 5 s on the map. */
  | 'regen';

export interface GearEffect {
  kind: GearEffectKind;
  value: number;
  authority?: Authority;
}

export interface GearItem {
  rarity: Rarity;
  effects: GearEffect[];
}

export interface SetBonus {
  count: number;
  stats?: EquipStats;
  effects?: GearEffect[];
}

export interface GearSet {
  pieces: string[];
  bonuses: SetBonus[];
}

export interface EquipmentDatabase {
  rarity: Record<Rarity, { color: string }>;
  items: Record<string, GearItem>;
  sets: Record<string, GearSet>;
}

/** Caps so stacked gear never breaks a fight. */
export const GEAR_CAPS: Partial<Record<GearEffectKind, number>> = {
  lifesteal: 0.25,
  crit: 0.5,
  cooldownCut: 0.4,
  thorns: 0.6,
  slowOnHit: 0.6,
  dashCut: 400,
};

export interface SetState {
  id: string;
  count: number;
  total: number;
  /** Bonuses reached (count ≥ bonus.count). */
  active: SetBonus[];
}

export interface GearProfile {
  /** Stats from set bonuses (item stats stay in GameSession.equipBonus). */
  stats: EquipStats;
  /** Summed effects (skillPower kept apart). */
  totals: Partial<Record<Exclude<GearEffectKind, 'skillPower'>, number>>;
  /** skillPower per Authority; `all` applies to every skill. */
  skillPower: Partial<Record<Authority | 'all', number>>;
  sets: SetState[];
}

export const EMPTY_PROFILE: GearProfile = { stats: {}, totals: {}, skillPower: {}, sets: [] };

/** Every set the worn gear touches, with the bonuses reached. */
export function setStates(db: EquipmentDatabase, worn: string[]): SetState[] {
  const out: SetState[] = [];
  for (const [id, set] of Object.entries(db.sets)) {
    const count = set.pieces.filter((p) => worn.includes(p)).length;
    if (count === 0) continue;
    out.push({
      id,
      count,
      total: set.pieces.length,
      active: set.bonuses.filter((b) => count >= b.count),
    });
  }
  return out;
}

/** Sums the effects of the worn gear and its set bonuses, capped. */
export function gearProfile(db: EquipmentDatabase | undefined, worn: string[]): GearProfile {
  if (!db) return EMPTY_PROFILE;
  const profile: GearProfile = { stats: {}, totals: {}, skillPower: {}, sets: [] };
  const add = (e: GearEffect): void => {
    if (e.kind === 'skillPower') {
      const k = e.authority ?? 'all';
      profile.skillPower[k] = (profile.skillPower[k] ?? 0) + e.value;
    } else {
      profile.totals[e.kind] = (profile.totals[e.kind] ?? 0) + e.value;
    }
  };
  for (const id of worn) for (const e of db.items[id]?.effects ?? []) add(e);
  profile.sets = setStates(db, worn);
  for (const s of profile.sets) {
    for (const b of s.active) {
      for (const e of b.effects ?? []) add(e);
      for (const [k, v] of Object.entries(b.stats ?? {}) as [keyof EquipStats, number][]) {
        profile.stats[k] = (profile.stats[k] ?? 0) + v;
      }
    }
  }
  for (const [k, cap] of Object.entries(GEAR_CAPS) as [GearEffectKind, number][]) {
    if (k === 'skillPower') continue;
    const v = profile.totals[k];
    if (v !== undefined) profile.totals[k] = Math.min(cap, v);
  }
  return profile;
}

/** The damage multiplier gear gives one Authority's skill (1 = none). */
export function skillPowerFor(profile: GearProfile, authority: Authority): number {
  return 1 + (profile.skillPower.all ?? 0) + (profile.skillPower[authority] ?? 0);
}

/** A cooldown after gear's cut. */
export function cutCooldown(ms: number, profile: GearProfile): number {
  return Math.round(ms * (1 - (profile.totals.cooldownCut ?? 0)));
}

/** HP healed by lifesteal for one hit (at least 1 when there is any lifesteal). */
export function lifestealHeal(damage: number, profile: GearProfile): number {
  const pct = profile.totals.lifesteal ?? 0;
  return pct > 0 && damage > 0 ? Math.max(1, Math.round(damage * pct)) : 0;
}

/** Damage per burn tick from burnOnHit (3 ticks), at least 1. */
export function burnTick(damage: number, profile: GearProfile): number {
  const pct = profile.totals.burnOnHit ?? 0;
  return pct > 0 ? Math.max(1, Math.round((damage * pct) / 3)) : 0;
}

/** Damage reflected by thorns for one blow taken. */
export function thornsDamage(taken: number, profile: GearProfile): number {
  const pct = profile.totals.thorns ?? 0;
  return pct > 0 && taken > 0 ? Math.max(1, Math.round(taken * pct)) : 0;
}

/** The rarity of an item (common if not listed). */
export function rarityOf(db: EquipmentDatabase | undefined, id: string): Rarity {
  return db?.items[id]?.rarity ?? 'common';
}

/** The set an item belongs to, if any. */
export function setOf(db: EquipmentDatabase | undefined, id: string): string | null {
  if (!db) return null;
  for (const [sid, set] of Object.entries(db.sets)) if (set.pieces.includes(id)) return sid;
  return null;
}
