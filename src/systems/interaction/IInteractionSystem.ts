import Phaser from 'phaser';
import { IInteractable } from './InteractionTypes';

export interface IInteractionSystem {
  register(interactable: IInteractable): void;
  unregister(interactableId: string): void;
  getNearbyInteractables(origin: Phaser.Math.Vector2, maxRadius?: number): IInteractable[];
  getClosestInteractable(origin: Phaser.Math.Vector2): IInteractable | null;
  triggerInteraction(source: Phaser.GameObjects.GameObject): boolean;
  clear(): void;
}
