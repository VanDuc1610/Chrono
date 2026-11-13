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
import { pickDialogue } from '../src/world/MapRegistry';
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
      const key =
        item.type === 'document'
          ? 'satchel.tab.notes'
          : item.type === 'puzzle'
            ? 'satchel.tab.clues'
            : `satchel.type.${item.type}`;
      expect(table[key], `missing satchel string for item type ${item.type}`).toBeTruthy();
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
      'takeItems',
      'refreshMap',
      'warpTo',
      'healFull',
      'startTimer',
      'scalePut',
      'scaleReset',
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
    // Kuro is strictly forbidden from being mentioned before Chapter 4
    const preCh4Dialogues = Object.entries(dialogueDb.dialogues).filter(
      ([id]) => !id.startsWith('ch4_'),
    );
    const preCh4Quests = questDb.quests.filter((q) => q.chapter !== 4);
    const ch4ItemIds = new Set([
      'relic_dawn_blade',
      'relic_dusk_halberd',
      'relic_iron_cleaver',
      'relic_cavalry_lance',
      'grain_sack_barley',
      'grain_sack_spelt',
      'grain_sack_rye',
      'grain_sack_oats',
      'grain_sack_millet',
      'praetor_seal_impression',
      'courier_box_brass',
      'trench_medical_bandage',
      'vale_rations',
      'citadel_bread_loaf',
      'interval_lens_charm',
      'alder_signet_ring',
      'maelis_letter',
      'vanguard_scout_report',
      'bastion_supply_ledger',
      'chaplain_last_prayer',
      'courier_lost_dispatch',
      'alder_sealed_orders',
      'archon_edict_parchment',
      'parley_broken_treaty',
      'ironclad_battle_diary',
      'forgotten_soldier_dogtag',
      'relic_pedestal_rubbing',
      'scales_dedication_tablet',
      'finality_seal_shard',
      'tactician_war_map',
      'iron_citadel_key',
      'bastion_armory_key',
      'valkyrie_feather_charm',
      'eternal_watch_ring',
      'field_rations_deluxe',
      'grain_sack_standard',
      'grain_sack_rough',
      'grain_sack_coarse',
      'grain_sack_fine',
      'grain_sack_heavy',
      'relic_spear_tip',
      'relic_wide_blade',
      'relic_curved_limb',
      'relic_tattered_pole',
      'courier_journal_scrap',
      'astronomy_guide_leaflet',
      'hydraulic_manual_sheet',
      'quartermaster_ledger',
      'artillery_grid_map',
      'wind_vane_record',
      'smoke_signal_code',
      'burial_plaque_scrap',
      'bran_company_roster',
      'first_fallen_epitaph',
      'sentry_codebook_page',
      'treaty_scrap_land',
      'treaty_scrap_prisoners',
      'treaty_scrap_waters',
      'treaty_scrap_signatures',
    ]);
    const preCh4Items = itemDb.items.filter((i) => !ch4ItemIds.has(i.id));
    expect(JSON.stringify({ preCh4Dialogues, preCh4Quests, preCh4Items })).not.toMatch(/kuro/i);

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
    expect(itemDb.items.find((i) => i.id === 'unsent_fisherman_letter')?.type).toBe('document');

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

  describe('T-48 Document & Puzzle items contract', () => {
    it('ensures every document item has 1-3 pages of <= 220 characters each', () => {
      const documents = itemDb.items.filter((i) => i.type === 'document');
      expect(documents.length).toBeGreaterThanOrEqual(5);

      for (const doc of documents) {
        expect(doc.pages, `Document ${doc.id} must have pages array`).toBeDefined();
        expect(doc.pages!.length, `Document ${doc.id} pages count`).toBeGreaterThanOrEqual(1);
        expect(doc.pages!.length, `Document ${doc.id} pages count`).toBeLessThanOrEqual(3);
        for (let idx = 0; idx < doc.pages!.length; idx++) {
          const page = doc.pages![idx];
          expect(
            page.length,
            `Document ${doc.id} page ${idx + 1} exceeds 220 chars (${page.length})`,
          ).toBeLessThanOrEqual(220);
          expect(page.length, `Document ${doc.id} page ${idx + 1} is empty`).toBeGreaterThan(0);
        }
      }
    });

    it('ensures unsent_fisherman_letter is a document with 2 pages', () => {
      const letter = itemDb.items.find((i) => i.id === 'unsent_fisherman_letter');
      expect(letter).toBeDefined();
      expect(letter?.type).toBe('document');
      expect(letter?.pages?.length).toBe(2);
    });

    it('ensures all new documents are granted once via dialogue nodes', () => {
      const docIds = [
        'peter_repair_ledger',
        'torn_journal_leaf',
        'keeper_logbook_notes',
        'child_village_drawing',
        'sundial_bronze_rubbing',
      ];
      for (const id of docIds) {
        const item = itemDb.items.find((i) => i.id === id);
        expect(item, `Item ${id} must exist in items.json`).toBeDefined();
        expect(item?.type).toBe('document');

        // Check that at least one dialogue node grants it with a grantOnceFlag
        const granter = Object.values(dialogueDb.dialogues).find((n) =>
          n.effects?.grantItems?.some((g) => g.itemId === id),
        );
        expect(granter, `Document ${id} must be granted by a dialogue node`).toBeDefined();
        expect(
          granter?.effects?.grantOnceFlag,
          `Node ${granter?.id} granting ${id} must use grantOnceFlag`,
        ).toBeTruthy();
      }
    });

    it('handles bronze_bell_clapper and tide_mirror_lens puzzle flow with takeItems', () => {
      const session = GameSession.newGame(createRealDatabase());

      // 1. Bell clapper puzzle
      expect(session.inventory.hasItem('bronze_bell_clapper', 1)).toBe(false);
      const cacheGrant = session.applyDialogueEffects(
        dialogueDb.dialogues.ch1_sunken_cache.effects!,
      );
      expect(cacheGrant.some((g) => g.itemId === 'bronze_bell_clapper')).toBe(true);
      expect(session.inventory.hasItem('bronze_bell_clapper', 1)).toBe(true);

      // Duplicate grant is blocked by grantOnceFlag
      const secondCacheGrant = session.applyDialogueEffects(
        dialogueDb.dialogues.ch1_sunken_cache.effects!,
      );
      expect(secondCacheGrant).toEqual([]);

      // Install clapper at dawn pillar
      session.applyDialogueEffects(dialogueDb.dialogues.ch1_bell_p1_install.effects!);
      expect(session.inventory.hasItem('bronze_bell_clapper', 1)).toBe(false);
      expect(session.getFlag('ch1_bell_clapper_set')).toBe(true);
      expect(session.getFlag('ch1_bell_step_1')).toBe(true);

      // 2. Tide mirror lens puzzle
      expect(session.inventory.hasItem('tide_mirror_lens', 1)).toBe(false);
      const watchCaseGrant = session.applyDialogueEffects(
        dialogueDb.dialogues.ch1_unnamed_watch_case.effects!,
      );
      expect(watchCaseGrant.some((g) => g.itemId === 'tide_mirror_lens')).toBe(true);
      expect(session.inventory.hasItem('tide_mirror_lens', 1)).toBe(true);

      // Duplicate grant blocked
      const secondWatchCaseGrant = session.applyDialogueEffects(
        dialogueDb.dialogues.ch1_unnamed_watch_case.effects!,
      );
      expect(secondWatchCaseGrant).toEqual([]);

      // Fit lens onto mirror 1
      session.applyDialogueEffects(dialogueDb.dialogues.ch1_mirror_1_fit_lens.effects!);
      expect(session.inventory.hasItem('tide_mirror_lens', 1)).toBe(false);
      expect(session.getFlag('ch1_mirror_1_lens_set')).toBe(true);
      expect(session.getFlag('ch1_mirror_1_aligned')).toBe(true);
    });

    it('routes the dawn pillar and mirror 1 by puzzle item (maps.json rules)', () => {
      const ruins = (mapsJson as unknown as MapDatabase).maps.map_ch1_sunken_corridors;
      const poi = (id: string) => ruins.interactables!.find((i) => i.id === id)!;
      const pick = (id: string, flags: string[], items: string[]): string =>
        pickDialogue(poi(id).dialogueId, poi(id).dialogueRules, {
          isQuestCompleted: () => false,
          getFlag: (f) => flags.includes(f),
          hasItem: (i) => items.includes(i),
        });
      expect(pick('poi_chime_pillar_1', [], [])).toBe('ch1_bell_p1_needs_clapper');
      expect(pick('poi_chime_pillar_1', [], ['bronze_bell_clapper'])).toBe('ch1_bell_p1_install');
      expect(pick('poi_chime_pillar_1', ['ch1_bell_clapper_set'], [])).toBe('ch1_bell_p1_ready');
      expect(pick('poi_mirror_1', [], [])).toBe('ch1_mirror_1_missing_lens');
      expect(pick('poi_mirror_1', [], ['tide_mirror_lens'])).toBe('ch1_mirror_1_fit_lens');
      expect(pick('poi_mirror_1', ['ch1_mirror_1_lens_set'], [])).toBe('ch1_mirror_1_ready');
      // Saves that opened the cache before the clapper existed can still get it.
      expect(pick('poi_sunken_cache', ['granted_sunken_cache'], [])).toBe(
        'ch1_sunken_cache_clapper',
      );
      expect(pick('poi_sunken_cache', ['granted_sunken_cache', 'ch1_bell_clapper_set'], [])).toBe(
        'ch1_sunken_cache_empty',
      );
    });
  });

  describe('Chapter 2 Content Data Integrity (dialogue.json, quests.json, items.json)', () => {
    it('defines all 9 Chapter 2 items with correct types, stats, and document page limits', () => {
      const items = itemDb.items;
      const find = (id: string) => items.find((i) => i.id === id);

      const diary = find('praetor_diary_page');
      expect(diary).toBeDefined();
      expect(diary?.type).toBe('document');
      expect(diary?.pages?.length).toBe(2);
      for (const page of diary?.pages ?? []) {
        expect(page.length).toBeLessThanOrEqual(220);
        expect(page.length).toBeGreaterThan(0);
      }

      const edict = find('edict_law_404');
      expect(edict).toBeDefined();
      expect(edict?.type).toBe('document');
      expect(edict?.pages?.length).toBe(1);
      expect(edict?.pages?.[0].length).toBeLessThanOrEqual(220);

      expect(find('bronze_key_blank')?.type).toBe('puzzle');
      expect(find('praetor_chisel_stylus')?.type).toBe('puzzle');
      expect(find('blank_unwritten_parchment')?.type).toBe('puzzle');

      const rapier = find('praetor_iron_rapier');
      expect(rapier).toBeDefined();
      expect(rapier?.type).toBe('weapon');
      expect(rapier?.equip?.attack).toBe(8);
      expect(rapier?.equip?.reach).toBe(36);
      expect(rapier?.equip?.swingMs).toBe(340);

      const charm = find('scales_of_truth_charm');
      expect(charm).toBeDefined();
      expect(charm?.type).toBe('charm');
      expect(charm?.equip?.maxHp).toBe(16);
      expect(charm?.equip?.maxMp).toBe(8);
      expect(charm?.equip?.defense).toBe(2);
      expect(charm?.equip?.speed).toBe(2);

      const bread = find('imperial_honey_bread');
      expect(bread).toBeDefined();
      expect(bread?.type).toBe('consumable');
      expect(bread?.effects?.healAmount).toBe(60);

      expect(find('causality_seal_shard')?.type).toBe('key_item');
    });

    it('verifies all Chapter 2 dialogue node ids from contract §11.3 exist and have <= 2 responses', () => {
      const contractIds = [
        // Outskirts
        'ch2_outskirts_arrival',
        'ch2_elder_echo_farewell',
        'ch2_edict_stele_read',
        'ch2_hatch_locked',
        'ch2_hatch_open',
        // Catacombs
        'ch2_lyra_cornered',
        'ch2_lyra_rescued',
        'ch2_locksmith_box',
        'ch2_praetor_diary_found',
        'ch2_alcove_empty',
        'ch2_alcove_place_blank',
        'ch2_gate_ancient_locked',
        'ch2_gate_blank_too_new',
        'ch2_gate_opens',
        'ch2_tomb_1',
        'ch2_tomb_2',
        'ch2_tomb_3',
        'ch2_tomb_wrong',
        'ch2_tomb_correct',
        'ch2_tomb_empty',
        // Plaza
        'ch2_plaza_arrival',
        'ch2_praetor_meet',
        'ch2_praetor_after',
        'ch2_praetor_desk',
        'ch2_baker_start',
        'ch2_baker_comfort',
        'ch2_baker_done',
        'ch2_automaton_inspect',
        'ch2_automaton_resolve',
        'ch2_automaton_done',
        'ch2_scales_inspect',
        'ch2_scales_heavy',
        'ch2_scales_balanced',
        'ch2_scales_done',
        'ch2_execution_platform',
        'ch2_archives_gate_locked',
        // Archives
        'ch2_archives_arrival',
        'ch2_peter_record',
        'ch2_rebellion_records',
        'ch2_tablet_inspect',
        'ch2_tablet_choose_a',
        'ch2_tablet_choose_b',
        'ch2_tablet_wrong_name',
        'ch2_tablet_wrong_crime',
        'ch2_tablet_expunged',
        'ch2_barrier_guilt_repel',
        // Sanctum
        'ch2_verdict_boss_confront',
        'ch2_verdict_released',
        'ch2_seal_restored',
      ];

      for (const id of contractIds) {
        const node = dialogueDb.dialogues[id];
        expect(node, `Dialogue node ${id} must exist`).toBeDefined();
        expect((node.responses ?? []).length).toBeLessThanOrEqual(2);
        for (const line of node.lines) {
          expect(line.length, `Line in ${id} exceeds 220 chars: "${line}"`).toBeLessThanOrEqual(
            220,
          );
        }
      }
    });

    it('runs through Chapter 2 puzzle flows (alcove, tomb, scales, verdict tablet) with GameSession', () => {
      const session = GameSession.newGame(createRealDatabase());

      // 1. Alcove retroactive key puzzle
      expect(session.inventory.hasItem('bronze_key_blank', 1)).toBe(false);
      const keyGrant = session.applyDialogueEffects(
        dialogueDb.dialogues.ch2_locksmith_box.effects!,
      );
      expect(keyGrant.some((g) => g.itemId === 'bronze_key_blank')).toBe(true);
      expect(session.inventory.hasItem('bronze_key_blank', 1)).toBe(true);

      session.applyDialogueEffects(dialogueDb.dialogues.ch2_alcove_place_blank.effects!);
      expect(session.inventory.hasItem('bronze_key_blank', 1)).toBe(false);
      expect(session.getFlag('placed_retroactive_key')).toBe(true);

      session.applyDialogueEffects(dialogueDb.dialogues.ch2_gate_opens.effects!);
      expect(session.getFlag('unlocked_catacomb_gate')).toBe(true);

      // 2. Tomb puzzle (Tomb 2 is correct, sentenced before birth)
      const tombGrant = session.applyDialogueEffects(
        dialogueDb.dialogues.ch2_tomb_correct.effects!,
      );
      expect(tombGrant.some((g) => g.itemId === 'praetor_iron_rapier')).toBe(true);
      expect(session.inventory.hasItem('praetor_iron_rapier', 1)).toBe(true);
      expect(session.getFlag('opened_praetor_tomb')).toBe(true);
      // Duplicate grant blocked by grantOnceFlag
      expect(session.applyDialogueEffects(dialogueDb.dialogues.ch2_tomb_correct.effects!)).toEqual(
        [],
      );

      // 3. Scales of Truth puzzle
      const deskGrant = session.applyDialogueEffects(
        dialogueDb.dialogues.ch2_rebellion_records.effects!,
      );
      expect(deskGrant.some((g) => g.itemId === 'blank_unwritten_parchment')).toBe(true);
      expect(session.inventory.hasItem('blank_unwritten_parchment', 1)).toBe(true);

      const scalesGrant = session.applyDialogueEffects(
        dialogueDb.dialogues.ch2_scales_balanced.effects!,
      );
      expect(session.inventory.hasItem('blank_unwritten_parchment', 1)).toBe(false);
      expect(scalesGrant.some((g) => g.itemId === 'scales_of_truth_charm')).toBe(true);
      expect(session.inventory.hasItem('scales_of_truth_charm', 1)).toBe(true);
      expect(session.getFlag('solved_scales_puzzle')).toBe(true);

      // 4. Verdict tablet puzzle (requires praetor stylus to expunge cause)
      const praetorGrant = session.applyDialogueEffects(
        dialogueDb.dialogues.ch2_praetor_meet.effects!,
      );
      expect(praetorGrant.some((g) => g.itemId === 'praetor_chisel_stylus')).toBe(true);
      expect(session.inventory.hasItem('praetor_chisel_stylus', 1)).toBe(true);
      expect(session.getFlag('has_praetor_pass')).toBe(true);

      // Wrong lines set flags but do not expunge
      session.applyDialogueEffects(dialogueDb.dialogues.ch2_tablet_wrong_name.effects!);
      expect(session.getFlag('ch2_tablet_wrong_name')).toBe(true);
      expect(session.getFlag('expunged_peter_verdict')).toBe(false);

      session.applyDialogueEffects(dialogueDb.dialogues.ch2_tablet_wrong_crime.effects!);
      expect(session.getFlag('ch2_tablet_wrong_crime')).toBe(true);
      expect(session.getFlag('expunged_peter_verdict')).toBe(false);

      // Correct line 3 expunges verdict and takes stylus
      session.applyDialogueEffects(dialogueDb.dialogues.ch2_tablet_expunged.effects!);
      expect(session.inventory.hasItem('praetor_chisel_stylus', 1)).toBe(false);
      expect(session.getFlag('expunged_peter_verdict')).toBe(true);

      // 5. Seal restoration and endChapter 2
      session.applyDialogueEffects(dialogueDb.dialogues.ch2_seal_restored.effects!);
      expect(session.getFlag('causality_seal_restored')).toBe(true);
      expect(session.getFlag('learned_causality_resonance')).toBe(true);
    });
  });

  describe('Chapter 3 Content Data Integrity (dialogue.json, quests.json, items.json)', () => {
    it('verifies Chapter 3 items definitions, document page length constraints and stats', () => {
      const find = (id: string) => itemDb.items.find((i) => i.id === id);

      // Weapon
      const rapier = find('memory_needle_rapier');
      expect(rapier).toBeDefined();
      expect(rapier?.type).toBe('weapon');
      expect(rapier?.equip?.attack).toBe(11);
      expect(rapier?.equip?.reach).toBe(38);
      expect(rapier?.equip?.swingMs).toBe(330);

      // Charm
      const charm = find('pure_crystal_soul_charm');
      expect(charm).toBeDefined();
      expect(charm?.type).toBe('charm');
      expect(charm?.equip?.maxHp).toBe(22);
      expect(charm?.equip?.maxMp).toBe(12);
      expect(charm?.equip?.defense).toBe(3);
      expect(charm?.equip?.speed).toBe(2);

      // Consumables
      const shard = find('refined_chrono_shard');
      expect(shard).toBeDefined();
      expect(shard?.type).toBe('consumable');
      expect(shard?.effects?.healAmount).toBe(120);

      const ink = find('memory_ink_flask');
      expect(ink).toBeDefined();
      expect(ink?.type).toBe('consumable');
      expect(ink?.effects?.healAmount).toBe(80);
      expect(ink?.effects?.mpAmount).toBe(20);

      // Key items & puzzle items
      expect(find('memory_seal_shard')?.type).toBe('key_item');
      expect(find('royal_seal_crest')?.type).toBe('key_item');
      expect(find('ancient_carving_chisel')?.type).toBe('puzzle');
      expect(find('queen_ribbon_item')?.type).toBe('puzzle');
      expect(find('pigment_ochre_yellow')?.type).toBe('puzzle');
      expect(find('pigment_lapis_blue')?.type).toBe('puzzle');
      expect(find('pigment_sulfur_red')?.type).toBe('puzzle');
      expect(find('forgotten_vault_key')?.type).toBe('puzzle');
      expect(find('memory_ember')?.type).toBe('puzzle');
      expect(find('ancient_amber_resin')?.type).toBe('material');

      // Documents: all pages <= 220 chars
      const docIds = [
        'sculptor_apprentice_diary',
        'sculptor_tax_receipt',
        'censor_blacklist_doc',
        'court_timeline_doc',
        'royal_dispatch_log',
        'lost_lullaby_lyrics',
        'court_painter_note',
        'miner_hymn_scrap',
        'miner_geological_chart',
        'acoustic_manual_page',
      ];

      for (const id of docIds) {
        const doc = find(id);
        expect(doc, `Document ${id} must exist`).toBeDefined();
        expect(doc?.type).toBe('document');
        expect(doc?.pages?.length).toBeGreaterThan(0);
        for (const page of doc?.pages ?? []) {
          expect(
            page.length,
            `Page in document ${id} exceeds 220 chars (${page.length}): "${page}"`,
          ).toBeLessThanOrEqual(220);
        }
      }
    });

    it('verifies all Chapter 3 quest definitions and objectives wiring', () => {
      const chapter3QuestIds = [
        'quest_ch3_sepulcher_gate',
        'quest_ch3_nameless_archivist',
        'quest_ch3_echoing_vaults',
        'quest_ch3_faceless_trial',
        'quest_ch3_archive_censorship',
        'quest_ch3_king_dilemma',
        'quest_ch3_nameless_choir',
        'quest_ch3_lost_lullaby',
        'quest_ch3_shattered_portrait',
        'quest_ch3_forgotten_craftsman',
      ];

      for (const qid of chapter3QuestIds) {
        const q = questDb.quests.find((item) => item.id === qid);
        expect(q, `Quest ${qid} must exist in quests.json`).toBeDefined();
        expect(q?.objectives.length).toBeGreaterThan(0);
        for (const obj of q?.objectives ?? []) {
          expect(obj.completeOnFlag, `Objective ${obj.id} must have completeOnFlag`).toBeDefined();
        }
      }

      // Verify Chapter 2 leads into Chapter 3
      const ch2Verdict = questDb.quests.find((q) => q.id === 'quest_ch2_imperial_verdict');
      expect(ch2Verdict?.followUpQuestId).toBe('quest_ch3_sepulcher_gate');
    });

    it('verifies all Chapter 3 dialogue node ids exist, have <= 2 responses and lines <= 220 chars', () => {
      const ch3NodeIds = [
        // Map 1: Sepulcher Gate
        'ch3_gate_arrival',
        'ch3_elder_echo_farewell',
        'ch3_elder_farewell_reply',
        'ch3_sepulcher_gate_locked',
        'ch3_sepulcher_gate_open',
        'ch3_memory_crystal_whisper',
        // Map 2: Silent Necropolis
        'ch3_neris_cornered',
        'ch3_neris_rescued',
        'ch3_neris_rescued_name',
        'ch3_neris_rescued_door',
        'ch3_neris_necropolis_hint',
        'ch3_urn_clue_read',
        'ch3_tax_receipt_read',
        'ch3_regions_stele_read',
        'ch3_tomb_owl_inspect',
        'ch3_tomb_willow_ii_inspect',
        'ch3_tomb_willow_inspect',
        'ch3_tomb_almond_inspect',
        'ch3_tomb_turtle_inspect',
        'ch3_tomb_wrong_fog',
        'ch3_tomb_willow_open',
        'ch3_hall_gate_locked',
        'ch3_hall_gate_opens',
        'ch3_secret_vault_locked',
        'ch3_secret_vault_opens',
        'ch3_pigment_yellow_take',
        // Map 3: Hall of Echoes
        'ch3_echoes_arrival',
        'ch3_acoustic_manual_read',
        'ch3_pillar_left_inspect',
        'ch3_pillar_right_inspect',
        'ch3_pillar_resonance_success',
        'ch3_vault_stairs_locked',
        // Map 4: Memory Vaults
        'ch3_vaults_arrival',
        'ch3_hymn_scrap_read',
        'ch3_geological_chart_read',
        'ch3_echo_bell_iron',
        'ch3_echo_bell_silver',
        'ch3_echo_bell_copper',
        'ch3_abyss_fall',
        'ch3_faceless_keeper_confront',
        'ch3_faceless_keeper_defeated',
        'ch3_archive_ascent_locked',
        'ch3_lullaby_crystal_listen',
        'ch3_ember_take',
        'ch3_forge_cold',
        'ch3_forge_rekindled',
        // Map 5: Great Archive
        'ch3_archives_arrival',
        'ch3_neris_archive_talk',
        'ch3_blacklist_scroll_read',
        'ch3_court_timeline_read',
        'ch3_censorship_console_inspect',
        'ch3_console_choose_a',
        'ch3_console_choose_b',
        'ch3_console_choose_c',
        'ch3_censorship_wrong',
        'ch3_censorship_success',
        'ch3_royal_mausoleum_sealed',
        'ch3_pigment_blue_take',
        'ch3_portrait_piece_1',
        'ch3_portrait_piece_2',
        'ch3_portrait_piece_3',
        'ch3_ghost_librarian_start',
        'ch3_ghost_librarian_done',
        'ch3_ghost_knight_start',
        'ch3_ghost_knight_done',
        // Map 6: Royal Mausoleum
        'ch3_mausoleum_arrival',
        'ch3_amnesiac_king_despair',
        'ch3_king_doubt',
        'ch3_queen_ribbon_take',
        'ch3_royal_dispatch_read',
        'ch3_king_confront',
        'ch3_king_cleared',
        'ch3_sanctum_door_locked',
        'ch3_sanctum_door_opens',
        'ch3_painter_note_read',
        'ch3_pigment_red_take',
        'ch3_canvas_inspect',
        'ch3_canvas_layer_1',
        'ch3_canvas_layer_2',
        'ch3_canvas_layer_3',
        'ch3_canvas_wrong',
        'ch3_canvas_restored',
        // Map 7: Choir Sanctum
        'ch3_choir_boss_confront',
        'ch3_choir_boss_reply',
        'ch3_choir_boss_defeated',
        'ch3_seal_restored',
        // Map 8: Forgotten Vault
        'ch3_forgotten_vault_arrival',
        'ch3_needle_box_inspect',
        'ch3_box_beat_1',
        'ch3_box_beat_2',
        'ch3_box_beat_3',
        'ch3_box_beat_4',
        'ch3_box_beat_5',
        'ch3_box_wrong',
        'ch3_needle_box_open',
        'ch3_unwritten_monument_whisper',
      ];

      for (const id of ch3NodeIds) {
        const node = dialogueDb.dialogues[id];
        expect(node, `Dialogue node ${id} must exist in dialogue.json`).toBeDefined();
        expect(
          (node.responses ?? []).length,
          `Dialogue node ${id} must have at most 2 responses`,
        ).toBeLessThanOrEqual(2);
        for (const line of node.lines) {
          expect(line.length, `Line in ${id} exceeds 220 chars: "${line}"`).toBeLessThanOrEqual(
            220,
          );
        }
      }
    });

    it('runs through Chapter 3 puzzle flows (sculptor tomb, bell bridge timer, censorship console, King Alden, canvas, music box) with GameSession', () => {
      const session = GameSession.newGame(createRealDatabase());

      // 1. Sculptor tomb & hall gate opening
      expect(session.inventory.hasItem('ancient_carving_chisel', 1)).toBe(false);
      const tombGrant = session.applyDialogueEffects(
        dialogueDb.dialogues.ch3_tomb_willow_open.effects!,
      );
      expect(tombGrant.some((g) => g.itemId === 'ancient_carving_chisel')).toBe(true);
      expect(session.inventory.hasItem('ancient_carving_chisel', 1)).toBe(true);
      expect(session.getFlag('solved_sculptor_tomb')).toBe(true);

      session.applyDialogueEffects(dialogueDb.dialogues.ch3_hall_gate_opens.effects!);
      expect(session.inventory.hasItem('ancient_carving_chisel', 1)).toBe(false);
      expect(session.getFlag('opened_hall_gate')).toBe(true);

      // 2. Bell bridge timer
      const bellEffects = dialogueDb.dialogues.ch3_echo_bell_copper.effects!;
      expect(bellEffects.startTimer).toEqual({ flag: 'ch3_bridge_up', ms: 8000 });
      session.applyDialogueEffects(bellEffects);
      // The bell only raises the bridge; reaching the far bank (map trigger) marks the crossing.
      expect(session.getFlag('crossed_memory_abyss')).toBe(false);
      session.applyDialogueEffects(dialogueDb.dialogues.ch3_abyss_crossed.effects!);
      expect(session.getFlag('crossed_memory_abyss')).toBe(true);

      // 3. Censorship console puzzle (Wolf is correct)
      session.applyDialogueEffects(dialogueDb.dialogues.ch3_censorship_success.effects!);
      expect(session.getFlag('solved_censorship_ledger')).toBe(true);

      // 4. King Alden dilemma
      session.applyDialogueEffects(dialogueDb.dialogues.ch3_queen_ribbon_take.effects!);
      expect(session.inventory.hasItem('queen_ribbon_item', 1)).toBe(true);

      session.applyDialogueEffects(dialogueDb.dialogues.ch3_royal_dispatch_read.effects!);
      expect(session.getFlag('read_royal_dispatch')).toBe(true);

      const kingGrant = session.applyDialogueEffects(
        dialogueDb.dialogues.ch3_king_cleared.effects!,
      );
      expect(session.inventory.hasItem('queen_ribbon_item', 1)).toBe(false);
      expect(kingGrant.some((g) => g.itemId === 'royal_seal_crest')).toBe(true);
      expect(session.inventory.hasItem('royal_seal_crest', 1)).toBe(true);
      expect(session.getFlag('cleared_king_despair')).toBe(true);

      // 5. Queen canvas restoration (Hidden charm)
      session.applyDialogueEffects(dialogueDb.dialogues.ch3_pigment_yellow_take.effects!);
      session.applyDialogueEffects(dialogueDb.dialogues.ch3_pigment_blue_take.effects!);
      session.applyDialogueEffects(dialogueDb.dialogues.ch3_pigment_red_take.effects!);
      expect(session.inventory.hasItem('pigment_ochre_yellow', 1)).toBe(true);
      expect(session.inventory.hasItem('pigment_lapis_blue', 1)).toBe(true);
      expect(session.inventory.hasItem('pigment_sulfur_red', 1)).toBe(true);

      const charmGrant = session.applyDialogueEffects(
        dialogueDb.dialogues.ch3_canvas_restored.effects!,
      );
      expect(session.inventory.hasItem('pigment_ochre_yellow', 1)).toBe(false);
      expect(session.inventory.hasItem('pigment_lapis_blue', 1)).toBe(false);
      expect(session.inventory.hasItem('pigment_sulfur_red', 1)).toBe(false);
      expect(charmGrant.some((g) => g.itemId === 'pure_crystal_soul_charm')).toBe(true);
      expect(session.inventory.hasItem('pure_crystal_soul_charm', 1)).toBe(true);
      expect(session.getFlag('restored_queen_canvas')).toBe(true);

      // 6. Music box rhythm beats (Hidden weapon)
      const rapierGrant = session.applyDialogueEffects(
        dialogueDb.dialogues.ch3_needle_box_open.effects!,
      );
      expect(rapierGrant.some((g) => g.itemId === 'memory_needle_rapier')).toBe(true);
      expect(session.inventory.hasItem('memory_needle_rapier', 1)).toBe(true);
      expect(session.getFlag('opened_memory_needle_box')).toBe(true);

      // 7. Memory Seal restoration and Chapter 3 finale
      session.applyDialogueEffects(dialogueDb.dialogues.ch3_seal_restored.effects!);
      expect(session.getFlag('memory_seal_restored')).toBe(true);
      expect(session.getFlag('learned_memory_resonance')).toBe(true);
    });
  });

  describe('Chapter 4 Content Data Integrity (dialogue.json, quests.json, items.json)', () => {
    it('verifies Chapter 4 items definitions, document page length constraints and stats', () => {
      const find = (id: string) => itemDb.items.find((i) => i.id === id);

      // Weapons
      const spear = find('spear_of_finality');
      expect(spear).toBeDefined();
      expect(spear?.type).toBe('weapon');
      expect(spear?.equip?.attack).toBe(14);
      expect(spear?.equip?.reach).toBe(46);
      expect(spear?.equip?.swingMs).toBe(400);

      const vowBlade = find('vow_of_the_father_blade');
      expect(vowBlade).toBeDefined();
      expect(vowBlade?.type).toBe('weapon');
      expect(vowBlade?.equip?.attack).toBe(13);
      expect(vowBlade?.equip?.reach).toBe(38);
      expect(vowBlade?.equip?.swingMs).toBe(300);

      // Charms
      const cuirass = find('valiant_crest_cuirass');
      expect(cuirass?.type).toBe('charm');
      expect(cuirass?.equip?.defense).toBe(6);
      expect(cuirass?.equip?.maxHp).toBe(35);

      const peaceCharm = find('ashes_of_peace_charm');
      expect(peaceCharm?.type).toBe('charm');
      expect(peaceCharm?.equip?.maxHp).toBe(34);
      expect(peaceCharm?.equip?.defense).toBe(5);

      const dreamless = find('dreamless_rest_charm');
      expect(dreamless?.type).toBe('charm');
      expect(dreamless?.equip?.maxMp).toBe(20);
      expect(dreamless?.equip?.defense).toBe(2);
      expect(dreamless?.equip?.speed).toBe(3);

      const motherCarving = find('mothers_name_carving');
      expect(motherCarving?.type).toBe('charm');
      expect(motherCarving?.equip?.attack).toBe(3);
      expect(motherCarving?.equip?.maxHp).toBe(20);

      const quill = find('ember_quill_charm');
      expect(quill?.type).toBe('charm');
      expect(quill?.equip?.maxMp).toBe(16);
      expect(quill?.equip?.attack).toBe(2);
      expect(quill?.equip?.speed).toBe(2);

      const atonement = find('atonement_chronicle');
      expect(atonement?.type).toBe('charm');
      expect(atonement?.equip?.maxHp).toBe(24);
      expect(atonement?.equip?.defense).toBe(4);

      const lens = find('interval_lens_charm');
      expect(lens?.type).toBe('charm');
      expect(lens?.equip?.maxHp).toBe(26);
      expect(lens?.equip?.maxMp).toBe(14);
      expect(lens?.equip?.defense).toBe(4);
      expect(lens?.equip?.speed).toBe(2);

      const lastLight = find('last_light_charm');
      expect(lastLight?.type).toBe('charm');
      expect(lastLight?.equip?.maxHp).toBe(30);
      expect(lastLight?.equip?.maxMp).toBe(16);
      expect(lastLight?.equip?.defense).toBe(4);
      expect(lastLight?.equip?.speed).toBe(3);

      // Consumables & Key items
      const draught = find('phoenix_draught');
      expect(draught?.type).toBe('consumable');
      expect(draught?.effects?.healAmount).toBe(999);
      expect(draught?.effects?.mpAmount).toBe(999);

      expect(find('finality_seal_shard')?.type).toBe('key_item');

      // Puzzles: sacks & relics (ensure neutral descriptions without mass/branch names)
      const neutralPuzzles = [
        'sack_grain',
        'sack_herbs',
        'sack_sulfur',
        'relic_long_haft',
        'relic_wide_blade',
        'relic_curved_limb',
        'relic_tattered_pole',
        'maelis_letter',
      ];
      for (const id of neutralPuzzles) {
        const item = find(id);
        expect(item, `Item ${id} must exist as puzzle`).toBeDefined();
        expect(item?.type).toBe('puzzle');
      }

      // Documents: all pages <= 220 chars
      const ch4DocIds = [
        'courier_journal_scrap',
        'astronomy_guide_leaflet',
        'hydraulic_manual_sheet',
        'quartermaster_ledger',
        'artillery_grid_map',
        'wind_vane_record',
        'smoke_signal_code',
        'burial_plaque_scrap',
        'bran_company_roster',
        'first_fallen_epitaph',
        'sentry_codebook_page',
        'treaty_scrap_land',
        'treaty_scrap_prisoners',
        'treaty_scrap_waters',
        'treaty_scrap_signatures',
      ];

      for (const id of ch4DocIds) {
        const doc = find(id);
        expect(doc, `Document ${id} must exist`).toBeDefined();
        expect(doc?.type).toBe('document');
        expect(doc?.pages?.length).toBeGreaterThan(0);
        for (const page of doc?.pages ?? []) {
          expect(
            page.length,
            `Page in document ${id} exceeds 220 chars (${page.length}): "${page}"`,
          ).toBeLessThanOrEqual(220);
        }
      }
    });

    it('verifies all Chapter 4 quest definitions, kind, chapter tag, and objectives wiring', () => {
      const chapter4QuestIds = [
        'quest_ch4_vale_of_banners',
        'quest_ch4_letter_unsent',
        'quest_ch4_arrow_storm',
        'quest_ch4_crimson_standard',
        'quest_ch4_broken_peace',
        'quest_ch4_the_last_war',
        'quest_ch4_soldier_count',
        'quest_ch4_first_fallen',
        'quest_ch4_last_sentry',
      ];

      for (const qid of chapter4QuestIds) {
        const q = questDb.quests.find((item) => item.id === qid);
        expect(q, `Quest ${qid} must exist in quests.json`).toBeDefined();
        expect(q?.kind, `Quest ${qid} must have kind main or side`).toMatch(/^(main|side)$/);
        expect(q?.chapter, `Quest ${qid} must belong to chapter 4`).toBe(4);
        expect(q?.objectives.length).toBeGreaterThan(0);
        for (const obj of q?.objectives ?? []) {
          expect(obj.completeOnFlag, `Objective ${obj.id} must have completeOnFlag`).toBeDefined();
        }
      }

      // Verify Chapter 3 leads into Chapter 4
      const ch3Choir = questDb.quests.find((q) => q.id === 'quest_ch3_nameless_choir');
      expect(ch3Choir?.followUpQuestId).toBe('quest_ch4_vale_of_banners');
    });

    it('verifies all Chapter 4 dialogue node ids exist, have <= 2 responses, lines <= 220 chars and valid speakers on flashbacks', () => {
      const ch4NodeIds = [
        // Map 1: Encampment Veridia
        'ch4_elder_echo_gate',
        'ch4_aldric_intro',
        'ch4_aldric_intro_a',
        'ch4_aldric_intro_b',
        'ch4_aldric_talk_repeat',
        'ch4_soldier_bran_intro',
        'ch4_soldier_bran_intro_reply',
        'ch4_courier_box_inspect',
        'ch4_courier_box_wrong',
        'ch4_courier_box_solve',
        'ch4_flashback_attic_rain',
        // Map 2: Trench Crossroads
        'ch4_trench_arrival',
        'ch4_hydraulic_door_inspect',
        'ch4_scale_left_menu',
        'ch4_scale_left_more',
        'ch4_scale_left_grain',
        'ch4_scale_left_herbs',
        'ch4_scale_left_sulfur',
        'ch4_scale_right_menu',
        'ch4_scale_right_more',
        'ch4_scale_right_grain',
        'ch4_scale_right_herbs',
        'ch4_scale_right_sulfur',
        'ch4_scale_reset_node',
        'ch4_hydraulic_door_balanced',
        'ch4_hydraulic_door_overload',
        // Map 3: Encampment Sol-Karis
        'ch4_kaelen_intro',
        'ch4_kaelen_cold',
        'ch4_waters_rubble_find',
        'ch4_kaelen_confront',
        'ch4_chronicler_elion_intro',
        'ch4_elion_talk',
        'ch4_elion_confession',
        'ch4_elion_choice',
        'ch4_elion_burn',
        'ch4_elion_chronicle',
        // Map 4: Arrow Storm Valley
        'ch4_arrow_storm_warning',
        'ch4_beacon_tower_inspect',
        'ch4_beacon_tower_align',
        'ch4_beacon_tower_wrong',
        'ch4_flashback_bread_correction',
        // Map 5: Red Ridge Battlefield
        'ch4_red_ridge_arrival',
        'ch4_mound_north',
        'ch4_mound_east',
        'ch4_mound_west',
        'ch4_mound_center',
        'ch4_mounds_wrong',
        'ch4_banner_ward_broken',
        // Map 6: Crimson Redoubt
        'ch4_crimson_standard_confront',
        'ch4_crimson_standard_defeated',
        // Map 7: Fallen Ramparts
        'ch4_ramparts_ambush_cleared',
        'ch4_renard_betrayal',
        'ch4_renard_confession',
        'ch4_flashback_cliff_vow',
        'ch4_bran_choice',
        'ch4_bran_release',
        'ch4_bran_memorial',
        // Map 8: Ash Plains
        'ch4_ash_plains_arrival',
        'ch4_treaty_scrap_find',
        'ch4_treaty_scrap_prisoners_find',
        'ch4_chariot_passage',
        // Map 9: Monument of the Fallen
        'ch4_monument_altar_inspect',
        'ch4_treaty_puzzle_solve',
        'ch4_treaty_wrong',
        'ch4_flashback_cataclysm_eve',
        'ch4_aldric_kaelen_reunion',
        'ch4_aldric_truth',
        'ch4_aldric_comfort',
        // Map 10: Sanctum of Finality
        'ch4_last_war_boss_confront',
        'ch4_last_war_boss_reply',
        'ch4_ritual_pillar_1',
        'ch4_ritual_pillar_2',
        'ch4_ritual_pillar_3',
        'ch4_last_war_boss_defeated',
        'ch4_finality_seal_restored',
        // Map 11: Interval Sanctuary (Kuro)
        'ch4_kuro_direct_meeting',
        'ch4_kuro_direct_meeting_reply',
        'ch4_kuro_disappears',
        'ch4_chapter_end',
        // Map 12: Tomb of the First Fallen
        'ch4_tomb_first_fallen_inspect',
        'ch4_tomb_first_fallen_wrong',
        'ch4_tomb_first_fallen_open',
        // Map 13: Sentry Cellar
        'ch4_sentry_challenge',
        'ch4_sentry_wrong',
        'ch4_sentry_answered',
      ];

      const rawDialogues = dialogueJson.dialogues as Record<
        string,
        {
          speaker: string;
          flashback?: boolean;
          lines: string[];
          responses?: unknown[];
          effects?: { grantItems?: unknown[]; grantOnceFlag?: string };
        }
      >;

      for (const id of ch4NodeIds) {
        const node = rawDialogues[id];
        expect(node, `Dialogue node ${id} must exist in dialogue.json`).toBeDefined();
        expect(
          (node.responses ?? []).length,
          `Dialogue node ${id} must have at most 2 responses`,
        ).toBeLessThanOrEqual(2);
        for (const line of node.lines) {
          expect(line.length, `Line in ${id} exceeds 220 chars: "${line}"`).toBeLessThanOrEqual(
            220,
          );
        }
        if (node.flashback) {
          expect(node.speaker, `Flashback node ${id} must have a speaker`).toBeTruthy();
        }
        if (node.effects?.grantItems && node.effects.grantItems.length > 0) {
          expect(
            node.effects.grantOnceFlag,
            `Node ${id} with grantItems must have grantOnceFlag`,
          ).toBeTruthy();
        }
      }

      // Kuro scene contains exact canonical dialogue lines
      expect(rawDialogues.ch4_kuro_direct_meeting.lines[0]).toBe(
        'Mày vẫn còn giữ thói quen tìm kiếm những thứ đã biến mất à?',
      );
      expect(rawDialogues.ch4_kuro_direct_meeting_reply.lines[1]).toBe(
        'Mày đã hứa sẽ không quên tao.',
      );
    });

    it('runs through Chapter 4 puzzle and choice flows with GameSession', () => {
      const session = GameSession.newGame(createRealDatabase());

      // 1. Courier box solves and grants maelis_letter
      const courierGrant = session.applyDialogueEffects(
        dialogueDb.dialogues.ch4_courier_box_solve.effects!,
      );
      expect(courierGrant.some((g) => g.itemId === 'maelis_letter')).toBe(true);
      expect(session.inventory.hasItem('maelis_letter', 1)).toBe(true);
      expect(session.getFlag('opened_courier_box')).toBe(true);

      // 2. Hydraulic balanced vs overload
      const sessionA = GameSession.newGame(createRealDatabase());
      const balancedGrant = sessionA.applyDialogueEffects(
        dialogueDb.dialogues.ch4_hydraulic_door_balanced.effects!,
      );
      expect(balancedGrant.some((g) => g.itemId === 'phoenix_draught')).toBe(true);
      expect(sessionA.getFlag('solved_hydraulic_balanced')).toBe(true);
      expect(sessionA.getFlag('reached_solkaris')).toBe(true);

      const sessionB = GameSession.newGame(createRealDatabase());
      const overloadGrant = sessionB.applyDialogueEffects(
        dialogueDb.dialogues.ch4_hydraulic_door_overload.effects!,
      );
      expect(overloadGrant.some((g) => g.itemId === 'valiant_crest_cuirass')).toBe(true);
      expect(sessionB.getFlag('solved_hydraulic_overload')).toBe(true);
      expect(sessionB.getFlag('ch4_solkaris_store_lost')).toBe(true);

      // 3. Arrow storm silenced & fallen arms solved
      session.applyDialogueEffects(dialogueDb.dialogues.ch4_beacon_tower_align.effects!);
      expect(session.getFlag('silenced_arrow_storm')).toBe(true);

      session.applyDialogueEffects(dialogueDb.dialogues.ch4_banner_ward_broken.effects!);
      expect(session.getFlag('solved_fallen_arms_array')).toBe(true);

      // 4. Sentry answered grants last_light_charm
      const sentryGrant = session.applyDialogueEffects(
        dialogueDb.dialogues.ch4_sentry_answered.effects!,
      );
      expect(sentryGrant.some((g) => g.itemId === 'last_light_charm')).toBe(true);
      expect(session.getFlag('answered_sentry')).toBe(true);

      // 5. Elion choices
      const elionBurnGrant = sessionA.applyDialogueEffects(
        dialogueDb.dialogues.ch4_elion_burn.effects!,
      );
      expect(elionBurnGrant.some((g) => g.itemId === 'ember_quill_charm')).toBe(true);
      expect(elionBurnGrant.some((g) => g.itemId === 'treaty_scrap_signatures')).toBe(true);
      expect(sessionA.getFlag('ch4_choice_elion_burn')).toBe(true);

      const elionChronicleGrant = sessionB.applyDialogueEffects(
        dialogueDb.dialogues.ch4_elion_chronicle.effects!,
      );
      expect(elionChronicleGrant.some((g) => g.itemId === 'atonement_chronicle')).toBe(true);
      expect(elionChronicleGrant.some((g) => g.itemId === 'treaty_scrap_signatures')).toBe(true);
      expect(sessionB.getFlag('ch4_choice_elion_chronicle')).toBe(true);

      // 6. Bran choices
      const branReleaseGrant = sessionA.applyDialogueEffects(
        dialogueDb.dialogues.ch4_bran_release.effects!,
      );
      expect(branReleaseGrant.some((g) => g.itemId === 'dreamless_rest_charm')).toBe(true);
      expect(sessionA.getFlag('ch4_choice_bran_release')).toBe(true);

      const branMemorialGrant = sessionB.applyDialogueEffects(
        dialogueDb.dialogues.ch4_bran_memorial.effects!,
      );
      expect(branMemorialGrant.some((g) => g.itemId === 'mothers_name_carving')).toBe(true);
      expect(sessionB.getFlag('ch4_choice_bran_memorial')).toBe(true);

      // 7. Aldric choices
      const aldricTruthGrant = sessionA.applyDialogueEffects(
        dialogueDb.dialogues.ch4_aldric_truth.effects!,
      );
      expect(aldricTruthGrant.some((g) => g.itemId === 'ashes_of_peace_charm')).toBe(true);
      expect(sessionA.getFlag('ch4_choice_aldric_truth')).toBe(true);

      const aldricComfortGrant = sessionB.applyDialogueEffects(
        dialogueDb.dialogues.ch4_aldric_comfort.effects!,
      );
      expect(aldricComfortGrant.some((g) => g.itemId === 'vow_of_the_father_blade')).toBe(true);
      expect(sessionB.getFlag('ch4_choice_aldric_comfort')).toBe(true);

      // 8. Hidden Tomb of the First Fallen
      const tombGrant = session.applyDialogueEffects(
        dialogueDb.dialogues.ch4_tomb_first_fallen_open.effects!,
      );
      expect(tombGrant.some((g) => g.itemId === 'spear_of_finality')).toBe(true);
      expect(session.getFlag('opened_first_fallen_tomb')).toBe(true);

      // 9. Kuro meeting grants interval_lens_charm
      const kuroGrant = session.applyDialogueEffects(
        dialogueDb.dialogues.ch4_kuro_disappears.effects!,
      );
      expect(kuroGrant.some((g) => g.itemId === 'interval_lens_charm')).toBe(true);
      expect(session.getFlag('met_kuro_first_time')).toBe(true);
    });
  });
});
