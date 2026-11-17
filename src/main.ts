import Phaser from 'phaser';
import { GameConfig } from './config';
import { installCrispText } from './ui/crispText';
import { installComfort } from './ui/Comfort';

declare global {
  interface Window {
    __GAME__?: Phaser.Game;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  installCrispText();
  installComfort();
  const game = new Phaser.Game(GameConfig);
  window.__GAME__ = game;
});
