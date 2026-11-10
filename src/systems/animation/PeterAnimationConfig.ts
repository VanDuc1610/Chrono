import Phaser from 'phaser';

export type CardinalDirection = 'down' | 'up' | 'left' | 'right';

export interface IAnimationSpec {
  keyPrefix: string;
  textureKey: string;
  framesPerDirection: number;
  frameRate: number;
  repeat: number; // -1 for infinite loop, 0 for play-once
}

export const PETER_ANIMATION_SPECS: Record<string, IAnimationSpec> = {
  idle: {
    keyPrefix: 'peter_idle',
    textureKey: 'peter_idle',
    framesPerDirection: 4,
    frameRate: 5,
    repeat: -1,
  },
  walk: {
    keyPrefix: 'peter_walk',
    textureKey: 'peter_walk',
    framesPerDirection: 6,
    frameRate: 9,
    repeat: -1,
  },
  run: {
    keyPrefix: 'peter_run',
    textureKey: 'peter_run',
    framesPerDirection: 6,
    frameRate: 12,
    repeat: -1,
  },
  attack: {
    keyPrefix: 'peter_attack',
    textureKey: 'peter_attack',
    framesPerDirection: 6,
    frameRate: 12,
    repeat: 0,
  },
  hurt: {
    keyPrefix: 'peter_hurt',
    textureKey: 'peter_hurt',
    framesPerDirection: 2,
    frameRate: 10,
    repeat: 0,
  },
  temporal_sight: {
    keyPrefix: 'peter_temporal_sight',
    textureKey: 'peter_temporal_sight',
    framesPerDirection: 4,
    frameRate: 6,
    repeat: -1,
  },
};

const DIRECTIONS: CardinalDirection[] = ['down', 'up', 'left', 'right'];

/**
 * Registers all user-approved Peter animations in Phaser AnimationManager.
 * Ensures strict frame alignment:
 * - Row 0: down
 * - Row 1: up
 * - Row 2: left
 * - Row 3: right
 */
export function registerPeterAnimations(scene: Phaser.Scene): void {
  for (const spec of Object.values(PETER_ANIMATION_SPECS)) {
    if (!scene.textures.exists(spec.textureKey)) {
      continue;
    }

    DIRECTIONS.forEach((dir, rowIndex) => {
      const animKey = `${spec.keyPrefix}_${dir}`;
      if (!scene.anims.exists(animKey)) {
        scene.anims.create({
          key: animKey,
          frames: scene.anims.generateFrameNumbers(spec.textureKey, {
            start: rowIndex * spec.framesPerDirection,
            end: rowIndex * spec.framesPerDirection + spec.framesPerDirection - 1,
          }),
          frameRate: spec.frameRate,
          repeat: spec.repeat,
        });
      }
    });
  }
}
