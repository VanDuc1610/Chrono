export interface DialogueResponseOption {
  text: string;
  nextDialogueId: string | null;
  condition?: string;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  lines: string[];
  responses?: DialogueResponseOption[];
}

export interface DialogueDatabase {
  dialogues: Record<string, DialogueNode>;
}

export type DialogueCallback = (node: DialogueNode, currentLineIndex: number) => void;
