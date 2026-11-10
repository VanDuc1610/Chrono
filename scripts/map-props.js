/**
 * Placement of the T-22 prop tiles in the prologue map (single source of truth).
 * Used by scripts/author-sanctuary-tileset.js for review previews, and by
 * scripts/generate-map.js once the prop tiles are approved.
 *
 * GID = tile index + 1. Walls-layer props collide (generate-map collides GIDs 4..16).
 */
export const WALL_PROPS = [
  { x: 3, y: 4, gid: 11, what: 'Stele of the Six Authorities (I-1)' },
  { x: 20, y: 4, gid: 12, what: 'Frozen Astrolabe (I-4)' },
  { x: 7, y: 2, gid: 13, what: 'Cracked Reliquary (I-5)' },
  { x: 12, y: 1, gid: 14, what: 'Sealed Threshold Gates (I-6), set into the north wall face' },
];

export const GROUND_PROPS = [{ x: 14, y: 12, gid: 15, what: 'Torn Journal Leaf (I-3)' }];
