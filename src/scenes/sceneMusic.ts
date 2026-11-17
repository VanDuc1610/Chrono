import type Phaser from 'phaser';
import { MusicPlayer } from '../systems/audio/MusicPlayer';
import { attachFileSfx } from '../systems/audio/AudioAssets';

let player: MusicPlayer | null = null;

/**
 * T-97 wiring: one music player for the whole game (its sound manager and cache are game-wide),
 * created on first use, with the file sound effects attached at the same time. Scenes call
 * playMenu / playForMap / playBattle / playBoss / playStory / playEnding; tracks cross-fade,
 * the same track carries on across maps, and missing files fall back to the procedural music.
 */
export function music(scene: Phaser.Scene): MusicPlayer {
  if (!player) {
    player = MusicPlayer.fromScene(scene);
    attachFileSfx(scene);
  }
  return player;
}

/** The two last fights of Chapter 9 get the final-boss theme. */
export const FINAL_BOSSES = new Set(['boss_sixfold_divinity', 'boss_kuro_puppet_master']);
