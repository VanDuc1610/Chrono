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

Goal (owner, 2026-11-15): Chapters 5 and 6 are built and wait for the owner's playtest. Next, Chapter 7
"The Cradle of the Forgotten" (outline: CHAPTER_06_DESIGN.md §14.2) — about as long as Chapter 6, puzzles and
mysteries first, with new enemy and boss mechanics. The story ends at Chapter 9 (owner decision, §18).

### T-71 · Chapter 7 build

- **Assignee:** Claude · **Status:** IN PROGRESS
- **Locks:** `src/**`, `public/assets/**`, `scripts/*ch7*`, `tests/**`
- **Plan:** CHAPTER_07_DESIGN.md with §18 review and §19 owner decisions; boss art (Nameless Weeper, Void Inquisitor, Primordial Shade, Kuro boss form) still to draw

## Backlog (scheduled after current locks are released)

- **Vietnamese pass on remaining UI** (Combat, Main Menu, Prologue End) via `strings.json` once T-28 lands.
- **GitHub Pages release + Playwright cross-browser tests.**

---

## Done (latest 5 — older entries in [TASKS_ARCHIVE.md](TASKS_ARCHIVE.md))

- **T-70** Chapter 7 art, first set (owner approved 2026-11-15, violet void per owner): voidcore tileset (dungeon tinted ink-violet + 32 tiles), void-touched Kuro, Kuro's mother, nameless shade, The First Forgotten (48), Name Eater, Hollow Husk, Erasure Moths, Ink Hound — Claude
- **T-69** Chapter 7 design (`docs/story/CHAPTER_07_DESIGN.md`, Vietnamese): "The Cradle of the Forgotten" structured §1–§17 (The Deep Void Core, 17 maps 150–180 min, ~60% puzzle/mystery + 40% combat; central mechanic "Restoring Names" using origin_seal_half; 13 distinct deduction puzzles C01–C13 with airtight math/logic & zero timer pressure; 5 World Secrets; deep callbacks to Ch4–Ch6; 4 flashbacks including Kuro's mother and baby Peter in the cradle; 4 foes designed specifically for Claude's sprites [name eater, hollow husk, erasure moths, ink hound], 1 elite, mid-boss Nameless Weeper, main boss void-touched Kuro pacified via mother's lullaby & name, hidden boss Primordial Shade; Level cap 27; 10 quests; full ch7_ ID contract; cliffhanger into Chapter 8 Null Hour & Convergence) — Antigravity
- **T-68** Chapter 6 playable: 18 maps on the celestial tileset (hidden Chronos cell, chessboard and First Forgotten's nook), Origin Glyphs learned by use (unknown glyphs show "?"), light beam through mirrors / prism / brass, geared orrery rings, 4×4 star chessboard (solver-checked), four new foes (Heel Shadow, Twin Star, Origin Nullifier, Archon Construct), Broken Herald glyph shield, Remnant Deacon triple block, Genesis Warden purge + regulator pin (Kuro holds it, or Temporal Sight reveals it), hidden Echo of the First Forgotten (unseen blows, erasing mist), Kuro together / ahead by Chapter 5 choice, Chapter 5 → 6 → end card, level cap 24. Verified: 132 unit tests, live CDP runs of the whole chapter (every puzzle right and wrong, all four bosses, both Kuro branches, end card) — Claude
- **T-67** Chapter 6 design (`docs/story/CHAPTER_06_DESIGN.md`, Vietnamese): "The Hour of the Gods" structured §1–§16 (Origin Authority, 16 maps 150–180 min, ~65% puzzle/mystery + 35% combat; central mechanic Origin Glyphs with 7 prime characters & Reality Inscription; 13 distinct deduction puzzles C01–C13 with airtight logic & zero timer pressure; 5 World Secrets unravelling the Great Fracture & First Forgotten; deep callbacks to Ch4/Ch5 choices; 4 flashbacks with Chronos perspective; 4 timing enemies, 1 elite, mid-boss Broken Herald with glyph cancellation, end-of-chapter boss Genesis Warden with regulator pin interaction, hidden boss Echo of the First Forgotten; Level cap 24; 10 quests; full ch6_ ID contract; 3 cliffhanger options recommending shattered Chronos throne & First Forgotten awakening, followed by 3-chapter roadmap Ch7–Ch9 ending) — Antigravity
- **T-66** Chapter 5 playable: 17 maps on the interval and steel tilesets (hidden uprooted garden and old seed bed), living/pruned branch shift rebuilding the map in place, Kuro fighting beside Peter (shifts foes out of time), phase/cocoon/echo/line-cut foes, every T-65 puzzle (EX-01 to EX-08) plus safe, quantum bridge, reactor switches, heir naming, Kuro's three questions, Other Peter (finisher), Unborn King (name call + Kuro ally), collision escape and three seal endings, Chapter 4 → 5 end card, level cap 21. Verified: 120 unit tests, live CDP runs of the whole chapter (every puzzle right and wrong, both bosses, hidden garden blade, end card) — Claude
