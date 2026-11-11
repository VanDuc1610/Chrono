---
name: phaser-scene-lifecycle
description: Use when creating, modifying, or transitioning between Phaser 3 Scenes, managing scene events, or building parallel UI overlays in src/scenes/. Do NOT use for pure combat math, Tiled map exporting, or sprite packing.
---

# Phaser Scene Lifecycle & Memory Hygiene

## 1. When to Use / Routing Rules

- **TRIGGER:** Creating, modifying, or transitioning between Phaser 3 Scenes (`src/scenes/`), registering scene events, or managing parallel UI overlays.
- **DO NOT USE FOR:** Pure combat math or formulas (`src/core/`), Tiled map JSON parsing, or asset sprite packing.

---

## 2. Typed Scene Transitions & `init(data: SceneData)`

Phaser scene instances are reused when restarted with `this.scene.start()`. Transient state must be reset inside `init(data)` on every scene entry:

```typescript
export interface BattleSceneData {
  enemyId: string;
  victoryFlag?: string;
  returnPosition?: { x: number; y: number };
  revivePosition?: { x: number; y: number };
}

export class BattleScene extends Phaser.Scene {
  private sceneData!: BattleSceneData;
  private isTransitioning = false;

  public init(data: BattleSceneData): void {
    // 1. Store strongly-typed scene payload
    this.sceneData = data;

    // 2. Reset transient state on every entry
    this.isTransitioning = false;
    this.commandButtons = [];
  }
}
```

---

## 3. Parallel UI Overlays (`scene.launch`)

For HUDs, Satchel/inventory overlays, and battle menus, run a separate `UIScene` concurrently above the active world or battle scene:

```typescript
// Inside WorldScene or BattleScene create():
this.scene.launch('UIScene', { parentSceneKey: this.scene.key });
this.scene.bringToTop('UIScene');

// Communicating between scenes via scene manager or game events:
this.events.emit('player-hp-changed', { hp: 45, maxHp: 50 });

// Inside UIScene:
const parent = this.scene.get(this.parentSceneKey);
parent.events.on('player-hp-changed', this.updateHpBar, this);
```

When stopping or restarting the primary scene, always cleanly stop or sleep the parallel overlay:

```typescript
this.scene.stop('UIScene');
```

---

## 4. Mandatory SHUTDOWN Cleanup Protocol

Every `Phaser.Scene` that registers event listeners, timers, tweens, or Web Audio nodes MUST destroy them in `SHUTDOWN`:

```typescript
public create(): void {
  // Register cleanup handler once at scene creation
  this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    this.teardownScene();
  });
}

private teardownScene(): void {
  // 1. Remove keyboard listeners
  this.input.keyboard?.removeAllListeners();

  // 2. Kill all active tweens & timers
  this.tweens.killAll();
  this.time.removeAllEvents();

  // 3. Unsubscribe from cross-scene / external event emitters
  this.events.off('player-hp-changed');
  if (this.questSystem && this.questListener) {
    this.questSystem.removeEventListener(this.questListener);
  }

  // 4. Disconnect procedural audio nodes / stop BGM
  SoundSystem.getInstance().stopBgm(true);
}
```

---

## 5. Camera Transitions & Input Guarding

Always guard transition triggers with an `isTransitioning` boolean flag to prevent double-invocations caused by rapid input presses:

```typescript
public transitionToScene(targetKey: string, payload?: unknown): void {
  if (this.isTransitioning) return;
  this.isTransitioning = true;

  // Disable player input controller immediately
  this.controller.setEnabled(false);

  this.cameras.main.fadeOut(300, 0, 0, 0);
  this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    this.scene.start(targetKey, payload);
  });
}
```
