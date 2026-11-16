import Phaser from 'phaser';

const CELL = 32;
const DEPTH = 300;

/**
 * Diamond wipe between maps (T-85 UI): a grid of diamonds grows across the screen from left to
 * right to cover it, and shrinks away on arrival. Drawn in code; a replacement for the plain fade.
 */
export class ScreenTransition {
  /** Covers the screen, then calls `done`. */
  public static out(scene: Phaser.Scene, ms: number, done: () => void, color = 0x06070d): void {
    ScreenTransition.run(scene, ms, color, true, done);
  }

  /** Uncovers the screen (start fully covered). */
  public static in(scene: Phaser.Scene, ms: number, color = 0x06070d): void {
    ScreenTransition.run(scene, ms, color, false);
  }

  private static run(
    scene: Phaser.Scene,
    ms: number,
    color: number,
    covering: boolean,
    done?: () => void,
  ): void {
    const { width, height } = scene.scale;
    const g = scene.add.graphics().setScrollFactor(0).setDepth(DEPTH);
    const cols = Math.ceil(width / CELL) + 1;
    const rows = Math.ceil(height / CELL) + 1;
    const span = cols + rows;
    const state = { t: 0 };
    const draw = (): void => {
      g.clear();
      g.fillStyle(color, 1);
      for (let cx = 0; cx < cols; cx++)
        for (let cy = 0; cy < rows; cy++) {
          // Each diamond starts a little later the further right / lower it is.
          const local = Phaser.Math.Clamp(state.t * 2 - (cx + cy) / span, 0, 1);
          const k = covering ? local : 1 - local;
          if (k <= 0) continue;
          const r = (CELL / 2) * k * 1.42;
          const x = cx * CELL;
          const y = cy * CELL;
          g.fillPoints(
            [
              new Phaser.Math.Vector2(x, y - r),
              new Phaser.Math.Vector2(x + r, y),
              new Phaser.Math.Vector2(x, y + r),
              new Phaser.Math.Vector2(x - r, y),
            ],
            true,
          );
        }
    };
    draw();
    scene.tweens.add({
      targets: state,
      t: 1,
      duration: ms,
      ease: 'Sine.easeInOut',
      onUpdate: draw,
      onComplete: () => {
        if (covering) {
          g.clear().fillStyle(color, 1).fillRect(0, 0, width, height);
          done?.();
        } else g.destroy();
      },
    });
  }
}
