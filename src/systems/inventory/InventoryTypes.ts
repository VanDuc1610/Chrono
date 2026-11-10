export type ItemCategory = 'consumable' | 'equipment' | 'material' | 'key_item';

export interface IItemDefinition {
  id: string;
  name: string;
  type: ItemCategory;
  description: string;
  value: number;
  stackable: boolean;
  maxStack?: number;
  effects?: Record<string, number>;
}

export interface IItemStack {
  itemId: string;
  quantity: number;
}

export interface InventoryDatabase {
  items: IItemDefinition[];
}

