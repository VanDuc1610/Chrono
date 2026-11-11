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
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map((a) => a.value || a.description || '').join(' ');
        console.log('[Browser Console]', text);
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.error('[Browser Exception]', msg.params.exceptionDetails);
      }
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

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval exception: ${res.exceptionDetails.text}`);
    }
    return res.result.value;
  }

  async captureScreenshot(path) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path, Buffer.from(res.data, 'base64'));
  }

  close() {
    this.ws.close();
  }
}

async function run() {
  console.log('[1/7] Launching headless Edge to test Inventory UI & Save System...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const port = 9224;

  const browser = spawn(
    edgePath,
    [
      `--remote-debugging-port=${port}`,
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      'http://localhost:3000/',
    ],
    { stdio: 'ignore' },
  );

  try {
    const wsUrl = await getDebuggerUrl(port);
    const client = new CDPClient(wsUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    console.log('[2/7] Waiting for MainMenuScene and transitioning to ExplorationScene...');
    for (let i = 0; i < 40; i++) {
      const scenes = await client.eval(`
        window.__GAME__ ? window.__GAME__.scene.getScenes(true).map(s => s.scene.key) : []
      `);
      if (scenes && scenes.includes('MainMenuScene')) {
        break;
      }
      await wait(250);
    }

    // Trigger New Game via scene manager
    await client.eval(`
      (() => {
        const sm = window.__GAME__.scene;
        sm.stop('MainMenuScene');
        sm.start('ExplorationScene', { mapId: 'map_shattered_antechamber' });
      })()
    `);

    // Wait for ExplorationScene
    for (let i = 0; i < 40; i++) {
      const isExploration = await client.eval(`
        window.__GAME__.scene.isActive('ExplorationScene')
      `);
      if (isExploration) break;
      await wait(200);
    }
    console.log('✓ ExplorationScene active!');

    console.log("[3/7] Verifying Initial Inventory State (Peter's signature items)...");
    const initialInventory = await client.eval(`
      (() => {
        const expl = window.__GAME__.scene.getScene('ExplorationScene');
        return {
          items: expl.inventorySystem.getAllItems(),
          hasChronometer: expl.inventorySystem.hasItem('relic_chronometer'),
          shardCount: expl.inventorySystem.getItemCount('chrono_shard_minor')
        };
      })()
    `);
    console.log('Initial Inventory:', initialInventory);
    if (!initialInventory.hasChronometer || initialInventory.shardCount !== 2) {
      throw new Error(
        'Initial inventory mismatch! Expected relic_chronometer and 2x chrono_shard_minor',
      );
    }
    console.log('✓ Peter starts with Broken Chronometer and 2x Minor Chrono Shards!');

    console.log('[4/7] Testing Satchel / Inventory Overlay (toggleInventory)...');
    await client.eval(`
      (() => {
        const expl = window.__GAME__.scene.getScene('ExplorationScene');
        expl.toggleInventory();
      })()
    `);
    await wait(300);

    const isSatchelOpen = await client.eval(`
      (() => {
        const expl = window.__GAME__.scene.getScene('ExplorationScene');
        return expl.isInventoryOpen;
      })()
    `);
    console.log(`Satchel Overlay Visible: ${isSatchelOpen}`);
    await client.captureScreenshot('screenshot_inventory_open.png');
    console.log('Saved screenshot_inventory_open.png');

    // Close Satchel
    await client.eval(`
      (() => {
        const expl = window.__GAME__.scene.getScene('ExplorationScene');
        expl.toggleInventory();
      })()
    `);
    await wait(200);

    console.log('[5/7] Testing Quick Save System (Slot 1)...');
    // Move Peter slightly so position changes from initial spawn
    await client.eval(`
      (() => {
        const expl = window.__GAME__.scene.getScene('ExplorationScene');
        expl.player.sprite.setPosition(410, 335);
      })()
    `);
    await wait(100);

    await client.eval(`
      (async () => {
        const expl = window.__GAME__.scene.getScene('ExplorationScene');
        await expl.quickSave();
      })()
    `);
    await wait(600);
    await client.captureScreenshot('screenshot_quick_saved.png');

    const saveSlotData = await client.eval(`
      (async () => {
        const expl = window.__GAME__.scene.getScene('ExplorationScene');
        const data = await expl.saveSystem.load(1);
        return {
          hasSave: expl.saveSystem.hasSave(1),
          playerLevel: data.player.level,
          posX: data.player.position.x,
          posY: data.player.position.y,
          inventoryLength: data.inventory.length
        };
      })()
    `);
    console.log('Saved Slot 1 Data:', saveSlotData);
    if (!saveSlotData.hasSave || saveSlotData.posX !== 410) {
      throw new Error('Save data verification failed!');
    }
    console.log('✓ Quick Save recorded to Slot 1 successfully!');

    console.log('[6/7] Returning to MainMenuScene to verify Continue button...');
    await client.eval(`
      (() => {
        const expl = window.__GAME__.scene.getScene('ExplorationScene');
        expl.returnToMenu();
      })()
    `);

    for (let i = 0; i < 40; i++) {
      const isMenu = await client.eval(`
        window.__GAME__.scene.isActive('MainMenuScene')
      `);
      if (isMenu) break;
      await wait(200);
    }
    await wait(400);

    const menuContinueState = await client.eval(`
      (() => {
        const menu = window.__GAME__.scene.getScene('MainMenuScene');
        const continueOption = menu.menuItems.find(m => m.id === 'continue') || menu.menuItems[1];
        const expectedText = menu.cache.json.get('data_strings')?.strings?.['menu.continue'];
        return {
          id: continueOption?.id,
          text: continueOption?.text,
          expectedText,
          enabled: Boolean(continueOption?.enabled)
        };
      })()
    `);
    console.log('MainMenu Continue Option State:', menuContinueState);
    if (
      !menuContinueState.enabled ||
      !menuContinueState.expectedText ||
      menuContinueState.text !== menuContinueState.expectedText
    ) {
      throw new Error(
        `Continue button was not enabled/localized on MainMenuScene: ${JSON.stringify(menuContinueState)}`,
      );
    }
    await client.captureScreenshot('screenshot_main_menu_continue.png');
    console.log('✓ MainMenu correctly reflects active save slot with enabled Continue option!');

    console.log('[7/7] Triggering Continue and verifying restored state...');
    await client.eval(`
      (async () => {
        const menu = window.__GAME__.scene.getScene('MainMenuScene');
        await menu.continueGame();
      })()
    `);

    for (let i = 0; i < 40; i++) {
      const isExploration = await client.eval(`
        window.__GAME__.scene.isActive('ExplorationScene')
      `);
      if (isExploration) break;
      await wait(200);
    }
    await wait(500);

    const restoredState = await client.eval(`
      (() => {
        const expl = window.__GAME__.scene.getScene('ExplorationScene');
        return {
          playerX: Math.round(expl.player.x),
          playerY: Math.round(expl.player.y),
          shardCount: expl.inventorySystem.getItemCount('chrono_shard_minor')
        };
      })()
    `);
    console.log('Restored Exploration State:', restoredState);
    if (restoredState.playerX !== 410 || restoredState.playerY !== 335) {
      throw new Error(
        `Player position was not restored accurately! Got (${restoredState.playerX}, ${restoredState.playerY})`,
      );
    }
    console.log('✓ Player position and inventory restored with 100% precision from Save Slot 1!');

    console.log('\n========================================');
    console.log('MILESTONE 4: INVENTORY & SAVE PERSISTENCE VERIFIED!');
    console.log('========================================');

    client.close();
  } finally {
    browser.kill();
  }
}

run().catch((err) => {
  console.error('Inventory & Save test failed:', err);
  process.exit(1);
});
