import type Phaser from 'phaser';
import { InventorySystem } from '../systems/inventory/InventorySystem';
import { IItemStack } from '../systems/inventory/InventoryTypes';
import { QuestSystem } from '../systems/quest/QuestSystem';
import { CombatItemEffect, ICombatant, IEnemyDefinition } from '../systems/combat/CombatTypes';
import { ISaveData } from '../systems/save/SaveTypes';
import { GameDatabase, PlayerStats, readGameDatabase } from './GameDatabase';

// Pure logic: only Phaser *types* are imported so this module stays unit-testable outside a browser.
const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const SAVE_VERSION = '0.2.0';
export const DEFAULT_MAP_ID = 'prologue_sanctuary';

/** Story flag keys. Values are kept identical to 0.1.x saves for compatibility. */
export const FLAGS = {
  shadeDefeated: 'isShadeDefeated',
  awakeningTriggered: 'hasTriggeredAwakening',
} as const;

export interface MapPosition {
  mapId: string;
  x: number;
  y: number;
}

export interface RewardSummary {
  exp: number;
  items: IItemStack[];
  /** Each level reached, in order (empty if no level-up). */
  levelUps: number[];
}

/**
 * Everything that must survive scene restarts within one playthrough: inventory, quest progress,
 * story flags, player progression and playtime. Scenes are views over this object; they never own
 * game state. One instance per playthrough — New Game / Continue replace it.
 */
export class GameSession {
  public readonly inventory = new InventorySystem();
  public readonly quests = new QuestSystem();
  public readonly flags: Record<string, boolean | number | string> = {};

  public level = 1;
  public exp = 0;
  public hp: number;
  public position: MapPosition | null = null;
  public playtimeMs = 0;

  private constructor(private readonly db: GameDatabase) {
    this.inventory.loadDatabase(db.items);
    this.quests.loadDatabase(db.quests);
    this.hp = this.getStats().maxHp;
  }

  public static newGame(db: GameDatabase): GameSession {
    const session = new GameSession(db);
    for (const stack of db.player.player.startingItems) {
      session.inventory.addItem(stack.itemId, stack.quantity);
    }
    return session;
  }

  public static fromSave(db: GameDatabase, save: ISaveData): GameSession {
    const session = new GameSession(db);
    const maxLevel = db.player.player.expThresholds.length;

    session.level = clamp(Math.floor(save.player.level), 1, maxLevel);
    session.exp = Math.max(save.player.exp ?? session.thresholdFor(session.level), 0);
    session.hp = clamp(Math.floor(save.player.hp), 1, session.getStats().maxHp);
    session.position = { ...save.player.position };
    session.playtimeMs = Math.max(0, save.playtimeSeconds) * 1000;
    Object.assign(session.flags, save.flags);
    session.inventory.loadFromState(save.inventory);
    session.quests.loadFromState(save.quests);
    return session;
  }

  public get playerName(): string {
    return this.db.player.player.name;
  }

  public get database(): GameDatabase {
    return this.db;
  }

  // ---------------------------------------------------------------- flags

  public getFlag(key: string): boolean {
    return this.flags[key] === true;
  }

  public setFlag(key: string, value = true): void {
    this.flags[key] = value;
  }

  // ---------------------------------------------------------- progression

  public getStats(level = this.level): PlayerStats {
    const { baseStats, growthPerLevel } = this.db.player.player;
    const n = level - 1;
    return {
      maxHp: baseStats.maxHp + growthPerLevel.maxHp * n,
      attack: baseStats.attack + growthPerLevel.attack * n,
      defense: baseStats.defense + growthPerLevel.defense * n,
      speed: baseStats.speed + growthPerLevel.speed * n,
    };
  }

  public get maxLevel(): number {
    return this.db.player.player.expThresholds.length;
  }

  private thresholdFor(level: number): number {
    return this.db.player.player.expThresholds[level - 1] ?? 0;
  }

  /** EXP still needed for the next level, or null at the level cap. */
  public expToNextLevel(): number | null {
    if (this.level >= this.maxLevel) return null;
    return this.thresholdFor(this.level + 1) - this.exp;
  }

  /** Adds EXP and applies level-ups. Each level-up fully restores HP. Returns the levels reached. */
  public addExp(amount: number): number[] {
    const reached: number[] = [];
    if (amount <= 0) return reached;

    this.exp += amount;
    while (this.level < this.maxLevel && this.exp >= this.thresholdFor(this.level + 1)) {
      this.level++;
      reached.push(this.level);
    }
    if (reached.length > 0) {
      this.hp = this.getStats().maxHp;
    }
    return reached;
  }

  // -------------------------------------------------------------- rewards

  /** EXP + loot-table rolls for a defeated enemy. */
  public claimEnemyRewards(
    enemy: IEnemyDefinition,
    rng: () => number = Math.random,
  ): RewardSummary {
    const items: IItemStack[] = [];
    for (const drop of enemy.lootTable) {
      if (rng() < drop.chance && this.inventory.addItem(drop.itemId, 1)) {
        items.push({ itemId: drop.itemId, quantity: 1 });
      }
    }
    const levelUps = this.addExp(enemy.expReward);
    return { exp: enemy.expReward, items, levelUps };
  }

  /** Grants a completed quest's rewards once. Returns null if the quest is not completed or already claimed. */
  public claimQuestRewards(questId: string): RewardSummary | null {
    const claimedFlag = `questRewardClaimed:${questId}`;
    const quest = this.quests.getQuest(questId);
    if (!quest || quest.stage !== 'completed' || this.getFlag(claimedFlag)) {
      return null;
    }
    this.setFlag(claimedFlag);

    const exp = quest.rewards?.experience ?? 0;
    const items: IItemStack[] = [];
    for (const itemId of quest.rewards?.items ?? []) {
      if (this.inventory.addItem(itemId, 1)) {
        items.push({ itemId, quantity: 1 });
      }
    }
    return { exp, items, levelUps: this.addExp(exp) };
  }

  /**
   * Applies data-driven quest progression (quests.json), idempotently:
   * - a completed quest starts its `followUpQuestId` if that quest is still inactive;
   * - an objective with `completeOnFlag` completes once that session flag is true.
   * Safe to call on every scene entry and from quest event listeners (re-entrant).
   */
  public syncQuestProgress(): void {
    for (const quest of this.quests.getAllQuests()) {
      const next = quest.followUpQuestId;
      if (quest.stage === 'completed' && next && this.quests.getQuestStage(next) === 'inactive') {
        this.quests.startQuest(next);
      }
    }
    for (const quest of this.quests.getAllQuests()) {
      if (quest.stage !== 'started') continue;
      for (const objective of quest.objectives) {
        if (
          !objective.completed &&
          objective.completeOnFlag &&
          this.getFlag(objective.completeOnFlag)
        ) {
          this.quests.completeObjective(quest.id, objective.id);
        }
      }
    }
  }

  /** Human-readable reward line, e.g. "+50 EXP, Minor Chrono Shard — LEVEL UP! Lv. 2". */
  public describeRewards(summary: RewardSummary): string {
    const parts: string[] = [];
    if (summary.exp > 0) parts.push(`+${summary.exp} EXP`);
    for (const stack of summary.items) {
      const name = this.inventory.getItemDefinition(stack.itemId)?.name ?? stack.itemId;
      parts.push(stack.quantity > 1 ? `${name} x${stack.quantity}` : name);
    }
    let text = parts.join(', ');
    if (summary.levelUps.length > 0) {
      text += `${text ? ' — ' : ''}LEVEL UP! Lv. ${summary.levelUps[summary.levelUps.length - 1]}`;
    }
    return text;
  }

  // --------------------------------------------------------------- combat

  public createPlayerCombatant(): ICombatant {
    const def = this.db.player.player;
    const stats = this.getStats();
    return {
      id: def.id,
      name: def.name,
      type: 'player',
      stats: {
        hp: this.hp,
        maxHp: stats.maxHp,
        attack: stats.attack,
        defense: stats.defense,
        speed: stats.speed,
      },
      isAlive: this.hp > 0,
      spriteKey: def.spriteKey,
    };
  }

  /** Writes the player's post-battle HP back into the session. */
  public applyBattleHp(hp: number): void {
    this.hp = clamp(Math.floor(hp), 0, this.getStats().maxHp);
  }

  public getEnemyDefinition(enemyId: string): IEnemyDefinition | undefined {
    return this.db.enemies.enemies.find((e) => e.id === enemyId);
  }

  public get combatItemId(): string {
    return this.db.player.player.combatItemId;
  }

  public resolveCombatItem(itemId: string): CombatItemEffect | undefined {
    const def = this.inventory.getItemDefinition(itemId);
    const healAmount = def?.effects?.healAmount;
    if (!def || healAmount === undefined) return undefined;
    return { name: def.name, healAmount };
  }

  // ----------------------------------------------------------- persistence

  public tick(deltaMs: number): void {
    this.playtimeMs += deltaMs;
  }

  public toSaveData(position: MapPosition): ISaveData {
    this.position = { ...position };
    return {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      playtimeSeconds: Math.floor(this.playtimeMs / 1000),
      player: {
        name: this.playerName,
        level: this.level,
        exp: this.exp,
        hp: this.hp,
        maxHp: this.getStats().maxHp,
        position: { ...position },
      },
      inventory: this.inventory.getAllItems(),
      quests: this.quests.getAllQuests(),
      flags: { ...this.flags },
    };
  }
}

// ------------------------------------------------------------- registry glue

const REGISTRY_KEY = 'chrono.gameSession';

export function setSession(scene: Phaser.Scene, session: GameSession): void {
  scene.registry.set(REGISTRY_KEY, session);
}

/** Starts a fresh playthrough and makes it the active session. */
export function startNewSession(scene: Phaser.Scene): GameSession {
  const session = GameSession.newGame(readGameDatabase(scene));
  setSession(scene, session);
  return session;
}

/** Hydrates the active session from a save. */
export function startSessionFromSave(scene: Phaser.Scene, save: ISaveData): GameSession {
  const session = GameSession.fromSave(readGameDatabase(scene), save);
  setSession(scene, session);
  return session;
}

/**
 * Active session. If a scene is started without one (e.g. directly from a test harness), a new game
 * session is created so the scene still works.
 */
export function getSession(scene: Phaser.Scene): GameSession {
  const existing: unknown = scene.registry.get(REGISTRY_KEY);
  if (existing instanceof GameSession) return existing;
  return startNewSession(scene);
}
