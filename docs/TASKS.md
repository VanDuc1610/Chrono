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

Goal (owner, 2026-11-12, playtest feedback): small enemies are fought **in real time on the map**
(left click slash toward the cursor, Shift dodge, right click Temporal Strike 6 MP once learned,
keys 1-4 quick items); bosses stay turn-based. Peter is ambushed unarmed, the Elder rescues him,
lets him rest and explains, then fights beside him; the Elder teaches the skill later. Equipment:
weapon + charm. Defeated → revive at the map's safe point, full HP, no loss. Roaming enemies respawn
when the map is re-entered (story/quest enemies do not).

### T-48 · Notes and puzzle items (content)

- **Assignee:** Antigravity · **Status:** DONE
- **Locks:** (none)
- **Contract:** [ACTION_COMBAT_CONTRACT.md §5](implementation/ACTION_COMBAT_CONTRACT.md)

## Backlog (scheduled after current locks are released)

- **Vietnamese pass on remaining UI** (Combat, Main Menu, Prologue End) via `strings.json` once T-28 lands.
- **GitHub Pages release + Playwright cross-browser tests.**

---

## Done (latest 5 — older entries in [TASKS_ARCHIVE.md](TASKS_ARCHIVE.md))

- **T-48** Notes and puzzle items content (`dialogue.json`, `items.json`, `tests/content-data.test.ts`): converted `unsent_fisherman_letter` to `document` with 2 pages; added 5 new `document` items (1–2 pages each, ≤ 220 chars/page, granted once via `grantOnceFlag`) for Peter's repair ledger, torn journal leaf, lighthouse keeper's logbook (hiding mirror cache order 1 → 2 → 3), child's village drawing, sundial bronze rubbing; added 2 `puzzle` items (`bronze_bell_clapper` from sunken cache, `tide_mirror_lens` from unnamed watch case) consumed via `takeItems` at Dawn chime pillar and mirror 1; verified with `typecheck`, `lint`, `prettier --check .`, and 77 unit tests — Antigravity; wired into maps.json (dawn pillar needs the clapper, mirror 1 needs the lens, fallbacks for older saves; 78 unit tests) — Claude
- **T-46** Equipment and bag: weapon + charm slots (stats, reach, swing speed; auto-equip into an empty slot), quick keys 1-4, bag in four tabs (Trang bị / Vật phẩm / Ghi chép with a page reader / Manh mối), item types document and puzzle, dialogue rules ifItem / unlessItem and effect takeItems, save 0.4.0. Chapter 1 hidden mirror cache placed (ENV_SUNKEN_002 approved): mirrors light up and beams appear live via map tileSwaps. Verified: 73 unit tests, 4 CDP suites, live probes — Claude
- **T-45** Real-time map combat: roaming enemies (patrol, chase on sight, wind-up, leash; path finding around walls), slash toward the cursor, Shift dodge, right-click Temporal Strike, the Elder fighting beside Peter, revive at the safe point, respawn on re-entry; quest harassers (duringQuest + hunter); Prologue v3.1 wired (ambush → rescue → rest → first hunt → watch → Temporal Strike). Verified: live playthroughs — Claude
- **T-47** Prologue v3.1 ambush/rescue/teaching + Ch.1 hidden mirror cache (`dialogue.json`, `quests.json`, `items.json`, `tests/content-data.test.ts`, `PROLOGUE_V3_PROPOSAL.md`, `CHAPTER_01_DESIGN.md`): replaced retired `battle_elder_intervenes` & `elder_after_first_battle` with `battle_elder_rescue` (`warpTo` room `rest`, `healFull`), `elder_rest_explain` (grants `broken_blade`, starts `quest_prologue_first_hunt`, teaches left-click/Shift/I), `elder_after_hunt`, `elder_teach_skill` (right-click Temporal Strike, 6 MP); converted `broken_blade` to `weapon`, added `tide_brass_blade` (`weapon` from `poi_mirror_cache`) and `sea_glass_charm` (`charm` reward on `quest_ch1_empty_photo`), added `poi_mirror_1..3` + `poi_mirror_cache` + logbook hint; `typecheck` & `lint` pass, 66/67 Vitest pass (only `maps.json` still referencing `elder_after_first_battle` awaits Claude wiring) — Antigravity
- **T-44** Chapter 1 playable: 5 maps (Bờ Biển Hoàng Hôn → Làng Chài → Hải Đăng → Hành Lang Đáy Biển → Thánh Điện) with time loops, Time Anchor 3 layers (cataclysm freezes the village), low-tide layer, bell sequence, Drowned Drifters + Echo Chorister, boss The Sunken Bellkeeper (3-step bell mechanic), Continuum Seal → "HOÀN THÀNH CHƯƠNG 1". Prologue end card continues into Chapter 1; level cap 3 in the Prologue, 7 after; map ambient light, NPC tint/alpha, HUD chapter name. Art batch approved and integrated (ENV_COASTAL_002, ENV_WILDS_002, ENV_SUNKEN_001, NPC_OLD_KEEPER_001, MOB_DRIFTER_001, BOSS_BELLKEEPER_001). Verified: 62 unit tests, 4 CDP suites (combat suite now waits for Peter's turn), full live playthrough (Lv 6 at the boss, Lv 7 at the end) — Claude
