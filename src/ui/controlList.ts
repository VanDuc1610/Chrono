import type { Translate } from './Strings';
import { keyLabel } from './keys';
import type { KeyAction } from '../state/Settings';

/** The rebindable actions in the order the key lists show them. */
export const LISTED_ACTIONS: KeyAction[] = [
  'interact',
  'satchel',
  'questLog',
  'questCycle',
  'quickSave',
  'lighting',
  'neon',
  'controls',
];

/**
 * The key list (H panel, options' Controls tab, pause menu), built from the current bindings
 * (T-96), so a rebound key shows as it is. `armed`: the blade's mouse and ranged/dodge keys.
 */
export function controlList(t: Translate, armed = true): string[] {
  const line = (a: KeyAction): string => `[${keyLabel(a)}] ${t(`keys.${a}`)}`;
  const combat = armed ? [t('keys.attack'), line('ranged'), line('dodge'), t('keys.skill')] : [];
  return [...combat, ...LISTED_ACTIONS.map(line), t('controls.system')];
}
