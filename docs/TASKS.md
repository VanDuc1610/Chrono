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

### T-37 · Prologue v3 engine: gated commands, mid-battle event, frozen town

- **Assignee:** Claude · **Status:** TODO
- **Locks:** `src/`, `public/assets/data/maps.json`, `public/assets/data/enemies.json`, `public/assets/data/strings.json`, `scripts/author-peter-sprites.js`, `art-source/characters/peter/`
- Per `docs/story/PROLOGUE_V3_PROPOSAL.md` §4/§6: commands locked by flags, battle `script` events, flag-based dialogue for interactables, frozen-town state, Peter sprites without the blade (owner approval).

### T-38 · Prologue v3 dialogue + quests (data only)

- **Assignee:** Antigravity · **Status:** TODO
- **Locks:** `public/assets/data/dialogue.json`, `public/assets/data/quests.json`, `public/assets/data/items.json`, `tests/content-data.test.ts`
- Rewrite acts 1-3 and the Elder per §2 and the data contract in §6 (flags and dialogue ids).

## Backlog (scheduled after current locks are released)

- **Vietnamese pass on remaining UI** (Combat, Main Menu, Prologue End) via `strings.json` once T-28 lands.
- **GitHub Pages release + Playwright cross-browser tests.**

---

## Done (latest 5 — older entries in [TASKS_ARCHIVE.md](TASKS_ARCHIVE.md))

- **T-36** Ông Sáu and the forgotten child approved and integrated: Ông Sáu sits between his thúng chai and nets (NPC); the child is a map `vision` — fades in beside the sandals while `poi_child_sandals_return` plays and dissolves when it ends (new data-driven `visions` in maps.json, validated). Verified live with real key presses (quest `quest_prologue_forgotten_child` completes) + 51 unit tests + 4 CDP suites — Claude
- **T-35** Localized all player-facing text in `MainMenuScene` and `PrologueEndScene` to Vietnamese via `strings.json` (`menu.*`, `ending.*`) and `getStrings(this)` (keeping the `CHRONO — THE FRACTURED DIVINITY` brand title intact, adding `init()` reset in `MainMenuScene`, and sizing the ending title at 20 px so it fits comfortably inside the 380×220 panel); updated `scripts/test-inventory-save.js` to validate Continue by `id`/`enabled` and `data_strings['menu.continue']` instead of `'CONTINUE'`. Verified: `typecheck`, `lint`, `prettier --check .`, 51 unit tests, all 4 CDP suites, plus visual screenshot inspection of Main Menu (no save & Continue), Options Modal, and PrologueEnd card — Antigravity
- **T-34** The Drowned Sentinel playable: data-driven boss `mechanic` in `enemies.json` (80 % shield + HP floor with recovery, lens actions as command [6] unlocked by Temporal Sight or after 3 rounds, left lens stuns, right lens breaks the shield, kneeling `releasedFrame` on victory); encounter + meeting trigger at the lighthouse neck; victory opens his last words, then the UNWRITTEN tablet → Prologue ending. Combat UI and battle log in Vietnamese (`strings.json`, English fallback in `CombatSystem`), long names fit the status cards. Verified: 51 unit tests (7 boss), 4 CDP suites, live fight with real key presses through to `PrologueEndScene` (6/7 runs; the one stall coincided with a Vite reload right after an edit) — Claude
- **T-32** Cô Ba and The Drowned Sentinel approved and integrated (`NPC_VENDOR_BA_001`, `BOSS_SENTINEL_001`): Cô Ba is an NPC behind her stall (talk from between the two stools); enemies get an optional `spriteScale` so the 64 px Sentinel renders at boss size. T-29/T-33 content wired into the maps (sandals, well, crevice). T-29 review: unsupported `completeQuest` removed, `grantExp` now an engine effect, test rejects unknown effect keys; room/town/forest/tablet interactables wired. Verified live + 44 unit tests + 4 CDP suites — Claude
- **T-33** Added remaining Prologue v2 Vietnamese data (`dialogue.json`, `quests.json`): forgotten-child side quest `quest_prologue_forgotten_child` (+15 EXP, `returned_child_sandals`) started by `poi_child_sandals` (2 choices, blurred silhouette), `poi_ancient_well` (frozen water reflecting night sky), `poi_chrono_crevice` (grants `chrono_shard_minor` once via `granted_forest_crevice_shard`), plus §9 tone/keeper/seat polish without pre-empting UNWRITTEN; verified with `typecheck`, `lint`, `prettier --check .`, and 44 unit tests — Antigravity
