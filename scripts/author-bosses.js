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

export const BOSSES = {
  sentinel: { frames: 5, released: 4, draw: sentinel },
  bellkeeper: { frames: 5, released: 4, draw: bellkeeper },
  imperial_verdict: { frames: 5, released: 4, draw: imperialVerdict },
  faceless_keeper: { frames: 5, released: 4, draw: facelessKeeper },
  nameless_choir: { frames: 5, released: 4, draw: namelessChoir },
  crimson_standard: { frames: 5, draw: crimsonStandard },
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
