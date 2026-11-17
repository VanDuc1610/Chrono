/**
 * T-88 step 2 (owner, 2026-11-17): the people of the world rebuilt at the LPC scale, so they stand
 * as tall as Peter. Each NPC is layered from the pinned LPC character-generator sheets (body,
 * head, hair, clothes; art-source/lpc/manifest.json) and every layer is recoloured along a ramp
 * from the character's own design (docs/art/ELDER_DESIGN.md, docs/story/*). Pose: the standing
 * frame of the walk sheet, facing down, with a one-pixel breath in frames 2-3 (4-frame idle, like
 * the 32 px sheets it replaces, so the animations keep their frame numbers).
 *
 * Output (owner approval first): art-source/characters/npcs/lpc_candidates/<name>_idle.png and a
 * preview with the old sprite beside the new one. `--install` copies approved ones to
 * public/assets/lpc/npcs/ and records them in art-source/lpc/derived.json for the credits.
 *
 * Usage: node scripts/lpc/npcs.mjs [--install name,name] [--preview name,name]
 */
import fs from 'fs';
import { createHash } from 'crypto';
import { readPng } from '../pixel-art/png-read.js';
import { encodePng } from '../pixel-art/pixel.js';
import { renderCredits, readDerived } from './credits.mjs';

const F = 64;
const DOWN_ROW = 2;
const OUT = 'art-source/characters/npcs/lpc_candidates';
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/** Colour ramps, dark to light. */
const R = {
  skinPale: ['#7a5a48', '#c9a58a', '#ead2bc'],
  skinParchment: ['#6e5646', '#9e836b', '#c9b097', '#e2cdb6'],
  skinWarm: ['#6a432c', '#a87454', '#d8a07a', '#f0c49e'],
  skinTan: ['#4a2c1a', '#7c4e30', '#a86e48', '#c98e64'],
  silver: ['#5d6578', '#8c97ad', '#c4ccda', '#e8edf5'],
  greyHair: ['#3e3e44', '#6e6e76', '#a4a4ac', '#d0d0d6'],
  blackHair: ['#0f0c10', '#1e181e', '#352b33', '#4e4048'],
  brownHair: ['#24160f', '#43291b', '#64402a', '#86593a'],
  cowl: ['#0b0d16', '#161a29', '#28324f', '#3a4870'],
  cassock: ['#121620', '#1c2230', '#262d3d', '#3a4458'],
  bronze: ['#3e2c12', '#8c6628', '#c8964a', '#e8c070'],
  slipper: ['#120f0c', '#221d18', '#3a322a'],
  baBaTan: ['#4e3420', '#7a5636', '#a6805a', '#cdb08a'],
  trouserBlack: ['#0c0c10', '#18181e', '#2a2a32', '#3e3e48'],
  scarfCheck: ['#141414', '#4a4a4a', '#9a9a96', '#e6e4dc'],
  sandal: ['#2e1c10', '#5a3a22', '#82583a'],
  fisherShirt: ['#1c2638', '#2e3e5a', '#4a6082', '#7088a8'],
  fisherTrouser: ['#22180f', '#3e2c1c', '#5c432c', '#7a5c40'],
  shelterShirt: ['#3a3640', '#5e5866', '#8a8496', '#b6b0c2'],
  shelterSkirt: ['#2c2a24', '#4a463c', '#6e685a', '#948c7a'],
  skinLight: ['#6e4a36', '#b07e60', '#dcae8c', '#f0caa8'],
  leatherBrass: ['#24160e', '#4e3220', '#7a5236', '#a87c4a', '#d0a456'],
  scarfRed: ['#3c0e0e', '#7a1c1c', '#b03030', '#d85a4a'],
  trouserDark: ['#121016', '#221e28', '#36303c', '#4a4452'],
  bootBrown: ['#1a120c', '#36261a', '#56402c', '#725a40'],
  ashTunic: ['#2a2c32', '#4e525c', '#7e838e', '#b4b9c4'],
  beltLeather: ['#24170e', '#4a3220', '#70503a'],
  steelBlue: ['#121a2a', '#2a3a58', '#48638e', '#7d97bd', '#b8c8de'],
  capeBlue: ['#0c1430', '#1c2a5a', '#2e4486', '#4a62a8'],
  lightBrownHair: ['#3a2614', '#6a4a2a', '#9a7246', '#c49a64'],
  bandageWhite: ['#7c7a72', '#bcbab0', '#e8e6dc'],
  creamSleeves: ['#6e6858', '#aca492', '#ded6c4'],
  oliveTunic: ['#22261a', '#3a4228', '#58623e', '#7a8656'],
  soldierTrouser: ['#1c1812', '#322c22', '#4a4232'],
  royalRed: ['#22060a', '#4e1018', '#7e2028', '#ac3a40'],
  greyRobe: ['#1c1e20', '#383b3e', '#5c6064', '#868a8e'],
  whiteRobe: ['#5e584c', '#9c9484', '#ccc4b2', '#eee8da'],
  orangeVest: ['#3a1a08', '#7a3c12', '#b8641e', '#e09040'],
  shirtCream: ['#5e5848', '#9a927e', '#d0c8b2'],
  blackPlate: ['#08080c', '#18181f', '#2a2a34', '#42424e', '#5c5c6a'],
  trenchGrey: ['#1a1c20', '#363a42', '#5a5e68', '#868a94'],
  shirtBlack: ['#08080a', '#141418', '#24242a'],
  voidCoat: ['#100c18', '#241c34', '#3a2e52', '#584872'],
  paleBlue: ['#3a4858', '#6a809a', '#a2b6cc', '#d0dcea'],
  skirtSlate: ['#141820', '#262c38', '#3a4252', '#525c6e'],
  greyingHair: ['#141218', '#2c2830', '#4a4650', '#7a7680'],
  raincoat: ['#121e18', '#263c30', '#3e5c4a', '#5e8268'],
  rust: ['#341608', '#622c14', '#944820', '#bc6a34'],
  navyTunic: ['#121a2c', '#223254', '#38507e', '#5672a4'],
  helmetSteel: ['#1e2228', '#4a525e', '#7a8492', '#aeb8c4'],
  ghost: ['#464a56', '#868c9c', '#c0c6d2', '#ecf0f6'],
  lavenderShade: ['#342a4a', '#6e6290', '#a89cc4', '#d8d0ec'],
  snowRobe: ['#5e6a80', '#9eaec8', '#ccd8ec', '#f2f6ff'],
  lightGold: ['#7a5a18', '#c09a36', '#ecd080', '#fff2c8'],
  goldRobe: ['#4a320c', '#96681e', '#d0a040', '#f2d488'],
  whiteHair: ['#7a7e8a', '#b4b8c4', '#dfe2ea', '#f8f9fc'],
  voidViolet: ['#0a0612', '#181026', '#2a1e40', '#40305c'],
  brass: ['#3a2410', '#7a5222', '#b88432', '#e0b456', '#f4d888'],
  steel: ['#1a1e26', '#3a4250', '#646e80', '#98a2b4', '#d0d6e0'],
  darkSteel: ['#0c0e14', '#1e222c', '#343a48', '#525a6c'],
  greySkin: ['#3a3c44', '#6a6c76', '#9a9ca6', '#c4c6ce'],
  enforcerCoat: ['#1a1028', '#34204e', '#503478', '#70509e'],
  capRed: ['#3a0a0e', '#7a1820', '#b02c34'],
  cloakGrey: ['#1e2026', '#3c3f48', '#5e626c', '#868a94'],
  inquisitorPurple: ['#120a22', '#281846', '#3e2a6a', '#5a4290'],
  olive: ['#1e2214', '#363d24', '#525c36', '#727e4c'],
  bloodRed: ['#2e0608', '#5e1016', '#8e1c24', '#b8343a'],
  leatherBrown: ['#24160e', '#46301e', '#6a4a2e', '#8e6a44'],
  shadow: ['#060408', '#120c1a', '#20172e', '#2e2240'],
  husk: ['#2e3038', '#565a64', '#80848e', '#a8acb4'],
  sentinel: ['#08060e', '#16122a', '#262044', '#3a3260'],
};

/** Layers bottom to top: [manifest id, ramp or null to keep the colours]. */
const npcSpecs = () => ({
  elder: {
    old: 'public/assets/npcs/elder_idle.png',
    layers: [
      ['character-cape-solid-bg', R.cowl],
      ['character-weapon-magic-gnarled-universal-background', null],
      ['character-body-bodies-male', R.skinParchment],
      ['character-head-heads-human-male-elderly', R.skinParchment],
      ['character-feet-slippers-male', R.slipper],
      ['character-legs-skirts-plain-male', R.cassock],
      ['character-torso-clothes-longsleeve-longsleeve-male', R.cassock],
      ['character-cape-solid-fg', R.cowl],
      ['character-hat-cloth-hood-adult', R.cowl],
      ['character-beards-beard-medium', R.silver],
      ['character-weapon-magic-gnarled-universal-foreground', null],
    ],
  },
  vendor_ba: {
    old: 'public/assets/npcs/vendor_ba_idle.png',
    layers: [
      ['character-body-bodies-female', R.skinWarm],
      ['character-feet-sandals-thin', R.sandal],
      ['character-legs-pants-thin', R.trouserBlack],
      ['character-torso-clothes-longsleeve-longsleeve-female', R.baBaTan],
      ['character-neck-scarf', R.scarfCheck],
      ['character-head-heads-human-female', R.skinWarm],
      ['character-hair-bangs-bun-adult', R.blackHair],
    ],
  },
  fisherman_sau: {
    old: 'public/assets/npcs/fisherman_sau_idle.png',
    layers: [
      ['character-body-bodies-male', R.skinTan],
      ['character-head-heads-human-male-elderly', R.skinTan],
      ['character-feet-sandals-male', R.sandal],
      ['character-legs-cuffed-male', R.fisherTrouser],
      ['character-torso-clothes-shortsleeve-shortsleeve-male', R.fisherShirt],
      ['character-hair-balding-adult', R.greyHair],
      ['character-beards-beard-basic', R.greyHair],
      ['custom:conical-hat', null],
    ],
  },
  mira: {
    old: 'public/assets/npcs/mira_idle.png',
    layers: [
      ['character-body-bodies-child', R.skinPale],
      ['character-head-heads-human-child', R.skinPale],
      ['character-legs-skirts-child', R.shelterSkirt],
      ['character-torso-clothes-shirt-child', R.shelterShirt],
      ['character-hair-relm-short-child', R.brownHair],
    ],
  },
  // Chapter 2: resistance vanguard, ~24; black chin-length hair, brass-trimmed leather armour,
  // red scarf, the halberd (lyra_vanguard_halberd).
  lyra: {
    old: 'public/assets/npcs/lyra_idle.png',
    layers: [
      ['character-body-bodies-female', R.skinLight],
      ['character-feet-boots-basic-thin', R.bootBrown],
      ['character-legs-pants-thin', R.trouserDark],
      ['character-torso-armour-leather-female', R.leatherBrass],
      ['character-neck-scarf', R.scarfRed],
      ['character-head-heads-human-female', R.skinLight],
      ['character-hair-bob-adult', R.blackHair],
      ['custom:halberd', null],
    ],
  },
  // Chapter 3: young archivist, ~22; ash-grey tunic, leather satchel strap, braid over the shoulder.
  neris: {
    old: 'public/assets/npcs/neris_idle.png',
    layers: [
      ['character-hair-braid-adult-bg', R.brownHair],
      ['character-body-bodies-female', R.skinPale],
      ['character-feet-boots-basic-thin', R.bootBrown],
      ['character-legs-pants-thin', R.trouserDark],
      ['character-torso-clothes-tunic-female', R.ashTunic],
      ['character-torso-waist-belt-leather-female', R.beltLeather],
      ['custom:satchel', null],
      ['character-head-heads-human-female', R.skinPale],
      ['character-hair-braid-adult-fg', R.brownHair],
    ],
  },
  // Chapter 4: the old marshal of Veridia; silver hair and beard, cracked steel-blue plate, blue
  // cape, the great sword.
  aldric: {
    old: 'public/assets/npcs/aldric_idle.png',
    layers: [
      ['character-cape-solid-bg', R.capeBlue],
      ['character-body-bodies-male', R.skinParchment],
      ['character-feet-boots-basic-male', R.bootBrown],
      ['character-legs-pants-male', R.trouserDark],
      ['character-torso-armour-plate-male', R.steelBlue],
      ['character-cape-solid-fg', R.capeBlue],
      ['character-head-heads-human-male-elderly', R.skinParchment],
      ['character-hair-plain-adult', R.silver],
      ['character-beards-beard-medium', R.silver],
      ['custom:greatsword', null],
    ],
  },
  // Chapter 4: Private Bran, 19, who has died 1,427 times; bandaged brow, olive tunic over
  // cream sleeves, the tally-marked wooden spear.
  soldier_bran: {
    old: 'public/assets/npcs/soldier_bran_idle.png',
    layers: [
      ['character-body-bodies-male', R.skinLight],
      ['character-feet-boots-basic-male', R.bootBrown],
      ['character-legs-pants-male', R.soldierTrouser],
      ['character-torso-clothes-longsleeve-longsleeve-male', R.creamSleeves],
      ['character-torso-clothes-sleeveless-sleeveless-male', R.oliveTunic],
      ['character-head-heads-human-male', R.skinLight],
      ['character-hair-plain-adult', R.lightBrownHair],
      ['character-hat-headband-thick-adult', R.bandageWhite],
      ['custom:tally-spear', null],
    ],
  },
  // Chapter 2: the king who forgot his name; crown, red robe with a gold band, silver beard.
  // Seated on his throne (owner, 2026-11-17): the LPC sit pose, column 2 (on a chair).
  amnesiac_king: {
    old: 'public/assets/npcs/amnesiac_king_idle.png',
    col: 2,
    layers: [
      [throneBack, null],
      ['character-body-bodies-male-sit', R.skinParchment],
      ['character-head-heads-human-male-elderly-sit', R.skinParchment],
      ['character-feet-slippers-male-sit', R.slipper],
      ['character-legs-skirts-plain-male-sit', R.royalRed],
      ['character-torso-clothes-longsleeve-longsleeve-male-sit', R.royalRed],
      [stripe(31, 36, 52, '#e0b450', '#6a4a14'), null],
      ['character-hair-plain-adult-sit', R.silver],
      ['character-beards-beard-medium-sit', R.silver],
      ['character-hat-formal-crown-adult-sit', null],
      [throneArms, null],
    ],
  },
  // Chapter 4: Elion, the tearless chronicler; shaven head, grey robe, the chronicle in his hands.
  chronicler_elion: {
    old: 'public/assets/npcs/chronicler_elion_idle.png',
    layers: [
      ['character-body-bodies-male', R.skinParchment],
      ['character-head-heads-human-male-elderly', R.skinParchment],
      ['character-feet-slippers-male', R.slipper],
      ['character-legs-skirts-plain-male', R.greyRobe],
      ['character-torso-clothes-longsleeve-longsleeve-male', R.greyRobe],
      [
        panel(25, 40, 14, 8, '#5a3a22', '#24160c', [
          [1, 1, '#e8dcc0'],
          [12, 1, '#e8dcc0'],
          [4, 3, '#a87c4a'],
          [9, 3, '#a87c4a'],
          [6, 4, '#a87c4a'],
          [7, 4, '#a87c4a'],
        ]),
        null,
      ],
    ],
  },
  // Chapter 2: the exiled praetor; white robe, violet sash of office, gold circlet, white beard.
  exiled_praetor: {
    old: 'public/assets/npcs/exiled_praetor_idle.png',
    layers: [
      ['character-body-bodies-male', R.skinParchment],
      ['character-head-heads-human-male-elderly', R.skinParchment],
      ['character-feet-slippers-male', R.slipper],
      ['character-legs-skirts-plain-male', R.whiteRobe],
      ['character-torso-clothes-longsleeve-longsleeve-male', R.whiteRobe],
      [strap('#3a1a52', '#7a4aa0'), null],
      ['character-hair-plain-adult', R.whiteHair],
      ['character-beards-beard-medium', R.whiteHair],
      [circlet(19, '#e0b450', '#6a4a14'), null],
    ],
  },
  // Chapter 5: Ivo the tinkerer; orange vest over a cream shirt, goggles up, white beard, cane.
  ivo: {
    old: 'public/assets/npcs/ivo_idle.png',
    layers: [
      ['character-body-bodies-male', R.skinWarm],
      ['character-head-heads-human-male-elderly', R.skinWarm],
      ['character-feet-boots-basic-male', R.bootBrown],
      ['character-legs-pants-male', R.fisherTrouser],
      ['character-torso-clothes-longsleeve-longsleeve-male', R.shirtCream],
      ['character-torso-clothes-vest-male', R.orangeVest],
      ['character-hair-plain-adult', R.greyHair],
      ['character-beards-beard-medium', R.whiteHair],
      [goggles, null],
      ['character-weapon-polearm-cane-male', null],
    ],
  },
  // Chapter 4: Kaelen; black plate with the gold star, scarred cheek, dark hair, halberd.
  kaelen: {
    old: 'public/assets/npcs/kaelen_idle.png',
    layers: [
      ['character-body-bodies-male', R.skinLight],
      ['character-head-heads-human-male', R.skinLight],
      ['character-feet-boots-basic-male', R.bootBrown],
      ['character-legs-pants-male', R.trouserDark],
      ['character-torso-armour-plate-male', R.blackPlate],
      [star(32, 40, '#f0c24a', '#7a5414'), null],
      [panel(22, 48, 20, 2, '#8c2028', '#3a0c10'), null],
      [scar, null],
      ['character-hair-messy1-adult', R.brownHair],
      ['custom:halberd', null],
    ],
  },
  // Kuro: black hair, grey coat over black, Possibility-violet eyes; frame 4 is the Interval flicker.
  kuro: {
    old: 'public/assets/npcs/kuro_idle.png',
    frames: 5,
    glitch: 4,
    layers: [
      ['character-body-bodies-male', R.skinWarm],
      ['character-head-heads-human-male', R.skinWarm],
      ['character-feet-boots-basic-male', R.bootBrown],
      ['character-legs-pants-male', R.trouserDark],
      ['character-torso-clothes-longsleeve-longsleeve-male', R.shirtBlack],
      ['character-torso-jacket-trench-male', R.trenchGrey],
      [irises('#a070ff'), null],
      ['character-hair-messy1-adult', R.blackHair],
    ],
  },
  // Kuro eroded by the void (chapters 7-9): the coat gone violet-dark, sparks at his feet.
  kuro_void: {
    old: 'public/assets/npcs/kuro_void_idle.png',
    layers: [
      ['character-body-bodies-male', R.skinWarm],
      ['character-head-heads-human-male', R.skinWarm],
      ['character-feet-boots-basic-male', R.voidViolet],
      ['character-legs-pants-male', R.voidViolet],
      ['character-torso-clothes-longsleeve-longsleeve-male', R.shirtBlack],
      ['character-torso-jacket-trench-male', R.voidCoat],
      [irises('#c8a0ff'), null],
      ['character-hair-messy1-adult', R.blackHair],
      [voidSparks, null],
    ],
  },
  // Bà Mai, Kuro's mother; pale blue blouse, long slate skirt, greying hair tied back.
  kuro_mother: {
    old: 'public/assets/npcs/kuro_mother_idle.png',
    layers: [
      ['character-hair-long-tied-adult-bg', R.greyingHair],
      ['character-body-bodies-female', R.skinWarm],
      ['character-head-heads-human-female', R.skinWarm],
      ['character-feet-slippers-male', R.slipper],
      ['character-legs-skirts-straight-thin', R.skirtSlate],
      ['character-torso-clothes-blouse-longsleeve-female', R.paleBlue],
      ['character-hair-long-tied-adult-fg', R.greyingHair],
    ],
  },
  // Chapter 1: the old lighthouse keeper; green oilskin hood and coat, grey beard, storm lantern.
  old_keeper: {
    old: 'public/assets/npcs/old_keeper_idle.png',
    frames: 5,
    layers: [
      ['character-body-bodies-male', R.skinTan],
      ['character-head-heads-human-male-elderly', R.skinTan],
      ['character-feet-boots-basic-male', R.bootBrown],
      ['character-legs-skirts-plain-male', R.raincoat],
      ['character-torso-clothes-longsleeve-longsleeve-male', R.raincoat],
      ['character-hat-cloth-hood-adult', R.raincoat],
      ['character-beards-beard-trimmed', R.greyHair],
      [lantern, null],
    ],
  },
  // Chapter 4: Renard; kettle helmet, rust beard, navy tunic with a sword belt, short sword.
  renard: {
    old: 'public/assets/npcs/renard_idle.png',
    frames: 7,
    layers: [
      ['character-body-bodies-male', R.skinLight],
      ['character-head-heads-human-male', R.skinLight],
      ['character-feet-boots-basic-male', R.bootBrown],
      ['character-legs-pants-male', R.trouserDark],
      ['character-torso-clothes-longsleeve-longsleeve-male', R.navyTunic],
      [strap('#24160c', '#6a4a30'), null],
      ['character-hair-plain-adult', R.rust],
      ['character-beards-beard-trimmed', R.rust],
      ['character-hat-helmet-kettle-adult', R.helmetSteel],
      [shortSword, null],
    ],
  },
  // Chapter 0-1: the forgotten child, a pale flickering ghost (2 frames, the second fainter).
  forgotten_child: {
    old: 'public/assets/npcs/forgotten_child_idle.png',
    frames: 2,
    flicker: true,
    alpha: 0.85,
    layers: [
      ['character-body-bodies-child', R.ghost],
      ['character-head-heads-human-child', R.ghost],
      ['character-legs-skirts-child', R.ghost],
      ['character-torso-clothes-shirt-child', R.ghost],
      ['character-hair-relm-short-child', R.ghost],
    ],
  },
  // Chapter 7-9: a nameless shade; faceless, lavender, robed and hooded, a little transparent.
  nameless_shade: {
    old: 'public/assets/npcs/nameless_shade_idle.png',
    alpha: 0.88,
    layers: [
      ['character-body-bodies-female', R.lavenderShade],
      ['character-head-heads-human-female', R.lavenderShade],
      [face('#a89cc4'), null],
      ['character-torso-clothes-robe-female', R.lavenderShade],
      ['character-hat-cloth-hood-adult', R.lavenderShade],
    ],
  },
  // Solon: faceless, white hooded robe and mantle, the gold plate of office on the chest.
  solon: {
    old: 'public/assets/npcs/solon_idle.png',
    layers: [
      ['character-cape-solid-bg', R.snowRobe],
      ['character-body-bodies-female', R.snowRobe],
      ['character-head-heads-human-female', R.snowRobe],
      [face('#ccd8ec'), null],
      ['character-torso-clothes-robe-female', R.snowRobe],
      ['character-cape-solid-fg', R.snowRobe],
      ['character-hat-cloth-hood-adult', R.snowRobe],
      [panel(29, 39, 7, 6, '#e0b450', '#6a4a14', [[3, 2, '#fff0b8']]), null],
    ],
  },
  // Chronos's remnant: a figure of gold light under a crown, no face.
  chronos_remnant: {
    old: 'public/assets/npcs/chronos_remnant_idle.png',
    alpha: 0.9,
    layers: [
      ['character-body-bodies-female', R.lightGold],
      ['character-head-heads-human-female', R.lightGold],
      [face('#fff2c8'), null],
      ['character-torso-clothes-robe-female', R.lightGold],
      ['character-hair-long-straight-adult', R.lightGold],
      ['character-hat-formal-crown-adult', null],
    ],
  },
  // Chronos reborn: silver-white hair, gold robe, amber eyes, a halo behind.
  // 96 px frame, floating 6 px up, great halo, gold train and motes (owner: stands apart).
  chronos_reborn: {
    old: 'public/assets/npcs/chronos_reborn_idle.png',
    size: 96,
    lift: 6,
    under: [bigHalo],
    over: [robeTrain, motes],
    layers: [
      ['character-body-bodies-female', R.skinPale],
      ['character-head-heads-human-female', R.skinPale],
      [irises('#e0a020'), null],
      ['character-torso-clothes-robe-female', R.goldRobe],
      ['character-hair-long-straight-adult', R.whiteHair],
    ],
  },
  // The First Forgotten: an erased violet silhouette, white glowing eyes, broken chains, beads.
  // ---- Field enemies, humanoid (owner, 2026-11-18): built like the people, the old frame counts.
  enemy_imperial_automaton: {
    kind: 'enemy',
    old: 'public/assets/enemies/imperial_automaton.png',
    layers: [
      ['character-body-bodies-male', R.brass],
      ['character-head-heads-human-male', R.brass],
      ['character-feet-boots-basic-male', R.darkSteel],
      ['character-legs-armour-plate-male', R.brass],
      ['character-torso-armour-plate-male', R.brass],
      ['character-hat-helmet-norman-adult', R.brass],
      [face('#7a5222', '#ff5a3a'), null],
      [towerShield('#8e1c24', '#c8964a', '#ecc878'), null],
    ],
  },
  enemy_causality_enforcer: {
    kind: 'enemy',
    old: 'public/assets/enemies/causality_enforcer.png',
    layers: [
      ['character-body-bodies-male', R.greySkin],
      ['character-head-heads-human-male', R.greySkin],
      ['character-feet-boots-basic-male', R.darkSteel],
      ['character-legs-pants-male', R.trouserDark],
      ['character-torso-clothes-longsleeve-longsleeve-male', R.shirtBlack],
      ['character-torso-jacket-trench-male', R.enforcerCoat],
      [irises('#d8d8e0'), null],
      ['character-hat-cloth-bandana-adult', R.capRed],
      [shortSword, null],
    ],
  },
  enemy_ghost_sniper: {
    kind: 'enemy',
    old: 'public/assets/enemies/ghost_sniper.png',
    layers: [
      ['character-body-bodies-male', R.cloakGrey],
      ['character-head-heads-human-male', R.shadow],
      [face('#120c1a', '#ff3a3a'), null],
      ['character-feet-boots-basic-male', R.darkSteel],
      ['character-legs-skirts-plain-male', R.cloakGrey],
      ['character-torso-clothes-longsleeve-longsleeve-male', R.cloakGrey],
      ['character-hat-cloth-hood-adult', R.cloakGrey],
      [crossbow, null],
    ],
  },
  enemy_endless_phalanx: {
    kind: 'enemy',
    old: 'public/assets/enemies/endless_phalanx.png',
    layers: [
      ['character-body-bodies-male', R.skinLight],
      ['character-head-heads-human-male', R.skinLight],
      ['character-feet-boots-basic-male', R.darkSteel],
      ['character-legs-armour-plate-male', R.steel],
      ['character-torso-armour-plate-male', R.steel],
      ['character-hat-helmet-nasal-adult', R.steel],
      [towerShield('#5e5040', '#8c96a8', '#c8c0b0'), null],
      [spear, null],
    ],
  },
  enemy_banner_carrier: {
    kind: 'enemy',
    old: 'public/assets/enemies/banner_carrier.png',
    layers: [
      ['character-body-bodies-male', R.skinWarm],
      ['character-head-heads-human-male', R.skinWarm],
      ['character-feet-boots-basic-male', R.bootBrown],
      ['character-legs-pants-male', R.leatherBrown],
      ['character-torso-armour-leather-male', R.leatherBrown],
      ['character-hair-plain-adult', R.brownHair],
      [banner('#a02028', '#e0b450'), null],
    ],
  },
  enemy_undying_knight: {
    kind: 'enemy',
    old: 'public/assets/enemies/undying_knight.png',
    frames: 5,
    layers: [
      [
        panel(40, 33, 9, 24, '#8e1c24', '#2e0608', [
          [1, 1, '#b8343a'],
          [1, 2, '#b8343a'],
        ]),
        null,
      ],
      ['character-body-bodies-male', R.darkSteel],
      ['character-head-heads-human-male', R.darkSteel],
      ['character-feet-boots-basic-male', R.darkSteel],
      ['character-legs-armour-plate-male', R.darkSteel],
      ['character-torso-armour-plate-male', R.darkSteel],
      ['character-hat-helmet-norman-adult', R.darkSteel],
      [face('#1e222c', '#4ae0ff'), null],
      [horns, null],
      ['custom:halberd', null],
    ],
  },
  enemy_void_inquisitor: {
    kind: 'enemy',
    old: 'public/assets/enemies/void_inquisitor.png',
    layers: [
      ['character-body-bodies-female', R.shadow],
      ['character-head-heads-human-female', R.shadow],
      [face('#120c1a', '#e8e0ff'), null],
      ['character-torso-clothes-robe-female', R.inquisitorPurple],
      ['character-hat-cloth-hood-adult', R.inquisitorPurple],
      [staff('#c8964a', '#b48cff'), null],
    ],
  },
  enemy_twin_era_legionnaire: {
    kind: 'enemy',
    old: 'public/assets/enemies/twin_era_legionnaire.png',
    layers: [
      ['character-body-bodies-male', R.skinLight],
      ['character-head-heads-human-male', R.skinLight],
      ['character-feet-boots-basic-male', R.bootBrown],
      ['character-legs-pants-male', R.olive],
      ['character-torso-armour-legion-male', R.olive],
      ['character-neck-scarf', R.bloodRed],
      ['character-hat-helmet-kettle-adult', R.steel],
      [towerShield('#e6dcc4', '#8c96a8', '#c8964a'), null],
    ],
  },
  enemy_second_hand_warden: {
    kind: 'enemy',
    old: 'public/assets/enemies/second_hand_warden.png',
    layers: [
      ['character-body-bodies-male', R.darkSteel],
      ['character-head-heads-human-male', R.darkSteel],
      ['character-feet-boots-basic-male', R.darkSteel],
      ['character-legs-armour-plate-male', R.steel],
      ['character-torso-armour-plate-male', R.steel],
      ['character-hat-helmet-kettle-adult', R.darkSteel],
      [face('#1e222c', '#f4d888'), null],
      [clockFace, null],
      [shortSword, null],
    ],
  },
  enemy_nexus_sentinel: {
    kind: 'enemy',
    old: 'public/assets/enemies/nexus_sentinel.png',
    layers: [
      ['character-body-bodies-male', R.sentinel],
      ['character-head-heads-human-male', R.sentinel],
      [face('#16122a', '#4ae0ff'), null],
      ['character-legs-armour-plate-male', R.sentinel],
      ['character-torso-armour-plate-male', R.sentinel],
      [bladeArms, null],
    ],
  },
  enemy_nexus_inquisitor: {
    kind: 'enemy',
    old: 'public/assets/enemies/nexus_inquisitor.png',
    layers: [
      ['character-body-bodies-female', R.shadow],
      ['character-head-heads-human-female', R.shadow],
      [face('#120c1a', '#e8e0ff'), null],
      ['character-torso-clothes-robe-female', R.inquisitorPurple],
      ['character-cape-solid-fg', R.inquisitorPurple],
      ['character-hat-cloth-hood-adult', R.inquisitorPurple],
      [hammer, null],
    ],
  },
  enemy_heel_shadow: {
    kind: 'enemy',
    old: 'public/assets/enemies/heel_shadow.png',
    alpha: 0.9,
    layers: [
      ['character-body-bodies-male', R.shadow],
      ['character-head-heads-human-male', R.shadow],
      [face('#20172e', '#b48cff'), null],
      ['character-legs-pants-male', R.shadow],
      ['character-hair-messy1-adult', R.shadow],
    ],
  },
  enemy_hollow_husk: {
    kind: 'enemy',
    old: 'public/assets/enemies/hollow_husk.png',
    layers: [
      ['character-body-bodies-male', R.husk],
      ['character-head-heads-human-male', R.husk],
      [face('#565a64', '#121214'), null],
      ['character-legs-pants-male', R.husk],
      ['character-torso-clothes-longsleeve-longsleeve-male', R.husk],
      [chestHole, null],
    ],
  },
  enemy_hollow_archivist: {
    kind: 'enemy',
    old: 'public/assets/enemies/hollow_archivist.png',
    layers: [
      ['character-body-bodies-female', R.shadow],
      ['character-head-heads-human-female', R.shadow],
      [face('#120c1a'), null],
      ['character-torso-clothes-robe-female', R.cloakGrey],
      ['character-hat-cloth-hood-adult', R.cloakGrey],
      [staff('#c8964a', '#ffd666'), null],
    ],
  },
  // 96 px frame: the bell cloak swallows the body; chains overhead, staffs either side.
  first_forgotten: {
    old: 'public/assets/npcs/first_forgotten_idle.png',
    size: 96,
    under: [bigChains, staffs],
    over: [bellCloak],
    layers: [
      ['character-body-bodies-female', R.voidViolet],
      ['character-head-heads-human-female', R.voidViolet],
      ['character-torso-clothes-robe-female', R.voidViolet],
      ['character-hat-cloth-hood-sack-adult', R.voidViolet],
      [face('#181026', '#f4f0ff'), null],
    ],
  },
});

const manifest = JSON.parse(fs.readFileSync('art-source/lpc/manifest.json', 'utf8'));
const byId = new Map(manifest.map((e) => [e.id, e]));
const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

/** Along a ramp of hex stops, t in 0..1. */
function rampAt(ramp, t) {
  const stops = ramp.map(hex);
  const x = Math.min(0.9999, Math.max(0, t)) * (stops.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  return stops[i].map((v, k) => Math.round(v + (stops[i + 1][k] - v) * f));
}

/**
 * Ông Sáu's nón lá (no LPC sheet has one): drawn here, a straw cone over the head with ring lines,
 * lit from the upper left. `top` is the head's highest row.
 */
function conicalHat(top) {
  const px = Buffer.alloc(F * F * 4);
  const [O, D, M, L, Rg] = ['#3e2e18', '#a88a4e', '#d4ba7c', '#ecdaa4', '#8c7240'].map(hex);
  const apex = top - 4;
  const base = top + 10;
  const set = (x, y, c) => {
    if (x < 0 || y < 0 || x >= F || y >= F) return;
    px.set([...c, 255], (y * F + x) * 4);
  };
  for (let y = apex; y <= base; y++) {
    const half = Math.round(((y - apex) / (base - apex)) * 15);
    for (let x = 32 - half; x <= 32 + half; x++) {
      const edge = x === 32 - half || x === 32 + half || y === base;
      const k = (x - (32 - half)) / Math.max(1, 2 * half);
      const ring = (y - apex) % 5 === 4;
      set(x, y, edge ? O : ring ? Rg : k < 0.35 ? L : k < 0.75 ? M : D);
    }
  }
  set(32, apex - 1, O);
  return px;
}

const steel = ['#1e222a', '#8c96a8', '#c8d0dc', '#eef2f8'].map(hex);
const wood = ['#2e1c10', '#5a3c22', '#8a6038'].map(hex);
const gold = ['#3e2c12', '#b8862e', '#e8c070'].map(hex);
const blank = () => Buffer.alloc(F * F * 4);
const plot = (px, x, y, c) => {
  if (x >= 0 && y >= 0 && x < F && y < F) px.set([...c, 255], (y * F + x) * 4);
};

/** The viewer-right hand: rightmost opaque column of the body at hand height. */
function handX(body) {
  for (let x = F - 1; x >= 0; x--) if (body[(47 * F + x) * 4 + 3] > 0) return x;
  return 44;
}

/** An upright pole in the right hand, 2 px wide, outlined, from `top` to the ground. */
function pole(px, x, top, colours) {
  for (let y = top; y <= 61; y++) {
    plot(px, x - 1, y, colours[0]);
    plot(px, x, y, colours[2]);
    plot(px, x + 1, y, colours[1]);
    plot(px, x + 2, y, colours[0]);
  }
}

/** Lyra's halberd, held upright: steel spike, crescent axe blade outward, back hook. */
function halberd(body) {
  const px = blank();
  const x = handX(body);
  pole(px, x, 12, wood);
  for (let y = 2; y <= 12; y++) {
    const w = y < 5 ? 0 : 1;
    for (let k = -w; k <= w + 1; k++)
      plot(px, x + k, y, k === -w || k === w + 1 ? steel[0] : steel[2]);
  }
  plot(px, x, 1, steel[0]);
  // Axe blade to the right, a crescent from y 8 to 18.
  for (let y = 8; y <= 18; y++) {
    const reach = Math.round(6 - Math.abs(y - 13) * 0.6);
    for (let k = 3; k <= 2 + reach; k++)
      plot(
        px,
        x + k,
        y,
        k === 2 + reach || y === 8 || y === 18
          ? steel[0]
          : k === 2 + reach - 1
            ? steel[3]
            : steel[1],
      );
  }
  // Back hook to the left.
  for (let k = 1; k <= 3; k++) plot(px, x - 1 - k, 11 + (k === 3 ? 1 : 0), steel[k === 3 ? 0 : 1]);
  plot(px, x - 2, 10, steel[0]);
  return px;
}

/** Bran's wooden spear, upright, its shaft cut with tally marks; leaf-shaped steel tip. */
function tallySpear(body) {
  const px = blank();
  const x = handX(body);
  pole(px, x, 10, ['#3a2614', '#7a5434', '#a8804e'].map(hex));
  for (let y = 18; y <= 58; y += 3) plot(px, x, y, wood[0]);
  for (let y = 2; y <= 10; y++) {
    const w = y <= 3 || y >= 9 ? 0 : 1;
    for (let k = -w; k <= w + 1; k++)
      plot(px, x + k, y, k === -w || k === w + 1 ? steel[0] : k === 0 ? steel[3] : steel[2]);
  }
  plot(px, x, 1, steel[0]);
  for (let k = -2; k <= 3; k++) plot(px, x + k, 10, steel[0]);
  return px;
}

/** Aldric's great sword, planted point-down in front of him: gold pommel and guard. */
function greatsword() {
  const px = blank();
  const c = 31;
  for (let y = 40; y <= 62; y++) {
    const tip = y >= 60;
    plot(px, c - 1, y, steel[0]);
    plot(px, c, y, tip ? steel[1] : steel[3]);
    plot(px, c + 1, y, tip && y === 62 ? steel[0] : steel[2]);
    plot(px, c + 2, y, steel[0]);
  }
  for (let x = c - 5; x <= c + 6; x++) {
    plot(px, x, 38, gold[0]);
    plot(px, x, 39, x === c - 5 || x === c + 6 ? gold[0] : gold[2]);
    plot(px, x, 40, gold[0]);
  }
  for (let y = 32; y <= 37; y++) {
    plot(px, c - 1, y, gold[0]);
    plot(px, c, y, y % 2 ? wood[1] : wood[2]);
    plot(px, c + 1, y, wood[1]);
    plot(px, c + 2, y, gold[0]);
  }
  for (let x = c - 1; x <= c + 2; x++) {
    plot(px, x, 29, gold[0]);
    plot(px, x, 30, x === c - 1 || x === c + 2 ? gold[0] : gold[2]);
    plot(px, x, 31, x === c - 1 || x === c + 2 ? gold[0] : gold[1]);
  }
  return px;
}

/** Neris's leather satchel for her lenses: strap from the left shoulder to a bag on the right hip. */
function satchel(body) {
  const px = blank();
  const hx = handX(body);
  const strap = ['#2a1a10', '#6a4a30'].map(hex);
  for (let t = 0; t <= 16; t++) {
    const x = 24 + t;
    const y = 33 + Math.round(t * 0.75);
    plot(px, x, y, strap[1]);
    plot(px, x, y + 1, strap[0]);
  }
  const x0 = hx - 8;
  const y0 = 45;
  const bag = ['#24160c', '#6e4a2c', '#94683e', '#b48654'].map(hex);
  for (let y = 0; y <= 7; y++)
    for (let x = 0; x <= 7; x++) {
      const edge = x === 0 || x === 7 || y === 0 || y === 7;
      plot(px, x0 + x, y0 + y, edge ? bag[0] : y <= 2 ? bag[3] : y === 3 ? bag[0] : bag[2]);
    }
  plot(px, x0 + 4, y0 + 3, gold[2]);
  plot(px, x0 + 4, y0 + 4, gold[1]);
  return px;
}

/** A diagonal strap from the left shoulder to the right hip. */
const strap = (dark, light) => () => {
  const px = blank();
  for (let t = 0; t <= 16; t++) {
    const x = 24 + t;
    const y = 33 + Math.round(t * 0.95);
    plot(px, x, y, hex(light));
    plot(px, x, y + 1, hex(dark));
  }
  return px;
};

/** Paints over the eyes (faceless spirits); `eyes` adds glowing pupils in that colour. */
const face = (skin, eyes) => () => {
  const px = blank();
  for (let y = 29; y <= 31; y++)
    for (const x0 of [26, 34]) for (let x = x0; x <= x0 + 3; x++) plot(px, x, y, hex(skin));
  if (eyes) for (const x of [27, 28, 35, 36]) plot(px, x, 30, hex(eyes));
  return px;
};

/** Coloured irises (Kuro's Possibility violet, Chronos's amber). */
const irises = (c) => () => {
  const px = blank();
  for (const [x, y] of [
    [27, 29],
    [28, 29],
    [27, 30],
    [35, 29],
    [36, 29],
    [36, 30],
  ])
    plot(px, x, y, hex(c));
  return px;
};

/** A filled rectangle with an outline: emblems, plates, books, belts. */
const panel = (x0, y0, w, h, fill, edge, mark) => () => {
  const px = blank();
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      plot(
        px,
        x0 + x,
        y0 + y,
        x === 0 || y === 0 || x === w - 1 || y === h - 1 ? hex(edge) : hex(fill),
      );
  if (mark) for (const [x, y, c] of mark) plot(px, x0 + x, y0 + y, hex(c));
  return px;
};

/** A vertical robe stripe down the front. */
const stripe = (x0, y0, y1, c, edge) => () => {
  const px = blank();
  for (let y = y0; y <= y1; y++) {
    plot(px, x0 - 1, y, hex(edge));
    plot(px, x0, y, hex(c));
    plot(px, x0 + 1, y, hex(c));
    plot(px, x0 + 2, y, hex(edge));
  }
  return px;
};

/** A four-pointed star emblem (Kaelen's breastplate). */
const star = (cx, cy, c, edge) => () => {
  const px = blank();
  for (let k = -4; k <= 4; k++) {
    plot(px, cx + k, cy, hex(Math.abs(k) === 4 ? edge : c));
    plot(px, cx, cy + k, hex(Math.abs(k) === 4 ? edge : c));
  }
  for (const [dx, dy] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ])
    plot(px, cx + dx, cy + dy, hex(c));
  return px;
};

/** A thin scar across the left cheek. */
const scar = () => {
  const px = blank();
  for (const [x, y] of [
    [25, 26],
    [26, 27],
    [27, 28],
    [28, 31],
    [29, 32],
  ])
    plot(px, x, y, hex('#a0484a'));
  return px;
};

/** A gold circlet around the brow. */
const circlet = (y, c, edge) => () => {
  const px = blank();
  for (let x = 23; x <= 40; x++) {
    plot(px, x, y, hex(edge));
    plot(px, x, y + 1, hex(c));
  }
  plot(px, 31, y - 1, hex(c));
  plot(px, 32, y - 1, hex(c));
  return px;
};

/** Brass goggles pushed up on the forehead (Ivo). */
const goggles = () => {
  const px = blank();
  for (let x = 23; x <= 40; x++) plot(px, x, 22, hex('#3a2a1a'));
  for (const x0 of [25, 33])
    for (let y = 20; y <= 24; y++)
      for (let x = x0; x <= x0 + 5; x++) {
        const edge = y === 20 || y === 24 || x === x0 || x === x0 + 5;
        plot(px, x, y, hex(edge ? '#6a4a1e' : y === 21 && x < x0 + 3 ? '#d8f4ff' : '#58b4d0'));
      }
  return px;
};

/** A lit storm lantern hanging from the right hand. */
const lantern = (body) => {
  const px = blank();
  const x0 = handX(body) - 2;
  const y0 = 47;
  plot(px, x0 + 2, y0, hex('#2a2a2e'));
  plot(px, x0 + 3, y0, hex('#2a2a2e'));
  for (let y = 1; y <= 9; y++)
    for (let x = 0; x <= 5; x++) {
      const frame = x === 0 || x === 5 || y === 1 || y === 9 || y === 2;
      plot(px, x0 + x, y0 + y, hex(frame ? '#2a2a2e' : y < 5 ? '#fff4b8' : '#ffc84a'));
    }
  return px;
};

/** A short sword held point-down in the right hand (Renard). */
const shortSword = (body) => {
  const px = blank();
  const x = handX(body);
  for (let y = 44; y <= 47; y++) {
    plot(px, x - 1, y, wood[0]);
    plot(px, x, y, wood[2]);
    plot(px, x + 1, y, wood[0]);
  }
  for (let k = -2; k <= 2; k++) plot(px, x + k, 48, gold[1]);
  for (let y = 49; y <= 60; y++) {
    plot(px, x - 1, y, steel[0]);
    plot(px, x, y, y > 58 ? steel[1] : steel[3]);
    plot(px, x + 1, y, steel[0]);
  }
  return px;
};

/** Small violet void sparks around the feet (Kuro, eroded). */
const voidSparks = () => {
  const px = blank();
  for (const [x, y] of [
    [20, 58],
    [22, 55],
    [41, 57],
    [44, 53],
    [18, 50],
    [46, 49],
    [26, 61],
    [39, 61],
  ])
    plot(px, x, y, hex(y % 2 ? '#b48cff' : '#7a4ae0'));
  return px;
};

/** Plots into an S x S canvas. */
const plotS = (px, S, x, y, c) => {
  if (x >= 0 && y >= 0 && x < S && y < S) px.set([...c, 255], (y * S + x) * 4);
};

/** The amnesiac king's throne: a tall carved back behind him (dark violet wood, gold trim). */
const throneBack = () => {
  const px = blank();
  const [O, D, M, L] = ['#120c1a', '#2e2040', '#4a3664', '#6a5088'].map(hex);
  const cushion = ['#3a0c18', '#6a1a2c'].map(hex);
  for (let y = 6; y <= 60; y++)
    for (let x = 15; x <= 48; x++) {
      const top = y < 12 && Math.abs(x - 31.5) > 4 + (y - 6) * 2.5;
      if (top) continue;
      const edge =
        x === 15 || x === 48 || y === 60 || (y < 12 && Math.abs(x - 31.5) > 2.5 + (y - 6) * 2.5);
      const trim = x === 16 || x === 47 || y === 13;
      const inner = x >= 20 && x <= 43 && y >= 15 && y <= 50;
      plot(
        px,
        x,
        y,
        edge
          ? O
          : trim
            ? gold[2]
            : inner
              ? cushion[(x + y) % 7 === 0 ? 1 : 0]
              : x < 20
                ? L
                : x > 43
                  ? D
                  : M,
      );
    }
  for (const [x, y] of [
    [31, 4],
    [32, 4],
    [31, 5],
    [32, 5],
  ])
    plot(px, x, y, gold[2]);
  return px;
};

/** The throne's arms and front posts, in front of the king's hands. */
const throneArms = () => {
  const px = blank();
  const [O, M, L] = ['#120c1a', '#4a3664', '#6a5088'].map(hex);
  for (const x0 of [12, 45])
    for (let y = 42; y <= 60; y++)
      for (let x = x0; x <= x0 + 6; x++) {
        const edge = x === x0 || x === x0 + 6 || y === 60;
        plot(px, x, y, edge ? O : y <= 43 ? gold[2] : x === x0 + 1 ? L : M);
      }
  return px;
};

/** Chronos reborn: a great halo behind the head. */
const bigHalo = ({ S, ox, oy }) => {
  const px = Buffer.alloc(S * S * 4);
  const cx = ox + 32;
  const cy = oy + 23;
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d > 30.5 || d < 25.5) continue;
      plotS(px, S, x, y, hex(d > 29.6 || d < 26.4 ? '#7a6a3a' : d > 28 ? '#f4ecd0' : '#fff8e4'));
    }
  for (let a = 0; a < 12; a++) {
    const t = (a / 12) * Math.PI * 2;
    const x = Math.round(cx + Math.cos(t) * 28);
    const y = Math.round(cy + Math.sin(t) * 28);
    plotS(px, S, x, y, hex('#ffd666'));
    plotS(px, S, x + 1, y, hex('#ffd666'));
  }
  return px;
};

/** Chronos reborn: the long gold train flaring to the ground, white panel down the middle. */
const robeTrain = ({ S, ox, oy }) => {
  const px = Buffer.alloc(S * S * 4);
  const top = oy + 45;
  const bottom = S - 2;
  const ramp = ['#4a320c', '#96681e', '#d0a040', '#f2d488'].map(hex);
  for (let y = top; y <= bottom; y++) {
    const half = Math.round(9 + Math.pow((y - top) / (bottom - top), 1.5) * 15);
    for (let x = ox + 32 - half; x <= ox + 32 + half; x++) {
      const k = (x - (ox + 32 - half)) / (2 * half);
      const edge = x === ox + 32 - half || x === ox + 32 + half || y === bottom;
      const fringe = y >= bottom - 2 && x % 2 === 0;
      const band = (y - top) % 9 === 8;
      const inner = Math.abs(x - (ox + 32)) <= 3;
      plotS(
        px,
        S,
        x,
        y,
        edge || fringe
          ? ramp[0]
          : inner
            ? hex('#f6f0e2')
            : band
              ? ramp[1]
              : ramp[k < 0.3 ? 3 : k < 0.7 ? 2 : 1],
      );
    }
  }
  return px;
};

/** Gold motes drifting around a divine figure. */
const motes = ({ S }) => {
  const px = Buffer.alloc(S * S * 4);
  for (const [x, y] of [
    [10, 30],
    [84, 22],
    [16, 60],
    [80, 54],
    [6, 78],
    [88, 80],
    [24, 12],
    [70, 8],
  ])
    plotS(px, S, x, y, hex(y % 3 ? '#ffe9a0' : '#fff8e0'));
  return px;
};

/** The First Forgotten: a huge bell-shaped cloak of erased violet, banded, a row of gold beads. */
const bellCloak = ({ S, ox, oy }) => {
  const px = Buffer.alloc(S * S * 4);
  const top = oy + 34;
  const bottom = S - 2;
  const ramp = ['#06030c', '#140c22', '#241a38', '#362a50'].map(hex);
  for (let y = top; y <= bottom; y++) {
    const t = (y - top) / (bottom - top);
    const half = Math.round(12 + Math.pow(t, 2.2) * 26 + (t > 0.92 ? -(t - 0.92) * 20 : 0));
    for (let x = ox + 32 - half; x <= ox + 32 + half; x++) {
      const k = (x - (ox + 32 - half)) / (2 * half);
      const edge = x === ox + 32 - half || x === ox + 32 + half || y === bottom;
      const band = (y - top) % 8 === 7;
      plotS(px, S, x, y, edge ? ramp[0] : band ? ramp[1] : ramp[k < 0.3 ? 3 : k < 0.75 ? 2 : 1]);
    }
    if (y - top === 28)
      for (let x = ox + 32 - half + 3; x <= ox + 32 + half - 3; x += 4)
        plotS(px, S, x, y, hex('#d8a83a'));
  }
  return px;
};

/** The First Forgotten: broken chains arching high over the head. */
const bigChains = ({ S, ox, oy }) => {
  const px = Buffer.alloc(S * S * 4);
  for (const side of [-1, 1])
    for (let k = 0; k <= 22; k++) {
      if (k === 9 || k === 10) continue; // the break
      const t = (k / 22) * Math.PI * 0.8;
      const x = Math.round(ox + 32 + side * (9 + Math.sin(t) * 16));
      const y = Math.round(oy + 22 - Math.cos(t) * 24);
      plotS(px, S, x, y, hex(k % 2 ? '#e6e2f0' : '#8a7cb0'));
      plotS(px, S, x, y + 1, hex(k % 2 ? '#8a7cb0' : '#2a2238'));
    }
  return px;
};

/** The First Forgotten: two gold processional staffs planted either side. */
const staffs = ({ S }) => {
  const px = Buffer.alloc(S * S * 4);
  for (const x of [12, S - 15]) {
    for (let y = 36; y <= S - 2; y++) {
      plotS(px, S, x, y, gold[0]);
      plotS(px, S, x + 1, y, y % 4 ? gold[1] : gold[2]);
      plotS(px, S, x + 2, y, gold[0]);
    }
    for (let k = -3; k <= 5; k++) plotS(px, S, x + k, 42, gold[k === -3 || k === 5 ? 0 : 2]);
    for (let y = 30; y <= 36; y++) plotS(px, S, x + 1, y, gold[2]);
    plotS(px, S, x + 1, 29, hex('#fff4c8'));
  }
  return px;
};

/** A tall shield held in front by the viewer-left hand, with an emblem. */
const towerShield = (face, rim, emblem) => () => {
  const px = blank();
  for (let y = 33; y <= 55; y++)
    for (let x = 13; x <= 27; x++) {
      const corner = (y === 33 || y === 55) && (x === 13 || x === 27);
      if (corner) continue;
      const edge = x === 13 || x === 27 || y === 33 || y === 55;
      const bevel = x === 14 || x === 26 || y === 34 || y === 54;
      plot(px, x, y, hex(edge ? '#120f17' : bevel ? rim : face));
    }
  for (const [dx, dy] of [
    [0, -3],
    [0, -2],
    [-1, -1],
    [0, -1],
    [1, -1],
    [-3, 0],
    [-2, 0],
    [-1, 0],
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
    [0, 2],
    [0, 3],
  ])
    plot(px, 20 + dx, 44 + dy, hex(emblem));
  return px;
};

/** A plain spear upright in the viewer-right hand. */
const spear = (body) => {
  const px = blank();
  const x = handX(body);
  pole(px, x, 8, wood);
  for (let y = 1; y <= 8; y++) {
    const w = y <= 2 || y >= 7 ? 0 : 1;
    for (let k = -w; k <= w + 1; k++)
      plot(px, x + k, y, k === -w || k === w + 1 ? steel[0] : k === 0 ? steel[3] : steel[2]);
  }
  return px;
};

/** A war banner on a pole in the viewer-right hand, the cloth flying out to the right. */
const banner = (cloth, trim) => (body) => {
  const px = blank();
  const x = handX(body);
  pole(px, x, 4, wood);
  plot(px, x, 2, gold[2]);
  plot(px, x + 1, 2, gold[2]);
  plot(px, x, 3, gold[1]);
  for (let y = 5; y <= 17; y++) {
    const reach = 11 + (y % 4 < 2 ? 0 : 1);
    for (let k = 2; k <= reach; k++) {
      const edge = y === 5 || y === 17 || k === reach;
      plot(px, x + k, y, hex(edge ? trim : (k + y) % 9 === 0 ? trim : cloth));
    }
  }
  return px;
};

/** Curved bone horns on either side of the helmet. */
const horns = () => {
  const px = blank();
  for (const side of [-1, 1])
    for (const [dx, dy] of [
      [10, 4],
      [11, 3],
      [12, 2],
      [12, 1],
      [13, 0],
      [13, -1],
      [13, -2],
      [12, -3],
    ]) {
      plot(px, 32 + side * dx - (side < 0 ? 1 : 0), 20 + dy, hex(dy < -1 ? '#f0e8d4' : '#c8bc9e'));
      plot(px, 32 + side * (dx + 1) - (side < 0 ? 1 : 0), 20 + dy, hex('#120f17'));
    }
  return px;
};

/** A crossbow levelled across the chest, pointing to the viewer's left. */
const crossbow = () => {
  const px = blank();
  for (let x = 14; x <= 36; x++) {
    plot(px, x, 43, hex('#120f17'));
    plot(px, x, 44, hex(x < 18 ? '#8c96a8' : '#5a3c22'));
    plot(px, x, 45, hex('#120f17'));
  }
  for (let y = 36; y <= 52; y++) {
    plot(px, 18, y, hex('#120f17'));
    plot(px, 19, y, hex('#3a2a1e'));
  }
  for (let y = 37; y <= 51; y++) plot(px, 21 + Math.round(Math.abs(y - 44) / 3), y, hex('#c8c0b0'));
  plot(px, 13, 44, hex('#d0d6e0'));
  return px;
};

/** A staff upright in the viewer-right hand, with a glowing head of the given colours. */
const staff = (head, glow) => (body) => {
  const px = blank();
  const x = handX(body);
  pole(px, x, 10, wood);
  for (const [dx, dy, c] of [
    [0, 9, head],
    [1, 9, head],
    [-1, 8, head],
    [0, 8, glow],
    [1, 8, glow],
    [2, 8, head],
    [-1, 7, head],
    [0, 7, glow],
    [1, 7, glow],
    [2, 7, head],
    [0, 6, head],
    [1, 6, head],
  ])
    plot(px, x + dx, dy, hex(c));
  return px;
};

/** A heavy gold-headed hammer upright in the viewer-right hand. */
const hammer = (body) => {
  const px = blank();
  const x = handX(body);
  pole(px, x, 14, wood);
  for (let y = 5; y <= 13; y++)
    for (let k = -4; k <= 5; k++) {
      const edge = y === 5 || y === 13 || k === -4 || k === 5;
      plot(px, x + k, y, edge ? gold[0] : y < 8 ? gold[2] : gold[1]);
    }
  return px;
};

/** A clock face set in the chest (the second-hand warden). */
const clockFace = () => {
  const px = blank();
  for (let y = 35; y <= 47; y++)
    for (let x = 26; x <= 38; x++) {
      const d = Math.hypot(x - 32, y - 41);
      if (d > 6.4) continue;
      plot(px, x, y, hex(d > 5.4 ? '#3e2c12' : d > 4.6 ? '#c8964a' : '#f2ecdc'));
    }
  for (const [x, y] of [
    [32, 38],
    [32, 39],
    [32, 40],
    [32, 41],
    [33, 41],
    [34, 41],
    [35, 42],
  ])
    plot(px, x, y, hex('#120f17'));
  return px;
};

/** Cerulean blades growing from both hands (the nexus sentinel). */
const bladeArms = (body) => {
  const px = blank();
  const right = handX(body);
  for (const [hx, dir] of [
    [F - 1 - right, -1],
    [right, 1],
  ])
    for (let k = 0; k <= 12; k++) {
      const x = hx + Math.round(k * 0.45) * dir;
      const y = 48 + k;
      plot(px, x, y, hex(k > 9 ? '#e6f9ff' : '#00c8ff'));
      plot(px, x + dir, y, hex('#008ab8'));
    }
  return px;
};

/** A hole torn through the chest, the dark showing through (the hollow husk). */
const chestHole = () => {
  const px = blank();
  for (let y = 36; y <= 46; y++)
    for (let x = 27; x <= 37; x++) {
      const d = Math.hypot((x - 32) / 1.1, y - 41);
      if (d > 4.6) continue;
      plot(px, x, y, hex(d > 3.6 ? '#2e3038' : '#0a0a0e'));
    }
  return px;
};

/** Highest opaque row of a layer. */
function topRow(px) {
  for (let y = 0; y < F; y++) for (let x = 0; x < F; x++) if (px[(y * F + x) * 4 + 3] > 0) return y;
  return 0;
}

/** Layers drawn here rather than taken from a sheet; `body` is the character's body layer. */
const CUSTOM = {
  'custom:conical-hat': () =>
    conicalHat(topRow(layerFrame('character-head-heads-human-male-elderly', null))),
  'custom:halberd': halberd,
  'custom:tally-spear': tallySpear,
  'custom:greatsword': greatsword,
  'custom:satchel': satchel,
};

/** The standing down-facing frame of one layer, recoloured along its ramp. */
function layerFrame(id, ramp, body, col = 0) {
  if (typeof id === 'function') return id(body);
  if (CUSTOM[id]) return CUSTOM[id](body);
  const e = byId.get(id);
  if (!e) throw new Error(`Unknown LPC layer: ${id}`);
  const img = readPng(e.file);
  const px = Buffer.alloc(F * F * 4);
  for (let y = 0; y < F; y++)
    img.buf.copy(
      px,
      y * F * 4,
      ((DOWN_ROW * F + y) * img.w + col * F) * 4,
      ((DOWN_ROW * F + y) * img.w + col * F + F) * 4,
    );
  if (!ramp) return px;
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 8) continue;
    const l = lum(px[i], px[i + 1], px[i + 2]);
    lo = Math.min(lo, l);
    hi = Math.max(hi, l);
  }
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 8) continue;
    const t = hi > lo ? (lum(px[i], px[i + 1], px[i + 2]) - lo) / (hi - lo) : 0.5;
    const [r, g, b] = rampAt(ramp, t);
    px[i] = r;
    px[i + 1] = g;
    px[i + 2] = b;
  }
  return px;
}

/** Source-over of b onto a (both 64x64 RGBA). */
function over(a, b) {
  for (let i = 0; i < a.length; i += 4) {
    const sa = b[i + 3] / 255;
    if (sa === 0) continue;
    const da = a[i + 3] / 255;
    const oa = sa + da * (1 - sa);
    for (let k = 0; k < 3; k++)
      a[i + k] = Math.round((b[i + k] * sa + a[i + k] * da * (1 - sa)) / oa);
    a[i + 3] = Math.round(oa * 255);
  }
}

/** Lowest opaque row: where the soles are. */
function soles(px, S = F) {
  for (let y = S - 1; y >= 0; y--)
    for (let x = 0; x < S; x++) if (px[(y * S + x) * 4 + 3] > 0) return y;
  return S - 1;
}

/** Every pixel's alpha times k. */
function fade(px, k) {
  const out = Buffer.from(px);
  for (let i = 3; i < out.length; i += 4) out[i] = Math.round(out[i] * k);
  return out;
}

/** Kuro's Interval flicker: bands slip sideways and take a violet cast. */
function glitch(px, S = F) {
  const out = Buffer.alloc(px.length);
  for (let y = 0; y < S; y++) {
    const shift = [0, 2, -2, 1, -1][Math.floor(y / 5) % 5];
    for (let x = 0; x < S; x++) {
      const sx = x - shift;
      if (sx < 0 || sx >= S) continue;
      const si = (y * S + sx) * 4;
      const di = (y * S + x) * 4;
      px.copy(out, di, si, si + 4);
      if (out[di + 3] && shift) {
        out[di] = Math.min(255, out[di] * 0.7 + 60);
        out[di + 2] = Math.min(255, out[di + 2] * 0.7 + 110);
      }
    }
  }
  return out;
}

/**
 * The idle sheet: still, still, breath (upper body 1 px down), breath, repeated to `frames`
 * (the old animations' frame numbers). `glitch` marks Kuro's flicker frame, `flicker` makes odd
 * frames fainter (the forgotten child), `alpha` fades a spirit as a whole.
 */
function idleSheet(base, spec, S = F) {
  const n = spec.frames ?? 4;
  const breathFrom = soles(base, S) - 18;
  const breath = Buffer.alloc(base.length);
  for (let y = 0; y < S; y++) {
    const src = y < breathFrom && y > 0 ? y - 1 : y;
    base.copy(breath, y * S * 4, src * S * 4, (src + 1) * S * 4);
  }
  const sheet = Buffer.alloc(n * S * S * 4);
  for (let k = 0; k < n; k++) {
    let fr = k % 4 < 2 ? base : breath;
    if (spec.flicker) fr = k % 2 ? fade(base, 0.55) : base;
    if (k === spec.glitch) fr = glitch(fr, S);
    if (spec.alpha) fr = fade(fr, spec.alpha);
    for (let y = 0; y < S; y++) fr.copy(sheet, (y * n * S + k * S) * 4, y * S * 4, (y + 1) * S * 4);
  }
  return sheet;
}

/**
 * A larger canvas (owner, 2026-11-17: Chronos reborn and the First Forgotten should stand apart):
 * the 64 px figure keeps its pixel size and is set into an S x S frame, `lift` px off the ground,
 * with drawn layers under and over it (halo, train, bell cloak, chains, staffs).
 */
function bigFrame(base, spec) {
  const S = spec.size;
  const ox = (S - F) / 2;
  const oy = S - F - (spec.lift ?? 0);
  const ctx = { S, ox, oy };
  const out = Buffer.alloc(S * S * 4);
  for (const fn of spec.under ?? []) over(out, fn(ctx));
  const placed = Buffer.alloc(S * S * 4);
  for (let y = 0; y < F; y++)
    base.copy(placed, ((oy + y) * S + ox) * 4, y * F * 4, (y + 1) * F * 4);
  over(out, placed);
  for (const fn of spec.over ?? []) over(out, fn(ctx));
  return out;
}

/** Old (32 px, shown 2x) beside new (64 px, 1x), both at `zoom`, on a ground colour. */
function comparison(entries, zoom = 4) {
  const cell = 96 * zoom;
  const W = entries.length * cell * 2;
  const H = cell;
  const out = Buffer.alloc(W * H * 4);
  for (let i = 0; i < out.length; i += 4) out.set([118, 98, 72, 255], i);
  entries.forEach(([oldImg, frame], k) => {
    const draw = (src, sw, sx0, scale, ox, oy) => {
      for (let y = 0; y < sw; y++)
        for (let x = 0; x < sw; x++) {
          const si = (y * src.w + sx0 + x) * 4;
          if (src.buf[si + 3] < 8) continue;
          for (let dy = 0; dy < scale; dy++)
            for (let dx = 0; dx < scale; dx++)
              src.buf.copy(out, ((oy + y * scale + dy) * W + ox + x * scale + dx) * 4, si, si + 4);
        }
    };
    // Both stand on the same line: the old sprite at the size it has in game (32 px ones at 1.5x).
    const size = oldImg.h;
    const oldScale = Math.round(zoom * (size <= 32 ? 1.5 : 1));
    const ox = k * cell * 2;
    draw(
      oldImg,
      size,
      0,
      oldScale,
      ox + (cell - size * oldScale) / 2,
      H - size * oldScale - 2 * zoom,
    );
    const S = Math.round(Math.sqrt(frame.length / 4));
    draw({ w: S, buf: frame }, S, 0, zoom, ox + cell + (cell - S * zoom) / 2, H - S * zoom);
  });
  return { w: W, h: H, buf: out };
}

// Built here, once the drawn layers above exist.
const NPCS = npcSpecs();
const install = (process.argv.find((a, i) => process.argv[i - 1] === '--install') ?? '')
  .split(',')
  .filter(Boolean);
fs.mkdirSync(OUT, { recursive: true });
const shown = [];
let derived = readDerived();
for (const [name, spec] of Object.entries(NPCS)) {
  const base = Buffer.alloc(F * F * 4);
  const bodyId = spec.layers.find(
    ([l]) => typeof l === 'string' && l.startsWith('character-body-'),
  )[0];
  const body = layerFrame(bodyId, null, null, spec.col ?? 0);
  for (const [id, ramp] of spec.layers) over(base, layerFrame(id, ramp, body, spec.col ?? 0));
  const S = spec.size ?? F;
  const frame = spec.size ? bigFrame(base, spec) : base;
  const sheet = idleSheet(frame, spec, S);
  const png = encodePng((spec.frames ?? 4) * S, S, sheet);
  fs.writeFileSync(`${OUT}/${name}_idle.png`, png);
  shown.push([readPng(spec.old), frame]);
  console.log(`${name}: ${S}px, soles at y=${soles(frame, S)}`);
  if (install.includes(name)) {
    const enemy = spec.kind === 'enemy';
    const dir = enemy ? 'public/assets/lpc/enemies' : 'public/assets/lpc/npcs';
    const file = enemy ? `${dir}/${name.replace(/^enemy_/, '')}.png` : `${dir}/${name}_idle.png`;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, png);
    const id = enemy
      ? `derived-${name.replace(/_/g, '-')}`
      : `derived-npc-${name.replace(/_/g, '-')}`;
    derived = derived.filter((d) => d.id !== id);
    derived.push({
      id,
      file,
      sha256: createHash('sha256').update(png).digest('hex'),
      from: [
        ...new Set(
          spec.layers
            .map(([l]) => l)
            .filter((l) => typeof l === 'string' && !l.startsWith('custom:')),
        ),
      ].sort(),
      script: 'scripts/lpc/npcs.mjs',
      notes: `${name} at the LPC scale: generator layers recoloured to the character's design, ${spec.frames ?? 4}-frame idle.`,
    });
    console.log(`  installed ${file}`);
  }
}
const only = (process.argv.find((a, i) => process.argv[i - 1] === '--preview') ?? '')
  .split(',')
  .filter(Boolean);
const names = Object.keys(NPCS);
const cmp = comparison(only.length ? shown.filter((_, i) => only.includes(names[i])) : shown);
fs.writeFileSync(`${OUT}/preview.png`, encodePng(cmp.w, cmp.h, cmp.buf));
if (install.length) {
  derived.sort((a, b) => a.id.localeCompare(b.id));
  fs.writeFileSync('art-source/lpc/derived.json', JSON.stringify(derived, null, 2) + '\n');
  fs.writeFileSync('CREDITS.md', await renderCredits(manifest, derived));
}
