import { describe, expect, it } from 'vitest';
import itemsJson from '../public/assets/data/items.json';
import questsJson from '../public/assets/data/quests.json';
import enemiesJson from '../public/assets/data/enemies.json';
import playerJson from '../public/assets/data/player.json';
import { FLAGS, GameSession } from '../src/state/GameSession';
import type { GameDatabase } from '../src/state/GameDatabase';
import { conditionHolds, pickDialogue, validateMapDatabase } from '../src/world/MapRegistry';
import type { MapDatabase, MapDefinition } from '../src/world/MapTypes';

const db = {
  items: itemsJson,
  quests: questsJson,
  enemies: enemiesJson,
  player: playerJson,
} as unknown as GameDatabase;

describe('Prologue v3: combat commands unlock with the story', () => {
  it('a new game cannot Attack or use the Skill until the flags are set', () => {
    const s = GameSession.newGame(db);
    expect(s.isCommandUnlocked('attack')).toBe(false);
    expect(s.isCommandUnlocked('skill')).toBe(false);
    expect(s.isCommandUnlocked('defend')).toBe(true);
    expect(s.isCommandUnlocked('item')).toBe(true);
    s.setFlag(FLAGS.hasBlade);
    expect(s.isCommandUnlocked('attack')).toBe(true);
    s.setFlag(FLAGS.temporalSight);
    expect(s.isCommandUnlocked('skill')).toBe(true);
  });

  it('saves from before v3 keep the blade and the skill; v3 saves do not gain them', () => {
    const fresh = GameSession.newGame(db);
    const old = { ...fresh.toSaveData({ mapId: 'map_peters_room', x: 0, y: 0 }), version: '0.2.0' };
    const migrated = GameSession.fromSave(db, old);
    expect(migrated.getFlag(FLAGS.hasBlade)).toBe(true);
    expect(migrated.getFlag(FLAGS.temporalSight)).toBe(true);

    const current = fresh.toSaveData({ mapId: 'map_peters_room', x: 0, y: 0 });
    const loaded = GameSession.fromSave(db, current);
    expect(loaded.getFlag(FLAGS.hasBlade)).toBe(false);
  });
});

describe('Prologue v3: flag-driven world', () => {
  const flags = new Set(['time_frozen']);
  const getFlag = (f: string) => flags.has(f);

  it('conditions combine a required flag and an excluding flag', () => {
    expect(conditionHolds(undefined, getFlag)).toBe(true);
    expect(conditionHolds({ flag: 'time_frozen' }, getFlag)).toBe(true);
    expect(conditionHolds({ flag: 'time_frozen', unlessFlag: 'time_restored' }, getFlag)).toBe(
      true,
    );
    expect(conditionHolds({ unlessFlag: 'time_frozen' }, getFlag)).toBe(false);
  });

  it('dialogue rules honour unlessFlag', () => {
    const state = { isQuestCompleted: () => false, getFlag };
    const rules = [
      { ifFlag: 'time_frozen', unlessFlag: 'time_restored', dialogueId: 'frozen' },
      { ifFlag: 'time_restored', dialogueId: 'after' },
    ];
    expect(pickDialogue('normal', rules, state)).toBe('frozen');
    flags.add('time_restored');
    expect(pickDialogue('normal', rules, state)).toBe('after');
    flags.delete('time_restored');
  });

  it('validation checks trigger encounters and interactable dialogue rules', () => {
    const map: MapDefinition = {
      id: 'm',
      name: 'm',
      tilemap: { key: 'm', path: 'm.json' },
      tileset: { name: 't', key: 't', path: 't.png' },
      layers: { ground: 'Ground', walls: 'Walls' },
      collision: { fromGid: 1, toGid: 2 },
      bgm: 'ambient',
      spawns: { default: { x: 1, y: 1 } },
      interactables: [
        {
          id: 'i',
          tile: { x: 1, y: 1 },
          radius: 40,
          prompt: 'p',
          dialogueId: 'known',
          dialogueRules: [{ ifFlag: 'f', dialogueId: 'missing_rule' }],
        },
      ],
      triggers: [{ id: 't', on: 'arrive', onceFlag: 'o', encounterId: 'no_such_encounter' }],
    };
    const errors = validateMapDatabase({ startMapId: 'm', maps: { m: map } } as MapDatabase, {
      dialogueIds: new Set(['known']),
      questIds: new Set(),
      enemyIds: new Set(),
      objectives: new Map(),
    }).join('\n');
    expect(errors).toContain('unknown dialogue "missing_rule"');
    expect(errors).toContain('unknown encounter "no_such_encounter"');
  });
});
