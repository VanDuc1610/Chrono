import type Phaser from 'phaser';

/**
 * Owner, 2026-11-17: Peter is drawn at the LPC scale (about 48 px tall) while people and field
 * monsters are still 32 px sprites, so they looked like children next to him. Until they are
 * redrawn, the 32 px ones are shown larger. The feet stay where they were and the physics box
 * keeps its world size, so movement, collisions and hits are unchanged.
 */
export const SMALL_SPRITE_SCALE = 1.5;

/** Actors that should stay smaller than a grown person (children, swarms, small things). */
const OVERRIDES: Record<string, number> = {
  npc_forgotten_child: 1.2,
  npc_kuro: 1.3,
  enemy_erasure_moths: 1.2,
  enemy_paradox_crystal: 1.3,
  enemy_unborn_cocoon: 1.3,
  enemy_twin_star: 1,
};

/** The display scale for an actor texture: 32 px people and monsters grow, the rest stay. */
export function actorScale(scene: Phaser.Scene, key: string): number {
  if (key in OVERRIDES) return OVERRIDES[key];
  if (!/^(npc_|enemy_)/.test(key)) return 1;
  const w = scene.textures.getFrame(key)?.width ?? 0;
  return w > 0 && w <= 32 ? SMALL_SPRITE_SCALE : 1;
}

/** The scale an actor was given by {@link enlargeActor} (1 when it was not). */
export function baseScale(sprite: Phaser.GameObjects.Sprite): number {
  return (sprite.getData('baseScale') as number | undefined) ?? 1;
}

/**
 * Scales an actor sprite up around its feet. Call after its body size and offset are set: the
 * body is converted so its box stays the same in the world.
 */
export function enlargeActor(
  sprite: Phaser.GameObjects.Sprite,
  scale = actorScale(sprite.scene, sprite.texture.key),
): number {
  sprite.setData('baseScale', scale);
  if (scale === 1) return 1;
  const body = sprite.body as Phaser.Physics.Arcade.Body | null;
  const box = body
    ? {
        w: body.sourceWidth,
        h: body.sourceHeight,
        dx: body.offset.x - sprite.displayOriginX,
        dy: body.offset.y - sprite.displayOriginY,
      }
    : null;
  sprite.setOrigin(sprite.originX, 1 - (1 - sprite.originY) / scale).setScale(scale);
  if (body && box) {
    body.setSize(box.w / scale, box.h / scale, false);
    body.setOffset(sprite.displayOriginX + box.dx / scale, sprite.displayOriginY + box.dy / scale);
  }
  return scale;
}
