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

- **Assignee:** Antigravity · **Status:** TODO
- **Locks:** `public/assets/data/dialogue.json`, `public/assets/data/quests.json`, `public/assets/data/items.json`, `tests/content-data.test.ts`
- **Contract:** CHAPTER_02_DESIGN.md §7 + §11.3 (exact ids)

### T-52 · Chapter 2 engine and maps

- **Assignee:** Claude · **Status:** IN PROGRESS
- **Locks:** `src/**`, `public/assets/data/maps.json`, `public/assets/data/enemies.json`, `public/assets/data/player.json`, `public/assets/maps/map_ch2_*`, `scripts/ch2-*`
- **Scope:** 5 maps, sentence boss mechanic, automaton front shield, enforcer reflect, repel zone, level thresholds to 11, wiring T-51 content

### T-53 · Chapter 2 art candidates

- **Assignee:** Claude · **Status:** TODO
- **Locks:** `art-source/**/ch2*`, `scripts/author-ch2-*`
- **Scope:** Lyra, Exiled Praetor, Imperial Automaton, Causality Enforcer, Imperial Verdict (64×64) — Pipeline B candidates, owner approval before `public/assets`

## Backlog (scheduled after current locks are released)

- **Vietnamese pass on remaining UI** (Combat, Main Menu, Prologue End) via `strings.json` once T-28 lands.
- **GitHub Pages release + Playwright cross-browser tests.**

---

## Done (latest 5 — older entries in [TASKS_ARCHIVE.md](TASKS_ARCHIVE.md))

- **T-49** Chapter 2 design (`docs/story/CHAPTER_02_DESIGN.md`, Vietnamese): "The Empire of False Causality" structured §1–§10 (Peter's watchmaker motivation, 5 maps using existing dungeon/wilds tilesets, new causality puzzle mechanics: Retroactive Cause Lock & Expunging the Verdict, real-time Automaton/Enforcer encounters, turn-based Pre-Emptive Sentence boss The Imperial Verdict, 5 main quests + 2 side quests, hidden weapon Praetor Rapier & Scales of Truth charm, art list, 5 owner questions) — Antigravity Owner approved 2026-11-13 with the §11 changes (Claude review).
- **T-50** Owner feedback pass: the moment time stops, the Time Wraith (Bóng Ma Thời Gian) attacks in a turn-based boss fight Peter cannot win or lose (bare-handed attack; battle script `unlockedCommands`, `rescue` with a party HP floor) — at 20 % HP the Elder steps in and the rescue continues as before. The Elder now walks with Peter only as far as the shrine (`elder_parted` on arrival, parting line in his farewell). Small enemies ~18 % faster (default speed 84). Hidden gear in Chapter 1: Kim Giờ Hải Đăng (weapon, beacon lone rock at low tide, clue on logbook page 3) and Vỏ Ốc Biết Hát (charm, village east rock nook, needs the child's drawing; clue in the fisherman's letter). Verified: 80 unit tests, 4 CDP suites, live probe of the ambush → rescue → rest — Claude
- **T-48** Notes and puzzle items content (`dialogue.json`, `items.json`, `tests/content-data.test.ts`): converted `unsent_fisherman_letter` to `document` with 2 pages; added 5 new `document` items (1–2 pages each, ≤ 220 chars/page, granted once via `grantOnceFlag`) for Peter's repair ledger, torn journal leaf, lighthouse keeper's logbook (hiding mirror cache order 1 → 2 → 3), child's village drawing, sundial bronze rubbing; added 2 `puzzle` items (`bronze_bell_clapper` from sunken cache, `tide_mirror_lens` from unnamed watch case) consumed via `takeItems` at Dawn chime pillar and mirror 1; verified with `typecheck`, `lint`, `prettier --check .`, and 77 unit tests — Antigravity; wired into maps.json (dawn pillar needs the clapper, mirror 1 needs the lens, fallbacks for older saves; 78 unit tests) — Claude
- **T-46** Equipment and bag: weapon + charm slots (stats, reach, swing speed; auto-equip into an empty slot), quick keys 1-4, bag in four tabs (Trang bị / Vật phẩm / Ghi chép with a page reader / Manh mối), item types document and puzzle, dialogue rules ifItem / unlessItem and effect takeItems, save 0.4.0. Chapter 1 hidden mirror cache placed (ENV_SUNKEN_002 approved): mirrors light up and beams appear live via map tileSwaps. Verified: 73 unit tests, 4 CDP suites, live probes — Claude
- **T-45** Real-time map combat: roaming enemies (patrol, chase on sight, wind-up, leash; path finding around walls), slash toward the cursor, Shift dodge, right-click Temporal Strike, the Elder fighting beside Peter, revive at the safe point, respawn on re-entry; quest harassers (duringQuest + hunter); Prologue v3.1 wired (ambush → rescue → rest → first hunt → watch → Temporal Strike). Verified: live playthroughs — Claude
