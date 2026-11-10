import {
  IBattleState,
  ICombatant,
  ICombatAction,
  ICombatActionResult,
  BattlePhase,
} from './CombatTypes';

export interface ICombatSystem {
  startBattle(party: ICombatant[], enemies: ICombatant[]): void;
  getState(): IBattleState;
  getPhase(): BattlePhase;
  executeAction(action: ICombatAction): ICombatActionResult;
  isBattleOver(): boolean;
  endBattle(): void;
}

