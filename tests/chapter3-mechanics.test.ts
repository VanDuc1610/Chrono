import { describe, expect, it } from 'vitest';
import { CombatSystem } from '../src/systems/combat/CombatSystem';
import type { BossMechanic, ICombatant } from '../src/systems/combat/CombatTypes';
import { pickDialogue } from '../src/world/MapRegistry';

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

const base: BossMechanic = {
  damageReduction: 0.85,
  hpFloor: 1,
  recoverPct: 0.5,
  recoverMessage: 'recovers',
  unlockAfterTurns: 99,
  unlockMessage: '',
  actions: [],
};

const fight = (
  mechanic: BossMechanic,
): { cs: CombatSystem; peter: ICombatant; boss: ICombatant } => {
  const cs = new CombatSystem({ tuning, resolveItem: () => undefined, rng: () => 0 });
  const peter: ICombatant = {
    id: 'peter',
    name: 'Peter',
    type: 'player',
    stats: { hp: 100, maxHp: 100, mp: 30, maxMp: 30, attack: 30, defense: 5, speed: 12 },
    isAlive: true,
    spriteKey: 'p',
  };
  const boss: ICombatant = {
    id: 'boss',
    name: 'Boss',
    type: 'enemy',
    stats: { hp: 500, maxHp: 500, attack: 10, defense: 10, speed: 10 },
    isAlive: true,
    spriteKey: 'b',
    mechanic,
  };
  cs.startBattle([peter], [boss]);
  return { cs, peter, boss };
};

describe('Faceless Keeper — memory lock', () => {
  const lock: BossMechanic = {
    ...base,
    startsUnshielded: true,
    memoryLock: {
      everyTurns: 1,
      lockTurns: 2,
      staggerBonus: 0.5,
      staggerMessage: 'CRACK',
      releaseMessage: 'released',
      options: [{ command: 'attack', announce: 'Attack locked!', staggerBy: ['skill'] }],
    },
  };

  it('locks a command, and the opposite command staggers for a bigger next hit', () => {
    const { cs, boss } = fight(lock);
    expect(cs.isShielded('boss')).toBe(false);
    expect(cs.bossTurnCues('boss')).toEqual(['Attack locked!']);
    expect(cs.getLockedCommand('boss')).toBe('attack');
    const r = cs.executeAction({ type: 'skill', sourceId: 'peter', targetId: 'boss' });
    expect(r.message).toContain('CRACK');
    expect(cs.getLockedCommand('boss')).toBeNull();
    const before = boss.stats.hp;
    cs.executeAction({ type: 'attack', sourceId: 'peter', targetId: 'boss' });
    expect(before - boss.stats.hp).toBe(Math.ceil((30 * 2 - 10) * 1.5)); // 75
  });

  it('lifts the lock by itself after lockTurns boss turns', () => {
    const { cs } = fight(lock);
    cs.bossTurnCues('boss');
    cs.bossTurnCues('boss');
    expect(cs.bossTurnCues('boss')).toContain('released');
    expect(cs.getLockedCommand('boss')).toBeNull();
  });
});

describe('Nameless Choir — songs and cores', () => {
  const choir: BossMechanic = {
    ...base,
    actions: [
      { id: 'core_youth', label: 'Tuổi Trẻ', message: '' },
      { id: 'core_war', label: 'Chiến Tranh', message: '' },
    ],
    songs: {
      cracksToBreak: 2,
      breakMessage: 'SHATTERED',
      coreDamage: 120,
      wrongPct: 0.2,
      wrongMp: 8,
      wrongMessage: 'Scream! {damage}',
      list: [
        { id: 'youth', announce: 'A song of youth', coreId: 'core_youth', crackMessage: 'crack' },
      ],
    },
  };

  it('the right core deals pure damage and cracks; two cracks break the shield', () => {
    const { cs, boss } = fight(choir);
    expect(cs.getSongCores('boss').map((c) => c.id)).toEqual(['core_youth', 'core_war']);
    cs.bossTurnCues('boss');
    cs.executeAction({
      type: 'environment',
      sourceId: 'peter',
      targetId: 'boss',
      environmentId: 'core_youth',
    });
    expect(boss.stats.hp).toBe(380);
    cs.bossTurnCues('boss');
    const r = cs.executeAction({
      type: 'environment',
      sourceId: 'peter',
      targetId: 'boss',
      environmentId: 'core_youth',
    });
    expect(r.message).toContain('SHATTERED');
    expect(cs.isShielded('boss')).toBe(false);
    expect(cs.getSongCores('boss')).toEqual([]);
  });

  it('the wrong core hurts Peter and drains MP', () => {
    const { cs, peter, boss } = fight(choir);
    cs.bossTurnCues('boss');
    cs.executeAction({
      type: 'environment',
      sourceId: 'peter',
      targetId: 'boss',
      environmentId: 'core_war',
    });
    expect(peter.stats.hp).toBe(80);
    expect(peter.stats.mp).toBe(22);
    expect(boss.stats.hp).toBe(500);
  });
});

describe('Dialogue rules — all-of arrays', () => {
  it('needs every item / flag listed', () => {
    const rules = [
      { ifItems: ['red', 'blue', 'yellow'], dialogueId: 'paint' },
      { ifFlags: ['p1', 'p2', 'p3'], dialogueId: 'portrait' },
    ];
    const state = (items: string[], flags: string[]) => ({
      isQuestCompleted: () => false,
      getFlag: (f: string) => flags.includes(f),
      hasItem: (i: string) => items.includes(i),
    });
    expect(pickDialogue('none', rules, state(['red', 'blue'], []))).toBe('none');
    expect(pickDialogue('none', rules, state(['red', 'blue', 'yellow'], []))).toBe('paint');
    expect(pickDialogue('none', rules, state([], ['p1', 'p2', 'p3']))).toBe('portrait');
  });
});
