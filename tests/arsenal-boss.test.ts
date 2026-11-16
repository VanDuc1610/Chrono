import { describe, expect, it } from 'vitest';
import itemsJson from '../public/assets/data/items.json';
import questsJson from '../public/assets/data/quests.json';
import enemiesJson from '../public/assets/data/enemies.json';
import playerJson from '../public/assets/data/player.json';
import bossesJson from '../public/assets/data/bosses.json';
import type { GameDatabase, PlayerDatabase } from '../src/state/GameDatabase';
import { GameSession } from '../src/state/GameSession';
import type { InventoryDatabase } from '../src/systems/inventory/InventoryTypes';
import type { QuestDatabase } from '../src/systems/quest/QuestTypes';
import type { EnemyDatabase } from '../src/systems/combat/CombatTypes';
import type { ISaveData } from '../src/systems/save/SaveTypes';
import {
  meleeShape,
  segmentHits,
  shotAngles,
  rangedAttack,
} from '../src/systems/action/WeaponRules';
import {
  gateBlow,
  inBeam,
  inFrontArc,
  onRing,
  phaseIndex,
  pickMove,
  targetReady,
} from '../src/systems/boss/BossRules';
import type { BossDatabase, BossProfile } from '../src/systems/boss/BossTypes';

const db = (): GameDatabase => ({
  items: itemsJson as unknown as InventoryDatabase,
  quests: questsJson as unknown as QuestDatabase,
  enemies: enemiesJson as unknown as EnemyDatabase,
  player: playerJson as unknown as PlayerDatabase,
});
const bosses = (bossesJson as unknown as BossDatabase).bosses;
const items = (itemsJson as unknown as InventoryDatabase).items;
const enemies = (enemiesJson as unknown as EnemyDatabase).enemies;

describe('T-84 arsenal data', () => {
  it('every melee weapon has a family, every charm a slot, every ranged weapon a sane shot', () => {
    for (const i of items.filter((x) => x.type === 'weapon')) {
      if (i.ranged) {
        expect(i.ranged.fireMs).toBeGreaterThan(100);
        expect(i.ranged.range).toBeGreaterThan(100);
      } else expect(['sword', 'rapier', 'spear', 'heavy']).toContain(i.melee);
    }
    for (const i of items.filter((x) => x.type === 'charm'))
      expect(['armor', 'accessory']).toContain(i.slot);
    expect(items.filter((x) => x.ranged).length).toBeGreaterThanOrEqual(5);
  });

  it('new gear drops from a boss', () => {
    for (const id of ['gear_sling', 'oilcloth_coat', 'astral_longbow'])
      expect(enemies.some((e) => e.lootTable.some((l) => l.itemId === id))).toBe(true);
  });
});

describe('T-84 four gear slots', () => {
  it('routes items to weapon / ranged / armor / accessory and keeps ranged attack off the slash', () => {
    const s = GameSession.newGame(db());
    const base = s.getStats().attack;
    s.applyDialogueEffects({
      grantItems: [
        { itemId: 'broken_blade', quantity: 1 },
        { itemId: 'gear_sling', quantity: 1 },
        { itemId: 'oilcloth_coat', quantity: 1 },
        { itemId: 'sea_glass_charm', quantity: 1 },
      ],
    });
    expect(s.equipment).toEqual({
      weapon: 'broken_blade',
      ranged: 'gear_sling',
      armor: 'oilcloth_coat',
      accessory: 'sea_glass_charm',
    });
    expect(s.getStats().attack).toBe(base + 2); // the blade's +2, not the sling's +3
    expect(s.rangedProfile?.class).toBe('sling');
    expect(s.rangedProfile?.attack).toBe(3);
    expect(s.meleeClass).toBe('sword');
  });

  it('moves a 0.4 save charm into its new slot', () => {
    const s = GameSession.newGame(db());
    s.applyDialogueEffects({ grantItems: [{ itemId: 'valiant_crest_cuirass', quantity: 1 }] });
    const save = s.toSaveData({ mapId: 'map_peters_room', x: 0, y: 0 });
    const old = {
      ...save,
      equipment: { weapon: null, charm: 'valiant_crest_cuirass' },
    } as ISaveData;
    const back = GameSession.fromSave(db(), old);
    expect(back.equipment.armor).toBe('valiant_crest_cuirass');
    expect(back.equipment.accessory).toBeNull();
  });
});

describe('T-84 weapon rules', () => {
  it('melee families differ in shape', () => {
    expect(meleeShape('spear').arcDeg).toBeLessThan(meleeShape('sword').arcDeg);
    expect(meleeShape('heavy').arcDeg).toBeGreaterThan(meleeShape('sword').arcDeg);
    expect(meleeShape('unknown')).toEqual(meleeShape('sword'));
  });

  it('spreads shots and tests swept hits', () => {
    expect(shotAngles(0, {})).toEqual([0]);
    const fan = shotAngles(0, { shots: 3, spreadDeg: 20 });
    expect(fan).toHaveLength(3);
    expect(fan[1]).toBeCloseTo(0);
    expect(segmentHits({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 5 }, 6)).toBe(true);
    expect(segmentHits({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 20 }, 6)).toBe(false);
    expect(rangedAttack(20, 2, 3)).toBe(21);
  });
});

describe('T-84 boss rules', () => {
  const sentinel = bosses.find((b) => b.id === 'boss_drowned_sentinel') as BossProfile;

  it('every boss profile matches an enemy and only uses its own moves', () => {
    for (const b of bosses) {
      expect(enemies.some((e) => e.id === b.id)).toBe(true);
      for (const p of b.phases) for (const m of p.moves) expect(b.moves[m]).toBeDefined();
    }
  });

  it('the Sentinel enrages only once its armor is broken', () => {
    expect(phaseIndex(sentinel, 0.3, false)).toBe(0);
    expect(phaseIndex(sentinel, 0.45, true)).toBe(1);
  });

  it('never repeats a move twice when it has a choice', () => {
    const phase = sentinel.phases[0];
    for (let i = 0; i < 20; i++)
      expect(pickMove(phase, 'tidal_crush', Math.random)).not.toBe('tidal_crush');
  });

  it('armor cuts damage and heals the boss back at its floor', () => {
    const state = {
      hp: 100,
      maxHp: 120,
      armorBroken: false,
      stunned: false,
      facing: 0,
      pos: { x: 0, y: 0 },
      nowMs: 0,
    };
    expect(gateBlow(sentinel.defense, state, 30, { x: 10, y: 0 })).toEqual({
      kind: 'hit',
      damage: 6,
    });
    const low = gateBlow(sentinel.defense, { ...state, hp: 8 }, 30, { x: 10, y: 0 });
    expect(low.kind === 'hit' && low.recovered).toBe(true);
    if (low.kind === 'hit') expect(8 - low.damage).toBe(72); // back to 60 %
    expect(gateBlow(sentinel.defense, { ...state, armorBroken: true }, 30, { x: 1, y: 0 })).toEqual(
      {
        kind: 'hit',
        damage: 30,
      },
    );
  });

  it('front guard, stun-only and reflect defences', () => {
    const base = {
      hp: 100,
      maxHp: 100,
      armorBroken: true,
      stunned: false,
      facing: 0,
      pos: { x: 0, y: 0 },
      nowMs: 0,
    };
    expect(gateBlow({ frontGuardDeg: 120 }, base, 10, { x: 10, y: 0 }).kind).toBe('blocked');
    expect(gateBlow({ frontGuardDeg: 120 }, base, 10, { x: -10, y: 0 }).kind).toBe('hit');
    expect(gateBlow({ stunnedOnly: true }, base, 10, { x: 1, y: 0 }).kind).toBe('blocked');
    expect(
      gateBlow({ stunnedOnly: true }, { ...base, stunned: true }, 10, { x: 1, y: 0 }).kind,
    ).toBe('hit');
    expect(
      gateBlow({ reflect: { everyMs: 1000, glowMs: 300, pct: 0.5 } }, base, 10, { x: 1, y: 0 }),
    ).toEqual({
      kind: 'reflected',
      back: 5,
    });
    expect(inFrontArc(Math.PI, { x: 0, y: 0 }, { x: -5, y: 0 }, 90)).toBe(true);
  });

  it('lens order: left stuns, right needs left done and the boss stunned', () => {
    const [left, right] = sentinel.defense.targets!;
    const done = new Set<string>();
    expect(targetReady(right, done, true)).toBe('order');
    expect(targetReady(left, done, false)).toBe('ok');
    done.add(left.id);
    expect(targetReady(right, done, false)).toBe('unstunned');
    expect(targetReady(right, done, true)).toBe('ok');
  });

  it('ring gap and beam geometry', () => {
    const c = { x: 0, y: 0 };
    expect(onRing(c, 100, 10, { x: 100, y: 0 })).toBe(true);
    expect(onRing(c, 100, 10, { x: 100, y: 0 }, { angle: 0, deg: 40 })).toBe(false);
    expect(onRing(c, 100, 10, { x: 0, y: 100 }, { angle: 0, deg: 40 })).toBe(true);
    expect(inBeam(c, 0, 300, 20, { x: 150, y: 5 })).toBe(true);
    expect(inBeam(c, 0, 300, 20, { x: -10, y: 0 })).toBe(false);
  });
});
