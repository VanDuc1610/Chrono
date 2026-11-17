import type Phaser from 'phaser';
import manifest from '../../../art-source/audio/manifest.json';
import { getSettings } from '../../state/Settings';
import { SoundSystem } from './SoundSystem';

/** Call in PreloadScene.preload(); missing/failed files simply stay procedural. */
export function queueAudio(loader: Pick<Phaser.Loader.LoaderPlugin, 'audio'>): void {
  for (const entry of manifest) {
    if (entry.status === 'kept') loader.audio(entry.id, entry.file.replace(/^public\//, ''));
  }
}

/** Connect once on a game-lifetime owner. Detach before destroying that owner. */
export function attachFileSfx(scene: Phaser.Scene): () => void {
  const play = (id: string, rate: number): boolean => {
    if (!scene.cache.audio.exists(id)) return false;
    const settings = getSettings();
    return scene.sound.play(id, {
      volume: settings.muted ? 0 : settings.masterVolume * settings.sfxVolume,
      rate,
    });
  };
  return SoundSystem.getInstance().setFileSfxPlayer(play);
}
