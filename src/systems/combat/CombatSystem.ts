import {
  BattlePhase,
  IBattleState,
  ICombatAction,
  ICombatActionResult,
  ICombatant,
} from './CombatTypes';
import { ICombatSystem } from './ICombatSystem';

export class CombatSystem implements ICombatSystem {
  private state: IBattleState = {
    phase: 'intro',
    turnCount: 0,
    combatants: [],
    activeCombatantId: null,
  };

  private turnQueue: string[] = [];
  private defendedCombatants: Set<string> = new Set();

  public startBattle(party: ICombatant[], enemies: ICombatant[]): void {
    const all = [...party, ...enemies];
    this.state = {
      phase: 'turn_select',
      turnCount: 1,
      combatants: all,
      activeCombatantId: null,
    };
    this.defendedCombatants.clear();
    this.refreshTurnQueue();
  }

  public getState(): IBattleState {
    return this.state;
  }

  public getPhase(): BattlePhase {
    return this.state.phase;
  }

  private refreshTurnQueue(): void {
    // Sort living combatants by speed descending
    const living = this.state.combatants.filter((c) => c.isAlive);
    living.sort((a, b) => b.stats.speed - a.stats.speed);
    this.turnQueue = living.map((c) => c.id);
    this.state.activeCombatantId = this.turnQueue[0] ?? null;
  }

  public advanceTurn(): string | null {
    if (this.isBattleOver()) {
      return null;
    }

    this.turnQueue.shift();
    if (this.turnQueue.length === 0) {
      this.state.turnCount++;
      this.defendedCombatants.clear();
      this.refreshTurnQueue();
    } else {
      this.state.activeCombatantId = this.turnQueue[0] ?? null;
    }

    return this.state.activeCombatantId;
  }

  public executeAction(action: ICombatAction): ICombatActionResult {
    const source = this.getCombatant(action.sourceId);
    const target = this.getCombatant(action.targetId);

    if (!source || !target) {
      throw new Error(`Invalid combat action: source (${action.sourceId}) or target (${action.targetId}) not found.`);
    }

    // A defensive stance lasts until the defender's next action. Clearing it here (rather than only
    // in advanceTurn) keeps it correct even when the caller drives turns manually.
    this.defendedCombatants.delete(source.id);

    let damage = 0;
    let healing = 0;
    let isCritical = false;
    let message = '';

    switch (action.type) {
      case 'attack': {
        const rawDamage = source.stats.attack * 2 - target.stats.defense;
        const variance = Math.floor(Math.random() * 5) - 2; // -2 to +2
        isCritical = Math.random() < 0.15; // 15% crit chance
        const multiplier = isCritical ? 1.5 : 1.0;
        damage = Math.max(1, Math.floor((rawDamage + variance) * multiplier));

        // If target was defending, reduce damage by 50%
        if (this.defendedCombatants.has(target.id)) {
          damage = Math.max(1, Math.floor(damage * 0.5));
          message = `${target.name} guarded! `;
        }

        target.stats.hp = Math.max(0, target.stats.hp - damage);
        message += `${source.name} attacks ${target.name} for ${damage} damage!`;
        if (isCritical) message += ' (CRITICAL HIT!)';
        break;
      }

      case 'skill': {
        // Temporal Strike (1.75x damage)
        const rawDamage = Math.floor(source.stats.attack * 2.8 - target.stats.defense);
        damage = Math.max(5, rawDamage);
        target.stats.hp = Math.max(0, target.stats.hp - damage);
        message = `${source.name} channels Temporal Strike! Strikes ${target.name} for ${damage} chronal damage!`;
        break;
      }

      case 'item': {
        // Minor Chrono Shard (+30 HP)
        healing = 30;
        target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + healing);
        message = `${source.name} crushes a Chrono Shard, restoring ${healing} HP to ${target.name}!`;
        break;
      }

      case 'defend': {
        this.defendedCombatants.add(source.id);
        message = `${source.name} takes a defensive stance, bracing for impact!`;
        break;
      }

      case 'escape': {
        const canEscape = source.stats.speed >= target.stats.speed;
        if (canEscape) {
          this.state.phase = 'escaped';
          message = `${source.name} fractured spacetime and escaped!`;
        } else {
          message = `${source.name} failed to escape!`;
        }
        break;
      }
    }

    if (target.stats.hp <= 0) {
      target.isAlive = false;
      message += ` ${target.name} dissolves into temporal dust!`;
    }

    // Check Win/Loss conditions
    const livingParty = this.state.combatants.filter((c) => c.type === 'player' && c.isAlive);
    const livingEnemies = this.state.combatants.filter((c) => c.type === 'enemy' && c.isAlive);

    if (livingEnemies.length === 0) {
      this.state.phase = 'victory';
    } else if (livingParty.length === 0) {
      this.state.phase = 'defeat';
    }

    return {
      action,
      damageDealt: damage,
      healingDone: healing,
      isCritical,
      message,
      targetDefeated: !target.isAlive,
    };
  }

  public getCombatant(id: string): ICombatant | undefined {
    return this.state.combatants.find((c) => c.id === id);
  }

  public isBattleOver(): boolean {
    return this.state.phase === 'victory' || this.state.phase === 'defeat' || this.state.phase === 'escaped';
  }

  public endBattle(): void {
    this.turnQueue = [];
    this.defendedCombatants.clear();
  }
}
