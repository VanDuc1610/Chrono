import { describe, expect, it } from 'vitest';
import { isValidSaveData } from '../src/systems/save/SaveSystem';

describe('SaveSystem – isValidSaveData', () => {
  const validSave = {
    version: '0.2.0',
    timestamp: 1700000000000,
    playtimeSeconds: 120,
    player: {
      name: 'Peter',
      level: 2,
      exp: 50,
      hp: 58,
      maxHp: 58,
      position: { mapId: 'prologue_sanctuary', x: 384, y: 320 },
    },
    inventory: [{ itemId: 'chrono_shard_minor', quantity: 2 }],
    quests: [],
    flags: { isShadeDefeated: true },
  };

  it('accepts a valid save object', () => {
    expect(isValidSaveData(validSave)).toBe(true);
  });

  it('rejects null or non-object values', () => {
    expect(isValidSaveData(null)).toBe(false);
    expect(isValidSaveData(undefined)).toBe(false);
    expect(isValidSaveData('corrupt')).toBe(false);
  });

  it('rejects saves from an incompatible major version', () => {
    expect(isValidSaveData({ ...validSave, version: '1.0.0' })).toBe(false);
    expect(isValidSaveData({ ...validSave, version: '2.1.0' })).toBe(false);
  });

  it('rejects saves with a missing or malformed player block', () => {
    expect(isValidSaveData({ ...validSave, player: undefined })).toBe(false);
    expect(isValidSaveData({ ...validSave, player: null })).toBe(false);
  });

  it('rejects saves containing negative or zero item quantities', () => {
    expect(
      isValidSaveData({
        ...validSave,
        inventory: [{ itemId: 'chrono_shard_minor', quantity: -1 }],
      }),
    ).toBe(false);
    expect(
      isValidSaveData({
        ...validSave,
        inventory: [{ itemId: 'chrono_shard_minor', quantity: 0 }],
      }),
    ).toBe(false);
  });
});
