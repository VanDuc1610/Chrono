# CHRONO – VS CODE MIGRATION HANDOFF SPECIFICATION

**Project:** CHRONO – THE FRACTURED DIVINITY  
**Date:** November 10, 2026  
**Auditor / Author:** Lead Technical Architect  
**Target Environment:** Visual Studio Code (Multi-Agent Setup: Antigravity + Claude Code)  

---

## 1. Exact Absolute Project Directory

```text
C:\Users\USER\.gemini\antigravity-ide\scratch\Chrono_workspace
```

> [!IMPORTANT]
> **DO NOT DUPLICATE OR CLONE TO A SECOND FOLDER:**  
> Both Google Antigravity Agent and Claude Code must operate directly on this exact directory path. No source files should be copied, branched, or relocated.

---

## 2. Git Repository Status

- **Git Repository Root:** Currently **NONE**. The directory `C:\Users\USER\.gemini\antigravity-ide\scratch\Chrono_workspace` does not contain a `.git` folder.
- **Active Branch:** N/A (Untracked workspace directory).
- **Working Tree Status:** All files currently exist as local disk files in the Antigravity scratch workspace.
- **Recommended Action:** Upon opening in VS Code, execute `git init` and create an initial commit representing the validated Prologue Vertical Slice baseline.

---

## 3. Workspace Architecture (Single-Folder vs Multi-Root)

- **Structure:** **Single-Folder Workspace**.
- **Root Directory:** `C:\Users\USER\.gemini\antigravity-ide\scratch\Chrono_workspace`
- **Existing `.code-workspace` File:** **NONE**. (Opening the directory directly as a single-folder workspace is standard and recommended).

---

## 4. Instructions to Open in Visual Studio Code

### Method A – Command Line (Fastest)
From Windows PowerShell or Terminal:
```powershell
code "C:\Users\USER\.gemini\antigravity-ide\scratch\Chrono_workspace"
```

### Method B – Visual Studio Code GUI
1. Launch **Visual Studio Code**.
2. Click **File** $\rightarrow$ **Open Folder...** (or press `Ctrl+K, Ctrl+O`).
3. Navigate to: `C:\Users\USER\.gemini\antigravity-ide\scratch\Chrono_workspace`.
4. Click **Select Folder**.
5. When prompted, select **"Yes, I trust the authors"** to enable workspace tasks and language services.

---

## 5. Required VS Code Extensions

The repository includes [`.vscode/extensions.json`](file:///c:/Users/USER/.gemini/antigravity-ide/scratch/Chrono_workspace/.vscode/extensions.json), which automatically prompts VS Code to suggest:

| Extension | Extension ID | Purpose |
| :--- | :--- | :--- |
| **Vite** | `antfu.vite` | Fast Vite dev server controls within VS Code |
| **ESLint** | `dbaeumer.vscode-eslint` | JavaScript/TypeScript linting |
| **Prettier** | `esbenp.prettier-vscode` | Code formatting |
| **Claude Code** | Official Claude Code CLI / Extension | Architecture & security reviewer agent |

---

## 6. Required Runtimes & Dependencies

| Tool / Runtime | Installed Version | Minimum Required | Status |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v24.22.1` | `>= 20.0.0` | Verified |
| **npm** | `11.19.1` | `>= 10.0.0` | Verified |
| **VS Code CLI** | `1.145.2` (x64) | Any recent build | Verified |
| **TypeScript** | `5.8.2` (devDependency) | `>= 5.0.0` | Verified in `node_modules` |
| **Vite** | `6.2.0` (devDependency) | `>= 5.0.0` | Verified in `node_modules` |
| **Phaser** | `3.88.2` (dependency) | `>= 3.80.0` | Verified in `node_modules` |

---

## 7. Development & Runtime Terminal Commands

All commands run directly in the VS Code integrated terminal (`Ctrl+\``):

```powershell
# 1. Start the Vite local development server
npm run dev
# Server binds to: http://localhost:3000/

# 2. Strict TypeScript type check (no emitted files)
npm run typecheck

# 3. Production build (TypeScript compile + Vite bundle)
npm run build
# Output directory: dist/

# 4. Preview production build locally
npm run preview

# 5. Run automated CDP live engine gameplay test
node scripts/test-gameplay.js

# 6. Run automated CDP turn-based combat test
node scripts/test-combat.js

# 7. Run automated CDP inventory and save test
node scripts/test-inventory-save.js

# 8. Run asset candidate technical validation
node scripts/validate-candidate.js <path-to-png>
```

---

## 8. Existing Workspace Configuration Files

| File | Purpose |
| :--- | :--- |
| [`.vscode/settings.json`](file:///c:/Users/USER/.gemini/antigravity-ide/scratch/Chrono_workspace/.vscode/settings.json) | Workspace tab size (2), LF line endings, TypeScript SDK mapping |
| [`.vscode/extensions.json`](file:///c:/Users/USER/.gemini/antigravity-ide/scratch/Chrono_workspace/.vscode/extensions.json) | Recommended extensions list |
| [`.vscode/tasks.json`](file:///c:/Users/USER/.gemini/antigravity-ide/scratch/Chrono_workspace/.vscode/tasks.json) | Pre-configured build, dev, and test tasks for VS Code Run Task |
| [`package.json`](file:///c:/Users/USER/.gemini/antigravity-ide/scratch/Chrono_workspace/package.json) | Dependency definitions and npm scripts |
| [`tsconfig.json`](file:///c:/Users/USER/.gemini/antigravity-ide/scratch/Chrono_workspace/tsconfig.json) | Strict TypeScript compiler options |
| [`vite.config.ts`](file:///c:/Users/USER/.gemini/antigravity-ide/scratch/Chrono_workspace/vite.config.ts) | Vite server port 3000, build asset inline limit |

---

## 9. Agent Instruction & Rule File Locations

Both agents operate on the same folder using their native configuration mechanisms:

1. **Unified Source of Truth:**
   - [`docs/PROJECT_CONTEXT.md`](file:///c:/Users/USER/.gemini/antigravity-ide/scratch/Chrono_workspace/docs/PROJECT_CONTEXT.md)
2. **Google Antigravity Agent Configuration:**
   - [`AGENTS.md`](file:///c:/Users/USER/.gemini/antigravity-ide/scratch/Chrono_workspace/AGENTS.md) (Workspace root rules)
   - [`.agents/rules/chrono-art.md`](file:///c:/Users/USER/.gemini/antigravity-ide/scratch/Chrono_workspace/.agents/rules/chrono-art.md) (Art rules with `trigger: always_on`)
3. **Claude Code Configuration:**
   - [`CLAUDE.md`](file:///c:/Users/USER/.gemini/antigravity-ide/scratch/Chrono_workspace/CLAUDE.md) (Claude Code instructions, boundaries, and review protocol)
4. **Art Guidelines & Design Specifications:**
   - [`docs/art/PETER_DESIGN.md`](file:///c:/Users/USER/.gemini/antigravity-ide/scratch/Chrono_workspace/docs/art/PETER_DESIGN.md)
   - [`docs/art/ART_GUIDE.md`](file:///c:/Users/USER/.gemini/antigravity-ide/scratch/Chrono_workspace/docs/art/ART_GUIDE.md)
   - [`docs/art/SPRITE_PIPELINE.md`](file:///c:/Users/USER/.gemini/antigravity-ide/scratch/Chrono_workspace/docs/art/SPRITE_PIPELINE.md)

---

## 10. Known Migration Risks & Mitigations

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **No Git Tracking** | Uncommitted changes could be lost if files are edited incorrectly | Initialize git (`git init`) immediately after opening in VS Code and make a baseline commit. |
| **Concurrent File Edits** | Antigravity and Claude Code editing the same file simultaneously | Protocol enforced: Claude Code defaults to read-only review; Antigravity is primary implementer. |
| **Port Collision (3000)** | Vite server failing to start if port 3000 is still bound by another process | Check active processes; kill previous instance or Vite will automatically increment to port 3001. |
| **Line Ending Divergence** | Windows CRLF vs Linux/Mac LF Git checkout conflicts | `.vscode/settings.json` enforces `"files.eol": "\n"` across all files. |
| **Credential Leakage** | Accidentally committing Claude or Google account tokens | Authentication credentials remain in application storage; no secrets in project files. |

---

## 11. Post-Opening Verification Checklist

After opening `C:\Users\USER\.gemini\antigravity-ide\scratch\Chrono_workspace` in Visual Studio Code:

- [ ] Workspace folder path in VS Code status bar confirms: `Chrono_workspace`.
- [ ] In integrated terminal, run `npm run typecheck` $\rightarrow$ must report 0 errors.
- [ ] Run `npm run build` $\rightarrow$ must complete in <1.5s with clean `dist/` bundle.
- [ ] Run `node scripts/test-gameplay.js` $\rightarrow$ live engine exploration test passes.
- [ ] Run `node scripts/test-combat.js` $\rightarrow$ turn-based combat test passes.
- [ ] Run `node scripts/test-inventory-save.js` $\rightarrow$ inventory and save persistence test passes.
- [ ] Verify both `AGENTS.md` and `CLAUDE.md` exist and reference `docs/PROJECT_CONTEXT.md`.
- [ ] Execute `git init` and create initial commit.

