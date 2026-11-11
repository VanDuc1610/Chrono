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

Goal (owner, 2026-11-11): rebuild the Prologue per `docs/story/STORY_PROLOGUE.md` (Khánh Hòa), all in-game text in Vietnamese.

### T-28 · Multi-map world engine + UI strings table

- **Assignee:** Claude · **Status:** IN PROGRESS
- **Locks:** `src/scenes/ExplorationScene.ts`, `src/scenes/PreloadScene.ts`, `src/state/GameSession.ts`, `src/ui/`, `src/world/` (new), `public/assets/maps/`, `public/assets/data/interactables.json`, `public/assets/data/maps.json` (new), `public/assets/data/strings.json` (new), `scripts/generate-map.js`, `scripts/map-props.js`
- Data-driven maps (exits, spawn points, NPCs, interactables, encounters, enter-triggers per map), fade transitions, `mapId` in saves, UI text from `strings.json` (Vietnamese-ready), split ExplorationScene HUD/dialogue/satchel into `src/ui/`.

## Backlog (scheduled after current locks are released)

- **Prologue v2 art** (Claude, Pipeline B) — from the approved T-27 asset list; owner approves each candidate.
- **Prologue v2 content** (Antigravity) — Vietnamese dialogue/quest/item JSON per approved T-27, on the T-28 engine.
- **Vietnamese pass on remaining UI** (Combat, Main Menu, Prologue End) via `strings.json` once T-28 lands.
- **GitHub Pages release + Playwright cross-browser tests.**

---

## Done (latest 5 — older entries in [TASKS_ARCHIVE.md](TASKS_ARCHIVE.md))

- **T-27** Prologue v2 design (`docs/story/PROLOGUE_V2_DESIGN.md`, Vietnamese) approved by owner 2026-11-11 with coordinator fixes: 2 merged tilesets (coastal, wilds), correct 32×32 specs, Temporal Sight innate, Elder no longer pre-empts the UNWRITTEN reveal, Empty Seat / forgotten child / lighthouse keeper beats added, lens puzzle as in-combat environment actions — Antigravity (design), Claude (review)
- **T-26** Integrated `UI_SET_001` panel frame (`createPanel` helper in `src/ui/Panel.ts` using `ui_frame` 48×48 NineSlice with 16 px corners and ≥8 px inner padding) across `ExplorationScene`, `CombatScene` (with `setTint`/`clearTint` on the command panel per turn state), `MainMenuScene` (options modal + `ui_cursor` sprite playing `ui_cursor_pulse`), and `PrologueEndScene` (card); verified with `typecheck`, `lint`, `prettier --check`, 34 unit tests, 4 CDP suites, and screenshot inspection — Antigravity
- **T-24** Peter combat sheets (attack 6f, hurt 2f, temporal_sight 4f × 4 dirs) approved by owner and integrated (`CHAR_PETER_003`): CombatScene shows Peter in profile, Attack = slash + lunge, Skill = Temporal Sight wind-up then strike, enemy hits = hurt recoil/flash; damage numbers land on impact. Verified with a live-engine animation probe, 34 unit tests, 4 CDP suites — Claude
- **T-25** UI art set (nine-slice frame, 2-frame cursor, 4-frame hit spark) approved and deployed (`UI_SET_001`); `ui_cursor`/`hit_spark` now load as spritesheets with global anims `ui_cursor_pulse` / `hit_spark_burst`; tinted hit sparks used in combat. Placeholder generators no longer overwrite these files. Frame + cursor integration → T-26 — Claude
- **T-22** Prologue content integrated (owner approved proposal + prop art): data-driven `effects` on dialogue nodes (`GameSession.applyDialogueEffects`), 7 points of interest from `interactables.json`, tileset v3 prop tiles placed via `scripts/map-props.js`. Quest tracker: 3 objective rows, `[Q]` cycles active quests, "(+N)" count, overflow trimmed with "…". Verified live: all 7 POIs and branches, `quest_prologue_remnants` complete (+40 EXP), gear/shard granted once, Elder lore branch, prop collision; 34 unit tests + 4 CDP suites PASS — Claude
