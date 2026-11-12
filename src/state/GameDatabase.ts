import type Phaser from 'phaser';
import type { ActionTuningInput } from '../systems/action/ActionRules';
import { CombatTuning, EnemyDatabase } from '../systems/combat/CombatTypes';
import { InventoryDatabase, IItemStack } from '../systems/inventory/InventoryTypes';
import { QuestDatabase } from '../systems/quest/QuestTypes';

export interface PlayerStats {
  maxHp: number;
  /** Chronal energy for Skills; refilled at the start of every battle. */
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
}

/** Shape of the `player` block in public/assets/data/player.json. */
export interface PlayerDefinition {
  id: string;
  name: string;
  spriteKey: string;
  baseStats: PlayerStats;
  growthPerLevel: PlayerStats;
  /** Total EXP required to reach level (index + 1). Its length is the level cap. */
  expThresholds: number[];
  /** Level cap while the Prologue is not complete (GDD: 3); afterwards the thresholds decide. */
  prologueLevelCap?: number;
  startingItems: IItemStack[];
  /** Item consumed by the combat ITEM command. */
  combatItemId: string;
}

export interface PlayerDatabase {
  player: PlayerDefinition;
  combat: CombatTuning;
  /** Real-time map combat tuning (defaults in ActionRules). */
  action?: ActionTuningInput;
  /**
   * Combat commands that need a story flag before they appear (Prologue v3: no Attack until the
   * Elder hands Peter the Broken Blade, no Skill until Temporal Sight awakens).
   */
  commandFlags?: Partial<Record<string, string>>;
}

/** All static game data, loaded once by PreloadScene into the JSON cache. */
export interface GameDatabase {
  items: InventoryDatabase;
  quests: QuestDatabase;
  enemies: EnemyDatabase;
  player: PlayerDatabase;
}

const CACHE_KEYS = {
  items: 'data_items',
  quests: 'data_quests',
  enemies: 'data_enemies',
  player: 'data_player',
} as const;

function readJson<T>(scene: Phaser.Scene, key: string): T {
  const value: unknown = scene.cache.json.get(key);
  if (value === undefined || value === null) {
    throw new Error(
      `[GameDatabase] Missing JSON cache entry "${key}". Was it loaded in PreloadScene?`,
    );
  }
  return value as T;
}

export function readGameDatabase(scene: Phaser.Scene): GameDatabase {
  return {
    items: readJson<InventoryDatabase>(scene, CACHE_KEYS.items),
    quests: readJson<QuestDatabase>(scene, CACHE_KEYS.quests),
    enemies: readJson<EnemyDatabase>(scene, CACHE_KEYS.enemies),
    player: readJson<PlayerDatabase>(scene, CACHE_KEYS.player),
  };
}
