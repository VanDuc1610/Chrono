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

Goal (owner, 2026-11-14): Chapter 5 is built and waits for the owner's playtest. Chapter 6 is built and waits for the owner's playtest. Chapter 6
"The Hour of the Gods" — about as long as Chapter 5, ~65% puzzles and world mysteries, ~35% combat with
new enemy and boss mechanics. Chapter 6 is **not** the last chapter.

## Backlog (scheduled after current locks are released)

- **Vietnamese pass on remaining UI** (Combat, Main Menu, Prologue End) via `strings.json` once T-28 lands.
- **GitHub Pages release + Playwright cross-browser tests.**

---

## Done (latest 5 — older entries in [TASKS_ARCHIVE.md](TASKS_ARCHIVE.md))

- **T-68** Chapter 6 playable: 18 maps on the celestial tileset (hidden Chronos cell, chessboard and First Forgotten's nook), Origin Glyphs learned by use (unknown glyphs show "?"), light beam through mirrors / prism / brass, geared orrery rings, 4×4 star chessboard (solver-checked), four new foes (Heel Shadow, Twin Star, Origin Nullifier, Archon Construct), Broken Herald glyph shield, Remnant Deacon triple block, Genesis Warden purge + regulator pin (Kuro holds it, or Temporal Sight reveals it), hidden Echo of the First Forgotten (unseen blows, erasing mist), Kuro together / ahead by Chapter 5 choice, Chapter 5 → 6 → end card, level cap 24. Verified: 132 unit tests, live CDP runs of the whole chapter (every puzzle right and wrong, all four bosses, both Kuro branches, end card) — Claude
- **T-67** Chapter 6 design (`docs/story/CHAPTER_06_DESIGN.md`, Vietnamese): "The Hour of the Gods" structured §1–§16 (Origin Authority, 16 maps 150–180 min, ~65% puzzle/mystery + 35% combat; central mechanic Origin Glyphs with 7 prime characters & Reality Inscription; 13 distinct deduction puzzles C01–C13 with airtight logic & zero timer pressure; 5 World Secrets unravelling the Great Fracture & First Forgotten; deep callbacks to Ch4/Ch5 choices; 4 flashbacks with Chronos perspective; 4 timing enemies, 1 elite, mid-boss Broken Herald with glyph cancellation, end-of-chapter boss Genesis Warden with regulator pin interaction, hidden boss Echo of the First Forgotten; Level cap 24; 10 quests; full ch6_ ID contract; 3 cliffhanger options recommending shattered Chronos throne & First Forgotten awakening, followed by 3-chapter roadmap Ch7–Ch9 ending) — Antigravity
- **T-66** Chapter 5 playable: 17 maps on the interval and steel tilesets (hidden uprooted garden and old seed bed), living/pruned branch shift rebuilding the map in place, Kuro fighting beside Peter (shifts foes out of time), phase/cocoon/echo/line-cut foes, every T-65 puzzle (EX-01 to EX-08) plus safe, quantum bridge, reactor switches, heir naming, Kuro's three questions, Other Peter (finisher), Unborn King (name call + Kuro ally), collision escape and three seal endings, Chapter 4 → 5 end card, level cap 21. Verified: 120 unit tests, live CDP runs of the whole chapter (every puzzle right and wrong, both bosses, hidden garden blade, end card) — Claude
- **T-65** Chapter 5 expansion design (`docs/story/CHAPTER_05_EXPANSION.md`, Vietnamese): 8 new distinct deduction puzzles (EX-01 to EX-08 across 4 acts: shadow cross-branch, greenhouse microclimate, Na's chalk sky, 3-witness truth table, quantum astrolabe, poem word melody with broken key substitution, reverse gravity hourglass, dynamic choice mirror), 3 deep side quests (Na's 1000th crane, Gardener's requiem, Ivo's redemption), 3 new maps (glass greenhouse 22×16, alpha harbor 26×18, observatory 24×18), key dialogues, engine specs, owner questions, and full ch5x_ ID contract — Antigravity
- **T-63** Chapter 4 playable: 13 maps (warfield tileset; hidden sentry cellar and First Fallen tomb), dials, two-pan scale (two solutions), arrow volleys with cover, flashback screen, skill/timing enemies (sniper perfect dodge, phalanx parry, banner chant revives, knight charge into walls), timed block in boss fights, Crimson Standard blood wall, The Last War's three-pillar ritual, level cap 18, Chapter 3 → 4 end card, battle Item picks the best-fitting heal. Review of T-62 (answer leaks, two-word sentry answer, ~45 missing pickup/locked nodes, side quest starts). Verified: 116 unit tests, live CDP run of the whole chapter (every puzzle right and wrong, the three choices, both bosses, Kuro, end card) — Claude
