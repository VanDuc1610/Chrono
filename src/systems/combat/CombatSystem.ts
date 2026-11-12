import {
  BattlePhase,
  BossEnvironmentAction,
  CombatItemEffect,
  CombatTuning,
  IBattleState,
  ICombatAction,
  ICombatActionResult,
  ICombatant,
} from './CombatTypes';
import { ICombatSystem } from './ICombatSystem';
import { formatString } from '../../ui/Strings';

/**
 * Battle-log templates. These English defaults keep the system usable on its own (tests);
 * CombatScene passes the Vietnamese table from strings.json (`combat.log.*` keys).
 */
export const DEFAULT_COMBAT_TEXT: Record<string, string> = {
  'combat.log.guarded': '{target} guarded! ',
  'combat.log.attack': '{source} attacks {target} for {damage} damage!',
  'combat.log.crit': ' (CRITICAL HIT!)',
  'combat.log.skill':
    '{source} channels Temporal Strike! Strikes {target} for {damage} chronal damage!',
  'combat.log.item': '{source} crushes a {item}, restoring {healing} HP to {target}!',
  'combat.log.defend': '{source} takes a defensive stance, bracing for impact!',
  'combat.log.escapeOk': '{source} fractured spacetime and escaped!',
  'combat.log.escapeFail': '{source} failed to escape!',
  'combat.log.defeated': ' {target} dissolves into temporal dust!',
  'combat.log.shielded': ' The frozen tide absorbs most of the blow.',
  'combat.log.stunned': '{target} is stunned and cannot act!',
};

export interface CombatSystemOptions {
  tuning: CombatTuning;
  /** Resolves an item id to its combat effect (from items.json). */
  resolveItem: (itemId: string) => CombatItemEffect | undefined;
  /**
   * Random source in [0, 1). Defaults to a call-time lookup of Math.random so tests can stub it
   * after construction.
   */
  rng?: () => number;
  /** Battle-log templates overriding DEFAULT_COMBAT_TEXT (e.g. strings.json). */
  text?: Record<string, string>;
}

/** What happens at the start of an enemy's turn before it attacks. */
export interface EnemyTurnPrelude {
  /** True if the enemy does not attack this turn (stunned or recovering). */
  skip: boolean;
  message?: string;
  healingDone?: number;
}

interface BossState {
  shield: boolean;
  unlocked: boolean;
  done: Set<string>;
  stunTurns: number;
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
  private bosses = new Map<string, BossState>();
  private readonly tuning: CombatTuning;
  private readonly resolveItem: (itemId: string) => CombatItemEffect | undefined;
  private readonly text: Record<string, string>;
  private rng: () => number;
  /** Party HP cannot drop below this (scripted fights Peter must survive); 0 = off. */
  public partyHpFloor = 0;

  constructor(options: CombatSystemOptions) {
    this.tuning = options.tuning;
    this.resolveItem = options.resolveItem;
    this.rng = options.rng ?? (() => Math.random());
    this.text = { ...DEFAULT_COMBAT_TEXT, ...(options.text ?? {}) };
  }

  private t(key: string, vars?: Record<string, string | number>): string {
    return formatString(this.text, key, vars);
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
    this.bosses.clear();
    for (const e of enemies) {
      if (e.mechanic)
        this.bosses.set(e.id, { shield: true, unlocked: false, done: new Set(), stunTurns: 0 });
    }
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
      // Environment actions also unlock with time.
      for (const [id, boss] of this.bosses) {
        const m = this.getCombatant(id)?.mechanic;
        if (m && !boss.unlocked && this.state.turnCount > m.unlockAfterTurns) boss.unlocked = true;
      }
    } else {
      this.state.activeCombatantId = this.turnQueue[0];
    }

    return this.state.activeCombatantId;
  }

  /** True if the combatant can pay for Temporal Strike (combatants without an MP pool always can). */
  public canUseSkill(combatantId: string): boolean {
    const mp = this.getCombatant(combatantId)?.stats.mp;
    return mp === undefined || mp >= this.tuning.skillMpCost;
  }

  public get skillMpCost(): number {
    return this.tuning.skillMpCost;
  }

  /** Chance in [0, 1] that `source` escapes from `target`. */
  public getEscapeChance(source: ICombatant, target: ICombatant): number {
    const t = this.tuning;
    const chance =
      t.escapeBaseChance + (source.stats.speed - target.stats.speed) * t.escapeSpeedFactor;
    return Math.min(t.escapeMaxChance, Math.max(t.escapeMinChance, chance));
  }

  // ------------------------------------------------------------------ boss mechanics

  /** True while the boss's shield holds (damage reduced, HP floor active). */
  public isShielded(enemyId: string): boolean {
    return this.bosses.get(enemyId)?.shield ?? false;
  }

  /** The next environment action the player may take against this boss, if any. */
  public getAvailableEnvironmentAction(enemyId: string): BossEnvironmentAction | null {
    const boss = this.bosses.get(enemyId);
    const enemy = this.getCombatant(enemyId);
    if (!boss || !enemy?.isAlive || !boss.unlocked || !enemy.mechanic) return null;
    return (
      enemy.mechanic.actions.find(
        (a) => !boss.done.has(a.id) && (a.requires ?? []).every((r) => boss.done.has(r)),
      ) ?? null
    );
  }

  /**
   * Call at the start of an enemy's turn. A stunned boss loses its turn; a shielded boss held at
   * its HP floor recovers instead of attacking.
   */
  public beginEnemyTurn(enemyId: string): EnemyTurnPrelude {
    const enemy = this.getCombatant(enemyId);
    const boss = this.bosses.get(enemyId);
    const m = enemy?.mechanic;
    if (!enemy || !boss || !m) return { skip: false };
    if (boss.stunTurns > 0) {
      boss.stunTurns--;
      return { skip: true, message: this.t('combat.log.stunned', { target: enemy.name }) };
    }
    if (boss.shield && enemy.stats.hp <= m.hpFloor) {
      const before = enemy.stats.hp;
      enemy.stats.hp = Math.max(before, Math.ceil(enemy.stats.maxHp * m.recoverPct));
      return { skip: true, message: m.recoverMessage, healingDone: enemy.stats.hp - before };
    }
    return { skip: false };
  }

  /** Applies shield reduction and the HP floor to damage dealt to `target`. */
  private applyDamage(target: ICombatant, damage: number): { dealt: number; shielded: boolean } {
    const boss = this.bosses.get(target.id);
    const m = target.mechanic;
    if (boss?.shield && m) {
      const reduced = Math.max(1, Math.floor(damage * (1 - m.damageReduction)));
      const dealt = Math.max(0, Math.min(reduced, target.stats.hp - m.hpFloor));
      target.stats.hp -= dealt;
      return { dealt, shielded: true };
    }
    if (target.type !== 'enemy' && this.partyHpFloor > 0) {
      const dealt = Math.max(0, Math.min(damage, target.stats.hp - this.partyHpFloor));
      target.stats.hp -= dealt;
      return { dealt, shielded: false };
    }
    target.stats.hp = Math.max(0, target.stats.hp - damage);
    return { dealt: damage, shielded: false };
  }

  // ------------------------------------------------------------------ actions

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
    const names = { source: source.name, target: target.name };
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
          message = this.t('combat.log.guarded', names);
        }

        const hit = this.applyDamage(target, damage);
        damage = hit.dealt;
        message += this.t('combat.log.attack', { ...names, damage });
        if (isCritical) message += this.t('combat.log.crit');
        if (hit.shielded) message += this.t('combat.log.shielded');
        break;
      }

      case 'skill': {
        // Temporal Strike — costs MP for combatants that have an MP pool.
        if (!this.canUseSkill(source.id)) {
          throw new Error(`Invalid combat action: ${source.name} lacks MP for Temporal Strike.`);
        }
        if (source.stats.mp !== undefined) {
          source.stats.mp -= t.skillMpCost;
        }
        const rawDamage = Math.floor(
          source.stats.attack * t.skillMultiplier - target.stats.defense,
        );
        damage = Math.max(t.skillMinDamage, rawDamage);
        if (this.defendedCombatants.has(target.id)) {
          damage = Math.max(1, Math.floor(damage * t.defendDamageFactor));
          message = this.t('combat.log.guarded', names);
        }
        const hit = this.applyDamage(target, damage);
        damage = hit.dealt;
        message += this.t('combat.log.skill', { ...names, damage });
        if (hit.shielded) message += this.t('combat.log.shielded');
        // Temporal Sight reveals how the boss's shield can be broken.
        const boss = this.bosses.get(target.id);
        if (boss && !boss.unlocked && target.mechanic?.unlockOnSkill) {
          boss.unlocked = true;
          message += ` ${target.mechanic.unlockMessage}`;
        }
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
        message = this.t('combat.log.item', { ...names, item: effect.name, healing });
        break;
      }

      case 'defend': {
        this.defendedCombatants.add(source.id);
        message = this.t('combat.log.defend', names);
        break;
      }

      case 'escape': {
        if (this.rng() < this.getEscapeChance(source, target)) {
          this.state.phase = 'escaped';
          message = this.t('combat.log.escapeOk', names);
        } else {
          message = this.t('combat.log.escapeFail', names);
        }
        break;
      }

      case 'environment': {
        const env = this.getAvailableEnvironmentAction(target.id);
        const boss = this.bosses.get(target.id);
        if (!env || !boss || env.id !== action.environmentId) {
          throw new Error(
            `Invalid combat action: environment action "${action.environmentId ?? ''}" is not available.`,
          );
        }
        boss.done.add(env.id);
        if (env.stunTurns) boss.stunTurns += env.stunTurns;
        if (env.breakShield) boss.shield = false;
        if (env.setHpPct !== undefined) {
          const capped = Math.ceil(target.stats.maxHp * env.setHpPct);
          damage = Math.max(0, target.stats.hp - capped);
          target.stats.hp = Math.min(target.stats.hp, capped);
        }
        message = env.message;
        break;
      }
    }

    if (target.stats.hp <= 0 && target.isAlive) {
      target.isAlive = false;
      message += target.mechanic?.defeatMessage
        ? ` ${target.mechanic.defeatMessage}`
        : this.t('combat.log.defeated', names);
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
    this.bosses.clear();
  }
}
