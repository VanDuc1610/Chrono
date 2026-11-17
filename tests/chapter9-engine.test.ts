import { describe, expect, it, vi } from 'vitest';
import stringsJson from '../public/assets/data/strings.json';

// The ending resolver is pure. Only the scene base needs a browser-free stand-in on import.
vi.mock('phaser', () => ({ default: { Scene: class {} } }));
import { chapter9EndingKeys } from '../src/scenes/PrologueEndScene';

describe('Chapter 9 ending cards', () => {
  it.each([
    ['order', 'Trật Tự Vĩnh Cửu'],
    ['unbound', 'Vĩnh Hằng Bất Tận'],
    ['true', 'Chúa Tể Thời Gian Cuối Cùng'],
    ['returned_page', 'Trang Giấy Trở Về'],
  ])('routes the %s flag to its localized title and closing line', (ending, title) => {
    const keys = chapter9EndingKeys((flag) => flag === `ch9_ending_${ending}`);
    const table: Record<string, string> = stringsJson.strings;
    expect(keys).toEqual({
      title: `ending.ch9.${ending}.title`,
      closing: `ending.ch9.${ending}.closing`,
    });
    expect(table[keys.title]).toBe(title);
    expect(table[keys.closing].length).toBeGreaterThan(30);
    expect(table['ending.ch9.end']).toBe('Hết');
  });

  it('uses a neutral default with no ending flag and resolves every call afresh', () => {
    expect(chapter9EndingKeys(() => false)).toEqual({
      title: 'ending.ch9.default.title',
      closing: 'ending.ch9.default.closing',
    });
    expect(chapter9EndingKeys((f) => f === 'ch9_ending_true').title).toBe('ending.ch9.true.title');
    expect(chapter9EndingKeys(() => false).title).toBe('ending.ch9.default.title');
  });

  it('has deterministic priority for contradictory flags', () => {
    expect(chapter9EndingKeys(() => true).title).toBe('ending.ch9.order.title');
  });
});
