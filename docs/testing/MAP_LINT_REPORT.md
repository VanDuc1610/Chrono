# Map lint report (T-72)

Static baseline, 2026-11-15. Data was not modified. Every finding is explicitly listed in tests/map-lint.test.ts with a reason; new findings and stale entries fail npm test.

## Interpretation and limitations

Four-way BFS uses base Walls GIDs and any wall swap that can open a tile (index + 1). It ignores state feasibility, NPC collision, layerVariants, interaction radius and continuous movement. Targets may be adjacent diagonally. Spawn checks deliberately ignore swaps. Dialogue traversal follows all response branches, cycle-safe; refresh on any branch suppresses a warning as requested, so this is not a path-sensitive proof. knownFlag checks use discovered producers, not flag usages; external producers can be supplied via knownFlags. Exit lockedDialogueId is already covered by content-data.test.ts and is not duplicated.

Zone-spawn warnings are potential false positives: current ExplorationScene.checkTriggers polls containment every update, rather than detecting only entry edges. Timers only reapply tile swaps, not visibleWhen entities; the specified exemption is retained. Reveal warnings involving warp/endChapter/toggleBranch or a later refreshing interaction may also be false positives; review each chain before adding refreshMap.

## Chapter 0 / map_peters_room

- **warning / trigger-covers-spawn** trigger trig_teach_skill contains spawn default at (3, 4). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **error / spawn-near-exit** spawn from_town is within 2 tiles of exit room_to_town at (7, 8). Suggested fix: Move spawn at least two tiles from every exit area.
- **warning / trigger-covers-spawn** trigger trig_teach_skill contains spawn from_town at (7, 8). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger trig_teach_skill contains spawn rest at (4, 5). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.

## Chapter 0 / map_coastal_town

- **warning / trigger-covers-spawn** trigger trig_time_stops contains spawn default at (5, 6). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger trig_after_hunt contains spawn default at (5, 6). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **error / spawn-near-exit** spawn from_house is within 2 tiles of exit town_to_room at (5, 5). Suggested fix: Move spawn at least two tiles from every exit area.
- **warning / trigger-covers-spawn** trigger trig_time_stops contains spawn from_house at (5, 5). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger trig_after_hunt contains spawn from_house at (5, 5). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **error / spawn-near-exit** spawn from_forest is within 2 tiles of exit town_to_forest at (25, 1). Suggested fix: Move spawn at least two tiles from every exit area.
- **warning / trigger-covers-spawn** trigger trig_time_stops contains spawn from_forest at (25, 1). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger trig_after_hunt contains spawn from_forest at (25, 1). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / reveal-without-refresh** chain town_time_stops sets time_frozen without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 0 / map_shattered_antechamber

- **error / spawn-near-exit** spawn from_lighthouse is within 2 tiles of exit antechamber_to_lighthouse at (12, 3). Suggested fix: Move spawn at least two tiles from every exit area.

## Chapter 1 / map_ch1_shore_gate

- **warning / trigger-covers-spawn** trigger trig_shore_loop_first contains spawn from_village at (19, 8). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger trig_shore_loop contains spawn from_village at (19, 8). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.

## Chapter 1 / map_ch1_abandoned_village

- **error / spawn-near-exit** spawn default is within 2 tiles of exit village_to_shore at (1, 10). Suggested fix: Move spawn at least two tiles from every exit area.
- **error / spawn-near-exit** spawn from_shore is within 2 tiles of exit village_to_shore at (1, 10). Suggested fix: Move spawn at least two tiles from every exit area.
- **warning / trigger-covers-spawn** trigger trig_village_loop contains spawn from_beacon at (27, 4). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.

## Chapter 1 / map_ch1_sunset_beacon

- **error / spawn-blocked** spawn from_ruins is blocked before swaps at (19, 13). Suggested fix: Move spawn onto a base walkable tile; conditional swaps may make this intentional.

## Chapter 1 / map_ch1_sunken_corridors

- **warning / reveal-without-refresh** chain ch1_mirror_1_ready sets ch1_mirror_1_aligned without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.
- **warning / reveal-without-refresh** chain ch1_mirror_1_fit_lens sets ch1_mirror_1_aligned without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.
- **warning / reveal-without-refresh** chain ch1_mirror_2_ready_ok sets ch1_mirror_2_aligned without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.
- **warning / reveal-without-refresh** chain ch1_mirror_3_ready_ok sets ch1_mirror_3_aligned without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 2 / map_ch2_imperial_outskirts

- **error / spawn-near-exit** spawn from_catacombs is within 2 tiles of exit outskirts_to_catacombs at (18, 12). Suggested fix: Move spawn at least two tiles from every exit area.
- **warning / reveal-without-refresh** chain ch2_elder_echo_farewell sets elder_echo_faded without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 2 / map_ch2_sunken_catacombs

- **warning / reveal-without-refresh** chain ch2_gate_opens sets unlocked_catacomb_gate without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 3 / map_ch3_sepulcher_gate

- **warning / reveal-without-refresh** chain ch3_elder_echo_farewell sets ch3_elder_echo_faded without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.
- **warning / reveal-without-refresh** chain ch3_sepulcher_gate_locked sets opened_sepulcher_gate without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 3 / map_ch3_silent_necropolis

- **warning / reveal-without-refresh** chain ch3_hall_gate_opens sets opened_hall_gate without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.
- **warning / reveal-without-refresh** chain ch3_secret_vault_opens sets opened_forgotten_vault without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 3 / map_ch3_memory_vaults

- **warning / trigger-covers-spawn** trigger trig_keeper_meet contains spawn abyss_edge_east at (19, 11). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.

## Chapter 3 / map_ch3_royal_mausoleum

- **warning / reveal-without-refresh** chain ch3_sanctum_door_opens sets opened_sanctum_door without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 4 / map_ch4_encampment_solkaris

- **warning / reveal-without-refresh** chain ch4_kaelen_intro sets met_general_kaelen without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.
- **warning / reveal-without-refresh** chain ch4_kaelen_cold sets met_general_kaelen without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 4 / map_ch4_arrow_storm_valley

- **warning / reveal-without-refresh** chain ch4_beacon_tower_align sets silenced_arrow_storm without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 4 / map_ch4_red_ridge_battlefield

- **warning / reveal-without-refresh** chain ch4_banner_ward_broken sets solved_fallen_arms_array without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 4 / map_ch4_fallen_ramparts

- **warning / trigger-covers-spawn** trigger trig_ch4_ambush_cleared contains spawn default at (2, 8). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger trig_ch4_ambush_cleared contains spawn from_redoubt at (2, 8). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger trig_ch4_ambush_cleared contains spawn from_ash at (22, 8). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger trig_ch4_ambush_cleared contains spawn from_cellar at (5, 11). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger trig_ch4_ambush_cleared contains spawn revive at (2, 8). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.

## Chapter 4 / map_ch4_ash_plains

- **warning / reveal-without-refresh** chain ch4_chariot_passage sets opened_chariot_passage without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 4 / map_ch4_interval_sanctuary

- **warning / reveal-without-refresh** chain ch4_kuro_direct_meeting sets met_kuro_first_time without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 5 / map_ch5_interval_shore

- **error / unreachable** exit shore_to_garden cannot be reached at (23, 7). Suggested fix: Review layout and open a route, or move the object to an accessible tile.
- **error / unreachable** object poi_map_ch5_interval_shore_sprout_20_6 cannot be reached at (20, 6). Suggested fix: Review layout and open a route, or move the object to an accessible tile.
- **warning / reveal-without-refresh** chain ch5_kuro_meet sets kuro_with_peter without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 5 / map_ch5_seed_garden

- **warning / trigger-covers-spawn** trigger ch5_t_paradox contains spawn gap_west at (14, 8). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.

## Chapter 5 / map_ch5_glass_greenhouse

- **warning / reveal-without-refresh** chain ch5x_gardener_peace sets pacified_the_gardener without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 5 / map_ch5_alpha_town

- **error / spawn-near-exit** spawn from_shop is within 2 tiles of exit alpha_to_shop at (6, 7). Suggested fix: Move spawn at least two tiles from every exit area.
- **warning / trigger-covers-spawn** trigger ch5_t_kuro_alpha contains spawn from_shop at (6, 7). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.

## Chapter 5 / map_ch5_pruner_tower

- **warning / trigger-covers-spawn** trigger ch5_t_react_spared contains spawn default at (11, 13). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_react_letter contains spawn default at (11, 13). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_song contains spawn default at (11, 13). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_song2 contains spawn default at (11, 13). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_react_spared contains spawn from_town at (11, 13). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_react_letter contains spawn from_town at (11, 13). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_song contains spawn from_town at (11, 13). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_song2 contains spawn from_town at (11, 13). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_react_spared contains spawn from_beta at (19, 8). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_react_letter contains spawn from_beta at (19, 8). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_song contains spawn from_beta at (19, 8). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_song2 contains spawn from_beta at (19, 8). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_react_spared contains spawn from_attic at (11, 2). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_react_letter contains spawn from_attic at (11, 2). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_song contains spawn from_attic at (11, 2). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_song2 contains spawn from_attic at (11, 2). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_react_spared contains spawn revive at (11, 13). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_react_letter contains spawn revive at (11, 13). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_song contains spawn revive at (11, 13). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_song2 contains spawn revive at (11, 13). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.

## Chapter 5 / map_ch5_beta_city

- **error / spawn-near-exit** spawn from_observatory is within 2 tiles of exit beta_to_observatory at (27, 2). Suggested fix: Move spawn at least two tiles from every exit area.
- **error / unreachable** exit beta_to_reactor cannot be reached at (29, 8). Suggested fix: Review layout and open a route, or move the object to an accessible tile.
- **error / unreachable** exit beta_to_observatory cannot be reached at (28, 1). Suggested fix: Review layout and open a route, or move the object to an accessible tile.
- **error / unreachable** object poi_ch5_seed_autumn cannot be reached at (25, 12). Suggested fix: Review layout and open a route, or move the object to an accessible tile.
- **error / unreachable** object poi_ch5_chalk_red cannot be reached at (26, 4). Suggested fix: Review layout and open a route, or move the object to an accessible tile.
- **error / unreachable** object poi_ch5_cell_6 cannot be reached at (15, 8). Suggested fix: Review layout and open a route, or move the object to an accessible tile.
- **error / unreachable** object poi_ch5_cell_9 cannot be reached at (18, 8). Suggested fix: Review layout and open a route, or move the object to an accessible tile.
- **warning / reveal-without-refresh** chain ch5_cell_3_place sets ch5_cell_3_p without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.
- **warning / reveal-without-refresh** chain ch5_cell_6_place sets ch5_cell_6_p without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.
- **warning / reveal-without-refresh** chain ch5_cell_9_place sets ch5_cell_9_p without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 5 / map_ch5_chronos_reactor

- **warning / reveal-without-refresh** chain ch5_reactor_start sets restarted_reactor without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 5 / map_ch5_children_shelter

- **warning / trigger-covers-spawn** trigger ch5_t_promise contains spawn default at (2, 7). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_resolve contains spawn default at (2, 7). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_promise contains spawn from_reactor at (2, 7). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_resolve contains spawn from_reactor at (2, 7). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_promise contains spawn from_grey at (17, 7). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_resolve contains spawn from_grey at (17, 7). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.

## Chapter 5 / map_ch5_kuro_asks

- **warning / trigger-covers-spawn** trigger ch5_t_duel contains spawn default at (2, 6). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_duel contains spawn from_grey at (2, 6). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch5_t_duel contains spawn from_throne at (15, 6). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / reveal-without-refresh** chain ch5_kuro_smile sets kuro_left without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.
- **warning / reveal-without-refresh** chain ch5_kuro_after_quiz_open sets kuro_left without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.
- **warning / reveal-without-refresh** chain ch5_kuro_after_quiz sets kuro_left without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 5 / map_ch5_unborn_throne

- **error / unreachable** exit throne_to_shore cannot be reached at (11, 0). Suggested fix: Review layout and open a route, or move the object to an accessible tile.

## Chapter 5 / map_ch5_collision_shore

- **error / unreachable** object poi_ch5_possibility_seal cannot be reached at (27, 4). Suggested fix: Review layout and open a route, or move the object to an accessible tile.

## Chapter 6 / map_ch6_outer_courtyard

- **warning / reveal-without-refresh** chain ch6_gate1_right sets solved_ch6_gate_1 without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 6 / map_ch6_frozen_cascade

- **warning / reveal-without-refresh** chain ch6_a1_right sets froze_cascade_c05 without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.
- **warning / reveal-without-refresh** chain ch6_a2_right sets bridged_chasm_c05 without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 6 / map_ch6_bell_sanctuary

- **warning / trigger-covers-spawn** trigger ch6_t_kuro_bell contains spawn default at (2, 9). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch6_t_kuro_bell contains spawn from_core at (2, 9). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / trigger-covers-spawn** trigger ch6_t_kuro_bell contains spawn from_ring at (21, 9). Suggested fix: Move spawn outside zone or use an arrive trigger; runtime polling may make this a false positive.
- **warning / reveal-without-refresh** chain ch6_bells_right sets solved_chime_bell without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 6 / map_ch6_threshold_gate

- **warning / reveal-without-refresh** chain ch6_threshold_right sets opened_threshold_gate without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 6 / map_ch6_hall_of_thrones

- **warning / reveal-without-refresh** chain ch6_remnant sets ch6_remnant_spoke without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 7 / map_ch7_faded_shore

- **warning / reveal-without-refresh** chain ch7_c01_right sets restored_bridge_keeper without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 7 / map_ch7_echo_well_depths

- **warning / reveal-without-refresh** chain ch7_c04_right sets balanced_echo_well without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 7 / map_ch7_stranded_fleet

- **error / unreachable** exit fleet_to_well cannot be reached at (12, 0). Suggested fix: Review layout and open a route, or move the object to an accessible tile.
- **warning / reveal-without-refresh** chain ch7_c05_right sets solved_stranded_fleet without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 7 / map_ch7_clock_graveyard

- **warning / reveal-without-refresh** chain ch7_c06_right sets solved_clock_graveyard without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 7 / map_ch7_bang_tree_promontory

- **warning / reveal-without-refresh** chain ch7_c08_right sets opened_childhood_pledge_box without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 7 / map_ch7_fog_lullaby_maze

- **error / unreachable** exit maze_to_tree cannot be reached at (12, 0). Suggested fix: Review layout and open a route, or move the object to an accessible tile.

## Chapter 7 / map_ch7_chain_cathedral

- **warning / reveal-without-refresh** chain ch7_forgotten_meet sets communed_first_forgotten without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.
- **warning / reveal-without-refresh** chain ch7_forgotten_meet_echo sets communed_first_forgotten without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

## Chapter 7 / map_ch7_cradle_of_dawn

- **warning / reveal-without-refresh** chain ch7_pin_right sets stabilized_third_chain without refreshMap/startTimer. Suggested fix: Add refreshMap to the chain; warp/endChapter/toggleBranch or later interactions may make this a false positive.

Total: 115 findings (22 errors, 93 warnings).
