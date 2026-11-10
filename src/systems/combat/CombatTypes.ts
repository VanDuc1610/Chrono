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

export type BattlePhase =
  | 'intro'
  | 'turn_select'
  | 'turn_execute'
  | 'victory'
  | 'defeat'
  | 'escaped';

export interface IBattleState {
  phase: BattlePhase;
  turnCount: number;
  combatants: ICombatant[];
  activeCombatantId: string | null;
}

