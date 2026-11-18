import Phaser from 'phaser';

/**
 * The game draws at 720×405 and is scaled up 2-3× with nearest-neighbour filtering, which smears
 * small text (Vietnamese diacritics especially). Every Text object is therefore rendered at a
 * higher resolution and sampled smoothly, so it stays sharp at the final screen size.
 */
export const TEXT_RESOLUTION = 4;

/**
 * T-91 (owner, 2026-11-17): every UI text uses VT323, a pixel font (SIL OFL) with the full
 * Vietnamese set, instead of the system monospace (which differs per machine and blurs diacritics).
 */
export const UI_FONT = '"VT323", monospace';
/** VT323 draws smaller than a system monospace of the same size: sizes are scaled to keep layouts. */
export const UI_FONT_SCALE = 1.4;

let installed = false;

/** Font size scaled for VT323 ("10px" -> "14px", 10 -> 14). */
export function uiFontSize(size: string | number): string | number {
  if (typeof size === 'number') return Math.round(size * UI_FONT_SCALE);
  const px = /^(\d+(?:\.\d+)?)px$/.exec(size.trim());
  return px ? `${Math.round(Number(px[1]) * UI_FONT_SCALE)}px` : size;
}

/** A Text style moved onto the UI font (styles that name another font are left alone). */
export function uiStyle<T extends Phaser.Types.GameObjects.Text.TextStyle | undefined>(
  style: T,
): T {
  if (style && style.fontFamily && !/monospace/i.test(style.fontFamily)) return style;
  const out: Phaser.Types.GameObjects.Text.TextStyle = { ...(style ?? {}), fontFamily: UI_FONT };
  // VT323 has no bold face: a synthetic bold smears its pixels, so emphasis comes from colour.
  if (out.fontStyle && /bold/.test(out.fontStyle))
    out.fontStyle = out.fontStyle.replace('bold', '').trim() || 'normal';
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
