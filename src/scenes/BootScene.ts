import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  public init(): void {
    // Engine initialization hooks
  }

  public preload(): void {
    // Minimal assets required for PreloadScene loading screen
  }

  public create(): void {
    // T-91: canvas text only uses a web font once it has loaded; wait for VT323 (Vietnamese glyphs
    // included), but never longer than 2 s — the fallback monospace still works.
    const ready = document.fonts
      ? Promise.all([
          document.fonts.load('16px "VT323"'),
          document.fonts.load('16px "VT323"', 'Tiếng Việt ắằẳẵặ'),
        ])
      : Promise.resolve();
    const timeout = new Promise((resolve) => setTimeout(resolve, 2000));
    void Promise.race([ready, timeout]).then(() => this.scene.start('PreloadScene'));
  }
}
