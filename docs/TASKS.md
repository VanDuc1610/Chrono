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

Goal (owner, 2026-11-14): design Chapter 4 "The War Without End" — long, tense, strong characters
with backstories, hazy flashbacks, rounds of puzzles and story choices that lead to different
rewards. Design first; build starts only after the owner approves the document.

### T-61 · Chapter 4 design

- **Assignee:** Antigravity · **Status:** DONE
- **Locks:** `docs/story/CHAPTER_04_DESIGN.md` (new)
- **Contract:** structure of CHAPTER_03_DESIGN.md §1–§11 + §12 lessons; canon in STORY_CHAPTER_04.md and CHRONO_STORY_BIBLE.md (Kuro's first direct meeting happens here)

## Backlog (scheduled after current locks are released)

- **Vietnamese pass on remaining UI** (Combat, Main Menu, Prologue End) via `strings.json` once T-28 lands.
- **GitHub Pages release + Playwright cross-browser tests.**

---

## Done (latest 5 — older entries in [TASKS_ARCHIVE.md](TASKS_ARCHIVE.md))

- **T-61** Chapter 4 design (`docs/story/CHAPTER_04_DESIGN.md`, Vietnamese): "The War Without End" structured §1–§12 (Finality Authority, 12 maps 120–150 min in 3 Temporal Rings: Eve of Battle -> Endless Carnage -> Ash Field; 4 deep characters: Aldric, Kaelen, Bran the 1,427th death, Chronicler Elion; 6 new cross-referencing puzzles including 2-solution hydraulic pressure gate; 3 major ethical choices with distinct rewards and Chapter 6 ending flags; 4 hazy flashbacks with "flashback": true; canonical first direct meeting with Kuro in a quiet ruined room with exact canon lines; 3 new enemy behaviors: ghost sniper laser telegraph, endless phalanx frontal shield, banner carrier resurrect aura; mid-boss The Crimson Standard 48×48, final boss The Last War 64×64 with Finality Execution ritual; hidden Spear of Finality & Interval Lens charm; §12 ID contract) — Antigravity
- **T-60** Playtest fixes: the 8-second bell bridge starts counting only after the dialogue is closed (startTimer during a dialogue waits for it to end); HP + MP bars over Peter (once armed) and an HP bar over every map enemy (decoys copy their source's bar), so pickup/kill banners no longer hide the player's health. Verified: 101 unit tests, live CDP run (bridge flag off while reading, on with countdown after closing, off 8 s later) — Claude
- **T-59** Owner/friend playtest fixes: New Game / Continue after an end card no longer reopen the last chapter's first map (Phaser keeps a scene's previous start data when none is passed — the menu now always passes data; this also caused the reset level, Prologue level cap and Chapter 1 quests seen in Chapter 2). Saves already past a seal (Chapter 1 or 2) get a 'Bước qua Cổng Ngưỡng' choice at the seal to reach the next chapter. Quests tagged main/side + chapter; the tracker shows NHIỆM VỤ CHÍNH / PHỤ, main first; finishing a chapter (and loading an old save) closes that chapter's open quests — main done, side missed — and starts the next main quest. Verified: 101 unit tests, live CDP run of Chapter 2 end → Chapter 3, title → New Game, stuck save → seal → Chapter 3, save → Continue — Claude
- **T-57** Chapter 3 playable: 8 maps (Tiền Đình → Nghĩa Địa → Hành Lang Vang Vọng → Hầm Ngầm Tinh Thể → Đại Thư Viện → Hoàng Lăng → Thánh Điện Hợp Xướng, + hidden Kho Ký Ức), Chapter 2 end card continues into Chapter 3. Engine: strike targets (resonance pillars), startTimer (8-second bridge, abyss falls back to the edge), ifItems/ifFlags rules, Memory Wraith blink, Thought Eater pools, Hollow Archivist decoys, Faceless Keeper memory lock + mirror, Nameless Choir songs and cores (keys 6-8). Review of T-56: answers no longer given away (tomb III, red bell, console hint, painter's note, lullaby). Verified: 98 unit tests, 4 CDP suites, live run of every puzzle, both bosses and the end card — Claude
- **T-58** Chapter 3 art approved and integrated: Neris, King Alden, Memory Wraith, Thought Eater, Hollow Archivist, The Keeper Without a Face (48×48), The Nameless Choir (64×64) — Claude
