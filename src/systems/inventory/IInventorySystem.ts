import { IItemDefinition, IItemStack, InventoryDatabase } from './InventoryTypes';

export interface IInventorySystem {
  loadDatabase(data: InventoryDatabase): void;
  addItem(itemId: string, quantity?: number): boolean;
  removeItem(itemId: string, quantity?: number): boolean;
  hasItem(itemId: string, quantity?: number): boolean;
  getItemCount(itemId: string): number;
  getAllItems(): IItemStack[];
  getItemDefinition(itemId: string): IItemDefinition | undefined;
  clear(): void;
}

