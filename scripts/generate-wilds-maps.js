/**
 * Writes the Forgotten Forest and Old Lighthouse tilemaps (Tiled JSON) from scripts/wilds-layout.js
 * — the layouts the owner approved in the wilds tileset previews (ENV_WILDS_001).
 *
 *   public/assets/maps/map_forgotten_forest.json  (26×18)
 *   public/assets/maps/map_old_lighthouse.json    (24×18)
 *
 * Usage: node scripts/generate-wilds-maps.js
 */
import fs from 'fs';
import { forestLayout, lighthouseLayout } from './wilds-layout.js';

const TILESET = {
  columns: 8,
  firstgid: 1,
  image: '../tilesets/wilds_tileset.png',
  imageheight: 192,
  imagewidth: 256,
  margin: 0,
  name: 'wilds_tileset',
  spacing: 0,
  tilecount: 48,
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
  ['public/assets/maps/map_forgotten_forest.json', forestLayout()],
  ['public/assets/maps/map_old_lighthouse.json', lighthouseLayout()],
]) {
  fs.writeFileSync(file, JSON.stringify(toTiled(layout)) + '\n');
  console.log(`✓ ${file} (${layout.width}x${layout.height})`);
}
