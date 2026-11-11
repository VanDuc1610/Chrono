# CHRONO – Task Board

**Coordinator:** Claude Code (assigns tasks, writes Antigravity prompts, decides when to push).
**Owner / final approver:** Project owner (all art approval stays with the owner).

## Protocol (both agents MUST follow)

1. **Read this file before starting work.** Only work on tasks assigned to you.
2. **File locks:** a task in `IN PROGRESS` owns the files listed under _Locks_. The other agent must not edit those files until the task is `DONE`.
3. **Need a file that is locked?** Stop and report to the owner — do not edit it.
4. **Commit only your own task's files**, one logical change per commit. Run `npm run typecheck` before committing code.
5. **Git:** `git pull --rebase` before committing/pushing. Never force-push, never rewrite pushed history.
6. **When finished:** set status to `DONE`, add a one-line result at the top of _Done_, and if _Done_ has more than 5 entries move the oldest to `docs/TASKS_ARCHIVE.md` (top of its list). Commit this file with your work.
7. Art pipeline rules in [AGENTS.md](../AGENTS.md) always apply. No task here authorizes generating art or promoting assets without owner approval.

Status values: `TODO` · `IN PROGRESS` · `BLOCKED` · `DONE`

---

## Active

Goal (owner, 2026-11-11): rebuild the Prologue per `docs/story/PROLOGUE_V2_DESIGN.md` (approved), all in-game text in Vietnamese.

## Backlog (scheduled after current locks are released)

- **Vietnamese pass on remaining UI** (Combat, Main Menu, Prologue End) via `strings.json` once T-28 lands.
- **GitHub Pages release + Playwright cross-browser tests.**

---

## Done (latest 5 — older entries in [TASKS_ARCHIVE.md](TASKS_ARCHIVE.md))

- **T-34** The Drowned Sentinel playable: data-driven boss `mechanic` in `enemies.json` (80 % shield + HP floor with recovery, lens actions as command [6] unlocked by Temporal Sight or after 3 rounds, left lens stuns, right lens breaks the shield, kneeling `releasedFrame` on victory); encounter + meeting trigger at the lighthouse neck; victory opens his last words, then the UNWRITTEN tablet → Prologue ending. Combat UI and battle log in Vietnamese (`strings.json`, English fallback in `CombatSystem`), long names fit the status cards. Verified: 51 unit tests (7 boss), 4 CDP suites, live fight with real key presses through to `PrologueEndScene` (6/7 runs; the one stall coincided with a Vite reload right after an edit) — Claude
- **T-32** Cô Ba and The Drowned Sentinel approved and integrated (`NPC_VENDOR_BA_001`, `BOSS_SENTINEL_001`): Cô Ba is an NPC behind her stall (talk from between the two stools); enemies get an optional `spriteScale` so the 64 px Sentinel renders at boss size. T-29/T-33 content wired into the maps (sandals, well, crevice). T-29 review: unsupported `completeQuest` removed, `grantExp` now an engine effect, test rejects unknown effect keys; room/town/forest/tablet interactables wired. Verified live + 44 unit tests + 4 CDP suites — Claude
- **T-33** Added remaining Prologue v2 Vietnamese data (`dialogue.json`, `quests.json`): forgotten-child side quest `quest_prologue_forgotten_child` (+15 EXP, `returned_child_sandals`) started by `poi_child_sandals` (2 choices, blurred silhouette), `poi_ancient_well` (frozen water reflecting night sky), `poi_chrono_crevice` (grants `chrono_shard_minor` once via `granted_forest_crevice_shard`), plus §9 tone/keeper/seat polish without pre-empting UNWRITTEN; verified with `typecheck`, `lint`, `prettier --check .`, and 44 unit tests — Antigravity
- **T-29** Authored full Prologue v2 Vietnamese data: rewrote `intro_awakening` for Peter's room (no "Where am I? -> Antechamber" branch), added `room_door_locked`, room interactables & key flow (`has_room_key` gates exit), coastal town, forest, and lighthouse dialogues; `quests.json` updated with `quest_prologue_awaken` ("started") and `quest_prologue_awakening` ("inactive", started by antechamber arrival); `items.json` and `enemies.json` translated to Vietnamese; verified with `typecheck`, 43 unit tests (including room quest end-to-end), and CDP browser suites — Antigravity
- **T-31** `wilds_tileset` approved (`ENV_WILDS_001`) and integrated: Forgotten Forest (26×18, stray Shade with its own `defeated_forest_shade` flag) and Old Lighthouse headland (24×18) generated from `scripts/wilds-layout.js`; Antechamber gets a south stair to the forest and its Threshold Gates lead to the lighthouse once `elder_granted_beacon` is set. Full route verified live: room → town → forest → Antechamber → (gate) → lighthouse and back; 42 unit tests, 4 CDP suites — Claude
