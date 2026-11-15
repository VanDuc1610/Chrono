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

### T-78 · Chapter 9 design v2 (Kuro route + review fixes) — **Antigravity** · `IN PROGRESS`

_Locks:_ `docs/story/CHAPTER_09_DESIGN.md`. Read-only: everything else.

### T-79 · Fix the real map-lint errors in chapters 0–7 + Chapter 8 answer key — **Codex** · `IN PROGRESS`

_Locks:_ `scripts/ch1-layout.js` … `scripts/ch7-layout.js`, `scripts/coastal-layout.js`, `scripts/wire-ch*.mjs` except `wire-ch8.mjs`, `scripts/generate-*.js`, `public/assets/maps/` except `map_ch8_*`, `public/assets/data/maps.json`, `tests/map-lint.test.ts`, `docs/testing/MAP_LINT_REPORT.md`, `docs/testing/DAP_AN_CHUONG_8.md` (new).

## Backlog (scheduled after current locks are released)

- **Vietnamese pass on remaining UI** (Combat, Main Menu, Prologue End) via `strings.json` once T-28 lands.
- **GitHub Pages release + Playwright cross-browser tests.**

---

## Done (latest 5 — older entries in [TASKS_ARCHIVE.md](TASKS_ARCHIVE.md))

- **T-77** Code review of the Chapter 8 engine (`docs/reviews/T-74_CODEX_REVIEW.md`): every puzzle walked on the map grid; found the Herald could die before the 11:59 anchoring and that the barracks anchor drove every Phase Wraith; both fixed by Claude with regression tests — Codex
- **T-74** Chapter 8 playable: 15 maps + 3 hidden on the convergence tileset, World Anchoring posts (anchored tile swaps), companions by act (Ivo → Lyra → Neris) walking beside Peter and Kuro, Assimilator / Doom Bell / Twin-Era Legionnaire / Phase Wraith, Second-Hand Warden, Convergent Praetor (mirror verdict, heal penalty), Herald of the Null Hour (25th-hour clock, companion calls, Kuro save, 11:59 finisher), Sixfold Echo (six seal phases), three defence waves, 13 puzzles (solver-checked), Chapter 7 → 8 → end card, level cap 29, chapter select 8, HUD titles for chapters 6–8. Verified: 162 unit tests, live CDP runs of every map, puzzle (right and wrong), boss and the end card — Claude
- **T-76** Chapter 9 design (`docs/story/CHAPTER_09_DESIGN.md`, Vietnamese, the finale): "The Fractured Divinity / The Last Chronarch" structured §1–§17 (The Nexus of Eternity, 18 maps [15 main + 3 hidden], 150–180 min, ~60% puzzles & mysteries + 40% combat; central mechanic Reality Inscription & Tri-Partite Resonance; full resolution of OQ-01 to OQ-05 including the empty chair promise; 13 distinct deduction puzzles C01–C13 with airtight single-answer proofs and no timers; 5 World Secrets; full callbacks to Ch4–Ch8; 4 flashbacks; 4 new field foes with timing tell & counter, 1 elite, mid-boss Primeval Architect, finale boss The Sixfold Divinity [Chronos–Kuro–Peter 3-phase confrontation], hidden boss Void Singularity Core; Level cap 30; 10 quests; valid engine items; §13 art contract; 3 detailed endings [The Eternal Order, The Unbound Eternity, The Last Chronarch True Ending]; §17 ID contract) — Antigravity
- **T-75** Map lint v2 (layer variants, swaps and timer bridges counted; 22 → fewer real errors, report in `docs/testing/MAP_LINT_REPORT.md`), Chapter 7 answer key (`docs/testing/DAP_AN_CHUONG_7.md`), chapter-select e2e for every chapter start in Chromium/Firefox/WebKit (`e2e/chapters.spec.ts`) — Codex
- **T-73** Chapter 8 design (`docs/story/CHAPTER_08_DESIGN.md`, Vietnamese, owner decisions §17: Peter was a page of the Origin Book torn loose by a malfunction) and art (owner approved 2026-11-15): convergence tileset (64 tiles), Assimilator, Phase Wraith, Doom Bell, Twin-Era Legionnaire, Second-Hand Warden, Convergent Praetor, Herald of the Null Hour (64), Sixfold Echo, Chronos reborn — Claude
