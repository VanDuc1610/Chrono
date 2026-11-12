export type ItemCategory =
  'consumable' | 'equipment' | 'weapon' | 'charm' | 'material' | 'key_item';

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
}

export interface IItemStack {
  itemId: string;
  quantity: number;
}

export interface InventoryDatabase {
  items: IItemDefinition[];
}
