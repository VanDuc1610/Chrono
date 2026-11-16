/**
 * Real-time boss fights (T-84): each boss in public/assets/data/bosses.json gets its own attack
 * patterns (moves, grouped in phases) and its own defence, fought on the map where Peter meets it.
 * Bosses without a profile still use the turn-based CombatScene.
 */

/** Telegraphed circle(s) that burst after `telegraphMs`: at Peter, or scattered around him. */
export interface SlamMove {
  type: 'slam';
  telegraphMs: number;
  radius: number;
  /** Circles per use: the first on Peter, the rest scattered within `scatter` px. */
  count?: number;
  scatter?: number;
  /** Delay between the circles (ms). */
  staggerMs?: number;
  mult: number;
}

/** Ring(s) expanding from the boss: dash through it (invulnerable) or stand in its gap. */
export interface RingMove {
  type: 'ring';
  telegraphMs: number;
  speed: number;
  thickness: number;
  rings?: number;
  /** ms between rings. */
  intervalMs?: number;
  /** A safe gap in the ring (degrees), aimed away from Peter at a random side. */
  gapDeg?: number;
  mult: number;
  /** Peter is slowed when hit (ms). */
  slowMs?: number;
}

/** Locks a line toward Peter, then rushes along it; hitting the arena edge stuns the boss. */
export interface ChargeMove {
  type: 'charge';
  telegraphMs: number;
  speed: number;
  durationMs: number;
  mult: number;
  /** Stunned (and open) after slamming into a wall. */
  stunOnWallMs?: number;
}

/** A fan of slow bolts toward Peter. */
export interface VolleyMove {
  type: 'volley';
  telegraphMs: number;
  shots: number;
  spreadDeg: number;
  speed: number;
  waves?: number;
  intervalMs?: number;
  mult: number;
}

/** A straight beam from the boss along a locked angle, optionally sweeping. */
export interface BeamMove {
  type: 'beam';
  telegraphMs: number;
  width: number;
  durationMs: number;
  /** Degrees swept during the beam (0 = still). */
  sweepDeg?: number;
  mult: number;
}

/** Short keys of the pixelfx effects the game ships (src/vendor/pixelfx/effects.js). */
export type BossFxKey =
  | 'hitSpark'
  | 'critHit'
  | 'shieldBlock'
  | 'groundSlam'
  | 'splash'
  | 'waveCrash'
  | 'timeStop'
  | 'blinkIn'
  | 'blinkOut'
  | 'smite'
  | 'holyPillar'
  | 'soulRise'
  | 'poof'
  | 'stunned'
  | 'curse'
  | 'frostNova';

export type BossMove = (SlamMove | RingMove | ChargeMove | VolleyMove | BeamMove) & {
  /** Shouted above the boss as it begins. */
  label: string;
  /** pixelfx effect where the move lands (slam), starts (ring) or ends (charge, beam). */
  fx?: BossFxKey;
  /** Palette for the effect (dark to bright hex colours). */
  fxPalette?: string[];
  /** The boss blinks to Peter's side before the move (Time Wraith). */
  blink?: boolean;
  /** Slams only: chance the first circle is a decoy and the real blow lands on Peter late. */
  feint?: number;
};

export interface BossPhase {
  /** Active once HP ratio is at or below this (1 = from the start). */
  fromHpPct: number;
  /** Only after the armor is broken (defence.armor). */
  afterArmorBroken?: boolean;
  moves: string[];
  /** Rest between moves (ms); the boss walks toward Peter meanwhile. */
  pauseMs: number;
  speedMult?: number;
  /** Banner when the phase starts. */
  banner?: string;
}

/** Something in the arena Peter strikes (slash or shot) to break the boss's defence. */
export interface BossTarget {
  id: string;
  label: string;
  /** Map tile where it stands (the fight happens on the boss's own map). */
  tile?: { x: number; y: number };
  /** Circles the boss instead of standing on a tile (Unborn King's crowns). */
  orbit?: { radius: number; degPerSec: number; startDeg: number };
  /** Out of sight until the ritual opens (The Last War's pillars). */
  hidden?: boolean;
  /** Colour of the target while lit (default gold). */
  color?: string;
  /** Earlier targets that must be struck first. */
  requires?: string[];
  /** Works only while the boss is stunned. */
  whileStunned?: boolean;
  /**
   * stun: stuns the boss; progress: only counts (a `stunMs` restarts the stun); breakArmor;
   * song: judged by the song in force (defense.songs); finality: the next blow ends the boss.
   */
  effect: 'stun' | 'progress' | 'breakArmor' | 'song' | 'finality';
  stunMs?: number;
  /** breakArmor: HP ratio the boss is set to (if lower than now). */
  setHpPct?: number;
  message: string;
}

export interface BossDefense {
  /** Damage cut while the armor holds; at `floorPct` it heals back to `recoverPct`. */
  armor?: {
    damageReduction: number;
    floorPct: number;
    recoverPct: number;
    recoverMessage: string;
  };
  /** Targets appear after this long, or when Temporal Strike touches the boss. */
  targets?: BossTarget[];
  unlockAfterMs?: number;
  unlockOnSkill?: boolean;
  unlockMessage?: string;
  /** Wrong-order / not-stunned message. */
  lockedMessage?: string;
  /** Blows from within this arc in front of the boss are blocked (attack the flank or back). */
  frontGuardDeg?: number;
  /** Takes damage only while stunned. */
  stunnedOnly?: boolean;
  /** Every `everyMs` it glows for `glowMs`: blows then hurt Peter for `pct` of the damage. */
  reflect?: { everyMs: number; glowMs: number; pct: number };
  /** Imperial Verdict: sentences forbid moves for a while; defying them cracks the armor. */
  sentences?: SentenceDefense;
  /** Struck targets out of order: Peter pays this share of his max HP and the chain restarts. */
  wrongOrder?: { pct: number; message: string };
  /** Faceless Keeper: its mirror freezes one kind of Peter's moves; the other kind staggers it. */
  memoryLock?: MemoryLockDefense;
  /** Nameless Choir, Unborn King: a song names one target; strike that one, not another. */
  songs?: SongDefense;
  /** Crimson Standard: the banner plants itself behind a wall tied to soul tethers. */
  bloodWall?: BloodWallDefense;
  /** The Last War: it rises again once, and only the ritual (targets in order) ends it. */
  ritual?: RitualDefense;
}

/** Melee = slash; ranged = shots and Temporal Strike. */
export type MoveKind = 'melee' | 'ranged';

export interface MemoryLockDefense {
  firstMs: number;
  everyMs: number;
  lockMs: number;
  /** Stun and damage factor when the other kind of move lands during a lock. */
  staggerMs: number;
  staggerMult: number;
  staggerMessage: string;
  lockedText: string;
  options: { lock: MoveKind; announce: string }[];
}

export interface SongDefense {
  cracksToBreak: number;
  firstMs: number;
  gapMs: number;
  windowMs: number;
  /** A wrong target: this share of Peter's max HP, and this much MP. */
  wrongPct: number;
  wrongMp: number;
  wrongMessage: string;
  breakMessage: string;
  /** Striking a song target while no song plays. */
  silentMessage: string;
  list: { id: string; targetId: string; announce: string; crackMessage: string; color: string }[];
}

export interface BloodWallDefense {
  firstMs: number;
  everyMs: number;
  reducePct: number;
  tethers: number;
  /** Tethers stand this far from the boss (px). */
  minDist: number;
  maxDist: number;
  stunMs: number;
  raiseMessage: string;
  cutMessage: string;
  breakMessage: string;
}

export interface RitualDefense {
  /** HP ratio it rises with. */
  revivePct: number;
  openMessage: string;
  completeMessage: string;
  finishMessage: string;
}

/** What Peter does, as a sentence sees it. */
export type SentenceAct = 'attack' | 'item' | 'idle';

export interface Sentence {
  id: string;
  announce: string;
  /** Doing one of these during the sentence brings the punishment. */
  forbid: SentenceAct[];
  /** endure: get through the window without a forbidden act; hit: land a blow before it ends. */
  defy: 'endure' | 'hit';
  /** Punishment: this share of Peter's max HP, through any dodge. */
  punishPct: number;
  punishMessage: string;
  crackMessage: string;
  /** Aura colour while it holds. */
  color: string;
  /** pixelfx effect on Peter when the sentence strikes him. */
  fx?: BossFxKey;
}

export interface SentenceDefense {
  cracksToBreak: number;
  /** First sentence after this much fighting, then `gapMs` after each one ends. */
  firstMs: number;
  gapMs: number;
  windowMs: number;
  /** Standing still this long counts as `idle`. */
  idleMs: number;
  breakMessage: string;
  list: Sentence[];
}

export interface BossProfile {
  id: string;
  /** Sprite scale on the map (default 1). */
  scale?: number;
  /** Body radius (px) for hits and contact. */
  radius: number;
  /** Walking speed (px/s). */
  speed: number;
  /** Boss HP in the live fight = enemies.json maxHp × this (default 1). */
  hpScale?: number;
  /** Scales every hit on Peter (real time lands more blows than turns). */
  damageScale: number;
  /** Touching the boss hurts this much (× attack); 0 = harmless. */
  contactMult: number;
  phases: BossPhase[];
  moves: Record<string, BossMove>;
  defense: BossDefense;
  intro?: string;
  /** Peter may fight with his fists here (before he has a blade): reach and damage factor. */
  unarmed?: { reach: number; mult: number };
  /**
   * A fight Peter is not meant to win: at `belowHpPct` of his HP an ally steps in, the boss
   * vanishes, and `dialogueId` opens (after `flashDialogueId`, if any).
   */
  rescue?: {
    belowHpPct: number;
    dialogueId: string;
    flashDialogueId?: string;
    allyTexture?: string;
    allyAnim?: string;
    /** False: the boss stays (it only stops), e.g. Kuro sparing Peter. Default true. */
    vanish?: boolean;
  };
  /** A sparring match: won once the boss is down to this HP ratio (Kuro's duel). */
  endAtHpPct?: number;
  /** Stunned from the start while `flag` holds (Unborn King and the unity mindset). */
  startStun?: { flag: string; ms: number; message: string };
  /** An ally fights beside Peter while `flag` holds, striking every `everyMs`. */
  ally?: {
    flag: string;
    texture: string;
    anim?: string;
    everyMs: number;
    damagePct: number;
    message: string;
  };
  /** Once its armor is broken, the boss heals by this share of the damage it deals. */
  drainAfterBreak?: number;
  /** At the start the boss copies this share of Peter's attack (Faceless Keeper's mirror). */
  mirrorGearPct?: number;
  mirrorGearMessage?: string;
  /** Peter's other self answers his moves (Alpha Peter). */
  mirror?: {
    /** Move it answers Temporal Strike with, sealing Peter's own for `silenceMs`. */
    skillMove: string;
    silenceMs: number;
    skillMessage: string;
    /** It heals this share when Peter uses an item. */
    healPct: number;
    healMessage: string;
    /** It lunges after a dodge. */
    dashLunge: boolean;
  };
  /** An item ends the fight (E) once the boss is low enough (the letter to Na). */
  finisher?: { itemId: string; belowPct: number; prompt: string; message: string };
}

export interface BossDatabase {
  bosses: BossProfile[];
}
