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

Goal (owner, 2026-11-14): build Chapter 5 "The Garden of Infinite Possibilities" from
[CHAPTER_05_DESIGN.md](story/CHAPTER_05_DESIGN.md) (approved with §14) and expand it with more puzzle
variety. Chapter 4 waits for the owner's playtest.

### T-65 · Chapter 5 expansion design

- **Assignee:** Antigravity · **Status:** DONE
- **Locks:** (none)
- **Contract:** proposals only (no JSON, code or art); Claude reviews, the owner approves, Claude builds

### T-66 · Chapter 5 build

- **Assignee:** Claude · **Status:** IN PROGRESS
- **Locks:** `src/**`, `public/assets/data/*.json`, `scripts/content-ch5.mjs`, `scripts/ch5-layout.js`, `tests/**`
- **Done so far:** content (176 nodes, 10 quests, 31 items), art approved and loaded (interval + steel tilesets, 9 characters)

## Backlog (scheduled after current locks are released)

- **Vietnamese pass on remaining UI** (Combat, Main Menu, Prologue End) via `strings.json` once T-28 lands.
- **GitHub Pages release + Playwright cross-browser tests.**

---

## Done (latest 5 — older entries in [TASKS_ARCHIVE.md](TASKS_ARCHIVE.md))

- **T-65** Chapter 5 expansion design (`docs/story/CHAPTER_05_EXPANSION.md`, Vietnamese): 8 new distinct deduction puzzles (EX-01 to EX-08 across 4 acts: shadow cross-branch, greenhouse microclimate, Na's chalk sky, 3-witness truth table, quantum astrolabe, poem word melody with broken key substitution, reverse gravity hourglass, dynamic choice mirror), 3 deep side quests (Na's 1000th crane, Gardener's requiem, Ivo's redemption), 3 new maps (glass greenhouse 22×16, alpha harbor 26×18, observatory 24×18), key dialogues, engine specs, owner questions, and full ch5x_ ID contract — Antigravity
- **T-63** Chapter 4 playable: 13 maps (warfield tileset; hidden sentry cellar and First Fallen tomb), dials, two-pan scale (two solutions), arrow volleys with cover, flashback screen, skill/timing enemies (sniper perfect dodge, phalanx parry, banner chant revives, knight charge into walls), timed block in boss fights, Crimson Standard blood wall, The Last War's three-pillar ritual, level cap 18, Chapter 3 → 4 end card, battle Item picks the best-fitting heal. Review of T-62 (answer leaks, two-word sentry answer, ~45 missing pickup/locked nodes, side quest starts). Verified: 116 unit tests, live CDP run of the whole chapter (every puzzle right and wrong, the three choices, both bosses, Kuro, end card) — Claude
- **T-64** Chapter 4 art: warfield tileset (wilds recoloured + 21 war tiles), Aldric, Kaelen, Bran, Elion, Renard, Kuro, Ghost Sniper, Endless Phalanx, Banner Carrier, Undying Knight, The Crimson Standard (48×48), The Last War (64×64); approved under the owner's Chapter 4 delegation, reviewed in the playtest — Claude
- **T-62** Chapter 4 content (`dialogue.json`, `quests.json`, `items.json`, `tests/content-data.test.ts`): 35 items (15 documents with pages ≤ 220 chars, 9 neutral puzzles & sacks, 4 relic weapons, 3 charms, 3 consumables, key item finality_seal_shard), 9 quests (6 main + 3 side with kind and chapter: 4, ch3 follow-up wired), 80+ dialogue nodes across 12 maps with natural Vietnamese ≤ 220 chars/line and ≤ 2 choices/node, flashback flags, exact 2-sentence Kuro meeting, 3 major ethical choices, Elion wrong-order clue, altar poem, and dual-solution hydraulic gate / scales; verified with typecheck, lint, prettier, and 109 unit tests (28 content-data) — Antigravity
- **T-61** Chapter 4 design (`docs/story/CHAPTER_04_DESIGN.md`, Vietnamese): "The War Without End" structured §1–§12 (Finality Authority, 12 maps 120–150 min in 3 Temporal Rings: Eve of Battle -> Endless Carnage -> Ash Field; 4 deep characters: Aldric, Kaelen, Bran the 1,427th death, Chronicler Elion; 6 new cross-referencing puzzles including 2-solution hydraulic pressure gate; 3 major ethical choices with distinct rewards and Chapter 6 ending flags; 4 hazy flashbacks with "flashback": true; canonical first direct meeting with Kuro in a quiet ruined room with exact canon lines; 3 new enemy behaviors: ghost sniper laser telegraph, endless phalanx frontal shield, banner carrier resurrect aura; mid-boss The Crimson Standard 48×48, final boss The Last War 64×64 with Finality Execution ritual; hidden Spear of Finality & Interval Lens charm; §12 ID contract) — Antigravity
