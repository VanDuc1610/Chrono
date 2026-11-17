import { expect, test, type Page } from '@playwright/test';

/**
 * Chromium smoke test of the production build: the game boots without errors, a new
 * game starts in Peter's attic, real key presses drive the dialogue and movement, and a
 * quick-save survives a page reload (CONTINUE becomes available).
 */

interface GameWindow {
  __GAME__?: {
    events: { once(event: string, callback: () => void): void };
    scene: {
      isActive(key: string): boolean;
      getScene(key: string): unknown;
    };
  };
}

interface ExplorationView {
  currentMapId: string;
  dialogueSystem: { isActive(): boolean };
  player: { x: number };
}

const isActive = (page: Page, scene: string) =>
  page.evaluate((key) => !!(window as GameWindow).__GAME__?.scene.isActive(key), scene);

/** Reads one value from the running ExplorationScene. */
const explore = (page: Page, what: 'map' | 'dialogue' | 'x') =>
  page.evaluate((field) => {
    const e = (window as GameWindow).__GAME__?.scene.getScene('ExplorationScene') as
      ExplorationView | undefined;
    if (!e) return null;
    if (field === 'map') return e.currentMapId;
    if (field === 'dialogue') return e.dialogueSystem.isActive();
    return e.player.x;
  }, what);

test('boots, starts a new game, plays with real keys and saves', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  await expect.poll(() => isActive(page, 'MainMenuScene')).toBe(true);
  await expect(page.locator('canvas')).toBeVisible();

  // New game (Enter on the first menu item) → Peter's attic with the opening line.
  await page.locator('canvas').click();
  await page.keyboard.press('Enter');
  await expect.poll(() => isActive(page, 'ExplorationScene')).toBe(true);
  await expect.poll(() => explore(page, 'map')).toBe('map_peters_room');
  await expect.poll(() => explore(page, 'dialogue')).toBe(true);

  // Sample the rendered frame before WebGL discards its drawing buffer.
  const colors = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        (window as GameWindow).__GAME__?.events.once('postrender', () => {
          const canvas = document.querySelector('canvas');
          if (!canvas) return resolve(0);
          const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
          if (!gl) return resolve(0);
          const pixels = new Uint8Array(canvas.width * canvas.height * 4);
          gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
          const unique = new Set<number>();
          for (let i = 0; i < pixels.length; i += 4) {
            unique.add((pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2]);
          }
          resolve(unique.size);
        });
      }),
  );
  expect(colors).toBeGreaterThan(16);

  // Real keys: Space finishes the typewriter, ESC closes the dialogue.
  await page.keyboard.press('Space');
  await page.keyboard.press('Escape');
  await expect.poll(() => explore(page, 'dialogue')).toBe(false);

  // Walk with the arrow keys.
  const before = (await explore(page, 'x')) as number;
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(500);
  await page.keyboard.up('ArrowRight');
  expect((await explore(page, 'x')) as number).toBeGreaterThan(before);

  // Quick-save (K), reload: the menu offers CONTINUE.
  await page.keyboard.press('k');
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('chrono_save_slot_1') !== null))
    .toBe(true);
  await page.reload();
  await expect.poll(() => isActive(page, 'MainMenuScene')).toBe(true);
  const canContinue = await page.evaluate(() => {
    const menu = (window as GameWindow).__GAME__?.scene.getScene('MainMenuScene') as
      { menuItems: { enabled: boolean }[] } | undefined;
    return menu?.menuItems[1]?.enabled === true;
  });
  expect(canContinue).toBe(true);

  // Audio may be blocked by autoplay rules, but nothing may throw.
  expect(errors).toEqual([]);
});
