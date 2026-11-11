import Phaser from 'phaser';

export const PANEL_MIN_SIZE = 32;
const PANEL_CORNER_SIZE = 16;

/**
 * Creates a NineSlice UI panel using the approved `ui_frame` asset (48x48 with 16 px corners).
 * Origin is set to top-left `(0, 0)` so `(x, y)` matches `Graphics.fillRect` coordinates.
 */
export function createPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
): Phaser.GameObjects.NineSlice {
  const width = Math.max(PANEL_MIN_SIZE, w);
  const height = Math.max(PANEL_MIN_SIZE, h);
  return scene.add
    .nineslice(
      x,
      y,
      'ui_frame',
      undefined,
      width,
      height,
      PANEL_CORNER_SIZE,
      PANEL_CORNER_SIZE,
      PANEL_CORNER_SIZE,
      PANEL_CORNER_SIZE,
    )
    .setOrigin(0, 0);
}
