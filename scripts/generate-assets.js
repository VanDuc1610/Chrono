import fs from 'fs';
import zlib from 'zlib';

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type);
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([lenBuf, body, crcBuf]);
}

function createPng(width, height, pixelFn) {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = [];
  for (let y = 0; y < height; y++) {
    raw.push(0); // filter: none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y);
      raw.push(r, g, b, a);
    }
  }

  const idat = zlib.deflateSync(Buffer.from(raw));
  const end = Buffer.alloc(0);

  return Buffer.concat([
    header,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', end),
  ]);
}

// Ensure directories
const dirs = [
  'public/assets/characters',
  'public/assets/npcs',
  'public/assets/enemies',
  'public/assets/tilesets',
  'public/assets/maps',
  'public/assets/ui',
  'public/assets/effects',
  'public/assets/audio',
  'public/assets/data',
];

for (const dir of dirs) {
  fs.mkdirSync(dir, { recursive: true });
}

// 1. Player Sprite Placeholder (32x32)
// A stylized pixel adventurer placeholder with dark cloak and glowing cyan fracture core
const playerPng = createPng(32, 32, (x, y) => {
  // Outline
  if (x >= 8 && x <= 23 && y >= 4 && y <= 27) {
    // Head / Helm (y: 5-11, x: 10-21)
    if (y >= 5 && y <= 11 && x >= 11 && x <= 20) {
      if (y === 8 && (x === 13 || x === 18)) return [0, 240, 255, 255]; // Cyan visor eye
      return [45, 52, 71, 255]; // Slate Helm
    }
    // Cloak / Torso (y: 12-21, x: 9-22)
    if (y >= 12 && y <= 21 && x >= 9 && x <= 22) {
      if (x >= 14 && x <= 17 && y >= 14 && y <= 17) {
        return [0, 210, 255, 255]; // Divine fracture core
      }
      return [30, 36, 56, 255]; // Midnight cloak
    }
    // Legs / Boots (y: 22-26, x: 11-20)
    if (y >= 22 && y <= 26 && x >= 11 && x <= 20) {
      if (x === 15 || x === 16) return [15, 18, 30, 255]; // Gap
      return [60, 68, 85, 255]; // Boots
    }
    // Shadow / base
    return [20, 24, 38, 255];
  }
  return [0, 0, 0, 0]; // Transparent
});
fs.writeFileSync('public/assets/characters/player_placeholder.png', playerPng);

// 2. NPC Elder Placeholder (32x32)
// An enigmatic hooded scholar/oracle placeholder with golden/amber sigil
const npcPng = createPng(32, 32, (x, y) => {
  if (x >= 8 && x <= 23 && y >= 4 && y <= 27) {
    if (y >= 5 && y <= 11 && x >= 11 && x <= 20) {
      if (y === 8 && (x === 14 || x === 17)) return [255, 200, 80, 255]; // Golden gaze
      return [70, 50, 40, 255]; // Brown hood
    }
    if (y >= 12 && y <= 26 && x >= 9 && x <= 22) {
      if (x >= 14 && x <= 17 && y >= 15 && y <= 18) return [255, 180, 0, 255]; // Rune
      return [90, 65, 50, 255]; // Robe
    }
  }
  return [0, 0, 0, 0];
});
fs.writeFileSync('public/assets/npcs/npc_elder_placeholder.png', npcPng);

// 3. Enemy Placeholder (32x32)
// Fractured Shade / Temporal Anomaly with crimson energy
const enemyPng = createPng(32, 32, (x, y) => {
  if (x >= 6 && x <= 25 && y >= 4 && y <= 27) {
    const dist = Math.hypot(x - 16, y - 16);
    if (dist <= 10) {
      if (dist <= 4) return [255, 50, 80, 255]; // Crimson core
      return [50, 20, 40, 230]; // Dark shadowy aura
    }
  }
  return [0, 0, 0, 0];
});
fs.writeFileSync('public/assets/enemies/enemy_fracture_placeholder.png', enemyPng);

// 4. Tileset (128x128) - 4x4 grid of 32x32 tiles
// Tile 0: Void / Black
// Tile 1: Stone Floor Light
// Tile 2: Stone Floor Dark / Patterned
// Tile 3: Wall Top
// Tile 4: Wall Face
// Tile 5: Broken Stone Pillar
// Tile 6: Fractured Chrono Crystal
// Tile 7: Altar / Shrine Stone
const tilesetPng = createPng(128, 128, (x, y) => {
  const tileX = Math.floor(x / 32);
  const tileY = Math.floor(y / 32);
  const tileId = tileY * 4 + tileX;
  const lx = x % 32;
  const ly = y % 32;

  switch (tileId) {
    case 0: // Void
      return [12, 12, 20, 255];

    case 1: // Sanctuary Stone Floor
      if (lx === 0 || ly === 0 || lx === 31 || ly === 31) {
        return [36, 42, 56, 255]; // Mortar seam
      }
      if ((lx + ly) % 7 === 0) return [50, 58, 76, 255];
      return [42, 49, 66, 255];

    case 2: // Engraved Floor / Ruin Tile
      if (lx === 0 || ly === 0 || lx === 31 || ly === 31) return [30, 35, 48, 255];
      if (lx === ly || lx === 31 - ly) return [65, 80, 110, 255]; // Cross engraving
      return [38, 44, 60, 255];

    case 3: // Wall Top (Solid obstacle)
      if (ly < 4) return [70, 78, 98, 255]; // Highlight
      if (lx === 0 || lx === 31) return [30, 35, 45, 255];
      return [55, 62, 80, 255];

    case 4: // Wall Front / Face (Solid obstacle)
      if (ly < 2) return [80, 90, 115, 255];
      if (ly % 8 === 0) return [25, 28, 38, 255]; // Brick row line
      if (Math.floor(ly / 8) % 2 === 0 ? lx % 16 === 0 : (lx + 8) % 16 === 0) {
        return [25, 28, 38, 255]; // Brick vertical seam
      }
      return [45, 52, 68, 255];

    case 5: // Pillar (Obstacle)
      if (lx >= 6 && lx <= 25) {
        if (ly <= 6 || ly >= 25) return [95, 105, 130, 255]; // Capital / base
        if (lx === 6 || lx === 25) return [30, 35, 45, 255];
        return [70, 80, 102, 255]; // Shaft
      }
      return [12, 12, 20, 255];

    case 6: // Fractured Chrono Crystal (Interactable / obstacle)
      if (Math.abs(lx - 16) + Math.abs(ly - 16) <= 12) {
        if (lx === 16 || ly === 16) return [180, 250, 255, 255]; // Glowing core
        return [0, 160, 220, 255]; // Crystal facet
      }
      return [12, 12, 20, 255];

    case 7: // Ancient Altar (Interactable / obstacle)
      if (lx >= 4 && lx <= 27 && ly >= 8 && ly <= 27) {
        if (ly <= 12) return [110, 120, 145, 255];
        if (lx >= 12 && lx <= 19 && ly >= 16 && ly <= 23) return [0, 220, 200, 255]; // Rune
        return [60, 68, 85, 255];
      }
      return [12, 12, 20, 255];

    default:
      return [20, 20, 30, 255];
  }
});
fs.writeFileSync('public/assets/tilesets/dungeon_tileset.png', tilesetPng);

// 5. UI Assets
// Dialogue Frame (48x48 9-slice styled box)
const uiFramePng = createPng(48, 48, (x, y) => {
  if (x <= 2 || x >= 45 || y <= 2 || y >= 45) return [110, 125, 160, 255]; // Outer border
  if (x <= 4 || x >= 43 || y <= 4 || y >= 43) return [45, 55, 75, 255]; // Inner border
  return [18, 22, 34, 240]; // Dark translucent slate body
});
fs.writeFileSync('public/assets/ui/ui_frame.png', uiFramePng);

// UI Cursor / Pointer (16x16)
const cursorPng = createPng(16, 16, (x, y) => {
  if (x <= y && x + y <= 16 && x <= 10) {
    if (x === y || x + y === 16 || x === 0) return [255, 255, 255, 255];
    return [0, 210, 255, 255];
  }
  return [0, 0, 0, 0];
});
fs.writeFileSync('public/assets/ui/ui_cursor.png', cursorPng);

// 6. Effects Asset
// Hit Spark / Fracture Particle (16x16)
const sparkPng = createPng(16, 16, (x, y) => {
  const d = Math.hypot(x - 8, y - 8);
  if (d <= 6) {
    if (d <= 2) return [255, 255, 255, 255];
    if (d <= 4) return [80, 220, 255, 255];
    return [0, 120, 255, 150];
  }
  return [0, 0, 0, 0];
});
fs.writeFileSync('public/assets/effects/hit_spark.png', sparkPng);

// 7. Minimal Silent Audio WAV placeholder (44 bytes valid standard RIFF WAV)
const wavHeader = Buffer.alloc(44);
wavHeader.write('RIFF', 0);
wavHeader.writeUInt32LE(36, 4); // file size - 8
wavHeader.write('WAVE', 8);
wavHeader.write('fmt ', 12);
wavHeader.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
wavHeader.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
wavHeader.writeUInt16LE(1, 22); // NumChannels (1 = Mono)
wavHeader.writeUInt32LE(8000, 24); // SampleRate (8000 Hz)
wavHeader.writeUInt32LE(8000, 28); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
wavHeader.writeUInt16LE(1, 32); // BlockAlign
wavHeader.writeUInt16LE(8, 34); // BitsPerSample
wavHeader.write('data', 36);
wavHeader.writeUInt32LE(0, 40); // Subchunk2Size (0 bytes of audio data)
fs.writeFileSync('public/assets/audio/silence_placeholder.wav', wavHeader);

console.log('Successfully generated placeholder assets in public/assets/');
