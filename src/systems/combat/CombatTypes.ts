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
}

export type CombatActionType = 'attack' | 'skill' | 'item' | 'defend' | 'escape';

export interface ICombatAction {
  type: CombatActionType;
  sourceId: string;
  targetId: string;
  skillId?: string;
  itemId?: string;
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
  skills: string[];
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
