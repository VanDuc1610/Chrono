import { ISaveSystem } from './ISaveSystem';
import { ISaveData, ISaveMetadata } from './SaveTypes';

/** Save format major version this build can read. Bump when ISaveData changes incompatibly. */
const SUPPORTED_SAVE_MAJOR = '0';

/**
 * Structural check for data coming out of storage. A save written by an older build or edited by
 * hand must be rejected here, not crash scene init later.
 */
export function isValidSaveData(value: unknown): value is ISaveData {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  const player = v.player as Record<string, unknown> | undefined;
  const position = player?.position as Record<string, unknown> | undefined;

  return (
    typeof v.version === 'string' &&
    v.version.split('.')[0] === SUPPORTED_SAVE_MAJOR &&
    typeof v.timestamp === 'number' &&
    typeof v.playtimeSeconds === 'number' &&
    typeof player === 'object' &&
    player !== null &&
    typeof player.level === 'number' &&
    typeof player.hp === 'number' &&
    typeof player.maxHp === 'number' &&
    typeof position === 'object' &&
    position !== null &&
    typeof position.mapId === 'string' &&
    Number.isFinite(position.x) &&
    Number.isFinite(position.y) &&
    Array.isArray(v.inventory) &&
    v.inventory.every(
      (s: unknown) =>
        typeof s === 'object' &&
        s !== null &&
        typeof (s as Record<string, unknown>).itemId === 'string' &&
        Number.isInteger((s as Record<string, unknown>).quantity) &&
        ((s as Record<string, unknown>).quantity as number) > 0,
    ) &&
    Array.isArray(v.quests) &&
    typeof v.flags === 'object' &&
    v.flags !== null
  );
}

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
    return this.readSlot(slot);
  }

  private readRaw(slot: number): string | null {
    if (this.isLocalStorageAvailable()) {
      return window.localStorage.getItem(`${this.storagePrefix}${slot}`);
    }
    return this.inMemoryFallback.get(slot) ?? null;
  }

  private readSlot(slot: number): ISaveData | null {
    try {
      const raw = this.readRaw(slot);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      if (!isValidSaveData(parsed)) {
        console.warn(`[SaveSystem] Save slot ${slot} is corrupt or from an incompatible version; ignoring.`);
        return null;
      }
      return parsed;
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

  /** True only for a save that would actually load, so CONTINUE is never enabled for a dead slot. */
  public hasSave(slot: number): boolean {
    return this.readSlot(slot) !== null;
  }
}

