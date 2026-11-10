import Phaser from 'phaser';
import { GameConfig } from './config';

declare global {
  interface Window {
    __GAME__?: Phaser.Game;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const game = new Phaser.Game(GameConfig);
  window.__GAME__ = game;
});
