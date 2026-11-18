import { loadActionSheets, registerActionAnims } from '../world/action/ActorActions';
import type { MapDatabase } from '../world/MapTypes';
import type { LpcData } from '../world/WallCaps';
import Phaser from 'phaser';
import {
  PETER_FRAME,
  PETER_STAGES,
  peterStageKey,
} from '../systems/animation/PeterAnimationConfig';
import { queueAudio } from '../systems/audio/AudioAssets';

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
    // T-88 v4 (owner, 2026-11-17): Peter in the áo tấc, 64x64 frames, three costume stages
    // (`peter_*`, `peter_s2_*`, `peter_s3_*`; scripts/author-peter-lpc.js, PeterAnimationConfig).
    for (const stage of PETER_STAGES)
      for (const base of [
        'peter_idle',
        'peter_walk',
        'peter_idle_unarmed',
        'peter_walk_unarmed',
        'peter_run',
        'peter_attack',
        'peter_hurt',
        'peter_temporal_sight',
        'peter_dash',
        'peter_shoot',
      ]) {
        const key = peterStageKey(base, stage);
        this.load.spritesheet(key, `assets/characters/peter/${key}.png`, {
          frameWidth: PETER_FRAME,
          frameHeight: PETER_FRAME,
        });
      }
    // Elder Chronographer idle (NPC_ELDER_001): 4 frames, 64x64 at the LPC scale (T-88 step 2,
    // scripts/lpc/npcs.mjs).
    this.load.spritesheet('npc_elder', 'assets/lpc/npcs/elder_idle.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    // Temporal Shade float loop (MOB_SHADE_001): 4 frames, 64x64 at the LPC scale (scripts/author-monsters.js).
    this.load.spritesheet('enemy_fracture', 'assets/enemies/v2/shade_float.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    // Cô Ba (NPC_VENDOR_BA_001): 4-frame idle, 64x64 at the LPC scale.
    this.load.spritesheet('npc_vendor_ba', 'assets/lpc/npcs/vendor_ba_idle.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    // Ông Sáu (NPC_FISHERMAN_SAU_001): 4-frame idle; the forgotten child (NPC_FORGOTTEN_CHILD_001):
    // 2-frame flicker, semi-transparent.
    this.load.spritesheet('npc_fisherman_sau', 'assets/lpc/npcs/fisherman_sau_idle.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    // Chapter 1: old lighthouse keeper (NPC_OLD_KEEPER_001), Drowned Drifter (MOB_DRIFTER_001),
    // The Sunken Bellkeeper (BOSS_BELLKEEPER_001, 64x64, frame 4 = released).
    this.load.spritesheet('npc_old_keeper', 'assets/lpc/npcs/old_keeper_idle.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('enemy_drifter', 'assets/enemies/v2/drifter_float.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet('boss_bellkeeper', 'assets/enemies/v2/bellkeeper.png', {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet('npc_forgotten_child', 'assets/lpc/npcs/forgotten_child_idle.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
    // The Drowned Sentinel (BOSS_SENTINEL_001): frames 0-3 idle, 4 released (kneeling), 64x64.
    this.load.spritesheet('boss_sentinel', 'assets/enemies/v2/sentinel.png', {
      frameWidth: 96,
      frameHeight: 96,
    });

    // Chapter 2 (T-53, owner approved 2026-11-13): Lyra, the Exiled Praetor, Imperial Automaton,
    // Causality Enforcer (32x32 x4) and The Imperial Verdict (64x64, frame 4 = released).
    for (const [key, file, size] of [
      ['npc_lyra', 'assets/lpc/npcs/lyra_idle.png', 64],
      ['npc_exiled_praetor', 'assets/lpc/npcs/exiled_praetor_idle.png', 64],
      ['enemy_imperial_automaton', 'assets/lpc/enemies/imperial_automaton.png', 64],
      ['enemy_causality_enforcer', 'assets/lpc/enemies/causality_enforcer.png', 64],
      ['boss_imperial_verdict', 'assets/enemies/v2/imperial_verdict.png', 96],
      // Chapter 3 (T-58, owner approved 2026-11-13).
      ['npc_neris', 'assets/lpc/npcs/neris_idle.png', 64],
      ['npc_amnesiac_king', 'assets/lpc/npcs/amnesiac_king_idle.png', 64],
      ['enemy_memory_wraith', 'assets/enemies/v2/memory_wraith.png', 64],
      ['enemy_thought_eater', 'assets/enemies/v2/thought_eater.png', 64],
      ['enemy_hollow_archivist', 'assets/lpc/enemies/hollow_archivist.png', 64],
      ['boss_faceless_keeper', 'assets/enemies/v2/faceless_keeper.png', 96],
      ['boss_nameless_choir', 'assets/enemies/v2/nameless_choir.png', 96],
      // Chapter 4 (T-64; owner delegated Chapter 4 to Claude 2026-11-14, reviews in playtest).
      ['npc_aldric', 'assets/lpc/npcs/aldric_idle.png', 64],
      ['npc_kaelen', 'assets/lpc/npcs/kaelen_idle.png', 64],
      ['npc_soldier_bran', 'assets/lpc/npcs/soldier_bran_idle.png', 64],
      ['npc_chronicler_elion', 'assets/lpc/npcs/chronicler_elion_idle.png', 64],
      ['npc_renard', 'assets/lpc/npcs/renard_idle.png', 64],
      ['npc_kuro', 'assets/lpc/npcs/kuro_idle.png', 64],
      ['enemy_ghost_sniper', 'assets/lpc/enemies/ghost_sniper.png', 64],
      ['enemy_endless_phalanx', 'assets/lpc/enemies/endless_phalanx.png', 64],
      ['enemy_banner_carrier', 'assets/lpc/enemies/banner_carrier.png', 64],
      ['enemy_undying_knight', 'assets/lpc/enemies/undying_knight.png', 64],
      ['boss_crimson_standard', 'assets/enemies/v2/crimson_standard.png', 96],
      ['boss_the_last_war', 'assets/enemies/v2/the_last_war.png', 96],
      // Chapter 5 (owner approved 2026-11-14).
      ['npc_ivo', 'assets/lpc/npcs/ivo_idle.png', 64],
      ['npc_mira', 'assets/lpc/npcs/mira_idle.png', 64],
      ['enemy_branch_phantom', 'assets/enemies/v2/branch_phantom.png', 64],
      ['enemy_unborn_cocoon', 'assets/enemies/v2/unborn_cocoon.png', 64],
      ['enemy_unborn_horror', 'assets/enemies/v2/unborn_horror.png', 64],
      ['enemy_paradox_crystal', 'assets/enemies/v2/paradox_crystal.png', 64],
      ['enemy_chronos_gardener', 'assets/enemies/v2/chronos_gardener.png', 64],
      ['boss_other_peter', 'assets/enemies/v2/other_peter.png', 96],
      ['boss_unborn_king', 'assets/enemies/v2/unborn_king.png', 96],
      // Chapter 6 (owner approved 2026-11-14).
      ['npc_chronos_remnant', 'assets/lpc/npcs/chronos_remnant_idle.png', 64],
      ['npc_solon', 'assets/lpc/npcs/solon_idle.png', 64],
      ['enemy_heel_shadow', 'assets/lpc/enemies/heel_shadow.png', 64],
      ['enemy_origin_nullifier', 'assets/enemies/v2/origin_nullifier.png', 64],
      ['enemy_archon_construct', 'assets/enemies/v2/archon_construct.png', 64],
      ['enemy_twin_star', 'assets/enemies/twin_star.png', 16],
      ['boss_broken_herald', 'assets/enemies/v2/broken_herald.png', 96],
      ['boss_remnant_deacon', 'assets/enemies/v2/remnant_deacon.png', 96],
      ['boss_echo_forgotten', 'assets/enemies/v2/echo_forgotten.png', 96],
      ['boss_genesis_warden', 'assets/enemies/v2/genesis_warden.png', 96],
      // Chapter 7 (owner approved 2026-11-15).
      ['npc_kuro_void', 'assets/lpc/npcs/kuro_void_idle.png', 64],
      ['npc_kuro_mother', 'assets/lpc/npcs/kuro_mother_idle.png', 64],
      ['npc_nameless_shade', 'assets/lpc/npcs/nameless_shade_idle.png', 64],
      ['npc_first_forgotten', 'assets/lpc/npcs/first_forgotten_idle.png', 96],
      ['enemy_name_eater', 'assets/enemies/v2/name_eater.png', 64],
      ['enemy_hollow_husk', 'assets/lpc/enemies/hollow_husk.png', 64],
      ['enemy_erasure_moths', 'assets/enemies/v2/erasure_moths.png', 64],
      ['enemy_ink_hound', 'assets/enemies/v2/ink_hound.png', 64],
      ['enemy_void_inquisitor', 'assets/lpc/enemies/void_inquisitor.png', 64],
      ['boss_nameless_weeper', 'assets/enemies/v2/nameless_weeper.png', 96],
      ['boss_kuro_void', 'assets/lpc/enemies/kuro_boss.png', 96],
      ['boss_primordial_shade', 'assets/enemies/v2/primordial_shade.png', 96],
      // Chapter 8 (owner approved 2026-11-15).
      ['npc_chronos_reborn', 'assets/lpc/npcs/chronos_reborn_idle.png', 96],
      ['enemy_assimilator', 'assets/enemies/v2/assimilator.png', 64],
      ['enemy_phase_wraith', 'assets/enemies/v2/phase_wraith.png', 64],
      ['enemy_doom_bell', 'assets/enemies/v2/doom_bell.png', 64],
      ['enemy_twin_era_legionnaire', 'assets/lpc/enemies/twin_era_legionnaire.png', 64],
      ['enemy_second_hand_warden', 'assets/lpc/enemies/second_hand_warden.png', 64],
      ['boss_convergent_praetor', 'assets/enemies/v2/convergent_praetor.png', 96],
      ['boss_null_hour_herald', 'assets/enemies/v2/null_hour_herald.png', 96],
      ['boss_sixfold_echo', 'assets/enemies/v2/sixfold_echo.png', 96],
      // Chapter 9 (owner approved 2026-11-15).
      ['enemy_nexus_sentinel', 'assets/lpc/enemies/nexus_sentinel.png', 64],
      ['enemy_entropy_specter', 'assets/enemies/v2/entropy_specter.png', 64],
      ['enemy_chronal_juggernaut', 'assets/enemies/v2/chronal_juggernaut.png', 64],
      ['enemy_paradox_weaver', 'assets/enemies/v2/paradox_weaver.png', 64],
      ['enemy_nexus_inquisitor', 'assets/lpc/enemies/nexus_inquisitor.png', 64],
      ['boss_lieutenant_bran', 'assets/lpc/enemies/lieutenant_bran.png', 96],
      ['boss_lieutenant_lyra', 'assets/lpc/enemies/lieutenant_lyra.png', 96],
      ['boss_lieutenant_neris', 'assets/lpc/enemies/lieutenant_neris.png', 96],
      ['boss_lieutenant_other_peter', 'assets/enemies/v2/lieutenant_other_peter.png', 96],
      ['boss_kuro_puppet_master', 'assets/lpc/enemies/kuro_puppet_master.png', 96],
      ['boss_primeval_architect', 'assets/enemies/v2/primeval_architect.png', 96],
      ['boss_sixfold_divinity', 'assets/enemies/v2/sixfold_divinity.png', 96],
      ['boss_void_singularity_core', 'assets/enemies/v2/void_singularity_core.png', 96],
    ] as const) {
      this.load.spritesheet(key, file, { frameWidth: size, frameHeight: size });
    }

    // 2. Maps & tilesets: every map listed in maps.json is queued once that file has loaded.
    this.load.once('filecomplete-json-data_maps', (_key: string, _type: string, data: unknown) => {
      for (const map of Object.values((data as MapDatabase).maps)) {
        if (!this.textures.exists(map.tileset.key)) {
          this.load.image(map.tileset.key, map.tileset.path);
        }
        if (map.propTileset && !this.textures.exists(map.propTileset.key))
          this.load.image(map.propTileset.key, map.propTileset.path);
        this.load.tilemapTiledJSON(map.tilemap.key, map.tilemap.path);
      }
    });
    this.load.json('data_maps', 'assets/data/maps.json');
    // T-97: music files (art-source/audio/manifest.json); missing ones stay procedural.
    queueAudio(this.load);
    // T-88: LPC wall tops per tileset (scripts/lpc/reskin.mjs), drawn above walkable tiles.
    this.load.once('filecomplete-json-data_lpc', (_key: string, _type: string, data: unknown) => {
      for (const ts of Object.values((data as LpcData).tilesets))
        for (const sheet of [ts.caps, ts.edges])
          if (sheet)
            this.load.spritesheet(sheet.key, sheet.path, { frameWidth: 32, frameHeight: 32 });
    });
    this.load.json('data_lpc', 'assets/data/lpc.json');

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
    this.load.json('data_skills', 'assets/data/skills.json');
    // Action frames (attack, hurt, death) for every monster, boss and Peter (owner, 2026-11-18).
    loadActionSheets(this.load);
    this.load.json('data_equipment', 'assets/data/equipment.json');
    // T-84: real-time boss profiles (bosses without one stay turn-based).
    this.load.json('data_bosses', 'assets/data/bosses.json');
    // Map lights, camera grade and motes (free Phaser features; L toggles them).
    this.load.json('data_atmosphere', 'assets/data/atmosphere.json');
    this.load.json('data_neon', 'assets/data/neon.json');
    this.load.json('data_items', 'assets/data/items.json');
    this.load.json('data_player', 'assets/data/player.json');
    this.load.json('data_strings', 'assets/data/strings.json');
  }

  public create(): void {
    registerActionAnims(this);
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
      ['npc_ivo_idle', 'npc_ivo', 3, 3],
      ['npc_mira_idle', 'npc_mira', 3, 4],
      ['enemy_branch_phantom_idle', 'enemy_branch_phantom', 3, 3],
      ['enemy_unborn_cocoon_idle', 'enemy_unborn_cocoon', 3, 4],
      ['enemy_unborn_horror_idle', 'enemy_unborn_horror', 3, 6],
      ['enemy_paradox_crystal_idle', 'enemy_paradox_crystal', 3, 5],
      ['enemy_chronos_gardener_idle', 'enemy_chronos_gardener', 3, 4],
      ['boss_other_peter_idle', 'boss_other_peter', 3, 4],
      ['boss_unborn_king_idle', 'boss_unborn_king', 3, 4],
      ['npc_chronos_remnant_idle', 'npc_chronos_remnant', 3, 3],
      ['npc_solon_idle', 'npc_solon', 3, 3],
      ['enemy_heel_shadow_idle', 'enemy_heel_shadow', 3, 6],
      ['enemy_origin_nullifier_idle', 'enemy_origin_nullifier', 3, 5],
      ['enemy_archon_construct_idle', 'enemy_archon_construct', 3, 4],
      ['enemy_twin_star_idle', 'enemy_twin_star', 3, 6],
      ['boss_broken_herald_idle', 'boss_broken_herald', 3, 4],
      ['boss_remnant_deacon_idle', 'boss_remnant_deacon', 3, 4],
      ['boss_echo_forgotten_idle', 'boss_echo_forgotten', 3, 4],
      ['boss_genesis_warden_idle', 'boss_genesis_warden', 3, 4],
      ['npc_kuro_void_idle', 'npc_kuro_void', 3, 3],
      ['npc_kuro_mother_idle', 'npc_kuro_mother', 3, 3],
      ['npc_nameless_shade_idle', 'npc_nameless_shade', 3, 3],
      ['npc_first_forgotten_idle', 'npc_first_forgotten', 3, 2],
      ['enemy_name_eater_idle', 'enemy_name_eater', 3, 5],
      ['enemy_hollow_husk_idle', 'enemy_hollow_husk', 3, 4],
      ['enemy_erasure_moths_idle', 'enemy_erasure_moths', 3, 8],
      ['enemy_ink_hound_idle', 'enemy_ink_hound', 3, 7],
      ['enemy_void_inquisitor_idle', 'enemy_void_inquisitor', 3, 4],
      ['boss_nameless_weeper_idle', 'boss_nameless_weeper', 3, 4],
      ['boss_kuro_void_idle', 'boss_kuro_void', 3, 4],
      ['boss_primordial_shade_idle', 'boss_primordial_shade', 3, 4],
      ['npc_chronos_reborn_idle', 'npc_chronos_reborn', 3, 2],
      ['enemy_assimilator_idle', 'enemy_assimilator', 3, 3],
      ['enemy_phase_wraith_idle', 'enemy_phase_wraith', 3, 3],
      ['enemy_doom_bell_idle', 'enemy_doom_bell', 3, 3],
      ['enemy_twin_era_legionnaire_idle', 'enemy_twin_era_legionnaire', 2, 4],
      ['enemy_second_hand_warden_idle', 'enemy_second_hand_warden', 3, 4],
      ['boss_convergent_praetor_idle', 'boss_convergent_praetor', 3, 4],
      ['boss_null_hour_herald_idle', 'boss_null_hour_herald', 3, 3],
      ['boss_sixfold_echo_idle', 'boss_sixfold_echo', 5, 3],
      ['enemy_nexus_sentinel_idle', 'enemy_nexus_sentinel', 3, 6],
      ['enemy_entropy_specter_idle', 'enemy_entropy_specter', 3, 6],
      ['enemy_chronal_juggernaut_idle', 'enemy_chronal_juggernaut', 3, 6],
      ['enemy_paradox_weaver_idle', 'enemy_paradox_weaver', 3, 6],
      ['enemy_nexus_inquisitor_idle', 'enemy_nexus_inquisitor', 3, 6],
      ['boss_lieutenant_bran_idle', 'boss_lieutenant_bran', 3, 4],
      ['boss_lieutenant_lyra_idle', 'boss_lieutenant_lyra', 3, 4],
      ['boss_lieutenant_neris_idle', 'boss_lieutenant_neris', 3, 4],
      ['boss_lieutenant_other_peter_idle', 'boss_lieutenant_other_peter', 3, 4],
      ['boss_kuro_puppet_master_idle', 'boss_kuro_puppet_master', 3, 4],
      ['boss_primeval_architect_idle', 'boss_primeval_architect', 3, 4],
      ['boss_sixfold_divinity_idle', 'boss_sixfold_divinity', 3, 4],
      ['boss_void_singularity_core_idle', 'boss_void_singularity_core', 3, 4],
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
