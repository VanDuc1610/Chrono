import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
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
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = [];
  for (let y = 0; y < height; y++) {
    raw.push(0);
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
    makeChunk('IEND', end)
  ]);
}

const dir = 'public/assets/characters/peter';
fs.mkdirSync(dir, { recursive: true });

// Palette colors for Peter
const C_TRANSPARENT = [0, 0, 0, 0];
const C_HAIR_DARK = [34, 22, 15, 255];      // Deep brown curl shadow
const C_HAIR_MID = [59, 41, 29, 255];       // Compact curly dark-brown
const C_HAIR_LGT = [89, 65, 50, 255];       // Curly clump highlight
const C_SKIN_BASE = [218, 185, 160, 255];   // Neutral weathered skin
const C_SKIN_SHADOW = [178, 142, 118, 255]; // Skin shadow
const C_EYE = [96, 125, 156, 255];          // Muted gray-blue
const C_COAT_DARK = [22, 30, 46, 255];      // Charcoal-blue shadow
const C_COAT_MID = [38, 50, 72, 255];       // Asymmetrical charcoal-blue
const C_COAT_LGT = [61, 79, 112, 255];      // Charcoal-blue highlight
const C_COAT_LINING = [20, 25, 38, 255];    // Indigo-slate lining
const C_STRAP = [69, 49, 35, 255];          // Oiled leather strap
const C_SILVER = [156, 166, 186, 255];      // Aged silver buckles & details
const C_TROUSERS = [24, 28, 36, 255];       // Dark trousers
const C_BOOTS = [46, 34, 25, 255];          // Leather boots
const C_BLADE = [140, 150, 165, 255];       // Steel blade
const C_BLADE_GLOW = [0, 200, 255, 255];    // Cerulean chronal fracture glow

/**
 * Renders a single 32x32 Peter sprite frame adhering to:
 * - Short compact curly dark-brown hair covering entire head (no undercut, no shaved sides)
 * - Muted gray-blue eyes
 * - Asymmetrical charcoal-blue travel coat
 * - Diagonal leather shoulder strap
 * - Aged silver buckle
 * - Broken Blade with cerulean glow
 */
function drawPeterFrame(x, y, dir, animType, frameIdx) {
  // Local coordinates inside 32x32 frame
  const lx = x % 32;
  const ly = y % 32;

  // Animation offsets
  let bobY = 0;
  let legOffset = 0;
  let armOffset = 0;

  if (animType === 'walk') {
    bobY = (frameIdx % 2 === 1) ? -1 : 0;
    legOffset = (frameIdx % 4 === 1) ? 2 : ((frameIdx % 4 === 3) ? -2 : 0);
    armOffset = -legOffset;
  } else if (animType === 'run') {
    bobY = (frameIdx % 2 === 1) ? -2 : 0;
    legOffset = (frameIdx % 2 === 1) ? 3 : -3;
    armOffset = -legOffset;
  } else if (animType === 'idle') {
    bobY = (frameIdx === 1 || frameIdx === 2) ? -1 : 0;
  } else if (animType === 'hurt') {
    bobY = frameIdx === 0 ? -2 : 0;
  } else if (animType === 'temporal_sight') {
    bobY = 0;
  }

  const adjY = ly - bobY;

  // 1. HAIR: Compact curly dark-brown covering whole head (y: 3..10, x: 10..21)
  // Rounded curly silhouette with defined curl bumps
  if (adjY >= 3 && adjY <= 10 && lx >= 10 && lx <= 21) {
    // Curl texture pattern
    const curlMod = ((lx * 7) ^ (adjY * 11)) % 5;
    if (adjY <= 4) {
      // Top curls
      if (lx <= 10 || lx >= 21) return C_TRANSPARENT; // Rounded dome
      return curlMod > 2 ? C_HAIR_LGT : C_HAIR_MID;
    }
    if (dir === 1) {
      // Back view: hair covers down to neck (y=11)
      if (adjY <= 11) return curlMod === 0 ? C_HAIR_DARK : (curlMod > 2 ? C_HAIR_LGT : C_HAIR_MID);
    } else {
      // Front & sides: hair frames upper forehead, no shaved sides
      if (adjY <= 7) return curlMod === 0 ? C_HAIR_DARK : (curlMod > 2 ? C_HAIR_LGT : C_HAIR_MID);
      if (lx === 10 || lx === 21) return C_HAIR_MID; // Hair covers sides naturally (no fade/undercut)
    }
  }

  // 2. FACE (y: 7..11, x: 11..20)
  if (dir !== 1 && adjY >= 7 && adjY <= 11 && lx >= 11 && lx <= 20) {
    // Face skin
    if (adjY === 8) {
      // Eyes: Muted gray-blue
      if (dir === 0) {
        if (lx === 13 || lx === 18) return C_EYE; // Left & right gray-blue eyes
        if (lx === 14 || lx === 17) return [255, 255, 255, 255]; // Eye whites
      } else if (dir === 2) {
        if (lx === 13) return C_EYE; // Profile left
      } else if (dir === 3) {
        if (lx === 18) return C_EYE; // Profile right
      }
    }
    // Stubble / jaw shading
    if (adjY === 11) return C_SKIN_SHADOW;
    return C_SKIN_BASE;
  }

  // 3. TORSO & ASYMMETRICAL CHARCOAL-BLUE COAT (y: 12..22, x: 9..22)
  if (adjY >= 12 && adjY <= 22 && lx >= 9 && lx <= 22) {
    // Collar & Lapel
    if (adjY === 12 || adjY === 13) {
      if (lx >= 13 && lx <= 18) return C_COAT_DARK; // High collar
    }

    // Diagonal Leather Shoulder Strap (from right shoulder down to left hip)
    // Formula: lx + adjY approx line
    const strapBand = (lx + adjY);
    if (strapBand >= 27 && strapBand <= 29 && adjY >= 13 && adjY <= 21) {
      if (adjY === 17 && lx === 11) return C_SILVER; // Aged silver buckle
      return C_STRAP;
    }

    // Asymmetrical Coat Drape: Left side (x: 10..15) drapes lower down to y=22
    if (adjY >= 21) {
      if (lx >= 10 && lx <= 15) return C_COAT_LINING; // Asymmetrical longer left drape
      return C_TRANSPARENT;
    }

    // Main Coat Body
    if (lx === 9 || lx === 22) {
      // Arms / Sleeves
      return (adjY + armOffset) % 2 === 0 ? C_COAT_DARK : C_COAT_MID;
    }

    if (lx === 16 && dir === 0) {
      // Overlap seam of coat
      return C_COAT_DARK;
    }

    return (lx % 2 === 0) ? C_COAT_MID : C_COAT_LGT;
  }

  // 4. SIGNATURE OBJECT: BROKEN BLADE (Held at side or in front)
  if (animType === 'attack' || dir === 0 || dir === 3) {
    if (lx >= 23 && lx <= 25 && adjY >= 14 && adjY <= 21) {
      if (adjY === 14) return C_SILVER; // Hilt / pommel
      if (adjY === 15) return [50, 40, 30, 255]; // Leather guard
      if (adjY >= 16 && adjY <= 18) return C_BLADE; // Steel blade fragment
      if (adjY >= 19 && adjY <= 20) return C_BLADE_GLOW; // Broken jagged edge glowing cerulean
    }
  }

  // 5. TROUSERS & LEGS (y: 23..27, x: 11..20)
  if (adjY >= 23 && adjY <= 27 && lx >= 11 && lx <= 20) {
    if (lx === 15 || lx === 16) return C_TRANSPARENT; // Leg separation
    // Left leg
    if (lx >= 11 && lx <= 14) {
      const legY = adjY + legOffset;
      if (legY >= 26) return C_BOOTS; // Leather boots
      return C_TROUSERS;
    }
    // Right leg
    if (lx >= 17 && lx <= 20) {
      const legY = adjY - legOffset;
      if (legY >= 26) return C_BOOTS;
      return C_TROUSERS;
    }
  }

  // 6. BOOTS BASE (y: 28..29)
  if (adjY >= 28 && adjY <= 29 && lx >= 11 && lx <= 20) {
    if (lx === 15 || lx === 16) return C_TRANSPARENT;
    return C_BOOTS;
  }

  return C_TRANSPARENT;
}

// 1. Idle Sheet (4 frames x 4 directions = 128x128)
const idlePng = createPng(128, 128, (x, y) => {
  const frameX = Math.floor(x / 32);
  const dirY = Math.floor(y / 32);
  return drawPeterFrame(x, y, dirY, 'idle', frameX);
});
fs.writeFileSync(path.join(dir, 'peter_idle.png'), idlePng);

// 2. Walk Sheet (6 frames x 4 directions = 192x128)
const walkPng = createPng(192, 128, (x, y) => {
  const frameX = Math.floor(x / 32);
  const dirY = Math.floor(y / 32);
  return drawPeterFrame(x, y, dirY, 'walk', frameX);
});
fs.writeFileSync(path.join(dir, 'peter_walk.png'), walkPng);

// 3. Run Sheet (6 frames x 4 directions = 192x128)
const runPng = createPng(192, 128, (x, y) => {
  const frameX = Math.floor(x / 32);
  const dirY = Math.floor(y / 32);
  return drawPeterFrame(x, y, dirY, 'run', frameX);
});
fs.writeFileSync(path.join(dir, 'peter_run.png'), runPng);

// 4. Attack Sheet (6 frames x 4 directions = 192x128)
const attackPng = createPng(192, 128, (x, y) => {
  const frameX = Math.floor(x / 32);
  const dirY = Math.floor(y / 32);
  return drawPeterFrame(x, y, dirY, 'attack', frameX);
});
fs.writeFileSync(path.join(dir, 'peter_attack.png'), attackPng);

// 5. Hurt Sheet (2 frames x 4 directions = 64x128)
const hurtPng = createPng(64, 128, (x, y) => {
  const frameX = Math.floor(x / 32);
  const dirY = Math.floor(y / 32);
  return drawPeterFrame(x, y, dirY, 'hurt', frameX);
});
fs.writeFileSync(path.join(dir, 'peter_hurt.png'), hurtPng);

// 6. Temporal Sight Sheet (4 frames x 4 directions = 128x128)
const sightPng = createPng(128, 128, (x, y) => {
  const frameX = Math.floor(x / 32);
  const dirY = Math.floor(y / 32);
  return drawPeterFrame(x, y, dirY, 'temporal_sight', frameX);
});
fs.writeFileSync(path.join(dir, 'peter_temporal_sight.png'), sightPng);

console.log('Successfully generated all Peter top-down sprite sheets in public/assets/characters/peter/');

