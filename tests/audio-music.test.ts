import { afterEach, describe, expect, it, vi } from 'vitest';
import { chooseTrack } from '../src/systems/audio/MusicRules';
import { MusicPlayer } from '../src/systems/audio/MusicPlayer';
import { SoundSystem } from '../src/systems/audio/SoundSystem';
import { DEFAULT_SETTINGS, updateSettings } from '../src/state/Settings';

afterEach(() => {
  vi.useRealTimers();
  updateSettings(DEFAULT_SETTINGS);
});
describe('SFX compatibility', () => {
  it('keeps old and new cues safe without files or an AudioContext', () => {
    const sound = SoundSystem.getInstance();
    const methods = [
      'playCursorBlip',
      'playSelect',
      'playSlash',
      'playHeal',
      'playSaveChime',
      'playHit',
      'playShot',
      'playDodge',
      'playHurt',
      'playPickup',
      'playLevelUp',
      'playPuzzleSolved',
      'playFootstep',
      'playDoor',
      'playMenuCancel',
      'playDialogueBlip',
    ] as const;
    const file = vi.fn(() => false);
    const detach = sound.setFileSfxPlayer(file);
    for (const method of methods) expect(() => sound[method]()).not.toThrow();
    expect(file).toHaveBeenCalledTimes(methods.length);
    detach();
  });
  it('does not let old owner cleanup detach a newer file adapter', () => {
    const sound = SoundSystem.getInstance();
    const detachOld = sound.setFileSfxPlayer(() => true);
    const active = vi.fn(() => true);
    const detach = sound.setFileSfxPlayer(active);
    detachOld();
    sound.playHit();
    expect(active).toHaveBeenCalledWith('sfx_hit', 1);
    detach();
  });
});
describe('music selection', () => {
  it('uses map prefixes, prologue exceptions and safe unknown chapter defaults', () => {
    expect(chooseTrack('map_ch8_gear_market', 0)).toBe('bgm_ch8_null');
    expect(chooseTrack('map_peters_room', 9)).toBe('bgm_ch0_prologue');
    expect(chooseTrack('custom_map', 6)).toBe('bgm_ch6_gods');
    expect(chooseTrack('', NaN)).toBe('bgm_ch0_prologue');
  });
  it('overrides map music for battle, bosses, story and all four endings', () => {
    expect(chooseTrack('map_ch1_shore', 1, 'battle')).toBe('bgm_battle');
    expect(chooseTrack('', 0, 'boss')).toBe('bgm_boss');
    expect(chooseTrack('', 0, 'finalBoss')).toBe('bgm_final');
    expect([1, 2, 3, 4].map((n) => chooseTrack('', 0, 'ending', n))).toEqual([
      'bgm_ch2_empire',
      'bgm_ending_unbound',
      'bgm_ch1_sunset',
      'bgm_sad_soliloquy',
    ]);
  });
});
describe('music lifecycle', () => {
  function setup(duration = Infinity) {
    vi.useFakeTimers();
    updateSettings({ masterVolume: 0.8, musicVolume: 0.5, muted: false });
    const sounds: { key: string; volume: number; stopped: boolean; destroyed: boolean }[] = [];
    const backend = {
      duration: () => duration,
      has: (key: string) => key !== 'bgm_final',
      add: (key: string) => {
        const state = { key, volume: 0, stopped: false, destroyed: false };
        sounds.push(state);
        return {
          play: () => true,
          setVolume: (v: number) => {
            state.volume = v;
          },
          stop: () => {
            state.stopped = true;
          },
          destroy: () => {
            state.destroyed = true;
          },
        };
      },
    };
    const fallback = { startBgm: vi.fn(), stopBgm: vi.fn(), applySettings: vi.fn() };
    let elapsed = 0;
    const player = new MusicPlayer(backend, fallback, () => elapsed);
    const advance = (ms: number) => {
      elapsed += ms;
      vi.advanceTimersByTime(ms);
    };
    return { player, sounds, fallback, advance };
  }
  it('keeps a shared map track playing, crossfades for 1.5 seconds and disposes outgoing channels', () => {
    const { player, sounds, advance } = setup();
    player.playForMap('map_ch1_a', 1);
    advance(1500);
    expect(sounds[0].volume).toBeCloseTo(0.4);
    player.playForMap('map_ch1_b', 1);
    expect(sounds).toHaveLength(1);
    player.playBattle();
    advance(750);
    expect(sounds[0].volume).toBeCloseTo(0.2);
    expect(sounds[1].volume).toBeCloseTo(0.2);
    advance(750);
    expect(sounds[0].destroyed).toBe(true);
    updateSettings({ muted: true });
    expect(sounds[1].volume).toBe(0);
    updateSettings({ muted: false, musicVolume: 0.2 });
    expect(sounds[1].volume).toBeCloseTo(0.16);
    player.destroy();
    expect(sounds[1].destroyed).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('overlaps the tail and head of a trimmed excerpt instead of hard-looping its seam', () => {
    const { player, sounds, advance } = setup(4);
    player.playMenu();
    advance(2500);
    expect(sounds).toHaveLength(2);
    advance(1500);
    expect(sounds[0].destroyed).toBe(true);
    player.destroy();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('uses procedural fallback for missing files and stops all work on destroy', () => {
    const { player, fallback } = setup();
    player.playBoss(true);
    expect(fallback.startBgm).toHaveBeenCalledWith('battle', 1500);
    player.destroy();
    player.playBattle();
    expect(vi.getTimerCount()).toBe(0);
  });
});
