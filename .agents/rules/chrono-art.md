---
trigger: always_on
description: CHRONO original art direction and approved character asset rules.
---

# CHRONO ART RULES

## 1. Source of Truth

- Read docs/PROJECT_CONTEXT.md for overarching project context and architecture.
- Read docs/art/ART_GUIDE.md before creating any game art.
- Read docs/art/PETER_DESIGN.md before creating or modifying Peter assets.
- The approved Peter concepts are located at:
  - `art-source/characters/peter/concept/peter_master_v1.png` (Master Concept)
  - `art-source/characters/peter/concept/peter_alt_pose_v1.png` (Alternate Pose)
  - `art-source/characters/peter/concept/peter_concept_v1.png` (Turnaround Reference)

## 2. Originality

- All character designs must originate from original written specifications.
- Never search for external character images as visual references.
- Never imitate existing game characters, artists, or franchises.
- Do not use external character images as generation inputs.
- Use only approved CHRONO designs as the project's visual identity documents.

## 3. Peter Identity Lock

Peter must retain:

- **Hairstyle (Permanent Identity Lock):**
  - Short, compact, naturally curly men's haircut.
  - Clearly distinguishable, tightly coiled, springy curls.
  - Overall hair silhouette must remain rounded, compact, and slightly elevated.
  - Curls must grow upward and outward rather than hanging down.
  - The entire head must retain visible curly hair coverage, including the sides and back.
  - **STRICT PROHIBITIONS – Never interpret Peter's hairstyle as:**
    - Straight messy hair.
    - Wavy hair.
    - Loose flowing curls.
    - Long curly fringe.
    - Drooping bangs.
    - Shaggy or layered hair.
    - Undercut, shaved sides, or ponytail.
- Mature masculine facial proportions.
- Muted gray-blue eyes.
- Asymmetrical charcoal-blue coat.
- Diagonal brown leather shoulder strap.
- Silver details and restrained purple accents.
- Signature objects: Broken Blade (cerulean glow), Stopped Watch on chain, and Torn Notebook on hip.

This hairstyle is a permanent character identity feature and cannot be changed without explicit approval from the project owner.

## 4. Art Production Pipelines

Two approved pipelines (details in AGENTS.md §5). In both, the Coding Agent must:

1. **Preserve approved character designs** without independent alterations.
2. **Never search for external character references** or copyrighted materials.
3. **Never use AI image models or image-generation APIs/services** (including the AUTOMATIC1111 API).
4. **Never promote candidate assets without explicit user approval.**

**Pipeline B – Code-Authored Pixel Art** (owner-approved 2026-11-11): the agent may place pixels explicitly in a committed script (palette from the design docs, approved concepts as visual reference only), writing only to `generated/candidates/`, validated with `scripts/validate-candidate.js`, then reviewed and approved by the owner like any other candidate.

### Pipeline A – Manual Stable Diffusion (AUTOMATIC1111) Workflow:

The owner generates images manually; the agent writes text-only prompts authored from written design specifications.

1. Read the character design documents.
2. Write a text-only generation prompt.
3. Save the prompt to `art-source/characters/peter/prompts/`.
4. Tell the user which AUTOMATIC1111 Stable Diffusion settings should be recorded.
5. Wait for the user to generate and select candidate images.
6. Inspect candidate PNG files in `art-source/characters/peter/generated/candidates/`.
7. Validate dimensions, transparency, palette, and hairstyle lock.
8. Await formal user approval before moving to `generated/approved/` and integrating into Phaser runtime assets.

## 5. Asset Approval

Generated candidate images are not automatically approved.

Use these stages:

- Candidate
- Under Review
- Approved
- Integrated

Only user-approved assets may enter public/assets.

Never overwrite the original concept or approved assets silently.

## 6. Sprite Requirements

The game uses a top-down camera.

Peter must support:

- Down
- Up
- Left
- Right

All sprite frames must use consistent dimensions, proportions, foot position, and color palette.

Keep the original hairstyle and costume recognizable in every direction.

## 7. Implementation

The Coding Agent is responsible for:

- Creating asset directories.
- Validating image dimensions.
- Preparing sprite atlases.
- Configuring Phaser animations.
- Testing animation behavior.
- Maintaining asset documentation.

Do not invent missing art specifications. Ask the project owner or report unresolved design decisions.
