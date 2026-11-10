import { IInventorySystem } from './IInventorySystem';
import { IItemDefinition, IItemStack, InventoryDatabase } from './InventoryTypes';

export class InventorySystem implements IInventorySystem {
  private database: Map<string, IItemDefinition> = new Map();
  private items: Map<string, number> = new Map();

  public loadDatabase(data: InventoryDatabase): void {
    this.database.clear();
    for (const item of data.items) {
      this.database.set(item.id, item);
    }
  }

  public addItem(itemId: string, quantity = 1): boolean {
    if (quantity <= 0) return false;
    const def = this.database.get(itemId);
    if (!def) {
      console.warn(`[InventorySystem] Cannot add unknown item ID: ${itemId}`);
      return false;
    }

    const currentQty = this.items.get(itemId) || 0;
    const maxStack = def.stackable ? def.maxStack || 99 : 1;

    if (!def.stackable && currentQty >= 1) {
      return false;
    }

    const newQty = Math.min(currentQty + quantity, maxStack);
    this.items.set(itemId, newQty);
    return true;
  }

  public removeItem(itemId: string, quantity = 1): boolean {
    if (quantity <= 0) return false;
    const currentQty = this.items.get(itemId) || 0;
    if (currentQty < quantity) {
      return false;
    }

    const remaining = currentQty - quantity;
    if (remaining <= 0) {
      this.items.delete(itemId);
    } else {
      this.items.set(itemId, remaining);
    }
    return true;
  }

  public hasItem(itemId: string, quantity = 1): boolean {
    const currentQty = this.items.get(itemId) || 0;
    return currentQty >= quantity;
  }

  public getItemCount(itemId: string): number {
    return this.items.get(itemId) || 0;
  }

  public getAllItems(): IItemStack[] {
    const result: IItemStack[] = [];
    for (const [itemId, quantity] of this.items.entries()) {
      result.push({ itemId, quantity });
    }
    return result;
  }

  public getItemDefinition(itemId: string): IItemDefinition | undefined {
    return this.database.get(itemId);
  }

  public clear(): void {
    this.items.clear();
  }

  public loadFromState(stacks: IItemStack[]): void {
    this.clear();
    for (const stack of stacks) {
      this.items.set(stack.itemId, stack.quantity);
    }
  }
}

