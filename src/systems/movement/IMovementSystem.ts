import Phaser from 'phaser';

export interface MovementDirection {
  x: number;
  y: number;
}

export interface IMovementSystem {
  /**
   * Applies movement vector to the entity target.
   * @param target Phaser Arcade Sprite or Physics Body
   * @param direction Normalized movement vector
   * @param speed Units per second
   */
  move(target: Phaser.Physics.Arcade.Sprite, direction: MovementDirection, speed: number): void;

  /**
   * Immediately halts movement for the target.
   */
  stop(target: Phaser.Physics.Arcade.Sprite): void;

  /**
   * Facing direction of the entity.
   */
  getFacing(direction: MovementDirection): 'up' | 'down' | 'left' | 'right' | 'idle';
}

