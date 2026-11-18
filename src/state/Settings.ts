/**
 * T-96: player settings (docs/design/SETTINGS_UX.md §1). Pure: no Phaser. Stored under
 * `chrono_settings_v1`; the old `chrono_audio_settings` volumes are taken over on first load.
 */
export type TextSpeed = 'instant' | 'fast' | 'normal';

/** Rebindable actions (docs/design/SETTINGS_UX.md §1.1); the left click attacks, the right click casts. */
export const KEY_ACTIONS = [
  'interact',
  'ranged',
  'dodge',
  'skill1',
  'skill2',
  'skill3',
  'satchel',
  'equipment',
  'questLog',
  'questCycle',
  'quickSave',
  'lighting',
  'neon',
  'controls',
] as const;
export type KeyAction = (typeof KEY_ACTIONS)[number];
export type KeyBindings = Record<KeyAction, string>;

export const DEFAULT_KEYS: Readonly<KeyBindings> = {
  interact: 'E',
  ranged: 'F',
  dodge: 'SHIFT',
  skill1: 'Z',
  skill2: 'X',
  skill3: 'C',
  satchel: 'I',
  equipment: 'U',
  questLog: 'J',
  questCycle: 'Q',
  quickSave: 'K',
  lighting: 'L',
  neon: 'N',
  controls: 'H',
};

/** Keys that belong to the system (movement, pause, confirm, choices): never rebound. */
export const FIXED_KEYS = new Set([
  'W',
  'A',
  'S',
  'D',
  'UP',
  'DOWN',
  'LEFT',
  'RIGHT',
  'ESC',
  'SPACE',
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
]);
/** Keys a player may choose (Phaser KeyCodes names). */
const CHOOSABLE = new Set([
  ...'BCEFGHIJKLMNOPQRTUVXYZ'.split(''),
  'FIVE',
  'SIX',
  'SEVEN',
  'EIGHT',
  'NINE',
  'ZERO',
  'SHIFT',
  'CTRL',
  'ALT',
  'TAB',
  'ENTER',
]);

/** Phaser key name for a DOM keyboard event ('KeyF' -> 'F', 'ShiftLeft' -> 'SHIFT'), or null. */
export function keyNameOf(e: { code?: string; key?: string }): string | null {
  const code = e.code ?? '';
  const digits = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
  if (/^Key[A-Z]$/.test(code)) return code.slice(3);
  if (/^Digit[0-9]$/.test(code)) return digits[Number(code.slice(5))];
  const named: Record<string, string> = {
    ShiftLeft: 'SHIFT',
    ShiftRight: 'SHIFT',
    ControlLeft: 'CTRL',
    ControlRight: 'CTRL',
    AltLeft: 'ALT',
    AltRight: 'ALT',
    Tab: 'TAB',
    Enter: 'ENTER',
    Space: 'SPACE',
    Escape: 'ESC',
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
  };
  return named[code] ?? null;
}

/** Binds `key` to `action`: a system key is refused; a key in use elsewhere swaps with it. */
export function rebind(
  keys: KeyBindings,
  action: KeyAction,
  key: string,
): { keys: KeyBindings; result: 'ok' | 'fixed' | 'invalid' | 'swapped'; other?: KeyAction } {
  if (FIXED_KEYS.has(key)) return { keys, result: 'fixed' };
  if (!CHOOSABLE.has(key)) return { keys, result: 'invalid' };
  const other = KEY_ACTIONS.find((a) => a !== action && keys[a] === key);
  const next = { ...keys, [action]: key };
  if (other) {
    next[other] = keys[action];
    return { keys: next, result: 'swapped', other };
  }
  return { keys: next, result: 'ok' };
}

/** Bindings from untrusted data: unknown or duplicated keys fall back to the defaults. */
export function parseKeys(raw: unknown): KeyBindings {
  const out: KeyBindings = { ...DEFAULT_KEYS };
  if (typeof raw !== 'object' || raw === null) return out;
  const r = raw as Record<string, unknown>;
  for (const a of KEY_ACTIONS) {
    const k = r[a];
    if (typeof k === 'string' && CHOOSABLE.has(k)) out[a] = k;
  }
  const used = KEY_ACTIONS.map((a) => out[a]);
  return new Set(used).size === used.length ? out : { ...DEFAULT_KEYS };
}

export interface Settings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  textSpeed: TextSpeed;
  screenShake: boolean;
  reducedFlashes: boolean;
  neonDefault: boolean;
  lightingDefault: boolean;
  language: 'vi';
  keys: KeyBindings;
}

export const SETTINGS_KEY = 'chrono_settings_v1';
const LEGACY_AUDIO_KEY = 'chrono_audio_settings';

export const DEFAULT_SETTINGS: Readonly<Settings> = {
  masterVolume: 0.8,
  musicVolume: 0.4,
  sfxVolume: 0.6,
  muted: false,
  textSpeed: 'normal',
  screenShake: true,
  reducedFlashes: false,
  neonDefault: true,
  lightingDefault: true,
  language: 'vi',
  keys: DEFAULT_KEYS,
};

/** Milliseconds per typed character in dialogue. */
export const TEXT_DELAY_MS: Record<TextSpeed, number> = { instant: 0, fast: 10, normal: 18 };

/** Minimal storage (window.localStorage, or a map in tests and private windows). */
export interface SettingsStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const volume = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v)
    ? Math.round(Math.min(1, Math.max(0, v)) * 10) / 10
    : fallback;
const flag = (v: unknown, fallback: boolean): boolean => (typeof v === 'boolean' ? v : fallback);

/** Settings from untrusted stored data: every field checked, anything odd falls back to default. */
export function parseSettings(raw: unknown): Settings {
  const d = DEFAULT_SETTINGS;
  if (!isRecord(raw)) return { ...d, keys: { ...DEFAULT_KEYS } };
  const speed = raw.textSpeed;
  return {
    masterVolume: volume(raw.masterVolume, d.masterVolume),
    musicVolume: volume(raw.musicVolume, d.musicVolume),
    sfxVolume: volume(raw.sfxVolume, d.sfxVolume),
    muted: flag(raw.muted, d.muted),
    textSpeed: speed === 'instant' || speed === 'fast' || speed === 'normal' ? speed : d.textSpeed,
    screenShake: flag(raw.screenShake, d.screenShake),
    reducedFlashes: flag(raw.reducedFlashes, d.reducedFlashes),
    neonDefault: flag(raw.neonDefault, d.neonDefault),
    lightingDefault: flag(raw.lightingDefault, d.lightingDefault),
    language: 'vi',
    keys: parseKeys(raw.keys),
  };
}

const readJson = (storage: SettingsStorage, key: string): unknown => {
  try {
    const text = storage.getItem(key);
    return text ? (JSON.parse(text) as unknown) : null;
  } catch {
    return null;
  }
};

/** Loads settings; on first run takes the old audio volumes over. */
export function loadSettings(storage: SettingsStorage): Settings {
  const stored = readJson(storage, SETTINGS_KEY);
  if (stored) return parseSettings(stored);
  const legacy = readJson(storage, LEGACY_AUDIO_KEY);
  if (!isRecord(legacy)) return parseSettings({});
  return parseSettings({
    masterVolume: legacy.masterVolume,
    musicVolume: legacy.bgmVolume,
    sfxVolume: legacy.sfxVolume,
    muted: legacy.isMuted,
  });
}

export function saveSettings(storage: SettingsStorage, s: Settings): void {
  try {
    storage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    // Storage full or blocked: the settings still hold for this session.
  }
}

// ------------------------------------------------------------------ the live settings

const memory = new Map<string, string>();
const memoryStorage: SettingsStorage = {
  getItem: (k) => memory.get(k) ?? null,
  setItem: (k, v) => void memory.set(k, v),
};
function storage(): SettingsStorage {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  } catch {
    // Blocked storage (private window): fall through.
  }
  return memoryStorage;
}

let current: Settings | null = null;
const listeners = new Set<(s: Settings) => void>();

/** The settings in force (loaded once). */
export function getSettings(): Settings {
  current ??= loadSettings(storage());
  return current;
}

/** Changes some settings, stores them and tells the listeners (sound, cameras...). */
export function updateSettings(patch: Partial<Settings>): Settings {
  current = parseSettings({ ...getSettings(), ...patch });
  saveSettings(storage(), current);
  for (const l of listeners) l(current);
  return current;
}

export function onSettingsChange(listener: (s: Settings) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
