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
    this.scene.start('PreloadScene');
  }
}

