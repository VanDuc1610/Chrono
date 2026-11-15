# T-74 Chapter 8 code review — T-77 / Codex

Reviewed on 2026-11-15. The engine baseline is `d0a92c2`, with repository history through `dab1b1e` and the concurrent, uncommitted T-74 C05 changes in `wire-ch8.mjs`, `content-ch8.mjs`, `maps.json` and `dialogue.json`. Line references below refer to the working tree unless a commit is named explicitly.

Two active findings were confirmed in Chromium. The original C05 progression blocker was repaired in the working tree during this review and is recorded separately below.

## Active findings

### R1 — The Herald can die before the required anchoring action

Severity **major**.

Locations include `scripts/enemies-ch8.mjs:155`, `scripts/enemies-ch8.mjs:159`, `scripts/enemies-ch8.mjs:162`, `src/systems/combat/CombatSystem.ts:695`, `src/scenes/CombatScene.ts:724` and `scripts/content-ch8.mjs:677`.

The Herald spreads `open`, which has `startsUnshielded: true` and `hpFloor: 0`. Ordinary damage therefore takes the boss directly to zero. Defining a finisher at 10% only adds an environment option. It does not prevent ordinary attacks from ending the fight. The victory dialogue then says the hand has been anchored at 11:59, even though `ch8_anchored_1159` is still false. This bypasses the chapter's final interaction in design §9.4 and saves a state inconsistent with the ending being shown.

**Concrete reproduction, confirmed live**

1. Start Chapter 8 from the main-menu chapter selector. Use an in-memory scene transition to reach the Herald fight.
2. At Peter's active turn, set the Herald's HP to 1 to isolate the final-hit condition and clear `ch8_anchored_1159`.
3. Confirm `getEnvironmentOptions()` includes `anchor_1159`.
4. Press the real `1` key for Tấn Công. The normal command handler leaves enemy HP at 0 and `isBattleOver()` true, while `ch8_anchored_1159` remains false.

Suggested fix is a Herald-specific nonlethal floor until the valid anchoring action completes. Preserve the last HP through ordinary attacks, skills and any other damage source, then allow the finisher to end the fight and set its story flag. Merely changing `hpFloor` while keeping `startsUnshielded` will not work, since `applyDamage()` currently enforces that floor only inside the shield branch. Changing the exit to require the flag without protecting the boss from ordinary death would create a progression lock.

Add an integration regression with ordinary lethal damage below 10%, followed by the anchoring action. The current pure clock tests do not exercise the damage-to-victory path. This finding does not claim that the current chapter exit is locked, since that exit accepts `defeated_null_hour_herald`.

### R2 — A barracks anchor permanently controls Wraiths on other maps

Severity **major**.

Locations include `scripts/enemies-ch8.mjs:79` and `src/world/ActionCombat.ts:1288`.

Every `enemy_phase_wraith` shares the anchor flags `ch8_c05_p2_w` and `ch8_c05_p2_s`. `isSolid()` reads those session flags without checking the current map or the Wraith's anchor region. Completing C05 normally leaves P2 set to Sol-Karis. That flag persists into later maps, making their Wraiths permanently faded instead of periodically solid. It also suppresses their ordinary strikes in `ActionCombat.ts:759` and causes normal slashes to be rejected by `defended()`.

**Concrete reproduction, confirmed live**

At `map_ch8_anchor_tower_gears`, the local dials are `ch8_g1` and `ch8_g2`. For an actual Wraith spawned there, setting the persistent barracks state to P2=S makes `isSolid()` return false. Changing only that foreign barracks state to P2=W makes it return true. Neither operation uses a local anchor. The same shared enemy definition is used by the Wraith in wave 2 at the plaza.

Temporal Strike and companion damage still provide ways to kill it, so this is a broken enemy/anchor mechanic rather than a demonstrated wave soft-lock.

Suggested fix is to bind anchor conditions per roamer/map region, or apply this particular anchor pair only on the barracks map and use the timed blink elsewhere. Where another local anchor should control a Wraith, declare that relationship in map data. Add an integration case that completes C05 with P2=S, moves to the tower, and checks that the tower's Wraith follows its local rule. The current `wraithSolid()` unit test correctly checks the supplied `own`/`other` values, but cannot detect the wrong flags being supplied.

## Resolved during the review

### R3 — Duplicate C05 interaction ID removed the far-side dial

Original severity **blocker**, resolved in the concurrent working-tree change.

The original location is `scripts/wire-ch8.mjs` at `d0a92c2:400`. Both the physical P3 at (25,6) and Kuro's remote control at (18,7) registered as `ch8_c05_p3`. `src/systems/interaction/InteractionSystem.ts:9` stores interactables with `Map.set(id, value)`, so the second registration replaced the far-side dial. The player needed P3=W to enter region 3, then P3=S from inside it to open the exit. With only the remote control registered, the second action could not be performed from region 3.

The current fix keeps the physical dial and uses a separately identified Kuro POI. Its dialogue sets `ch8_c05_p3_w` and clears the conflicting S/none flags at `scripts/content-ch8.mjs:290`. The matching POI is at `scripts/wire-ch8.mjs:387`.

**Confirmed live on the fixed working tree** — Kuro's dialogue sets W, the two entry tiles become GIDs 58 and 52, and the physical P3 is registered at pixel (816,208), corresponding to tile (25,6). Two real E presses from tile (25,7) cycle W → none → S, opening the exit tile to GID 51. This is no longer an active finding. The hotfix was uncommitted when verified.

## Puzzle and reference audit

Checked the generated map data against `wire-ch8.mjs`, `content-ch8.mjs`, `ch8-layout.js` and design §6. The grid checks use the actual Walls layer and collision GIDs 4–48, recomputing active tile swaps after changing each dial. Access checks follow four-way walkable tile centers and each interaction radius. The C05 route includes the newly added Kuro dialogue effect.

| Puzzle | Map suffix           | Solvable sequence checked on the map grid                                                                                                                                 |
| ------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C01    | `null_rift_landing`  | `ch8_a1=kh`, cross the first channel, `ch8_a2=beta`, cross the second channel to the far bank.                                                                            |
| C02    | `steel_tide_shore`   | P1=KH, P2=Beta, P3=KH. All three posts are accessible and the dialCheck sets `solved_na_chalk_shore`.                                                                     |
| C03    | `gear_market`        | Middle `t16`, output `t24`. Both dials are accessible and match the gear equations.                                                                                       |
| C04    | `ragged_forum`       | Banner values D–A–C–B. The four dials are accessible and the correct check opens the eastern gate.                                                                        |
| C05    | `twin_era_barracks`  | P1=W → P2=S → Kuro sets P3=W → enter region 3 → physical P3=S → completion zone. The fixed physical interaction was also exercised live.                                  |
| C06    | `ash_stair_library`  | N–U at the first altar, then E–A at the second. The first completion flag gates the second check.                                                                         |
| C07    | `mirror_ossuary`     | First `none` (Thượng Giới/prism), second `backslash` (Cõi Linh Hồn/mirror). The posts are accessible. The actual runtime beam reaches the target blue only for this pair. |
| C08    | `torn_page_sanctum`  | A-up, B-up, C-up. All slots are accessible. Follow the dialogue chain through `ch8_ff_3` to open the next map, rather than stopping at `solved_torn_page`.                |
| C09    | `convergence_plaza`  | North Ivo, east Lyra, south Neris, west `trench`. All four command-table dials are accessible. Wave progression was additionally probed live.                             |
| C10    | `anchor_tower_base`  | Clockwise from 12, Origin–Continuum–Causality–Memory–Finality–Possibility. All six dials and their quote plates are accessible.                                           |
| C11    | `hidden_war_archive` | `n2`, `n4`, `n9`. All three dials are accessible, and the values satisfy the stated constraints.                                                                          |
| C12    | `blank_ledger_vault` | `peter`. The dial is accessible. The vault entrance separately checks for the Kuro ledger.                                                                                |
| C13    | `sixfold_echo_hall`  | Pillars 1–6 in restoration order. Each successive pillar is accessible and wrong-order dialogue clears the accumulated flags.                                             |

The grid pass also checks the tower traversal outside the numbered puzzles. `ch8_g1=kh` opens the row-11 crossing, after which `ch8_g2=beta` is reachable and opens the row-5 lift towards the Herald. The southern secret door is separately opened by its dialogue.

C07's implemented geometry and answer differ from the original design §6 coordinates and world assignment. The live clue says the light must become blue before turning, and the implementation has a unique solution consistent with that clue. This difference does not make the implemented puzzle unsolvable.

The reference scan found no nonexistent dialogue IDs in Chapter 8 map wiring, no read of a generated `<dialId>_<key>` absent from that dial's values, and no referenced map flag without a producer in the project data. Producers include dialogue effects, dial values, trigger once-flags, encounter/roamer defeat flags, group-clear flags and beam completion. Duplicate P3 IDs in the original commit were an interaction-registration bug despite all referenced values existing.

## Engine coverage and live checks

- Read `Chapter8Rules.ts` and all 14 Chapter 8 tests. The pure timing, mimic, taunt, clock and phase helpers agree with their supplied inputs. The two active findings arise where definitions and runtime state are integrated.
- Traced slash/skill teaching, repeated-move counters, delayed dash pursuit, bell first-toll cracking and wave reset, taunt timing, sweep contact/window handling, follower creation/update and their pause/shutdown paths. No additional reproducible regression is asserted from those paths.
- Traced `getClockHand`, clock advancement, one-use companion calls, environment-option availability and execution, HP-based ring settings, reverse rhythm, healing penalty, pending cues and `afterBlocks`. The live clock probe advanced 24 → Kuro hold at 24 → strike/reset at 20, dealing 213 damage for 303 max HP as configured.
- Started Chapter 8 through the real menu and number key in Chromium, arriving at `map_ch8_null_rift_landing` at level 27. Later probes used in-memory scene transitions and controlled state to isolate each condition. They do not represent a full natural playthrough or a manual balance test.
- Evaluated all four C07 combinations using the running field tracer and the real collision layer. Only `(none, backslash)` returned `lit: true`, ending at the target. The other three ended at a wall.
- For C09, called the existing damage path on the three actual roamers of each wave to check bookkeeping. Each group set its clear flag, the zone opened `ch8_wave1_done`, `ch8_wave2_done` and `ch8_wave3_done` in order, and `held_last_line` became true. This confirms the flag/refresh/spawn progression, without testing the difficulty of defeating those enemies with ordinary controls.
- `npm test` passed all **161 tests in 24 files** on the reviewed working tree. These passing tests do not cover the two active integration failures above. Typecheck and ESLint also passed. The full Prettier check still reports six T-74 JSON files (dialogue, enemies, items, maps, player, quests). The review document passes its scoped formatting check.
- The requested `git pull --rebase` was attempted before committing and refused because concurrent T-74 edits are unstaged. The review commit contains only this file. The authorized T-77 DONE marker is left in the task board working tree, following the instruction to commit only the review.

Only this review document and the authorized T-77 status marker were edited for the review.
