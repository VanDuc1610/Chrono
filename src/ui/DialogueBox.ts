import Phaser from 'phaser';
import { MAX_CHOICES, type DialogueSystem } from '../systems/dialogue/DialogueSystem';
import { createPanel } from './Panel';
import type { Translate } from './Strings';

import { getSettings, TEXT_DELAY_MS } from '../state/Settings';
const MIN_BOX_H = 84;
const PAD_X = 16;
/** Space above the box kept free for the top HUD panels. */
const TOP_MARGIN = 84;

const BODY_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'monospace',
  fontSize: '12px',
  color: '#e4ebf5',
};

/**
 * Dialogue box + flow: typewriter, E/Space to skip or advance, keys 1-4 / click for choices.
 * The box grows upward to fit the whole line and its choices (one per row), so long lines and
 * long choices never overlap. Node effects and endings are handled by the scene through
 * DialogueSystem events.
 */
export class DialogueBox {
  public readonly speakerText: Phaser.GameObjects.Text;
  public readonly bodyText: Phaser.GameObjects.Text;
  private readonly hint: Phaser.GameObjects.Text;
  private readonly container: Phaser.GameObjects.Container;
  private readonly choices: Phaser.GameObjects.Text[] = [];
  /** Off-screen copy of the body style, to measure a whole line before it is typed. */
  private readonly measure: Phaser.GameObjects.Text;
  private bg: Phaser.GameObjects.NineSlice;
  private readonly boxX = 30;
  private readonly boxW: number;
  private typing = false;
  private fullText = '';
  private timer: Phaser.Time.TimerEvent | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly dialogue: DialogueSystem,
    private readonly t: Translate,
    private readonly onClosed: () => void,
  ) {
    const { width } = scene.scale;
    this.boxW = width - 60;
    const wrap = { width: this.boxW - PAD_X * 2 };

    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(200).setVisible(false);
    this.bg = createPanel(scene, this.boxX, 0, this.boxW, MIN_BOX_H);
    this.speakerText = scene.add.text(this.boxX + PAD_X, 0, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#00e1ff',
      fontStyle: 'bold',
    });
    this.bodyText = scene.add.text(this.boxX + PAD_X, 0, '', { ...BODY_STYLE, wordWrap: wrap });
    this.measure = scene.add
      .text(-2000, -2000, '', { ...BODY_STYLE, wordWrap: wrap })
      .setVisible(false);
    this.hint = scene.add
      .text(this.boxX + this.boxW - 14, 0, '', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#7f90b3',
      })
      .setOrigin(1, 1);
    this.container.add([this.bg, this.speakerText, this.bodyText, this.hint]);

    for (let i = 0; i < MAX_CHOICES; i++) {
      const btn = scene.add
        .text(this.boxX + PAD_X + 8, 0, '', {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#ffd666',
          backgroundColor: '#161d30',
          padding: { left: 6, right: 6, top: 3, bottom: 3 },
          wordWrap: { width: this.boxW - PAD_X * 2 - 28 },
        })
        .setInteractive({ useHandCursor: true })
        .setVisible(false);
      btn.on('pointerdown', () => this.select(i));
      btn.on('pointerover', () => btn.setColor('#ffffff'));
      btn.on('pointerout', () => btn.setColor('#ffd666'));
      this.choices.push(btn);
      this.container.add(btn);
    }
    this.layout('', 0);
  }

  public get isTyping(): boolean {
    return this.typing;
  }

  public isOpen(): boolean {
    return this.dialogue.isActive();
  }

  /** Starts a dialogue; returns false if the id is unknown. */
  public open(dialogueId: string): boolean {
    if (!this.dialogue.startDialogue(dialogueId)) return false;
    this.container.setVisible(true);
    this.render();
    return true;
  }

  /** E / Space: finish the line, else advance (choices wait for 1-4). */
  public interact(): void {
    if (this.typing) {
      this.finishTyping();
      return;
    }
    if (this.dialogue.isLastLineOfNode() && this.dialogue.getAvailableResponses().length > 0)
      return;
    if (this.dialogue.advance()) this.render();
    else this.close();
  }

  /** Keys 1-4. */
  public choose(index: number): void {
    if (!this.dialogue.isActive() || this.typing || !this.dialogue.isLastLineOfNode()) return;
    this.select(index);
  }

  public close(): void {
    this.stopTimer();
    this.typing = false;
    this.choices.forEach((c) => c.setVisible(false));
    this.dialogue.close();
    this.container.setVisible(false);
    this.onClosed();
  }

  private select(index: number): void {
    const responses = this.dialogue.getAvailableResponses();
    const picked = responses[index];
    if (!picked) return;
    if (picked.nextDialogueId) this.open(picked.nextDialogueId);
    else this.close();
  }

  private render(): void {
    const node = this.dialogue.getCurrentNode();
    const line = this.dialogue.getCurrentLine();
    if (!node || !line) return;
    this.speakerText.setText(node.speaker);
    this.choices.forEach((c) => c.setVisible(false));
    // The box takes its final size before typing starts, so it does not jump while typing.
    const responses = this.dialogue.isLastLineOfNode() ? this.dialogue.getAvailableResponses() : [];
    responses.slice(0, MAX_CHOICES).forEach((resp, i) => {
      this.choices[i].setText(`[${i + 1}] ${resp.text}`);
    });
    this.layout(line, Math.min(responses.length, MAX_CHOICES));
    this.startTyping(line);
  }

  /** Sizes the box to the whole line plus `choiceCount` choices and places everything in it. */
  private layout(line: string, choiceCount: number): void {
    const { height } = this.scene.scale;
    this.measure.setText(line || ' ');
    const bodyH = Math.max(15, this.measure.height);
    const choiceHs = this.choices.slice(0, choiceCount).map((c) => c.height);
    const choicesH = choiceHs.reduce((a, h) => a + h + 4, 0) + (choiceCount ? 6 : 0);
    const boxH = Phaser.Math.Clamp(9 + 19 + bodyH + choicesH + 20, MIN_BOX_H, height - TOP_MARGIN);
    const boxY = height - boxH - 16;

    this.bg.setPosition(this.boxX, boxY).setSize(this.boxW, boxH);
    this.speakerText.setPosition(this.boxX + PAD_X, boxY + 9);
    this.bodyText.setPosition(this.boxX + PAD_X, boxY + 28);
    let y = boxY + 28 + bodyH + 6;
    this.choices.forEach((c, i) => {
      if (i >= choiceCount) return;
      c.setPosition(this.boxX + PAD_X + 8, y);
      y += choiceHs[i] + 4;
    });
    this.hint.setPosition(this.boxX + this.boxW - 14, boxY + boxH - 6);
  }

  private startTyping(text: string): void {
    this.stopTimer();
    this.fullText = text;
    this.typing = true;
    this.bodyText.setText('');
    this.updateHint();
    // T-96: text speed from the settings; "instant" shows the whole line at once.
    const delay = TEXT_DELAY_MS[getSettings().textSpeed];
    if (delay === 0 || text.length === 0) {
      this.bodyText.setText(text);
      this.typing = false;
      this.onTyped();
      return;
    }
    let shown = 0;
    this.timer = this.scene.time.addEvent({
      delay,
      repeat: text.length - 1,
      callback: () => {
        shown++;
        this.bodyText.setText(text.substring(0, shown));
        if (shown >= text.length) {
          this.typing = false;
          this.onTyped();
        }
      },
    });
  }

  private finishTyping(): void {
    this.stopTimer();
    this.typing = false;
    this.bodyText.setText(this.fullText);
    this.onTyped();
  }

  private onTyped(): void {
    this.updateHint();
    if (!this.dialogue.isLastLineOfNode()) return;
    this.dialogue
      .getAvailableResponses()
      .slice(0, MAX_CHOICES)
      .forEach((_, i) => this.choices[i].setVisible(true));
  }

  private updateHint(): void {
    if (this.typing) {
      this.hint.setText(this.t('dialogue.skip'));
      return;
    }
    const last = this.dialogue.isLastLineOfNode();
    const count = this.dialogue.getAvailableResponses().length;
    this.hint.setText(
      this.t(last ? (count > 0 ? 'dialogue.choose' : 'dialogue.close') : 'dialogue.continue', {
        n: Math.min(count, MAX_CHOICES),
      }),
    );
  }

  private stopTimer(): void {
    this.timer?.destroy();
    this.timer = null;
  }
}
