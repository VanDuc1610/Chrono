# CHRONO – Task Board

**Coordinator:** Claude Code (assigns tasks, writes Antigravity and Codex prompts, decides when to push).
**Agents:** Claude Code · Google Antigravity · OpenAI Codex (joined 2026-11-15; takes only tasks assigned to it here).
**Owner / final approver:** Project owner (all art approval stays with the owner).

## Protocol (all agents MUST follow)

1. **Read this file before starting work** (all agents: Claude, Antigravity, Codex). Only work on tasks assigned to you.
2. **File locks:** a task in `IN PROGRESS` owns the files listed under _Locks_. No other agent may edit those files until the task is `DONE`.
3. **Need a file that is locked?** Stop and report to the owner — do not edit it.
4. **Commit only your own task's files**, one logical change per commit. Run `npm run typecheck` before committing code.
5. **Git:** `git pull --rebase` before committing/pushing. Never force-push, never rewrite pushed history.
6. **When finished:** set status to `DONE`, add a one-line result at the top of _Done_, and if _Done_ has more than 5 entries move the oldest to `docs/TASKS_ARCHIVE.md` (top of its list). Commit this file with your work.
7. Art pipeline rules in [AGENTS.md](../AGENTS.md) always apply. No task here authorizes generating art or promoting assets without owner approval.

Status values: `TODO` · `IN PROGRESS` · `BLOCKED` · `DONE`

---

## Active

Goal (owner, 2026-11-15): Chapters 5–7 are built and wait for the owner's playtest. Chapter 8 "The Null Hour & The
Convergence" (design approved: CHAPTER_08_DESIGN.md §17, art approved) is being built by Claude while Codex works in
parallel on tooling and docs. The story ends at Chapter 9.

### T-74 · Chapter 8 build ("The Null Hour & The Convergence") — **Claude** · `IN PROGRESS`

_Locks:_ `public/assets/data/*.json`, `scripts/*ch8*`, `scripts/generate-ch1-maps.js`, `scripts/preview-ch1-maps.js`, `public/assets/maps/ch8_*`, `src/world/ActionCombat.ts`, `src/world/Chapter4Field.ts`, `src/world/MapTypes.ts`, `src/world/Chapter8Rules.ts` (new), `src/systems/combat/*`, `src/scenes/*`, `src/state/*`, `tests/chapter8-*.test.ts` (new), `tests/chapter-starts.test.ts`, `tests/content-data.test.ts`, `docs/story/CHAPTER_08_DESIGN.md`, `ASSET_REGISTRY.md`.

### T-75 · Map lint v2, Chapter 7 answer key, chapter-select e2e — **Codex** · `DONE`

_Locks:_ `src/world/MapLint.ts`, `tests/map-lint.test.ts`, `docs/testing/MAP_LINT_REPORT.md`, `docs/testing/DAP_AN_CHUONG_7.md` (new), `e2e/chapters.spec.ts` (new).
Read-only: everything locked by T-74 (data, scenes, combat). Do not fix game data — report it.

## Backlog (scheduled after current locks are released)

- **Vietnamese pass on remaining UI** (Combat, Main Menu, Prologue End) via `strings.json` once T-28 lands.
- **GitHub Pages release + Playwright cross-browser tests.**

---

## Done (latest 5 — older entries in [TASKS_ARCHIVE.md](TASKS_ARCHIVE.md))

- **T-73** Chapter 8 design (`docs/story/CHAPTER_08_DESIGN.md`, Vietnamese, owner decisions §17: Peter was a page of the Origin Book torn loose by a malfunction) and art (owner approved 2026-11-15): convergence tileset (64 tiles), Assimilator, Phase Wraith, Doom Bell, Twin-Era Legionnaire, Second-Hand Warden, Convergent Praetor, Herald of the Null Hour (64), Sixfold Echo, Chronos reborn — Claude
- **T-72** Map lint (`src/world/MapLint.ts`): spawn near exit / blocked, unreachable targets, reveal without refresh, trigger covering a spawn, dangling refs; 22 errors + 93 warnings baselined in `tests/map-lint.test.ts`, report in `docs/testing/MAP_LINT_REPORT.md` — Codex
- **T-71** Chapter 7 playable: 19 maps on the violet voidcore tileset (hidden mason's tomb, white bell crypt, glass ash core), name-restoring altars, fog lullaby maze, Vietnamese diacritics letter, three sails logic, valve balance (solver-checked), Hollow Husk / Name Eater / Erasure Moths / Ink Hound / Void Inquisitor, Nameless Weeper pool of tears, Kuro boss ending by calling his true name (mother's embrace) or a colder win, Primordial Shade decoy rings, cliffhanger into Chapter 8, level cap 27, chapter select 7. Verified: 138 unit tests, live CDP runs of every map, puzzle (right and wrong), boss and the end card — Claude
- **T-70** Chapter 7 art, first set (owner approved 2026-11-15, violet void per owner): voidcore tileset (dungeon tinted ink-violet + 32 tiles), void-touched Kuro, Kuro's mother, nameless shade, The First Forgotten (48), Name Eater, Hollow Husk, Erasure Moths, Ink Hound — Claude
- **T-69** Chapter 7 design (`docs/story/CHAPTER_07_DESIGN.md`, Vietnamese): "The Cradle of the Forgotten" structured §1–§17 (The Deep Void Core, 17 maps 150–180 min, ~60% puzzle/mystery + 40% combat; central mechanic "Restoring Names" using origin_seal_half; 13 distinct deduction puzzles C01–C13 with airtight math/logic & zero timer pressure; 5 World Secrets; deep callbacks to Ch4–Ch6; 4 flashbacks including Kuro's mother and baby Peter in the cradle; 4 foes designed specifically for Claude's sprites [name eater, hollow husk, erasure moths, ink hound], 1 elite, mid-boss Nameless Weeper, main boss void-touched Kuro pacified via mother's lullaby & name, hidden boss Primordial Shade; Level cap 27; 10 quests; full ch7_ ID contract; cliffhanger into Chapter 8 Null Hour & Convergence) — Antigravity
