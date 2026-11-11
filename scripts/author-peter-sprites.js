/**
 * CHRONO – code-authored pixel art for Peter (Pipeline B, see AGENTS.md §5).
 *
 * Every pixel below is hand-placed from docs/art/PETER_DESIGN.md and the approved concept
 * (art-source/characters/peter/concept/peter_master_v1.png). No image model, no external reference.
 *
 * Output goes to art-source/characters/peter/generated/candidates/ ONLY. Candidates enter
 * public/assets/ after the project owner approves them (AGENTS.md §6).
 *
 * Usage: node scripts/author-peter-sprites.js [outDir]
 *
 * Sheet layout (matches src/systems/animation/PeterAnimationConfig.ts):
 *   rows = down, up, left, right; 32x32 frames; idle 4 frames, walk 6 frames.
 */
import path from 'path';
import fs from 'fs';
import {
  hex,
  blank,
  mirrorHalf,
  flipH,
  checkRows,
  paint,
  stamp,
  renderSheet,
  preview,
  encodePng,
  writeFile,
} from './pixel-art/pixel.js';

const SIZE = 32;
const EMPTY = '.'.repeat(SIZE);
/** Rows 0..24 hold head + torso; rows 25..31 hold the legs layer. */
const UPPER_END = 25;

/** Palette = PETER_DESIGN.md §3-4 swatches, plus outline and two derived accents. */
const PALETTE = {
  O: hex('#120f17'), // outline (near-black violet)
  h: hex('#22160f'), // curly hair shadow
  H: hex('#3b291d'), // curly hair base
  j: hex('#594132'), // curly hair highlight
  s: hex('#dab9a0'), // skin
  S: hex('#b28e76'), // skin shadow / stubble
  E: hex('#607d9c'), // gray-blue eyes
  c: hex('#263248'), // coat charcoal-blue
  C: hex('#161e2e'), // coat shadow
  k: hex('#3d4f70'), // coat highlight
  p: hex('#281e36'), // purple lining
  P: hex('#3a2a4f'), // purple trim
  t: hex('#12151d'), // ribbed tunic
  l: hex('#453123'), // leather strap / belt
  L: hex('#5e4532'), // leather highlight (derived)
  m: hex('#8c96a8'), // aged silver (pommel, crossguard, clasps, watch chain)
  n: hex('#8c96a5'), // Broken Blade steel
  g: hex('#00c8ff'), // chronal fracture glow
  w: hex('#a6f0ff'), // chronal glow, light
  W: hex('#e6f9ff'), // chronal apex white / Stopped Watch face
  d: hex('#008ab8'), // fading chronal trail (dormant cyan, ENVIRONMENT_GUIDE)
  r: hex('#181c24'), // trousers
  b: hex('#2e2219'), // boots
};

/** 32-wide row from {startCol: 'pixels'} segments. */
function row(spec = {}) {
  const r = Array(SIZE).fill('.');
  for (const [col, str] of Object.entries(spec)) {
    [...str].forEach((ch, i) => (r[Number(col) + i] = ch));
  }
  return r.join('');
}
const rows = (specs) => specs.map(row);
const padTo32 = (list) => list.concat(Array(SIZE - list.length).fill(EMPTY));

// ---------------------------------------------------------------- FRONT (down)
// Left half only; mirrored for symmetry, then asymmetric details are painted on.
// Head ~9 rows of a ~28 px figure (≈1:3, PETER_DESIGN.md §5). Hair: compact rounded dome of
// tight curls rising up/out, full coverage at temples, forehead clear (no fringe/bangs).
const frontHalf = [
  '................',
  '................',
  '................',
  '............O.OO',
  '..........OOjHOj',
  '.........OjHhjHH',
  '........OHhjHhHj',
  '........OhHjHsss',
  '........OHhShhss',
  '........OhSsSEss',
  '.........OSsssss',
  '..........OSSsss',
  '.........OkcOSSs',
  '.......OOkccCOtt',
  '......OkkcccCPtt',
  '......OkcccccPtt',
  '......OccOccccPt',
  '......OccOccccPt',
  '......OcCOccccPt',
  '......OcCOllllll',
  '......OSsOccccPr',
  '.......OOOcccCPr',
  '.........OcccCPr',
  '.........OccCpOr',
  '.........OcCpOOr',
];

/**
 * The Broken Blade, held point-down in Peter's RIGHT hand (viewer-left in the front view):
 * silver pommel and crossguard, steel broken midway, cerulean glow on the edge, white-hot
 * jagged fracture at the tip. Pixels relative to the hand pixel at (hx, hy).
 */
function brokenBlade(hx, hy, outward = -1) {
  const o = outward; // -1 = blade edge glows on the viewer-left side, +1 = right
  return [
    [hx, hy - 1, 'm'], // pommel above the fist
    [hx - 1, hy + 1, 'm'],
    [hx, hy + 1, 'm'],
    [hx + 1, hy + 1, 'm'], // crossguard
    [hx, hy + 2, 'n'],
    [hx + o, hy + 2, 'g'],
    [hx, hy + 3, 'n'],
    [hx + o, hy + 3, 'g'],
    [hx, hy + 4, 'n'],
    [hx + o, hy + 4, 'w'],
    [hx + o, hy + 5, 'W'], // jagged broken point
    [hx + 2 * o, hy + 3, 'O'],
    [hx + 2 * o, hy + 4, 'O'],
    [hx + 2 * o, hy + 2, 'O'],
    [hx + o * 2, hy + 5, 'O'],
    [hx + o, hy + 6, 'O'],
    [hx, hy + 5, 'O'],
  ];
}

const front = paint(padTo32(mirrorHalf(frontHalf)), [
  [15, 10, 's'], // one-pixel nose shadow (light from upper left)
  // diagonal strap, viewer-right shoulder -> viewer-left hip (as in the approved concept)
  [20, 13, 'l'],
  [19, 14, 'l'],
  [18, 15, 'L'],
  [17, 16, 'l'],
  [16, 17, 'l'],
  [15, 18, 'l'],
  [14, 18, 'l'],
  [13, 19, 'm'], // strap buckle
  [15, 19, 'm'],
  [16, 19, 'm'], // belt buckle
  [20, 15, 'm'],
  [20, 17, 'm'], // silver toggle clasps
  // Stopped Watch: silver chain from the belt to a white face
  [18, 20, 'm'],
  [18, 21, 'W'],
]);
/** Front view without the resting blade (combat sheets draw the blade at other angles). */
const frontBare = front;
const frontWithBlade = paint(frontBare, brokenBlade(7, 20, -1));

// ------------------------------------------------------------------ BACK (up)
const backHalf = [
  '................',
  '................',
  '................',
  '............O.OO',
  '..........OOjHOj',
  '.........OjHhjHH',
  '........OHhjHhHj',
  '........OhHjHHhH',
  '........OHhHjHhH',
  '........OhHjHhHj',
  '.........OHhHjHH',
  '..........OhHHhH',
  '.........OkkCkkk',
  '.......OOkcccccc',
  '......OkkcccccCc',
  '......Okcccccccc',
  '......OccOcccccc',
  '......OccOcccccC',
  '......OcCOcccccC',
  '......OcCOllllll',
  '......OSsOcccccC',
  '.......OOOccccCC',
  '.........OccccCp',
  '.........OcccCpp',
  '.........OcCCOOO',
];
const back = paint(padTo32(mirrorHalf(backHalf)), [
  // strap seen from behind: viewer-left shoulder -> viewer-right hip
  [11, 13, 'l'],
  [12, 14, 'l'],
  [13, 15, 'L'],
  [14, 16, 'l'],
  [15, 17, 'l'],
  [16, 18, 'l'],
  [17, 18, 'l'],
]);
const backBare = back;
// Peter's right hand is on the viewer-right from behind
const backWithBlade = paint(backBare, brokenBlade(24, 20, 1));

// ---------------------------------------------------------- SIDE (left-facing)
const left = padTo32(
  rows([
    {},
    {},
    {},
    { 13: 'OO', 16: 'OO' },
    { 11: 'OOjHOjHOO' },
    { 10: 'OjHhjHHjHO' },
    { 10: 'OHhjHhHjHhO' },
    { 10: 'OssHhjHhHjO' },
    { 9: 'OshhSHjHhHjO' },
    { 9: 'OsEsSShHjHhO' },
    { 8: 'OsssSSShjHhO' },
    { 9: 'OSssShHhHO' },
    { 10: 'OSSSOhO' },
    { 10: 'OkkcCccckkO' },
    { 10: 'OkccCcccccO' },
    { 10: 'OPcCccccccO' },
    { 10: 'OPcccccccCO' },
    { 10: 'OPcccccccCO' },
    { 10: 'OPccclccCCO' },
    { 10: 'OllllllmllO' },
    { 10: 'OPcccccccCO' },
    { 10: 'OPcccccccCO' },
    { 10: 'OPccccccCCO' },
    { 10: 'OPPcccccCCO' },
    { 10: 'OOPpcccCCOO' },
  ]),
);
/**
 * Arm hanging in front of the torso holding the Broken Blade point-down and slightly forward
 * (separate layer so it swings with the walk cycle).
 */
/** The same arm, empty-handed (Prologue v3: before the Elder gives Peter the blade). */
const sideArmBare = padTo32(
  rows([
    ...Array(13).fill({}),
    { 13: 'OkkO' },
    { 13: 'OkcO' },
    { 13: 'OccO' },
    { 13: 'OccO' },
    { 13: 'OcCO' },
    { 13: 'OcCO' },
    { 13: 'OpPO' },
    { 13: 'OssO' },
    { 14: 'OO' },
  ]),
);
const sideArm = paint(sideArmBare, brokenBlade(14, 20, -1));
/** Shoulder pivot of the near arm in the left-facing view (for posed arms in combat sheets). */
const SIDE_SHOULDER = [14, 14];

// ----------------------------------------------------------------- LEG POSES
const FRONT_LEG = ['OrrrO', 'OrrrO', 'ObbbO', 'ObbbbO', 'OblllO', 'OOOOOO'];

/** Front/back legs. A lifted leg is drawn 1px higher (mid-stride, foot off the ground). */
function frontLegs(liftLeft = 0, liftRight = 0) {
  const out = blank(SIZE);
  const place = (startCol, lift, mirrored) => {
    FRONT_LEG.forEach((s, i) => {
      const str = mirrored ? [...s].reverse().join('') : s;
      const col = mirrored ? startCol - str.length + 1 : startCol;
      const y = 25 + i - lift;
      out[y] = out[y].slice(0, col) + str + out[y].slice(col + str.length);
    });
  };
  place(9, liftLeft, false); // viewer-left leg, cols 9..14
  place(22, liftRight, true); // viewer-right leg, cols 17..22
  return out;
}

const SIDE_LEGS = {
  stand: [
    { 12: 'OrrrrO' },
    { 12: 'OrrrrO' },
    { 12: 'ObbbbO' },
    { 11: 'ObbbbbO' },
    { 10: 'OblllbO' },
    { 10: 'OOOOOOO' },
  ],
  stride: [
    { 11: 'OrrrOrrO' },
    { 10: 'OrrrO.OrrO' },
    { 9: 'ObbbO...ObbO' },
    { 8: 'ObbbbO...ObbO' },
    { 7: 'OblllbO..ObbbO' },
    { 7: 'OOOOOOO..OOOOO' },
  ],
  pass: [
    { 12: 'OrrrrO' },
    { 12: 'OrrOrO' },
    { 12: 'ObbOrrO' },
    { 11: 'ObbbbObbO' },
    { 10: 'OblllbOOO' },
    { 10: 'OOOOOOO' },
  ],
};

function sideLegs(pose) {
  const out = blank(SIZE);
  SIDE_LEGS[pose].forEach((spec, i) => (out[25 + i] = row(spec)));
  return out;
}

// --------------------------------------------------------------- COMPOSITION
const upperOnly = (full) => full.map((r, y) => (y < UPPER_END ? r : EMPTY));

/** Moves rows [from..to] of a layer down by 1px (breath / step bob). */
function shiftDown(layer, from, to) {
  const out = [...layer];
  for (let y = to; y >= from; y--) out[y + 1] = layer[y];
  out[from] = EMPTY;
  return out;
}

function compose(legs, upper, overlays = []) {
  let frame = stamp(blank(SIZE), legs);
  frame = stamp(frame, upper);
  for (const o of overlays) frame = stamp(frame, o.layer, o.dx ?? 0, o.dy ?? 0);
  return frame;
}

const VIEWS = {
  down: {
    upper: upperOnly(frontWithBlade),
    bare: upperOnly(frontBare),
    side: false,
    hand: [7, 20],
  },
  up: { upper: upperOnly(backWithBlade), bare: upperOnly(backBare), side: false, hand: [24, 20] },
  left: { upper: upperOnly(left), bare: upperOnly(left), side: true, hand: [14, 20] },
};

/** Views/arm used by idle and walk; swapped by `unarmed()` for the empty-handed sheets. */
let ACTIVE_VIEWS = VIEWS;
let ACTIVE_ARM = sideArm;
const UNARMED_VIEWS = Object.fromEntries(
  Object.entries(VIEWS).map(([k, v]) => [k, { ...v, upper: v.bare }]),
);
/** Builds a sheet with Peter empty-handed (no Broken Blade), same poses otherwise. */
const unarmed = (builder) => (view) => {
  ACTIVE_VIEWS = UNARMED_VIEWS;
  ACTIVE_ARM = sideArmBare;
  try {
    return builder(view);
  } finally {
    ACTIVE_VIEWS = VIEWS;
    ACTIVE_ARM = sideArm;
  }
};

/** Idle: 4 frames; frames 2-3 lower head and shoulders by 1px (slow breath). */
function idleFrames(view) {
  const v = ACTIVE_VIEWS[view];
  const legs = v.side ? sideLegs('stand') : frontLegs();
  const breath = shiftDown(v.upper, 0, 13);
  const arm = v.side ? [{ layer: ACTIVE_ARM }] : [];
  return [v.upper, v.upper, breath, breath].map((upper) => compose(legs, upper, arm));
}

/** Walk: 6 frames — contact, down (bob), pass, opposite contact, down, pass. */
function walkFrames(view) {
  const v = ACTIVE_VIEWS[view];
  const bob = shiftDown(v.upper, 0, UPPER_END - 1);
  if (v.side) {
    const seq = [
      ['stride', 0, -1],
      ['stride', 1, -1],
      ['pass', 0, 0],
      ['stride', 0, 1],
      ['stride', 1, 1],
      ['pass', 0, 0],
    ];
    return seq.map(([pose, down, swing]) =>
      compose(sideLegs(pose), down ? bob : v.upper, [{ layer: ACTIVE_ARM, dx: swing, dy: down }]),
    );
  }
  const seq = [
    [0, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
    [1, 0, 0],
    [1, 0, 1],
    [0, 0, 0],
  ];
  return seq.map(([liftL, liftR, down]) => compose(frontLegs(liftL, liftR), down ? bob : v.upper));
}

// ------------------------------------------------------------- COMBAT SHEETS
// Attack / hurt / Temporal Sight (AGENTS.md §7). The side view carries the full poses (combat
// shows Peter in profile); front/back views animate the blade and effects around the resting arm.

/** Paints only onto transparent pixels (auras and arcs must stay behind the character). */
function under(layer, pixels) {
  return paint(
    layer,
    pixels.filter(([x, y]) => x >= 0 && y >= 0 && x < SIZE && y < SIZE && layer[y][x] === '.'),
  );
}

/**
 * The Broken Blade at an arbitrary 45°-step angle from the hand (hx, hy) along (dx, dy):
 * pommel behind the fist, crossguard, steel broken off after `len` px, cerulean glow on one edge
 * and a white-hot jagged break at the tip.
 */
function bladeAt(hx, hy, dx, dy, len) {
  const px = [[hx - dx, hy - dy, 'm']];
  const [gx, gy] = [-dy || 1, dx || 0]; // glow side (perpendicular)
  px.push(
    [hx + dx + gx, hy + dy + gy, 'm'],
    [hx + dx - gx, hy + dy - gy, 'm'],
    [hx + dx, hy + dy, 'm'],
  );
  for (let k = 2; k < len; k++) {
    px.push(
      [hx + dx * k, hy + dy * k, 'n'],
      [hx + dx * k + gx, hy + dy * k + gy, k % 2 ? 'g' : 'w'],
    );
  }
  px.push([hx + dx * len, hy + dy * len, 'W']);
  return px.filter(([x, y]) => x >= 0 && y >= 0 && x < SIZE && y < SIZE);
}

/** Near arm drawn from the shoulder to the hand: outlined coat sleeve, purple cuff, bare hand. */
function armTo(hx, hy) {
  const [sx, sy] = SIDE_SHOULDER;
  const steps = Math.max(Math.abs(hx - sx), Math.abs(hy - sy), 1);
  const outline = [];
  const sleeve = [];
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(sx + ((hx - sx) * i) / steps);
    const y = Math.round(sy + ((hy - sy) * i) / steps);
    for (let oy = -1; oy <= 2; oy++)
      for (let ox = -1; ox <= 2; ox++) outline.push([x + ox, y + oy, 'O']);
    sleeve.push([x, y, 'c'], [x + 1, y, 'k'], [x, y + 1, 'C'], [x + 1, y + 1, 'c']);
  }
  const clip = (p) => p.filter(([x, y]) => x >= 0 && y >= 0 && x < SIZE && y < SIZE);
  let layer = paint(blank(SIZE), clip(outline));
  layer = paint(layer, clip(sleeve));
  return paint(
    layer,
    clip([
      [hx, hy, 'P'],
      [hx + 1, hy, 'P'],
      [hx, hy + 1, 's'],
      [hx + 1, hy + 1, 's'],
    ]),
  );
}

/** Crescent slash trail around (cx, cy) between angles a0..a1 (radians; 0 = facing direction). */
function slashArc(cx, cy, r, a0, a1, facing, colors = ['w', 'g']) {
  const px = [];
  for (let a = a0; a <= a1; a += 0.08) {
    px.push([
      Math.round(cx + facing * r * Math.cos(a)),
      Math.round(cy + r * Math.sin(a)),
      colors[0],
    ]);
    px.push([
      Math.round(cx + facing * (r - 1) * Math.cos(a)),
      Math.round(cy + (r - 1) * Math.sin(a)),
      colors[1],
    ]);
  }
  return px;
}

/** Peter's gray-blue eyes kindled cerulean (Temporal Sight). */
function glowingEyes(layer) {
  return layer.map((r) => r.replace(/E/g, 'g'));
}

/** Whole-sprite hit flash: everything but the outline turns chronal white. */
function flash(frame) {
  return frame.map((r) => r.replace(/[^.O]/g, 'W'));
}

/** Attack: 6 frames — wind-up, raise, strike (+arc), follow-through (+fading arc), recover, rest. */
function attackFrames(view) {
  const v = VIEWS[view];
  const legs = v.side ? sideLegs('stand') : frontLegs();
  if (v.side) {
    const poses = [
      { hand: [17, 11], blade: [1, -1, 6], lean: 0 },
      { hand: [14, 8], blade: [0, -1, 6], lean: 0 },
      { hand: [9, 14], blade: [-1, 0, 7], lean: -1, arc: slashArc(14, 13, 12, -1.45, 0.35, -1) },
      {
        hand: [10, 19],
        blade: [-1, 1, 6],
        lean: -1,
        arc: slashArc(14, 13, 12, 0.05, 1.05, -1, ['d', 'g']),
      },
      { hand: [12, 20], blade: [-1, 1, 4], lean: 0 },
    ];
    const posed = poses.map((p) => {
      let f = compose(legs, v.bare, [{ layer: armTo(...p.hand) }]);
      if (p.lean)
        f = stamp(
          stamp(blank(SIZE), legs),
          stamp(
            blank(SIZE),
            f.map((r, y) => (y < UPPER_END ? r : EMPTY)),
            p.lean,
            0,
          ),
        );
      f = paint(f, bladeAt(...p.hand, ...p.blade));
      return p.arc ? under(f, p.arc) : f;
    });
    return [...posed, compose(legs, v.upper, [{ layer: sideArm }])];
  }
  // Front/back: the blade swings around the resting hand; a crescent flashes on the strike.
  const [hx, hy] = v.hand;
  const out = view === 'down' ? -1 : 1; // blade hand is viewer-left (down) / viewer-right (up)
  const blades = [
    [out, -1, 6],
    [0, -1, 6],
    [-out, 0, 7],
    [-out, 1, 6],
    [0, 1, 4],
  ];
  const posed = blades.map((b, i) => {
    let f = compose(legs, v.bare);
    f = paint(f, bladeAt(hx, hy, ...b));
    // Facing the viewer the swing passes in front of the body; facing away it passes behind.
    const draw = view === 'down' ? paint : under;
    if (i === 2) f = draw(f, slashArc(15.5, 17, 11, 0.35, 2.8, 1));
    if (i === 3) f = draw(f, slashArc(15.5, 17, 11, 1.4, 2.8, 1, ['d', 'g']));
    return f;
  });
  return [...posed, compose(legs, v.upper)];
}

/** Hurt: 2 frames — recoil (knocked back 1px, eyes shut) and a white hit flash. */
function hurtFrames(view) {
  const v = VIEWS[view];
  const legs = v.side ? sideLegs('stand') : frontLegs();
  const arm = v.side ? [{ layer: sideArm, dx: 1 }] : [];
  const pained = v.upper.map((r) => r.replace(/E/g, 'h'));
  const recoil = stamp(
    stamp(blank(SIZE), legs),
    compose(blank(SIZE), stamp(blank(SIZE), pained, 1, 0), arm),
  );
  return [recoil, flash(recoil)];
}

/** Temporal Sight: 4 frames — blade raised point-up, eyes kindled, a rotating ring of chronal motes. */
function temporalSightFrames(view) {
  const v = VIEWS[view];
  const legs = v.side ? sideLegs('stand') : frontLegs();
  const [hx, hy] = v.side ? [10, 13] : v.hand;
  const base = (() => {
    let f = v.side
      ? compose(legs, glowingEyes(v.bare), [{ layer: armTo(hx, hy) }])
      : compose(legs, glowingEyes(v.bare));
    return paint(f, bladeAt(hx, hy - (v.side ? 0 : 1), 0, -1, 7));
  })();
  return [0, 1, 2, 3].map((phase) => {
    const motes = [];
    for (let k = 0; k < 8; k++) {
      const a = ((k + phase * 0.5) / 8) * Math.PI * 2;
      motes.push([
        Math.round(15.5 + 14 * Math.cos(a)),
        Math.round(17 + 12 * Math.sin(a)),
        k % 2 ? 'g' : 'w',
      ]);
    }
    const tip = v.side ? [hx, hy - 7] : [hx, hy - 8];
    const pulse = phase % 2 ? 'W' : 'w';
    return under(paint(base, [[tip[0], tip[1], pulse]]), motes);
  });
}

/** Rows in PeterAnimationConfig order: down, up, left, right (right = mirrored left). */
function buildGrid(framesFor) {
  const leftFrames = framesFor('left');
  const grid = [framesFor('down'), framesFor('up'), leftFrames, leftFrames.map(flipH)];
  grid.flat().forEach((f, i) => checkRows(f, `frame ${i}`));
  return grid;
}

// --------------------------------------------------------------------- OUTPUT
/** Sheet name -> [version, frame builder]. idle/walk v3 are approved (CHAR_PETER_002). */
const SHEETS = {
  idle: ['v3', idleFrames],
  walk: ['v3', walkFrames],
  attack: ['v1', attackFrames],
  hurt: ['v1', hurtFrames],
  temporal_sight: ['v1', temporalSightFrames],
  // Prologue v3: Peter before he receives the Broken Blade.
  idle_unarmed: ['v1', unarmed(idleFrames)],
  walk_unarmed: ['v1', unarmed(walkFrames)],
};

// Usage: node scripts/author-peter-sprites.js [outDir] [--sheets=attack,hurt,temporal_sight]
// Default: only the sheets that are not approved yet, so approved art is never re-emitted.
const args = process.argv.slice(2);
const sheetArg = args.find((a) => a.startsWith('--sheets='));
const wanted = sheetArg
  ? sheetArg.slice('--sheets='.length).split(',')
  : ['idle_unarmed', 'walk_unarmed'];
const outDir = path.resolve(
  args.find((a) => !a.startsWith('--')) ?? 'art-source/characters/peter/generated/candidates',
);
const previewDir = path.join(outDir, 'previews');
fs.mkdirSync(previewDir, { recursive: true });

for (const name of wanted) {
  if (!SHEETS[name]) throw new Error(`Unknown sheet "${name}"`);
  const [version, framesFor] = SHEETS[name];
  const sheet = renderSheet(buildGrid(framesFor), PALETTE);
  const file = path.join(outDir, `peter_${name}_${version}.png`);
  writeFile(file, encodePng(sheet.w, sheet.h, sheet.buf));
  writeFile(path.join(previewDir, `peter_${name}_${version}_x6.png`), preview(sheet, 6));
  console.log(`✓ ${path.relative(process.cwd(), file)} (${sheet.w}x${sheet.h})`);
}
