import { defineConfig, devices } from '@playwright/test';

/**
 * Cross-browser smoke tests on the PRODUCTION build (what GitHub Pages serves):
 * `npm run e2e` builds, serves dist/ with `vite preview`, and runs the Chromium smoke test.
 */
export default defineConfig({
  testDir: 'e2e',
  testMatch: 'smoke.spec.ts',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 1280, height: 720 },
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
