import Phaser from 'phaser';

/**
 * The game draws at 640×360 and is scaled up 2-3× with nearest-neighbour filtering, which smears
 * small text (Vietnamese diacritics especially). Every Text object is therefore rendered at a
 * higher resolution and sampled smoothly, so it stays sharp at the final screen size.
 */
export const TEXT_RESOLUTION = 4;

let installed = false;

export function installCrispText(): void {
  if (installed) return;
  installed = true;
  const factory = Phaser.GameObjects.GameObjectFactory.prototype as unknown as {
    text: (...args: unknown[]) => Phaser.GameObjects.Text;
  };
  const original = factory.text;
  factory.text = function (this: Phaser.GameObjects.GameObjectFactory, ...args: unknown[]) {
    const text = original.apply(this, args);
    text.setResolution(TEXT_RESOLUTION);
    text.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    return text;
  };
}
