import Phaser from 'phaser';
import { Entity } from './Entity';
import { IMovementSystem } from '../systems/movement/IMovementSystem';
import { TopDownMovementSystem } from '../systems/movement/TopDownMovementSystem';
import { IPlayerController } from '../systems/input/IPlayerController';
import { registerPeterAnimations } from '../systems/animation/PeterAnimationConfig';

export interface PlayerConfig {
  speed?: number;
  textureKey?: string;
}

export class Player extends Entity {
  private movementSystem: IMovementSystem;
  private controller: IPlayerController;
  private speed: number;
  private hasAnimations = false;
  private animSuffix = '';

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    controller: IPlayerController,
    movementSystem?: IMovementSystem,
    config?: PlayerConfig,
  ) {
    const initialTexture =
      config?.textureKey ??
      (scene.textures.exists('peter_idle') ? 'peter_idle' : 'player_placeholder');
    super(scene, x, y, initialTexture);

    this.controller = controller;
    this.movementSystem = movementSystem ?? new TopDownMovementSystem();
    this.speed = config?.speed ?? 120;

    // Configure collision physics body
    // Footprint-based 18x14 collision box centered at (7, 16)
    this.sprite.setCollideWorldBounds(true);
    if (this.sprite.body) {
      this.sprite.body.setSize(18, 14);
      this.sprite.body.setOffset(7, 16);
    }

    if (scene.textures.exists('peter_idle') && scene.textures.exists('peter_walk')) {
      registerPeterAnimations(scene);
      this.hasAnimations = true;
      this.sprite.play('peter_idle_down');
    }
  }

  public getController(): IPlayerController {
    return this.controller;
  }

  public getMovementSystem(): IMovementSystem {
    return this.movementSystem;
  }

  public setSpeed(speed: number): void {
    this.speed = speed;
  }

  public getSpeed(): number {
    return this.speed;
  }

  /**
   * Empty-handed (Prologue v3, before the Broken Blade) uses the `peter_*_unarmed` animations when
   * they are loaded; otherwise it falls back to the regular ones.
   */
  public setArmed(armed: boolean): void {
    const unarmedReady = this.sprite.scene.anims.exists('peter_idle_unarmed_down');
    this.animSuffix = armed || !unarmedReady ? '' : '_unarmed';
    if (this.hasAnimations) this.sprite.play(`peter_idle${this.animSuffix}_down`, true);
  }

  public update(): void {
    const direction = this.controller.getMovementVector();
    this.movementSystem.move(this.sprite, direction, this.speed);

    if (this.hasAnimations) {
      const isMoving = direction.x !== 0 || direction.y !== 0;
      const facing = this.movementSystem.getFacing(direction);
      const activeFacing = facing !== 'idle' ? facing : this.movementSystem.getLastFacing();

      if (isMoving) {
        const walkAnim = `peter_walk${this.animSuffix}_${activeFacing}`;
        if (this.sprite.anims.currentAnim?.key !== walkAnim) {
          this.sprite.play(walkAnim, true);
        }
      } else {
        const idleAnim = `peter_idle${this.animSuffix}_${activeFacing}`;
        if (this.sprite.anims.currentAnim?.key !== idleAnim) {
          this.sprite.play(idleAnim, true);
        }
      }
    }

    this.controller.update();
  }
}
