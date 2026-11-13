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

/** Something that happens at the start of the player's turn in a scripted battle. */
export interface BattleEvent {
  /** Round number (1-based) at which it fires, once. */
  atTurn: number;
  /** Lines of this dialogue.json node are shown one by one in the battle log. */
  dialogueId?: string;
  /** Story flags set when the event ends (e.g. `has_broken_blade` unlocks Attack). */
  setFlags?: string[];
  /** A helper who appears beside Peter (e.g. the Elder). */
  ally?: { texture: string; anim?: string };
}

export interface BattleScript {
  /** Commands unavailable for this whole battle (e.g. `escape` in a forced fight). */
  lockedCommands?: string[];
  /** Commands available in this battle even without their story flag (e.g. bare-handed attack). */
  unlockedCommands?: string[];
  events?: BattleEvent[];
  /**
   * A fight Peter cannot lose or win: his HP never drops below 1, and once it falls to
   * `belowHpPct` of max the event plays (e.g. the Elder steps in) and the battle ends; the map
   * reopens with `dialogueId`.
   */
  rescue?: { belowHpPct: number; dialogueId: string; event: Omit<BattleEvent, 'atTurn'> };
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
  /** Verdicts the boss announces; `cracksToBreak` defied verdicts break the shield. */
  sentences?: { cracksToBreak: number; list: BossSentence[]; breakMessage: string };
  /** The fight starts without the shield (a boss beaten by its own rule, not by breaking it). */
  startsUnshielded?: boolean;
  /** At the start, the boss copies part of Peter's attack (`pct`). */
  mirrorGear?: { pct: number; message: string };
  /**
   * Every `everyTurns` boss turns, one of Peter's commands is locked for `lockTurns`. Landing a hit
   * with a command in `staggerBy` while it holds cracks the boss: the lock lifts and its next hit
   * taken is increased by `staggerBonus`.
   */
  memoryLock?: {
    everyTurns: number;
    lockTurns: number;
    staggerBonus: number;
    staggerMessage: string;
    releaseMessage: string;
    options: { command: CombatActionType; announce: string; staggerBy: CombatActionType[] }[];
  };
  /**
   * Each boss turn a verse is sung; Peter answers by striking the core it names (environment
   * actions, keys 6-8). Right: pure damage and a crack; wrong: a scream that hurts and drains MP.
   */
  songs?: {
    cracksToBreak: number;
    breakMessage: string;
    coreDamage: number;
    wrongPct: number;
    wrongMp: number;
    wrongMessage: string;
    list: { id: string; announce: string; coreId: string; crackMessage: string }[];
  };
}

export interface ICombatActionResult {
  action: ICombatAction;
  damageDealt: number;
  healingDone: number;
  isCritical: boolean;
  message: string;
  targetDefeated: boolean;
}

/** How a small enemy defends itself when fought on the map. */
export interface FieldTraits {
  /** The sprite sheet looks left (flip when walking right). */
  facesLeft?: boolean;
  /** Blocks slashes from the side it faces, inside this arc (degrees), except while recovering. */
  frontShieldDeg?: number;
  /** Glows red for `glowMs` every `everyMs`; a hit while glowing hurts Peter for `pct` of it. */
  reflect?: { pct: number; everyMs: number; glowMs: number };
  /** When Peter's slash hits nothing and this enemy is within `range` px, it blinks behind him. */
  blinkOnWhiff?: { range: number };
  /** Leaves a pool every `everyMs` that lasts `lifeMs`: inside, Peter is slowed and loses MP. */
  pool?: { everyMs: number; lifeMs: number; radius: number; slowPct: number; mpPerSec: number };
  /** Below half HP, splits off this many 1-HP decoys that cannot hurt (Temporal Strike clears them). */
  clonesAtHalf?: number;
}

/**
 * Boss "sentence" rule: after each of its turns the boss announces a verdict on Peter's next
 * move. Doing what the verdict forbids is punished; defying it the right way cracks the boss's
 * scales, and enough cracks break the shield.
 */
export interface BossSentence {
  id: string;
  /** Battle-log line announcing it. */
  announce: string;
  /** Peter's commands that are punished. */
  forbidden: CombatActionType[];
  /** Peter's commands that crack the scales. */
  defiedBy: CombatActionType[];
  /** Damage to Peter when punished, as a fraction of his max HP. */
  punishPct: number;
  punishMessage: string;
  crackMessage: string;
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
  /** Scripted battle (story fights): locked commands and mid-battle events. */
  script?: BattleScript;
  /** Real-time behaviour on the map (small enemies). */
  field?: FieldTraits;
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
