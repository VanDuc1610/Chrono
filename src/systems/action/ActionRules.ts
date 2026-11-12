/**
 * Real-time map combat rules (owner decision 2026-11-12: small enemies are fought on the map,
 * bosses stay turn-based). Pure functions and plain data — no Phaser — so they are unit-tested.
 */
import type { CombatTuning } from '../combat/CombatTypes';

export interface Point {
  x: number;
  y: number;
}

/** player.json `action` block; every field has a default (see DEFAULT_ACTION_TUNING). */
export interface ActionTuning {
  /** Width of Peter's slash, in degrees, centred on the cursor direction. */
  slashArcDeg: number;
  /** Default weapon reach (px from Peter's centre) and time between slashes. */
  reach: number;
  swingMs: number;
  /** Shift dodge: dash speed (px/s), duration, cooldown; invulnerable while dashing. */
  dashSpeed: number;
  dashMs: number;
  dashCooldownMs: number;
  /** Invulnerability after Peter is hit. */
  hurtInvulnMs: number;
  /** Knockback speed (px/s) given to whoever is hit. */
  knockback: number;
  /** Temporal Strike (right click): radius around Peter. MP cost comes from combat.skillMpCost. */
  skillRadius: number;
  /** MP regained per second on the map. */
  mpRegenPerSec: number;
  /** Enemy defaults (a map roamer may override sight / leash / patrolRadius / speed). */
  enemy: {
    sight: number;
    leash: number;
    patrolRadius: number;
    speed: number;
    attackRange: number;
    windupMs: number;
    recoverMs: number;
  };
  /** The Elder fighting beside Peter on the map. */
  ally: { attack: number; reach: number; cooldownMs: number; speed: number };
}

export const DEFAULT_ACTION_TUNING: ActionTuning = {
  slashArcDeg: 120,
  reach: 30,
  swingMs: 420,
  dashSpeed: 330,
  dashMs: 170,
  dashCooldownMs: 650,
  hurtInvulnMs: 700,
  knockback: 170,
  skillRadius: 62,
  mpRegenPerSec: 0.5,
  enemy: {
    sight: 130,
    leash: 260,
    patrolRadius: 48,
    speed: 84,
    attackRange: 24,
    windupMs: 450,
    recoverMs: 900,
  },
  ally: { attack: 9, reach: 34, cooldownMs: 1300, speed: 118 },
};

/** player.json `action`: any field may be left out, including inside `enemy` and `ally`. */
export type ActionTuningInput = Partial<Omit<ActionTuning, 'enemy' | 'ally'>> & {
  enemy?: Partial<ActionTuning['enemy']>;
  ally?: Partial<ActionTuning['ally']>;
};

export function resolveActionTuning(partial?: ActionTuningInput): ActionTuning {
  return {
    ...DEFAULT_ACTION_TUNING,
    ...partial,
    enemy: { ...DEFAULT_ACTION_TUNING.enemy, ...partial?.enemy },
    ally: { ...DEFAULT_ACTION_TUNING.ally, ...partial?.ally },
  };
}

/** Same damage formula as the turn-based Attack (so stats mean the same everywhere). */
export function rollHit(
  attack: number,
  defense: number,
  tuning: CombatTuning,
  rng: () => number,
  multiplier = 1,
): { damage: number; critical: boolean } {
  const raw = attack * tuning.attackMultiplier * multiplier - defense;
  const variance = Math.floor(rng() * (tuning.attackVariance * 2 + 1)) - tuning.attackVariance;
  const critical = rng() < tuning.critChance;
  const damage = Math.max(1, Math.floor((raw + variance) * (critical ? tuning.critMultiplier : 1)));
  return { damage, critical };
}

export const distance = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);

/** Smallest absolute difference between two angles (radians), 0..π. */
export function angleDiff(a: number, b: number): number {
  const d = Math.abs(a - b) % (Math.PI * 2);
  return d > Math.PI ? Math.PI * 2 - d : d;
}

/** True if `target` (with body radius) lies inside a slash of `reach` and `arcDeg` toward `aim`. */
export function inSlash(
  origin: Point,
  aim: number,
  target: Point,
  reach: number,
  arcDeg: number,
  targetRadius = 10,
): boolean {
  const d = distance(origin, target);
  if (d > reach + targetRadius) return false;
  if (d < targetRadius) return true;
  const angle = Math.atan2(target.y - origin.y, target.x - origin.x);
  return angleDiff(angle, aim) <= (arcDeg * Math.PI) / 360;
}

export type Facing = 'up' | 'down' | 'left' | 'right';

export function facingFromAngle(angle: number): Facing {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

// ------------------------------------------------------------------ enemy brain

export type RoamerState = 'idle' | 'patrol' | 'chase' | 'windup' | 'recover' | 'return';

export interface RoamerBrain {
  state: RoamerState;
  /** ms left in idle / windup / recover / patrol. */
  timer: number;
  home: Point;
  patrolTarget: Point | null;
}

export interface RoamerSenses {
  pos: Point;
  /** Peter's position, or null when he cannot be targeted (dialogue, cutscene, defeated). */
  player: Point | null;
  dt: number;
  rng: () => number;
  sight: number;
  leash: number;
  patrolRadius: number;
  attackRange: number;
  windupMs: number;
  recoverMs: number;
}

export interface RoamerIntent {
  brain: RoamerBrain;
  /** Point to walk toward this frame (null = stand still). */
  moveTo: Point | null;
  /** Fraction of the roamer's speed (patrol is slower than chase). */
  pace: number;
  /** The wind-up just finished: resolve the hit now (the caller checks the range). */
  strike: boolean;
}

export function newBrain(home: Point): RoamerBrain {
  return { state: 'idle', timer: 600, home: { ...home }, patrolTarget: null };
}

const ARRIVED = 6;

/** One AI step: idle ⇄ patrol near home; sees Peter → chase → wind-up → strike → recover; gives up past the leash. */
export function thinkRoamer(prev: RoamerBrain, s: RoamerSenses): RoamerIntent {
  const brain: RoamerBrain = { ...prev };
  const fromHome = distance(s.pos, brain.home);
  const toPlayer = s.player ? distance(s.pos, s.player) : Infinity;
  const sees = s.player !== null && toPlayer <= s.sight;
  const idle = (): RoamerIntent => ({ brain, moveTo: null, pace: 0, strike: false });

  switch (brain.state) {
    case 'idle':
    case 'patrol':
    case 'return': {
      if (sees && fromHome <= s.leash) {
        brain.state = 'chase';
        return { brain, moveTo: s.player, pace: 1, strike: false };
      }
      if (brain.state === 'return') {
        if (fromHome <= ARRIVED) {
          brain.state = 'idle';
          brain.timer = 800 + s.rng() * 1200;
          return idle();
        }
        return { brain, moveTo: brain.home, pace: 0.8, strike: false };
      }
      brain.timer -= s.dt;
      if (brain.state === 'idle') {
        if (brain.timer > 0) return idle();
        const a = s.rng() * Math.PI * 2;
        const r = s.patrolRadius * (0.4 + s.rng() * 0.6);
        brain.state = 'patrol';
        brain.timer = 3000;
        brain.patrolTarget = {
          x: brain.home.x + Math.cos(a) * r,
          y: brain.home.y + Math.sin(a) * r,
        };
      }
      const target = brain.patrolTarget ?? brain.home;
      if (distance(s.pos, target) <= ARRIVED || brain.timer <= 0) {
        brain.state = 'idle';
        brain.timer = 900 + s.rng() * 1500;
        brain.patrolTarget = null;
        return idle();
      }
      return { brain, moveTo: target, pace: 0.45, strike: false };
    }
    case 'chase': {
      if (!s.player || fromHome > s.leash || toPlayer > s.sight * 1.6) {
        brain.state = 'return';
        return { brain, moveTo: brain.home, pace: 0.8, strike: false };
      }
      if (toPlayer <= s.attackRange) {
        brain.state = 'windup';
        brain.timer = s.windupMs;
        return idle();
      }
      return { brain, moveTo: s.player, pace: 1, strike: false };
    }
    case 'windup': {
      brain.timer -= s.dt;
      if (brain.timer > 0) return idle();
      brain.state = 'recover';
      brain.timer = s.recoverMs;
      return { brain, moveTo: null, pace: 0, strike: true };
    }
    case 'recover': {
      brain.timer -= s.dt;
      if (brain.timer > 0) return idle();
      brain.state = 'chase';
      return idle();
    }
  }
}

// ------------------------------------------------------------------ path finding

/**
 * Breadth-first search on the tile grid (4 directions): the first tile to step onto to walk from
 * `from` to `to` around walls. Returns `to` when they are neighbours, null if unreachable or
 * already there. `maxNodes` bounds the work on big maps.
 */
export function nextStep(
  blocked: (x: number, y: number) => boolean,
  from: Point,
  to: Point,
  maxNodes = 900,
): Point | null {
  if (from.x === to.x && from.y === to.y) return null;
  const key = (p: Point): string => `${p.x},${p.y}`;
  const cameFrom = new Map<string, Point | null>([[key(from), null]]);
  const queue: Point[] = [from];
  const dirs = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];
  while (queue.length > 0 && cameFrom.size < maxNodes) {
    const cur = queue.shift() as Point;
    if (cur.x === to.x && cur.y === to.y) {
      let step = cur;
      for (let prev = cameFrom.get(key(step)); prev && key(prev) !== key(from);) {
        step = prev;
        prev = cameFrom.get(key(step));
      }
      return step;
    }
    for (const d of dirs) {
      const n = { x: cur.x + d.x, y: cur.y + d.y };
      const k = key(n);
      if (cameFrom.has(k)) continue;
      if (blocked(n.x, n.y) && !(n.x === to.x && n.y === to.y)) continue;
      cameFrom.set(k, cur);
      queue.push(n);
    }
  }
  return null;
}

// ------------------------------------------------------------------ enemy defences

/**
 * Front shield: a hit from inside the arc in front of the enemy is blocked, unless the enemy is
 * recovering from its own strike (its guard is down).
 */
export function shieldBlocks(
  facing: number,
  enemy: Point,
  attacker: Point,
  arcDeg: number,
  state: RoamerState,
): boolean {
  if (state === 'recover') return false;
  const toAttacker = Math.atan2(attacker.y - enemy.y, attacker.x - enemy.x);
  return angleDiff(facing, toAttacker) <= ((arcDeg / 2) * Math.PI) / 180;
}

/** Reflect glow: true during the first `glowMs` of every `everyMs` cycle (shifted by `offset`). */
export function isGlowing(now: number, offset: number, everyMs: number, glowMs: number): boolean {
  if (everyMs <= 0) return false;
  return (((now + offset) % everyMs) + everyMs) % everyMs < glowMs;
}
