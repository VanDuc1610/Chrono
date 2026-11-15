# Map lint v2 report (T-75)

## Runtime confirmation

On 2026-11-15, launched Vite on port 3000 and Chromium with Playwright. Selected Chapter 7 using canvas focus, ArrowDown, Enter, 7. At map_ch7_ash_abyss_drop tile (3,8), closed arrival dialogue, installed an in-memory zone trigger covering that stationary position. Its flag was false immediately and true after 250 ms, with onceFlag set. No source/data files changed for the probe. ExplorationScene.update calls checkTriggers every frame after dialogue/transition guards; canFire checks flags, not entry edges. Removed trigger-covers-spawn: containment at spawn is not a bug in this runtime.

## Reachability changes

Union base Walls with every layerVariants Walls layer, including Chapter 5 living/pruned branches. Also union every nonblocking walls tileSwap (GID = index + 1), including timer bridges regardless of flag state or timer duration. Reachable same-map dialogue warps/trigger teleports connect components; arbitrary unused spawns do not. Conditions remain optimistic. The old 12 unreachable findings become 4: eight disappear through variant routes. Same-map warp support does not suppress the Chapter 5 seal finding because its source trigger is not four-way reachable.

## Remaining errors: assessment

Three unreachable exits are real static blockers: the entire row y=1 is GID 4, within collision 4..44, while the exit is at y=0. No relevant variant/swap or reachable warp crosses the row. For throne_to_shore, the victory swap opens (11,0) only, not (11,1). For fleet_to_well and maze_to_tree, (12,0) is already open but (12,1) stays blocked. Correct the generators owned by Claude.

The fourth finding is the Chapter 5 seal POI: the violet island path contains diagonal-only joins (e.g. (5,7) to (6,6)), with both orthogonal neighbors blocking. The completion zone at (24,7) therefore cannot be reached by four-way BFS, so its warp to core is not a valid reachable seed. This is a likely corridor/corner-clearance problem rather than a missing seal warp; confirm with actual movement/dash before changing data. Add orthogonal stepping tiles in ch5-layout.js if confirmed.

The blocked arrival spawn has a base blocking tile, independent of story flags. The nine spawn-near-exit errors retain the original requested clearance policy: they are genuine distance violations, but proximity alone does not prove immediate travel (especially at distance 1). Review movement/body clearance in playtest before treating every one as an instant-exit bug.

## Warnings and false positives

Reveal traversal follows all response branches, cycle-safe, with any refreshMap/startTimer exempting the chain as originally specified. Warning does not prove a bug: applyEffects already calls applyTileSwaps (ExplorationScene), so swap-only flags are false positives. visibleWhen NPCs/interactables still require rebuild; warp, endChapter, toggleBranch or a later refresh can make warnings harmless. The per-finding notes below distinguish swap-only flags from visibility conditions. Timer exemption re-applies swaps but does not recreate visibleWhen entities. No game data was changed.

## Chapter 0 / map_peters_room

- **error / spawn-near-exit** spawn from_town is within 2 tiles of exit room_to_town at (7, 8). Assessment / suggested fix: Spawn violates the requested two-tile clearance. Move it inward; distance 1 is a clearance risk, not proof of immediate teleport.

## Chapter 0 / map_coastal_town

- **error / spawn-near-exit** spawn from_house is within 2 tiles of exit town_to_room at (5, 5). Assessment / suggested fix: Spawn violates the requested two-tile clearance. Move it inward; distance 1 is a clearance risk, not proof of immediate teleport.
- **error / spawn-near-exit** spawn from_forest is within 2 tiles of exit town_to_forest at (25, 1). Assessment / suggested fix: Spawn violates the requested two-tile clearance. Move it inward; distance 1 is a clearance risk, not proof of immediate teleport.
- **warning / reveal-without-refresh** chain town_time_stops sets time_frozen without refreshMap/startTimer. Assessment / suggested fix: Visibility condition uses this flag: likely needs a rebuild after the chain; review warp/endChapter/toggleBranch or victory-return rebuild before adding refreshMap.

## Chapter 0 / map_shattered_antechamber

- **error / spawn-near-exit** spawn from_lighthouse is within 2 tiles of exit antechamber_to_lighthouse at (12, 3). Assessment / suggested fix: Spawn violates the requested two-tile clearance. Move it inward; distance 1 is a clearance risk, not proof of immediate teleport.

## Chapter 1 / map_ch1_abandoned_village

- **error / spawn-near-exit** spawn default is within 2 tiles of exit village_to_shore at (1, 10). Assessment / suggested fix: Spawn violates the requested two-tile clearance. Move it inward; distance 1 is a clearance risk, not proof of immediate teleport.
- **error / spawn-near-exit** spawn from_shore is within 2 tiles of exit village_to_shore at (1, 10). Assessment / suggested fix: Spawn violates the requested two-tile clearance. Move it inward; distance 1 is a clearance risk, not proof of immediate teleport.

## Chapter 1 / map_ch1_sunset_beacon

- **error / spawn-blocked** spawn from_ruins is blocked before swaps at (19, 13). Assessment / suggested fix: Base Walls tile contains a blocking GID before swaps; move this arrival spawn to a walkable tile.

## Chapter 1 / map_ch1_sunken_corridors

- **warning / reveal-without-refresh** chain ch1_mirror_1_ready sets ch1_mirror_1_aligned without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.
- **warning / reveal-without-refresh** chain ch1_mirror_1_fit_lens sets ch1_mirror_1_aligned without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.
- **warning / reveal-without-refresh** chain ch1_mirror_2_ready_ok sets ch1_mirror_2_aligned without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.
- **warning / reveal-without-refresh** chain ch1_mirror_3_ready_ok sets ch1_mirror_3_aligned without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 2 / map_ch2_imperial_outskirts

- **error / spawn-near-exit** spawn from_catacombs is within 2 tiles of exit outskirts_to_catacombs at (18, 12). Assessment / suggested fix: Spawn violates the requested two-tile clearance. Move it inward; distance 1 is a clearance risk, not proof of immediate teleport.
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

## Chapter 5 / map_ch5_alpha_town

- **error / spawn-near-exit** spawn from_shop is within 2 tiles of exit alpha_to_shop at (6, 7). Assessment / suggested fix: Spawn violates the requested two-tile clearance. Move it inward; distance 1 is a clearance risk, not proof of immediate teleport.

## Chapter 5 / map_ch5_beta_city

- **error / spawn-near-exit** spawn from_observatory is within 2 tiles of exit beta_to_observatory at (27, 2). Assessment / suggested fix: Spawn violates the requested two-tile clearance. Move it inward; distance 1 is a clearance risk, not proof of immediate teleport.
- **warning / reveal-without-refresh** chain ch5_cell_3_place sets ch5_cell_3_p without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.
- **warning / reveal-without-refresh** chain ch5_cell_6_place sets ch5_cell_6_p without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.
- **warning / reveal-without-refresh** chain ch5_cell_9_place sets ch5_cell_9_p without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 5 / map_ch5_chronos_reactor

- **warning / reveal-without-refresh** chain ch5_reactor_start sets restarted_reactor without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 5 / map_ch5_kuro_asks

- **warning / reveal-without-refresh** chain ch5_kuro_smile sets kuro_left without refreshMap/startTimer. Assessment / suggested fix: Visibility condition uses this flag: likely needs a rebuild after the chain; review warp/endChapter/toggleBranch or victory-return rebuild before adding refreshMap.
- **warning / reveal-without-refresh** chain ch5_kuro_after_quiz_open sets kuro_left without refreshMap/startTimer. Assessment / suggested fix: Visibility condition uses this flag: likely needs a rebuild after the chain; review warp/endChapter/toggleBranch or victory-return rebuild before adding refreshMap.
- **warning / reveal-without-refresh** chain ch5_kuro_after_quiz sets kuro_left without refreshMap/startTimer. Assessment / suggested fix: Visibility condition uses this flag: likely needs a rebuild after the chain; review warp/endChapter/toggleBranch or victory-return rebuild before adding refreshMap.

## Chapter 5 / map_ch5_unborn_throne

- **error / unreachable** exit throne_to_shore cannot be reached at (11, 0). Assessment / suggested fix: North exit is separated from the interior by the full blocking row y=1 (GID 4); no variant, swap or reachable warp opens it. Open the entrance tile at y=1 in the chapter layout generator.

## Chapter 5 / map_ch5_collision_shore

- **error / unreachable** object poi_ch5_possibility_seal cannot be reached at (27, 4). Assessment / suggested fix: Likely path/corner-clearance bug: diagonal-only violet islands disconnect the start from the completion trigger at (24,7). Its ch5_collision_escaped warp exists but cannot be seeded until that trigger is reachable. Verify movement/dash; connect islands orthogonally if confirmed.

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

- **error / unreachable** exit fleet_to_well cannot be reached at (12, 0). Assessment / suggested fix: North exit is separated from the interior by the full blocking row y=1 (GID 4); no variant, swap or reachable warp opens it. Open the entrance tile at y=1 in the chapter layout generator.
- **warning / reveal-without-refresh** chain ch7_c05_right sets solved_stranded_fleet without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 7 / map_ch7_clock_graveyard

- **warning / reveal-without-refresh** chain ch7_c06_right sets solved_clock_graveyard without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 7 / map_ch7_bang_tree_promontory

- **warning / reveal-without-refresh** chain ch7_c08_right sets opened_childhood_pledge_box without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 7 / map_ch7_fog_lullaby_maze

- **error / unreachable** exit maze_to_tree cannot be reached at (12, 0). Assessment / suggested fix: North exit is separated from the interior by the full blocking row y=1 (GID 4); no variant, swap or reachable warp opens it. Open the entrance tile at y=1 in the chapter layout generator.

## Chapter 7 / map_ch7_chain_cathedral

- **warning / reveal-without-refresh** chain ch7_forgotten_meet sets communed_first_forgotten without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.
- **warning / reveal-without-refresh** chain ch7_forgotten_meet_echo sets communed_first_forgotten without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 7 / map_ch7_cradle_of_dawn

- **warning / reveal-without-refresh** chain ch7_pin_right sets stabilized_third_chain without refreshMap/startTimer. Assessment / suggested fix: Likely false positive: only tileSwaps use this flag on this map, and applyEffects already reapplies swaps. No data fix suggested without a failing playtest.

## Chapter 8 (T-74, not baselined)

No findings in the current snapshot (18 maps). New Chapter 8 errors fail the real-data test; none are added to KNOWN.

Stable baseline: 55 findings (14 errors, 41 warnings).

## T-75 verification and handoff

- Chapter 7 answer key: DAP_AN_CHUONG_7.md (Vietnamese), all 13 puzzles, compass side quest, field elite, three bosses and both Kuro outcomes; data/design differences are listed there.
- Real-data map test uses eager import.meta.glob for every public/assets/maps/*.json file. Chapter 8 maps are checked automatically and never added to KNOWN. Snapshot: 18 Chapter 8 maps, zero findings.
- Typecheck and ESLint passed; npm test passed 161 tests across 24 files.
- Full-repo Prettier check still fails on six T-74 data files: dialogue.json, enemies.json, items.json, maps.json, player.json, quests.json. They are outside T-75 locks and were not modified. T-75 files pass their scoped formatting check.
- npm run e2e -- --workers=1 passed all six tests (chapter select and existing smoke on Chromium, Firefox, WebKit). Eight chapter starts checked against mapId, level and equipped weapon, with no console errors or failed asset requests. Chapter-select durations: Chromium 15.2 s, Firefox 21.3 s, WebKit 44.2 s.
- Initial default six-worker run was resource-heavy; repeated full-page boots also timed out in WebKit. The final test preloads once and returns via Phaser scene lifecycle, then starts each fresh chapter with real menu/number keys. Timeout remains 60 seconds.
- Pull --rebase was attempted before the first two parts but Git refused because T-74 had concurrent unstaged changes; no other-agent changes were stashed. A later pull before the final commit succeeded (branch up to date). No push.
