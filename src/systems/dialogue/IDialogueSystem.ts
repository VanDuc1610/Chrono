import { DialogueDatabase, DialogueNode, DialogueResponseOption } from './DialogueTypes';

export interface IDialogueSystem {
  loadDatabase(data: DialogueDatabase): void;
  startDialogue(dialogueId: string): boolean;
  advance(): boolean; // returns false if dialogue ended
  selectOption(index: number): boolean;
  getCurrentNode(): DialogueNode | null;
  getCurrentLine(): string | null;
  getAvailableResponses(): DialogueResponseOption[];
  isActive(): boolean;
  close(): void;
}

