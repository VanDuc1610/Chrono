export interface DialogueResponseOption {
  text: string;
  nextDialogueId: string | null;
  condition?: string;
}

/**
 * Data-driven side effects applied when a dialogue node starts (dialogue.json `effects`).
 * Applied by GameSession.applyDialogueEffects; all of them are idempotent.
 */
export interface DialogueEffects {
  /** Session flags set to true (e.g. objective triggers via quests.json `completeOnFlag`). */
  setFlags?: string[];
  /** Quest started if it is still inactive. */
  startQuest?: string;
  /** Items granted — once per playthrough when `grantOnceFlag` is set. */
  grantItems?: { itemId: string; quantity: number }[];
  /** EXP granted (once, with `grantOnceFlag`). */
  grantExp?: number;
  /** Session flag recording that the rewards were already given. Required with grantItems/grantExp. */
  grantOnceFlag?: string;
  /** When this dialogue ends, the Prologue ending plays (handled by ExplorationScene). */
  endPrologue?: boolean;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  lines: string[];
  /** At most 2 responses: the dialogue box shows two choice buttons (keys 1-2). */
  responses?: DialogueResponseOption[];
  effects?: DialogueEffects;
}

export interface DialogueDatabase {
  dialogues: Record<string, DialogueNode>;
}

export type DialogueCallback = (node: DialogueNode, currentLineIndex: number) => void;
