import Phaser from 'phaser';
import { ACTION_SHEETS } from '../../systems/animation/actionSheets.generated';

/**
 * Action frames for monsters, bosses and Peter (owner approved 2026-11-18). Each actor has one extra
 * sheet `<texture>_act` derived from its idle frame (scripts/pixel-art/action-frames.mjs):
 * frames 0-3 attack (wind back, lunge, strike, recover), 4-5 hurt, 6-11 death (Peter: a fall).
 * Sprites face right; the game flips them toward Peter.
 */
export type ActorAction = 'windup' | 'strike' | 'hurt' | 'die';

const actKey = (texture: string): string => `${texture}_act`;

/** Queues every action sheet (PreloadScene.preload). */
export function loadActionSheets(load: Phaser.Loader.LoaderPlugin): void {
  for (const [key, size] of Object.entries(ACTION_SHEETS))
    load.spritesheet(actKey(key), `assets/actions/${key}_act.png`, {
      frameWidth: size,
      frameHeight: size,
    });
}

/** The three clips of every sheet (PreloadScene.create). */
export function registerActionAnims(scene: Phaser.Scene): void {
  for (const key of Object.keys(ACTION_SHEETS)) {
    const tex = actKey(key);
    if (!scene.textures.exists(tex)) continue;
    const clip = (name: string, frames: number[], frameRate: number): void => {
      if (scene.anims.exists(`${tex}_${name}`)) return;
      scene.anims.create({
        key: `${tex}_${name}`,
        frames: scene.anims.generateFrameNumbers(tex, { frames }),
        frameRate,
        repeat: 0,
      });
    };
    clip('strike', [1, 2, 2, 3], 14);
    clip('hurt', [4, 4, 5], 16);
    clip('die', [6, 7, 8, 9, 10, 11], 10);
  }
}

/** True when this texture has action frames. */
export function hasActions(scene: Phaser.Scene, texture: string): boolean {
  return scene.textures.exists(actKey(texture));
}

/** Milliseconds a death clip lasts (0 when the actor has none). */
export const DIE_MS = 600;

/**
 * Plays an action on a sprite and returns it to its idle loop afterwards. The sprite's own texture
 * and idle animation are remembered the first time (`baseTex`, `idleAnim`). `windup` holds the
 * wind-back pose until the next action; `die` stays on its last frame. False when there are no
 * action frames for it (the caller keeps its old effect).
 */
export function playAction(
  sprite: Phaser.GameObjects.Sprite,
  action: ActorAction,
  onDone?: () => void,
): boolean {
  if (!sprite.active) return false;
  const scene = sprite.scene;
  const base = (sprite.getData('baseTex') as string | undefined) ?? sprite.texture.key;
  if (!hasActions(scene, base)) return false;
  if (sprite.getData('baseTex') === undefined) {
    sprite.setData('baseTex', base);
    sprite.setData('idleAnim', sprite.anims.currentAnim?.key ?? null);
  }
  // Death wins over everything; nothing interrupts it.
  if (sprite.getData('dying')) return true;
  const tex = actKey(base);
  // Only our own pending callback is dropped (an action cut short by the next one).
  const pending = sprite.getData('actDone') as (() => void) | undefined;
  if (pending) sprite.off(Phaser.Animations.Events.ANIMATION_COMPLETE, pending);
  sprite.setData('actDone', undefined);
  if (action === 'windup') {
    sprite.anims.stop();
    sprite.setTexture(tex, 0);
    return true;
  }
  if (action === 'die') sprite.setData('dying', true);
  const done = (): void => {
    sprite.setData('actDone', undefined);
    if (action !== 'die') backToIdle(sprite);
    onDone?.();
  };
  sprite.setData('actDone', done);
  sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, done);
  sprite.play(`${tex}_${action}`);
  return true;
}

/** Back to the idle loop (or the still base frame). */
export function backToIdle(sprite: Phaser.GameObjects.Sprite): void {
  if (!sprite.active || sprite.getData('dying')) return;
  const base = sprite.getData('baseTex') as string | undefined;
  if (!base) return;
  const idle = sprite.getData('idleAnim') as string | null;
  if (idle && sprite.scene.anims.exists(idle)) sprite.play(idle);
  else sprite.setTexture(base, 0);
}

/** Whether a sprite is mid-action (not on its idle). */
export function inAction(sprite: Phaser.GameObjects.Sprite): boolean {
  const base = sprite.getData('baseTex') as string | undefined;
  return !!base && sprite.texture.key === actKey(base);
}
