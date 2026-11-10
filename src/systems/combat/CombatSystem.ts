import {
  BattlePhase,
  CombatItemEffect,
  CombatTuning,
  IBattleState,
  ICombatAction,
  ICombatActionResult,
  ICombatant,
} from './CombatTypes';
import { ICombatSystem } from './ICombatSystem';

export interface CombatSystemOptions {
  tuning: CombatTuning;
  /** Resolves an item id to its combat effect (from items.json). */
  resolveItem: (itemId: string) => CombatItemEffect | undefined;
  /**
   * Random source in [0, 1). Defaults to a call-time lookup of Math.random so tests can stub it
   * after construction.
   */
  rng?: () => number;
}

export class CombatSystem implements ICombatSystem {
  private state: IBattleState = {
    phase: 'intro',
    turnCount: 0,
    combatants: [],
    activeCombatantId: null,
  };

  private turnQueue: string[] = [];
  private defendedCombatants: Set<string> = new Set();
  private readonly tuning: CombatTuning;
  private readonly resolveItem: (itemId: string) => CombatItemEffect | undefined;
  private rng: () => number;

  constructor(options: CombatSystemOptions) {
    this.tuning = options.tuning;
    this.resolveItem = options.resolveItem;
    this.rng = options.rng ?? (() => Math.random());
  }

  /**
   * Replaces the combat random source (crits, variance, escape). For deterministic tests/replays —
   * never stub the global Math.random instead: Phaser uses it for texture UUIDs, and a constant
   * value makes every new Text collide and fail to create.
   */
  public setRandomSource(rng: () => number): void {
    this.rng = rng;
  }

  public startBattle(party: ICombatant[], enemies: ICombatant[]): void {
    this.state = {
      phase: 'turn_select',
      turnCount: 1,
      combatants: [...party, ...enemies],
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

  public getActiveCombatantId(): string | null {
    return this.isBattleOver() ? null : this.state.activeCombatantId;
  }

  /** Builds the round order: living combatants by speed, descending (stable for ties). */
  private refreshTurnQueue(): void {
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
    // Skip anyone who died earlier in this round.
    while (this.turnQueue.length > 0 && !this.getCombatant(this.turnQueue[0])?.isAlive) {
      this.turnQueue.shift();
    }

    if (this.turnQueue.length === 0) {
      this.state.turnCount++;
      this.refreshTurnQueue();
    } else {
      this.state.activeCombatantId = this.turnQueue[0];
    }

    return this.state.activeCombatantId;
  }

  /** Chance in [0, 1] that `source` escapes from `target`. */
  public getEscapeChance(source: ICombatant, target: ICombatant): number {
    const t = this.tuning;
    const chance =
      t.escapeBaseChance + (source.stats.speed - target.stats.speed) * t.escapeSpeedFactor;
    return Math.min(t.escapeMaxChance, Math.max(t.escapeMinChance, chance));
  }

  public executeAction(action: ICombatAction): ICombatActionResult {
    const source = this.getCombatant(action.sourceId);
    const target = this.getCombatant(action.targetId);

    if (!source || !target) {
      throw new Error(
        `Invalid combat action: source (${action.sourceId}) or target (${action.targetId}) not found.`,
      );
    }

    // A defensive stance lasts until the defender's next action.
    this.defendedCombatants.delete(source.id);

    const t = this.tuning;
    let damage = 0;
    let healing = 0;
    let isCritical = false;
    let message = '';

    switch (action.type) {
      case 'attack': {
        const rawDamage = source.stats.attack * t.attackMultiplier - target.stats.defense;
        const variance = Math.floor(this.rng() * (t.attackVariance * 2 + 1)) - t.attackVariance;
        isCritical = this.rng() < t.critChance;
        const multiplier = isCritical ? t.critMultiplier : 1.0;
        damage = Math.max(1, Math.floor((rawDamage + variance) * multiplier));

        if (this.defendedCombatants.has(target.id)) {
          damage = Math.max(1, Math.floor(damage * t.defendDamageFactor));
          message = `${target.name} guarded! `;
        }

        target.stats.hp = Math.max(0, target.stats.hp - damage);
        message += `${source.name} attacks ${target.name} for ${damage} damage!`;
        if (isCritical) message += ' (CRITICAL HIT!)';
        break;
      }

      case 'skill': {
        // Temporal Strike
        const rawDamage = Math.floor(
          source.stats.attack * t.skillMultiplier - target.stats.defense,
        );
        damage = Math.max(t.skillMinDamage, rawDamage);
        if (this.defendedCombatants.has(target.id)) {
          damage = Math.max(1, Math.floor(damage * t.defendDamageFactor));
          message = `${target.name} guarded! `;
        }
        target.stats.hp = Math.max(0, target.stats.hp - damage);
        message += `${source.name} channels Temporal Strike! Strikes ${target.name} for ${damage} chronal damage!`;
        break;
      }

      case 'item': {
        const effect = action.itemId ? this.resolveItem(action.itemId) : undefined;
        if (!effect) {
          throw new Error(`Invalid combat action: unknown item "${action.itemId ?? ''}".`);
        }
        const before = target.stats.hp;
        target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + effect.healAmount);
        healing = target.stats.hp - before;
        message = `${source.name} crushes a ${effect.name}, restoring ${healing} HP to ${target.name}!`;
        break;
      }

      case 'defend': {
        this.defendedCombatants.add(source.id);
        message = `${source.name} takes a defensive stance, bracing for impact!`;
        break;
      }

      case 'escape': {
        if (this.rng() < this.getEscapeChance(source, target)) {
          this.state.phase = 'escaped';
          message = `${source.name} fractured spacetime and escaped!`;
        } else {
          message = `${source.name} failed to escape!`;
        }
        break;
      }
    }

    if (target.stats.hp <= 0 && target.isAlive) {
      target.isAlive = false;
      message += ` ${target.name} dissolves into temporal dust!`;
    }

    if (this.state.phase !== 'escaped') {
      const livingParty = this.state.combatants.filter((c) => c.type !== 'enemy' && c.isAlive);
      const livingEnemies = this.state.combatants.filter((c) => c.type === 'enemy' && c.isAlive);

      if (livingEnemies.length === 0) {
        this.state.phase = 'victory';
      } else if (livingParty.length === 0) {
        this.state.phase = 'defeat';
      }
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
    return (
      this.state.phase === 'victory' ||
      this.state.phase === 'defeat' ||
      this.state.phase === 'escaped'
    );
  }

  public endBattle(): void {
    this.turnQueue = [];
    this.defendedCombatants.clear();
  }
}
