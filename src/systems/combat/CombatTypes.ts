export type CombatantType = 'player' | 'enemy' | 'ally';

export interface CombatStats {
  hp: number;
  maxHp: number;
  mp?: number;
  maxMp?: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface ICombatant {
  id: string;
  name: string;
  type: CombatantType;
  stats: CombatStats;
  isAlive: boolean;
  spriteKey: string;
  /** Boss rules for this combatant (copied from its enemy definition). */
  mechanic?: BossMechanic;
}

export type CombatActionType = 'attack' | 'skill' | 'item' | 'defend' | 'escape' | 'environment';

export interface ICombatAction {
  type: CombatActionType;
  sourceId: string;
  targetId: string;
  skillId?: string;
  itemId?: string;
  /** For `environment`: id of a BossEnvironmentAction of the target. */
  environmentId?: string;
}

/** A battlefield action offered while fighting a boss (e.g. turning a lighthouse lens). */
export interface BossEnvironmentAction {
  id: string;
  /** Command-menu label (player-facing text, data-driven). */
  label: string;
  /** Ids of actions that must be done first. */
  requires?: string[];
  /** The boss loses this many of its turns. */
  stunTurns?: number;
  /** Removes the shield: no damage reduction, no HP floor. */
  breakShield?: boolean;
  /** Boss HP is lowered to at most this fraction of max HP. */
  setHpPct?: number;
  /** Battle-log line when used. */
  message: string;
}

/**
 * Boss rules (enemies.json `mechanic`): a shield that reduces damage and keeps the boss from
 * falling until the environment actions are solved; it recovers when held at the floor.
 */
export interface BossMechanic {
  /** Fraction of damage absorbed while the shield holds (0.8 = 80 %). */
  damageReduction: number;
  /** HP the boss cannot drop below while the shield holds. */
  hpFloor: number;
  /** At the floor, instead of attacking, the boss heals to this fraction of max HP. */
  recoverPct: number;
  recoverMessage: string;
  /** Environment actions unlock after this many rounds… */
  unlockAfterTurns: number;
  /** …or as soon as the player uses their skill (Temporal Sight reveals the link). */
  unlockOnSkill?: boolean;
  unlockMessage: string;
  actions: BossEnvironmentAction[];
  /** Spritesheet frame shown on victory instead of the dissolve (e.g. kneeling). */
  releasedFrame?: number;
  /** Replaces the "dissolves" line when the boss falls. */
  defeatMessage?: string;
}

export interface ICombatActionResult {
  action: ICombatAction;
  damageDealt: number;
  healingDone: number;
  isCritical: boolean;
  message: string;
  targetDefeated: boolean;
}

/** Enemy template as stored in public/assets/data/enemies.json. */
export interface IEnemyDefinition {
  id: string;
  name: string;
  level: number;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  spriteKey: string;
  /** Combat display scale (default 2.2 for 32 px sprites; large bosses use less). */
  spriteScale?: number;
  skills: string[];
  /** Boss rules; absent for ordinary enemies. */
  mechanic?: BossMechanic;
  expReward: number;
  lootTable: { itemId: string; chance: number }[];
}

export interface EnemyDatabase {
  enemies: IEnemyDefinition[];
}

/** Combat formula tuning, from the `combat` block of public/assets/data/player.json. */
export interface CombatTuning {
  attackMultiplier: number;
  attackVariance: number;
  critChance: number;
  critMultiplier: number;
  skillMultiplier: number;
  skillMinDamage: number;
  /** MP consumed by Temporal Strike (GDD §6: Skills consume MP / Chronal Energy). */
  skillMpCost: number;
  defendDamageFactor: number;
  escapeBaseChance: number;
  escapeSpeedFactor: number;
  escapeMinChance: number;
  escapeMaxChance: number;
}

/** What a usable item does in combat; resolved by the caller from items.json. */
export interface CombatItemEffect {
  name: string;
  healAmount: number;
}

export type BattlePhase =
  'intro' | 'turn_select' | 'turn_execute' | 'victory' | 'defeat' | 'escaped';

export interface IBattleState {
  phase: BattlePhase;
  turnCount: number;
  combatants: ICombatant[];
  activeCombatantId: string | null;
}
