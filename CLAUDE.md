# CLAUDE.md – Claude Code Agent Configuration

**Project:** CHRONO – THE FRACTURED DIVINITY  
**Canonical Project Context:** [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md)  
**Governing Rules:** [AGENTS.md](AGENTS.md) and [.agents/rules/chrono-art.md](.agents/rules/chrono-art.md)

---

## 1. Dual-Agent Roles & Boundaries

This repository is actively developed by two AI agents:

1. **Claude Code Agent:** Project **coordinator** (assigns tasks between agents, writes prompts for Antigravity, decides when to push to `origin/main`) and implementer / architecture & code reviewer. Role granted by the project owner on 2026-11-10.
2. **Google Antigravity Agent:** Implementation agent (feature code, asset pipeline management, scene assembly, test execution) working on tasks assigned in the task board.

### Operational Protocols:

- **Task Board:** [docs/TASKS.md](docs/TASKS.md) is the single list of who does what and which files are locked. Both agents read it before starting work.
- **Art approval stays with the project owner.** The coordinator role never authorizes generating art or promoting assets.
- **Single-Writer Safety:** Both agents work on the same repository folder (`C:\Users\USER\.gemini\antigravity-ide\scratch\Chrono_workspace`). **Never edit the same file concurrently.** Always inspect file status before editing.
- **Single Source of Truth:** Both agents must strictly align with `docs/PROJECT_CONTEXT.md`, `GDD.md`, `LORE.md`, `docs/art/ART_GUIDE.md`, and `docs/art/PETER_DESIGN.md`.
- **Local Credentials:** Never output, copy, commit, or log credentials, API keys, auth tokens, or private environment variables.

---

## 2. Non-Negotiable Character & Art Directives

Claude Code must strictly respect the project's **Original Art Policy** and character identity locks:

- **Peter Hairstyle Permanent Identity Lock:**
  - Short, compact, naturally curly dark-brown hair (`#3b291d`).
  - Clearly distinguishable, tightly coiled, springy curls growing upward and outward.
  - Overall silhouette is rounded, compact, and slightly elevated; full coverage on crown, temples, sides, and back.
  - **STRICT PROHIBITIONS:** Never interpret as straight hair, wavy hair, loose curls, bangs, fringe, shaggy hair, undercut, shaved sides, or ponytail.
- **Art Pipelines (AGENTS.md §5):**
  - Never call Stable Diffusion or any image-generation model/API.
  - Pipeline B (owner-approved 2026-11-11): Claude may hand-author pixel art as code (`scripts/author-*-sprites.js`), output to `generated/candidates/` only, validated, then owner-approved like any candidate.
  - The pipeline is strictly manual text prompts stored in `art-source/.../prompts/`.
  - Only user-approved assets from `art-source/.../generated/approved/` may be integrated into `public/assets/`.
  - Never search the web for external character references or copyrighted artwork.

---

## 3. Project Technical Architecture

- **Engine:** Phaser 3 (v3.88.2, WebGL / Canvas with Arcade Physics)
- **Language:** TypeScript 5.8 (Strict mode, ES2022 target)
- **Build Tool:** Vite 6 (Development server on port 3000)
- **Resolution:** 640×360 px native canvas scaled via Phaser Scale Manager `FIT`
- **Data Architecture:** External JSON files (`public/assets/data/` for dialogue, quests, enemies, items)
- **State Management:** Decoupled modular systems conforming to TypeScript interfaces:
  - `PlayerController` (`src/systems/input/`)
  - `MovementSystem` (`src/systems/movement/`)
  - `InteractionSystem` (`src/systems/interaction/`)
  - `DialogueSystem` (`src/systems/dialogue/`)
  - `QuestSystem` (`src/systems/quest/`)
  - `CombatSystem` (`src/systems/combat/`)
  - `InventorySystem` (`src/systems/inventory/`)
  - `SaveSystem` (`src/systems/save/`)
  - `SoundSystem` (`src/systems/audio/`)

---

## 4. Development & Build Commands

```bash
# Start local development server (port 3000)
npm run dev

# Strict TypeScript typechecking
npm run typecheck

# Run Node unit tests (Vitest)
npm test

# Full production build (tsc + vite)
npm run build

# Preview production build
npm run preview

# Automated live engine gameplay test
node scripts/test-gameplay.js

# Automated turn-based combat test
node scripts/test-combat.js

# Automated inventory & save persistence test
node scripts/test-inventory-save.js

# Asset candidate technical validation
node scripts/validate-candidate.js <path-to-png>
```

---

## 5. Review Guidelines for Claude Code

When reviewing PRs, diffs, or architecture proposals:

1. **Separation of Concerns:** Verify that gameplay systems, scene presentation, and data remain strictly decoupled. Scene files must not hardcode quest definitions, stats, or dialogue.
2. **Type Safety:** Verify 100% strict TypeScript types without implicit `any` or loose casts.
3. **Phaser Lifecycle Safety:** Ensure transient state, text objects, and timers are properly cleaned in `init()` when scenes re-enter.
4. **Narrative Consistency:** Verify distinctions between confirmed canon, proposed ideas, and unresolved mysteries (`TBD`).
