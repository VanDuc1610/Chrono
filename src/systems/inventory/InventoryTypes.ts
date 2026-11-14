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

export type EquipSlot = 'weapon' | 'charm';

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
