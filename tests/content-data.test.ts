import { describe, expect, it } from 'vitest';
import dialogueJson from '../public/assets/data/dialogue.json';
import questsJson from '../public/assets/data/quests.json';
import itemsJson from '../public/assets/data/items.json';
import interactablesJson from '../public/assets/data/interactables.json';
import enemiesJson from '../public/assets/data/enemies.json';
import playerJson from '../public/assets/data/player.json';
import { DialogueDatabase } from '../src/systems/dialogue/DialogueTypes';
import { QuestDatabase } from '../src/systems/quest/QuestTypes';
import { InventoryDatabase } from '../src/systems/inventory/InventoryTypes';
import { EnemyDatabase } from '../src/systems/combat/CombatTypes';
import { GameDatabase, PlayerDatabase } from '../src/state/GameDatabase';
import { FLAGS, GameSession } from '../src/state/GameSession';

const dialogueDb = dialogueJson as unknown as DialogueDatabase;
const questDb = questsJson as unknown as QuestDatabase;
const itemDb = itemsJson as unknown as InventoryDatabase;

function createRealDatabase(): GameDatabase {
  return {
    items: itemDb,
    quests: questDb,
    enemies: enemiesJson as unknown as EnemyDatabase,
    player: playerJson as unknown as PlayerDatabase,
  };
}

describe('Prologue Content Data Integrity (dialogue.json, quests.json, interactables.json)', () => {
  it('ensures every nextDialogueId exists and every dialogue node has at most 2 responses', () => {
    const nodes = Object.values(dialogueDb.dialogues);
    expect(nodes.length).toBeGreaterThan(0);

    for (const node of nodes) {
      expect(node.id).toBeTruthy();
      expect(dialogueDb.dialogues[node.id]).toBeDefined();

      const responses = node.responses ?? [];
      expect(responses.length).toBeLessThanOrEqual(2);

      for (const resp of responses) {
        if (resp.nextDialogueId !== null) {
          expect(
            dialogueDb.dialogues[resp.nextDialogueId],
            `Node "${node.id}" points to missing nextDialogueId "${resp.nextDialogueId}"`,
          ).toBeDefined();
        }
      }
    }
  });

  it('ensures every dialogueId referenced in interactables.json exists in dialogue.json', () => {
    expect(interactablesJson.interactables.length).toBe(7);
    for (const entry of interactablesJson.interactables) {
      expect(
        dialogueDb.dialogues[entry.dialogueId],
        `Interactable "${entry.id}" references missing dialogueId "${entry.dialogueId}"`,
      ).toBeDefined();
    }
  });

  it('ensures every startQuest points to a valid quest and every grantItems entry exists in items.json with a grantOnceFlag', () => {
    const questIds = new Set(questDb.quests.map((q) => q.id));
    const itemIds = new Set(itemDb.items.map((i) => i.id));

    for (const node of Object.values(dialogueDb.dialogues)) {
      const effects = node.effects;
      if (!effects) continue;

      if (effects.startQuest !== undefined) {
        expect(
          questIds.has(effects.startQuest),
          `Node "${node.id}" starts unknown quest "${effects.startQuest}"`,
        ).toBe(true);
      }

      if (effects.grantItems && effects.grantItems.length > 0) {
        expect(
          effects.grantOnceFlag,
          `Node "${node.id}" has grantItems without grantOnceFlag`,
        ).toBeTruthy();
        for (const stack of effects.grantItems) {
          expect(
            itemIds.has(stack.itemId),
            `Node "${node.id}" grants unknown itemId "${stack.itemId}"`,
          ).toBe(true);
          expect(stack.quantity).toBeGreaterThan(0);
        }
      }
    }
  });

  it('ensures every quest objective completeOnFlag (except isShadeDefeated) is set by at least one dialogue node setFlags', () => {
    const allDialogueFlags = new Set<string>();
    for (const node of Object.values(dialogueDb.dialogues)) {
      for (const flag of node.effects?.setFlags ?? []) {
        allDialogueFlags.add(flag);
      }
    }

    for (const quest of questDb.quests) {
      for (const obj of quest.objectives) {
        if (!obj.completeOnFlag || obj.completeOnFlag === FLAGS.shadeDefeated) {
          continue;
        }
        expect(
          allDialogueFlags.has(obj.completeOnFlag),
          `Objective "${obj.id}" in quest "${quest.id}" waits on completeOnFlag "${obj.completeOnFlag}" which no dialogue node sets`,
        ).toBe(true);
      }
    }
  });

  it('runs end-to-end through real dialogue node effects: completes quest_prologue_remnants (+40 EXP) and grants astrolabe gear only once', () => {
    const session = GameSession.newGame(createRealDatabase());

    expect(session.quests.getQuestStage('quest_prologue_remnants')).toBe('inactive');
    expect(session.inventory.getItemCount('ancient_gear')).toBe(0);

    // 1. Inspect Stele of the Six Authorities -> starts quest & completes obj_read_stele
    const steleEffects = dialogueDb.dialogues.stele_six_authorities.effects;
    expect(steleEffects).toBeDefined();
    session.applyDialogueEffects(steleEffects!);
    expect(session.quests.getQuestStage('quest_prologue_remnants')).toBe('started');

    // 2. Extricate gear from Frozen Astrolabe twice -> grants 1 ancient_gear only once
    const astrolabeGearEffects = dialogueDb.dialogues.astrolabe_extricate_gear.effects;
    expect(astrolabeGearEffects).toBeDefined();
    const firstGrant = session.applyDialogueEffects(astrolabeGearEffects!);
    expect(firstGrant).toEqual([{ itemId: 'ancient_gear', quantity: 1 }]);
    expect(session.inventory.getItemCount('ancient_gear')).toBe(1);

    const secondGrant = session.applyDialogueEffects(astrolabeGearEffects!);
    expect(secondGrant).toEqual([]);
    expect(session.inventory.getItemCount('ancient_gear')).toBe(1);

    // 3. Inspect Torn Journal Leaf & Residual Rift Echo -> completes quest_prologue_remnants
    session.applyDialogueEffects(dialogueDb.dialogues.notebook_loose_leaf.effects!);
    expect(session.quests.getQuestStage('quest_prologue_remnants')).toBe('started');

    session.applyDialogueEffects(dialogueDb.dialogues.rift_echo_attune.effects!);
    expect(session.quests.getQuestStage('quest_prologue_remnants')).toBe('completed');

    // 4. Claim quest rewards -> +40 EXP and +1 ancient_gear (total 2 gears), claimed once
    const rewardSummary = session.claimQuestRewards('quest_prologue_remnants');
    expect(rewardSummary).not.toBeNull();
    expect(rewardSummary?.exp).toBe(40);
    expect(session.exp).toBe(40);
    expect(session.inventory.getItemCount('ancient_gear')).toBe(2);
    expect(session.claimQuestRewards('quest_prologue_remnants')).toBeNull();
  });
});
