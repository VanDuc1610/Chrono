---
name: phaser-scene-lifecycle
description: Use when creating, modifying, or transitioning between Phaser 3 Scenes, managing scene events, or building parallel UI overlays in src/scenes/. Do NOT use for pure combat math, Tiled map exporting, or sprite packing.
---

# Phaser 3 Scene Lifecycle & Memory Hygiene

## 1. Core Principles

- **Orchestration Only:** Scenes in `src/scenes/` only bind `src/core/` logic to Phaser GameObjects, handle input, and manage cameras/transitions.
- **Typed Initialization:** Always define a strict TypeScript interface for data passed into `init(data: T)` and `scene.start(key, data)`.
- **Zero Listener Leaks:** Every event registered on `this.events`, `this.game.events`, `this.input.keyboard`, or external EventEmitters MUST be removed when the scene shuts down.

## 2. Standard Scene Template

```typescript
import Phaser from 'phaser';
import { SceneKeys } from '../data/AssetKeys';

export interface BattleSceneData {
  enemyGroupId: string;
  returnMapKey: string;
  playerGridPos: { x: number; y: number };
}

export class BattleScene extends Phaser.Scene {
  private sceneData!: BattleSceneData;

  constructor() {
    super({ key: SceneKeys.Battle });
  }

  public init(data: BattleSceneData): void {
    this.sceneData = data;
  }

  public create(): void {
    // 1. Launch parallel UI overlay if needed
    this.scene.launch(SceneKeys.BattleUI, { battleScene: this });

    // 2. Register listeners
    this.events.on('TURN_CHANGED', this.handleTurnChanged, this);

    // 3. Mandatory cleanup hook
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
  }

  private handleTurnChanged(actorId: string): void {
    // Render updates only
  }

  private cleanup(): void {
    this.events.off('TURN_CHANGED', this.handleTurnChanged, this);
    this.input.keyboard?.removeAllListeners();
    this.tweens.killAll();
    this.time.removeAllEvents();
    if (this.scene.isActive(SceneKeys.BattleUI)) {
      this.scene.stop(SceneKeys.BattleUI);
    }
  }
}
```

## 3. Scene Transition & Parallel UI Rules

- **World to Battle:** Prefer `this.scene.switch()` or `this.scene.pause(SceneKeys.World)` + `this.scene.launch(SceneKeys.Battle, data)` if preserving exact overworld state in memory, OR serialize world state to GameStateManager and use `this.scene.start(SceneKeys.Battle, data)`.
- **UI Communication:** Never let WorldScene or BattleScene directly manipulate HUD text objects inside UIScene. Emit typed events via a shared EventBus or scene event emitter.
- **Camera Integer Alignment:** In `create()`, always configure the main camera with `this.cameras.main.setRoundPixels(true)` to prevent sub-pixel shimmering on pixel art.

## 4. Verification Checklist

- [ ] Does the scene clean up all custom listeners inside `Phaser.Scenes.Events.SHUTDOWN`?
- [ ] Are all scene keys imported from `src/data/AssetKeys.ts`?
- [ ] Does `npm run typecheck` pass with zero implicit any in `init(data)`?
