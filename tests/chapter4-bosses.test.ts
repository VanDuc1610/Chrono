import { describe, expect, it } from 'vitest';
import enemiesJson from '../public/assets/data/enemies.json';
import playerJson from '../public/assets/data/player.json';
import { dialFlags, dialIndex, readScale } from '../src/world/PuzzleRules';

describe('Chapter 4 puzzles and progression', () => {
  it('a dial keeps exactly one value flag on', () => {
    const values = [
      { key: 'n', label: 'Bắc' },
      { key: 'ne', label: 'Đông Bắc' },
    ];
    const flags = dialFlags('dial_dir', values, 1);
    expect(flags).toEqual({ dial_dir_n: false, dial_dir_ne: true });
    expect(dialIndex('dial_dir', values, (f) => flags[f] === true)).toBe(1);
    expect(dialIndex('dial_dir', values, () => false)).toBe(0);
  });

  it('the hydraulic scale: 25/25 balances, a pan over 35 bursts, and weights stay hidden', () => {
    const rules = {
      weights: { sack_grain: 10, sack_herbs: 5, sack_sulfur: 20 },
      balanceAt: 25,
      breakAbove: 35,
    };
    expect(
      readScale(rules, {
        left: ['sack_sulfur', 'sack_herbs'],
        right: ['sack_grain', 'sack_grain', 'sack_herbs'],
      }),
    ).toBe('balanced');
    expect(readScale(rules, { left: ['sack_sulfur', 'sack_sulfur'], right: [] })).toBe('overload');
    expect(readScale(rules, { left: ['sack_grain'], right: ['sack_grain'] })).toBe('even');
    expect(readScale(rules, { left: ['sack_herbs'], right: ['sack_grain'] })).toBe('right');
  });

  it('the level curve reaches 18, capped at 18 until the Finality seal', () => {
    expect(playerJson.player.expThresholds.length).toBeGreaterThanOrEqual(18);
    expect(playerJson.player.chapterLevelCaps).toContainEqual({
      untilFlag: 'finality_seal_restored',
      cap: 18,
    });
  });
});

describe('Battle healing item', () => {
  it('uses the weakest item that covers the missing HP, never the full draught first', async () => {
    const { GameSession } = await import('../src/state/GameSession');
    const itemsJson = (await import('../public/assets/data/items.json')).default;
    const questsJson = (await import('../public/assets/data/quests.json')).default;
    const s = GameSession.newGame({
      items: itemsJson as never,
      quests: questsJson as never,
      enemies: enemiesJson as never,
      player: playerJson as never,
    });
    s.inventory.addItem('refined_chrono_shard', 2);
    s.inventory.addItem('phoenix_draught', 1);
    expect(s.pickCombatItem(20)).toBe('chrono_shard_minor');
    expect(s.pickCombatItem(100)).toBe('refined_chrono_shard');
    expect(s.pickCombatItem(500)).toBe('refined_chrono_shard');
    s.inventory.removeItem('refined_chrono_shard', 2);
    s.inventory.removeItem('chrono_shard_minor', s.inventory.getItemCount('chrono_shard_minor'));
    expect(s.pickCombatItem(500)).toBe('phoenix_draught');
  });
});
