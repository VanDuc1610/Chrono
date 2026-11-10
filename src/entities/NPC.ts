import Phaser from 'phaser';
import { Entity } from './Entity';
import { IInteractable } from '../systems/interaction/InteractionTypes';

export interface NPCConfig {
  id: string;
  name: string;
  dialogueId?: string;
  prompt?: string;
  interactionRadius?: number;
}

export class NPC extends Entity implements IInteractable {
  public id: string;
  public name: string;
  public dialogueId?: string;
  public interactPrompt: string;
  private radius: number;
  private onInteractCallback?: (npc: NPC) => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: NPCConfig,
    onInteract?: (npc: NPC) => void,
  ) {
    super(scene, x, y, texture);

    this.id = config.id;
    this.name = config.name;
    this.dialogueId = config.dialogueId;
    this.interactPrompt = config.prompt ?? `Talk to ${this.name}`;
    this.radius = config.interactionRadius ?? 40;
    this.onInteractCallback = onInteract;

    // Static physics body so player collides with NPC
    this.sprite.setImmovable(true);
    if (this.sprite.body) {
      this.sprite.body.setSize(20, 20);
      this.sprite.body.setOffset(6, 12);
    }
  }

  public getInteractionPosition(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.sprite.x, this.sprite.y);
  }

  public getInteractionRadius(): number {
    return this.radius;
  }

  public canInteract(): boolean {
    return true;
  }

  public onInteract(): void {
    if (this.onInteractCallback) {
      this.onInteractCallback(this);
    }
  }

  public update(): void {
    // NPC idle logic or facing adjustments
  }
}
