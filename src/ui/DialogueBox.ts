import Phaser from 'phaser';
import type { DialogueSystem } from '../systems/dialogue/DialogueSystem';
import { createPanel } from './Panel';
import type { Translate } from './Strings';

const TYPE_DELAY_MS = 18;

/**
 * Dialogue box + flow: typewriter, E/Space to skip or advance, keys 1-2 / click for choices.
 * Node effects and endings are handled by the scene through DialogueSystem events.
 */
export class DialogueBox {
  public readonly speakerText: Phaser.GameObjects.Text;
  public readonly bodyText: Phaser.GameObjects.Text;
  private readonly hint: Phaser.GameObjects.Text;
  private readonly container: Phaser.GameObjects.Container;
  private readonly choices: Phaser.GameObjects.Text[] = [];
  private typing = false;
  private fullText = '';
  private timer: Phaser.Time.TimerEvent | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly dialogue: DialogueSystem,
    private readonly t: Translate,
    private readonly onClosed: () => void,
  ) {
    const { width, height } = scene.scale;
    const boxW = width - 60;
    const boxH = 84;
    const boxX = 30;
    const boxY = height - boxH - 16;

    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(200).setVisible(false);
    const bg = createPanel(scene, boxX, boxY, boxW, boxH);
    this.speakerText = scene.add.text(boxX + 16, boxY + 9, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#00e1ff',
      fontStyle: 'bold',
    });
    this.bodyText = scene.add.text(boxX + 16, boxY + 28, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#e4ebf5',
      wordWrap: { width: boxW - 32 },
    });
    this.hint = scene.add
      .text(boxX + boxW - 14, boxY + boxH - 12, '', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#7f90b3',
      })
      .setOrigin(1, 1);
    this.container.add([bg, this.speakerText, this.bodyText, this.hint]);

    for (let i = 0; i < 2; i++) {
      const btn = scene.add
        .text(boxX + 24 + i * 220, boxY + 54, '', {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#ffd666',
          backgroundColor: '#161d30',
          padding: { left: 6, right: 6, top: 3, bottom: 3 },
        })
        .setInteractive({ useHandCursor: true })
        .setVisible(false);
      btn.on('pointerdown', () => this.select(i));
      btn.on('pointerover', () => btn.setColor('#ffffff'));
      btn.on('pointerout', () => btn.setColor('#ffd666'));
      this.choices.push(btn);
      this.container.add(btn);
    }
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

  /** E / Space: finish the line, else advance (choices wait for 1 / 2). */
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

  /** Keys 1 / 2. */
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
    this.startTyping(line);
  }

  private startTyping(text: string): void {
    this.stopTimer();
    this.fullText = text;
    this.typing = true;
    this.bodyText.setText('');
    this.updateHint();
    let shown = 0;
    this.timer = this.scene.time.addEvent({
      delay: TYPE_DELAY_MS,
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
    this.dialogue.getAvailableResponses().forEach((resp, i) => {
      this.choices[i]?.setText(`[${i + 1}] ${resp.text}`).setVisible(true);
    });
  }

  private updateHint(): void {
    if (this.typing) {
      this.hint.setText(this.t('dialogue.skip'));
      return;
    }
    const last = this.dialogue.isLastLineOfNode();
    const hasChoices = this.dialogue.getAvailableResponses().length > 0;
    this.hint.setText(
      this.t(last ? (hasChoices ? 'dialogue.choose' : 'dialogue.close') : 'dialogue.continue'),
    );
  }

  private stopTimer(): void {
    this.timer?.destroy();
    this.timer = null;
  }
}
