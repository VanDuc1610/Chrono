import type { BossDefense, BossPhase, BossProfile, BossTarget } from './BossTypes';

type Pt = { x: number; y: number };

/** The phase in force: the last one whose HP threshold (and armor condition) is met. */
export function phaseIndex(profile: BossProfile, hpPct: number, armorBroken: boolean): number {
  let idx = 0;
  profile.phases.forEach((p: BossPhase, i) => {
    if (hpPct <= p.fromHpPct && (!p.afterArmorBroken || armorBroken)) idx = i;
  });
  return idx;
}

/** Next move: random from the phase, never the same one twice in a row when there is a choice. */
export function pickMove(phase: BossPhase, last: string | null, rng: () => number): string {
  const pool = phase.moves.length > 1 ? phase.moves.filter((m) => m !== last) : phase.moves;
  return pool[Math.floor(rng() * pool.length)] ?? phase.moves[0];
}

const norm = (a: number): number => {
  const d = Math.abs(a) % (Math.PI * 2);
  return d > Math.PI ? Math.PI * 2 - d : d;
};

/** Is `attacker` inside the boss's guarded front arc (boss looking along `facing`)? */
export function inFrontArc(facing: number, boss: Pt, attacker: Pt, arcDeg: number): boolean {
  const ang = Math.atan2(attacker.y - boss.y, attacker.x - boss.x);
  return norm(ang - facing) <= (arcDeg * Math.PI) / 360;
}

export function isGlowing(nowMs: number, everyMs: number, glowMs: number): boolean {
  return nowMs % everyMs < glowMs;
}

export type GateResult =
  | { kind: 'hit'; damage: number; recovered?: boolean }
  | { kind: 'blocked'; reason: 'guard' | 'unstunned' }
  | { kind: 'reflected'; back: number };

/**
 * A blow of `raw` damage on the boss through its defence. `from` is where the blow came from
 * (Peter for a slash, the shot's origin for a projectile).
 */
export function gateBlow(
  def: BossDefense,
  state: {
    hp: number;
    maxHp: number;
    armorBroken: boolean;
    stunned: boolean;
    facing: number;
    pos: Pt;
    nowMs: number;
  },
  raw: number,
  from: Pt,
): GateResult {
  if (def.stunnedOnly && !state.stunned) return { kind: 'blocked', reason: 'unstunned' };
  if (
    def.frontGuardDeg &&
    !state.stunned &&
    inFrontArc(state.facing, state.pos, from, def.frontGuardDeg)
  ) {
    return { kind: 'blocked', reason: 'guard' };
  }
  if (
    def.reflect &&
    !state.stunned &&
    isGlowing(state.nowMs, def.reflect.everyMs, def.reflect.glowMs)
  ) {
    return { kind: 'reflected', back: Math.max(1, Math.ceil(raw * def.reflect.pct)) };
  }
  const armor = def.armor && !state.armorBroken ? def.armor : null;
  const damage = Math.max(1, Math.round(raw * (armor ? 1 - armor.damageReduction : 1)));
  if (armor && state.hp - damage <= state.maxHp * armor.floorPct) {
    // The armor will not let the boss fall: it heals back (the arena targets are the way through).
    return {
      kind: 'hit',
      damage: state.hp - Math.ceil(state.maxHp * armor.recoverPct),
      recovered: true,
    };
  }
  return { kind: 'hit', damage };
}

/** Can this target be struck now? 'ok', or why not. */
export function targetReady(
  t: BossTarget,
  done: ReadonlySet<string>,
  stunned: boolean,
): 'ok' | 'order' | 'unstunned' | 'done' {
  if (done.has(t.id)) return 'done';
  if ((t.requires ?? []).some((r) => !done.has(r))) return 'order';
  if (t.whileStunned && !stunned) return 'unstunned';
  return 'ok';
}

/** Is a point on an expanding ring of `radius` (± thickness / 2), outside its safe gap? */
export function onRing(
  center: Pt,
  radius: number,
  thickness: number,
  p: Pt,
  gap?: { angle: number; deg: number },
): boolean {
  const d = Math.hypot(p.x - center.x, p.y - center.y);
  if (Math.abs(d - radius) > thickness / 2) return false;
  if (!gap) return true;
  const ang = Math.atan2(p.y - center.y, p.x - center.x);
  return norm(ang - gap.angle) > (gap.deg * Math.PI) / 360;
}

/** Is a point inside a beam from `from` along `angle` (length `len`, width `width`)? */
export function inBeam(from: Pt, angle: number, len: number, width: number, p: Pt): boolean {
  const dx = p.x - from.x;
  const dy = p.y - from.y;
  const along = dx * Math.cos(angle) + dy * Math.sin(angle);
  if (along < 0 || along > len) return false;
  const across = Math.abs(-dx * Math.sin(angle) + dy * Math.cos(angle));
  return across <= width / 2;
}
