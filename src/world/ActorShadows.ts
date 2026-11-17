import Phaser from 'phaser';

const SHADOW = 'fx_actor_shadow';
/** Actors are y-sorted inside this depth band: above ground marks (1-2), below effects (40+). */
export const ACTOR_DEPTH = 3;
const SHADOW_DEPTH = 2.5;

interface Tracked {
  shadow: Phaser.GameObjects.Image;
}

/**
 * T-88 engine pass (owner, 2026-11-17): a soft contact shadow under every actor (Peter, people,
 * roamers, the boss) and depth by the feet, so whoever stands lower on screen is drawn in front.
 * Feet are found from the frame's own size and origin, which suits both the 32 px sprites and
 * Peter's 64 px LPC-scale sheets.
 */
export class ActorShadows {
  private readonly tracked = new Map<Phaser.GameObjects.Sprite, Tracked>();

  constructor(private readonly scene: Phaser.Scene) {
    ActorShadows.makeTexture(scene);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.clear());
  }

  /** Where the sprite's soles are (world y). */
  public static feet(s: Phaser.GameObjects.Sprite): number {
    return s.y + s.displayHeight * (1 - s.originY) - 3 * Math.abs(s.scaleY);
  }

  /** Call each frame with the actors on the map; new ones get a shadow, gone ones lose it. */
  public sync(actors: Phaser.GameObjects.Sprite[]): void {
    const seen = new Set<Phaser.GameObjects.Sprite>();
    for (const s of actors) {
      if (!s.active) continue;
      seen.add(s);
      let t = this.tracked.get(s);
      if (!t) {
        t = { shadow: this.scene.add.image(0, 0, SHADOW).setDepth(SHADOW_DEPTH) };
        this.tracked.set(s, t);
      }
      const feet = ActorShadows.feet(s);
      const w = Phaser.Math.Clamp(s.displayWidth * 0.42, 12, 30);
      t.shadow
        .setPosition(s.x, feet)
        .setDisplaySize(w, w * 0.34)
        .setVisible(s.visible)
        .setAlpha(0.42 * s.alpha);
      s.setDepth(ACTOR_DEPTH + feet / 100000);
    }
    for (const [s, t] of this.tracked)
      if (!seen.has(s)) {
        t.shadow.destroy();
        this.tracked.delete(s);
      }
  }

  private clear(): void {
    for (const t of this.tracked.values()) t.shadow.destroy();
    this.tracked.clear();
  }

  /** A soft dark ellipse, drawn once. */
  private static makeTexture(s: Phaser.Scene): void {
    if (s.textures.exists(SHADOW)) return;
    const tex = s.textures.createCanvas(SHADOW, 32, 32);
    if (!tex) return;
    const ctx = tex.getContext();
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(20,10,8,0.85)');
    g.addColorStop(0.55, 'rgba(20,10,8,0.55)');
    g.addColorStop(1, 'rgba(20,10,8,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 32);
    tex.refresh();
  }
}
