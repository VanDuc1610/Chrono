import Phaser from 'phaser';

export abstract class Entity {
  protected scene: Phaser.Scene;
  public sprite: Phaser.Physics.Arcade.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, texture, frame);
  }

  public get x(): number {
    return this.sprite.x;
  }

  public get y(): number {
    return this.sprite.y;
  }

  public setPosition(x: number, y: number): this {
    this.sprite.setPosition(x, y);
    return this;
  }

  public destroy(): void {
    this.sprite.destroy();
  }

  public abstract update(time: number, delta: number): void;
}
