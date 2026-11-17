import { describe, expect, it } from 'vitest';
import { pickDialogue } from '../src/world/MapRegistry';

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
