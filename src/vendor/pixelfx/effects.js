// CHRONO (T-84): the pixelfx effects the game uses, by short key. Not part of pixelfx itself.
export { createFrame, clearFrame, createFx, composite } from "./core/fx.js";
import * as hitSpark from "./fx/impacts/hit-spark.js";
import * as critHit from "./fx/impacts/crit-hit.js";
import * as shieldBlock from "./fx/impacts/shield-block.js";
import * as groundSlam from "./fx/impacts/ground-slam.js";
import * as splash from "./fx/water/splash.js";
import * as waveCrash from "./fx/water/wave-crash.js";
import * as timeStop from "./fx/arcane/time-stop.js";
import * as blinkIn from "./fx/arcane/blink-in.js";
import * as blinkOut from "./fx/arcane/blink-out.js";
import * as smite from "./fx/holy/smite.js";
import * as holyPillar from "./fx/holy/holy-pillar.js";
import * as soulRise from "./fx/spawn/soul-rise.js";
import * as poof from "./fx/spawn/poof.js";
import * as stunned from "./fx/status/stunned.js";
import * as curse from "./fx/shadow/curse.js";
import * as frostNova from "./fx/ice/frost-nova.js";

import * as bird from "./fx/critters/bird.js";
import * as bat from "./fx/critters/bat.js";
import * as butterfly from "./fx/critters/butterfly.js";
import * as wisp from "./fx/critters/wisp.js";
import * as fireflies from "./fx/weather/fireflies.js";
import * as fallingLeaves from "./fx/weather/falling-leaves.js";
import * as snow from "./fx/weather/snow.js";
import * as godRays from "./fx/weather/god-rays.js";
import * as cherryBlossoms from "./fx/weather/cherry-blossoms.js";
import * as drip from "./fx/water/drip.js";
import * as ripples from "./fx/water/ripples.js";

export const EFFECTS = {
  hitSpark,
  critHit,
  shieldBlock,
  groundSlam,
  splash,
  waveCrash,
  timeStop,
  blinkIn,
  blinkOut,
  smite,
  holyPillar,
  soulRise,
  poof,
  stunned,
  curse,
  frostNova,
  // T-85 map decor
  bird,
  bat,
  butterfly,
  wisp,
  fireflies,
  fallingLeaves,
  snow,
  godRays,
  cherryBlossoms,
  drip,
  ripples,
};
