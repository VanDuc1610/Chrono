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

### T-39 · Integrate Peter empty-handed sprites

- **Assignee:** Claude · **Status:** BLOCKED — `CHAR_PETER_004_CAND` awaiting owner approval
- On approval: deploy `peter_idle_unarmed` / `peter_walk_unarmed` and load them in PreloadScene (engine already switches on `has_broken_blade`).

## Backlog (scheduled after current locks are released)

- **Vietnamese pass on remaining UI** (Combat, Main Menu, Prologue End) via `strings.json` once T-28 lands.
- **GitHub Pages release + Playwright cross-browser tests.**

---

## Done (latest 5 — older entries in [TASKS_ARCHIVE.md](TASKS_ARCHIVE.md))

- **T-37** Prologue v3 playable through acts 1-3: commands gated by flags (player.json `commandFlags`, saves < 0.3 migrated), scripted first battle (`enemy_rift_shade_first`: Escape locked, the Elder appears in round 2 and throws the blade), frozen town/attic (`frozenWhen`, Elder `resistsFreeze`), flag-based dialogue for NPCs and points of interest, hidden encounter started by the time-stop trigger, Elder visit as a vision, customer door, forest path opens with `elder_joined`, "time restored" beat on the headland. T-38 reviewed (good; battle lines double-prefixed by the engine — fixed). Verified live with real keys from New Game to the forest quest + 57 unit tests + 4 CDP suites — Claude
- **T-38** Rewrote Prologue v3 Vietnamese dialogue, quests, and items per `docs/story/PROLOGUE_V3_PROPOSAL.md` §2/§5/§6: Act 1 watchmaker morning (`intro_awakening`, `room_*`, `elder_shop_visit`, `watch_delivery`, `relic_chronometer`, `brass_key` with zero cosmic vocabulary); Act 2–3 beats (`town_time_stops`, `battle_elder_intervenes` 4 lines ≤ 90 chars, `elder_after_first_battle` granting `broken_blade`, `grandfather_watch_awakens`, `elder_explains_frozen_town`, `*_frozen` town NPC/POI variants); Antechamber Elder-as-teacher + 7 Authority lessons; mysterious `town_time_restored` ending; 5-act quest chain (`quest_prologue_timestop`, `quest_prologue_watch` added, existing ids kept); verified with `typecheck`, `lint`, `prettier --check .`, and 52 Vitest tests — Antigravity
- **T-36** Ông Sáu and the forgotten child approved and integrated: Ông Sáu sits between his thúng chai and nets (NPC); the child is a map `vision` — fades in beside the sandals while `poi_child_sandals_return` plays and dissolves when it ends (new data-driven `visions` in maps.json, validated). Verified live with real key presses (quest `quest_prologue_forgotten_child` completes) + 51 unit tests + 4 CDP suites — Claude
- **T-35** Localized all player-facing text in `MainMenuScene` and `PrologueEndScene` to Vietnamese via `strings.json` (`menu.*`, `ending.*`) and `getStrings(this)` (keeping the `CHRONO — THE FRACTURED DIVINITY` brand title intact, adding `init()` reset in `MainMenuScene`, and sizing the ending title at 20 px so it fits comfortably inside the 380×220 panel); updated `scripts/test-inventory-save.js` to validate Continue by `id`/`enabled` and `data_strings['menu.continue']` instead of `'CONTINUE'`. Verified: `typecheck`, `lint`, `prettier --check .`, 51 unit tests, all 4 CDP suites, plus visual screenshot inspection of Main Menu (no save & Continue), Options Modal, and PrologueEnd card — Antigravity
- **T-34** The Drowned Sentinel playable: data-driven boss `mechanic` in `enemies.json` (80 % shield + HP floor with recovery, lens actions as command [6] unlocked by Temporal Sight or after 3 rounds, left lens stuns, right lens breaks the shield, kneeling `releasedFrame` on victory); encounter + meeting trigger at the lighthouse neck; victory opens his last words, then the UNWRITTEN tablet → Prologue ending. Combat UI and battle log in Vietnamese (`strings.json`, English fallback in `CombatSystem`), long names fit the status cards. Verified: 51 unit tests (7 boss), 4 CDP suites, live fight with real key presses through to `PrologueEndScene` (6/7 runs; the one stall coincided with a Vite reload right after an edit) — Claude
