import type { GameSession } from './GameSession';

/**
 * Chapter select (main menu): each entry starts a fresh session at the first map of a chapter as if
 * the chapters before it had just been played along the main path — level at the previous
 * chapter's cap, its seals and story flags, the gear it hands out, and the chapter's first main
 * quest started.
 */
export interface ChapterStart {
  chapter: number;
  title: string;
  mapId: string;
  spawnId: string;
  level: number;
  flags: string[];
  items: [string, number][];
  /** Equipped after the items are added (the best weapon and charm so far). */
  equip: string[];
}

const PROLOGUE = [
  'has_broken_blade',
  'learned_temporal_sight',
  'elder_parted',
  'isPrologueComplete',
];
const CH1 = ['continuum_seal_restored'];
const CH2 = ['causality_seal_restored'];
const CH3 = ['memory_seal_restored'];
const CH4 = [
  'finality_seal_restored',
  'ch4_choice_aldric_truth',
  'ch4_choice_bran_memorial',
  'ch4_choice_elion_burn',
];
const CH5 = [
  'possibility_seal_restored',
  'met_kuro_interval',
  'kuro_with_peter',
  'ch5_choice_partial_pull',
  'ch5_kuro_by_side',
  'ch5_choice_alpha_letter',
  'ch5_refused_alpha_memory',
  'defeated_other_peter',
  'defeated_unborn_king',
];

const GEAR1: [string, number][] = [
  ['beacon_hour_hand', 1],
  ['sea_glass_charm', 1],
  ['continuum_seal_shard', 1],
];
const GEAR2: [string, number][] = [
  ['praetor_iron_rapier', 1],
  ['scales_of_truth_charm', 1],
  ['causality_seal_shard', 1],
];
const GEAR3: [string, number][] = [
  ['memory_needle_rapier', 1],
  ['pure_crystal_soul_charm', 1],
  ['memory_seal_shard', 1],
];
const GEAR4: [string, number][] = [
  ['spear_of_finality', 1],
  ['last_light_charm', 1],
  ['finality_seal_shard', 1],
];
const GEAR5: [string, number][] = [
  ['blade_of_possibility', 1],
  ['alpha_wedding_ring', 1],
  ['possibility_seal_shard', 1],
  ['kuro_ledger', 1],
];
const CH6 = [
  'origin_seal_cracked',
  'ch6_kuro_ally',
  'ch6_promise_remembered',
  'ch6_chronicle_kept',
];
const GEAR6: [string, number][] = [
  ['origin_astral_blade', 1],
  ['seal_of_the_first_hour', 1],
  ['origin_seal_half', 1],
];
/** Origin Glyphs read in Chapter 6 (Chapter 8's library altars use them again). */
const GLYPHS_KNOWN = ['a', 'o', 'i', 'u', 'e', 'n', 'x'].map((g) => `ch6_glyph_${g}_known`);
const CH7 = [
  'ch7_null_hour_begun',
  'ch7_kuro_redeemed',
  'ch7_kuro_embraced',
  'pacified_void_kuro',
  'restored_kuro_mother_name',
  'communed_first_forgotten',
  'kuro_with_peter',
];
const GEAR7: [string, number][] = [
  ['void_severance_blade', 1],
  ['unwritten_cradle_clasp', 1],
  ['kuro_mother_brooch', 1],
];
const CH8 = ['ch8_chronos_returned', 'ch8_learned_torn_page', 'ch8_anchored_1159'];
const GEAR8: [string, number][] = [
  ['convergence_compass_blade', 1],
  ['sixfold_hour_charm', 1],
];
const heals = (n: number): [string, number] => ['refined_chrono_shard', n];

export const CHAPTER_STARTS: ChapterStart[] = [
  {
    chapter: 1,
    title: 'Hoàng Hôn Cuối Cùng',
    mapId: 'map_ch1_shore_gate',
    spawnId: 'from_prologue',
    level: 3,
    flags: [...PROLOGUE],
    items: [['broken_blade', 1], heals(3)],
    equip: ['broken_blade'],
  },
  {
    chapter: 2,
    title: 'Đế Chế Nhân Quả Giả',
    mapId: 'map_ch2_imperial_outskirts',
    spawnId: 'from_ch1',
    level: 9,
    flags: [...PROLOGUE, ...CH1],
    items: [...GEAR1, heals(4)],
    equip: ['beacon_hour_hand', 'sea_glass_charm'],
  },
  {
    chapter: 3,
    title: 'Vương Quốc Linh Hồn Bị Quên',
    mapId: 'map_ch3_sepulcher_gate',
    spawnId: 'from_ch2',
    level: 12,
    flags: [...PROLOGUE, ...CH1, ...CH2],
    items: [...GEAR1, ...GEAR2, heals(5)],
    equip: ['praetor_iron_rapier', 'scales_of_truth_charm'],
  },
  {
    chapter: 4,
    title: 'Cuộc Chiến Bất Tận',
    mapId: 'map_ch4_encampment_veridia',
    spawnId: 'from_ch3',
    level: 15,
    flags: [...PROLOGUE, ...CH1, ...CH2, ...CH3],
    items: [...GEAR1, ...GEAR2, ...GEAR3, heals(6)],
    equip: ['memory_needle_rapier', 'pure_crystal_soul_charm'],
  },
  {
    chapter: 5,
    title: 'Khu Vườn Của Những Khả Năng',
    mapId: 'map_ch5_interval_shore',
    spawnId: 'from_ch4',
    level: 18,
    flags: [...PROLOGUE, ...CH1, ...CH2, ...CH3, ...CH4],
    items: [...GEAR1, ...GEAR2, ...GEAR3, ...GEAR4, heals(8)],
    equip: ['spear_of_finality', 'last_light_charm'],
  },
  {
    chapter: 6,
    title: 'Giờ Của Chư Thần',
    mapId: 'map_ch6_celestial_stairs',
    spawnId: 'from_ch5',
    level: 21,
    flags: [...PROLOGUE, ...CH1, ...CH2, ...CH3, ...CH4, ...CH5],
    items: [...GEAR1, ...GEAR2, ...GEAR3, ...GEAR4, ...GEAR5, heals(8)],
    equip: ['blade_of_possibility', 'alpha_wedding_ring'],
  },
  {
    chapter: 7,
    title: 'Chiếc Nôi Của Những Kẻ Bị Quên',
    mapId: 'map_ch7_ash_abyss_drop',
    spawnId: 'from_ch6',
    level: 24,
    flags: [...PROLOGUE, ...CH1, ...CH2, ...CH3, ...CH4, ...CH5, ...CH6, ...GLYPHS_KNOWN],
    items: [...GEAR1, ...GEAR2, ...GEAR3, ...GEAR4, ...GEAR5, ...GEAR6, heals(10)],
    equip: ['origin_astral_blade', 'seal_of_the_first_hour'],
  },
  {
    chapter: 8,
    title: 'Giờ Số Không & Sự Hội Tụ',
    mapId: 'map_ch8_null_rift_landing',
    spawnId: 'from_ch7',
    level: 27,
    flags: [...PROLOGUE, ...CH1, ...CH2, ...CH3, ...CH4, ...CH5, ...CH6, ...GLYPHS_KNOWN, ...CH7],
    items: [...GEAR1, ...GEAR2, ...GEAR3, ...GEAR4, ...GEAR5, ...GEAR6, ...GEAR7, heals(12)],
    equip: ['void_severance_blade', 'unwritten_cradle_clasp'],
  },
  {
    chapter: 9,
    title: 'Vị Thần Gãy Cánh',
    mapId: 'map_ch9_apex_nexus',
    spawnId: 'from_ch8',
    level: 29,
    flags: [
      ...PROLOGUE,
      ...CH1,
      ...CH2,
      ...CH3,
      ...CH4,
      ...CH5,
      ...CH6,
      ...GLYPHS_KNOWN,
      ...CH7,
      ...CH8,
    ],
    items: [
      ...GEAR1,
      ...GEAR2,
      ...GEAR3,
      ...GEAR4,
      ...GEAR5,
      ...GEAR6,
      ...GEAR7,
      ...GEAR8,
      heals(14),
    ],
    equip: ['convergence_compass_blade', 'sixfold_hour_charm'],
  },
];

/** The chapter's first main quest: the one no other main quest of that chapter leads to. */
export function firstMainQuest(
  quests: readonly { id: string; kind?: string; chapter?: number; followUpQuestId?: string }[],
  chapter: number,
): string | null {
  const mains = quests.filter((q) => q.kind === 'main' && q.chapter === chapter);
  const led = new Set(mains.map((q) => q.followUpQuestId));
  return mains.find((q) => !led.has(q.id))?.id ?? null;
}

/** Puts a fresh session at the start of `start.chapter` (see CHAPTER_STARTS). */
export function applyChapterStart(session: GameSession, start: ChapterStart): void {
  const thresholds = session.database.player.player.expThresholds;
  session.level = start.level;
  session.exp = thresholds[start.level - 1] ?? 0;
  for (const f of start.flags) session.setFlag(f);
  for (const [id, n] of start.items) session.inventory.addItem(id, n);
  for (const id of start.equip) session.equip(id);
  session.closeFinishedChapters();
  const quest = firstMainQuest(session.quests.getAllQuests(), start.chapter);
  if (quest) session.quests.startQuest(quest);
  const stats = session.getStats();
  session.hp = stats.maxHp;
  session.mp = stats.maxMp;
  session.position = null;
}
