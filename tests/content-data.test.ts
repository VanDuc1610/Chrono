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
  it('uses only effect keys the engine understands (unknown keys would be silently ignored)', () => {
    const known = new Set([
      'setFlags',
      'clearFlags',
      'startQuest',
      'grantItems',
      'grantExp',
      'grantOnceFlag',
      'endPrologue',
      'endChapter',
      'refreshMap',
      'warpTo',
      'healFull',
    ]);
    for (const node of Object.values(dialogueDb.dialogues)) {
      for (const key of Object.keys(node.effects ?? {})) {
        expect(known.has(key), `Node "${node.id}" uses unsupported effect "${key}"`).toBe(true);
      }
      if (node.effects?.grantExp) {
        expect(
          node.effects.grantOnceFlag,
          `Node "${node.id}" grantExp needs grantOnceFlag`,
        ).toBeTruthy();
      }
    }
  });

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

  it('ensures every quest objective completeOnFlag is set by a dialogue node or combat encounter', () => {
    const knownFlags = new Set<string>([
      FLAGS.shadeDefeated,
      // Set on winning the Act 2 first-shade encounter added by T-37 (maps.json + enemies.json).
      'defeated_first_shade',
      // Set by ActionCombat when all roamers in group "town_shades" are defeated (T-45/T-47).
      'cleared_town_shades',
    ]);
    for (const node of Object.values(dialogueDb.dialogues)) {
      for (const flag of node.effects?.setFlags ?? []) {
        knownFlags.add(flag);
      }
    }
    for (const map of Object.values(mapDb.maps)) {
      for (const enc of map.encounters ?? []) {
        if (enc.defeatedFlag) {
          knownFlags.add(enc.defeatedFlag);
        }
      }
    }

    for (const quest of questDb.quests) {
      for (const obj of quest.objectives) {
        if (!obj.completeOnFlag) {
          continue;
        }
        expect(
          knownFlags.has(obj.completeOnFlag),
          `Objective "${obj.id}" in quest "${quest.id}" waits on completeOnFlag "${obj.completeOnFlag}" which nothing sets`,
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

    // Both objectives complete -> quest completes and chains to quest_prologue_town on next sync
    expect(session.quests.getQuestStage('quest_prologue_awaken')).toBe('completed');
    session.syncQuestProgress();
    expect(session.quests.getQuestStage('quest_prologue_town')).toBe('started');
    const claim = session.claimQuestRewards('quest_prologue_awaken');
    expect(claim?.exp).toBe(10);
    expect(session.exp).toBe(10);
  });

  it('satisfies the Prologue v3.1 ambush/rescue/teaching dialogue, Act 1 mundane tone, and quest chain', () => {
    const requiredIds = [
      'intro_awakening',
      'room_door_locked',
      'room_key',
      'room_notebook',
      'room_photo',
      'room_watch',
      'elder_shop_visit',
      'watch_delivery',
      'town_time_stops',
      'battle_elder_rescue',
      'elder_rest_explain',
      'elder_after_hunt',
      'grandfather_watch_awakens',
      'elder_teach_skill',
      'elder_explains_frozen_town',
      'npc_vendor_ba_ba_frozen',
      'npc_fisherman_sau_frozen',
      'poi_empty_lot_frozen',
      'poi_ancient_well_frozen',
      'poi_child_sandals_frozen',
      'town_time_restored',
    ];
    for (const id of requiredIds) {
      expect(dialogueDb.dialogues[id], `Missing v3.1 dialogue "${id}"`).toBeDefined();
    }
    expect(dialogueDb.dialogues.battle_elder_intervenes).toBeUndefined();
    expect(dialogueDb.dialogues.elder_after_first_battle).toBeUndefined();

    // Verify rescue warp/heal and control instructions in rest & skill lessons
    expect(dialogueDb.dialogues.battle_elder_rescue.effects).toEqual({
      setFlags: ['rescued_by_elder'],
      healFull: true,
      warpTo: { mapId: 'map_peters_room', spawnId: 'rest' },
    });
    const restText = dialogueDb.dialogues.elder_rest_explain.lines.join(' ').toLowerCase();
    expect(restText).toContain('chuột trái');
    expect(restText).toContain('shift');
    expect(restText).toContain('[i]');

    const skillText = dialogueDb.dialogues.elder_teach_skill.lines.join(' ').toLowerCase();
    expect(skillText).toContain('chuột phải');
    expect(skillText).toContain('6 mp');

    // No cosmic / Act 2+ spoilers before time stops, and zero Kuro mentions anywhere
    const forbiddenAct1Terms = [
      'Đại Thảm Họa',
      'Đấng Quyền Năng',
      'Quyền Năng',
      'Nhãn Thời Gian',
      'Xóa Bỏ Khái Niệm',
      'Dấu Tích Tồn Tại',
      'Kẻ Không Được Ghi Tên',
      'Unwritten',
      'dị thể',
      'vết nứt thời gian',
      'Rừng Quên Lãng',
      'thanh kiếm gãy',
    ];
    const act1Nodes = [
      'intro_awakening',
      'room_door_locked',
      'room_key',
      'room_notebook',
      'room_photo',
      'room_photo_trace',
      'room_watch',
      'elder_shop_visit',
      'elder_shop_visit_examine',
      'watch_delivery',
      'npc_vendor_ba_ba',
      'vendor_ba_ba_alone',
      'vendor_ba_ba_who',
      'npc_fisherman_sau',
      'poi_empty_lot',
      'poi_ancient_well',
      'poi_child_sandals',
    ];
    for (const id of act1Nodes) {
      const text = dialogueDb.dialogues[id].lines.join(' ');
      for (const term of forbiddenAct1Terms) {
        expect(text.toLowerCase(), `Act 1 dialogue "${id}" leaked "${term}"`).not.toContain(
          term.toLowerCase(),
        );
      }
    }
    const starterWatch = itemDb.items.find((i) => i.id === 'relic_chronometer');
    expect(starterWatch?.description).not.toContain('Đại Thảm Họa');
    expect(JSON.stringify({ dialogueDb, questDb, itemDb })).not.toMatch(/kuro/i);

    // End-to-end 5-Act quest progression through GameSession + real effects
    const session = GameSession.newGame(createRealDatabase());

    // Act 1: Room -> Town
    session.applyDialogueEffects(dialogueDb.dialogues.room_notebook.effects!);
    session.applyDialogueEffects(dialogueDb.dialogues.room_key.effects!);
    session.syncQuestProgress();
    expect(session.quests.getQuestStage('quest_prologue_town')).toBe('started');

    session.applyDialogueEffects(dialogueDb.dialogues.npc_vendor_ba_ba.effects!);
    session.applyDialogueEffects(dialogueDb.dialogues.elder_shop_visit.effects!);
    session.applyDialogueEffects(dialogueDb.dialogues.watch_delivery.effects!);
    expect(session.getFlag('elder_visited_shop')).toBe(true);
    expect(session.getFlag('delivered_repaired_watch')).toBe(true);
    expect(session.quests.getQuestStage('quest_prologue_town')).toBe('completed');
    session.syncQuestProgress();
    expect(session.quests.getQuestStage('quest_prologue_timestop')).toBe('started');

    // Act 2: Time stops -> unarmed ambush rescue -> rest & receive broken_blade once -> hunt town Shades
    session.applyDialogueEffects(dialogueDb.dialogues.town_time_stops.effects!);
    expect(session.getFlag('time_frozen')).toBe(true);
    session.applyDialogueEffects(dialogueDb.dialogues.battle_elder_rescue.effects!);
    expect(session.getFlag('rescued_by_elder')).toBe(true);
    expect(session.quests.getQuestStage('quest_prologue_timestop')).toBe('completed');
    session.syncQuestProgress();
    expect(session.quests.getQuestStage('quest_prologue_first_hunt')).toBe('started');

    expect(session.applyDialogueEffects(dialogueDb.dialogues.elder_rest_explain.effects!)).toEqual([
      { itemId: 'broken_blade', quantity: 1 },
    ]);
    expect(session.applyDialogueEffects(dialogueDb.dialogues.elder_rest_explain.effects!)).toEqual(
      [],
    );
    expect(session.getFlag('has_broken_blade')).toBe(true);
    expect(session.getFlag('elder_joined')).toBe(true);

    // Clear town Shades -> triggers grandfather watch chain
    session.setFlag('cleared_town_shades', true);
    session.syncQuestProgress();
    expect(session.quests.getQuestStage('quest_prologue_first_hunt')).toBe('completed');
    session.syncQuestProgress();
    expect(session.quests.getQuestStage('quest_prologue_watch')).toBe('started');

    // Act 3: Grandfather watch awakens -> Elder teaches Temporal Strike (6 MP) -> Town frozen side quest
    session.applyDialogueEffects(dialogueDb.dialogues.grandfather_watch_awakens.effects!);
    expect(session.getFlag('learned_temporal_sight')).toBe(true);
    session.applyDialogueEffects(dialogueDb.dialogues.elder_teach_skill.effects!);
    expect(session.getFlag('taught_temporal_strike')).toBe(true);
    expect(session.quests.getQuestStage('quest_prologue_watch')).toBe('completed');
    session.syncQuestProgress();
    expect(session.quests.getQuestStage('quest_prologue_forest')).toBe('started');

    session.applyDialogueEffects(dialogueDb.dialogues.poi_child_sandals_frozen.effects!);
    expect(session.quests.getQuestStage('quest_prologue_forgotten_child')).toBe('started');
    session.applyDialogueEffects(dialogueDb.dialogues.poi_child_sandals_return.effects!);
    expect(session.quests.getQuestStage('quest_prologue_forgotten_child')).toBe('completed');

    // Act 4: Forest -> Antechamber -> Silence the Fracture
    session.setFlag('defeated_forest_shade', true);
    session.syncQuestProgress();
    expect(session.quests.getQuestStage('quest_prologue_forest')).toBe('completed');
    session.syncQuestProgress();
    expect(session.quests.getQuestStage('quest_prologue_awakening')).toBe('started');

    session.quests.completeObjective('quest_prologue_awakening', 'obj_speak_elder');
    session.applyDialogueEffects(dialogueDb.dialogues.altar_inspection.effects!);
    session.quests.completeObjective('quest_prologue_awakening', 'obj_inspect_altar');
    session.syncQuestProgress();
    expect(session.quests.getQuestStage('quest_prologue_awakening')).toBe('completed');
    expect(session.quests.getQuestStage('quest_prologue_silence')).toBe('started');

    session.setFlag(FLAGS.shadeDefeated, true);
    session.syncQuestProgress();
    expect(session.quests.getQuestStage('quest_prologue_silence')).toBe('completed');
    session.syncQuestProgress();
    expect(session.quests.getQuestStage('quest_prologue_sentinel')).toBe('started');

    // Act 5: Sentinel pacified -> Town restored -> UNWRITTEN record
    session.applyDialogueEffects(dialogueDb.dialogues.boss_sentinel_pacified.effects!);
    expect(session.quests.getQuestStage('quest_prologue_sentinel')).toBe('completed');
    session.syncQuestProgress();
    expect(session.quests.getQuestStage('quest_prologue_unwritten')).toBe('started');

    session.applyDialogueEffects(dialogueDb.dialogues.town_time_restored.effects!);
    expect(session.getFlag('time_restored')).toBe(true);
    session.applyDialogueEffects(dialogueDb.dialogues.poi_unwritten_tablet.effects!);
    expect(session.quests.getQuestStage('quest_prologue_unwritten')).toBe('completed');
    expect(dialogueDb.dialogues.prologue_farewell_step.effects?.endPrologue).toBe(true);
  });

  it('satisfies Chapter 1 quests, items, Time Anchor rotation, Bell Pillar sequence, and canon rules', () => {
    // 1. All 8 Chapter 1 quests start inactive and no equipment category items are added yet
    const ch1QuestIds = [
      'quest_ch1_sunset_gate',
      'quest_ch1_abandoned_village',
      'quest_ch1_fog_beacon',
      'quest_ch1_sunken_ruins',
      'quest_ch1_bellkeeper',
      'quest_ch1_fisherman_letter',
      'quest_ch1_empty_photo',
      'quest_ch1_second_dinner',
    ];
    for (const qId of ch1QuestIds) {
      expect(questDb.quests.find((q) => q.id === qId)?.stage, `Quest "${qId}"`).toBe('inactive');
    }
    const itemsRaw = itemsJson.items as Array<{
      id: string;
      type: string;
      equip?: Record<string, number>;
      effects?: Record<string, number>;
    }>;
    const brokenBlade = itemsRaw.find((i) => i.id === 'broken_blade');
    expect(brokenBlade?.type).toBe('weapon');
    expect(brokenBlade?.equip).toEqual({ attack: 2, reach: 28, swingMs: 420 });

    const ch1Weapon = itemsRaw.find((i) => i.id === 'tide_brass_blade');
    expect(ch1Weapon?.type).toBe('weapon');
    expect(ch1Weapon?.equip?.attack).toBeGreaterThan(2);

    const ch1Charm = itemsRaw.find((i) => i.id === 'sea_glass_charm');
    expect(ch1Charm?.type).toBe('charm');
    expect(ch1Charm?.equip?.maxHp).toBeGreaterThan(0);

    expect(questDb.quests.find((q) => q.id === 'quest_ch1_empty_photo')?.rewards?.items).toContain(
      'sea_glass_charm',
    );
    expect(itemDb.items.find((i) => i.id === 'sunset_dried_fish')?.effects?.healAmount).toBe(45);
    expect(itemDb.items.find((i) => i.id === 'continuum_seal_shard')?.type).toBe('key_item');
    expect(itemDb.items.find((i) => i.id === 'unsent_fisherman_letter')?.type).toBe('key_item');

    // Hidden mirror cache dialogues + hint line
    const mirrorIds = [
      'ch1_mirror_1_ready',
      'ch1_mirror_1_align',
      'ch1_mirror_1_already',
      'ch1_mirror_2_ready_ok',
      'ch1_mirror_2_align_ok',
      'ch1_mirror_2_already',
      'ch1_mirror_2_ready_wrong',
      'ch1_mirror_3_ready_ok',
      'ch1_mirror_3_align_ok',
      'ch1_mirror_3_ready_wrong',
      'ch1_mirror_wrong_reset',
      'ch1_mirror_all_aligned',
      'ch1_mirror_cache_locked',
      'ch1_mirror_cache_open',
      'ch1_mirror_cache_empty',
    ];
    for (const id of mirrorIds) {
      expect(dialogueDb.dialogues[id], `Missing mirror dialogue "${id}"`).toBeDefined();
    }
    expect(dialogueDb.dialogues.ch1_keeper_logbook_note.lines.join(' ')).toContain('gương đồng');

    // 2. Bà Tư is distinct from Cô Ba and unnamed watch case hides any "K..." or Kuro trace
    expect(dialogueDb.dialogues.ch1_second_dinner.lines.join(' ')).not.toContain('Cô Ba');
    const watchCaseText = dialogueDb.dialogues.ch1_unnamed_watch_case.lines.join(' ');
    expect(watchCaseText).not.toMatch(/kuro/i);
    expect(watchCaseText).not.toMatch(/\bK\.\.\./);

    // 3. End-to-end Chapter 1 main chain, Time Anchor cycle, Bell Pillars, and side quests
    const session = GameSession.newGame(createRealDatabase());

    // Shore Gate
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_shore_arrival.effects!);
    expect(session.quests.getQuestStage('quest_ch1_sunset_gate')).toBe('started');
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_shore_arrival_ask.effects!);
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_broken_sundial_fix.effects!);
    expect(session.getFlag('broke_shore_loop')).toBe(true);
    expect(dialogueDb.dialogues.ch1_broken_sundial_fix.effects?.refreshMap).toBe(true);
    expect(session.quests.getQuestStage('quest_ch1_sunset_gate')).toBe('completed');
    session.syncQuestProgress();
    expect(session.quests.getQuestStage('quest_ch1_abandoned_village')).toBe('started');

    // Abandoned Village: Time Anchor free rotation Present -> Past -> Cataclysm -> Present
    expect(session.getFlag('ch1_layer_past')).toBe(false);
    expect(session.getFlag('ch1_layer_cataclysm')).toBe(false);

    expect(dialogueDb.dialogues.ch1_anchor_to_past.effects?.refreshMap).toBe(true);
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_anchor_to_past.effects!);
    expect(session.getFlag('ch1_used_anchor')).toBe(true);
    expect(session.getFlag('ch1_layer_past')).toBe(true);
    expect(session.getFlag('ch1_layer_cataclysm')).toBe(false);

    // Side quests in Past: take letter once + Bà Tư dinner memory step 1
    expect(session.applyDialogueEffects(dialogueDb.dialogues.ch1_letter_box_take.effects!)).toEqual(
      [{ itemId: 'unsent_fisherman_letter', quantity: 1 }],
    );
    expect(session.applyDialogueEffects(dialogueDb.dialogues.ch1_letter_box_take.effects!)).toEqual(
      [],
    );
    expect(session.quests.getQuestStage('quest_ch1_fisherman_letter')).toBe('started');
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_second_dinner_past.effects!);
    expect(session.getFlag('checked_past_dinner')).toBe(true);

    // Rotate Past -> Cataclysm
    expect(dialogueDb.dialogues.ch1_anchor_to_cataclysm.effects?.refreshMap).toBe(true);
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_anchor_to_cataclysm.effects!);
    expect(session.getFlag('ch1_layer_past')).toBe(false);
    expect(session.getFlag('ch1_layer_cataclysm')).toBe(true);

    // Rotate Cataclysm -> Present
    expect(dialogueDb.dialogues.ch1_anchor_to_present.effects?.refreshMap).toBe(true);
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_anchor_to_present.effects!);
    expect(session.getFlag('ch1_layer_past')).toBe(false);
    expect(session.getFlag('ch1_layer_cataclysm')).toBe(false);

    // Complete village side quests in Present + break village loop
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_fisherman_spirit_deliver.effects!);
    expect(session.quests.getQuestStage('quest_ch1_fisherman_letter')).toBe('completed');
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_second_dinner_remember.effects!);
    expect(session.quests.getQuestStage('quest_ch1_second_dinner')).toBe('completed');
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_shrine_photo_attune.effects!);
    expect(session.quests.getQuestStage('quest_ch1_empty_photo')).toBe('completed');

    session.applyDialogueEffects(dialogueDb.dialogues.ch1_village_bell_post_fix.effects!);
    expect(session.quests.getQuestStage('quest_ch1_abandoned_village')).toBe('completed');
    session.syncQuestProgress();
    expect(session.quests.getQuestStage('quest_ch1_fog_beacon')).toBe('started');

    // Fog Beacon -> Tide Lowered
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_old_keeper_talk.effects!);
    expect(dialogueDb.dialogues.ch1_tide_wheel_turn.effects?.refreshMap).toBe(true);
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_tide_wheel_turn.effects!);
    expect(session.getFlag('tide_lowered')).toBe(true);
    expect(session.quests.getQuestStage('quest_ch1_fog_beacon')).toBe('completed');
    session.syncQuestProgress();
    expect(session.quests.getQuestStage('quest_ch1_sunken_ruins')).toBe('started');

    // Sunken Causes: Pillar 1 -> wrong strike resets -> Pillar 1 -> Pillar 2 -> Pillar 3
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_bell_p1_strike.effects!);
    expect(session.getFlag('ch1_bell_step_1')).toBe(true);
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_bell_strike_wrong.effects!);
    expect(session.getFlag('ch1_bell_step_1')).toBe(false);
    expect(session.getFlag('ch1_bell_step_2')).toBe(false);

    session.applyDialogueEffects(dialogueDb.dialogues.ch1_bell_p1_strike.effects!);
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_bell_p2_strike_ok.effects!);
    expect(session.getFlag('ch1_bell_step_2')).toBe(true);
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_bell_p3_strike_ok.effects!);
    expect(session.getFlag('solved_bell_sequence')).toBe(true);
    expect(session.quests.getQuestStage('quest_ch1_sunken_ruins')).toBe('completed');
    session.syncQuestProgress();
    expect(session.quests.getQuestStage('quest_ch1_bellkeeper')).toBe('started');

    // Hidden mirror cache in sunken corridors: 1 -> out of order reset -> 1 -> 2 -> 3 -> chest
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_mirror_1_align.effects!);
    expect(session.getFlag('ch1_mirror_1_aligned')).toBe(true);
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_mirror_wrong_reset.effects!);
    expect(session.getFlag('ch1_mirror_1_aligned')).toBe(false);
    expect(session.getFlag('ch1_mirror_2_aligned')).toBe(false);
    expect(session.getFlag('ch1_mirror_3_aligned')).toBe(false);

    session.applyDialogueEffects(dialogueDb.dialogues.ch1_mirror_1_align.effects!);
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_mirror_2_align_ok.effects!);
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_mirror_3_align_ok.effects!);
    expect(session.getFlag('ch1_mirror_3_aligned')).toBe(true);
    expect(
      session.applyDialogueEffects(dialogueDb.dialogues.ch1_mirror_cache_open.effects!),
    ).toEqual([{ itemId: 'tide_brass_blade', quantity: 1 }]);
    expect(
      session.applyDialogueEffects(dialogueDb.dialogues.ch1_mirror_cache_open.effects!),
    ).toEqual([]);

    // Bell Sanctum -> Release Bellkeeper -> Restore Continuum Seal
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_bellkeeper_released.effects!);
    session.applyDialogueEffects(dialogueDb.dialogues.ch1_continuum_seal_accept.effects!);
    expect(session.getFlag('learned_continuum_resonance')).toBe(true);
    expect(session.quests.getQuestStage('quest_ch1_bellkeeper')).toBe('completed');
    const sealReward = session.claimQuestRewards('quest_ch1_bellkeeper');
    expect(sealReward?.items).toEqual([{ itemId: 'continuum_seal_shard', quantity: 1 }]);
  });
});
