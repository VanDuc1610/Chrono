import fs from 'fs';
import { GROUND_PROPS, WALL_PROPS } from './map-props.js';

const width = 24;
const height = 18;

// Tile GIDs in Tiled (1-indexed based on our 4x4 tileset):
// 0 in layer array = empty
// 1 = Void (tile 0)
// 2 = Stone Floor Light (tile 1)
// 3 = Engraved Ruin Tile (tile 2)
// 4 = Wall Top (tile 3)
// 5 = Wall Face (tile 4)
// 6 = Pillar (tile 5)
// 7 = Chrono Crystal (tile 6)
// 8 = Altar (tile 7)
// 9 = Cracked Fracture Floor (tile 8) — glowing fissures around the Shade's rift (east)
// 10 = Slate Floor Variant (tile 9) — breaks up floor repetition

/** Fracture tiles clustered just east of the Temporal Shade (tile 16,9): environmental storytelling. */
const FRACTURE_TILES = new Set(['17,8', '18,9', '17,10', '19,10', '16,11']);
/** Deterministic hash so the map is reproducible. */
const hash = (x, y) => (((x * 73856093) ^ (y * 19349663)) >>> 0) % 100;

const groundData = [];
const wallData = [];

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    // Default ground is stone floor (GID 2)
    let groundTile = 2;
    let wallTile = 0;

    // Outer edge border: Wall
    if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
      groundTile = 1;
      wallTile = y === 0 ? 4 : y === 1 ? 5 : 4;
    } else if (y === 1) {
      // Upper wall facade
      wallTile = 5;
    }

    // Patterned engravings on floor in center chamber
    if (x >= 8 && x <= 15 && y >= 7 && y <= 12) {
      if (x === 8 || x === 15 || y === 7 || y === 12) {
        groundTile = 3;
      }
    }

    // Pillars inside the hall
    if ((x === 5 || x === 18) && (y === 5 || y === 10 || y === 14)) {
      wallTile = 6;
    }

    // Central Altar
    if (x === 11 && y === 5) {
      wallTile = 8;
    }

    // Fractured Chrono Crystals in corners
    if (
      (x === 3 && y === 4) ||
      (x === 20 && y === 4) ||
      (x === 3 && y === 14) ||
      (x === 20 && y === 14)
    ) {
      wallTile = 7;
    }

    // Plain floor variety (only under open floor, never under walls/props)
    if (groundTile === 2 && wallTile === 0) {
      if (FRACTURE_TILES.has(`${x},${y}`)) groundTile = 9;
      else if (hash(x, y) < 18) groundTile = 10;
    }

    // Approved point-of-interest props (T-22, scripts/map-props.js) override the base layout.
    const groundProp = GROUND_PROPS.find((p) => p.x === x && p.y === y);
    if (groundProp) groundTile = groundProp.gid;
    const wallProp = WALL_PROPS.find((p) => p.x === x && p.y === y);
    if (wallProp) wallTile = wallProp.gid;

    groundData.push(groundTile);
    wallData.push(wallTile);
  }
}

const map = {
  compressionlevel: -1,
  height,
  width,
  infinite: false,
  layers: [
    {
      data: groundData,
      height,
      id: 1,
      name: 'Ground',
      opacity: 1,
      type: 'tilelayer',
      visible: true,
      width,
      x: 0,
      y: 0,
    },
    {
      data: wallData,
      height,
      id: 2,
      name: 'Walls',
      opacity: 1,
      type: 'tilelayer',
      visible: true,
      width,
      x: 0,
      y: 0,
      properties: [
        {
          name: 'collides',
          type: 'bool',
          value: true,
        },
      ],
    },
  ],
  nextlayerid: 3,
  nextobjectid: 1,
  orientation: 'orthogonal',
  renderorder: 'right-down',
  tiledversion: '1.10.2',
  tileheight: 32,
  tilesets: [
    {
      columns: 4,
      firstgid: 1,
      image: '../tilesets/dungeon_tileset.png',
      imageheight: 128,
      imagewidth: 128,
      margin: 0,
      name: 'dungeon_tileset',
      spacing: 0,
      tilecount: 16,
      tileheight: 32,
      tilewidth: 32,
    },
  ],
  tilewidth: 32,
  type: 'map',
  version: '1.10',
};

fs.writeFileSync('public/assets/maps/prologue_map.json', JSON.stringify(map, null, 2));
console.log('Generated prologue_map.json');
