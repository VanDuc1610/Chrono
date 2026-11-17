/**
 * T-96: player settings (docs/design/SETTINGS_UX.md §1). Pure: no Phaser. Stored under
 * `chrono_settings_v1`; the old `chrono_audio_settings` volumes are taken over on first load.
 */
export type TextSpeed = 'instant' | 'fast' | 'normal';

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
  if (!isRecord(raw)) return { ...d };
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
  if (!isRecord(legacy)) return { ...DEFAULT_SETTINGS };
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
