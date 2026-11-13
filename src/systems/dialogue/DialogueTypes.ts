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
  /** When this dialogue ends, the end card of this chapter plays (1, 2, …). */
  endChapter?: number;
  /** Session flags reset to false (e.g. a puzzle sequence entered in the wrong order). */
  clearFlags?: string[];
  /**
   * When the dialogue closes, the map is rebuilt in place (Peter keeps his position) so that
   * visibleWhen / frozenWhen / layerVariants reflect the new flags — e.g. switching time layers.
   */
  refreshMap?: boolean;
  /** After the dialogue closes, Peter is carried to this map / spawn (fade). */
  warpTo?: { mapId: string; spawnId: string };
  /** HP and MP refilled. */
  healFull?: boolean;
  /** Items handed over / used up (e.g. a puzzle object placed, a letter delivered). */
  takeItems?: { itemId: string; quantity: number }[];
  /** Sets `flag` now and clears it after `ms` (e.g. a bridge that holds for 8 seconds). */
  startTimer?: { flag: string; ms: number };
  /** Puts one sack from the satchel on a pan of a map scale (MapScale). */
  scalePut?: { scaleId: string; pan: 'left' | 'right'; itemId: string };
  /** Gives back every sack on that scale. */
  scaleReset?: string;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  lines: string[];
  /** At most 2 responses: the dialogue box shows two choice buttons (keys 1-2). */
  responses?: DialogueResponseOption[];
  effects?: DialogueEffects;
  /** A hazy memory: the screen greys and blurs at the edges while it is shown. */
  flashback?: boolean;
}

export interface DialogueDatabase {
  dialogues: Record<string, DialogueNode>;
}

export type DialogueCallback = (node: DialogueNode, currentLineIndex: number) => void;
