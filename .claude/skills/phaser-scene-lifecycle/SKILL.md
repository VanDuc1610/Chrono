---
name: phaser-scene-lifecycle
description: Guidelines for managing Phaser 3 scene lifecycles, resource cleanup, event listeners, and preventing memory leaks across scene transitions.
---

# Phaser Scene Lifecycle & Memory Hygiene

## 1. When to Load

- Modifying or creating any `Phaser.Scene` class (`src/scenes/`).
- Adding keyboard listeners, timer events, or tweens.
- Debugging scene transition glitches or audio/node leaks.

## 2. Core Constraints

- **Event Teardown:** Never leave active listeners on `this.events`, `this.input.keyboard`, or global event emitters. Clean them up on `SHUTDOWN`:
  ```typescript
  this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    // Teardown timers, tweens, keyboard listeners, audio oscillators
  });
  ```
- **Transient State Reset:** Always reset scene-local variables in `init(data)`. Remember that Phaser scene instances are reused when restarted with `scene.start()`.
- **Camera Fades:** Guard transitions with an `isTransitioning` boolean flag so rapid input cannot trigger double scene starts.

## 3. References

- See `references/SceneLifecycleTemplate.ts` for a full boilerplate implementation.
