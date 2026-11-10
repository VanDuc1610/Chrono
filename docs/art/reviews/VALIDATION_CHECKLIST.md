# CHRONO – ASSET VALIDATION CHECKLIST & REVIEW PROTOCOL

**Document Version:** 1.0.0  
**Governing Rules:** [AGENTS.md](../../../AGENTS.md) & [.agents/rules/chrono-art.md](../../../.agents/rules/chrono-art.md)  
**Applicability:** All character sprites, tilesets, and visual assets before approval.

All candidate images placed in `art-source/characters/peter/generated/candidates/` must be thoroughly evaluated against this 8-point rubric before they can be marked `Under Review` or presented for formal user approval.

---

## 1. File Format Audit

- [ ] **Lossless PNG:** File must be `.png` (Portable Network Graphics). JPEGs, WebPs, or BMPs are strictly rejected.
- [ ] **Color Depth:** 32-bit RGBA (8 bits per channel: Red, Green, Blue, Alpha).
- [ ] **Scanline Compression:** Standard non-interlaced scanlines.
- [ ] **Metadata / Provenance:** Generation model, sampler, prompt, CFG, and seed recorded in metadata.

---

## 2. Image Dimensions & Grid Layout Audit

- [ ] **Frame Dimensions:** Exact integer multiple of $32 \times 32\text{ px}$ per animation cell.
  - Idle sheet: Exactly $128 \times 128\text{ px}$ ($4 \text{ columns} \times 4 \text{ rows}$).
  - Walk sheet: Exactly $192 \times 128\text{ px}$ ($6 \text{ columns} \times 4 \text{ rows}$).
  - Single base sprite: Exactly $32 \times 32\text{ px}$.
- [ ] **Row Alignment:**
  - Row 0 ($Y = 0\dots 31$): Down-facing
  - Row 1 ($Y = 32\dots 63$): Up-facing
  - Row 2 ($Y = 64\dots 95$): Left-facing
  - Row 3 ($Y = 96\dots 127$): Right-facing
- [ ] **Zero Overhang:** No frames bleeding across cell grid boundaries ($X = 0, 32, 64, 96, 128, 160$).

---

## 3. Alpha Channel & Transparency Audit

- [ ] **100% Transparent Background:** Background pixels outside character silhouette must have $A = 0$.
- [ ] **Zero Halo / Fringe:** No bright halos, white outline artifacts, or background color matte bleed.
- [ ] **Binary Alpha Edge:** Sprite perimeter pixels must have full opacity ($A = 255$ or intentional $1$-pixel anti-bleed alpha). No soft feathered transparency edges.
- [ ] **No Orphan Pixels:** Isolated 1-pixel floating specks outside the main character body must be cleared.

---

## 4. Sprite Alignment & Ground-Plane Anchor Audit

- [ ] **Horizontal Centering:** Character center of mass must align to $X \approx 15\dots 16$ within each $32 \times 32\text{ px}$ cell.
- [ ] **Vertical Anchor (Ground Plane):** Feet/boots must rest firmly on row $Y = 29\dots 30$.
- [ ] **Collision Box Compliance:** The $18 \times 14\text{ px}$ foot collider at $(7, 16)$ must accurately encircle the contact area of the character's feet.
- [ ] **No Stride Floating / Sinking:** Foot contact positions must not jitter up and down across frames.

---

## 5. Pixel Sharpness & Art Style Audit

- [ ] **Native 16-Bit Pixel Clusters:** Character features must be built from deliberate $1 \times 1$ or $2 \times 2$ pixel clusters.
- [ ] **No AI Soft Blur:** Reject any outputs with Gaussian smoothing, airbrush gradient ramps, or procedural vector interpolation.
- [ ] **Crisp Dark Outlines:** Silhouette edges must be defined by dark outline pixels (`#0e121e` or `#161e2e`).
- [ ] **Color Palette Fidelity:** Colors must conform to the approved Chronal Spectrum swatches:
  - Coat: `#263248` / `#161e2e`
  - Broken Blade: `#8c96a5` with Cerulean Glow `#00c8ff`
  - Belt / Boots / Notebook: `#453123` / `#2e2219`
  - Skin: `#dab9a0` / `#b28e76`

---

## 6. Character Consistency & Silhouette Audit

- [ ] **Peter Hairstyle (PERMANENT IDENTITY LOCK):**
  - [ ] Short, compact, naturally curly men's haircut.
  - [ ] Clearly distinguishable, tightly coiled, springy curls.
  - [ ] Rounded, compact, slightly elevated hair dome silhouette.
  - [ ] Curls grow upward and outward rather than hanging down.
  - [ ] Full curly coverage over the entire head, including crown, temples, sides, and back.
  - [ ] **VERIFY ZERO PROHIBITIONS:** NO straight hair, NO wavy hair, NO loose flowing curls, NO drooping bangs, NO long fringe, NO shaggy/layered hair, NO undercut, NO shaved sides/nape, NO ponytail.
- [ ] **Costume Details:**
  - High structured stand-up coat collar framing head.
  - Asymmetrical charcoal-blue coat with 4 pairs of horizontal silver toggle clasps.
  - Diagonal leather shoulder strap running from left shoulder to right hip.
  - Torn leather-bound notebook hanging on right hip.
  - Stopped watch suspended from waist belt.
  - Broken broadsword hilt in right hand with cerulean fracture glow (#00c8ff).
- [ ] **Muted Gray-Blue Eyes:** Visible on all down-facing and profile frames.

---

## 7. Camera Direction & Perspective Audit

- [ ] **Top-Down Perspective:** Standard 3/4 top-down orthographic camera pitch ($45^\circ\dots 60^\circ$).
- [ ] **Correct Directional Angles:**
  - Down frames face directly toward camera with chest details and eye contact.
  - Up frames face directly away with back seam, strap crossing, and nape curl coverage.
  - Left frames show true profile looking left with notebook prominently displayed.
  - Right frames show true profile looking right with Broken Blade extended forward.
- [ ] **No Perspective Distortions:** Horizon lines and foot angles must match the top-down plane.

---

## 8. Animation Frame Consistency Audit

- [ ] **Loop Continuity:** The transition from the last frame back to Frame 0 must be seamless and without stutter.
- [ ] **Volume Preservation:** Head, torso, coat, and hair volume must not balloon or shrink during motion.
- [ ] **Secondary Motion:** Coat hem and torn notebook bounce in sync with stride cadence.
- [ ] **Target Frame Rate Compliance:**
  - Idle: 5 FPS (4-frame cycle = 800ms)
  - Walk: 9 FPS (6-frame cycle = 667ms)
  - Attack: 12 FPS (6-frame cycle = 500ms)

---

## Approval Workflow:

1. Candidate image saved into `art-source/characters/peter/generated/candidates/`.
2. Pipeline Engineer completes `docs/art/reviews/<candidate_name>_review.md`.
3. If all 8 criteria pass, submit to Project Owner for formal sign-off.
4. Upon user approval:
   - Move master file to `art-source/characters/peter/generated/approved/`.
   - Update `art-source/characters/peter/metadata/peter_design.json`.
   - Deploy formatted spritesheet to `public/assets/characters/peter/`.
