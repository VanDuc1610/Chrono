import { spawn } from 'child_process';
import { installQuietConsole } from './lib/test-output.js';
import http from 'http';

installQuietConsole();

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getDebuggerUrl(port) {
  for (let i = 0; i < 25; i++) {
    try {
      const data = await new Promise((resolve, reject) => {
        http
          .get(`http://127.0.0.1:${port}/json/list`, (res) => {
            let body = '';
            res.on('data', (c) => (body += c));
            res.on('end', () => resolve(body));
          })
          .on('error', reject);
      });
      const list = JSON.parse(data);
      if (Array.isArray(list)) {
        const pageTarget = list.find(
          (t) => (t.type === 'page' || t.url.includes('3000')) && t.webSocketDebuggerUrl,
        );
        if (pageTarget) {
          return pageTarget.webSocketDebuggerUrl;
        }
      }
    } catch {
      // retry
    }
    await wait(200);
  }
  throw new Error('Unable to obtain debugger WebSocket URL from Edge.');
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.pending = new Map();
  }

  async connect() {
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) {
          reject(new Error(msg.error.message));
        } else {
          resolve(msg.result);
        }
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval exception: ${res.exceptionDetails.text}`);
    }
    return res.result ? res.result.value : undefined;
  }

  close() {
    this.ws.close();
  }
}

async function waitForScene(client, sceneKey, maxRetries = 35) {
  for (let i = 0; i < maxRetries; i++) {
    const active = await client.eval(
      `Boolean(window.__GAME__ && window.__GAME__.scene.isActive('${sceneKey}'))`,
    );
    if (active) return true;
    await wait(200);
  }
  return false;
}

/**
 * Helper JS snippet evaluated inside the browser to inspect state across both
 * current ExplorationScene fields and the upcoming GameSession refactor (T-09).
 */
const BROWSER_HELPERS = `
  window.__TEST_HELPERS__ = {
    getExploration() {
      return window.__GAME__.scene.getScene('ExplorationScene');
    },
    getCombat() {
      return window.__GAME__.scene.getScene('CombatScene');
    },
    getMenu() {
      return window.__GAME__.scene.getScene('MainMenuScene');
    },
    getQuestSystem() {
      const exp = this.getExploration();
      if (exp && exp.session && exp.session.quests) return exp.session.quests;
      if (exp && exp.session && exp.session.questSystem) return exp.session.questSystem;
      if (exp && exp.questSystem) return exp.questSystem;
      return null;
    },
    getInventorySystem() {
      const exp = this.getExploration();
      if (exp && exp.session && exp.session.inventory) return exp.session.inventory;
      if (exp && exp.session && exp.session.inventorySystem) return exp.session.inventorySystem;
      if (exp && exp.inventorySystem) return exp.inventorySystem;
      return null;
    },
    isElderObjectiveCompleted() {
      const qs = this.getQuestSystem();
      if (!qs) return false;
      const q = qs.getQuest('quest_prologue_awakening');
      if (!q || !Array.isArray(q.objectives)) return false;
      const obj = q.objectives.find(o => o.id === 'obj_speak_elder');
      return Boolean(obj && obj.completed);
    },
    getShardCount() {
      const inv = this.getInventorySystem();
      return inv ? inv.getItemCount('chrono_shard_minor') : -1;
    },
    hasChronometer() {
      const inv = this.getInventorySystem();
      return inv ? inv.hasItem('relic_chronometer') : false;
    },
    clearAllShards() {
      const inv = this.getInventorySystem();
      if (inv) {
        const count = inv.getItemCount('chrono_shard_minor');
        if (count > 0) inv.removeItem('chrono_shard_minor', count);
      }
      const combat = this.getCombat();
      if (combat && combat.session) {
        const cInv = combat.session.inventory || combat.session.inventorySystem;
        if (cInv) {
          const c = cInv.getItemCount('chrono_shard_minor');
          if (c > 0) cInv.removeItem('chrono_shard_minor', c);
        }
      }
    },
    pressKey(sceneKey, keyName, keyCode) {
      const scene = window.__GAME__.scene.getScene(sceneKey);
      if (scene && scene.input && scene.input.keyboard) {
        scene.input.keyboard.emit('keydown-' + keyName, {
          keyCode,
          preventDefault: () => {}
        });
      }
    }
  };
`;

async function triggerFreshNewGame(client) {
  await client.eval(`
    (() => {
      const sm = window.__GAME__.scene;
      if (!sm.isActive('MainMenuScene')) {
        sm.stop('CombatScene');
        sm.stop('ExplorationScene');
        sm.start('MainMenuScene');
      }
    })()
  `);
  await waitForScene(client, 'MainMenuScene');
  await wait(250);
  await client.eval(`
    (() => {
      const menu = window.__GAME__.scene.getScene('MainMenuScene');
      if (menu && typeof menu.startNewGame === 'function') {
        menu.startNewGame();
        // Regression scenarios run in the Antechamber (Shade, Elder); a new game starts in Peter's room.
        window.__GAME__.registry.get('chrono.gameSession').position = { mapId: 'map_shattered_antechamber', x: 400, y: 336 };
      } else {
        window.__GAME__.scene.start('ExplorationScene');
      }
    })()
  `);
  await waitForScene(client, 'ExplorationScene');
  await wait(450);
}

async function touchShadeToEnterCombat(client) {
  await client.eval(`
    (() => {
      const exp = window.__GAME__.scene.getScene('ExplorationScene');
      if (exp.dialogueSystem && exp.dialogueSystem.isActive()) {
        exp.closeDialogue();
      }
      exp.player.setPosition(16 * 32 + 16, 9 * 32 + 16);
    })()
  `);
  const entered = await waitForScene(client, 'CombatScene');
  await wait(450);
  // Make escape rolls succeed deterministically. Only the combat RNG is stubbed: overriding the
  // global Math.random breaks Phaser (constant texture UUIDs -> every new Text fails to create).
  await client.eval(`
    (() => {
      const combat = window.__GAME__.scene.getScene('CombatScene');
      if (combat.combatSystem && typeof combat.combatSystem.setRandomSource === 'function') {
        combat.combatSystem.setRandomSource(() => 0.01);
      }
    })()
  `);
  return entered;
}

async function run() {
  console.log('==========================================================');
  console.log('CHRONO – SESSION REGRESSION TEST SUITE (T-11: B1-B4, B6)');
  console.log('==========================================================\n');

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const port = 9226;
  const edgeProcess = spawn(
    edgePath,
    [
      '--headless=new',
      `--remote-debugging-port=${port}`,
      '--window-size=1280,720',
      'http://localhost:3000/',
    ],
    { stdio: 'ignore' },
  );

  const results = [];

  try {
    const wsUrl = await getDebuggerUrl(port);
    const client = new CDPClient(wsUrl);
    await client.connect();
    await client.send('Runtime.enable');
    await client.send('Page.enable');

    await waitForScene(client, 'MainMenuScene');
    await client.eval(BROWSER_HELPERS);

    // =========================================================================
    // SCENARIO 1 (B1): Talk to Elder -> Enter Combat -> Escape -> Return:
    // Objective "obj_speak_elder" remains completed.
    // =========================================================================
    console.log('[Scenario 1 / B1] Talk to Elder -> Combat -> Escape -> Check obj_speak_elder...');
    await triggerFreshNewGame(client);
    await client.eval(BROWSER_HELPERS);

    // Move Peter next to Elder Chronographer and interact
    await client.eval(`
      (() => {
        const exp = window.__TEST_HELPERS__.getExploration();
        exp.player.setPosition(9 * 32 + 16, 9 * 32 + 16);
        exp.interactionSystem.triggerInteraction(exp.player.sprite);
        if (exp.dialogueSystem.isActive()) {
          exp.closeDialogue();
        }
      })()
    `);
    await wait(200);

    const beforeCombatObj = await client.eval(
      `window.__TEST_HELPERS__.isElderObjectiveCompleted()`,
    );
    const shardsBeforeEscape = await client.eval(`window.__TEST_HELPERS__.getShardCount()`);

    // Touch Shade -> Enter Combat -> Press 5 (Escape)
    await touchShadeToEnterCombat(client);
    await client.eval(`window.__TEST_HELPERS__.pressKey('CombatScene', 'FIVE', 53)`);

    // Wait to return to ExplorationScene
    await waitForScene(client, 'ExplorationScene');
    await wait(500);

    const afterEscapeObj = await client.eval(`window.__TEST_HELPERS__.isElderObjectiveCompleted()`);
    const b1Pass = beforeCombatObj === true && afterEscapeObj === true;
    results.push({
      id: 'Scenario 1 (B1)',
      pass: b1Pass,
      detail: `beforeCombat=${beforeCombatObj}, afterEscape=${afterEscapeObj}`,
    });
    console.log(
      `  -> ${b1Pass ? 'PASS' : 'FAIL'} (obj_speak_elder completed: before=${beforeCombatObj}, afterEscape=${afterEscapeObj})\n`,
    );

    // =========================================================================
    // SCENARIO 4 (B4): Escape -> Touch Shade a 2nd time -> Key 1 (Attack) deals damage.
    // (Tested right after Scenario 1's Escape while we are back in ExplorationScene!)
    // =========================================================================
    const shardsAfterEscape = await client.eval(`window.__TEST_HELPERS__.getShardCount()`);

    console.log(
      '[Scenario 4 / B4] After Escape -> Touch Shade 2nd time -> Key 1 (Attack) deals damage...',
    );
    await touchShadeToEnterCombat(client);

    const enemyHpBeforeKey1 = await client.eval(`
      (() => {
        const combat = window.__TEST_HELPERS__.getCombat();
        const e = combat.combatSystem.getState().combatants.find(c => c.type === 'enemy');
        return e ? e.stats.hp : -1;
      })()
    `);

    // Press Key 1 (Attack)
    await client.eval(`window.__TEST_HELPERS__.pressKey('CombatScene', 'ONE', 49)`);
    await wait(600);

    const enemyHpAfterKey1 = await client.eval(`
      (() => {
        const combat = window.__TEST_HELPERS__.getCombat();
        const e = combat.combatSystem.getState().combatants.find(c => c.type === 'enemy');
        return e ? e.stats.hp : -1;
      })()
    `);

    const b4Pass = enemyHpBeforeKey1 > 0 && enemyHpAfterKey1 < enemyHpBeforeKey1;
    results.push({
      id: 'Scenario 4 (B4)',
      pass: b4Pass,
      detail: `enemyHpBefore=${enemyHpBeforeKey1}, enemyHpAfter=${enemyHpAfterKey1}`,
    });
    console.log(
      `  -> ${b4Pass ? 'PASS' : 'FAIL'} (Enemy HP: ${enemyHpBeforeKey1} -> ${enemyHpAfterKey1})\n`,
    );

    // =========================================================================
    // SCENARIO 5 (B6): In combat with 0 shards, Key 3 (Item) does NOT heal HP.
    // =========================================================================
    console.log('[Scenario 5 / B6] In Combat with 0 shards -> Key 3 (Item) does not heal...');
    // Start a clean New Game & enter combat so turn lock from B4 doesn't mask B6
    await triggerFreshNewGame(client);
    await client.eval(BROWSER_HELPERS);
    await client.eval(`window.__TEST_HELPERS__.clearAllShards()`);
    await touchShadeToEnterCombat(client);
    await client.eval(`window.__TEST_HELPERS__.clearAllShards()`);

    // Damage Peter to 20 HP first so a heal would visibly increase HP
    const hpBeforeItem = await client.eval(`
      (() => {
        const combat = window.__TEST_HELPERS__.getCombat();
        const p = combat.combatSystem.getState().combatants.find(c => c.type === 'player');
        p.stats.hp = 20;
        combat.isProcessingTurn = false;
        return p.stats.hp;
      })()
    `);

    // Press Key 3 (Item) with 0 shards
    await client.eval(`window.__TEST_HELPERS__.pressKey('CombatScene', 'THREE', 51)`);
    await wait(300);

    const hpAfterItem = await client.eval(`
      (() => {
        const combat = window.__TEST_HELPERS__.getCombat();
        const p = combat.combatSystem.getState().combatants.find(c => c.type === 'player');
        return p.stats.hp;
      })()
    `);

    const b6Pass = hpAfterItem <= hpBeforeItem;
    results.push({
      id: 'Scenario 5 (B6)',
      pass: b6Pass,
      detail: `hpWithZeroShards: before=${hpBeforeItem}, after=${hpAfterItem}`,
    });
    console.log(
      `  -> ${b6Pass ? 'PASS' : 'FAIL'} (Player HP with 0 shards: ${hpBeforeItem} -> ${hpAfterItem})\n`,
    );

    // =========================================================================
    // SCENARIO 2 (B2): chrono_shard_minor count does not increase after Escape,
    // AND does not increase after 2 consecutive Continues from the same save.
    // =========================================================================
    console.log('[Scenario 2 / B2] Check chrono_shard_minor stability on Escape & 2x Continue...');
    // Win battle to test Continue with defeated Shade save
    await triggerFreshNewGame(client);
    await client.eval(BROWSER_HELPERS);
    await touchShadeToEnterCombat(client);

    // Defeat enemy quickly
    await client.eval(`
      (() => {
        const combat = window.__TEST_HELPERS__.getCombat();
        const e = combat.combatSystem.getState().combatants.find(c => c.type === 'enemy');
        e.stats.hp = 1;
        combat.isProcessingTurn = false;
        window.__TEST_HELPERS__.pressKey('CombatScene', 'ONE', 49);
      })()
    `);

    await waitForScene(client, 'ExplorationScene');
    await wait(600);

    // Quick save in ExplorationScene
    await client.eval(`
      (async () => {
        const exp = window.__TEST_HELPERS__.getExploration();
        await exp.quickSave();
      })()
    `);
    await wait(300);
    const shardsAtSave = await client.eval(`window.__TEST_HELPERS__.getShardCount()`);

    // Continue #1 from MainMenuScene
    await client.eval(`window.__TEST_HELPERS__.getExploration().returnToMenu()`);
    await waitForScene(client, 'MainMenuScene');
    await wait(350);
    await client.eval(`window.__TEST_HELPERS__.getMenu().continueGame()`);
    await waitForScene(client, 'ExplorationScene');
    await wait(500);
    const shardsAfterContinue1 = await client.eval(`window.__TEST_HELPERS__.getShardCount()`);

    // Continue #2 from MainMenuScene (from the exact same save)
    await client.eval(`window.__TEST_HELPERS__.getExploration().returnToMenu()`);
    await waitForScene(client, 'MainMenuScene');
    await wait(350);
    await client.eval(`window.__TEST_HELPERS__.getMenu().continueGame()`);
    await waitForScene(client, 'ExplorationScene');
    await wait(500);
    const shardsAfterContinue2 = await client.eval(`window.__TEST_HELPERS__.getShardCount()`);

    const noEscapeInflation = shardsAfterEscape === shardsBeforeEscape;
    const noContinueInflation =
      shardsAfterContinue1 === shardsAtSave && shardsAfterContinue2 === shardsAtSave;
    const b2Pass = noEscapeInflation && noContinueInflation;

    results.push({
      id: 'Scenario 2 (B2)',
      pass: b2Pass,
      detail: `escape(${shardsBeforeEscape}->${shardsAfterEscape}), continue(${shardsAtSave}->${shardsAfterContinue1}->${shardsAfterContinue2})`,
    });
    console.log(
      `  -> ${b2Pass ? 'PASS' : 'FAIL'} (Escape shards: ${shardsBeforeEscape}->${shardsAfterEscape}; Continue shards: saved=${shardsAtSave}, c1=${shardsAfterContinue1}, c2=${shardsAfterContinue2})\n`,
    );

    // =========================================================================
    // SCENARIO 3 (B3): Defeat Shade -> Return to MainMenu -> New Game:
    // Shade spawns again, and inventory is reset to starter kit (2 shards + relic).
    // =========================================================================
    console.log(
      '[Scenario 3 / B3] Defeat Shade -> MainMenu -> New Game resets Shade & starter kit...',
    );
    await triggerFreshNewGame(client);
    await client.eval(BROWSER_HELPERS);

    const newGameState = await client.eval(`
      (() => {
        const exp = window.__TEST_HELPERS__.getExploration();
        const hasShade = Boolean(exp.shadeSprite && exp.shadeSprite.active);
        const shards = window.__TEST_HELPERS__.getShardCount();
        const hasRelic = window.__TEST_HELPERS__.hasChronometer();
        const totalDistinctItems = window.__TEST_HELPERS__.getInventorySystem().getAllItems().length;
        return { hasShade, shards, hasRelic, totalDistinctItems };
      })()
    `);

    const b3Pass =
      newGameState.hasShade === true &&
      newGameState.shards === 2 &&
      newGameState.hasRelic === true &&
      newGameState.totalDistinctItems === 2;

    results.push({
      id: 'Scenario 3 (B3)',
      pass: b3Pass,
      detail: `hasShade=${newGameState.hasShade}, shards=${newGameState.shards}, hasRelic=${newGameState.hasRelic}`,
    });
    console.log(
      `  -> ${b3Pass ? 'PASS' : 'FAIL'} (hasShade=${newGameState.hasShade}, shards=${newGameState.shards}, hasRelic=${newGameState.hasRelic})\n`,
    );

    client.close();
  } finally {
    edgeProcess.kill();
  }

  console.log('==========================================================');
  console.log('SUMMARY OF SESSION REGRESSION SCENARIOS');
  console.log('==========================================================');
  let allPassed = true;
  for (const r of results) {
    const status = r.pass ? 'PASS' : 'FAIL';
    if (!r.pass) allPassed = false;
    console.log(`${status} | ${r.id} — ${r.detail}`);
  }
  console.log('==========================================================');

  if (!allPassed) {
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error('Session regression suite error:', err);
  process.exit(1);
});
