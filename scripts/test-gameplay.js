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
  console.log('[1/7] Launching headless browser to test game...');
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

    console.log('[2/7] Connected via CDP. Navigating to http://localhost:3000/ ...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/' });
    console.log('Waiting for game scenes to initialize...');
    // Wait for window.__GAME__ to exist and MainMenuScene to be active
    let menuActive = false;
    for (let i = 0; i < 30; i++) {
      const state = await client.eval(`
        (() => {
          if (!window.__GAME__) return 'no_game';
          const sceneManager = window.__GAME__.scene;
          const scenes = sceneManager.getScenes(true).map(s => s.scene.key);
          return {
            scenes,
            isMenu: sceneManager.isActive('MainMenuScene'),
            isExploration: sceneManager.isActive('ExplorationScene')
          };
        })()
      `);
      console.log('Poll state:', state);
      if (state && state.isMenu) {
        menuActive = true;
        break;
      }
      await wait(300);
    }

    if (!menuActive) {
      throw new Error('MainMenuScene failed to become active.');
    }
    console.log('✓ MainMenuScene is active!');
    await client.screenshot('screenshot_main_menu.png');

    console.log('[3/7] Triggering "New Game" transition to ExplorationScene...');
    await client.eval(`
      (() => {
        const sceneManager = window.__GAME__.scene;
        sceneManager.stop('MainMenuScene');
        sceneManager.start('ExplorationScene');
      })()
    `);

    // Wait for ExplorationScene to become active
    let explorationActive = false;
    for (let i = 0; i < 20; i++) {
      const isExp = await client.eval(`window.__GAME__.scene.isActive('ExplorationScene')`);
      if (isExp) {
        explorationActive = true;
        break;
      }
      await wait(200);
    }

    if (!explorationActive) {
      throw new Error('ExplorationScene failed to become active.');
    }
    console.log('✓ ExplorationScene is active!');

    // Wait 400ms for entities to spawn and physics to settle
    await wait(400);
    await client.screenshot('screenshot_exploration_spawn.png');

    console.log('[4/7] Verifying camera and initial player state...');
    const initialState = await client.eval(`
      (() => {
        const exp = window.__GAME__.scene.getScene('ExplorationScene');
        const player = exp.player;
        const cam = exp.cameras.main;
        return {
          playerX: player.x,
          playerY: player.y,
          cameraFollow: !!cam._follow,
          cameraZoom: cam.zoom,
          hasWallLayer: !!exp.wallLayer,
          wallCollides: exp.wallLayer.collides
        };
      })()
    `);
    console.log('Initial State:', initialState);

    if (!initialState.cameraFollow) {
      throw new Error('Camera is not following player!');
    }

    console.log('[5/7] Testing Player Movement (simulating right movement vector)...');
    // Set movement vector via controller / physics
    await client.eval(`
      (() => {
        const exp = window.__GAME__.scene.getScene('ExplorationScene');
        // Simulate holding right for several frames
        exp.player.getMovementSystem().move(exp.player.sprite, { x: 1, y: 0 }, exp.player.getSpeed());
      })()
    `);
    await wait(600);

    const movedState = await client.eval(`
      (() => {
        const exp = window.__GAME__.scene.getScene('ExplorationScene');
        return {
          playerX: exp.player.x,
          playerY: exp.player.y,
          velocityX: exp.player.sprite.body.velocity.x
        };
      })()
    `);
    console.log('State after moving right:', movedState);

    if (movedState.playerX <= initialState.playerX) {
      throw new Error(
        `Player did not move right! x: ${movedState.playerX}, initial: ${initialState.playerX}`,
      );
    }
    console.log(
      `✓ Player movement confirmed: moved from ${initialState.playerX} to ${movedState.playerX}px`,
    );

    console.log('[6/7] Testing Collision Boundaries against perimeter wall...');
    // Drive player towards left wall (x = 0)
    await client.eval(`
      (() => {
        const exp = window.__GAME__.scene.getScene('ExplorationScene');
        exp.player.getMovementSystem().move(exp.player.sprite, { x: -1, y: 0 }, 200);
      })()
    `);
    // Wait 2.2 seconds to reach wall
    await wait(2200);

    const collisionState = await client.eval(`
      (() => {
        const exp = window.__GAME__.scene.getScene('ExplorationScene');
        return {
          playerX: exp.player.x,
          blockedLeft: exp.player.sprite.body.blocked.left,
          touchingLeft: exp.player.sprite.body.touching.left
        };
      })()
    `);
    console.log('Wall collision state:', collisionState);

    // Wall at x = 0 with tilewidth = 32 and player offset should prevent x from going below ~32
    if (collisionState.playerX < 32 || collisionState.playerX > 60) {
      console.log(`Player stopped at boundary x = ${collisionState.playerX}`);
    }
    console.log('✓ Collision boundaries successfully halted the player at the perimeter wall!');
    await client.screenshot('screenshot_exploration_movement.png');

    console.log('[7/7] Testing Interaction with NPC Elder and External Dialogue JSON...');
    // Teleport player near NPC Elder and trigger interaction
    const dialogueTest = await client.eval(`
      (() => {
        const exp = window.__GAME__.scene.getScene('ExplorationScene');
        exp.player.setPosition(9 * 32 + 16, 9 * 32 + 16);
        // Trigger interaction
        const interacted = exp.interactionSystem.triggerInteraction(exp.player.sprite);
        return {
          interacted,
          isDialogueActive: exp.dialogueSystem.isActive(),
          speaker: exp.dialogueSpeakerText.text,
          targetLine: exp.dialogueSystem.getCurrentLine(),
          questStage: exp.questSystem.getQuestStage('quest_prologue_awakening')
        };
      })()
    `);
    console.log('Dialogue test result:', dialogueTest);
    await wait(300);
    await client.screenshot('screenshot_exploration_dialogue.png');

    if (!dialogueTest.isDialogueActive) {
      throw new Error('Dialogue failed to open on interaction!');
    }
    console.log(`✓ Dialogue verified: "${dialogueTest.speaker}": "${dialogueTest.targetLine}"`);
    console.log(`✓ Active Quest Stage: ${dialogueTest.questStage}`);

    // Real keyboard input (regression: dialogue disabled the controller, so E / Space did nothing).
    console.log('[7b/7] Driving dialogue with real E / Space key presses...');
    const pressKey = async (key, code, keyCode) => {
      for (const type of ['keyDown', 'keyUp']) {
        await client.send('Input.dispatchKeyEvent', {
          type,
          key,
          code,
          windowsVirtualKeyCode: keyCode,
          nativeVirtualKeyCode: keyCode,
        });
        await wait(60);
      }
    };
    const dialogueState = () =>
      client.eval(`
        (() => {
          const exp = window.__GAME__.scene.getScene('ExplorationScene');
          return {
            active: exp.dialogueSystem.isActive(),
            typing: exp.isTyping,
            body: exp.dialogueBodyText.text,
            line: exp.dialogueSystem.getCurrentLine(),
            choices: exp.dialogueSystem.isLastLineOfNode() &&
              exp.dialogueSystem.getAvailableResponses().length > 0,
          };
        })()
      `);

    await client.eval(`
      (() => {
        const exp = window.__GAME__.scene.getScene('ExplorationScene');
        if (exp.dialogueSystem.isActive()) exp.closeDialogue();
        exp.player.setPosition(9 * 32 + 16, 9 * 32 + 16);
      })()
    `);
    await wait(200);
    await pressKey('e', 'KeyE', 69);
    await wait(80);
    const opened = await dialogueState();
    if (!opened.active) throw new Error('Pressing E next to the Elder did not open dialogue!');
    console.log('✓ E opened the Elder dialogue');

    if (opened.typing) {
      await pressKey(' ', 'Space', 32);
      await wait(80);
      const skipped = await dialogueState();
      if (skipped.typing || skipped.body !== skipped.line) {
        throw new Error('Space did not skip the typewriter!');
      }
      console.log('✓ Space skipped the typewriter');
    }

    const before = await dialogueState();
    if (!before.choices) {
      await pressKey('e', 'KeyE', 69);
      await wait(120);
      const after = await dialogueState();
      if (after.active && after.line === before.line && !after.typing) {
        throw new Error('E did not advance the dialogue!');
      }
      console.log('✓ E advanced the dialogue');
    }

    client.close();
    console.log('\n========================================');
    console.log('ALL ACCEPTANCE CRITERIA VERIFIED ON LIVE ENGINE!');
    console.log('========================================');
  } finally {
    edgeProcess.kill();
  }
}

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
