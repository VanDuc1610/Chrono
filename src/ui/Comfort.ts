import Phaser from 'phaser';
import { SoundSystem } from '../systems/audio/SoundSystem';
import { getSettings, onSettingsChange, type Settings } from '../state/Settings';

let installed = false;

/**
 * T-96: settings that touch the whole game, applied in one place (docs/design/SETTINGS_UX.md §1):
 * volumes reach SoundSystem; "screen shake off" turns every camera shake into nothing; "fewer
 * flashes" turns every camera flash into a short, dim one. No call site has to know.
 */
export function installComfort(): void {
  if (installed) return;
  installed = true;
  const sync = (s: Settings): void => SoundSystem.getInstance().applySettings(s);
  sync(getSettings());
  onSettingsChange(sync);

  const camera = Phaser.Cameras.Scene2D.Camera.prototype;
  const shake = camera.shake;
  camera.shake = function (this: Phaser.Cameras.Scene2D.Camera, ...args: Parameters<typeof shake>) {
    if (!getSettings().screenShake) return this;
    return shake.apply(this, args);
  };
  const flash = camera.flash;
  camera.flash = function (
    this: Phaser.Cameras.Scene2D.Camera,
    duration?: number,
    red = 255,
    green = 255,
    blue = 255,
    ...rest: unknown[]
  ) {
    if (!getSettings().reducedFlashes)
      return flash.call(this, duration, red, green, blue, ...(rest as []));
    const dim = 0.25;
    return flash.call(
      this,
      Math.min(duration ?? 250, 120),
      Math.round(red * dim),
      Math.round(green * dim),
      Math.round(blue * dim),
      ...(rest as []),
    );
  };
}
