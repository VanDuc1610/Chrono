/**
 * Real-time boss fights (T-84): each boss in public/assets/data/bosses.json gets its own attack
 * patterns (moves, grouped in phases) and its own defence. Bosses without a profile still use the
 * turn-based CombatScene.
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

export type BossMove = (SlamMove | RingMove | ChargeMove | VolleyMove | BeamMove) & {
  /** Shouted above the boss as it begins. */
  label: string;
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
  /** Arena coordinates (0-1 of the arena width / height). */
  x: number;
  y: number;
  /** Earlier targets that must be struck first. */
  requires?: string[];
  /** Works only while the boss is stunned. */
  whileStunned?: boolean;
  effect: 'stun' | 'breakArmor';
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
}

export interface BossProfile {
  id: string;
  /** Arena colours and decoration. */
  arena: { floor: string; floorAlt: string; edge: string; water?: boolean };
  /** Body radius (px) for hits and contact. */
  radius: number;
  /** Walking speed (px/s). */
  speed: number;
  /** Scales every hit on Peter (real time lands more blows than turns). */
  damageScale: number;
  /** Touching the boss hurts this much (× attack); 0 = harmless. */
  contactMult: number;
  phases: BossPhase[];
  moves: Record<string, BossMove>;
  defense: BossDefense;
  intro?: string;
}

export interface BossDatabase {
  bosses: BossProfile[];
}
