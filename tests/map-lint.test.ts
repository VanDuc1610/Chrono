/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
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
      rule: 'spawn-near-exit',
      severity: 'error',
      message: 'spawn from_town is within 2 tiles of exit room_to_town',
      x: 7,
      y: 8,
    },
    reason:
      'Spawn violates the requested two-tile clearance. Move it inward; distance 1 is a clearance risk, not proof of immediate teleport.',
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
    reason:
      'Spawn violates the requested two-tile clearance. Move it inward; distance 1 is a clearance risk, not proof of immediate teleport.',
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
    reason:
      'Spawn violates the requested two-tile clearance. Move it inward; distance 1 is a clearance risk, not proof of immediate teleport.',
  },
  {
    finding: {
      mapId: 'map_coastal_town',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain town_time_stops sets time_frozen without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
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
    reason:
      'Spawn violates the requested two-tile clearance. Move it inward; distance 1 is a clearance risk, not proof of immediate teleport.',
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
    reason:
      'Spawn violates the requested two-tile clearance. Move it inward; distance 1 is a clearance risk, not proof of immediate teleport.',
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
    reason:
      'Spawn violates the requested two-tile clearance. Move it inward; distance 1 is a clearance risk, not proof of immediate teleport.',
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
    reason:
      'Base Walls tile contains a blocking GID before swaps; move this arrival spawn to a walkable tile.',
  },
  {
    finding: {
      mapId: 'map_ch1_sunken_corridors',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch1_mirror_1_ready sets ch1_mirror_1_aligned without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
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
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
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
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
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
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
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
    reason:
      'Spawn violates the requested two-tile clearance. Move it inward; distance 1 is a clearance risk, not proof of immediate teleport.',
  },
  {
    finding: {
      mapId: 'map_ch2_imperial_outskirts',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch2_elder_echo_farewell sets elder_echo_faded without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch2_sunken_catacombs',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch2_gate_opens sets unlocked_catacomb_gate without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
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
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
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
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch3_silent_necropolis',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch3_hall_gate_opens sets opened_hall_gate without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
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
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
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
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch4_encampment_solkaris',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch4_kaelen_intro sets met_general_kaelen without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch4_encampment_solkaris',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch4_kaelen_cold sets met_general_kaelen without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
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
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
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
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
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
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
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
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch5_interval_shore',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch5_kuro_meet sets kuro_with_peter without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch5_glass_greenhouse',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch5x_gardener_peace sets pacified_the_gardener without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
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
    reason:
      'Spawn violates the requested two-tile clearance. Move it inward; distance 1 is a clearance risk, not proof of immediate teleport.',
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
    reason:
      'Spawn violates the requested two-tile clearance. Move it inward; distance 1 is a clearance risk, not proof of immediate teleport.',
  },
  {
    finding: {
      mapId: 'map_ch5_beta_city',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch5_cell_3_place sets ch5_cell_3_p without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch5_beta_city',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch5_cell_6_place sets ch5_cell_6_p without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch5_beta_city',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch5_cell_9_place sets ch5_cell_9_p without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch5_chronos_reactor',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch5_reactor_start sets restarted_reactor without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch5_kuro_asks',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch5_kuro_smile sets kuro_left without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch5_kuro_asks',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch5_kuro_after_quiz_open sets kuro_left without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch5_kuro_asks',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch5_kuro_after_quiz sets kuro_left without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
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
    reason:
      'North exit is separated from the interior by the full blocking row y=1 (GID 4); no variant, swap or reachable warp opens it. Open the entrance tile at y=1 in the chapter layout generator.',
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
    reason:
      'North exit is separated from the interior by the full blocking row y=1 (GID 4); no variant, swap or reachable warp opens it. Open the entrance tile at y=1 in the chapter layout generator.',
  },
  {
    finding: {
      mapId: 'map_ch6_outer_courtyard',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch6_gate1_right sets solved_ch6_gate_1 without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch6_frozen_cascade',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch6_a1_right sets froze_cascade_c05 without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch6_frozen_cascade',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch6_a2_right sets bridged_chasm_c05 without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch6_bell_sanctuary',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch6_bells_right sets solved_chime_bell without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch6_threshold_gate',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch6_threshold_right sets opened_threshold_gate without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch6_hall_of_thrones',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch6_remnant sets ch6_remnant_spoke without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch7_faded_shore',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch7_c01_right sets restored_bridge_keeper without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch7_echo_well_depths',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch7_c04_right sets balanced_echo_well without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
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
    reason:
      'North exit is separated from the interior by the full blocking row y=1 (GID 4); no variant, swap or reachable warp opens it. Open the entrance tile at y=1 in the chapter layout generator.',
  },
  {
    finding: {
      mapId: 'map_ch7_stranded_fleet',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch7_c05_right sets solved_stranded_fleet without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch7_clock_graveyard',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch7_c06_right sets solved_clock_graveyard without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch7_bang_tree_promontory',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch7_c08_right sets opened_childhood_pledge_box without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
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
    reason:
      'North exit is separated from the interior by the full blocking row y=1 (GID 4); no variant, swap or reachable warp opens it. Open the entrance tile at y=1 in the chapter layout generator.',
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
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
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
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
  },
  {
    finding: {
      mapId: 'map_ch7_cradle_of_dawn',
      rule: 'reveal-without-refresh',
      severity: 'warning',
      message: 'chain ch7_pin_right sets stabilized_third_chain without refreshMap/startTimer',
    },
    reason:
      'Review chain: add refreshMap only if needed; tile swaps already reapply in applyEffects, and warp/endChapter/toggleBranch may rebuild anyway.',
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
  it('unreachable: branch wall variants and timer bridge swaps open routes', () => {
    const d = tiny();
    const walls = d.tilemaps['tiny.json'].layers[0].data!;
    for (let y = 0; y < 7; y++) walls[y * 7 + 3] = 2;
    map(d).interactables = [
      { id: 'p', tile: { x: 5, y: 2 }, radius: 32, prompt: '', dialogueId: 'ok' },
    ];
    const variant = [...walls];
    variant[17] = 0;
    d.tilemaps['tiny.json'].layers.push({ name: 'Pruned', data: variant });
    map(d).branches = true;
    map(d).layerVariants = [{ when: { flag: 'branch_tiny_pruned' }, walls: 'Pruned' }];
    expect(has(d, 'unreachable')).toBe(false);
    map(d).layerVariants = [];
    expect(has(d, 'unreachable')).toBe(true);
    map(d).tileSwaps = [
      { layer: 'walls', when: { flag: 'bridge_timer' }, tiles: [{ x: 3, y: 2 }], index: -1 },
    ];
    d.dialogues.dialogues.ok.effects = { startTimer: { flag: 'bridge_timer', ms: 2000 } };
    expect(has(d, 'unreachable')).toBe(false);
  });
  it('unreachable: only reachable warp sources connect isolated spawns', () => {
    const d = tiny();
    const walls = d.tilemaps['tiny.json'].layers[0].data!;
    for (let y = 0; y < 7; y++) walls[y * 7 + 3] = 2;
    map(d).spawns.core = { x: 5, y: 2 };
    map(d).interactables = [
      { id: 'p', tile: { x: 5, y: 2 }, radius: 32, prompt: '', dialogueId: 'ok' },
    ];
    d.dialogues.dialogues.ok.effects = { warpTo: { mapId: 'tiny', spawnId: 'core' } };
    expect(has(d, 'unreachable')).toBe(true);
    map(d).triggers = [
      { id: 'warp', on: 'zone', area: { x: 2, y: 2, w: 1, h: 1 }, repeat: true, dialogueId: 'ok' },
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
  it('zone triggers may cover spawns because the engine polls containment', () => {
    const d = tiny();
    map(d).triggers = [{ id: 'z', on: 'zone', area: { x: 2, y: 2, w: 1, h: 1 }, repeat: true }];
    expect(lintMaps(d)).toEqual([]);
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
    const loaded = import.meta.glob<LintTilemap>('../public/assets/maps/*.json', {
      eager: true,
      import: 'default',
    });
    const tilemaps: Record<string, LintTilemap> = Object.fromEntries(
      Object.entries(loaded).map(([path, value]) => [path.replace('../public/', ''), value]),
    );
    const findings = lintMaps({
      maps,
      dialogues: dialogueJson as unknown as DialogueDatabase,
      tilemaps,
    });
    const stable = findings.filter((f) => !f.mapId.startsWith('map_ch8_'));
    const chapter8 = findings.filter((f) => f.mapId.startsWith('map_ch8_'));
    // T-74 content is never grandfathered into KNOWN. Errors fail with the full finding.
    expect(chapter8.filter((f) => f.severity === 'error')).toEqual([]);
    expect(stable).toEqual(KNOWN.map((k) => k.finding));
    expect(KNOWN.every((k) => k.reason.length > 0)).toBe(true);
  });
});
