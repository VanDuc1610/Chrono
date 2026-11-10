# CHRONO – The Fractured Divinity

A browser-based single-player 2D retro RPG initialized with **Phaser 3**, **TypeScript**, and **Vite**.

![Version](https://img.shields.io/badge/version-0.1.0--prologue-blue)
![Engine](https://img.shields.io/badge/engine-Phaser_3.88-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.8-blue)
![Build](https://img.shields.io/badge/build-passing-success)

---

## 1. Project Overview

**CHRONO – The Fractured Divinity** is a top-down single-player RPG set in an ethereal cosmic fantasy world where the celestial mechanisms of time have shattered.

### Scope: Prologue Vertical Slice
- **Perspective:** Top-down 2D orthographic
- **Art Direction:** Original Pixel Art (using compliant procedural placeholders during initial development)
- **Combat:** Turn-based tactical system (architecture defined; scene integration in Milestone 3)
- **Engine:** Phaser 3 with WebGL/Canvas rendering
- **Language:** TypeScript in strict mode
- **Bundler:** Vite 6

---

## 2. Quick Start Guide

### Prerequisites
- **Node.js:** v18.0.0 or higher (v24+ tested)
- **npm:** v9.0.0 or higher

### Installation
Clone or navigate to the project directory and install dependencies:
```bash
npm install
```

### Running the Development Server
Starts the Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Type Checking
Run the TypeScript compiler without emitting files:
```bash
npm run typecheck
```

### Production Build
Compiles TypeScript and creates an optimized production bundle in `dist/`:
```bash
npm run build
```

### Preview Production Build
Previews the production build locally:
```bash
npm run preview
```

### Automated Live Gameplay Tests
Executes the headless browser integration test suite against the live Phaser engine via Chrome DevTools Protocol:
```bash
node scripts/test-gameplay.js
```

---

## 3. Controls

| Key | Action |
|---|---|
| **W / A / S / D** or **Arrow Keys** | 4-Directional Movement (Normalized velocity) |
| **E** or **Space** | Interact with NPCs, Altars, and advance dialogue |
| **ESC** | Close active dialogue / Return to Main Menu |
| **Enter / Mouse Click** | Select menu items in Main Menu |

---

## 4. Architecture & Design Principles

The codebase enforces strict separation of concerns:
- **No Hardcoded Content:** Dialogue lines, quest objectives, enemy stats, and item attributes are decoupled from scene logic and stored in external JSON schemas in `public/assets/data/`.
- **Interface-Driven Systems:** Core systems implement strict TypeScript interfaces (`IPlayerController`, `IMovementSystem`, `IInteractionSystem`, `IDialogueSystem`, `IQuestSystem`, `ICombatSystem`, `IInventorySystem`, `ISaveSystem`).
- **Normalized Top-Down Movement:** `TopDownMovementSystem` ensures consistent diagonal travel speed without speed boost anomalies.
- **Physical Collision Bounds:** Arcade Physics handles solid wall layers, pillars, and boundary limits with tailored foot hitboxes (`18 × 14 px`) for natural 2.5D visual depth sorting.

---

## 5. Asset Pipeline & Conventions

- All assets are organized under `public/assets/` in designated categories:
  - `characters/` – Player sprite sheets
  - `npcs/` – Non-player character sprites
  - `enemies/` – Hostile entity sprites
  - `tilesets/` – Environment tile atlases
  - `maps/` – Tiled JSON map layouts
  - `ui/` – Frames, cursors, fonts, and HUD elements
  - `effects/` – Particle textures and visual FX
  - `audio/` – BGM and SFX audio files
  - `data/` – Game data JSON files
- For detailed dimensional rules, color palette ramps, and animation conventions, see [ART_GUIDE.md](docs/art/ART_GUIDE.md).

---

## 6. Project Documentation Index

- [ASSET_POLICY.md](ASSET_POLICY.md) – Original Asset Creation Policy & 8-step workflow
- [ASSET_REGISTRY.md](ASSET_REGISTRY.md) – Asset versioning ledger & text specifications
- [GDD.md](GDD.md) – Game Design Document (Pillars, mechanics, systems design)
- [LORE.md](LORE.md) – Narrative foundations, canon rules, and world background
- [TECHNICAL_DESIGN.md](TECHNICAL_DESIGN.md) – Architecture specifications, scene lifecycles, and class contracts
- [ART_GUIDE.md](docs/art/ART_GUIDE.md) – Pixel art specifications, dimensions, palette, and consistency rules
- [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) – Phased milestone delivery plan

---

## 7. License & Credits

- **Engine:** Phaser 3 (MIT License)
- **Project Code & Design:** Original work for CHRONO – The Fractured Divinity. All assets created in accordance with text-only specifications without copyrighted references.

