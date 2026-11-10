import Phaser from 'phaser';
import { IMovementSystem, MovementDirection } from './IMovementSystem';

export class TopDownMovementSystem implements IMovementSystem {
  private lastFacing: 'up' | 'down' | 'left' | 'right' = 'down';

  public move(target: Phaser.Physics.Arcade.Sprite, direction: MovementDirection, speed: number): void {
    if (!target || !target.body) return;

    if (direction.x === 0 && direction.y === 0) {
      this.stop(target);
      return;
    }

    // Normalize diagonal movement to maintain consistent speed
    let vx = direction.x;
    let vy = direction.y;
    const len = Math.hypot(vx, vy);

    if (len > 0) {
      vx = (vx / len) * speed;
      vy = (vy / len) * speed;
    }

    target.setVelocity(vx, vy);

    const facing = this.getFacing(direction);
    if (facing !== 'idle') {
      this.lastFacing = facing;
    }
  }

  public stop(target: Phaser.Physics.Arcade.Sprite): void {
    if (target && target.body) {
      target.setVelocity(0, 0);
    }
  }

  public getFacing(direction: MovementDirection): 'up' | 'down' | 'left' | 'right' | 'idle' {
    if (direction.x === 0 && direction.y === 0) {
      return 'idle';
    }
    // Determine dominant axis
    if (Math.abs(direction.x) > Math.abs(direction.y)) {
      return direction.x > 0 ? 'right' : 'left';
    } else {
      return direction.y > 0 ? 'down' : 'up';
    }
  }

  public getLastFacing(): 'up' | 'down' | 'left' | 'right' {
    return this.lastFacing;
  }
}

