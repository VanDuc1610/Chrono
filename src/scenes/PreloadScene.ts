import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;
  private percentText!: Phaser.GameObjects.Text;
  private assetLoadedText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  public preload(): void {
    const { width, height } = this.scale;

    // Background visual container
    this.add.rectangle(width / 2, height / 2, width, height, 0x090a12);

    // Title / Logo text during boot
    this.add
      .text(width / 2, height / 2 - 60, 'CHRONO', {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#67d1ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 38, 'THE FRACTURED DIVINITY', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#a0a8c2',
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    // Progress Bar box
    const barWidth = 260;
    const barHeight = 14;
    const barX = width / 2 - barWidth / 2;
    const barY = height / 2 + 10;

    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x1a1e2d, 0.85);
    this.progressBox.lineStyle(1, 0x3d4766, 1);
    this.progressBox.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
    this.progressBox.fillRect(barX, barY, barWidth, barHeight);

    this.progressBar = this.add.graphics();

    this.loadingText = this.add
      .text(width / 2, barY - 14, 'Initializing Chronal Stream...', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#8b97b8',
      })
      .setOrigin(0.5);

    this.percentText = this.add
      .text(width / 2, barY + barHeight + 12, '0%', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#67d1ff',
      })
      .setOrigin(0.5);

    this.assetLoadedText = this.add
      .text(width / 2, barY + barHeight + 26, '', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#556080',
      })
      .setOrigin(0.5);

    // Asset Loader callbacks
    this.load.on('progress', (value: number) => {
      this.percentText.setText(`${Math.floor(value * 100)}%`);
      this.progressBar.clear();
      this.progressBar.fillStyle(0x00c8ff, 1);
      this.progressBar.fillRect(barX + 2, barY + 2, (barWidth - 4) * value, barHeight - 4);
    });

    this.load.on('fileprogress', (file: Phaser.Loader.File) => {
      this.assetLoadedText.setText(`Loading: ${file.key}`);
    });

    this.load.on('complete', () => {
      this.loadingText.setText('Temporal Nexus Synchronized');
    });

    // 1. Character & Entities
    this.load.image('player_placeholder', 'assets/characters/player_placeholder.png');
    this.load.spritesheet('peter_idle', 'assets/characters/peter/peter_idle.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('peter_walk', 'assets/characters/peter/peter_walk.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('peter_run', 'assets/characters/peter/peter_run.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('peter_attack', 'assets/characters/peter/peter_attack.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('peter_hurt', 'assets/characters/peter/peter_hurt.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet(
      'peter_temporal_sight',
      'assets/characters/peter/peter_temporal_sight.png',
      { frameWidth: 32, frameHeight: 32 },
    );
    this.load.image('npc_elder', 'assets/npcs/npc_elder_placeholder.png');
    // Temporal Shade float loop (MOB_SHADE_001, approved Pipeline B art): 4 frames, 32x32.
    this.load.spritesheet('enemy_fracture', 'assets/enemies/shade_float.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    // 2. Environment & Tilesets
    this.load.image('dungeon_tileset', 'assets/tilesets/dungeon_tileset.png');
    this.load.tilemapTiledJSON('prologue_map', 'assets/maps/prologue_map.json');

    // 3. UI & FX
    this.load.image('ui_frame', 'assets/ui/ui_frame.png');
    this.load.image('ui_cursor', 'assets/ui/ui_cursor.png');
    this.load.image('hit_spark', 'assets/effects/hit_spark.png');

    // 4. External Data JSONs
    this.load.json('data_dialogue', 'assets/data/dialogue.json');
    this.load.json('data_quests', 'assets/data/quests.json');
    this.load.json('data_enemies', 'assets/data/enemies.json');
    this.load.json('data_items', 'assets/data/items.json');
    this.load.json('data_player', 'assets/data/player.json');
  }

  public create(): void {
    // Global looping idle animations, keyed `<textureKey>_idle` (scenes play them if present).
    if (!this.anims.exists('enemy_fracture_idle')) {
      this.anims.create({
        key: 'enemy_fracture_idle',
        frames: this.anims.generateFrameNumbers('enemy_fracture', { start: 0, end: 3 }),
        frameRate: 6, // SHADE_DESIGN §4: 4-frame float, 6 FPS
        repeat: -1,
      });
    }

    // Brief transition delay for visual polish
    this.time.delayedCall(400, () => {
      this.scene.start('MainMenuScene');
    });
  }
}
