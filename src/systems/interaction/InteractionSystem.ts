import Phaser from 'phaser';
import { IInteractionSystem } from './IInteractionSystem';
import { IInteractable } from './InteractionTypes';

export class InteractionSystem implements IInteractionSystem {
  private interactables: Map<string, IInteractable> = new Map();

  public register(interactable: IInteractable): void {
    this.interactables.set(interactable.id, interactable);
  }

  public unregister(interactableId: string): void {
    this.interactables.delete(interactableId);
  }

  public getNearbyInteractables(origin: Phaser.Math.Vector2, maxRadius = 48): IInteractable[] {
    const list: IInteractable[] = [];

    for (const item of this.interactables.values()) {
      const pos = item.getInteractionPosition();
      const radius = item.getInteractionRadius() || maxRadius;
      const dist = Phaser.Math.Distance.Between(origin.x, origin.y, pos.x, pos.y);

      if (dist <= radius) {
        list.push(item);
      }
    }

    return list;
  }

  public getClosestInteractable(origin: Phaser.Math.Vector2): IInteractable | null {
    let closest: IInteractable | null = null;
    let minDistance = Infinity;

    for (const item of this.interactables.values()) {
      const pos = item.getInteractionPosition();
      const radius = item.getInteractionRadius();
      const dist = Phaser.Math.Distance.Between(origin.x, origin.y, pos.x, pos.y);

      if (dist <= radius && dist < minDistance) {
        minDistance = dist;
        closest = item;
      }
    }

    return closest;
  }

  public triggerInteraction(source: Phaser.GameObjects.GameObject): boolean {
    const sprite = source as Phaser.Physics.Arcade.Sprite;
    const origin = new Phaser.Math.Vector2(sprite.x, sprite.y);
    const target = this.getClosestInteractable(origin);

    if (target && target.canInteract(source)) {
      target.onInteract(source);
      return true;
    }

    return false;
  }

  public clear(): void {
    this.interactables.clear();
  }
}
