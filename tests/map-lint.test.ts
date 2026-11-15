import { describe, expect, it } from 'vitest';
import tilemap0 from '../public/assets/maps/map_peters_room.json';
import tilemap1 from '../public/assets/maps/map_coastal_town.json';
import tilemap2 from '../public/assets/maps/prologue_map.json';
import tilemap3 from '../public/assets/maps/map_forgotten_forest.json';
import tilemap4 from '../public/assets/maps/map_old_lighthouse.json';
import tilemap5 from '../public/assets/maps/map_ch1_shore_gate.json';
import tilemap6 from '../public/assets/maps/map_ch1_abandoned_village.json';
import tilemap7 from '../public/assets/maps/map_ch1_sunset_beacon.json';
import tilemap8 from '../public/assets/maps/map_ch1_sunken_corridors.json';
import tilemap9 from '../public/assets/maps/map_ch1_bell_sanctum.json';
import tilemap10 from '../public/assets/maps/map_ch2_imperial_outskirts.json';
import tilemap11 from '../public/assets/maps/map_ch2_sunken_catacombs.json';
import tilemap12 from '../public/assets/maps/map_ch2_forum_plaza.json';
import tilemap13 from '../public/assets/maps/map_ch2_causality_archives.json';
import tilemap14 from '../public/assets/maps/map_ch2_verdict_sanctum.json';
import tilemap15 from '../public/assets/maps/map_ch3_sepulcher_gate.json';
import tilemap16 from '../public/assets/maps/map_ch3_silent_necropolis.json';
import tilemap17 from '../public/assets/maps/map_ch3_hall_of_echoes.json';
import tilemap18 from '../public/assets/maps/map_ch3_memory_vaults.json';
import tilemap19 from '../public/assets/maps/map_ch3_great_archive.json';
import tilemap20 from '../public/assets/maps/map_ch3_royal_mausoleum.json';
import tilemap21 from '../public/assets/maps/map_ch3_choir_sanctum.json';
import tilemap22 from '../public/assets/maps/map_ch3_forgotten_vault.json';
import tilemap23 from '../public/assets/maps/map_ch4_encampment_veridia.json';
import tilemap24 from '../public/assets/maps/map_ch4_trench_crossroads.json';
import tilemap25 from '../public/assets/maps/map_ch4_encampment_solkaris.json';
import tilemap26 from '../public/assets/maps/map_ch4_arrow_storm_valley.json';
import tilemap27 from '../public/assets/maps/map_ch4_red_ridge_battlefield.json';
import tilemap28 from '../public/assets/maps/map_ch4_crimson_redoubt.json';
import tilemap29 from '../public/assets/maps/map_ch4_fallen_ramparts.json';
import tilemap30 from '../public/assets/maps/map_ch4_sentry_cellar.json';
import tilemap31 from '../public/assets/maps/map_ch4_ash_plains.json';
import tilemap32 from '../public/assets/maps/map_ch4_tomb_of_the_first_fallen.json';
import tilemap33 from '../public/assets/maps/map_ch4_monument_of_the_fallen.json';
import tilemap34 from '../public/assets/maps/map_ch4_sanctum_of_finality.json';
import tilemap35 from '../public/assets/maps/map_ch4_interval_sanctuary.json';
import tilemap36 from '../public/assets/maps/map_ch5_interval_shore.json';
import tilemap37 from '../public/assets/maps/map_ch5_seed_garden.json';
import tilemap38 from '../public/assets/maps/map_ch5_glass_greenhouse.json';
import tilemap39 from '../public/assets/maps/map_ch5_alpha_town.json';
import tilemap40 from '../public/assets/maps/map_ch5_alpha_harbor.json';
import tilemap41 from '../public/assets/maps/map_ch5_alpha_clockshop.json';
import tilemap42 from '../public/assets/maps/map_ch5_pruner_tower.json';
import tilemap43 from '../public/assets/maps/map_ch5_beta_city.json';
import tilemap44 from '../public/assets/maps/map_ch5_observatory_ruins.json';
import tilemap45 from '../public/assets/maps/map_ch5_chronos_reactor.json';
import tilemap46 from '../public/assets/maps/map_ch5_children_shelter.json';
import tilemap47 from '../public/assets/maps/map_ch5_grey_prune.json';
import tilemap48 from '../public/assets/maps/map_ch5_kuro_asks.json';
import tilemap49 from '../public/assets/maps/map_ch5_unborn_throne.json';
import tilemap50 from '../public/assets/maps/map_ch5_collision_shore.json';
import tilemap51 from '../public/assets/maps/map_ch5_uprooted_garden.json';
import tilemap52 from '../public/assets/maps/map_ch5_old_seeds.json';
import tilemap53 from '../public/assets/maps/map_ch6_celestial_stairs.json';
import tilemap54 from '../public/assets/maps/map_ch6_outer_courtyard.json';
import tilemap55 from '../public/assets/maps/map_ch6_hall_of_pillars.json';
import tilemap56 from '../public/assets/maps/map_ch6_herald_roost.json';
import tilemap57 from '../public/assets/maps/map_ch6_fracture_nave.json';
import tilemap58 from '../public/assets/maps/map_ch6_gallery_of_eras.json';
import tilemap59 from '../public/assets/maps/map_ch6_frozen_cascade.json';
import tilemap60 from '../public/assets/maps/map_ch6_archives_ruins.json';
import tilemap61 from '../public/assets/maps/map_ch6_secret_chronos_cell.json';
import tilemap62 from '../public/assets/maps/map_ch6_genesis_core.json';
import tilemap63 from '../public/assets/maps/map_ch6_bell_sanctuary.json';
import tilemap64 from '../public/assets/maps/map_ch6_refraction_maze.json';
import tilemap65 from '../public/assets/maps/map_ch6_threshold_gate.json';
import tilemap66 from '../public/assets/maps/map_ch6_celestial_chessboard.json';
import tilemap67 from '../public/assets/maps/map_ch6_sanctum_approach.json';
import tilemap68 from '../public/assets/maps/map_ch6_hall_of_thrones.json';
import tilemap69 from '../public/assets/maps/map_ch6_first_void_abyss.json';
import tilemap70 from '../public/assets/maps/map_ch6_first_forgotten_nook.json';
import tilemap71 from '../public/assets/maps/map_ch7_ash_abyss_drop.json';
import tilemap72 from '../public/assets/maps/map_ch7_faded_shore.json';
import tilemap73 from '../public/assets/maps/map_ch7_erased_hamlet.json';
import tilemap74 from '../public/assets/maps/map_ch7_cradle_sanctuary.json';
import tilemap75 from '../public/assets/maps/map_ch7_echo_well_depths.json';
import tilemap76 from '../public/assets/maps/map_ch7_stranded_fleet.json';
import tilemap77 from '../public/assets/maps/map_ch7_clock_graveyard.json';
import tilemap78 from '../public/assets/maps/map_ch7_weeper_crossing.json';
import tilemap79 from '../public/assets/maps/map_ch7_first_mason_tomb.json';
import tilemap80 from '../public/assets/maps/map_ch7_blank_archives.json';
import tilemap81 from '../public/assets/maps/map_ch7_bang_tree_promontory.json';
import tilemap82 from '../public/assets/maps/map_ch7_fog_lullaby_maze.json';
import tilemap83 from '../public/assets/maps/map_ch7_white_bell_crypt.json';
import tilemap84 from '../public/assets/maps/map_ch7_chain_cathedral.json';
import tilemap85 from '../public/assets/maps/map_ch7_void_fissure_pass.json';
import tilemap86 from '../public/assets/maps/map_ch7_ink_lake_throne.json';
import tilemap87 from '../public/assets/maps/map_ch7_cradle_of_dawn.json';
import tilemap88 from '../public/assets/maps/map_ch7_glass_ash_core.json';
import tilemap89 from '../public/assets/maps/map_ch7_null_hour_threshold.json';
import mapsJson from '../public/assets/data/maps.json';
import dialogueJson from '../public/assets/data/dialogue.json';
import {
  lintMaps,
  type MapLintData,
  type LintFinding,
  type LintTilemap,
} from '../src/world/MapLint';
import type { MapDatabase, MapDefinition } from '../src/world/MapTypes';
import type { DialogueDatabase } from '../src/systems/dialogue/DialogueTypes';

// Explicit snapshot: remove fixed entries rather than silently widening the baseline.
const KNOWN: { finding: LintFinding; reason: string }[] = [
  {
    finding: {
      mapId: 'map_peters_room',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger trig_teach_skill contains spawn default',
      x: 3,
      y: 4,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_peters_room',
      rule: 'spawn-near-exit',
      severity: 'error',
      message: 'spawn from_town is within 2 tiles of exit room_to_town',
      x: 7,
      y: 8,
    },
    reason: 'Move spawn at least two tiles from every exit area.',
  },
  {
    finding: {
      mapId: 'map_peters_room',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger trig_teach_skill contains spawn from_town',
      x: 7,
      y: 8,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_peters_room',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger trig_teach_skill contains spawn rest',
      x: 4,
      y: 5,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_coastal_town',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger trig_time_stops contains spawn default',
      x: 5,
      y: 6,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_coastal_town',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger trig_after_hunt contains spawn default',
      x: 5,
      y: 6,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_coastal_town',
      rule: 'spawn-near-exit',
      severity: 'error',
      message: 'spawn from_house is within 2 tiles of exit town_to_room',
      x: 5,
      y: 5,
    },
    reason: 'Move spawn at least two tiles from every exit area.',
  },
  {
    finding: {
      mapId: 'map_coastal_town',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger trig_time_stops contains spawn from_house',
      x: 5,
      y: 5,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_coastal_town',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger trig_after_hunt contains spawn from_house',
      x: 5,
      y: 5,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_coastal_town',
      rule: 'spawn-near-exit',
      severity: 'error',
      message: 'spawn from_forest is within 2 tiles of exit town_to_forest',
      x: 25,
      y: 1,
    },
    reason: 'Move spawn at least two tiles from every exit area.',
  },
  {
    finding: {
      mapId: 'map_coastal_town',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger trig_time_stops contains spawn from_forest',
      x: 25,
      y: 1,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_coastal_town',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger trig_after_hunt contains spawn from_forest',
      x: 25,
      y: 1,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_coastal_town',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain town_time_stops sets time_frozen without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_shattered_antechamber',
      rule: 'spawn-near-exit',
      severity: 'error',
      message: 'spawn from_lighthouse is within 2 tiles of exit antechamber_to_lighthouse',
      x: 12,
      y: 3,
    },
    reason: 'Move spawn at least two tiles from every exit area.',
  },
  {
    finding: {
      mapId: 'map_ch1_shore_gate',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger trig_shore_loop_first contains spawn from_village',
      x: 19,
      y: 8,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch1_shore_gate',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger trig_shore_loop contains spawn from_village',
      x: 19,
      y: 8,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch1_abandoned_village',
      rule: 'spawn-near-exit',
      severity: 'error',
      message: 'spawn default is within 2 tiles of exit village_to_shore',
      x: 1,
      y: 10,
    },
    reason: 'Move spawn at least two tiles from every exit area.',
  },
  {
    finding: {
      mapId: 'map_ch1_abandoned_village',
      rule: 'spawn-near-exit',
      severity: 'error',
      message: 'spawn from_shore is within 2 tiles of exit village_to_shore',
      x: 1,
      y: 10,
    },
    reason: 'Move spawn at least two tiles from every exit area.',
  },
  {
    finding: {
      mapId: 'map_ch1_abandoned_village',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger trig_village_loop contains spawn from_beacon',
      x: 27,
      y: 4,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch1_sunset_beacon',
      rule: 'spawn-blocked',
      severity: 'error',
      message: 'spawn from_ruins is blocked before swaps',
      x: 19,
      y: 13,
    },
    reason: 'Move spawn onto a base walkable tile; conditional swaps may make this intentional.',
  },
  {
    finding: {
      mapId: 'map_ch1_sunken_corridors',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch1_mirror_1_ready sets ch1_mirror_1_aligned without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch1_sunken_corridors',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message:
        'chain ch1_mirror_1_fit_lens sets ch1_mirror_1_aligned without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch1_sunken_corridors',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message:
        'chain ch1_mirror_2_ready_ok sets ch1_mirror_2_aligned without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch1_sunken_corridors',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message:
        'chain ch1_mirror_3_ready_ok sets ch1_mirror_3_aligned without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch2_imperial_outskirts',
      rule: 'spawn-near-exit',
      severity: 'error',
      message: 'spawn from_catacombs is within 2 tiles of exit outskirts_to_catacombs',
      x: 18,
      y: 12,
    },
    reason: 'Move spawn at least two tiles from every exit area.',
  },
  {
    finding: {
      mapId: 'map_ch2_imperial_outskirts',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch2_elder_echo_farewell sets elder_echo_faded without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch2_sunken_catacombs',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch2_gate_opens sets unlocked_catacomb_gate without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch3_sepulcher_gate',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message:
        'chain ch3_elder_echo_farewell sets ch3_elder_echo_faded without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch3_sepulcher_gate',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message:
        'chain ch3_sepulcher_gate_locked sets opened_sepulcher_gate without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch3_silent_necropolis',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch3_hall_gate_opens sets opened_hall_gate without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch3_silent_necropolis',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message:
        'chain ch3_secret_vault_opens sets opened_forgotten_vault without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch3_memory_vaults',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger trig_keeper_meet contains spawn abyss_edge_east',
      x: 19,
      y: 11,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch3_royal_mausoleum',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message:
        'chain ch3_sanctum_door_opens sets opened_sanctum_door without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch4_encampment_solkaris',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch4_kaelen_intro sets met_general_kaelen without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch4_encampment_solkaris',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch4_kaelen_cold sets met_general_kaelen without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch4_arrow_storm_valley',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message:
        'chain ch4_beacon_tower_align sets silenced_arrow_storm without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch4_red_ridge_battlefield',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message:
        'chain ch4_banner_ward_broken sets solved_fallen_arms_array without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch4_fallen_ramparts',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger trig_ch4_ambush_cleared contains spawn default',
      x: 2,
      y: 8,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch4_fallen_ramparts',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger trig_ch4_ambush_cleared contains spawn from_redoubt',
      x: 2,
      y: 8,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch4_fallen_ramparts',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger trig_ch4_ambush_cleared contains spawn from_ash',
      x: 22,
      y: 8,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch4_fallen_ramparts',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger trig_ch4_ambush_cleared contains spawn from_cellar',
      x: 5,
      y: 11,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch4_fallen_ramparts',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger trig_ch4_ambush_cleared contains spawn revive',
      x: 2,
      y: 8,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch4_ash_plains',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message:
        'chain ch4_chariot_passage sets opened_chariot_passage without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch4_interval_sanctuary',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message:
        'chain ch4_kuro_direct_meeting sets met_kuro_first_time without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_interval_shore',
      rule: 'unreachable',
      severity: 'error',
      message: 'exit shore_to_garden cannot be reached',
      x: 23,
      y: 7,
    },
    reason: 'Review layout and open a route, or move the object to an accessible tile.',
  },
  {
    finding: {
      mapId: 'map_ch5_interval_shore',
      rule: 'unreachable',
      severity: 'error',
      message: 'object poi_map_ch5_interval_shore_sprout_20_6 cannot be reached',
      x: 20,
      y: 6,
    },
    reason: 'Review layout and open a route, or move the object to an accessible tile.',
  },
  {
    finding: {
      mapId: 'map_ch5_interval_shore',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch5_kuro_meet sets kuro_with_peter without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_seed_garden',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_paradox contains spawn gap_west',
      x: 14,
      y: 8,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_glass_greenhouse',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch5x_gardener_peace sets pacified_the_gardener without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_alpha_town',
      rule: 'spawn-near-exit',
      severity: 'error',
      message: 'spawn from_shop is within 2 tiles of exit alpha_to_shop',
      x: 6,
      y: 7,
    },
    reason: 'Move spawn at least two tiles from every exit area.',
  },
  {
    finding: {
      mapId: 'map_ch5_alpha_town',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_kuro_alpha contains spawn from_shop',
      x: 6,
      y: 7,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_pruner_tower',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_react_spared contains spawn default',
      x: 11,
      y: 13,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_pruner_tower',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_react_letter contains spawn default',
      x: 11,
      y: 13,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_pruner_tower',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_song contains spawn default',
      x: 11,
      y: 13,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_pruner_tower',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_song2 contains spawn default',
      x: 11,
      y: 13,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_pruner_tower',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_react_spared contains spawn from_town',
      x: 11,
      y: 13,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_pruner_tower',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_react_letter contains spawn from_town',
      x: 11,
      y: 13,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_pruner_tower',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_song contains spawn from_town',
      x: 11,
      y: 13,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_pruner_tower',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_song2 contains spawn from_town',
      x: 11,
      y: 13,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_pruner_tower',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_react_spared contains spawn from_beta',
      x: 19,
      y: 8,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_pruner_tower',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_react_letter contains spawn from_beta',
      x: 19,
      y: 8,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_pruner_tower',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_song contains spawn from_beta',
      x: 19,
      y: 8,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_pruner_tower',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_song2 contains spawn from_beta',
      x: 19,
      y: 8,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_pruner_tower',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_react_spared contains spawn from_attic',
      x: 11,
      y: 2,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_pruner_tower',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_react_letter contains spawn from_attic',
      x: 11,
      y: 2,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_pruner_tower',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_song contains spawn from_attic',
      x: 11,
      y: 2,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_pruner_tower',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_song2 contains spawn from_attic',
      x: 11,
      y: 2,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_pruner_tower',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_react_spared contains spawn revive',
      x: 11,
      y: 13,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_pruner_tower',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_react_letter contains spawn revive',
      x: 11,
      y: 13,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_pruner_tower',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_song contains spawn revive',
      x: 11,
      y: 13,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_pruner_tower',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_song2 contains spawn revive',
      x: 11,
      y: 13,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_beta_city',
      rule: 'spawn-near-exit',
      severity: 'error',
      message: 'spawn from_observatory is within 2 tiles of exit beta_to_observatory',
      x: 27,
      y: 2,
    },
    reason: 'Move spawn at least two tiles from every exit area.',
  },
  {
    finding: {
      mapId: 'map_ch5_beta_city',
      rule: 'unreachable',
      severity: 'error',
      message: 'exit beta_to_reactor cannot be reached',
      x: 29,
      y: 8,
    },
    reason: 'Review layout and open a route, or move the object to an accessible tile.',
  },
  {
    finding: {
      mapId: 'map_ch5_beta_city',
      rule: 'unreachable',
      severity: 'error',
      message: 'exit beta_to_observatory cannot be reached',
      x: 28,
      y: 1,
    },
    reason: 'Review layout and open a route, or move the object to an accessible tile.',
  },
  {
    finding: {
      mapId: 'map_ch5_beta_city',
      rule: 'unreachable',
      severity: 'error',
      message: 'object poi_ch5_seed_autumn cannot be reached',
      x: 25,
      y: 12,
    },
    reason: 'Review layout and open a route, or move the object to an accessible tile.',
  },
  {
    finding: {
      mapId: 'map_ch5_beta_city',
      rule: 'unreachable',
      severity: 'error',
      message: 'object poi_ch5_chalk_red cannot be reached',
      x: 26,
      y: 4,
    },
    reason: 'Review layout and open a route, or move the object to an accessible tile.',
  },
  {
    finding: {
      mapId: 'map_ch5_beta_city',
      rule: 'unreachable',
      severity: 'error',
      message: 'object poi_ch5_cell_6 cannot be reached',
      x: 15,
      y: 8,
    },
    reason: 'Review layout and open a route, or move the object to an accessible tile.',
  },
  {
    finding: {
      mapId: 'map_ch5_beta_city',
      rule: 'unreachable',
      severity: 'error',
      message: 'object poi_ch5_cell_9 cannot be reached',
      x: 18,
      y: 8,
    },
    reason: 'Review layout and open a route, or move the object to an accessible tile.',
  },
  {
    finding: {
      mapId: 'map_ch5_beta_city',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch5_cell_3_place sets ch5_cell_3_p without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_beta_city',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch5_cell_6_place sets ch5_cell_6_p without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_beta_city',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch5_cell_9_place sets ch5_cell_9_p without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_chronos_reactor',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch5_reactor_start sets restarted_reactor without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_children_shelter',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_promise contains spawn default',
      x: 2,
      y: 7,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_children_shelter',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_resolve contains spawn default',
      x: 2,
      y: 7,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_children_shelter',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_promise contains spawn from_reactor',
      x: 2,
      y: 7,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_children_shelter',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_resolve contains spawn from_reactor',
      x: 2,
      y: 7,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_children_shelter',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_promise contains spawn from_grey',
      x: 17,
      y: 7,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_children_shelter',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_resolve contains spawn from_grey',
      x: 17,
      y: 7,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_kuro_asks',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_duel contains spawn default',
      x: 2,
      y: 6,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_kuro_asks',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_duel contains spawn from_grey',
      x: 2,
      y: 6,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_kuro_asks',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch5_t_duel contains spawn from_throne',
      x: 15,
      y: 6,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_kuro_asks',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch5_kuro_smile sets kuro_left without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_kuro_asks',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch5_kuro_after_quiz_open sets kuro_left without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_kuro_asks',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch5_kuro_after_quiz sets kuro_left without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch5_unborn_throne',
      rule: 'unreachable',
      severity: 'error',
      message: 'exit throne_to_shore cannot be reached',
      x: 11,
      y: 0,
    },
    reason: 'Review layout and open a route, or move the object to an accessible tile.',
  },
  {
    finding: {
      mapId: 'map_ch5_collision_shore',
      rule: 'unreachable',
      severity: 'error',
      message: 'object poi_ch5_possibility_seal cannot be reached',
      x: 27,
      y: 4,
    },
    reason: 'Review layout and open a route, or move the object to an accessible tile.',
  },
  {
    finding: {
      mapId: 'map_ch6_outer_courtyard',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch6_gate1_right sets solved_ch6_gate_1 without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch6_frozen_cascade',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch6_a1_right sets froze_cascade_c05 without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch6_frozen_cascade',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch6_a2_right sets bridged_chasm_c05 without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch6_bell_sanctuary',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch6_t_kuro_bell contains spawn default',
      x: 2,
      y: 9,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch6_bell_sanctuary',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch6_t_kuro_bell contains spawn from_core',
      x: 2,
      y: 9,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch6_bell_sanctuary',
      rule: 'trigger-covers-spawn',
      severity: 'warning',
      message: 'trigger ch6_t_kuro_bell contains spawn from_ring',
      x: 21,
      y: 9,
    },
    reason:
      'Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch6_bell_sanctuary',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch6_bells_right sets solved_chime_bell without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch6_threshold_gate',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch6_threshold_right sets opened_threshold_gate without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch6_hall_of_thrones',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch6_remnant sets ch6_remnant_spoke without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch7_faded_shore',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch7_c01_right sets restored_bridge_keeper without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch7_echo_well_depths',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch7_c04_right sets balanced_echo_well without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch7_stranded_fleet',
      rule: 'unreachable',
      severity: 'error',
      message: 'exit fleet_to_well cannot be reached',
      x: 12,
      y: 0,
    },
    reason: 'Review layout and open a route, or move the object to an accessible tile.',
  },
  {
    finding: {
      mapId: 'map_ch7_stranded_fleet',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch7_c05_right sets solved_stranded_fleet without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch7_clock_graveyard',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch7_c06_right sets solved_clock_graveyard without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch7_bang_tree_promontory',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch7_c08_right sets opened_childhood_pledge_box without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch7_fog_lullaby_maze',
      rule: 'unreachable',
      severity: 'error',
      message: 'exit maze_to_tree cannot be reached',
      x: 12,
      y: 0,
    },
    reason: 'Review layout and open a route, or move the object to an accessible tile.',
  },
  {
    finding: {
      mapId: 'map_ch7_chain_cathedral',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message:
        'chain ch7_forgotten_meet sets communed_first_forgotten without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch7_chain_cathedral',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message:
        'chain ch7_forgotten_meet_echo sets communed_first_forgotten without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
  {
    finding: {
      mapId: 'map_ch7_cradle_of_dawn',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch7_pin_right sets stabilized_third_chain without refreshMap/startTimer',
    },
    reason:
      'Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.',
  },
];

function tiny(): MapLintData {
  const map: MapDefinition = {
    id: 'tiny',
    name: 'Tiny',
    tilemap: { key: 't', path: 'tiny.json' },
    tileset: { name: 't', key: 't', path: 't.png' },
    layers: { ground: 'Ground', walls: 'Walls' },
    collision: { fromGid: 2, toGid: 9 },
    bgm: 'ambient',
    spawns: { default: { x: 2, y: 2 } },
  };
  return {
    maps: { startMapId: 'tiny', maps: { tiny: map } },
    dialogues: { dialogues: { ok: { id: 'ok', speaker: '', lines: [] } } },
    tilemaps: {
      'tiny.json': {
        width: 7,
        height: 7,
        layers: [{ name: 'Walls', data: Array<number>(49).fill(0) }],
      },
    },
  };
}
const map = (d: MapLintData): MapDefinition => d.maps.maps.tiny;
const has = (d: MapLintData, rule: string): boolean => lintMaps(d).some((f) => f.rule === rule);
describe('map lint rules', () => {
  it('spawn-near-exit: rejects distance 1 and accepts distance 2', () => {
    const d = tiny();
    map(d).exits = [
      { id: 'e', area: { x: 3, y: 2, w: 2, h: 1 }, toMap: 'tiny', toSpawn: 'default' },
    ];
    expect(has(d, 'spawn-near-exit')).toBe(true);
    map(d).exits![0].area.x = 4;
    expect(has(d, 'spawn-near-exit')).toBe(false);
  });
  it('spawn-blocked: uses base tiles even when a swap opens them', () => {
    const d = tiny();
    const walls = d.tilemaps['tiny.json'].layers[0].data!;
    walls[16] = 2;
    map(d).tileSwaps = [
      { layer: 'walls', when: { flag: 'open' }, tiles: [{ x: 2, y: 2 }], index: -1 },
    ];
    expect(has(d, 'spawn-blocked')).toBe(true);
    walls[16] = 0;
    expect(has(d, 'spawn-blocked')).toBe(false);
  });
  it('unreachable: flood fills four ways and optimistically opens swapped walls', () => {
    const d = tiny();
    const walls = d.tilemaps['tiny.json'].layers[0].data!;
    for (let y = 0; y < 7; y++) walls[y * 7 + 3] = 2;
    map(d).interactables = [
      { id: 'p', tile: { x: 5, y: 2 }, radius: 32, prompt: '', dialogueId: 'ok' },
    ];
    expect(has(d, 'unreachable')).toBe(true);
    map(d).tileSwaps = [
      { layer: 'walls', when: { flag: 'open' }, tiles: [{ x: 3, y: 2 }], index: -1 },
    ];
    expect(has(d, 'unreachable')).toBe(false);
  });
  it('reveal-without-refresh: follows cyclic response chains and accepts timer/refresh downstream', () => {
    const d = tiny();
    map(d).interactables = [
      {
        id: 'p',
        tile: { x: 2, y: 2 },
        radius: 32,
        prompt: '',
        dialogueId: 'ok',
        visibleWhen: { flag: 'open' },
      },
    ];
    d.dialogues.dialogues.ok.effects = { setFlags: ['open'] };
    d.dialogues.dialogues.ok.responses = [{ text: '', nextDialogueId: 'next' }];
    d.dialogues.dialogues.next = {
      id: 'next',
      speaker: '',
      lines: [],
      responses: [{ text: '', nextDialogueId: 'ok' }],
    };
    expect(has(d, 'reveal-without-refresh')).toBe(true);
    d.dialogues.dialogues.next.effects = { refreshMap: true };
    expect(has(d, 'reveal-without-refresh')).toBe(false);
    d.dialogues.dialogues.next.effects = { startTimer: { flag: 'timer', ms: 1 } };
    expect(has(d, 'reveal-without-refresh')).toBe(false);
  });
  it('trigger-covers-spawn: checks zone bounds', () => {
    const d = tiny();
    map(d).triggers = [{ id: 'z', on: 'zone', area: { x: 2, y: 2, w: 1, h: 1 }, repeat: true }];
    expect(has(d, 'trigger-covers-spawn')).toBe(true);
    map(d).triggers![0].area!.x = 3;
    expect(has(d, 'trigger-covers-spawn')).toBe(false);
  });
  it('dangling-ref: checks new dialogue, knownFlag and local coupled-dial references', () => {
    const d = tiny();
    map(d).dialChecks = [{ ifFlags: [], dialogueId: 'missing' }];
    map(d).encounters = [
      {
        id: 'boss',
        enemyId: 'e',
        texture: 'e',
        tile: { x: 1, y: 1 },
        defeatedFlag: 'won',
        victoryDialogueRules: [{ dialogueId: 'missing' }],
      },
    ];
    map(d).dials = [
      {
        id: 'dial',
        tile: { x: 1, y: 1 },
        prompt: '',
        values: [{ key: 'a', label: 'A', knownFlag: 'missing' }],
        couples: [{ dialId: 'absent', step: 1 }],
      },
    ];
    expect(lintMaps(d).filter((f) => f.rule === 'dangling-ref')).toHaveLength(4);
    map(d).dialChecks![0].dialogueId = 'ok';
    map(d).encounters![0].victoryDialogueRules![0].dialogueId = 'ok';
    map(d).dials![0].values[0].knownFlag = 'won';
    map(d).dials![0].couples![0].dialId = 'dial';
    expect(has(d, 'dangling-ref')).toBe(false);
  });
  it('real maps match the explicit reviewed baseline; new errors fail', () => {
    const maps = mapsJson as unknown as MapDatabase;
    const tilemaps: Record<string, LintTilemap> = {
      'assets/maps/map_peters_room.json': tilemap0,
      'assets/maps/map_coastal_town.json': tilemap1,
      'assets/maps/prologue_map.json': tilemap2,
      'assets/maps/map_forgotten_forest.json': tilemap3,
      'assets/maps/map_old_lighthouse.json': tilemap4,
      'assets/maps/map_ch1_shore_gate.json': tilemap5,
      'assets/maps/map_ch1_abandoned_village.json': tilemap6,
      'assets/maps/map_ch1_sunset_beacon.json': tilemap7,
      'assets/maps/map_ch1_sunken_corridors.json': tilemap8,
      'assets/maps/map_ch1_bell_sanctum.json': tilemap9,
      'assets/maps/map_ch2_imperial_outskirts.json': tilemap10,
      'assets/maps/map_ch2_sunken_catacombs.json': tilemap11,
      'assets/maps/map_ch2_forum_plaza.json': tilemap12,
      'assets/maps/map_ch2_causality_archives.json': tilemap13,
      'assets/maps/map_ch2_verdict_sanctum.json': tilemap14,
      'assets/maps/map_ch3_sepulcher_gate.json': tilemap15,
      'assets/maps/map_ch3_silent_necropolis.json': tilemap16,
      'assets/maps/map_ch3_hall_of_echoes.json': tilemap17,
      'assets/maps/map_ch3_memory_vaults.json': tilemap18,
      'assets/maps/map_ch3_great_archive.json': tilemap19,
      'assets/maps/map_ch3_royal_mausoleum.json': tilemap20,
      'assets/maps/map_ch3_choir_sanctum.json': tilemap21,
      'assets/maps/map_ch3_forgotten_vault.json': tilemap22,
      'assets/maps/map_ch4_encampment_veridia.json': tilemap23,
      'assets/maps/map_ch4_trench_crossroads.json': tilemap24,
      'assets/maps/map_ch4_encampment_solkaris.json': tilemap25,
      'assets/maps/map_ch4_arrow_storm_valley.json': tilemap26,
      'assets/maps/map_ch4_red_ridge_battlefield.json': tilemap27,
      'assets/maps/map_ch4_crimson_redoubt.json': tilemap28,
      'assets/maps/map_ch4_fallen_ramparts.json': tilemap29,
      'assets/maps/map_ch4_sentry_cellar.json': tilemap30,
      'assets/maps/map_ch4_ash_plains.json': tilemap31,
      'assets/maps/map_ch4_tomb_of_the_first_fallen.json': tilemap32,
      'assets/maps/map_ch4_monument_of_the_fallen.json': tilemap33,
      'assets/maps/map_ch4_sanctum_of_finality.json': tilemap34,
      'assets/maps/map_ch4_interval_sanctuary.json': tilemap35,
      'assets/maps/map_ch5_interval_shore.json': tilemap36,
      'assets/maps/map_ch5_seed_garden.json': tilemap37,
      'assets/maps/map_ch5_glass_greenhouse.json': tilemap38,
      'assets/maps/map_ch5_alpha_town.json': tilemap39,
      'assets/maps/map_ch5_alpha_harbor.json': tilemap40,
      'assets/maps/map_ch5_alpha_clockshop.json': tilemap41,
      'assets/maps/map_ch5_pruner_tower.json': tilemap42,
      'assets/maps/map_ch5_beta_city.json': tilemap43,
      'assets/maps/map_ch5_observatory_ruins.json': tilemap44,
      'assets/maps/map_ch5_chronos_reactor.json': tilemap45,
      'assets/maps/map_ch5_children_shelter.json': tilemap46,
      'assets/maps/map_ch5_grey_prune.json': tilemap47,
      'assets/maps/map_ch5_kuro_asks.json': tilemap48,
      'assets/maps/map_ch5_unborn_throne.json': tilemap49,
      'assets/maps/map_ch5_collision_shore.json': tilemap50,
      'assets/maps/map_ch5_uprooted_garden.json': tilemap51,
      'assets/maps/map_ch5_old_seeds.json': tilemap52,
      'assets/maps/map_ch6_celestial_stairs.json': tilemap53,
      'assets/maps/map_ch6_outer_courtyard.json': tilemap54,
      'assets/maps/map_ch6_hall_of_pillars.json': tilemap55,
      'assets/maps/map_ch6_herald_roost.json': tilemap56,
      'assets/maps/map_ch6_fracture_nave.json': tilemap57,
      'assets/maps/map_ch6_gallery_of_eras.json': tilemap58,
      'assets/maps/map_ch6_frozen_cascade.json': tilemap59,
      'assets/maps/map_ch6_archives_ruins.json': tilemap60,
      'assets/maps/map_ch6_secret_chronos_cell.json': tilemap61,
      'assets/maps/map_ch6_genesis_core.json': tilemap62,
      'assets/maps/map_ch6_bell_sanctuary.json': tilemap63,
      'assets/maps/map_ch6_refraction_maze.json': tilemap64,
      'assets/maps/map_ch6_threshold_gate.json': tilemap65,
      'assets/maps/map_ch6_celestial_chessboard.json': tilemap66,
      'assets/maps/map_ch6_sanctum_approach.json': tilemap67,
      'assets/maps/map_ch6_hall_of_thrones.json': tilemap68,
      'assets/maps/map_ch6_first_void_abyss.json': tilemap69,
      'assets/maps/map_ch6_first_forgotten_nook.json': tilemap70,
      'assets/maps/map_ch7_ash_abyss_drop.json': tilemap71,
      'assets/maps/map_ch7_faded_shore.json': tilemap72,
      'assets/maps/map_ch7_erased_hamlet.json': tilemap73,
      'assets/maps/map_ch7_cradle_sanctuary.json': tilemap74,
      'assets/maps/map_ch7_echo_well_depths.json': tilemap75,
      'assets/maps/map_ch7_stranded_fleet.json': tilemap76,
      'assets/maps/map_ch7_clock_graveyard.json': tilemap77,
      'assets/maps/map_ch7_weeper_crossing.json': tilemap78,
      'assets/maps/map_ch7_first_mason_tomb.json': tilemap79,
      'assets/maps/map_ch7_blank_archives.json': tilemap80,
      'assets/maps/map_ch7_bang_tree_promontory.json': tilemap81,
      'assets/maps/map_ch7_fog_lullaby_maze.json': tilemap82,
      'assets/maps/map_ch7_white_bell_crypt.json': tilemap83,
      'assets/maps/map_ch7_chain_cathedral.json': tilemap84,
      'assets/maps/map_ch7_void_fissure_pass.json': tilemap85,
      'assets/maps/map_ch7_ink_lake_throne.json': tilemap86,
      'assets/maps/map_ch7_cradle_of_dawn.json': tilemap87,
      'assets/maps/map_ch7_glass_ash_core.json': tilemap88,
      'assets/maps/map_ch7_null_hour_threshold.json': tilemap89,
    };
    const findings = lintMaps({
      maps,
      dialogues: dialogueJson as unknown as DialogueDatabase,
      tilemaps,
    });
    expect(findings).toEqual(KNOWN.map((k) => k.finding));
    expect(KNOWN.every((k) => k.reason.length > 0)).toBe(true);
  });
});
