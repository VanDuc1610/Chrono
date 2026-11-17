import Phaser from 'phaser';
import { getSettings, type KeyAction } from '../state/Settings';

/** Phaser key code bound to an action (T-96 key rebinding; read when a scene sets its keys up). */
export function keyCode(action: KeyAction): number {
  const name = getSettings().keys[action] as keyof typeof Phaser.Input.Keyboard.KeyCodes;
  return Phaser.Input.Keyboard.KeyCodes[name];
}

const DIGITS: Record<string, string> = {
  ZERO: '0',
  FIVE: '5',
  SIX: '6',
  SEVEN: '7',
  EIGHT: '8',
  NINE: '9',
};

/** How a bound key is shown to the player ("F", "Shift", "Ctrl", "5"). */
export function keyLabel(action: KeyAction): string {
  const name = getSettings().keys[action];
  if (DIGITS[name]) return DIGITS[name];
  return name.length === 1 ? name : name[0] + name.slice(1).toLowerCase();
}
