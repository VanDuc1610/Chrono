/**
 * T-85: writes public/assets/data/atmosphere.json for every map — a palette per chapter, the
 * darkness picked from what the place is (open sky, interior, crypt, void), a light on every point
 * of interest and a breathing light where a boss stands. Hand-tuned entries listed in KEEP are left
 * as they are (approved by the owner on 2026-11-16).
 * Idempotent.
 *
 * Usage: node scripts/atmosphere.mjs
 */
import fs from 'fs';

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const OUT = 'public/assets/data/atmosphere.json';
const maps = read('public/assets/data/maps.json').maps;
const old = fs.existsSync(OUT) ? read(OUT).maps : {};
const KEEP = new Set(['map_coastal_town', 'map_old_lighthouse', 'map_ch1_bell_sanctum']);

/** Per chapter: darkness colour, light colours (Peter, points of interest, boss), motes. */
const THEMES = {
  0: {
    shade: '#120a1e',
    peter: '#ffe6b0',
    poi: '#ffd38a',
    boss: '#c8a0ff',
    mote: '#fff2d0',
    up: false,
  },
  1: {
    shade: '#1a0e10',
    peter: '#ffe0b8',
    poi: '#ffb86b',
    boss: '#7fd8ff',
    mote: '#ffd8b0',
    up: false,
  },
  2: {
    shade: '#140e04',
    peter: '#fff0c8',
    poi: '#f0c860',
    boss: '#ffd38a',
    mote: '#f6e0a0',
    up: true,
  },
  3: {
    shade: '#0a0a1a',
    peter: '#dce8ff',
    poi: '#b8b8ff',
    boss: '#9fd3ff',
    mote: '#d8d8ff',
    up: true,
  },
  4: {
    shade: '#180606',
    peter: '#ffe0c8',
    poi: '#ff8a5a',
    boss: '#ff5a4a',
    mote: '#ffb080',
    up: true,
  },
  5: {
    shade: '#06140a',
    peter: '#e8ffe0',
    poi: '#9fe8a0',
    boss: '#d9a066',
    mote: '#c8ffd0',
    up: true,
  },
  6: {
    shade: '#0a1220',
    peter: '#f0f8ff',
    poi: '#e0f4ff',
    boss: '#fff2b8',
    mote: '#ffffff',
    up: true,
  },
  7: {
    shade: '#0c0618',
    peter: '#e8dcff',
    poi: '#c8a0ff',
    boss: '#b08aff',
    mote: '#c8a0ff',
    up: false,
  },
  8: {
    shade: '#100c08',
    peter: '#ffe8cc',
    poi: '#f0a860',
    boss: '#ff8a5a',
    mote: '#ffc890',
    up: true,
  },
  9: {
    shade: '#0e0818',
    peter: '#fff4e0',
    poi: '#ffd38a',
    boss: '#d8b4ff',
    mote: '#ffe8ff',
    up: true,
  },
};

/** How dark a place is, from its id. */
const OPEN =
  /town|village|shore|beach|plaza|forum|outskirts|plains|valley|ridge|battlefield|encampment|garden|harbor|city|promontory|fleet|market|landing|crossroad|courtyard|stairs|vale|pass|hamlet|greenhouse|trench|forest|gate|ramparts|bridge/;
const DEEP =
  /abyss|void|crypt|catacomb|cellar|nook|well|ossuary|cell|tomb|vault|corridors|depths|null|singularity/;

function kind(id) {
  if (DEEP.test(id)) return 'deep';
  if (OPEN.test(id)) return 'open';
  return 'inside';
}

const LOOK = {
  open: { alpha: 0.18, vignette: 0.3, peter: 0.5, peterR: 90, poiR: 70, glow: 0.3, motes: 22 },
  inside: {
    alpha: 0.42,
    vignette: 0.5,
    peter: 0.85,
    peterR: 115,
    poiR: 110,
    glow: 0.42,
    motes: 30,
  },
  deep: { alpha: 0.58, vignette: 0.6, peter: 0.9, peterR: 125, poiR: 120, glow: 0.48, motes: 34 },
};

/** Living details (MapDecor): creatures, drips, falling leaves / petals / snow. */
function decorFor(id, k, ch) {
  const d = {};
  const critters = [];
  const outdoorLife =
    k === 'open' &&
    ch !== 6 &&
    ch !== 7 &&
    ch !== 9 &&
    !/battlefield|ridge|ash|trench|null/.test(id);
  if (outdoorLife) critters.push({ kind: 'bird', count: 1 });
  // Butterflies were tried and dropped: too large and in the way (owner, 2026-11-16).
  if (k === 'deep' && !/void|null|singularity|abyss/.test(id))
    critters.push({ kind: 'bat', count: 1 });
  if (
    /tomb|necropolis|crypt|graveyard|sepulcher|mausoleum|nook|forgotten|weeper|void|abyss|erased|echo/.test(
      id,
    ) ||
    ch === 7
  )
    critters.push({ kind: 'wisp', count: 1 });
  if (critters.length) d.critters = critters;
  if (
    /catacomb|cellar|corridors|depths|well|crypt|cell|vault/.test(id) &&
    !/quantum|memory_matrix/.test(id)
  )
    d.drips = true;
  if (/forest/.test(id)) d.fall = { kind: 'leaf', count: 18 };
  else if (/garden|greenhouse|seed/.test(id) && ch === 5) d.fall = { kind: 'petal', count: 16 };
  else if (/frozen|celestial_stairs|outer_courtyard/.test(id)) d.fall = { kind: 'snow', count: 26 };
  return Object.keys(d).length ? d : undefined;
}

/** Decor for the three hand-tuned maps (their light stays as approved). */
const KEEP_DECOR = {
  map_coastal_town: { critters: [{ kind: 'bird', count: 1 }] },
  map_old_lighthouse: { critters: [{ kind: 'bird', count: 2 }] },
  map_ch1_bell_sanctum: { drips: true, critters: [{ kind: 'wisp', count: 1 }] },
};

const out = {};
let made = 0;
for (const [id, m] of Object.entries(maps)) {
  if (KEEP.has(id) && old[id]) {
    out[id] = { ...old[id], decor: KEEP_DECOR[id] };
    continue;
  }
  const ch = Number((id.match(/^map_ch(\d)/) ?? [])[1] ?? 0);
  const t = THEMES[ch] ?? THEMES[0];
  // Peter's room is a lamp-lit attic, whatever the chapter says.
  const k = id === 'map_peters_room' ? 'inside' : kind(id);
  const L = LOOK[k];
  const boss = (m.encounters ?? []).find((e) => e.enemyId.startsWith('boss_'));
  const def = {
    shade: { color: t.shade, alpha: L.alpha },
    peterLight: {
      color: t.peter,
      radius: L.peterR,
      intensity: L.peter,
      glow: k === 'open' ? 0.1 : 0.16,
    },
    poiLight: { color: t.poi, radius: L.poiR, intensity: 0.85, glow: L.glow },
    vignette: L.vignette,
    // The celestial chapter is white on white: its glows would wash the tiles out.
    ...(ch === 6 ? { glowScale: 0.35 } : {}),
    motes: { color: t.mote, count: L.motes, drift: k === 'open' ? 12 : 9, up: t.up },
  };
  const decor = decorFor(id, k, ch);
  if (decor) def.decor = decor;
  if (boss)
    def.lights = [
      { tile: boss.tile, color: t.boss, radius: 140, intensity: 0.75, glow: 0.35, flicker: true },
    ];
  out[id] = def;
  made++;
}

fs.writeFileSync(OUT, JSON.stringify({ maps: out }, null, 2) + '\n');
console.log(`atmosphere: ${made} maps generated, ${KEEP.size} kept`);
