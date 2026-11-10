import { ISaveSystem } from './ISaveSystem';
import { ISaveData, ISaveMetadata } from './SaveTypes';

export class SaveSystem implements ISaveSystem {
  private readonly storagePrefix = 'chrono_save_slot_';
  private inMemoryFallback: Map<number, string> = new Map();

  private isLocalStorageAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const testKey = '__chrono_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  public async save(slot: number, data: ISaveData): Promise<boolean> {
    try {
      const serialized = JSON.stringify(data);
      if (this.isLocalStorageAvailable()) {
        window.localStorage.setItem(`${this.storagePrefix}${slot}`, serialized);
      } else {
        this.inMemoryFallback.set(slot, serialized);
      }
      return true;
    } catch (err) {
      console.error(`[SaveSystem] Failed to save slot ${slot}:`, err);
      return false;
    }
  }

  public async load(slot: number): Promise<ISaveData | null> {
    try {
      let raw: string | null = null;
      if (this.isLocalStorageAvailable()) {
        raw = window.localStorage.getItem(`${this.storagePrefix}${slot}`);
      } else {
        raw = this.inMemoryFallback.get(slot) || null;
      }

      if (!raw) return null;
      return JSON.parse(raw) as ISaveData;
    } catch (err) {
      console.error(`[SaveSystem] Failed to parse save slot ${slot}:`, err);
      return null;
    }
  }

  public async delete(slot: number): Promise<boolean> {
    try {
      if (this.isLocalStorageAvailable()) {
        window.localStorage.removeItem(`${this.storagePrefix}${slot}`);
      }
      this.inMemoryFallback.delete(slot);
      return true;
    } catch (err) {
      console.error(`[SaveSystem] Failed to delete save slot ${slot}:`, err);
      return false;
    }
  }

  public async getMetadata(slot: number): Promise<ISaveMetadata | null> {
    const data = await this.load(slot);
    if (!data) return null;

    return {
      slot,
      timestamp: data.timestamp,
      playerLevel: data.player.level,
      mapId: data.player.position.mapId,
      playtimeSeconds: data.playtimeSeconds,
    };
  }

  public async listSlots(): Promise<ISaveMetadata[]> {
    const results: ISaveMetadata[] = [];
    for (let slot = 1; slot <= 3; slot++) {
      const meta = await this.getMetadata(slot);
      if (meta) {
        results.push(meta);
      }
    }
    return results;
  }

  public hasSave(slot: number): boolean {
    if (this.isLocalStorageAvailable()) {
      return window.localStorage.getItem(`${this.storagePrefix}${slot}`) !== null;
    }
    return this.inMemoryFallback.has(slot);
  }
}

