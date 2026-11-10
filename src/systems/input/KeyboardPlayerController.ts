import Phaser from 'phaser';
import { IPlayerController, ControllerActions } from './IPlayerController';
import { MovementDirection } from '../movement/IMovementSystem';

export class KeyboardPlayerController implements IPlayerController {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyEscape!: Phaser.Input.Keyboard.Key;

  private enabled = true;

  constructor(scene: Phaser.Scene) {
    if (!scene.input || !scene.input.keyboard) {
      throw new Error('Keyboard input is unavailable in this scene.');
    }

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyE = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyEscape = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public getMovementVector(): MovementDirection {
    if (!this.enabled) {
      return { x: 0, y: 0 };
    }

    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.keyA.isDown) {
      dx -= 1;
    }
    if (this.cursors.right.isDown || this.keyD.isDown) {
      dx += 1;
    }
    if (this.cursors.up.isDown || this.keyW.isDown) {
      dy -= 1;
    }
    if (this.cursors.down.isDown || this.keyS.isDown) {
      dy += 1;
    }

    return { x: dx, y: dy };
  }

  public getActions(): ControllerActions {
    if (!this.enabled) {
      return { interact: false, cancel: false, menu: false, actionPressed: false };
    }

    const interactJustDown =
      Phaser.Input.Keyboard.JustDown(this.keyE) ||
      Phaser.Input.Keyboard.JustDown(this.keySpace);

    const cancelJustDown = Phaser.Input.Keyboard.JustDown(this.keyEscape);
    const menuJustDown = Phaser.Input.Keyboard.JustDown(this.keyEscape);

    return {
      interact: interactJustDown,
      cancel: cancelJustDown,
      menu: menuJustDown,
      actionPressed: interactJustDown || cancelJustDown,
    };
  }

  public update(): void {
    // Reset any one-shot trigger flags
  }
}
