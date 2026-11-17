import type { Translate } from './Strings';

/** The key list shown in the options' Controls tab and the pause menu (T-96). */
export function controlList(t: Translate): string[] {
  return [
    ...t('hud.controlsArmed')
      .split('|')
      .map((k) => k.trim()),
    t('controls.system'),
  ];
}
