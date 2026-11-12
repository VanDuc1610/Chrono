import Phaser from 'phaser';
import type { QuestSystem } from '../systems/quest/QuestSystem';
import { createPanel } from './Panel';
import type { Translate } from './Strings';

const WIDTH = 220;
const HEIGHT = 76;
const ROWS = 3;

/** Top-right quest panel: the tracked active quest ([Q] cycles), else the last completed one. */
export class QuestTracker {
  private readonly title: Phaser.GameObjects.Text;
  private readonly rows: Phaser.GameObjects.Text[] = [];
  private tracked = 0;

  constructor(
    scene: Phaser.Scene,
    private readonly quests: QuestSystem,
    t: Translate,
  ) {
    const container = scene.add
      .container(scene.scale.width - WIDTH - 10, 10)
      .setScrollFactor(0)
      .setDepth(90);
    const bg = createPanel(scene, 0, 0, WIDTH, HEIGHT);
    const label = scene.add.text(10, 8, t('quest.label'), {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#00d2ff',
      letterSpacing: 1,
    });
    this.title = scene.add.text(10, 20, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#e4ebf5',
      fontStyle: 'bold',
    });
    container.add([bg, label, this.title]);
    for (let i = 0; i < ROWS; i++) {
      const row = scene.add.text(10, 34 + i * 12, '', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#8b9bb4',
      });
      this.rows.push(row);
      container.add(row);
    }
    this.noneText = t('quest.none');
  }

  private readonly noneText: string;

  /** Shows the next active quest; returns false when there is nothing to cycle. */
  public cycle(): boolean {
    const count = this.quests.getActiveQuests().length;
    if (count < 2) return false;
    this.tracked = (this.tracked + 1) % count;
    this.refresh();
    return true;
  }

  public refresh(): void {
    const active = this.quests.getActiveQuests();
    if (this.tracked >= active.length) this.tracked = 0;
    const quest =
      active[this.tracked] ??
      this.quests
        .getAllQuests()
        .filter((q) => q.stage === 'completed')
        .pop();

    this.rows.forEach((r) => r.setText(''));
    if (!quest) {
      this.title.setText(this.noneText);
      return;
    }
    const done = quest.stage === 'completed';
    const others = active.length > 1 ? `  (+${active.length - 1})` : '';
    fitText(this.title, done ? `✓ ${quest.title}` : `${quest.title}${others}`);
    quest.objectives.forEach((obj, i) => {
      const row = this.rows[i];
      if (!row) return;
      fitText(row, `${obj.completed ? '✓' : '○'} ${obj.description}`);
      row.setColor(obj.completed ? '#48bb78' : '#8b9bb4');
    });
  }
}

/** Sets text, trimming with an ellipsis so it never overflows the panel. */
function fitText(text: Phaser.GameObjects.Text, value: string): void {
  const maxWidth = WIDTH - 20;
  text.setText(value);
  let n = value.length;
  while (text.width > maxWidth && n > 4) {
    n--;
    text.setText(`${value.slice(0, n).trimEnd()}…`);
  }
}
