import { IDialogueSystem } from './IDialogueSystem';
import { DialogueDatabase, DialogueNode, DialogueResponseOption } from './DialogueTypes';

export type DialogueEventListener = (event: {
  type: 'node_changed' | 'line_changed' | 'choice_presented' | 'dialogue_ended';
  node?: DialogueNode;
  line?: string;
  lineIndex?: number;
  choices?: DialogueResponseOption[];
}) => void;

export class DialogueSystem implements IDialogueSystem {
  private database: DialogueDatabase = { dialogues: {} };
  private currentNode: DialogueNode | null = null;
  private currentLineIndex = 0;
  private active = false;
  private listeners: DialogueEventListener[] = [];

  public loadDatabase(data: DialogueDatabase): void {
    this.database = data;
  }

  public addEventListener(listener: DialogueEventListener): void {
    this.listeners.push(listener);
  }

  public removeEventListener(listener: DialogueEventListener): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private emit(event: Parameters<DialogueEventListener>[0]): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public startDialogue(dialogueId: string): boolean {
    const node = this.database.dialogues[dialogueId];
    if (!node) {
      console.warn(`[DialogueSystem] Dialogue node "${dialogueId}" not found in database.`);
      return false;
    }

    this.currentNode = node;
    this.currentLineIndex = 0;
    this.active = true;

    this.emit({
      type: 'node_changed',
      node: this.currentNode,
      line: this.getCurrentLine() ?? undefined,
      lineIndex: 0,
    });

    return true;
  }

  public advance(): boolean {
    if (!this.active || !this.currentNode) {
      return false;
    }

    // If there are more lines in the current node, advance to the next line
    if (this.currentLineIndex < this.currentNode.lines.length - 1) {
      this.currentLineIndex++;
      this.emit({
        type: 'line_changed',
        node: this.currentNode,
        line: this.getCurrentLine() ?? undefined,
        lineIndex: this.currentLineIndex,
      });
      return true;
    }

    // If the node has choices and we are at the last line, choices are presented
    const responses = this.getAvailableResponses();
    if (responses.length > 0) {
      this.emit({
        type: 'choice_presented',
        node: this.currentNode,
        choices: responses,
      });
      return true;
    }

    // End of dialogue
    this.close();
    return false;
  }

  public selectOption(index: number): boolean {
    if (!this.active || !this.currentNode) {
      return false;
    }

    const responses = this.getAvailableResponses();
    if (index < 0 || index >= responses.length) {
      return false;
    }

    const selected = responses[index];
    if (selected.nextDialogueId) {
      return this.startDialogue(selected.nextDialogueId);
    } else {
      this.close();
      return false;
    }
  }

  public getCurrentNode(): DialogueNode | null {
    return this.currentNode;
  }

  public getCurrentLine(): string | null {
    if (!this.currentNode || this.currentLineIndex >= this.currentNode.lines.length) {
      return null;
    }
    return this.currentNode.lines[this.currentLineIndex];
  }

  public getCurrentLineIndex(): number {
    return this.currentLineIndex;
  }

  public isLastLineOfNode(): boolean {
    if (!this.currentNode) return true;
    return this.currentLineIndex >= this.currentNode.lines.length - 1;
  }

  public getAvailableResponses(): DialogueResponseOption[] {
    if (!this.currentNode || !this.currentNode.responses) {
      return [];
    }
    return this.currentNode.responses;
  }

  public isActive(): boolean {
    return this.active;
  }

  public close(): void {
    const prevNode = this.currentNode;
    this.active = false;
    this.currentNode = null;
    this.currentLineIndex = 0;
    this.emit({
      type: 'dialogue_ended',
      node: prevNode ?? undefined,
    });
  }
}
