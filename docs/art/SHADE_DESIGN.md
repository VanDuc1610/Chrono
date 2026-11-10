# TEMPORAL SHADE – ENEMY DESIGN SPECIFICATION

**Entity Name:** Temporal Shade  
**Category:** Hostile Temporal Anomaly (Prologue Overworld Encounter & Combat Boss)  
**Document Version:** 1.0.0  
**Project:** CHRONO – THE FRACTURED DIVINITY  
**Governing Rules:** [AGENTS.md](../../AGENTS.md) and [.agents/rules/chrono-art.md](../../.agents/rules/chrono-art.md)  

---

## 1. Narrative Origin & Creature Concept

When the Cataclysm of the Divided Hour shattered continuous time, fragments of discarded moments, unlived memories, and raw chronal energy coalesced into aggressive phantom entities known as **Temporal Shades**.

- **Behavior:** Drifts silently through sanctuary ruins, drawn toward coherent chronal sources (such as Peter's chronometer and glowing Broken Blade).
- **Combat Identity:** Agile, predatory apparition attacking with sharp chronal scratches (`chrono_scratch`) and spacetime distortion pulses (`temporal_flux`).

---

## 2. Visual Identity & Silhouette

- **Form:** A levitating, incorporeal humanoid silhouette without legs, tapering downward into wisps of smoke and fractured temporal static.
- **Fracture Core:** A jagged crystalline rift located at the chest pulsating with deep claret-rose and carmine energy (`#ff4d79`, `#b82352`).
- **Head & Visage:** Shrouded cowl of obsidian-violet mist with no discernible facial features except two piercing cerulean pinpoint eyes reflecting fractured time.
- **Limbs:** Elongated spectral claws trailing dark particles that leave brief optical afterimages during motion.

---

## 3. Official Color Palette

| Swatch | Hex Code | Application |
|---|---|---|
| **Abyssal Void** | `#0e0614` | Deep shadows of spectral cowl and trailing mist |
| **Null Violet** | `#260b1e` | Mid-tones of floating mantle |
| **Abyssal Claret** | `#6b153e` | Outer glow of fracture core |
| **Fracture Carmine** | `#b82352` | Inner core body, claw tips |
| **Temporal Bleed Rose** | `#ff4d79` | Apex core highlight and attack flashes |
| **Cerulean Eye Spark** | `#00c8ff` | Pinpoint eyes and unstable energy rifts |

---

## 4. In-Game Sprite Specifications

- **Canvas Size:** $32 \times 32\text{ px}$ per animation frame.
- **Combat Battle Arena Size:** $32 \times 32\text{ px}$ (or $64 \times 64\text{ px}$ boss scaling).
- **Collision Hitbox:** $22 \times 22\text{ px}$ centered at $(5, 5)$.
- **Levitation Offset:** Base hover altitude sits 4–6 pixels above the ground plane.
- **Animations Required:**
  - `idle / float`: 4-frame vertical hovering bob (6 FPS loop).
  - `attack`: 4-frame forward claw lunge with carmine distortion arc (10 FPS).
  - `hurt`: 2-frame hit recoil with white silhouette flash (10 FPS).
  - `dissolve`: 6-frame particle disintegration into temporal dust (8 FPS).

