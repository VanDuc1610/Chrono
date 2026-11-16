import Phaser from 'phaser';
import type { QuestSystem } from '../systems/quest/QuestSystem';
import { createPanel } from './Panel';
import type { Translate } from './Strings';

const WIDTH = 220;
const HEIGHT = 76;
const ROWS = 3;

/** Registry key: the player folded the quest panel away (J), kept across maps. */
export const QUEST_TRACKER_HIDDEN = 'questTrackerHidden';

/**
 * Top-right quest panel: the tracked active quest ([Q] cycles), else the last completed one.
 * [J] folds it into a small tab so it does not cover the map.
 */
export class QuestTracker {
  private readonly title: Phaser.GameObjects.Text;
  private readonly rows: Phaser.GameObjects.Text[] = [];
  private tracked = 0;
  private readonly container: Phaser.GameObjects.Container;
  private readonly tab: Phaser.GameObjects.Text;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly quests: QuestSystem,
    t: Translate,
  ) {
    const container = (this.container = scene.add
      .container(scene.scale.width - WIDTH - 10, 10)
      .setScrollFactor(0)
      .setDepth(90));
    this.tab = scene.add
      .text(scene.scale.width - 10, 10, t('quest.tab'), {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#00d2ff',
        backgroundColor: '#07080fcc',
        padding: { left: 5, right: 5, top: 3, bottom: 3 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(90);
    const bg = createPanel(scene, 0, 0, WIDTH, HEIGHT);
    this.labels = {
      main: t('quest.labelMain'),
      side: t('quest.labelSide'),
      done: t('quest.label'),
    };
    const label = (this.label = scene.add.text(10, 8, this.labels.done, {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#00d2ff',
      letterSpacing: 1,
    }));
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
    this.applyHidden();
  }

  public get hidden(): boolean {
    return !!this.scene.registry.get(QUEST_TRACKER_HIDDEN);
  }

  /** J: fold the panel away or bring it back. Returns true when it is now shown. */
  public toggle(): boolean {
    this.scene.registry.set(QUEST_TRACKER_HIDDEN, !this.hidden);
    this.applyHidden();
    return !this.hidden;
  }

  private applyHidden(): void {
    this.container.setVisible(!this.hidden);
    this.tab.setVisible(this.hidden);
  }

  private readonly noneText: string;
  private readonly label: Phaser.GameObjects.Text;
  private readonly labels: { main: string; side: string; done: string };

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
      this.label.setText(this.labels.done).setColor('#00d2ff');
      this.title.setText(this.noneText);
      return;
    }
    const done = quest.stage === 'completed';
    const side = quest.kind === 'side';
    this.label
      .setText(done ? this.labels.done : side ? this.labels.side : this.labels.main)
      .setColor(!done && !side ? '#ffd666' : '#00d2ff');
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
