# CHRONO: Stable Diffusion Generation Guide – Peter Assets

This guide defines the exact recommended configuration for manually generating sprite candidate sheets and concept artwork for **Peter**, protagonist of _CHRONO – THE FRACTURED DIVINITY_.

In accordance with `AGENTS.md` and `.agents/rules/chrono-art.md`, all image generation is **strictly manual**. The coding agent provides prompt specifications and records settings; the user runs Stable Diffusion independently and places candidate outputs into `art-source/characters/peter/generated/candidates/`.

---

## 1. Recommended Checkpoints & LoRAs

| Category             | Recommended Model                                    | Notes                                                      |
| :------------------- | :--------------------------------------------------- | :--------------------------------------------------------- |
| **SD 1.5 Base**      | `v1-5-pruned-emaonly.safetensors`                    | Best compatibility with pixel art LoRAs                    |
| **Pixel Art LoRA**   | `Pixel Art v1` / `Retro Pixel Art` (weight: 0.8–1.0) | Enforces crisp 16-bit pixel clusters                       |
| **SDXL Alternative** | `PixelArtXL` / `RPG Pixel Art XL`                    | High fidelity, recommend downsampling to native resolution |

---

## 2. Core Sampling & Generation Settings

| Setting                 | Recommended Value              | Allowed Range             | Rationale                                                     |
| :---------------------- | :----------------------------- | :------------------------ | :------------------------------------------------------------ |
| **Sampler**             | `DPM++ 2M Karras` or `Euler a` | Euler a, DPM++ SDE Karras | Clean pixel clusters without over-smoothing                   |
| **Sampling Steps**      | `28`                           | 24 – 32                   | Prevents noisy artifacts while avoiding pixel over-sharpening |
| **CFG Scale**           | `7.5`                          | 7.0 – 8.5                 | High prompt adherence for strict costume & hair lock          |
| **Clip Skip**           | `1` or `2`                     | 1 – 2                     | Depends on model recommendation                               |
| **Base Resolution**     | `512x512 px`                   | 512x512 or 768x768        | Downscaled cleanly to 32x32 per frame (128x128 sheet)         |
| **Direct Pixel Res**    | `128x128 px`                   | 128x128 / 192x128         | For models configured for direct small-canvas sprite output   |
| **Denoising (img2img)** | `0.35 - 0.45`                  | 0.30 – 0.50               | When iterating on candidate frames                            |

---

## 3. Prompt Composition Guide

### Mandatory Positive Tokens (Append to action prompt):

```text
masterpiece, 16-bit pixel art, clean pixel clusters, crisp outline, top-down rpg character sprite,
short compact naturally curly dark-brown hair, springy coiled curls covering entire head,
asymmetrical charcoal-blue travel coat, high structured collar, diagonal leather strap,
broken sword cerulean glow, dark boots, transparent background, isolated sprite sheet
```

### Mandatory Negative Prompt (Strict Identity Lock Enforcement):

```text
photorealistic, 3d render, vector, blurry, smooth gradient, anti-aliased,
straight hair, wavy hair, loose curls, long hair, ponytail, drooping bangs,
curly fringe, shaggy hair, undercut, shaved sides, bald, dreadlocks, afro puff,
oversized anime eyes, high fantasy glowing wings, modern sneakers, sunglasses
```

---

## 4. Peter Hairstyle – Permanent Identity Lock Checklist

Before placing any candidate in `art-source/characters/peter/generated/candidates/`, verify the following non-negotiable criteria:

- [ ] **Hair Texture:** Distinctly springy, tightly coiled curls. Not straight, wavy, or loose.
- [ ] **Hair Silhouette:** Rounded, compact, slightly elevated above head.
- [ ] **Growth Direction:** Curls grow upward and outward, not hanging down or covering forehead.
- [ ] **Coverage:** Full coverage on crown, temples, sides, and back. No undercut or skin fade.
- [ ] **Coat & Accents:** Charcoal-blue coat with asymmetrical closure; diagonal leather bandolier; broken sword with cerulean glow (#00c8ff).

---

## 5. Candidate Submission Workflow

1. Select prompt file from `art-source/characters/peter/prompts/` (e.g., `peter_walk.txt`).
2. Run Stable Diffusion with recommended settings above.
3. Save candidate PNG as:
   `art-source/characters/peter/generated/candidates/peter_<action>_candidate_<timestamp>.png`
4. Notify the Coding Agent to inspect candidate dimensions, palette alignment, and frame count.
5. Upon user confirmation, image is approved and integrated into `public/assets/characters/peter/`.
