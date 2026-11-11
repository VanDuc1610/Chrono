import { describe, expect, it } from 'vitest';
import dialogueJson from '../public/assets/data/dialogue.json';
import questsJson from '../public/assets/data/quests.json';
import itemsJson from '../public/assets/data/items.json';
import mapsJson from '../public/assets/data/maps.json';
import stringsJson from '../public/assets/data/strings.json';
import enemiesJson from '../public/assets/data/enemies.json';
import playerJson from '../public/assets/data/player.json';
import { DialogueDatabase } from '../src/systems/dialogue/DialogueTypes';
import { QuestDatabase } from '../src/systems/quest/QuestTypes';
import { InventoryDatabase } from '../src/systems/inventory/InventoryTypes';
import { EnemyDatabase } from '../src/systems/combat/CombatTypes';
import { GameDatabase, PlayerDatabase } from '../src/state/GameDatabase';
import { FLAGS, GameSession } from '../src/state/GameSession';
import { MapDatabase } from '../src/world/MapTypes';
import { resolveMap, validateMapDatabase } from '../src/world/MapRegistry';
import { formatString } from '../src/ui/Strings';

const dialogueDb = dialogueJson as unknown as DialogueDatabase;
const mapDb = mapsJson as unknown as MapDatabase;
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

describe('UI strings (strings.json)', () => {
  it('fills placeholders and falls back to the key for unknown entries', () => {
    const table = stringsJson.strings as Record<string, string>;
    expect(formatString(table, 'hud.location', { name: 'X' })).toBe('VỊ TRÍ: X');
    expect(formatString(table, 'no.such.key')).toBe('no.such.key');
  });

  it('defines a label for every item type used in items.json', () => {
    const table = stringsJson.strings as Record<string, string>;
    for (const item of itemDb.items) {
      expect(table[`satchel.type.${item.type}`], `missing satchel.type.${item.type}`).toBeTruthy();
    }
  });
});

describe('Prologue Content Data Integrity (dialogue.json, quests.json, maps.json)', () => {
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

  it('maps.json references only existing dialogues, quests, objectives, enemies, maps and spawns', () => {
    const errors = validateMapDatabase(mapDb, {
      dialogueIds: new Set(Object.keys(dialogueDb.dialogues)),
      questIds: new Set(questDb.quests.map((q) => q.id)),
      enemyIds: new Set(
        (enemiesJson as unknown as EnemyDatabase).enemies.map((e: { id: string }) => e.id),
      ),
      objectives: new Map(
        questDb.quests.map((q) => [q.id, new Set(q.objectives.map((o) => o.id))]),
      ),
    });
    expect(errors).toEqual([]);
    // The Antechamber keeps its 7 points of interest + the Altar.
    expect(mapDb.maps.map_shattered_antechamber?.interactables?.length).toBe(8);
  });

  it('resolves old save map ids through aliases and falls back to the start map', () => {
    expect(resolveMap(mapDb, 'prologue_sanctuary').id).toBe('map_shattered_antechamber');
    expect(resolveMap(mapDb, 'no_such_map').id).toBe(mapDb.startMapId);
    expect(resolveMap(mapDb, undefined).id).toBe(mapDb.startMapId);
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

  it('verifies Prologue v2 initial room flow (T-29 addendum)', () => {
    // 1. Quests initial stages
    expect(questDb.quests.find((q) => q.id === 'quest_prologue_awaken')?.stage).toBe('started');
    expect(questDb.quests.find((q) => q.id === 'quest_prologue_awakening')?.stage).toBe('inactive');

    // 2. intro_awakening does not contain "Where am I?" / "Antechamber"
    const intro = dialogueDb.dialogues.intro_awakening;
    expect(intro).toBeDefined();
    for (const r of intro.responses ?? []) {
      expect(r.text).not.toContain('Where am I');
      expect(r.nextDialogueId).not.toBe('intro_location');
    }

    // 3. room_door_locked dialogue exists for locked door gating
    const doorLocked = dialogueDb.dialogues.room_door_locked;
    expect(doorLocked).toBeDefined();
    expect(doorLocked.speaker).toBe('Peter');
    expect(doorLocked.lines.length).toBeGreaterThan(0);

    // 4. End-to-end room quest flow
    const session = GameSession.newGame(createRealDatabase());
    expect(session.quests.getQuestStage('quest_prologue_awaken')).toBe('started');
    expect(session.getFlag('has_room_key')).toBe(false);

    // Inspect notebook -> completes obj_inspect_notebook
    session.applyDialogueEffects(dialogueDb.dialogues.room_notebook.effects!);
    expect(session.getFlag('inspected_room_notebook')).toBe(true);
    expect(
      session.quests
        .getQuest('quest_prologue_awaken')
        ?.objectives.find((o) => o.id === 'obj_inspect_notebook')?.completed,
    ).toBe(true);

    // Pick up key -> grants brass_key and sets has_room_key
    const keyGrant = session.applyDialogueEffects(dialogueDb.dialogues.room_key.effects!);
    expect(keyGrant).toEqual([{ itemId: 'brass_key', quantity: 1 }]);
    expect(session.getFlag('has_room_key')).toBe(true);
    expect(session.inventory.getItemCount('brass_key')).toBe(1);

    // Pick up key second time -> grantOnceFlag prevents duplicate item
    const duplicateKeyGrant = session.applyDialogueEffects(dialogueDb.dialogues.room_key.effects!);
    expect(duplicateKeyGrant).toEqual([]);
    expect(session.inventory.getItemCount('brass_key')).toBe(1);

    // Both objectives complete -> quest completes
    expect(session.quests.getQuestStage('quest_prologue_awaken')).toBe('completed');
    const claim = session.claimQuestRewards('quest_prologue_awaken');
    expect(claim?.exp).toBe(10);
    expect(session.exp).toBe(10);
  });
});
