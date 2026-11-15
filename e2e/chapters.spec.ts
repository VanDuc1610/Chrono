import { expect, test } from '@playwright/test';
import { CHAPTER_STARTS } from '../src/state/ChapterStarts';
import itemsJson from '../public/assets/data/items.json' with { type: 'json' };

interface ChapterGameWindow {
  __GAME__?: {
    scene: {
      isActive(key: string): boolean;
      getScene(key: string): unknown;
      stop(key: string): unknown;
      start(key: string): unknown;
    };
  };
}

interface ChapterMenu {
  selectedIndex: number;
  isChaptersOpen: boolean;
  menuItems: { id: string }[];
}

interface ChapterExploration {
  currentMapId: string;
  session: { level: number; equipment: { weapon: string | null } };
}

// One bounded test per browser: all starts are derived from the same data as the menu,
// including new chapters, but we use real menu/number keys to exercise the UI wiring.
test('chapter select starts every chapter with its expected map, level and weapon', async ({
  page,
}) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  const assets: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('requestfailed', (request) => {
    if (new URL(request.url()).pathname.includes('/assets/'))
      assets.push(`${request.url()}: ${request.failure()?.errorText}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400 && new URL(response.url()).pathname.includes('/assets/'))
      assets.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('/');
  for (const [index, start] of CHAPTER_STARTS.entries()) {
    await test.step(`Chapter ${start.chapter}: ${start.mapId}`, async () => {
      // Return through Phaser's lifecycle instead of rebooting/preloading all assets eight
      // times. Each real menu selection still creates a fresh session via startChapter.
      if (index > 0)
        await page.evaluate(() => {
          const game = (window as unknown as ChapterGameWindow).__GAME__!;
          game.scene.stop('ExplorationScene');
          game.scene.start('MainMenuScene');
        });
      await page.waitForFunction(() =>
        (window as unknown as ChapterGameWindow).__GAME__?.scene.isActive('MainMenuScene'),
      );
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      await canvas.click({ position: { x: 10, y: 10 } });

      // Find the actual menu item, allowing disabled CONTINUE to remain selectable.
      for (let move = 0; move < 4; move++) {
        const selected = await page.evaluate(() => {
          const menu = (window as unknown as ChapterGameWindow).__GAME__?.scene.getScene(
            'MainMenuScene',
          ) as ChapterMenu;
          return menu.menuItems[menu.selectedIndex]?.id;
        });
        if (selected === 'chapters') break;
        await page.keyboard.press('ArrowDown');
      }
      await page.keyboard.press('Enter');
      await expect
        .poll(() =>
          page.evaluate(() => {
            const menu = (window as unknown as ChapterGameWindow).__GAME__?.scene.getScene(
              'MainMenuScene',
            ) as ChapterMenu;
            return menu.isChaptersOpen;
          }),
        )
        .toBe(true);
      expect(index, 'Chapter number-key shortcuts cover at most nine entries').toBeLessThan(9);
      await page.keyboard.press(String(index + 1));

      const weapon = start.equip.find((id) =>
        itemsJson.items.some((item) => item.id === id && item.type === 'weapon'),
      );
      expect(weapon, `Chapter ${start.chapter} must declare its weapon`).toBeDefined();
      await expect
        .poll(() =>
          page.evaluate(() => {
            const game = (window as unknown as ChapterGameWindow).__GAME__;
            if (!game?.scene.isActive('ExplorationScene')) return null;
            const exploration = game.scene.getScene('ExplorationScene') as ChapterExploration;
            return {
              mapId: exploration.currentMapId,
              level: exploration.session?.level,
              weapon: exploration.session?.equipment.weapon,
            };
          }),
        )
        .toEqual({ mapId: start.mapId, level: start.level, weapon });

      // Let the first arrival event run before leaving; navigation must not mask its errors.
      await page.waitForTimeout(650);
      expect(errors, `Chapter ${start.chapter}: browser errors`).toEqual([]);
      expect(assets, `Chapter ${start.chapter}: failed asset loads`).toEqual([]);
    });
  }
});
