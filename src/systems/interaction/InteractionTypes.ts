import Phaser from 'phaser';

export interface IInteractable {
  id: string;
  interactPrompt: string;
  getInteractionPosition(): Phaser.Math.Vector2;
  getInteractionRadius(): number;
  canInteract(source: Phaser.GameObjects.GameObject): boolean;
  onInteract(source: Phaser.GameObjects.GameObject): void;
}

export interface InteractionEvent {
  interactableId: string;
  prompt: string;
  available: boolean;
}

