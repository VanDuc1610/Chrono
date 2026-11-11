/**
 * Writes the Prologue v2 coastal tilemaps (Tiled JSON) from scripts/coastal-layout.js — the same
 * layouts the owner approved in the coastal tileset previews (ENV_COASTAL_001).
 *
 *   public/assets/maps/map_peters_room.json   (14×10)
 *   public/assets/maps/map_coastal_town.json  (28×18)
 *
 * Usage: node scripts/generate-coastal-maps.js
 * Spawns, exits and points of interest are declared in public/assets/data/maps.json (tile coords
 * from the layout's `spawns` / `exits` / `points`).
 */
import fs from 'fs';
import { roomLayout, townLayout } from './coastal-layout.js';

const TILESET = {
  columns: 8,
  firstgid: 1,
  image: '../tilesets/coastal_tileset.png',
  imageheight: 160,
  imagewidth: 256,
  margin: 0,
  name: 'coastal_tileset',
  spacing: 0,
  tilecount: 40,
  tileheight: 32,
  tilewidth: 32,
};

function toTiled(layout) {
  const flat = (layer) => layer.flat().map((idx) => (idx < 0 ? 0 : idx + 1));
  const layer = (id, name, data) => ({
    data,
    height: layout.height,
    id,
    name,
    opacity: 1,
    type: 'tilelayer',
    visible: true,
    width: layout.width,
    x: 0,
    y: 0,
  });
  return {
    compressionlevel: -1,
    height: layout.height,
    width: layout.width,
    infinite: false,
    layers: [layer(1, 'Ground', flat(layout.ground)), layer(2, 'Walls', flat(layout.walls))],
    nextlayerid: 3,
    nextobjectid: 1,
    orientation: 'orthogonal',
    renderorder: 'right-down',
    tiledversion: '1.10.2',
    tileheight: 32,
    tilesets: [TILESET],
    tilewidth: 32,
    type: 'map',
    version: '1.10',
  };
}

for (const [file, layout] of [
  ['public/assets/maps/map_peters_room.json', roomLayout()],
  ['public/assets/maps/map_coastal_town.json', townLayout()],
]) {
  fs.writeFileSync(file, JSON.stringify(toTiled(layout)) + '\n');
  console.log(`✓ ${file} (${layout.width}x${layout.height})`);
}
