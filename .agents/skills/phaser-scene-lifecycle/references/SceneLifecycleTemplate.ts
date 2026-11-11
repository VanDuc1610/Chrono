import Phaser from 'phaser';

export class SceneLifecycleTemplate extends Phaser.Scene {
  private isTransitioning = false;
  private customTimer: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super({ key: 'SceneLifecycleTemplate' });
  }

  public init(): void {
    // 1. Reset all transient state on every entry
    this.isTransitioning = false;
    this.customTimer = null;
  }

  public create(): void {
    // 2. Register SHUTDOWN cleanup immediately
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.teardown();
    });

    // 3. Setup input listeners
    if (this.input.keyboard) {
      const esc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
      esc.on('down', () => this.handleExit());
    }
  }

  private handleExit(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('NextScene');
    });
  }

  private teardown(): void {
    if (this.customTimer) {
      this.customTimer.destroy();
      this.customTimer = null;
    }
    this.tweens.killAll();
    this.input.keyboard?.removeAllListeners();
  }
}
