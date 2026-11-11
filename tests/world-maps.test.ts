import { describe, expect, it } from 'vitest';
import type { MapDatabase, MapDefinition } from '../src/world/MapTypes';
import {
  pickDialogue,
  pointInRect,
  tileCenter,
  validateMapDatabase,
} from '../src/world/MapRegistry';

function map(id: string, extra: Partial<MapDefinition> = {}): MapDefinition {
  return {
    id,
    name: id,
    tilemap: { key: id, path: `${id}.json` },
    tileset: { name: 't', key: 't', path: 't.png' },
    layers: { ground: 'Ground', walls: 'Walls' },
    collision: { fromGid: 4, toGid: 16 },
    bgm: 'ambient',
    spawns: { default: { x: 1, y: 1 }, from_b: { x: 2, y: 2 } },
    ...extra,
  };
}

const refs = {
  dialogueIds: new Set(['d_locked', 'd_talk']),
  questIds: new Set(['q1']),
  enemyIds: new Set(['e1']),
  objectives: new Map([['q1', new Set(['o1'])]]),
};

describe('world maps', () => {
  it('converts tiles to pixel centres and tests zone membership', () => {
    expect(tileCenter({ x: 2, y: 3 })).toEqual({ x: 80, y: 112 });
    const area = { x: 1, y: 1, w: 2, h: 1 };
    expect(pointInRect(32, 32, area)).toBe(true);
    expect(pointInRect(95, 63, area)).toBe(true);
    expect(pointInRect(96, 40, area)).toBe(false);
  });

  it('accepts a consistent two-map world with exits both ways', () => {
    const db: MapDatabase = {
      startMapId: 'a',
      maps: {
        a: map('a', {
          exits: [{ id: 'to_b', area: { x: 0, y: 0, w: 1, h: 1 }, toMap: 'b', toSpawn: 'from_b' }],
        }),
        b: map('b', {
          exits: [
            {
              id: 'to_a',
              area: { x: 0, y: 0, w: 1, h: 1 },
              toMap: 'a',
              toSpawn: 'default',
              requiresFlag: 'f',
              lockedDialogueId: 'd_locked',
            },
          ],
        }),
      },
    };
    expect(validateMapDatabase(db, refs)).toEqual([]);
  });

  it('reports broken references', () => {
    const db: MapDatabase = {
      startMapId: 'missing',
      maps: {
        a: map('a', {
          exits: [{ id: 'x', area: { x: 0, y: 0, w: 1, h: 1 }, toMap: 'a', toSpawn: 'nope' }],
          encounters: [
            { id: 'enc', enemyId: 'ghost', texture: 't', tile: { x: 1, y: 1 }, defeatedFlag: 'f' },
          ],
          triggers: [{ id: 'z', on: 'zone', onceFlag: 'f2', dialogueId: 'unknown' }],
          npcs: [
            {
              id: 'n',
              texture: 't',
              tile: { x: 1, y: 1 },
              name: 'n',
              prompt: 'p',
              radius: 40,
              dialogueId: 'd_talk',
              completeObjective: { questId: 'q1', objectiveId: 'o9' },
            },
          ],
        }),
      },
    };
    const errors = validateMapDatabase(db, refs).join('\n');
    expect(errors).toContain('startMapId');
    expect(errors).toContain('no spawn "nope"');
    expect(errors).toContain('unknown enemy "ghost"');
    expect(errors).toContain('zone trigger needs an area');
    expect(errors).toContain('unknown dialogue "unknown"');
    expect(errors).toContain('unknown objective q1/o9');
  });

  it('picks the first dialogue rule that holds', () => {
    const state = {
      isQuestCompleted: (id: string) => id === 'done',
      getFlag: (f: string) => f === 'on',
    };
    const rules = [
      { ifQuestCompleted: 'not_done', dialogueId: 'a' },
      { ifFlag: 'on', dialogueId: 'b' },
      { ifQuestCompleted: 'done', dialogueId: 'c' },
    ];
    expect(pickDialogue('default', rules, state)).toBe('b');
    expect(pickDialogue('default', [], state)).toBe('default');
  });
});
