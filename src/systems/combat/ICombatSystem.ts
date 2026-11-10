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
  /** Id of the combatant whose turn it is (speed-ordered initiative), or null when the battle is over. */
  getActiveCombatantId(): string | null;
  executeAction(action: ICombatAction): ICombatActionResult;
  /** Ends the active combatant's turn and returns the next living combatant's id. */
  advanceTurn(): string | null;
  isBattleOver(): boolean;
  endBattle(): void;
}
