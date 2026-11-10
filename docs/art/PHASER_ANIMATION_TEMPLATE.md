# CHRONO – PHASER ANIMATION CONFIGURATION TEMPLATE

**Document Version:** 1.0.0  
**Target Engine:** Phaser 3.88+ (Arcade Physics)  
**Governing Rules:** [AGENTS.md](../../AGENTS.md) and [.agents/rules/chrono-art.md](../../.agents/rules/chrono-art.md)  
**Approved Baseline Reference:** `art-source/characters/peter/concept/peter_concept_v1.png`

---

## 1. Overview & Policy Guardrail

> [!IMPORTANT]
> **NO UNAPPROVED ASSETS IN RUNTIME DIRECTORIES:**  
> Unfinished, candidate, or unapproved sprite sheets must never be copied into `public/assets/`.  
> Only images that have achieved formal user sign-off in `art-source/characters/peter/generated/approved/` may be formatted and integrated into runtime assets.

---

## 2. Standard Spritesheet Layout Convention

All Peter spritesheets follow a standardized uniform row-by-direction architecture:

```
Row 0 (Y = 0px to 31px)   : Down-facing   [Frame 0 .. Frame N-1]
Row 1 (Y = 32px to 63px)  : Up-facing     [Frame 0 .. Frame N-1]
Row 2 (Y = 64px to 95px)  : Left-facing   [Frame 0 .. Frame N-1]
Row 3 (Y = 96px to 127px) : Right-facing  [Frame 0 .. Frame N-1]
```

Where:

- Frame cell dimensions: $32 \times 32\text{ px}$
- Total sheet height: $128\text{ px}$ (4 directions)
- Total sheet width: $32\text{ px} \times N$ (where $N$ is the number of frames per direction)

---

## 3. Approved Animation Specification Ledger

| Action             | Texture Key            | Frames/Dir | Total Width     | FPS | Repeat      | Phaser Key Pattern                             |
| ------------------ | ---------------------- | ---------- | --------------- | --- | ----------- | ---------------------------------------------- |
| **Idle**           | `peter_idle`           | 4          | $128\text{ px}$ | 5   | `-1` (loop) | `peter_idle_{down\|up\|left\|right}`           |
| **Walk**           | `peter_walk`           | 6          | $192\text{ px}$ | 9   | `-1` (loop) | `peter_walk_{down\|up\|left\|right}`           |
| **Run**            | `peter_run`            | 6          | $192\text{ px}$ | 12  | `-1` (loop) | `peter_run_{down\|up\|left\|right}`            |
| **Attack**         | `peter_attack`         | 6          | $192\text{ px}$ | 12  | `0` (once)  | `peter_attack_{down\|up\|left\|right}`         |
| **Hurt**           | `peter_hurt`           | 2          | $64\text{ px}$  | 10  | `0` (once)  | `peter_hurt_{down\|up\|left\|right}`           |
| **Temporal Sight** | `peter_temporal_sight` | 4          | $128\text{ px}$ | 6   | `-1` (loop) | `peter_temporal_sight_{down\|up\|left\|right}` |

---

## 4. PreloadScene Loader Template

```typescript
// src/scenes/PreloadScene.ts
public preload(): void {
  // Load approved Peter spritesheets
  this.load.spritesheet('peter_idle', 'assets/characters/peter/peter_idle.png', {
    frameWidth: 32,
    frameHeight: 32,
  });

  this.load.spritesheet('peter_walk', 'assets/characters/peter/peter_walk.png', {
    frameWidth: 32,
    frameHeight: 32,
  });

  this.load.spritesheet('peter_run', 'assets/characters/peter/peter_run.png', {
    frameWidth: 32,
    frameHeight: 32,
  });

  this.load.spritesheet('peter_attack', 'assets/characters/peter/peter_attack.png', {
    frameWidth: 32,
    frameHeight: 32,
  });

  this.load.spritesheet('peter_hurt', 'assets/characters/peter/peter_hurt.png', {
    frameWidth: 32,
    frameHeight: 32,
  });

  this.load.spritesheet('peter_temporal_sight', 'assets/characters/peter/peter_temporal_sight.png', {
    frameWidth: 32,
    frameHeight: 32,
  });
}
```

---

## 5. Animation Registration Function

Using [`PeterAnimationConfig.ts`](file:///c:/Users/USER/.gemini/antigravity-ide/scratch/Chrono_workspace/src/systems/animation/PeterAnimationConfig.ts):

```typescript
import { registerPeterAnimations } from '../systems/animation/PeterAnimationConfig';

export class Player extends Entity {
  constructor(scene: Phaser.Scene, x: number, y: number, ...) {
    super(scene, x, y, 'peter_idle');

    // Register all approved animations
    registerPeterAnimations(scene);

    // Set footprint physics collider (18x14 centered at 7, 16)
    if (this.sprite.body) {
      this.sprite.body.setSize(18, 14);
      this.sprite.body.setOffset(7, 16);
    }

    // Start in neutral down-facing idle
    this.sprite.play('peter_idle_down');
  }
}
```

---

## 6. Integration Checklist for Approved Candidates

- [ ] User approval recorded in `art-source/characters/peter/metadata/peter_design.json`.
- [ ] Master candidate file copied to `art-source/characters/peter/generated/approved/`.
- [ ] Scaled / formatted PNG deployed into `public/assets/characters/peter/`.
- [ ] Tested via `npm run build` and live engine CDP test.
