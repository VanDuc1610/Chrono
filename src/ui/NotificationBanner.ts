import Phaser from 'phaser';
import { createPanel } from './Panel';

const WIDTH = 320;
const HEIGHT = 44;
const HIDDEN_Y = -54;

/**
 * Top-centre banner. Banners are queued and play one after another, so back-to-back events
 * (QUEST COMPLETED then NEW QUEST) stay readable.
 */
export class NotificationBanner {
  private readonly container: Phaser.GameObjects.Container;
  private readonly title: Phaser.GameObjects.Text;
  private readonly subtitle: Phaser.GameObjects.Text;
  private queue: { title: string; subtitle: string }[] = [];
  private showing = false;

  constructor(private readonly scene: Phaser.Scene) {
    const { width } = scene.scale;
    this.container = scene.add
      .container(width / 2 - WIDTH / 2, HIDDEN_Y)
      .setScrollFactor(0)
      .setDepth(300)
      .setVisible(false);
    const bg = createPanel(scene, 0, 0, WIDTH, HEIGHT);
    this.title = scene.add
      .text(WIDTH / 2, 9, '', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#00e1ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0);
    this.subtitle = scene.add
      .text(WIDTH / 2, 23, '', { fontFamily: 'monospace', fontSize: '10px', color: '#cdd7eb' })
      .setOrigin(0.5, 0);
    this.container.add([bg, this.title, this.subtitle]);
  }

  public show(title: string, subtitle: string): void {
    this.queue.push({ title, subtitle });
    if (!this.showing) this.next();
  }

  private next(): void {
    const item = this.queue.shift();
    if (!item) {
      this.showing = false;
      return;
    }
    this.showing = true;
    this.title.setText(item.title);
    this.subtitle.setText(item.subtitle);
    this.container.setY(HIDDEN_Y).setVisible(true);

    this.scene.tweens.add({
      targets: this.container,
      y: 12,
      duration: 350,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Shorter hold when more banners are waiting.
        const holdMs = this.queue.length > 0 ? 1500 : 2400;
        this.scene.time.delayedCall(holdMs, () => {
          this.scene.tweens.add({
            targets: this.container,
            y: HIDDEN_Y,
            duration: 300,
            ease: 'Sine.easeIn',
            onComplete: () => {
              this.container.setVisible(false);
              this.next();
            },
          });
        });
      },
    });
  }
}
