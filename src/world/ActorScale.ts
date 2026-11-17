import type Phaser from 'phaser';

/**
 * Owner, 2026-11-17: Peter is drawn at the LPC scale (about 48 px tall) while people and field
 * monsters are still 32 px sprites, so they looked like children next to him. Until they are
 * redrawn, the 32 px ones are shown larger. The feet stay where they were and the physics box
 * keeps its world size, so movement, collisions and hits are unchanged.
 */
export const SMALL_SPRITE_SCALE = 1.5;
/**
 * People redrawn at the LPC scale (scripts/lpc/npcs.mjs) are drawn 1:1 with Peter's origin, 14 px
 * above the soles, so they stand where the 32 px ones stood. Their frames are 64 px, or 96 px for
 * the figures that should stand apart (Chronos reborn, the First Forgotten); either way the soles
 * sit 3 px above the frame's bottom edge.
 */
export const LPC_FRAME = 64;
export const LPC_ORIGIN_Y = 47 / LPC_FRAME;
/** The origin that puts the soles (3 px above the bottom) 14 px below the position. */
export const lpcOriginY = (frameHeight: number): number => (frameHeight - 17) / frameHeight;

/** Actors that should stay smaller than a grown person (children, swarms, small things). */
const OVERRIDES: Record<string, number> = {
  npc_forgotten_child: 1.2,
  npc_kuro: 1.3,
  npc_mira: 1.2,
  enemy_erasure_moths: 1.2,
  enemy_paradox_crystal: 1.3,
  enemy_unborn_cocoon: 1.3,
  enemy_twin_star: 1,
};

const frameWidth = (scene: Phaser.Scene, key: string): number =>
  scene.textures.getFrame(key)?.width ?? 0;

/** A person or field enemy drawn at the LPC scale (`npc_`/`enemy_` sheet, 64 px+ frames). */
export function isLpcActor(scene: Phaser.Scene, key: string): boolean {
  return /^(npc_|enemy_)/.test(key) && frameWidth(scene, key) >= LPC_FRAME;
}

/** The display scale for an actor texture: 32 px people and monsters grow, the rest stay. */
export function actorScale(scene: Phaser.Scene, key: string): number {
  if (!/^(npc_|enemy_)/.test(key) || isLpcActor(scene, key)) return 1;
  if (key in OVERRIDES) return OVERRIDES[key];
  const w = frameWidth(scene, key);
  return w > 0 && w <= 32 ? SMALL_SPRITE_SCALE : 1;
}

/** The scale an actor was given by {@link enlargeActor} (1 when it was not). */
export function baseScale(sprite: Phaser.GameObjects.Sprite): number {
  return (sprite.getData('baseScale') as number | undefined) ?? 1;
}

/**
 * Fits an actor sprite to Peter's height: 32 px sheets are scaled up around their feet, LPC-scale
 * sheets take the LPC origin. Call after the body size and offset are set (offsets relative to the
 * frame's centre): the body is converted so its box stays the same in the world. A body left at
 * the full LPC frame becomes the 32 x 32 box the old sprite had, centred on the position.
 */
export function enlargeActor(
  sprite: Phaser.GameObjects.Sprite,
  scale = actorScale(sprite.scene, sprite.texture.key),
): number {
  sprite.setData('baseScale', scale);
  const lpc = isLpcActor(sprite.scene, sprite.texture.key);
  if (scale === 1 && !lpc) return 1;
  const frame = frameWidth(sprite.scene, sprite.texture.key);
  const body = sprite.body as Phaser.Physics.Arcade.Body | null;
  const box = body
    ? lpc && body.sourceWidth === frame && body.sourceHeight === frame
      ? { w: 32, h: 32, dx: -16, dy: -16 }
      : {
          w: body.sourceWidth,
          h: body.sourceHeight,
          dx: body.offset.x - sprite.displayOriginX,
          dy: body.offset.y - sprite.displayOriginY,
        }
    : null;
  const originY = lpc ? lpcOriginY(frame) : 1 - (1 - sprite.originY) / scale;
  sprite.setOrigin(sprite.originX, originY).setScale(scale);
  if (body && box) {
    body.setSize(box.w / scale, box.h / scale, false);
    body.setOffset(sprite.displayOriginX + box.dx / scale, sprite.displayOriginY + box.dy / scale);
  }
  return scale;
}
