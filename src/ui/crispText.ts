import Phaser from 'phaser';

/**
 * The game draws at 768×432 and is scaled up 2-3× with nearest-neighbour filtering, which smears
 * small text (Vietnamese diacritics especially). Every Text object is therefore rendered at a
 * higher resolution and sampled smoothly, so it stays sharp at the final screen size.
 */
export const TEXT_RESOLUTION = 4;

/**
 * Every UI text uses Be Vietnam Pro (SIL OFL), a clear sans made for Vietnamese (owner, 2026-11-18:
 * easy to read, need not be pixel; it replaced the VT323 pixel font of T-91).
 */
// Arrows and symbols the font lacks come from the system's symbol fonts.
export const UI_FONT = '"Be Vietnam Pro", "Segoe UI Symbol", "Segoe UI", sans-serif';
/** Sizes in the code were set for a system monospace at 640×360: scaled up for the 768×432 view. */
export const UI_FONT_SCALE = 1.15;
/** No UI text smaller than this (small labels stay readable). */
export const UI_FONT_MIN = 10;

let installed = false;

/** Font size scaled for the UI font ("10px" -> "12px", 10 -> 12). */
export function uiFontSize(size: string | number): string | number {
  const scaled = (n: number): number => Math.max(UI_FONT_MIN, Math.round(n * UI_FONT_SCALE));
  if (typeof size === 'number') return scaled(size);
  const px = /^(\d+(?:\.\d+)?)px$/.exec(size.trim());
  return px ? `${scaled(Number(px[1]))}px` : size;
}

/** A Text style moved onto the UI font (styles that name another font are left alone). */
export function uiStyle<T extends Phaser.Types.GameObjects.Text.TextStyle | undefined>(
  style: T,
): T {
  if (style && style.fontFamily && !/monospace/i.test(style.fontFamily)) return style;
  const out: Phaser.Types.GameObjects.Text.TextStyle = { ...(style ?? {}), fontFamily: UI_FONT };
  out.fontSize = uiFontSize(style?.fontSize ?? '10px');
  return out as T;
}

export function installCrispText(): void {
  if (installed) return;
  installed = true;
  const factory = Phaser.GameObjects.GameObjectFactory.prototype as unknown as {
    text: (...args: unknown[]) => Phaser.GameObjects.Text;
  };
  const original = factory.text;
  factory.text = function (this: Phaser.GameObjects.GameObjectFactory, ...args: unknown[]) {
    args[3] = uiStyle(args[3] as Phaser.Types.GameObjects.Text.TextStyle | undefined);
    const text = original.apply(this, args);
    text.setResolution(TEXT_RESOLUTION);
    text.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    return text;
  };
  // Sizes set later (combat numbers) follow the same scale.
  const proto = Phaser.GameObjects.Text.prototype;
  const setFontSize = proto.setFontSize;
  proto.setFontSize = function (this: Phaser.GameObjects.Text, size: number | string) {
    const ui = this.style.fontFamily === UI_FONT;
    return setFontSize.call(this, ui ? uiFontSize(size) : size);
  };
}
