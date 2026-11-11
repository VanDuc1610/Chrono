---
name: rpg-data-state-schema
description: Use when editing game JSON (dialogue, quests, items, enemies, player, interactables), story flags, GameSession state, or save/load. Not for rendering or art.
---

# Game data & state (CHRONO)

## Where things live

| What                       | File                                                      |
| -------------------------- | --------------------------------------------------------- |
| Static data (read-only)    | `public/assets/data/*.json`, loaded in `PreloadScene`     |
| Types                      | `src/systems/<system>/*Types.ts`                          |
| Runtime state + save shape | `src/state/GameSession.ts` (`toSaveData`, `fromSave`)     |
| Save storage + validation  | `src/systems/save/SaveSystem.ts` (`isValidSaveData`)      |
| Story flags                | `FLAGS` in `GameSession.ts`; set with `session.setFlag()` |

## Rules

- **Dialogue nodes:** max 2 responses (UI shows 2 choices). Side effects only through the node's
  `effects` (`setFlags`, `startQuest`, `grantItems` + `grantOnceFlag`), applied by
  `GameSession.applyDialogueEffects()`. No code in JSON.
- **Quests:** chain with `followUpQuestId`; flag-driven objectives use `completeOnFlag`;
  `syncQuestProgress()` must stay idempotent. Rewards are claimed once.
- **Interactables:** `interactables.json` → `{ id, tile:{x,y}, radius, prompt, dialogueId }`.
- **Save format change:** bump `SAVE_VERSION`, keep `fromSave` able to read the previous version
  (or reject it cleanly), and add a test.
- Every id referenced across files must exist — `tests/content-data.test.ts` checks this; extend it
  when you add a new reference type.
- Story content must match `docs/story/` (canon vs PROPOSAL vs OPEN). Read only the chapter file
  you need, not the whole Story Bible.

## Verify

`npx vitest run tests/content-data.test.ts tests/dialogue-effects.test.ts tests/game-session.test.ts`
· `node scripts/test-inventory-save.js` for save changes.
