import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  loadSettings,
  parseSettings,
  saveSettings,
  type SettingsStorage,
} from '../src/state/Settings';

const store = (
  init: Record<string, string> = {},
): SettingsStorage & { data: Record<string, string> } => {
  const data = { ...init };
  return { data, getItem: (k) => data[k] ?? null, setItem: (k, v) => void (data[k] = v) };
};

describe('settings', () => {
  it('starts from the defaults', () => {
    expect(loadSettings(store())).toEqual(DEFAULT_SETTINGS);
  });

  it('takes the old audio volumes over on first load', () => {
    const s = loadSettings(
      store({
        chrono_audio_settings: JSON.stringify({
          masterVolume: 0.5,
          bgmVolume: 0.2,
          sfxVolume: 1,
          isMuted: true,
        }),
      }),
    );
    expect(s).toMatchObject({ masterVolume: 0.5, musicVolume: 0.2, sfxVolume: 1, muted: true });
  });

  it('round-trips through storage', () => {
    const st = store();
    saveSettings(st, { ...DEFAULT_SETTINGS, textSpeed: 'instant', screenShake: false });
    expect(JSON.parse(st.data[SETTINGS_KEY])).toMatchObject({ textSpeed: 'instant' });
    expect(loadSettings(st)).toMatchObject({ textSpeed: 'instant', screenShake: false });
  });

  it('treats stored data as untrusted: clamps, rounds and falls back', () => {
    const s = parseSettings({
      masterVolume: 7,
      musicVolume: -1,
      sfxVolume: 0.333,
      textSpeed: 'warp',
      screenShake: 'yes',
      language: 'en',
    });
    expect(s).toMatchObject({
      masterVolume: 1,
      musicVolume: 0,
      sfxVolume: 0.3,
      textSpeed: 'normal',
      screenShake: true,
      language: 'vi',
    });
    expect(parseSettings('garbage')).toEqual(DEFAULT_SETTINGS);
    expect(loadSettings(store({ [SETTINGS_KEY]: '{not json' }))).toEqual(DEFAULT_SETTINGS);
  });
});
