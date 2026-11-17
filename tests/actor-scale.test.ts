import { describe, expect, it } from 'vitest';
import type Phaser from 'phaser';
import { actorScale, baseScale, enlargeActor, SMALL_SPRITE_SCALE } from '../src/world/ActorScale';

/** A sprite stand-in with Arcade's box rule: left = x + scale * (offset - displayOrigin). */
function fakeSprite(
  key: string,
  frame: number,
  body?: { w: number; h: number; ox: number; oy: number },
) {
  const data = new Map<string, unknown>();
  const s = {
    x: 100,
    y: 200,
    originX: 0.5,
    originY: 0.5,
    scaleX: 1,
    scaleY: 1,
    texture: { key },
    scene: { textures: { getFrame: () => ({ width: frame }) } },
    get displayOriginX() {
      return this.originX * frame;
    },
    get displayOriginY() {
      return this.originY * frame;
    },
    setOrigin(x: number, y: number) {
      this.originX = x;
      this.originY = y;
      return this;
    },
    setScale(k: number) {
      this.scaleX = this.scaleY = k;
      return this;
    },
    setData: (k: string, v: unknown) => data.set(k, v),
    getData: (k: string) => data.get(k),
    body: body
      ? {
          sourceWidth: body.w,
          sourceHeight: body.h,
          offset: { x: body.ox, y: body.oy },
          setSize(w: number, h: number) {
            this.sourceWidth = w;
            this.sourceHeight = h;
          },
          setOffset(x: number, y: number) {
            this.offset = { x, y };
          },
        }
      : null,
  };
  return s;
}
const box = (s: ReturnType<typeof fakeSprite>) => ({
  left: s.x + s.scaleX * (s.body!.offset.x - s.displayOriginX),
  top: s.y + s.scaleY * (s.body!.offset.y - s.displayOriginY),
  w: s.body!.sourceWidth * s.scaleX,
  h: s.body!.sourceHeight * s.scaleY,
});
const feet = (s: ReturnType<typeof fakeSprite>, frame: number) =>
  s.y + frame * s.scaleY * (1 - s.originY);
const scene = (w: number) =>
  ({ textures: { getFrame: () => ({ width: w }) } }) as unknown as Phaser.Scene;

describe('actor scale', () => {
  it('grows 32 px people and monsters, keeps bosses, children and orbs smaller', () => {
    expect(actorScale(scene(32), 'npc_elder')).toBe(SMALL_SPRITE_SCALE);
    expect(actorScale(scene(32), 'enemy_ink_hound')).toBe(SMALL_SPRITE_SCALE);
    expect(actorScale(scene(64), 'boss_sentinel')).toBe(1);
    expect(actorScale(scene(48), 'npc_first_forgotten')).toBe(1);
    expect(actorScale(scene(32), 'npc_forgotten_child')).toBeLessThan(SMALL_SPRITE_SCALE);
    expect(actorScale(scene(16), 'enemy_twin_star')).toBe(1);
    expect(actorScale(scene(32), 'peter_idle')).toBe(1);
  });

  it('keeps the feet and the physics box where they were', () => {
    const s = fakeSprite('enemy_ink_hound', 32, { w: 18, h: 18, ox: 7, oy: 7 });
    const before = box(s);
    const feetBefore = feet(s, 32);
    expect(enlargeActor(s as unknown as Phaser.GameObjects.Sprite)).toBe(SMALL_SPRITE_SCALE);
    expect(s.scaleX).toBe(SMALL_SPRITE_SCALE);
    expect(feet(s, 32)).toBeCloseTo(feetBefore);
    const after = box(s);
    for (const k of ['left', 'top', 'w', 'h'] as const) expect(after[k]).toBeCloseTo(before[k]);
    expect(baseScale(s as unknown as Phaser.GameObjects.Sprite)).toBe(SMALL_SPRITE_SCALE);
  });

  it('works for an off-centre body and for sprites with no body', () => {
    const s = fakeSprite('npc_elder', 32, { w: 14, h: 12, ox: 9, oy: 18 });
    const before = box(s);
    enlargeActor(s as unknown as Phaser.GameObjects.Sprite);
    const after = box(s);
    for (const k of ['left', 'top', 'w', 'h'] as const) expect(after[k]).toBeCloseTo(before[k]);
    const v = fakeSprite('npc_elder', 32);
    enlargeActor(v as unknown as Phaser.GameObjects.Sprite);
    expect(v.scaleX).toBe(SMALL_SPRITE_SCALE);
  });
});
