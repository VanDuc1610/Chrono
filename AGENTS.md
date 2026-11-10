# CHRONO – PROJECT AGENT RULES

**Canonical Project Context:** [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md)  
**Claude Code Configuration:** [CLAUDE.md](CLAUDE.md)

---

## 1. Project Identity & Multi-Agent Structure

This project is **CHRONO – THE FRACTURED DIVINITY**.

It is developed by two collaborating AI agents working within the same workspace:
1. **Google Antigravity Agent:** Primary implementation agent (feature coding, asset pipeline management, scene composition, live test verification).
2. **Claude Code Agent:** Default architecture, code quality, and security reviewer (read-only review by default).

### Operational Directives:
- Both agents reference `docs/PROJECT_CONTEXT.md` as the unified source of truth.
- Both agents must not edit the same files concurrently.
- Neither agent may print, commit, or leak private authentication tokens, API keys, or environment secrets.

The game is a browser-based 2D single-player RPG built with:
- Phaser 3 (v3.88.2)
- TypeScript (v5.8.2)
- Vite (v6.2.0)
- Top-down camera (640x360 native canvas scaled via `FIT`)
- 16-bit Pixel Art
- Stylized character proportions
- Dark Fantasy + Ethereal atmosphere
- Turn-based combat system

---

## 2. Original Art Policy

All original game art must follow the project's approved design documents.

- **Never independently redesign an approved character.**
- **Never replace approved character assets with unrelated AI-generated images.**
- **Never use existing copyrighted game characters, images, screenshots, or artist-specific styles as visual references.**
- **All new visual assets must originate from original written specifications and the project's approved original designs.**

---

## 3. Peter – Approved Character

Peter is the main protagonist.

His approved design source is:
- **Concept image:** `art-source/characters/peter/concept/peter_concept_v1.png`
- **Design specification:** `docs/art/PETER_DESIGN.md`
- **Original generation prompt:** `art-source/characters/peter/prompts/peter_concept_v1.txt`
- **Design metadata:** `art-source/characters/peter/metadata/peter_design.json`

Before creating, modifying, generating, or integrating any Peter visual asset:
1. Read `docs/art/PETER_DESIGN.md`.
2. Inspect the approved concept image.
3. Understand Peter's silhouette, hairstyle, facial features, costume, colors, and accessories.
4. Preserve the established character identity.

---

## 4. Non-Negotiable Peter Identity Lock

Peter must retain:
- **Appearance:** Male adult appearance, approximately 26 years old, mature masculine facial proportions.
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
    - Undercut or shaved sides.
    - Long hair, shoulder-length hair, or ponytail.
  - The hairstyle is a permanent character identity feature and cannot be changed without explicit approval from the project owner.
- **Eyes:** Muted gray-blue eyes.
- **Coat:** Asymmetrical charcoal-blue travel coat.
- **Clothing:** Dark practical clothing.
- **Strap:** Diagonal brown leather shoulder strap across torso.
- **Accents:** Aged silver details and restrained purple accents.
- **Signature Objects:**
  1. *Broken Blade* (Shattered chronal sword hilt and fragment glowing cerulean)
  2. *Stopped Watch* (Ornate antique timepiece frozen at the moment of the Cataclysm on silver chain)
  3. *Torn Notebook* (Leather-bound journal with handwritten temporal equations and observations)

Hair silhouette, hairstyle, body proportions, and main costume colors must remain consistent across all assets. Never redesign these features without explicit user approval.

---

## 5. Manual Stable Diffusion Pipeline (AUTOMATIC1111)

The image generation process is strictly manual using AUTOMATIC1111 Stable Diffusion WebUI.

The Coding Agent must:
- **Preserve approved character designs.**
- **Use text-only generation prompts.**
- **Never search for external character references.**
- **Never automatically generate artwork.**
- **Never connect to AUTOMATIC1111 API.**
- **Never promote candidate assets without user approval.**

### Operating Steps:
1. Read the character design documents.
2. Write a text-only generation prompt.
3. Save the prompt to `art-source/characters/peter/prompts/`.
4. Tell the user which AUTOMATIC1111 Stable Diffusion settings should be recorded.
5. Wait for the user to generate and select an image manually.
6. Inspect the candidate PNG placed in `art-source/characters/peter/generated/candidates/`.
7. Validate its dimensions, transparency, frame alignment, and consistency.
8. Only upon user approval, promote to `generated/approved/` and prepare for Phaser runtime integration.

**Do not call Stable Diffusion APIs or attempt automatic image generation.**

---

## 6. Asset Approval Stages

Generated candidate images are not automatically approved. Use these standardized stages:
1. **Candidate:** Newly generated image placed in `art-source/.../generated/candidates/`.
2. **Under Review:** Inspected by Coding Agent against design documents and concept baselines.
3. **Approved:** Formal user sign-off recorded in metadata and moved to `generated/approved/`.
4. **Integrated:** Formatted into runtime spritesheets and deployed into `public/assets/`.

**Only user-approved assets may enter `public/assets/`.**  
Never overwrite the original concept or approved assets silently.

---

## 7. Top-down Sprite Requirements

The game uses a top-down camera.

Peter's sprites must support 4 cardinal directions:
- Down-facing (`down`)
- Up-facing (`up`)
- Left-facing (`left`)
- Right-facing (`right`)

Required consistent animation sets:
- **Idle** (subtle breathing / alert stance)
- **Walk** (deliberate, grounded stride)
- **Run** (forward-leaning tactical sprint)
- **Attack** (blade arc / strike)
- **Hurt** (recoil frame / hit flash)
- **Temporal Sight** (casting pose, channeling fracture energy)

Maintain consistent sprite dimensions, frame alignment, scale, foot position, and pivot position ($18 \times 14\text{ px}$ foot collider at center bottom `(7, 16)`). Keep the original hairstyle and costume recognizable in every direction.

---

## 8. Agent Responsibilities

The Coding Agent is responsible for:
- Managing asset directories.
- Documenting asset specifications and prompt files.
- Validating image dimensions, format, and transparency.
- Preparing sprite atlases.
- Integrating approved sprite sheets into Phaser.
- Configuring animations.
- Testing animation behavior.
- Maintaining asset documentation.

The Coding Agent must not silently make artistic decisions that change Peter's established identity. When a design conflict occurs, **stop and report the conflict** instead of inventing a replacement.
