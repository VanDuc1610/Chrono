import { describe, expect, it } from 'vitest';
import {
  facingFromAngle,
  inSlash,
  newBrain,
  nextStep,
  resolveActionTuning,
  rollHit,
  thinkRoamer,
  type RoamerBrain,
  type RoamerSenses,
} from '../src/systems/action/ActionRules';

const tuning = {
  attackMultiplier: 2,
  attackVariance: 0,
  critChance: 0,
  critMultiplier: 1.5,
  skillMultiplier: 2.8,
  skillMinDamage: 5,
  skillMpCost: 6,
  defendDamageFactor: 0.5,
  escapeBaseChance: 0.5,
  escapeSpeedFactor: 0.05,
  escapeMinChance: 0.1,
  escapeMaxChance: 0.9,
};

const senses = (over: Partial<RoamerSenses>): RoamerSenses => ({
  pos: { x: 0, y: 0 },
  player: null,
  dt: 16,
  rng: () => 0.5,
  sight: 100,
  leash: 200,
  patrolRadius: 40,
  attackRange: 20,
  windupMs: 300,
  recoverMs: 500,
  ...over,
});

describe('Action combat rules', () => {
  it('uses the turn-based damage formula, minimum 1', () => {
    expect(rollHit(10, 4, tuning, () => 0.5).damage).toBe(16);
    expect(rollHit(10, 4, tuning, () => 0.5, 2).damage).toBe(36);
    expect(rollHit(1, 50, tuning, () => 0.5).damage).toBe(1);
  });

  it('hits only inside the slash arc and reach', () => {
    const o = { x: 0, y: 0 };
    expect(inSlash(o, 0, { x: 30, y: 0 }, 30, 120)).toBe(true);
    expect(inSlash(o, 0, { x: 15, y: 20 }, 30, 120)).toBe(true); // ~53°, inside ±60°
    expect(inSlash(o, 0, { x: -30, y: 0 }, 30, 120)).toBe(false); // behind
    expect(inSlash(o, 0, { x: 60, y: 0 }, 30, 120)).toBe(false); // too far
    expect(facingFromAngle(Math.PI / 2)).toBe('down');
    expect(facingFromAngle(Math.PI)).toBe('left');
  });

  it('chases Peter on sight, winds up in range, strikes once, then recovers', () => {
    let brain: RoamerBrain = newBrain({ x: 0, y: 0 });
    let out = thinkRoamer(brain, senses({ player: { x: 80, y: 0 } }));
    expect(out.brain.state).toBe('chase');
    expect(out.moveTo).toEqual({ x: 80, y: 0 });
    out = thinkRoamer(out.brain, senses({ player: { x: 15, y: 0 } }));
    expect(out.brain.state).toBe('windup');
    brain = out.brain;
    let strikes = 0;
    for (let i = 0; i < 30; i++) {
      out = thinkRoamer(brain, senses({ player: { x: 15, y: 0 }, dt: 50 }));
      if (out.strike) strikes++;
      brain = out.brain;
    }
    expect(strikes).toBeGreaterThanOrEqual(1);
    expect(['recover', 'windup', 'chase']).toContain(brain.state);
  });

  it('gives up past the leash and walks home; can be avoided', () => {
    const chasing: RoamerBrain = { ...newBrain({ x: 0, y: 0 }), state: 'chase' };
    const out = thinkRoamer(chasing, senses({ pos: { x: 250, y: 0 }, player: { x: 300, y: 0 } }));
    expect(out.brain.state).toBe('return');
    expect(out.moveTo).toEqual({ x: 0, y: 0 });
    // Peter out of sight while patrolling: no chase.
    const calm = thinkRoamer(newBrain({ x: 0, y: 0 }), senses({ player: { x: 500, y: 0 } }));
    expect(calm.brain.state).not.toBe('chase');
  });

  it('finds the way around a wall (tile BFS)', () => {
    // A wall column at x = 2 from y = 0 to 3; the gap is at y = 4.
    const blocked = (x: number, y: number): boolean =>
      x < 0 || y < 0 || x > 5 || y > 5 || (x === 2 && y <= 3);
    // Following the steps reaches the target through the gap, never stepping into the wall.
    let at = { x: 0, y: 0 };
    let steps = 0;
    while (!(at.x === 4 && at.y === 0) && steps < 20) {
      const next = nextStep(blocked, at, { x: 4, y: 0 });
      expect(next).not.toBeNull();
      at = next as { x: number; y: number };
      expect(blocked(at.x, at.y)).toBe(false);
      steps++;
    }
    expect(steps).toBe(12);
    expect(nextStep(blocked, { x: 1, y: 4 }, { x: 2, y: 4 })).toEqual({ x: 2, y: 4 });
    expect(nextStep(() => true, { x: 0, y: 0 }, { x: 3, y: 3 })).toBeNull();
  });

  it('fills missing tuning from defaults', () => {
    const t = resolveActionTuning({ reach: 40, enemy: { sight: 90 } });
    expect(t.reach).toBe(40);
    expect(t.enemy.sight).toBe(90);
    expect(t.enemy.leash).toBeGreaterThan(0);
  });
});
