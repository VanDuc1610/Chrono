import { describe, expect, it } from 'vitest';
import { isGlowing, shieldBlocks } from '../src/systems/action/ActionRules';
import { CombatSystem } from '../src/systems/combat/CombatSystem';
import type { BossMechanic, ICombatant } from '../src/systems/combat/CombatTypes';

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

const mechanic: BossMechanic = {
  damageReduction: 0.8,
  hpFloor: 1,
  recoverPct: 0.5,
  recoverMessage: 'recovers',
  unlockAfterTurns: 99,
  unlockMessage: '',
  actions: [],
  sentences: {
    cracksToBreak: 2,
    breakMessage: 'BROKEN',
    list: [
      {
        id: 'blade',
        announce: 'Whoever strikes shall bleed!',
        forbidden: ['attack', 'skill'],
        defiedBy: ['defend'],
        punishPct: 0.2,
        punishMessage: 'Peter bleeds {damage}.',
        crackMessage: 'CRACK',
      },
    ],
  },
};

const setup = (): { cs: CombatSystem; peter: ICombatant; boss: ICombatant } => {
  const cs = new CombatSystem({ tuning, resolveItem: () => undefined, rng: () => 0 });
  const peter: ICombatant = {
    id: 'peter',
    name: 'Peter',
    type: 'player',
    stats: { hp: 100, maxHp: 100, attack: 20, defense: 5, speed: 12 },
    isAlive: true,
    spriteKey: 'p',
  };
  const boss: ICombatant = {
    id: 'verdict',
    name: 'Verdict',
    type: 'enemy',
    stats: { hp: 300, maxHp: 300, attack: 10, defense: 10, speed: 10 },
    isAlive: true,
    spriteKey: 'v',
    mechanic,
  };
  cs.startBattle([peter], [boss]);
  return { cs, peter, boss };
};

describe('Chapter 2 sentence boss', () => {
  it('punishes the forbidden move', () => {
    const { cs, peter } = setup();
    expect(cs.announceSentence('verdict')).toBe('Whoever strikes shall bleed!');
    const r = cs.executeAction({ type: 'attack', sourceId: 'peter', targetId: 'verdict' });
    expect(peter.stats.hp).toBe(80);
    expect(r.message).toContain('Peter bleeds 20.');
    expect(cs.getSentence('verdict')).toBeNull();
  });

  it('cracks the scales when defied and breaks the shield after enough cracks', () => {
    const { cs, peter } = setup();
    cs.announceSentence('verdict');
    cs.executeAction({ type: 'defend', sourceId: 'peter', targetId: 'verdict' });
    expect(cs.isShielded('verdict')).toBe(true);
    cs.announceSentence('verdict');
    const r = cs.executeAction({ type: 'defend', sourceId: 'peter', targetId: 'verdict' });
    expect(r.message).toContain('BROKEN');
    expect(cs.isShielded('verdict')).toBe(false);
    expect(peter.stats.hp).toBe(100);
    // No more verdicts once the shield is gone.
    expect(cs.announceSentence('verdict')).toBeNull();
  });

  it('ignores moves the verdict says nothing about', () => {
    const { cs, peter } = setup();
    cs.announceSentence('verdict');
    cs.executeAction({ type: 'escape', sourceId: 'peter', targetId: 'verdict' });
    expect(peter.stats.hp).toBe(100);
    expect(cs.isShielded('verdict')).toBe(true);
  });
});

describe('Chapter 2 field enemies', () => {
  it('a front shield blocks hits from the front, not from behind or while recovering', () => {
    const e = { x: 0, y: 0 };
    expect(shieldBlocks(0, e, { x: 20, y: 0 }, 140, 'chase')).toBe(true);
    expect(shieldBlocks(0, e, { x: -20, y: 0 }, 140, 'chase')).toBe(false);
    expect(shieldBlocks(0, e, { x: 0, y: 20 }, 140, 'chase')).toBe(false); // side, 90° > 70°
    expect(shieldBlocks(0, e, { x: 20, y: 0 }, 140, 'recover')).toBe(false);
  });

  it('glows for glowMs of every cycle', () => {
    expect(isGlowing(0, 0, 3000, 900)).toBe(true);
    expect(isGlowing(899, 0, 3000, 900)).toBe(true);
    expect(isGlowing(900, 0, 3000, 900)).toBe(false);
    expect(isGlowing(3100, 0, 3000, 900)).toBe(true);
    expect(isGlowing(100, 2950, 3000, 900)).toBe(true);
  });
});
