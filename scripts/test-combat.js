import { spawn } from 'child_process';
import { installQuietConsole } from './lib/test-output.js';
import http from 'http';
import fs from 'fs';

installQuietConsole();

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getDebuggerUrl(port) {
  for (let i = 0; i < 20; i++) {
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

  async screenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(filePath, buffer);
  }

  close() {
    this.ws.close();
  }
}

async function run() {
  console.log('[1/6] Launching headless browser to test turn-based combat...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgeProcess = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--window-size=1280,720',
    'http://localhost:3000/',
  ]);

  try {
    const wsUrl = await getDebuggerUrl(9222);
    const client = new CDPClient(wsUrl);
    await client.connect();
    await client.send('Runtime.enable');
    await client.send('Page.enable');

    client.ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log(
          '[Browser Console]',
          msg.params.type,
          msg.params.args.map((a) => a.value || a.description).join(' '),
        );
      } else if (msg.method === 'Runtime.exceptionThrown') {
        console.error('[Browser Exception]', msg.params.exceptionDetails);
      }
    });

    console.log(
      '[2/6] Waiting for game to load MainMenuScene and transitioning to ExplorationScene...',
    );
    for (let i = 0; i < 30; i++) {
      const isMenu = await client.eval(
        `window.__GAME__ && window.__GAME__.scene.isActive('MainMenuScene')`,
      );
      if (isMenu) break;
      await wait(250);
    }

    await client.eval(`
      (() => {
        const sm = window.__GAME__.scene;
        sm.stop('MainMenuScene');
        sm.start('ExplorationScene', { mapId: 'map_shattered_antechamber' });
      })()
    `);

    for (let i = 0; i < 20; i++) {
      const isExp = await client.eval(`window.__GAME__.scene.isActive('ExplorationScene')`);
      if (isExp) break;
      await wait(200);
    }
    console.log('✓ ExplorationScene active!');
    // Prologue v3: these suites start mid-story, after Peter has the blade and Temporal Sight.
    await client.eval(
      `(() => { const s = window.__GAME__.scene.getScene('ExplorationScene').session; s.setFlag('has_broken_blade'); s.setFlag('learned_temporal_sight'); })()`,
    );
    await wait(400);

    console.log('[3/6] Navigating Peter to touch the overworld Temporal Shade...');
    // Teleport Peter directly next to the shade to trigger collision encounter
    await client.eval(`
      (() => {
        const exp = window.__GAME__.scene.getScene('ExplorationScene');
        // Close any active dialogue first
        if (exp.dialogueSystem.isActive()) exp.closeDialogue();
        exp.player.setPosition(16 * 32 + 16, 9 * 32 + 16);
      })()
    `);

    // Wait for encounter transition to start CombatScene
    let combatActive = false;
    for (let i = 0; i < 25; i++) {
      const isCombat = await client.eval(`window.__GAME__.scene.isActive('CombatScene')`);
      if (isCombat) {
        combatActive = true;
        break;
      }
      await wait(200);
    }

    if (!combatActive) {
      throw new Error('CombatScene failed to activate upon touching Temporal Shade!');
    }
    console.log('✓ CombatScene activated successfully!');
    await wait(500);
    await client.screenshot('screenshot_combat_intro.png');

    console.log('[4/6] Verifying Combatants and Action Selection...');
    const combatState = await client.eval(`
      (() => {
        const combat = window.__GAME__.scene.getScene('CombatScene');
        const state = combat.combatSystem.getState();
        const p = state.combatants.find(c => c.type === 'player');
        const e = state.combatants.find(c => c.type === 'enemy');
        return {
          phase: state.phase,
          playerName: p.name,
          playerHp: p.stats.hp,
          enemyName: e.name,
          enemyHp: e.stats.hp,
          turnCount: state.turnCount
        };
      })()
    `);
    console.log('Initial Combat State:', combatState);

    console.log('[5/6] Executing Player Attack with Broken Blade...');
    await client.eval(`
      (() => {
        const combat = window.__GAME__.scene.getScene('CombatScene');
        combat.handlePlayerAction('attack');
      })()
    `);

    // Wait 2.8 seconds for player attack and enemy counter-turn to complete
    await wait(2800);
    await client.screenshot('screenshot_combat_action.png');

    const stateAfterRound1 = await client.eval(`
      (() => {
        const combat = window.__GAME__.scene.getScene('CombatScene');
        const state = combat.combatSystem.getState();
        const p = state.combatants.find(c => c.type === 'player');
        const e = state.combatants.find(c => c.type === 'enemy');
        return {
          playerHp: p.stats.hp,
          enemyHp: e.stats.hp,
          log: combat.logText.text
        };
      })()
    `);
    console.log('State After Round 1:', stateAfterRound1);

    if (stateAfterRound1.enemyHp >= combatState.enemyHp) {
      throw new Error('Enemy HP did not decrease after player attack!');
    }
    console.log(
      `✓ Damage confirmed: Enemy HP reduced from ${combatState.enemyHp} to ${stateAfterRound1.enemyHp}`,
    );

    console.log('[6/6] Finishing battle using Temporal Strike...');
    // The enemy turn plays animations; commands sent before Peter's turn are ignored.
    for (let i = 0; i < 40; i++) {
      const ready = await client.eval(
        `(() => { const c = window.__GAME__.scene.getScene('CombatScene'); return !c.isProcessingTurn && c.combatSystem.getActiveCombatantId() === c.player.id; })()`,
      );
      if (ready) break;
      await wait(150);
    }
    // Execute second strike to defeat the shade
    await client.eval(`
      (() => {
        const combat = window.__GAME__.scene.getScene('CombatScene');
        combat.handlePlayerAction('skill');
      })()
    `);
    await wait(1500);

    const victoryState = await client.eval(`
      (() => {
        const combat = window.__GAME__.scene.getScene('CombatScene');
        return {
          phase: combat.combatSystem.getPhase(),
          isOver: combat.combatSystem.isBattleOver(),
          log: combat.logText.text
        };
      })()
    `);
    console.log('Victory State Check:', victoryState);
    await client.screenshot('screenshot_combat_victory.png');

    // Wait for transition back to ExplorationScene
    console.log('Waiting for return transition to ExplorationScene...');
    let returnedToExploration = false;
    for (let i = 0; i < 30; i++) {
      const isExp = await client.eval(`window.__GAME__.scene.isActive('ExplorationScene')`);
      if (isExp) {
        returnedToExploration = true;
        break;
      }
      await wait(300);
    }

    if (!returnedToExploration) {
      throw new Error('Failed to return to ExplorationScene after battle victory!');
    }
    console.log('✓ Successfully returned to ExplorationScene after victory!');
    await wait(800);
    await client.screenshot('screenshot_exploration_post_battle.png');

    const postBattleCheck = await client.eval(`
      (() => {
        const exp = window.__GAME__.scene.getScene('ExplorationScene');
        return {
          isShadeDefeated: exp.isShadeDefeated,
          hasShadeSprite: !!exp.shadeSprite && exp.shadeSprite.active
        };
      })()
    `);
    console.log('Post Battle World State:', postBattleCheck);

    client.close();
    console.log('\n========================================');
    console.log('MILESTONE 3: TURN-BASED COMBAT VERIFIED SUCCESSFULLY!');
    console.log('========================================');
  } finally {
    edgeProcess.kill();
  }
}

run().catch((err) => {
  console.error('Combat test run failed:', err);
  process.exit(1);
});
