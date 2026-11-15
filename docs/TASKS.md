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

Goal (owner, 2026-11-15): Chapters 5–7 are built and wait for the owner's playtest. Chapter 8 is built
and verified too. Antigravity designs Chapter 9 (the finale) while Codex reviews the Chapter 8 code. The story ends at Chapter 9.

### T-80 · Chapter 9 art, then engine and build — **Claude** · `IN PROGRESS`

_Locks:_ `scripts/author-ch9-*.js`, `art-source/**/` for Chapter 9 sprites and the nexus tileset. Build locks will be added when the build starts.

### T-81 · Chapter 9 dialogue script (`docs/story/CHAPTER_09_SCRIPT.md`) — **Antigravity** · `IN PROGRESS`

_Locks:_ `docs/story/CHAPTER_09_SCRIPT.md` (new).

### T-82 · Chapter 9 engine: paired rings, companion-call effects, 4-card ending router — **Codex** · `IN PROGRESS`

_Locks:_ `src/systems/combat/CombatTypes.ts`, `src/systems/combat/CombatSystem.ts`, `src/scenes/CombatScene.ts`, `src/scenes/PrologueEndScene.ts`, `tests/chapter9-engine.test.ts` (new); new `ending.ch9.*` keys in `strings.json` only.

## Backlog (scheduled after current locks are released)

- **Vietnamese pass on remaining UI** (Combat, Main Menu, Prologue End) via `strings.json` once T-28 lands.
- **GitHub Pages release + Playwright cross-browser tests.**

---

## Done (latest 5 — older entries in [TASKS_ARCHIVE.md](TASKS_ARCHIVE.md))

- **T-79** Map lint errors in chapters 0–7 fixed (spawns moved off exits, blocked exits and the Chapter 5 seal path opened; zero lint errors left) and the Chapter 8 answer key (`docs/testing/DAP_AN_CHUONG_8.md`) — Codex
- **T-78** Chapter 9 design v2 (`docs/story/CHAPTER_09_DESIGN.md`): Kuro puppet-master route with five clues on real past scenes, four lieutenants, four endings, Thiên Nguyên revealed through C10; Claude review §20, owner decisions §21 — Antigravity
- **T-78** Chapter 9 design v2 (`docs/story/CHAPTER_09_DESIGN.md`, Vietnamese): Kuro "Kẻ Giật Dây" puppet-master route added (5 real-clue foreshadowings from Ch4–Ch8, 4 Possibility-twisted lieutenants with distinct ring mechanics Bran/Lyra/Neris/Other-Peter, Kuro boss ~2400 HP; 22 maps max [6 shared + 6 empty chair + 6 puppet master + 1 finale + 3 hidden]); 4 endings (The Eternal Order, The Unbound Eternity, The Last Chronarch true ending with widened gate, and "Trang Giấy Trở Về" for Kuro route); First Forgotten true name revealed as Thiên Nguyên via C10; C12 replaced with 3–4–5 quantum gears dial puzzle; C02/C03/C05/C10/C13 reworked with airtight unique proofs; real-time map foes (HP 420–550), turn-based Sixfold Divinity with 64x64 combat Chronos; valid engine stat scale; §18 review intact + §19 changelog — Antigravity
- **T-77** Code review of the Chapter 8 engine (`docs/reviews/T-74_CODEX_REVIEW.md`): every puzzle walked on the map grid; found the Herald could die before the 11:59 anchoring and that the barracks anchor drove every Phase Wraith; both fixed by Claude with regression tests — Codex
- **T-74** Chapter 8 playable: 15 maps + 3 hidden on the convergence tileset, World Anchoring posts (anchored tile swaps), companions by act (Ivo → Lyra → Neris) walking beside Peter and Kuro, Assimilator / Doom Bell / Twin-Era Legionnaire / Phase Wraith, Second-Hand Warden, Convergent Praetor (mirror verdict, heal penalty), Herald of the Null Hour (25th-hour clock, companion calls, Kuro save, 11:59 finisher), Sixfold Echo (six seal phases), three defence waves, 13 puzzles (solver-checked), Chapter 7 → 8 → end card, level cap 29, chapter select 8, HUD titles for chapters 6–8. Verified: 162 unit tests, live CDP runs of every map, puzzle (right and wrong), boss and the end card — Claude
