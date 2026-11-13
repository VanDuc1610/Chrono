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

Goal (owner, 2026-11-13): build Chapter 3 "The Kingdom of Forgotten Souls" from
[CHAPTER_03_DESIGN.md](story/CHAPTER_03_DESIGN.md) — owner approved §1–§11 with the changes in
**§12** (§12 wins where they differ).

### T-56 · Chapter 3 content

- **Assignee:** Antigravity · **Status:** DONE
- **Locks:** `public/assets/data/dialogue.json`, `public/assets/data/quests.json`, `public/assets/data/items.json`, `tests/content-data.test.ts`
- **Contract:** CHAPTER_03_DESIGN.md §7, §11 and §12 (exact ids)

## Backlog (scheduled after current locks are released)

- **Vietnamese pass on remaining UI** (Combat, Main Menu, Prologue End) via `strings.json` once T-28 lands.
- **GitHub Pages release + Playwright cross-browser tests.**

---

## Done (latest 5 — older entries in [TASKS_ARCHIVE.md](TASKS_ARCHIVE.md))

- **T-57** Chapter 3 playable: 8 maps (Tiền Đình → Nghĩa Địa → Hành Lang Vang Vọng → Hầm Ngầm Tinh Thể → Đại Thư Viện → Hoàng Lăng → Thánh Điện Hợp Xướng, + hidden Kho Ký Ức), Chapter 2 end card continues into Chapter 3. Engine: strike targets (resonance pillars), startTimer (8-second bridge, abyss falls back to the edge), ifItems/ifFlags rules, Memory Wraith blink, Thought Eater pools, Hollow Archivist decoys, Faceless Keeper memory lock + mirror, Nameless Choir songs and cores (keys 6-8). Review of T-56: answers no longer given away (tomb III, red bell, console hint, painter's note, lullaby). Verified: 98 unit tests, 4 CDP suites, live run of every puzzle, both bosses and the end card — Claude
- **T-58** Chapter 3 art approved and integrated: Neris, King Alden, Memory Wraith, Thought Eater, Hollow Archivist, The Keeper Without a Face (48×48), The Nameless Choir (64×64) — Claude
- **T-56** Chapter 3 content (`dialogue.json`, `quests.json`, `items.json`, `tests/content-data.test.ts`): 22 items (10 documents with pages ≤ 220 chars, 7 puzzles, 1 weapon, 1 charm, 2 consumables, 2 key items, 1 material), 10 quests (7 main + 3 side), 83 dialogue nodes across 8 maps with natural Vietnamese ≤ 220 chars/line and ≤ 2 choices/node, Sculptor's Tomb (3 clues, 5 tombs, Willow III correct), 8s copper bell bridge timer, Wolf censorship deduction, King Alden false memory cleared via ribbon + dispatch log, hidden Queen canvas 3-layer restoration (Pure Crystal charm), 5-beat music box (Needle Rapier), and Memory Seal restoration with endChapter: 3; verified with typecheck, lint, prettier, and 98 unit tests — Antigravity
- **T-54** Chapter 3 design (`docs/story/CHAPTER_03_DESIGN.md`, Vietnamese): "The Kingdom of Forgotten Souls" structured §1–§11 (Peter's Unwritten stake, 8 maps 75–100 min using existing dungeon/sunken/wilds tilesets, 5 rising-difficulty cross-referencing puzzles: Sculptor's Tomb, Kinetic Resonance, 8s Timed Abyss, Censorship Ledger, and King Alden's Forgery; 3 new real-time behaviours: teleport-evade, hazard pool, phantasm clone; turn-based Mid-Boss Faceless Keeper & Final Boss Nameless Choir; 7 main + 3 side quests; hidden Needle Rapier & Pure Crystal charm; §11 ID contract) — Antigravity Owner approved 2026-11-13 with the §12 changes (Claude review).
- **T-55** Owner playtest pass on Chapter 2: level curve to 15 with chapter caps (Chapter 1 ≤ 9, Chapter 2 ≤ 12, at most one level banked); automaton shield only on the side it faces (hits from above/below/behind land); Chapter 2 enemies ~2× HP; boss retuned (level 11 with the hidden gear wins with ~20–50 HP). Puzzles two steps harder: the alcove's era dial (riddle on the foundation stone), five tombs in two calendars (dedication plaque gives the conversion; Marcus is a decoy), four unlabelled tablet lines (the root cause is what happened first), the blank page hidden with the rebels' records. Verified: 89 unit tests, 4 CDP suites, live Chapter 2 run of every puzzle — Claude
