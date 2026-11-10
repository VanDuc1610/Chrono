# SHATTERED SANCTUARY – ENVIRONMENT & TILESET SPECIFICATION

**Location:** The Shattered Antechamber (Prologue Setting)  
**Category:** Ruined Mountain Sanctuary Environment & 16-Bit Tileset  
**Document Version:** 1.0.0  
**Project:** CHRONO – THE FRACTURED DIVINITY  
**Governing Rules:** [AGENTS.md](../../AGENTS.md) and [.agents/rules/chrono-art.md](../../.agents/rules/chrono-art.md)  

---

## 1. Architectural Concept & Atmosphere

The Shattered Antechamber is the entrance precinct to the ancient Spire of the Divided Hour—a sacred mountain vault erected to observe celestial temporal alignments. Following the Cataclysm:
- The masonry is weathered and cracked, with fissures glowing faintly with ambient cyan chronal energy.
- Ancient geometric floor engravings depict the twelve divisions of the day.
- Ruined fluted pillars and fallen lintels create natural obstacle boundaries.
- At the center of the chamber stands the **Altar of Moments**—a monolithic carved stone pedestal that illuminates when approached by Peter.

---

## 2. Tileset Layout & Grid Conventions

- **Tile Grid:** $32 \times 32\text{ px}$ strictly uniform.
- **Tileset Texture Dimensions:** $128 \times 128\text{ px}$ (4 columns $\times$ 4 rows = 16 base tiles) or $256 \times 256\text{ px}$ extended sheet.
- **Collision Rules:**
  - Ground tiles (floors, engraved stone, altar base): Non-colliding (Index 0..3).
  - Wall tiles (solid perimeter, ruined pillar bases): Colliding (Index 4..15).
  - Upper wall tiles and pillar caps: Passable top layer for 2.5D visual overlap.

---

## 3. Core Environmental Elements

### 3.1 Floor Tiles (Ground Layer)
1. **Weathered Slate Flagstones:** Dark blue-gray paving stones with fine cracks (`#1b2234`, `#29344c`).
2. **Engraved Chronal Pavement:** Concentric circular arcs carved into floor stones inlaid with dormant or softly glowing cyan dust (`#008ab8`, `#00c8ff`).
3. **Cracked Fracture Tiles:** Floor tiles displaying glowing fissures where temporal energy seeps upward.

### 3.2 Wall Tiles (Obstacle Layer)
1. **Lower Sanctuary Wall:** Heavy megalithic slate blocks with chisel marks and moss/fracture patina.
2. **Wall Top / Cornice:** Decorative bronze-trimmed stone molding providing top-down depth.
3. **Fluted Ruined Pillars:** $32 \times 64\text{ px}$ (2 vertical tiles) broken columns with shattered tops.

### 3.3 Interactive Props & Monuments
1. **Altar of Moments:** $64 \times 64\text{ px}$ (2x2 tiles) central monolithic altar carved from resonant obsidian-slate with an engraved celestial dial and central shard socket.
2. **Threshold Arch:** Massive stone gate sealing the inner sanctum with intricate clockwork reliefs.

---

## 4. Official Environmental Color Palette

| Swatch | Hex Code | Application |
|---|---|---|
| **Abyssal Shadow** | `#07080f` | Floor recesses, deep cracks, void drops |
| **Midnight Slate** | `#0e121e` | Base shadow for stone walls |
| **Vault Stone** | `#1b2234` | Primary floor flagstones |
| **Weathered Slate** | `#29344c` | Floor mid-tones, wall face blocks |
| **High Stone Rim** | `#404f6e` | Top-edge brick highlights, pillar fluting |
| **Aged Bronze Mold** | `#8c6628` | Altar trim, cornice reliefs |
| **Chronal Cyan Inlay**| `#00c8ff` | Engraved floor rune glow, rift energy |
| **Luminous Apex** | `#88edff` | Active rune highlights |

