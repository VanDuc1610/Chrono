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

Goal (owner, 2026-11-13): build Chapter 2 "The Empire of False Causality" from
[CHAPTER_02_DESIGN.md](story/CHAPTER_02_DESIGN.md) — owner approved §1–§10 with the changes and the
ID contract in **§11** (§11 wins where they differ).

### T-51 · Chapter 2 content

- **Assignee:** Antigravity · **Status:** DONE
- **Locks:** (none)
- **Contract:** CHAPTER_02_DESIGN.md §7 + §11.3 (exact ids)

## Backlog (scheduled after current locks are released)

- **Vietnamese pass on remaining UI** (Combat, Main Menu, Prologue End) via `strings.json` once T-28 lands.
- **GitHub Pages release + Playwright cross-browser tests.**

---

## Done (latest 5 — older entries in [TASKS_ARCHIVE.md](TASKS_ARCHIVE.md))

- **T-52** Chapter 2 playable: 5 maps (Ngoại Ô Bia Đá → Hầm Mộ → Quảng Trường → Đại Thư Viện → Điện Phán Quyết), Chapter 1 end card continues into Chapter 2; sentence boss The Imperial Verdict (3 defied verdicts break the scales), Imperial Automaton front shield, Causality Enforcer reflect glow, levels to 11; puzzles wired (retroactive key, tomb dates, scales, verdict tablet) with the clues left in the world — tomb and tablet hints that gave the answer away were trimmed. Fix: points of interest now honour `requiresFlag` (the seal could open before its boss). Verified: 88 unit tests, 4 CDP suites, full live playthrough to "HOÀN THÀNH CHƯƠNG 2" (7/7 Chapter 2 quests) — Claude
- **T-53** Chapter 2 art approved and integrated: Lyra, Exiled Praetor, Imperial Automaton, Causality Enforcer, The Imperial Verdict (Pipeline B, owner approved 2026-11-13) — Claude
- **T-51** Chapter 2 content (`dialogue.json`, `quests.json`, `items.json`, `tests/content-data.test.ts`): 9 items (2 documents with pages ≤ 220 chars, 3 puzzles, 1 weapon, 1 charm, 1 consumable, 1 key item), 7 quests (5 main + 2 side), 47 dialogue nodes across 5 maps with natural Vietnamese ≤ 220 chars/line and ≤ 2 choices/node, retroactive alcove key + 3-tomb rapier puzzle + scales of truth charm + 3-line verdict expunging, seal restoration with endChapter: 2; verified with typecheck, lint, prettier, and 88 unit tests — Antigravity
- **T-49** Chapter 2 design (`docs/story/CHAPTER_02_DESIGN.md`, Vietnamese): "The Empire of False Causality" structured §1–§10 (Peter's watchmaker motivation, 5 maps using existing dungeon/wilds tilesets, new causality puzzle mechanics: Retroactive Cause Lock & Expunging the Verdict, real-time Automaton/Enforcer encounters, turn-based Pre-Emptive Sentence boss The Imperial Verdict, 5 main quests + 2 side quests, hidden weapon Praetor Rapier & Scales of Truth charm, art list, 5 owner questions) — Antigravity Owner approved 2026-11-13 with the §11 changes (Claude review).
- **T-50** Owner feedback pass: the moment time stops, the Time Wraith (Bóng Ma Thời Gian) attacks in a turn-based boss fight Peter cannot win or lose (bare-handed attack; battle script `unlockedCommands`, `rescue` with a party HP floor) — at 20 % HP the Elder steps in and the rescue continues as before. The Elder now walks with Peter only as far as the shrine (`elder_parted` on arrival, parting line in his farewell). Small enemies ~18 % faster (default speed 84). Hidden gear in Chapter 1: Kim Giờ Hải Đăng (weapon, beacon lone rock at low tide, clue on logbook page 3) and Vỏ Ốc Biết Hát (charm, village east rock nook, needs the child's drawing; clue in the fisherman's letter). Verified: 80 unit tests, 4 CDP suites, live probe of the ambush → rescue → rest — Claude
