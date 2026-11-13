import type Phaser from 'phaser';
import { InventorySystem } from '../systems/inventory/InventorySystem';
import type { EquipSlot, EquipStats, IItemStack } from '../systems/inventory/InventoryTypes';
import { QuestSystem } from '../systems/quest/QuestSystem';
import { CombatItemEffect, ICombatant, IEnemyDefinition } from '../systems/combat/CombatTypes';
import { ISaveData } from '../systems/save/SaveTypes';
import type { DialogueEffects } from '../systems/dialogue/DialogueTypes';
import { GameDatabase, PlayerStats, readGameDatabase } from './GameDatabase';

// Pure logic: only Phaser *types* are imported so this module stays unit-testable outside a browser.
const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/**
 * 0.3.0: Prologue v3 — attack/skill unlock by story flags (older saves are migrated).
 * 0.4.0: equipment (weapon + charm) and quick slots; older saves get the Broken Blade equipped.
 */
export const SAVE_VERSION = '0.4.0';
export const QUICK_SLOT_COUNT = 4;

/** Result of using a consumable (bag or quick key). */
export type UseItemResult =
  | { ok: true; name: string; healed: number; restoredMp: number }
  | { ok: false; reason: 'none' | 'notUsable' | 'full'; name: string };
export const DEFAULT_MAP_ID = 'prologue_sanctuary';

/** Story flag keys. Values are kept identical to 0.1.x saves for compatibility. */
export const FLAGS = {
  shadeDefeated: 'isShadeDefeated',
  prologueComplete: 'isPrologueComplete',
  awakeningTriggered: 'hasTriggeredAwakening',
  hasBlade: 'has_broken_blade',
  temporalSight: 'learned_temporal_sight',
  timeFrozen: 'time_frozen',
  timeRestored: 'time_restored',
} as const;

/** Flags that mark Chapter n (index + 1) as finished, besides `chapter<n>_complete`. */
const CHAPTER_SEAL_FLAGS = [
  'continuum_seal_restored',
  'causality_seal_restored',
  'memory_seal_restored',
  'finality_seal_restored',
] as const;

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
  /** MP on the map (Temporal Strike); battles still start with full MP. Not saved: full on load. */
  public mp: number;
  public position: MapPosition | null = null;
  public playtimeMs = 0;
  public equipment: Record<EquipSlot, string | null> = { weapon: null, charm: null };
  public quickSlots: (string | null)[] = Array<string | null>(QUICK_SLOT_COUNT).fill(null);

  private constructor(private readonly db: GameDatabase) {
    this.inventory.loadDatabase(db.items);
    this.quests.loadDatabase(db.quests);
    this.hp = this.getStats().maxHp;
    this.mp = this.getStats().maxMp;
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
    // Flags first: the level cap depends on story progress (Prologue cap).
    Object.assign(session.flags, save.flags);
    session.level = clamp(Math.floor(save.player.level), 1, session.maxLevel);
    session.exp = Math.max(save.player.exp ?? session.thresholdFor(session.level), 0);
    session.hp = clamp(Math.floor(save.player.hp), 1, session.getStats().maxHp);
    session.position = { ...save.player.position };
    session.playtimeMs = Math.max(0, save.playtimeSeconds) * 1000;
    // Saves from before Prologue v3 (< 0.3) already fought with the blade and Temporal Strike.
    const [major, minor] = save.version.split('.').map((n) => Number(n));
    if (major === 0 && minor < 3) {
      session.setFlag(FLAGS.hasBlade);
      session.setFlag(FLAGS.temporalSight);
    }
    session.inventory.loadFromState(save.inventory);
    session.quests.loadFromState(save.quests);
    if (save.equipment) {
      for (const slot of ['weapon', 'charm'] as const) {
        const id = save.equipment[slot];
        if (id && session.inventory.hasItem(id, 1)) session.equipment[slot] = id;
      }
    } else if (session.getFlag(FLAGS.hasBlade)) {
      // Saves before equipment (< 0.4): Peter already fights with the Broken Blade.
      session.equip('broken_blade');
    }
    (save.quickSlots ?? []).slice(0, QUICK_SLOT_COUNT).forEach((id, i) => {
      session.quickSlots[i] = id ?? null;
    });
    session.hp = clamp(session.hp, 1, session.getStats().maxHp);
    // Saves made before quests were closed per chapter still list finished chapters' quests.
    session.closeFinishedChapters();
    return session;
  }

  /** Last finished chapter (0 = Prologue), or -1 while the Prologue is still being played. */
  public get lastFinishedChapter(): number {
    let last = this.getFlag(FLAGS.prologueComplete) ? 0 : -1;
    for (let n = 1; n <= 9; n++) {
      if (this.getFlag(`chapter${n}_complete`) || this.getFlag(CHAPTER_SEAL_FLAGS[n - 1] ?? '')) {
        last = n;
      }
    }
    return last;
  }

  /** Closes the open quests of every finished chapter, then starts the next main quest. */
  public closeFinishedChapters(): void {
    const last = this.lastFinishedChapter;
    if (last < 0) return;
    // Closing a main quest starts its follow-up, which may itself belong to a finished chapter.
    do this.syncQuestProgress();
    while (this.quests.closeChapter(last) > 0);
  }

  /** True if a combat command is available (player.json `commandFlags`). */
  public isCommandUnlocked(command: string): boolean {
    const flag = this.db.player.commandFlags?.[command];
    return !flag || this.getFlag(flag);
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

  /** Level stats plus the equipped weapon and charm. */
  public getStats(level = this.level): PlayerStats {
    const { baseStats, growthPerLevel } = this.db.player.player;
    const n = level - 1;
    const bonus = this.equipBonus();
    return {
      maxHp: baseStats.maxHp + growthPerLevel.maxHp * n + (bonus.maxHp ?? 0),
      maxMp: baseStats.maxMp + growthPerLevel.maxMp * n + (bonus.maxMp ?? 0),
      attack: baseStats.attack + growthPerLevel.attack * n + (bonus.attack ?? 0),
      defense: baseStats.defense + growthPerLevel.defense * n + (bonus.defense ?? 0),
      speed: baseStats.speed + growthPerLevel.speed * n + (bonus.speed ?? 0),
    };
  }

  public get maxLevel(): number {
    const p = this.db.player.player;
    const all = p.expThresholds.length;
    const caps = [
      ...(p.prologueLevelCap
        ? [{ untilFlag: FLAGS.prologueComplete, cap: p.prologueLevelCap }]
        : []),
      ...(p.chapterLevelCaps ?? []),
    ];
    const active = caps.find((c) => !this.getFlag(c.untilFlag));
    return active ? Math.min(active.cap, all) : all;
  }

  /** While capped, EXP banks at most one level beyond the cap (no huge jump when it lifts). */
  private clampBankedExp(): void {
    const all = this.db.player.player.expThresholds.length;
    if (this.maxLevel >= all) return;
    const ceiling = this.thresholdFor(this.maxLevel + 2) - 1;
    if (this.maxLevel + 2 <= all && this.exp > ceiling) this.exp = ceiling;
  }

  /** Applies level-ups held back by a cap that has since been lifted (e.g. leaving the Prologue). */
  public applyPendingLevels(): number[] {
    const reached: number[] = [];
    while (this.level < this.maxLevel && this.exp >= this.thresholdFor(this.level + 1)) {
      this.level++;
      reached.push(this.level);
    }
    if (reached.length > 0) this.hp = this.getStats().maxHp;
    return reached;
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
    this.clampBankedExp();
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
        this.onItemReceived(drop.itemId);
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

  /**
   * Applies a dialogue node's `effects` (dialogue.json): flags, quest start, one-time item grants,
   * then re-syncs quest progress so flag-driven objectives complete immediately.
   * Returns the items actually granted (empty when already claimed or the satchel is full).
   */
  public applyDialogueEffects(effects: DialogueEffects): IItemStack[] {
    for (const flag of effects.setFlags ?? []) this.setFlag(flag);
    for (const flag of effects.clearFlags ?? []) this.setFlag(flag, false);
    for (const stack of effects.takeItems ?? []) {
      this.inventory.removeItem(stack.itemId, stack.quantity);
      for (const slot of ['weapon', 'charm'] as const) {
        if (this.equipment[slot] === stack.itemId && !this.inventory.hasItem(stack.itemId, 1)) {
          this.equipment[slot] = null;
        }
      }
    }
    if (effects.healFull) {
      this.hp = this.getStats().maxHp;
      this.mp = this.getStats().maxMp;
    }

    if (effects.startQuest && this.quests.getQuestStage(effects.startQuest) === 'inactive') {
      this.quests.startQuest(effects.startQuest);
    }

    // Rewards (items and EXP) are given once per playthrough when `grantOnceFlag` is set.
    const granted: IItemStack[] = [];
    const once = effects.grantOnceFlag;
    const hasReward = !!effects.grantItems?.length || (effects.grantExp ?? 0) > 0;
    if (hasReward && !(once && this.getFlag(once))) {
      for (const stack of effects.grantItems ?? []) {
        if (this.inventory.addItem(stack.itemId, stack.quantity)) {
          granted.push({ ...stack });
          this.onItemReceived(stack.itemId);
        }
      }
      if (effects.grantExp && effects.grantExp > 0) this.addExp(effects.grantExp);
      if (once) this.setFlag(once);
    }

    this.syncQuestProgress();
    return granted;
  }

  /** Player-facing reward line, e.g. "+50 EXP, Mảnh Chrono Nhỏ — LÊN CẤP! Cấp 2". */
  public describeRewards(summary: RewardSummary): string {
    const parts: string[] = [];
    if (summary.exp > 0) parts.push(`+${summary.exp} EXP`);
    for (const stack of summary.items) {
      const name = this.inventory.getItemDefinition(stack.itemId)?.name ?? stack.itemId;
      parts.push(stack.quantity > 1 ? `${name} x${stack.quantity}` : name);
    }
    let text = parts.join(', ');
    if (summary.levelUps.length > 0) {
      text += `${text ? ' — ' : ''}LÊN CẤP! Cấp ${summary.levelUps[summary.levelUps.length - 1]}`;
    }
    return text;
  }

  // --------------------------------------------------------------- combat

  /** Battle combatant for Peter. HP carries over between battles; MP refills at each battle start. */
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
        mp: stats.maxMp,
        maxMp: stats.maxMp,
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

  // ------------------------------------------------------------ equipment

  private equipBonus(): EquipStats {
    const sum: EquipStats = {};
    for (const id of Object.values(this.equipment)) {
      const equip = id ? this.inventory.getItemDefinition(id)?.equip : undefined;
      for (const [k, v] of Object.entries(equip ?? {}) as [keyof EquipStats, number][]) {
        if (k === 'reach' || k === 'swingMs') continue;
        sum[k] = (sum[k] ?? 0) + v;
      }
    }
    return sum;
  }

  /** The equipped weapon's `equip` block (reach, swing speed), if any. */
  public get weaponStats(): EquipStats | undefined {
    const id = this.equipment.weapon;
    return id ? (this.inventory.getItemDefinition(id)?.equip ?? {}) : undefined;
  }

  /** Peter can slash: a weapon is equipped (or, before any weapon item exists, he has the blade). */
  public get canSlash(): boolean {
    if (this.equipment.weapon) return true;
    const ownsWeapon = this.inventory
      .getAllItems()
      .some((s) => this.inventory.getItemDefinition(s.itemId)?.type === 'weapon');
    return !ownsWeapon && this.getFlag(FLAGS.hasBlade);
  }

  public slotOf(itemId: string): EquipSlot | null {
    const type = this.inventory.getItemDefinition(itemId)?.type;
    return type === 'weapon' || type === 'charm' ? type : null;
  }

  /** Equips an owned weapon / charm (replacing the previous one). Returns the slot, or null. */
  public equip(itemId: string): EquipSlot | null {
    const slot = this.slotOf(itemId);
    if (!slot || !this.inventory.hasItem(itemId, 1)) return null;
    this.equipment[slot] = itemId;
    this.clampToStats();
    return slot;
  }

  public unequip(slot: EquipSlot): void {
    this.equipment[slot] = null;
    this.clampToStats();
  }

  private clampToStats(): void {
    const s = this.getStats();
    this.hp = clamp(this.hp, 1, s.maxHp);
    this.mp = clamp(this.mp, 0, s.maxMp);
  }

  /** New items: a weapon / charm goes on if its slot is empty; a consumable takes a free quick slot. */
  private onItemReceived(itemId: string): void {
    const slot = this.slotOf(itemId);
    if (slot && !this.equipment[slot]) this.equip(itemId);
    const def = this.inventory.getItemDefinition(itemId);
    if (def?.type === 'consumable' && !this.quickSlots.includes(itemId)) {
      const free = this.quickSlots.indexOf(null);
      if (free >= 0) this.quickSlots[free] = itemId;
    }
  }

  /** Puts a consumable on quick key `index` (0-3); it leaves any other key. */
  public assignQuickSlot(index: number, itemId: string): boolean {
    if (index < 0 || index >= QUICK_SLOT_COUNT) return false;
    if (this.inventory.getItemDefinition(itemId)?.type !== 'consumable') return false;
    this.quickSlots = this.quickSlots.map((id) => (id === itemId ? null : id));
    this.quickSlots[index] = itemId;
    return true;
  }

  /** Uses one consumable: `healAmount` HP and / or `mpAmount` MP. */
  public useConsumable(itemId: string): UseItemResult {
    const def = this.inventory.getItemDefinition(itemId);
    const name = def?.name ?? itemId;
    if (!def || !this.inventory.hasItem(itemId, 1)) return { ok: false, reason: 'none', name };
    const heal = def.effects?.healAmount ?? 0;
    const mp = def.effects?.mpAmount ?? 0;
    if (def.type !== 'consumable' || (heal <= 0 && mp <= 0)) {
      return { ok: false, reason: 'notUsable', name };
    }
    const s = this.getStats();
    if ((heal <= 0 || this.hp >= s.maxHp) && (mp <= 0 || this.mp >= s.maxMp)) {
      return { ok: false, reason: 'full', name };
    }
    this.inventory.removeItem(itemId, 1);
    const hpBefore = this.hp;
    const mpBefore = this.mp;
    this.hp = clamp(this.hp + heal, 0, s.maxHp);
    this.mp = clamp(this.mp + mp, 0, s.maxMp);
    return {
      ok: true,
      name,
      healed: this.hp - hpBefore,
      restoredMp: Math.floor(this.mp - mpBefore),
    };
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
      equipment: { ...this.equipment },
      quickSlots: [...this.quickSlots],
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
