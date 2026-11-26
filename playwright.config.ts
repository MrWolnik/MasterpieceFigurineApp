import { defineConfig, devices } from '@playwright/test';

const PREVIEW_PORT = 4173;
const DEV_PORT = 5173;
const isCI = Boolean(process.env.CI);

const previewURL = `http://localhost:${String(PREVIEW_PORT)}`;
const devURL = `http://localhost:${String(DEV_PORT)}`;

// Dev-only pages (e.g. /styleguide) are not in the production build, so they run against `vite`.
const DEV_ONLY_SPECS = /styleguide\.spec\.ts/;

/**
 * Most e2e tests run against the production build served by `vite preview`,
 * the same artefact that CI builds and Netlify deploys.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  ...(isCI ? { workers: 1 } : {}),
  reporter: isCI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: previewURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', testIgnore: DEV_ONLY_SPECS, use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testIgnore: DEV_ONLY_SPECS, use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testIgnore: DEV_ONLY_SPECS, use: { ...devices['Desktop Safari'] } },
    // iPhone profile: WebKit matters for the 360° turntable and scroll behaviour on iOS.
    {
      name: 'mobile-safari',
      testIgnore: DEV_ONLY_SPECS,
      use: { ...devices['iPhone 15'] },
    },
    {
      name: 'dev-only',
      testMatch: DEV_ONLY_SPECS,
      use: { ...devices['Desktop Chrome'], baseURL: devURL },
    },
  ],
  webServer: [
    {
      // CI has already built the app in an earlier step, so it only serves `dist`.
      command: isCI
        ? `npm run preview -- --port ${String(PREVIEW_PORT)} --strictPort`
        : `npm run build && npm run preview -- --port ${String(PREVIEW_PORT)} --strictPort`,
      url: previewURL,
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
    {
      command: `npm run dev -- --port ${String(DEV_PORT)} --strictPort`,
      url: devURL,
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
  ],
});
