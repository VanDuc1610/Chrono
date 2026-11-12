import { IItemStack } from '../inventory/InventoryTypes';
import { IQuest } from '../quest/QuestTypes';

export interface IPlayerSaveData {
  name: string;
  level: number;
  /** Total experience. Optional for 0.1.x saves, which predate EXP (treated as 0). */
  exp?: number;
  hp: number;
  maxHp: number;
  position: {
    mapId: string;
    x: number;
    y: number;
  };
}

export interface ISaveData {
  version: string;
  timestamp: number;
  playtimeSeconds: number;
  player: IPlayerSaveData;
  inventory: IItemStack[];
  quests: IQuest[];
  flags: Record<string, boolean | number | string>;
  /** 0.4.0+: equipped item ids. */
  equipment?: { weapon: string | null; charm: string | null };
  /** 0.4.0+: item ids on the 1-4 quick keys. */
  quickSlots?: (string | null)[];
}

export interface ISaveMetadata {
  slot: number;
  timestamp: number;
  playerLevel: number;
  mapId: string;
  playtimeSeconds: number;
}
