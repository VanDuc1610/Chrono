/**
 * Layouts of the Prologue v2 coastal maps (PROLOGUE_V2_DESIGN.md §2), shared by the tileset
 * preview (scripts/author-coastal-tileset.js) and the map generator. Values are TILE INDICES of
 * coastal_tileset (GID = index + 1); -1 = empty cell.
 *
 * Ground layer: opaque floor tiles. Walls layer: everything that blocks movement (indices 16-39).
 */
export const C = {
  // ground (walkable)
  SAND: 0,
  SAND_SHELLS: 1,
  PATH: 2,
  GRASS: 3,
  BRICK: 4,
  WOOD: 5,
  WOOD_ALT: 6,
  PIER: 7,
  SHORE: 8,
  SANDALS: 9,
  RUG: 10,
  EMPTY_LOT: 11,
  THRESHOLD: 12,
  FOOTPRINTS: 13,
  PATH_PEBBLES: 14,
  // walls layer (collide)
  WATER: 16,
  LIME_WALL: 17,
  WALL_WINDOW: 18,
  DOOR: 19,
  ROOF: 20,
  EAVE: 21,
  ROOM_WALL: 22,
  ROOM_BEAM: 23,
  PALM_TRUNK: 24,
  PALM_CROWN: 25,
  BASKET_BOAT: 26,
  BANH_CAN_STALL: 27,
  RED_STOOL: 28,
  NET_PILE: 29,
  WELL: 30,
  STONE_FENCE: 31,
  BED_HEAD: 32,
  BED_FOOT: 33,
  DESK: 34,
  BOOKSHELF: 35,
  KEY_TABLE: 36,
  WALL_PHOTO: 37,
  WALL_WINDOW_SEA: 38,
  NIGHTSTAND_WATCH: 39,
};

/** First / last tile index of the Walls-layer collision range. */
export const COLLIDE_FROM = 16;
export const COLLIDE_TO = 39;

const hash = (x, y, s) => (((x * 73856093) ^ (y * 19349663) ^ (s * 83492791)) >>> 0) % 100;

function grid(w, h, fill) {
  return Array.from({ length: h }, () => Array(w).fill(fill));
}

/** A house: roof row, eave row, wall row (window / door pattern). */
function house(walls, x0, y0, pattern) {
  pattern.forEach((cell, i) => {
    walls[y0][x0 + i] = C.ROOF;
    walls[y0 + 1][x0 + i] = C.EAVE;
    walls[y0 + 2][x0 + i] = cell;
  });
}

/** Coastal town, 28×18. */
export function townLayout() {
  const W = 28;
  const H = 18;
  const ground = grid(W, H, C.SAND);
  const walls = grid(W, H, -1);

  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const r = hash(x, y, 5);
      if (r < 10) ground[y][x] = C.SAND_SHELLS;
      else if (r < 16) ground[y][x] = C.GRASS;
    }

  // Stone fence along the north edge, open where the forest path leaves (x 25-26).
  for (let x = 0; x < W; x++) if (x < 25 || x > 26) walls[0][x] = C.STONE_FENCE;

  // Houses: Peter's (door x5), the forgotten child's (door x12), a neighbour's (window only).
  const L = C.LIME_WALL;
  const Wn = C.WALL_WINDOW;
  house(walls, 3, 1, [L, Wn, C.DOOR, Wn, L]);
  house(walls, 10, 1, [Wn, L, C.DOOR, L, Wn]);
  house(walls, 17, 1, [L, Wn, Wn, Wn, L]);
  ground[4][12] = C.SANDALS; // doorstep of the house nobody claims

  // Main road (y 11-12), lane to Peter's door, path north-east to the forest.
  for (let x = 0; x < W; x++) {
    ground[11][x] = hash(x, 11, 9) < 20 ? C.PATH_PEBBLES : C.PATH;
    ground[12][x] = hash(x, 12, 9) < 20 ? C.PATH_PEBBLES : C.PATH;
  }
  for (let y = 4; y <= 10; y++) ground[y][5] = C.PATH;
  for (let y = 0; y <= 10; y++) {
    ground[y][25] = C.PATH;
    ground[y][26] = C.PATH;
  }

  // Cô Ba's courtyard (gạch tàu) with the bánh căn stall and two red stools.
  for (let y = 6; y <= 10; y++) for (let x = 8; x <= 13; x++) ground[y][x] = C.BRICK;
  walls[7][11] = C.BANH_CAN_STALL;
  walls[8][10] = C.RED_STOOL; // Peter's seat
  walls[8][12] = C.RED_STOOL; // the Empty Seat

  // The empty lot (Residual Existence).
  for (let y = 6; y <= 8; y++) for (let x = 20; x <= 22; x++) ground[y][x] = C.EMPTY_LOT;

  // Shore: footprints, wet sand, sea; the pier and Ông Sáu's corner.
  for (let x = 0; x < W; x++) {
    if (hash(x, 13, 3) < 25) ground[13][x] = C.FOOTPRINTS;
    ground[14][x] = C.SHORE;
    for (let y = 15; y < H; y++) {
      ground[y][x] = C.WATER;
      walls[y][x] = C.WATER;
    }
  }
  for (let y = 14; y < H; y++)
    for (const x of [18, 19]) {
      ground[y][x] = C.PIER;
      walls[y][x] = -1;
    }
  walls[16][21] = C.BASKET_BOAT;
  walls[15][15] = C.BASKET_BOAT;
  walls[13][15] = C.BASKET_BOAT; // beached, next to Ông Sáu
  walls[13][17] = C.NET_PILE;
  walls[13][6] = C.WELL;

  // Palms (crown sits on the cell above its trunk).
  for (const [x, y] of [
    [1, 7],
    [15, 6],
    [23, 13],
    [27, 7],
    [8, 13],
  ]) {
    walls[y][x] = C.PALM_TRUNK;
    walls[y - 1][x] = C.PALM_CROWN;
  }

  return {
    width: W,
    height: H,
    ground,
    walls,
    spawns: { default: { x: 5, y: 6 }, from_house: { x: 5, y: 5 }, from_forest: { x: 25, y: 1 } },
    exits: {
      to_room: { x: 5, y: 4, w: 1, h: 1 },
      to_forest: { x: 25, y: 0, w: 2, h: 1 },
    },
    points: {
      vendor_ba: { x: 11, y: 9 },
      fisherman_sau: { x: 16, y: 13 },
      empty_lot: { x: 21, y: 7 },
      ancient_well: { x: 6, y: 12 },
      child_sandals: { x: 12, y: 4 },
    },
  };
}

/** Peter's attic room, 14×10. */
export function roomLayout() {
  const W = 14;
  const H = 10;
  const ground = grid(W, H, C.WOOD);
  const walls = grid(W, H, -1);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) if (hash(x, y, 7) < 30) ground[y][x] = C.WOOD_ALT;

  for (let x = 0; x < W; x++) {
    walls[0][x] = C.ROOM_BEAM;
    walls[1][x] = C.ROOM_WALL;
    walls[H - 1][x] = C.ROOM_BEAM;
  }
  for (let y = 0; y < H; y++) {
    walls[y][0] = C.ROOM_BEAM;
    walls[y][W - 1] = C.ROOM_BEAM;
  }
  walls[1][5] = C.WALL_PHOTO;
  walls[1][9] = C.WALL_WINDOW_SEA;
  walls[1][10] = C.WALL_WINDOW_SEA;

  walls[2][2] = C.BED_HEAD;
  walls[3][2] = C.BED_FOOT;
  walls[2][3] = C.NIGHTSTAND_WATCH;
  walls[2][5] = C.DESK;
  walls[2][11] = C.BOOKSHELF;
  walls[2][12] = C.BOOKSHELF;
  walls[6][11] = C.KEY_TABLE;
  for (let y = 5; y <= 7; y++) for (let x = 5; x <= 8; x++) ground[y][x] = C.RUG;

  // Door to the town in the south wall.
  walls[H - 1][7] = -1;
  ground[H - 1][7] = C.THRESHOLD;

  return {
    width: W,
    height: H,
    ground,
    walls,
    spawns: { default: { x: 3, y: 4 }, from_town: { x: 7, y: 8 } },
    exits: { to_town: { x: 7, y: 9, w: 1, h: 1 } },
    points: {
      bed: { x: 2, y: 3 },
      notebook: { x: 5, y: 2 },
      photo: { x: 5, y: 1 },
      watch: { x: 3, y: 2 },
      key: { x: 11, y: 6 },
    },
  };
}
