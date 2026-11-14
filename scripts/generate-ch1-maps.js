/**
 * Writes the Chapter 1 tilemaps (Tiled JSON) from scripts/ch1-layout.js.
 * Usage: node scripts/generate-ch1-maps.js  →  public/assets/maps/map_ch1_*.json
 * Extra layers (e.g. Walls_LowTide for the beacon) are written after Ground/Walls.
 */
import fs from 'fs';
import { CH1_MAPS } from './ch1-layout.js';
import { CH2_MAPS } from './ch2-layout.js';
import { CH3_MAPS } from './ch3-layout.js';
import { CH4_MAPS } from './ch4-layout.js';

/** `node <script> ch2|ch3|ch4` builds that chapter instead of Chapter 1. */
const CHAPTER = process.argv[2] ?? 'ch1';
const MAPS = { ch1: CH1_MAPS, ch2: CH2_MAPS, ch3: CH3_MAPS, ch4: CH4_MAPS }[CHAPTER] ?? CH1_MAPS;

const TILESETS = {
  wilds: {
    name: 'wilds_tileset',
    image: '../tilesets/wilds_tileset.png',
    columns: 8,
    w: 256,
    h: 192,
    count: 48,
  },
  coastal: {
    name: 'coastal_tileset',
    image: '../tilesets/coastal_tileset.png',
    columns: 8,
    w: 256,
    h: 192,
    count: 48,
  },
  sunken: {
    name: 'sunken_tileset',
    image: '../tilesets/sunken_tileset.png',
    columns: 4,
    w: 128,
    h: 256,
    count: 32,
  },
  warfield: {
    name: 'warfield_tileset',
    image: '../tilesets/warfield_tileset.png',
    columns: 8,
    w: 256,
    h: 256,
    count: 64,
  },
  dungeon: {
    name: 'dungeon_tileset',
    image: '../tilesets/dungeon_tileset.png',
    columns: 4,
    w: 128,
    h: 128,
    count: 16,
  },
};

function toTiled(layout, ts) {
  const flat = (layer) => layer.flat().map((idx) => (idx < 0 ? 0 : idx + 1));
  const layers = [
    ['Ground', layout.ground],
    ['Walls', layout.walls],
    ...Object.entries(layout.extraLayers ?? {}),
  ].map(([name, data], i) => ({
    data: flat(data),
    height: layout.height,
    id: i + 1,
    name,
    opacity: 1,
    type: 'tilelayer',
    visible: true,
    width: layout.width,
    x: 0,
    y: 0,
  }));
  return {
    compressionlevel: -1,
    height: layout.height,
    width: layout.width,
    infinite: false,
    layers,
    nextlayerid: layers.length + 1,
    nextobjectid: 1,
    orientation: 'orthogonal',
    renderorder: 'right-down',
    tiledversion: '1.10.2',
    tileheight: 32,
    tilesets: [
      {
        columns: ts.columns,
        firstgid: 1,
        image: ts.image,
        imageheight: ts.h,
        imagewidth: ts.w,
        margin: 0,
        name: ts.name,
        spacing: 0,
        tilecount: ts.count,
        tileheight: 32,
        tilewidth: 32,
      },
    ],
    tilewidth: 32,
    type: 'map',
    version: '1.10',
  };
}

for (const def of MAPS) {
  const layout = def.build();
  const file = `public/assets/maps/${def.id}.json`;
  fs.writeFileSync(file, JSON.stringify(toTiled(layout, TILESETS[def.tileset])) + '\n');
  console.log(`✓ ${file} (${layout.width}x${layout.height})`);
}
