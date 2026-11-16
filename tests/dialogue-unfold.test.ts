import { describe, expect, it } from 'vitest';
import dialogueJson from '../public/assets/data/dialogue.json';
import { DialogueSystem } from '../src/systems/dialogue/DialogueSystem';
import type { DialogueDatabase } from '../src/systems/dialogue/DialogueTypes';

/** "Xem các ... khác" chains show every option at once (owner request, 2026-11-16). */
function at(id: string): DialogueSystem {
  const d = new DialogueSystem();
  d.loadDatabase(dialogueJson as unknown as DialogueDatabase);
  d.startDialogue(id);
  return d;
}
const texts = (d: DialogueSystem): string[] => d.getAvailableResponses().map((r) => r.text);

describe('dialogue choice chains unfold', () => {
  it('Chapter 2 tablet: the four lines at once', () => {
    const d = at('ch2_tablet_choose_a');
    expect(texts(d)).toEqual(['Gọt dòng 1', 'Gọt dòng 2', 'Gọt dòng 3', 'Gọt dòng 4']);
    expect(d.selectOption(2)).toBe(true);
    expect(d.getCurrentNode()?.lines[0]).toContain('dòng thứ ba');
  });

  it('Chapter 3 console: the four beasts at once', () => {
    expect(texts(at('ch3_console_choose_a'))).toHaveLength(4);
    const d = at('ch3_console_choose_a');
    const wolf = texts(d).findIndex((t) => t.includes('Dạ Lang'));
    d.selectOption(wolf);
    expect(d.getCurrentNode()).toBe(
      (dialogueJson as unknown as DialogueDatabase).dialogues.ch3_censorship_success,
    );
  });

  it('Chapter 4 scales: the three sacks at once; ordinary choices are untouched', () => {
    expect(texts(at('ch4_scale_left_menu'))).toHaveLength(3);
    expect(texts(at('ch2_tablet_inspect'))).toEqual([
      'Dùng Bút Khắc gọt dòng chữ',
      'Xem lại tài liệu',
    ]);
  });
});
