import type { MapDatabase } from '../world/MapTypes';
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
        fontSize: '12px',
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
        fontSize: '11px',
        color: '#8b97b8',
      })
      .setOrigin(0.5);

    this.percentText = this.add
      .text(width / 2, barY + barHeight + 12, '0%', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#67d1ff',
      })
      .setOrigin(0.5);

    this.assetLoadedText = this.add
      .text(width / 2, barY + barHeight + 26, '', {
        fontFamily: 'monospace',
        fontSize: '10px',
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
    // CHAR_PETER_004: empty-handed idle/walk (Prologue v3, before the Broken Blade).
    this.load.spritesheet('peter_idle_unarmed', 'assets/characters/peter/peter_idle_unarmed.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('peter_walk_unarmed', 'assets/characters/peter/peter_walk_unarmed.png', {
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
    // Elder Chronographer idle (NPC_ELDER_001, approved Pipeline B art): 4 frames, 32x32.
    this.load.spritesheet('npc_elder', 'assets/npcs/elder_idle.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    // Temporal Shade float loop (MOB_SHADE_001, approved Pipeline B art): 4 frames, 32x32.
    this.load.spritesheet('enemy_fracture', 'assets/enemies/shade_float.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    // Cô Ba (NPC_VENDOR_BA_001): 4-frame idle, 32x32.
    this.load.spritesheet('npc_vendor_ba', 'assets/npcs/vendor_ba_idle.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    // Ông Sáu (NPC_FISHERMAN_SAU_001): 4-frame idle; the forgotten child (NPC_FORGOTTEN_CHILD_001):
    // 2-frame flicker, semi-transparent.
    this.load.spritesheet('npc_fisherman_sau', 'assets/npcs/fisherman_sau_idle.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    // Chapter 1: old lighthouse keeper (NPC_OLD_KEEPER_001), Drowned Drifter (MOB_DRIFTER_001),
    // The Sunken Bellkeeper (BOSS_BELLKEEPER_001, 64x64, frame 4 = released).
    this.load.spritesheet('npc_old_keeper', 'assets/npcs/old_keeper_idle.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('enemy_drifter', 'assets/enemies/drifter_float.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('boss_bellkeeper', 'assets/enemies/bellkeeper.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('npc_forgotten_child', 'assets/npcs/forgotten_child_idle.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    // The Drowned Sentinel (BOSS_SENTINEL_001): frames 0-3 idle, 4 released (kneeling), 64x64.
    this.load.spritesheet('boss_sentinel', 'assets/enemies/sentinel.png', {
      frameWidth: 64,
      frameHeight: 64,
    });

    // Chapter 2 (T-53, owner approved 2026-11-13): Lyra, the Exiled Praetor, Imperial Automaton,
    // Causality Enforcer (32x32 x4) and The Imperial Verdict (64x64, frame 4 = released).
    for (const [key, file, size] of [
      ['npc_lyra', 'assets/npcs/lyra_idle.png', 32],
      ['npc_exiled_praetor', 'assets/npcs/exiled_praetor_idle.png', 32],
      ['enemy_imperial_automaton', 'assets/enemies/imperial_automaton.png', 32],
      ['enemy_causality_enforcer', 'assets/enemies/causality_enforcer.png', 32],
      ['boss_imperial_verdict', 'assets/enemies/imperial_verdict.png', 64],
      // Chapter 3 (T-58, owner approved 2026-11-13).
      ['npc_neris', 'assets/npcs/neris_idle.png', 32],
      ['npc_amnesiac_king', 'assets/npcs/amnesiac_king_idle.png', 32],
      ['enemy_memory_wraith', 'assets/enemies/memory_wraith.png', 32],
      ['enemy_thought_eater', 'assets/enemies/thought_eater.png', 32],
      ['enemy_hollow_archivist', 'assets/enemies/hollow_archivist.png', 32],
      ['boss_faceless_keeper', 'assets/enemies/faceless_keeper.png', 48],
      ['boss_nameless_choir', 'assets/enemies/nameless_choir.png', 64],
      // Chapter 4 (T-64; owner delegated Chapter 4 to Claude 2026-11-14, reviews in playtest).
      ['npc_aldric', 'assets/npcs/aldric_idle.png', 32],
      ['npc_kaelen', 'assets/npcs/kaelen_idle.png', 32],
      ['npc_soldier_bran', 'assets/npcs/soldier_bran_idle.png', 32],
      ['npc_chronicler_elion', 'assets/npcs/chronicler_elion_idle.png', 32],
      ['npc_renard', 'assets/npcs/renard_idle.png', 32],
      ['npc_kuro', 'assets/npcs/kuro_idle.png', 32],
      ['enemy_ghost_sniper', 'assets/enemies/ghost_sniper.png', 32],
      ['enemy_endless_phalanx', 'assets/enemies/endless_phalanx.png', 32],
      ['enemy_banner_carrier', 'assets/enemies/banner_carrier.png', 32],
      ['enemy_undying_knight', 'assets/enemies/undying_knight.png', 32],
      ['boss_crimson_standard', 'assets/enemies/crimson_standard.png', 48],
      ['boss_the_last_war', 'assets/enemies/the_last_war.png', 64],
    ] as const) {
      this.load.spritesheet(key, file, { frameWidth: size, frameHeight: size });
    }

    // 2. Maps & tilesets: every map listed in maps.json is queued once that file has loaded.
    this.load.once('filecomplete-json-data_maps', (_key: string, _type: string, data: unknown) => {
      for (const map of Object.values((data as MapDatabase).maps)) {
        if (!this.textures.exists(map.tileset.key)) {
          this.load.image(map.tileset.key, map.tileset.path);
        }
        this.load.tilemapTiledJSON(map.tilemap.key, map.tilemap.path);
      }
    });
    this.load.json('data_maps', 'assets/data/maps.json');

    // 3. UI & FX
    // UI_SET_001 (approved Pipeline B art): 48x48 nine-slice frame (16 px corners),
    // 2-frame cursor pulse, 4-frame near-white hit spark (tint at runtime).
    this.load.image('ui_frame', 'assets/ui/ui_frame.png');
    this.load.spritesheet('ui_cursor', 'assets/ui/ui_cursor.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet('hit_spark', 'assets/effects/hit_spark.png', {
      frameWidth: 16,
      frameHeight: 16,
    });

    // 4. External Data JSONs
    this.load.json('data_dialogue', 'assets/data/dialogue.json');
    this.load.json('data_quests', 'assets/data/quests.json');
    this.load.json('data_enemies', 'assets/data/enemies.json');
    this.load.json('data_items', 'assets/data/items.json');
    this.load.json('data_player', 'assets/data/player.json');
    this.load.json('data_strings', 'assets/data/strings.json');
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
    if (!this.anims.exists('npc_elder_idle')) {
      this.anims.create({
        key: 'npc_elder_idle',
        frames: this.anims.generateFrameNumbers('npc_elder', { start: 0, end: 3 }),
        frameRate: 4, // ELDER_DESIGN §5: 4-frame breathing cycle, 4 FPS
        repeat: -1,
      });
    }
    if (!this.anims.exists('npc_vendor_ba_idle')) {
      this.anims.create({
        key: 'npc_vendor_ba_idle',
        frames: this.anims.generateFrameNumbers('npc_vendor_ba', { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1,
      });
    }
    if (!this.anims.exists('npc_fisherman_sau_idle')) {
      this.anims.create({
        key: 'npc_fisherman_sau_idle',
        frames: this.anims.generateFrameNumbers('npc_fisherman_sau', { start: 0, end: 3 }),
        frameRate: 3,
        repeat: -1,
      });
    }
    if (!this.anims.exists('npc_forgotten_child_flicker')) {
      this.anims.create({
        key: 'npc_forgotten_child_flicker',
        frames: this.anims.generateFrameNumbers('npc_forgotten_child', { start: 0, end: 1 }),
        frameRate: 4,
        repeat: -1,
      });
    }
    for (const [key, texture, end, rate] of [
      ['npc_old_keeper_idle', 'npc_old_keeper', 3, 4],
      ['enemy_drifter_idle', 'enemy_drifter', 3, 5],
      ['boss_bellkeeper_idle', 'boss_bellkeeper', 3, 4],
      ['npc_lyra_idle', 'npc_lyra', 3, 4],
      ['npc_exiled_praetor_idle', 'npc_exiled_praetor', 3, 3],
      ['enemy_imperial_automaton_idle', 'enemy_imperial_automaton', 3, 6],
      ['enemy_causality_enforcer_idle', 'enemy_causality_enforcer', 3, 5],
      ['boss_imperial_verdict_idle', 'boss_imperial_verdict', 3, 4],
      ['npc_neris_idle', 'npc_neris', 3, 4],
      ['npc_amnesiac_king_idle', 'npc_amnesiac_king', 3, 3],
      ['enemy_memory_wraith_idle', 'enemy_memory_wraith', 3, 6],
      ['enemy_thought_eater_idle', 'enemy_thought_eater', 3, 6],
      ['enemy_hollow_archivist_idle', 'enemy_hollow_archivist', 3, 4],
      ['boss_faceless_keeper_idle', 'boss_faceless_keeper', 3, 4],
      ['boss_nameless_choir_idle', 'boss_nameless_choir', 3, 5],
      ['npc_aldric_idle', 'npc_aldric', 3, 3],
      ['npc_kaelen_idle', 'npc_kaelen', 3, 3],
      ['npc_soldier_bran_idle', 'npc_soldier_bran', 3, 3],
      ['npc_chronicler_elion_idle', 'npc_chronicler_elion', 3, 3],
      ['npc_renard_idle', 'npc_renard', 3, 6],
      ['enemy_ghost_sniper_idle', 'enemy_ghost_sniper', 3, 5],
      ['enemy_endless_phalanx_idle', 'enemy_endless_phalanx', 3, 5],
      ['enemy_banner_carrier_idle', 'enemy_banner_carrier', 3, 5],
      ['enemy_undying_knight_idle', 'enemy_undying_knight', 3, 5],
      ['boss_crimson_standard_idle', 'boss_crimson_standard', 3, 4],
      ['boss_the_last_war_idle', 'boss_the_last_war', 3, 4],
    ] as const) {
      if (!this.anims.exists(key)) {
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(texture, { start: 0, end }),
          frameRate: rate,
          repeat: -1,
        });
      }
    }
    if (!this.anims.exists('npc_kuro_idle')) {
      // Kuro: idle with an occasional Interval flicker (frame 4).
      this.anims.create({
        key: 'npc_kuro_idle',
        frames: this.anims.generateFrameNumbers('npc_kuro', { frames: [0, 1, 2, 3, 0, 1, 4, 3] }),
        frameRate: 4,
        repeat: -1,
      });
    }
    if (!this.anims.exists('boss_sentinel_idle')) {
      this.anims.create({
        key: 'boss_sentinel_idle',
        frames: this.anims.generateFrameNumbers('boss_sentinel', { start: 0, end: 3 }),
        frameRate: 5,
        repeat: -1,
      });
    }
    if (!this.anims.exists('ui_cursor_pulse')) {
      this.anims.create({
        key: 'ui_cursor_pulse',
        frames: this.anims.generateFrameNumbers('ui_cursor', { start: 0, end: 1 }),
        frameRate: 3,
        repeat: -1,
      });
    }
    if (!this.anims.exists('hit_spark_burst')) {
      this.anims.create({
        key: 'hit_spark_burst',
        frames: this.anims.generateFrameNumbers('hit_spark', { start: 0, end: 3 }),
        frameRate: 16,
        repeat: 0,
        hideOnComplete: true,
      });
    }

    // Brief transition delay for visual polish
    this.time.delayedCall(400, () => {
      this.scene.start('MainMenuScene');
    });
  }
}
