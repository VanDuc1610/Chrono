import Phaser from 'phaser';

export type CardinalDirection = 'down' | 'up' | 'left' | 'right';

/** T-88 (owner approved 2026-11-17): Peter is drawn at the LPC scale, 64x64 frames. */
export const PETER_FRAME = 64;
/**
 * The frame row that sits on the sprite's position: 14 px above the soles (y = 61), as with the
 * old 32 px sprites, so positions, collisions and distances in gameplay do not move.
 */
export const PETER_ORIGIN_Y = 47 / PETER_FRAME;
/** The 18x14 footprint collider at his feet (offsets from the frame's top-left). */
export const PETER_BODY = { width: 18, height: 14, offsetX: 23, offsetY: 47 } as const;

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
  // Prologue v3: Peter before he receives the Broken Blade (registered only if loaded).
  idle_unarmed: {
    keyPrefix: 'peter_idle_unarmed',
    textureKey: 'peter_idle_unarmed',
    framesPerDirection: 4,
    frameRate: 5,
    repeat: -1,
  },
  walk_unarmed: {
    keyPrefix: 'peter_walk_unarmed',
    textureKey: 'peter_walk_unarmed',
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
    // v2 (owner approved 2026-11-16): flash, knocked back, stagger, steady.
    framesPerDirection: 4,
    frameRate: 14,
    repeat: 0,
  },
  temporal_sight: {
    keyPrefix: 'peter_temporal_sight',
    textureKey: 'peter_temporal_sight',
    framesPerDirection: 4,
    frameRate: 6,
    repeat: -1,
  },
  // T-85 (owner approved 2026-11-16): dodge and ranged-weapon shot.
  dash: {
    keyPrefix: 'peter_dash',
    textureKey: 'peter_dash',
    framesPerDirection: 4,
    frameRate: 18,
    repeat: 0,
  },
  shoot: {
    keyPrefix: 'peter_shoot',
    textureKey: 'peter_shoot',
    framesPerDirection: 4,
    frameRate: 14,
    repeat: 0,
  },
};

const DIRECTIONS: CardinalDirection[] = ['down', 'up', 'left', 'right'];

/**
 * v4 costume stages (owner, 2026-11-17): 1 in chapters 0-1 (áo tấc), 2 in chapters 2-5 (gear
 * pauldron, half cape), 3 in chapters 6-9 (cerulean fractures on the blade arm). Stage n > 1 uses
 * textures and animations named `peter_s<n>_*` beside the stage-1 `peter_*` ones.
 */
export type PeterStage = 1 | 2 | 3;
export const PETER_STAGES: PeterStage[] = [1, 2, 3];

/** The costume stage for the chapter being played (0 = Prologue). */
export function peterStageFor(chapter: number): PeterStage {
  if (chapter <= 1) return 1;
  return chapter <= 5 ? 2 : 3;
}

/** `peter_attack` (or `peter_attack_down`) in the given stage: `peter_s2_attack`, ... */
export function peterStageKey(key: string, stage: PeterStage): string {
  return stage === 1 || !key.startsWith('peter_')
    ? key
    : key.replace(/^peter_/, `peter_s${stage}_`);
}

/**
 * Registers all user-approved Peter animations in Phaser AnimationManager.
 * Ensures strict frame alignment:
 * - Row 0: down
 * - Row 1: up
 * - Row 2: left
 * - Row 3: right
 */
export function registerPeterAnimations(scene: Phaser.Scene): void {
  for (const stage of PETER_STAGES)
    for (const spec of Object.values(PETER_ANIMATION_SPECS)) {
      const textureKey = peterStageKey(spec.textureKey, stage);
      if (!scene.textures.exists(textureKey)) continue;
      registerSpec(scene, spec, textureKey, peterStageKey(spec.keyPrefix, stage));
    }
}

function registerSpec(
  scene: Phaser.Scene,
  spec: IAnimationSpec,
  textureKey: string,
  keyPrefix: string,
): void {
  DIRECTIONS.forEach((dir, rowIndex) => {
    const animKey = `${keyPrefix}_${dir}`;
    if (!scene.anims.exists(animKey)) {
      scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNumbers(textureKey, {
          start: rowIndex * spec.framesPerDirection,
          end: rowIndex * spec.framesPerDirection + spec.framesPerDirection - 1,
        }),
        frameRate: spec.frameRate,
        repeat: spec.repeat,
      });
    }
  });
}
