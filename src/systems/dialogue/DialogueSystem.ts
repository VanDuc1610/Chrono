import { IDialogueSystem } from './IDialogueSystem';
import { DialogueDatabase, DialogueNode, DialogueResponseOption } from './DialogueTypes';

export type DialogueEventListener = (event: {
  type: 'node_changed' | 'line_changed' | 'choice_presented' | 'dialogue_ended';
  node?: DialogueNode;
  line?: string;
  lineIndex?: number;
  choices?: DialogueResponseOption[];
}) => void;

/** Number keys 1-4 pick a choice. */
export const MAX_CHOICES = 4;

/** "Xem các dòng khác" and the like: a link to a node that only lists more choices. */
function isMoreLink(r: DialogueResponseOption, next: DialogueNode): boolean {
  const plain = !next.effects && !(next as { flashback?: boolean }).flashback;
  return /^Xem\s.*khác\s*$/i.test(r.text.trim()) && plain && (next.responses?.length ?? 0) > 0;
}

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

  /**
   * The current choices. A "see the others" link (`Xem ... khác` leading to a plain node that only
   * offers more choices) is unfolded, so a pick-one-of-several puzzle shows every option at once,
   * as long as they fit the number keys (MAX_CHOICES).
   */
  public getAvailableResponses(): DialogueResponseOption[] {
    if (!this.currentNode || !this.currentNode.responses) {
      return [];
    }
    const own = this.currentNode.responses;
    const unfolded = this.unfold(own, new Set());
    return unfolded.length <= MAX_CHOICES ? unfolded : own;
  }

  private unfold(list: DialogueResponseOption[], seen: Set<string>): DialogueResponseOption[] {
    const out: DialogueResponseOption[] = [];
    for (const r of list) {
      const id = r.nextDialogueId;
      const next = id ? this.database.dialogues[id] : undefined;
      if (id && next && !seen.has(id) && isMoreLink(r, next)) {
        seen.add(id);
        out.push(...this.unfold(next.responses ?? [], seen));
      } else out.push(r);
    }
    return out;
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
