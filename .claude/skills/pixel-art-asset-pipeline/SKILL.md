---
name: pixel-art-asset-pipeline
description: Use when adding or replacing sprites, animations, tilesets, UI art or audio files, or loading them in PreloadScene. Not for gameplay logic.
---

# Art & asset pipeline (CHRONO)

Full rules: `.agents/rules/chrono-art.md` (Peter identity lock, pipelines, approval). Short form:

1. **No AI image models or image APIs. No external character references.**
2. **Pipeline B (code-authored pixel art):** a committed script `scripts/author-*.js` using
   `scripts/pixel-art/pixel.js`, writing **only** to `art-source/<area>/generated/candidates/`
   (+ `previews/`). Validate with `node scripts/validate-candidate.js <png>`.
3. **Owner approval before integration.** Then: move to `generated/approved/`, copy to
   `public/assets/…`, update `ASSET_REGISTRY.md`. Never overwrite an approved file silently;
   placeholder generators (`generate-assets.js`, `generate-peter-sprites.js`) must not write it.
4. **Peter:** short, compact, tightly curly dark-brown hair (`#3b291d`) — no straight/wavy hair,
   fringe, undercut or ponytail.

## Engine conventions

- Frames 32×32. Character sheets: rows down, up, left, right.
- Load in `PreloadScene`; create global animations there once (`<textureKey>_<anim>`), or Peter's
  through `PETER_ANIMATION_SPECS` / `registerPeterAnimations`.
- `pixelArt: true` and `roundPixels: true` are set in `src/config.ts`. Prefer integer sprite
  scales for new art.
- Asset keys are string literals in `PreloadScene` today; keep names consistent with the file names.

## Verify

`validate-candidate.js` PASS → owner approval → `npm run typecheck` + the CDP suite that shows the
asset + a screenshot check.
