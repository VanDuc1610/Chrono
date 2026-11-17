import type Phaser from 'phaser';
import manifest from '../../../art-source/audio/manifest.json';
import { getSettings, onSettingsChange } from '../../state/Settings';
import { chooseTrack } from './MusicRules';
import { SoundSystem } from './SoundSystem';

export interface MusicSound {
  play(): unknown;
  stop(): unknown;
  destroy(): unknown;
  setVolume(volume: number): unknown;
}
export interface MusicBackend {
  duration?(key: string): number;
  has(key: string): boolean;
  add(key: string): MusicSound;
}
interface Channel {
  sound: MusicSound;
  level: number;
  from: number;
  target: number;
  started: number;
  repeatAt: number;
}

/** Own one player for the game, not one per map. Call destroy when its owning scene shuts down. */
export class MusicPlayer {
  private readonly channels = new Set<Channel>();
  private current: Channel | null = null;
  private key: string | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly unsubscribe: () => void;
  private destroyed = false;
  constructor(
    private readonly backend: MusicBackend,
    private readonly fallback: Pick<
      SoundSystem,
      'startBgm' | 'stopBgm' | 'applySettings'
    > = SoundSystem.getInstance(),
    private readonly now: () => number = () => performance.now(),
  ) {
    this.unsubscribe = onSettingsChange(() => this.tick());
  }
  static fromScene(scene: Phaser.Scene): MusicPlayer {
    return new MusicPlayer({
      duration: (key) =>
        manifest.find((entry) => entry.id === key)?.processing?.duration ?? Infinity,
      has: (key) => scene.cache.audio.exists(key),
      add: (key) => {
        const sound = scene.sound.add(key, { loop: false, volume: 0 });
        if (!('setVolume' in sound) || typeof sound.setVolume !== 'function') {
          sound.destroy();
          throw new Error('Sound backend unavailable');
        }
        return sound as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound;
      },
    });
  }
  playForMap(mapId: string, chapter: number): void {
    this.play(chooseTrack(mapId, chapter));
  }
  playMenu(): void {
    this.play(chooseTrack('', 0, 'menu'));
  }
  playBattle(): void {
    this.play(chooseTrack('', 0, 'battle'));
  }
  playBoss(final = false): void {
    this.play(chooseTrack('', 0, final ? 'finalBoss' : 'boss'));
  }
  playEnding(n: number): void {
    this.play(chooseTrack('', 0, 'ending', n));
  }
  playStory(): void {
    this.play(chooseTrack('', 0, 'story'));
  }
  private play(key: string, repeat = false): void {
    if (this.destroyed || (!repeat && this.key === key)) return;
    let sound: MusicSound | null = null;
    if (this.backend.has(key)) {
      try {
        sound = this.backend.add(key);
        if (sound.play() === false) {
          sound.destroy();
          sound = null;
        }
      } catch {
        sound?.destroy();
        sound = null;
      }
    }
    if (!repeat) this.tick();
    this.fadeCurrent();
    this.key = key;
    if (!sound) {
      this.fallback.startBgm(
        key === 'bgm_battle' || key === 'bgm_boss' || key === 'bgm_final' ? 'battle' : 'ambient',
        1500,
      );
      return;
    }
    this.fallback.stopBgm(false, 1500);
    this.current = {
      sound,
      level: 0,
      from: 0,
      target: 1,
      started: this.now(),
      repeatAt:
        this.now() + Math.max(1500, (this.backend.duration?.(key) ?? Infinity) * 1000 - 1500),
    };
    this.channels.add(this.current);
    this.ensureTimer();
  }
  private fadeCurrent(): void {
    if (!this.current) return;
    this.current.from = this.current.level;
    this.current.target = 0;
    this.current.started = this.now();
    this.current = null;
    this.ensureTimer();
  }
  private ensureTimer(): void {
    this.timer ??= setInterval(() => this.tick(), 30);
  }
  private tick(): void {
    const settings = getSettings();
    const volume = settings.muted ? 0 : settings.masterVolume * settings.musicVolume;
    this.fallback.applySettings(settings);
    let transitioning = false;
    for (const channel of this.channels) {
      const progress = Math.min(1, Math.max(0, (this.now() - channel.started) / 1500));
      channel.level = channel.from + (channel.target - channel.from) * progress;
      channel.sound.setVolume(channel.level * volume);
      if (progress === 1 && channel.target === 0) {
        channel.sound.stop();
        channel.sound.destroy();
        this.channels.delete(channel);
      } else if (progress < 1) transitioning = true;
    }
    if (this.current && this.key && this.now() >= this.current.repeatAt) {
      this.play(this.key, true);
      transitioning = true;
    }
    if (!transitioning && !Number.isFinite(this.current?.repeatAt) && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  stop(): void {
    this.key = null;
    this.tick();
    this.fadeCurrent();
    this.fallback.stopBgm(false, 1500);
  }
  destroy(): void {
    this.destroyed = true;
    this.unsubscribe();
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    for (const channel of this.channels) {
      channel.sound.stop();
      channel.sound.destroy();
    }
    this.channels.clear();
    this.current = null;
    this.fallback.stopBgm();
  }
}
