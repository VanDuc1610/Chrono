export type ItemCategory =
  | 'consumable'
  | 'equipment'
  | 'weapon'
  | 'charm'
  | 'material'
  | 'key_item'
  /** Readable note / letter / journal page (bag tab "Ghi chép"): E opens its `pages`. */
  | 'document'
  /** Object used to solve a puzzle (bag tab "Manh mối", with key items). */
  | 'puzzle';

/** Bonuses of a weapon or charm while equipped; `reach` / `swingMs` only for weapons. */
export interface EquipStats {
  attack?: number;
  defense?: number;
  maxHp?: number;
  maxMp?: number;
  speed?: number;
  /** Slash reach in px (default player.json action.reach). */
  reach?: number;
  /** ms between slashes (default player.json action.swingMs). */
  swingMs?: number;
  /** Weapons only: a second slash 0.2 s later deals this fraction again (Blade of Possibility). */
  echoPct?: number;
}

/**
 * Gear slots (T-84): melee weapon (left click), ranged weapon (F toward the cursor), armor and
 * accessory. `charm` items go to `armor` or `accessory` by their `slot` field.
 */
export type EquipSlot = 'weapon' | 'ranged' | 'armor' | 'accessory';
export const EQUIP_SLOTS: readonly EquipSlot[] = ['weapon', 'ranged', 'armor', 'accessory'];

/** Melee families change the slash shape; ranged families fire projectiles. */
export type MeleeClass = 'sword' | 'rapier' | 'spear' | 'heavy';
export type RangedClass = 'sling' | 'crossbow' | 'repeater' | 'flintlock' | 'bow';

/** A ranged weapon's shot (bosses and map roamers alike). */
export interface RangedProfile {
  class: RangedClass;
  /** ms between shots. */
  fireMs: number;
  /** Projectile speed (px/s) and how far it flies (px). */
  speed: number;
  range: number;
  /** Shots per trigger, spread over `spreadDeg`. */
  shots?: number;
  spreadDeg?: number;
  /** Enemies a shot passes through before it stops (0 = stops on the first). */
  pierce?: number;
  /** Damage of each shot relative to a slash (default 0.7). */
  damageMult?: number;
  /** MP spent per trigger (default 0). */
  mpCost?: number;
}

export interface IItemDefinition {
  id: string;
  name: string;
  type: ItemCategory;
  description: string;
  value: number;
  stackable: boolean;
  maxStack?: number;
  effects?: Record<string, number>;
  /** For `weapon` / `charm` items. */
  equip?: EquipStats;
  /** `charm` items: armor (coats, plates) or accessory (keepsakes, charms). Default accessory. */
  slot?: 'armor' | 'accessory';
  /** `weapon` items: melee family (slash shape). Default sword. */
  melee?: MeleeClass;
  /** `weapon` items that shoot instead of slash: they go in the ranged slot. */
  ranged?: RangedProfile;
  /** For `document` items: the text, one entry per page. */
  pages?: string[];
}

export interface IItemStack {
  itemId: string;
  quantity: number;
}

export interface InventoryDatabase {
  items: IItemDefinition[];
}
