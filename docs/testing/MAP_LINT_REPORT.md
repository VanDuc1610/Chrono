# Map lint report - T-79

Chapters 0-7 lint now has **zero errors**. The 14 fixed error entries were removed from KNOWN, leaving the existing 41 reveal warnings. Chapter 8 data and files were preserved.

## Fixes in source layouts and map definitions

| Map                        | Change                                                                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| map_peters_room            | from_town (7,8) -> (7,7).                                                                                                                                      |
| map_coastal_town           | from_house (5,5) -> (5,6), from_forest (25,1) -> (25,2).                                                                                                       |
| map_shattered_antechamber  | from_lighthouse (12,3) -> (12,4). Its spawn registry is hand-authored in maps.json.                                                                            |
| map_ch1_abandoned_village  | default, from_shore and revive (1,10) -> (2,10).                                                                                                               |
| map_ch1_sunset_beacon      | from_ruins (19,13) -> (18,13), clear in both base and low-tide Walls.                                                                                          |
| map_ch2_imperial_outskirts | from_catacombs (18,12) -> (18,11).                                                                                                                             |
| map_ch5_alpha_town         | from_shop (6,7) -> (6,8). Live validation additionally found the shop door itself blocked entry. Its visual tile is now on Ground and its Walls cell is empty. |
| map_ch5_beta_city          | from_observatory (27,2) -> (27,3), clear in living and pruned Walls.                                                                                           |
| map_ch5_unborn_throne      | Open (11,1), preserving the boss-gated exit tile at (11,0).                                                                                                    |
| map_ch5_collision_shore    | Add 12 violet elbow tiles to connect the diagonal joins orthogonally. Grey trap islands are preserved.                                                         |
| map_ch7_stranded_fleet     | Open (12,1) below fleet_to_well.                                                                                                                               |
| map_ch7_fog_lullaby_maze   | Open (12,1) below maze_to_tree.                                                                                                                                |

Spawn changes are mirrored in their layout metadata and the runtime maps.json registry. Chapter 5 wiring already reads layout spawns. The earlier chapters' tilemap generators do not write map registry spawns, so those registry entries are updated directly. The village revive follows its corrected default spawn.

Only five affected tilemaps were regenerated. generate-ch1-maps.js now accepts optional map IDs after the chapter argument and rejects unknown IDs before writing. Commands used were:

- node scripts/generate-ch1-maps.js ch5 map_ch5_unborn_throne map_ch5_collision_shore
- node scripts/generate-ch1-maps.js ch7 map_ch7_stranded_fleet map_ch7_fog_lullaby_maze
- node scripts/generate-ch1-maps.js ch5 map_ch5_alpha_town

Semantic diffs against HEAD show eight changed map definitions, limited to the listed spawn/revive fields. The four corridor/path tilemaps change one Ground and one Walls cell each at the three northern entrances, and 12 cells per layer on the collision shore. Alpha changes one cell per layer for its shop door. No unrelated tilemap or Chapter 8 map definition changed.

## Live verification

Used npm run dev and headless Chromium through Playwright. Entered via the real chapter-select UI for Chapters 1, 2, 5 and 7. To isolate each location, restarted ExplorationScene at its named spawn with the relevant story gates already unlocked, suppressed unrelated introduction triggers, and paused field enemies. All movement to exits used real arrow-key events. This verifies local arrival/collision/travel behavior rather than a complete natural chapter playthrough.

- Every listed arrival remained on its source map while idle and had a clear player collision tile.
- Walked from the new room/town/sanctuary/village/outskirts/Alpha/Beta spawns into their intended exits and observed the expected destination map. Both village default and from_shore were checked.
- Walked from the corrected beacon arrival back to the sunken corridors with low tide active. With tide_lowered false, separately arrived at the same spawn on base Walls and walked north to (18,12), remaining unblocked.
- Walked through the new northern openings from unborn_throne to collision_shore, stranded_fleet to echo_well_depths, and fog_lullaby_maze to bang_tree_promontory.
- For the collision shore, started ch5_collision_start through E and closed the dialogue to start its actual 40-second timer. Walked the 34-step safe path with arrow keys, avoiding grey trap tiles. The end trigger set escaped_collision after 9,727 ms. Closed that dialogue, let its warp reach core, walked to the seal and pressed E. ch5_seal_stop opened with escaped_collision true.
- Alpha door regression was confirmed before its fix. Walking upward stopped Peter at pixel (208,224), body.blocked.up true, outside the exit. After moving the door visual to Ground, the same approach transitioned to map_ch5_alpha_clockshop.

## Lint interpretation and remaining warnings

The lint uses optimistic four-way BFS over base Walls plus all wall variants and nonblocking tile swaps, including timer bridges. Reachable same-map dialogue warps and trigger teleports connect components. It does not prove that every flag combination is attainable or that a route fits within a timer. The collision-shore timed traversal was therefore checked separately in the live game.

Zone triggers are polled by ExplorationScene.update, including when the player spawns inside. The old trigger-covers-spawn rule remains removed following the T-75 live confirmation.

Reveal warnings remain documented below. A swap-only flag is generally a false positive because applyEffects already reapplies tile swaps. visibleWhen entities may still need a rebuild. A warp, endChapter, toggleBranch or later refresh can also make an apparent reveal warning harmless. Dialogue traversal is cycle-safe and optimistic across response branches. A timer reapplies swaps but does not recreate visibleWhen entities.

## Chapter 0 / map_coastal_town

- **warning / reveal-without-refresh** chain town_time_stops sets time_frozen without refreshMap/startTimer. Assessment / suggested fix: Visibility condition uses this flag: likely needs a rebuild after the chain; review warp/endChapter/toggleBranch or victory-return rebuild before adding refreshMap.

## Chapter 1 / map_ch1_sunken_corridors

- **warning / reveal-without-refresh** chain ch1_mirror_1_ready sets ch1_mirror_1_aligned without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.
- **warning / reveal-without-refresh** chain ch1_mirror_1_fit_lens sets ch1_mirror_1_aligned without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.
- **warning / reveal-without-refresh** chain ch1_mirror_2_ready_ok sets ch1_mirror_2_aligned without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.
- **warning / reveal-without-refresh** chain ch1_mirror_3_ready_ok sets ch1_mirror_3_aligned without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 2 / map_ch2_imperial_outskirts

- **warning / reveal-without-refresh** chain ch2_elder_echo_farewell sets elder_echo_faded without refreshMap/startTimer. Assessment / suggested fix: Visibility condition uses this flag: likely needs a rebuild after the chain; review warp/endChapter/toggleBranch or victory-return rebuild before adding refreshMap.

## Chapter 2 / map_ch2_sunken_catacombs

- **warning / reveal-without-refresh** chain ch2_gate_opens sets unlocked_catacomb_gate without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 3 / map_ch3_sepulcher_gate

- **warning / reveal-without-refresh** chain ch3_elder_echo_farewell sets ch3_elder_echo_faded without refreshMap/startTimer. Assessment / suggested fix: Visibility condition uses this flag: likely needs a rebuild after the chain; review warp/endChapter/toggleBranch or victory-return rebuild before adding refreshMap.
- **warning / reveal-without-refresh** chain ch3_sepulcher_gate_locked sets opened_sepulcher_gate without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 3 / map_ch3_silent_necropolis

- **warning / reveal-without-refresh** chain ch3_hall_gate_opens sets opened_hall_gate without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.
- **warning / reveal-without-refresh** chain ch3_secret_vault_opens sets opened_forgotten_vault without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 3 / map_ch3_royal_mausoleum

- **warning / reveal-without-refresh** chain ch3_sanctum_door_opens sets opened_sanctum_door without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 4 / map_ch4_encampment_solkaris

- **warning / reveal-without-refresh** chain ch4_kaelen_intro sets met_general_kaelen without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.
- **warning / reveal-without-refresh** chain ch4_kaelen_cold sets met_general_kaelen without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 4 / map_ch4_arrow_storm_valley

- **warning / reveal-without-refresh** chain ch4_beacon_tower_align sets silenced_arrow_storm without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 4 / map_ch4_red_ridge_battlefield

- **warning / reveal-without-refresh** chain ch4_banner_ward_broken sets solved_fallen_arms_array without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 4 / map_ch4_ash_plains

- **warning / reveal-without-refresh** chain ch4_chariot_passage sets opened_chariot_passage without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 4 / map_ch4_interval_sanctuary

- **warning / reveal-without-refresh** chain ch4_kuro_direct_meeting sets met_kuro_first_time without refreshMap/startTimer. Assessment / suggested fix: Visibility condition uses this flag: likely needs a rebuild after the chain; review warp/endChapter/toggleBranch or victory-return rebuild before adding refreshMap.

## Chapter 5 / map_ch5_interval_shore

- **warning / reveal-without-refresh** chain ch5_kuro_meet sets kuro_with_peter without refreshMap/startTimer. Assessment / suggested fix: Visibility condition uses this flag: likely needs a rebuild after the chain; review warp/endChapter/toggleBranch or victory-return rebuild before adding refreshMap.

## Chapter 5 / map_ch5_glass_greenhouse

- **warning / reveal-without-refresh** chain ch5x_gardener_peace sets pacified_the_gardener without refreshMap/startTimer. Assessment / suggested fix: Visibility condition uses this flag: likely needs a rebuild after the chain; review warp/endChapter/toggleBranch or victory-return rebuild before adding refreshMap.

## Chapter 5 / map_ch5_beta_city

- **warning / reveal-without-refresh** chain ch5_cell_3_place sets ch5_cell_3_p without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.
- **warning / reveal-without-refresh** chain ch5_cell_6_place sets ch5_cell_6_p without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.
- **warning / reveal-without-refresh** chain ch5_cell_9_place sets ch5_cell_9_p without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 5 / map_ch5_chronos_reactor

- **warning / reveal-without-refresh** chain ch5_reactor_start sets restarted_reactor without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 5 / map_ch5_kuro_asks

- **warning / reveal-without-refresh** chain ch5_kuro_smile sets kuro_left without refreshMap/startTimer. Assessment / suggested fix: Visibility condition uses this flag: likely needs a rebuild after the chain; review warp/endChapter/toggleBranch or victory-return rebuild before adding refreshMap.
- **warning / reveal-without-refresh** chain ch5_kuro_after_quiz_open sets kuro_left without refreshMap/startTimer. Assessment / suggested fix: Visibility condition uses this flag: likely needs a rebuild after the chain; review warp/endChapter/toggleBranch or victory-return rebuild before adding refreshMap.
- **warning / reveal-without-refresh** chain ch5_kuro_after_quiz sets kuro_left without refreshMap/startTimer. Assessment / suggested fix: Visibility condition uses this flag: likely needs a rebuild after the chain; review warp/endChapter/toggleBranch or victory-return rebuild before adding refreshMap.

## Chapter 6 / map_ch6_outer_courtyard

- **warning / reveal-without-refresh** chain ch6_gate1_right sets solved_ch6_gate_1 without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 6 / map_ch6_frozen_cascade

- **warning / reveal-without-refresh** chain ch6_a1_right sets froze_cascade_c05 without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.
- **warning / reveal-without-refresh** chain ch6_a2_right sets bridged_chasm_c05 without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 6 / map_ch6_bell_sanctuary

- **warning / reveal-without-refresh** chain ch6_bells_right sets solved_chime_bell without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 6 / map_ch6_threshold_gate

- **warning / reveal-without-refresh** chain ch6_threshold_right sets opened_threshold_gate without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 6 / map_ch6_hall_of_thrones

- **warning / reveal-without-refresh** chain ch6_remnant sets ch6_remnant_spoke without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 7 / map_ch7_faded_shore

- **warning / reveal-without-refresh** chain ch7_c01_right sets restored_bridge_keeper without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 7 / map_ch7_echo_well_depths

- **warning / reveal-without-refresh** chain ch7_c04_right sets balanced_echo_well without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 7 / map_ch7_stranded_fleet

- **warning / reveal-without-refresh** chain ch7_c05_right sets solved_stranded_fleet without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 7 / map_ch7_clock_graveyard

- **warning / reveal-without-refresh** chain ch7_c06_right sets solved_clock_graveyard without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 7 / map_ch7_bang_tree_promontory

- **warning / reveal-without-refresh** chain ch7_c08_right sets opened_childhood_pledge_box without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 7 / map_ch7_chain_cathedral

- **warning / reveal-without-refresh** chain ch7_forgotten_meet sets communed_first_forgotten without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.
- **warning / reveal-without-refresh** chain ch7_forgotten_meet_echo sets communed_first_forgotten without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 7 / map_ch7_cradle_of_dawn

- **warning / reveal-without-refresh** chain ch7_pin_right sets stabilized_third_chain without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 8

No Chapter 8 findings are baselined. Its maps are still discovered automatically and checked by the real-data test.

## T-79 verification

Typecheck, ESLint, the full Prettier check and npm test all passed before the map-fix commit. The suite contains 165 tests in 25 files. Scoped diffs confirm Chapter 8 map definitions and files are unchanged.
