import Phaser from 'phaser';
import {
  EFFECTS,
  clearFrame,
  composite,
  createFrame,
  createFx,
  type EffectKey,
  type PixelFrame,
  type PixelFx,
} from '../../vendor/pixelfx/effects.js';

interface Live {
  fx: PixelFx;
  /** World position, or a target followed every frame (a stunned boss). */
  at: { x: number; y: number } | (() => { x: number; y: number });
  /** Ends early (ms of scene time), e.g. a long slam cut short. */
  until?: number;
  /** Playback speed (2 = twice as fast). */
  speed: number;
}

/**
 * pixelfx effects (MIT, src/vendor/pixelfx) drawn over the map (T-84). Effects are drawn in screen
 * pixels into one camera-sized canvas, refreshed only while an effect plays.
 */
export class PixelFxLayer {
  private readonly frame: PixelFrame;
  private readonly image: ImageData;
  private readonly tex: Phaser.Textures.CanvasTexture;
  private readonly view: Phaser.GameObjects.Image;
  private live: Live[] = [];
  private shown = false;
  private static seq = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    depth = 46,
  ) {
    const { width, height } = scene.scale;
    this.frame = createFrame(width, height);
    this.image = new ImageData(width, height);
    const key = `pixelfx_layer_${PixelFxLayer.seq++}`;
    const tex = scene.textures.createCanvas(key, width, height);
    if (!tex) throw new Error('[PixelFxLayer] could not create its canvas');
    this.tex = tex;
    this.view = scene.add
      .image(0, 0, key)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(depth)
      .setVisible(false);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
  }

  /** Plays an effect at a world point (or following a target). Returns it, to stop it early. */
  public play(
    key: EffectKey,
    at: Live['at'],
    options: Record<string, unknown> = {},
    maxMs?: number,
    speed = 1,
  ): PixelFx {
    const fx = createFx(EFFECTS[key], options);
    this.live.push({ fx, at, until: maxMs ? this.scene.time.now + maxMs : undefined, speed });
    return fx;
  }

  public update(deltaMs: number): void {
    const now = this.scene.time.now;
    for (const l of this.live) if (l.until !== undefined && now >= l.until) l.fx.stop();
    this.live = this.live.filter((l) => !l.fx.done());
    if (this.live.length === 0) {
      if (this.shown) {
        this.view.setVisible(false);
        this.shown = false;
      }
      return;
    }
    const cam = this.scene.cameras.main;
    const dt = Math.min(deltaMs, 50) / 1000;
    clearFrame(this.frame);
    for (const l of this.live) {
      l.fx.update(dt * l.speed);
      const p = typeof l.at === 'function' ? l.at() : l.at;
      // Screen pixels: the camera has no zoom on the map.
      l.fx.options.x = Math.round(p.x - cam.worldView.x);
      l.fx.options.y = Math.round(p.y - cam.worldView.y);
      l.fx.draw(this.frame);
    }
    composite(this.frame, this.image.data, null);
    this.tex.context.putImageData(this.image, 0, 0);
    this.tex.refresh();
    if (!this.shown) {
      this.view.setVisible(true);
      this.shown = true;
    }
  }

  public get activeCount(): number {
    return this.live.length;
  }

  public destroy(): void {
    this.live = [];
    if (this.view.scene) this.view.destroy();
    if (this.scene.textures.exists(this.tex.key)) this.scene.textures.remove(this.tex.key);
  }
}
