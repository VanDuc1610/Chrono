/**
 * CHRONO – the bosses redrawn at the LPC pixel size (Pipeline B, code-authored).
 *
 * Owner, 2026-11-18: the 48/64 px boss sheets were shown 1.15-1.4x and looked coarse beside the
 * LPC people. Each boss is drawn here in 96x96 frames at the people's pixel size and shown at
 * scale 1 (bosses.json), standing about 1.5x Peter's height, soles on y = 92 (45 px below the
 * frame centre, where the game's shadow falls). Frames keep the old meaning: 0-3 idle (breath,
 * glow pulse) and the `releasedFrame` (usually 4): the boss sinks to its knees, dimmed, where it
 * fell. Every pixel is placed by the shapes below; no external art.
 *
 * Output: art-source/bosses/candidates/<file>.png (+ _x3 previews); `--install` copies them to
 * public/assets/enemies/v2/. Usage: node scripts/author-bosses.js [--install] [name,name]
 */
import fs from 'fs';
import path from 'path';
import { encodePng, preview } from './pixel-art/pixel.js';
import { Canvas, OUTLINE } from './pixel-art/canvas.js';
import { readPng } from './pixel-art/png-read.js';

const S = 96;
const GROUND = 92;
const BOB = [0, -1, -2, -1];
const pulse = (k) => k === 1 || k === 2;
const R = {
  verdigris: ['#122a24', '#1e4438', '#2e6452', '#4a8a70', '#7ab49a'],
  bronze: ['#2e1c0c', '#4e3218', '#74502a', '#9c7440', '#c8a060'],
  diverGreen: ['#14301c', '#22482c', '#346a40', '#4e9058'],
  blackSteel: ['#08080c', '#14141c', '#22222e', '#343444', '#4c4c60'],
  gold: ['#4a3010', '#8c6420', '#c8963a', '#ecc870', '#fff0b0'],
  stone: ['#3a3c44', '#5a5e68', '#7e828c', '#a4a8b0', '#c8ccd2'],
  crystal: ['#0a0816', '#16122a', '#241e42', '#36305e'],
  bone: ['#6a5e48', '#9a8c70', '#c8bc9c', '#ece4cc'],
  blood: ['#2e0608', '#5e1016', '#8e1c24', '#c03038'],
  wood: ['#2a1a0e', '#46301c', '#664a2c'],
};

// ------------------------------------------------------------------ shared figure parts
/** An armoured giant: legs, torso, pauldrons, arms and a helm; returns key points. */
function giant(c, y, ramp, { helm = ramp, visor = '#4ae0ff', belt = '#3a2a1a' } = {}) {
  const top = y;
  c.poly(
    [
      [34, top + 52],
      [46, top + 52],
      [45, GROUND],
      [33, GROUND],
    ],
    ramp,
  ); // legs
  c.poly(
    [
      [50, top + 52],
      [62, top + 52],
      [63, GROUND],
      [51, GROUND],
    ],
    ramp,
  );
  c.poly(
    [
      [31, top + 22],
      [65, top + 22],
      [62, top + 54],
      [34, top + 54],
    ],
    ramp,
  ); // torso
  c.line(34, top + 50, 62, top + 50, belt);
  c.line(34, top + 51, 62, top + 51, belt);
  c.poly(
    [
      [22, top + 26],
      [31, top + 24],
      [32, top + 48],
      [24, top + 50],
    ],
    ramp,
  ); // arms
  c.poly(
    [
      [65, top + 24],
      [74, top + 26],
      [72, top + 50],
      [64, top + 48],
    ],
    ramp,
  );
  c.ellipse(29, top + 25, 8, 6, ramp); // pauldrons
  c.ellipse(67, top + 25, 8, 6, ramp);
  c.ellipse(48, top + 13, 9, 10, helm); // helm
  c.poly(
    [
      [41, top + 12],
      [55, top + 12],
      [55, top + 15],
      [41, top + 15],
    ],
    ['#06060a'],
  );
  c.line(43, top + 13, 53, top + 13, visor);
  return {
    hands: [
      [25, top + 50],
      [71, top + 50],
    ],
    chest: [48, top + 34],
  };
}

/** Sinks the figure to its knees (released): rows below the waist fold, colours dim. */
function kneel(src) {
  const out = new Canvas(S);
  let top = S;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (src.get(x, y)) top = Math.min(top, y);
  const waist = Math.round(top + (GROUND - top) * 0.58);
  const drop = Math.round((GROUND - waist) * 0.5);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      if (!src.px[i + 3]) continue;
      // upper body moves down by `drop`; the legs below the waist are squashed into half height
      const ny = y < waist ? y + drop : waist + drop + Math.round((y - waist) * 0.5);
      if (ny >= S) continue;
      const o = (ny * S + x) * 4;
      src.px.copy(out.px, o, i, i + 4);
      for (let k = 0; k < 3; k++) out.px[o + k] = Math.round(out.px[o + k] * 0.72);
    }
  return out;
}

// ------------------------------------------------------------------ the bosses
/** The Drowned Sentinel (chapter 0): a verdigris knight, cyan visor, sea-axe, a ring of water. */
function sentinel(k) {
  const c = new Canvas(S);
  const y = 14 + (k >= 2 ? 1 : 0);
  // the halberd behind, in the viewer-left hand
  c.line(18, 16, 18, GROUND, '#3a2a1a');
  c.line(19, 16, 19, GROUND, '#5a4024');
  c.poly(
    [
      [19, 16],
      [29, 22],
      [29, 34],
      [19, 38],
    ],
    R.stone,
    false,
  );
  const p = giant(c, y, R.verdigris, { visor: pulse(k) ? '#a6f0ff' : '#4ae0ff' });
  // barnacles and a sea-green plume
  for (const [bx, by] of [
    [38, y + 30],
    [56, y + 40],
    [27, y + 32],
    [69, y + 36],
    [44, y + 62],
    [58, y + 74],
  ])
    c.ellipse(bx, by, 1.6, 1.4, ['#c8ccd2', '#ece4cc']);
  c.poly(
    [
      [48, y + 2],
      [51, y - 4],
      [53, y + 3],
    ],
    R.verdigris,
  );
  c.ellipse(p.chest[0], p.chest[1], 3, 2, ['#c8a060', '#ece4cc']);
  c.outline(OUTLINE);
  // the water ring around him
  for (let a = 0; a < 40; a++) {
    const t = (a / 40) * Math.PI * 2 + k * 0.12;
    if (a % 3 === 0) continue;
    c.set(48 + Math.cos(t) * 42, 52 + Math.sin(t) * 40, a % 2 ? '#a6f0ff' : '#4ab0c4');
  }
  return c;
}

/** The Sunken Bellkeeper (chapter 1): a rusted diving suit, green-lit chest, a bell on its back. */
function bellkeeper(k) {
  const c = new Canvas(S);
  const y = 12 + (k >= 2 ? 1 : 0);
  // the bell on his back, showing over the shoulders
  c.poly(
    [
      [48, y + 6],
      [64, y + 12],
      [70, y + 34],
      [26, y + 34],
      [32, y + 12],
    ],
    R.bronze,
    false,
  );
  const p = giant(c, y + 4, R.bronze, { helm: R.bronze, visor: '#ffe08a', belt: '#2a1a0e' });
  c.ellipse(p.chest[0], p.chest[1], 9, 9, R.diverGreen);
  c.ellipse(
    p.chest[0],
    p.chest[1],
    4,
    4,
    pulse(k) ? ['#4ae08a', '#c4ffd4'] : ['#2aa860', '#4ae08a'],
  );
  // rivets and a hanging chain
  for (const [rx, ry] of [
    [36, y + 30],
    [60, y + 30],
    [36, y + 46],
    [60, y + 46],
  ])
    c.set(rx, ry, '#c8a060');
  for (let i = 0; i < 9; i++) c.set(71 + (i % 2), y + 54 + i * 2, '#8c96a8');
  c.outline(OUTLINE);
  return c;
}

/** The Imperial Verdict (chapter 2): a black-armoured judge, gold blindfold, scales and a burning blade. */
function imperialVerdict(k) {
  const c = new Canvas(S);
  const y = 14 + (k >= 2 ? 1 : 0);
  // the burning sword upright in the viewer-right hand
  c.poly(
    [
      [73, 16],
      [77, 16],
      [77, 62],
      [73, 62],
    ],
    ['#c8963a', '#ecc870', '#fff0b0'],
    false,
  );
  for (let yy = 18; yy < 62; yy += 4)
    c.set(78 + ((yy + k) % 2), yy, pulse(k) ? '#ffd27a' : '#ff9a3a');
  const p = giant(c, y, R.blackSteel, { visor: '#c8963a' });
  c.poly(
    [
      [39, y + 11],
      [57, y + 11],
      [57, y + 15],
      [39, y + 15],
    ],
    R.gold,
  ); // the blindfold
  // the gold sun on the breastplate
  c.ellipse(p.chest[0], p.chest[1], 4, 4, R.gold);
  for (let a = 0; a < 8; a++) {
    const t = (a / 8) * Math.PI * 2;
    c.set(p.chest[0] + Math.cos(t) * 6, p.chest[1] + Math.sin(t) * 6, '#ecc870');
  }
  // the scales held out to the viewer's left
  c.line(23, y + 50, 23, y + 40, '#8c6420');
  c.line(10, y + 40, 36, y + 40, '#c8963a');
  for (const sx of [10, 36]) {
    c.line(sx, y + 40, sx - 3, y + 48, '#8c6420');
    c.line(sx, y + 40, sx + 3, y + 48, '#8c6420');
    c.poly(
      [
        [sx - 5, y + 48],
        [sx + 5, y + 48],
        [sx + 3, y + 51],
        [sx - 3, y + 51],
      ],
      R.gold,
    );
  }
  c.outline(OUTLINE);
  return c;
}

/** The Faceless Keeper (chapter 3): a hooded stone archivist; where the face was, a pale mirror. */
function facelessKeeper(k) {
  const c = new Canvas(S);
  const y = 10 + BOB[k];
  c.poly(
    [
      [48, y],
      [62, y + 14],
      [70, GROUND - 2],
      [26, GROUND - 2],
      [34, y + 14],
    ],
    R.stone,
  );
  for (let yy = y + 30; yy < GROUND - 2; yy += 7)
    c.line(30 + (GROUND - yy) / 9, yy, 66 - (GROUND - yy) / 9, yy, '#5a5e68');
  c.ellipse(48, y + 16, 9, 11, ['#2a2c32', '#3a3c44']);
  c.ellipse(
    48,
    y + 16,
    6,
    8,
    pulse(k) ? ['#a6d8f0', '#e6f9ff', '#ffffff'] : ['#7ab4d0', '#a6d8f0', '#e6f9ff'],
  );
  // a long quill-blade in the viewer-right hand
  c.line(66, y + 44, 80, y + 18, '#c8ccd2');
  c.line(67, y + 44, 81, y + 18, '#7e828c');
  c.ellipse(64, y + 46, 3, 3, R.stone);
  c.outline(OUTLINE);
  return c;
}

/** The Nameless Choir (chapter 3): a dark crystal with a cerulean heart, six masks singing round it. */
function namelessChoir(k) {
  const c = new Canvas(S);
  const y = 10 + BOB[k];
  c.poly(
    [
      [48, y],
      [62, y + 30],
      [48, y + 72],
      [34, y + 30],
    ],
    R.crystal,
    false,
  );
  for (const [x0, y0, x1, y1] of [
    [41, y + 16, 50, y + 50],
    [52, y + 12, 46, y + 60],
    [38, y + 34, 58, y + 40],
  ])
    c.line(x0, y0, x1, y1, '#4a4280');
  c.ellipse(48, y + 34, 4, 6, pulse(k) ? ['#4ae0ff', '#e6f9ff'] : ['#00a8d8', '#4ae0ff']);
  c.outline(OUTLINE);
  for (let i = 0; i < 6; i++) {
    const t = (i / 6) * Math.PI * 2 + k * 0.18;
    const mx = 48 + Math.cos(t) * 34;
    const my = y + 34 + Math.sin(t) * 26;
    const m = new Canvas(S);
    m.ellipse(mx, my, 5, 6, ['#b4b8c4', '#e6e8ee', '#ffffff']);
    m.set(mx - 2, my - 1, '#120f17');
    m.set(mx + 2, my - 1, '#120f17');
    m.line(mx - 1, my + 2 + ((i + k) % 2), mx + 1, my + 2 + ((i + k) % 2), '#120f17');
    m.outline(OUTLINE);
    c.over(m);
  }
  return c;
}

/** The Crimson Standard (chapter 4): a war banner planted in a mound of broken arms, bleeding mist. */
function crimsonStandard(k) {
  const c = new Canvas(S);
  // the mound of shields, spears and bones
  c.ellipse(48, GROUND - 6, 30, 9, R.bone);
  for (const [x0, y0, x1, y1] of [
    [24, GROUND - 4, 40, GROUND - 16],
    [56, GROUND - 14, 74, GROUND - 2],
    [32, GROUND - 10, 62, GROUND - 8],
  ])
    c.line(x0, y0, x1, y1, '#5a4024');
  c.ellipse(36, GROUND - 10, 6, 4, R.stone);
  c.ellipse(62, GROUND - 9, 5, 4, R.blood);
  // the pole and the banner, its cloth swaying
  c.poly(
    [
      [46, 8],
      [50, 8],
      [50, GROUND - 8],
      [46, GROUND - 8],
    ],
    R.wood,
    false,
  );
  c.ellipse(48, 7, 3, 3, R.gold);
  const sway = [0, 1, 2, 1][k];
  c.poly(
    [
      [50, 12],
      [84 + sway, 14],
      [80 + sway, 26],
      [86 + sway, 38],
      [76 + sway, 44],
      [80 + sway, 56],
      [50, 52],
    ],
    R.blood,
    false,
  );
  for (let yy = 16; yy < 50; yy += 6) c.line(52, yy, 78 + sway, yy + 1, '#5e1016');
  c.outline(OUTLINE);
  // blood mist at the foot
  for (const [mx, my] of [
    [20, GROUND - 2],
    [76, GROUND],
    [28, GROUND + 1],
    [70, GROUND - 4],
    [48, GROUND + 2],
  ])
    c.set(mx + ((k + mx) % 3) - 1, my, pulse(k) ? '#ff5a6a' : '#c03038');
  return c;
}

/** The Last War (chapter 4): a grey colossus bristling with the blades of every fallen army. */
function theLastWar(k) {
  const c = new Canvas(S);
  const y = 16 + (k >= 2 ? 1 : 0);
  // the fan of swords behind him
  for (let i = 0; i < 9; i++) {
    const t = -Math.PI / 2 + (i - 4) * 0.28 + (k % 2 ? 0.02 : 0);
    const x0 = 48 + Math.cos(t) * 10;
    const y0 = y + 26 + Math.sin(t) * 10;
    const x1 = 48 + Math.cos(t) * 40;
    const y1 = y + 26 + Math.sin(t) * 34;
    c.line(x0, y0, x1, y1, '#a4a8b0');
    c.line(x0 + 1, y0, x1 + 1, y1, '#5a5e68');
    c.set(x1, y1, '#e6e8ee');
  }
  const p = giant(c, y, ['#26282e', '#3e424a', '#5a5e68', '#7e828c', '#a4a8b0'], {
    visor: pulse(k) ? '#ffb43a' : '#e07a1a',
  });
  for (const [sx, sy] of [
    [41, y + 30],
    [55, y + 30],
    [48, y + 42],
  ]) {
    c.ellipse(sx, sy, 3, 3, ['#c8bc9c', '#ece4cc']);
    c.set(sx - 1, sy, '#120f17');
    c.set(sx + 1, sy, '#120f17');
  }
  c.ellipse(p.chest[0], p.chest[1] - 2, 3, 3, R.gold);
  c.outline(OUTLINE);
  return c;
}

/** The Unborn King (chapter 5): a vast robed king who never lived; white beard, cold crown. */
function unbornKing(k) {
  const c = new Canvas(S);
  const y = 8 + (k >= 2 ? 1 : 0);
  const robe = ['#8a94a6', '#b4bccc', '#d8dee8', '#f2f4f8'];
  c.poly(
    [
      [48, y + 18],
      [80, GROUND],
      [16, GROUND],
    ],
    robe,
  );
  for (let i = 0; i < 5; i++) {
    const yy = y + 34 + i * 11;
    c.line(48 - (yy - y - 18) * 0.5, yy, 48 + (yy - y - 18) * 0.5, yy - 6, '#8ab0d8');
  }
  c.ellipse(48, y + 62, 8, 5, ['#c8a060', '#e8c88a']);
  c.ellipse(48, y + 16, 9, 10, ['#c8a88a', '#e2c4a6', '#f2dcc2']); // face
  c.poly(
    [
      [39, y + 18],
      [57, y + 18],
      [52, y + 36],
      [44, y + 36],
    ],
    ['#b4b8c4', '#e6e8ee', '#ffffff'],
  ); // beard
  c.set(44, y + 14, '#3a4a6a');
  c.set(52, y + 14, '#3a4a6a');
  for (let i = 0; i < 5; i++)
    c.poly(
      [
        [38 + i * 5, y + 7],
        [40 + i * 5, y - 1],
        [42 + i * 5, y + 7],
      ],
      R.gold,
    );
  c.line(38, y + 7, 58, y + 7, '#8c6420');
  c.outline(OUTLINE);
  for (const [mx, my] of [
    [20, y + 10],
    [76, y + 20],
    [14, y + 40],
  ])
    c.set(mx, my + (k % 2), '#e6f0ff');
  return c;
}

/** The Broken Herald (chapter 6): a navy-robed herald, white masked helm, splintered antler-wings. */
function brokenHerald(k) {
  const c = new Canvas(S);
  const y = 14 + BOB[k];
  for (const s of [-1, 1])
    for (let i = 0; i < 4; i++) {
      const x0 = 48 + s * 8;
      const yy = y + 24 + i * 3;
      c.line(x0, yy, x0 + s * (16 + i * 4), yy - 10 + i * 2, '#6a4a2c');
      c.line(x0 + s * (10 + i * 3), yy - 6 + i, x0 + s * (12 + i * 3), yy - 12 + i, '#8c6a44');
    }
  c.poly(
    [
      [48, y + 18],
      [66, GROUND - 2],
      [30, GROUND - 2],
    ],
    ['#0c1020', '#161e36', '#22305a', '#30406e'],
  );
  for (let yy = y + 40; yy < GROUND - 2; yy += 6)
    c.line(36 + (GROUND - yy) / 6, yy, 60 - (GROUND - yy) / 6, yy, '#0c1020');
  c.line(36, y + 38, 60, y + 38, '#c8963a');
  c.ellipse(48, y + 14, 8, 9, ['#a4a8b0', '#d8dce6', '#f6f8fc']);
  c.line(43, y + 14, 53, y + 14, pulse(k) ? '#a6f0ff' : '#4ae0ff');
  c.outline(OUTLINE);
  return c;
}

/** The Remnant Deacon (chapter 6): a tall silver-robed deacon, a pale mask, a great square hammer. */
function remnantDeacon(k) {
  const c = new Canvas(S);
  const y = 12 + BOB[k];
  c.line(70, y + 8, 70, GROUND - 4, '#5a4024');
  c.line(71, y + 8, 71, GROUND - 4, '#3a2a1a');
  c.poly(
    [
      [62, y],
      [80, y],
      [80, y + 12],
      [62, y + 12],
    ],
    R.stone,
  );
  c.poly(
    [
      [48, y + 12],
      [64, GROUND - 2],
      [32, GROUND - 2],
    ],
    R.stone,
  );
  for (let yy = y + 30; yy < GROUND - 2; yy += 6)
    c.line(36 + (GROUND - yy) / 5, yy, 60 - (GROUND - yy) / 5, yy, '#7e828c');
  c.line(48, y + 22, 48, GROUND - 2, '#c8963a');
  c.ellipse(48, y + 10, 7, 8, ['#c8c0e0', '#e6e0f4', '#f6f2fc']);
  c.set(45, y + 9, '#4a3a6a');
  c.set(51, y + 9, '#4a3a6a');
  c.ellipse(66, y + 40, 3, 3, R.stone); // the hand on the haft
  c.outline(OUTLINE);
  return c;
}

/** The Genesis Warden (chapter 6): a pale lion-sphinx crowned in gold, a gold orb under its paw. */
function genesisWarden(k) {
  const c = new Canvas(S);
  const pale = ['#7e828c', '#a8acb6', '#d0d4dc', '#eef0f4'];
  const breath = k >= 2 ? 1 : 0;
  c.ellipse(52, GROUND - 14, 30, 13 + breath, pale); // the body, lying
  c.poly(
    [
      [24, GROUND - 6],
      [36, GROUND - 6],
      [36, GROUND],
      [22, GROUND],
    ],
    pale,
  ); // forepaws
  c.ellipse(30, GROUND - 30, 11, 12, pale); // head and mane
  c.ellipse(30, GROUND - 28, 7, 8, ['#c8b8a0', '#e6d8c2']);
  c.poly(
    [
      [22, GROUND - 40],
      [24, GROUND - 48],
      [27, GROUND - 41],
      [30, GROUND - 50],
      [33, GROUND - 41],
      [36, GROUND - 48],
      [38, GROUND - 40],
    ],
    R.gold,
  );
  for (const x of [27, 33]) c.set(x, GROUND - 30, pulse(k) ? '#ffe08a' : '#c8963a');
  c.ellipse(18, GROUND - 5, 5, 5, pulse(k) ? ['#c8963a', '#fff0b0'] : R.gold); // the orb
  c.poly(
    [
      [80, GROUND - 22],
      [88, GROUND - 32 + (k % 2)],
      [84, GROUND - 20],
    ],
    pale,
  ); // tail
  c.outline(OUTLINE);
  return c;
}

/** The Echo of the First Forgotten (chapter 6): a tiered shroud of violet mist bound by gold chains. */
function echoForgotten(k) {
  const c = new Canvas(S);
  const y = 14 + BOB[k];
  const mist = ['#0c0818', '#1a1230', '#2a2050', '#3c3070'];
  for (let i = 0; i < 5; i++) {
    const w = 9 + i * 5;
    c.poly(
      [
        [48 - w, y + 14 + i * 13],
        [48 + w, y + 14 + i * 13],
        [48 + w + 3, y + 28 + i * 13],
        [48 - w - 3, y + 28 + i * 13],
      ],
      mist,
    );
  }
  c.ellipse(48, y + 10, 9, 9, mist);
  c.set(45, y + 10, '#e8e0ff');
  c.set(51, y + 10, '#e8e0ff');
  for (let i = 0; i < 4; i++) {
    const yy = y + 26 + i * 13;
    const w = 12 + i * 5;
    for (let x = 48 - w; x <= 48 + w; x += 3)
      c.set(x, yy + Math.round(Math.sin(x / 3 + k) * 1), '#d8a83a');
  }
  c.outline(OUTLINE);
  for (const [mx, my] of [
    [24, y + 30],
    [72, y + 40],
    [20, y + 60],
    [76, y + 66],
    [30, y + 72],
  ])
    c.set(mx, my + ((k + mx) % 3) - 1, '#b48cff');
  return c;
}

/** The Nameless Weeper (chapter 7): a heavy violet mass with three faces, all weeping. */
function namelessWeeper(k) {
  const c = new Canvas(S);
  const y = GROUND - 30 + (k >= 2 ? 1 : 0);
  c.ellipse(48, y, 32, 26, ['#160e28', '#2a1e46', '#3e2e66', '#56428a']);
  for (const [fx, fy] of [
    [36, y - 6],
    [58, y - 8],
    [47, y + 8],
  ]) {
    c.ellipse(fx, fy, 7, 8, ['#5a4a7e', '#7a6aa0', '#9a8ac0']);
    c.set(fx - 3, fy - 1, '#120a20');
    c.set(fx + 3, fy - 1, '#120a20');
    c.line(fx - 2, fy + 4, fx + 2, fy + 4, '#120a20');
    for (let t = 0; t < 4 + ((k + fx) % 3); t++) c.set(fx - 3, fy + 1 + t, '#a6d8ff');
  }
  c.outline(OUTLINE);
  return c;
}

/** The Primordial Shade (chapter 7): a vast hood whose cloak is the night before the first hour. */
function primordialShade(k) {
  const c = new Canvas(S);
  const y = 10 + BOB[k];
  c.poly(
    [
      [48, y],
      [66, y + 20],
      [78, GROUND - 2],
      [18, GROUND - 2],
      [30, y + 20],
    ],
    ['#04020a', '#0c0818', '#16102a', '#221a3e'],
  );
  c.ellipse(48, y + 16, 9, 9, ['#020106']);
  c.set(45, y + 16, '#f4f0ff');
  c.set(51, y + 16, '#f4f0ff');
  c.outline(OUTLINE);
  // stars inside the cloak, turning slowly
  for (let i = 0; i < 18; i++) {
    const sx = 30 + ((i * 37 + k * 3) % 36);
    const sy = y + 30 + ((i * 23) % 52);
    if (c.get(sx, sy) && sx > 28 && sx < 68) c.set(sx, sy, i % 3 ? '#b48cff' : '#ffffff');
  }
  return c;
}

/** The Convergent Praetor (chapter 7): one judge in two eras, the robe split cream and crimson. */
function convergentPraetor(k) {
  const c = new Canvas(S);
  const y = 12 + (k >= 2 ? 1 : 0);
  c.poly(
    [
      [48, y + 20],
      [48, GROUND],
      [26, GROUND],
      [34, y + 24],
    ],
    ['#8a8070', '#c8bea8', '#ece4d0'],
  );
  c.poly(
    [
      [48, y + 20],
      [62, y + 24],
      [70, GROUND],
      [48, GROUND],
    ],
    R.blood,
  );
  c.line(48, y + 22, 48, GROUND, '#c8963a');
  c.ellipse(48, y + 14, 8, 9, ['#a87454', '#d8a07a', '#f0c49e']);
  c.set(45, y + 13, '#2a1a10');
  c.set(51, y + 13, '#2a1a10');
  for (let i = 0; i < 4; i++)
    c.poly(
      [
        [41 + i * 4, y + 6],
        [43 + i * 4, y],
        [45 + i * 4, y + 6],
      ],
      R.gold,
    );
  // the scepter (viewer left) and the white shield (viewer right)
  c.line(24, y + 22, 24, y + 64, '#8c6420');
  c.ellipse(24, y + 20, 4, 4, R.gold);
  c.line(20, y + 28, 28, y + 28, '#ecc870');
  c.poly(
    [
      [64, y + 34],
      [80, y + 34],
      [80, y + 58],
      [72, y + 64],
      [64, y + 58],
    ],
    ['#b4bccc', '#e6e8ee', '#ffffff'],
  );
  c.line(72, y + 38, 72, y + 58, '#c8963a');
  c.line(67, y + 46, 77, y + 46, '#c8963a');
  c.outline(OUTLINE);
  return c;
}

/** The Null-Hour Herald (chapter 8): a black clock-tower of a body, its face stopped near midnight. */
function nullHourHerald(k) {
  const c = new Canvas(S);
  const y = 6 + (k >= 2 ? 1 : 0);
  c.poly(
    [
      [48, y + 4],
      [86, GROUND],
      [10, GROUND],
    ],
    ['#08060e', '#14101e', '#201a30', '#2e2644'],
  );
  c.ellipse(48, y + 10, 7, 7, ['#08060e', '#14101e']);
  c.set(46, y + 10, '#e8e0ff');
  c.set(50, y + 10, '#e8e0ff');
  c.ellipse(48, y + 52, 21, 21, R.gold);
  c.ellipse(48, y + 52, 18, 18, ['#d8d0bc', '#f2ecdc']);
  for (let h = 0; h < 12; h++) {
    const t = (h / 12) * Math.PI * 2;
    c.set(48 + Math.cos(t) * 15, y + 52 + Math.sin(t) * 15, h % 3 ? '#8c6420' : '#c03038');
  }
  const minute = -Math.PI / 2 - 0.08 + (k % 2 ? 0.04 : 0);
  c.line(48, y + 52, 48 + Math.cos(minute) * 15, y + 52 + Math.sin(minute) * 15, '#120f17');
  c.line(
    48,
    y + 52,
    48 + Math.cos(-Math.PI / 2 - 0.3) * 9,
    y + 52 + Math.sin(-Math.PI / 2 - 0.3) * 9,
    '#120f17',
  );
  c.ellipse(48, y + 52, 1.5, 1.5, ['#c8963a']);
  for (const [bx, by] of [
    [16, GROUND - 4],
    [80, GROUND - 4],
    [30, y + 30],
    [66, y + 30],
  ])
    c.ellipse(bx, by, 3, 3, R.gold);
  c.outline(OUTLINE);
  return c;
}

/** The Sixfold Echo (chapter 8): a striped robe of six echoes, gems of each, two lights circling. */
function sixfoldEcho(k) {
  const c = new Canvas(S);
  const y = 14 + BOB[k % 4];
  c.poly(
    [
      [48, y + 14],
      [70, GROUND - 2],
      [26, GROUND - 2],
    ],
    ['#141c34', '#1e2a4e', '#2a3a6a'],
  );
  for (let yy = y + 26; yy < GROUND - 2; yy += 5)
    c.line(48 - (yy - y - 14) * 0.48, yy, 48 + (yy - y - 14) * 0.48, yy, '#4ab0e0');
  c.ellipse(48, y + 10, 8, 8, ['#0c1020', '#1a2240', '#2a3460']);
  c.set(45, y + 10, '#e6f0ff');
  c.set(51, y + 10, '#e6f0ff');
  ['#ff4a5a', '#4ae0a0', '#ffe08a', '#b48cff', '#4ae0ff', '#ffffff'].forEach((g, i) =>
    c.ellipse(38 + (i % 3) * 10, y + 50 + Math.floor(i / 3) * 14, 2, 2, [g]),
  );
  c.outline(OUTLINE);
  for (const [s, col] of [
    [1, ['#e6e8ee', '#ffffff']],
    [-1, ['#2a8ad8', '#4ae0ff']],
  ]) {
    const t = k * 0.6 + (s > 0 ? 0 : Math.PI);
    const o = new Canvas(S);
    o.ellipse(48 + Math.cos(t) * 32, y + 30 + Math.sin(t) * 10, 4, 4, col);
    o.outline(OUTLINE);
    c.over(o);
  }
  return c;
}

/** The Primeval Architect (chapter 9): a violet construct with a cyan visor, four gold gears in orbit. */
function primevalArchitect(k) {
  const c = new Canvas(S);
  const y = 12 + (k >= 2 ? 1 : 0);
  const body = ['#1e1638', '#322658', '#4a3a7e', '#6650a4'];
  c.poly(
    [
      [34, y + 54],
      [44, y + 54],
      [44, GROUND],
      [34, GROUND],
    ],
    body,
  );
  c.poly(
    [
      [52, y + 54],
      [62, y + 54],
      [62, GROUND],
      [52, GROUND],
    ],
    body,
  );
  c.poly(
    [
      [30, y + 20],
      [66, y + 20],
      [66, y + 56],
      [30, y + 56],
    ],
    body,
  );
  c.poly(
    [
      [38, y],
      [58, y],
      [58, y + 18],
      [38, y + 18],
    ],
    body,
  );
  c.poly(
    [
      [42, y + 6],
      [54, y + 6],
      [54, y + 10],
      [42, y + 10],
    ],
    pulse(k) ? ['#a6f0ff', '#e6f9ff'] : ['#4ae0ff', '#a6f0ff'],
  );
  c.poly(
    [
      [42, y + 30],
      [54, y + 30],
      [54, y + 42],
      [42, y + 42],
    ],
    ['#00a8d8', '#4ae0ff'],
  );
  c.outline(OUTLINE);
  for (let i = 0; i < 4; i++) {
    const t = (i / 4) * Math.PI * 2 + Math.PI / 4 + k * 0.1;
    const gx = 48 + Math.cos(t) * 36;
    const gy = y + 40 + Math.sin(t) * 30;
    const g = new Canvas(S);
    for (let a = 0; a < 8; a++) {
      const u = (a / 8) * Math.PI * 2 + k * 0.3;
      g.ellipse(gx + Math.cos(u) * 7, gy + Math.sin(u) * 7, 1.6, 1.6, ['#c8963a']);
    }
    g.ellipse(gx, gy, 6, 6, R.gold);
    g.ellipse(gx, gy, 2, 2, ['#5a3a14']);
    g.outline(OUTLINE);
    c.over(g);
  }
  return c;
}

/** The Sixfold Divinity (chapter 9): a tall dark spire of a god, six coloured rays for arms. */
function sixfoldDivinity(k) {
  const c = new Canvas(S);
  const y = 8 + BOB[k % 4];
  const rays = ['#4ae0ff', '#ff5a5a', '#ffe08a', '#b48cff', '#ffffff', '#4ae0a0'];
  rays.forEach((col, i) => {
    const s = i % 2 ? 1 : -1;
    const yy = y + 22 + Math.floor(i / 2) * 10;
    const len = 26 + (pulse(k) ? 3 : 0);
    c.line(48 + s * 6, yy, 48 + s * len, yy - 8 + Math.floor(i / 2) * 3, col);
    c.line(48 + s * 6, yy + 1, 48 + s * len, yy - 7 + Math.floor(i / 2) * 3, col);
  });
  c.poly(
    [
      [48, y + 10],
      [64, GROUND - 2],
      [32, GROUND - 2],
    ],
    ['#0c1430', '#18244e', '#26386e', '#36508e'],
  );
  for (let yy = y + 30; yy < GROUND - 2; yy += 8)
    c.line(48 - (yy - y - 10) * 0.37, yy, 48 + (yy - y - 10) * 0.37, yy, '#4a62a8');
  c.ellipse(48, y + 8, 7, 8, ['#0c1430', '#26386e']);
  c.set(46, y + 8, '#e6f9ff');
  c.set(50, y + 8, '#e6f9ff');
  c.ellipse(48, y + 34, 4, 4, pulse(k) ? ['#4ae0ff', '#ffffff'] : ['#00a8d8', '#4ae0ff']);
  c.outline(OUTLINE);
  return c;
}

/** The Void Singularity Core (chapter 9): a black sphere with a violet heart, arms of light swirling in. */
function voidSingularity(k) {
  const c = new Canvas(S);
  const cy = 50;
  for (let arm = 0; arm < 4; arm++)
    for (let i = 0; i < 40; i++) {
      const t = i / 40;
      const a = arm * (Math.PI / 2) + t * 4 + k * 0.25;
      const r = 14 + t * 30;
      const x = 48 + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r * 0.85;
      if (i % 2) c.set(x, y, t > 0.6 ? '#4ab0e0' : '#4ae0ff');
    }
  c.ellipse(48, cy, 16, 16, ['#020106', '#0a0614', '#140c26']);
  c.ellipse(48, cy, 6, 6, pulse(k) ? ['#7a4ae0', '#e0d0ff'] : ['#4a2aa0', '#b48cff']);
  c.outline(OUTLINE);
  return c;
}

/**
 * Peter's two dark mirrors (chapters 5 and 8) are his own v4 sprite recoloured, so they move and
 * stand exactly as he does: frames 0-3 of his front idle, set on the 96 px ground line.
 */
function peterVariant(map) {
  const img = readPng('public/assets/characters/peter/peter_idle.png');
  const swap = new Map(Object.entries(map).map(([from, to]) => [from.toLowerCase(), hexRgb(to)]));
  return (k) => {
    const c = new Canvas(S);
    for (let y = 0; y < 64; y++)
      for (let x = 0; x < 64; x++) {
        const i = (y * img.w + k * 64 + x) * 4;
        if (!img.buf[i + 3]) continue;
        const key =
          '#' + [0, 1, 2].map((n) => img.buf[i + n].toString(16).padStart(2, '0')).join('');
        const rgb = swap.get(key) ?? [img.buf[i], img.buf[i + 1], img.buf[i + 2]];
        c.px.set([...rgb, img.buf[i + 3]], ((y + GROUND - 61) * S + x + 16) * 4);
      }
    return c;
  };
}
const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const PETER = {
  coat: '#263248',
  coatShadow: '#161e2e',
  coatLight: '#3d4f70',
  lining: '#2f9ccc',
  liningShadow: '#1d6688',
  curlShadow: '#141219',
  curl: '#25222c',
  curlSheen: '#423e4d',
  glow: '#00c8ff',
  glowLight: '#a6f0ff',
};
/** Alpha Peter (chapter 5): the Peter who chose order; a white coat, violet lining, brown curls. */
const otherPeter = peterVariant({
  [PETER.coat]: '#d4d8e2',
  [PETER.coatShadow]: '#9ea2b0',
  [PETER.coatLight]: '#f2f4f8',
  [PETER.lining]: '#8a5ad8',
  [PETER.liningShadow]: '#5a3aa0',
  [PETER.curlShadow]: '#2a1a10',
  [PETER.curl]: '#4a3020',
  [PETER.curlSheen]: '#6a4a30',
});
/** The other Peter as a lieutenant (chapter 8): violet coat, the blade burning violet. */
const lieutenantOtherPeter = peterVariant({
  [PETER.coat]: '#3e2a6a',
  [PETER.coatShadow]: '#26184a',
  [PETER.coatLight]: '#5a42a0',
  [PETER.lining]: '#b48cff',
  [PETER.liningShadow]: '#7a4ae0',
  [PETER.glow]: '#b48cff',
  [PETER.glowLight]: '#e0d0ff',
});

export const BOSSES = {
  sentinel: { frames: 5, released: 4, draw: sentinel },
  bellkeeper: { frames: 5, released: 4, draw: bellkeeper },
  imperial_verdict: { frames: 5, released: 4, draw: imperialVerdict },
  faceless_keeper: { frames: 5, released: 4, draw: facelessKeeper },
  nameless_choir: { frames: 5, released: 4, draw: namelessChoir },
  crimson_standard: { frames: 5, draw: crimsonStandard },
  the_last_war: { frames: 5, released: 4, draw: theLastWar },
  unborn_king: { frames: 5, released: 4, draw: unbornKing },
  broken_herald: { frames: 5, released: 4, draw: brokenHerald },
  remnant_deacon: { frames: 4, draw: remnantDeacon },
  genesis_warden: { frames: 5, released: 4, draw: genesisWarden },
  echo_forgotten: { frames: 4, draw: echoForgotten },
  nameless_weeper: { frames: 5, released: 4, draw: namelessWeeper },
  primordial_shade: { frames: 4, draw: primordialShade },
  convergent_praetor: { frames: 5, released: 4, draw: convergentPraetor },
  null_hour_herald: { frames: 5, released: 4, draw: nullHourHerald },
  sixfold_echo: { frames: 6, draw: sixfoldEcho },
  primeval_architect: { frames: 5, released: 4, draw: primevalArchitect },
  sixfold_divinity: { frames: 6, released: 5, draw: sixfoldDivinity },
  void_singularity_core: { frames: 4, draw: voidSingularity },
  other_peter: { frames: 5, released: 4, draw: otherPeter },
  lieutenant_other_peter: { frames: 5, released: 4, draw: lieutenantOtherPeter },
};

// ------------------------------------------------------------------ output
const install = process.argv.includes('--install');
const only = (process.argv.slice(2).find((a) => !a.startsWith('--')) ?? '')
  .split(',')
  .filter(Boolean);
const outDir = 'art-source/bosses/candidates';
fs.mkdirSync(outDir, { recursive: true });
if (install) fs.mkdirSync('public/assets/enemies/v2', { recursive: true });
for (const [name, b] of Object.entries(BOSSES)) {
  if (only.length && !only.includes(name)) continue;
  const w = b.frames * S;
  const buf = Buffer.alloc(w * S * 4);
  for (let k = 0; k < b.frames; k++) {
    const fr = (k === b.released ? kneel(b.draw(0)) : b.draw(k % 4)).px;
    for (let y = 0; y < S; y++) fr.copy(buf, (y * w + k * S) * 4, y * S * 4, (y + 1) * S * 4);
  }
  const png = encodePng(w, S, buf);
  fs.writeFileSync(path.join(outDir, `${name}.png`), png);
  fs.writeFileSync(path.join(outDir, `${name}_x3.png`), preview({ w, h: S, buf }, 3));
  if (install) fs.writeFileSync(`public/assets/enemies/v2/${name}.png`, png);
  console.log(`${name}.png (${w}x${S})`);
}
