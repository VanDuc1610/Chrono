import Phaser from 'phaser';

export interface IInteractable {
  id: string;
  interactPrompt: string;
  getInteractionPosition(): Phaser.Math.Vector2;
  getInteractionRadius(): number;
  canInteract(source: Phaser.GameObjects.GameObject): boolean;
  onInteract(source: Phaser.GameObjects.GameObject): void;
}

/** Environmental point of interest from public/assets/data/interactables.json. */
export interface InteractableDefinition {
  id: string;
  /** Map tile (32 px grid); the interaction point is the tile centre. */
  tile: { x: number; y: number };
  radius: number;
  prompt: string;
  /** dialogue.json node opened on interaction (its `effects` carry flags/rewards). */
  dialogueId: string;
}

export interface InteractableDatabase {
  interactables: InteractableDefinition[];
}

export interface InteractionEvent {
  interactableId: string;
  prompt: string;
  available: boolean;
}
