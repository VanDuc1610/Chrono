import {
  BattlePhase,
  BossEnvironmentAction,
  BossSentence,
  CombatActionType,
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
  /** Story state for boss options that depend on it (letters carried, names learned). */
  hasItem?: (itemId: string) => boolean;
  hasFlag?: (flag: string) => boolean;
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
  /** Verdict in force for Peter's next action (sentence bosses). */
  sentence: BossSentence | null;
  cracks: number;
  /** Boss turns taken (memory lock cadence). */
  turns: number;
  lock: { command: CombatActionType; turnsLeft: number; staggerBy: CombatActionType[] } | null;
  /** The next hit the boss takes is increased (stagger). */
  staggered: boolean;
  /** Verse currently sung (songs). */
  song: { id: string; coreId: string; crackMessage: string } | null;
  /** Blood wall standing (cuts landed so far). */
  wall: { cuts: number } | null;
  /** Boss turns until the next blood wall (counted only while no wall stands). */
  wallIn: number;
  /** Finality ritual: open once the boss first rises again, pillars lit in order. */
  ritual: { open: boolean; progress: number; done: boolean };
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
  private readonly hasItem: (itemId: string) => boolean;
  private readonly hasFlag: (flag: string) => boolean;
  /** Peter's command last turn (mirror bosses copy it). */
  private lastPlayerCommand: CombatActionType = 'attack';
  /** Party HP cannot drop below this (scripted fights Peter must survive); 0 = off. */
  public partyHpFloor = 0;

  constructor(options: CombatSystemOptions) {
    this.tuning = options.tuning;
    this.resolveItem = options.resolveItem;
    this.rng = options.rng ?? (() => Math.random());
    this.text = { ...DEFAULT_COMBAT_TEXT, ...(options.text ?? {}) };
    this.hasItem = options.hasItem ?? (() => false);
    this.hasFlag = options.hasFlag ?? (() => false);
  }

  /** What a mirror boss does this turn: the command Peter used last. */
  public mirrorCommand(): CombatActionType {
    return this.lastPlayerCommand;
  }

  /** Stuns a boss for `turns` of its turns (scripted). */
  public stun(enemyId: string, turns: number): void {
    const boss = this.bosses.get(enemyId);
    if (boss) boss.stunTurns += turns;
  }

  /** Locks one of Peter's commands for `turns` boss turns (mirror boss skill). */
  public lockCommand(enemyId: string, command: CombatActionType, turns: number): void {
    const boss = this.bosses.get(enemyId);
    if (boss) boss.lock = { command, turnsLeft: turns, staggerBy: [] };
  }

  /** An ally's strike: `damage` straight to the enemy (shield ignored). */
  public allyHit(enemyId: string, damage: number): number {
    const e = this.getCombatant(enemyId);
    if (!e || !e.isAlive) return 0;
    const dealt = Math.min(e.stats.hp, Math.max(1, damage));
    e.stats.hp -= dealt;
    if (e.stats.hp <= 0) {
      e.isAlive = false;
      this.state.phase = 'victory';
    }
    return dealt;
  }

  /** Ends the battle in Peter's favour (a duel stops before anyone falls). */
  public forceVictory(): void {
    this.state.phase = 'victory';
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
        this.bosses.set(e.id, {
          shield: true,
          unlocked: false,
          done: new Set(),
          stunTurns: 0,
          sentence: null,
          cracks: 0,
          turns: 0,
          lock: null,
          staggered: false,
          song: null,
          wall: null,
          wallIn: e.mechanic.bloodWall?.everyTurns ?? 0,
          ritual: { open: false, progress: 0, done: false },
        });
      if (e.mechanic?.startsUnshielded) this.bosses.get(e.id)!.shield = false;
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

  /**
   * Sentence bosses: after the boss's turn, pick the verdict on Peter's next move. Returns the
   * announcement for the battle log, or null (no sentences, shield already broken, boss down).
   */
  public announceSentence(enemyId: string): string | null {
    const boss = this.bosses.get(enemyId);
    const enemy = this.getCombatant(enemyId);
    const s = enemy?.mechanic?.sentences;
    if (!boss || !s || !enemy?.isAlive || !boss.shield || s.list.length === 0) return null;
    boss.sentence = s.list[Math.floor(this.rng() * s.list.length) % s.list.length];
    return boss.sentence.announce;
  }

  /**
   * After the boss's turn: memory-lock cadence and the verse it sings. Returns battle-log lines.
   */
  public bossTurnCues(enemyId: string): string[] {
    const boss = this.bosses.get(enemyId);
    const enemy = this.getCombatant(enemyId);
    const m = enemy?.mechanic;
    if (!boss || !m || !enemy?.isAlive) return [];
    const out: string[] = [];
    boss.turns++;
    const ml = m.memoryLock;
    if (ml) {
      if (boss.lock) {
        boss.lock.turnsLeft--;
        if (boss.lock.turnsLeft <= 0) {
          boss.lock = null;
          out.push(ml.releaseMessage);
        }
      } else if (boss.turns % ml.everyTurns === 0 && ml.options.length > 0) {
        const o = ml.options[Math.floor(this.rng() * ml.options.length) % ml.options.length];
        boss.lock = { command: o.command, turnsLeft: ml.lockTurns, staggerBy: o.staggerBy };
        out.push(o.announce);
      }
    }
    const bw = m.bloodWall;
    if (bw && !boss.wall && --boss.wallIn <= 0) {
      boss.wall = { cuts: 0 };
      out.push(bw.raiseMessage);
    }
    const sg = m.songs;
    if (sg && boss.shield && sg.list.length > 0) {
      const s = sg.list[Math.floor(this.rng() * sg.list.length) % sg.list.length];
      boss.song = { id: s.id, coreId: s.coreId, crackMessage: s.crackMessage };
      out.push(s.announce);
    }
    return out;
  }

  /** Command locked by the boss's memory lock, if any. */
  public getLockedCommand(enemyId: string): CombatActionType | null {
    return this.bosses.get(enemyId)?.lock?.command ?? null;
  }

  /** The cores Peter may strike (songs), in key order 6, 7, 8. */
  public getSongCores(enemyId: string): BossEnvironmentAction[] {
    const enemy = this.getCombatant(enemyId);
    const boss = this.bosses.get(enemyId);
    if (!enemy?.mechanic?.songs || !boss?.shield || !enemy.isAlive) return [];
    return enemy.mechanic.actions;
  }

  /**
   * Everything keys 6-8 can do against this boss right now: song cores, cutting the blood wall's
   * tethers, or the ritual pillars.
   */
  public getEnvironmentOptions(enemyId: string): BossEnvironmentAction[] {
    const cores = this.getSongCores(enemyId);
    if (cores.length > 0) return cores;
    const enemy = this.getCombatant(enemyId);
    const boss = this.bosses.get(enemyId);
    const m = enemy?.mechanic;
    if (!m || !boss || !enemy?.isAlive) return [];
    if (m.bloodWall && boss.wall) return [m.bloodWall.cutAction];
    if (m.ritual && boss.ritual.open && !boss.ritual.done) return m.ritual.pillars;
    const out: BossEnvironmentAction[] = [];
    const fin = m.finisher;
    if (fin && this.hasItem(fin.itemId) && enemy.stats.hp <= enemy.stats.maxHp * fin.belowPct)
      out.push(fin.action);
    const nc = m.nameCall;
    if (nc && !boss.shield && this.hasFlag(nc.flag) && !boss.done.has(nc.action.id))
      out.push(nc.action);
    return out;
  }

  /** True while the boss's blood wall stands. */
  public hasBloodWall(enemyId: string): boolean {
    return !!this.bosses.get(enemyId)?.wall;
  }

  /** Ritual state for the HUD / tests. */
  public getRitual(enemyId: string): { open: boolean; progress: number; done: boolean } | null {
    return this.bosses.get(enemyId)?.ritual ?? null;
  }

  private cutTether(enemy: ICombatant): string {
    const boss = this.bosses.get(enemy.id);
    const bw = enemy.mechanic?.bloodWall;
    if (!boss?.wall || !bw) return '';
    boss.wall.cuts++;
    if (boss.wall.cuts >= bw.cutsToBreak) {
      boss.wall = null;
      boss.wallIn = bw.everyTurns;
      return `${bw.cutMessage} ${bw.breakMessage}`;
    }
    return bw.cutMessage;
  }

  private lightPillar(peter: ICombatant, enemy: ICombatant, pillarId: string): string {
    const boss = this.bosses.get(enemy.id);
    const r = enemy.mechanic?.ritual;
    if (!boss || !r || !boss.ritual.open || boss.ritual.done) return '';
    const pillar = r.pillars.find((x) => x.id === pillarId);
    if (r.order[boss.ritual.progress] === pillarId) {
      boss.ritual.progress++;
      let msg = pillar?.message ?? '';
      if (boss.ritual.progress >= r.order.length) {
        boss.ritual.done = true;
        msg += ` ${r.completeMessage}`;
      }
      return msg;
    }
    boss.ritual.progress = 0;
    const hit = this.applyDamage(peter, Math.max(1, Math.ceil(peter.stats.maxHp * r.wrongPct)));
    if (peter.stats.hp <= 0) peter.isAlive = false;
    return formatString({ m: r.wrongMessage }, 'm', { damage: hit.dealt });
  }

  /** Answers the sung verse by striking a core. */
  private strikeCore(
    peter: ICombatant,
    enemy: ICombatant,
    coreId: string,
  ): { damage: number; message: string } {
    const boss = this.bosses.get(enemy.id);
    const sg = enemy.mechanic?.songs;
    if (!boss || !sg) return { damage: 0, message: '' };
    const song = boss.song;
    boss.song = null;
    if (song && song.coreId === coreId) {
      const dealt = Math.min(sg.coreDamage, Math.max(0, enemy.stats.hp - 1));
      enemy.stats.hp -= dealt;
      boss.cracks++;
      let message = song.crackMessage;
      if (boss.cracks >= sg.cracksToBreak) {
        boss.shield = false;
        message += ` ${sg.breakMessage}`;
      }
      return { damage: dealt, message };
    }
    const hit = this.applyDamage(peter, Math.max(1, Math.ceil(peter.stats.maxHp * sg.wrongPct)));
    if (peter.stats.mp !== undefined) peter.stats.mp = Math.max(0, peter.stats.mp - sg.wrongMp);
    if (peter.stats.hp <= 0) peter.isAlive = false;
    return { damage: 0, message: formatString({ m: sg.wrongMessage }, 'm', { damage: hit.dealt }) };
  }

  /** The verdict currently in force against Peter, if any. */
  public getSentence(enemyId: string): BossSentence | null {
    return this.bosses.get(enemyId)?.sentence ?? null;
  }

  /** Memory lock: a hit landed with the right command cracks the boss's mirror. */
  private judgeLock(type: CombatActionType, damage: number): string {
    let text = '';
    for (const [id, boss] of this.bosses) {
      const ml = this.getCombatant(id)?.mechanic?.memoryLock;
      if (!ml || !boss.lock || damage <= 0 || !boss.lock.staggerBy.includes(type)) continue;
      boss.lock = null;
      boss.staggered = true;
      text += ` ${ml.staggerMessage}`;
    }
    return text;
  }

  /** Judges Peter's action against the verdicts in force; returns extra battle-log text. */
  private judgeSentences(peter: ICombatant, type: CombatActionType): string {
    let text = '';
    for (const [id, boss] of this.bosses) {
      const s = boss.sentence;
      const enemy = this.getCombatant(id);
      if (!s || !enemy) continue;
      boss.sentence = null;
      if (s.forbidden.includes(type)) {
        const hit = this.applyDamage(
          peter,
          Math.max(1, Math.ceil(peter.stats.maxHp * s.punishPct)),
        );
        text += ` ${formatString({ m: s.punishMessage }, 'm', { damage: hit.dealt })}`;
        if (peter.stats.hp <= 0) peter.isAlive = false;
      } else if (s.defiedBy.includes(type) && boss.shield) {
        boss.cracks++;
        text += ` ${s.crackMessage}`;
        const rule = enemy.mechanic?.sentences;
        if (rule && boss.cracks >= rule.cracksToBreak) {
          boss.shield = false;
          text += ` ${rule.breakMessage}`;
        }
      }
    }
    return text;
  }

  /** Applies shield reduction and the HP floor to damage dealt to `target`. */
  private applyDamage(target: ICombatant, damage: number): { dealt: number; shielded: boolean } {
    const boss = this.bosses.get(target.id);
    if (boss?.staggered) {
      boss.staggered = false;
      damage = Math.ceil(damage * (1 + (target.mechanic?.memoryLock?.staggerBonus ?? 0)));
    }
    const m = target.mechanic;
    if (boss?.wall && m?.bloodWall)
      damage = Math.max(1, Math.floor(damage * (1 - m.bloodWall.reducePct)));
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
        if (action.damageFactor !== undefined) {
          damage = Math.max(1, Math.floor(damage * action.damageFactor));
        }

        if (this.defendedCombatants.has(target.id)) {
          damage = Math.max(1, Math.floor(damage * t.defendDamageFactor));
          message = this.t('combat.log.guarded', names);
        }

        const hit = this.applyDamage(target, damage);
        damage = hit.dealt;
        const drain = source.mechanic?.drainAfterBreak;
        if (drain && !this.bosses.get(source.id)?.shield && damage > 0) {
          source.stats.hp = Math.min(
            source.stats.maxHp,
            source.stats.hp + Math.ceil(damage * drain),
          );
        }
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
        const fin = target.mechanic?.finisher;
        if (fin && action.environmentId === fin.action.id) {
          damage = target.stats.hp;
          target.stats.hp = 0;
          message = fin.action.message;
          break;
        }
        const nc = target.mechanic?.nameCall;
        const ncBoss = this.bosses.get(target.id);
        if (nc && ncBoss && action.environmentId === nc.action.id) {
          ncBoss.done.add(nc.action.id);
          ncBoss.stunTurns += nc.stunTurns;
          damage = Math.min(target.stats.hp, Math.ceil(target.stats.maxHp * nc.damagePct));
          target.stats.hp -= damage;
          message = nc.action.message;
          break;
        }
        if (target.mechanic?.bloodWall && this.bosses.get(target.id)?.wall) {
          message = this.cutTether(target);
          break;
        }
        if (target.mechanic?.ritual && this.bosses.get(target.id)?.ritual.open) {
          message = this.lightPillar(source, target, action.environmentId ?? '');
          break;
        }
        if (target.mechanic?.songs) {
          const r = this.strikeCore(source, target, action.environmentId ?? '');
          damage = r.damage;
          message = r.message;
          break;
        }
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

    if (source.type === 'player') {
      this.lastPlayerCommand = action.type;
      message += this.judgeSentences(source, action.type);
      message += this.judgeLock(action.type, damage);
    }

    // The Last War: after the ritual, any landed hit is the final one; before it, it rises again.
    const ritual = target.mechanic?.ritual;
    const rb = this.bosses.get(target.id);
    if (ritual && rb && source.type === 'player') {
      if (rb.ritual.done && damage > 0 && (action.type === 'attack' || action.type === 'skill')) {
        target.stats.hp = 0;
        message += ` ${ritual.finishMessage}`;
      } else if (target.stats.hp <= 0 && !rb.ritual.done) {
        target.stats.hp = Math.ceil(target.stats.maxHp * ritual.revivePct);
        rb.ritual = { open: true, progress: 0, done: false };
        message += ` ${ritual.openMessage}`;
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
