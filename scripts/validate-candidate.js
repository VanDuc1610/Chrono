import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

/**
 * CHRONO Asset Candidate Technical Validator.
 * Decodes PNGs natively using Node.js Buffer and zlib to inspect:
 * 1. PNG Header & Color Depth (32-bit RGBA)
 * 2. Exact Grid Dimensions (32x32, 128x128, 192x128, or 512x512 raw)
 * 3. Transparency & Alpha Channel (pure transparent background, zero white halos)
 * 4. Ground-plane anchor (feet on rows 28-30)
 * 5. Horizontal centroid (centered around X=15-16 in cell)
 * 6. Pixel art cluster count (quantized palette vs continuous blur)
 */

function unfilterScanline(filterType, currentLine, prevLine, bpp) {
  const result = Buffer.alloc(currentLine.length);
  for (let i = 0; i < currentLine.length; i++) {
    const raw = currentLine[i];
    const a = i >= bpp ? result[i - bpp] : 0;
    const b = prevLine ? prevLine[i] : 0;
    const c = prevLine && i >= bpp ? prevLine[i - bpp] : 0;

    switch (filterType) {
      case 0: // None
        result[i] = raw;
        break;
      case 1: // Sub
        result[i] = (raw + a) & 0xff;
        break;
      case 2: // Up
        result[i] = (raw + b) & 0xff;
        break;
      case 3: // Average
        result[i] = (raw + Math.floor((a + b) / 2)) & 0xff;
        break;
      case 4: {
        // Paeth
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        let pr;
        if (pa <= pb && pa <= pc) pr = a;
        else if (pb <= pc) pr = b;
        else pr = c;
        result[i] = (raw + pr) & 0xff;
        break;
      }
      default:
        throw new Error(`Unsupported PNG filter type: ${filterType}`);
    }
  }
  return result;
}

export function parsePNG(filePath) {
  const buffer = fs.readFileSync(filePath);

  // Check PNG signature: 89 50 4E 47 0D 0A 1A 0A
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!buffer.subarray(0, 8).equals(signature)) {
    throw new Error('Not a valid PNG file (invalid signature).');
  }

  let offset = 8;
  let ihdr = null;
  const idatChunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length; // 4 length + 4 type + data + 4 CRC

    if (type === 'IHDR') {
      ihdr = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9], // 6 = RGBA, 2 = RGB, 3 = indexed
        compression: data[10],
        filter: data[11],
        interlace: data[12],
      };
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  if (!ihdr) throw new Error('Missing IHDR chunk in PNG.');

  // The decoder below only understands 8-bit, non-interlaced RGB/RGBA. Anything else would be
  // decoded as garbage and silently produce meaningless metrics, so reject it with a clear reason.
  if (ihdr.colorType !== 6 && ihdr.colorType !== 2) {
    throw new Error(
      `Unsupported color type ${ihdr.colorType} (indexed/grayscale). Re-export as 8-bit RGBA (type 6).`,
    );
  }
  if (ihdr.bitDepth !== 8) {
    throw new Error(`Unsupported bit depth ${ihdr.bitDepth}. Re-export as 8-bit RGBA.`);
  }
  if (ihdr.interlace !== 0) {
    throw new Error('Interlaced (Adam7) PNG is not supported. Re-export without interlacing.');
  }

  const concatenatedIDAT = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(concatenatedIDAT);

  const bpp = ihdr.colorType === 6 ? 4 : ihdr.colorType === 2 ? 3 : 1;
  const stride = ihdr.width * bpp;
  const scanlineLength = 1 + stride;

  const rawPixels = Buffer.alloc(ihdr.width * ihdr.height * 4); // Always output RGBA
  let prevLine = null;

  for (let y = 0; y < ihdr.height; y++) {
    const lineStart = y * scanlineLength;
    const filterType = decompressed[lineStart];
    const currentLine = decompressed.subarray(lineStart + 1, lineStart + scanlineLength);
    const unmasked = unfilterScanline(filterType, currentLine, prevLine, bpp);
    prevLine = unmasked;

    for (let x = 0; x < ihdr.width; x++) {
      const outIdx = (y * ihdr.width + x) * 4;
      if (ihdr.colorType === 6) {
        // RGBA
        const inIdx = x * 4;
        rawPixels[outIdx] = unmasked[inIdx];
        rawPixels[outIdx + 1] = unmasked[inIdx + 1];
        rawPixels[outIdx + 2] = unmasked[inIdx + 2];
        rawPixels[outIdx + 3] = unmasked[inIdx + 3];
      } else if (ihdr.colorType === 2) {
        // RGB
        const inIdx = x * 3;
        rawPixels[outIdx] = unmasked[inIdx];
        rawPixels[outIdx + 1] = unmasked[inIdx + 1];
        rawPixels[outIdx + 2] = unmasked[inIdx + 2];
        rawPixels[outIdx + 3] = 255;
      }
    }
  }

  return { ihdr, pixels: rawPixels };
}

export function validateCandidate(filePath) {
  console.log(`\n==================================================`);
  console.log(`CHRONO ASSET VALIDATION AUDIT: ${path.basename(filePath)}`);
  console.log(`==================================================\n`);

  const report = {
    file: filePath,
    pass: true,
    warnings: [],
    errors: [],
    metrics: {},
  };

  if (!fs.existsSync(filePath)) {
    report.errors.push(`File does not exist: ${filePath}`);
    report.pass = false;
    return report;
  }

  let parsed;
  try {
    parsed = parsePNG(filePath);
  } catch (err) {
    report.errors.push(`PNG parsing failed: ${err.message}`);
    report.pass = false;
    return report;
  }

  const { ihdr, pixels } = parsed;
  report.metrics.width = ihdr.width;
  report.metrics.height = ihdr.height;
  report.metrics.colorType = ihdr.colorType === 6 ? 'RGBA' : `Type ${ihdr.colorType}`;
  report.metrics.interlaced = ihdr.interlace === 1;

  // 1. Format & Color Type Check
  if (ihdr.colorType !== 6) {
    report.errors.push(
      `Image color type is ${ihdr.colorType}. Expected RGBA (type 6) with 8-bit alpha channel.`,
    );
  } else {
    console.log(`✓ Color format: 32-bit RGBA confirmed.`);
  }

  if (ihdr.interlace !== 0) {
    report.warnings.push(
      'Image is interlaced. Non-interlaced is preferred for sprite memory alignment.',
    );
  }

  // 2. Dimensions check
  const allowedSizes = [
    { w: 32, h: 32, desc: 'Single Frame Base Sprite' },
    { w: 64, h: 64, desc: 'Single Frame 2x Sprite' },
    { w: 128, h: 128, desc: 'Idle 4x4 Spritesheet' },
    { w: 192, h: 128, desc: 'Walk/Run/Attack 6x4 Spritesheet' },
    { w: 64, h: 128, desc: 'Hurt 2x4 Spritesheet' },
    { w: 128, h: 32, desc: '4-frame single-row sheet (NPC / enemy idle)' },
    { w: 512, h: 512, desc: 'Raw SD Generation (Pending Downscale to 32x32)' },
    { w: 768, h: 512, desc: 'Raw SD Stride Sheet (Pending Downscale to 192x128)' },
  ];

  const matchedSize = allowedSizes.find((s) => s.w === ihdr.width && s.h === ihdr.height);
  if (!matchedSize) {
    report.warnings.push(
      `Non-standard dimensions: ${ihdr.width}x${ihdr.height}. Standard sizes are 32x32, 128x128, 192x128, or 512x512.`,
    );
  } else {
    console.log(`✓ Dimensions: ${ihdr.width}x${ihdr.height} (${matchedSize.desc})`);
  }

  // 3. Alpha & Transparency Analysis
  const totalPixels = ihdr.width * ihdr.height;
  let transparentCount = 0;
  let semiTransparentCount = 0;
  const uniqueColors = new Set();

  for (let i = 0; i < totalPixels; i++) {
    const r = pixels[i * 4];
    const g = pixels[i * 4 + 1];
    const b = pixels[i * 4 + 2];
    const a = pixels[i * 4 + 3];

    if (a === 0) {
      transparentCount++;
    } else {
      if (a < 250) semiTransparentCount++;
      uniqueColors.add(`${r},${g},${b}`);
    }
  }

  const transparentPct = ((transparentCount / totalPixels) * 100).toFixed(1);
  console.log(
    `✓ Background Transparency: ${transparentPct}% (${transparentCount} transparent pixels)`,
  );

  if (transparentCount === 0) {
    report.errors.push(
      'Image has zero transparent pixels. A transparent background (A=0) is strictly required.',
    );
  }

  // Check 4 corners for transparency
  const cornerIndices = [0, ihdr.width - 1, totalPixels - ihdr.width, totalPixels - 1];
  const cornersTransparent = cornerIndices.every((idx) => pixels[idx * 4 + 3] === 0);
  if (!cornersTransparent) {
    report.warnings.push(
      'Image corner pixels are not fully transparent. Ensure background matte is removed.',
    );
  }

  // Check semi-transparent halo pixels
  const semiPct = ((semiTransparentCount / totalPixels) * 100).toFixed(2);
  if (semiTransparentCount > totalPixels * 0.05) {
    report.warnings.push(
      `High semi-transparency detected (${semiPct}% pixels). AI feathering/blurring should be cleaned to sharp binary edges.`,
    );
  }

  // 4. Color Palette Clustering (Detecting pixel art vs continuous tone blur)
  report.metrics.uniqueColors = uniqueColors.size;
  console.log(`✓ Unique Colors in Sprite: ${uniqueColors.size}`);
  if (uniqueColors.size > 256 && ihdr.width <= 192) {
    report.warnings.push(
      `High color count (${uniqueColors.size}) for 16-bit sprite. Clean pixel art typically uses <= 64 colors.`,
    );
  }

  // 5. Ground-plane analysis (for 32x32 frames or integer divisions)
  if (ihdr.width % 32 === 0 && ihdr.height % 32 === 0 && ihdr.height <= 128) {
    const cols = ihdr.width / 32;
    const rows = ihdr.height / 32;
    let anchorDriftDetected = false;
    // Horizontal centering: body mass centroid should sit near the frame centre (x = 15.5) so the
    // 18x14 foot collider at (7, 16) lines up with the feet. Attack frames may lean, hence a tolerance.
    const CENTER_X = 15.5;
    const CENTER_TOLERANCE_PX = 4;
    const offCenterFrames = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let lowestY = -1;
        let sumX = 0;
        let nonTransCount = 0;

        for (let y = 0; y < 32; y++) {
          for (let x = 0; x < 32; x++) {
            const px = c * 32 + x;
            const py = r * 32 + y;
            const a = pixels[(py * ihdr.width + px) * 4 + 3];
            if (a > 30) {
              lowestY = Math.max(lowestY, y);
              sumX += x;
              nonTransCount++;
            }
          }
        }

        if (lowestY !== -1 && (lowestY < 27 || lowestY > 31)) {
          anchorDriftDetected = true;
        }

        if (nonTransCount > 0) {
          const centroidX = sumX / nonTransCount;
          if (Math.abs(centroidX - CENTER_X) > CENTER_TOLERANCE_PX) {
            offCenterFrames.push(`row ${r} col ${c} (x≈${centroidX.toFixed(1)})`);
          }
        }
      }
    }

    report.metrics.offCenterFrames = offCenterFrames.length;
    if (offCenterFrames.length > 0) {
      report.warnings.push(
        `Horizontal alignment: ${offCenterFrames.length} frame(s) off-centre by more than ` +
          `${CENTER_TOLERANCE_PX}px: ${offCenterFrames.join(', ')}. Sprite should be centred on x=15.5.`,
      );
    } else {
      console.log('✓ Horizontal alignment: All frames centred within tolerance.');
    }

    if (anchorDriftDetected) {
      report.warnings.push(
        'Ground contact variation detected across frames. Feet should anchor on rows 28-30.',
      );
    } else {
      console.log('✓ Ground-plane anchor: Feet anchored consistently across frames.');
    }
  }

  // Summary
  if (report.errors.length > 0) {
    report.pass = false;
    console.log(`\n❌ AUDIT FAILED with ${report.errors.length} error(s):`);
    report.errors.forEach((e) => console.log(`   - [ERROR] ${e}`));
  } else {
    console.log(`\n✅ TECHNICAL SPECIFICATIONS PASSED!`);
  }

  if (report.warnings.length > 0) {
    console.log(`\n⚠️  ${report.warnings.length} Advisory Warning(s):`);
    report.warnings.forEach((w) => console.log(`   - [WARN] ${w}`));
  }

  console.log(
    `\nREMINDER: Per AGENTS.md, candidates require formal user approval before promotion.`,
  );
  console.log(`==================================================\n`);

  return report;
}

// CLI Execution support
if (process.argv[1] && process.argv[1].endsWith('validate-candidate.js')) {
  const targetFile = process.argv[2] || 'art-source/characters/peter/concept/peter_concept_v1.png';
  validateCandidate(targetFile);
}
