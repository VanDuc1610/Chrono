import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { ExplorationScene } from './scenes/ExplorationScene';
import { PrologueEndScene } from './scenes/PrologueEndScene';
import { PauseScene } from './scenes/PauseScene';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  // 768×432 (was 640×360): a little more of the map in view (owner, 2026-11-18).
  width: 768,
  height: 432,
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  backgroundColor: '#0c0e17',
  scene: [BootScene, PreloadScene, MainMenuScene, ExplorationScene, PrologueEndScene, PauseScene],
};
