---
name: pixel-art-asset-pipeline
description: Standards for 16-bit pixel art dimensions, frame alignment, candidate review stages, and code-authored pixel art rules.
---

# Pixel Art Asset Pipeline & Integrity

## 1. When to Load

- Authoring code-based pixel art (`scripts/author-*-sprites.js`, Pipeline B).
- Validating candidate PNG files using `scripts/validate-candidate.js`.
- Configuring Phaser spritesheet frame sizes and animation frame rates.

## 2. Core Constraints

- **Original Art Policy (AGENTS.md §2):** Never use external copyrighted images or AI image models (Stable Diffusion API forbidden).
- **Peter Hairstyle Lock:** Strictly preserve natural compact curls covering the entire head. No straight hair, loose waves, or undercut.
- **Color Consistency:** Sample only from approved palettes in `docs/art/*.md`.
- **Approval Stages:** Candidate (`generated/candidates/`) -> Under Review -> Approved (`generated/approved/`) -> Integrated (`public/assets/`). Only user-approved assets may enter `public/assets/`.
- **Validation:** All candidates must pass `node scripts/validate-candidate.js <file>` (RGBA format, transparent background, centered frames, integer ground contact).
